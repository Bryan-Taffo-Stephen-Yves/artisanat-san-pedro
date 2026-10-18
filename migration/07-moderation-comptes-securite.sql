-- =====================================================================
-- Artisanat San Pedro — migration du 18/10/2026
--   1. Sécurité : PIN / identifiants / coordonnées des artisans masqués,
--      code admin vérifié côté serveur (fini le mot de passe dans le code)
--   2. Validation des produits avant publication (modération)
--   3. Comptes clients : profil, favoris, commandes
--
-- À exécuter UNE fois, à la main : Supabase > projet SAN PEDRO > SQL Editor
-- > coller tout le fichier > Run. (Volontairement hors de supabase/migrations
-- pour ne jamais être appliqué automatiquement.)
-- Tout est dans une transaction : en cas d'erreur, rien n'est modifié.
-- Le script peut être relancé sans dommage.
--
-- ⚠️ AVANT DE LANCER : remplacer CHOISIS-TON-CODE-ADMIN (section 1.3) par
--    le nouveau code d'accès à la page /admin.
-- =====================================================================

begin;

create extension if not exists pgcrypto with schema extensions;

-- Horodatage générique (utilisé par la table orders)
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- =====================================================================
-- 1. SÉCURITÉ
-- =====================================================================

-- 1.1 Colonne "artisan de confiance" (publication directe), utilisée plus bas
alter table public.artisans
  add column if not exists auto_approve boolean not null default false;

-- 1.2 Les visiteurs ne peuvent plus lire pin_code, login_id, email, phone…
revoke select on public.artisans from anon, authenticated;
grant select (
  id, slug, name, metier, metier_category, location, since, bio,
  avatar_url, cover_image_url, rating, reviews_count, products_count,
  featured, published, diagnostic_order, created_at, updated_at, auto_approve
) on public.artisans to anon, authenticated;

-- Les fonctions existantes qui lisent le PIN ou le catalogue s'exécutent
-- avec les droits du propriétaire (sinon la connexion artisan casserait)
do $$
declare f record;
begin
  for f in
    select p.oid::regprocedure as sig
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname in ('verifier_pin_artisan', 'rechercher_produits')
  loop
    execute format('alter function %s security definer set search_path = public', f.sig);
  end loop;
end $$;

-- 1.3 Code admin stocké chiffré, jamais lisible depuis le site
create table if not exists public.app_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);
alter table public.app_settings enable row level security;
revoke all on public.app_settings from anon, authenticated;

insert into public.app_settings (key, value)
values ('admin_code_hash', extensions.crypt('CHOISIS-TON-CODE-ADMIN', extensions.gen_salt('bf')))
on conflict (key) do update set value = excluded.value, updated_at = now();

create or replace function public._admin_ok(p_code text)
returns boolean
language sql stable security definer
set search_path = public, extensions
as $$
  select exists (
    select 1 from public.app_settings
    where key = 'admin_code_hash' and value = extensions.crypt(coalesce(p_code, ''), value)
  );
$$;
revoke execute on function public._admin_ok(text) from public, anon, authenticated;

create or replace function public.admin_verifier(p_code text)
returns boolean
language plpgsql security definer
set search_path = public
as $$
begin
  if public._admin_ok(p_code) then
    return true;
  end if;
  perform pg_sleep(1); -- ralentit les essais au hasard
  return false;
end $$;
grant execute on function public.admin_verifier(text) to anon, authenticated;

-- =====================================================================
-- 2. VALIDATION DES PRODUITS
-- =====================================================================

alter table public.products
  add column if not exists status text not null default 'approved',
  add column if not exists moderation_note text,
  add column if not exists reviewed_at timestamptz,
  add column if not exists submitted_at timestamptz default now();

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'products_status_check') then
    alter table public.products
      add constraint products_status_check check (status in ('pending', 'approved', 'rejected'));
  end if;
end $$;

-- 2.0 Lecture du catalogue : le site n'affiche que les produits publiés
--     (filtre published = true dans les requêtes), mais la règle d'accès doit
--     laisser lire les produits en attente : sinon un artisan ne voit pas ses
--     produits en validation et toute modification qui dépublie un produit
--     est rejetée par Postgres.
do $$
declare p record;
begin
  for p in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'products' and cmd = 'SELECT'
  loop
    execute format('drop policy %I on public.products', p.policyname);
  end loop;
end $$;
create policy "Produits : lecture" on public.products for select using (true);

-- 2.1 À la création depuis le site : en attente, sauf artisan de confiance
--     ET catégorie conforme à son métier.
create or replace function public.products_moderation_on_insert()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_auto boolean;
  v_metier text;
begin
  -- Imports et actions admin (rôle propriétaire / service_role) : inchangés
  if current_user not in ('anon', 'authenticated') then
    return new;
  end if;

  select a.auto_approve, a.metier_category::text into v_auto, v_metier
  from public.artisans a where a.id = new.artisan_id;

  new.submitted_at := now();
  new.reviewed_at := null;
  new.moderation_note := null;

  if coalesce(v_auto, false) and new.category::text = coalesce(v_metier, '') then
    new.status := 'approved';
  else
    new.status := 'pending';
    new.published := false;
  end if;
  return new;
end $$;

drop trigger if exists trg_products_moderation_insert on public.products;
create trigger trg_products_moderation_insert
before insert on public.products
for each row execute function public.products_moderation_on_insert();

-- 2.2 Depuis le site, impossible de publier soi-même ou de changer le statut ;
--     passer dans une catégorie hors métier renvoie en validation.
create or replace function public.products_moderation_on_update()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_metier text;
begin
  if current_user not in ('anon', 'authenticated') then
    return new; -- fonctions admin, service_role, éditeur SQL
  end if;

  new.status := old.status;
  new.moderation_note := old.moderation_note;
  new.reviewed_at := old.reviewed_at;

  if new.published and not old.published then
    new.published := false;
  end if;

  if new.category is distinct from old.category then
    select a.metier_category::text into v_metier from public.artisans a where a.id = new.artisan_id;
    if new.category::text <> coalesce(v_metier, '') then
      new.status := 'pending';
      new.published := false;
      new.submitted_at := now();
    end if;
  end if;
  return new;
end $$;

drop trigger if exists trg_products_moderation_update on public.products;
create trigger trg_products_moderation_update
before update on public.products
for each row execute function public.products_moderation_on_update();

-- 2.3 Lecture complète pour l'espace artisan (y compris en attente / refusés)
create or replace function public.artisan_produits(p_artisan_id uuid)
returns jsonb
language sql stable security definer
set search_path = public
as $$
  select coalesce(jsonb_agg(to_jsonb(p) order by p.created_at desc), '[]'::jsonb)
  from public.products p
  where p.artisan_id = p_artisan_id;
$$;
grant execute on function public.artisan_produits(uuid) to anon, authenticated;

-- 2.4 Fonctions admin (protégées par le code admin)
create or replace function public.admin_produits(p_code text)
returns jsonb
language plpgsql stable security definer
set search_path = public
as $$
begin
  if not public._admin_ok(p_code) then
    raise exception 'Accès refusé' using errcode = '42501';
  end if;
  return coalesce((
    select jsonb_agg(
      to_jsonb(p) || jsonb_build_object(
        'artisan_name', a.name,
        'artisan_metier', a.metier_category::text,
        'artisan_auto_approve', a.auto_approve
      ) order by p.submitted_at desc nulls last, p.created_at desc)
    from public.products p
    left join public.artisans a on a.id = p.artisan_id
  ), '[]'::jsonb);
end $$;
grant execute on function public.admin_produits(text) to anon, authenticated;

create or replace function public.admin_moderer_produit(
  p_code text, p_product_id uuid, p_decision text, p_note text default null
)
returns void
language plpgsql security definer
set search_path = public
as $$
begin
  if not public._admin_ok(p_code) then
    raise exception 'Accès refusé' using errcode = '42501';
  end if;

  if p_decision = 'approve' then
    update public.products
      set status = 'approved', published = true, moderation_note = null, reviewed_at = now()
      where id = p_product_id;
  elsif p_decision = 'reject' then
    update public.products
      set status = 'rejected', published = false, moderation_note = nullif(trim(p_note), ''), reviewed_at = now()
      where id = p_product_id;
  elsif p_decision = 'hide' then
    update public.products
      set published = false, moderation_note = coalesce(nullif(trim(p_note), ''), moderation_note), reviewed_at = now()
      where id = p_product_id;
  elsif p_decision = 'show' then
    update public.products set published = true where id = p_product_id and status = 'approved';
  else
    raise exception 'Décision inconnue : %', p_decision;
  end if;

  if not found then
    raise exception 'Produit introuvable (ou pas encore validé)';
  end if;
end $$;
grant execute on function public.admin_moderer_produit(text, uuid, text, text) to anon, authenticated;

create or replace function public.admin_artisans(p_code text)
returns jsonb
language plpgsql stable security definer
set search_path = public
as $$
begin
  if not public._admin_ok(p_code) then
    raise exception 'Accès refusé' using errcode = '42501';
  end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', a.id, 'name', a.name, 'slug', a.slug, 'metier', a.metier,
      'metier_category', a.metier_category::text, 'login_id', a.login_id,
      'phone', a.phone, 'auto_approve', a.auto_approve, 'published', a.published,
      'products_total', (select count(*) from public.products p where p.artisan_id = a.id),
      'last_product_at', (select max(p.created_at) from public.products p where p.artisan_id = a.id)
    ) order by a.diagnostic_order nulls last, a.name)
    from public.artisans a
  ), '[]'::jsonb);
end $$;
grant execute on function public.admin_artisans(text) to anon, authenticated;

create or replace function public.admin_definir_confiance(p_code text, p_artisan_id uuid, p_value boolean)
returns void
language plpgsql security definer
set search_path = public
as $$
begin
  if not public._admin_ok(p_code) then
    raise exception 'Accès refusé' using errcode = '42501';
  end if;
  update public.artisans set auto_approve = coalesce(p_value, false) where id = p_artisan_id;
  if not found then
    raise exception 'Artisan introuvable';
  end if;
end $$;
grant execute on function public.admin_definir_confiance(text, uuid, boolean) to anon, authenticated;

-- =====================================================================
-- 3. COMPTES CLIENTS
-- =====================================================================

-- 3.1 Profil client (table existante complétée)
alter table public.profiles
  add column if not exists full_name text,
  add column if not exists phone text,
  add column if not exists delivery_address text,
  add column if not exists delivery_city text;

do $$
begin
  -- l'e-mail vient du compte Auth : ne doit pas bloquer la création du profil
  if exists (select 1 from information_schema.columns
             where table_schema = 'public' and table_name = 'profiles'
               and column_name = 'email' and is_nullable = 'NO') then
    alter table public.profiles alter column email drop not null;
  end if;
end $$;

alter table public.profiles enable row level security;

-- Chaque client ne voit et ne modifie que son propre profil
-- (téléphone et adresse ne doivent pas être publics)
do $$
declare p record;
begin
  for p in select policyname from pg_policies where schemaname = 'public' and tablename = 'profiles' loop
    execute format('drop policy %I on public.profiles', p.policyname);
  end loop;
end $$;

revoke all on public.profiles from anon;
grant select, insert, update on public.profiles to authenticated;

create policy "Profil : lecture de son profil" on public.profiles
  for select to authenticated using (auth.uid() = id);
create policy "Profil : création de son profil" on public.profiles
  for insert to authenticated with check (auth.uid() = id);
create policy "Profil : modification de son profil" on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- Création automatique du profil à l'inscription
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer
set search_path = public
as $$
declare
  v_name text := coalesce(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    split_part(new.email, '@', 1)
  );
begin
  insert into public.profiles (id, full_name, phone)
  values (new.id, v_name, new.raw_user_meta_data->>'phone')
  on conflict (id) do nothing;

  if exists (select 1 from information_schema.columns
             where table_schema = 'public' and table_name = 'profiles' and column_name = 'email') then
    execute 'update public.profiles set email = $1 where id = $2' using new.email, new.id;
  end if;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- 3.2 Favoris
create table if not exists public.favorite_artisans (
  user_id uuid not null references auth.users(id) on delete cascade,
  artisan_id uuid not null references public.artisans(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, artisan_id)
);
create table if not exists public.favorite_products (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

alter table public.favorite_artisans enable row level security;
alter table public.favorite_products enable row level security;
revoke all on public.favorite_artisans, public.favorite_products from anon;
grant select, insert, delete on public.favorite_artisans, public.favorite_products to authenticated;

drop policy if exists "Favoris artisans : les siens" on public.favorite_artisans;
create policy "Favoris artisans : les siens" on public.favorite_artisans
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Favoris produits : les siens" on public.favorite_products;
create policy "Favoris produits : les siens" on public.favorite_products
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 3.3 Commandes (créées uniquement via creer_commande : prix recalculés côté serveur)
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique default ('SP-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8))),
  user_id uuid references auth.users(id) on delete set null,
  customer_name text not null,
  customer_email text,
  customer_phone text not null,
  delivery_address text,
  delivery_city text,
  delivery_country text default 'Côte d''Ivoire',
  subtotal integer not null default 0 check (subtotal >= 0),
  delivery_fee integer not null default 0 check (delivery_fee >= 0),
  total integer not null default 0 check (total >= 0),
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'preparing', 'shipped', 'delivered', 'cancelled', 'failed')),
  payment_method text,
  payment_provider text,
  payment_reference text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  artisan_id uuid references public.artisans(id) on delete set null,
  product_name text not null,
  product_image text,
  unit_price integer not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0)
);
create index if not exists order_items_order_id_idx on public.order_items(order_id);
create index if not exists orders_user_id_idx on public.orders(user_id);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;
revoke all on public.orders, public.order_items from anon, authenticated;
grant select on public.orders, public.order_items to authenticated;

drop policy if exists "Commandes : les siennes" on public.orders;
create policy "Commandes : les siennes" on public.orders
  for select to authenticated using (auth.uid() = user_id);
drop policy if exists "Lignes de commande : les siennes" on public.order_items;
create policy "Lignes de commande : les siennes" on public.order_items
  for select to authenticated
  using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));

drop trigger if exists trg_orders_updated_at on public.orders;
create trigger trg_orders_updated_at
before update on public.orders
for each row execute function public.update_updated_at_column();

create or replace function public.creer_commande(p_items jsonb, p_client jsonb)
returns jsonb
language plpgsql security definer
set search_path = public
as $$
declare
  v_order public.orders;
  v_item jsonb;
  v_prod record;
  v_qty integer;
  v_subtotal integer := 0;
  v_pid text;
begin
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Panier vide';
  end if;
  if coalesce(trim(p_client->>'name'), '') = '' or coalesce(trim(p_client->>'phone'), '') = '' then
    raise exception 'Nom et téléphone obligatoires';
  end if;

  insert into public.orders (
    user_id, customer_name, customer_email, customer_phone,
    delivery_address, delivery_city, delivery_country, payment_method
  ) values (
    auth.uid(),
    trim(p_client->>'name'),
    nullif(trim(p_client->>'email'), ''),
    trim(p_client->>'phone'),
    nullif(trim(p_client->>'address'), ''),
    nullif(trim(p_client->>'city'), ''),
    coalesce(nullif(trim(p_client->>'country'), ''), 'Côte d''Ivoire'),
    nullif(p_client->>'payment_method', '')
  ) returning * into v_order;

  for v_item in select * from jsonb_array_elements(p_items) loop
    v_pid := v_item->>'product_id';
    if v_pid is null or v_pid !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
      raise exception 'Produit invalide dans le panier';
    end if;
    v_qty := greatest(1, least(coalesce((v_item->>'quantity')::integer, 1), 99));

    select p.id, p.name, p.price, p.artisan_id, p.image_url
      into v_prod
      from public.products p
      where p.id = v_pid::uuid and p.published;
    if not found then
      raise exception 'Un produit du panier n''est plus disponible';
    end if;

    insert into public.order_items (order_id, product_id, artisan_id, product_name, product_image, unit_price, quantity)
    values (v_order.id, v_prod.id, v_prod.artisan_id, v_prod.name, v_prod.image_url, v_prod.price, v_qty);
    v_subtotal := v_subtotal + v_prod.price * v_qty;
  end loop;

  update public.orders
    set subtotal = v_subtotal, total = v_subtotal + delivery_fee
    where id = v_order.id
    returning * into v_order;

  return jsonb_build_object(
    'id', v_order.id, 'reference', v_order.reference,
    'total', v_order.total, 'status', v_order.status
  );
end $$;
grant execute on function public.creer_commande(jsonb, jsonb) to anon, authenticated;

create or replace function public.admin_commandes(p_code text)
returns jsonb
language plpgsql stable security definer
set search_path = public
as $$
begin
  if not public._admin_ok(p_code) then
    raise exception 'Accès refusé' using errcode = '42501';
  end if;
  return coalesce((
    select jsonb_agg(to_jsonb(o) || jsonb_build_object(
      'items', coalesce((select jsonb_agg(to_jsonb(i)) from public.order_items i where i.order_id = o.id), '[]'::jsonb)
    ) order by o.created_at desc)
    from public.orders o
  ), '[]'::jsonb);
end $$;
grant execute on function public.admin_commandes(text) to anon, authenticated;

create or replace function public.admin_stats(p_code text)
returns jsonb
language plpgsql stable security definer
set search_path = public
as $$
begin
  if not public._admin_ok(p_code) then
    raise exception 'Accès refusé' using errcode = '42501';
  end if;
  return jsonb_build_object(
    'artisans', (select count(*) from public.artisans where published),
    'produits_en_ligne', (select count(*) from public.products where published),
    'produits_en_attente', (select count(*) from public.products where status = 'pending'),
    'produits_refuses', (select count(*) from public.products where status = 'rejected'),
    'commandes', (select count(*) from public.orders),
    'commandes_payees', (select count(*) from public.orders where status in ('paid', 'preparing', 'shipped', 'delivered')),
    'chiffre_affaires', (select coalesce(sum(total), 0) from public.orders where status in ('paid', 'preparing', 'shipped', 'delivered')),
    'clients', (select count(*) from auth.users),
    'artisans_sans_produit_ce_mois', (
      select count(*) from public.artisans a
      where a.published and not exists (
        select 1 from public.products p
        where p.artisan_id = a.id and p.created_at >= date_trunc('month', now())
      )
    )
  );
end $$;
grant execute on function public.admin_stats(text) to anon, authenticated;

-- Recharge le cache de l'API pour voir les nouvelles tables/fonctions
notify pgrst, 'reload schema';

commit;

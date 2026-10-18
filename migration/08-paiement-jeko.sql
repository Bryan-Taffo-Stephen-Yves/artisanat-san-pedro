-- =====================================================================
-- Artisanat San Pedro — paiement Jèko (à lancer APRÈS le script 07)
--   • suivi des tentatives de paiement Jèko (une référence par tentative)
--   • passage "payée" idempotent + décrément du stock, réservé au serveur
--   • lecture du statut d'une commande pour la page de retour de paiement
--
-- Supabase > projet SAN PEDRO > SQL Editor > coller tout le fichier > Run.
-- Transaction unique, relançable sans dommage.
-- =====================================================================

begin;

create table if not exists public.payment_attempts (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  reference text not null unique,
  payment_request_id text,
  payment_method text,
  payer_phone text,
  status text not null default 'pending' check (status in ('pending', 'success', 'error')),
  error_reason text,
  transaction_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists payment_attempts_order_id_idx on public.payment_attempts(order_id);

-- Réservé au serveur (fonctions Edge avec la clé service_role)
alter table public.payment_attempts enable row level security;
revoke all on public.payment_attempts from anon, authenticated;
grant all on public.payment_attempts, public.orders, public.order_items to service_role;

drop trigger if exists trg_payment_attempts_updated_at on public.payment_attempts;
create trigger trg_payment_attempts_updated_at
before update on public.payment_attempts
for each row execute function public.update_updated_at_column();

-- Paiement confirmé par Jèko (webhook ou vérification) : idempotent.
-- Renvoie 'paid', 'already_paid', 'unknown_reference' ou 'amount_mismatch'.
create or replace function public.jeko_paiement_reussi(
  p_reference text,
  p_payment_request_id text,
  p_amount_cents bigint,
  p_transaction_id text,
  p_method text
)
returns text
language plpgsql security definer
set search_path = public
as $$
declare
  v_attempt public.payment_attempts;
  v_order public.orders;
  v_item record;
begin
  select * into v_attempt from public.payment_attempts where reference = p_reference for update;
  if not found then
    return 'unknown_reference';
  end if;

  select * into v_order from public.orders where id = v_attempt.order_id for update;

  update public.payment_attempts
    set status = 'success',
        transaction_id = coalesce(p_transaction_id, transaction_id),
        payment_request_id = coalesce(payment_request_id, p_payment_request_id)
    where id = v_attempt.id;

  if v_order.status in ('paid', 'preparing', 'shipped', 'delivered') then
    return 'already_paid';
  end if;

  if p_amount_cents is distinct from (v_order.total::bigint * 100) then
    update public.orders
      set payment_reference = p_reference,
          payment_provider = 'jeko'
      where id = v_order.id;
    return 'amount_mismatch'; -- à vérifier manuellement, la commande n'est pas validée
  end if;

  update public.orders
    set status = 'paid',
        paid_at = now(),
        payment_provider = 'jeko',
        payment_method = coalesce(p_method, payment_method),
        payment_reference = p_reference
    where id = v_order.id;

  -- Décrément du stock (jamais en dessous de zéro)
  for v_item in select product_id, quantity from public.order_items where order_id = v_order.id loop
    if v_item.product_id is not null then
      update public.products
        set stock = greatest(0, coalesce(stock, 0) - v_item.quantity)
        where id = v_item.product_id;
    end if;
  end loop;

  return 'paid';
end $$;
revoke execute on function public.jeko_paiement_reussi(text, text, bigint, text, text) from public, anon, authenticated;
grant execute on function public.jeko_paiement_reussi(text, text, bigint, text, text) to service_role;

-- Échec constaté (Jèko n'envoie pas de webhook en cas d'échec)
create or replace function public.jeko_paiement_echoue(p_reference text, p_reason text)
returns void
language plpgsql security definer
set search_path = public
as $$
begin
  update public.payment_attempts
    set status = 'error', error_reason = left(p_reason, 500)
    where reference = p_reference and status = 'pending';
  update public.orders o
    set status = 'failed'
    from public.payment_attempts a
    where a.reference = p_reference and o.id = a.order_id and o.status = 'pending'
      and not exists (
        select 1 from public.payment_attempts b
        where b.order_id = o.id and b.status in ('pending', 'success')
      );
end $$;
revoke execute on function public.jeko_paiement_echoue(text, text) from public, anon, authenticated;
grant execute on function public.jeko_paiement_echoue(text, text) to service_role;

-- Page de retour : statut d'une commande (sans aucune donnée personnelle).
-- L'identifiant de commande (UUID) n'est connu que de l'acheteur.
create or replace function public.statut_commande(p_order_id uuid)
returns jsonb
language sql stable security definer
set search_path = public
as $$
  select jsonb_build_object('reference', o.reference, 'status', o.status, 'total', o.total)
  from public.orders o where o.id = p_order_id;
$$;
grant execute on function public.statut_commande(uuid) to anon, authenticated;

notify pgrst, 'reload schema';

commit;

-- 09 · Renvoi en validation après un refus
-- Un produit refusé que l'artisan corrige (photo, nom, description, prix)
-- repasse automatiquement « en attente » : l'équipe PACTE le revoit.
-- Script idempotent : il remplace seulement la fonction du déclencheur créé en 07.

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

  -- Produit refusé puis corrigé : retour en validation
  if old.status = 'rejected'
     and (new.image_url, new.gallery, new.name, new.description, new.price)
         is distinct from (old.image_url, old.gallery, old.name, old.description, old.price) then
    new.status := 'pending';
    new.published := false;
    new.submitted_at := now();
    new.reviewed_at := null;
  end if;
  return new;
end $$;

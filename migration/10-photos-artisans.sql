-- 10 · Photos des 9 artisans qui n'en avaient pas
-- Les images sont déjà dans le stockage (artisan-images/avatars/<slug>.jpg).
-- Le script ne touche qu'aux artisans encore sans photo : il peut être relancé sans risque.

update public.artisans
set avatar_url = 'https://ghzrzlkezdgnldlpnlbc.supabase.co/storage/v1/object/public/artisan-images/avatars/' || slug || '.jpg'
where slug in (
  'ambeu-simplice',
  'kaba-souleymane',
  'kolate-hie',
  'kone-hassane-franck',
  'kotchadan-marcel',
  'koubiya-kotchikpa',
  'mabia-kasson-narcisse',
  'sereme-lare',
  'takouo-henri-bass'
)
and (avatar_url is null or avatar_url = '');

-- Vérification : doit renvoyer 0
select count(*) as artisans_sans_photo
from public.artisans
where avatar_url is null or avatar_url = '';

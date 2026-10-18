# Mise en ligne : validation des produits, comptes clients, paiement Jèko

Le code est prêt sur la branche `feat/validation-comptes-paiement`. Il sera fusionné
dans `main` (donc mis en ligne par Vercel) **une fois les étapes 1 et 2 faites**.
Les étapes 3 à 6 (paiement) peuvent venir après : sans elles, les commandes
s'enregistrent et l'équipe est prévenue que le paiement en ligne n'est pas actif.

## 1. Base de données : script 07 (sécurité, validation, comptes clients)

1. Supabase → projet **SAN PEDRO** → **SQL Editor** → *New query*.
2. Coller tout le fichier `migration/07-moderation-comptes-securite.sql`.
3. Remplacer `CHOISIS-TON-CODE-ADMIN` par le nouveau code d'accès à `/admin`.
4. **Run**. En cas d'erreur, rien n'est modifié (transaction unique).

Pour changer le code admin plus tard :

```sql
update public.app_settings
set value = extensions.crypt('NOUVEAU-CODE', extensions.gen_salt('bf')), updated_at = now()
where key = 'admin_code_hash';
```

## 2. Base de données : script 08 (paiement + téléphones artisans)

Même procédure avec `migration/08-paiement-jeko.sql` (rien à remplacer).

## 3. Comptes clients : réglages Supabase Auth

Supabase → **Authentication** → **URL Configuration** :

- *Site URL* : `https://artisanat-san-pedro.vercel.app`
- *Redirect URLs* : ajouter `https://artisanat-san-pedro.vercel.app/**`

Facultatif : **Authentication → Providers → Email** → désactiver *Confirm email*
si l'on veut que le client soit connecté dès l'inscription (sinon il reçoit un
e-mail de confirmation).

## 4. Jèko : compte et clés (à faire par le titulaire du compte Jèko)

1. Compte Jèko Business vérifié (sinon l'API répond `business_not_enabled_for_api_access`).
2. Dashboard Jèko → **Paramètres → API & Webhooks** : créer une clé API
   (on obtient `X-API-KEY` et `X-API-KEY-ID`) et noter l'identifiant du magasin (`storeId`).
3. Webhook : URL
   `https://ghzrzlkezdgnldlpnlbc.supabase.co/functions/v1/jeko-webhook`
   → copier le **secret webhook**.

## 5. Supabase : secrets et fonctions

Supabase → **Edge Functions** → **Secrets** :

| Nom | Valeur |
|---|---|
| `JEKO_API_KEY` | clé API Jèko |
| `JEKO_API_KEY_ID` | identifiant de la clé |
| `JEKO_STORE_ID` | identifiant du magasin |
| `JEKO_WEBHOOK_SECRET` | secret du webhook |
| `SITE_URL` | `https://artisanat-san-pedro.vercel.app` |

Déployer les deux fonctions (code dans `supabase/functions/`) :

- depuis le Dashboard : *Edge Functions → Deploy a new function → Via Editor*,
  nommer `jeko-pay`, coller `supabase/functions/jeko-pay/index.ts` ;
  puis `jeko-webhook` avec `supabase/functions/jeko-webhook/index.ts`
  et **« Verify JWT » désactivé** (Jèko n'envoie pas de jeton Supabase ;
  la fonction vérifie elle-même la signature `Jeko-Signature`).
- ou en ligne de commande :

```bash
supabase functions deploy jeko-pay --project-ref ghzrzlkezdgnldlpnlbc
supabase functions deploy jeko-webhook --no-verify-jwt --project-ref ghzrzlkezdgnldlpnlbc
```

## 6. Test réel (Jèko n'a pas de mode bac à sable)

1. Créer un produit de test à **100 FCFA**, le valider dans `/admin`.
2. Commander, payer avec un vrai numéro (Wave, Orange, MTN ou Moov).
3. Vérifier dans `/admin` → *Commandes* que la commande passe en **Payée**.
4. Masquer ensuite le produit de test.

## Rappel : ce qui change pour chacun

- **Artisans** : leurs nouveaux produits passent par la validation de l'équipe
  (sauf « artisans de confiance », dans leur métier). Rappel affiché quand rien
  n'a été publié dans le mois.
- **Admin** (`/admin`, nouveau code) : file de validation, artisans (confiance,
  téléphone, relance WhatsApp), commandes, chiffres réels.
- **Clients** : compte (commandes, favoris, profil), paiement Mobile Money avec
  le numéro de leur compte, sans formulaire supplémentaire.

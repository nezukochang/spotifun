# Supabase — guide rapide (2 minutes)

## Où cliquer dans Project Settings → API

| Sur Supabase | Copier dans |
|--------------|-------------|
| **Project URL** | `SUPABASE_URL` dans `.env` |
| **anon** **public** (Publishable / anon key) | `SUPABASE_ANON_KEY` dans `.env` |

Ne copiez **pas** la clé `service_role` (secrète, réservée au serveur).

## Étape 1 — SQL (base de données)

1. Menu gauche : **SQL Editor**
2. **New query**
3. Ouvrez le fichier `supabase/SETUP_COMPLET.sql` sur votre PC
4. Copiez **tout** → collez dans l’éditeur → **Run**
5. Succès si vous voyez « Success » (6 morceaux insérés)

## Étape 2 — Auth (connexion app)

1. **Authentication** → **Providers** → **Email**
2. Désactivez **Confirm email** (pour tester sans mail de confirmation)

## Étape 3 — Clés dans le projet

```bash
cp /home/momor/fluxion/.env.example /home/momor/fluxion/.env
# Éditez .env avec URL + anon key
bash /home/momor/fluxion/scripts/configure-supabase.sh
```

## Étape 4 — Lancer l’app

```bash
cd /home/momor/fluxion/Fluxion
npm run android
```

Inscrivez-vous dans l’app avec email + mot de passe.

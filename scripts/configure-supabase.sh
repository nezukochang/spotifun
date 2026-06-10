#!/usr/bin/env bash
# Écrit les clés Supabase dans Fluxion/src/config/secrets.ts
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$ROOT/.env"
SECRETS="$ROOT/Fluxion/src/config/secrets.ts"

if [[ -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

URL="${SUPABASE_URL:-}"
KEY="${SUPABASE_ANON_KEY:-}"

if [[ -z "$URL" || -z "$KEY" ]]; then
  echo "❌ Manque SUPABASE_URL ou SUPABASE_ANON_KEY"
  echo ""
  echo "1. Copiez : cp $ROOT/.env.example $ROOT/.env"
  echo "2. Ouvrez Supabase → Project Settings → API"
  echo "   - Project URL  → SUPABASE_URL"
  echo "   - anon public  → SUPABASE_ANON_KEY"
  echo "3. Relancez : bash $ROOT/scripts/configure-supabase.sh"
  exit 1
fi

mkdir -p "$(dirname "$SECRETS")"
cat > "$SECRETS" <<EOF
/** Généré par scripts/configure-supabase.sh — ne pas committer */
export const secrets = {
  SUPABASE_URL: '${URL}',
  SUPABASE_ANON_KEY: '${KEY}',
};
EOF

echo "✅ secrets.ts mis à jour"
echo "   URL: ${URL}"

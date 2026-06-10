#!/usr/bin/env bash
# Pré-télécharge Gradle 8.13 (~130 Mo) — connexion lente OK
set -euo pipefail

GRADLE_VERSION="8.13"
ZIP="gradle-${GRADLE_VERSION}-bin.zip"
URL="https://services.gradle.org/distributions/${ZIP}"
GRADLE_USER_HOME="${GRADLE_USER_HOME:-$HOME/.gradle}"
# Hash généré par le Gradle Wrapper pour cette URL
HASH="5xuhj0ry160q40clulazy9h7d"
DEST="$GRADLE_USER_HOME/wrapper/dists/gradle-${GRADLE_VERSION}-bin/${HASH}"

mkdir -p "$DEST"
OUT="$DEST/$ZIP"

if [[ -f "$OUT" ]] && [[ $(stat -c%s "$OUT" 2>/dev/null || echo 0) -gt 100000000 ]]; then
  echo "✅ Gradle déjà présent : $OUT"
  exit 0
fi

echo "📦 Téléchargement Gradle ${GRADLE_VERSION} (~130 Mo) → $OUT"
echo "   Peut prendre 5–15 min selon la connexion."
echo ""

rm -f "$OUT" "${OUT}.part" 2>/dev/null || true

if command -v curl >/dev/null 2>&1; then
  curl -fL --connect-timeout 60 --max-time 7200 -C - --progress-bar -o "$OUT" "$URL"
elif command -v wget >/dev/null 2>&1; then
  wget -c --progress=bar:force -O "$OUT" "$URL"
else
  echo "❌ Installez curl ou wget"
  exit 1
fi

SIZE=$(stat -c%s "$OUT" 2>/dev/null || echo 0)
if [[ "$SIZE" -lt 100000000 ]]; then
  echo "❌ Fichier trop petit ($SIZE octets) — téléchargement incomplet, relancez le script."
  exit 1
fi

echo ""
echo "✅ Terminé. Lancez : cd ~/fluxion/Fluxion && npm run android"

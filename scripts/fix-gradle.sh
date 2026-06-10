#!/usr/bin/env bash
# Supprime le Gradle corrompu et retélécharge proprement (~131 Mo)
set -euo pipefail

GRADLE_VERSION="8.13"
HASH="5xuhj0ry160q40clulazy9h7d"
GRADLE_USER_HOME="${GRADLE_USER_HOME:-$HOME/.gradle}"
DEST_DIR="$GRADLE_USER_HOME/wrapper/dists/gradle-${GRADLE_VERSION}-bin/${HASH}"
ZIP_NAME="gradle-${GRADLE_VERSION}-bin.zip"
OUT="$DEST_DIR/$ZIP_NAME"
# Taille attendue (octets) — Gradle 8.13 bin
EXPECTED_SIZE=136971731

URLS=(
  "https://services.gradle.org/distributions/${ZIP_NAME}"
  "https://downloads.gradle.org/distributions/${ZIP_NAME}"
)

echo "🧹 Suppression du cache Gradle corrompu..."
rm -rf "$DEST_DIR"
mkdir -p "$DEST_DIR"

download_once() {
  local url="$1"
  echo ""
  echo "⬇️  Téléchargement depuis : $url"
  if command -v aria2c >/dev/null 2>&1; then
    aria2c -x 8 -s 8 -k 1M --file-allocation=none -d "$DEST_DIR" -o "$ZIP_NAME" "$url"
  elif command -v curl >/dev/null 2>&1; then
    curl -fL --retry 5 --retry-delay 5 --connect-timeout 30 --max-time 0 \
      -C - -o "$OUT" "$url"
  elif command -v wget >/dev/null 2>&1; then
    wget -c -O "$OUT" "$url"
  else
    echo "❌ Installez curl, wget ou aria2"
    exit 1
  fi
}

verify_zip() {
  local size
  size=$(stat -c%s "$OUT" 2>/dev/null || echo 0)
  echo "📦 Taille : $size / $EXPECTED_SIZE octets"
  if [[ "$size" -lt $((EXPECTED_SIZE - 1000000)) ]]; then
    echo "❌ Fichier trop petit — téléchargement incomplet."
    return 1
  fi
  if ! unzip -tq "$OUT" >/dev/null 2>&1; then
    echo "❌ Archive ZIP invalide (corrompue)."
    return 1
  fi
  echo "✅ ZIP valide."
  return 0
}

for url in "${URLS[@]}"; do
  rm -f "$OUT"
  if download_once "$url" && verify_zip; then
    echo ""
    echo "✅ Gradle ${GRADLE_VERSION} prêt."
    echo "   Lancez : cd ~/fluxion/Fluxion && npm run android"
    exit 0
  fi
  echo "⚠️  Échec avec cette URL, essai suivant..."
  rm -f "$OUT"
done

echo "❌ Impossible de télécharger Gradle. Essayez :"
echo "   1. Autre réseau (partage 4G / autre Wi‑Fi)"
echo "   2. aria2c : sudo pacman -S aria2 && relancez ce script"
echo "   3. Télécharger sur un autre PC et copier le zip vers :"
echo "      $OUT"
exit 1

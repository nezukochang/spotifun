#!/usr/bin/env bash
# Lance l'app sur téléphone USB ou émulateur (adb dans le PATH)
set -euo pipefail

export ANDROID_HOME="${ANDROID_HOME:-$HOME/Android/Sdk}"
export PATH="$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$ANDROID_HOME/tools:$PATH"

if ! command -v adb >/dev/null 2>&1; then
  echo "❌ adb introuvable. ANDROID_HOME=$ANDROID_HOME"
  exit 1
fi

echo "📱 Appareils connectés :"
adb devices -l

if ! adb devices | grep -w "device" | grep -v "List" | grep -q .; then
  echo ""
  echo "⚠️  Aucun téléphone détecté."
  echo "   → Branchez le câble USB, activez Débogage USB, acceptez la popup sur le téléphone."
  echo "   → Ou lancez un émulateur depuis Android Studio (Device Manager)."
  exit 1
fi

# USB : l'app atteint Metro sur le PC
adb reverse tcp:8081 tcp:8081 2>/dev/null || true

# Gradle : timeout réseau 10 min (gradle-wrapper.properties)
export GRADLE_OPTS="${GRADLE_OPTS:-} -Dorg.gradle.daemon=true"

cd "$(dirname "$0")/../Fluxion"
exec npx react-native run-android "$@"

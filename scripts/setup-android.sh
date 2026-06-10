#!/usr/bin/env bash
set -euo pipefail

ANDROID_HOME="${ANDROID_HOME:-$HOME/Android/Sdk}"
export ANDROID_HOME

if [[ ! -d "$ANDROID_HOME" ]]; then
  echo "ANDROID_HOME introuvable: $ANDROID_HOME"
  exit 1
fi

SDKMANAGER="$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager"
if [[ ! -x "$SDKMANAGER" ]]; then
  echo "sdkmanager introuvable. Installez Android cmdline-tools."
  exit 1
fi

yes | "$SDKMANAGER" --licenses >/dev/null
"$SDKMANAGER" --install \
  "platform-tools" \
  "platforms;android-36" \
  "build-tools;36.0.0" \
  "ndk;26.1.10909125"

echo "sdk.dir=$ANDROID_HOME" > "$(dirname "$0")/../Fluxion/android/local.properties"
echo "OK — SDK prêt. Lancez: cd Fluxion && npm run android"

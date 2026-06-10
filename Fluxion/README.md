# Fluxion — Application mobile

Lecteur musical React Native CLI + Supabase. Voir aussi [`../README.md`](../README.md) pour la vision produit complète.

## Démarrage rapide

```bash
cd Fluxion
npm install

# Config Supabase (optionnel — sans clés = mode démo)
cp src/config/secrets.example.ts src/config/secrets.ts
# Éditer secrets.ts avec SUPABASE_URL et SUPABASE_ANON_KEY

# Android (une fois le SDK configuré)
export ANDROID_HOME=$HOME/Android/Sdk
../scripts/setup-android.sh   # installe NDK + platforms
npm run android
```

**Mode démo** : connectez-vous avec n’importe quel email / mot de passe. Catalogue et streams SoundHelix intégrés.

## Fonctionnalités implémentées

| Fonction | Statut |
|----------|--------|
| Auth (démo + Supabase) | OK |
| Accueil, recherche, bibliothèque | OK |
| Lecteur audio (background) | OK |
| Mini-player + plein écran | OK |
| Cache hors ligne (chiffré, pas de téléchargement MP3) | OK |
| Handoff Bluetooth + code 6 caractères | OK |
| Animations Reanimated | OK |

## Commandes

```bash
npm start          # Metro
npm run android    # Build + install device/émulateur
npm run ios        # macOS + Xcode
npm run typecheck  # TypeScript
npm test           # Jest
```

## Structure `src/`

```
src/
├── app/           # App, navigation
├── config/        # env, secrets
├── features/      # auth, home, search, library, player, bluetooth, settings
├── services/      # audio, cache, supabase, ble
├── stores/        # zustand
└── shared/        # UI, theme
```

## Handoff

1. Lancer une lecture → Player → « Envoyer la lecture »
2. Un **code** s’affiche (valide 5 min)
3. Sur l’autre appareil : même écran → saisir le code → « Accepter »

Pas d’envoi de fichier audio — uniquement métadonnées + position + reprise du flux.

## Gradle

Le wrapper utilise **Gradle 8.13** (compatibilité AGP React Native 0.85). Si le build échoue sur le NDK :

```bash
export ANDROID_HOME=$HOME/Android/Sdk
$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager "ndk;26.1.10909125"
```

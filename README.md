# Fluxion

**Lecteur musical personnalisé** — expérience type Spotify, backend **Supabase**, application **React Native CLI**.  
Écoute **en ligne et hors ligne** (cache de flux chiffré, sans téléchargement de fichiers par l’utilisateur), et **partage de lecture** vers un autre appareil via **Bluetooth**.

---

## Table des matières

1. [Vision produit](#vision-produit)
2. [Fonctionnalités](#fonctionnalités)
3. [Ce que l’app ne fait pas](#ce-que-lapp-ne-fait-pas)
4. [Stack technique](#stack-technique)
5. [Architecture](#architecture)
6. [Design & animations](#design--animations)
7. [Supabase](#supabase)
8. [Mode hors ligne](#mode-hors-ligne)
9. [Partage Bluetooth](#partage-bluetooth)
10. [Structure du dépôt](#structure-du-dépôt)
11. [Prérequis & installation](#prérequis--installation)
12. [Variables d’environnement](#variables-denvironnement)
13. [Roadmap](#roadmap)
14. [Licence & contenu musical](#licence--contenu-musical)

---

## Vision produit

Fluxion vise une expérience d’écoute **fluide**, **fiable** et **précise** :

- **Fluidité** — navigation et player animés sans saccades.
- **Robustesse** — bascule transparente online ↔ offline, états réseau explicites.
- **Précision** — seek, file d’attente et handoff Bluetooth avec contrôle au dixième de seconde près.

L’identité visuelle et les micro-interactions sont décrites dans [`docs/DESIGN.md`](docs/DESIGN.md).

---

## Fonctionnalités

### Parité « Spotify-like » (MVP → v1)

| Domaine | Fonctions |
|---------|-----------|
| **Auth** | Inscription / connexion email, OAuth (Google, Apple), session persistante |
| **Catalogue** | Morceaux, albums, artistes, playlists, recherche full-text |
| **Lecture** | Play / pause, suivant / précédent, shuffle, repeat, file d’attente |
| **Player** | Mini-player, plein écran, paroles (optionnel), « Ajouter à la playlist » |
| **Social léger** | Profil, playlists publiques / privées, abonnements artistes |
| **Découverte** | Accueil personnalisé, récemment joué, recommandations (phase 2) |
| **Bibliothèque** | Playlists utilisateur, titres likés, albums enregistrés |

### Spécificités Fluxion

| Fonction | Description |
|----------|-------------|
| **Offline intelligent** | Mise en cache **temporaire et chiffrée** des flux autorisés pour écoute sans réseau — pas d’export ni de bouton « Télécharger le MP3 » |
| **Sync bibliothèque** | File d’attente offline et métadonnées synchronisées via Supabase quand le réseau revient |
| **Handoff Bluetooth** | Envoyer **la lecture en cours** (métadonnées + position + URI de flux signée) à un autre appareil Fluxion à proximité |
| **Connect multi-appareil** | Reprendre la lecture sur un autre téléphone (compte lié, Realtime) |

---

## Ce que l’app ne fait pas

> **Important : le but n’est pas de télécharger les musiques.**

- Pas de téléchargement de fichiers audio sur le stockage utilisateur (pas de MP3/FLAC locaux exportables).
- Pas de partage de fichiers audio bruts par Bluetooth (conformité droits d’auteur).
- Pas de contournement DRM : uniquement des **URLs de streaming signées** à durée de vie limitée, fournies par **votre** backend / CDN licencié.

Le mode hors ligne = **cache de lecture** (comme une mémoire tampon étendue), révocable par le serveur, pas une bibliothèque de fichiers possédés par l’utilisateur.

---

## Stack technique

| Couche | Choix |
|--------|--------|
| Mobile | **React Native 0.85** (CLI, pas Expo managed) |
| Langage | TypeScript |
| Navigation | React Navigation 7 (native stack + bottom tabs) |
| État serveur | TanStack Query + Supabase JS v2 |
| État local | Zustand |
| Audio | `react-native-track-player` (service background, lock screen) |
| Offline | SQLite (`op-sqlite` ou `react-native-quick-sqlite`) + cache chiffré sur disque |
| Réseau | NetInfo + file d’attente de mutations offline |
| Animations | Reanimated 3 + Gesture Handler |
| Bluetooth | `react-native-ble-plx` (handoff / discovery) ; routage audio sortant via système (A2DP) |
| Backend | **Supabase** (Auth, Postgres, Storage métadonnées, Edge Functions, Realtime) |
| Streaming | URLs signées générées par Edge Function (à brancher sur votre fournisseur audio licencié) |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Application React Native                 │
├──────────────┬──────────────┬──────────────┬───────────────┤
│     UI       │ Audio Engine │ Offline Mgr  │  BT Handoff   │
│  (screens)   │ Track Player │ cache+sync   │  BLE session  │
└──────┬───────┴──────┬───────┴──────┬───────┴───────┬───────┘
       │              │              │               │
       ▼              ▼              ▼               ▼
┌─────────────────────────────────────────────────────────────┐
│              Couche domaine (hooks, services)                │
└─────────────────────────────┬───────────────────────────────┘
                              │
       ┌──────────────────────┼──────────────────────┐
       ▼                      ▼                      ▼
┌─────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Supabase   │    │  CDN / Stream   │    │  SQLite local   │
│ Auth + DB   │    │  (signed URLs)  │    │  cache index    │
│ Realtime    │    │                 │    │                 │
└─────────────┘    └─────────────────┘    └─────────────────┘
```

Détails : [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)  
Schéma SQL : [`supabase/migrations/001_initial_schema.sql`](supabase/migrations/001_initial_schema.sql)

---

## Design & animations

- **Palette, typo, composants** : [`docs/DESIGN.md`](docs/DESIGN.md)
- **Icône** : `assets/design/icon-fluxion.svg` (onde + trait de précision)
- **Principes motion** : Fluid Slide, Robust Expand, Precision Pulse, Sync Orbit, Link Beam

Réduction automatique des animations si l’utilisateur active « Réduire les animations » dans les réglages système.

---

## Supabase

### Rôles

| Service | Usage |
|---------|--------|
| **Auth** | Utilisateurs, JWT, refresh |
| **Postgres** | Profils, playlists, likes, historique, appareils appairés |
| **Storage** | Pochettes, avatars (pas les masters audio) |
| **Realtime** | Sync file d’attente / now playing entre appareils du même compte |
| **Edge Functions** | `sign-stream-url`, `register-device`, `revoke-offline-cache` |

### Configuration rapide

1. Créer un projet sur [supabase.com](https://supabase.com).
2. Exécuter les migrations dans `supabase/migrations/`.
3. Copier `.env.example` vers `Fluxion/.env` et renseigner les clés.

---

## Mode hors ligne

### Comportement

1. L’utilisateur marque une playlist ou un album comme **« Disponible hors connexion »** (libellé UI : cache, pas « téléchargement »).
2. En ligne, l’app récupère des **segments de flux** via URL signée et les stocke dans un répertoire chiffré (clé dérivée du device + secret serveur).
3. Hors ligne, `TrackPlayer` lit depuis le cache ; métadonnées et pochette depuis SQLite.
4. Au retour du réseau, sync des positions d’écoute et invalidation des entrées expirées.

### Limites techniques

- Taille max de cache configurable (ex. 2 Go par défaut).
- Expiration alignée sur la politique du fournisseur de streams.
- Révocation distante via Edge Function.

---

## Partage Bluetooth

### Modèle retenu (légal & UX)

| Mécanisme | Rôle |
|-----------|------|
| **BLE (GATT)** | Découverte d’appareils Fluxion, échange de `session_token`, `track_id`, `position_ms` |
| **Supabase Realtime** | Validation du handoff, renouvellement URL signée sur l’appareil cible |
| **A2DP (système)** | Sortie vers enceintes / casques Bluetooth classiques — géré par l’OS, pas par export de fichier |

**Flux « Envoyer la lecture » :**

1. Appareil A diffuse un service BLE `FLUXION_HANDOFF`.
2. Appareil B scanne et accepte.
3. A envoie un jeton de session éphémère (pas le fichier audio).
4. B appelle `sign-stream-url` et démarre la lecture à `position_ms`.

> Pour deux téléphones, les deux doivent être connectés au même compte ou avoir un partage de playlist autorisé (à définir en v1.1).

---

## Structure du dépôt

```
fluxion/
├── README.md                 # Ce fichier
├── .env.example
├── docs/
│   ├── DESIGN.md
│   └── ARCHITECTURE.md
├── assets/
│   └── design/
│       └── icon-fluxion.svg
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
└── Fluxion/                  # Projet React Native CLI
    ├── android/
    ├── ios/
    ├── src/                  # (à créer) code applicatif
    └── package.json
```

### Arborescence `src/` prévue

```
src/
├── app/           # navigation, providers
├── features/      # auth, player, library, search, offline, bluetooth
├── shared/        # ui, hooks, utils, theme
├── services/      # supabase, audio, cache, ble
└── types/
```

---

## Prérequis & installation

### Outils

- Node.js ≥ 20
- npm ou yarn
- JDK 17 (Android)
- Android Studio + SDK
- Xcode 15+ (macOS, pour iOS)
- CocoaPods (iOS)
- Compte Supabase

### Commandes

```bash
# Depuis la racine du dépôt
cd Fluxion
npm install

# iOS (macOS uniquement)
cd ios && bundle install && bundle exec pod install && cd ..
npm run ios

# Android
npm run android
```

### Lier Supabase (après création du projet)

```bash
cp ../.env.example .env
# Éditer .env avec SUPABASE_URL et SUPABASE_ANON_KEY
```

---

## Variables d’environnement

Voir [`.env.example`](.env.example).

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | URL du projet Supabase |
| `SUPABASE_ANON_KEY` | Clé anonyme (safe côté client) |
| `SUPABASE_STORAGE_BUCKET` | Ex. `covers` |
| `STREAM_SIGNING_ENDPOINT` | URL Edge Function (optionnel si dérivée de SUPABASE_URL) |
| `OFFLINE_CACHE_MAX_BYTES` | Limite cache (défaut 2147483648) |

---

## État d’implémentation (juin 2026)

| Phase | Statut |
|-------|--------|
| **0** — RN CLI, docs, design | ✅ |
| **1** — Auth, catalogue, player | ✅ (mode démo + Supabase) |
| **2** — Playlists, recherche, UI player | ✅ |
| **3** — Cache offline | ✅ |
| **4** — Handoff BLE + code | ✅ |
| **5** — Recommandations, paroles, E2E | À venir |

Application dans `Fluxion/` — voir [`Fluxion/README.md`](Fluxion/README.md) pour lancer l’app.

## Roadmap restante

| Phase | Livrable |
|-------|----------|
| **5** | Recommandations, paroles, tests Detox E2E |
| **6** | Edge Functions `sign-stream-url` en production |

---

## Licence & contenu musical

Ce dépôt fournit l’**architecture logicielle**. Vous devez obtenir vos propres **licences** pour le streaming musical (agrégateur type 7digital, Audius API, catalogue personnel, etc.). Fluxion ne fournit pas de catalogue protégé par défaut.

---

## Documentation complémentaire

- [Spécifications design](docs/DESIGN.md)
- [Architecture détaillée](docs/ARCHITECTURE.md)
- [Schéma base de données](supabase/migrations/001_initial_schema.sql)

---

*Fluxion — Fluidité. Robustesse. Précision.*

# Architecture Fluxion

## 1. Contexte

Application mobile **React Native CLI** + **Supabase**, lecteur type Spotify avec **cache offline** (pas de téléchargement utilisateur) et **handoff Bluetooth** entre appareils.

---

## 2. Modules applicatifs (`src/`)

### `features/auth`

- Supabase Auth (email, OAuth).
- Session persistée (`AsyncStorage` + refresh automatique).
- Guard de navigation : `AuthStack` vs `MainTabs`.

### `features/catalog`

- Listes : morceaux, albums, artistes, playlists.
- Recherche Postgres (`pg_trgm` ou Supabase full-text).
- TanStack Query avec `staleTime` adapté au catalogue.

### `features/player`

- `react-native-track-player` : service foreground, contrôles lock screen.
- État global : `usePlayerStore` (Zustand) — `queue`, `currentIndex`, `position`, `isPlaying`.
- UI : `MiniPlayer`, `FullPlayer`, `QueueSheet`.

### `features/library`

- Playlists CRUD, likes, historique d’écoute (`play_events`).

### `features/offline`

- **OfflineManager** : planification cache, quota, chiffrement.
- **CacheIndex** (SQLite) : `track_id`, `path`, `expires_at`, `byte_size`.
- Sync au reconnect : upload positions, pull révocations.

### `features/bluetooth`

- **BleHandoffService** : advertising / scanning GATT UUID `0000FLUX-...`.
- Payload JSON ≤ 512 B : `{ sessionId, trackId, positionMs, issuedAt }`.
- Complément Realtime pour validation serveur.

### `shared/`

- Design tokens (`theme.ts`), composants (`TrackRow`, `PlayerScrubber`).
- Hooks : `useNetworkStatus`, `useOfflineEligible`.

---

## 3. Flux de données lecture (online)

```
User tap Play
    → PlayerService.load(trackId)
    → Edge Function sign-stream-url(trackId)
    ← { url, expiresAt }
    → TrackPlayer.add({ url, title, artist, artwork })
    → play()
    → play_events insert (debounced 10s)
```

---

## 4. Flux offline

```
User: "Disponible hors connexion" sur playlist P
    → OfflineManager.enqueue(P.track_ids)
    → Pour chaque track: sign-stream-url → téléchargement segments → encrypt → SQLite index
    → UI: badge "Cache" sur les pistes

Hors réseau:
    → TrackPlayer url = file://{cachePath}
    → Pas d'appel réseau sauf queue mutations (Outbox)

Retour réseau:
    → Sync Outbox, refresh expirations, compact cache LRU
```

---

## 5. Flux handoff Bluetooth

```
Device A (émetteur)                    Device B (récepteur)
      │                                        │
      │  BLE advertise FLUXION_HANDOFF         │  BLE scan
      │◄──────────────────────────────────────►│  pair
      │  GATT write: handoff_payload           │
      │                                        │  POST handoff/accept
      │                                        │  sign-stream-url
      │                                        │  play at positionMs
      │  Realtime: session.closed on A         │  (option: pause A)
```

Sécurité :

- `sessionId` UUID, TTL 60 s, lié au `user_id` en base.
- B refuse si compte non autorisé.

---

## 6. Supabase — tables principales

Voir `supabase/migrations/001_initial_schema.sql`.

| Table | Rôle |
|-------|------|
| `profiles` | Extension de `auth.users` |
| `tracks` | Métadonnées + `storage_path` master (référence CDN) |
| `albums`, `artists` | Catalogue |
| `playlists`, `playlist_tracks` | Listes |
| `likes`, `play_events` | Engagement |
| `offline_cache_entries` | Suivi serveur des caches actifs |
| `handoff_sessions` | Sessions BLE / multi-device |
| `devices` | Appareils enregistrés (push, handoff) |

RLS : chaque utilisateur ne lit/écrit que ses playlists, likes, devices.

---

## 7. Edge Functions (à implémenter)

| Function | Entrée | Sortie |
|----------|--------|--------|
| `sign-stream-url` | `track_id`, `device_id` | URL signée TTL 1h |
| `register-device` | `platform`, `ble_id` | `device_id` |
| `handoff-create` | `track_id`, `position_ms` | `session_id`, `token` |
| `handoff-accept` | `session_id`, `token` | URL signée pour B |
| `revoke-offline-cache` | `user_id` ou `track_id` | 204 |

---

## 8. Dépendances npm prévues

```json
{
  "@supabase/supabase-js": "^2",
  "@react-navigation/native": "^7",
  "@tanstack/react-query": "^5",
  "react-native-track-player": "^4",
  "react-native-reanimated": "^3",
  "react-native-gesture-handler": "^2",
  "@react-native-community/netinfo": "^11",
  "react-native-ble-plx": "^3",
  "zustand": "^5",
  "@op-engineering/op-sqlite": "^11"
}
```

---

## 9. Tests

| Niveau | Cible |
|--------|--------|
| Unit | OfflineManager, parsers handoff |
| Integration | Supabase RLS, sign-stream-url |
| E2E | Detox : login → play → offline banner → BLE mock |

---

## 10. Risques & mitigations

| Risque | Mitigation |
|--------|------------|
| Violation droits d’auteur | URLs signées, pas d’export fichier, TTL court |
| Cache trop volumineux | Quota + LRU |
| BLE instable | Fallback Realtime-only handoff (QR / code 6 chiffres) |
| Background kill Android | Foreground service + notification player |

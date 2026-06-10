# Fluxion — Spécifications design & identité visuelle

## Vision

**Fluxion** est un lecteur musical personnalisé type Spotify, centré sur trois piliers perceptibles dans chaque interaction :

| Pilier | Signification UX | Manifestation visuelle |
|--------|------------------|------------------------|
| **Fluidité** | Transitions sans à-coups, lecture continue | Courbes ease-in-out, morphing, parallaxe légère |
| **Robustesse** | Fiabilité online/offline, états clairs | Contrastes stables, feedback haptique, indicateurs de sync |
| **Précision** | Contrôle fin (seek, file d’attente, partage BT) | Grille 8pt, typographie nette, micro-animations ciblées |

---

## Palette & tokens

```
Couleurs principales
────────────────────
--flux-void:        #0A0B0F   (fond profond)
--flux-surface:     #14161D   (cartes, barre player)
--flux-elevated:    #1E2129   (modales, sheets)
--flux-accent:      #3D8BFF   (actions primaires — bleu précis)
--flux-accent-glow: #5BA3FF   (hover, focus ring)
--flux-precision:   #00E5C8   (seek, sync OK, Bluetooth actif)
--flux-warm:        #FF6B4A   (likes, alertes douces)
--flux-muted:       #8B92A8   (secondaire)
--flux-text:        #F4F6FA   (texte principal)
--flux-text-dim:    #A8B0C4   (métadonnées)

Typographie
───────────
Display / titres :  "SF Pro Display" (iOS) / "Roboto" Medium (Android) — 28–34sp
Corps            :  15–16sp, line-height 1.45
Mono (durées)     :  tabular nums, 12–13sp pour timestamps précis

Rayons & espacement
───────────────────
radius-sm: 8px  |  radius-md: 16px  |  radius-full: 9999px (pills)
grille: 8pt base, marges écran 20px
```

---

## Icône d’application

### Concept

Monogramme **« ƒ » stylisé** (flux) : une onde sinusoïdale coupée par un trait vertical (précision / beat grid).

- **Forme** : cercle 1024×1024, fond `--flux-void` avec dégradé radial subtil (#14161D → #0A0B0F).
- **Symbole** : onde en `--flux-accent`, trait vertical en `--flux-precision` (1–2 px à l’échelle export).
- **Profondeur** : léger inner glow sur l’onde (robustesse / matériel premium).

### Variantes export

| Asset | Taille | Usage |
|-------|--------|--------|
| `icon-ios.png` | 1024 | App Store |
| `icon-android-foreground.png` | 432 | Adaptive icon (foreground) |
| `icon-android-background.png` | 432 | Adaptive icon (#0A0B0F) |
| `icon-monochrome.png` | 432 | Android 13+ themed icon |

Fichiers de référence SVG : `assets/design/icon-fluxion.svg`

---

## Animations (Reanimated 3 + Lottie optionnel)

### 1. Splash / boot — « Precision Pulse »

- Durée : **1,2 s**
- Séquence : logo scale 0,92 → 1,0 (spring, damping 14) ; onde qui se dessine en stroke-dashoffset ; trait vertical flash `--flux-precision` à 0,8 s.
- Message : **précision** au démarrage.

### 2. Transition d’écran — « Fluid Slide »

- Shared element sur pochette album (300 ms, `Easing.bezier(0.4, 0, 0.2, 1)`).
- Fond : cross-fade + blur léger (iOS) / elevation (Android).
- Message : **fluidité** entre liste et player plein écran.

### 3. Mini-player → Full player — « Robust Expand »

- Barre du bas : hauteur 64 → 100 % avec `withSpring`, pas de saut de layout.
- Indicateur offline : pastille ambre fixe en coin si cache actif (ne disparaît pas pendant l’anim).
- Message : **robustesse** des états réseau.

### 4. Lecture / pause — « Beat Lock »

- Bouton play : scale 1 → 0,94 → 1 (120 ms).
- Visualiseur : 4 barres, hauteur synchronisée sur `progressUpdateInterval` (précision temporelle).
- Message : **précision** du feedback.

### 5. Sync offline — « Sync Orbit »

- Icône cloud : rotation 360° en 1,5 s (loop tant que sync).
- Anneau `--flux-precision` remplit selon % tracks mis en cache (streaming buffer, pas téléchargement fichier utilisateur).
- Message : **robustesse** de la synchro.

### 6. Partage Bluetooth — « Link Beam »

- Deux nœuds (appareils) reliés par ligne en dash animé.
- Pulse le long du trait quand le transfert de **métadonnées + point d’écoute** est actif (pas export de fichier DRM).
- Message : **fluidité** de connexion + **précision** de pairing.

### Durées & courbes standard

```typescript
export const Motion = {
  fluid:   { duration: 300, easing: Easing.bezier(0.4, 0, 0.2, 1) },
  robust:  { duration: 220, easing: Easing.out(Easing.cubic) },
  precise: { duration: 120, easing: Easing.linear },
  spring:  { damping: 14, stiffness: 180 },
} as const;
```

---

## Composants UI clés

| Composant | Comportement |
|-----------|--------------|
| `TrackRow` | Swipe actions (file, partager BT) ; skeleton shimmer en chargement |
| `PlayerScrubber` | Pas de 1 s au drag ; thumb 44×44 touch target |
| `OfflineBanner` | « Écoute depuis le cache » — jamais « Téléchargé » |
| `BluetoothSheet` | Liste appareils pairés + « Envoyer la lecture » |
| `LibraryTabs` | Playlists, Albums, Artistes, Récemment écouté |

---

## Accessibilité

- Contraste WCAG AA minimum sur texte principal.
- `accessibilityLabel` sur tous les contrôles player.
- Réduction des animations si `Reduce Motion` système activé (fallback cross-fade 200 ms).

---

## Références mood

- Fluidité : transitions iOS Music, Spotify Connect sheet.
- Robustesse : indicateurs sync Dropbox/OneDrive (clarté d’état).
- Précision : DAW minimal (grille, temps exact).

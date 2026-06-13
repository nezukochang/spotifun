/**
 * Design tokens Fluxion — voir docs/DESIGN.md
 */
export const colors = {
  void: '#0A0B0F', // deep space
  surface: '#181A21',
  elevated: '#242731',
  accent: '#FF7B54', // warm sunrise / sunset
  accentGlow: '#FF9E7D',
  precision: '#00D9C0', // vibrant mint
  punk: '#E91E63', // hot pink for punk vibe
  afro: '#FFD700', // gold for afro royalty
  muted: '#7C839D',
  text: '#FDFDFD',
  textDim: '#A0A7C0',
  success: '#4CAF50',
  warning: '#FFC107',
  warm: '#FF6B6B',
  white: '#FFFFFF',
  gray: '#9E9E9E',
} as const;


export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 20,
  xl: 24,
} as const;

export const radius = {
  sm: 8,
  md: 16,
  full: 9999,
} as const;

export const Motion = {
  fluid: { duration: 300 },
  robust: { duration: 220 },
  precise: { duration: 120 },
  spring: { damping: 14, stiffness: 180 },
} as const;

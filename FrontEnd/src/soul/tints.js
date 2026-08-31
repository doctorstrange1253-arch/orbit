/**
 * soul/tints.js — Tinted shadows and soul-aware surface recipes.
 *
 * V2 used `box-shadow: 0 8px 32px var(--shadow-color)` where --shadow-color
 * was a black-ish rgba. V3 replaces this with per-surface tinted shadows:
 * every card's shadow is the *nearest nebula color* at ~20% alpha, not black.
 *
 * The shadow tints are computed at runtime from the active soul's nebula and
 * exposed as utility recipes. `<NebulaCard>` (in soul/NebulaCard.jsx) uses
 * these to render an HolographicCard-equivalent surface that picks up the
 * active soul's glow.
 *
 * Why this matters: a black shadow on a cyan card reads as "the card is
 * dark, lifted from a dark surface" — passive, generic. A cyan-tinted shadow
 * reads as "the card is glowing from within" — the card has a soul.
 */

import { NEBULAS, getLayeredNebula } from './palette';

// 20% alpha of a hex color. Returns a `color-mix(in oklab, ..., transparent)`
// expression that the browser resolves at render time. (Tailwind v4 supports
// color-mix; modern browsers all do.)
export function tintShadow(nb, opacityPct = 22) {
  if (!nb) return '0 8px 24px -8px rgba(0,0,0,0.35)';
  return `0 8px 24px -8px color-mix(in oklab, ${nb.from} ${opacityPct}%, transparent), 0 2px 8px -4px color-mix(in oklab, ${nb.to} ${Math.round(opacityPct * 0.6)}%, transparent)`;
}

// A subtler tint for inline pills / chips (no -8px pull, just a soft halo).
export function tintHalo(nb, opacityPct = 28) {
  if (!nb) return '0 0 0 transparent';
  return `0 0 24px -4px color-mix(in oklab, ${nb.from} ${opacityPct}%, transparent)`;
}

// The card-bg-with-tint — a translucent surface that picks up the soul.
// Use this on anything that should feel "of the current soul".
export function tintedSurface(nb, opacityPct = 8) {
  if (!nb) return 'var(--bg-surface)';
  return `color-mix(in oklab, ${nb.from} ${opacityPct}%, var(--bg-surface))`;
}

// Full surface recipe: bg + border + shadow + halo. Returned as a single
// object so a component can spread it on its style prop.
export function surfaceRecipe(soulId, accent) {
  const nb = getLayeredNebula(soulId, accent);
  return {
    background: tintedSurface(nb, 8),
    border: `1px solid color-mix(in oklab, ${nb?.from ?? 'rgba(255,255,255,0.09)'} 24%, transparent)`,
    boxShadow: tintShadow(nb, 22),
    // expose the gradient as a CSS var so children can read it
    '--soul-gradient': nb ? `linear-gradient(135deg, ${nb.from}, ${nb.to})` : 'transparent',
    '--soul-glow': nb?.from ?? 'transparent',
  };
}

// Border-only tint — for outlines that should read as "of this soul" without
// filling the surface.
export function borderTint(nb, opacityPct = 32) {
  if (!nb) return '1px solid var(--border-subtle)';
  return `1px solid color-mix(in oklab, ${nb.from} ${opacityPct}%, transparent)`;
}

// Re-export the palette so consumers can `import { NEBULAS } from './tints'`
// without caring which file holds the source of truth.
export { NEBULAS };

/**
 * soul/palette.js — The Nebula palette.
 *
 * Five pairs of color stops (each pair is the "from" and "to" of a soul's
 * gradient), plus the Void. These are the *only* source of truth for V3
 * accent colors — every V3 component that needs a soul-color reads from
 * `getNebula(soulId)` and applies it via CSS custom properties.
 *
 * The V2 palette (--accent-1 / --accent-2 / --accent-3) is kept untouched
 * for backward compatibility. V3 ADDS these tokens; it does not replace.
 *
 * The colors are wired into `index.css` as `--nebula-*` variables so any
 * component can also use them via `var(--nebula-aurora-1)` directly.
 */

export const NEBULAS = {
  aurora: {
    id: 'aurora',
    from: '#a78bfa',  // violet
    to:   '#3b82f6',  // blue
    label: 'Aurora',
    description: 'Calm authority. The light that stays.',
  },
  solaris: {
    id: 'solaris',
    from: '#fbbf24',  // amber
    to:   '#f43f5e',  // rose-gold
    label: 'Solaris',
    description: 'Warm growth. The light that gives.',
  },
  pulsar: {
    id: 'pulsar',
    from: '#22d3ee',  // cyan
    to:   '#0d9488',  // teal
    label: 'Pulsar',
    description: 'Spinning energy. The light that signals.',
  },
  supernova: {
    id: 'supernova',
    from: '#fff8e1',  // white-gold
    to:   '#fde68a',  // soft gold
    label: 'Supernova',
    description: 'A force. There is no upper bound.',
  },
  void: {
    id: 'void',
    from: '#1e1b4b',  // deep purple
    to:   '#581c87',  // dark violet
    label: 'Void',
    description: 'The stakes are real.',
  },
};

// Map a soul id (peer / mentor / student) to its nebula key. The bonuses
// (supergiant / voidBloom) get their own nebula.
export const SOUL_TO_NEBULA = {
  peer:    'pulsar',
  mentor:  'aurora',
  student: 'solaris',
};

export function getNebula(soulId) {
  const key = SOUL_TO_NEBULA[soulId];
  if (!key) return null;
  return NEBULAS[key];
}

// Resolve a soul+accent combination (e.g. `peer` + `supergiant`) to the
// *layered* nebula the UI should use. The accent overrides the soul's
// natural nebula when present. Used by `useSoul().nebula`.
export function getLayeredNebula(soulId, accent) {
  if (accent && NEBULAS[accent]) return NEBULAS[accent];
  return getNebula(soulId);
}

// CSS-ready string for a soul/accent's gradient. Useful when a tailwind class
// can't express the dynamic lookup.
export function gradientCss(soulId, accent) {
  const n = getLayeredNebula(soulId, accent);
  if (!n) return 'transparent';
  return `linear-gradient(135deg, ${n.from}, ${n.to})`;
}

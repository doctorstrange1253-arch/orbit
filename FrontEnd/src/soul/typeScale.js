/**
 * soul/typeScale.js — The astronomical type scale.
 *
 * V2 used a generic H1 / body / caption hierarchy. V3 replaces it with three
 * scale levels named after astronomical bodies:
 *
 *   - Supernova  — display, hero text, "you are here" moments
 *   - Orbit      — body, default running text
 *   - Stardust   — micro, eyebrows, captions, the "fine print" of the cosmos
 *
 * The actual CSS lives in `index.css` as `--type-supernova`, `--type-orbit`,
 * `--type-orbit-bold`, `--type-stardust`, `--type-stardust-eyebrow`. This
 * module exports them as Tailwind class names so a component can write
 * `<h1 className="text-supernova">` or use them as a JS value.
 *
 * The scale inherits the active soul's accent for Supernova/Orbit text — see
 * the `text-soul-accent` utility class in index.css. Stardust is always
 * muted-text color (a Stardust is faint, by definition).
 */

export const TYPE_SCALE = {
  supernova: {
    id: 'supernova',
    label: 'Supernova',
    description: 'Display. The hero. Use sparingly — 1 per screen.',
    tailwindClass: 'text-supernova',
    cssVar: 'var(--type-supernova)',
  },
  orbit: {
    id: 'orbit',
    label: 'Orbit',
    description: 'Default body. What you read most of the time.',
    tailwindClass: 'text-orbit',
    cssVar: 'var(--type-orbit)',
  },
  orbitBold: {
    id: 'orbit-bold',
    label: 'Orbit (Bold)',
    description: 'Body, with weight. For emphasized running text.',
    tailwindClass: 'text-orbit-bold',
    cssVar: 'var(--type-orbit-bold)',
  },
  stardust: {
    id: 'stardust',
    label: 'Stardust',
    description: 'Micro. Eyebrows, captions, fine print.',
    tailwindClass: 'text-stardust',
    cssVar: 'var(--type-stardust)',
  },
  stardustEyebrow: {
    id: 'stardust-eyebrow',
    label: 'Stardust (Eyebrow)',
    description: 'Tiny all-caps eyebrows. The punctuation of the sky.',
    tailwindClass: 'text-stardust-eyebrow',
    cssVar: 'var(--type-stardust-eyebrow)',
  },
};

// Convenience: pick the right type scale for a context.
export function typeForContext(context) {
  // 'hero' → supernova, 'body' → orbit, 'caption' → stardust
  switch (context) {
    case 'hero':      return TYPE_SCALE.supernova;
    case 'body':      return TYPE_SCALE.orbit;
    case 'body-bold': return TYPE_SCALE.orbitBold;
    case 'caption':   return TYPE_SCALE.stardust;
    case 'eyebrow':   return TYPE_SCALE.stardustEyebrow;
    default:          return TYPE_SCALE.orbit;
  }
}

/**
 * soul/registry.js — The Three Souls (and their bonuses) of Orbit V3.
 *
 * Each Soul is an *identity architecture*, not a permission. A user can be all
 * three simultaneously; the *active* soul is whichever window they're in right
 * now. Souls set the accent color (Nebula), the tone of empty states and
 * narration, and which home page greets them when they arrive.
 *
 * The keys here are deliberately the SAME strings as the V2 `roles[]` array
 * (`peer_learner` / `mentor` / `student`) so the V2 auth store keeps working
 * unchanged. Soul data is what `useSoul()` returns; role data is what the
 * permission guards check. Same names, different purpose.
 *
 * The "Supergiant" and "Void Bloom" are *achievement accents* layered on top
 * of a base soul — they're not a fourth/ fifth role, they're a glow.
 */

import { ROLE_META } from '../store/authStore';

// Soul = the identity. Role = the permission. We expose the same ids so the
// V2 role-prefixed URL scheme (`/peer/*`, `/mentor/*`, `/student/*`) keeps
// working. The peer_learner role keeps its `peer_learner` key for V2 compat;
// everywhere we say "Peer" in V3, the soul id is `peer`.
export const SOULS = {
  peer: {
    id: 'peer',
    roleId: 'peer_learner',
    celestial: 'Pulsar',
    accent: 'cyan',          // V2 ROLE_META key (kept so chips match)
    nebula: 'pulsar',         // palette.js key
    label: 'Peer',
    short: 'Peer',
    tone: 'Energetic — "let\'s go"',
    homeRoute: '/peer/dashboard',
    register: 'peer',
    description: 'You show up. You swap. You grow together.',
    rotationSeconds: 4,       // CSS keyframes loop for the celestial body
    keyword: 'swap',
  },
  mentor: {
    id: 'mentor',
    roleId: 'mentor',
    celestial: 'Aurora',
    accent: 'purple',
    nebula: 'aurora',
    label: 'Mentor',
    short: 'Mentor',
    tone: 'Steady — "I\'ve been here"',
    homeRoute: '/mentor/observatory',
    register: 'mentor',
    description: 'You hold the light. Others learn by you.',
    rotationSeconds: 12,
    keyword: 'guide',
  },
  student: {
    id: 'student',
    roleId: 'student',
    celestial: 'Solaris',
    accent: 'blue',
    nebula: 'solaris',
    label: 'Student',
    short: 'Student',
    tone: 'Curious — "show me"',
    homeRoute: '/student/universe',
    register: 'student',
    description: 'You are what you\'re becoming. Show up and it shows.',
    rotationSeconds: 6,
    keyword: 'learn',
  },
};

// Map URL prefix → soul id. Mirrors `getCurrentWindow` in authStore.js so a
// path like `/mentor/...` resolves to the mentor soul. The two are kept
// in sync intentionally; if a new soul ever gets a URL prefix, add it here.
export const URL_PREFIX_TO_SOUL = {
  '/peer':      'peer',
  '/mentor':    'mentor',
  '/student':   'student',
  '/courses':   'student',
  '/gameology': 'student',
  '/skill-map': 'student',
};

// Resolve a pathname to a soul id (or null on shared pages).
export function soulForPathname(pathname) {
  if (!pathname || typeof pathname !== 'string') return null;
  for (const prefix of Object.keys(URL_PREFIX_TO_SOUL)) {
    if (pathname === prefix || pathname.startsWith(prefix + '/')) {
      return URL_PREFIX_TO_SOUL[prefix];
    }
  }
  return null;
}

// Achievement accents — a base soul + an earned glow. These are NOT a fourth
// identity, they're a tonal layer. The V3 plan documents:
//   - Supergiant unlocks at gameology.level >= 25 OR pact.highestDivision ===
//     'oracle'. The frontend reads the user's gameology/pact state and adds
//     the accent; this module is just the shape.
//   - Void Bloom unlocks at > 1000 enrollments on a course OR > 100 sessions
//     as a mentor. The frontend checks these counters.
export const SOUL_ACCENTS = {
  supergiant: {
    id: 'supergiant',
    nebula: 'supernova',
    label: 'Supergiant',
    description: 'A force. Whatever you are, you are it large.',
    cssClass: 'supergiant',
  },
  voidBloom: {
    id: 'voidBloom',
    nebula: 'void',
    label: 'Void Bloom',
    description: 'High stakes. The room is watching.',
    cssClass: 'void-bloom',
  },
};

// Re-export the V2 role metadata so any V3 component that wants to render
// "Peer" / "Mentor" / "Student" labels can pull from a single source.
export { ROLE_META };

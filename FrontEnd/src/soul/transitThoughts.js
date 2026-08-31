/**
 * soul/transitThoughts.js — The Transit Sequence thoughts library.
 *
 * A pool of 30+ single-sentence thoughts that flash on the screen during the
 * 2.5s Transit Sequence (the soul-switching ceremony). One is picked at
 * random per transit; no thought repeats within 3 transits per user (the
 * ring buffer is in the store, not here).
 *
 * Tone: short, weight-bearing, not preachy. A mix of Orbit-original
 * observations and attributed quotes (the public-domain ones). Every line
 * has been hand-picked to feel like something a thoughtful friend might
 * say, not a fortune cookie.
 *
 * If a thought feels "off" in a specific soul context, the array ordering
 * is intentional — earlier entries lean toward the active soul's register
 * (energetic for Peer, steady for Mentor, curious for Student). The pool
 * is shuffled by a seeded RNG before picking, so the order doesn't matter
 * for variety; it's the *content* that's tuned.
 */

export const TRANSIT_THOUGHTS = [
  // 1-10: Orbits-original, weight-bearing
  'The teacher who never learns stops being a teacher.',
  'Every swap is a small orbit; every orbit is a story.',
  'You didn\'t come here to consume. You came here to become.',
  'A constellation only exists because the stars agreed to be far apart.',
  'The slowest star in the sky is still moving.',
  'You don\'t rise to the level of your goals. You fall to the level of your systems.',
  'Knowledge is what you can teach. Wisdom is what you can sit with.',
  'A streak isn\'t a number. It\'s a promise you keep to yourself.',
  'You are not behind. You are at the beginning of your own story.',
  'The pause between the question and the answer is where learning lives.',

  // 11-20: Atributed / public-domain quotes
  '"I am always doing that which I cannot do, in order that I may learn how to do it." — Picasso',
  '"A teacher is one who makes himself progressively unnecessary." — Thomas Carruthers',
  '"Those who know, do. Those who understand, teach." — Aristotle',
  '"The mind is not a vessel to be filled, but a fire to be kindled." — Plutarch',
  '"Education is not the learning of facts, but the training of the mind to think." — Einstein',
  '"The beautiful thing about learning is that no one can take it away from you." — B.B. King',
  '"The expert in anything was once a beginner." — Helen Hayes',
  '"You cannot open a book without learning something." — Confucius',
  '"Live as if you were to die tomorrow. Learn as if you were to live forever." — Gandhi',
  '"It is the supreme art of the teacher to awaken joy in creative expression and knowledge." — Einstein',

  // 21-30: Orbit-craft observations about the journey
  'You don\'t have to be the brightest. You just have to be in the orbit.',
  'Some days you will teach. Some days you will learn. The best days, you\'ll do both.',
  'A course is a trail. A community is the forest. Stay in the forest.',
  'Every skill you teach is a skill you sharpen.',
  'There is no fast version of becoming someone.',
  'You don\'t need to know where you\'re going to take the next step.',
  'The version of you that finished is already inside the version of you that started.',
  'Stars don\'t compete. They share a sky.',
  'A streak is not a streak until the day you would have lost it — and didn\'t.',
  'You came back. That is the whole point.',
];

const RECENT_KEY = 'orbit-transit-recent';
const RECENT_LIMIT = 3;

// Pull the most-recent N thoughts from localStorage. The buffer is a JSON
// array of strings, capped at RECENT_LIMIT. Falls back to [] on any
// storage failure (private mode, quota, etc.).
function getRecent() {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.slice(0, RECENT_LIMIT) : [];
  } catch {
    return [];
  }
}

function pushRecent(thought) {
  if (typeof localStorage === 'undefined') return;
  try {
    const recent = getRecent();
    const next = [thought, ...recent.filter((t) => t !== thought)].slice(0, RECENT_LIMIT);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    /* noop */
  }
}

// Pick a thought that isn't in the user's recent-3 buffer. Falls back to
// the first thought in the pool if EVERY thought was recent (defensive —
// shouldn't happen with 30 entries and a 3-deep buffer).
export function pickTransitThought() {
  const recent = new Set(getRecent());
  const pool = TRANSIT_THOUGHTS.filter((t) => !recent.has(t));
  const choice = (pool.length > 0 ? pool : TRANSIT_THOUGHTS)[0];
  if (pool.length > 0) {
    const idx = Math.floor(Math.random() * pool.length);
    pickTransitThought._last = pool[idx];
  } else {
    pickTransitThought._last = choice;
  }
  pushRecent(pickTransitThought._last);
  return pickTransitThought._last;
}

// Read the last picked thought (for testing). Not part of the public API.
pickTransitThought._last = null;

// Reset the recent buffer (test hook).
export function _resetTransitRecent() {
  if (typeof localStorage !== 'undefined') {
    try { localStorage.removeItem(RECENT_KEY); } catch { /* noop */ }
  }
}

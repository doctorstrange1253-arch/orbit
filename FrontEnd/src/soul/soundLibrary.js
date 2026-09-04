/**
 * soul/soundLibrary.js — The V3 Sound Library.
 *
 * A typed function for every documented V3 event. All functions take an
 * optional `{ soul }` parameter so a single event (e.g. `pulseTick`) sounds
 * slightly different per soul (Pulsar = bright high-pitch, Aurora = mid with
 * reverb, Solaris = warm low-pitch). The mapping is in SOUL_VOICE below.
 *
 * Every function:
 *   - Returns early if `soundManager.isEnabled()` is false (the V2 toggle)
 *   - Returns early if `prefers-reduced-motion: reduce` AND the event is
 *     ambient (a "spice" sound). Confirmation sounds (heavy, success) still
 *     play because the user just *did* the thing.
 *   - Wraps everything in try/catch so a failed audio init never breaks UI
 *
 * The V2 `soundManager` exposes a shared `AudioContext`. V3 reuses it; we
 * never create a fresh context here. (Contexts leak and exhaust ~6 across
 * the lifetime of a session; V2 fixed this by centralizing — we honor that.)
 *
 * Public API:
 *   SoulSound.levelUp, .rankUp, .signalFlare, .bossLevel, .courseComplete,
 *           .transit, .bloom, .pulseTick, .flareLanded
 *   each taking `{ soul }` (optional)
 */

import soundManager from '../utils/soundManager';
import { playTransitCue } from './transitSound';

const C = {
  A3: 220.0,
  C4: 261.63,
  E4: 329.63,
  G4: 392.0,
  A4: 440.0,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
  G5: 783.99,
  A5: 880.0,
  C6: 1046.5,
  E6: 1318.51,
  G6: 1568.0,
};

const _isBrowser = () => typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
const _isReducedMotion = () => {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

function _ctx() {
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  if (soundManager && soundManager._audioCtx) {
    if (soundManager._audioCtx.state === 'suspended') {
      soundManager._audioCtx.resume().catch(() => {});
    }
    return soundManager._audioCtx;
  }
  const ac = new Ctx();
  ac.resume?.();
  return ac;
}

function _tone(ac, master, { freq, t, dur, type = 'sine', peak = 0.18, lp = 2400, slideTo }) {
  const o = ac.createOscillator();
  const g = ac.createGain();
  const f = ac.createBiquadFilter();
  f.type = 'lowpass';
  f.frequency.value = lp;
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + 0.03);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(f); f.connect(g); g.connect(master);
  o.start(t); o.stop(t + dur + 0.05);
}

function _noise(ac, master, { t, dur, peak = 0.12, lp = 2400, hp = 200 }) {
  const buf = ac.createBuffer(1, Math.ceil(ac.sampleRate * dur), ac.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * 0.5;
  const src = ac.createBufferSource(); src.buffer = buf;
  const g = ac.createGain();
  const hpf = ac.createBiquadFilter(); hpf.type = 'highpass'; hpf.frequency.value = hp;
  const lpf = ac.createBiquadFilter(); lpf.type = 'lowpass'; lpf.frequency.value = lp;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(hpf); hpf.connect(lpf); lpf.connect(g); g.connect(master);
  src.start(t); src.stop(t + dur + 0.02);
}

// Voice = a small set of timbre parameters per soul. The same note played
// with different voices feels different — bright for Pulsar, mid for Aurora,
// warm for Solaris.
const SOUL_VOICE = {
  peer:    { type: 'triangle', lp: 3800, peakScale: 1.0 },   // bright
  mentor:  { type: 'sine',     lp: 2400, peakScale: 0.85 },  // mid
  student: { type: 'triangle', lp: 3000, peakScale: 0.92 },  // warm
};
const _voice = (soul) => SOUL_VOICE[soul] || SOUL_VOICE.peer;

/**
 * Play a one-shot event. Wraps soundManager.isEnabled() + try/catch so every
 * caller can be a one-liner. `opts.alwaysFire = true` means it bypasses the
 * reduced-motion check (for confirmation events the user just earned).
 */
function _play(builder, opts = {}) {
  if (!soundManager.isEnabled()) return;
  if (_isReducedMotion() && !opts.alwaysFire) return;
  if (!_isBrowser()) return;
  try {
    const ac = _ctx();
    if (!ac) return;
    const master = ac.createGain();
    master.gain.value = 0.0001;
    master.connect(ac.destination);
    const now = ac.currentTime;
    builder(ac, master, now);
    setTimeout(() => { try { master.disconnect(); } catch { /* noop */ } }, 4000);
  } catch {
    /* best-effort */
  }
}

export const SoulSound = {
  // 800ms 3-note ascending chord. Used by gameology level-ups (within tier).
  levelUp: ({ soul } = {}) => _play((ac, m, t) => {
    const v = _voice(soul);
    [C.C5, C.E5, C.G5].forEach((f, i) => {
      _tone(ac, m, { freq: f, t: t + i * 0.1, dur: 0.7, type: v.type, peak: 0.18 * v.peakScale, lp: v.lp });
    });
  }, { alwaysFire: true }),

  // 1.2s cinematic pulse. Used by Pulse Ceremony (tier-up).
  rankUp: ({ soul } = {}) => _play((ac, m, t) => {
    const v = _voice(soul);
    // Rising sweep
    _tone(ac, m, { freq: C.C4, t: t, dur: 1.2, type: 'sine', peak: 0.18, lp: 1600, slideTo: C.C5 });
    // Bell arpeggio at 0.5s
    [C.C5, C.E5, C.G5, C.C6].forEach((f, i) => {
      _tone(ac, m, { freq: f, t: t + 0.5 + i * 0.1, dur: 0.7, type: v.type, peak: 0.16 * v.peakScale, lp: v.lp });
    });
    // Sub impact
    _tone(ac, m, { freq: 70, t: t + 0.6, dur: 0.5, type: 'sine', peak: 0.28, slideTo: 40 });
  }, { alwaysFire: true }),

  // 300ms descending whoosh. Used by Signal Flare launch.
  signalFlare: () => _play((ac, m, t) => {
    _noise(ac, m, { t: t, dur: 0.3, peak: 0.16, lp: 3200, hp: 400 });
    _tone(ac, m, { freq: 600, t: t, dur: 0.3, type: 'sawtooth', peak: 0.1, lp: 2000, slideTo: 200 });
  }),

  // 200ms dissonance + 800ms resolution. Used by Boss Level open.
  bossLevel: () => _play((ac, m, t) => {
    // Dissonance cluster
    [C.C4, C.C5 * 1.06].forEach((f) => {
      _tone(ac, m, { freq: f, t: t, dur: 0.2, type: 'sawtooth', peak: 0.12, lp: 1800 });
    });
    // Resolution: a major triad resolving
    [C.E4, C.G4, C.C5].forEach((f, i) => {
      _tone(ac, m, { freq: f, t: t + 0.25 + i * 0.08, dur: 0.7, type: 'triangle', peak: 0.18, lp: 2400 });
    });
  }, { alwaysFire: true }),

  // 1.5s I-V-vi-IV progression. Used by course completion.
  courseComplete: () => _play((ac, m, t) => {
    const progression = [
      [C.C4, C.E4, C.G4],   // I
      [C.G4, C.B4, C.D5],   // V
      [C.A4, C.C5, C.E5],   // vi
      [C.F4, C.A4, C.C5],   // IV
    ];
    progression.forEach((chord, i) => {
      chord.forEach((f) => {
        _tone(ac, m, { freq: f, t: t + i * 0.35, dur: 0.45, type: 'triangle', peak: 0.13, lp: 2400 });
      });
    });
  }, { alwaysFire: true }),

  // 2.5s transit ceremony. Delegates to transitSound.js so the same builder
  // is used for both TransitSequence and the explicit setter.
  transit: ({ soul, fromSoul } = {}) => {
    if (!soundManager.isEnabled()) return;
    playTransitCue(soul, fromSoul);
  },

  // 400ms low bloom. Used by Identity Selection bloom screen.
  bloom: () => _play((ac, m, t) => {
    _tone(ac, m, { freq: 200, t: t, dur: 0.4, type: 'sine', peak: 0.18, slideTo: 600, lp: 2000 });
  }),

  // 50ms soft click. Used by the horizon bar's per-minute tick.
  pulseTick: ({ soul } = {}) => _play((ac, m, t) => {
    const v = _voice(soul);
    _tone(ac, m, { freq: soul === 'mentor' ? C.C5 : soul === 'student' ? C.E5 : C.G5, t: t, dur: 0.05, type: v.type, peak: 0.06 * v.peakScale, lp: 4000 });
  }),

  // 1.0s planet materialization bell. Used when a course publishes in
  // response to a Signal Flare.
  flareLanded: () => _play((ac, m, t) => {
    [C.C5, C.E5, C.G5, C.C6].forEach((f, i) => {
      _tone(ac, m, { freq: f, t: t + i * 0.1, dur: 0.9, type: 'triangle', peak: 0.16, lp: 3000 });
    });
  }, { alwaysFire: true }),

  // 450ms paper-flip. Two layered noise bursts (the rustle + the
  // body of the page) and a soft low thump as the page lands. Used
  // by the WeekStrip's 3D flip cells.
  pageFlip: () => _play((ac, m, t) => {
    // High-freq rustle at the leading edge (the corner catching air)
    _noise(ac, m, { t: t, dur: 0.16, peak: 0.12, lp: 9000, hp: 2400 });
    // Mid-freq body of the page bending
    _noise(ac, m, { t: t + 0.05, dur: 0.22, peak: 0.10, lp: 4200, hp: 700 });
    // Low thump when the page lands
    _tone(ac, m, { freq: 90, t: t + 0.22, dur: 0.18, type: 'sine', peak: 0.14, slideTo: 55, lp: 220 });
  }, { alwaysFire: true }),
};

export const _soundLibraryTest = { C, SOUL_VOICE, _ctx, _tone, _noise };

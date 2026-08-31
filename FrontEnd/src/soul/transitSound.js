/**
 * soul/transitSound.js — The Transit Sequence Web Audio cue.
 *
 * A 2-component cue: a 200ms low whoosh as the current soul collapses into
 * the center, and a 600ms chord as the new soul blooms. Both compose on top
 * of the existing shared AudioContext (soundManager singleton) so we don't
 * leak contexts across the app.
 *
 * The chord's root note is keyed to the destination soul:
 *   - Peer (Pulsar)    → C5 (bright, energetic)
 *   - Mentor (Aurora)  → A4 (steady, mid)
 *   - Student (Solaris) → E5 (warm, curious)
 *
 * Honors the V2 sounds-enabled toggle (skillswap-sounds-enabled) via
 * soundManager.isEnabled(). The whole function is wrapped in try/catch so
 * a failed audio init can never break the visual ceremony.
 *
 * Public API: playTransitCue(toSoul, fromSoul?)
 */

import soundManager from '../utils/soundManager';
import { SOUL_TO_NEBULA } from './palette';

const C = {
  A4: 440.0,
  C5: 523.25,
  E5: 659.25,
  G5: 783.99,
  A5: 880.0,
};

const SOUL_ROOT = {
  peer:    C.C5,    // C5 — bright
  mentor:  C.A4,    // A4 — steady mid
  student: C.E5,    // E5 — warm
};

function _ctx() {
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  // Reuse the shared context from soundManager. (It already lazy-inits
  // and handles the suspended→resumed state for autoplay policy.)
  if (soundManager && soundManager._audioCtx) {
    if (soundManager._audioCtx.state === 'suspended') {
      soundManager._audioCtx.resume().catch(() => {});
    }
    return soundManager._audioCtx;
  }
  // Fallback: spin up a fresh context if the manager hasn't been touched.
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

function _noise(ac, master, { t, dur, peak = 0.12, lp = 1200, hp = 200 }) {
  const buf = ac.createBuffer(1, Math.ceil(ac.sampleRate * dur), ac.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * 0.6;
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

/**
 * Play the 2-component Transit Sequence cue.
 *
 *   0.00s — 0.20s : low whoosh (the current soul collapses)
 *   0.20s — 0.80s : chord (the new soul blooms) + soft noise tail
 *
 * The chord is rooted on the destination soul's note (SOUL_ROOT). The
 * notes stack as a 3-note triad in the *destination* register so the chord
 * resolves as a "place to land" rather than a transition sound.
 */
export function playTransitCue(toSoul, fromSoul) {
  if (!soundManager.isEnabled()) return;
  try {
    const ac = _ctx();
    if (!ac) return;
    const now = ac.currentTime;

    const master = ac.createGain();
    master.gain.value = 0.0001;
    master.connect(ac.destination);

    const root = SOUL_ROOT[toSoul] || C.C5;
    const third = root * 1.25;     // major third up
    const fifth = root * 1.5;      // perfect fifth up

    // PART 1 — low whoosh (0.00-0.20s)
    _noise(ac, master, { t: now, dur: 0.2, peak: 0.14, lp: 600, hp: 80 });
    // sub thump at 0.05s — the "collapse"
    _tone(ac, master, { freq: 90, t: now + 0.02, dur: 0.18, type: 'sine', peak: 0.16, lp: 400 });

    // PART 2 — chord (0.20-0.80s)
    _tone(ac, master, { freq: root,  t: now + 0.20, dur: 0.6, type: 'triangle', peak: 0.18, lp: 2800 });
    _tone(ac, master, { freq: third, t: now + 0.24, dur: 0.58, type: 'sine', peak: 0.14, lp: 3200 });
    _tone(ac, master, { freq: fifth, t: now + 0.28, dur: 0.56, type: 'sine', peak: 0.12, lp: 3600 });

    // PART 3 — gentle noise tail (0.55-0.80s) — the "bloom" softens
    _noise(ac, master, { t: now + 0.55, dur: 0.25, peak: 0.06, lp: 1800, hp: 200 });

    // Master envelope: gentle attack + tail
    master.gain.setValueAtTime(0.0001, now);
    master.gain.exponentialRampToValueAtTime(0.24, now + 0.04);
    master.gain.exponentialRampToValueAtTime(0.0001, now + 0.85);

    // fromSoul is reserved for future per-source tuning (e.g. a different
    // "departure" sound for each soul). Not used in v1.
    void fromSoul;

    setTimeout(() => { try { master.disconnect(); } catch { /* noop */ } }, 1500);
  } catch {
    /* audio is best-effort; never throw into the UI */
  }
}

// Silence a master early (used if a transit is interrupted).
export function stopTransitCue() {
  if (typeof soundManager?.stopAmbientMusic === 'function') {
    // Reuse the manager's AudioContext instead of closing it (it's shared).
    const ac = soundManager._audioCtx;
    if (ac) {
      try {
        const t = ac.currentTime;
        // Sweep the master gain to silence. Any in-flight tones will still
        // end at their scheduled .stop() times.
        ac.createGain().gain.setValueAtTime(0, t);
      } catch { /* noop */ }
    }
  }
}

export const _transitSoundTest = { SOUL_ROOT, _ctx, _tone, _noise };

/**
 * cosmetics.js — front-end render metadata for Photon-shop cosmetics.
 * Maps a catalog `key` (owned by the backend) to the CSS class in cosmetics.css
 * plus a small preview swatch. Render-only; the server owns the economy.
 *
 * Every catalog `key` in BackEnd/services/cosmeticsCatalog.js MUST have an entry
 * here AND a matching `.cg-*` / `.cbg-*` effect class in cosmetics.css. Each item
 * is a DISTINCT animated effect (not a recolor); the swatch is only a static
 * preview hint for the shop grid.
 */
import './cosmetics.css';

// key → { glowClass } for name_glow, { bgClass, swatch } for background.
export const COSMETIC_RENDER = {
  // ── Name glows (original) ─────────────────────────────────────────────────
  glow_aurora: { glowClass: 'cg cg-aurora', swatch: 'linear-gradient(90deg,#5eead4,#10b981)' },
  glow_ember:  { glowClass: 'cg cg-ember',  swatch: 'linear-gradient(90deg,#fdba74,#ef4444)' },
  glow_plasma: { glowClass: 'cg cg-plasma', swatch: 'linear-gradient(90deg,#f0abfc,#8b5cf6)' },
  glow_gold:   { glowClass: 'cg cg-gold',   swatch: 'linear-gradient(90deg,#fde68a,#f59e0b)' },
  glow_void:   { glowClass: 'cg cg-void',   swatch: 'linear-gradient(90deg,#a5b4fc,#f0abfc,#7dd3fc)' },

  // ── Name glows (effect-based) ─────────────────────────────────────────────
  glow_shimmer:     { glowClass: 'cg cg-shimmer',     swatch: 'linear-gradient(90deg,#94a3b8,#ffffff,#94a3b8)' },
  glow_neon:        { glowClass: 'cg cg-neon',        swatch: 'linear-gradient(90deg,#22d3ee,#a5f3fc)' },
  glow_holo:        { glowClass: 'cg cg-holo',        swatch: 'linear-gradient(90deg,#f472b6,#c084fc,#60a5fa)' },
  glow_solarflare:  { glowClass: 'cg cg-solarflare',  swatch: 'linear-gradient(90deg,#fdba74,#f97316)' },
  glow_glitch:      { glowClass: 'cg cg-glitch',      swatch: 'linear-gradient(90deg,#ef4444,#e0f2fe,#22d3ee)' },
  glow_comet:       { glowClass: 'cg cg-comet',       swatch: 'linear-gradient(90deg,#5eead4,#a5f3fc,#ffffff)' },
  glow_frost:       { glowClass: 'cg cg-frost',       swatch: 'linear-gradient(90deg,#bae6fd,#e0f2fe)' },
  glow_ribbon:      { glowClass: 'cg cg-ribbon',      swatch: 'linear-gradient(90deg,#34d399,#22d3ee,#a78bfa)' },
  glow_chrome:      { glowClass: 'cg cg-chrome',      swatch: 'linear-gradient(90deg,#9ca3af,#f9fafb,#6b7280)' },
  glow_pulsar:      { glowClass: 'cg cg-pulsar',      swatch: 'linear-gradient(90deg,#6366f1,#a5b4fc)' },
  glow_starlit:     { glowClass: 'cg cg-starlit',     swatch: 'linear-gradient(90deg,#c084fc,#ffffff,#f0abfc)' },
  glow_quasar:      { glowClass: 'cg cg-quasar',      swatch: 'linear-gradient(90deg,#8b5cf6,#60a5fa)' },
  glow_ion:         { glowClass: 'cg cg-ion',         swatch: 'linear-gradient(90deg,#fb923c,#fff7ed)' },
  glow_blackcore:   { glowClass: 'cg cg-blackcore',   swatch: 'linear-gradient(90deg,#0b0d17,#94a3b8)' },
  glow_lensing:     { glowClass: 'cg cg-lensing',     swatch: 'linear-gradient(90deg,#7c3aed,#ede9fe)' },
  glow_singularity: { glowClass: 'cg cg-singularity', swatch: 'linear-gradient(90deg,#ec4899,#f9a8d4)' },
  glow_darkmatter:  { glowClass: 'cg cg-darkmatter',  swatch: 'linear-gradient(90deg,#4c1d95,#a78bfa)' },
  glow_antimatter:  { glowClass: 'cg cg-antimatter',  swatch: 'linear-gradient(90deg,#ef4444,#fecaca)' },
  glow_multiversal: { glowClass: 'cg cg-multiversal', swatch: 'linear-gradient(90deg,#f472b6,#38bdf8,#34d399,#fbbf24)' },

  // ── Name glows (effect-based, batch 2) ───────────────────────────────────
  glow_wave:     { glowClass: 'cg cg-wave',     swatch: 'linear-gradient(90deg,#cbd5e1,#94a3b8)' },
  glow_breathe:  { glowClass: 'cg cg-breathe',  swatch: 'linear-gradient(90deg,#7dd3fc,#38bdf8)' },
  glow_cascade:  { glowClass: 'cg cg-cascade',  swatch: 'linear-gradient(180deg,#fde68a,#b45309)' },
  glow_lava:     { glowClass: 'cg cg-lava',     swatch: 'linear-gradient(0deg,#7f1d1d,#fbbf24)' },
  glow_prism:    { glowClass: 'cg cg-prism',    swatch: 'linear-gradient(90deg,#38bdf8,#a78bfa)' },
  glow_toxic:    { glowClass: 'cg cg-toxic',    swatch: 'linear-gradient(90deg,#84cc16,#d9f99d)' },
  glow_sparks:   { glowClass: 'cg cg-sparks',   swatch: 'linear-gradient(90deg,#fdba74,#fff7ed)' },
  glow_flash:    { glowClass: 'cg cg-flash',    swatch: 'linear-gradient(90deg,#fed7aa,#ffffff)' },
  glow_echo:     { glowClass: 'cg cg-echo',     swatch: 'linear-gradient(90deg,#7c3aed,#38bdf8)' },
  glow_kaleido:  { glowClass: 'cg cg-kaleido',  swatch: 'linear-gradient(90deg,#ef4444,#eab308,#22c55e,#3b82f6,#a855f7)' },

  // Name glows (effect-based, batch 3)
  glow_focus: { glowClass: 'cg cg-focus', swatch: 'linear-gradient(90deg,#e9d5ff,#c4b5fd)' },
  glow_underline: { glowClass: 'cg cg-underline', swatch: 'linear-gradient(90deg,#fbcfe8,#f9a8d4)' },
  glow_spread: { glowClass: 'cg cg-spread', swatch: 'linear-gradient(90deg,#a5f3fc,#22d3ee)' },
  glow_typewriter: { glowClass: 'cg cg-typewriter', swatch: 'linear-gradient(90deg,#86efac,#bbf7d0)' },
  glow_scan: { glowClass: 'cg cg-scan', swatch: 'linear-gradient(180deg,#38bdf8,#ffffff,#38bdf8)' },
  glow_emboss: { glowClass: 'cg cg-emboss', swatch: 'linear-gradient(90deg,#e5e7eb,#9ca3af)' },
  glow_marquee: { glowClass: 'cg cg-marquee', swatch: 'repeating-linear-gradient(90deg,#f59e0b 0 6px,#fff7ed 6px 10px)' },
  glow_heartbeat: { glowClass: 'cg cg-heartbeat', swatch: 'linear-gradient(90deg,#fda4af,#fecdd3)' },
  glow_wobble: { glowClass: 'cg cg-wobble', swatch: 'linear-gradient(90deg,#c4b5fd,#a78bfa)' },
  glow_static: { glowClass: 'cg cg-static', swatch: 'linear-gradient(90deg,#e5e7eb,#9ca3af,#f3f4f6)' },
  glow_torch: { glowClass: 'cg cg-torch', swatch: 'linear-gradient(90deg,#fdba74,#f97316)' },
  glow_volt: { glowClass: 'cg cg-volt', swatch: 'linear-gradient(90deg,#bae6fd,#38bdf8)' },
  glow_oil: { glowClass: 'cg cg-oil', swatch: 'conic-gradient(from 0deg,#f472b6,#38bdf8,#34d399,#fbbf24)' },
  glow_stroke: { glowClass: 'cg cg-stroke', swatch: 'linear-gradient(90deg,#f0abfc,#fce7f3)' },
  glow_warp: { glowClass: 'cg cg-warp', swatch: 'linear-gradient(90deg,#c7d2fe,#818cf8)' },
  glow_mirage: { glowClass: 'cg cg-mirage', swatch: 'linear-gradient(90deg,#fde68a,#fbbf24)' },
  glow_spectrum: { glowClass: 'cg cg-spectrum', swatch: 'linear-gradient(90deg,#ff5470,#38bdf8,#34d399)' },
  glow_nebula: { glowClass: 'cg cg-nebula', swatch: 'linear-gradient(70deg,#7c3aed,#db2777,#2563eb)' },
  glow_quantum: { glowClass: 'cg cg-quantum', swatch: 'linear-gradient(90deg,#fca5a5,#ef4444)' },
  glow_cosmos: { glowClass: 'cg cg-cosmos', swatch: 'linear-gradient(90deg,#f472b6,#38bdf8,#34d399,#fbbf24,#f472b6)' },

  // ── Profile backgrounds (original) ────────────────────────────────────────
  bg_nebula_violet: { bgClass: 'cbg cbg-nebula_violet', swatch: 'radial-gradient(circle at 30% 30%,#8b5cf6,#0d0221)' },
  bg_nebula_teal:   { bgClass: 'cbg cbg-nebula_teal',   swatch: 'radial-gradient(circle at 30% 30%,#2dd4bf,#041016)' },
  bg_deep_field:    { bgClass: 'cbg cbg-deep_field',    swatch: 'radial-gradient(circle at 60% 30%,#6366f1,#05070f)' },
  bg_supernova:     { bgClass: 'cbg cbg-supernova',     swatch: 'radial-gradient(circle at 50% 30%,#fbbf24,#0d0402)' },

  // ── Profile backgrounds (effect-based, animated scenes) ───────────────────
  bg_starfield:        { bgClass: 'cbg cbg-starfield',        swatch: 'radial-gradient(circle at 40% 40%,#e0f2fe,#05070f)' },
  bg_aurora_waves:     { bgClass: 'cbg cbg-aurora_waves',     swatch: 'linear-gradient(120deg,#34d399,#38bdf8,#a78bfa)' },
  bg_drifting_nebula:  { bgClass: 'cbg cbg-drifting_nebula',  swatch: 'radial-gradient(circle at 30% 30%,#d946ef,#07030f)' },
  bg_galaxy_spiral:    { bgClass: 'cbg cbg-galaxy_spiral',    swatch: 'conic-gradient(from 0deg,#2dd4bf,#8b5cf6,#05030d)' },
  bg_solar_wind:       { bgClass: 'cbg cbg-solar_wind',       swatch: 'linear-gradient(115deg,#38bdf8,#02070f)' },
  bg_pulsar_wave:      { bgClass: 'cbg cbg-pulsar_wave',      swatch: 'radial-gradient(circle,#38bdf8,#02070f)' },
  bg_meteor_rain:      { bgClass: 'cbg cbg-meteor_rain',      swatch: 'linear-gradient(215deg,#ffffff,#04040c)' },
  bg_cosmic_dawn:      { bgClass: 'cbg cbg-cosmic_dawn',      swatch: 'linear-gradient(160deg,#7c3aed,#db2777)' },
  bg_galaxy_core:      { bgClass: 'cbg cbg-galaxy_core',      swatch: 'radial-gradient(circle,#a855f7,#04030d)' },
  bg_supernova_burst:  { bgClass: 'cbg cbg-supernova_burst',  swatch: 'radial-gradient(circle,#fbbf24,#ef4444,#0d0402)' },
  bg_blackhole:        { bgClass: 'cbg cbg-blackhole',        swatch: 'radial-gradient(circle,#000000 40%,#fb923c)' },
  bg_event_horizon:    { bgClass: 'cbg cbg-event_horizon',    swatch: 'radial-gradient(circle,#05030a,#7c3aed)' },
  bg_wormhole:         { bgClass: 'cbg cbg-wormhole',         swatch: 'repeating-radial-gradient(circle,#312e81 0 8px,#0f172a 8px 16px)' },
  bg_darkmatter_web:   { bgClass: 'cbg cbg-darkmatter_web',   swatch: 'linear-gradient(60deg,#7c3aed,#04020c)' },
  bg_antimatter_field: { bgClass: 'cbg cbg-antimatter_field', swatch: 'radial-gradient(circle,#ef4444,#0a0203)' },
  bg_multiversal:      { bgClass: 'cbg cbg-multiversal',      swatch: 'linear-gradient(120deg,#f472b6,#38bdf8,#34d399,#fbbf24)' },
  // ── Profile backgrounds (effect-based, batch 2) ───────────────────────────
  bg_shooting_stars:   { bgClass: 'cbg cbg-shooting_stars',   swatch: 'linear-gradient(215deg,#ffffff,#05070f)' },
  bg_plasma_storm:     { bgClass: 'cbg cbg-plasma_storm',     swatch: 'radial-gradient(circle at 40% 40%,#38bdf8,#d946ef,#04030f)' },
  bg_ring_system:      { bgClass: 'cbg cbg-ring_system',      swatch: 'radial-gradient(circle,#fbbf24,#05040c)' },
  bg_ion_stream:       { bgClass: 'cbg cbg-ion_stream',       swatch: 'linear-gradient(0deg,#2dd4bf,#03040f)' },
  bg_crystal_cave:     { bgClass: 'cbg cbg-crystal_cave',     swatch: 'conic-gradient(from 0deg,#38bdf8,#e0f2fe,#3b82f6,#04070f)' },
  bg_quasar_beam:      { bgClass: 'cbg cbg-quasar_beam',      swatch: 'conic-gradient(from 0deg,#a78bfa,#60a5fa,#04030d)' },
  bg_galaxy_collision: { bgClass: 'cbg cbg-galaxy_collision', swatch: 'radial-gradient(circle at 30% 40%,#ec4899,#38bdf8,#04030c)' },
  bg_solar_corona:     { bgClass: 'cbg cbg-solar_corona',     swatch: 'radial-gradient(circle,#fde047,#f97316,#05040c)' },
  bg_gamma_burst:      { bgClass: 'cbg cbg-gamma_burst',      swatch: 'radial-gradient(circle,#a3e635,#84cc16,#04040c)' },
  bg_time_warp:        { bgClass: 'cbg cbg-time_warp',        swatch: 'repeating-radial-gradient(circle,#ec4899 0 6px,#12061f 6px 12px)' },
  // Profile backgrounds (effect-based, batch 3)
  bg_sunrise: { bgClass: 'cbg cbg-sunrise', swatch: 'linear-gradient(0deg,#f59e0b,#7c2d12,#0b0a1f)' },
  bg_moonrise: { bgClass: 'cbg cbg-moonrise', swatch: 'radial-gradient(circle at 50% 70%,#e2e8f0,#0b1120)' },
  bg_fireflies: { bgClass: 'cbg cbg-fireflies', swatch: 'radial-gradient(circle at 50% 60%,#0f2027,#050510)' },
  bg_bokeh: { bgClass: 'cbg cbg-bokeh', swatch: 'radial-gradient(circle at 40% 40%,#f0abfc,#0b0a1f)' },
  bg_tide: { bgClass: 'cbg cbg-tide', swatch: 'linear-gradient(90deg,#0ea5e9,#22d3ee,#0ea5e9)' },
  bg_grid: { bgClass: 'cbg cbg-grid', swatch: 'linear-gradient(0deg,#ec4899,#1e1b4b)' },
  bg_lightning: { bgClass: 'cbg cbg-lightning', swatch: 'linear-gradient(160deg,#1e293b,#020617)' },
  bg_snowfall: { bgClass: 'cbg cbg-snowfall', swatch: 'linear-gradient(0deg,#0b1120,#1e293b)' },
  bg_prism_rain: { bgClass: 'cbg cbg-prism_rain', swatch: 'linear-gradient(215deg,#f472b6,#38bdf8,#04040c)' },
  bg_smoke: { bgClass: 'cbg cbg-smoke', swatch: 'linear-gradient(0deg,#334155,#050510)' },
  bg_comet_orbit: { bgClass: 'cbg cbg-comet_orbit', swatch: 'radial-gradient(circle at 50% 50%,#5eead4,#04040c)' },
  bg_lava_field: { bgClass: 'cbg cbg-lava_field', swatch: 'linear-gradient(0deg,#7f1d1d,#f59e0b)' },
  bg_frost_grow: { bgClass: 'cbg cbg-frost_grow', swatch: 'radial-gradient(circle,#e0f2fe,#0b1120)' },
  bg_solar_eclipse: { bgClass: 'cbg cbg-solar_eclipse', swatch: 'radial-gradient(circle,#111827 45%,#fbbf24)' },
  bg_magnetar: { bgClass: 'cbg cbg-magnetar', swatch: 'conic-gradient(from 0deg,#38bdf8,#a78bfa,#04030d)' },
  bg_spaghetti: { bgClass: 'cbg cbg-spaghetti', swatch: 'linear-gradient(0deg,#7c3aed,#04030c)' },
  bg_lighthouse: { bgClass: 'cbg cbg-lighthouse', swatch: 'conic-gradient(from 0deg,#fde68a,#04030d,#fde68a,#04030d)' },
  bg_dark_flow: { bgClass: 'cbg cbg-dark_flow', swatch: 'linear-gradient(60deg,#4c1d95,#04020c)' },
  bg_annihilation: { bgClass: 'cbg cbg-annihilation', swatch: 'radial-gradient(circle,#fecaca,#ef4444,#0a0203)' },
  bg_omniverse: { bgClass: 'cbg cbg-omniverse', swatch: 'conic-gradient(from 0deg,#f472b6,#38bdf8,#34d399,#fbbf24,#f472b6)' },
};

/** CSS class for an equipped name-glow key (or '' if none). */
export function glowClassFor(key) {
  return (key && COSMETIC_RENDER[key] && COSMETIC_RENDER[key].glowClass) || '';
}

/** CSS class for an equipped background key (or '' if none). */
export function bgClassFor(key) {
  return (key && COSMETIC_RENDER[key] && COSMETIC_RENDER[key].bgClass) || '';
}

/** Read equipped cosmetics off a user's orbit sub-doc → { glowClass, bgClass }. */
export function equippedFromUser(user) {
  const c = (user && user.orbit && user.orbit.cosmetics) || {};
  return { glowClass: glowClassFor(c.nameGlow), bgClass: bgClassFor(c.background) };
}

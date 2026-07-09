/**
 * cosmeticsCatalog.js — the Stardust shop catalog + pure buy/equip reducers
 * (Orbit Engine, Tier 3). The REDUCERS stay pure (functions over a { stardust,
 * cosmetics } state) and unit-testable. The CATALOG DATA is now cache-backed:
 * DEFAULT_CATALOG below is the seed/fallback, and when the admin StoreItem
 * collection is non-empty it overlays the cache (loaded via refresh(), same
 * pattern as flagStore/configStore). An un-seeded install behaves EXACTLY as
 * before (cache == defaults), so the pure-reducer tests still pass with no DB.
 *
 * Render metadata (the CSS glow/gradient) lives on the FRONTEND
 * (cosmic/cosmetics.js) keyed by the same `key`; the server only owns the
 * economy (key, type, cost, ownership).
 */

// type: "name_glow" | "background". `rarity` keys match the frontend 15-tier
// ladder (cosmic/rarity.js); `category` groups items into the store tabs.
// This is the DEFAULT catalog — the seed + fallback when no StoreItem rows exist.
const DEFAULT_CATALOG = Object.freeze([
    // ── Name glows (Identity) ───────────────────────────────────────────────
    { key: "glow_aurora",   type: "name_glow", name: "Aurora Glow",    cost: 300,  hint: "Teal–green shimmer on your name",  rarity: "COSMIC",      category: "identity" },
    { key: "glow_ember",    type: "name_glow", name: "Ember Glow",     cost: 300,  hint: "Warm orange flicker",              rarity: "STELLAR",     category: "identity" },
    { key: "glow_plasma",   type: "name_glow", name: "Plasma Glow",    cost: 600,  hint: "Magenta–violet pulse",             rarity: "COSMIC",      category: "identity" },
    { key: "glow_gold",     type: "name_glow", name: "Solar Gold",     cost: 900,  hint: "Radiant gold",                     rarity: "HYPERNOVA",   category: "identity" },
    { key: "glow_void",     type: "name_glow", name: "Void Glow",      cost: 1200, hint: "Iridescent dark shimmer",          rarity: "SINGULARITY", category: "identity" },

    // ── Effect-based name glows (each a DISTINCT animation, not a recolor) ───
    { key: "glow_shimmer",     type: "name_glow", name: "Shimmer Sweep",           cost: 150,  hint: "A bright light bar sweeps across your name", rarity: "LUNAR",         category: "identity" },
    { key: "glow_neon",        type: "name_glow", name: "Neon Flicker",            cost: 300,  hint: "Buzzing broken-neon-sign flicker",          rarity: "STELLAR",       category: "identity" },
    { key: "glow_holo",        type: "name_glow", name: "Holographic Shift",       cost: 450,  hint: "Cycling holographic hue-shift",             rarity: "SOLAR",         category: "identity" },
    { key: "glow_solarflare",  type: "name_glow", name: "Solar Flare",             cost: 450,  hint: "Warm flares burst along your name",          rarity: "SOLAR",         category: "identity" },
    { key: "glow_glitch",      type: "name_glow", name: "Chromatic Glitch",        cost: 600,  hint: "RGB-split datamosh jitter",                 rarity: "NEBULAR",       category: "identity" },
    { key: "glow_comet",       type: "name_glow", name: "Comet Trail",             cost: 600,  hint: "A glowing trail streaks behind your name",   rarity: "NEBULAR",       category: "identity" },
    { key: "glow_frost",       type: "name_glow", name: "Frost Crystal",           cost: 750,  hint: "Crystalline frost refraction",              rarity: "ASTRAL",        category: "identity" },
    { key: "glow_ribbon",      type: "name_glow", name: "Aurora Ribbon",           cost: 900,  hint: "Flowing aurora ribbon of colour",           rarity: "CELESTIAL",     category: "identity" },
    { key: "glow_chrome",      type: "name_glow", name: "Liquid Chrome",           cost: 1100, hint: "Molten metallic highlight sweep",           rarity: "GALACTIC",      category: "identity" },
    { key: "glow_pulsar",      type: "name_glow", name: "Pulsar Beam",             cost: 1100, hint: "Rhythmic pulsar beam pulses",               rarity: "GALACTIC",      category: "identity" },
    { key: "glow_starlit",     type: "name_glow", name: "Starlit Sparkle",         cost: 1300, hint: "Twinkling starlight sparkles",              rarity: "COSMIC",        category: "identity" },
    { key: "glow_quasar",      type: "name_glow", name: "Quasar Jet",              cost: 1300, hint: "Bipolar quasar jets of light",              rarity: "COSMIC",        category: "identity" },
    { key: "glow_ion",         type: "name_glow", name: "Ion Surge",               cost: 1600, hint: "Crackling electric ion surges",             rarity: "HYPERNOVA",     category: "identity" },
    { key: "glow_blackcore",   type: "name_glow", name: "Black-Hole Core",         cost: 2000, hint: "Dark core with a warping light rim",         rarity: "BLACK_HOLE",    category: "identity" },
    { key: "glow_lensing",     type: "name_glow", name: "Event Lensing",           cost: 2400, hint: "Gravitational-lens halo ring",              rarity: "EVENT_HORIZON", category: "identity" },
    { key: "glow_singularity", type: "name_glow", name: "Singularity Pulse",       cost: 2800, hint: "Intense infinite-density pulse",             rarity: "SINGULARITY",   category: "identity" },
    { key: "glow_darkmatter",  type: "name_glow", name: "Dark Matter Field",       cost: 3400, hint: "Invisible-mass particle shimmer",            rarity: "DARK_MATTER",   category: "identity" },
    { key: "glow_antimatter",  type: "name_glow", name: "Antimatter Flare",        cost: 4000, hint: "Annihilation-grade reactive flares",         rarity: "ANTIMATTER",    category: "identity" },
    { key: "glow_multiversal", type: "name_glow", name: "Multiversal Iridescence", cost: 5000, hint: "Beyond-universe iridescent motion",          rarity: "MULTIVERSAL",   category: "identity" },

    // ── Effect-based name glows — batch 2 (each a DISTINCT animation) ────────
    { key: "glow_wave",     type: "name_glow", name: "Gravity Wave",   cost: 150,  hint: "Your name ripples like a passing gravity wave",  rarity: "LUNAR",         category: "identity" },
    { key: "glow_breathe",  type: "name_glow", name: "Stellar Breath", cost: 300,  hint: "A slow breathing pulse of light",              rarity: "STELLAR",       category: "identity" },
    { key: "glow_cascade",  type: "name_glow", name: "Colour Cascade", cost: 450,  hint: "A waterfall of colour flows down the letters",  rarity: "SOLAR",         category: "identity" },
    { key: "glow_lava",     type: "name_glow", name: "Molten Flow",    cost: 600,  hint: "Molten colour rises through your name",        rarity: "NEBULAR",       category: "identity" },
    { key: "glow_prism",    type: "name_glow", name: "Prism Shift",    cost: 750,  hint: "A prism splits your name through the spectrum", rarity: "ASTRAL",        category: "identity" },
    { key: "glow_toxic",    type: "name_glow", name: "Toxic Glow",     cost: 900,  hint: "A radioactive green flicker",                  rarity: "CELESTIAL",     category: "identity" },
    { key: "glow_sparks",   type: "name_glow", name: "Ember Sparks",   cost: 1100, hint: "Warm sparks dance around your name",           rarity: "GALACTIC",      category: "identity" },
    { key: "glow_flash",    type: "name_glow", name: "Nova Flash",     cost: 1600, hint: "Periodic overexposed nova flashes",            rarity: "HYPERNOVA",     category: "identity" },
    { key: "glow_echo",     type: "name_glow", name: "Temporal Echo",  cost: 2400, hint: "Ghost echoes ripple out from your name",       rarity: "EVENT_HORIZON", category: "identity" },
    { key: "glow_kaleido",  type: "name_glow", name: "Kaleidoscope",   cost: 5000, hint: "A full-spectrum kaleidoscopic flow",           rarity: "MULTIVERSAL",   category: "identity" },

    // Effect-based name glows - batch 3 (Part C)
    { key: "glow_focus", type: "name_glow", name: "Soft Focus", cost: 150, hint: "Your name drifts gently in and out of focus", rarity: "LUNAR", category: "identity" },
    { key: "glow_underline", type: "name_glow", name: "Underline Sweep", cost: 150, hint: "A light bar sweeps along an underline", rarity: "LUNAR", category: "identity" },
    { key: "glow_spread", type: "name_glow", name: "Letter Spread", cost: 300, hint: "The letters breathe apart and back", rarity: "STELLAR", category: "identity" },
    { key: "glow_typewriter", type: "name_glow", name: "Cursor Blink", cost: 300, hint: "A blinking terminal caret follows your name", rarity: "STELLAR", category: "identity" },
    { key: "glow_scan", type: "name_glow", name: "Scan Bar", cost: 450, hint: "A bright bar scans down the glyphs", rarity: "SOLAR", category: "identity" },
    { key: "glow_emboss", type: "name_glow", name: "Embossed", cost: 450, hint: "A rotating light source presses the letters", rarity: "SOLAR", category: "identity" },
    { key: "glow_marquee", type: "name_glow", name: "Marquee Lights", cost: 600, hint: "Running theatre-marquee bulbs", rarity: "NEBULAR", category: "identity" },
    { key: "glow_heartbeat", type: "name_glow", name: "Heartbeat", cost: 600, hint: "A double-thump pulse, lub-dub", rarity: "NEBULAR", category: "identity" },
    { key: "glow_wobble", type: "name_glow", name: "Jelly Wobble", cost: 750, hint: "Squashes and skews like jelly", rarity: "ASTRAL", category: "identity" },
    { key: "glow_static", type: "name_glow", name: "Static Noise", cost: 750, hint: "A TV-static grayscale shimmer", rarity: "ASTRAL", category: "identity" },
    { key: "glow_torch", type: "name_glow", name: "Torchlight", cost: 900, hint: "A warm flame flickers and rises", rarity: "CELESTIAL", category: "identity" },
    { key: "glow_volt", type: "name_glow", name: "High Voltage", cost: 1100, hint: "Electric-blue arcs crackle across", rarity: "GALACTIC", category: "identity" },
    { key: "glow_oil", type: "name_glow", name: "Oil Slick", cost: 1300, hint: "Iridescent oil-on-water conic sheen", rarity: "COSMIC", category: "identity" },
    { key: "glow_stroke", type: "name_glow", name: "Neon Outline", cost: 1600, hint: "A hollow neon-tube outline pulses", rarity: "HYPERNOVA", category: "identity" },
    { key: "glow_warp", type: "name_glow", name: "Gravity Warp", cost: 2000, hint: "The name tilts in 3D as light bends", rarity: "BLACK_HOLE", category: "identity" },
    { key: "glow_mirage", type: "name_glow", name: "Mirage", cost: 2400, hint: "A shimmering heat-haze waver", rarity: "EVENT_HORIZON", category: "identity" },
    { key: "glow_spectrum", type: "name_glow", name: "Spectrum Cycle", cost: 2800, hint: "Sweeps smoothly through every hue", rarity: "SINGULARITY", category: "identity" },
    { key: "glow_nebula", type: "name_glow", name: "Nebula Cloud", cost: 3400, hint: "A soft drifting multicolour cloud", rarity: "DARK_MATTER", category: "identity" },
    { key: "glow_quantum", type: "name_glow", name: "Quantum Flux", cost: 4000, hint: "Micro-jitter of an uncertain particle", rarity: "ANTIMATTER", category: "identity" },
    { key: "glow_cosmos", type: "name_glow", name: "Cosmic Symphony", cost: 5000, hint: "Flowing spectrum, bloom and gentle scale", rarity: "MULTIVERSAL", category: "identity" },


    // ── Profile backgrounds / nebulae (Themes) ──────────────────────────────
    { key: "bg_nebula_violet", type: "background", name: "Violet Nebula", cost: 400,  hint: "Deep violet profile cloud",   rarity: "STELLAR",   category: "themes" },
    { key: "bg_nebula_teal",   type: "background", name: "Teal Nebula",   cost: 400,  hint: "Cyan–teal profile cloud",     rarity: "STELLAR",   category: "themes" },
    { key: "bg_deep_field",    type: "background", name: "Deep Field",    cost: 700,  hint: "Distant galaxies",            rarity: "COSMIC",    category: "themes" },
    { key: "bg_supernova",     type: "background", name: "Supernova",     cost: 1500, hint: "Blazing core burst",          rarity: "HYPERNOVA", category: "themes" },

    // ── Effect-based backgrounds (layered ANIMATED scenes, not flat gradients) ─
    { key: "bg_starfield",        type: "background", name: "Twinkling Starfield",  cost: 150,  hint: "A field of softly twinkling stars",    rarity: "LUNAR",         category: "themes" },
    { key: "bg_aurora_waves",     type: "background", name: "Aurora Waves",         cost: 300,  hint: "Slow flowing aurora curtains",         rarity: "STELLAR",       category: "themes" },
    { key: "bg_drifting_nebula",  type: "background", name: "Drifting Nebula",      cost: 450,  hint: "Nebula clouds drift and swirl",        rarity: "SOLAR",         category: "themes" },
    { key: "bg_galaxy_spiral",    type: "background", name: "Galaxy Spiral",        cost: 600,  hint: "A slowly rotating spiral galaxy",      rarity: "NEBULAR",       category: "themes" },
    { key: "bg_solar_wind",       type: "background", name: "Solar Wind",           cost: 750,  hint: "Streaming solar-wind particles",       rarity: "ASTRAL",        category: "themes" },
    { key: "bg_pulsar_wave",      type: "background", name: "Pulsar Wave",          cost: 750,  hint: "Expanding pulsar shockwave rings",     rarity: "ASTRAL",        category: "themes" },
    { key: "bg_meteor_rain",      type: "background", name: "Meteor Rain",          cost: 900,  hint: "Meteors streak across the sky",        rarity: "CELESTIAL",     category: "themes" },
    { key: "bg_cosmic_dawn",      type: "background", name: "Cosmic Dawn",          cost: 1100, hint: "A shifting cosmic-dawn gradient",      rarity: "GALACTIC",      category: "themes" },
    { key: "bg_galaxy_core",      type: "background", name: "Galaxy Core",          cost: 1300, hint: "A glowing rotating galactic core",     rarity: "COSMIC",        category: "themes" },
    { key: "bg_supernova_burst",  type: "background", name: "Supernova Burst",      cost: 1600, hint: "A pulsing supernova detonation",       rarity: "HYPERNOVA",     category: "themes" },
    { key: "bg_blackhole",        type: "background", name: "Black-Hole Accretion", cost: 2000, hint: "A spinning accretion disk",            rarity: "BLACK_HOLE",    category: "themes" },
    { key: "bg_event_horizon",    type: "background", name: "Event Horizon",        cost: 2400, hint: "A lensing event-horizon ring",         rarity: "EVENT_HORIZON", category: "themes" },
    { key: "bg_wormhole",         type: "background", name: "Wormhole",             cost: 2800, hint: "A tunnelling wormhole warp",           rarity: "SINGULARITY",   category: "themes" },
    { key: "bg_darkmatter_web",   type: "background", name: "Dark-Matter Web",      cost: 3400, hint: "Pulsing dark-matter filament web",     rarity: "DARK_MATTER",   category: "themes" },
    { key: "bg_antimatter_field", type: "background", name: "Antimatter Field",     cost: 4000, hint: "A reactive antimatter energy field",   rarity: "ANTIMATTER",    category: "themes" },
    { key: "bg_multiversal",      type: "background", name: "Multiversal Field",    cost: 5000, hint: "Shifting beyond-universe iridescence", rarity: "MULTIVERSAL",   category: "themes" },
    // ── Effect-based backgrounds — batch 2 (distinct animated scenes) ────────
    { key: "bg_shooting_stars",   type: "background", name: "Shooting Stars",   cost: 150,  hint: "Occasional shooting stars streak past",    rarity: "LUNAR",       category: "themes" },
    { key: "bg_plasma_storm",     type: "background", name: "Plasma Storm",     cost: 300,  hint: "Churning multicolour plasma",             rarity: "STELLAR",     category: "themes" },
    { key: "bg_ring_system",      type: "background", name: "Ring System",      cost: 450,  hint: "A tilted planetary ring rotates",         rarity: "SOLAR",       category: "themes" },
    { key: "bg_ion_stream",       type: "background", name: "Ion Stream",       cost: 600,  hint: "Ion particles stream upward",             rarity: "NEBULAR",     category: "themes" },
    { key: "bg_crystal_cave",     type: "background", name: "Crystal Cave",     cost: 750,  hint: "Refracting crystalline facets",           rarity: "ASTRAL",      category: "themes" },
    { key: "bg_quasar_beam",      type: "background", name: "Quasar Beam",      cost: 900,  hint: "A rotating quasar beam sweeps around",    rarity: "CELESTIAL",   category: "themes" },
    { key: "bg_galaxy_collision", type: "background", name: "Galaxy Collision", cost: 1100, hint: "Two galactic cores spiral together",      rarity: "GALACTIC",    category: "themes" },
    { key: "bg_solar_corona",     type: "background", name: "Solar Corona",     cost: 1300, hint: "A breathing corona with slow flares",     rarity: "COSMIC",      category: "themes" },
    { key: "bg_gamma_burst",      type: "background", name: "Gamma Burst",      cost: 1600, hint: "Sharp gamma-ray bursts detonate",         rarity: "HYPERNOVA",   category: "themes" },
    { key: "bg_time_warp",        type: "background", name: "Time Warp",        cost: 2800, hint: "Space-time warps into a rotating tunnel", rarity: "SINGULARITY", category: "themes" },
    // Effect-based backgrounds - batch 3 (Part C)
    { key: "bg_sunrise", type: "background", name: "Cosmic Sunrise", cost: 150, hint: "A warm glow breathes up from the horizon", rarity: "LUNAR", category: "themes" },
    { key: "bg_moonrise", type: "background", name: "Moonrise", cost: 150, hint: "A soft luminous orb rises slowly", rarity: "LUNAR", category: "themes" },
    { key: "bg_fireflies", type: "background", name: "Fireflies", cost: 300, hint: "Soft dots drift and blink", rarity: "STELLAR", category: "themes" },
    { key: "bg_bokeh", type: "background", name: "Bokeh Drift", cost: 300, hint: "Large soft out-of-focus lights drift", rarity: "STELLAR", category: "themes" },
    { key: "bg_tide", type: "background", name: "Cosmic Tide", cost: 450, hint: "Gradient waves sweep side to side", rarity: "SOLAR", category: "themes" },
    { key: "bg_grid", type: "background", name: "Retro Grid", cost: 450, hint: "A neon grid scrolls toward the horizon", rarity: "SOLAR", category: "themes" },
    { key: "bg_lightning", type: "background", name: "Lightning Storm", cost: 600, hint: "Dark clouds flash with lightning", rarity: "NEBULAR", category: "themes" },
    { key: "bg_snowfall", type: "background", name: "Stardust Snow", cost: 600, hint: "Gentle stardust drifts down", rarity: "NEBULAR", category: "themes" },
    { key: "bg_prism_rain", type: "background", name: "Prism Rain", cost: 750, hint: "Diagonal rainbow streaks fall", rarity: "ASTRAL", category: "themes" },
    { key: "bg_smoke", type: "background", name: "Cosmic Smoke", cost: 750, hint: "Wispy plumes rise and dissipate", rarity: "ASTRAL", category: "themes" },
    { key: "bg_comet_orbit", type: "background", name: "Comet Orbit", cost: 900, hint: "A comet circles the frame", rarity: "CELESTIAL", category: "themes" },
    { key: "bg_lava_field", type: "background", name: "Lava Field", cost: 1100, hint: "Molten blobs bubble and rise", rarity: "GALACTIC", category: "themes" },
    { key: "bg_frost_grow", type: "background", name: "Frost Growth", cost: 1300, hint: "Crystalline frost creeps from the edges", rarity: "COSMIC", category: "themes" },
    { key: "bg_solar_eclipse", type: "background", name: "Solar Eclipse", cost: 1600, hint: "A dark disk crosses a bright corona", rarity: "HYPERNOVA", category: "themes" },
    { key: "bg_magnetar", type: "background", name: "Magnetar", cost: 2000, hint: "Rotating magnetic field lines", rarity: "BLACK_HOLE", category: "themes" },
    { key: "bg_spaghetti", type: "background", name: "Spaghettification", cost: 2400, hint: "Streaks stretch toward the centre", rarity: "EVENT_HORIZON", category: "themes" },
    { key: "bg_lighthouse", type: "background", name: "Pulsar Lighthouse", cost: 2800, hint: "Twin beams sweep like a lighthouse", rarity: "SINGULARITY", category: "themes" },
    { key: "bg_dark_flow", type: "background", name: "Dark Flow", cost: 3400, hint: "Faint filaments stream one way", rarity: "DARK_MATTER", category: "themes" },
    { key: "bg_annihilation", type: "background", name: "Annihilation Wave", cost: 4000, hint: "A bright wavefront expands and resets", rarity: "ANTIMATTER", category: "themes" },
    { key: "bg_omniverse", type: "background", name: "Omniverse", cost: 5000, hint: "Layered rainbow rotation and drift", rarity: "MULTIVERSAL", category: "themes" },
]);

// Back-compat: CATALOG remains the DEFAULT array (used by tests + as the seed).
const CATALOG = DEFAULT_CATALOG;

const TYPES = Object.freeze(["name_glow", "background"]);
// Which equipped-slot each type maps to on user.orbit.cosmetics.
const SLOT = Object.freeze({ name_glow: "nameGlow", background: "background" });

// ── Live catalog cache (defaults seed; StoreItem overlay via refresh) ─────────
// Defaults have no status → treated as "live". The cache holds ALL items (any
// status) so getItem resolves owned-but-archived items for equip; getLiveCatalog
// filters to purchasable ones for the shop.
const withStatus = (c) => ({ status: "live", discountPct: 0, ...c });
let _effective = DEFAULT_CATALOG.map(withStatus);
let _byKey = new Map(_effective.map((c) => [c.key, c]));

const getItem = (key) => _byKey.get(key) || null;

/** All cached items (admin view). */
function getAllCatalog() { return _effective.slice(); }

/** Purchasable items for the user shop: live + inside any availability window. */
function getLiveCatalog(now = Date.now()) {
    return _effective.filter((c) => {
        if (c.status && c.status !== "live") return false;
        if (c.availableFrom && new Date(c.availableFrom).getTime() > now) return false;
        if (c.availableTo && new Date(c.availableTo).getTime() < now) return false;
        return true;
    });
}

/** Rebuild the cache from an array of item-shaped rows (or reset to defaults). */
function _load(rows) {
    _effective = (rows && rows.length ? rows : DEFAULT_CATALOG).map(withStatus);
    _byKey = new Map(_effective.map((c) => [c.key, c]));
}

/** Refresh the cache from the StoreItem collection. Empty collection → defaults. */
async function refresh() {
    try {
        const StoreItem = require("../models/StoreItem");
        const rows = await StoreItem.find().sort({ sortOrder: 1, createdAt: 1 }).lean();
        _load(rows.map((r) => ({
            key: r.key, type: r.type, name: r.name, hint: r.hint, cost: r.cost,
            rarity: r.rarity, category: r.category, status: r.status,
            discountPct: r.discountPct || 0, stock: r.stock,
            availableFrom: r.availableFrom, availableTo: r.availableTo,
        })));
    } catch (_) { /* keep previous cache (defaults) */ }
}

let _timer = null;
/** Call once after DB connect. Loads the catalog, then refreshes every `ms`. */
function startAutoRefresh(ms = 15000) {
    refresh();
    if (_timer) clearInterval(_timer);
    _timer = setInterval(refresh, ms);
    if (_timer.unref) _timer.unref();
}

function normalizeCosmetics(c = {}) {
    return {
        owned: Array.isArray(c && c.owned) ? [...c.owned] : [],
        nameGlow: (c && c.nameGlow) || null,
        background: (c && c.background) || null,
    };
}

/**
 * applyPurchase — pure buy. Validates the key exists, isn't already owned, and
 * is affordable; on success returns new { stardust, cosmetics } with the item
 * added to `owned` and Stardust deducted.
 *
 * @returns {{ ok, reason?, stardust, cosmetics, item? }}
 */
function applyPurchase(state, key) {
    const item = getItem(key);
    const cosmetics = normalizeCosmetics(state.cosmetics);
    const stardust = state.stardust || 0;

    if (!item) return { ok: false, reason: "not_found", stardust, cosmetics };
    if (cosmetics.owned.includes(key)) return { ok: false, reason: "already_owned", stardust, cosmetics };
    if (stardust < item.cost) return { ok: false, reason: "insufficient", stardust, cosmetics };

    cosmetics.owned.push(key);
    return { ok: true, stardust: stardust - item.cost, cosmetics, item };
}

/**
 * applyEquip — pure equip/unequip. `key = null` clears the slot for `type`.
 * A non-null key must reference an owned item of the matching type.
 *
 * @returns {{ ok, reason?, cosmetics }}
 */
function applyEquip(state, type, key) {
    const cosmetics = normalizeCosmetics(state.cosmetics);
    if (!TYPES.includes(type)) return { ok: false, reason: "bad_type", cosmetics };
    const slot = SLOT[type];

    if (key == null) { cosmetics[slot] = null; return { ok: true, cosmetics }; } // unequip

    const item = getItem(key);
    if (!item || item.type !== type) return { ok: false, reason: "not_found", cosmetics };
    if (!cosmetics.owned.includes(key)) return { ok: false, reason: "not_owned", cosmetics };

    cosmetics[slot] = key;
    return { ok: true, cosmetics };
}

module.exports = {
    CATALOG, DEFAULT_CATALOG, TYPES, SLOT,
    getItem, getAllCatalog, getLiveCatalog, normalizeCosmetics, applyPurchase, applyEquip,
    refresh, startAutoRefresh,
};

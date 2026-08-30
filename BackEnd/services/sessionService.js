/**
 * sessionService.js — pure pricing + scheduling math for Orbit Sessions.
 *
 * Every export is a pure function of its inputs (no DB, no Date.now(), no
 * Math.random). The caller supplies the clock. This mirrors the pattern of
 * services/orbitEngine.js so the controller + worker + tests can all share
 * one source of truth.
 */

const configStore = require("./configStore");

const ALLOWED_DURATIONS_MIN = Object.freeze([30, 45, 60]);

// Snapshot the default platform cut here so the price calculator stays
// synchronous and pure. Live overrides come from configStore.
const DEFAULT_PLATFORM_CUT_PERCENT = 15;

/** readPlatformCutPercent — sync read of the live override or the default. */
function readPlatformCutPercent() {
    const v = configStore.get("sessions", "platformCutPercent");
    if (v == null) return DEFAULT_PLATFORM_CUT_PERCENT;
    const n = Number(v);
    if (!Number.isFinite(n) || n < 0 || n > 100) return DEFAULT_PLATFORM_CUT_PERCENT;
    return n;
}

/**
 * priceSession — pure price snapshot for a (rateInr, durationMin) pair.
 *  - totalInr       = round(rateInr * durationMin / 60)
 *  - platformCutPct = live override OR default 15
 *  - platformCutInr = floor(totalInr * pct/100)
 *  - mentorPayoutInr= totalInr - platformCutInr   (IMUTABLE after booking)
 */
function priceSession({ rateInr, durationMin, platformCutPct } = {}) {
    if (!Number.isFinite(rateInr) || rateInr < 0) throw new Error("rateInr must be a non-negative number");
    if (!ALLOWED_DURATIONS_MIN.includes(durationMin)) {
        throw new Error(`durationMin must be one of ${ALLOWED_DURATIONS_MIN.join(", ")}`);
    }
    const pct = Number.isFinite(platformCutPct) ? platformCutPct : readPlatformCutPercent();
    const totalInr = Math.round(rateInr * durationMin / 60);
    const platformCutInr = Math.floor(totalInr * pct / 100);
    const mentorPayoutInr = totalInr - platformCutInr;
    return { totalInr, platformCutPct: pct, platformCutInr, mentorPayoutInr };
}

/** allowedDurations — public list of valid session lengths. */
function allowedDurations() {
    return ALLOWED_DURATIONS_MIN.slice();
}

/**
 * buildRoomId — deterministic WebRTC room name for a session. PREFIXED with
 * `Session-` so the orbit session room is distinguishable from the free
 * `SkillSwap-…` call rooms (no collision even if the same two users call
 * each other twice in parallel via different flows).
 */
function buildRoomId(studentId, mentorId) {
    const crypto = require("crypto");
    const sorted = [String(studentId), String(mentorId)].sort();
    const hash = crypto.createHash("sha256").update(sorted.join("-")).digest("hex").slice(0, 12);
    return `Session-${hash}`;
}

/**
 * hasConflict — does the requested slot overlap any of the mentor's existing
 * BOOKED/CONFIRMED/LIVE sessions? Pure over the supplied list.
 *
 * The slot is `scheduledAt` (Date) + `durationMin`. The two windows overlap
 * when start1 < end2 AND start2 < end1.
 */
function hasConflict({ scheduledAt, durationMin, existing = [] } = {}) {
    if (!scheduledAt || !durationMin) return false;
    const start = scheduledAt instanceof Date ? scheduledAt.getTime() : new Date(scheduledAt).getTime();
    if (!Number.isFinite(start)) return false;
    const end = start + durationMin * 60 * 1000;
    for (const s of existing) {
        if (!s || !s.scheduledAt) continue;
        if (!["booked", "confirmed", "live"].includes(s.status)) continue;
        const sStart = new Date(s.scheduledAt).getTime();
        const sEnd = sStart + (s.durationMin || durationMin) * 60 * 1000;
        if (start < sEnd && sStart < end) return true;
    }
    return false;
}

/**
 * isWithinAvailability — does the requested slot fall in one of the mentor's
 * weekly availability windows? The mentor's `weekly` is an array of
 * { dayOfWeek, slots:[{ startUtcHour, durationMin }] }. Pure: the caller
 * passes `now` as a Date so tests can pin the clock.
 */
function isWithinAvailability({ scheduledAt, durationMin, availability, now = new Date() } = {}) {
    if (!availability || !Array.isArray(availability.weekly) || availability.weekly.length === 0) return true; // mentor opted out of gating
    const d = new Date(scheduledAt);
    if (Number.isNaN(d.getTime())) return false;
    // UTC weekday (0 = Sun) mapped to our 0 = Sun convention.
    const dow = d.getUTCDay();
    const startH = d.getUTCHours() + d.getUTCMinutes() / 60;
    const endH = startH + durationMin / 60;
    const day = availability.weekly.find((d2) => d2.dayOfWeek === dow);
    if (!day) return false;
    for (const slot of (day.slots || [])) {
        const s = slot.startUtcHour;
        const e = s + (slot.durationMin || 60) / 60;
        if (startH >= s && endH <= e) return true;
    }
    return false;
}

module.exports = {
    ALLOWED_DURATIONS_MIN,
    DEFAULT_PLATFORM_CUT_PERCENT,
    readPlatformCutPercent,
    priceSession,
    allowedDurations,
    buildRoomId,
    hasConflict,
    isWithinAvailability,
};

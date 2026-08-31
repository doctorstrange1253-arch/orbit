/**
 * signalFlareService.js — the Signal Flare chokepoint.
 *
 * Three responsibilities:
 *
 *   1. fireFlare(userId, { constellation, genre })
 *      Idempotent: if a flare for this (user, constellation, genre)
 *      already exists, returns it. Otherwise inserts a new row.
 *
 *   2. getCount(constellation, genre)
 *      The counter used by the Waiting Room. Counts active (un-
 *      responded) flares for the pair.
 *
 *   3. getQueue(constellation)
 *      Mentors-only: a grouped list of all active flares in a
 *      constellation, organized by genre. Powers the mentor's
 *      "demand" view (what genres are students waiting for?).
 *
 *   4. markResponded(constellation, genre, courseId)
 *      Called from courseController when a mentor publishes a course.
 *      Marks every active flare for (constellation, genre) as
 *      responded, returns the list of userIds that should be
 *      notified. Caller (the controller) emits the socket event.
 *
 * Public API: all four functions. Best-effort — a Flare failure never
 * breaks a course publish or a Waiting Room render.
 */

const SignalFlare = require("../models/SignalFlare");

// ── fireFlare ────────────────────────────────────────────────────────────
async function fireFlare(userId, { constellation, genre }) {
    const cleanCon = String(constellation).toLowerCase().trim();
    const cleanGenre = String(genre).toLowerCase().trim();
    try {
        // Upsert by (userId, constellation, genre). On a duplicate, the
        // existing row is returned unchanged (idempotent re-send).
        const flare = await SignalFlare.findOneAndUpdate(
            { userId, constellation: cleanCon, genre: cleanGenre },
            { $setOnInsert: { userId, constellation: cleanCon, genre: cleanGenre, sentAt: new Date() } },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        return flare;
    } catch (err) {
        console.warn("[flares] fireFlare failed:", err.message);
        return null;
    }
}

// ── getCount ────────────────────────────────────────────────────────────
async function getCount(constellation, genre) {
    try {
        return await SignalFlare.countDocuments({
            constellation: String(constellation).toLowerCase().trim(),
            genre: String(genre).toLowerCase().trim(),
            respondedCourseId: null,
        });
    } catch (err) {
        return 0;
    }
}

// ── getQueue ────────────────────────────────────────────────────────────
// Returns an array of { genre, count, userIds[] } for the constellation.
// Only counts active (un-responded) flares.
async function getQueue(constellation) {
    try {
        const cleanCon = String(constellation).toLowerCase().trim();
        const rows = await SignalFlare.find({
            constellation: cleanCon,
            respondedCourseId: null,
        }).select("genre userId sentAt").lean();

        // Group by genre.
        const byGenre = new Map();
        for (const r of rows) {
            if (!byGenre.has(r.genre)) byGenre.set(r.genre, { genre: r.genre, count: 0, userIds: [], recent: [] });
            const entry = byGenre.get(r.genre);
            entry.count += 1;
            entry.userIds.push(String(r.userId));
            if (entry.recent.length < 5) entry.recent.push(r.sentAt);
        }
        return Array.from(byGenre.values()).sort((a, b) => b.count - a.count);
    } catch (err) {
        return [];
    }
}

// ── markResponded ───────────────────────────────────────────────────────
// Called from courseController.publish. Returns the userIds that should
// be notified. The caller emits the socket event.
async function markResponded(constellation, genre, courseId) {
    try {
        const cleanCon = String(constellation).toLowerCase().trim();
        const cleanGenre = String(genre).toLowerCase().trim();
        const r = await SignalFlare.updateMany(
            { constellation: cleanCon, genre: cleanGenre, respondedCourseId: null },
            { $set: { respondedCourseId: courseId, respondedAt: new Date() } }
        );
        // Return the userIds of the flares we just marked.
        const rows = await SignalFlare.find({
            constellation: cleanCon,
            genre: cleanGenre,
            respondedCourseId: courseId,
        }).select("userId").lean();
        return rows.map((r) => String(r.userId));
    } catch (err) {
        console.warn("[flares] markResponded failed:", err.message);
        return [];
    }
}

module.exports = { fireFlare, getCount, getQueue, markResponded };

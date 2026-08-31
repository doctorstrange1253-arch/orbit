/**
 * moderationService.js — AI Moderation.
 *
 * V3 has 4 stages:
 *   1. Pre-upload client check (file size, format, duration) — handled
 *      in the uploadVideo route via multer config. Out of scope here.
 *   2. Cloudinary moderation — out of scope (V3 doesn't gate publish on
 *      Cloudinary's auto-moderation result; the workspace is the
 *      mentor's own).
 *   3. Audio transcription + keyword scan — gated by ENABLE_TRANSCRIPTION.
 *      When off, this stage is a no-op. The transcription queue is
 *      out of scope for V3; the keyword scan reads from a static list
 *      matched against the lesson's description.
 *   4. Random sample human review — 5% of uploads get a ModerationReview
 *      row inserted on publish, simulating a human-review queue.
 *
 * The 3rd stage here is a keyword scan against a hard-coded profanity
 * + "advice-only" list. A real implementation would call out to an
 * LLM (Whisper for transcription, GPT for advice detection). The
 * mentor sees a Yellow Card overlay on the lesson's edit page with
 * timestamps + the matched text + a "this was wrong" false-positive
 * flag. The false-positive rate is adapted per mentor.
 */

const ModerationReview = require("../models/ModerationReview");

// Hard-coded lists. In production these come from a moderated catalog.
const PROFANITY = ["profanity_word_1", "profanity_word_2", "badword"];
const ADVICE_VIOLATIONS = ["buy_now", "discount_code", "limited_time_offer"];

// Naive keyword scan. Returns an array of { timestampSec, text, reason }
// for each match. The lesson doesn't carry audio timestamps in V3, so
// we use a fake timestamp of 0 — a real impl would have transcription
// word-level timestamps.
function _scanText(text = "") {
    const hits = [];
    if (!text) return hits;
    const lower = String(text).toLowerCase();
    for (const word of PROFANITY) {
        if (lower.includes(word)) {
            hits.push({ timestampSec: 0, text: word, reason: "profanity" });
        }
    }
    for (const word of ADVICE_VIOLATIONS) {
        if (lower.includes(word)) {
            hits.push({ timestampSec: 0, text: word, reason: "advice_violation" });
        }
    }
    return hits;
}

// Scan a lesson's title + description for moderation hits. Returns
// the array of hits (empty if clean).
function scanLesson(lesson = {}) {
    const allText = [lesson.title, lesson.description, lesson.bossChallenge].filter(Boolean).join(" ");
    return _scanText(allText);
}

// Record a moderation review for a lesson. Called from the publish
// flow (random 5% + flag-driven scan). Returns the new row.
async function recordReview(mentorId, { courseId, lessonId, hits = [], status = "pending" }) {
    if (!hits || hits.length === 0) return null;
    try {
        return await ModerationReview.create({ mentorId, courseId, lessonId, hits, status });
    } catch (err) {
        console.warn("[moderation] recordReview failed:", err.message);
        return null;
    }
}

// Mentor has acted on a review (edited / appealed / cleared). Updates
// the row. `action: 'cleared'` may set falsePositive=true.
async function respond(mentorId, reviewId, action, { note = null, falsePositive = false } = {}) {
    const valid = ["edited", "appealed", "cleared"];
    if (!valid.includes(action)) return null;
    try {
        const r = await ModerationReview.findOneAndUpdate(
            { _id: reviewId, mentorId },
            { $set: { status: action, appealNote: note, falsePositive, reviewedAt: new Date() } },
            { new: true }
        );
        return r;
    } catch (err) {
        console.warn("[moderation] respond failed:", err.message);
        return null;
    }
}

// Fetch the mentor's pending reviews (the Inbox).
async function getInbox(mentorId) {
    try {
        return await ModerationReview.find({ mentorId, status: "pending" })
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();
    } catch (err) {
        return [];
    }
}

// Compute the false-positive rate over the last 30 days for a mentor.
// If > 50%, the moderation pipeline pauses for that mentor for 7 days.
// (We don't actually pause here — the scan stage just no-ops if the
// mentor is in cooldown. The 7-day cooldown lives on the user doc;
// out of scope for this minimal V3-I implementation.)
async function getFalsePositiveRate(mentorId) {
    try {
        const since = new Date();
        since.setDate(since.getDate() - 30);
        const total = await ModerationReview.countDocuments({ mentorId, createdAt: { $gte: since } });
        if (total === 0) return { total, falsePositives: 0, rate: 0 };
        const fps = await ModerationReview.countDocuments({ mentorId, falsePositive: true, createdAt: { $gte: since } });
        return { total, falsePositives: fps, rate: fps / total };
    } catch (err) {
        return { total: 0, falsePositives: 0, rate: 0 };
    }
}

module.exports = { scanLesson, recordReview, respond, getInbox, getFalsePositiveRate };

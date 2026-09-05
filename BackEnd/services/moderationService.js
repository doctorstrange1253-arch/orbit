const ModerationReview = require("../models/ModerationReview");

const PROFANITY = ["profanity_word_1", "profanity_word_2", "badword"];
const ADVICE_VIOLATIONS = ["buy_now", "discount_code", "limited_time_offer"];

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

function scanLesson(lesson = {}) {
    const allText = [lesson.title, lesson.description, lesson.bossChallenge].filter(Boolean).join(" ");
    return _scanText(allText);
}

async function recordReview(mentorId, { courseId, lessonId, hits = [], status = "pending" }) {
    if (!hits || hits.length === 0) return null;
    try {
        return await ModerationReview.create({ mentorId, courseId, lessonId, hits, status });
    } catch (err) {
        console.warn("[moderation] recordReview failed:", err.message);
        return null;
    }
}

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

async function getInbox(mentorId) {
    try {
        const rows = await ModerationReview.find({ mentorId, status: "pending" })
            .sort({ createdAt: -1 })
            .limit(50)
            .populate({ path: "courseId", select: "title lessons._id lessons.title" })
            .lean();

        return rows.map((r) => {
            const course = r.courseId && typeof r.courseId === "object" ? r.courseId : null;
            const lesson = course?.lessons?.find((l) => String(l._id) === String(r.lessonId)) || null;
            return {
                ...r,
                courseId: course ? course._id : r.courseId,
                courseTitle: course?.title || null,
                lessonTitle: lesson?.title || null,
            };
        });
    } catch (err) {
        return [];
    }
}

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

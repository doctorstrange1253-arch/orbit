/**
 * knowledgeGraphService.js — the user's slice of the cross-course Knowledge Graph.
 *
 * Three responsibilities:
 *
 *   1. recordTouch(userId, lessonId)
 *      Called from courseController.completeLesson after every lesson
 *      completion. Reads the lesson's LessonConcept rows, increments the
 *      user's per-concept mastery (capped at 10), and bumps the concept
 *      "last touched" timestamp. Idempotent in the sense that re-
 *      completing the same lesson re-applies the weight (we don't
 *      track per-user-per-lesson dedup because re-watching a lesson
 *      is a legitimate refresher).
 *
 *   2. getMyConcepts(userId, limit)
 *      Returns the user's top-N concepts by mastery, with the related
 *      concept edges the Skill Map (V3-E) needs to draw lines.
 *
 *   3. getMyMastery(userId, conceptSlug)
 *      Returns the user's mastery bar for a single concept.
 *
 *   4. getConceptPath(userId)
 *      Returns the user's strongest cluster of concepts (3-5 concepts
 *      that are mutually related and high-mastery). Used by the Skill
 *      Map to render a "path" — the user's strongest area.
 *
 * Storage: per-user mastery is kept inline on `User.gameology.conceptMastery`
 * (a Map<slug, { score, lastTouchedAt, courses[] }>). We don't use a
 * separate collection because the data is small and the per-user
 * aggregation is fast.
 *
 * Public API: all four functions. Best-effort: a knowledge-graph
 * failure never breaks a lesson completion.
 */

const User = require("../models/user");
const LessonConcept = require("../models/LessonConcept");
const Concept = require("../models/Concept");

// Mastery cap per concept (a single concept's score can't exceed this).
const MASTERY_CAP = 10;

/**
 * Record that `userId` touched all the concepts attached to `lessonId`.
 * Idempotent against the lesson itself (re-completing the same lesson
 * re-applies the weight; this is intentional — refreshers count).
 *
 * @param {string|ObjectId} userId
 * @param {string|ObjectId} lessonId
 * @param {string|ObjectId} [courseId]  optional — the caller usually has it
 * @returns {Promise<{ touched: Array<{slug, delta, newScore}> }>}
 */
async function recordTouch(userId, lessonId, courseId) {
    try {
        const rows = await LessonConcept.find({ lessonId }).lean();
        if (!rows.length) return { touched: [] };

        const user = await User.findById(userId).select("gameology.conceptMastery").lean();
        if (!user) return { touched: [] };
        const mastery = user.gameology?.conceptMastery || {};

        const touched = [];
        for (const row of rows) {
            const slug = row.conceptSlug;
            const prev = mastery[slug] || { score: 0, lastTouchedAt: null, courses: [] };
            const newScore = Math.min(MASTERY_CAP, (prev.score || 0) + (row.weight || 5));
            const courses = Array.isArray(prev.courses) ? prev.courses : [];
            if (courseId && !courses.find((c) => String(c) === String(courseId))) {
                courses.push(courseId);
            }
            mastery[slug] = {
                score: newScore,
                lastTouchedAt: new Date(),
                courses,
            };
            touched.push({ slug, delta: row.weight || 5, newScore });
        }

        await User.updateOne(
            { _id: userId },
            { $set: { "gameology.conceptMastery": mastery } }
        );
        return { touched };
    } catch (err) {
        console.warn("[kg] recordTouch failed:", err.message);
        return { touched: [] };
    }
}

/**
 * Top-N concepts the user has touched, sorted by mastery desc.
 * Each entry includes the related concept slugs so the Skill Map can
 * draw lines without a second round-trip.
 *
 * @param {string} userId
 * @param {number} limit
 * @returns {Promise<Array<{slug, label, category, score, lastTouchedAt, relatedSlugs[]}>>}
 */
async function getMyConcepts(userId, limit = 30) {
    try {
        const user = await User.findById(userId).select("gameology.conceptMastery").lean();
        const mastery = user?.gameology?.conceptMastery || {};
        const slugs = Object.keys(mastery);
        if (!slugs.length) return [];

        const concepts = await Concept.find({ slug: { $in: slugs } }).lean();
        const conceptBySlug = new Map(concepts.map((c) => [c.slug, c]));

        const out = slugs
            .map((slug) => {
                const c = conceptBySlug.get(slug);
                const m = mastery[slug];
                return {
                    slug,
                    label: c?.label || slug,
                    category: c?.category || "general",
                    description: c?.description || "",
                    score: m.score || 0,
                    lastTouchedAt: m.lastTouchedAt,
                    relatedSlugs: c?.relatedConceptSlugs || [],
                };
            })
            .sort((a, b) => b.score - a.score || (b.lastTouchedAt || 0) - (a.lastTouchedAt || 0))
            .slice(0, Math.max(1, Math.min(100, limit)));

        return out;
    } catch (err) {
        console.warn("[kg] getMyConcepts failed:", err.message);
        return [];
    }
}

/**
 * Mastery bar for a single concept. 0..MASTERY_CAP.
 */
async function getMyMastery(userId, conceptSlug) {
    try {
        const user = await User.findById(userId).select("gameology.conceptMastery").lean();
        const m = user?.gameology?.conceptMastery?.[conceptSlug];
        return {
            slug: conceptSlug,
            score: m?.score || 0,
            cap: MASTERY_CAP,
            lastTouchedAt: m?.lastTouchedAt || null,
        };
    } catch (err) {
        console.warn("[kg] getMyMastery failed:", err.message);
        return { slug: conceptSlug, score: 0, cap: MASTERY_CAP, lastTouchedAt: null };
    }
}

/**
 * The user's strongest cluster of concepts (3-5 mutually-related,
 * high-mastery). Used by the Skill Map to render a "path".
 *
 * Algorithm (greedy):
 *   1. Take the user's top 5 concepts by mastery.
 *   2. Walk each concept's relatedSlugs, looking for siblings in the
 *      user's top set. A concept whose related list intersects with
 *      N other top concepts gets a +N bonus.
 *   3. Return the top 3-5 concepts by (mastery + related-bonus).
 */
async function getConceptPath(userId) {
    try {
        const top = await getMyConcepts(userId, 5);
        if (top.length === 0) return [];
        const topSlugs = new Set(top.map((c) => c.slug));
        const scored = top.map((c) => {
            const related = (c.relatedSlugs || []).filter((s) => topSlugs.has(s) && s !== c.slug);
            return {
                ...c,
                clusterScore: c.score + related.length * 2,  // each related link is a +2 boost
            };
        });
        scored.sort((a, b) => b.clusterScore - a.clusterScore);
        return scored.slice(0, Math.min(5, scored.length));
    } catch (err) {
        console.warn("[kg] getConceptPath failed:", err.message);
        return [];
    }
}

module.exports = {
    MASTERY_CAP,
    recordTouch,
    getMyConcepts,
    getMyMastery,
    getConceptPath,
    getMySkillMap,
    getPublicSkillMap,
};

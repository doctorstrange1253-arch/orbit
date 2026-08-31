/**
 * knowledgeGraphRoutes.js — mount at /api/knowledge.
 *
 * Endpoints:
 *   GET /me                      — top concepts for the logged-in user (mastery bars)
 *   GET /me/path                 — the user's strongest cluster (Skill Map's "path")
 *   GET /me/skill-map            — full Skill Map data (stars + edges) for the logged-in user
 *   GET /:userId/skill-map       — public variant for the shareable Skill Map URL
 *   GET /concepts                — catalog of all public concepts (read-only)
 *   GET /concepts/:slug          — single concept (read-only)
 *   GET /concepts/:slug/mastery  — the caller's mastery bar for one concept
 *
 * All endpoints are read-only except the implicit `recordTouch` write
 * (which is fired server-side from courseController.completeLesson).
 * The user never writes to the Knowledge Graph directly — they
 * "touch" concepts by completing lessons.
 */

const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Concept = require("../models/Concept");
const {
    getMyConcepts,
    getMyMastery,
    getConceptPath,
    getMySkillMap,
    getPublicSkillMap,
} = require("../services/knowledgeGraphService");

// Top concepts for the caller.
router.get("/me", auth, async (req, res) => {
    try {
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 30));
        const items = await getMyConcepts(req.user._id, limit);
        return res.json({ items });
    } catch (e) {
        return res.status(500).json({ message: "Failed to load concepts" });
    }
});

// Strongest cluster (the "path" the Skill Map draws).
router.get("/me/path", auth, async (req, res) => {
    try {
        const items = await getConceptPath(req.user._id);
        return res.json({ items });
    } catch (e) {
        return res.status(500).json({ message: "Failed to load concept path" });
    }
});

// Full Skill Map data (stars + edges) for the caller. Used by /skill-map.
router.get("/me/skill-map", auth, async (req, res) => {
    try {
        const data = await getMySkillMap(req.user._id);
        return res.json(data);
    } catch (e) {
        return res.status(500).json({ message: "Failed to load skill map" });
    }
});

// Public Skill Map (the shareable URL /skill-map/:userId). Returns the
// same shape minus private fields.
router.get("/:userId/skill-map", async (req, res) => {
    try {
        const data = await getPublicSkillMap(req.params.userId);
        if (!data) return res.status(404).json({ message: "Skill map not found" });
        return res.json(data);
    } catch (e) {
        return res.status(500).json({ message: "Failed to load skill map" });
    }
});

// Catalog read — used by mentors in the CourseBuilder to attach
// concepts to a lesson.
router.get("/concepts", async (req, res) => {
    try {
        const category = req.query.category;
        const filter = { isPublic: true };
        if (category) filter.category = category;
        const items = await Concept.find(filter)
            .sort({ category: 1, label: 1 })
            .limit(Math.min(500, parseInt(req.query.limit, 10) || 200))
            .lean();
        return res.json({ items });
    } catch (e) {
        return res.status(500).json({ message: "Failed to load concepts" });
    }
});

router.get("/concepts/:slug", async (req, res) => {
    try {
        const c = await Concept.findOne({ slug: req.params.slug, isPublic: true }).lean();
        if (!c) return res.status(404).json({ message: "Concept not found" });
        return res.json(c);
    } catch (e) {
        return res.status(500).json({ message: "Failed to load concept" });
    }
});

router.get("/concepts/:slug/mastery", auth, async (req, res) => {
    try {
        const m = await getMyMastery(req.user._id, req.params.slug);
        return res.json(m);
    } catch (e) {
        return res.status(500).json({ message: "Failed to load mastery" });
    }
});

module.exports = router;

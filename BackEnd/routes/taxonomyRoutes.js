const express = require("express");
const taxonomy = require("../data/taxonomy");
const Course = require("../models/Course");
const MentorProfile = require("../models/MentorProfile");

const router = express.Router();

router.get("/", (req, res) => {
    res.json({
        stats: taxonomy.STATS,
        constellations: taxonomy.CONSTELLATIONS.map((c) => ({
            slug: c.slug,
            label: c.label,
            blurb: c.blurb,
            genreCount: c.genreCount,
            topicCount: c.genreSlugs.reduce((n, gs) => n + taxonomy.genre(gs).topicCount, 0),
        })),
    });
});

router.get("/tree", (req, res) => {
    res.json({ stats: taxonomy.STATS, constellations: taxonomy.tree() });
});

router.get("/search", (req, res) => {
    const limit = Math.min(60, parseInt(req.query.limit, 10) || 30);
    res.json({ items: taxonomy.searchTopics(req.query.q, limit) });
});

router.get("/constellation/:slug", (req, res) => {
    const c = taxonomy.constellation(req.params.slug);
    if (!c) return res.status(404).json({ message: "Unknown constellation" });
    res.json({
        ...c,
        genres: c.genreSlugs.map((gs) => {
            const g = taxonomy.genre(gs);
            return { ...g, topics: g.topicSlugs.map((ts) => taxonomy.topic(ts)) };
        }),
    });
});

router.get("/genre/:slug", async (req, res) => {
    const g = taxonomy.genre(req.params.slug);
    if (!g) return res.status(404).json({ message: "Unknown genre" });
    const [courseCount, mentorCount] = await Promise.all([
        Course.countDocuments({ category: g.slug, isPublished: true }),
        MentorProfile.countDocuments({
            applicationStatus: "approved",
            status: "active",
            $or: [{ genres: g.slug }, { topics: { $in: g.topicSlugs } }],
        }),
    ]);
    res.json({
        ...g,
        topics: g.topicSlugs.map((ts) => taxonomy.topic(ts)),
        courseCount,
        mentorCount,
    });
});

router.get("/topic/:slug", (req, res) => {
    const t = taxonomy.topic(req.params.slug);
    if (!t) return res.status(404).json({ message: "Unknown topic" });
    res.json(t);
});

module.exports = router;

/**
 * moderationRoutes.js — /api/moderation
 *
 * Mentor-only endpoints for the Moderation Inbox + Yellow Card flow.
 *
 *   GET  /me              — list the mentor's pending reviews
 *   POST /:id/respond     — mark a review as edited / appealed / cleared
 *   GET  /me/fp-rate      — the false-positive rate (for transparency)
 */

const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { respond, getInbox, getFalsePositiveRate } = require("../services/moderationService");

router.get("/me", auth, async (req, res) => {
    try {
        const items = await getInbox(req.user._id);
        return res.json({ items });
    } catch (e) {
        return res.status(500).json({ message: "Failed to load inbox" });
    }
});

router.post("/:id/respond", auth, async (req, res) => {
    try {
        const { action, note, falsePositive } = req.body || {};
        const r = await respond(req.user._id, req.params.id, action, { note, falsePositive: !!falsePositive });
        if (!r) return res.status(404).json({ message: "Review not found" });
        return res.json(r);
    } catch (e) {
        return res.status(500).json({ message: "Failed to respond" });
    }
});

router.get("/me/fp-rate", auth, async (req, res) => {
    try {
        const data = await getFalsePositiveRate(req.user._id);
        return res.json(data);
    } catch (e) {
        return res.status(500).json({ message: "Failed to compute FP rate" });
    }
});

module.exports = router;

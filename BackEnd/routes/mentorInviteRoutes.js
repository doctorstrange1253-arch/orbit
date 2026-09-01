/**
 * mentorInviteRoutes.js — /api/mentor-invites
 *
 * V3 cross-soul economy: the signed-in user's pending "consider
 * teaching?" invite (drives MentorInviteModal) + their accept/dismiss
 * response. A dismiss applies the 90-day cooldown server-side via
 * crossSoulService.respond().
 *
 *   GET  /pending  — the most recent pending invite (or { invite: null })
 *   POST /respond  — { kind, action: "accepted" | "dismissed" }
 */

const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { pendingInvite, respond } = require("../services/crossSoulService");

router.get("/pending", auth, async (req, res) => {
    try {
        const invite = await pendingInvite(req.user._id);
        return res.json({ invite });
    } catch (e) {
        return res.status(500).json({ message: "Failed to load invite" });
    }
});

router.post("/respond", auth, async (req, res) => {
    try {
        const { kind, action } = req.body || {};
        if (!kind || !["accepted", "dismissed"].includes(action)) {
            return res.status(400).json({ message: "kind and a valid action (accepted|dismissed) are required" });
        }
        await respond(req.user._id, kind, action);
        return res.json({ ok: true });
    } catch (e) {
        return res.status(500).json({ message: "Failed to record response" });
    }
});

module.exports = router;

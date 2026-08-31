/**
 * signalFlareRoutes.js — mount at /api/flares.
 *
 * Endpoints:
 *   POST /api/flares                       — fire a flare
 *   GET  /api/flares/count?constellation=&genre=  — counter (public, used by the Waiting Room)
 *   GET  /api/flares/me                     — list the caller's flares
 *   GET  /api/flares/queue?constellation=  — mentor scan (mentor-only): all
 *                                             active flares in a constellation,
 *                                             grouped by genre
 *
 * When a course is published in a genre that has matching flares, the
 * courseController (via the shared signalFlareService) marks those flares
 * as responded and emits a socket event so the client can play the
 * Planet Materialization animation + show a notification.
 */

const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const SignalFlare = require("../models/SignalFlare");
const { fireFlare, getCount, getQueue } = require("../services/signalFlareService");

// Fire a flare. Idempotent per (userId, constellation, genre): the
// second call returns the existing flare.
router.post("/", auth, async (req, res) => {
    try {
        const { constellation, genre } = req.body || {};
        if (!constellation || !genre) {
            return res.status(400).json({ message: "constellation and genre are required" });
        }
        const flare = await fireFlare(req.user._id, { constellation, genre });
        const count = await getCount(constellation, genre);
        return res.json({ flare, count });
    } catch (e) {
        console.error("[flares] POST failed:", e);
        return res.status(500).json({ message: "Failed to send flare" });
    }
});

// Public counter — the Waiting Room shows "X students are waiting."
router.get("/count", async (req, res) => {
    try {
        const { constellation, genre } = req.query;
        if (!constellation || !genre) {
            return res.status(400).json({ message: "constellation and genre are required" });
        }
        const count = await getCount(constellation, genre);
        return res.json({ constellation, genre, count });
    } catch (e) {
        return res.status(500).json({ message: "Failed to count flares" });
    }
});

// Caller's active flares (for the "you've sent N flares" stat on Pulse).
router.get("/me", auth, async (req, res) => {
    try {
        const flares = await SignalFlare.find({ userId: req.user._id })
            .sort({ sentAt: -1 })
            .limit(Math.min(200, parseInt(req.query.limit, 10) || 50))
            .lean();
        return res.json({ items: flares });
    } catch (e) {
        return res.status(500).json({ message: "Failed to load flares" });
    }
});

// Mentor-only scan: queue of all active (un-responded) flares in a
// constellation, grouped by genre. Used in the mentor's "demand" view.
router.get("/queue", auth, async (req, res) => {
    try {
        const { constellation } = req.query;
        if (!constellation) return res.status(400).json({ message: "constellation is required" });
        const queue = await getQueue(constellation);
        return res.json({ constellation, items: queue });
    } catch (e) {
        return res.status(500).json({ message: "Failed to load flare queue" });
    }
});

module.exports = router;

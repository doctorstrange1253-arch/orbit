/**
 * pactController.js — read surface for the Mentor Pact.
 *
 * Mentor-only. Like `gameologyController`, mutations are owned by
 * `services/pactService` (called from courseController, sessionsController,
 * etc.). This file just exposes the read API for the Pact Hall / Pulse /
 * Rival Watch / History UIs.
 */

const User = require("../models/user");
const pact = require("../services/pactService");

// ── Helpers ──────────────────────────────────────────────────────────────
function publicShape(u) {
    if (!u) return null;
    const p = u.pact || {};
    return {
        _id: String(u._id),
        name: u.name,
        avatar: u.avatar,
        cosmicName: u.cosmic?.name,
        headline: u.headline,
        pact: {
            divisionId: p.divisionId,
            groupId: p.groupId,
            weekScore: p.weekScore || 0,
            weekId: p.weekId,
            lastResult: p.lastResult,
            highestDivisionId: p.highestDivisionId,
            steadyShieldWeeks: p.steadyShieldWeeks || 0,
        },
    };
}

function pickContextTone(rank) {
    if (!rank || !rank.rank) return "neutral";
    if (rank.inPromotionZone) return "encourage";
    if (rank.inRelegationZone) return "caution";
    return "steady";
}

function pulseMessage(tone, rank, mentorName) {
    const name = mentorName || "Mentor";
    const left = rank?.daysLeftInWeek ?? 7;
    switch (tone) {
        case "encourage":
            return `${name}, you're rank ${rank.rank}/${rank.groupSize} in ${rank.divisionId} — top ${pact.PROMOTE_ZONE} promote. ${left} days left. A 5-star session could move you 3 ranks.`;
        case "caution":
            return `${name}, you're in the bottom ${pact.RELEGATE_ZONE} of ${rank.divisionId}. ${left} days left. One solid session can move you to safety — you've got this.`;
        case "steady":
            return `${name}, you're safe at rank ${rank.rank}/${rank.groupSize} in ${rank.divisionId}. ${left} days left. Hold the line.`;
        default:
            return `${name}, the Pact Pulse will arrive mid-week once the week settles.`;
    }
}

// ── Endpoints ────────────────────────────────────────────────────────────
exports.getMe = async (req, res) => {
    try {
        const me = await User.findById(req.user.id)
            .select("name avatar cosmic headline pact")
            .lean();
        if (!me) return res.status(404).json({ message: "User not found" });
        const rank = await pact.getMyRank(req.user.id);
        return res.json({ ...publicShape(me), rank });
    } catch (err) {
        console.error("pact.getMe:", err);
        res.status(500).json({ message: "Server error" });
    }
};

exports.getHall = async (req, res) => {
    try {
        const result = await pact.getMyGroupAndRank(req.user.id);
        if (!result) return res.status(404).json({ message: "User not found" });
        return res.json({
            weekId: result.weekId,
            groupId: result.groupId,
            myRank: result.myRank,
            items: result.group.map((u, i) => ({
                ...publicShape(u),
                rank: i + 1,
                isMe: String(u._id) === String(req.user.id),
            })),
        });
    } catch (err) {
        console.error("pact.getHall:", err);
        res.status(500).json({ message: "Server error" });
    }
};

exports.getRivals = async (req, res) => {
    try {
        const rivals = await pact.getRivals(req.user.id);
        return res.json({ items: rivals });
    } catch (err) {
        console.error("pact.getRivals:", err);
        res.status(500).json({ message: "Server error" });
    }
};

exports.getHistory = async (req, res) => {
    try {
        const { limit = 12 } = req.query;
        const items = await pact.getMyHistory(req.user.id, parseInt(limit, 10) || 12);
        return res.json({ items });
    } catch (err) {
        console.error("pact.getHistory:", err);
        res.status(500).json({ message: "Server error" });
    }
};

exports.getPulse = async (req, res) => {
    try {
        const rank = await pact.getMyRank(req.user.id);
        const me = await User.findById(req.user.id).select("name pact").lean();
        if (!me) return res.status(404).json({ message: "User not found" });
        const tone = pickContextTone(rank);
        const seen = !!me.pact?.pulseSeenWeek || me.pact?.pulseSeenWeek === rank?.weekId;
        return res.json({
            tone,
            message: pulseMessage(tone, rank, me.name),
            rank,
            seen,
            weekId: rank?.weekId,
        });
    } catch (err) {
        console.error("pact.getPulse:", err);
        res.status(500).json({ message: "Server error" });
    }
};

exports.markPulseSeen = async (req, res) => {
    try {
        const me = await User.findById(req.user.id).select("pact").lean();
        if (!me) return res.status(404).json({ message: "User not found" });
        const weekId = me.pact?.weekId || pact.isoWeek();
        await User.updateOne(
            { _id: req.user.id },
            { $set: { "pact.pulseSeenWeek": weekId } }
        );
        return res.json({ ok: true, weekId });
    } catch (err) {
        console.error("pact.markPulseSeen:", err);
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * gameologyController.js — read-mostly surface for the student's Gameology.
 *
 * The mutation side is owned by `services/gameologyService` (called from
 * courseController, sessionsController, connectionController, etc.). This
 * controller is purely for the public-facing read API + the explicit
 * "I just did X" client-side award endpoint.
 */

const User = require("../models/user");
const XpEvent = require("../models/XpEvent");
const Achievement = require("../models/Achievement");
const gameology = require("../services/gameologyService");

// ── Helpers ──────────────────────────────────────────────────────────────
function publicShape(u) {
    if (!u) return null;
    const g = u.gameology || {};
    return {
        _id: String(u._id),
        name: u.name,
        avatar: u.avatar,
        cosmicName: u.cosmic?.name,
        xp: g.xp || 0,
        level: g.level || 1,
        currentStreak: g.currentStreak || 0,
        longestStreak: g.longestStreak || 0,
        lastActiveDate: g.lastActiveDate,
        weeklyXp: g.weeklyXp || 0,
        weeklyXpWeek: g.weeklyXpWeek,
        leagueId: g.leagueId || "bronze",
        achievementCount: (g.achievements || []).length,
        achievements: g.achievements || [],
    };
}

// ── Endpoints ────────────────────────────────────────────────────────────
exports.getMe = async (req, res) => {
    try {
        const meId = req.user.id;
        // Lazy streak tick (no XP, just keeps the streak count honest)
        await gameology.tickActiveDay(meId);
        const me = await User.findById(meId).select("name avatar cosmic gameology").lean();
        if (!me) return res.status(404).json({ message: "User not found" });
        return res.json(publicShape(me));
    } catch (err) {
        console.error("gameology.getMe:", err);
        res.status(500).json({ message: "Server error" });
    }
};

exports.getLeaderboard = async (req, res) => {
    try {
        const { league, limit = 50 } = req.query;
        const lim = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
        const filter = { "gameology.xp": { $gt: 0 } };
        if (league) filter["gameology.leagueId"] = String(league);
        const items = await User.find(filter)
            .select("name avatar cosmic gameology")
            .sort({ "gameology.level": -1, "gameology.xp": -1 })
            .limit(lim)
            .lean();
        return res.json({ items: items.map(publicShape), week: gameology.isoWeek() });
    } catch (err) {
        console.error("gameology.getLeaderboard:", err);
        res.status(500).json({ message: "Server error" });
    }
};

exports.getCatalog = async (req, res) => {
    try {
        const items = await Achievement.find({}).sort({ rarity: 1, xpReward: 1 }).lean();
        return res.json({ items });
    } catch (err) {
        console.error("gameology.getCatalog:", err);
        res.status(500).json({ message: "Server error" });
    }
};

exports.getMyAchievements = async (req, res) => {
    try {
        const me = await User.findById(req.user.id).select("gameology").lean();
        if (!me) return res.status(404).json({ message: "User not found" });
        const unlocked = (me.gameology?.achievements || []).reduce((acc, a) => {
            acc[String(a.key)] = a.unlockedAt;
            return acc;
        }, {});
        const catalog = await Achievement.find({}).sort({ rarity: 1, xpReward: 1 }).lean();
        return res.json({
            items: catalog.map((a) => ({ ...a, unlockedAt: unlocked[a.key] || null })),
            total: catalog.length,
            unlockedCount: Object.keys(unlocked).length,
        });
    } catch (err) {
        console.error("gameology.getMyAchievements:", err);
        res.status(500).json({ message: "Server error" });
    }
};

exports.getMyHistory = async (req, res) => {
    try {
        const { limit = 30 } = req.query;
        const lim = Math.min(200, Math.max(1, parseInt(limit, 10) || 30));
        const items = await XpEvent.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .limit(lim)
            .lean();
        return res.json({ items });
    } catch (err) {
        console.error("gameology.getMyHistory:", err);
        res.status(500).json({ message: "Server error" });
    }
};

exports.award = async (req, res) => {
    try {
        const { event, metadata } = req.body || {};
        if (!event) return res.status(400).json({ message: "event is required" });
        const result = await gameology.awardXp(req.user.id, event, metadata || {});
        return res.json(result || { ok: false });
    } catch (err) {
        console.error("gameology.award:", err);
        res.status(500).json({ message: "Server error" });
    }
};

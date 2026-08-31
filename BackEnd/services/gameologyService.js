/**
 * gameologyService.js — the single source of truth for student Gameology.
 *
 * Every controller that wants to grant XP goes through `awardXp`. This is the
 * one fan-in point: anti-cheat, caps, multipliers can all be added here
 * without refactoring callers.
 *
 * Engine rules (Duolingo-style, but ours):
 *   - Level: 1..50, computed from total XP with a slowing curve:
 *       level = min(50, floor(sqrt(xp/100)) + 1)
 *     So: L1=0, L2=100, L3=400, L4=900, ..., L50=240100. The slow late game
 *     makes high levels feel earned, not grindable.
 *   - Streak: 1-day cadence. Today→no change, yesterday→+1, older→reset to 1.
 *   - League (purely cosmetic label, derived from weeklyXp):
 *       bronze<100, silver<500, gold<2000, platinum<5000, diamond<10000, legend≥10000
 *   - Streak bonus: every 7-day milestone grants +20 XP (logged as a separate
 *     XpEvent so the history feed shows the celebration).
 *   - Achievements: unlocked lazily on every awardXp via checkAchievements().
 *
 * The service is intentionally best-effort: every catch is logged and the
 * function returns null rather than throwing into a request path. Gameology
 * is engagement, not correctness — a failed award should never break a lesson
 * completion.
 */

const User = require("../models/user");
const XpEvent = require("../models/XpEvent");
const Achievement = require("../models/Achievement");

// ── XP event values (single source) ───────────────────────────────────────
const XP_VALUES = Object.freeze({
    lesson_completed:     50,
    quiz_passed:          30,
    quiz_perfect:         10,   // bonus on top of quiz_passed for a first-try 100%
    course_completed:    200,
    session_completed:   100,
    peer_swap_completed:  40,
    peer_help_posted:      5,
    streak_bonus:         20,
    achievement_unlocked:  0,   // logged as a row but the XP is in the achievement doc
    // V3 — fired on every lesson completion alongside the Knowledge
    // Graph recordTouch. The XpEvent is an audit row only; the
    // conceptMastery map on the user doc is the actual data.
    concept_touched:        0,
    // V3 — Boss level passed. Worth 3x a normal lesson + special
    // Boss achievement check (BOSS_FIRST / BOSS_5 / BOSS_25).
    boss_level_passed:    150,
});

// ── Pure math helpers ────────────────────────────────────────────────────
const MAX_LEVEL = 50;

/** level = min(50, floor(sqrt(xp/100)) + 1) */
function computeLevel(xp) {
    const v = Math.floor(Math.sqrt(Math.max(0, xp) / 100)) + 1;
    return Math.min(MAX_LEVEL, Math.max(1, v));
}

/** Inverse: xp threshold for the start of `level`. */
function xpForLevel(level) {
    return 100 * Math.pow(Math.max(0, level - 1), 2);
}

function leagueForWeeklyXp(weeklyXp) {
    if (weeklyXp >= 10000) return "legend";
    if (weeklyXp >=  5000) return "diamond";
    if (weeklyXp >=  2000) return "platinum";
    if (weeklyXp >=   500) return "gold";
    if (weeklyXp >=   100) return "silver";
    return "bronze";
}

/** "YYYY-Www" (ISO week, UTC). */
function isoWeek(d = new Date()) {
    const dt = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
    const dayNum = (dt.getUTCDay() + 6) % 7;            // Mon=0
    dt.setUTCDate(dt.getUTCDate() - dayNum + 3);         // Thursday
    const firstThursday = new Date(Date.UTC(dt.getUTCFullYear(), 0, 4));
    const firstDayNum = (firstThursday.getUTCDay() + 6) % 7;
    firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDayNum + 3);
    const week = 1 + Math.round((dt - firstThursday) / (7 * 86400000));
    return `${dt.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

/** "YYYY-MM-DD" UTC — matches the string in `user.gameology.lastActiveDate`. */
function todayUTC() {
    return new Date().toISOString().slice(0, 10);
}

function yesterdayUTC() {
    return new Date(Date.now() - 86400000).toISOString().slice(0, 10);
}

// ── Achievement catalog (seeded via scripts/seedAchievements.js) ─────────
// The engine reads from the DB; the constants below are defaults so the
// service can still return reasonable names if a catalog row is missing.
const ACHIEVEMENT_DEFAULTS = Object.freeze({
    FIRST_LESSON:  { title: "First Liftoff",   icon: "🚀", rarity: "common",  xpReward: 25 },
    FIRST_COURSE:  { title: "Course Crusader", icon: "🎓", rarity: "common",  xpReward: 50 },
    STREAK_3:      { title: "Steady Pulse",    icon: "✨", rarity: "common",  xpReward: 30 },
    STREAK_7:      { title: "Habitual Orbit",  icon: "🔥", rarity: "rare",    xpReward: 75 },
    STREAK_30:     { title: "Lunar Lock",      icon: "🌙", rarity: "epic",    xpReward: 200 },
    STREAK_100:    { title: "Deep Space",      icon: "🛰️", rarity: "mythic", xpReward: 500 },
    LEVEL_10:      { title: "Quasar Mind",     icon: "🌀", rarity: "rare",    xpReward: 50 },
    LEVEL_25:      { title: "Pulsar Soul",     icon: "💫", rarity: "epic",    xpReward: 200 },
    LEVEL_50:      { title: "Singularity",     icon: "🕳️", rarity: "mythic", xpReward: 1000 },
    COURSE_5:      { title: "Constellation",   icon: "🌌", rarity: "epic",    xpReward: 300 },
    QUIZ_PERFECT:  { title: "Sharp Shooter",   icon: "🎯", rarity: "rare",    xpReward: 50 },
    SESSION_1:     { title: "First Call",      icon: "📞", rarity: "common",  xpReward: 30 },
    PEER_SWAP_1:   { title: "First Trade",     icon: "🤝", rarity: "common",  xpReward: 30 },
    SPEEDRUN:      { title: "Speedrunner",     icon: "⚡", rarity: "rare",    xpReward: 100 },
});

// ── Streak tick (pure) ────────────────────────────────────────────────────
/**
 * Given the prior state and today, returns the new state + whether the
 * streak changed. Idempotent on the same day.
 */
function tickStreak(prev, today) {
    const last = prev.lastActiveDate;
    if (last === today) {
        return { ...prev, changed: false };
    }
    let current = prev.currentStreak || 0;
    let longest = prev.longestStreak || 0;
    if (!last || last === yesterdayUTC()) {
        current = current + 1;
    } else {
        current = 1; // gap
    }
    if (current > longest) longest = current;
    return {
        currentStreak: current,
        longestStreak: longest,
        lastActiveDate: today,
        changed: true,
        newMilestone: (current > 0 && current % 7 === 0), // every 7 days pays streak_bonus
    };
}

// ── Main entry: awardXp ───────────────────────────────────────────────────
/**
 * Award XP for an event. Atomic (one User.updateOne). Returns a small summary
 * or null on any failure (logged).
 *
 * @param {string|ObjectId} userId
 * @param {string} event  one of the keys in XP_VALUES
 * @param {object} [metadata]  { courseId, lessonId, ... } — stored on the XpEvent row
 * @returns {Promise<{xpAwarded, totalXp, level, leveledUp, currentStreak, newAchievements}|null>}
 */
async function awardXp(userId, event, metadata = {}) {
    try {
        const xpDelta = XP_VALUES[event];
        if (xpDelta === undefined) {
            console.warn(`[gameology] unknown event: ${event}`);
            return null;
        }

        const user = await User.findById(userId).select("gameology name").lean();
        if (!user) return null;

        const g = user.gameology || {};
        const today = todayUTC();
        const thisWeek = isoWeek();

        // 1) Streak tick
        const newStreak = tickStreak(g, today);

        // 2) Weekly reset on new ISO week
        const weeklyXp = g.weeklyXpWeek === thisWeek ? (g.weeklyXp || 0) : 0;
        const newXp = (g.xp || 0) + xpDelta;
        const newLevel = computeLevel(newXp);
        const newWeeklyXp = weeklyXp + xpDelta;
        const newLeague = leagueForWeeklyXp(newWeeklyXp);
        const leveledUp = newLevel > (g.level || 1);

        // 3) Persist the full subdoc atomically
        await User.updateOne(
            { _id: userId },
            { $set: {
                "gameology.xp": newXp,
                "gameology.level": newLevel,
                "gameology.currentStreak": newStreak.currentStreak,
                "gameology.longestStreak": newStreak.longestStreak,
                "gameology.lastActiveDate": newStreak.lastActiveDate,
                "gameology.weeklyXp": newWeeklyXp,
                "gameology.weeklyXpWeek": thisWeek,
                "gameology.leagueId": newLeague,
            }}
        );

        // 4) Audit row
        await XpEvent.create({ userId, event, xpAwarded: xpDelta, metadata });

        // 5) Streak bonus — every 7 days
        if (newStreak.newMilestone) {
            // Recursive call uses a smaller delta, separate audit row
            await awardXp(userId, "streak_bonus", { streak: newStreak.currentStreak });
        }

        // 6) Achievement check (pure over catalog + current state)
        const newAchievements = await checkAchievements(userId, {
            event, metadata, totalXp: newXp, level: newLevel,
            streak: newStreak.currentStreak, weeklyXp: newWeeklyXp,
        });

        return {
            event,
            xpAwarded: xpDelta,
            totalXp: newXp,
            level: newLevel,
            leveledUp,
            currentStreak: newStreak.currentStreak,
            weeklyXp: newWeeklyXp,
            league: newLeague,
            newAchievements: newAchievements.map((a) => a.key),
        };
    } catch (err) {
        console.warn("[gameology] awardXp failed:", err.message);
        return null;
    }
}

// ── tickActiveDay (no XP, just streak) ────────────────────────────────────
// Mirrors the orbit-activity heartbeat but for the learning streak. Called
// when a user does ANY learning action that doesn't otherwise grant XP
// (e.g. reading a Q&A post).
async function tickActiveDay(userId) {
    try {
        const user = await User.findById(userId).select("gameology.lastActiveDate gameology.currentStreak gameology.longestStreak");
        if (!user) return;
        const g = user.gameology || {};
        const today = todayUTC();
        if (g.lastActiveDate === today) return;
        const newStreak = tickStreak(g, today);
        await User.updateOne(
            { _id: userId },
            { $set: {
                "gameology.currentStreak": newStreak.currentStreak,
                "gameology.longestStreak": newStreak.longestStreak,
                "gameology.lastActiveDate": newStreak.lastActiveDate,
            }}
        );
    } catch (err) {
        console.warn("[gameology] tickActiveDay failed:", err.message);
    }
}

// ── Achievement check ─────────────────────────────────────────────────────
/**
 * @param {string} userId
 * @param {{event, metadata, totalXp, level, streak, weeklyXp}} ctx
 * @returns {Promise<Achievement[]>}  the new ones (unlocked this call)
 */
async function checkAchievements(userId, ctx) {
    try {
        const catalog = await Achievement.find().lean();
        if (!catalog.length) return [];

        const user = await User.findById(userId).select("gameology.achievements").lean();
        const owned = new Set((user?.gameology?.achievements || []).map((a) => a.key));

        const newlyUnlocked = [];
        for (const a of catalog) {
            if (owned.has(a.key)) continue;
            const unlocked = await isAchievementUnlocked(a.key, ctx);
            if (!unlocked) continue;

            await User.updateOne(
                { _id: userId },
                { $push: { "gameology.achievements": { key: a.key, unlockedAt: new Date() } } }
            );
            if (a.xpReward && a.xpReward > 0) {
                // Award the achievement's bonus XP as a separate ledger row,
                // and bump xp/weeklyXp directly (we're inside an awardXp call
                // so we don't want to recurse — that would double-count the
                // streak tick + achievement counter).
                await User.updateOne(
                    { _id: userId },
                    { $inc: { "gameology.xp": a.xpReward, "gameology.weeklyXp": a.xpReward } }
                );
                await XpEvent.create({
                    userId, event: "achievement_unlocked",
                    xpAwarded: a.xpReward, metadata: { achievementKey: a.key },
                });
            }
            newlyUnlocked.push(a);
        }
        return newlyUnlocked;
    } catch (err) {
        console.warn("[gameology] checkAchievements failed:", err.message);
        return [];
    }
}

/**
 * Pure predicate: is `key` unlocked given `ctx`? A few rules need a
 * Mongo count (course_completed, swap) so the caller awaits it.
 */
async function isAchievementUnlocked(key, ctx) {
    const { event, metadata = {}, totalXp, level, streak } = ctx;
    switch (key) {
        case "FIRST_LESSON":  return event === "lesson_completed";
        case "FIRST_COURSE":  return event === "course_completed";
        case "STREAK_3":      return (streak || 0) >= 3;
        case "STREAK_7":      return (streak || 0) >= 7;
        case "STREAK_30":     return (streak || 0) >= 30;
        case "STREAK_100":    return (streak || 0) >= 100;
        case "LEVEL_10":      return (level || 0) >= 10;
        case "LEVEL_25":      return (level || 0) >= 25;
        case "LEVEL_50":      return (level || 0) >= 50;
        case "QUIZ_PERFECT":  return metadata.perfect === true;
        case "SESSION_1":     return event === "session_completed";
        case "PEER_SWAP_1":   return event === "peer_swap_completed";
        case "COURSE_5": {
            const c = await XpEvent.countDocuments({ userId: ctx.userId, event: "course_completed" });
            return c >= 5;
        }
        case "SPEEDRUN": {
            // 5+ lesson_completed in the last 24h
            const since = new Date(Date.now() - 86400000);
            const c = await XpEvent.countDocuments({ userId: ctx.userId, event: "lesson_completed", createdAt: { $gte: since } });
            return c >= 5;
        }
        default: return false;
    }
}

// ── Reads (the controller calls these) ────────────────────────────────────
async function getMyGameology(userId) {
    const user = await User.findById(userId).select("gameology name").lean();
    if (!user) return null;
    return {
        userId: String(user._id),
        name: user.name,
        ...normalizeGameology(user.gameology),
    };
}

function normalizeGameology(g = {}) {
    return {
        xp: g.xp || 0,
        level: g.level || 1,
        currentStreak: g.currentStreak || 0,
        longestStreak: g.longestStreak || 0,
        lastActiveDate: g.lastActiveDate || null,
        weeklyXp: g.weeklyXp || 0,
        weeklyXpWeek: g.weeklyXpWeek || "",
        leagueId: g.leagueId || "bronze",
        achievements: Array.isArray(g.achievements) ? g.achievements : [],
        // Derived (pure)
        xpToNextLevel: xpForLevel((g.level || 1) + 1) - (g.xp || 0),
        progressToNextLevel: (() => {
            const lvl = g.level || 1;
            const base = xpForLevel(lvl);
            const next = xpForLevel(lvl + 1);
            const span = Math.max(1, next - base);
            return Math.max(0, Math.min(1, ((g.xp || 0) - base) / span));
        })(),
    };
}

async function getLeaderboard({ league, limit = 50 } = {}) {
    const filter = {};
    if (league) filter["gameology.leagueId"] = league;
    const rows = await User.find(filter)
        .select("name avatar gameology")
        .sort({ "gameology.level": -1, "gameology.xp": -1 })
        .limit(Math.min(200, Math.max(1, limit)))
        .lean();
    return rows.map((u, i) => ({
        rank: i + 1,
        userId: String(u._id),
        name: u.name,
        avatar: u.avatar || "",
        level: u.gameology?.level || 1,
        xp: u.gameology?.xp || 0,
        leagueId: u.gameology?.leagueId || "bronze",
        currentStreak: u.gameology?.currentStreak || 0,
    }));
}

async function getMyHistory(userId, limit = 50) {
    const events = await XpEvent.find({ userId })
        .sort({ createdAt: -1 })
        .limit(Math.min(200, Math.max(1, limit)))
        .lean();
    return events.map((e) => ({
        id: String(e._id),
        event: e.event,
        xpAwarded: e.xpAwarded,
        metadata: e.metadata,
        createdAt: e.createdAt,
    }));
}

module.exports = {
    // constants
    XP_VALUES,
    MAX_LEVEL,
    ACHIEVEMENT_DEFAULTS,
    // pure math
    computeLevel,
    xpForLevel,
    leagueForWeeklyXp,
    isoWeek,
    todayUTC,
    tickStreak,
    isAchievementUnlocked,
    // side-effecting
    awardXp,
    tickActiveDay,
    checkAchievements,
    // reads
    getMyGameology,
    normalizeGameology,
    getLeaderboard,
    getMyHistory,
};

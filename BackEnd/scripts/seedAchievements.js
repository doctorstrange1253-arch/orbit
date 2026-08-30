/**
 * seedAchievements.js — seed the Achievement catalog with the default set.
 *
 * Idempotent: keyed on `key` (unique). Safe to re-run.
 *
 * Run modes:
 *   1) `node scripts/seedAchievements.js` — explicit.
 *   2) `RUN_ACHIEVEMENT_SEED=true` on backend boot.
 *   3) From a test: `const { main } = require('./scripts/seedAchievements')`.
 */
require("dotenv").config();
const mongoose = require("mongoose");
const Achievement = require("../models/Achievement");
const { ACHIEVEMENT_DEFAULTS } = require("../services/gameologyService");

// Stories: each achievement has a cosmic-themed title (the "First Liftoff"
// style — name them after Orbit lore, not raw unlocks).
const CATALOG = [
    { key: "FIRST_LESSON",  title: "First Liftoff",   description: "Complete your first course lesson.",                            icon: "🚀", rarity: "common",  xpReward: 25 },
    { key: "FIRST_COURSE",  title: "Course Crusader", description: "Finish your first course end-to-end.",                          icon: "🎓", rarity: "common",  xpReward: 50 },
    { key: "STREAK_3",      title: "Steady Pulse",    description: "3-day learning streak.",                                       icon: "✨", rarity: "common",  xpReward: 30 },
    { key: "STREAK_7",      title: "Habitual Orbit",  description: "7-day learning streak.",                                       icon: "🔥", rarity: "rare",    xpReward: 75 },
    { key: "STREAK_30",     title: "Lunar Lock",      description: "30-day learning streak — the moon is in step with you.",       icon: "🌙", rarity: "epic",    xpReward: 200 },
    { key: "STREAK_100",    title: "Deep Space",      description: "100-day learning streak. You are a fixed point in the sky.",    icon: "🛰️", rarity: "mythic", xpReward: 500 },
    { key: "LEVEL_10",      title: "Quasar Mind",     description: "Reach Level 10 in Gameology.",                                 icon: "🌀", rarity: "rare",    xpReward: 50 },
    { key: "LEVEL_25",      title: "Pulsar Soul",     description: "Reach Level 25 — the engine of a collapsed star.",             icon: "💫", rarity: "epic",    xpReward: 200 },
    { key: "LEVEL_50",      title: "Singularity",     description: "Reach Level 50 — the final, dense, irreducible point.",         icon: "🕳️", rarity: "mythic", xpReward: 1000 },
    { key: "COURSE_5",      title: "Constellation",   description: "Complete 5 courses.",                                          icon: "🌌", rarity: "epic",    xpReward: 300 },
    { key: "QUIZ_PERFECT",  title: "Sharp Shooter",   description: "Score 100% on a quiz on your first try.",                      icon: "🎯", rarity: "rare",    xpReward: 50 },
    { key: "SESSION_1",     title: "First Call",      description: "Complete your first paid 1-on-1 session.",                     icon: "📞", rarity: "common",  xpReward: 30 },
    { key: "PEER_SWAP_1",   title: "First Trade",     description: "Complete your first peer skill swap.",                         icon: "🤝", rarity: "common",  xpReward: 30 },
    { key: "SPEEDRUN",      title: "Speedrunner",     description: "Complete 5 lessons in a single day.",                          icon: "⚡", rarity: "rare",    xpReward: 100 },
];

async function main(opts = {}) {
    const skipExit = opts.skipExit !== false;
    if (!process.env.MONGO_URI) {
        const msg = "[seed:achievements] MONGO_URI is not set — aborting.";
        console.error(msg);
        if (!skipExit) process.exit(1);
        throw new Error(msg);
    }
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(process.env.MONGO_URI);
    }
    console.log("[seed:achievements] Connected to MongoDB.");

    // Fall back to defaults if a key isn't in CATALOG
    const ops = CATALOG.map((a) => ({
        updateOne: {
            filter: { key: a.key },
            update: { $set: { ...(ACHIEVEMENT_DEFAULTS[a.key] || {}), ...a } },
            upsert: true,
        },
    }));

    const result = await Achievement.bulkWrite(ops);
    const { upsertedCount, modifiedCount, matchedCount } = result;
    console.log(
        `[seed:achievements] upserted=${upsertedCount}, modified=${modifiedCount}, matched=${matchedCount}, total=${CATALOG.length}.`
    );

    if (!skipExit) {
        process.exit(0);
    }
    return { upsertedCount, modifiedCount, matchedCount };
}

module.exports = main;

if (require.main === module) {
    main({ skipExit: false }).catch((err) => {
        console.error("[seed:achievements] FAILED:", err);
        try { mongoose.disconnect(); } catch (_) {}
        process.exit(1);
    });
}

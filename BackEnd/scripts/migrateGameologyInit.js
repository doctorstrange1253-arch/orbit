/**
 * migrateGameologyInit.js — one-shot, idempotent backfill of `user.gameology`.
 *
 * Adds the gameology subdoc to every User that does not yet have one. Safe
 * to re-run: the `$exists: false` filter matches zero docs after the first
 * pass. Mirrors the migrateUserRoles.js pattern.
 *
 * Run modes:
 *   1) `node scripts/migrateGameologyInit.js` — explicit, exits when done.
 *   2) `RUN_GAMEOLOGY_MIGRATION=true` on backend boot — see server.js.
 *   3) From a test: `const { main } = require('./scripts/migrateGameologyInit')`
 */
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/user");

async function main(opts = {}) {
    const skipExit = opts.skipExit !== false;
    if (!process.env.MONGO_URI) {
        const msg = "[migrate:gameology] MONGO_URI is not set — aborting.";
        console.error(msg);
        if (!skipExit) process.exit(1);
        throw new Error(msg);
    }
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(process.env.MONGO_URI);
    }
    console.log("[migrate:gameology] Connected to MongoDB.");

    try {
        await User.syncIndexes();
        console.log("[migrate:gameology] Indexes synced.");
    } catch (idxErr) {
        console.error("[migrate:gameology] Index sync failed:", idxErr.message);
    }

    const result = await User.updateMany(
        { gameology: { $exists: false } },
        { $set: {
            "gameology.xp": 0,
            "gameology.level": 1,
            "gameology.currentStreak": 0,
            "gameology.longestStreak": 0,
            "gameology.lastActiveDate": null,
            "gameology.weeklyXp": 0,
            "gameology.weeklyXpWeek": "",
            "gameology.leagueId": "bronze",
            "gameology.achievements": [],
        }}
    );

    console.log(
        `[migrate:gameology] Backfill: matched=${result.matchedCount}, ` +
        `modified=${result.modifiedCount}, upserted=${result.upsertedCount || 0}.`
    );

    const remaining = await User.countDocuments({ gameology: { $exists: false } });
    console.log(`[migrate:gameology] Remaining users without gameology: ${remaining}`);

    if (!skipExit) {
        process.exit(remaining > 0 ? 2 : 0);
    }
    return { matched: result.matchedCount, modified: result.modifiedCount, remaining };
}

module.exports = main;

if (require.main === module) {
    main({ skipExit: false }).catch((err) => {
        console.error("[migrate:gameology] FAILED:", err);
        try { mongoose.disconnect(); } catch (_) {}
        process.exit(1);
    });
}

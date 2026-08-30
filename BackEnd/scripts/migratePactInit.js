/**
 * migratePactInit.js — seed every existing mentor into the Pact.
 *
 * For every User with `roles` including `'mentor'` and no `pact` subdoc,
 * set the initial pact state (Initiate tier, weekId = current ISO week,
 * groupId = deterministic round-robin so the same mentor always lands in
 * the same first group).
 *
 * Idempotent (`$exists: false` filter on pact). Run once on first deploy
 * with `RUN_PACT_MIGRATION=true`, then unset.
 */
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/user");
const pact = require("../services/pactService");

async function main(opts = {}) {
    const skipExit = opts.skipExit !== false;
    if (!process.env.MONGO_URI) {
        const msg = "[migrate:pact] MONGO_URI is not set — aborting.";
        console.error(msg);
        if (!skipExit) process.exit(1);
        throw new Error(msg);
    }
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(process.env.MONGO_URI);
    }
    console.log("[migrate:pact] Connected to MongoDB.");

    try {
        await User.syncIndexes();
    } catch (idxErr) {
        console.error("[migrate:pact] Index sync failed:", idxErr.message);
    }

    const weekId = pact.isoWeek();
    const mentors = await User.find({
        roles: "mentor",
        pact: { $exists: false },
    }).select("_id").lean();

    if (!mentors.length) {
        console.log("[migrate:pact] No mentors need pact init. Done.");
        if (!skipExit) process.exit(0);
        return { modified: 0, weekId };
    }

    // Deterministic round-robin bucket by mentor _id
    const sorted = mentors.slice().sort((a, b) => String(a._id).localeCompare(String(b._id)));
    const bucket = (i) => Math.floor(i / pact.GROUP_SIZE);

    const bulkOps = sorted.map((m, i) => ({
        updateOne: {
            filter: { _id: m._id, pact: { $exists: false } },
            update: {
                $set: {
                    "pact.divisionId": "initiate",
                    "pact.groupId": pact.groupIdFor("initiate", weekId, bucket(i)),
                    "pact.weekScore": 0,
                    "pact.weekId": weekId,
                    "pact.lastResult": "",
                    "pact.highestDivisionId": "initiate",
                    "pact.steadyShieldWeeks": 0,
                    "pact.weeklyHistory": [],
                },
            },
        },
    }));

    const result = await User.bulkWrite(bulkOps);
    console.log(
        `[migrate:pact] Backfill: matched=${result.matchedCount}, ` +
        `modified=${result.modifiedCount}, weekId=${weekId}, groups=${bucket(sorted.length) + 1}.`
    );

    if (!skipExit) {
        process.exit(0);
    }
    return { modified: result.modifiedCount, weekId };
}

module.exports = main;

if (require.main === module) {
    main({ skipExit: false }).catch((err) => {
        console.error("[migrate:pact] FAILED:", err);
        try { mongoose.disconnect(); } catch (_) {}
        process.exit(1);
    });
}

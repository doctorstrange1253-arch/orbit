/**
 * migrateUserRoles.js — one-shot, idempotent backfill.
 *
 * Adds `roles: ["peer_learner"]` and `rolesVersion: 0` to every User that does
 * not yet have them. Safe to re-run: the `$exists: false` filter matches zero
 * docs after the first run, so the second invocation is a no-op.
 *
 * Run modes:
 *   1) `node scripts/migrateUserRoles.js` — explicit, exits when done.
 *   2) `RUN_USER_ROLES_MIGRATION=true` on backend boot — see server.js
 *      boot wiring. Lets deploys backfill in-process without a separate step.
 *   3) From a test: `const { main } = require('./scripts/migrateUserRoles')`
 *      then `await main({ skipExit: true })` to run the backfill without
 *      tearing down the test process.
 *
 * No data is moved or destroyed. The third-arg on the Mongoose model keeps
 * the existing `users` collection on disk — we are only adding fields.
 */
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/user");

/**
 * Run the backfill against a Mongo connection.
 * @param {object} [opts]
 * @param {boolean} [opts.skipExit=true]  when true, never call process.exit
 *   (the test harness sets this so the script doesn't kill the test runner)
 * @returns {Promise<{matched:number, modified:number, remaining:number}>}
 */
async function main(opts = {}) {
    const skipExit = opts.skipExit !== false; // default to skipping exit
    if (!process.env.MONGO_URI) {
        const msg = "[migrate:user-roles] MONGO_URI is not set — aborting.";
        console.error(msg);
        if (!skipExit) process.exit(1);
        throw new Error(msg);
    }
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(process.env.MONGO_URI);
    }
    console.log("[migrate:user-roles] Connected to MongoDB.");

    // Add the multikey index on `roles`. syncIndexes() will create it
    // (and drop any stale indexes no longer referenced by the schema).
    try {
        await User.syncIndexes();
        console.log("[migrate:user-roles] Indexes synced (roles: 1 ensured).");
    } catch (idxErr) {
        console.error("[migrate:user-roles] Index sync failed:", idxErr.message);
    }

    const result = await User.updateMany(
        { roles: { $exists: false } },
        { $set: { roles: ["peer_learner"], rolesVersion: 0 } }
    );

    console.log(
        `[migrate:user-roles] Backfill: matched=${result.matchedCount}, ` +
        `modified=${result.modifiedCount}, upserted=${result.upsertedCount || 0}.`
    );

    // Belt-and-braces: any pre-migration user whose `roles` is somehow an
    // empty array also gets the baseline.
    const empty = await User.updateMany(
        { roles: { $size: 0 } },
        { $set: { roles: ["peer_learner"] } }
    );
    if (empty.modifiedCount > 0) {
        console.log(`[migrate:user-roles] Repaired ${empty.modifiedCount} empty-roles users.`);
    }

    const remaining = await User.countDocuments({ roles: { $exists: false } });
    console.log(`[migrate:user-roles] Remaining users without roles: ${remaining}`);

    if (remaining > 0) {
        console.error("[migrate:user-roles] WARNING: not every user has roles. Re-run the script.");
    } else {
        console.log("[migrate:user-roles] OK — every user now has a roles array.");
    }

    if (!skipExit) {
        process.exit(remaining > 0 ? 2 : 0);
    }
    return { matched: result.matchedCount, modified: result.modifiedCount, remaining };
}

module.exports = { main };

// CLI entrypoint — only run when invoked directly, not when required by tests.
if (require.main === module) {
    main({ skipExit: false }).catch((err) => {
        console.error("[migrate:user-roles] FAILED:", err);
        try { mongoose.disconnect(); } catch (_) { /* noop */ }
        process.exit(1);
    });
}

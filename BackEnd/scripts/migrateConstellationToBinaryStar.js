#!/usr/bin/env node
/**
 * migrateConstellationToBinaryStar.js
 *
 * One-shot, idempotent migration that rewrites every user-visible string
 * tagged "constellation_*" to the new "binary_star_*" namespace introduced
 * in this slice. The on-disk MongoDB collection name (still `constellations`)
 * is preserved by the third arg of `mongoose.model("BinaryStar", …, "constellations")`
 * — no data is moved on disk, only label types in two collections.
 *
 * Usage:
 *   node scripts/migrateConstellationToBinaryStar.js
 *
 * Or set `RUN_BINARY_STAR_MIGRATION=true` on first boot to auto-run via
 * server.js (mirrors the existing `RUN_ADMIN_SEED` pattern).
 *
 * Re-running is a no-op: `updateMany({ type: from })` matches 0 docs after
 * the first run.
 */

const mongoose = require("mongoose");
const Notification = require("../models/Notification");
const PhotonLedger = require("../models/PhotonLedger");

const TYPE_MAP = Object.freeze({
    constellation_invite:      "binary_star_invite",
    constellation_accepted:    "binary_star_accepted",
    constellation_dissolved:   "binary_star_dissolved",
    constellation_milestone:   "binary_star_milestone",
    constellation_streak:      "binary_star_streak",
    constellation_freeze_used: "binary_star_freeze_used",
    constellation_your_turn:   "binary_star_your_turn",
});

const LEDGER_FROM = "constellation";
const LEDGER_TO = "binary_star";

/**
 * @param {Object} [opts]
 * @param {boolean} [opts.keepAlive=false]  When true, do NOT disconnect mongoose
 *   and do NOT call process.exit — used by server.js which already owns the
 *   shared mongoose connection. CLI invocation leaves the default (false) so
 *   the script exits cleanly with a status code, as before.
 */
async function main({ keepAlive = false } = {}) {
    const uri = process.env.MONGO_URI;
    if (!uri) {
        console.error("[migrate] MONGO_URI not set");
        if (!keepAlive) process.exit(1);
        throw new Error("MONGO_URI not set");
    }
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(uri);
        console.log("[migrate] connected to", uri.replace(/\/\/.*@/, "//***@"));
    } else {
        console.log(`[migrate] reusing existing mongoose connection (state=${mongoose.connection.readyState})`);
    }

    let notifications = 0;
    for (const [from, to] of Object.entries(TYPE_MAP)) {
        const res = await Notification.updateMany({ type: from }, { $set: { type: to } });
        if (res.modifiedCount) {
            console.log(`[migrate] Notification.type ${from} -> ${to}: ${res.modifiedCount} doc(s)`);
        }
        notifications += res.modifiedCount;
    }

    const ledger = await PhotonLedger.updateMany(
        { source: LEDGER_FROM },
        { $set: { source: LEDGER_TO } }
    );
    if (ledger.modifiedCount) {
        console.log(`[migrate] PhotonLedger.source ${LEDGER_FROM} -> ${LEDGER_TO}: ${ledger.modifiedCount} doc(s)`);
    }

    console.log(`[migrate] Done. Affected: {notifications: ${notifications}, ledger: ${ledger.modifiedCount}}`);

    if (!keepAlive) {
        await mongoose.disconnect();
        process.exit(0);
    }
}

if (require.main === module) {
    main().catch((err) => {
        console.error("[migrate] failed:", err);
        process.exit(1);
    });
}

module.exports = { main, TYPE_MAP, LEDGER_FROM, LEDGER_TO };

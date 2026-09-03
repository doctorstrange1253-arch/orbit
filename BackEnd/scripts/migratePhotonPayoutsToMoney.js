const mongoose = require("mongoose");
const PhotonLedger = require("../models/PhotonLedger");
const MoneyLedger = require("../models/MoneyLedger");

const LEGACY_SOURCES = ["session_payout_pending", "session_payout_released"];

const DESTINATION = {
    session_payout_pending: { stage: "queue", to: (m) => `mentor:${m}:payout_pending` },
    session_payout_released: { stage: "settled", to: (m) => `mentor:${m}:paid` },
};

function rowsFor(doc) {
    const mentor = String(doc.userId);
    const spec = DESTINATION[doc.source] || DESTINATION.session_payout_pending;
    const amountMinor = Math.round(Math.abs(Number(doc.delta) || 0) * 100);
    const ref = `legacy:${String(doc._id)}`;
    const txnId = `sesspay:${spec.stage}:${ref}`;
    const from = "platform:escrow";
    const to = spec.to(mentor);
    const at = doc.createdAt || new Date();

    return [
        {
            txnId, seq: 0, at, kind: "payout",
            account: from, counterAccount: to, amountMinor: -amountMinor,
            refType: "session", refId: ref,
            idempotencyKey: `${txnId}:out`,
            memo: `Migrated from PhotonLedger (${doc.source})`,
        },
        {
            txnId, seq: 1, at, kind: "payout",
            account: to, counterAccount: from, amountMinor,
            refType: "session", refId: ref,
            idempotencyKey: `${txnId}:in`,
            memo: `Migrated from PhotonLedger (${doc.source})`,
        },
    ];
}

async function migratePhotonPayoutsToMoney({ apply = false, verbose = true } = {}) {
    const contaminated = await PhotonLedger.find({
        $or: [
            { source: { $in: LEGACY_SOURCES } },
            { source: { $regex: PhotonLedger.MONEY_SOURCE } },
        ],
    }).lean();

    const totalInr = contaminated.reduce((n, d) => n + Math.abs(Number(d.delta) || 0), 0);
    const bySource = {};
    for (const doc of contaminated) bySource[doc.source] = (bySource[doc.source] || 0) + 1;

    if (verbose) {
        console.log(`[migratePhotonPayouts] found ${contaminated.length} money rows in PhotonLedger, ₹${totalInr} total`);
        for (const [source, count] of Object.entries(bySource)) console.log(`  ${source}: ${count}`);
        if (!apply) console.log("[migratePhotonPayouts] DRY RUN — pass --apply to move them");
    }

    if (!apply || contaminated.length === 0) {
        return { found: contaminated.length, totalInr, bySource, moved: 0, removed: 0, applied: false };
    }

    let moved = 0;
    let removed = 0;
    for (const doc of contaminated) {
        if (!doc.userId || !doc.delta) {
            await PhotonLedger.deleteOne({ _id: doc._id });
            removed += 1;
            continue;
        }
        const written = await MoneyLedger.writeTxn(rowsFor(doc));
        if (written.length > 0) moved += 1;
        await PhotonLedger.deleteOne({ _id: doc._id });
        removed += 1;
    }

    if (verbose) console.log(`[migratePhotonPayouts] moved ${moved} txns to MoneyLedger, removed ${removed} Photon rows`);
    return { found: contaminated.length, totalInr, bySource, moved, removed, applied: true };
}

if (require.main === module) {
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!uri) {
        console.error("[migratePhotonPayouts] MONGO_URI is not set");
        process.exit(1);
    }
    const apply = process.argv.includes("--apply");
    mongoose
        .connect(uri)
        .then(() => migratePhotonPayoutsToMoney({ apply }))
        .then(() => mongoose.disconnect())
        .then(() => process.exit(0))
        .catch((err) => {
            console.error("[migratePhotonPayouts] failed:", err.message);
            process.exit(1);
        });
}

module.exports = { migratePhotonPayoutsToMoney, rowsFor, LEGACY_SOURCES };

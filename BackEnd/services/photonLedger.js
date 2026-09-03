/**
 * photonLedger.js — write Photon flows + build the Gravimeter economy report
 * (Mission Control C6). `record()` is fire-and-forget (never throws into the
 * request path). `aggregate()` is PURE over a list of events so it's unit-
 * testable; `report()` is the DB wrapper.
 *
 * UNIT INVARIANT: every delta is Photons. Session payouts were once written
 * here in rupees, so `aggregate()` quarantines money-unit rows instead of
 * summing them — historical contamination is reported, never counted.
 */

const PhotonLedger = require("../models/PhotonLedger");

const { isMoneySource } = PhotonLedger;

/** Append one flow. Best-effort. delta>0 earn, delta<0 spend. */
function record(userId, delta, source) {
    if (!userId || !delta) return false;
    if (isMoneySource(source)) {
        console.error(`[photonLedger] refused '${source}' — money belongs in MoneyLedger, not the Photon supply.`);
        return false;
    }
    PhotonLedger.create({ userId, delta, source: source || "unknown" }).catch(() => {});
    return true;
}

/**
 * aggregate — PURE. Reconcile a list of {userId, delta, source} into an economy
 * snapshot: sources vs sinks, net supply, top earners/spenders, inflation flag.
 * Rows whose source names a money flow are quarantined, not summed.
 * @param {Array} events
 * @param {object} [opts] { inflationRatio=3 } → alert when earned > spent*ratio
 */
function aggregate(events = [], { inflationRatio = 3 } = {}) {
    const sources = {}, sinks = {}, earnBy = {}, spendBy = {};
    const quarantinedSources = {};
    let totalEarned = 0, totalSpent = 0, quarantinedCount = 0, quarantinedTotal = 0;

    for (const e of events) {
        if (isMoneySource(e.source)) {
            quarantinedCount += 1;
            quarantinedTotal += Math.abs(e.delta || 0);
            quarantinedSources[e.source] = (quarantinedSources[e.source] || 0) + Math.abs(e.delta || 0);
            continue;
        }
        const uid = String(e.userId);
        if (e.delta > 0) {
            sources[e.source] = (sources[e.source] || 0) + e.delta;
            earnBy[uid] = (earnBy[uid] || 0) + e.delta;
            totalEarned += e.delta;
        } else if (e.delta < 0) {
            const abs = -e.delta;
            sinks[e.source] = (sinks[e.source] || 0) + abs;
            spendBy[uid] = (spendBy[uid] || 0) + abs;
            totalSpent += abs;
        }
    }

    const top = (obj) => Object.entries(obj).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([userId, amount]) => ({ userId, amount }));
    const netSupply = totalEarned - totalSpent;
    // Inflation: Photons entering far faster than they leave → rewards devalue.
    const inflationAlert = totalEarned > 0 && (totalSpent === 0 || totalEarned > totalSpent * inflationRatio);

    return {
        sources, sinks,
        totalEarned, totalSpent, netSupply,
        sinkRatio: totalEarned ? Math.round((totalSpent / totalEarned) * 100) / 100 : 0,
        topEarners: top(earnBy), topSpenders: top(spendBy),
        inflationAlert,
        events: events.length - quarantinedCount,
        quarantined: {
            count: quarantinedCount,
            total: quarantinedTotal,
            sources: quarantinedSources,
            needsMigration: quarantinedCount > 0,
        },
    };
}

/** DB report over an optional time window. */
async function report({ from, to } = {}) {
    const q = {};
    if (from || to) { q.createdAt = {}; if (from) q.createdAt.$gte = new Date(from); if (to) q.createdAt.$lte = new Date(to); }
    const events = await PhotonLedger.find(q).select("userId delta source").lean();
    return aggregate(events);
}

module.exports = { record, aggregate, report, isMoneySource };

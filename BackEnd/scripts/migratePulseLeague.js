/**
 * scripts/migratePulseLeague.js — V2 → V3 league remap (one-time).
 *
 * V2's 6-tier system: bronze, silver, gold, platinum, diamond, legend.
 * V3's 8-tier system: dust, meteor, comet, star, giant, nebula, pulsar,
 * singularity.
 *
 * Map (per V3 plan §12):
 *   bronze   → dust
 *   silver   → meteor
 *   gold     → comet
 *   platinum → star
 *   diamond  → giant
 *   legend   → nebula
 *   (pulsar + singularity are empty in V2; users earn them in V3)
 *
 * Run once on first V3 deploy with RUN_PULSE_LEAGUE_MIGRATION=true,
 * then unset. Idempotent (skips users already on a V3 tier).
 *
 * The remap is a one-line User.updateOne per user. We log the count
 * for visibility, not for the migration record.
 */

const mongoose = require("mongoose");
const User = require("../models/user");

const V2_TO_V3 = {
    bronze:    "dust",
    silver:    "meteor",
    gold:      "comet",
    platinum:  "star",
    diamond:   "giant",
    legend:    "nebula",
};

const V3_TIERS = new Set([
    "dust", "meteor", "comet", "star", "giant", "nebula", "pulsar", "singularity",
]);

async function main() {
    if (!process.env.RUN_PULSE_LEAGUE_MIGRATION) {
        console.log("[migratePulseLeague] RUN_PULSE_LEAGUE_MIGRATION not set — skipping.");
        return;
    }
    if (mongoose.connection.readyState !== 1) {
        await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/orbit");
    }

    const v2Tiers = Object.keys(V2_TO_V3);
    let modified = 0;
    for (const v2 of v2Tiers) {
        const v3 = V2_TO_V3[v2];
        const r = await User.updateMany(
            { "gameology.leagueId": v2 },
            { $set: { "gameology.leagueId": v3 } }
        );
        modified += r.modifiedCount || 0;
        if (r.modifiedCount) {
            console.log(`[migratePulseLeague] ${v2} → ${v3}: ${r.modifiedCount} user(s)`);
        }
    }
    console.log(`[migratePulseLeague] Done. Modified ${modified} user(s).`);
}

if (require.main === module) {
    main().then(() => process.exit(0)).catch((e) => {
        console.error("[migratePulseLeague] failed:", e);
        process.exit(1);
    });
}

module.exports = { main, V2_TO_V3, V3_TIERS };

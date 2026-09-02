const mongoose = require("mongoose");
const Plan = require("../models/Plan");
const { PLAN_SEED } = require("../services/billingPlans");

async function seedPlans({ verbose = true } = {}) {
    let created = 0;
    let skipped = 0;
    for (const seed of PLAN_SEED) {
        const existing = await Plan.findOne({ key: seed.key }).lean();
        if (existing) {
            skipped += 1;
            continue;
        }
        await Plan.create({ ...seed, status: "live" });
        created += 1;
    }
    if (verbose) console.log(`[seedPlans] created ${created}, already present ${skipped}`);
    return { created, skipped };
}

if (require.main === module) {
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!uri) {
        console.error("[seedPlans] MONGO_URI is not set");
        process.exit(1);
    }
    mongoose
        .connect(uri)
        .then(() => seedPlans())
        .then(() => mongoose.disconnect())
        .then(() => process.exit(0))
        .catch((err) => {
            console.error("[seedPlans] failed:", err.message);
            process.exit(1);
        });
}

module.exports = { seedPlans };

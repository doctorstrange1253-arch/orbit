const mongoose = require("mongoose");

/**
 * BinaryStar — a co-op "Binary Star" pair (Orbit Engine, Tier 2). Two swap
 * partners bound into a SHARED streak that advances only when BOTH members
 * take a real-progress action on the same UTC day, so breaking it lets a
 * person down — the strongest anti-churn mechanic. Additive: no existing
 * collection is touched.
 *
 * The on-disk collection name is preserved as `constellations` (the third arg
 * to `mongoose.model()`) so this rename is code-only and requires NO data
 * migration of the docs themselves. The one-shot
 * `scripts/migrateConstellationToBinaryStar.js` rewrites the few STORED STRINGS
 * that reference the old name (`Notification.type` × 7, `PhotonLedger.source`).
 *
 * `members` is stored SORTED (by string id) so the unique index guarantees at
 * most one Binary Star per unordered pair. Per-member contribution days live
 * in `lastActionDay` (a plain object keyed by userId string). The pair gets
 * its own weekly Gravity Assist freeze, mirroring the personal streak's mercy
 * model.
 */
const binaryStarSchema = new mongoose.Schema({
    members: {
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        validate: [(v) => v.length === 2, "A Binary Star must have exactly 2 members"],
        required: true,
    },
    // Sorted "idA_idB" — the unique key for the unordered pair. (A unique index
    // on the `members` ARRAY would instead cap each user to one Binary Star
    // ever, which is wrong; this scalar key enforces one-per-pair correctly.)
    pairKey:   { type: String, required: true },
    invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type:      { type: String, default: "binary_star" },
    status:    { type: String, enum: ["pending", "active", "dissolved"], default: "pending" },

    // Shared streak state (UTC day / ISO week scoped, like the personal streak).
    streak: {
        current:       { type: Number, default: 0 },
        longest:       { type: Number, default: 0 },
        lastBothDay:   { type: String, default: null },   // "YYYY-MM-DD" both acted
        milestonesHit: { type: [Number], default: [] },
    },
    // Per-member last action day: { "<userId>": "YYYY-MM-DD" }. Mixed so we can
    // key by id without a fixed schema; marked modified on write.
    lastActionDay: { type: mongoose.Schema.Types.Mixed, default: {} },

    // Shared Gravity Assist — one free freeze per ISO week, auto-consumed to
    // bridge a day the pair missed together.
    freeze: {
        tokens:        { type: Number, default: 0 },
        lastGrantWeek: { type: String, default: "" },
    },

    activatedAt: { type: Date, default: null },
    dissolvedAt: { type: Date, default: null },
}, { timestamps: true });

// At most one Binary Star per unordered pair.
binaryStarSchema.index({ pairKey: 1 }, { unique: true });
// Fast "my Binary Stars" lookups by status.
binaryStarSchema.index({ members: 1, status: 1 });

// Third arg keeps the on-disk collection as `constellations` so no data
// migration is needed; only the model name + filenames + URLs + UI labels
// change. A future slice can drop this third arg once the collection is
// renamed to `binary_stars` (TODO: post-slice cleanup).
module.exports = mongoose.models.BinaryStar || mongoose.model("BinaryStar", binaryStarSchema, "constellations");

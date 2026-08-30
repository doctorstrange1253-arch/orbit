/**
 * PactWeekLedger.js — per-week per-mentor capped signal counters.
 *
 * The Mentor Pact score is a composite of 4 signals, each with a per-source
 * weekly cap (anti-farming). The ledger stores the raw signal counts so we
 * can apply the cap on every read-then-write and only credit `user.pact.weekScore`
 * the capped amount. Auto-cleared on the weekly Sunday roll (`pactWorker`).
 *
 * `weekId` is "YYYY-Www" (ISO week), matching `user.pact.weekId`. The unique
 * index makes the read-then-write race-free at the per-week granularity.
 */
const mongoose = require("mongoose");

const PactWeekLedgerSchema = new mongoose.Schema({
    userId:  { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    weekId:  { type: String, required: true, index: true }, // "YYYY-Www"
    signals: {
        sessions:    { type: Number, default: 0 },
        ratingSum:   { type: Number, default: 0 },
        ratingCount: { type: Number, default: 0 },
        completions: { type: Number, default: 0 },
        qaAnswers:   { type: Number, default: 0 },
    },
}, { timestamps: true });

PactWeekLedgerSchema.index({ userId: 1, weekId: 1 }, { unique: true });
PactWeekLedgerSchema.index({ weekId: 1 });

module.exports = mongoose.models.PactWeekLedger || mongoose.model("PactWeekLedger", PactWeekLedgerSchema);

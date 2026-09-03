const mongoose = require("mongoose");

/**
 * PhotonLedger — append-only record of every Photon flow (Mission Control C6).
 * `delta` is positive for a source (earn) and negative for a sink (spend). This
 * is what lets the Gravimeter reconcile the economy and detect inflation
 * (supply growing faster than it's spent). Additive; best-effort writes.
 *
 * UNIT INVARIANT: `delta` is always Photons, never rupees or paise. Real money
 * belongs in MoneyLedger (double-entry, integer paise). Session payouts used to
 * be written here, which summed INR into the Photon supply and falsely tripped
 * the inflation alert. `isMoneySource` now rejects that at write time. The check
 * is token-based, not substring-based, so "mission_reroll" stays legal.
 */
const MONEY_WORDS = Object.freeze([
    "payout", "payouts", "settlement", "subscription", "invoice",
    "refund", "clawback", "rupee", "rupees", "inr", "paise",
]);

const MONEY_WORD_SET = new Set(MONEY_WORDS);

const MONEY_SOURCE = new RegExp(`(^|[^a-z])(${MONEY_WORDS.join("|")})([^a-z]|$)`, "i");

function isMoneySource(source) {
    return String(source || "")
        .toLowerCase()
        .split(/[^a-z]+/)
        .some((token) => token && MONEY_WORD_SET.has(token));
}

const photonLedgerSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    delta:  { type: Number, required: true },              // + earn / − spend
    source: { type: String, required: true },              // "milestone" | "mission" | "mastery" | "freeze" | "cosmetic" | ...
}, { timestamps: { createdAt: true, updatedAt: false } });

photonLedgerSchema.path("source").validate(
    (value) => !isMoneySource(value),
    "PhotonLedger counts Photons, not money. Write '{VALUE}' to MoneyLedger instead."
);

photonLedgerSchema.index({ createdAt: -1 });
photonLedgerSchema.index({ userId: 1, createdAt: -1 });
photonLedgerSchema.index({ source: 1, createdAt: -1 });

const PhotonLedger = mongoose.models.PhotonLedger || mongoose.model("PhotonLedger", photonLedgerSchema);

PhotonLedger.MONEY_WORDS = MONEY_WORDS;
PhotonLedger.MONEY_SOURCE = MONEY_SOURCE;
PhotonLedger.isMoneySource = isMoneySource;

module.exports = PhotonLedger;

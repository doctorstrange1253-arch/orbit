const mongoose = require("mongoose");

const MoneyLedgerSchema = new mongoose.Schema({
    txnId:  { type: String, required: true, index: true },
    seq:    { type: Number, required: true, min: 0 },
    at:     { type: Date, required: true, default: Date.now },
    kind: {
        type: String,
        required: true,
        enum: [
            "subscription_charge", "settlement", "payout", "refund", "clawback",
            "adjustment", "reserve_hold", "reserve_release", "tax_withheld",
        ],
    },
    account:        { type: String, required: true },
    counterAccount: { type: String, required: true },
    amountMinor:    { type: Number, required: true },
    currency:       { type: String, default: "INR" },
    refType: {
        type: String,
        required: true,
        enum: ["subscription_period", "course_seat", "session", "payout_batch", "refund", "manual"],
    },
    refId:           { type: String, required: true },
    idempotencyKey:  { type: String, required: true, unique: true },
    memo:            { type: String, default: "" },
    reversalOfTxnId: { type: String, default: null },
}, { timestamps: true });

MoneyLedgerSchema.index({ txnId: 1, seq: 1 }, { unique: true });
MoneyLedgerSchema.index({ account: 1, at: -1 });
MoneyLedgerSchema.index({ refType: 1, refId: 1 });
MoneyLedgerSchema.index({ kind: 1, at: -1 });

MoneyLedgerSchema.statics.balanceOf = async function balanceOf(account) {
    const [row] = await this.aggregate([
        { $match: { account } },
        { $group: { _id: null, total: { $sum: "$amountMinor" } } },
    ]);
    return row ? row.total : 0;
};

MoneyLedgerSchema.statics.auditUnbalanced = async function auditUnbalanced(limit = 20) {
    return this.aggregate([
        { $group: { _id: "$txnId", total: { $sum: "$amountMinor" }, rows: { $sum: 1 } } },
        { $match: { total: { $ne: 0 } } },
        { $limit: limit },
    ]);
};

MoneyLedgerSchema.statics.writeTxn = async function writeTxn(rows) {
    const out = [];
    for (const row of rows) {
        try {
            out.push(await this.create(row));
        } catch (err) {
            if (err && err.code === 11000) continue;
            throw err;
        }
    }
    return out;
};

module.exports = mongoose.models.MoneyLedger || mongoose.model("MoneyLedger", MoneyLedgerSchema);

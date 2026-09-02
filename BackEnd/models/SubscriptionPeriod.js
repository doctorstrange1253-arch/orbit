const mongoose = require("mongoose");

const SubscriptionPeriodSchema = new mongoose.Schema({
    subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: "Subscription", required: true, index: true },
    userId:         { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    planKey:        { type: String, required: true },
    periodIndex:    { type: Number, required: true, min: 0 },
    periodStart:    { type: Date, required: true },
    periodEnd:      { type: Date, required: true },
    entitlementEndsAt: { type: Date, required: true },
    seats:          { type: Number, required: true, min: 0 },

    grossMinor:       { type: Number, required: true, min: 0 },
    taxMinor:         { type: Number, required: true, min: 0 },
    netMinor:         { type: Number, required: true, min: 0 },
    platformCutPct:   { type: Number, required: true, min: 0, max: 100 },
    platformCutMinor: { type: Number, required: true, min: 0 },
    poolMinor:        { type: Number, required: true, min: 0 },

    charge: {
        provider:          { type: String, default: "razorpay" },
        providerInvoiceId: { type: String, default: null },
        providerPaymentId: { type: String, default: null },
        status: { type: String, enum: ["unpaid", "paid", "failed", "refunded", "partially_refunded"], default: "unpaid" },
        paidAt:        { type: Date, default: null },
        failedAt:      { type: Date, default: null },
        failureCode:   { type: String, default: null },
        refundedMinor: { type: Number, default: 0, min: 0 },
    },

    settlement: {
        status: { type: String, enum: ["open", "settling", "settled", "held", "void"], default: "open" },
        settledAt:         { type: Date, default: null },
        engagedSeats:      { type: Number, default: 0, min: 0 },
        distributedMinor:  { type: Number, default: 0, min: 0 },
        unallocatedMinor:  { type: Number, default: 0, min: 0 },
        unallocatedReason: { type: String, default: null },
        computeVersion:    { type: Number, default: 1 },
        txnId:             { type: String, default: null },
    },

    seatUse: {
        claimed:   { type: Number, default: 0, min: 0 },
        swapsUsed: { type: Number, default: 0, min: 0 },
    },
}, { timestamps: true });

SubscriptionPeriodSchema.index({ subscriptionId: 1, periodIndex: 1 }, { unique: true });
SubscriptionPeriodSchema.index({ "charge.providerInvoiceId": 1 }, { unique: true, sparse: true });
SubscriptionPeriodSchema.index({ "settlement.status": 1, periodEnd: 1 });
SubscriptionPeriodSchema.index({ "charge.status": 1, entitlementEndsAt: 1 });
SubscriptionPeriodSchema.index({ userId: 1, periodStart: -1 });

module.exports = mongoose.models.SubscriptionPeriod
    || mongoose.model("SubscriptionPeriod", SubscriptionPeriodSchema);

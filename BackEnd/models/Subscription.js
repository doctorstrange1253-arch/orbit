const mongoose = require("mongoose");

const SubscriptionSchema = new mongoose.Schema({
    userId:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    planId:   { type: mongoose.Schema.Types.ObjectId, ref: "Plan", required: true },
    planKey:  { type: String, required: true },
    status:   {
        type: String,
        enum: ["pending", "trialing", "active", "past_due", "paused", "cancelled", "expired"],
        default: "pending",
        index: true,
    },
    seatsGranted:            { type: Number, required: true, min: 0 },
    priceMinorSnapshot:      { type: Number, required: true, min: 0 },
    platformCutPctSnapshot:  { type: Number, required: true, min: 0, max: 100 },
    taxInclusiveSnapshot:    { type: Boolean, required: true },
    taxRatePctSnapshot:      { type: Number, required: true, min: 0, max: 100 },
    currency:                { type: String, default: "INR" },
    provider:                { type: String, default: "razorpay" },
    providerSubscriptionId:  { type: String, default: null },
    providerCustomerId:      { type: String, default: null },
    currentPeriodIndex:      { type: Number, default: 0, min: 0 },
    currentPeriodId:         { type: mongoose.Schema.Types.ObjectId, ref: "SubscriptionPeriod", default: null },
    startedAt:               { type: Date, default: null },
    trialEndsAt:             { type: Date, default: null },
    cancelAtPeriodEnd:       { type: Boolean, default: false },
    cancelledAt:             { type: Date, default: null },
    endedAt:                 { type: Date, default: null },
    pendingPlanId:           { type: mongoose.Schema.Types.ObjectId, ref: "Plan", default: null },
    pendingPlanEffectiveAt:  { type: Date, default: null },
    dunning: {
        attempts:        { type: Number, default: 0 },
        lastAttemptAt:   { type: Date, default: null },
        nextAttemptAt:   { type: Date, default: null },
        lastFailureCode: { type: String, default: null },
    },
}, { timestamps: true });

SubscriptionSchema.index({ userId: 1, status: 1 });
SubscriptionSchema.index({ providerSubscriptionId: 1 }, { unique: true, sparse: true });
SubscriptionSchema.index(
    { userId: 1 },
    {
        unique: true,
        partialFilterExpression: { status: { $in: ["trialing", "active", "past_due", "paused"] } },
    },
);

const LIVE = ["trialing", "active", "past_due", "paused"];
SubscriptionSchema.statics.LIVE_STATUSES = LIVE;
SubscriptionSchema.statics.findLiveFor = function findLiveFor(userId) {
    return this.findOne({ userId, status: { $in: LIVE } });
};

module.exports = mongoose.models.Subscription || mongoose.model("Subscription", SubscriptionSchema);

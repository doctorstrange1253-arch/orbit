const mongoose = require("mongoose");

const CourseSeatSchema = new mongoose.Schema({
    userId:         { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: "Subscription", required: true },
    periodId:       { type: mongoose.Schema.Types.ObjectId, ref: "SubscriptionPeriod", required: true, index: true },
    courseId:       { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    mentorId:       { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    status: {
        type: String,
        enum: ["active", "carried", "released", "forfeited", "expired"],
        default: "active",
        index: true,
    },
    claimedAt:          { type: Date, default: Date.now },
    releasedAt:         { type: Date, default: null },
    releaseEffectiveAt: { type: Date, default: null },
    carriedFromSeatId:  { type: mongoose.Schema.Types.ObjectId, ref: "CourseSeat", default: null },
    swap:               { type: Boolean, default: false },

    engagement: {
        gatedLessonsCompleted: { type: Number, default: 0, min: 0 },
        stagesCleared:         { type: Number, default: 0, min: 0 },
        firstGatedAt:          { type: Date, default: null },
        lastGatedAt:           { type: Date, default: null },
        distinctDays:          { type: Number, default: 0, min: 0 },
        moneyEligible:         { type: Boolean, default: false },
        eligibleAt:            { type: Date, default: null },
    },

    settlement: {
        shareMinor:      { type: Number, default: 0, min: 0 },
        flatMinor:       { type: Number, default: 0, min: 0 },
        meritMinor:      { type: Number, default: 0, min: 0 },
        settledAt:       { type: Date, default: null },
        ledgerTxnId:     { type: String, default: null },
        forfeitedReason: { type: String, default: null },
    },
}, { timestamps: true });

CourseSeatSchema.index({ periodId: 1, courseId: 1 }, { unique: true });
CourseSeatSchema.index({ userId: 1, periodId: 1 });
CourseSeatSchema.index({ periodId: 1, "engagement.moneyEligible": 1 });
CourseSeatSchema.index({ courseId: 1, status: 1 });
CourseSeatSchema.index({ mentorId: 1, claimedAt: -1 });

module.exports = mongoose.models.CourseSeat || mongoose.model("CourseSeat", CourseSeatSchema);

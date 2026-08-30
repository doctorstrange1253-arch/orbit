const mongoose = require("mongoose");

/**
 * OrbitSession — per-booking business record. Pairs a student with a mentor
 * for a paid 1-on-1 video session.
 *
 * Pricing is SNAPSHOTTED at booking time:
 *   - rateInr            = mentor.hourlyRateInr
 *   - totalInr           = round(rateInr * durationMin / 60)
 *   - platformCutPct     = configStore("SESSION_PLATFORM_CUT_PERCENT")
 *   - platformCutInr     = floor(totalInr * pct/100)
 *   - mentorPayoutInr    = totalInr - platformCutInr  (IMMUTABLE)
 *
 * The FSM moves forward only:
 *   pending_payment → booked → confirmed → live → completed
 *                    │                       │
 *                    └→ cancelled            └→ no_show
 *                    └→ disputed  (admin only)
 *
 * `roomId` is the deterministic WebRTC room name (PREFIXED `Session-` to
 * avoid collisions with the free `SkillSwap-` video-call rooms).
 */
const orbitSessionSchema = new mongoose.Schema({
    mentorProfileId: { type: mongoose.Schema.Types.ObjectId, ref: "MentorProfile", required: true },
    studentId:       { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    mentorId:        { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },   // denormalized

    status: {
        type: String,
        enum: [
            "pending_payment", "booked", "confirmed", "live",
            "completed", "cancelled", "disputed", "no_show",
        ],
        default: "pending_payment",
    },

    // Pricing snapshot (immutable after `booked`).
    rateInr:        { type: Number, required: true, min: 0 },
    durationMin:    { type: Number, required: true, enum: [30, 45, 60] },
    totalInr:       { type: Number, required: true, min: 0 },
    platformCutPct: { type: Number, required: true, min: 0, max: 100 },
    platformCutInr: { type: Number, required: true, min: 0 },
    mentorPayoutInr:{ type: Number, required: true, min: 0 },
    tipInr:         { type: Number, default: 0 },      // READY for the future tipping slice

    // Scheduling — UTC always; `timezone` is the student's IANA for display.
    scheduledAt: { type: Date, required: true },
    timezone:    { type: String, default: "Asia/Kolkata" },

    // Deterministic WebRTC room (prefixed to avoid free-call room collision).
    roomId: { type: String, required: true },

    // Payment (Razorpay in this slice; the wrapper is the only entry point).
    payment: {
        provider:    { type: String, default: "razorpay" },
        orderId:     { type: String, required: true },
        paymentId:   { type: String, default: null },
        signature:   { type: String, default: null },
        status:      { type: String, enum: ["created", "held", "released", "refunded", "failed"], default: "created" },
        capturedAt:  { type: Date,   default: null },
        releasedAt:  { type: Date,   default: null },
        refundedAt:  { type: Date,   default: null },
    },

    // Two-way rating (optional; both sides may rate independently).
    studentRating: { stars: { type: Number, min: 1, max: 5, default: null },
                     comment: { type: String, default: null },
                     createdAt: { type: Date, default: null } },
    mentorRating:  { stars: { type: Number, min: 1, max: 5, default: null },
                     comment: { type: String, default: null },
                     createdAt: { type: Date, default: null } },

    startedAt:   { type: Date, default: null },
    endedAt:     { type: Date, default: null },
    durationSec: { type: Number, default: 0 },
    cancelReason:{ type: String, default: null },

    // Worker bookkeeping (T-30min reminder, auto no-show)
    reminderSentAt: { type: Date, default: null },
    noShowMarkedAt: { type: Date, default: null },
}, { timestamps: true });

orbitSessionSchema.index({ studentId: 1, createdAt: -1 });
orbitSessionSchema.index({ mentorId: 1, createdAt: -1 });
orbitSessionSchema.index({ status: 1, scheduledAt: 1 });
orbitSessionSchema.index({ "payment.orderId": 1 }, { unique: true });
orbitSessionSchema.index({ roomId: 1 });

module.exports = mongoose.models.OrbitSession || mongoose.model("OrbitSession", orbitSessionSchema);

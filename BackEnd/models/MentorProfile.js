const mongoose = require("mongoose");

/**
 * MentorProfile — 1:1 with User. Holds the application status (admin gate),
 * the public profile fields, weekly availability, and the denormalized rating
 * totals (count + sum + average) that the Sessions browse page sorts on.
 *
 * `payoutMultiplier` is the share of the booking total that goes to the mentor:
 *  - 0.85 by default
 *  - 0.90 once `rating.count >= 20 AND rating.average >= 4.8`
 * The platform cut is `1 - payoutMultiplier` and is recorded immutably on
 * each OrbitSession at booking time so later overrides never re-litigate old
 * sessions.
 *
 * Hot-reload guard: `mongoose.models.X || mongoose.model("X", schema)`.
 */
const mentorProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
    },
    applicationStatus: {
        type: String,
        enum: ["draft", "submitted", "approved", "rejected", "suspended"],
        default: "draft",
    },
    // ── Public profile ─────────────────────────────────────────────────────
    headline:    { type: String, default: "", maxlength: 120 },
    bio:         { type: String, default: "", maxlength: 2000 },
    skills:      [{ type: mongoose.Schema.Types.ObjectId, ref: "Skill" }],

    // ── Pricing (INR) ──────────────────────────────────────────────────────
    hourlyRateInr: { type: Number, required: true, min: 0 },
    currency:      { type: String, default: "INR" },

    // ── Payout share (denormalized so the admin doesn't need to re-derive) ─
    payoutMultiplier: { type: Number, default: 0.85, min: 0, max: 1 },

    // ── Scheduling ─────────────────────────────────────────────────────────
    timezone: { type: String, default: "Asia/Kolkata" },   // IANA, e.g. "Asia/Kolkata"
    availability: {
        weekly: [{
            dayOfWeek: { type: Number, min: 0, max: 6 },
            slots: [{
                startUtcHour: { type: Number, min: 0, max: 23 },
                durationMin:  { type: Number, min: 15, max: 240 },
            }],
        }],
    },

    // ── Denormalized rating (source of truth = OrbitSession.studentRating) ──
    rating: {
        count:   { type: Number, default: 0 },
        sum:     { type: Number, default: 0 },
        average: { type: Number, default: 0 },
    },
    ratingCutEligibleSince: { type: Date, default: null },

    // ── Lifecycle ─────────────────────────────────────────────────────────
    status: { type: String, enum: ["active", "paused"], default: "active" },
}, { timestamps: true });

mentorProfileSchema.index({ applicationStatus: 1, status: 1 });
mentorProfileSchema.index({ "rating.average": -1 });

module.exports = mongoose.models.MentorProfile || mongoose.model("MentorProfile", mentorProfileSchema);

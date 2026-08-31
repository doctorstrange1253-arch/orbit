/**
 * SignalFlare.js — a student's "I need this genre" request.
 *
 * When a student browses to a Constellation → genre with no published
 * courses, they can launch a Signal Flare. A row records: who asked,
 * for which constellation + genre, when, and (optionally) which course
 * answered it.
 *
 * V3 design: a Flare is not a "vote" or a "request ticket." It's a
 * one-time signal. Each (userId, constellation, genre) pair can have
 * at most one active flare. When a mentor publishes a course in that
 * genre, the flare gets `respondedCourseId` set and the student gets
 * a notification.
 *
 * Indexes:
 *   - (constellation, genre) for the counter (how many students are
 *     waiting) and the mentor scan.
 *   - (userId, constellation, genre) for the "have I already flared
 *     this?" check.
 *   - (respondedCourseId) sparse for "who got notified about this
 *     course" lookups.
 */

const mongoose = require("mongoose");

const SignalFlareSchema = new mongoose.Schema({
    userId:        { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    constellation: { type: String, required: true, lowercase: true, trim: true, maxlength: 60 },
    genre:         { type: String, required: true, lowercase: true, trim: true, maxlength: 60 },
    sentAt:        { type: Date, default: Date.now },
    // When a mentor publishes a course in this genre, the controller
    // sets this to the new course's id. The student gets notified.
    respondedCourseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", default: null },
    respondedAt:       { type: Date, default: null },
}, { timestamps: true });

SignalFlareSchema.index({ constellation: 1, genre: 1 });
SignalFlareSchema.index({ userId: 1, constellation: 1, genre: 1 }, { unique: true });
SignalFlareSchema.index({ respondedCourseId: 1 }, { sparse: true });

module.exports = mongoose.models.SignalFlare || mongoose.model("SignalFlare", SignalFlareSchema);

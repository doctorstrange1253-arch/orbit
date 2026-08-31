/**
 * ModerationReview.js — the mentor-private Yellow Card record.
 *
 * When the moderation pipeline flags a lesson (audio keyword scan or
 * random sample), we record:
 *   - the lesson
 *   - the timestamps + text + reason for each hit
 *   - the mentor's response (edited / appealed / cleared)
 *   - whether the mentor flagged it as a false positive
 *
 * Indexes:
 *   - (mentorId, status) for the mentor's Moderation Inbox
 *   - (mentorId, falsePositive, createdAt) for the false-positive
 *     rate adaptation
 */

const mongoose = require("mongoose");

const ModerationReviewSchema = new mongoose.Schema({
    mentorId:     { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    courseId:     { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    lessonId:     { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    // Array of { timestampSec, text, reason } hits from the keyword scan.
    hits:         [{
        timestampSec: { type: Number, required: true },
        text:         { type: String, required: true },
        reason:       { type: String, required: true },
        _id:         false,
    }],
    status:       { type: String, enum: ["pending", "edited", "appealed", "cleared"], default: "pending", index: true },
    appealNote:   { type: String, default: null, maxlength: 1000 },
    falsePositive:{ type: Boolean, default: false, index: true },
    createdAt:    { type: Date, default: Date.now, index: true },
    reviewedAt:   { type: Date, default: null },
}, { timestamps: true });

ModerationReviewSchema.index({ mentorId: 1, status: 1, createdAt: -1 });
ModerationReviewSchema.index({ mentorId: 1, falsePositive: 1, createdAt: -1 });

module.exports = mongoose.models.ModerationReview || mongoose.model("ModerationReview", ModerationReviewSchema);

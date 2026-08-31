/**
 * MentorInvite.js — a cross-soul economy nudge.
 *
 * Two flavors:
 *   - "Top-5% Student" — the user is in the top 5% of weekly XP earners
 *     for the last 90 days. Invited to consider applying to be a mentor.
 *   - "Top Swapper"    — the user has 10+ peer swaps with avg 4.5+ rating.
 *
 * Stored as a Notification-shaped row + a cooldown window. If the user
 * dismisses (snoozes), we wait 90 days before inviting again.
 *
 * V3 design: the invitation is rare. The user is invited at most once
 * per 90 days. The system never nags.
 */

const mongoose = require("mongoose");

const MentorInviteSchema = new mongoose.Schema({
    userId:      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    kind:        { type: String, enum: ["top_student", "top_swapper"], required: true },
    // Snapshot of the metrics at invite time (for analytics; the live
    // numbers live on the user doc).
    metrics:     { type: mongoose.Schema.Types.Mixed, default: {} },
    // The user can dismiss with "Not now" (cooldown until +90d) or
    // accept and start the mentor application.
    status:      { type: String, enum: ["pending", "accepted", "dismissed"], default: "pending" },
    sentAt:      { type: Date, default: Date.now },
    respondedAt: { type: Date, default: null },
    cooldownUntil: { type: Date, default: null },
}, { timestamps: true });

MentorInviteSchema.index({ userId: 1, kind: 1, sentAt: -1 });
MentorInviteSchema.index({ status: 1, cooldownUntil: 1 });

module.exports = mongoose.models.MentorInvite || mongoose.model("MentorInvite", MentorInviteSchema);

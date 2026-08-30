/**
 * XpEvent.js — append-only audit log of every XP grant.
 *
 * Single collection of all events powers:
 *   - the /gameology/history feed (recent N)
 *   - achievement counts ("how many `course_completed` events has this user?")
 *   - the streak timeline
 *   - debug & analytics
 *
 * Indexed on (userId, createdAt) for the history feed and (userId, event)
 * for achievement counting. No update/delete — this is a ledger.
 */
const mongoose = require("mongoose");

const XpEventSchema = new mongoose.Schema({
    userId:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    event:     {
        type: String,
        required: true,
        enum: [
            "lesson_completed", "quiz_passed", "course_completed",
            "session_completed", "peer_swap_completed", "streak_bonus",
            "peer_help_posted", "achievement_unlocked",
        ],
        index: true,
    },
    xpAwarded: { type: Number, required: true, min: 0 },
    metadata:  { type: mongoose.Schema.Types.Mixed, default: {} },
    createdAt: { type: Date, default: Date.now, index: true },
}, { timestamps: false }); // we own createdAt explicitly; Mongoose's would collide

XpEventSchema.index({ userId: 1, createdAt: -1 });
XpEventSchema.index({ userId: 1, event: 1, createdAt: -1 });

module.exports = mongoose.models.XpEvent || mongoose.model("XpEvent", XpEventSchema);

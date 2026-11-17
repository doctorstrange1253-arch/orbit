const mongoose = require("mongoose");

/**
 * CourseRequest — Crowdsourced course request engine with deduplication clustering,
 * upvotes, threshold tracking, and mentor claim workflows.
 */
const courseRequestSchema = new mongoose.Schema({
    topic: { type: String, required: true, trim: true },
    category: { type: String, required: true, index: true },
    description: { type: String, default: "" },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    votes: { type: Number, default: 1 },
    voters: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    clusterKey: { type: String, required: true }, // Normalized slug for deduplication
    status: {
        type: String,
        enum: ["pending", "notified", "claimed", "published"],
        default: "pending",
        index: true
    },
    claimedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    claimedAt: { type: Date, default: null }
}, { timestamps: true });

courseRequestSchema.index({ clusterKey: 1 }, { unique: true });
courseRequestSchema.index({ category: 1, votes: -1 });

module.exports = mongoose.models.CourseRequest || mongoose.model("CourseRequest", courseRequestSchema);

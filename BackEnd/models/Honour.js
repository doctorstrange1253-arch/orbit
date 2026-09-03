const mongoose = require("mongoose");

const honourSchema = new mongoose.Schema({
    fromUserId:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    mentorUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    tier:         { type: String, enum: ["beacon", "comet", "supernova"], required: true },
    photons:      { type: Number, required: true, min: 1 },
    note:         { type: String, default: "", maxlength: 240 },
    day:          { type: String, required: true },
}, { timestamps: { createdAt: true, updatedAt: false } });

honourSchema.index({ fromUserId: 1, mentorUserId: 1, day: 1 }, { unique: true });
honourSchema.index({ mentorUserId: 1, createdAt: -1 });

module.exports = mongoose.models.Honour || mongoose.model("Honour", honourSchema);

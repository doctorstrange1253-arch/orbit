const mongoose = require("mongoose");

const sideSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    score:  { type: Number, default: 0, min: 0 },
}, { _id: false });

const duelSchema = new mongoose.Schema({
    weekId:      { type: String, required: true },
    challenger:  { type: sideSchema, required: true },
    opponent:    { type: sideSchema, required: true },
    status:      { type: String, enum: ["pending", "active", "settled", "declined", "expired"], default: "pending", index: true },
    winnerId:    { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    draw:        { type: Boolean, default: false },
    settledAt:   { type: Date, default: null },
    payoutPhotons: { type: Number, default: 0 },
}, { timestamps: true });

duelSchema.index({ weekId: 1, "challenger.userId": 1, "opponent.userId": 1 }, { unique: true });
duelSchema.index({ "challenger.userId": 1, status: 1, weekId: 1 });
duelSchema.index({ "opponent.userId": 1, status: 1, weekId: 1 });

module.exports = mongoose.models.Duel || mongoose.model("Duel", duelSchema);

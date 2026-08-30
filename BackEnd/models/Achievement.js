/**
 * Achievement.js — the achievement catalog.
 *
 * `key` is the stable id used in code and `user.gameology.achievements[]`.
 * The actual unlock logic lives in `services/gameologyService.checkAchievements`
 * (pure over the catalog + the user's stats) so we can re-derive unlocks on
 * read without trusting a stale state.
 *
 * Seeded once via `scripts/seedAchievements.js` (gated by RUN_ACHIEVEMENT_SEED).
 * After seed, new achievements are added by inserting a new doc — no migration.
 */
const mongoose = require("mongoose");

const AchievementSchema = new mongoose.Schema({
    key:         { type: String, required: true, unique: true }, // "FIRST_LESSON", "STREAK_7"
    title:       { type: String, required: true },               // "First Liftoff"
    description: { type: String, default: "" },
    icon:        { type: String, default: "🏅" },                // emoji or asset key
    rarity:      { type: String, enum: ["common", "rare", "epic", "mythic"], default: "common" },
    xpReward:    { type: Number, default: 0 },
    rule:        { type: String, default: "" },                  // human-readable; engine uses key
}, { timestamps: true });

module.exports = mongoose.models.Achievement || mongoose.model("Achievement", AchievementSchema);

const Duel = require("../models/Duel");

/**
 * addDuelPoints — credit one participant's side of this week's active duel.
 * Two guarded updates rather than a read-then-write, so concurrent actions
 * cannot lose points to a lost race, and a user with no duel is two cheap
 * no-ops.
 */
async function addDuelPoints(userId, points, weekId) {
    if (!userId || !points || points <= 0 || !weekId) return false;
    const asChallenger = await Duel.updateOne(
        { weekId, status: "active", "challenger.userId": userId },
        { $inc: { "challenger.score": points } },
    );
    if (asChallenger.modifiedCount) return true;
    const asOpponent = await Duel.updateOne(
        { weekId, status: "active", "opponent.userId": userId },
        { $inc: { "opponent.score": points } },
    );
    return !!asOpponent.modifiedCount;
}

module.exports = { addDuelPoints };

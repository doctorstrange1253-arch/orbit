const WIN_PHOTONS  = 150;
const DRAW_PHOTONS = 40;

const LIVE_STATUSES = Object.freeze(["pending", "active"]);

function sideOf(duel, userId) {
    const me = String(userId);
    if (String(duel?.challenger?.userId) === me) return "challenger";
    if (String(duel?.opponent?.userId) === me) return "opponent";
    return null;
}

/**
 * settle — pure decision for one finished duel. Higher score wins; equal scores
 * draw, and a draw pays both sides the smaller purse rather than nothing, so a
 * week where two peers matched each other still reads as a week well spent.
 */
function settle(duel) {
    const mine = Math.max(0, Number(duel?.challenger?.score) || 0);
    const theirs = Math.max(0, Number(duel?.opponent?.score) || 0);
    if (mine === theirs) {
        return { status: "settled", winnerId: null, draw: true, payoutPhotons: DRAW_PHOTONS };
    }
    return {
        status: "settled",
        winnerId: mine > theirs ? duel.challenger.userId : duel.opponent.userId,
        draw: false,
        payoutPhotons: WIN_PHOTONS,
    };
}

/** What this duel meant for one participant, once it is over. */
function outcomeFor(duel, userId) {
    if (!duel || duel.status !== "settled") return null;
    if (duel.draw) return "drew";
    return String(duel.winnerId) === String(userId) ? "won" : "lost";
}

/** Client shape: always "you" first, so the UI never has to work out which side. */
function shapeDuel(duel, userId, names = new Map()) {
    if (!duel) return null;
    const side = sideOf(duel, userId);
    const meSide = side === "opponent" ? duel.opponent : duel.challenger;
    const themSide = side === "opponent" ? duel.challenger : duel.opponent;
    const themId = String(themSide.userId);
    return {
        _id: String(duel._id),
        weekId: duel.weekId,
        status: duel.status,
        iChallenged: side === "challenger",
        you: { score: meSide.score || 0 },
        them: {
            userId: themId,
            name: names.get(themId)?.name || "A peer",
            avatar: names.get(themId)?.avatar || "",
            score: themSide.score || 0,
        },
        outcome: outcomeFor(duel, userId),
        payoutPhotons: duel.payoutPhotons || 0,
        settledAt: duel.settledAt,
        createdAt: duel.createdAt,
    };
}

/** Win/loss/draw tally from a list of settled duels. */
function recordFrom(duels, userId) {
    const record = { won: 0, lost: 0, drew: 0 };
    for (const d of duels || []) {
        const o = outcomeFor(d, userId);
        if (o === "won") record.won += 1;
        else if (o === "lost") record.lost += 1;
        else if (o === "drew") record.drew += 1;
    }
    return record;
}

module.exports = { WIN_PHOTONS, DRAW_PHOTONS, LIVE_STATUSES, sideOf, settle, outcomeFor, shapeDuel, recordFrom };

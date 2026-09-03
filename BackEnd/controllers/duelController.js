const mongoose = require("mongoose");
const User = require("../models/user");
const Connection = require("../models/Connection");
const Duel = require("../models/Duel");
const duels = require("../services/duels");
const photonLedger = require("../services/photonLedger");
const { isoWeekId } = require("../services/orbitActivity");
const { createNotification } = require("../services/notify");

function liveFilter(userId, weekId) {
    return {
        weekId,
        status: { $in: duels.LIVE_STATUSES },
        $or: [{ "challenger.userId": userId }, { "opponent.userId": userId }],
    };
}

async function namesFor(ids) {
    const users = await User.find({ _id: { $in: ids } }).select("name avatar").lean();
    return new Map(users.map((u) => [String(u._id), u]));
}

/**
 * settleStale — close out anything left over from a previous week. Runs on read
 * so no cron is needed, mirroring how the weekly mission roll self-heals. The
 * status guard in the update means only one caller can ever pay a given duel.
 */
async function settleStale(userId, weekId, io) {
    const stale = await Duel.find({
        status: { $in: duels.LIVE_STATUSES },
        weekId: { $ne: weekId },
        $or: [{ "challenger.userId": userId }, { "opponent.userId": userId }],
    }).lean();

    for (const duel of stale) {
        if (duel.status === "pending") {
            await Duel.updateOne({ _id: duel._id, status: "pending" }, { $set: { status: "expired", settledAt: new Date() } });
            continue;
        }
        const result = duels.settle(duel);
        const claimed = await Duel.updateOne(
            { _id: duel._id, status: "active" },
            { $set: { ...result, settledAt: new Date() } },
        );
        if (!claimed.matchedCount) continue;

        const winners = result.draw
            ? [duel.challenger.userId, duel.opponent.userId]
            : [result.winnerId];
        for (const id of winners) {
            await User.updateOne({ _id: id }, { $inc: { "orbit.stardust": result.payoutPhotons } });
            photonLedger.record(id, result.payoutPhotons, "duel_settled");
            createNotification(io, id, {
                type: "orbit_duel_settled",
                title: result.draw ? "Your duel ended level" : "You won your duel",
                body: `${duel.challenger.score}–${duel.opponent.score} — ${result.payoutPhotons} Photons awarded.`,
                data: { link: "/orbit", duelId: String(duel._id) },
            }).catch(() => {});
        }
        if (!result.draw) {
            const loser = String(result.winnerId) === String(duel.challenger.userId) ? duel.opponent.userId : duel.challenger.userId;
            createNotification(io, loser, {
                type: "orbit_duel_settled",
                title: "Your duel is over",
                body: `${duel.challenger.score}–${duel.opponent.score} this time. A new week, a new duel.`,
                data: { link: "/orbit", duelId: String(duel._id) },
            }).catch(() => {});
        }
    }
}

exports.mine = async (req, res) => {
    try {
        const meId = new mongoose.Types.ObjectId(String(req.user.id));
        const weekId = isoWeekId(new Date());
        await settleStale(meId, weekId, req.app.get("io"));

        const current = await Duel.findOne(liveFilter(meId, weekId)).lean();
        const history = await Duel.find({
            status: "settled",
            $or: [{ "challenger.userId": meId }, { "opponent.userId": meId }],
        }).sort({ settledAt: -1 }).limit(10).lean();

        const ids = new Set();
        for (const d of [current, ...history].filter(Boolean)) {
            ids.add(String(d.challenger.userId));
            ids.add(String(d.opponent.userId));
        }
        const names = await namesFor([...ids]);

        return res.json({
            weekId,
            winPhotons: duels.WIN_PHOTONS,
            drawPhotons: duels.DRAW_PHOTONS,
            current: duels.shapeDuel(current, meId, names),
            history: history.map((d) => duels.shapeDuel(d, meId, names)),
            record: duels.recordFrom(history, meId),
        });
    } catch (err) {
        console.error("duels.mine:", err);
        return res.status(500).json({ message: "Server error" });
    }
};

exports.challenge = async (req, res) => {
    try {
        const meId = new mongoose.Types.ObjectId(String(req.user.id));
        const { toUserId } = req.body || {};
        if (!toUserId || !mongoose.isValidObjectId(toUserId)) return res.status(400).json({ message: "Invalid opponent" });
        if (String(toUserId) === String(meId)) return res.status(400).json({ message: "You cannot duel yourself", reason: "self" });

        const weekId = isoWeekId(new Date());
        await settleStale(meId, weekId, req.app.get("io"));

        const connected = await Connection.exists({
            status: { $in: ["accepted", "completed"] },
            $or: [
                { requester: meId, receiver: toUserId },
                { requester: toUserId, receiver: meId },
            ],
        });
        if (!connected) {
            return res.status(403).json({ message: "You can only duel a peer you have swapped with", reason: "not_connected" });
        }

        const opponentId = new mongoose.Types.ObjectId(String(toUserId));
        if (await Duel.exists(liveFilter(meId, weekId))) {
            return res.status(409).json({ message: "You already have a duel this week", reason: "already_duelling" });
        }
        if (await Duel.exists(liveFilter(opponentId, weekId))) {
            return res.status(409).json({ message: "They are already duelling this week", reason: "opponent_busy" });
        }

        let duel;
        try {
            duel = await Duel.create({
                weekId,
                challenger: { userId: meId, score: 0 },
                opponent: { userId: opponentId, score: 0 },
                status: "pending",
            });
        } catch (err) {
            if (err?.code === 11000) return res.status(409).json({ message: "That duel already exists", reason: "duplicate" });
            throw err;
        }

        const me = await User.findById(meId).select("name").lean();
        createNotification(req.app.get("io"), opponentId, {
            type: "orbit_duel_challenge",
            title: "You have been challenged",
            body: `${me?.name || "A peer"} wants to duel you this week. Whoever earns more Orbit XP wins.`,
            data: { link: "/orbit", duelId: String(duel._id) },
        }).catch(() => {});

        const names = await namesFor([String(meId), String(opponentId)]);
        return res.status(201).json({ current: duels.shapeDuel(duel.toObject(), meId, names) });
    } catch (err) {
        console.error("duels.challenge:", err);
        return res.status(500).json({ message: "Server error" });
    }
};

exports.respond = async (req, res) => {
    try {
        const meId = new mongoose.Types.ObjectId(String(req.user.id));
        const accept = req.body?.accept !== false;
        const duel = await Duel.findById(req.params.id).lean();
        if (!duel) return res.status(404).json({ message: "Duel not found" });
        if (String(duel.opponent.userId) !== String(meId)) {
            return res.status(403).json({ message: "Only the challenged peer can answer", reason: "not_yours" });
        }
        if (duel.status !== "pending") {
            return res.status(409).json({ message: "That duel is no longer open", reason: duel.status });
        }
        if (duel.weekId !== isoWeekId(new Date())) {
            await Duel.updateOne({ _id: duel._id, status: "pending" }, { $set: { status: "expired", settledAt: new Date() } });
            return res.status(409).json({ message: "That challenge was for last week", reason: "expired" });
        }

        const upd = await Duel.updateOne(
            { _id: duel._id, status: "pending" },
            { $set: { status: accept ? "active" : "declined", ...(accept ? {} : { settledAt: new Date() }) } },
        );
        if (!upd.matchedCount) return res.status(409).json({ message: "That duel was already answered", reason: "raced" });

        createNotification(req.app.get("io"), duel.challenger.userId, {
            type: "orbit_duel_answered",
            title: accept ? "Your duel is on" : "Your challenge was declined",
            body: accept ? "Whoever earns more Orbit XP by Monday takes the week." : "Try someone else, or try again next week.",
            data: { link: "/orbit", duelId: String(duel._id) },
        }).catch(() => {});

        const fresh = await Duel.findById(duel._id).lean();
        const names = await namesFor([String(duel.challenger.userId), String(duel.opponent.userId)]);
        return res.json({ current: accept ? duels.shapeDuel(fresh, meId, names) : null });
    } catch (err) {
        console.error("duels.respond:", err);
        return res.status(500).json({ message: "Server error" });
    }
};

exports.settleStale = settleStale;

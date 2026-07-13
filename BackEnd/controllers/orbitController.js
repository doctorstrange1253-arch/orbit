/**
 * orbitController.js — the read/claim/spend API for the Orbit Engine.
 * Delegates all math to services/orbitEngine.js and all persistence rules to
 * services/orbitActivity.js. Every handler self-heals the weekly rollovers on
 * read, so a user who's been away still gets the current week's missions and
 * their weekly Gravity Assist.
 */

const User = require("../models/user");
const engine = require("../services/orbitEngine");
const league = require("../services/leagueService");
const cfg = require("../services/orbitConfig");
const flags = require("../services/orbitFlags");
const { utcDayStr, rollForward } = require("../services/orbitActivity");

// Build the client payload from a fully-rolled orbit object.
function shapeOrbit(orbit, now = new Date()) {
    const today = utcDayStr(now);
    const decay = engine.decayState(orbit.streak, today);
    const next = engine.nextMilestone(orbit.streak.current);
    // Graduation phase (Part 3): pressure eases as the habit matures.
    const grad = engine.graduationStatus(orbit.streak.current, orbit.streak.longest, {
        formationMax: cfg.PHASES.formationMax,
        consistencyMax: cfg.PHASES.consistencyMax,
    });
    // S-01: a streak that has truly lapsed (idle beyond any Gravity Assist rescue)
    // reads as 0, so a broken streak visibly resets instead of showing a stale count.
    const missedDays = decay.state === "idle" ? Math.max(0, (decay.daysSince || 0) - 1) : 0;
    const streakSurvives =
        decay.state !== "idle" ||
        (orbit.streak.current > 0 && orbit.freeze.tokens >= missedDays);
    const displayCurrent = streakSurvives ? orbit.streak.current : 0;
    return {
        streak: {
            current: displayCurrent,
            longest: orbit.streak.longest,
            lastActionDay: orbit.streak.lastActionDay,
            state: decay.state,                    // active | decaying | idle
            actedToday: decay.state === "active",
            phase: grad.phase,                     // formation | consistency | graduation
            graduated: grad.graduated,             // sticky (from longest)
            badge: grad.badge,                     // "Fixed Star" | "Constant" | null
            pressure: grad.pressure,               // high | soft | none (UI countdown emphasis)
        },
        prefs: { decayReminders: !(orbit.prefs && orbit.prefs.decayReminders === false) },
        freeze: {
            tokens: orbit.freeze.tokens,
            cap: engine.FREEZE_CAP,
            // Currency rename (Part 0): `costPhotons` is canonical; `costStardust`
            // kept for one release so lagging clients don't break.
            costPhotons: engine.FREEZE_STARDUST_COST,
            costStardust: engine.FREEZE_STARDUST_COST,
        },
        // Part 0: `photons` is the canonical currency field; `stardust` is emitted
        // in parallel through the deprecation window (remove next release).
        photons: orbit.stardust,
        stardust: orbit.stardust,
        missions: (orbit.missions.items || []).map((m) => ({
            key: m.key,
            label: m.label,
            description: m.description,
            metric: m.metric,
            target: m.target,
            progress: m.progress,
            photons: m.stardust,
            stardust: m.stardust,
            xp: cfg.XP.missionClaim,
            claimed: m.claimed,
            complete: m.progress >= m.target,
        })),
        missionsWeekId: orbit.missions.weekId,
        // Photon gifting — limits + how much of today's allowance remains.
        gift: {
            min: engine.GIFT_MIN,
            max: engine.GIFT_MAX,
            dailyCap: engine.GIFT_DAILY_CAP,
            sentToday: (orbit.gifting && orbit.gifting.day === today) ? (orbit.gifting.sent || 0) : 0,
        },
        // Mission swap (reroll): one per week, costs Photons, only on missions
        // that aren't complete/claimed yet.
        missionReroll: {
            cost: engine.MISSION_REROLL_COST,
            perWeek: engine.REROLLS_PER_WEEK,
            used: orbit.missions.rerollsUsed || 0,
            available: (orbit.missions.rerollsUsed || 0) < engine.REROLLS_PER_WEEK,
        },
        nextMilestone: next,                       // { days, name, stardust } | null
        milestones: engine.MILESTONES,             // full ladder for the UI
        nextResetUTC: `${today}T24:00:00Z`,        // end of the current UTC day
    };
}

// GET /api/orbit/me — the user's full orbit state (self-heals weekly rollovers).
exports.getMyOrbit = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("orbit").lean();
        if (!user) return res.status(404).json({ message: "User not found" });

        const { orbit, changed } = rollForward(user.orbit);
        if (changed) User.updateOne({ _id: req.user.id }, { $set: { orbit } }).catch(() => {});

        // Staged-rollout flags (Part 8) so the UI can hide tiers not live for this user.
        return res.status(200).json({ ...shapeOrbit(orbit), flags: flags.flagsFor(req.user.id) });
    } catch (err) {
        console.error("getMyOrbit error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// POST /api/orbit/prefs — user-controllable engagement preferences (Part 4).
// Currently the decay-reminder opt-out. Additive; body { decayReminders: bool }.
exports.setPrefs = async (req, res) => {
    try {
        const set = {};
        if (typeof req.body.decayReminders === "boolean") {
            set["orbit.prefs.decayReminders"] = req.body.decayReminders;
        }
        if (!Object.keys(set).length) return res.status(400).json({ message: "No valid preferences supplied" });

        await User.updateOne({ _id: req.user.id }, { $set: set });
        const user = await User.findById(req.user.id).select("orbit.prefs").lean();
        return res.status(200).json({ prefs: { decayReminders: !(user.orbit && user.orbit.prefs && user.orbit.prefs.decayReminders === false) } });
    } catch (err) {
        console.error("setPrefs error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// POST /api/orbit/missions/:key/claim — claim a completed mission's Stardust.
exports.claimMission = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("orbit").lean();
        if (!user) return res.status(404).json({ message: "User not found" });

        let { orbit } = rollForward(user.orbit);
        const result = engine.claimMission(orbit.missions, req.params.key);
        if (!result.ok) {
            return res.status(400).json({ message: "Mission not claimable", reason: result.reason });
        }
        orbit.missions = result.missions;
        orbit.stardust += result.stardust;
        // Claiming a mission also grants weekly League XP.
        orbit.league.weekXp += league.XP_MISSION_CLAIM;

        // Guarded write: the $set still persists the rollForward'd streak state,
        // but only if THIS mission is still unclaimed at write time, so a
        // concurrent duplicate claim (double-award race) no-ops here instead of
        // paying out the reward twice.
        const upd = await User.updateOne(
            { _id: req.user.id, "orbit.missions.items": { $elemMatch: { key: req.params.key, claimed: { $ne: true } } } },
            { $set: { orbit } }
        );
        if (!upd.matchedCount) {
            return res.status(409).json({ message: "Mission already claimed", reason: "already_claimed" });
        }
        require("../services/photonLedger").record(req.user.id, result.stardust, "mission"); // C6 economy (after commit)
        return res.status(200).json({ awarded: result.stardust, awardedPhotons: result.stardust, ...shapeOrbit(orbit) });
    } catch (err) {
        console.error("claimMission error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// POST /api/orbit/missions/:key/reroll — spend Photons to swap ONE mission you
// don't like for a fresh one (unclaimed + incomplete only; once per week).
exports.rerollMission = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("orbit").lean();
        if (!user) return res.status(404).json({ message: "User not found" });

        let { orbit } = rollForward(user.orbit);
        const COST = engine.MISSION_REROLL_COST;
        if (orbit.stardust < COST) {
            return res.status(400).json({ message: "Not enough Photons", reason: "insufficient" });
        }
        const result = engine.rerollMission(orbit.missions, req.params.key, orbit.missions.weekId);
        if (!result.ok) {
            const msg = result.reason === "no_rerolls_left" ? "You've already swapped a mission this week"
                : result.reason === "already_complete" ? "This mission is already complete — claim it instead"
                : result.reason === "already_claimed" ? "This mission is already claimed"
                : "Mission can't be swapped";
            return res.status(400).json({ message: msg, reason: result.reason });
        }
        orbit.missions = result.missions;
        orbit.stardust -= COST;

        // Guarded write: only if the balance still covers the cost, the target
        // mission is still present-and-unclaimed, and the weekly swap is still
        // unspent at write time — a concurrent duplicate reroll no-ops here.
        const upd = await User.updateOne(
            {
                _id: req.user.id,
                "orbit.stardust": { $gte: COST },
                "orbit.missions.items": { $elemMatch: { key: req.params.key, claimed: { $ne: true } } },
                $or: [
                    { "orbit.missions.rerollsUsed": { $exists: false } },
                    { "orbit.missions.rerollsUsed": { $lt: engine.REROLLS_PER_WEEK } },
                ],
            },
            { $set: { orbit } }
        );
        if (!upd.matchedCount) {
            return res.status(409).json({ message: "Swap could not be completed — please retry", reason: "conflict" });
        }
        require("../services/photonLedger").record(req.user.id, -COST, "mission_reroll"); // economy sink
        return res.status(200).json({
            spent: COST, replaced: result.replaced, swappedFor: result.swappedFor.key,
            ...shapeOrbit(orbit),
        });
    } catch (err) {
        console.error("rerollMission error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// POST /api/orbit/photons/gift { toUserId, amount, note? } — send Photons to an
// ACCEPTED connection. Capped per-day per sender (anti-farming); both sides get
// a ledger row; the recipient gets a notification.
exports.giftPhotons = async (req, res) => {
    try {
        const mongoose = require("mongoose");
        const Connection = require("../models/connection");
        const { createNotification } = require("../services/notify");

        const { toUserId, note } = req.body || {};
        const amount = Number(req.body && req.body.amount);
        if (!toUserId || !mongoose.isValidObjectId(toUserId)) {
            return res.status(400).json({ message: "Invalid recipient" });
        }
        if (String(toUserId) === String(req.user.id)) {
            return res.status(400).json({ message: "You can't gift yourself", reason: "self" });
        }

        // Gifting rides on real relationships: accepted/completed connections only.
        const connected = await Connection.exists({
            status: { $in: ["accepted", "completed"] },
            $or: [
                { requester: req.user.id, receiver: toUserId },
                { requester: toUserId, receiver: req.user.id },
            ],
        });
        if (!connected) {
            return res.status(403).json({ message: "You can only gift Photons to your connections", reason: "not_connected" });
        }

        const user = await User.findById(req.user.id).select("orbit name").lean();
        if (!user) return res.status(404).json({ message: "User not found" });

        let { orbit } = rollForward(user.orbit);
        const today = utcDayStr(new Date());
        const sentToday = (orbit.gifting && orbit.gifting.day === today) ? (orbit.gifting.sent || 0) : 0;

        const gate = engine.validateGift({ balance: orbit.stardust, sentToday, amount });
        if (!gate.ok) {
            const msg = gate.reason === "insufficient" ? "Not enough Photons"
                : gate.reason === "daily_cap" ? `Daily gift limit is ${engine.GIFT_DAILY_CAP} Photons`
                : `Gifts are ${engine.GIFT_MIN}–${engine.GIFT_MAX} Photons`;
            return res.status(400).json({ message: msg, reason: gate.reason });
        }

        // Guarded sender debit: balance AND the daily tally re-checked at write
        // time, so concurrent gifts can't overdraw either.
        const upd = await User.updateOne(
            {
                _id: req.user.id,
                "orbit.stardust": { $gte: amount },
                $or: [
                    { "orbit.gifting.day": { $ne: today } },
                    { "orbit.gifting.sent": { $lte: engine.GIFT_DAILY_CAP - amount } },
                ],
            },
            {
                $inc: { "orbit.stardust": -amount },
                $set: { "orbit.gifting": { day: today, sent: sentToday + amount } },
            }
        );
        if (!upd.matchedCount) {
            return res.status(409).json({ message: "Gift could not be completed — please retry", reason: "conflict" });
        }

        // Credit the recipient; on the (connection-checked, so near-impossible)
        // miss, refund the sender so Photons are never destroyed.
        const credit = await User.updateOne({ _id: toUserId }, { $inc: { "orbit.stardust": amount } });
        if (!credit.matchedCount) {
            await User.updateOne(
                { _id: req.user.id },
                { $inc: { "orbit.stardust": amount, "orbit.gifting.sent": -amount } }
            );
            return res.status(404).json({ message: "Recipient not found — Photons refunded", reason: "no_recipient" });
        }

        const ledger = require("../services/photonLedger");
        ledger.record(req.user.id, -amount, "gift_sent");
        ledger.record(toUserId, amount, "gift_received");

        const io = req.app.get("io");
        const noteText = typeof note === "string" && note.trim() ? ` — “${note.trim().slice(0, 120)}”` : "";
        createNotification(io, toUserId, {
            type: "photon_grant",
            title: "Photons received",
            body: `${user.name || "A connection"} sent you ${amount} Photons${noteText}`,
            data: { from: String(req.user.id), amount },
        }).catch(() => {});

        orbit.stardust -= amount;
        orbit.gifting = { day: today, sent: sentToday + amount };
        return res.status(200).json({ sent: amount, to: String(toUserId), ...shapeOrbit(orbit) });
    } catch (err) {
        console.error("giftPhotons error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// POST /api/orbit/freeze/buy — spend Stardust for one extra Gravity Assist.
exports.buyFreeze = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("orbit").lean();
        if (!user) return res.status(404).json({ message: "User not found" });

        // Freeze cap/cost are admin-overridable (economyConfig overlays the engine
        // defaults); fall back to the engine constants when no override is set.
        const econ = require("../services/economyConfig");
        const FREEZE_CAP = econ.value("FREEZE_CAP");
        const FREEZE_COST = econ.value("FREEZE_STARDUST_COST");

        let { orbit } = rollForward(user.orbit);
        if (orbit.freeze.tokens >= FREEZE_CAP) {
            return res.status(400).json({ message: "Gravity Assist inventory full", reason: "at_cap" });
        }
        if (orbit.stardust < FREEZE_COST) {
            return res.status(400).json({ message: "Not enough Photons", reason: "insufficient" });
        }
        orbit.stardust -= FREEZE_COST;
        orbit.freeze.tokens = Math.min(FREEZE_CAP, orbit.freeze.tokens + 1);

        // Guarded write: persist rollForward state, but only if the balance still
        // covers the cost AND we're still under cap at write time — blocks the
        // concurrent double-spend / over-cap race.
        const upd = await User.updateOne(
            { _id: req.user.id, "orbit.stardust": { $gte: FREEZE_COST }, "orbit.freeze.tokens": { $lt: FREEZE_CAP } },
            { $set: { orbit } }
        );
        if (!upd.matchedCount) {
            return res.status(409).json({ message: "Purchase could not be completed — please retry", reason: "conflict" });
        }
        require("../services/photonLedger").record(req.user.id, -FREEZE_COST, "freeze"); // C6 sink (after commit)
        return res.status(200).json({ spent: FREEZE_COST, ...shapeOrbit(orbit) });
    } catch (err) {
        console.error("buyFreeze error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// Exposed so the admin Player Inspector (Mission Control C5) can render the exact
// same shape the end-user sees.
exports.shapeOrbit = shapeOrbit;

// GET /api/orbit/ledger — the viewer's recent Photon flows (earn + spend), used
// by the Mission Log / Photon history page. Read-only; newest first.
exports.getLedger = async (req, res) => {
    try {
        const PhotonLedger = require("../models/PhotonLedger");
        const limit = Math.min(parseInt(req.query.limit, 10) || 60, 200);
        const rows = await PhotonLedger.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .limit(limit)
            .select("delta source createdAt")
            .lean();
        const entries = rows.map((r) => ({ delta: r.delta, source: r.source, at: r.createdAt }));
        const earned = entries.reduce((s, e) => (e.delta > 0 ? s + e.delta : s), 0);
        const spent = entries.reduce((s, e) => (e.delta < 0 ? s - e.delta : s), 0);
        return res.status(200).json({ entries, summary: { earned, spent, count: entries.length } });
    } catch (err) {
        console.error("getLedger error:", err);
        return res.status(500).json({ message: "Could not load your Photon history" });
    }
};

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
            return res.status(400).json({ message: "Not enough Stardust", reason: "insufficient" });
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

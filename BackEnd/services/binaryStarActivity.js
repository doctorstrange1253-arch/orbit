/**
 * binaryStarActivity.js — the DB layer for co-op Binary Star streaks.
 *
 * recordBinaryStarAction() is called from orbitActivity.recordOrbitAction after
 * the personal streak is applied: it records the acting user's contribution to
 * each of their ACTIVE Binary Stars and, when both partners have acted the
 * same UTC day, advances the shared streak (freeze-bridged) and credits BOTH
 * members with any milestone Stardust. Best-effort — never throws into the
 * caller.
 *
 * All math is delegated to services/binaryStarEngine.js (pure); the "now"
 * (UTC day / ISO week) is owned here, shared with services/orbitActivity.js.
 *
 * Backwards-compat: `recordPairAction` is exported as a thin shim so the old
 * (un-renamed) call sites in any branch that hasn't picked up the rename yet
 * keep working. New code should use `recordBinaryStarAction`.
 */

const BinaryStar = require("../models/BinaryStar");
const User = require("../models/user");
const engine = require("./binaryStarEngine");
const { utcDayStr, isoWeekId } = require("./orbitActivity");
const { createNotification } = require("./notify");

// Apply the lazy weekly freeze grant to a Binary Star doc for `weekId`.
function rollForwardPair(con, weekId) {
    const g = engine.grantWeeklyFreezePair(con.freeze || {}, weekId);
    con.freeze = g.freeze;
    return g.granted;
}

/**
 * recordBinaryStarAction — fan a member's real-progress action into their
 * active Binary Stars. Fire-and-forget.
 *
 * @param {object|null} io
 * @param {string} userId
 * @param {object} [opts] { now = new Date() }
 * @returns {Promise<Array>} per-Binary Star summaries (empty on none/failure)
 */
async function recordBinaryStarAction(io, userId, opts = {}) {
    try {
        const now = opts.now || new Date();
        const today = utcDayStr(now);
        const weekId = isoWeekId(now);

        const cons = await BinaryStar.find({ members: userId, status: "active" });
        if (!cons.length) return [];

        const summaries = [];
        for (const con of cons) {
            rollForwardPair(con, weekId);

            const memberIds = con.members.map(String);
            const state = {
                streak: con.streak,
                lastActionDay: con.lastActionDay || {},
                freezeTokens: (con.freeze && con.freeze.tokens) || 0,
            };
            const res = engine.applyPairContribution(state, userId, memberIds, today);

            // Persist streak + contribution + freeze.
            con.streak = res.state.streak;
            con.lastActionDay = res.state.lastActionDay;
            con.markModified("lastActionDay");
            con.freeze.tokens = res.state.freezeTokens;
            await con.save();

            // On a shared advance, notify both. On a milestone, pay both.
            const otherId = memberIds.find((m) => m !== String(userId));
            if (res.advanced) {
                if (res.milestone) {
                    await User.updateMany(
                        { _id: { $in: con.members } },
                        { $inc: { "orbit.stardust": res.milestone.stardust } }
                    );
                    for (const m of memberIds) require("./photonLedger").record(m, res.milestone.stardust, "binary_star"); // C6
                    for (const m of memberIds) {
                        createNotification(io, m, {
                            type: "binary_star_milestone",
                            title: `${res.milestone.name}`,
                            body: `Your Binary Star hit a ${con.streak.current}-day shared streak — awarded ${res.milestone.stardust} Photons each.`,
                            data: { link: "/orbit", binaryStarId: String(con._id), stardust: res.milestone.stardust, photons: res.milestone.stardust },
                        }).catch(() => {});
                    }
                } else {
                    // Notify the partner that the shared streak moved (the actor sees it live).
                    createNotification(io, otherId, {
                        type: "binary_star_streak",
                        title: "Binary Star advanced",
                        body: `You both showed up today — shared streak is now ${con.streak.current} days.`,
                        data: { link: "/orbit", binaryStarId: String(con._id), streak: con.streak.current },
                    }).catch(() => {});
                }
                if (res.streakSaved) {
                    for (const m of memberIds) {
                        createNotification(io, m, {
                            type: "binary_star_freeze_used",
                            title: "Shared Gravity Assist",
                            body: `A missed day was bridged — your Binary Star's ${con.streak.current}-day streak is intact.`,
                            data: { link: "/orbit", binaryStarId: String(con._id) },
                        }).catch(() => {});
                    }
                }
            } else if (res.recorded && engine.pairDecayState(con.streak, con.lastActionDay, memberIds, today).state === "waiting") {
                // Part 4 — gentle, non-coercive nudge to the person who can act.
                // Never framed to make them feel they're letting their partner down.
                createNotification(io, otherId, {
                    type: "binary_star_your_turn",
                    title: "It's your turn to shine",
                    body: `Your partner showed up today — whenever you're ready, one action keeps your ${con.streak.current}-day Binary Star glowing.`,
                    data: { link: "/orbit", binaryStarId: String(con._id), streak: con.streak.current },
                }).catch(() => {});
            }

            summaries.push({
                binaryStarId: String(con._id),
                advanced: res.advanced,
                streak: con.streak.current,
                milestone: res.milestone ? res.milestone.name : null,
            });
        }
        return summaries;
    } catch (err) {
        console.warn("[binaryStar] recordBinaryStarAction failed:", err.message);
        return [];
    }
}

/** Backwards-compat shim for the pre-rename name. */
const recordPairAction = recordBinaryStarAction;

module.exports = { recordBinaryStarAction, recordPairAction, rollForwardPair };

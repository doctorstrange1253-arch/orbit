/**
 * crossSoulService.js — Cross-Soul Economy.
 *
 * Two scans run weekly (Sunday 23:59 UTC, alongside the Pact roll):
 *
 *   1. topStudentScan() — finds the top 5% of weekly-XP earners in
 *      the last 90 days among users with `student` role but NOT
 *      `mentor`. Sends each a "Constellation invite" notification.
 *
 *   2. topSwapperScan() — finds users with 10+ peer swaps completed
 *      in the last 90 days AND avg rating >= 4.5. Sends a "Have you
 *      considered teaching?" invite.
 *
 * Each invite respects a 90-day cooldown (stored on the MentorInvite
 * row). The user can dismiss with "Not now" to silence the prompt.
 *
 * Best-effort: a scan failure never breaks the weekly worker.
 */

const User = require("../models/user");
const Connection = require("../models/Connection");
const MentorInvite = require("../models/MentorInvite");
const Notification = require("../models/Notification");
const { createNotification } = require("./notify");

const COOLDOWN_DAYS = 90;
const TOP_STUDENT_PCT = 0.05;       // top 5%
const TOP_SWAPPER_MIN = 10;          // at least 10 swaps
const TOP_SWAPPER_MIN_RATING = 4.5;  // avg rating >= 4.5

// Build a 90-days-ago Date.
function _90daysAgo() {
    const d = new Date();
    d.setDate(d.getDate() - 90);
    return d;
}

// Has this user been invited in the cooldown window? Returns true if a
// dismissed-or-pending invite exists within the last COOLDOWN_DAYS.
async function _isInCooldown(userId, kind) {
    const since = new Date();
    since.setDate(since.getDate() - COOLDOWN_DAYS);
    const recent = await MentorInvite.findOne({
        userId, kind,
        sentAt: { $gte: since },
    }).lean();
    return !!recent;
}

// ── topStudentScan ──────────────────────────────────────────────────────
// Top 5% by weekly XP over the last 90 days (using current gameology.xp
// as a proxy — the V2 service doesn't track per-day XP, so we use the
// current total as a one-shot signal). Users with `mentor` role are
// excluded (the goal is Student → Mentor upgrades).
async function topStudentScan() {
    try {
        // Pull all users with student role but NOT mentor. For a real
        // production system, this would be paginated + indexed by XP.
        const candidates = await User.find({
            roles: { $in: ["student"] },
            "gameology.xp": { $gt: 0 },
        })
            .select("_id name gameology roles")
            .sort({ "gameology.xp": -1 })
            .lean();

        const nonMentors = candidates.filter((u) => !u.roles?.includes("mentor"));
        if (nonMentors.length === 0) return { invited: 0 };

        const topN = Math.max(1, Math.ceil(nonMentors.length * TOP_STUDENT_PCT));
        const targets = nonMentors.slice(0, topN);

        let invited = 0;
        for (const u of targets) {
            if (await _isInCooldown(u._id, "top_student")) continue;
            await MentorInvite.create({
                userId: u._id,
                kind: "top_student",
                metrics: { xp: u.gameology?.xp, level: u.gameology?.level },
            });
            // Bugfix: createNotification's signature is (io, userId, opts) and
            // the deep-link must ride in `data.link` — the old call passed the
            // userId into the io slot (the socket emit then threw and was
            // silently swallowed) and dropped the link entirely, so the
            // persisted notification never carried /mentor/apply.
            await createNotification(null, u._id, {
                type: "mentor_invite",
                title: "You're in the top 5% of learners",
                body: "Have you considered teaching on Orbit? It's a 2-question application.",
                data: { link: "/mentor/apply" },
            });
            invited += 1;
        }
        return { invited, total: candidates.length, topN };
    } catch (err) {
        console.warn("[cross-soul] topStudentScan failed:", err.message);
        return { invited: 0, error: err.message };
    }
}

// ── topSwapperScan ──────────────────────────────────────────────────────
// Users with 10+ peer swaps completed in the last 90 days AND an average
// rating RECEIVED of >= 4.5.
//
// Bugfix note (V3-I review): the original aggregation grouped on
// `$userId` and pushed `$rating` — but the Connection schema has NEITHER
// field (its participants are `requester`/`receiver`; ratings live on the
// Rating model). Every row collapsed into _id:null with zero ratings, so
// this scan silently invited nobody, ever. It now:
//   1. matches completed swaps on `completedAt` (the real completion stamp),
//   2. counts each completed swap for BOTH participants,
//   3. $lookups the avg non-hidden rating received from the Rating model.
async function topSwapperScan() {
    try {
        const since = _90daysAgo();
        const rows = await Connection.aggregate([
            { $match: { status: "completed", completedAt: { $gte: since } } },
            {
                $project: {
                    participants: {
                        $filter: {
                            input: ["$requester", "$receiver"],
                            as: "p",
                            cond: { $ne: [null, "$$p"] },
                        },
                    },
                },
            },
            { $unwind: "$participants" },
            { $group: { _id: "$participants", count: { $sum: 1 } } },
            { $match: { count: { $gte: TOP_SWAPPER_MIN } } },
            {
                $lookup: {
                    from: "ratings",
                    let: { uid: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ["$toUser", "$$uid"] },
                                hidden: { $ne: true },
                                createdAt: { $gte: since },
                            },
                        },
                        { $group: { _id: null, avg: { $avg: "$score" }, n: { $sum: 1 } } },
                    ],
                    as: "ratingStats",
                },
            },
            {
                $addFields: {
                    avgRating: { $ifNull: [{ $first: "$ratingStats.avg" }, 0] },
                    ratingCount: { $ifNull: [{ $first: "$ratingStats.n" }, 0] },
                },
            },
            { $match: { avgRating: { $gte: TOP_SWAPPER_MIN_RATING } } },
        ]);

        let invited = 0;
        for (const row of rows) {
            const avg = row.avgRating;
            if (!avg || avg < TOP_SWAPPER_MIN_RATING) continue;

            const user = await User.findById(row._id).select("roles").lean();
            if (!user || user.roles?.includes("mentor")) continue;
            if (await _isInCooldown(row._id, "top_swapper")) continue;

            await MentorInvite.create({
                userId: row._id,
                kind: "top_swapper",
                metrics: { swaps: row.count, avgRating: avg },
            });
            await createNotification(null, row._id, {
                type: "mentor_invite",
                title: "You swap well. Have you considered teaching?",
                body: `${row.count} swaps in 90 days, ${avg.toFixed(1)}★ average. We'd love to see you on the other side.`,
                data: { link: "/mentor/apply" },
            });
            invited += 1;
        }
        return { invited };
    } catch (err) {
        console.warn("[cross-soul] topSwapperScan failed:", err.message);
        return { invited: 0, error: err.message };
    }
}

// ── pendingInvite ───────────────────────────────────────────────────────
// The signed-in user's most recent pending invite (drives the frontend
// MentorInviteModal). A dismissed invite is suppressed by its cooldown
// window; accepted ones are no longer pending by definition.
async function pendingInvite(userId) {
    return MentorInvite.findOne({
        userId,
        status: "pending",
        $or: [{ cooldownUntil: null }, { cooldownUntil: { $lte: new Date() } }],
    })
        .sort({ sentAt: -1 })
        .select("kind metrics sentAt")
        .lean();
}

// ── respond ─────────────────────────────────────────────────────────────
// User accepted or dismissed the invite. Updates the row + cooldown.
async function respond(userId, kind, action) {
    if (!["accepted", "dismissed"].includes(action)) return null;
    const update = { status: action, respondedAt: new Date() };
    if (action === "dismissed") {
        const cd = new Date();
        cd.setDate(cd.getDate() + COOLDOWN_DAYS);
        update.cooldownUntil = cd;
    }
    await MentorInvite.findOneAndUpdate(
        { userId, kind, status: "pending" },
        { $set: update }
    );
    return { ok: true };
}

module.exports = { topStudentScan, topSwapperScan, respond, pendingInvite, COOLDOWN_DAYS };

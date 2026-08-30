/**
 * pactService.js — the single source of truth for the Mentor Pact.
 *
 * A weekly head-to-head league for mentors. Distinct from the student
 * Gameology (different surface, no XP bar, no level number) but built on
 * the same single-chokepoint principle: every signal that should nudge a
 * mentor's weekly Pact Score goes through this module.
 *
 * Tiers (6, low → high):
 *   initiate | adept | mentor | sage | luminary | oracle
 *
 * Composite score (4 signals, each with a per-source weekly cap):
 *   sessions        ×  4   (cap 50/week)   — 40% weight, capped 200
 *   rating (avg)    × 20   (per-session contribution, scaled by participation)
 *   completions     × 10   (cap 20/week)   — 20% weight, capped 200
 *   qaAnswers       ×  5   (cap 30/week)   — 15% weight, capped 150
 *
 * Weekly cycle (UTC, mirrors services/orbitEngine.js):
 *   Mon 00:00 → new week, groups re-shuffled by last week's final score
 *   Sun 23:59 → snapshot, top 7 promote, bottom 7 relegate, middle 16 hold
 *   Steady Shield: +1 to pact.steadyShieldWeeks for any held week
 *
 * Anti-farming caps live in `PactWeekLedger` so we can apply them per-call
 * without a global counter. The ledger auto-clears on the Sunday roll.
 */

const User = require("../models/user");
const PactWeekLedger = require("../models/PactWeekLedger");

// ── Tier + group constants ───────────────────────────────────────────────
const DIVISIONS = Object.freeze(["initiate", "adept", "mentor", "sage", "luminary", "oracle"]);
const GROUP_SIZE = 30;          // mentors per group
const PROMOTE_ZONE = 7;         // top 7 promote
const RELEGATE_ZONE = 7;        // bottom 7 relegate

// Per-source weekly caps (anti-farming). 50 sessions/wk is roughly 10/day
// with 1 off-day — beyond that, the score stops growing, so there's no
// incentive to grind 100.
const CAPS = Object.freeze({
    sessions:    50,
    completions: 20,
    qaAnswers:   30,
    // rating is computed on-the-fly from the running sum/count, no cap
});

// Score weights
const WEIGHTS = Object.freeze({
    sessionBase: 4,     // each (capped) session contributes this much
    ratingScale: 20,    // average rating × this
    completion:  10,    // each (capped) course completion contributes this much
    qaAnswer:    5,     // each (capped) Q&A answer marked correct contributes this much
});

// ── Pure helpers ─────────────────────────────────────────────────────────
function clamp(n, max) { return Math.max(0, Math.min(max, n)); }

function divisionIndex(divisionId) {
    const i = DIVISIONS.indexOf(divisionId);
    return i < 0 ? 0 : i;
}

function nextDivisionUp(divisionId) {
    const i = divisionIndex(divisionId);
    return DIVISIONS[Math.min(DIVISIONS.length - 1, i + 1)] || DIVISIONS[DIVISIONS.length - 1];
}

function nextDivisionDown(divisionId) {
    const i = divisionIndex(divisionId);
    return DIVISIONS[Math.max(0, i - 1)] || DIVISIONS[0];
}

/**
 * Composite Pact Score from raw signals. Pure; the caller (record*) is
 * responsible for applying the per-source caps via the ledger.
 *
 * @param {{sessions:number, ratingSum:number, ratingCount:number, completions:number, qaAnswers:number}} signals
 */
function computePactScore(signals) {
    const s = signals || {};
    const sessions = clamp(s.sessions || 0, CAPS.sessions);
    const completions = clamp(s.completions || 0, CAPS.completions);
    const qa = clamp(s.qaAnswers || 0, CAPS.qaAnswers);
    const ratingAvg = (s.ratingCount || 0) > 0 ? (s.ratingSum || 0) / (s.ratingCount || 1) : 0;
    // rating contribution is scaled by participation (sessions, capped at 10
    // so a 5★ on a 1-session week is worth more per-session than a 5★ on a
    // 50-session week — both should still be heard).
    const ratingScaled = ratingAvg * WEIGHTS.ratingScale * Math.min(sessions, 10) / 10;
    return (
        sessions * WEIGHTS.sessionBase +
        ratingScaled +
        completions * WEIGHTS.completion +
        qa * WEIGHTS.qaAnswer
    );
}

/** ISO week id, mirrors gameologyService.isoWeek (duplicated for decoupling). */
function isoWeek(d = new Date()) {
    const dt = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
    const dayNum = (dt.getUTCDay() + 6) % 7;
    dt.setUTCDate(dt.getUTCDate() - dayNum + 3);
    const firstThursday = new Date(Date.UTC(dt.getUTCFullYear(), 0, 4));
    const firstDayNum = (firstThursday.getUTCDay() + 6) % 7;
    firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDayNum + 3);
    const week = 1 + Math.round((dt - firstThursday) / (7 * 86400000));
    return `${dt.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

// ── Ledger helpers ───────────────────────────────────────────────────────
/**
 * Read-then-write the ledger so we can apply the cap atomically per (user,
 * week). Returns the post-write signal counts.
 */
async function bumpSignal(userId, weekId, signalName, amount = 1) {
    if (!amount) return { signals: {}, capped: 0 };
    // Read current
    const cur = await PactWeekLedger.findOne({ userId, weekId }).lean();
    const next = {
        sessions:    cur?.signals?.sessions    || 0,
        ratingSum:   cur?.signals?.ratingSum   || 0,
        ratingCount: cur?.signals?.ratingCount || 0,
        completions: cur?.signals?.completions || 0,
        qaAnswers:   cur?.signals?.qaAnswers   || 0,
    };

    let credited = 0;
    if (signalName === "rating") {
        // amount is the star count; bump sum + count together
        next.ratingSum += amount;
        next.ratingCount += 1;
        credited = amount; // rating is uncapped; the score formula scales it
    } else {
        const cap = CAPS[signalName];
        if (cap === undefined) return { signals: next, credited: 0 };
        const before = next[signalName];
        const after = Math.min(cap, before + amount);
        const added = after - before;
        next[signalName] = after;
        credited = added;
    }

    await PactWeekLedger.findOneAndUpdate(
        { userId, weekId },
        { $set: { signals: next, userId, weekId } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const newScore = computePactScore(next);
    // Bump the user's pact.weekScore by the delta only (we don't reset on
    // every call — we add the *delta* over the previous score computed at
    // the same signals). To keep this simple and monotonic, we recompute the
    // score from scratch from the ledger and replace pact.weekScore.
    await User.updateOne(
        { _id: userId },
        { $set: {
            "pact.weekScore": newScore,
            "pact.weekId": weekId,
        }}
    );

    return { signals: next, credited, weekScore: newScore };
}

// ── Public signal entry points (called by controllers) ──────────────────
async function recordSession(mentorId, { rating } = {}) {
    try {
        const weekId = isoWeek();
        const r1 = await bumpSignal(mentorId, weekId, "sessions", 1);
        if (Number.isFinite(rating) && rating > 0) {
            await bumpSignal(mentorId, weekId, "rating", rating);
        }
        return { weekScore: r1.weekScore, weekId };
    } catch (err) {
        console.warn("[pact] recordSession failed:", err.message);
        return null;
    }
}

async function recordCourseCompletion(mentorId /*, { courseId } */) {
    try {
        const weekId = isoWeek();
        const r = await bumpSignal(mentorId, weekId, "completions", 1);
        return { weekScore: r.weekScore, weekId };
    } catch (err) {
        console.warn("[pact] recordCourseCompletion failed:", err.message);
        return null;
    }
}

async function recordAnswerMarkedCorrect(mentorId /*, { courseId, commentId } */) {
    try {
        const weekId = isoWeek();
        const r = await bumpSignal(mentorId, weekId, "qaAnswers", 1);
        return { weekScore: r.weekScore, weekId };
    } catch (err) {
        console.warn("[pact] recordAnswerMarkedCorrect failed:", err.message);
        return null;
    }
}

// ── Group + rank helpers ─────────────────────────────────────────────────
/**
 * Deterministic groupId for a (division, weekId, bucket). bucket comes from
 * the user's weekScore percentile. We bucket by score / GROUP_SIZE so each
 * group has ~GROUP_SIZE mentors. Re-runs produce stable ids.
 */
function groupIdFor(divisionId, weekId, bucket) {
    return `${divisionId}:${weekId}:${bucket || 0}`;
}

/**
 * Find the caller's index inside their group (this week). Returns 0-based.
 * Loads everyone in the same groupId, sorts by weekScore desc.
 */
async function getMyGroupAndRank(mentorId, weekId) {
    const me = await User.findById(mentorId).select("pact name avatar").lean();
    if (!me) return null;
    const week = weekId || me.pact?.weekId || isoWeek();
    const groupId = me.pact?.groupId || "";
    const groupRows = await User.find({ "pact.groupId": groupId, "pact.weekId": week })
        .select("_id name avatar pact")
        .sort({ "pact.weekScore": -1, _id: 1 })
        .lean();
    const idx = groupRows.findIndex((u) => String(u._id) === String(mentorId));
    return {
        me: { _id: String(me._id), name: me.name, avatar: me.avatar, pact: me.pact },
        group: groupRows,
        myRank: idx < 0 ? null : idx + 1,
        weekId: week,
        groupId,
    };
}

async function getMyRank(mentorId) {
    const r = await getMyGroupAndRank(mentorId);
    if (!r) return null;
    const groupSize = r.group.length;
    const rank = r.myRank || 0;
    return {
        rank,
        groupSize,
        inPromotionZone: rank > 0 && rank <= PROMOTE_ZONE,
        inRelegationZone: rank > 0 && rank > groupSize - RELEGATE_ZONE,
        divisionId: r.me.pact?.divisionId,
        groupId: r.groupId,
        weekScore: r.me.pact?.weekScore || 0,
        weekId: r.weekId,
        // Days left in the ISO week (UTC): Sunday 23:59 - now
        daysLeftInWeek: Math.max(0, 7 - Math.floor((Date.now() - mondayOfThisWeek()) / 86400000)),
    };
}

function mondayOfThisWeek() {
    const now = new Date();
    const dayNum = (now.getUTCDay() + 6) % 7; // Mon=0
    return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - dayNum);
}

async function getRivals(mentorId) {
    const r = await getMyGroupAndRank(mentorId);
    if (!r) return [];
    const idx = r.myRank ? r.myRank - 1 : -1;
    const rivals = [];
    if (idx > 0) rivals.push(r.group[idx - 1]);
    if (idx > 1) rivals.push(r.group[idx - 2]);
    rivals.push(r.group[idx]);
    if (idx >= 0 && idx < r.group.length - 1) rivals.push(r.group[idx + 1]);
    if (idx >= 0 && idx < r.group.length - 2) rivals.push(r.group[idx + 2]);
    return rivals.map((u) => ({
        _id: String(u._id),
        name: u.name,
        avatar: u.avatar,
        weekScore: u.pact?.weekScore || 0,
        divisionId: u.pact?.divisionId,
    }));
}

async function getMyHistory(mentorId, limit = 12) {
    const u = await User.findById(mentorId).select("pact").lean();
    if (!u) return [];
    return (u.pact?.weeklyHistory || [])
        .slice(-Math.max(1, Math.min(52, limit)))
        .reverse();
}

// ── Weekly roll (called by pactWorker at Sunday 23:59 UTC) ──────────────
/**
 * For every mentor with a `pact.weekId` === thisWeek, snapshot, then:
 *   1. Sort within each (divisionId, groupId) by weekScore desc
 *   2. Top PROMOTE_ZONE of each group → next division up (or hold at oracle)
 *   3. Bottom RELEGATE_ZONE of each group → next division down (or hold at initiate)
 *   4. Middle → hold
 *   5. Re-bucket within new division by score (deterministic by weekId hash)
 *   6. Reset weekScore to 0, bump steadyShieldWeeks for holds (active only)
 *   7. Append to weeklyHistory
 *   8. Clear ledger rows for the rolled week
 *
 * Returns { promoted, relegated, held, total }.
 */
async function rollWeek(weekId = isoWeek()) {
    try {
        const mentors = await User.find({ "pact.weekId": weekId })
            .select("_id name pact")
            .lean();
        if (!mentors.length) {
            return { promoted: 0, relegated: 0, held: 0, total: 0, weekId };
        }

        // Group by current groupId
        const byGroup = new Map();
        for (const m of mentors) {
            const gid = m.pact?.groupId || "unknown";
            if (!byGroup.has(gid)) byGroup.set(gid, []);
            byGroup.get(gid).push(m);
        }

        const updates = []; // { _id, prev, next, historyRow }
        let promoted = 0, relegated = 0, held = 0;

        for (const [gid, members] of byGroup) {
            // Sort by weekScore desc; tiebreak by _id asc for determinism
            members.sort((a, b) => (b.pact?.weekScore || 0) - (a.pact?.weekScore || 0) ||
                String(a._id).localeCompare(String(b._id)));

            for (let i = 0; i < members.length; i++) {
                const m = members[i];
                const p = m.pact || {};
                const score = p.weekScore || 0;
                const groupSize = members.length;
                const rank = i + 1;
                const isActive = score > 0; // "active" = contributed at all

                let nextDivision = p.divisionId;
                let result = "held";
                if (rank <= PROMOTE_ZONE) {
                    nextDivision = nextDivisionUp(p.divisionId);
                    if (nextDivision !== p.divisionId) { result = "promoted"; promoted++; }
                } else if (rank > groupSize - RELEGATE_ZONE) {
                    nextDivision = nextDivisionDown(p.divisionId);
                    if (nextDivision !== p.divisionId) { result = "relegated"; relegated++; }
                } else {
                    held++;
                }

                // Compute the new group bucket for the (possibly new) division
                // We do a simple round-robin by score-rank-within-division after
                // the promote/relegate; for now, use a deterministic bucket of
                // `(oldRankWithinDivision % groupsInDivision)`. Groups in
                // division are approximated by GROUP_SIZE.
                const newBucket = Math.floor(i / GROUP_SIZE);

                const newHistoryRow = {
                    weekId,
                    divisionId: p.divisionId,
                    groupId: gid,
                    score,
                    rank,
                    groupSize,
                    result,
                };

                const newSteadyShield = (result === "held" && isActive) ? (p.steadyShieldWeeks || 0) + 1 : (p.steadyShieldWeeks || 0);

                updates.push({
                    _id: m._id,
                    next: {
                        "pact.divisionId": nextDivision,
                        "pact.groupId": groupIdFor(nextDivision, weekId, newBucket),
                        "pact.weekScore": 0,
                        "pact.weekId": weekId,
                        "pact.lastResult": result,
                        "pact.highestDivisionId": divisionIndex(nextDivision) > divisionIndex(p.highestDivisionId || "initiate")
                            ? nextDivision
                            : (p.highestDivisionId || "initiate"),
                        "pact.steadyShieldWeeks": newSteadyShield,
                    },
                    historyRow: newHistoryRow,
                });
            }
        }

        // Apply updates
        for (const u of updates) {
            const pushHistory = await User.findByIdAndUpdate(
                u._id,
                {
                    $set: u.next,
                    $push: {
                        "pact.weeklyHistory": {
                            $each: [u.historyRow],
                            $slice: -52, // keep last 52 weeks
                        },
                    },
                },
                { new: true }
            );
            // Avoid unused warning
            void pushHistory;
        }

        // Clear the ledger for the rolled week
        await PactWeekLedger.deleteMany({ weekId });

        return { promoted, relegated, held, total: updates.length, weekId };
    } catch (err) {
        console.error("[pact] rollWeek failed:", err.message);
        return { promoted: 0, relegated: 0, held: 0, total: 0, weekId, error: err.message };
    }
}

module.exports = {
    // constants
    DIVISIONS,
    GROUP_SIZE,
    PROMOTE_ZONE,
    RELEGATE_ZONE,
    CAPS,
    WEIGHTS,
    // pure helpers
    computePactScore,
    nextDivisionUp,
    nextDivisionDown,
    divisionIndex,
    isoWeek,
    groupIdFor,
    // side-effecting
    recordSession,
    recordCourseCompletion,
    recordAnswerMarkedCorrect,
    bumpSignal,
    getMyGroupAndRank,
    getMyRank,
    getRivals,
    getMyHistory,
    rollWeek,
};

/**
 * pactWorker.js — the weekly Mentor Pact roll + mid-week Pact Pulse.
 *
 * Two responsibilities:
 *   1. WEEKLY ROLL — when the ISO week flips (Monday 00:00 UTC), snapshot
 *      every mentor's pact state, then promote/relegate/hold. Emits the
 *      Monday-morning `pact:rolled` socket event so the frontend can
 *      show the results card + refresh the Pact Hall.
 *   2. PACT PULSE — every Wednesday 09:00 UTC, push a contextual
 *      notification per mentor based on their current rank (encourage /
 *      steady / caution). Notifications are throttled per mentor per
 *      week via `pact.pulseSeenWeek`.
 *
 * Run loop: ticks every 60s. Cheap (a single Mongo roundtrip on a calm
 * day). The hot paths are guarded by `lastRollWeek` / `lastPulseWeek`
 * in-process caches so the same week isn't rolled twice.
 *
 * Pattern mirrors `BackEnd/workers/leagueWorker.js`.
 */

const User = require("../models/user");
const pact = require("../services/pactService");
const { createNotification } = require("../services/notify");

let lastRollWeek = null;   // "YYYY-Www"
let lastPulseWeek = null;  // "YYYY-Www"

function pickTone(rank) {
    if (!rank || !rank.rank) return "neutral";
    if (rank.inPromotionZone) return "encourage";
    if (rank.inRelegationZone) return "caution";
    return "steady";
}

function pulseMessage(tone, rank, mentorName) {
    const name = mentorName || "Mentor";
    const left = rank?.daysLeftInWeek ?? 7;
    switch (tone) {
        case "encourage":
            return `${name}, you're rank ${rank.rank}/${rank.groupSize} in ${rank.divisionId} — top ${pact.PROMOTE_ZONE} promote. ${left} days left. One 5-star session could move you 3 ranks.`;
        case "caution":
            return `${name}, you're in the bottom ${pact.RELEGATE_ZONE} of ${rank.divisionId}. ${left} days left. One solid session moves you to safety — you've got this.`;
        case "steady":
            return `${name}, you're safe at rank ${rank.rank}/${rank.groupSize} in ${rank.divisionId}. ${left} days left. Hold the line.`;
        default:
            return `${name}, the Pact is quiet this week. Teaching counts toward your score.`;
    }
}

async function runWeeklyRoll(io, currentWeek) {
    // The previous-week id is what we want to roll (the week that just ended).
    // We compute it by stepping back 1 ISO week from currentWeek.
    const prevWeek = previousIsoWeek(currentWeek);
    const result = await pact.rollWeek(prevWeek);
    console.log(`[pactWorker] rollWeek(${prevWeek}) →`, result);

    if (io) {
        io.emit("pact:rolled", { weekId: prevWeek, result });
    }

    // Monday-morning results card: notify every mentor in `prevWeek` with
    // their lastResult + score.
    const mentors = await User.find({ "pact.weekId": currentWeek, "pact.weeklyHistory.weekId": prevWeek })
        .select("_id name pact")
        .lean();
    for (const m of mentors) {
        const row = (m.pact?.weeklyHistory || []).find((r) => r.weekId === prevWeek);
        if (!row) continue;
        const verb = row.result === "promoted" ? "promoted"
            : row.result === "relegated" ? "relegated"
            : "held";
        const body = `Last week in ${row.divisionId}: rank ${row.rank}/${row.groupSize}, score ${row.score}. You ${verb}.`;
        createNotification(io, String(m._id), {
            type: "pact_rolled",
            title: "Pact rolled",
            body,
            data: { weekId: prevWeek, link: "/mentor/pact" },
        }).catch(() => {});
    }

    return result;
}

async function runPactPulse(io, currentWeek) {
    const mentors = await User.find({ roles: "mentor", "pact.weekId": currentWeek })
        .select("_id name pact")
        .lean();
    for (const m of mentors) {
        if (m.pact?.pulseSeenWeek === currentWeek) continue; // user already saw it
        const rank = await pact.getMyRank(m._id);
        if (!rank) continue;
        const tone = pickTone(rank);
        createNotification(io, String(m._id), {
            type: "pact_pulse",
            title: tone === "encourage" ? "Pact Pulse — push for promotion"
                : tone === "caution" ? "Pact Pulse — stay sharp"
                : "Pact Pulse — steady as she goes",
            body: pulseMessage(tone, rank, m.name),
            data: { weekId: currentWeek, link: "/mentor/pact" },
        }).catch(() => {});
    }
}

function previousIsoWeek(currentWeek) {
    // currentWeek is "YYYY-Www". Decode, step back 7 days, re-encode.
    const m = /^(\d{4})-W(\d{2})$/.exec(currentWeek);
    if (!m) return currentWeek;
    const year = parseInt(m[1], 10);
    const week = parseInt(m[2], 10);
    // Jan 4 is always in week 1 per ISO 8601
    const jan4 = new Date(Date.UTC(year, 0, 4));
    const jan4WeekStart = new Date(jan4);
    const dayNum = (jan4.getUTCDay() + 6) % 7;
    jan4WeekStart.setUTCDate(jan4.getUTCDate() - dayNum);
    const target = new Date(jan4WeekStart.getTime() + (week - 2) * 7 * 86400000); // week-1 (previous)
    return pact.isoWeek(target);
}

function shouldRunRoll(now, currentWeek) {
    if (lastRollWeek === currentWeek) return false;
    // Run shortly after Monday 00:00 UTC (within first 10 min).
    const dayOfWeek = (now.getUTCDay() + 6) % 7; // 0 = Monday
    const minOfDay = now.getUTCHours() * 60 + now.getUTCMinutes();
    return dayOfWeek === 0 && minOfDay < 10;
}

function shouldRunPulse(now, currentWeek) {
    if (lastPulseWeek === currentWeek) return false;
    // Wednesday only, around 09:00 UTC (within first 10 min).
    const dayOfWeek = (now.getUTCDay() + 6) % 7; // 0 = Mon, 2 = Wed
    const minOfDay = now.getUTCHours() * 60 + now.getUTCMinutes();
    return dayOfWeek === 2 && minOfDay < 10;
}

async function tick(io) {
    const now = new Date();
    const currentWeek = pact.isoWeek(now);

    try {
        if (shouldRunRoll(now, currentWeek)) {
            await runWeeklyRoll(io, currentWeek);
            lastRollWeek = currentWeek;
        }
        if (shouldRunPulse(now, currentWeek)) {
            await runPactPulse(io, currentWeek);
            lastPulseWeek = currentWeek;
        }
    } catch (err) {
        console.error("[pactWorker] tick error:", err.message);
    }
}

function start(io) {
    // Run once on boot (in case we restarted mid-week), then every 60s.
    tick(io).catch(() => {});
    const handle = setInterval(() => tick(io), 60 * 1000);
    handle.unref?.();
    console.log("[pactWorker] started (60s tick)");
    return {
        stop() { clearInterval(handle); },
        runRollNow: (weekId) => pact.rollWeek(weekId),
    };
}

module.exports = { start, tick, runWeeklyRoll, runPactPulse };

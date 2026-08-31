/**
 * workers/crossSoulWorker.js — runs the cross-soul scans weekly.
 *
 * Mirrors pactWorker: runs every minute, schedules the Sunday 23:59
 * UTC trigger when the ISO week flips. Both scans fire together
 * (topStudentScan first, then topSwapperScan). Best-effort.
 */

const { topStudentScan, topSwapperScan } = require("../services/crossSoulService");

let lastRunWeek = null;

async function tick() {
    try {
        // ISO week "YYYY-Www" — same format the pactWorker uses.
        const now = new Date();
        const year = now.getUTCFullYear();
        const startOfYear = new Date(Date.UTC(year, 0, 1));
        const dayOfYear = Math.floor((now - startOfYear) / 86400000);
        const week = Math.ceil((dayOfYear + startOfYear.getUTCDay() + 1) / 7);
        const weekKey = `${year}-W${String(week).padStart(2, "0")}`;

        // Only run once per ISO week, at the Sunday 23:59 UTC window.
        if (weekKey === lastRunWeek) return;
        if (now.getUTCDay() !== 0) return;            // 0 = Sunday
        if (now.getUTCHours() !== 23) return;        // 23:xx UTC
        if (now.getUTCMinutes() < 55) return;        // fire at 23:59

        lastRunWeek = weekKey;
        console.log(`[cross-soul] weekly run starting (${weekKey})`);
        const a = await topStudentScan();
        console.log(`[cross-soul] topStudentScan invited=${a.invited} topN=${a.topN || '?'}`);
        const b = await topSwapperScan();
        console.log(`[cross-soul] topSwapperScan invited=${b.invited}`);
    } catch (err) {
        console.warn("[cross-soul] tick failed:", err.message);
    }
}

let intervalHandle = null;
function start() {
    if (intervalHandle) return;
    intervalHandle = setInterval(tick, 60_000);
    tick();
}
function stop() {
    if (intervalHandle) clearInterval(intervalHandle);
    intervalHandle = null;
}

module.exports = { start, stop, tick };

/**
 * sessionWorker.js — in-process worker for Orbit Sessions.
 *
 * Responsibilities:
 *   1. T-30min reminder: a single notification to each side
 *      (student + mentor) 30 minutes before scheduledAt. Idempotent on the
 *      (userId, type="session_reminder", sessionId) tuple.
 *   2. Auto-no-show: if a session is still booked/confirmed 15 minutes after
 *      scheduledAt AND no one started it, mark it "no_show" and release the
 *      escrow back to the student (refund in this slice = ledger row).
 *
 * Mirrors the existing UTC-anchored setTimeout chain in workers/orbitWorker.js
 * so the boot/start surface is identical. Both checks run on the same loop.
 *
 * Boot: `startSessionWorker(io)` — call from server.js after `mongoose.connect`.
 * Stop: `stopSessionWorker()` — for tests.
 */

const OrbitSession = require("../models/OrbitSession");
const { createNotification } = require("../services/notify");
const payment = require("../services/payment");
const configStore = require("../services/configStore");

// Public flag that also serves as the loop-on/off switch for tests.
const FLAG = "session_worker";
let running = false;
let timer = null;

const TICK_MS = 5 * 60 * 1000;          // poll every 5 minutes
const REMINDER_LEAD_MS = 30 * 60 * 1000;
const NO_SHOW_GRACE_MS = 15 * 60 * 1000;
const HORIZON_MS = 24 * 60 * 60 * 1000; // look 24h ahead for reminders

function startSessionWorker(io) {
    if (running) return;
    running = true;
    // Persist the "this worker is running" flag so admin UI can surface it.
    configStore.set(FLAG, "started", { ts: Date.now() }).catch(() => {});
    scheduleNext(io, 0);
    console.log("[sessionWorker] started — tick =", TICK_MS, "ms");
}

function stopSessionWorker() {
    running = false;
    if (timer) { clearTimeout(timer); timer = null; }
    configStore.set(FLAG, "stopped", { ts: Date.now() }).catch(() => {});
}

function scheduleNext(io, delayMs) {
    if (!running) return;
    if (timer) clearTimeout(timer);
    timer = setTimeout(async () => {
        try {
            await tick(io);
        } catch (err) {
            console.error("[sessionWorker] tick error:", err.message || err);
        } finally {
            scheduleNext(io, TICK_MS);
        }
    }, delayMs);
}

async function tick(io) {
    const now = new Date();

    // ── 1. T-30min reminder ──────────────────────────────────────────────
    const windowStart = new Date(now.getTime() - TICK_MS);
    const windowEnd = new Date(now.getTime() + HORIZON_MS);
    const reminderDue = await OrbitSession.find({
        status: { $in: ["booked", "confirmed"] },
        scheduledAt: { $gte: windowStart, $lte: windowEnd },
        reminderSentAt: { $in: [null, undefined] },
    }).select("_id studentId mentorId scheduledAt durationMin").lean();

    for (const s of reminderDue) {
        const ms = new Date(s.scheduledAt).getTime() - now.getTime();
        // Only send when we're within the lead window (don't fire on the
        // very first tick after a restart; we may be hours early — that's
        // fine, the next tick narrows the window).
        if (ms > REMINDER_LEAD_MS) continue;
        await nudgeBoth(io, s, "session_reminder", {
            title: "Session starting soon",
            body: `Your ${s.durationMin}-min session starts in ~30 minutes.`,
            data: { link: `/session-room/${s._id}`, sessionId: String(s._id) },
        });
        await OrbitSession.updateOne({ _id: s._id }, { $set: { reminderSentAt: now } });
    }

    // ── 2. Auto no-show ──────────────────────────────────────────────────
    const cutoff = new Date(now.getTime() - NO_SHOW_GRACE_MS);
    const stale = await OrbitSession.find({
        status: { $in: ["booked", "confirmed"] },
        scheduledAt: { $lte: cutoff },
        noShowMarkedAt: { $in: [null, undefined] },
    }).select("_id studentId mentorId scheduledAt payment totalInr").lean();

    for (const s of stale) {
        // Atomic transition — matchedCount===0 means someone else (a real
        // /start call, or this loop on a race) already moved it.
        const updated = await OrbitSession.findOneAndUpdate(
            { _id: s._id, status: { $in: ["booked", "confirmed"] }, noShowMarkedAt: { $in: [null, undefined] } },
            { $set: { status: "no_show", noShowMarkedAt: now, "payment.status": "refunded", "payment.refundedAt": now } },
            { new: true }
        );
        if (!updated) continue;
        // Notify both sides, then issue the refund through the payment service.
        await nudgeBoth(io, updated, "session_no_show", {
            title: "Session marked no-show",
            body: "No one joined within 15 minutes of the start time. The booking has been refunded.",
            data: { link: `/my-sessions`, sessionId: String(updated._id) },
        });
        if (updated.payment && updated.payment.paymentId) {
            try {
                await payment.refund({
                    paymentId: updated.payment.paymentId,
                    amountInr: updated.totalInr,
                });
            } catch (err) {
                console.error("[sessionWorker] refund failed for session", String(updated._id), err.message || err);
            }
        }
    }
}

async function nudgeBoth(io, session, type, base) {
    const payload = (userId) => createNotification(io, userId, { type, ...base });
    return Promise.allSettled([payload(session.studentId), payload(session.mentorId)]);
}

module.exports = { startSessionWorker, stopSessionWorker, FLAG };

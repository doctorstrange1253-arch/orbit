/**
 * sessionsController.js — Orbit Sessions HTTP surface (thin req→service→res).
 *
 * Every booking/scheduling decision (price, conflict, availability) is
 * delegated to services/sessionService.js. Every payment operation goes
 * through services/payment/index.js — there is no direct Razorpay import
 * anywhere in this file. The webhook handler is mounted by the router with
 * express.raw() so the raw body is preserved for HMAC verification.
 */

const crypto = require("crypto");
const User = require("../models/user");
const MentorProfile = require("../models/MentorProfile");
const OrbitSession = require("../models/OrbitSession");
const SessionPackage = require("../models/SessionPackage");
const payment = require("../services/payment");
const sessionService = require("../services/sessionService");
const mentorPayouts = require("../services/mentorPayouts");
const { createNotification } = require("../services/notify");
const { track: analytics } = require("../services/orbitAnalytics");

// ── helpers ────────────────────────────────────────────────────────────────

function shapeMentor(p, user) {
    return {
        userId: p.userId?.toString() || p.userId,
        name: user?.name || (user && user.name) || "Mentor",
        avatar: user?.avatar || "",
        headline: p.headline,
        bio: p.bio,
        skills: (p.skills || []).map(String),
        hourlyRateInr: p.hourlyRateInr,
        rating: p.rating,
        timezone: p.timezone,
        payoutMultiplier: p.payoutMultiplier,
    };
}

// ── POST /api/sessions/mentor/apply ────────────────────────────────────────
exports.applyAsMentor = async (req, res) => {
    try {
        const meId = req.user.id;
        const { headline, bio, skills, hourlyRateInr, timezone, availability } = req.body || {};
        if (!Number.isFinite(hourlyRateInr) || hourlyRateInr < 0) {
            return res.status(400).json({ message: "hourlyRateInr must be a non-negative number" });
        }
        const profile = await MentorProfile.findOneAndUpdate(
            { userId: meId },
            {
                $set: {
                    userId: meId,
                    headline: (headline || "").slice(0, 120),
                    bio: (bio || "").slice(0, 2000),
                    skills: Array.isArray(skills) ? skills : [],
                    hourlyRateInr: Math.floor(hourlyRateInr),
                    timezone: timezone || "Asia/Kolkata",
                    availability: availability || { weekly: [] },
                    applicationStatus: "submitted",
                    status: "active",
                },
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        analytics("session.apply", { userId: String(meId) });
        return res.status(201).json({ ok: true, applicationStatus: profile.applicationStatus, id: String(profile._id) });
    } catch (err) {
        console.error("applyAsMentor:", err);
        return res.status(500).json({ message: "Server error" });
    }
};

// ── GET /api/sessions/mentor/me ────────────────────────────────────────────
// Returns the caller's MentorProfile in ANY application state (draft /
// submitted / approved / rejected / suspended) plus a denormalized earnings
// summary computed from MoneyLedger so the MentorHub can render the
// approved-state dashboard without a second round-trip.
exports.getMyMentor = async (req, res) => {
    try {
        const meId = req.user.id;
        const profile = await MentorProfile.findOne({ userId: meId }).lean();
        if (!profile) return res.json({ profile: null });
        const user = await User.findById(meId).select("name avatar").lean();

        // Rupees live in MoneyLedger (integer paise, double-entry). PhotonLedger
        // is the in-game currency and must never be summed for money.
        const earnings = await mentorPayouts.earningsFor(meId);

        return res.json({
            profile: {
                ...shapeMentor(profile, user),
                applicationStatus: profile.applicationStatus,
                status: profile.status,
                payoutMultiplier: profile.payoutMultiplier,
                availability: profile.availability,
                rejectionReason: profile.rejectionReason || null,
                suspensionReason: profile.suspensionReason || null,
                createdAt: profile.createdAt,
                updatedAt: profile.updatedAt,
            },
            earnings,
        });
    } catch (err) {
        console.error("getMyMentor:", err);
        return res.status(500).json({ message: "Server error" });
    }
};

// ── GET /api/sessions/mentor/bookings ──────────────────────────────────────
// Sessions where the caller is the mentor. Returns denormalized student info
// so the MentorHub can render the bookings list without N+1 round-trips.
exports.getMyMentorBookings = async (req, res) => {
    try {
        const meId = req.user.id;
        const sessions = await OrbitSession.find({ mentorId: meId })
            .sort({ scheduledAt: -1 })
            .limit(100)
            .lean();
        if (!sessions.length) return res.json({ items: [] });
        const studentIds = [...new Set(sessions.map((s) => String(s.studentId)))];
        const students = await User.find({ _id: { $in: studentIds } })
            .select("name avatar")
            .lean();
        const byId = new Map(students.map((u) => [String(u._id), u]));
        const items = sessions.map((s) => ({
            ...s,
            _id: String(s._id),
            studentId: String(s.studentId),
            mentorId: String(s.mentorId),
            mentorProfileId: String(s.mentorProfileId),
            student: byId.get(String(s.studentId)) || { name: "Student" },
        }));
        return res.json({ items });
    } catch (err) {
        console.error("getMyMentorBookings:", err);
        return res.status(500).json({ message: "Server error" });
    }
};

// ── GET /api/sessions/mentors (browse) ─────────────────────────────────────
exports.listMentors = async (req, res) => {
    try {
        const filter = { applicationStatus: "approved", status: "active" };
        const profiles = await MentorProfile.find(filter).select("-__v").lean();
        if (!profiles.length) return res.json({ items: [] });
        const userIds = profiles.map((p) => p.userId);
        const users = await User.find({ _id: { $in: userIds } }).select("name avatar").lean();
        const byId = new Map(users.map((u) => [String(u._id), u]));
        const items = profiles.map((p) => shapeMentor(p, byId.get(String(p.userId))));
        return res.json({ items });
    } catch (err) {
        console.error("listMentors:", err);
        return res.status(500).json({ message: "Server error" });
    }
};

// ── GET /api/sessions/mentors/:userId ──────────────────────────────────────
exports.getMentor = async (req, res) => {
    try {
        const p = await MentorProfile.findOne({ userId: req.params.userId, applicationStatus: "approved" }).lean();
        if (!p) return res.status(404).json({ message: "Mentor not found" });
        const user = await User.findById(p.userId).select("name avatar").lean();
        return res.json(shapeMentor(p, user));
    } catch (err) {
        console.error("getMentor:", err);
        return res.status(500).json({ message: "Server error" });
    }
};

// ── POST /api/sessions/book ────────────────────────────────────────────────
exports.book = async (req, res) => {
    try {
        const meId = req.user.id;
        const { mentorUserId, scheduledAt, durationMin, timezone } = req.body || {};
        if (!mentorUserId) return res.status(400).json({ message: "mentorUserId is required" });
        if (String(mentorUserId) === String(meId)) return res.status(400).json({ message: "Cannot book a session with yourself" });
        const profile = await MentorProfile.findOne({ userId: mentorUserId, applicationStatus: "approved" }).lean();
        if (!profile) return res.status(404).json({ message: "Mentor not found" });

        const when = scheduledAt ? new Date(scheduledAt) : null;
        if (!when || Number.isNaN(when.getTime())) return res.status(400).json({ message: "scheduledAt is required (ISO timestamp)" });
        if (!sessionService.allowedDurations().includes(durationMin)) {
            return res.status(400).json({ message: `durationMin must be one of ${sessionService.allowedDurations().join(", ")}` });
        }

        // Availability gate
        if (!sessionService.isWithinAvailability({
            scheduledAt: when, durationMin, availability: profile.availability,
        })) {
            return res.status(409).json({ message: "Requested time is outside the mentor's weekly availability" });
        }

        // Conflict detection (overlapping BOOKED/CONFIRMED/LIVE)
        const dayStart = new Date(when.getTime() - 24 * 60 * 60 * 1000);
        const dayEnd = new Date(when.getTime() + 24 * 60 * 60 * 1000);
        const existing = await OrbitSession.find({
            mentorId: profile.userId,
            scheduledAt: { $gte: dayStart, $lte: dayEnd },
            status: { $in: ["booked", "confirmed", "live"] },
        }).select("scheduledAt durationMin status").lean();
        if (sessionService.hasConflict({ scheduledAt: when, durationMin, existing })) {
            return res.status(409).json({ message: "Mentor already has a session in that slot" });
        }

        // Pricing snapshot (immutable after this)
        const price = sessionService.priceSession({
            rateInr: profile.hourlyRateInr, durationMin,
        });
        const roomId = sessionService.buildRoomId(meId, profile.userId);

        // Create the pending session and a Razorpay order in one shot
        const order = await payment.createOrder({
            amountInr: price.totalInr,
            receipt: `sess_${Date.now()}`,
            notes: { studentId: String(meId), mentorId: String(profile.userId) },
        });

        const session = await OrbitSession.create({
            mentorProfileId: profile._id,
            studentId: meId,
            mentorId: profile.userId,
            status: "pending_payment",
            rateInr: profile.hourlyRateInr,
            durationMin,
            totalInr: price.totalInr,
            platformCutPct: price.platformCutPct,
            platformCutInr: price.platformCutInr,
            mentorPayoutInr: price.mentorPayoutInr,
            scheduledAt: when,
            timezone: timezone || profile.timezone || "Asia/Kolkata",
            roomId,
            payment: {
                provider: "razorpay",
                orderId: order.orderId,
                status: "created",
            },
        });

        analytics("session.book", { sessionId: String(session._id), studentId: String(meId), mentorId: String(profile.userId), amountInr: price.totalInr });
        return res.status(201).json({
            id: String(session._id),
            totalInr: price.totalInr,
            platformCutPct: price.platformCutPct,
            platformCutInr: price.platformCutInr,
            mentorPayoutInr: price.mentorPayoutInr,
            order: {
                orderId: order.orderId,
                amount: order.amount || (price.totalInr * 100),
                currency: order.currency || "INR",
                keyId: payment.publicKeyId(),
            },
        });
    } catch (err) {
        console.error("book:", err);
        return res.status(500).json({ message: "Server error" });
    }
};

// ── POST /api/sessions/:id/payment-verify ──────────────────────────────────
exports.verifyPayment = async (req, res) => {
    try {
        const meId = req.user.id;
        const { paymentId, signature, orderId } = req.body || {};
        if (!paymentId || !signature || !orderId) return res.status(400).json({ message: "paymentId, signature and orderId are required" });
        payment.verifySignature({ orderId, paymentId, signature });

        // Atomic transition pending_payment → booked. matchedCount===0 → 409.
        const updated = await OrbitSession.findOneAndUpdate(
            { _id: req.params.id, studentId: meId, status: "pending_payment", "payment.orderId": orderId },
            {
                $set: {
                    status: "booked",
                    "payment.paymentId": paymentId,
                    "payment.signature": signature,
                    "payment.status": "held",
                    "payment.capturedAt": new Date(),
                },
            },
            { new: true }
        );
        if (!updated) return res.status(409).json({ message: "Session is not awaiting this payment" });

        // Fire-and-forget notifications to both sides.
        const io = req.app.get("io");
        createNotification(io, updated.studentId, {
            type: "session_booked",
            title: "Session confirmed",
            body: "Your Orbit Session is booked. We'll nudge you 30 min before it starts.",
            data: { link: `/my-sessions`, sessionId: String(updated._id) },
        }).catch(() => {});
        createNotification(io, updated.mentorId, {
            type: "session_booked",
            title: "New session booked",
            body: `A student booked a ${updated.durationMin}-min session. We'll remind you 30 min before.`,
            data: { link: `/my-sessions`, sessionId: String(updated._id) },
        }).catch(() => {});

        analytics("session.payment.verified", { sessionId: String(updated._id), amountInr: updated.totalInr });
        return res.json({ ok: true, status: updated.status, id: String(updated._id) });
    } catch (err) {
        console.error("verifyPayment:", err.message || err);
        return res.status(400).json({ message: err.message || "Invalid payment" });
    }
};

// ── GET /api/sessions/me ──────────────────────────────────────────────────
exports.listMine = async (req, res) => {
    try {
        const meId = req.user.id;
        const sessions = await OrbitSession.find({
            $or: [{ studentId: meId }, { mentorId: meId }],
        })
            .sort({ scheduledAt: -1 })
            .limit(100)
            .lean();
        return res.json({ items: sessions.map((s) => ({ ...s, _id: String(s._id), studentId: String(s.studentId), mentorId: String(s.mentorId), mentorProfileId: String(s.mentorProfileId) })) });
    } catch (err) {
        console.error("listMine:", err);
        return res.status(500).json({ message: "Server error" });
    }
};

// ── GET /api/sessions/:id ──────────────────────────────────────────────────
exports.getOne = async (req, res) => {
    try {
        const meId = req.user.id;
        const s = await OrbitSession.findById(req.params.id).lean();
        if (!s) return res.status(404).json({ message: "Not found" });
        if (String(s.studentId) !== String(meId) && String(s.mentorId) !== String(meId)) {
            return res.status(403).json({ message: "Not your session" });
        }
        return res.json({ ...s, _id: String(s._id) });
    } catch (err) {
        console.error("getOne:", err);
        return res.status(500).json({ message: "Server error" });
    }
};

// ── POST /api/sessions/:id/start ───────────────────────────────────────────
exports.start = async (req, res) => {
    try {
        const meId = req.user.id;
        const s = await OrbitSession.findById(req.params.id);
        if (!s) return res.status(404).json({ message: "Not found" });
        if (String(s.mentorId) !== String(meId) && String(s.studentId) !== String(meId)) {
            return res.status(403).json({ message: "Not your session" });
        }
        if (!["booked", "confirmed"].includes(s.status)) {
            return res.status(409).json({ message: `Session is in state '${s.status}', cannot start` });
        }
        s.status = "live";
        s.startedAt = s.startedAt || new Date();
        await s.save();
        analytics("session.start", { sessionId: String(s._id) });
        return res.json({ ok: true, status: s.status });
    } catch (err) {
        console.error("start:", err);
        return res.status(500).json({ message: "Server error" });
    }
};

// ── POST /api/sessions/:id/complete ────────────────────────────────────────
exports.complete = async (req, res) => {
    try {
        const meId = req.user.id;
        const s = await OrbitSession.findById(req.params.id);
        if (!s) return res.status(404).json({ message: "Not found" });
        if (String(s.mentorId) !== String(meId) && String(s.studentId) !== String(meId)) {
            return res.status(403).json({ message: "Not your session" });
        }
        if (!["live", "booked", "confirmed"].includes(s.status)) {
            return res.status(409).json({ message: `Session is in state '${s.status}', cannot complete` });
        }
        const now = new Date();
        s.status = "completed";
        s.endedAt = now;
        if (s.startedAt) s.durationSec = Math.round((now - s.startedAt) / 1000);
        // Mark escrow released; trigger the queued payout (writes ledger row).
        s.payment.status = "released";
        s.payment.releasedAt = now;
        await s.save();

        // Mark the mentor's rating + auto-bump payout multiplier when eligible.
        // (Live rating increments happen via /rate; this is the payout trigger.)
        if (s.mentorPayoutInr > 0) {
            await payment.initiatePayout({ mentorId: s.mentorId, amountInr: s.mentorPayoutInr, sessionId: String(s._id) });
        }

        // ── Gameology + Pact hooks ───────────────────────────────────────────
        // One fan-in: every session-completed XP / Pact-score bump goes through
        // these service calls, never through ad-hoc $inc anywhere else.
        // Fire-and-forget; never block the response.
        const io = req.app.get("io");
        const gameology = require("../services/gameologyService");
        const pact = require("../services/pactService");
        Promise.all([
            gameology.awardXp(s.studentId, "session_completed", { sessionId: String(s._id) }),
            pact.recordSession(s.mentorId, { durationMin: s.durationMin }),
        ]).then(([g, p]) => {
            if (g) {
                io?.to(`user_${s.studentId}`).emit("gameology:xp", {
                    event: "session_completed",
                    xp: g.xpAwarded,
                    totalXp: g.totalXp,
                    level: g.level,
                    leveledUp: g.leveledUp,
                    currentStreak: g.currentStreak,
                    weeklyXp: g.weeklyXp,
                    league: g.league,
                    newAchievements: g.newAchievements,
                });
            }
            if (p) {
                io?.to(`user_${s.mentorId}`).emit("pact:score", {
                    weekScore: p.weekScore,
                    weekId: p.weekId,
                });
            }
        }).catch(() => {});

        analytics("session.complete", { sessionId: String(s._id), mentorPayoutInr: s.mentorPayoutInr });
        return res.json({ ok: true, status: s.status, mentorPayoutInr: s.mentorPayoutInr });
    } catch (err) {
        console.error("complete:", err);
        return res.status(500).json({ message: "Server error" });
    }
};

// ── POST /api/sessions/:id/rate ────────────────────────────────────────────
exports.rate = async (req, res) => {
    try {
        const meId = req.user.id;
        const { stars, comment } = req.body || {};
        if (!Number.isInteger(stars) || stars < 1 || stars > 5) return res.status(400).json({ message: "stars must be 1..5" });
        const s = await OrbitSession.findById(req.params.id);
        if (!s) return res.status(404).json({ message: "Not found" });
        if (s.status !== "completed") return res.status(409).json({ message: "Session not completed" });
        const now = new Date();
        let targetMentorId = null;
        if (String(s.studentId) === String(meId)) {
            if (s.studentRating && s.studentRating.stars) return res.status(409).json({ message: "Already rated" });
            s.studentRating = { stars, comment: comment || null, createdAt: now };
            targetMentorId = s.mentorId;
        } else if (String(s.mentorId) === String(meId)) {
            if (s.mentorRating && s.mentorRating.stars) return res.status(409).json({ message: "Already rated" });
            s.mentorRating = { stars, comment: comment || null, createdAt: now };
            targetMentorId = s.studentId;
        } else {
            return res.status(403).json({ message: "Not your session" });
        }
        await s.save();

        // ── Pact: a student rating the mentor feeds the mentor's weekly
        //    rating signal. We push it as a separate `bumpSignal` so the
        //    cap is enforced per ISO week.
        if (String(s.studentId) === String(meId) && targetMentorId) {
            require("../services/pactService")
                .recordSession(targetMentorId, { rating: stars })
                .then((p) => {
                    if (p) {
                        const io = req.app.get("io");
                        io?.to(`user_${targetMentorId}`).emit("pact:score", {
                            weekScore: p.weekScore,
                            weekId: p.weekId,
                        });
                    }
                })
                .catch(() => {});
        }

        // Denormalize the rating onto the mentor's profile (if this is the student
        // rating the mentor) and decide whether to bump the payout multiplier.
        if (String(s.studentId) === String(meId) && targetMentorId) {
            const profile = await MentorProfile.findOne({ userId: targetMentorId });
            if (profile) {
                profile.rating = profile.rating || { count: 0, sum: 0, average: 0 };
                profile.rating.count += 1;
                profile.rating.sum += stars;
                profile.rating.average = +(profile.rating.sum / profile.rating.count).toFixed(3);
                if (!profile.ratingCutEligibleSince && profile.rating.count >= 20 && profile.rating.average >= 4.8) {
                    profile.ratingCutEligibleSince = now;
                    profile.payoutMultiplier = 0.90;
                }
                await profile.save();
            }
        }
        return res.json({ ok: true });
    } catch (err) {
        console.error("rate:", err);
        return res.status(500).json({ message: "Server error" });
    }
};

// ── POST /api/sessions/webhook  (mounted with express.raw before json) ─────
exports.webhook = async (req, res) => {
    try {
        const sig = req.get("x-razorpay-signature");
        const { event, payload } = payment.handleWebhook(req.body, sig);
        // Idempotent dispatch on the live payment object.
        if (event === "payment.captured") {
            const id = payload?.payment?.entity?.id;
            const orderId = payload?.payment?.entity?.order_id;
            if (id && orderId) {
                await OrbitSession.findOneAndUpdate(
                    { "payment.orderId": orderId, "payment.status": { $in: ["created", "held"] } },
                    { $set: { "payment.paymentId": id, "payment.status": "held", "payment.capturedAt": new Date() } }
                );
            }
        } else if (event === "refund.processed") {
            const id = payload?.refund?.entity?.payment_id;
            if (id) {
                await OrbitSession.findOneAndUpdate(
                    { "payment.paymentId": id },
                    { $set: { "payment.status": "refunded", "payment.refundedAt": new Date() } }
                );
            }
        }
        return res.json({ ok: true });
    } catch (err) {
        console.error("session webhook:", err.message || err);
        return res.status(400).json({ message: err.message || "Webhook failed" });
    }
};

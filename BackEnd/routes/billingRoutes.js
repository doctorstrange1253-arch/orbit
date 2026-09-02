const express = require("express");
const auth = require("../middleware/auth");
const Plan = require("../models/Plan");
const Subscription = require("../models/Subscription");
const SubscriptionPeriod = require("../models/SubscriptionPeriod");
const CourseSeat = require("../models/CourseSeat");
const Course = require("../models/Course");
const plans = require("../services/billingPlans");

const router = express.Router();

const PAYMENTS_LIVE = process.env.PAYMENTS_LIVE === "true";

function authOptional(req, res, next) {
    if (!req.header("Authorization")) return next();
    return auth(req, res, next);
}

async function livePlans() {
    const rows = await Plan.find({ status: "live" }).sort({ sortOrder: 1 }).lean();
    if (rows.length > 0) return rows;
    return plans.PLAN_SEED;
}

router.get("/plans", authOptional, async (req, res) => {
    try {
        const rows = await livePlans();
        const monthly = rows.filter((p) => p.interval === "month");
        const yearly = rows.filter((p) => p.interval === "year");
        return res.json({
            paymentsLive: PAYMENTS_LIVE,
            currency: "INR",
            taxNote: "Every price includes all taxes (18% GST).",
            monthly: monthly.map((p) => plans.quote(p)),
            yearly: yearly.map((p) => plans.quote(p)),
        });
    } catch (err) {
        console.error("billing.plans:", err);
        return res.status(500).json({ message: "Server error" });
    }
});

router.get("/me", auth, async (req, res) => {
    try {
        const sub = await Subscription.findLiveFor(req.user.id).lean();
        if (!sub) {
            return res.json({
                paymentsLive: PAYMENTS_LIVE,
                subscription: null,
                planKey: plans.PLAN_KEYS.FREE,
                seatsGranted: 0,
                seatsClaimed: 0,
                seatsLeft: 0,
                seats: [],
            });
        }
        const period = sub.currentPeriodId
            ? await SubscriptionPeriod.findById(sub.currentPeriodId).lean()
            : null;
        const seats = period
            ? await CourseSeat.find({ periodId: period._id, status: { $in: ["active", "carried"] } })
                .populate("courseId", "title thumbnail category")
                .lean()
            : [];
        return res.json({
            paymentsLive: PAYMENTS_LIVE,
            subscription: {
                planKey: sub.planKey,
                status: sub.status,
                seatsGranted: sub.seatsGranted,
                cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
                startedAt: sub.startedAt,
            },
            period: period && {
                periodIndex: period.periodIndex,
                periodStart: period.periodStart,
                periodEnd: period.periodEnd,
                entitlementEndsAt: period.entitlementEndsAt,
            },
            planKey: sub.planKey,
            seatsGranted: sub.seatsGranted,
            seatsClaimed: seats.length,
            seatsLeft: Math.max(0, sub.seatsGranted - seats.length),
            seats: seats.map((s) => ({
                courseId: s.courseId?._id ? String(s.courseId._id) : String(s.courseId),
                title: s.courseId?.title || null,
                thumbnail: s.courseId?.thumbnail || null,
                claimedAt: s.claimedAt,
                status: s.status,
                gatedLessonsCompleted: s.engagement?.gatedLessonsCompleted || 0,
                stagesCleared: s.engagement?.stagesCleared || 0,
            })),
        });
    } catch (err) {
        console.error("billing.me:", err);
        return res.status(500).json({ message: "Server error" });
    }
});

router.post("/subscribe", auth, async (req, res) => {
    try {
        const key = String(req.body?.planKey || "");
        const all = await livePlans();
        const plan = all.find((p) => p.key === key);
        if (!plan) return res.status(404).json({ message: "Unknown plan" });
        if (plan.priceMinor === 0) {
            return res.status(400).json({ message: "The free plan needs no checkout — it is already yours." });
        }
        if (!PAYMENTS_LIVE) {
            const q = plans.quote(plan);
            return res.status(503).json({
                code: "PAYMENTS_COMING_SOON",
                message: "Checkout opens soon. Your plan is reserved the moment it does.",
                heading: "Coming soon",
                body: `${q.name} will be ${q.priceLabel} ${q.priceSuffix}, ${q.taxNote.toLowerCase()} Peer swaps stay free forever, and every introduction video is already open to you.`,
                plan: q,
            });
        }
        return res.status(501).json({ message: "Checkout is enabled but no provider is wired yet." });
    } catch (err) {
        console.error("billing.subscribe:", err);
        return res.status(500).json({ message: "Server error" });
    }
});

router.get("/entitlement/:courseId", auth, async (req, res) => {
    try {
        const course = await Course.findById(req.params.courseId).select("mentorId lessons priceInr").lean();
        if (!course) return res.status(404).json({ message: "Course not found" });

        const owns = String(course.mentorId) === String(req.user.id);
        const introLessonId = (course.lessons || []).find((l) => l.isIntro)?._id || null;
        if (owns) {
            return res.json({ access: "owner", seat: null, introLessonId, paymentsLive: PAYMENTS_LIVE });
        }

        const sub = await Subscription.findLiveFor(req.user.id).lean();
        if (!sub || !sub.currentPeriodId) {
            return res.json({ access: "intro_only", seat: null, introLessonId, paymentsLive: PAYMENTS_LIVE });
        }
        const seat = await CourseSeat.findOne({
            periodId: sub.currentPeriodId,
            courseId: course._id,
            status: { $in: ["active", "carried"] },
        }).lean();
        return res.json({
            access: seat ? "seated" : "intro_only",
            seat: seat && {
                claimedAt: seat.claimedAt,
                gatedLessonsCompleted: seat.engagement?.gatedLessonsCompleted || 0,
                stagesCleared: seat.engagement?.stagesCleared || 0,
            },
            introLessonId,
            paymentsLive: PAYMENTS_LIVE,
        });
    } catch (err) {
        console.error("billing.entitlement:", err);
        return res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;

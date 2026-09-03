const mongoose = require("mongoose");
const User = require("../models/user");
const MentorProfile = require("../models/MentorProfile");
const OrbitSession = require("../models/OrbitSession");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const Honour = require("../models/Honour");
const honours = require("../services/honours");
const photonLedger = require("../services/photonLedger");
const { createNotification } = require("../services/notify");

function utcDay(date) {
    return new Date(date).toISOString().slice(0, 10);
}

async function hasLearnedFrom(meId, mentorUserId) {
    const taught = await OrbitSession.exists({
        studentId: meId,
        mentorId: mentorUserId,
        status: { $in: ["live", "completed"] },
    });
    if (taught) return true;
    const courseIds = await Course.find({ mentorId: mentorUserId }).select("_id").lean();
    if (!courseIds.length) return false;
    return !!(await Enrollment.exists({ userId: meId, courseId: { $in: courseIds.map((c) => c._id) } }));
}

exports.catalogue = async (_req, res) => res.json({ items: honours.catalogue() });

exports.send = async (req, res) => {
    try {
        const meId = req.user.id;
        const { userId: mentorUserId } = req.params;
        const { tier, note } = req.body || {};

        if (!mongoose.isValidObjectId(mentorUserId)) return res.status(400).json({ message: "Invalid mentor" });
        if (String(mentorUserId) === String(meId)) return res.status(400).json({ message: "You cannot honour yourself", reason: "self" });
        if (!honours.isTier(tier)) return res.status(400).json({ message: `tier must be one of ${honours.TIER_IDS.join(", ")}`, reason: "tier" });

        const profile = await MentorProfile.findOne({ userId: mentorUserId, applicationStatus: "approved" }).select("_id userId").lean();
        if (!profile) return res.status(404).json({ message: "Mentor not found" });

        if (!(await hasLearnedFrom(meId, mentorUserId))) {
            return res.status(403).json({
                message: "Honours come from people you have actually learned from — take a session or enrol in a course first.",
                reason: "not_taught",
            });
        }

        const cost = honours.costOf(tier);
        const day = utcDay(new Date());

        let honour;
        try {
            honour = await Honour.create({
                fromUserId: meId,
                mentorUserId,
                tier,
                photons: cost,
                note: typeof note === "string" ? note.trim().slice(0, 240) : "",
                day,
            });
        } catch (err) {
            if (err?.code === 11000) {
                return res.status(409).json({ message: "You have already honoured this mentor today.", reason: "already_today" });
            }
            throw err;
        }

        const debit = await User.updateOne(
            { _id: meId, "orbit.stardust": { $gte: cost } },
            { $inc: { "orbit.stardust": -cost } },
        );
        if (!debit.matchedCount) {
            await Honour.deleteOne({ _id: honour._id });
            return res.status(400).json({ message: `A ${honours.TIERS[tier].label} costs ${cost} Photons.`, reason: "insufficient" });
        }

        await MentorProfile.updateOne({ _id: profile._id }, honours.incrementFor(tier));
        photonLedger.record(meId, -cost, "honour_sent");

        const sender = await User.findById(meId).select("name orbit.stardust").lean();
        createNotification(req.app.get("io"), mentorUserId, {
            type: "mentor_honour",
            title: `${honours.TIERS[tier].label} received`,
            body: `${sender?.name || "A student"} honoured you with a ${honours.TIERS[tier].label}${honour.note ? ` — “${honour.note}”` : ""}`,
            data: { from: String(meId), tier, photons: cost },
        }).catch(() => {});

        const after = await MentorProfile.findById(profile._id).select("honours").lean();
        return res.status(201).json({
            tier,
            photons: cost,
            honours: honours.shapeHonours(after?.honours),
            stardust: sender?.orbit?.stardust ?? null,
        });
    } catch (err) {
        console.error("honours.send:", err);
        return res.status(500).json({ message: "Server error" });
    }
};

exports.list = async (req, res) => {
    try {
        const { userId: mentorUserId } = req.params;
        if (!mongoose.isValidObjectId(mentorUserId)) return res.status(400).json({ message: "Invalid mentor" });

        const profile = await MentorProfile.findOne({ userId: mentorUserId }).select("honours").lean();
        const rows = await Honour.find({ mentorUserId }).sort({ createdAt: -1 }).limit(20).lean();
        const senders = await User.find({ _id: { $in: rows.map((r) => r.fromUserId) } }).select("name avatar").lean();
        const byId = new Map(senders.map((u) => [String(u._id), u]));

        const mine = await Honour.findOne({ mentorUserId, fromUserId: req.user.id }).sort({ createdAt: -1 }).lean();

        return res.json({
            totals: honours.shapeHonours(profile?.honours),
            canHonourToday: !mine || mine.day !== utcDay(new Date()),
            items: rows.map((r) => ({
                _id: String(r._id),
                tier: r.tier,
                note: r.note || "",
                at: r.createdAt,
                from: {
                    userId: String(r.fromUserId),
                    name: byId.get(String(r.fromUserId))?.name || "A student",
                    avatar: byId.get(String(r.fromUserId))?.avatar || "",
                },
            })),
        });
    } catch (err) {
        console.error("honours.list:", err);
        return res.status(500).json({ message: "Server error" });
    }
};


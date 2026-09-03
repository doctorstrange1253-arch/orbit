process.env.NODE_ENV = "test";
process.env.RAZORPAY_MOCK = "true";
process.env.RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || "k";
process.env.RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "s";
process.env.RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || "hook";
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";

const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const express = require("express");
const request = require("supertest");
const jwt = require("jsonwebtoken");

const honours = require("../services/honours");

let mongo;
let app;

beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri());
    await require("../models/Honour").init();
    const sessionRoutes = require("../routes/sessionRoutes");
    app = express();
    app.set("io", null);
    app.use("/api/sessions", sessionRoutes);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongo.stop();
});

afterEach(async () => {
    for (const name in mongoose.connection.collections) {
        await mongoose.connection.collections[name].deleteMany();
    }
});

const User = require("../models/user");
const MentorProfile = require("../models/MentorProfile");
const OrbitSession = require("../models/OrbitSession");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const Honour = require("../models/Honour");
const PhotonLedger = require("../models/PhotonLedger");

function tokenFor(user) {
    return jwt.sign(
        { id: String(user._id), roles: user.roles, rolesVersion: user.rolesVersion || 0 },
        process.env.JWT_SECRET,
    );
}

async function makeUser({ roles = ["student"], stardust = 5000 } = {}) {
    return User.create({
        name: `u_${Math.random().toString(36).slice(2, 8)}`,
        email: `${Math.random().toString(36).slice(2, 10)}@t.co`,
        password: "hashed-not-used",
        roles,
        orbit: { stardust },
    });
}

async function makeMentor() {
    const user = await makeUser({ roles: ["mentor"], stardust: 0 });
    const profile = await MentorProfile.create({
        userId: user._id,
        applicationStatus: "approved",
        status: "active",
        headline: "Top mentor",
        bio: "10y",
        skills: [],
        hourlyRateInr: 1000,
        payoutMultiplier: 0.85,
        timezone: "Asia/Kolkata",
        availability: { weekly: [] },
    });
    return { user, profile };
}

async function completedSession(studentId, mentorId) {
    return OrbitSession.create({
        mentorProfileId: new mongoose.Types.ObjectId(),
        studentId,
        mentorId,
        status: "completed",
        rateInr: 1000,
        durationMin: 60,
        totalInr: 1000,
        platformCutPct: 15,
        platformCutInr: 150,
        mentorPayoutInr: 850,
        scheduledAt: new Date(),
        roomId: "Session-honour",
        payment: { provider: "razorpay", orderId: `order_${Math.random()}`, status: "released" },
    });
}

const send = (student, mentorUserId, body) => request(app)
    .post(`/api/sessions/mentors/${mentorUserId}/honours`)
    .set("Authorization", `Bearer ${tokenFor(student)}`)
    .send(body);

describe("honours service — pure", () => {
    it("prices the three tiers and refuses anything else", () => {
        expect(honours.costOf("beacon")).toBe(50);
        expect(honours.costOf("comet")).toBe(200);
        expect(honours.costOf("supernova")).toBe(1000);
        expect(() => honours.costOf("legend")).toThrow();
        expect(honours.isTier("beacon")).toBe(true);
        expect(honours.isTier("toString")).toBe(false);
    });

    it("shapes counters, deriving the count from the tiers when it is behind", () => {
        const shaped = honours.shapeHonours({ beacon: 2, comet: 1, supernova: 0, photons: 300, count: 0 });
        expect(shaped.count).toBe(3);
        expect(shaped.byTier).toEqual({ beacon: 2, comet: 1, supernova: 0 });
        expect(shaped.photons).toBe(300);
    });

    it("reports zeroes for a mentor nobody has honoured", () => {
        expect(honours.shapeHonours(undefined)).toMatchObject({
            count: 0, photons: 0, byTier: { beacon: 0, comet: 0, supernova: 0 }, lastAt: null,
        });
    });

    it("builds an increment that touches honours and nothing else", () => {
        const inc = honours.incrementFor("comet");
        expect(inc.$inc).toEqual({ "honours.count": 1, "honours.photons": 200, "honours.comet": 1 });
        expect(Object.keys(inc.$inc).every((k) => k.startsWith("honours."))).toBe(true);
        expect(Object.keys(inc.$set)).toEqual(["honours.lastAt"]);
    });
});

describe("POST /sessions/mentors/:id/honours", () => {
    it("refuses someone who has never learned from this mentor", async () => {
        const student = await makeUser();
        const { user: mentor } = await makeMentor();
        const res = await send(student, mentor._id, { tier: "beacon" }).expect(403);
        expect(res.body.reason).toBe("not_taught");
        expect(await Honour.countDocuments({})).toBe(0);
    });

    it("spends the Photons, marks the mentor, and never touches their rating", async () => {
        const student = await makeUser({ stardust: 500 });
        const { user: mentor, profile } = await makeMentor();
        await completedSession(student._id, mentor._id);

        const res = await send(student, mentor._id, { tier: "comet", note: "The chord lesson finally landed." }).expect(201);
        expect(res.body.tier).toBe("comet");
        expect(res.body.photons).toBe(200);
        expect(res.body.honours.byTier.comet).toBe(1);
        expect(res.body.honours.photons).toBe(200);

        const after = await User.findById(student._id).select("orbit.stardust").lean();
        expect(after.orbit.stardust).toBe(300);

        const mp = await MentorProfile.findById(profile._id).lean();
        expect(mp.honours.count).toBe(1);
        expect(mp.honours.comet).toBe(1);
        expect(mp.honours.photons).toBe(200);
        expect(mp.honours.lastAt).toBeTruthy();
        expect(mp.rating.count).toBe(0);
        expect(mp.rating.average).toBe(0);
    });

    it("records the spend on the sender's Photon ledger and gives the mentor no Photons", async () => {
        const student = await makeUser({ stardust: 500 });
        const { user: mentor } = await makeMentor();
        await completedSession(student._id, mentor._id);

        await send(student, mentor._id, { tier: "beacon" }).expect(201);
        for (let i = 0; i < 40 && !(await PhotonLedger.countDocuments({ userId: student._id })); i += 1) {
            await new Promise((r) => setTimeout(r, 10));
        }
        const rows = await PhotonLedger.find({ userId: student._id }).lean();
        expect(rows).toHaveLength(1);
        expect(rows[0].delta).toBe(-50);
        expect(rows[0].source).toBe("honour_sent");
        expect(await PhotonLedger.countDocuments({ userId: mentor._id })).toBe(0);
        const mentorAfter = await User.findById(mentor._id).select("orbit.stardust").lean();
        expect(mentorAfter.orbit.stardust).toBe(0);
    });
});

describe("honours — the guards", () => {
    it("allows one honour per mentor per day and spends nothing on the second", async () => {
        const student = await makeUser({ stardust: 500 });
        const { user: mentor } = await makeMentor();
        await completedSession(student._id, mentor._id);

        await send(student, mentor._id, { tier: "beacon" }).expect(201);
        const second = await send(student, mentor._id, { tier: "supernova" }).expect(409);
        expect(second.body.reason).toBe("already_today");

        const after = await User.findById(student._id).select("orbit.stardust").lean();
        expect(after.orbit.stardust).toBe(450);
        expect(await Honour.countDocuments({})).toBe(1);
    });

    it("refuses an honour the student cannot afford and leaves no row behind", async () => {
        const student = await makeUser({ stardust: 40 });
        const { user: mentor, profile } = await makeMentor();
        await completedSession(student._id, mentor._id);

        const res = await send(student, mentor._id, { tier: "beacon" }).expect(400);
        expect(res.body.reason).toBe("insufficient");
        expect(await Honour.countDocuments({})).toBe(0);

        const after = await User.findById(student._id).select("orbit.stardust").lean();
        expect(after.orbit.stardust).toBe(40);
        const mp = await MentorProfile.findById(profile._id).lean();
        expect(mp.honours.count).toBe(0);
    });

    it("counts an enrolment in the mentor's course as having learned from them", async () => {
        const student = await makeUser({ stardust: 500 });
        const { user: mentor } = await makeMentor();
        const course = await Course.create({ mentorId: mentor._id, title: "Chords", lessons: [] });
        await Enrollment.create({ userId: student._id, courseId: course._id });

        await send(student, mentor._id, { tier: "beacon" }).expect(201);
        expect(await Honour.countDocuments({})).toBe(1);
    });

    it("rejects a bad tier, a self-honour and an unapproved mentor", async () => {
        const student = await makeUser({ stardust: 500 });
        const { user: mentor } = await makeMentor();
        await completedSession(student._id, mentor._id);

        expect((await send(student, mentor._id, { tier: "legend" }).expect(400)).body.reason).toBe("tier");
        expect((await send(student, student._id, { tier: "beacon" }).expect(400)).body.reason).toBe("self");

        const pending = await makeUser({ roles: ["mentor"] });
        await MentorProfile.create({
            userId: pending._id, applicationStatus: "submitted", status: "active",
            headline: "h", bio: "b", skills: [], hourlyRateInr: 500,
            payoutMultiplier: 0.85, timezone: "Asia/Kolkata", availability: { weekly: [] },
        });
        await send(student, pending._id, { tier: "beacon" }).expect(404);
    });

    it("401s without a token", async () => {
        const { user: mentor } = await makeMentor();
        await request(app).post(`/api/sessions/mentors/${mentor._id}/honours`).send({ tier: "beacon" }).expect(401);
    });
});

describe("GET /sessions/mentors/:id/honours", () => {
    it("lists who honoured the mentor, with totals and today's eligibility", async () => {
        const student = await makeUser({ stardust: 500 });
        const { user: mentor } = await makeMentor();
        await completedSession(student._id, mentor._id);
        const auth = `Bearer ${tokenFor(student)}`;

        const before = await request(app)
            .get(`/api/sessions/mentors/${mentor._id}/honours`)
            .set("Authorization", auth)
            .expect(200);
        expect(before.body.items).toEqual([]);
        expect(before.body.totals.count).toBe(0);
        expect(before.body.canHonourToday).toBe(true);

        await send(student, mentor._id, { tier: "comet", note: "Thank you." }).expect(201);

        const after = await request(app)
            .get(`/api/sessions/mentors/${mentor._id}/honours`)
            .set("Authorization", auth)
            .expect(200);
        expect(after.body.items).toHaveLength(1);
        expect(after.body.items[0].tier).toBe("comet");
        expect(after.body.items[0].note).toBe("Thank you.");
        expect(after.body.items[0].from.name).toBe(student.name);
        expect(after.body.totals.byTier.comet).toBe(1);
        expect(after.body.canHonourToday).toBe(false);
    });

    it("publishes the tier catalogue", async () => {
        const student = await makeUser();
        const res = await request(app)
            .get("/api/sessions/honours/tiers")
            .set("Authorization", `Bearer ${tokenFor(student)}`)
            .expect(200);
        expect(res.body.items.map((t) => t.id)).toEqual(["beacon", "comet", "supernova"]);
        expect(res.body.items.map((t) => t.photons)).toEqual([50, 200, 1000]);
    });

    it("shows honours on the mentor's public profile", async () => {
        const student = await makeUser({ stardust: 2000 });
        const { user: mentor } = await makeMentor();
        await completedSession(student._id, mentor._id);
        await send(student, mentor._id, { tier: "supernova" }).expect(201);

        const res = await request(app)
            .get(`/api/sessions/mentors/${mentor._id}`)
            .set("Authorization", `Bearer ${tokenFor(student)}`)
            .expect(200);
        expect(res.body.honours.count).toBe(1);
        expect(res.body.honours.byTier.supernova).toBe(1);
        expect(res.body.honours.photons).toBe(1000);
    });
});

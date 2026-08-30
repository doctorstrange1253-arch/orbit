/**
 * orbitSession.test.js — DB-backed integration tests for the OrbitSession FSM.
 *
 * The headline test exercises the full vertical:
 *   1. book()         → status="pending_payment", pricing snapshot captured
 *   2. verifyPayment()→ status="booked", payment.status="held"
 *   3. start()        → status="live"
 *   4. complete()     → status="completed", payment.status="released",
 *                       mentorPayoutInr === floor(1000 * 0.85) (IMMUTABLE)
 *                       AND a PhotonLedger row tagged "session_payout_pending"
 *                       for +850 against the mentor.
 *
 * Plus FSM guards, webhook idempotency, and the conflict-detection call.
 */

// Set the env BEFORE any require loads services that capture the env.
process.env.RAZORPAY_MOCK = "true";
process.env.NODE_ENV = "test";
process.env.RAZORPAY_KEY_ID = "k";
process.env.RAZORPAY_KEY_SECRET = "s";
process.env.RAZORPAY_WEBHOOK_SECRET = "hook";

const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const crypto = require("crypto");
const User = require("../models/user");
const MentorProfile = require("../models/MentorProfile");
const OrbitSession = require("../models/OrbitSession");
const PhotonLedger = require("../models/PhotonLedger");
const C = require("../controllers/sessionsController");
const sessionService = require("../services/sessionService");

const ORIGINAL = { ...process.env };
let mongo;
beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri());
});
afterAll(async () => {
    await mongoose.disconnect();
    await mongo.stop();
    process.env = ORIGINAL;
});
afterEach(async () => {
    for (const key in mongoose.connection.collections) await mongoose.connection.collections[key].deleteMany();
    jest.clearAllMocks();
});

function mockRes() {
    return {
        statusCode: 200,
        body: null,
        status(c) { this.statusCode = c; return this; },
        json(b) { this.body = b; return this; },
    };
}
const req = (userId, body = {}, params = {}, app = { get: () => null }) => ({
    user: { id: String(userId) },
    body, params, app,
});

async function seedMentor({ rate = 1000, availability = { weekly: [] } } = {}) {
    const u = await User.create({
        name: "Mentor", email: `m${Date.now()}_${Math.random()}@test.io`, password: "hashhashhash",
    });
    const p = await MentorProfile.create({
        userId: u._id, applicationStatus: "approved", status: "active",
        headline: "Top mentor", bio: "10y", skills: [], hourlyRateInr: rate,
        payoutMultiplier: 0.85, timezone: "Asia/Kolkata", availability,
    });
    return { user: u, profile: p };
}

async function waitForPayoutLedger(mentorId, n = 1) {
    for (let i = 0; i < 50; i++) {
        const rows = await PhotonLedger.find({ userId: mentorId, source: "session_payout_pending" }).lean();
        if (rows.length >= n) return rows;
        await new Promise((r) => setTimeout(r, 10));
    }
    return PhotonLedger.find({ userId: mentorId, source: "session_payout_pending" }).lean();
}

describe("OrbitSession — headline vertical: book → pay → verify → start → complete", () => {
    test("mentorPayoutInr === floor(rateInr × 0.85) and a session_payout_pending ledger row is queued", async () => {
        const student = await User.create({ name: "S", email: `s${Date.now()}@test.io`, password: "hashhashhash" });
        const { user: mentor, profile } = await seedMentor({ rate: 1000 });

        // 1. book
        const scheduledAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
        const bookRes = mockRes();
        await C.book(req(student._id, { mentorUserId: String(mentor._id), scheduledAt, durationMin: 60 }), bookRes);
        expect(bookRes.statusCode).toBe(201);
        const sessionId = bookRes.body.id;
        expect(bookRes.body.totalInr).toBe(1000);
        expect(bookRes.body.platformCutPct).toBe(15);
        expect(bookRes.body.platformCutInr).toBe(150);
        expect(bookRes.body.mentorPayoutInr).toBe(850);

        const orderId = bookRes.body.order.orderId;

        // 2. verify payment
        const vRes = mockRes();
        await C.verifyPayment(req(student._id, { orderId, paymentId: "pay_mock_1", signature: "mock_valid" }, { id: sessionId }), vRes);
        expect(vRes.statusCode).toBe(200);
        expect(vRes.body.status).toBe("booked");

        // 3. start
        const sRes = mockRes();
        await C.start(req(student._id, {}, { id: sessionId }), sRes);
        expect(sRes.statusCode).toBe(200);
        expect(sRes.body.status).toBe("live");

        // 4. complete
        const cRes = mockRes();
        await C.complete(req(student._id, {}, { id: sessionId }), cRes);
        expect(cRes.statusCode).toBe(200);
        expect(cRes.body.status).toBe("completed");
        expect(cRes.body.mentorPayoutInr).toBe(850);  // IMMUTABLE

        const row = await OrbitSession.findById(sessionId).lean();
        expect(row.payment.status).toBe("released");
        expect(row.mentorPayoutInr).toBe(850);

        // Payout ledger row queued for the mentor.
        const ledger = await waitForPayoutLedger(mentor._id, 1);
        expect(ledger.length).toBe(1);
        expect(ledger[0].delta).toBe(850);
        expect(String(ledger[0].userId)).toBe(String(mentor._id));
    });
});

describe("OrbitSession — FSM guards", () => {
    test("rejects double completion (cannot re-complete a completed session)", async () => {
        const student = await User.create({ name: "S", email: `s2${Date.now()}@test.io`, password: "hashhashhash" });
        const { user: mentor } = await seedMentor();
        const s = await OrbitSession.create({
            mentorProfileId: new mongoose.Types.ObjectId(),
            studentId: student._id, mentorId: mentor._id,
            status: "completed", rateInr: 1000, durationMin: 60, totalInr: 1000,
            platformCutPct: 15, platformCutInr: 150, mentorPayoutInr: 850,
            scheduledAt: new Date(), roomId: "Session-test",
            payment: { provider: "razorpay", orderId: "order_dup", status: "released" },
        });
        const r1 = mockRes();
        await C.complete(req(student._id, {}, { id: String(s._id) }), r1);
        // It accepts "live", "booked", "confirmed" → a second call on
        // "completed" is correctly rejected.
        expect(r1.statusCode).toBe(409);
    });

    test("rejects start from a non-participant", async () => {
        const me = await User.create({ name: "S", email: `s3${Date.now()}@test.io`, password: "hashhashhash" });
        const mentor = await User.create({ name: "M", email: `m3${Date.now()}@test.io`, password: "hashhashhash" });
        const s = await OrbitSession.create({
            mentorProfileId: new mongoose.Types.ObjectId(),
            studentId: me._id, mentorId: mentor._id,
            status: "booked", rateInr: 1000, durationMin: 60, totalInr: 1000,
            platformCutPct: 15, platformCutInr: 150, mentorPayoutInr: 850,
            scheduledAt: new Date(), roomId: "Session-x",
            payment: { provider: "razorpay", orderId: "order_np", status: "held" },
        });
        const stranger = await User.create({ name: "X", email: `x${Date.now()}@test.io`, password: "hashhashhash" });
        const r = mockRes();
        await C.start(req(stranger._id, {}, { id: String(s._id) }), r);
        expect(r.statusCode).toBe(403);
    });
});

describe("OrbitSession — conflict detection", () => {
    test("returns 409 when a second session overlaps the same slot", async () => {
        const s1 = await User.create({ name: "S1", email: `s1${Date.now()}@test.io`, password: "hashhashhash" });
        const s2 = await User.create({ name: "S2", email: `s2${Date.now()}@test.io`, password: "hashhashhash" });
        const { user: mentor } = await seedMentor();
        const at = new Date(Date.now() + 60 * 60 * 1000);
        await OrbitSession.create({
            mentorProfileId: new mongoose.Types.ObjectId(),
            studentId: s1._id, mentorId: mentor._id,
            status: "booked", rateInr: 1000, durationMin: 60, totalInr: 1000,
            platformCutPct: 15, platformCutInr: 150, mentorPayoutInr: 850,
            scheduledAt: at, roomId: "Session-1",
            payment: { provider: "razorpay", orderId: "order_c1", status: "held" },
        });
        const r = mockRes();
        // Same time, different student → conflict
        await C.book(req(s2._id, {
            mentorUserId: String(mentor._id),
            scheduledAt: at.toISOString(),
            durationMin: 60,
        }), r);
        expect(r.statusCode).toBe(409);
    });
});

describe("OrbitSession — webhook idempotency", () => {
    test("replaying payment.captured on an already-held session is a no-op", async () => {
        const student = await User.create({ name: "S", email: `s4${Date.now()}@test.io`, password: "hashhashhash" });
        const { user: mentor } = await seedMentor();
        const s = await OrbitSession.create({
            mentorProfileId: new mongoose.Types.ObjectId(),
            studentId: student._id, mentorId: mentor._id,
            status: "booked", rateInr: 1000, durationMin: 60, totalInr: 1000,
            platformCutPct: 15, platformCutInr: 150, mentorPayoutInr: 850,
            scheduledAt: new Date(), roomId: "Session-w",
            payment: { provider: "razorpay", orderId: "order_w1", paymentId: "pay_w1", status: "held" },
        });
        // Simulate the webhook idempotency: query should match nothing because
        // status is already "held" (filter requires "created" or "held" — but
        // we re-set to held if not present; the second call would still be ok
        // because the filter is `$in: ["created","held"]` and status="held" matches.
        // The real idempotency assertion is that the doc isn't corrupted.
        const before = await OrbitSession.findById(s._id).lean();
        const beforeStatus = before.payment.status;
        expect(beforeStatus).toBe("held");
        // No throw, no state change.
        const r = mockRes();
        const body = JSON.stringify({
            event: "payment.captured",
            payload: { payment: { entity: { id: "pay_w1", order_id: "order_w1" } } },
        });
        const sig = crypto.createHmac("sha256", "hook").update(body).digest("hex");
        await C.webhook({
            get: () => sig,
            body: Buffer.from(body),
        }, r);
        expect(r.statusCode).toBe(200);
        const after = await OrbitSession.findById(s._id).lean();
        expect(after.payment.status).toBe("held");
    });
});

describe("OrbitSession — hasConflict (re-exported from sessionService)", () => {
    test("scheduling a session 30 min after an existing one is allowed", () => {
        const at = new Date("2030-01-01T10:00:00Z");
        const conflicting = sessionService.hasConflict({
            scheduledAt: new Date("2030-01-01T10:30:00Z"),
            durationMin: 30,
            existing: [{ scheduledAt: at, durationMin: 30, status: "booked" }],
        });
        expect(conflicting).toBe(false);
    });
});

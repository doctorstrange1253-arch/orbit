/**
 * photonGift — validateGift pure-engine tests (limits, balance, daily cap) +
 * DB-backed integration tests for the giftPhotons controller (transfer, ledger
 * rows on both sides, connection gate, daily cap across calls).
 */
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const User = require("../models/user");
const Connection = require("../models/Connection");
const PhotonLedger = require("../models/PhotonLedger");
const { giftPhotons } = require("../controllers/orbitController");
const { validateGift, GIFT_MIN, GIFT_MAX, GIFT_DAILY_CAP } = require("../services/orbitEngine");

describe("validateGift — the gifting gate", () => {
    test("accepts a normal gift within limits", () => {
        expect(validateGift({ balance: 1000, sentToday: 0, amount: 100 })).toEqual({ ok: true });
    });

    test("rejects non-integer, too-small and too-large amounts", () => {
        expect(validateGift({ balance: 1000, sentToday: 0, amount: 10.5 }).reason).toBe("bad_amount");
        expect(validateGift({ balance: 1000, sentToday: 0, amount: GIFT_MIN - 1 }).reason).toBe("bad_amount");
        expect(validateGift({ balance: 9999, sentToday: 0, amount: GIFT_MAX + 1 }).reason).toBe("bad_amount");
        expect(validateGift({ balance: 1000, sentToday: 0, amount: NaN }).reason).toBe("bad_amount");
    });

    test("rejects a gift the sender can't cover", () => {
        expect(validateGift({ balance: 99, sentToday: 0, amount: 100 }).reason).toBe("insufficient");
    });

    test("enforces the daily cap across multiple gifts", () => {
        expect(validateGift({ balance: 9999, sentToday: GIFT_DAILY_CAP - 50, amount: 50 }).ok).toBe(true);
        expect(validateGift({ balance: 9999, sentToday: GIFT_DAILY_CAP - 49, amount: 50 }).reason).toBe("daily_cap");
        expect(validateGift({ balance: 9999, sentToday: GIFT_DAILY_CAP, amount: GIFT_MIN }).reason).toBe("daily_cap");
    });

    test("boundary gifts are allowed (min, max, exactly-remaining cap)", () => {
        expect(validateGift({ balance: GIFT_MIN, sentToday: 0, amount: GIFT_MIN }).ok).toBe(true);
        expect(validateGift({ balance: GIFT_MAX, sentToday: 0, amount: GIFT_MAX }).ok).toBe(true);
        expect(validateGift({ balance: 9999, sentToday: GIFT_DAILY_CAP - GIFT_MIN, amount: GIFT_MIN }).ok).toBe(true);
    });

    test("missing tallies default safely", () => {
        expect(validateGift({ balance: 100, sentToday: undefined, amount: 50 }).ok).toBe(true);
        expect(validateGift({ balance: undefined, sentToday: 0, amount: 50 }).reason).toBe("insufficient");
    });
});

// ── Controller integration (in-memory Mongo, same pattern as adminEconomy) ──

function mockRes() {
    return {
        statusCode: 200,
        body: null,
        status(c) { this.statusCode = c; return this; },
        json(b) { this.body = b; return this; },
    };
}
const giftReq = (userId, body) => ({
    body,
    user: { id: String(userId) },
    app: { get: () => null }, // no socket.io in tests
});

async function waitForLedger(userId, n = 1, tries = 40) {
    for (let i = 0; i < tries; i++) {
        const rows = await PhotonLedger.find({ userId }).lean();
        if (rows.length >= n) return rows;
        await new Promise((r) => setTimeout(r, 15));
    }
    return PhotonLedger.find({ userId }).lean();
}

let mongoServer;
beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
});
afterAll(async () => { await mongoose.disconnect(); await mongoServer.stop(); });
afterEach(async () => {
    for (const key in mongoose.connection.collections) await mongoose.connection.collections[key].deleteMany();
});

async function seedPair({ balance = 1000, connected = true } = {}) {
    const sender = await User.create({
        name: "Sender", email: "s@test.io", password: "hashhashhash",
        orbit: { stardust: balance },
    });
    const receiver = await User.create({
        name: "Receiver", email: "r@test.io", password: "hashhashhash",
        orbit: { stardust: 0 },
    });
    if (connected) {
        await Connection.create({
            requester: sender._id, receiver: receiver._id,
            skill: new mongoose.Types.ObjectId(), status: "accepted",
        });
    }
    return { sender, receiver };
}

describe("giftPhotons controller — transfer, gates, ledger", () => {
    test("moves Photons between connected users and writes both ledger rows", async () => {
        const { sender, receiver } = await seedPair();
        const res = mockRes();
        await giftPhotons(giftReq(sender._id, { toUserId: String(receiver._id), amount: 100 }), res);

        expect(res.statusCode).toBe(200);
        expect(res.body.sent).toBe(100);
        expect(res.body.photons).toBe(900); // sender's fresh balance in payload

        const s = await User.findById(sender._id).lean();
        const r = await User.findById(receiver._id).lean();
        expect(s.orbit.stardust).toBe(900);
        expect(r.orbit.stardust).toBe(100);
        expect(s.orbit.gifting.sent).toBe(100);

        const sRows = await waitForLedger(sender._id);
        const rRows = await waitForLedger(receiver._id);
        expect(sRows.some((x) => x.delta === -100 && x.source === "gift_sent")).toBe(true);
        expect(rRows.some((x) => x.delta === 100 && x.source === "gift_received")).toBe(true);
    });

    test("refuses strangers (no accepted connection)", async () => {
        const { sender, receiver } = await seedPair({ connected: false });
        const res = mockRes();
        await giftPhotons(giftReq(sender._id, { toUserId: String(receiver._id), amount: 100 }), res);
        expect(res.statusCode).toBe(403);
        expect(res.body.reason).toBe("not_connected");
    });

    test("refuses self-gifting and bad recipients", async () => {
        const { sender } = await seedPair();
        const res1 = mockRes();
        await giftPhotons(giftReq(sender._id, { toUserId: String(sender._id), amount: 100 }), res1);
        expect(res1.body.reason).toBe("self");

        const res2 = mockRes();
        await giftPhotons(giftReq(sender._id, { toUserId: "not-an-id", amount: 100 }), res2);
        expect(res2.statusCode).toBe(400);
    });

    test("enforces the daily cap across sequential gifts", async () => {
        const { sender, receiver } = await seedPair({ balance: 5000 });
        const to = String(receiver._id);

        const r1 = mockRes();
        await giftPhotons(giftReq(sender._id, { toUserId: to, amount: 400 }), r1);
        expect(r1.statusCode).toBe(200);

        const r2 = mockRes();
        await giftPhotons(giftReq(sender._id, { toUserId: to, amount: 200 }), r2);
        expect(r2.statusCode).toBe(400);
        expect(r2.body.reason).toBe("daily_cap");

        const r3 = mockRes(); // exactly the remaining allowance still goes through
        await giftPhotons(giftReq(sender._id, { toUserId: to, amount: 100 }), r3);
        expect(r3.statusCode).toBe(200);

        const s = await User.findById(sender._id).lean();
        expect(s.orbit.gifting.sent).toBe(500);
        expect(s.orbit.stardust).toBe(4500);
    });

    test("refuses a gift the balance can't cover", async () => {
        const { sender, receiver } = await seedPair({ balance: 20 });
        const res = mockRes();
        await giftPhotons(giftReq(sender._id, { toUserId: String(receiver._id), amount: 100 }), res);
        expect(res.statusCode).toBe(400);
        expect(res.body.reason).toBe("insufficient");
    });
});

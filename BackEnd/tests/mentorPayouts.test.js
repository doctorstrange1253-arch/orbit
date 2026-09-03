const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

const payouts = require("../services/mentorPayouts");
const photonLedger = require("../services/photonLedger");
const PhotonLedger = require("../models/PhotonLedger");
const MoneyLedger = require("../models/MoneyLedger");
const { migratePhotonPayoutsToMoney } = require("../scripts/migratePhotonPayoutsToMoney");

const MENTOR = "651111111111111111111111";

describe("mentorPayouts.payoutRows — pure, balanced, in paise", () => {
    it("queues escrow into the mentor's pending account and sums to zero", () => {
        const { rows, txnId, keyed } = payouts.payoutRows({ mentorId: MENTOR, amountMinor: 85000, sessionId: "s1" });
        expect(txnId).toBe("sesspay:queue:s1");
        expect(keyed).toBe(true);
        expect(rows).toHaveLength(2);
        expect(rows[0].account).toBe("platform:escrow");
        expect(rows[0].amountMinor).toBe(-85000);
        expect(rows[1].account).toBe(`mentor:${MENTOR}:payout_pending`);
        expect(rows[1].amountMinor).toBe(85000);
        expect(rows.reduce((n, r) => n + r.amountMinor, 0)).toBe(0);
        expect(rows.every((r) => r.kind === "payout" && r.refType === "session")).toBe(true);
    });

    it("release stage credits payable, settle stage drains pending into paid", () => {
        const release = payouts.payoutRows({ mentorId: MENTOR, amountMinor: 500, sessionId: "s2", stage: "release" });
        expect(release.rows[1].account).toBe(`mentor:${MENTOR}:payable`);

        const settle = payouts.payoutRows({ mentorId: MENTOR, amountMinor: 500, sessionId: "s2", stage: "settle" });
        expect(settle.rows[0].account).toBe(`mentor:${MENTOR}:payout_pending`);
        expect(settle.rows[1].account).toBe(`mentor:${MENTOR}:paid`);
        expect(settle.rows.reduce((n, r) => n + r.amountMinor, 0)).toBe(0);
    });

    it("gives every stage of one session a distinct idempotency key", () => {
        const q = payouts.payoutRows({ mentorId: MENTOR, amountMinor: 100, sessionId: "s3" });
        const s = payouts.payoutRows({ mentorId: MENTOR, amountMinor: 100, sessionId: "s3", stage: "settle" });
        const keys = new Set([...q.rows, ...s.rows].map((r) => r.idempotencyKey));
        expect(keys.size).toBe(4);
    });

    it("falls back to an unkeyed txn when no session is given, and says so", () => {
        const a = payouts.payoutRows({ mentorId: MENTOR, amountMinor: 100 });
        const b = payouts.payoutRows({ mentorId: MENTOR, amountMinor: 100 });
        expect(a.keyed).toBe(false);
        expect(a.txnId).not.toBe(b.txnId);
    });

    it("refuses fractional, zero, negative and non-integer amounts", () => {
        for (const bad of [0, -1, 1.5, NaN, null, undefined]) {
            expect(() => payouts.payoutRows({ mentorId: MENTOR, amountMinor: bad, sessionId: "s" })).toThrow();
        }
        expect(() => payouts.payoutRows({ mentorId: null, amountMinor: 100 })).toThrow();
        expect(() => payouts.payoutRows({ mentorId: MENTOR, amountMinor: 100, stage: "nope" })).toThrow();
    });

    it("converts rupees to paise without float drift", () => {
        expect(payouts.toMinor(850)).toBe(85000);
        expect(payouts.toMinor(0.07)).toBe(7);
        expect(payouts.toMinor(1234.56)).toBe(123456);
        expect(payouts.toRupees(85000)).toBe(850);
    });
});

describe("mentorPayouts.shapeEarnings — pure", () => {
    it("counts owed plus queued as pending, and paid as released", () => {
        const e = payouts.shapeEarnings({
            [`mentor:${MENTOR}:payable`]: 20000,
            [`mentor:${MENTOR}:payout_pending`]: 65000,
            [`mentor:${MENTOR}:paid`]: 15000,
        }, MENTOR);
        expect(e.pendingInr).toBe(850);
        expect(e.releasedInr).toBe(150);
        expect(e.totalInr).toBe(1000);
        expect(e.totalMinor).toBe(100000);
        expect(e.currency).toBe("INR");
    });

    it("reports zeroes for a mentor with no ledger history", () => {
        const e = payouts.shapeEarnings({}, MENTOR);
        expect(e).toMatchObject({ totalInr: 0, pendingInr: 0, releasedInr: 0, totalMinor: 0 });
    });

    it("ignores another mentor's accounts", () => {
        const e = payouts.shapeEarnings({ "mentor:652222222222222222222222:paid": 99900 }, MENTOR);
        expect(e.totalInr).toBe(0);
    });
});

describe("PhotonLedger — the unit guard", () => {
    it("names money sources for what they are", () => {
        for (const s of ["session_payout_pending", "session_payout_released", "settlement", "subscription_charge", "refund_inr"]) {
            expect(PhotonLedger.isMoneySource(s)).toBe(true);
        }
    });

    it("leaves every real Photon source alone", () => {
        for (const s of ["milestone", "mission", "mission_reroll", "mastery", "freeze", "cosmetic", "gift_sent", "gift_received", "streak", "binary_star", "admin_grant", "admin_deduct"]) {
            expect(PhotonLedger.isMoneySource(s)).toBe(false);
        }
    });

    it("refuses a money write through the service and reports it", () => {
        const errSpy = jest.spyOn(console, "error").mockImplementation(() => {});
        const createSpy = jest.spyOn(PhotonLedger, "create").mockResolvedValue({});

        expect(photonLedger.record(MENTOR, 850, "session_payout_pending")).toBe(false);
        expect(createSpy).not.toHaveBeenCalled();
        expect(errSpy).toHaveBeenCalled();

        expect(photonLedger.record(MENTOR, 50, "milestone")).toBe(true);
        expect(createSpy).toHaveBeenCalledWith({ userId: MENTOR, delta: 50, source: "milestone" });

        createSpy.mockRestore();
        errSpy.mockRestore();
    });
});

describe("photonLedger.aggregate — quarantines rupees instead of counting them", () => {
    const ev = (userId, delta, source) => ({ userId, delta, source });

    it("keeps INR payout rows out of the Photon supply", () => {
        const r = photonLedger.aggregate([
            ev("a", 100, "milestone"),
            ev("a", -80, "cosmetic"),
            ev("m", 85000, "session_payout_pending"),
        ]);
        expect(r.totalEarned).toBe(100);
        expect(r.totalSpent).toBe(80);
        expect(r.netSupply).toBe(20);
        expect(r.sources["session_payout_pending"]).toBeUndefined();
        expect(r.topEarners.find((t) => t.userId === "m")).toBeUndefined();
        expect(r.events).toBe(2);
    });

    it("reports the contamination so it can be migrated, not hidden", () => {
        const r = photonLedger.aggregate([ev("m", 850, "session_payout_pending"), ev("m", 150, "session_payout_released")]);
        expect(r.quarantined.count).toBe(2);
        expect(r.quarantined.total).toBe(1000);
        expect(r.quarantined.needsMigration).toBe(true);
        expect(r.quarantined.sources).toEqual({ session_payout_pending: 850, session_payout_released: 150 });
    });

    it("no longer trips the inflation alert on money rows alone", () => {
        const r = photonLedger.aggregate([ev("m", 500000, "session_payout_pending")]);
        expect(r.inflationAlert).toBe(false);
        expect(r.quarantined.count).toBe(1);
    });

    it("says nothing needs migrating on a clean ledger", () => {
        const r = photonLedger.aggregate([ev("a", 10, "mission"), ev("a", -10, "freeze")]);
        expect(r.quarantined.needsMigration).toBe(false);
        expect(r.quarantined.count).toBe(0);
    });
});

describe("mentorPayouts against the database", () => {
    let mongo;

    beforeAll(async () => {
        mongo = await MongoMemoryServer.create();
        await mongoose.connect(mongo.getUri());
        await MoneyLedger.init();
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongo.stop();
    });

    afterEach(async () => {
        for (const key in mongoose.connection.collections) await mongoose.connection.collections[key].deleteMany();
    });

    it("the model itself rejects a rupee write", async () => {
        await expect(PhotonLedger.create({ userId: MENTOR, delta: 850, source: "session_payout_pending" })).rejects.toThrow(/MoneyLedger/);
        expect(await PhotonLedger.countDocuments({ source: /payout/ })).toBe(0);
    });

    it("still accepts a genuine Photon write", async () => {
        await PhotonLedger.create({ userId: MENTOR, delta: 40, source: "mission" });
        expect(await PhotonLedger.countDocuments({ source: "mission" })).toBe(1);
    });

    it("queues a payout, then reads it back as pending rupees", async () => {
        await payouts.queueSessionPayout({ mentorId: MENTOR, amountInr: 850, sessionId: "db1" });
        const e = await payouts.earningsFor(MENTOR);
        expect(e.pendingInr).toBe(850);
        expect(e.releasedInr).toBe(0);
        expect(e.totalInr).toBe(850);
    });

    it("moves money from pending to released when a payout settles", async () => {
        await payouts.queueSessionPayout({ mentorId: MENTOR, amountInr: 850, sessionId: "db2" });
        await payouts.markPayoutSettled({ mentorId: MENTOR, amountInr: 850, sessionId: "db2" });
        const e = await payouts.earningsFor(MENTOR);
        expect(e.pendingInr).toBe(0);
        expect(e.releasedInr).toBe(850);
        expect(e.totalInr).toBe(850);
    });

    it("is idempotent per session and never double-pays", async () => {
        const a = await payouts.queueSessionPayout({ mentorId: MENTOR, amountInr: 850, sessionId: "db3" });
        const b = await payouts.queueSessionPayout({ mentorId: MENTOR, amountInr: 850, sessionId: "db3" });
        expect(a.duplicate).toBe(false);
        expect(b.duplicate).toBe(true);
        expect((await payouts.earningsFor(MENTOR)).pendingInr).toBe(850);
    });

    it("leaves every payout txn balanced across the whole ledger", async () => {
        await payouts.queueSessionPayout({ mentorId: MENTOR, amountInr: 850, sessionId: "db4" });
        await payouts.queueSessionPayout({ mentorId: MENTOR, amountInr: 120, sessionId: "db5" });
        await payouts.markPayoutSettled({ mentorId: MENTOR, amountInr: 120, sessionId: "db5" });
        expect(await MoneyLedger.auditUnbalanced()).toEqual([]);
    });

    it("keeps two mentors' earnings apart", async () => {
        const other = "652222222222222222222222";
        await payouts.queueSessionPayout({ mentorId: MENTOR, amountInr: 850, sessionId: "db6" });
        await payouts.queueSessionPayout({ mentorId: other, amountInr: 300, sessionId: "db7" });
        expect((await payouts.earningsFor(MENTOR)).pendingInr).toBe(850);
        expect((await payouts.earningsFor(other)).pendingInr).toBe(300);
    });

    it("migrates legacy contaminated rows into MoneyLedger and clears the Photon supply", async () => {
        await PhotonLedger.collection.insertMany([
            { userId: new mongoose.Types.ObjectId(MENTOR), delta: 850, source: "session_payout_pending", createdAt: new Date("2026-01-01") },
            { userId: new mongoose.Types.ObjectId(MENTOR), delta: 150, source: "session_payout_released", createdAt: new Date("2026-01-02") },
            { userId: new mongoose.Types.ObjectId(MENTOR), delta: 40, source: "mission", createdAt: new Date("2026-01-03") },
        ]);

        const dry = await migratePhotonPayoutsToMoney({ apply: false, verbose: false });
        expect(dry.found).toBe(2);
        expect(dry.totalInr).toBe(1000);
        expect(dry.applied).toBe(false);
        expect(await PhotonLedger.countDocuments({})).toBe(3);

        const run = await migratePhotonPayoutsToMoney({ apply: true, verbose: false });
        expect(run.moved).toBe(2);
        expect(await PhotonLedger.countDocuments({})).toBe(1);

        const e = await payouts.earningsFor(MENTOR);
        expect(e.pendingInr).toBe(850);
        expect(e.releasedInr).toBe(150);
        expect(await MoneyLedger.auditUnbalanced()).toEqual([]);

        const again = await migratePhotonPayoutsToMoney({ apply: true, verbose: false });
        expect(again.found).toBe(0);
        expect((await payouts.earningsFor(MENTOR)).totalInr).toBe(1000);
    });

    it("reports a clean Gravimeter once the migration has run", async () => {
        await PhotonLedger.create({ userId: MENTOR, delta: 40, source: "mission" });
        const report = await photonLedger.report();
        expect(report.quarantined.needsMigration).toBe(false);
        expect(report.totalEarned).toBe(40);
    });
});

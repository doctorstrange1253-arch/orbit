/**
 * paymentService.test.js — pure + mocked tests for services/payment/index.js.
 *
 * Covers the HMAC signature path (good and tampered), the mock-mode
 * short-circuit (signature: 'mock_valid'), the production safety gate
 * (refuses to start when NODE_ENV=production && RAZORPAY_MOCK=true), the
 * payout ledger row, and the webhook signature verify.
 */

// Sensible defaults BEFORE any require loads the service.
process.env.NODE_ENV = "test";
process.env.RAZORPAY_MOCK = "false";
process.env.RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || "k";
process.env.RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "s";
process.env.RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || "hook";

const crypto = require("crypto");

describe("payment — verifySignature (HMAC)", () => {
    const ORIGINAL = { ...process.env };
    beforeEach(() => {
        jest.resetModules();
        process.env.RAZORPAY_KEY_ID = "test_key";
        process.env.RAZORPAY_KEY_SECRET = "test_secret";
        process.env.RAZORPAY_WEBHOOK_SECRET = "test_hook";
        process.env.RAZORPAY_MOCK = "false";
        process.env.NODE_ENV = "test";
    });
    afterAll(() => { process.env = ORIGINAL; });

    test("accepts a correct signature", () => {
        const payment = require("../services/payment");
        const orderId = "order_1";
        const paymentId = "pay_1";
        const sig = crypto.createHmac("sha256", "test_secret")
            .update(`${orderId}|${paymentId}`).digest("hex");
        expect(() => payment.verifySignature({ orderId, paymentId, signature: sig })).not.toThrow();
    });

    test("rejects a 1-byte-flipped signature", () => {
        const payment = require("../services/payment");
        const orderId = "order_1";
        const paymentId = "pay_1";
        const good = crypto.createHmac("sha256", "test_secret")
            .update(`${orderId}|${paymentId}`).digest("hex");
        const tampered = good.slice(0, -1) + (good.slice(-1) === "a" ? "b" : "a");
        expect(() => payment.verifySignature({ orderId, paymentId, signature: tampered })).toThrow(/Invalid payment signature/);
    });

    test("throws on missing fields", () => {
        const payment = require("../services/payment");
        expect(() => payment.verifySignature({ orderId: "o", paymentId: "p" })).toThrow();
        expect(() => payment.verifySignature({ orderId: "o", signature: "s" })).toThrow();
        expect(() => payment.verifySignature({ paymentId: "p", signature: "s" })).toThrow();
    });
});

describe("payment — mock mode", () => {
    const ORIGINAL = { ...process.env };
    beforeEach(() => {
        jest.resetModules();
        delete process.env.RAZORPAY_KEY_ID;
        delete process.env.RAZORPAY_KEY_SECRET;
        process.env.RAZORPAY_MOCK = "true";
        process.env.NODE_ENV = "test";
    });
    afterAll(() => { process.env = ORIGINAL; });

    test("isMockMode() returns true when keys are absent", () => {
        const payment = require("../services/payment");
        expect(payment.isMockMode()).toBe(true);
    });

    test("createOrder returns a deterministic mock order shape", async () => {
        const payment = require("../services/payment");
        const order = await payment.createOrder({ amountInr: 1000, receipt: "rcpt_1" });
        expect(order.mock).toBe(true);
        expect(order.orderId).toMatch(/^order_mock_/);
        expect(order.amount).toBe(1000);
        expect(order.currency).toBe("INR");
    });

    test("verifySignature accepts the literal 'mock_valid' signature", () => {
        const payment = require("../services/payment");
        expect(() => payment.verifySignature({
            orderId: "o", paymentId: "p", signature: "mock_valid",
        })).not.toThrow();
    });

    test("verifySignature rejects anything else in mock mode", () => {
        const payment = require("../services/payment");
        expect(() => payment.verifySignature({
            orderId: "o", paymentId: "p", signature: "anything-else",
        })).toThrow(/Invalid mock signature/);
    });
});

describe("payment — production safety gate", () => {
    const ORIGINAL = { ...process.env };
    afterAll(() => { process.env = ORIGINAL; });

    test("throws when RAZORPAY_MOCK=true and NODE_ENV=production", () => {
        jest.resetModules();
        process.env.RAZORPAY_MOCK = "true";
        process.env.NODE_ENV = "production";
        delete process.env.RAZORPAY_KEY_ID;
        delete process.env.RAZORPAY_KEY_SECRET;
        const payment = require("../services/payment");
        expect(() => payment.isMockMode()).toThrow(/Refusing to start/);
    });
});

describe("payment — initiatePayout writes a ledger row", () => {
    const mongoose = require("mongoose");
    const { MongoMemoryServer } = require("mongodb-memory-server");
    const ORIGINAL = { ...process.env };

    let mongo;
    beforeAll(async () => {
        jest.resetModules();
        delete process.env.RAZORPAY_KEY_ID;
        delete process.env.RAZORPAY_KEY_SECRET;
        process.env.RAZORPAY_MOCK = "true";
        process.env.NODE_ENV = "test";
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
    });

    test("initiatePayout invokes PhotonLedger.create with the expected payload", async () => {
        // Spy on the model's create method so we don't depend on cross-describe
        // mongoose state (jest.resetModules in this describe means the model
        // identity is fresh; we still want to assert the call shape).
        const PhotonLedger = require("../models/PhotonLedger");
        const spy = jest.spyOn(PhotonLedger, "create").mockResolvedValue({});
        const payment = require("../services/payment");
        const mentorId = new mongoose.Types.ObjectId();
        await payment.initiatePayout({ mentorId, amountInr: 850 });
        expect(spy).toHaveBeenCalledWith({
            userId: mentorId, delta: 850, source: "session_payout_pending",
        });
        spy.mockRestore();
    });
});

describe("payment — handleWebhook (HMAC over raw body)", () => {
    const ORIGINAL = { ...process.env };
    beforeEach(() => {
        jest.resetModules();
        process.env.RAZORPAY_KEY_ID = "k";
        process.env.RAZORPAY_KEY_SECRET = "s";
        process.env.RAZORPAY_WEBHOOK_SECRET = "hook_secret";
        process.env.RAZORPAY_MOCK = "false";
        process.env.NODE_ENV = "test";
    });
    afterAll(() => { process.env = ORIGINAL; });

    test("accepts a well-signed event and dispatches by name", () => {
        const payment = require("../services/payment");
        const body = JSON.stringify({ event: "payment.captured", payload: { payment: { entity: { id: "p_1", order_id: "o_1" } } } });
        const sig = crypto.createHmac("sha256", "hook_secret").update(body).digest("hex");
        const { event, payload } = payment.handleWebhook(Buffer.from(body), sig);
        expect(event).toBe("payment.captured");
        expect(payload.payment.entity.id).toBe("p_1");
    });

    test("rejects a tampered signature", () => {
        const payment = require("../services/payment");
        const body = JSON.stringify({ event: "payment.captured", payload: {} });
        const sig = crypto.createHmac("sha256", "wrong_secret").update(body).digest("hex");
        expect(() => payment.handleWebhook(Buffer.from(body), sig)).toThrow(/Invalid webhook signature/);
    });

    test("rejects non-JSON body", () => {
        const payment = require("../services/payment");
        const body = "not json at all";
        const sig = crypto.createHmac("sha256", "hook_secret").update(body).digest("hex");
        expect(() => payment.handleWebhook(Buffer.from(body), sig)).toThrow();
    });
});

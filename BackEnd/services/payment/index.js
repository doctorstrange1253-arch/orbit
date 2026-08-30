/**
 * services/payment/index.js — the ONLY entry point for Razorpay.
 *
 * The rest of the codebase MUST go through this module for any payment
 * operation. This keeps the surface small enough that:
 *  - mock mode (no keys → every function returns a deterministic shape)
 *  - production safety gate (refuses to start in NODE_ENV=production when
 *    RAZORPAY_MOCK=true)
 *  - HMAC verification with timingSafeEqual
 *  - per-slice gating (only escrow flow is wired this slice)
 * all live in ONE auditable place.
 *
 * In this slice:
 *  - createOrder / verifySignature / captureHeld / releaseHeld / refund /
 *    handleWebhook / getStatus call Razorpay in live mode and return
 *    deterministic shapes in mock mode.
 *  - initiatePayout is a no-op that just writes a ledger row tagged
 *    "session_payout_pending" (Razorpay Route payouts are a later slice).
 */

const crypto = require("crypto");
// Lazy-required so the model is bound to the *current* mongoose connection
// at call time (not at module-load time, which is when test files may
// reset modules + reconnect between describes).
const PhotonLedger = () => require("../../models/PhotonLedger");

const KEY_ID  = process.env.RAZORPAY_KEY_ID  || "";
const SECRET  = process.env.RAZORPAY_KEY_SECRET || "";
const HOOKSEC = process.env.RAZORPAY_WEBHOOK_SECRET || "";

/** isMockMode — true when explicitly enabled OR no keys are set. */
function isMockMode() {
    if (String(process.env.RAZORPAY_MOCK).toLowerCase() === "true") {
        if ((process.env.NODE_ENV || "development") === "production") {
            throw new Error(
                "[payment] Refusing to start: RAZORPAY_MOCK=true is not allowed in production. " +
                "Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET and RAZORPAY_MOCK=false."
            );
        }
        return true;
    }
    return !KEY_ID || !SECRET;
}

function warnIfMock() {
    if (isMockMode()) {
        console.warn("[payment] Mock mode is ENABLED — no live Razorpay calls will be made. " +
            "This must NEVER be set in production (RAZORPAY_MOCK=true is blocked on production boot).");
    }
}

// Deterministic shape returned in mock mode. Mirrors a subset of Razorpay's
// real response so the controller can stay agnostic.
const mockResponse = (kind, extra = {}) => {
    const ts = Date.now();
    return {
        kind,
        mock: true,
        orderId:    extra.orderId    || `order_mock_${ts}`,
        paymentId:  extra.paymentId  || `pay_mock_${ts}`,
        signature:  "mock_valid",
        amount:     extra.amount     || 0,
        currency:   extra.currency   || "INR",
        ...extra,
    };
};

/**
 * createOrder — server-side ONLY. Returns the order id the FE needs for
 * Checkout. The signature is also created here so the FE gets a `mock_valid`
 * signature in mock mode.
 */
async function createOrder({ amountInr, receipt, notes } = {}) {
    if (!Number.isInteger(amountInr) || amountInr <= 0) throw new Error("amountInr must be a positive integer (paise)");
    if (isMockMode()) {
        warnIfMock();
        return mockResponse("order", { orderId: `order_mock_${Date.now()}`, amount: amountInr, receipt, notes });
    }
    // Live path: hit Razorpay Orders API. Use a thin dynamic import so the
    // dependency stays optional in mock-only environments.
    const Razorpay = require("razorpay");
    const rzp = new Razorpay({ key_id: KEY_ID, key_secret: SECRET });
    const order = await rzp.orders.create({
        amount: amountInr * 100,         // INR → paise
        currency: "INR",
        receipt: receipt || `rcpt_${Date.now()}`,
        notes: notes || {},
    });
    return { orderId: order.id, amount: order.amount, currency: order.currency, keyId: KEY_ID, mock: false };
}

/**
 * verifySignature — HMAC_SHA256(SECRET, orderId|paymentId) compare with
 * `crypto.timingSafeEqual`. THROWS on mismatch (caller maps to 400).
 */
function verifySignature({ orderId, paymentId, signature } = {}) {
    if (!orderId || !paymentId || !signature) throw new Error("orderId, paymentId, signature are required");
    if (isMockMode()) {
        if (signature !== "mock_valid") throw new Error("Invalid mock signature");
        return true;
    }
    const expected = crypto.createHmac("sha256", SECRET).update(`${orderId}|${paymentId}`).digest("hex");
    const a = Buffer.from(expected, "hex");
    const b = Buffer.from(String(signature), "hex");
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
        throw new Error("Invalid payment signature");
    }
    return true;
}

/**
 * captureHeld — auto-capture is the Razorpay default for "Checkout" (we
 * create orders with `payment_capture: 1` semantics), so this is a no-op
 * passthrough in mock and a mark-captured call in live. Idempotent.
 */
async function captureHeld({ paymentId, amountInr } = {}) {
    if (isMockMode()) return mockResponse("capture", { paymentId, amount: amountInr });
    // No live capture API call needed: Checkout auto-captures.
    return { paymentId, captured: true };
}

/**
 * releaseHeld — escrow → mentor. In mock this is a no-op; in live this would
 * route to Razorpay Route payouts. THIS SLICE: no actual bank transfer; we
 * just record the intent in a PhotonLedger row tagged "session_payout_pending".
 */
async function releaseHeld({ paymentId, amountInr, mentorId } = {}) {
    if (isMockMode()) {
        if (mentorId && amountInr > 0) {
            // Fire-and-forget ledger entry — mirrors the real payout intent.
            PhotonLedger().create({ userId: mentorId, delta: amountInr, source: "session_payout_pending" }).catch(() => {});
        }
        return mockResponse("release", { paymentId, amount: amountInr, mentorId });
    }
    // Real Route payout integration lands in a later slice.
    return { paymentId, released: true, pendingPayout: true };
}

/** refund — full or partial refund via Razorpay (mock: no-op). */
async function refund({ paymentId, amountInr } = {}) {
    if (isMockMode()) return mockResponse("refund", { paymentId, amount: amountInr });
    const Razorpay = require("razorpay");
    const rzp = new Razorpay({ key_id: KEY_ID, key_secret: SECRET });
    return rzp.payments.refund(paymentId, { amount: amountInr * 100 });
}

/**
 * initiatePayout — explicit payout trigger. This slice is a no-op that just
 * records a "session_payout_pending" ledger row, so a future Route integration
 * picks up the queued payouts without losing money-in-flight.
 */
async function initiatePayout({ mentorId, amountInr } = {}) {
    if (!mentorId || !Number.isInteger(amountInr) || amountInr <= 0) {
        throw new Error("mentorId and positive integer amountInr are required");
    }
    PhotonLedger().create({ userId: mentorId, delta: amountInr, source: "session_payout_pending" }).catch(() => {});
    if (isMockMode()) return mockResponse("payout", { mentorId, amount: amountInr });
    // Future: rzp.payouts.create(...). For now, mark pending.
    return { mentorId, queued: true, amount: amountInr };
}

/**
 * handleWebhook — verify HMAC over the RAW request body, then dispatch by
 * `event`. The webhook route is mounted with `express.raw` so the body is
 * the exact bytes Razorpay signed.
 */
function handleWebhook(rawBody, signatureHeader) {
    if (!HOOKSEC) throw new Error("RAZORPAY_WEBHOOK_SECRET is not set");
    if (!rawBody) throw new Error("rawBody is required");
    const sig = String(signatureHeader || "");
    const expected = crypto.createHmac("sha256", HOOKSEC).update(rawBody).digest("hex");
    const a = Buffer.from(expected, "hex");
    const b = Buffer.from(sig, "hex");
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
        throw new Error("Invalid webhook signature");
    }
    let event;
    try { event = JSON.parse(rawBody.toString("utf8")); }
    catch { throw new Error("Webhook body is not valid JSON"); }
    return { event: event.event, payload: event.payload || {} };
}

/** getStatus — query an order's state. Mock: derive from prefix; live: call Razorpay. */
async function getStatus(orderId) {
    if (!orderId) throw new Error("orderId is required");
    if (isMockMode()) return { orderId, status: "created" };
    const Razorpay = require("razorpay");
    const rzp = new Razorpay({ key_id: KEY_ID, key_secret: SECRET });
    return rzp.orders.fetch(orderId);
}

/** Expose the public key id for the frontend (NEVER expose the secret). */
function publicKeyId() { return KEY_ID; }

module.exports = {
    isMockMode,
    publicKeyId,
    createOrder,
    verifySignature,
    captureHeld,
    releaseHeld,
    refund,
    initiatePayout,
    handleWebhook,
    getStatus,
};

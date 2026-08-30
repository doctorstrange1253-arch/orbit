/**
 * services/payment/index.js — frontend wrapper for the Razorpay Checkout.js
 * loader (web only this slice). Mobile Razorpay (native Capacitor plugin) is
 * deferred to a later slice; the APK runs the SAME web Checkout.js inside the
 * WebView, so this code path is reused end-to-end.
 *
 * Two entry points:
 *  - isMock()        — VITE_RAZORPAY_MOCK=true short-circuits everything.
 *  - openCheckout()  — lazy-injects https://checkout.razorpay.com/v1/checkout.js
 *                     once into <head>, then calls `new window.Razorpay(opts).open()`.
 *
 * The mock path resolves after a short delay with the literal "mock_valid"
 * signature the backend accepts in mock mode.
 */
import { useAuthStore } from "../../store/authStore";
import api from "../api";

// ── Mock gate ──────────────────────────────────────────────────────────────
function isMock() {
    if (String(import.meta.env.VITE_RAZORPAY_MOCK).toLowerCase() === "true") return true;
    // Also fall back to a global override (e.g. admin-toggled from a dev console).
    try { if (window.__ORBIT_PAYMENT_MOCK__ === true) return true; } catch {}
    return false;
}

// ── Script loader (cached) ────────────────────────────────────────────────
let scriptPromise = null;
function loadRazorpayScript() {
    if (typeof window !== "undefined" && window.Razorpay) return Promise.resolve(window.Razorpay);
    if (scriptPromise) return scriptPromise;
    scriptPromise = new Promise((resolve, reject) => {
        const s = document.createElement("script");
        s.src = "https://checkout.razorpay.com/v1/checkout.js";
        s.async = true;
        s.onload = () => resolve(window.Razorpay);
        s.onerror = () => {
            scriptPromise = null; // allow retry on next call
            reject(new Error("Failed to load Razorpay Checkout"));
        };
        document.head.appendChild(s);
    });
    return scriptPromise;
}

/**
 * openCheckout({ orderId, keyId, amountInr, onSuccess, onDismiss }) — opens
 * the Razorpay modal. The Checkout handler hands back the canonical response
 * object { razorpay_payment_id, razorpay_order_id, razorpay_signature } which
 * the caller passes straight to POST /api/sessions/:id/payment-verify.
 */
export async function openCheckout({ orderId, keyId, amountInr, onSuccess, onDismiss }) {
    if (!orderId) throw new Error("orderId is required");
    if (!amountInr || amountInr <= 0) throw new Error("amountInr must be a positive integer");

    // ── MOCK path ────────────────────────────────────────────────────────
    if (isMock()) {
        console.info("[payment] Mock mode — skipping Razorpay script, returning a fake response in 800ms");
        return new Promise((resolve) => {
            setTimeout(() => {
                const fake = {
                    razorpay_payment_id: `pay_mock_${Date.now()}`,
                    razorpay_order_id:   orderId,
                    razorpay_signature:  "mock_valid",
                };
                onSuccess?.(fake);
                resolve(fake);
            }, 800);
        });
    }

    // ── Live path ────────────────────────────────────────────────────────
    if (!keyId) throw new Error("VITE_RAZORPAY_KEY_ID is required in live mode");
    const Razorpay = await loadRazorpayScript();
    return new Promise((resolve, reject) => {
        try {
            const rzp = new Razorpay({
                key: keyId,
                order_id: orderId,
                amount: Math.round(amountInr) * 100,   // INR → paise
                currency: "INR",
                name: "Orbit",
                description: "Orbit Session",
                // Pass the auth token so the (optional) modal checkout-notes
                // call can attribute the user. Server-side auth is via the
                // verify call, not via the modal.
                prefill: (() => {
                    try {
                        const u = useAuthStore.getState().user;
                        if (u) {
                            return {
                                name: u.name || "",
                                email: u.email || "",
                                contact: u.phone || "",
                            };
                        }
                    } catch {}
                    return {};
                })(),
                theme: { color: "#7c3aed" },
                handler: (resp) => {
                    onSuccess?.(resp);
                    resolve(resp);
                },
                modal: {
                    ondismiss: () => {
                        onDismiss?.();
                        // Resolve (not reject) — the user can retry without
                        // a thrown error reaching the caller's catch.
                        resolve(null);
                    },
                },
            });
            rzp.on("payment.failed", (resp) => {
                const err = new Error(resp?.error?.description || "Payment failed");
                err.code = resp?.error?.code;
                reject(err);
            });
            rzp.open();
        } catch (err) {
            reject(err);
        }
    });
}

/**
 * verifySessionPayment — POST to /api/sessions/:id/payment-verify.
 * Returns the parsed JSON; throws on non-2xx.
 */
export async function verifySessionPayment(sessionId, { orderId, paymentId, signature }) {
    const res = await api.post(`/sessions/${sessionId}/payment-verify`, { orderId, paymentId, signature });
    return res.data;
}

export const paymentService = { openCheckout, verifySessionPayment, isMock };
export default paymentService;

const mongoose = require("mongoose");

/**
 * WebhookEvent — Idempotency ledger for incoming payment webhooks (e.g., Razorpay).
 * Prevents double-crediting or duplicate state transitions if the gateway retries.
 */
const webhookEventSchema = new mongoose.Schema({
    eventId: { type: String, required: true, unique: true, index: true },
    provider: { type: String, default: "razorpay" },
    event: { type: String, required: true },
    processedAt: { type: Date, default: Date.now },
    payloadSummary: { type: mongoose.Schema.Types.Mixed, default: null }
}, { timestamps: true });

// Auto-expire webhook logs after 90 days
webhookEventSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

module.exports = mongoose.models.WebhookEvent || mongoose.model("WebhookEvent", webhookEventSchema);

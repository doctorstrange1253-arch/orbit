/**
 * Certificate.js — issued on Course 100% completion.
 *
 * One per (user, course). `certId` is an HMAC-signed slug like `ORBIT-XXXX`
 * (24 hex chars uppercased, prefixed) — the verify endpoint can recompute the
 * slug from the same user+course+secret triple without a DB hit. (Note: we
 * also include the timestamp in the input; the unique row in the DB is the
 * authoritative check, the HMAC is a fast-path filter.)
 *
 * `snapshot` freezes the rendered-cert data at issue time so the cert stays
 * valid even if the course is later renamed or the mentor profile changes.
 */
const mongoose = require("mongoose");
const crypto = require("crypto");

const CertificateSchema = new mongoose.Schema({
    userId:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    courseId:  { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    certId:    { type: String, required: true, unique: true, index: true },
    issuedAt:  { type: Date, default: Date.now },
    revokedAt: { type: Date, default: null },
    snapshot: {
        courseTitle: { type: String, default: "" },
        mentorName:  { type: String, default: "" },
        learnerName: { type: String, default: "" },
    },
}, { timestamps: true });

CertificateSchema.index({ userId: 1, courseId: 1 }, { unique: true });

/**
 * Deterministic-ish certId: HMAC the (userId, courseId, issuedAt) triple with
 * the project secret. Not strictly deterministic (timestamp varies), but the
 * 24-char prefix collision space (16^24) is wide enough that re-rolls are
 * vanishingly rare. Falls back to JWT_SECRET if GAMEOLOGY_CERT_SECRET unset.
 */
CertificateSchema.statics.sign = function (userId, courseId, issuedAt = new Date()) {
    const secret = process.env.GAMEOLOGY_CERT_SECRET || process.env.JWT_SECRET || "dev_cert_secret";
    const h = crypto
        .createHmac("sha256", secret)
        .update(`${userId}:${courseId}:${issuedAt.toISOString()}`)
        .digest("hex")
        .slice(0, 24);
    return `ORBIT-${h.toUpperCase()}`;
};

module.exports = mongoose.models.Certificate || mongoose.model("Certificate", CertificateSchema);

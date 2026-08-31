/**
 * streamSignService.js — V3 copyright protection layer 3: signed URLs.
 *
 * For paid courses, we don't serve the raw Cloudinary URL to the
 * browser. Instead, the player hits `POST /api/courses/:id/lessons/:lessonId/sign`
 * which returns a short-lived signed URL (TTL 5 minutes by default) +
 * a per-session `viewKey` (rotated every 24 hours). The viewKey is
 * used by the forensic watermark (layer 1) and the player to keep
 * the session identity.
 *
 * In V3 the actual signing is a stub: we return a synthetic signed URL
 * with a fake signature. A real implementation would use Cloudinary's
 * `authenticated` delivery type with a backend-generated signature.
 *
 * Public API:
 *   sign({ userId, lessonId, videoUrl, videoPublicId, ttlSec })
 *     → { url, viewKey, expiresAt }
 */

const crypto = require("crypto");

const DEFAULT_TTL_SEC = 300;  // 5 minutes

// Stub: replace with Cloudinary's signed-url helper in production.
function _makeSignature(publicId, userId, expiresAt) {
    const h = crypto.createHmac("sha256", process.env.STREAM_SIGN_SECRET || process.env.JWT_SECRET || "orbit-dev")
        .update(`${publicId}:${userId}:${expiresAt}`)
        .digest("hex")
        .slice(0, 24);
    return h;
}

// Issue a signed URL + viewKey. The viewKey is HMAC-derived from the
// session triplet (userId, lessonId, publicId) + a salt that rotates
// every 24h, so leaking the viewKey to a recorder is only useful for
// the current 24h window.
function sign({ userId, lessonId, videoUrl, videoPublicId, ttlSec = DEFAULT_TTL_SEC }) {
    const now = Date.now();
    const expiresAt = now + ttlSec * 1000;
    const sig = _makeSignature(videoPublicId || lessonId, userId, expiresAt);
    // Real Cloudinary: append ?expires=...&signature=... — for the stub
    // we append query params the player reads + ignores.
    const url = new URL(videoUrl);
    url.searchParams.set("expires", String(expiresAt));
    url.searchParams.set("signature", sig);
    url.searchParams.set("user", String(userId));

    // viewKey: HMAC(secret, sessionSalt + userId + lessonId). Salt
    // rotates every 24h via the `day` parameter.
    const day = Math.floor(now / 86400000);
    const viewKey = crypto.createHmac("sha256", process.env.STREAM_SIGN_SECRET || "orbit-dev")
        .update(`${day}:${userId}:${lessonId}`)
        .digest("hex")
        .slice(0, 32);

    return { url: url.toString(), viewKey, expiresAt };
}

module.exports = { sign, DEFAULT_TTL_SEC };

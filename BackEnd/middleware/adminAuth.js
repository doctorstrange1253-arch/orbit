/**
 * adminAuth.js — server-side RBAC for every admin API request.
 *
 * Security posture: ANY failure returns a plain 404 (never 401/403) so the admin
 * surface is indistinguishable from a non-existent route. The admin session is a
 * short-lived JWT, fully separate from the user JWT, accepted from EITHER:
 *   (a) the HttpOnly/Secure cookie `ssctl_sid` — first-party / cookie-friendly
 *       browsers. State-changing requests on this path additionally require the
 *       double-submit CSRF token (cookie `ssctl_csrf` === header `x-ssctl-csrf`).
 *   (b) an `Authorization: Bearer <token>` header — the SPLIT-DEPLOY fallback.
 *       Vercel (frontend) → Render (backend) is a third-party cookie context,
 *       which Safari blocks entirely and Chrome increasingly blocks; when the
 *       browser drops the cookies, header auth keeps the portal working. A
 *       bearer header is never attached automatically by the browser, so this
 *       path is CSRF-immune by construction — no double-submit needed.
 */
const User = require("../models/user");
const { verifyAdminToken } = require("../utils/adminCrypto");

const SESSION_COOKIE = "ssctl_sid";
const CSRF_COOKIE = "ssctl_csrf";

// Minimal dependency-free cookie parser (avoids adding cookie-parser).
function parseCookies(req) {
    const header = req.headers.cookie;
    const out = {};
    if (!header) return out;
    header.split(";").forEach((part) => {
        const idx = part.indexOf("=");
        if (idx === -1) return;
        const k = part.slice(0, idx).trim();
        const v = part.slice(idx + 1).trim();
        if (k) out[k] = decodeURIComponent(v);
    });
    return out;
}

const notFound = (res) => res.status(404).end();

/**
 * requireAdmin — gate for all authenticated admin endpoints.
 * On success sets req.adminUser (the full user doc) and req.adminCookies.
 */
async function requireAdmin(req, res, next) {
    try {
        const cookies = parseCookies(req);
        req.adminCookies = cookies;

        // Session token: cookie first, Authorization: Bearer as the
        // third-party-cookie-blocked fallback (split deploy).
        let token = cookies[SESSION_COOKIE];
        let viaHeader = false;
        if (!token) {
            const auth = req.headers.authorization || "";
            if (auth.startsWith("Bearer ")) {
                token = auth.slice(7).trim();
                viaHeader = true;
            }
        }
        if (!token) return notFound(res);

        let decoded;
        try {
            decoded = verifyAdminToken(token);
        } catch {
            return notFound(res);
        }
        if (!decoded || decoded.purpose !== "session" || !decoded.sub) return notFound(res);

        const user = await User.findById(decoded.sub).select("+admin");
        if (!user) return notFound(res);
        if (user.role !== "admin") return notFound(res);
        if (user.status !== "active") return notFound(res);
        // tokenVersion mismatch → session was revoked ("log out everywhere").
        if ((user.admin?.tokenVersion || 0) !== (decoded.tv || 0)) return notFound(res);

        // CSRF double-submit on state-changing verbs — cookie-auth path only.
        // Header auth carries no ambient authority (browsers never attach it on
        // their own), so cross-site request forgery is impossible there.
        if (!viaHeader && !["GET", "HEAD", "OPTIONS"].includes(req.method)) {
            const csrfCookie = cookies[CSRF_COOKIE];
            const csrfHeader = req.headers["x-ssctl-csrf"];
            if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) return notFound(res);
        }

        req.adminUser = user;
        next();
    } catch (err) {
        console.error("[adminAuth] error:", err.message);
        return notFound(res);
    }
}

/**
 * requireRole — least-privilege gate layered on top of requireAdmin. Restricts an
 * endpoint to specific admin-portal tiers (admin.portalRole). "superadmin" always
 * passes. Use for sensitive module actions (economy grants, catalog publish, bans).
 * Falls back to "superadmin" when the field is absent (legacy admins) so existing
 * accounts keep full access until roles are explicitly assigned.
 */
function requireRole(...roles) {
    return (req, res, next) => {
        const pr = req.adminUser?.admin?.portalRole || "superadmin";
        if (pr === "superadmin" || roles.includes(pr)) return next();
        return notFound(res);
    };
}

module.exports = { requireAdmin, requireRole, parseCookies, SESSION_COOKIE, CSRF_COOKIE };

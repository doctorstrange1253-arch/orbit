/**
 * requireRoles.js — coarse-grained role gate for Express routes.
 *
 * The Orbit auth middleware (middleware/auth.js) attaches `req.user.roles` to
 * every authenticated request after a single DB fetch. requireRoles reads that
 * array and 403s when the caller is missing the required role.
 *
 * Use for ROUTE-LEVEL membership checks ("only mentors can apply", "only
 * students can book"). For OWNERSHIP / STATUS checks ("mentor can only edit
 * their OWN session", "student can only cancel within 24h"), keep the check
 * inside the controller — the project already does this for OrbitSession
 * ownership, and the policy lives closer to the data it protects.
 *
 * Composition with auth.js:
 *   router.post("/book", auth, requireRoles("student"), bookHandler);
 *
 * Variants:
 *   requireRoles("mentor")              → caller must have 'mentor'
 *   requireRoles("mentor", "student")   → caller must have at least one
 *   requireAllRoles("mentor", "student")→ caller must have BOTH
 *   requireAnyRole(["mentor","student"])→ same as requireRoles, array form
 */
const VALID = new Set(["peer_learner", "mentor", "student"]);

function normalize(role) {
    return String(role || "").trim();
}

/** 401 if no user (auth middleware should have caught this), 403 if the user
 *  lacks every required role. Returns 403 with a structured body so the
 *  frontend RoleGuard can render a friendly "Apply to become a mentor" CTA
 *  instead of a generic error toast. */
function deny(res, required, have) {
    return res.status(403).json({
        code: "ROLE_REQUIRED",
        message: `This action requires one of: ${required.join(", ")}.`,
        required,
        have,
    });
}

function requireRoles(...allowed) {
    const list = allowed.map(normalize).filter((r) => VALID.has(r));
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ code: "UNAUTHENTICATED", message: "Sign in to continue." });
        }
        const have = Array.isArray(req.user.roles) ? req.user.roles : [];
        const ok = list.some((r) => have.includes(r));
        if (!ok) return deny(res, list, have);
        return next();
    };
}

function requireAllRoles(...required) {
    const list = required.map(normalize).filter((r) => VALID.has(r));
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ code: "UNAUTHENTICATED", message: "Sign in to continue." });
        }
        const have = Array.isArray(req.user.roles) ? req.user.roles : [];
        const ok = list.every((r) => have.includes(r));
        if (!ok) return deny(res, list, have);
        return next();
    };
}

function requireAnyRole(allowed) {
    return requireRoles(...(Array.isArray(allowed) ? allowed : [allowed]));
}

module.exports = {
    requireRoles,
    requireAllRoles,
    requireAnyRole,
    VALID_ROLES: Array.from(VALID),
};

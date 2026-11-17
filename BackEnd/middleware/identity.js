/**
 * Identity & Role-Based Access Control (RBAC) Middleware
 *
 * Enforces role checks, identity context matching, and rolesVersion
 * token invalidation (addressing bug audit finding BA-06).
 */

const User = require("../models/user");

/**
 * Require specific roles to access a route.
 * @param {string[]} allowedRoles - Array of permitted roles (e.g., ['student', 'peer', 'mentor'])
 */
function requireRoles(allowedRoles = []) {
    return async (req, res, next) => {
        try {
            if (!req.user || !req.user._id) {
                return res.status(401).json({ message: "Authentication required." });
            }

            const user = await User.findById(req.user._id).select("roles rolesVersion");
            if (!user) {
                return res.status(401).json({ message: "User not found." });
            }

            // Check rolesVersion match if present in decoded token
            if (req.user.rolesVersion !== undefined && user.rolesVersion !== undefined) {
                if (req.user.rolesVersion < user.rolesVersion) {
                    return res.status(401).json({
                        message: "Token is stale due to role updates. Please re-authenticate.",
                        code: "ROLES_STALE"
                    });
                }
            }

            // Verify user has at least one of the allowed roles
            const hasRole = allowedRoles.some((role) => user.roles.includes(role));
            if (!hasRole) {
                return res.status(403).json({
                    message: `Access denied. Required one of roles: [${allowedRoles.join(", ")}].`
                });
            }

            req.currentUserRoles = user.roles;
            next();
        } catch (err) {
            console.error("[requireRoles middleware error]", err.message);
            return res.status(500).json({ message: "Internal server error during role validation." });
        }
    };
}

/**
 * Prevent a mentor/peer from reviewing or modifying their own course or submission.
 */
function preventSelfReview(getTargetUserId) {
    return async (req, res, next) => {
        try {
            const currentUserId = req.user?._id;
            const targetUserId = getTargetUserId(req);

            if (currentUserId && targetUserId && String(currentUserId) === String(targetUserId)) {
                return res.status(403).json({
                    message: "Self-review and self-rating actions are strictly prohibited."
                });
            }
            next();
        } catch (err) {
            console.error("[preventSelfReview middleware error]", err.message);
            return res.status(500).json({ message: "Internal server error during self-review check." });
        }
    };
}

module.exports = {
    requireRoles,
    preventSelfReview
};

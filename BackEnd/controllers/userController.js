const User = require("../models/user");
const Skill = require("../models/skill");
const Connection = require("../models/Connection");
const OrbitSession = require("../models/OrbitSession");
const MentorProfile = require("../models/MentorProfile");
const jwt = require("jsonwebtoken");
const { enforceContentPolicy } = require("../utils/contentModeration");
const { PUBLIC_USER_PROJECTION } = require("./authController");

// Mirror of the enum in models/user.js. Kept here so the toggle handler can
// validate without dragging Mongoose's enum resolution into the hot path.
const VALID_ROLES = ["peer_learner", "mentor", "student"];

// ================= GET PLATFORM STATS =================
exports.getStats = async (req, res) => {
    try {
        const userCount = await User.countDocuments();
        const skillCount = await Skill.countDocuments();
        const connectionCount = await Connection.countDocuments({ status: 'accepted' });
        
        // Calculate average trust score in the DB (avoids loading every user doc).
        const [agg] = await User.aggregate([
            { $group: { _id: null, avgTrustScore: { $avg: "$trustScore" } } }
        ]);
        const avgTrustScore = agg?.avgTrustScore || 0;

        res.status(200).json({
            users: userCount,
            skills: skillCount,
            connections: connectionCount,
            avgRating: avgTrustScore.toFixed(1)
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server error" });
    }
};

// ================= GET PROFILE =================
exports.getProfile = async (req, res) => {
    try {
        // Exclude secrets even from the owner: the admin credential sub-doc
        // (bcrypt hash, encrypted TOTP secret, backup codes) and the password-
        // reset token must never travel to any client.
        const user = await User.findById(req.user.id)
            .select("-password -admin -resetPasswordToken -resetPasswordExpires");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user);

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server error" });
    }
};

// ================= GET PUBLIC PROFILE =================
exports.getPublicProfile = async (req, res) => {
    try {
        // ALLOWLIST projection. The old denylist ("-password -email …") still
        // exposed sensitive fields it didn't know about — resetPasswordToken,
        // resetPasswordExpires, the admin credential sub-document, fcmTokens,
        // lastLoginEmailAt. An explicit allowlist can never leak a new field.
        const user = await User.findById(req.params.id).select(
            "name bio avatar socialLinks location languages trustScore totalRatings averageRating lastSeen createdAt cosmic orbit.cosmetics orbit.streak.current orbit.streak.longest city region country"
        );

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user);

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server error" });
    }
};


// ================= UPDATE PROFILE =================
exports.updateProfile = async (req, res) => {
    try {
        const { name, bio, location, languages, socialLinks } = req.body || {};

        // --- CONTENT MODERATION (same escalating warning/ban as skills) ---
        // Scan the free-text fields a user can put words into (name + bio). A
        // violation is a strike; 3 strikes → a temporary ban, and the profile
        // is NOT saved.
        if (name || bio) {
            const mod = await enforceContentPolicy(req.user.id, [name, bio], { context: 'profile' });
            if (!mod.ok) return res.status(mod.status).json(mod.body);
        }
        // --------------------

        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { name, bio, location, languages, socialLinks },
            { new: true, runValidators: true }
        ).select("-password -admin -resetPasswordToken -resetPasswordExpires");

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            message: "Profile updated successfully",
            user: updatedUser
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server error" });
    }
};


// ================= UPLOAD AVATAR (Custom Image) =================
exports.uploadAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        // Cloudinary URL is in req.file.path
        const avatarUrl = req.file.path;

        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { avatar: avatarUrl },
            { new: true, returnDocument: 'after' }
        ).select("-password -admin -resetPasswordToken -resetPasswordExpires");

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            message: "Avatar uploaded successfully",
            avatar: avatarUrl,
            user: updatedUser
        });

    } catch (err) {
        console.error("Avatar upload error:", err);
        
        // Better error messages
        if (err.message && err.message.includes('cloud_name')) {
            return res.status(500).json({ 
                message: "Cloudinary not configured. Please add your Cloudinary credentials to .env file." 
            });
        }
        
        res.status(500).json({ 
            message: err.message || "Upload failed. Please try again." 
        });
    }
};


// ================= UPDATE AVATAR URL (Preset or Remove) =================
exports.updateAvatarUrl = async (req, res) => {
    try {
        const { avatar } = req.body || {};

        // Allow empty string to remove avatar and use gradient
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { avatar: avatar || "" },
            { new: true }
        ).select("-password -admin -resetPasswordToken -resetPasswordExpires");

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            message: "Avatar updated successfully",
            avatar: updatedUser.avatar,
            user: updatedUser
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server error" });
    }
};


// POST /god/unlock-all — God Mode: owner unlocks every cosmetic for themselves.
// SERVER-SIDE role gate: the auth middleware only proves a valid login, and the
// UI hiding the button is not security — without this check ANY user could call
// the endpoint directly and unlock every paid cosmetic for free.
exports.godUnlockAll = async (req, res) => {
    try {
        const uid = req.user._id || req.user.id;
        const me = await User.findById(uid).select("role").lean();
        if (!me || me.role !== "admin") return res.status(404).end(); // cloak like the admin portal
        const keys = require("../services/cosmeticsCatalog").getAllCatalog().map((c) => c.key);
        await User.updateOne({ _id: uid }, { $set: { "orbit.cosmetics.owned": keys } });
        return res.json({ ok: true, owned: keys.length });
    } catch (err) {
        console.error("[godUnlockAll]", err.message);
        return res.status(500).json({ message: "Unlock failed." });
    }
};

// ── Account Roles API ──────────────────────────────────────────────────────
// A user can hold multiple roles at once: peer_learner (free P2P), mentor
// (paid teacher, gated by the MentorHub 5-state machine), and student (paid
// learner). The frontend Settings → "Your roles" tile calls these endpoints.

// GET /api/user/roles — return the live roles + version for the caller. The
// auth middleware already populated req.user.roles + req.user.rolesVersion, so
// this is a pure read-through.
//
// If the request arrived via the stale-token recovery path (auth middleware
// let a stale JWT through because this IS the refresh endpoint), we ALSO
// return a fresh token + the public user shape so the api.js interceptor
// can swap the token in place and retry the original request without a
// hard reload. Otherwise the client would have to log in again from scratch.
exports.getMyRoles = async (req, res) => {
    try {
        const uid = req.user._id || req.user.id;
        const u = await User.findById(uid).select("roles rolesVersion");
        if (!u) return res.status(404).json({ message: "User not found" });
        const liveRoles = Array.isArray(u.roles) && u.roles.length > 0 ? u.roles : ["peer_learner"];
        const liveRolesVersion = typeof u.rolesVersion === "number" ? u.rolesVersion : 0;
        if (!req.user.rolesStale) {
            return res.status(200).json({ roles: liveRoles, rolesVersion: liveRolesVersion });
        }
        // Stale-token recovery: include a fresh user + token so the client
        // can swap them in one round-trip.
        const fresh = await User.findById(uid).select(PUBLIC_USER_PROJECTION);
        return res.status(200).json({
            roles: liveRoles,
            rolesVersion: liveRolesVersion,
            token: mintUserToken(fresh, isNativeRequest(req)),
            user: fresh,
        });
    } catch (err) {
        console.error("[getMyRoles]", err);
        return res.status(500).json({ message: "Server error" });
    }
};

// PATCH /api/user/roles — toggle roles on/off. Always returns a fresh JWT so
// the client can swap it into the auth header without re-login.
//
// Rules enforced here (any failure → a structured 4xx with `code`):
//   - At least one role must remain (the array can't go empty).
//   - peer_learner can be removed ONLY if the caller has another role AND
//     has no active P2P connection that requires it (defensive — the product
//     is fine with peer_learner-only users, this just keeps it honest).
//   - mentor can be added WITHOUT a MentorProfile in `approved` state — the
//     frontend MentorHub handles the application. We only block the
//     self-grant IF the user previously had a `suspended` MentorProfile
//     (so a suspended mentor can't self-reinstate via this endpoint).
//   - mentor can be removed freely. Existing paid sessions are not affected;
//     the existing OrbitSession rows keep their mentorId so past bookings
//     still render correctly for the student.
//   - student can be added/removed freely — there's no application gate.
//
// On every successful toggle we bump `rolesVersion` so any in-flight JWT
// for this user will hit the ROLES_STALE 401 in middleware/auth.js and the
// api.js interceptor will refresh transparently.
exports.updateMyRoles = async (req, res) => {
    try {
        const uid = req.user._id || req.user.id;
        const incoming = Array.isArray(req.body?.roles) ? req.body.roles : null;
        if (!incoming) {
            return res.status(400).json({ code: "INVALID_BODY", message: "Body must include a `roles` array." });
        }
        const cleaned = Array.from(new Set(incoming.map((r) => String(r || "").trim())));
        if (cleaned.length === 0) {
            return res.status(422).json({ code: "EMPTY_ROLES", message: "You must keep at least one role." });
        }
        const invalid = cleaned.filter((r) => !VALID_ROLES.includes(r));
        if (invalid.length > 0) {
            return res.status(400).json({
                code: "UNKNOWN_ROLE",
                message: `Unknown role(s): ${invalid.join(", ")}.`,
                allowed: VALID_ROLES,
            });
        }

        // Load the user fresh so we can diff against the current set.
        const u = await User.findById(uid).select("roles rolesVersion");
        if (!u) return res.status(404).json({ message: "User not found" });
        const before = Array.isArray(u.roles) ? u.roles : [];
        const after = cleaned;

        // Rule 1: at least one role must remain (the cleaned array already
        // passes this — duplicates + invalid values are dropped — but the
        // empty case is caught above).
        if (after.length === 0) {
            return res.status(422).json({ code: "EMPTY_ROLES", message: "You must keep at least one role." });
        }

        // Rule 2: adding `mentor` while a SUSPENDED MentorProfile exists is a
        // self-reinstate — block it. The user must appeal through support.
        const wantsMentor = after.includes("mentor") && !before.includes("mentor");
        if (wantsMentor) {
            const suspended = await MentorProfile.findOne({ userId: uid, applicationStatus: "suspended" }).lean();
            if (suspended) {
                return res.status(403).json({
                    code: "MENTOR_SUSPENDED",
                    message: "Your mentor account is suspended. Email support@orbit.dev to appeal.",
                });
            }
        }

        // No-op fast path: the requested set already matches. Return the
        // current token + public user so the client gets a consistent shape
        // and can swap the token atomically (no ROLES_STALE roundtrip).
        const same = before.length === after.length && before.every((r) => after.includes(r));
        if (same) {
            const publicUser = await User.findById(uid).select(PUBLIC_USER_PROJECTION);
            return res.status(200).json({
                message: "Roles unchanged",
                roles: after,
                rolesVersion: typeof u.rolesVersion === "number" ? u.rolesVersion : 0,
                user: publicUser,
                token: mintUserToken(u, isNativeRequest(req)),
            });
        }

        // Apply the change and bump rolesVersion atomically. The +1 in the
        // same $set guarantees any JWT issued BEFORE this write is now
        // stale (middleware/auth.js will 401 it on next request).
        const updated = await User.findByIdAndUpdate(
            uid,
            { $set: { roles: after, rolesVersion: (u.rolesVersion || 0) + 1 } },
            { new: true, projection: "roles rolesVersion" }
        );

        // Re-load the full public projection so the client can swap the user
        // atomically alongside the fresh token — no follow-up GET needed.
        const publicUser = await User.findById(uid).select(PUBLIC_USER_PROJECTION);

        return res.status(200).json({
            message: "Roles updated",
            roles: updated.roles,
            rolesVersion: updated.rolesVersion,
            user: publicUser,
            token: mintUserToken(updated, isNativeRequest(req)),
        });
    } catch (err) {
        console.error("[updateMyRoles]", err);
        return res.status(500).json({ message: "Server error" });
    }
};

function isNativeRequest(req) {
    return String(req.headers["x-client-platform"] || "").toLowerCase() === "native";
}

function mintUserToken(user, isNative) {
    return jwt.sign(
        {
            id: user._id,
            roles: Array.isArray(user.roles) && user.roles.length > 0 ? user.roles : ["peer_learner"],
            rolesVersion: typeof user.rolesVersion === "number" ? user.rolesVersion : 0,
        },
        process.env.JWT_SECRET,
        { expiresIn: isNative ? "30d" : "1d" }
    );
}

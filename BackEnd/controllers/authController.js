const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Roles the frontend is allowed to set at registration. Kept as a module-level
// constant so it can be shared by tests and the migration script.
const VALID_ROLES = ["peer_learner", "mentor", "student"];

// Strip sensitive fields before shipping a user object to the client. Mirrors
// the projection used in userController.getProfile so register / login can
// safely return the user in-band without leaking admin credentials or reset
// tokens.
const PUBLIC_USER_PROJECTION = "-password -admin -resetPasswordToken -resetPasswordExpires";

/** Mint a JWT that carries the live roles + rolesVersion so the middleware
 *  can short-circuit stale tokens. Mirrors the auth.js ROLES_STALE check. */
function signSessionToken(user, isNative) {
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

// ================= REGISTER =================
exports.register = async (req, res) => {
    try {
        const { name, email, password, languages, roles } = req.body || {};

        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Enforce a strong password server-side (same policy as resetPassword).
        // Frontend validation can be bypassed by calling the API directly, so a
        // weak signup password must be rejected here too.
        const strong = password.length >= 8
            && /[A-Z]/.test(password)
            && /[a-z]/.test(password)
            && /[0-9]/.test(password)
            && /[^A-Za-z0-9]/.test(password);
        if (!strong) {
            return res.status(400).json({
                message: "Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a special character."
            });
        }

        // Validate the optional roles array. A user with no body field still
        // gets ['peer_learner'] via the schema default, so explicit validation
        // is only needed when the client sent something.
        let chosenRoles = ["peer_learner"];
        if (Array.isArray(roles)) {
            if (roles.length === 0) {
                return res.status(400).json({ message: "Pick at least one account type." });
            }
            const invalid = roles.filter((r) => !VALID_ROLES.includes(r));
            if (invalid.length > 0) {
                return res.status(400).json({
                    message: `Unknown account type: ${invalid.join(", ")}. Allowed: ${VALID_ROLES.join(", ")}.`
                });
            }
            // peer_learner is the free baseline — always ensure it is present
            // so a user who only ticked "mentor" still has the P2P surface.
            const set = new Set(roles);
            set.add("peer_learner");
            chosenRoles = Array.from(set);
        }

        // Check existing user
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save user
        const user = new User({
            name,
            email,
            password: hashedPassword,
            languages: languages || ["English"],
            roles: chosenRoles,
            rolesVersion: 0,
        });

        await user.save();

        // Asynchronously send the welcome registration email
        const { sendRegistrationNotification } = require('../utils/sendEmail');
        sendRegistrationNotification(user.email, user.name);

        // Sign the new user's session so the client can land straight on
        // their role-appropriate home without a second round-trip. This is a
        // deliberate change from the prior "register then bounce to /login"
        // flow — the role-selector step 2 sets the expectation that the
        // server knows where to send them.
        const isNative = String(req.headers["x-client-platform"] || "").toLowerCase() === "native";
        const token = signSessionToken(user, isNative);

        // Re-fetch with the public projection so the response shape matches
        // what /user/profile returns (avoids a second client round-trip).
        const safeUser = await User.findById(user._id).select(PUBLIC_USER_PROJECTION);

        res.status(201).json({
            message: "User registered successfully",
            token,
            user: safeUser,
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server error" });
    }
};


// ================= LOGIN =================
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password required"
            });
        }

        const user = await User.findOne({ email });

        // Anti-enumeration: identical response whether the email is unknown or
        // the password is wrong (mirrors the forgotPassword neutral response),
        // so an attacker can't probe which emails have accounts.
        if (!user) {
            return res.status(400).json({
                message: "Invalid credentials"
            });
        }

        // Ethics & Safety Ban Check
        if (user.bannedUntil && new Date() < new Date(user.bannedUntil)) {
            const timeRemaining = Math.ceil((new Date(user.bannedUntil) - new Date()) / (1000 * 60 * 60)); // hours
            return res.status(403).json({ 
                message: `Your account is banned for safety violations. Ban expires in approx. ${timeRemaining} hours.`,
                banned: true,
                timeRemaining
            });
        }

        if (!user.password) {
            return res.status(400).json({
                message: "This account uses Google or GitHub login. Please use the social login buttons below."
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid credentials"
            });
        }

        // Decide whether this sign-in deserves a cosmic "welcome" moment BEFORE we
        // overwrite the login markers below:
        //   - first ever login (loginCount still 0)            → 'first'
        //   - returning after a long absence (>= 7 days idle)  → 'return'
        // The client fires the Liftoff overlay from this signal.
        const prevLastLogin = user.lastLogin ? new Date(user.lastLogin).getTime() : null;
        const isFirstLogin = (user.loginCount || 0) === 0;
        let welcome = null;
        if (isFirstLogin) {
            welcome = { kind: "first" };
        } else if (prevLastLogin) {
            const daysAway = Math.floor((Date.now() - prevLastLogin) / 86400000);
            if (daysAway >= 7) welcome = { kind: "return", days: daysAway };
        }

        // Track login activity (used for trust score calculation)
        user.loginCount += 1;
        user.lastLogin   = new Date();

        // Throttle the "new login" email so frequent logins don't spam the inbox.
        // Only notify if we haven't already emailed within the cooldown window.
        const LOGIN_EMAIL_COOLDOWN_MS = 6 * 60 * 60 * 1000; // 6 hours
        const now = Date.now();
        const lastEmail = user.lastLoginEmailAt ? new Date(user.lastLoginEmailAt).getTime() : 0;
        const shouldEmailLogin = now - lastEmail > LOGIN_EMAIL_COOLDOWN_MS;
        if (shouldEmailLogin) user.lastLoginEmailAt = new Date();

        await user.save();

        // Native app (APK) sessions are long-lived so users aren't forced to
        // re-login daily — the app is a trusted install, not a shared browser.
        // The website keeps a short 1-day session. The client signals its
        // platform via the X-Client-Platform header (set by the Capacitor build).
        const isNative = String(req.headers["x-client-platform"] || "").toLowerCase() === "native";
        const token = signSessionToken(user, isNative);

        // Asynchronously send the email notification (don't block the response),
        // but only when outside the cooldown window (anti-spam).
        if (shouldEmailLogin) {
            const { sendLoginNotification } = require('../utils/sendEmail');
            sendLoginNotification(user.email, user.name);
        }

        // Ship the user with the response so the client can skip the
        // post-login /user/profile fetch (the 3-card role redirect logic
        // needs roles immediately on first paint).
        const safeUser = await User.findById(user._id).select(PUBLIC_USER_PROJECTION);

        res.status(200).json({
            message: "Login successful",
            token,
            user: safeUser,
            welcome   // null, { kind: "first" }, or { kind: "return", days }
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Server error"
        });
    }
};

// ================= FORGOT PASSWORD =================
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: "Email is required" });

        const user = await User.findOne({ email: email.toLowerCase() });
        // Always respond with success to prevent email enumeration
        if (!user) {
            return res.status(200).json({ message: "If an account exists, a reset link has been sent." });
        }

        // Generate a 32-char hex token and store a 1-hour expiry
        const crypto = require('crypto');
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetExpires = Date.now() + 60 * 60 * 1000; // 1 hour

        // Store hashed token in DB
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpires = resetExpires;
        await user.save();

        const resetUrl = `${process.env.FRONTEND_URL || 'https://react-skill-swap-fully-fledged.vercel.app'}/reset-password/${resetToken}`;

        // ── Observability (server logs ONLY — never leaked to the client, so the
        // neutral anti-enumeration response below is preserved). This is what
        // reveals a misconfigured mailer in production, where the always-success
        // screen otherwise hides real send failures.
        // The mailer sends via Brevo's HTTPS API (see utils/sendEmail.js), so the
        // relevant config is BREVO_API_KEY + a verified sender — NOT the legacy
        // EMAIL_HOST/EMAIL_USER/EMAIL_PASS SMTP vars this check used to test.
        const emailConfigured = !!(process.env.BREVO_API_KEY && (process.env.BREVO_SENDER_EMAIL || process.env.EMAIL_USER));
        if (!emailConfigured) {
            console.error('[forgot-password] Brevo mailer is not configured — reset mail cannot be delivered. Set BREVO_API_KEY and BREVO_SENDER_EMAIL (a Brevo-verified sender) on the host and redeploy.');
        }
        // In non-prod, log the reset link so the flow can be verified without a live inbox.
        if (process.env.NODE_ENV !== 'production') {
            console.log(`[forgot-password] (dev) reset link for ${user.email}: ${resetUrl}`);
        }

        // Send asynchronously (prevents a 15s Axios timeout if SMTP is slow/blocked),
        // but log the resolved messageId on success and the explicit error on failure.
        const { sendPasswordResetEmail } = require('../utils/sendEmail');
        sendPasswordResetEmail({ to: user.email, name: user.name, resetUrl })
            .then(info => console.log(`[forgot-password] reset email queued for ${user.email} — messageId=${info?.messageId || 'n/a'}`))
            .catch(mailErr => console.error(`[forgot-password] reset email FAILED for ${user.email}:`, mailErr?.message || mailErr));

        res.status(200).json({ message: "If an account exists, a reset link has been sent." });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// ================= RESET PASSWORD =================
exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!token || !password) {
            return res.status(400).json({ message: "Token and new password are required" });
        }
        // Enforce the SAME policy as registration (8+ chars, upper, lower,
        // number, special) so reset passwords aren't weaker than signup ones.
        const strong = password.length >= 8
            && /[A-Z]/.test(password)
            && /[a-z]/.test(password)
            && /[0-9]/.test(password)
            && /[^A-Za-z0-9]/.test(password);
        if (!strong) {
            return res.status(400).json({
                message: "Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a special character."
            });
        }

        const crypto = require('crypto');
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: "Reset token is invalid or has expired." });
        }

        user.password = await require('bcrypt').hash(password, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).json({ message: "Password reset successfully. You can now log in." });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

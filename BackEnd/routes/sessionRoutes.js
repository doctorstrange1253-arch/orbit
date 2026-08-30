/**
 * sessionRoutes.js — Orbit Sessions HTTP routes.
 *
 * IMPORTANT: the `/webhook` endpoint is NOT mounted from this router.
 * It is registered directly on the Express `app` in `server.js` BEFORE the
 * global `express.json()` parser so the raw body is preserved for HMAC
 * verification — see the comment block at the webhook mount in server.js
 * for why. Mounting the webhook here (or anywhere under the global json
 * parser) makes `crypto.createHmac().update(req.body)` throw because
 * `req.body` is already a parsed Object, not a Buffer.
 *
 * This router owns everything else under /api/sessions and uses
 * `express.json()` + `auth` middleware.
 */

const express = require("express");
const auth = require("../middleware/auth");
const { requireAdmin } = require("../middleware/adminAuth");
const { requireRoles } = require("../middleware/requireRoles");
const C = require("../controllers/sessionsController");

const router = express.Router();

router.use(express.json());
router.use(auth);

// Apply to become a mentor: any authenticated user can submit the form (even
// if they don't have the 'mentor' role yet — the application *grants* the
// role after admin approval). The route-level gate is intentionally weak
// (any role) because the MentorProfile state machine is the real authority.
router.post("/mentor/apply", C.applyAsMentor);

// Public-to-authenticated reads: any signed-in user can browse mentors
// and view a single mentor profile. The `mentor` role is NOT required to
// *view* (otherwise students couldn't browse the marketplace).
router.get("/mentors", C.listMentors);
router.get("/mentors/:userId", C.getMentor);

// Booking is the one paid action that needs a hard role gate: only callers
// with the 'student' role can book a session. The handler still re-checks
// mentor existence + availability + conflict — this is just the first
// defense.
router.post("/book", requireRoles("student"), C.book);
router.post("/:id/payment-verify", C.verifyPayment);

// Reads
router.get("/me", C.listMine);
router.get("/:id", C.getOne);

// Lifecycle handlers do their own ownership check (mentor can only start
// their own session, student can only rate theirs) — see controllers/sessionsController.js.
// No route-level role gate here: the same handler serves both sides of the call.
router.post("/:id/start", C.start);
router.post("/:id/complete", C.complete);
router.post("/:id/rate", C.rate);

// Admin escape hatch — admins can fetch any session by id without ownership
// checks (used by the Sessions admin page).
router.get("/admin/:id", requireAdmin, C.getOne);

module.exports = router;

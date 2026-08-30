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
const C = require("../controllers/sessionsController");

const router = express.Router();

router.use(express.json());
router.use(auth);

// Mentors
router.post("/mentor/apply", C.applyAsMentor);
router.get("/mentors", C.listMentors);
router.get("/mentors/:userId", C.getMentor);

// Booking
router.post("/book", C.book);
router.post("/:id/payment-verify", C.verifyPayment);

// Reads
router.get("/me", C.listMine);
router.get("/:id", C.getOne);

// Lifecycle
router.post("/:id/start", C.start);
router.post("/:id/complete", C.complete);
router.post("/:id/rate", C.rate);

// Admin escape hatch — admins can fetch any session by id without ownership
// checks (used by the Sessions admin page).
router.get("/admin/:id", requireAdmin, C.getOne);

module.exports = router;

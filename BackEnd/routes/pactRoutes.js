/**
 * pactRoutes.js — mentor-only Pact surface.
 *
 * /api/pact/* (mounted in server.js). All routes are mentor-gated.
 */

const express = require("express");
const auth = require("../middleware/auth");
const { requireRoles } = require("../middleware/requireRoles");
const c = require("../controllers/pactController");

const router = express.Router();
const mentor = [auth, requireRoles("mentor")];

router.get("/me", mentor, c.getMe);
router.get("/hall", mentor, c.getHall);
router.get("/rivals", mentor, c.getRivals);
router.get("/history", mentor, c.getHistory);
router.get("/pulse", mentor, c.getPulse);
router.post("/pulse/seen", mentor, c.markPulseSeen);

module.exports = router;

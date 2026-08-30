/**
 * gameologyRoutes.js — student-facing read + small explicit-award surface.
 *
 * /api/gameology/* (mounted in server.js).
 *
 * Most XP mutations are server-side via controllers (courseController etc.)
 * that call gameologyService.awardXp. The /award route is for explicit
 * client-side hooks (e.g. "I just finished a peer swap" button).
 */

const express = require("express");
const auth = require("../middleware/auth");
const c = require("../controllers/gameologyController");

const router = express.Router();

router.get("/me", auth, c.getMe);
router.get("/leaderboard", c.getLeaderboard);
router.get("/achievements", c.getCatalog);
router.get("/achievements/me", auth, c.getMyAchievements);
router.get("/history", auth, c.getMyHistory);
router.post("/award", auth, c.award);

module.exports = router;

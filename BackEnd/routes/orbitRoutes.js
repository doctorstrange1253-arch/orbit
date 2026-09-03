const express = require("express");
const router  = express.Router();
const auth    = require("../middleware/auth");

const { getMyOrbit, claimMission, rerollMission, buyFreeze, setPrefs, getLedger, giftPhotons, claimDailyQuest } = require("../controllers/orbitController");
const binaryStar = require("../controllers/binaryStarController");
const { getMyLeague } = require("../controllers/leagueController");
const shop = require("../controllers/shopController");

// The viewer's Orbit state — streak, Gravity Assist freezes, Stardust, missions.
// Self-heals the weekly rollovers on read (protected).
router.get("/me", auth, getMyOrbit);

// Claim a completed weekly mission's Stardust reward (protected).
router.post("/missions/:key/claim", auth, claimMission);

// Claim today's quest. Every fifth consecutive claim also grants a Gravity
// Assist, so the streak shield is earned by showing up (protected).
router.post("/quest/claim", auth, claimDailyQuest);

// Spend Photons to swap one unclaimed, incomplete mission for a fresh one
// (once per week — protected).
router.post("/missions/:key/reroll", auth, rerollMission);

// Gift Photons to an accepted connection (daily-capped — protected).
router.post("/photons/gift", auth, giftPhotons);

// Spend Stardust to bank one extra Gravity Assist freeze (protected).
router.post("/freeze/buy", auth, buyFreeze);

// Update engagement preferences (e.g. decay-reminder opt-out — protected).
router.post("/prefs", auth, setPrefs);

// The viewer's recent Photon flows — earn/spend history for the Mission Log.
router.get("/ledger", auth, getLedger);

// ── Binary Stars (co-op shared streaks, Tier 2) ─────────────────────────────
// Hard-rename from /constellations to /binary-stars. The deployed APK breaks
// until the new bundle ships — accepted by the user, no compat shim.
router.get("/binary-stars", auth, binaryStar.getMine);
router.post("/binary-stars/invite", auth, binaryStar.invite);
router.post("/binary-stars/:id/respond", auth, binaryStar.respond);
router.post("/binary-stars/:id/dissolve", auth, binaryStar.dissolve);

// Weekly League — the viewer's division + live group standings (protected).
router.get("/league", auth, getMyLeague);

// ── Stardust Cosmetics Shop (Tier 3) ───────────────────────────────────────
router.get("/shop", auth, shop.getShop);
router.post("/shop/buy", auth, shop.buy);
router.post("/shop/equip", auth, shop.equip);

module.exports = router;

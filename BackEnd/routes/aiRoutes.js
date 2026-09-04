const express = require("express");
const auth = require("../middleware/auth");
const { requireRoles } = require("../middleware/requireRoles");
const ai = require("../controllers/aiController");

const router = express.Router();

router.use(express.json());
router.use(auth);

// Level-card copy suggestions for the mentor Studio. Mentor-gated because it is
// an authoring tool, not a public generator.
router.post("/level-proposal", requireRoles("mentor"), ai.levelProposal);

module.exports = router;

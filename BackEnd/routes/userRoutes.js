const express = require("express");
const router = express.Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const { getProfile, getPublicProfile, updateProfile, getStats, uploadAvatar, updateAvatarUrl, godUnlockAll, getMyRoles, updateMyRoles } = require("../controllers/userController");
const auth = require("../middleware/auth");

// Configure Cloudinary storage for multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'skillswap/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    transformation: [{ width: 400, height: 400, crop: 'fill', quality: 'auto' }]
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

// Get platform stats (public - no auth needed)
router.get("/stats", getStats);

// Get my profile (protected)
router.get("/profile", auth, getProfile);

// Account roles (Settings → "Your roles" tile). The auth middleware already
// loads req.user.roles + rolesVersion from the DB on every request, so these
// endpoints are pure read/write of the user's own role set. The PATCH always
// returns a fresh JWT — the client swaps it into the auth header so the new
// role takes effect on the very next request without a page reload.
router.get("/roles", auth, getMyRoles);
router.patch("/roles", auth, updateMyRoles);

// Get public profile (public)
router.get("/:id", getPublicProfile);

// Update my profile (protected)
router.put("/profile", auth, updateProfile);

// Upload avatar (protected)
router.post("/upload-avatar", auth, upload.single('avatar'), uploadAvatar);

// Update avatar URL (for preset avatars - protected)
router.put("/avatar", auth, updateAvatarUrl);

router.post("/god/unlock-all", auth, godUnlockAll);

module.exports = router;

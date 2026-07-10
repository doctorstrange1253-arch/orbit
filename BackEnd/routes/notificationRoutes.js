const express = require("express");
const router = express.Router();

const {
    listNotifications,
    unreadCount,
    markRead,
    markAllRead,
    deleteNotification,
    clearAll,
} = require("../controllers/notificationController");

const auth = require("../middleware/auth");

// All notification routes are user-scoped (protected).
router.get("/", auth, listNotifications);
router.get("/unread-count", auth, unreadCount);
router.patch("/read-all", auth, markAllRead);
router.patch("/:id/read", auth, markRead);
router.delete("/clear-all", auth, clearAll);
router.delete("/:id", auth, deleteNotification);

module.exports = router;

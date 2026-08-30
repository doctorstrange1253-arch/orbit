/**
 * courseRoutes.js — HTTP surface for the Course surface.
 *
 * /api/courses/* (mounted in server.js).
 * Most routes go through auth + requireRoles("mentor" | "student") guards.
 *
 * Multer: two instances — videoStorage (resource_type video) and imageStorage
 * (thumbnail). The handlers re-shape req.file into our API shape.
 */

const express = require("express");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");
const auth = require("../middleware/auth");
const { requireRoles } = require("../middleware/requireRoles");
const c = require("../controllers/courseController");

const router = express.Router();

// ── Optional auth: attach req.user if a valid token is present, otherwise
//    continue silently. Used for public reads that change shape when the
//    caller is signed in (e.g. draft visibility for the owning mentor).
function authOptional(req, res, next) {
    const header = req.header("Authorization");
    if (!header) return next();
    return auth(req, res, next);
}

// ── Multer + Cloudinary storage configs ──────────────────────────────────
const videoStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "skillswap/courses/videos",
        resource_type: "video",
        format: async () => "mp4", // request mp4 container; Cloudinary will transcode
        public_id: (req, file) => `v_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    },
});
const imageStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "skillswap/courses/thumbs",
        resource_type: "image",
        format: async () => "webp",
        public_id: (req, file) => `t_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        transformation: [{ width: 1280, height: 720, crop: "fill", quality: "auto:good" }],
    },
});

const uploadVideo = multer({
    storage: videoStorage,
    limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith("video/")) return cb(new Error("Only video files are allowed"));
        cb(null, true);
    },
});
const uploadImage = multer({
    storage: imageStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith("image/")) return cb(new Error("Only image files are allowed"));
        cb(null, true);
    },
});

// ── Public browse ────────────────────────────────────────────────────────
router.get("/", c.listCourses);
router.get("/categories", c.listCategories);
router.get("/:id", authOptional, c.getCourse);

// ── Mentor authoring ────────────────────────────────────────────────────
const mentor = [auth, requireRoles("mentor")];

router.post("/upload-video", mentor, uploadVideo.single("video"), c.uploadVideo);
router.post("/upload-thumbnail", mentor, uploadImage.single("thumbnail"), c.uploadThumbnail);

router.post("/", mentor, c.createCourse);
router.patch("/:id", mentor, c.updateCourse);
router.delete("/:id", mentor, c.deleteCourse);
router.post("/:id/publish", mentor, c.publishCourse);
router.post("/:id/unpublish", mentor, c.unpublishCourse);

router.post("/:id/lessons", mentor, c.addLesson);
router.patch("/:id/lessons/:lessonId", mentor, c.updateLesson);
router.delete("/:id/lessons/:lessonId", mentor, c.deleteLesson);
router.post("/:id/lessons/reorder", mentor, c.reorderLessons);

// ── Enrollment + progress ───────────────────────────────────────────────
router.post("/:id/enroll", auth, c.enroll);
router.get("/:id/enrollments", mentor, c.listEnrollments);
router.post(
    "/:id/lessons/:lessonId/complete",
    auth,
    c.completeLesson
);
router.post(
    "/:id/lessons/:lessonId/quiz",
    auth,
    c.submitQuiz
);

// ── Q&A ─────────────────────────────────────────────────────────────────
router.get("/:id/comments", c.listComments);
router.post("/:id/comments", auth, c.createComment);
router.patch("/comments/:commentId", auth, c.updateComment);
router.delete("/comments/:commentId", auth, c.deleteComment);

// ── Certificate ─────────────────────────────────────────────────────────
router.get("/:id/certificate", auth, c.getCertificate);

module.exports = router;

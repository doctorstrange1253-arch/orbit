const express = require("express");
const auth = require("../middleware/auth");
const { requireRoles } = require("../middleware/requireRoles");
const ctrl = require("../controllers/aiQuizController");

const router = express.Router();

// AI quiz generation + review queue — available to students (generates) and mentors (review)
router.use(auth);

// Generate AI quiz questions for a lesson (mentor trigger)
router.post("/courses/:courseId/lessons/:lessonId/quiz/generate", requireRoles("student", "mentor"), ctrl.generateAiQuiz);

// Approve / reject pending AI-generated questions
router.post("/ai-questions/:id/approve", requireRoles("mentor"), ctrl.approveQuestion);

// Pending review queue for mentors (unapproved AI questions awaiting review)
router.get("/ai-questions/pending", requireRoles("mentor"), ctrl.pendingReviewQueue);

module.exports = router;

/**
 * Enrollment.js — a user's progress through a Course.
 *
 * One row per (user, course) pair — unique index. The lesson-completion set
 * is stored as an array of Lesson._id references; progressPct is recomputed
 * on every mark-complete and used for both the UI progress bar and the
 * `course_completed` trigger (when 100% flips for the first time).
 *
 * Quiz attempts are pushed as a sub-array so the user can re-take quizzes
 * without losing history. The actual `gameologyService` XP credit happens
 * inside the controller (not on every save) so we have a single chokepoint.
 */
const mongoose = require("mongoose");

const QuizAttemptSchema = new mongoose.Schema({
    lessonId:    { type: mongoose.Schema.Types.ObjectId, required: true },
    score:       { type: Number, required: true, min: 0, max: 100 },
    passed:      { type: Boolean, required: true },
    attemptedAt: { type: Date, default: Date.now },
}, { _id: false });

const EnrollmentSchema = new mongoose.Schema({
    userId:             { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    courseId:           { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    enrolledAt:         { type: Date, default: Date.now },
    completedLessonIds: { type: [mongoose.Schema.Types.ObjectId], default: [] },
    progressPct:        { type: Number, default: 0, min: 0, max: 100 },
    lastLessonId:       { type: mongoose.Schema.Types.ObjectId, default: null },
    completedAt:        { type: Date, default: null },
    certificateId:      { type: mongoose.Schema.Types.ObjectId, ref: "Certificate", default: null },
    quizAttempts:       { type: [QuizAttemptSchema], default: [] },
}, { timestamps: true });

EnrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });
EnrollmentSchema.index({ userId: 1, completedAt: -1 });

module.exports = mongoose.models.Enrollment || mongoose.model("Enrollment", EnrollmentSchema);

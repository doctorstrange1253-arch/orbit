/**
 * Quiz.js — Standalone quiz question document for AI-generated content
 * with mentor review workflow.
 *
 * Distinct from the embedded QuizSchema inside Course.js (which stores
 * the published, student-facing quiz on a lesson). This collection holds
 * individual AI-generated questions that flow through the mentor review
 * queue before being approved and copied into the lesson's embedded quiz.
 */
const mongoose = require("mongoose");

const QuizSchema = new mongoose.Schema({
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    lessonId: { type: String, required: true }, // can be lesson _id or module _id
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    source: { type: String, enum: ["ai_ollama", "mentor_manual", "fallback_cache"], default: "ai_ollama" },
    isApproved: { type: Boolean, default: false, index: true },
    question: { type: String, required: true, maxlength: 500 },
    options: { type: [String], required: true, validate: (v) => Array.isArray(v) && v.length >= 2 && v.length <= 6 },
    correctIndex: { type: Number, required: true, min: 0, max: 5 },
    explanation: { type: String, default: "", maxlength: 1000 },
    coachCopy: { type: String, default: "", maxlength: 1200 },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    reviewComments: { type: [String], default: [] },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

QuizSchema.index({ courseId: 1, isApproved: 1 });
QuizSchema.index({ source: 1, isApproved: 1 });

module.exports = mongoose.model("Quiz", QuizSchema);
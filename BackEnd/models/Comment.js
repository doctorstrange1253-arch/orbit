/**
 * Comment.js — Q&A thread on a course (and optionally a specific lesson).
 *
 * Threading via `parentId`. `lessonId: null` means a course-level question
 * (vs a per-lesson one). Mentor of the course can mark a comment as the
 * accepted answer (`isAnswer: true`); only one answer per lesson-or-course
 * is enforced at the application layer (controllers), not via index.
 *
 * Upvote is a counter + a set of upvoter userIds so the toggle is O(1) and
 * idempotent per (user, comment).
 */
const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
    courseId:  { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    lessonId:  { type: mongoose.Schema.Types.ObjectId, default: null, index: true }, // null = course-level
    userId:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    parentId:  { type: mongoose.Schema.Types.ObjectId, ref: "Comment", default: null },
    text:      { type: String, required: true, maxlength: 2000 },
    upvotes:   { type: Number, default: 0 },
    upvotedBy: { type: [mongoose.Schema.Types.ObjectId], default: [] },
    isAnswer:  { type: Boolean, default: false },     // mentor marks the accepted answer
    isPinned:  { type: Boolean, default: false },     // mentor pins to top
}, { timestamps: true });

CommentSchema.index({ courseId: 1, lessonId: 1, createdAt: -1 });
CommentSchema.index({ courseId: 1, isPinned: -1, upvotes: -1, createdAt: -1 });

module.exports = mongoose.models.Comment || mongoose.model("Comment", CommentSchema);

/**
 * LessonConcept.js — a join row that says "this lesson touches this concept".
 *
 * One row per (lesson, concept) pair. `weight` is a mentor-defined
 * importance 1-10 (default 5). The user's mastery of a concept is
 * computed as the sum of `weight` across every lesson they completed
 * for that concept, capped at 10 (full mastery).
 *
 * Indexes:
 *   - (lessonId) so the CourseDetail page can list the concepts for
 *     a lesson in one read.
 *   - (conceptSlug, userId) so the Knowledge Graph can compute a
 *     user's mastery per concept in one read.
 *
 * NOTE: this table is the "what does the course teach" side. The
 * "what did the user touch" side is a per-user mastery record, kept
 * inline on User.gameology.conceptMastery (a small Map). We don't
 * need a separate `UserConcept` collection — the data is small and
 * the per-user aggregation is fast.
 */

const mongoose = require("mongoose");

const LessonConceptSchema = new mongoose.Schema({
    lessonId:   { type: mongoose.Schema.Types.ObjectId, required: true, refPath: "lessonModel", index: true },
    lessonModel:{ type: String, enum: ["Lesson", "Course.lessons"], default: "Course.lessons" },
    courseId:   { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    conceptSlug:{ type: String, required: true, lowercase: true, trim: true, index: true },
    weight:     { type: Number, default: 5, min: 1, max: 10 },
}, { timestamps: true });

LessonConceptSchema.index({ lessonId: 1, conceptSlug: 1 }, { unique: true });
LessonConceptSchema.index({ courseId: 1, conceptSlug: 1 });

module.exports = mongoose.models.LessonConcept || mongoose.model("LessonConcept", LessonConceptSchema);

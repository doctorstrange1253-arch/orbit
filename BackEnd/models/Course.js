/**
 * Course.js — a mentor-owned, self-paced video course.
 *
 * Lives 1:many from User. Embedded `lessons[]` keeps the most common read
 * (course detail page) to a single Mongo round-trip; lessons are owned by
 * exactly one course, so a separate collection buys nothing. Quiz questions
 * are embedded on the lesson for the same reason.
 *
 * Lifecycle:
 *   draft   → isPublished=false, not visible on /courses
 *   live    → isPublished=true, browsable, enrollable
 *   hidden  → isPublished=false again (mentor can re-publish)
 *
 * Price: `priceInr` is the ONE-TIME cost to enroll. Distinct from
 * MentorProfile.hourlyRateInr which is for 1-on-1 sessions. `0` = free.
 *
 * `enrollmentCount` and `rating` are denormalized counters so the catalog
 * page can sort without aggregation; recomputed on every Enrollment.create
 * and every course-completion rating.
 */
const mongoose = require("mongoose");

const ResourceSchema = new mongoose.Schema({
    label: { type: String, default: "" },
    url:   { type: String, required: true },
    kind:  { type: String, enum: ["link", "pdf", "code", "other"], default: "link" },
}, { _id: false });

const QuestionSchema = new mongoose.Schema({
    prompt:      { type: String, required: true, maxlength: 500 },
    options:     { type: [String], required: true, validate: (v) => Array.isArray(v) && v.length >= 2 && v.length <= 6 },
    correctIdx:  { type: Number, required: true, min: 0 },
    explanation: { type: String, default: "", maxlength: 1000 },
}, { _id: false });

const QuizSchema = new mongoose.Schema({
    passingScore: { type: Number, default: 70, min: 0, max: 100 },
    questions:    { type: [QuestionSchema], default: [] },
}, { _id: false });

const LessonSchema = new mongoose.Schema({
    title:        { type: String, required: true, trim: true, maxlength: 140 },
    description:  { type: String, default: "", maxlength: 2000 },
    videoUrl:     { type: String, default: "" },     // Cloudinary secure_url
    videoPublicId:{ type: String, default: "" },     // for deletes / re-encodes
    durationSec:  { type: Number, default: 0, min: 0 },
    order:        { type: Number, required: true, min: 1 },
    resources:    { type: [ResourceSchema], default: [] },
    quiz:         { type: QuizSchema, default: () => ({}) },
    isFree:       { type: Boolean, default: false }, // free preview even if course is paid
}, { _id: true });

const CourseSchema = new mongoose.Schema({
    mentorId:        { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title:           { type: String, required: true, trim: true, maxlength: 140 },
    subtitle:        { type: String, default: "", maxlength: 240 },
    description:     { type: String, default: "", maxlength: 5000 },
    category:        { type: String, default: "general", index: true }, // slug e.g. "design"
    level:           { type: String, enum: ["beginner", "intermediate", "advanced"], default: "beginner" },
    language:        { type: String, default: "English" },
    priceInr:        { type: Number, default: 0, min: 0 },
    thumbnail: {
        url:      { type: String, default: "" },
        publicId: { type: String, default: "" },
    },
    lessons:         { type: [LessonSchema], default: [] },
    isPublished:     { type: Boolean, default: false, index: true },
    publishedAt:     { type: Date, default: null },
    enrollmentCount: { type: Number, default: 0, min: 0 },
    rating: {
        average: { type: Number, default: 0, min: 0, max: 5 },
        count:   { type: Number, default: 0, min: 0 },
    },
    tags: { type: [String], default: [] },
}, { timestamps: true });

CourseSchema.index({ mentorId: 1, isPublished: 1, createdAt: -1 });
CourseSchema.index({ isPublished: 1, category: 1, "rating.average": -1 });
CourseSchema.index({ title: "text", subtitle: "text", description: "text", tags: "text" });

module.exports = mongoose.models.Course || mongoose.model("Course", CourseSchema);

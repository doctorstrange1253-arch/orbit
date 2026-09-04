/**
 * courseController.js — HTTP surface for the Course surface.
 *
 * Thin req→service→res handlers. All the heavy math (XP, Pact Score,
 * progress recompute, certificate mint) lives in the relevant service.
 * Ownership checks live here (not in routes) because they're per-record
 * and the policy is closer to the data.
 *
 * Surface:
 *   GET    /api/courses                  public browse
 *   GET    /api/courses/categories       public distinct
 *   GET    /api/courses/:id              public detail (mentor gets drafts too)
 *   POST   /api/courses                  mentor create
 *   PATCH  /api/courses/:id              mentor update (own only)
 *   DELETE /api/courses/:id              mentor delete (own only)
 *   POST   /api/courses/:id/publish      mentor publish (>=1 lesson with videoUrl)
 *   POST   /api/courses/:id/unpublish    mentor unpublish
 *   POST   /api/courses/upload-video          mentor upload (multipart)
 *   POST   /api/courses/upload-thumbnail      mentor upload (multipart)
 *   POST   /api/courses/:id/lessons            mentor add lesson
 *   PATCH  /api/courses/:id/lessons/:lessonId  mentor update lesson
 *   DELETE /api/courses/:id/lessons/:lessonId  mentor delete lesson
 *   POST   /api/courses/:id/lessons/reorder    mentor reorder
 *   POST   /api/courses/:id/enroll         student (or mentor) enroll
 *   GET    /api/courses/:id/enrollments    mentor (own only)
 *   POST   /api/courses/:id/lessons/:lessonId/complete  student mark complete
 *   POST   /api/courses/:id/lessons/:lessonId/quiz      student submit quiz
 *   GET    /api/courses/:id/comments        public list Q&A
 *   POST   /api/courses/:id/comments        auth: post Q&A
 *   PATCH  /api/courses/comments/:commentId  auth: edit / upvote / mark / pin
 *   DELETE /api/courses/comments/:commentId  auth: delete (author or course mentor)
 *   GET    /api/courses/:id/certificate     auth: get cert (requires completed)
 */

const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const Comment = require("../models/Comment");
const Certificate = require("../models/Certificate");
const User = require("../models/user");
const gameology = require("../services/gameologyService");
const pact = require("../services/pactService");
const stages = require("../services/courseStages");
const taxonomy = require("../data/taxonomy");
const moderation = require("../services/moderationService");
const { createNotification } = require("../services/notify");

// ── Helpers ──────────────────────────────────────────────────────────────
function publicShape(c, mentor, opts = {}) {
    if (!c) return null;
    const isOwner = !!opts.isOwner;
    return {
        _id: String(c._id),
        mentorId: String(c.mentorId),
        mentor: mentor ? { _id: String(mentor._id), name: mentor.name, avatar: mentor.avatar } : null,
        title: c.title,
        subtitle: c.subtitle,
        description: c.description,
        category: c.category,
        level: c.level,
        language: c.language,
        priceInr: c.priceInr,
        thumbnail: c.thumbnail,
        lessonsCount: (c.lessons || []).length,
        lessons: (c.lessons || []).map((l) => ({
            _id: String(l._id),
            title: l.title,
            description: l.description,
            videoUrl: l.videoUrl,
            durationSec: l.durationSec,
            order: l.order,
            isFree: l.isFree,
            isIntro: !!l.isIntro,
            isBoss: !!l.isBoss,
            promiseCopy: l.promiseCopy || "",
            whyCopy: l.whyCopy || "",
            rememberCopy: l.rememberCopy || "",
            bossChallenge: l.bossChallenge || "",
            hasQuiz: !!(l.quiz && l.quiz.questions && l.quiz.questions.length),
            quizQuestionCount: (l.quiz?.questions || []).length,
            quiz: {
                passingScore: l.quiz?.passingScore ?? 70,
                questions: (l.quiz?.questions || []).map((q) => {
                    const shaped = {
                        prompt: q.prompt,
                        options: q.options || [],
                        explanation: q.explanation || "",
                        coachCopy: q.coachCopy || "",
                    };
                    if (isOwner) shaped.correctIdx = q.correctIdx;
                    return shaped;
                }),
            },
            resources: l.resources || [],
            cuts: (l.cuts || []).map((c) => ({ fromSec: c.fromSec, toSec: c.toSec })),
        })),
        isPublished: c.isPublished,
        publishedAt: c.publishedAt,
        enrollmentCount: c.enrollmentCount,
        rating: c.rating,
        tags: c.tags || [],
        stages: stages.buildStages(c.lessons),
        completionXp: stages.courseCompletionXp((c.lessons || []).length),
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
    };
}

const LESSON_COPY_FIELDS = ["promiseCopy", "whyCopy", "rememberCopy", "bossChallenge"];

// A course's category is a taxonomy genre slug, so browse-by-genre and the
// Topic-level competition have real data to work with. "general" stays legal as
// the escape hatch for courses that predate the taxonomy.
function readCategory(value) {
    const slug = String(value ?? "").trim();
    if (!slug || slug === "general") return { ok: true, slug: "general" };
    if (taxonomy.genre(slug)) return { ok: true, slug };
    return { ok: false, slug: null };
}

function sanitizeCuts(input) {
    if (!Array.isArray(input)) return null;
    const ranges = input
        .map((c) => ({ fromSec: Number(c?.fromSec), toSec: Number(c?.toSec) }))
        .filter((c) => Number.isFinite(c.fromSec) && Number.isFinite(c.toSec) && c.fromSec >= 0 && c.toSec - c.fromSec > 0.05)
        .sort((a, b) => a.fromSec - b.fromSec);
    const merged = [];
    for (const r of ranges) {
        const last = merged[merged.length - 1];
        if (last && r.fromSec <= last.toSec + 0.05) last.toSec = Math.max(last.toSec, r.toSec);
        else merged.push({ fromSec: r.fromSec, toSec: r.toSec });
    }
    return merged.slice(0, 50);
}

function readLessonAuthoringFields(body, target) {
    if (typeof body.isBoss === "boolean") target.isBoss = body.isBoss;
    if (typeof body.isIntro === "boolean") {
        target.isIntro = body.isIntro;
        if (body.isIntro) target.isFree = true;
    }
    for (const key of LESSON_COPY_FIELDS) {
        if (typeof body[key] === "string") target[key] = body[key].slice(0, 1200);
    }
    if (body.cuts !== undefined) {
        const cuts = sanitizeCuts(body.cuts);
        if (cuts) target.cuts = cuts;
    }
    return target;
}

async function loadMentorPublic(mentorIds) {
    if (!mentorIds || !mentorIds.length) return new Map();
    const users = await User.find({ _id: { $in: mentorIds } })
        .select("name avatar")
        .lean();
    return new Map(users.map((u) => [String(u._id), u]));
}

async function ensureOwnership(course, userId) {
    return String(course.mentorId) === String(userId);
}

// ── Public browse ────────────────────────────────────────────────────────
exports.listCourses = async (req, res) => {
    try {
        const { category, level, q, sort = "newest", page = 1, limit = 24, mentor } = req.query;
        const filter = {};
        const mine = mentor === "me" && req.user?.id;
        if (mine) {
            filter.mentorId = req.user.id;
        } else if (mentor) {
            filter.mentorId = mentor;
            filter.isPublished = true;
        } else {
            filter.isPublished = true;
        }
        if (category) filter.category = category;
        if (level) filter.level = level;
        if (q) filter.$text = { $search: String(q) };

        let sortSpec;
        switch (sort) {
            case "rating": sortSpec = { "rating.average": -1, enrollmentCount: -1 }; break;
            case "popular": sortSpec = { enrollmentCount: -1, createdAt: -1 }; break;
            case "newest":
            default:        sortSpec = { createdAt: -1 };
        }

        const lim = Math.min(100, Math.max(1, parseInt(limit, 10) || 24));
        const skip = (Math.max(1, parseInt(page, 10) || 1) - 1) * lim;

        const [items, total] = await Promise.all([
            Course.find(filter).sort(sortSpec).skip(skip).limit(lim).lean(),
            Course.countDocuments(filter),
        ]);
        const byId = await loadMentorPublic([...new Set(items.map((c) => c.mentorId))]);
        return res.json({
            items: items.map((c) => publicShape(c, byId.get(String(c.mentorId)), { isOwner: !!mine })),
            total,
            page: parseInt(page, 10) || 1,
            limit: lim,
        });
    } catch (err) {
        console.error("listCourses:", err);
        res.status(500).json({ message: "Server error" });
    }
};

exports.listCategories = async (req, res) => {
    try {
        const cats = await Course.distinct("category", { isPublished: true });
        return res.json({ items: cats.filter(Boolean) });
    } catch (err) {
        console.error("listCategories:", err);
        res.status(500).json({ message: "Server error" });
    }
};

exports.getCourse = async (req, res) => {
    try {
        const c = await Course.findById(req.params.id).lean();
        if (!c) return res.status(404).json({ message: "Course not found" });
        if (!c.isPublished) {
            // Only the owning mentor can see a draft
            if (!req.user || !(await ensureOwnership(c, req.user.id))) {
                return res.status(404).json({ message: "Course not found" });
            }
        }
        const mentor = await User.findById(c.mentorId).select("name avatar headline").lean();
        const isOwner = !!req.user && (await ensureOwnership(c, req.user.id));
        return res.json(publicShape(c, mentor, { isOwner }));
    } catch (err) {
        console.error("getCourse:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// ── Mentor authoring ────────────────────────────────────────────────────
exports.createCourse = async (req, res) => {
    try {
        const meId = req.user.id;
        const body = req.body || {};
        const category = readCategory(body.category);
        if (!category.ok) {
            return res.status(400).json({ message: `Unknown genre '${body.category}'. Pick one from the taxonomy.`, code: "UNKNOWN_GENRE" });
        }
        const doc = await Course.create({
            mentorId: meId,
            title: (body.title || "Untitled course").slice(0, 140),
            subtitle: (body.subtitle || "").slice(0, 240),
            description: (body.description || "").slice(0, 5000),
            category: category.slug,
            level: ["beginner", "intermediate", "advanced"].includes(body.level) ? body.level : "beginner",
            language: body.language || "English",
            priceInr: Number.isFinite(body.priceInr) ? Math.max(0, body.priceInr) : 0,
            thumbnail: body.thumbnail || { url: "", publicId: "" },
            lessons: Array.isArray(body.lessons) ? body.lessons : [],
            tags: Array.isArray(body.tags) ? body.tags.slice(0, 20) : [],
        });
        return res.status(201).json({ _id: String(doc._id) });
    } catch (err) {
        console.error("createCourse:", err);
        res.status(500).json({ message: "Server error" });
    }
};

exports.updateCourse = async (req, res) => {
    try {
        const c = await Course.findById(req.params.id);
        if (!c) return res.status(404).json({ message: "Course not found" });
        if (!(await ensureOwnership(c, req.user.id))) return res.status(403).json({ message: "Not your course" });
        const body = req.body || {};
        if (body.title !== undefined) c.title = String(body.title).slice(0, 140);
        if (body.subtitle !== undefined) c.subtitle = String(body.subtitle).slice(0, 240);
        if (body.description !== undefined) c.description = String(body.description).slice(0, 5000);
        if (body.category !== undefined) {
            const category = readCategory(body.category);
            if (!category.ok) {
                return res.status(400).json({ message: `Unknown genre '${body.category}'. Pick one from the taxonomy.`, code: "UNKNOWN_GENRE" });
            }
            c.category = category.slug;
        }
        if (body.level !== undefined && ["beginner", "intermediate", "advanced"].includes(body.level)) c.level = body.level;
        if (body.language !== undefined) c.language = body.language;
        if (body.priceInr !== undefined) c.priceInr = Math.max(0, Number(body.priceInr) || 0);
        if (body.thumbnail !== undefined) c.thumbnail = body.thumbnail;
        if (Array.isArray(body.tags)) c.tags = body.tags.slice(0, 20);
        await c.save();
        return res.json({ ok: true });
    } catch (err) {
        console.error("updateCourse:", err);
        res.status(500).json({ message: "Server error" });
    }
};

exports.deleteCourse = async (req, res) => {
    try {
        const c = await Course.findById(req.params.id);
        if (!c) return res.status(404).json({ message: "Course not found" });
        if (!(await ensureOwnership(c, req.user.id))) return res.status(403).json({ message: "Not your course" });
        // Best-effort cascade (Cloudinary videos left for the cron to sweep).
        await Promise.all([
            Course.deleteOne({ _id: c._id }),
            Enrollment.deleteMany({ courseId: c._id }),
            Comment.deleteMany({ courseId: c._id }),
        ]);
        return res.json({ ok: true });
    } catch (err) {
        console.error("deleteCourse:", err);
        res.status(500).json({ message: "Server error" });
    }
};

exports.publishCourse = async (req, res) => {
    try {
        const c = await Course.findById(req.params.id);
        if (!c) return res.status(404).json({ message: "Course not found" });
        if (!(await ensureOwnership(c, req.user.id))) return res.status(403).json({ message: "Not your course" });
        const withVideo = (c.lessons || []).filter((l) => l.videoUrl).length;
        if (withVideo < 1) return res.status(409).json({ message: "Add at least one lesson with a video before publishing" });
        const wasAlreadyPublished = !!c.isPublished;

        let intro = (c.lessons || []).find((l) => l.isIntro && l.videoUrl);
        if (!intro && wasAlreadyPublished) {
            intro = (c.lessons || [])
                .filter((l) => l.videoUrl)
                .sort((a, b) => (a.order || 0) - (b.order || 0))[0];
            if (intro) intro.isIntro = true;
        }
        if (!intro) {
            return res.status(409).json({
                message: "Add an introduction video before publishing. Mark one lesson as the introduction — students watch it free to judge your teaching before they subscribe.",
                code: "INTRO_REQUIRED",
            });
        }
        if (!intro.isFree) intro.isFree = true;

        c.isPublished = true;
        c.publishedAt = c.publishedAt || new Date();
        await c.save();

        // V3 — Signal Flares. If this publish *answers* any active flares
        // (i.e. the course is the first in its constellation+genre), mark
        // them as responded and emit the "flare-landed" socket event so
        // the original students get the Planet Materialization animation.
        // We only fire on a fresh publish (not on a re-publish).
        if (!wasAlreadyPublished) {
            try {
                const flares = require("../services/signalFlareService");
                const io = req.app.get("io");
                const { userIds } = await flares.onCoursePublished(io, c);
                if (io) {
                    for (const uid of userIds) {
                        io.to(`user_${uid}`).emit("signal-flare:responded", {
                            courseId: String(c._id),
                            courseTitle: c.title,
                            constellation: c.constellation || "general",
                            genre: c.category || "general",
                        });
                    }
                }
            } catch (e) {
                console.warn("[courses] flare response failed:", e.message);
            }
        }

        return res.json({ ok: true, isPublished: true });
    } catch (err) {
        console.error("publishCourse:", err);
        res.status(500).json({ message: "Server error" });
    }
};

exports.unpublishCourse = async (req, res) => {
    try {
        const c = await Course.findById(req.params.id);
        if (!c) return res.status(404).json({ message: "Course not found" });
        if (!(await ensureOwnership(c, req.user.id))) return res.status(403).json({ message: "Not your course" });
        c.isPublished = false;
        await c.save();
        return res.json({ ok: true, isPublished: false });
    } catch (err) {
        console.error("unpublishCourse:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// ── Uploads ──────────────────────────────────────────────────────────────
// The actual multer middleware is mounted in the router. These handlers just
// reshape the Cloudinary file descriptor into our API.
exports.uploadVideo = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: "No video file" });
        return res.json({
            url: req.file.path || req.file.secure_url,
            publicId: req.file.filename || req.file.public_id,
            durationSec: req.file.duration ? Math.round(req.file.duration) : 0,
            format: req.file.format || "",
            bytes: req.file.bytes || 0,
        });
    } catch (err) {
        console.error("uploadVideo:", err);
        res.status(500).json({ message: "Server error" });
    }
};

exports.uploadThumbnail = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: "No thumbnail file" });
        return res.json({
            url: req.file.path || req.file.secure_url,
            publicId: req.file.filename || req.file.public_id,
        });
    } catch (err) {
        console.error("uploadThumbnail:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// A lesson's own words are the only text a mentor can publish unreviewed, so
// every write is scanned and anything that trips the filter opens a review in
// the mentor's own inbox. Best-effort: moderation never blocks authoring.
function scanLessonBestEffort(course, lesson) {
    try {
        const hits = moderation.scanLesson(lesson);
        if (!hits.length) return;
        moderation
            .recordReview(course.mentorId, { courseId: course._id, lessonId: lesson._id, hits })
            .catch(() => {});
    } catch (_scanErr) { void _scanErr; }
}

// ── Lessons (nested) ────────────────────────────────────────────────────
exports.addLesson = async (req, res) => {
    try {
        const c = await Course.findById(req.params.id);
        if (!c) return res.status(404).json({ message: "Course not found" });
        if (!(await ensureOwnership(c, req.user.id))) return res.status(403).json({ message: "Not your course" });
        const body = req.body || {};
        const order = (c.lessons?.length || 0) + 1;
        c.lessons.push(readLessonAuthoringFields(body, {
            title: (body.title || "Untitled lesson").slice(0, 140),
            description: (body.description || "").slice(0, 2000),
            videoUrl: body.videoUrl || "",
            videoPublicId: body.videoPublicId || "",
            durationSec: Math.max(0, Number(body.durationSec) || 0),
            order,
            resources: Array.isArray(body.resources) ? body.resources : [],
            quiz: body.quiz || {},
            isFree: !!body.isFree,
        }));
        await c.save();
        const added = c.lessons[c.lessons.length - 1];
        scanLessonBestEffort(c, added);
        return res.status(201).json({ _id: String(added._id), order: added.order });
    } catch (err) {
        console.error("addLesson:", err);
        res.status(500).json({ message: "Server error" });
    }
};

exports.updateLesson = async (req, res) => {
    try {
        const c = await Course.findById(req.params.id);
        if (!c) return res.status(404).json({ message: "Course not found" });
        if (!(await ensureOwnership(c, req.user.id))) return res.status(403).json({ message: "Not your course" });
        const lesson = c.lessons.id(req.params.lessonId);
        if (!lesson) return res.status(404).json({ message: "Lesson not found" });
        const body = req.body || {};
        if (body.title !== undefined) lesson.title = String(body.title).slice(0, 140);
        if (body.description !== undefined) lesson.description = String(body.description).slice(0, 2000);
        if (body.videoUrl !== undefined) lesson.videoUrl = body.videoUrl;
        if (body.videoPublicId !== undefined) lesson.videoPublicId = body.videoPublicId;
        if (body.durationSec !== undefined) lesson.durationSec = Math.max(0, Number(body.durationSec) || 0);
        if (body.resources !== undefined) lesson.resources = body.resources;
        if (body.quiz !== undefined) {
            const incoming = body.quiz || {};
            if (incoming.passingScore !== undefined) {
                lesson.quiz.passingScore = Math.min(100, Math.max(0, Number(incoming.passingScore) || 0));
            }
            if (Array.isArray(incoming.questions)) {
                const hasExisting = (lesson.quiz?.questions || []).length > 0;
                const wouldWipe = incoming.questions.length === 0 && hasExisting;
                if (!wouldWipe || body.clearQuiz === true) {
                    lesson.quiz.questions = incoming.questions;
                }
            }
        }
        if (body.isFree !== undefined) lesson.isFree = !!body.isFree;
        readLessonAuthoringFields(body, lesson);
        await c.save();
        scanLessonBestEffort(c, lesson);
        return res.json({ ok: true });
    } catch (err) {
        console.error("updateLesson:", err);
        res.status(500).json({ message: "Server error" });
    }
};

exports.deleteLesson = async (req, res) => {
    try {
        const c = await Course.findById(req.params.id);
        if (!c) return res.status(404).json({ message: "Course not found" });
        if (!(await ensureOwnership(c, req.user.id))) return res.status(403).json({ message: "Not your course" });
        const lesson = c.lessons.id(req.params.lessonId);
        if (!lesson) return res.status(404).json({ message: "Lesson not found" });
        lesson.deleteOne();
        // Re-sequence `order` to keep it tight (1..N)
        c.lessons.forEach((l, i) => { l.order = i + 1; });
        await c.save();
        return res.json({ ok: true });
    } catch (err) {
        console.error("deleteLesson:", err);
        res.status(500).json({ message: "Server error" });
    }
};

exports.reorderLessons = async (req, res) => {
    try {
        const c = await Course.findById(req.params.id);
        if (!c) return res.status(404).json({ message: "Course not found" });
        if (!(await ensureOwnership(c, req.user.id))) return res.status(403).json({ message: "Not your course" });
        const order = Array.isArray(req.body?.order) ? req.body.order : [];
        const idToOrder = new Map(order.map((id, i) => [String(id), i + 1]));
        c.lessons.forEach((l) => {
            const o = idToOrder.get(String(l._id));
            if (o) l.order = o;
        });
        c.lessons.sort((a, b) => a.order - b.order);
        await c.save();
        return res.json({ ok: true });
    } catch (err) {
        console.error("reorderLessons:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// ── Enrollment + progress ───────────────────────────────────────────────
exports.enroll = async (req, res) => {
    try {
        const c = await Course.findById(req.params.id).select("_id isPublished lessons").lean();
        if (!c) return res.status(404).json({ message: "Course not found" });
        if (!c.isPublished) return res.status(409).json({ message: "Course is not open for enrollment" });

        // Idempotent: if already enrolled, return the existing row
        const existing = await Enrollment.findOne({ userId: req.user.id, courseId: c._id }).lean();
        if (existing) {
            return res.json({ ok: true, alreadyEnrolled: true, enrollment: existing });
        }
        const enrollment = await Enrollment.create({
            userId: req.user.id,
            courseId: c._id,
            completedLessonIds: [],
            progressPct: 0,
        });
        await Course.updateOne({ _id: c._id }, { $inc: { enrollmentCount: 1 } });
        return res.status(201).json({ ok: true, enrollment });
    } catch (err) {
        console.error("enroll:", err);
        res.status(500).json({ message: "Server error" });
    }
};

exports.enrollmentsForMe = async (req, res) => {
    try {
        const meId = req.user.id;
        const items = await Enrollment.find({ userId: meId })
            .sort({ updatedAt: -1 })
            .limit(200)
            .lean();
        if (!items.length) return res.json({ items: [] });

        const courseIds = [...new Set(items.map((e) => String(e.courseId)))];
        const courses = await Course.find({ _id: { $in: courseIds } })
            .select("title subtitle thumbnail mentorId lessons isPublished priceInr category level")
            .lean();
        const byCourse = new Map(courses.map((c) => [String(c._id), c]));
        const mentors = await loadMentorPublic([...new Set(courses.map((c) => c.mentorId))]);

        return res.json({
            items: items.map((e) => {
                const c = byCourse.get(String(e.courseId));
                const mentor = c ? mentors.get(String(c.mentorId)) : null;
                const lessons = (c?.lessons || []).map((l) => ({
                    _id: String(l._id),
                    title: l.title,
                    order: l.order,
                    isFree: l.isFree,
                    isBoss: !!l.isBoss,
                }));
                return {
                    _id: String(e._id),
                    courseId: String(e.courseId),
                    course: c
                        ? {
                            _id: String(c._id),
                            title: c.title,
                            subtitle: c.subtitle,
                            thumbnail: c.thumbnail,
                            category: c.category,
                            level: c.level,
                            priceInr: c.priceInr,
                            isPublished: c.isPublished,
                            lessonsCount: lessons.length,
                            lessons,
                            stages: stages.buildStages(c.lessons),
                            completionXp: stages.courseCompletionXp((c.lessons || []).length),
                            mentor: mentor
                                ? { _id: String(mentor._id), name: mentor.name, avatar: mentor.avatar }
                                : null,
                        }
                        : null,
                    progressPct: e.progressPct || 0,
                    completedLessonIds: (e.completedLessonIds || []).map(String),
                    lastLessonId: e.lastLessonId ? String(e.lastLessonId) : null,
                    completedAt: e.completedAt || null,
                    certificateId: e.certificateId ? String(e.certificateId) : null,
                    enrolledAt: e.enrolledAt,
                    updatedAt: e.updatedAt,
                };
            }).filter((e) => e.course),
        });
    } catch (err) {
        console.error("enrollmentsForMe:", err);
        res.status(500).json({ message: "Server error" });
    }
};

exports.myEnrollmentForCourse = async (req, res) => {
    try {
        const e = await Enrollment.findOne({ userId: req.user.id, courseId: req.params.id }).lean();
        if (!e) return res.status(404).json({ message: "Not enrolled" });
        return res.json({
            _id: String(e._id),
            courseId: String(e.courseId),
            progressPct: e.progressPct || 0,
            completedLessonIds: (e.completedLessonIds || []).map(String),
            lastLessonId: e.lastLessonId ? String(e.lastLessonId) : null,
            completedAt: e.completedAt || null,
            certificateId: e.certificateId ? String(e.certificateId) : null,
            quizAttempts: e.quizAttempts || [],
            enrolledAt: e.enrolledAt,
            updatedAt: e.updatedAt,
        });
    } catch (err) {
        console.error("myEnrollmentForCourse:", err);
        res.status(500).json({ message: "Server error" });
    }
};

exports.mentorLearners = async (req, res) => {
    try {
        const meId = req.user.id;
        const myCourses = await Course.find({ mentorId: meId })
            .select("title lessons")
            .lean();
        if (!myCourses.length) return res.json({ items: [], courses: [] });

        const courseIds = myCourses.map((c) => c._id);
        const enrollments = await Enrollment.find({ courseId: { $in: courseIds } })
            .sort({ updatedAt: -1 })
            .limit(2000)
            .lean();
        if (!enrollments.length) {
            return res.json({
                items: [],
                courses: myCourses.map((c) => ({
                    _id: String(c._id),
                    title: c.title,
                    lessonsCount: (c.lessons || []).length,
                    enrolled: 0,
                    started: 0,
                    halfway: 0,
                    finished: 0,
                    dropOff: (c.lessons || []).map((l) => ({
                        lessonId: String(l._id), title: l.title, order: l.order, stalled: 0,
                    })),
                })),
            });
        }

        const userIds = [...new Set(enrollments.map((e) => String(e.userId)))];
        const users = await User.find({ _id: { $in: userIds } }).select("name avatar").lean();
        const byUser = new Map(users.map((u) => [String(u._id), u]));
        const byCourse = new Map(myCourses.map((c) => [String(c._id), c]));

        const learners = new Map();
        for (const e of enrollments) {
            const uid = String(e.userId);
            const course = byCourse.get(String(e.courseId));
            if (!course) continue;
            const u = byUser.get(uid);
            if (!learners.has(uid)) {
                learners.set(uid, {
                    userId: uid,
                    name: u?.name || "Learner",
                    avatar: u?.avatar || "",
                    courses: [],
                    progressSum: 0,
                    finished: 0,
                    lastActiveMs: 0,
                });
            }
            const row = learners.get(uid);
            row.courses.push({
                _id: String(course._id),
                title: course.title,
                progressPct: e.progressPct || 0,
                completedAt: e.completedAt || null,
            });
            row.progressSum += e.progressPct || 0;
            if (e.completedAt) row.finished += 1;
            const seen = new Date(e.updatedAt || e.enrolledAt || 0).getTime();
            if (seen > row.lastActiveMs) row.lastActiveMs = seen;
        }

        const courseStats = myCourses.map((c) => {
            const lessons = (c.lessons || []).slice().sort((a, b) => (a.order || 0) - (b.order || 0));
            const rows = enrollments.filter((e) => String(e.courseId) === String(c._id));
            const stalled = new Map(lessons.map((l) => [String(l._id), 0]));
            for (const e of rows) {
                if (e.completedAt) continue;
                const done = new Set((e.completedLessonIds || []).map(String));
                let furthest = null;
                for (const l of lessons) {
                    if (done.has(String(l._id))) furthest = String(l._id);
                }
                if (furthest && stalled.has(furthest)) stalled.set(furthest, stalled.get(furthest) + 1);
            }
            return {
                _id: String(c._id),
                title: c.title,
                lessonsCount: lessons.length,
                enrolled: rows.length,
                started: rows.filter((e) => (e.progressPct || 0) > 0).length,
                halfway: rows.filter((e) => (e.progressPct || 0) >= 50).length,
                finished: rows.filter((e) => !!e.completedAt).length,
                dropOff: lessons.map((l) => ({
                    lessonId: String(l._id),
                    title: l.title,
                    order: l.order,
                    stalled: stalled.get(String(l._id)) || 0,
                })),
            };
        });

        return res.json({
            items: Array.from(learners.values())
                .map((r) => ({
                    userId: r.userId,
                    name: r.name,
                    avatar: r.avatar,
                    courses: r.courses,
                    courseCount: r.courses.length,
                    avgProgressPct: r.courses.length ? Math.round(r.progressSum / r.courses.length) : 0,
                    finished: r.finished,
                    lastActiveMs: r.lastActiveMs,
                }))
                .sort((a, b) => b.lastActiveMs - a.lastActiveMs),
            courses: courseStats,
        });
    } catch (err) {
        console.error("mentorLearners:", err);
        res.status(500).json({ message: "Server error" });
    }
};

exports.listEnrollments = async (req, res) => {
    try {
        const c = await Course.findById(req.params.id).select("mentorId").lean();
        if (!c) return res.status(404).json({ message: "Course not found" });
        if (!(await ensureOwnership(c, req.user.id))) return res.status(403).json({ message: "Not your course" });
        const items = await Enrollment.find({ courseId: c._id })
            .sort({ enrolledAt: -1 })
            .limit(200)
            .lean();
        const userIds = [...new Set(items.map((e) => String(e.userId)))];
        const users = await User.find({ _id: { $in: userIds } }).select("name avatar").lean();
        const byId = new Map(users.map((u) => [String(u._id), u]));
        return res.json({
            items: items.map((e) => ({
                ...e,
                _id: String(e._id),
                user: byId.get(String(e.userId)) || { name: "Learner" },
            })),
        });
    } catch (err) {
        console.error("listEnrollments:", err);
        res.status(500).json({ message: "Server error" });
    }
};

exports.completeLesson = async (req, res) => {
    try {
        const meId = req.user.id;
        const { id, lessonId } = req.params;
        const c = await Course.findById(id).select("_id title isPublished lessons mentorId").lean();
        if (!c || !c.isPublished) return res.status(404).json({ message: "Course not found" });
        const lesson = (c.lessons || []).find((l) => String(l._id) === String(lessonId));
        if (!lesson) return res.status(404).json({ message: "Lesson not found" });

        // Upsert enrollment
        const enrollment = await Enrollment.findOneAndUpdate(
            { userId: meId, courseId: c._id },
            {
                $setOnInsert: { userId: meId, courseId: c._id, enrolledAt: new Date() },
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        const beforeIds = (enrollment.completedLessonIds || []).map(String);
        const wasComplete = beforeIds.some((lid) => lid === String(lesson._id));
        if (!wasComplete) {
            enrollment.completedLessonIds.push(lesson._id);
        }
        enrollment.lastLessonId = lesson._id;
        const totalLessons = c.lessons.length || 1;
        enrollment.progressPct = Math.round((enrollment.completedLessonIds.length / totalLessons) * 100);

        let justCompleted = false;
        if (enrollment.progressPct >= 100 && !enrollment.completedAt) {
            enrollment.completedAt = new Date();
            justCompleted = true;
        }
        await enrollment.save();

        // Gameology: lesson_completed XP (only first time per lesson)
        if (!wasComplete) {
            await gameology.awardXp(meId, "lesson_completed", { courseId: String(c._id), lessonId: String(lesson._id) });
            // V3 — Knowledge Graph: every lesson completion records a
            // "touch" on each concept the lesson references. Idempotent
            // re-watches re-apply the weight (legitimate refreshers).
            // The KG service is best-effort; a failure here doesn't
            // break the lesson completion.
            try {
                const kg = require("../services/knowledgeGraphService");
                const touch = await kg.recordTouch(meId, lesson._id, c._id);
                if (touch.touched.length > 0) {
                    await gameology.awardXp(meId, "concept_touched", {
                        courseId: String(c._id),
                        lessonId: String(lesson._id),
                        concepts: touch.touched.map((t) => t.slug),
                    });
                }
            } catch { /* best-effort */ }
        }

        // V3 — Boss Level: tripled XP + dedicated achievement check.
        if (lesson.isBoss && !wasComplete) {
            try {
                await gameology.awardXp(meId, "boss_level_passed", {
                    courseId: String(c._id),
                    lessonId: String(lesson._id),
                });
            } catch { /* best-effort */ }
        }

        const courseStages = stages.buildStages(c.lessons);
        const clearedStages = wasComplete
            ? []
            : stages.stagesJustCleared(
                courseStages,
                beforeIds,
                (enrollment.completedLessonIds || []).map(String),
            );

        for (const stage of clearedStages) {
            if (stage.isFinale) continue;
            try {
                await gameology.awardXp(meId, "stage_cleared", {
                    courseId: String(c._id),
                    stage: stage.name,
                    stageNumber: stage.number,
                    xpOverride: stage.xpReward,
                });
            } catch { /* best-effort */ }
        }

        // On 100% completion: course_completed XP + mint certificate
        if (justCompleted) {
            await gameology.awardXp(meId, "course_completed", {
                courseId: String(c._id),
                videoCount: c.lessons.length,
                xpOverride: stages.courseCompletionXp(c.lessons.length),
            });
            // Mentor side: pact score bump for triggering a completion
            await pact.recordCourseCompletion(c.mentorId, { courseId: String(c._id) });

            try {
                const cert = await Certificate.create({
                    userId: meId,
                    courseId: c._id,
                    certId: Certificate.sign(meId, c._id, enrollment.completedAt),
                    issuedAt: enrollment.completedAt,
                    snapshot: {
                        courseTitle: c.title,
                        mentorName: "",
                        learnerName: "",
                    },
                });
                enrollment.certificateId = cert._id;
                await enrollment.save();

                // Backfill snapshot names (best-effort)
                const [mentor, learner] = await Promise.all([
                    User.findById(c.mentorId).select("name").lean(),
                    User.findById(meId).select("name").lean(),
                ]);
                cert.snapshot.mentorName = mentor?.name || "";
                cert.snapshot.learnerName = learner?.name || "";
                await cert.save();

                // Notify the learner
                const io = req.app.get("io");
                createNotification(io, meId, {
                    type: "course_completed",
                    title: "Course complete!",
                    body: `You finished "${c.title}". Your certificate is ready.`,
                    data: { link: `/courses/${c._id}/certificate/${cert.certId}`, courseId: String(c._id), certId: cert.certId },
                }).catch(() => {});
            } catch (certErr) {
                console.error("certificate mint failed:", certErr.message);
            }
        }

        return res.json({
            ok: true,
            progressPct: enrollment.progressPct,
            completedLessonIds: enrollment.completedLessonIds.map(String),
            justCompleted,
            certificateId: enrollment.certificateId ? String(enrollment.certificateId) : null,
            stagesCleared: clearedStages.map((s) => ({
                number: s.number,
                name: s.name,
                blurb: s.blurb,
                isFinale: s.isFinale,
                xpReward: s.xpReward,
                lessonCount: s.lessonCount,
            })),
        });
    } catch (err) {
        console.error("completeLesson:", err);
        res.status(500).json({ message: "Server error" });
    }
};

exports.submitQuiz = async (req, res) => {
    try {
        const meId = req.user.id;
        const { id, lessonId } = req.params;
        const { answers } = req.body || {}; // array of indexes
        if (!Array.isArray(answers)) return res.status(400).json({ message: "answers must be an array" });

        const c = await Course.findById(id).select("_id isPublished lessons mentorId").lean();
        if (!c || !c.isPublished) return res.status(404).json({ message: "Course not found" });
        const lesson = (c.lessons || []).find((l) => String(l._id) === String(lessonId));
        if (!lesson) return res.status(404).json({ message: "Lesson not found" });

        const questions = lesson.quiz?.questions || [];
        if (!questions.length) return res.status(409).json({ message: "Lesson has no quiz" });

        let correct = 0;
        questions.forEach((q, i) => {
            if (answers[i] === q.correctIdx) correct += 1;
        });
        const score = Math.round((correct / questions.length) * 100);
        const passingScore = lesson.quiz?.passingScore || 70;
        const passed = score >= passingScore;
        const perfect = score === 100;

        // Ensure enrollment
        const enrollment = await Enrollment.findOneAndUpdate(
            { userId: meId, courseId: c._id },
            { $setOnInsert: { userId: meId, courseId: c._id, enrolledAt: new Date() } },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        const firstAttempt = (enrollment.quizAttempts || []).filter((a) => String(a.lessonId) === String(lesson._id)).length === 0;
        enrollment.quizAttempts.push({ lessonId: lesson._id, score, passed, attemptedAt: new Date() });
        await enrollment.save();

        if (passed) {
            await gameology.awardXp(meId, "quiz_passed", { courseId: String(c._id), lessonId: String(lesson._id) });
            if (perfect && firstAttempt) {
                await gameology.awardXp(meId, "quiz_perfect", { perfect: true, courseId: String(c._id), lessonId: String(lesson._id) });
            }
        }

        return res.json({
            score,
            passed,
            perfect,
            correct,
            total: questions.length,
            firstAttempt,
        });
    } catch (err) {
        console.error("submitQuiz:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// ── Q&A ─────────────────────────────────────────────────────────────────
exports.listComments = async (req, res) => {
    try {
        const { id } = req.params;
        const { lessonId } = req.query;
        const filter = { courseId: id };
        if (lessonId) filter.lessonId = lessonId;
        const items = await Comment.find(filter)
            .sort({ isPinned: -1, upvotes: -1, createdAt: -1 })
            .limit(200)
            .lean();
        const userIds = [...new Set(items.map((c) => String(c.userId)))];
        const users = await User.find({ _id: { $in: userIds } }).select("name avatar").lean();
        const byId = new Map(users.map((u) => [String(u._id), u]));
        return res.json({
            items: items.map((c) => ({
                ...c,
                _id: String(c._id),
                user: byId.get(String(c.userId)) || { name: "User" },
            })),
        });
    } catch (err) {
        console.error("listComments:", err);
        res.status(500).json({ message: "Server error" });
    }
};

exports.createComment = async (req, res) => {
    try {
        const meId = req.user.id;
        const { id } = req.params;
        const body = req.body || {};
        if (!body.text || !String(body.text).trim()) return res.status(400).json({ message: "text is required" });
        const c = await Course.findById(id).select("_id isPublished mentorId").lean();
        if (!c || !c.isPublished) return res.status(404).json({ message: "Course not found" });

        const comment = await Comment.create({
            courseId: c._id,
            lessonId: body.lessonId || null,
            userId: meId,
            parentId: body.parentId || null,
            text: String(body.text).slice(0, 2000),
        });

        // Gameology: peer_help_posted (+5 XP)
        await gameology.awardXp(meId, "peer_help_posted", { courseId: String(c._id), commentId: String(comment._id) });

        return res.status(201).json({ _id: String(comment._id) });
    } catch (err) {
        console.error("createComment:", err);
        res.status(500).json({ message: "Server error" });
    }
};

exports.updateComment = async (req, res) => {
    try {
        const meId = req.user.id;
        const { commentId } = req.params;
        const body = req.body || {};
        const c = await Comment.findById(commentId).lean();
        if (!c) return res.status(404).json({ message: "Comment not found" });
        const course = await Course.findById(c.courseId).select("mentorId").lean();
        if (!course) return res.status(404).json({ message: "Course not found" });
        const isAuthor = String(c.userId) === String(meId);
        const isCourseMentor = String(course.mentorId) === String(meId);
        if (!isAuthor && !isCourseMentor) return res.status(403).json({ message: "Not allowed" });

        const update = {};
        if (body.text !== undefined) {
            if (!isAuthor) return res.status(403).json({ message: "Only the author can edit text" });
            update.text = String(body.text).slice(0, 2000);
        }
        if (body.isAnswer !== undefined) {
            if (!isCourseMentor) return res.status(403).json({ message: "Only the course mentor can mark the answer" });
            update.isAnswer = !!body.isAnswer;
            // When a mentor marks an answer, bump their Pact score (one-time per comment)
            if (update.isAnswer) {
                await pact.recordAnswerMarkedCorrect(course.mentorId, { courseId: String(c.courseId), commentId: String(c._id) });
            }
        }
        if (body.isPinned !== undefined) {
            if (!isCourseMentor) return res.status(403).json({ message: "Only the course mentor can pin" });
            update.isPinned = !!body.isPinned;
        }
        if (body.toggleUpvote === true) {
            const upvoted = (c.upvotedBy || []).map(String).includes(String(meId));
            if (upvoted) {
                update.$pull = { upvotedBy: meId };
                update.$inc = { upvotes: -1 };
            } else {
                update.$addToSet = { upvotedBy: meId };
                update.$inc = { upvotes: 1 };
            }
        }
        const op = Object.keys(update).some((k) => k.startsWith("$"))
            ? update
            : { $set: update };
        await Comment.updateOne({ _id: commentId }, op);
        return res.json({ ok: true });
    } catch (err) {
        console.error("updateComment:", err);
        res.status(500).json({ message: "Server error" });
    }
};

exports.deleteComment = async (req, res) => {
    try {
        const meId = req.user.id;
        const { commentId } = req.params;
        const c = await Comment.findById(commentId).lean();
        if (!c) return res.status(404).json({ message: "Comment not found" });
        const course = await Course.findById(c.courseId).select("mentorId").lean();
        if (!course) return res.status(404).json({ message: "Course not found" });
        const isAuthor = String(c.userId) === String(meId);
        const isCourseMentor = String(course.mentorId) === String(meId);
        if (!isAuthor && !isCourseMentor) return res.status(403).json({ message: "Not allowed" });
        await Comment.deleteOne({ _id: commentId });
        return res.json({ ok: true });
    } catch (err) {
        console.error("deleteComment:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// V3 — Copyright layer 3: signed URL streaming. The student hits this
// endpoint to get a short-lived signed Cloudinary URL + a per-session
// `viewKey`. The player uses the viewKey to render the forensic + visible
// watermarks. Free lessons still get a signed URL (5-min TTL), but
// without the watermark layer.
exports.signLessonStream = async (req, res) => {
    try {
        const meId = req.user.id;
        const { id, lessonId } = req.params;
        // Verify the user is enrolled (or the lesson is free).
        const c = await Course.findById(id).select("lessons isPublished").lean();
        if (!c || !c.isPublished) return res.status(404).json({ message: "Course not found" });
        const lesson = (c.lessons || []).find((l) => String(l._id) === String(lessonId));
        if (!lesson) return res.status(404).json({ message: "Lesson not found" });

        // Enforce enrollment unless the lesson is free.
        if (!lesson.isFree) {
            const enrollment = await Enrollment.findOne({ userId: meId, courseId: id }).lean();
            if (!enrollment) return res.status(403).json({ message: "Enroll to watch this lesson" });
        }

        if (!lesson.videoUrl) return res.status(404).json({ message: "No video for this lesson" });

        const streamSign = require("../services/streamSignService");
        const signed = streamSign.sign({
            userId: meId,
            lessonId,
            videoUrl: lesson.videoUrl,
            videoPublicId: lesson.videoPublicId,
        });
        return res.json(signed);
    } catch (err) {
        console.error("signLessonStream:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// ── Certificate retrieval ───────────────────────────────────────────────
exports.getCertificate = async (req, res) => {
    try {
        const meId = req.user.id;
        const { id } = req.params;
        const enrollment = await Enrollment.findOne({ userId: meId, courseId: id }).lean();
        if (!enrollment || !enrollment.completedAt) return res.status(409).json({ message: "Course not completed yet" });
        const cert = await Certificate.findById(enrollment.certificateId).lean();
        if (!cert) return res.status(404).json({ message: "Certificate not found" });
        const course = await Course.findById(id).select("title mentorId lessons").lean();
        const mentor = course ? await User.findById(course.mentorId).select("name avatar").lean() : null;
        const learner = await User.findById(meId).select("name avatar").lean();
        return res.json({
            certificate: cert,
            course: course ? { _id: String(course._id), title: course.title, lessonsCount: (course.lessons || []).length } : null,
            mentor,
            learner,
        });
    } catch (err) {
        console.error("getCertificate:", err);
        res.status(500).json({ message: "Server error" });
    }
};

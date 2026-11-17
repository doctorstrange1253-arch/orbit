/**
 * aiQuizController.js — Ollama RAG Quiz Generation endpoint with mentor review queue integration
 */
const Course = require("../models/course");
const Quiz = require("../models/quiz");
const { generateQuizViaOllama } = require("../services/ollamaService");

/**
 * POST /api/courses/:id/lessons/:id/quiz/generate
 * Mentor triggers AI quiz generation for a lesson;
 * questions flow through mentor review approval before publishing to students.
 */
exports.generateAiQuiz = async (req, res) => {
    try {
        const { courseId, lessonId } = req.params;
        const { autoApprove = false } = req.body || {};

        if (!courseId || !lessonId) {
            return res.status(400).json({ message: "courseId and lessonId are required." });
        }

        // Fetch course + lesson
        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ message: "Course not found." });

        const lesson = await Course.findOne({ _id: lessonId, "modules._id": lessonId })
            .populate("modules", ["_id", "title", "description", "topic"])
            .or([{ "modules._id": lessonId }, { _id: lessonId }]);

        if (!lesson) return res.status(404).json({ message: "Lesson not found in this course." });

        const module = (lesson && lesson.modules && (lesson.modules[0] || lesson.modules)) || { title: lesson.title };
        const quizContext = module ? `Lesson: ${module.title}${module.description ? "\nDescription: " + module.description : ""}` : `Lesson: ${lesson.title}`;

        const result = await generateQuizViaOllama({
            topic: module ? module.topic : null,
            lessonTitle: module ? module.title : null,
            lessonDescription: module ? module.description : null,
            contextText: quizContext
        });

        // Stage 1: Create pending AI questions for review
        const aiQuestions = [];
        for (const q of result.questions) {
            const questionDoc = await Quiz.create({
                courseId,
                lessonId,
                authorId: req.user._id,
                source: "ai_ollama",
                isApproved: autoApprove, // Auto-approve when flag is true (Elite/Mentor tier)
                question: q.question,
                options: JSON.stringify(q.options),
                correctIndex: q.correctIndex,
                explanation: q.explanation,
                reviewedBy: autoApprove ? req.user._id : null,
                reviews: [],
                createdAt: new Date(),
                updatedAt: new Date()
            });
            aiQuestions.push({
                _id: questionDoc._id.toString(),
                question: q.question,
                approved: questionDoc.isApproved
            });
        }

        return res.status(201).json({ ok: true, published: aiQuestions.filter(a => a.approved).length, count: result.questions.length });
    } catch (err) {
        console.error("[generateAiQuiz] error:", err);
        return res.status(500).json({ message: "Failed to generate AI quiz." });
    }
};

/**
 * POST /api/ai-questions/:id/approve
 * Mentor approves or rejects an AI-generated question
 */
exports.approveQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const { approved = true, reviewComment = "" } = req.body || {};

        const quiz = await Quiz.findById(id);
        if (!quiz) return res.status(404).json({ message: "Question not found." });

        if (!quiz.authorId && !quiz.source?.includes("mentor")) {
            return res.status(403).json({ message: "Only the author or mentors can approve." });
        }

        quiz.isApproved = approved;
        quiz.reviewComments = approved ? [] : [...(quiz.reviewComments || []), reviewComment];
        await quiz.save();

        return res.json({ ok: true, approved, reviews: quiz.reviewComments });
    } catch (err) {
        console.error("[approveQuestion] error:", err);
        return res.status(500).json({ message: "Failed to approve question." });
    }
};

/**
 * GET /api/ai-questions/pending — list unapproved AI questions for the mentor review dashboard
 */
exports.pendingReviewQueue = async (req, res) => {
    try {
        const docs = await Quiz.find({
            source: "ai_ollama",
            isApproved: false
        }).populate("author", "name").sort({ createdAt: -1 }).limit(50);

        return res.json({ ok: true, pendingCount: docs.length, items: docs });
    } catch (err) {
        console.error("[pendingReviewQueue] error:", err);
        return res.status(500).json({ message: "Failed to fetch review queue." });
    }
};

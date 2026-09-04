/**
 * aiController.js — the level-proposal endpoint the mentor Studio's "Suggest"
 * buttons call (CourseBuilder + LessonEdit).
 *
 * No LLM is wired up. Rather than leave the endpoint unmounted — which is what
 * made both buttons throw — this returns a real, deterministic proposal built
 * from the lesson's own title and description, flagged `isStub: true` so the UI
 * labels it "Suggested (template)" rather than passing it off as generated. The
 * shape is the contract a provider would fill later; `provider` names who wrote
 * it so the client never has to guess.
 */
const taxonomy = require("../data/taxonomy");

const MAX_COPY = 240;

function trim(text, max = MAX_COPY) {
    const clean = String(text || "").replace(/\s+/g, " ").trim();
    if (clean.length <= max) return clean;
    return `${clean.slice(0, max - 1).trimEnd()}…`;
}

function firstSentence(text) {
    const clean = String(text || "").replace(/\s+/g, " ").trim();
    if (!clean) return "";
    const stop = clean.search(/[.!?](\s|$)/);
    return stop === -1 ? clean : clean.slice(0, stop + 1);
}

function subject(lessonTitle, courseTitle) {
    const t = String(lessonTitle || "").trim();
    if (t) return t.replace(/^(lesson|part|module)\s*\d+[:.\-\s]*/i, "").trim() || t;
    return String(courseTitle || "this lesson").trim();
}

function proposal({ courseTitle, lessonTitle, lessonDescription, topicSlug }) {
    const what = subject(lessonTitle, courseTitle);
    const detail = firstSentence(lessonDescription);
    const course = String(courseTitle || "").trim();
    const topic = topicSlug && taxonomy.topic(topicSlug);

    return {
        isStub: true,
        provider: null,
        promiseCopy: trim(`By the end of this you can ${what.charAt(0).toLowerCase()}${what.slice(1)} on your own, without looking it up.`),
        whyCopy: trim(
            detail
                ? detail
                : course
                    ? `Everything later in ${course} leans on this, so it is worth getting right once.`
                    : "The rest of the course leans on this, so it is worth getting right once.",
        ),
        rememberCopy: trim(
            topic
                ? `${topic.label} is the one idea here — if you remember nothing else, remember that.`
                : `If you remember one thing from this lesson, make it ${what.toLowerCase()}.`,
        ),
        bossChallenge: trim(
            `Do it again from a blank page: ${what.toLowerCase()}, start to finish, with no notes and no video.`,
            800,
        ),
        quizQuestions: [],
    };
}

exports.levelProposal = async (req, res) => {
    try {
        const { courseTitle, lessonTitle, lessonDescription, topicSlug } = req.body || {};
        if (!String(lessonTitle || "").trim() && !String(courseTitle || "").trim()) {
            return res.status(400).json({ message: "Give the lesson a title first — the suggestion is built from it." });
        }
        return res.json(proposal({ courseTitle, lessonTitle, lessonDescription, topicSlug }));
    } catch (err) {
        console.error("ai.levelProposal:", err);
        return res.status(500).json({ message: "Server error" });
    }
};

exports.proposal = proposal;

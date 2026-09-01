const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const User = require("../models/user");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const Concept = require("../models/Concept");
const LessonConcept = require("../models/LessonConcept");
const { getMySkillMap, getPublicSkillMap, recordTouch } = require("../services/knowledgeGraphService");

let mongoServer;
let alice, bob, mentor, course, lessonId;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

beforeEach(async () => {
    await Promise.all([
        User.deleteMany({}),
        Course.deleteMany({}),
        Enrollment.deleteMany({}),
        Concept.deleteMany({}),
        LessonConcept.deleteMany({}),
    ]);
    const mk = (n) => User.create({ name: n, email: `${n.toLowerCase()}${Date.now()}${Math.random()}@t.com`, password: "hashhashhash" });
    alice = await mk("Alice");
    bob = await mk("Bob");
    mentor = await mk("Mentor");

    course = await Course.create({
        mentorId: mentor._id,
        title: "Recursion for Humans",
        category: "programming",
        isPublished: true,
    });
    lessonId = new mongoose.Types.ObjectId();

    await Concept.create([
        { slug: "recursion", label: "Recursion", category: "programming", relatedConceptSlugs: ["big_o"] },
        { slug: "big_o", label: "Big-O", category: "programming", relatedConceptSlugs: ["recursion"] },
    ]);
    await LessonConcept.create([
        { lessonId, courseId: course._id, conceptSlug: "recursion", weight: 6 },
        { lessonId, courseId: course._id, conceptSlug: "big_o", weight: 5 },
    ]);
});

async function enrollAliceCompleted() {
    await Enrollment.create({
        userId: alice._id,
        courseId: course._id,
        completedLessonIds: [lessonId],
        progressPct: 100,
        completedAt: new Date(),
        quizAttempts: [{ lessonId, score: 80, passed: true }],
    });
}

describe("getMySkillMap", () => {
    it("builds stars from completed enrollments and edges from touched concepts", async () => {
        await enrollAliceCompleted();
        await recordTouch(alice._id, lessonId, course._id);

        const map = await getMySkillMap(alice._id);
        expect(map.stars).toHaveLength(1);
        expect(map.stars[0].courseId).toBe(String(course._id));
        expect(map.stars[0].category).toBe("programming");
        expect(map.stars[0].size).toBeGreaterThan(0);
        expect(map.stars[0].brightness).toBeGreaterThan(0.3);

        expect(map.edges).toContainEqual({ from: "recursion", to: "big_o" });
        expect(map.meta.coursesCompleted).toBe(1);
        expect(map.meta.totalConceptsTouched).toBe(2);
        expect(map.clusters).toContainEqual({ category: "programming", count: 2 });
        expect(map.path.length).toBeGreaterThan(0);
    });

    it("returns an empty map for a user with no completions or concepts", async () => {
        const map = await getMySkillMap(bob._id);
        expect(map.stars).toHaveLength(0);
        expect(map.edges).toHaveLength(0);
        expect(map.meta.coursesCompleted).toBe(0);
    });
});

describe("getPublicSkillMap", () => {
    it("strips scores/timestamps but keeps the constellation", async () => {
        await enrollAliceCompleted();
        await recordTouch(alice._id, lessonId, course._id);

        const pub = await getPublicSkillMap(alice._id);
        expect(pub).not.toBeNull();
        expect(pub.stars[0].completedAt).toBeUndefined();
        pub.path.forEach((c) => {
            expect(c.score).toBeUndefined();
            expect(c.lastTouchedAt).toBeUndefined();
            expect(c.label).toBeTruthy();
        });
    });

    it("returns null (route 404s) when the learner completed nothing", async () => {
        expect(await getPublicSkillMap(bob._id)).toBeNull();
    });
});

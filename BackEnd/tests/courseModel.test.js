/**
 * Course + Enrollment + Certificate + Comment — Mongoose model unit tests.
 *
 * These tests use a MongoMemoryServer so the real validators (including
 * the Mongoose 9.x indexes) get exercised.
 */
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongo;
beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri());
});
afterAll(async () => {
    await mongoose.disconnect();
    await mongo.stop();
});

afterEach(async () => {
    for (const name in mongoose.connection.collections) {
        await mongoose.connection.collections[name].deleteMany();
    }
});

const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const Certificate = require("../models/Certificate");
const Comment = require("../models/Comment");

describe("Course model", () => {
    it("requires title", async () => {
        await expect(
            Course.create({ mentorId: new mongoose.Types.ObjectId() })
        ).rejects.toThrow();
    });
    it("creates a published course with thumbnail + 2 lessons", async () => {
        const mentorId = new mongoose.Types.ObjectId();
        const c = await Course.create({
            mentorId,
            title: "Intro to Calculus",
            subtitle: "A 30-minute primer",
            description: "Limits, derivatives, integrals — the whole ride.",
            category: "math",
            level: "beginner",
            language: "English",
            priceInr: 0,
            thumbnail: { url: "https://cdn/x.jpg", publicId: "x" },
            lessons: [
                { title: "L1", videoUrl: "https://cdn/v1.mp4", order: 1, isFree: true, quiz: { passingScore: 70, questions: [] } },
                { title: "L2", videoUrl: "https://cdn/v2.mp4", order: 2, quiz: { passingScore: 70, questions: [] } },
            ],
            isPublished: true,
        });
        expect(c._id).toBeDefined();
        expect(c.lessons).toHaveLength(2);
    });
    it("rejects a lesson without a valid order", async () => {
        await expect(
            Course.create({
                mentorId: new mongoose.Types.ObjectId(),
                title: "Q",
                lessons: [{ title: "L", order: 0 }], // min: 1
            })
        ).rejects.toThrow();
    });
});

describe("Enrollment model", () => {
    it("enforces unique (userId, courseId)", async () => {
        const userId = new mongoose.Types.ObjectId();
        const courseId = new mongoose.Types.ObjectId();
        await Enrollment.create({ userId, courseId });
        await expect(Enrollment.create({ userId, courseId })).rejects.toThrow();
    });
    it("defaults progressPct to 0 and completedLessonIds to []", async () => {
        const e = await Enrollment.create({
            userId: new mongoose.Types.ObjectId(),
            courseId: new mongoose.Types.ObjectId(),
        });
        expect(e.progressPct).toBe(0);
        expect(e.completedLessonIds).toEqual([]);
    });
});

describe("Certificate model", () => {
    it("sign() returns a stable, prefixed certId for the same Date", () => {
        const at = new Date("2026-08-30T12:00:00Z");
        const id1 = Certificate.sign("user1", "course1", at);
        const id2 = Certificate.sign("user1", "course1", at);
        const id3 = Certificate.sign("user2", "course1", at);
        expect(id1).toMatch(/^ORBIT-[A-Z0-9]+$/);
        expect(id1).toBe(id2); // deterministic
        expect(id1).not.toBe(id3);
    });
    it("different issuedAt → different certId", () => {
        const a = Certificate.sign("u", "c", new Date("2026-08-30T12:00:00Z"));
        const b = Certificate.sign("u", "c", new Date("2026-08-30T12:00:01Z"));
        expect(a).not.toBe(b);
    });
});

describe("Comment model", () => {
    it("creates a top-level Q&A comment", async () => {
        const c = await Comment.create({
            courseId: new mongoose.Types.ObjectId(),
            userId: new mongoose.Types.ObjectId(),
            text: "What's a derivative?",
        });
        expect(c.parentId).toBeNull();
        expect(c.upvotes).toBe(0);
    });
    it("creates a nested reply", async () => {
        const parent = await Comment.create({
            courseId: new mongoose.Types.ObjectId(),
            userId: new mongoose.Types.ObjectId(),
            text: "Question",
        });
        const reply = await Comment.create({
            courseId: parent.courseId,
            userId: new mongoose.Types.ObjectId(),
            parentId: parent._id,
            text: "Answer",
        });
        expect(String(reply.parentId)).toBe(String(parent._id));
    });
    it("accepts a comment with a valid pin flag", async () => {
        const c = await Comment.create({
            courseId: new mongoose.Types.ObjectId(),
            userId: new mongoose.Types.ObjectId(),
            text: "Pinned answer",
            isPinned: true,
            isAnswer: true,
        });
        expect(c.isPinned).toBe(true);
        expect(c.isAnswer).toBe(true);
    });
});

const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const User = require("../models/user");
const Course = require("../models/Course");
const ModerationReview = require("../models/ModerationReview");
const { getInbox, getFalsePositiveRate, respond } = require("../services/moderationService");

let mongoServer;
let mentor, other, course, lessonId;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
});
afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});
beforeEach(async () => {
    await Promise.all([User.deleteMany({}), Course.deleteMany({}), ModerationReview.deleteMany({})]);
    mentor = await User.create({ name: "Mentor", email: `m${Date.now()}@t.com`, password: "hashhashhash" });
    other = await User.create({ name: "Other", email: `o${Date.now()}@t.com`, password: "hashhashhash" });
    course = await Course.create({
        mentorId: mentor._id,
        title: "Orbital Mechanics",
        lessons: [{ title: "Kepler's second law", order: 1 }],
    });
    lessonId = course.lessons[0]._id;
});

describe("moderationService.getInbox", () => {
    it("resolves the course and lesson titles for each pending review", async () => {
        await ModerationReview.create({
            mentorId: mentor._id,
            courseId: course._id,
            lessonId,
            hits: [{ timestampSec: 42, text: "buy_now", reason: "advice_violation" }],
        });

        const items = await getInbox(mentor._id);
        expect(items).toHaveLength(1);
        expect(items[0].lessonTitle).toBe("Kepler's second law");
        expect(items[0].courseTitle).toBe("Orbital Mechanics");
        expect(String(items[0].courseId)).toBe(String(course._id));
        expect(String(items[0].lessonId)).toBe(String(lessonId));
    });

    it("returns only the caller's reviews", async () => {
        await ModerationReview.create({ mentorId: mentor._id, courseId: course._id, lessonId, hits: [] });
        await ModerationReview.create({ mentorId: other._id, courseId: course._id, lessonId, hits: [] });

        const mine = await getInbox(mentor._id);
        expect(mine).toHaveLength(1);
        expect(String(mine[0].mentorId)).toBe(String(mentor._id));
    });

    it("excludes reviews the mentor has already answered", async () => {
        const review = await ModerationReview.create({ mentorId: mentor._id, courseId: course._id, lessonId, hits: [] });
        await respond(mentor._id, review._id, "cleared", { falsePositive: true });

        expect(await getInbox(mentor._id)).toHaveLength(0);
    });

    it("leaves the titles null when the lesson no longer exists", async () => {
        await ModerationReview.create({
            mentorId: mentor._id,
            courseId: course._id,
            lessonId: new mongoose.Types.ObjectId(),
            hits: [],
        });

        const items = await getInbox(mentor._id);
        expect(items[0].lessonTitle).toBeNull();
        expect(items[0].courseTitle).toBe("Orbital Mechanics");
    });
});

describe("moderationService.getFalsePositiveRate", () => {
    it("reports a zero rate with no reviews", async () => {
        expect(await getFalsePositiveRate(mentor._id)).toEqual({ total: 0, falsePositives: 0, rate: 0 });
    });

    it("counts only the caller's false positives", async () => {
        const a = await ModerationReview.create({ mentorId: mentor._id, courseId: course._id, lessonId, hits: [] });
        await ModerationReview.create({ mentorId: mentor._id, courseId: course._id, lessonId, hits: [] });
        await respond(mentor._id, a._id, "cleared", { falsePositive: true });

        const rate = await getFalsePositiveRate(mentor._id);
        expect(rate.total).toBe(2);
        expect(rate.falsePositives).toBe(1);
        expect(rate.rate).toBeCloseTo(0.5);
    });
});

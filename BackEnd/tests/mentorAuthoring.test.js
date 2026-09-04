/**
 * mentorAuthoring.test.js — the wirings that turn already-built features on:
 * taxonomy topics on a mentor application, genre-validated course categories,
 * the moderation scan running on lesson writes, and the level-proposal endpoint
 * the Studio's Suggest buttons call.
 */
process.env.NODE_ENV = "test";
process.env.RAZORPAY_MOCK = "true";
process.env.RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || "k";
process.env.RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "s";
process.env.RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || "hook";
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";

const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const express = require("express");
const request = require("supertest");
const jwt = require("jsonwebtoken");

const taxonomy = require("../data/taxonomy");

let mongo;
let app;

beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri());
    app = express();
    app.set("io", null);
    app.use(express.json());
    app.use("/api/sessions", require("../routes/sessionRoutes"));
    app.use("/api/courses", require("../routes/courseRoutes"));
    app.use("/api/ai", require("../routes/aiRoutes"));
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

const User = require("../models/user");
const Course = require("../models/Course");
const MentorProfile = require("../models/MentorProfile");
const ModerationReview = require("../models/ModerationReview");

const SAMPLE_TOPIC = taxonomy.TOPICS[0];
const OTHER_TOPIC = taxonomy.TOPICS.find((t) => t.genreSlug !== SAMPLE_TOPIC.genreSlug);
const SAMPLE_GENRE = taxonomy.GENRES[0];

function tokenFor(user) {
    return jwt.sign(
        { id: String(user._id), roles: user.roles, rolesVersion: user.rolesVersion || 0 },
        process.env.JWT_SECRET,
    );
}

async function makeUser(roles = ["mentor"]) {
    return User.create({
        name: `u_${Math.random().toString(36).slice(2, 8)}`,
        email: `${Math.random().toString(36).slice(2, 10)}@t.co`,
        password: "hashed-not-used",
        roles,
    });
}

const apply = (user, body) => request(app)
    .post("/api/sessions/mentor/apply")
    .set("Authorization", `Bearer ${tokenFor(user)}`)
    .send({ headline: "Ten years of this", bio: "x".repeat(60), hourlyRateInr: 1000, ...body });

describe("mentor application — taxonomy topics", () => {
    it("stores the topics and derives the genres from them", async () => {
        const mentor = await makeUser();
        await apply(mentor, { topics: [SAMPLE_TOPIC.slug, OTHER_TOPIC.slug] }).expect(201);

        const profile = await MentorProfile.findOne({ userId: mentor._id }).lean();
        expect(profile.topics).toEqual([SAMPLE_TOPIC.slug, OTHER_TOPIC.slug]);
        expect(profile.genres.sort()).toEqual([SAMPLE_TOPIC.genreSlug, OTHER_TOPIC.genreSlug].sort());
    });

    it("drops slugs that are not real topics, and de-duplicates", async () => {
        const mentor = await makeUser();
        await apply(mentor, { topics: [SAMPLE_TOPIC.slug, "not.a.topic", SAMPLE_TOPIC.slug, ""] }).expect(201);

        const profile = await MentorProfile.findOne({ userId: mentor._id }).lean();
        expect(profile.topics).toEqual([SAMPLE_TOPIC.slug]);
        expect(profile.genres).toEqual([SAMPLE_TOPIC.genreSlug]);
    });

    it("leaves topics empty when none are sent, and serialises them publicly", async () => {
        const mentor = await makeUser();
        await apply(mentor, {}).expect(201);
        await MentorProfile.updateOne({ userId: mentor._id }, { $set: { applicationStatus: "approved" } });

        const res = await request(app)
            .get(`/api/sessions/mentors/${mentor._id}`)
            .set("Authorization", `Bearer ${tokenFor(mentor)}`)
            .expect(200);
        expect(res.body.topics).toEqual([]);
        expect(res.body.genres).toEqual([]);
    });
});

describe("course category — a taxonomy genre, not free text", () => {
    const create = (mentor, body) => request(app)
        .post("/api/courses")
        .set("Authorization", `Bearer ${tokenFor(mentor)}`)
        .send({ title: "Chords", ...body });

    it("accepts a real genre slug", async () => {
        const mentor = await makeUser();
        const res = await create(mentor, { category: SAMPLE_GENRE.slug }).expect(201);
        const course = await Course.findById(res.body._id).lean();
        expect(course.category).toBe(SAMPLE_GENRE.slug);
    });

    it("defaults to general when none is sent", async () => {
        const mentor = await makeUser();
        const res = await create(mentor, {}).expect(201);
        expect((await Course.findById(res.body._id).lean()).category).toBe("general");
    });

    it("refuses invented categories on create and on update", async () => {
        const mentor = await makeUser();
        const bad = await create(mentor, { category: "vibes" }).expect(400);
        expect(bad.body.code).toBe("UNKNOWN_GENRE");
        expect(await Course.countDocuments({})).toBe(0);

        const ok = await create(mentor, { category: SAMPLE_GENRE.slug }).expect(201);
        const patched = await request(app)
            .patch(`/api/courses/${ok.body._id}`)
            .set("Authorization", `Bearer ${tokenFor(mentor)}`)
            .send({ category: "vibes" })
            .expect(400);
        expect(patched.body.code).toBe("UNKNOWN_GENRE");
        expect((await Course.findById(ok.body._id).lean()).category).toBe(SAMPLE_GENRE.slug);
    });

    it("still lets a course fall back to general on update", async () => {
        const mentor = await makeUser();
        const res = await create(mentor, { category: SAMPLE_GENRE.slug }).expect(201);
        await request(app)
            .patch(`/api/courses/${res.body._id}`)
            .set("Authorization", `Bearer ${tokenFor(mentor)}`)
            .send({ category: "general" })
            .expect(200);
        expect((await Course.findById(res.body._id).lean()).category).toBe("general");
    });
});

describe("moderation runs on lesson writes", () => {
    async function courseFor(mentor) {
        return Course.create({ mentorId: mentor._id, title: "Chords", lessons: [] });
    }
    async function waitForReviews(mentorId, n) {
        for (let i = 0; i < 40; i += 1) {
            if ((await ModerationReview.countDocuments({ mentorId })) >= n) break;
            await new Promise((r) => setTimeout(r, 15));
        }
        return ModerationReview.find({ mentorId }).lean();
    }

    it("opens a review when a new lesson's own words trip the filter", async () => {
        const mentor = await makeUser();
        const course = await courseFor(mentor);

        await request(app)
            .post(`/api/courses/${course._id}/lessons`)
            .set("Authorization", `Bearer ${tokenFor(mentor)}`)
            .send({ title: "Chords", description: "Use my discount_code at checkout" })
            .expect(201);

        const reviews = await waitForReviews(mentor._id, 1);
        expect(reviews).toHaveLength(1);
        expect(reviews[0].status).toBe("pending");
        expect(reviews[0].hits.length).toBeGreaterThan(0);
        expect(String(reviews[0].courseId)).toBe(String(course._id));
    });

    it("stays quiet on a clean lesson", async () => {
        const mentor = await makeUser();
        const course = await courseFor(mentor);

        await request(app)
            .post(`/api/courses/${course._id}/lessons`)
            .set("Authorization", `Bearer ${tokenFor(mentor)}`)
            .send({ title: "The root note", description: "Hear the root of any chord." })
            .expect(201);

        await new Promise((r) => setTimeout(r, 120));
        expect(await ModerationReview.countDocuments({ mentorId: mentor._id })).toBe(0);
    });

    it("re-scans on an edit, so text added later is still caught", async () => {
        const mentor = await makeUser();
        const course = await Course.create({
            mentorId: mentor._id,
            title: "Chords",
            lessons: [{ title: "The root note", description: "Clean.", order: 1 }],
        });

        await request(app)
            .patch(`/api/courses/${course._id}/lessons/${course.lessons[0]._id}`)
            .set("Authorization", `Bearer ${tokenFor(mentor)}`)
            .send({ description: "limited_time_offer inside" })
            .expect(200);

        const reviews = await waitForReviews(mentor._id, 1);
        expect(reviews).toHaveLength(1);
        expect(String(reviews[0].lessonId)).toBe(String(course.lessons[0]._id));
    });

    it("does not fail the write when the scan finds something", async () => {
        const mentor = await makeUser();
        const course = await courseFor(mentor);
        const res = await request(app)
            .post(`/api/courses/${course._id}/lessons`)
            .set("Authorization", `Bearer ${tokenFor(mentor)}`)
            .send({ title: "badword", description: "buy_now" })
            .expect(201);
        expect(res.body._id).toBeTruthy();
        expect((await Course.findById(course._id).lean()).lessons).toHaveLength(1);
    });
});

describe("POST /ai/level-proposal — the Suggest buttons have somewhere to go", () => {
    const propose = (user, body) => request(app)
        .post("/api/ai/level-proposal")
        .set("Authorization", `Bearer ${tokenFor(user)}`)
        .send(body);

    it("returns a full proposal built from the lesson's own words, flagged as a template", async () => {
        const mentor = await makeUser();
        const res = await propose(mentor, {
            courseTitle: "Chord Foundations",
            lessonTitle: "Hear the root note",
            lessonDescription: "Module 3 leans on this. It takes four minutes.",
        }).expect(200);

        expect(res.body.isStub).toBe(true);
        expect(res.body.provider).toBeNull();
        expect(res.body.promiseCopy).toContain("hear the root note");
        expect(res.body.whyCopy).toBe("Module 3 leans on this.");
        expect(res.body.rememberCopy.length).toBeGreaterThan(0);
        expect(res.body.bossChallenge.length).toBeGreaterThan(0);
        expect(res.body.quizQuestions).toEqual([]);
    });

    it("keeps every line inside the field limits", async () => {
        const mentor = await makeUser();
        const res = await propose(mentor, {
            courseTitle: "C".repeat(400),
            lessonTitle: "L".repeat(400),
            lessonDescription: "D".repeat(4000),
        }).expect(200);

        expect(res.body.promiseCopy.length).toBeLessThanOrEqual(240);
        expect(res.body.whyCopy.length).toBeLessThanOrEqual(240);
        expect(res.body.rememberCopy.length).toBeLessThanOrEqual(240);
        expect(res.body.bossChallenge.length).toBeLessThanOrEqual(800);
    });

    it("names the topic in the anchor line when one is given", async () => {
        const mentor = await makeUser();
        const res = await propose(mentor, { lessonTitle: "Anything", topicSlug: SAMPLE_TOPIC.slug }).expect(200);
        expect(res.body.rememberCopy).toContain(SAMPLE_TOPIC.label);
    });

    it("asks for a title before it will guess", async () => {
        const mentor = await makeUser();
        await propose(mentor, { lessonDescription: "no title here" }).expect(400);
    });

    it("is mentor-gated and needs a token", async () => {
        const student = await makeUser(["student"]);
        await propose(student, { lessonTitle: "Anything" }).expect(403);
        await request(app).post("/api/ai/level-proposal").send({ lessonTitle: "Anything" }).expect(401);
    });
});

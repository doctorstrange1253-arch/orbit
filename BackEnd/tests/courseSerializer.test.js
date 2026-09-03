const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const express = require("express");
const request = require("supertest");
const jwt = require("jsonwebtoken");

process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";

let mongo;
let app;

beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri());
    const courseRoutes = require("../routes/courseRoutes");
    app = express();
    app.use(express.json());
    app.use("/api/courses", courseRoutes);
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
const User = require("../models/user");

function tokenFor(user) {
    return jwt.sign(
        { id: String(user._id), roles: user.roles, rolesVersion: user.rolesVersion || 0 },
        process.env.JWT_SECRET
    );
}

async function makeUser(roles) {
    return User.create({
        name: `u_${Math.random().toString(36).slice(2, 8)}`,
        email: `${Math.random().toString(36).slice(2, 10)}@t.co`,
        password: "hashed-not-used",
        roles,
    });
}

async function makeCourseWithQuiz(mentorId, { published = true } = {}) {
    return Course.create({
        mentorId,
        title: "Chord Foundations",
        category: "music",
        isPublished: published,
        publishedAt: published ? new Date() : undefined,
        lessons: [
            {
                title: "The root note",
                videoUrl: "https://res.cloudinary.com/x/v/a.mp4",
                order: 1,
                isFree: true,
                isBoss: false,
                promiseCopy: "You will hear the root of any chord.",
                whyCopy: "Module 3 needs it.",
                rememberCopy: "The root feels like home.",
                quiz: {
                    passingScore: 80,
                    questions: [
                        {
                            prompt: "Which note is the root?",
                            options: ["Lowest", "Highest", "Middle", "None"],
                            correctIdx: 0,
                            explanation: "The root is the lowest note.",
                            coachCopy: "Think of it as home base.",
                        },
                    ],
                },
            },
            {
                title: "The test",
                videoUrl: "https://res.cloudinary.com/x/v/b.mp4",
                order: 2,
                isBoss: true,
                bossChallenge: "Name every root by ear.",
                quiz: { passingScore: 100, questions: [] },
            },
        ],
    });
}

describe("publicShape — Game Engine fields", () => {
    it("serializes quiz questions, isBoss and Level Card copy", async () => {
        const mentor = await makeUser(["mentor"]);
        const course = await makeCourseWithQuiz(mentor._id);

        const res = await request(app).get(`/api/courses/${course._id}`).expect(200);

        const [first, boss] = res.body.lessons;
        expect(first.quiz.questions).toHaveLength(1);
        expect(first.quiz.questions[0].prompt).toBe("Which note is the root?");
        expect(first.quiz.questions[0].options).toHaveLength(4);
        expect(first.quiz.questions[0].coachCopy).toBe("Think of it as home base.");
        expect(first.quiz.passingScore).toBe(80);
        expect(first.promiseCopy).toBe("You will hear the root of any chord.");
        expect(first.whyCopy).toBe("Module 3 needs it.");
        expect(first.rememberCopy).toBe("The root feels like home.");
        expect(first.isBoss).toBe(false);
        expect(boss.isBoss).toBe(true);
        expect(boss.bossChallenge).toBe("Name every root by ear.");
    });

    it("hides correctIdx from a non-owner but shows it to the owner", async () => {
        const mentor = await makeUser(["mentor"]);
        const student = await makeUser(["student"]);
        const course = await makeCourseWithQuiz(mentor._id);

        const anon = await request(app).get(`/api/courses/${course._id}`).expect(200);
        expect(anon.body.lessons[0].quiz.questions[0].correctIdx).toBeUndefined();

        const asStudent = await request(app)
            .get(`/api/courses/${course._id}`)
            .set("Authorization", `Bearer ${tokenFor(student)}`)
            .expect(200);
        expect(asStudent.body.lessons[0].quiz.questions[0].correctIdx).toBeUndefined();

        const asOwner = await request(app)
            .get(`/api/courses/${course._id}`)
            .set("Authorization", `Bearer ${tokenFor(mentor)}`)
            .expect(200);
        expect(asOwner.body.lessons[0].quiz.questions[0].correctIdx).toBe(0);
    });
});

describe("GET /courses/enrollments/me", () => {
    it("401s without a token", async () => {
        await request(app).get("/api/courses/enrollments/me").expect(401);
    });

    it("returns only the caller's enrollments, with the course populated", async () => {
        const mentor = await makeUser(["mentor"]);
        const me = await makeUser(["student"]);
        const other = await makeUser(["student"]);
        const course = await makeCourseWithQuiz(mentor._id);

        await Enrollment.create({
            userId: me._id,
            courseId: course._id,
            progressPct: 50,
            completedLessonIds: [course.lessons[0]._id],
            lastLessonId: course.lessons[0]._id,
        });
        await Enrollment.create({ userId: other._id, courseId: course._id, progressPct: 10 });

        const res = await request(app)
            .get("/api/courses/enrollments/me")
            .set("Authorization", `Bearer ${tokenFor(me)}`)
            .expect(200);

        expect(res.body.items).toHaveLength(1);
        const row = res.body.items[0];
        expect(row.progressPct).toBe(50);
        expect(row.completedLessonIds).toHaveLength(1);
        expect(String(row.lastLessonId)).toBe(String(course.lessons[0]._id));
        expect(String(row.courseId)).toBe(String(course._id));
        expect(row.course.title).toBe("Chord Foundations");
        expect(row.course.lessonsCount).toBe(2);
        expect(row.course.mentor.name).toBe(mentor.name);
    });

    it("is not shadowed by the /:id route", async () => {
        const me = await makeUser(["student"]);
        const res = await request(app)
            .get("/api/courses/enrollments/me")
            .set("Authorization", `Bearer ${tokenFor(me)}`)
            .expect(200);
        expect(Array.isArray(res.body.items)).toBe(true);
    });
});

describe("GET /courses/:id/enrollments/me", () => {
    it("404s when not enrolled, returns progress when enrolled", async () => {
        const mentor = await makeUser(["mentor"]);
        const me = await makeUser(["student"]);
        const course = await makeCourseWithQuiz(mentor._id);
        const auth = `Bearer ${tokenFor(me)}`;

        await request(app)
            .get(`/api/courses/${course._id}/enrollments/me`)
            .set("Authorization", auth)
            .expect(404);

        await Enrollment.create({
            userId: me._id,
            courseId: course._id,
            progressPct: 100,
            completedAt: new Date(),
        });

        const res = await request(app)
            .get(`/api/courses/${course._id}/enrollments/me`)
            .set("Authorization", auth)
            .expect(200);
        expect(res.body.progressPct).toBe(100);
        expect(res.body.completedAt).toBeTruthy();
    });
});

describe("PATCH lesson — quiz bank preservation", () => {
    it("does not wipe questions when an empty array is sent", async () => {
        const mentor = await makeUser(["mentor"]);
        const course = await makeCourseWithQuiz(mentor._id);
        const lessonId = course.lessons[0]._id;

        await request(app)
            .patch(`/api/courses/${course._id}/lessons/${lessonId}`)
            .set("Authorization", `Bearer ${tokenFor(mentor)}`)
            .send({ title: "The root note, revised", quiz: { passingScore: 70, questions: [] } })
            .expect(200);

        const after = await Course.findById(course._id).lean();
        expect(after.lessons[0].title).toBe("The root note, revised");
        expect(after.lessons[0].quiz.questions).toHaveLength(1);
    });

    it("clears questions only when clearQuiz is explicit", async () => {
        const mentor = await makeUser(["mentor"]);
        const course = await makeCourseWithQuiz(mentor._id);
        const lessonId = course.lessons[0]._id;

        await request(app)
            .patch(`/api/courses/${course._id}/lessons/${lessonId}`)
            .set("Authorization", `Bearer ${tokenFor(mentor)}`)
            .send({ quiz: { questions: [] }, clearQuiz: true })
            .expect(200);

        const after = await Course.findById(course._id).lean();
        expect(after.lessons[0].quiz.questions).toHaveLength(0);
    });

    it("persists isBoss and Level Card copy", async () => {
        const mentor = await makeUser(["mentor"]);
        const course = await makeCourseWithQuiz(mentor._id);
        const lessonId = course.lessons[0]._id;

        await request(app)
            .patch(`/api/courses/${course._id}/lessons/${lessonId}`)
            .set("Authorization", `Bearer ${tokenFor(mentor)}`)
            .send({ isBoss: true, promiseCopy: "New promise.", whyCopy: "New why." })
            .expect(200);

        const after = await Course.findById(course._id).lean();
        expect(after.lessons[0].isBoss).toBe(true);
        expect(after.lessons[0].promiseCopy).toBe("New promise.");
        expect(after.lessons[0].whyCopy).toBe("New why.");
    });
});

describe("GET /courses?mentor=me", () => {
    it("includes the caller's drafts and excludes other mentors' courses", async () => {
        const mine = await makeUser(["mentor"]);
        const theirs = await makeUser(["mentor"]);
        await makeCourseWithQuiz(mine._id, { published: false });
        await makeCourseWithQuiz(mine._id, { published: true });
        await makeCourseWithQuiz(theirs._id, { published: true });

        const res = await request(app)
            .get("/api/courses?mentor=me&limit=100")
            .set("Authorization", `Bearer ${tokenFor(mine)}`)
            .expect(200);

        expect(res.body.items).toHaveLength(2);
        expect(res.body.items.some((c) => c.isPublished === false)).toBe(true);
        for (const c of res.body.items) expect(String(c.mentorId)).toBe(String(mine._id));
    });

    it("without mentor=me, only published courses are returned", async () => {
        const mentor = await makeUser(["mentor"]);
        await makeCourseWithQuiz(mentor._id, { published: false });
        await makeCourseWithQuiz(mentor._id, { published: true });

        const res = await request(app).get("/api/courses").expect(200);
        expect(res.body.items).toHaveLength(1);
        expect(res.body.items[0].isPublished).toBe(true);
    });
});

describe("lesson cuts — the Recorder's retake, applied at playback", () => {
    it("stores cuts on a new lesson, sorted, merged and cleaned", async () => {
        const mentor = await makeUser(["mentor"]);
        const course = await makeCourseWithQuiz(mentor._id);

        await request(app)
            .post(`/api/courses/${course._id}/lessons`)
            .set("Authorization", `Bearer ${tokenFor(mentor)}`)
            .send({
                title: "Recorded live",
                videoUrl: "https://res.cloudinary.com/x/v/c.webm",
                cuts: [
                    { fromSec: 40, toSec: 60 },
                    { fromSec: 10, toSec: 20 },
                    { fromSec: 18, toSec: 25 },
                    { fromSec: 5, toSec: 5 },
                    { fromSec: -3, toSec: 2 },
                    { fromSec: "x", toSec: 9 },
                ],
            })
            .expect(201);

        const after = await Course.findById(course._id).lean();
        const lesson = after.lessons[after.lessons.length - 1];
        expect(lesson.cuts).toEqual([
            { fromSec: 10, toSec: 25 },
            { fromSec: 40, toSec: 60 },
        ]);
    });

    it("serializes cuts so the player can skip them", async () => {
        const mentor = await makeUser(["mentor"]);
        const course = await makeCourseWithQuiz(mentor._id);
        course.lessons[0].cuts = [{ fromSec: 12.5, toSec: 32.5 }];
        await course.save();

        const res = await request(app).get(`/api/courses/${course._id}`).expect(200);
        expect(res.body.lessons[0].cuts).toEqual([{ fromSec: 12.5, toSec: 32.5 }]);
    });

    it("leaves existing cuts alone when the body has no cuts field", async () => {
        const mentor = await makeUser(["mentor"]);
        const course = await makeCourseWithQuiz(mentor._id);
        course.lessons[0].cuts = [{ fromSec: 1, toSec: 4 }];
        await course.save();

        await request(app)
            .patch(`/api/courses/${course._id}/lessons/${course.lessons[0]._id}`)
            .set("Authorization", `Bearer ${tokenFor(mentor)}`)
            .send({ title: "Renamed only" })
            .expect(200);

        const after = await Course.findById(course._id).lean();
        expect(after.lessons[0].cuts).toEqual([{ fromSec: 1, toSec: 4 }]);
    });

    it("lets a mentor clear every cut by sending an empty list", async () => {
        const mentor = await makeUser(["mentor"]);
        const course = await makeCourseWithQuiz(mentor._id);
        course.lessons[0].cuts = [{ fromSec: 1, toSec: 4 }];
        await course.save();

        await request(app)
            .patch(`/api/courses/${course._id}/lessons/${course.lessons[0]._id}`)
            .set("Authorization", `Bearer ${tokenFor(mentor)}`)
            .send({ cuts: [] })
            .expect(200);

        const after = await Course.findById(course._id).lean();
        expect(after.lessons[0].cuts).toEqual([]);
    });
});

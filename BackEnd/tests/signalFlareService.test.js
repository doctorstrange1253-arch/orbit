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

const SignalFlare = require("../models/SignalFlare");
const MentorProfile = require("../models/MentorProfile");
const Course = require("../models/Course");
const User = require("../models/user");
const flares = require("../services/signalFlareService");

const GENRE = "music-sound.indian-classical";
const TOPIC = "music-sound.indian-classical.tabla";
const OTHER_TOPIC = "computing.security.penetration-testing";

async function learner(n) {
    return User.create({
        name: `learner${n}`,
        email: `l${n}-${Math.random().toString(36).slice(2, 8)}@t.co`,
        password: "x",
        roles: ["student"],
    });
}

async function mentor({ topics = [], genres = [], constellations = [], approved = true } = {}) {
    const u = await User.create({
        name: `mentor-${Math.random().toString(36).slice(2, 7)}`,
        email: `m-${Math.random().toString(36).slice(2, 8)}@t.co`,
        password: "x",
        roles: ["mentor"],
    });
    await MentorProfile.create({
        userId: u._id,
        headline: "teaches",
        hourlyRateInr: 500,
        topics,
        genres,
        constellations,
        applicationStatus: approved ? "approved" : "submitted",
        status: "active",
    });
    return u;
}

async function flare(user, genre = GENRE) {
    return flares.fireFlare(user._id, { constellation: genre.split(".")[0], genre });
}

describe("fireFlare", () => {
    it("is idempotent per user and genre", async () => {
        const u = await learner(1);
        await flare(u);
        await flare(u);
        expect(await SignalFlare.countDocuments({ userId: u._id })).toBe(1);
    });

    it("counts only unanswered flares", async () => {
        const a = await learner(1);
        const b = await learner(2);
        await flare(a);
        await flare(b);
        expect(await flares.getCount(GENRE.split(".")[0], GENRE)).toBe(2);
        await SignalFlare.updateMany({}, { $set: { respondedCourseId: new mongoose.Types.ObjectId() } });
        expect(await flares.getCount(GENRE.split(".")[0], GENRE)).toBe(0);
    });
});

describe("demandFor + threshold", () => {
    it("is unmet below the threshold and met at it", async () => {
        for (let i = 0; i < flares.THRESHOLD - 1; i += 1) await flare(await learner(i));
        let d = await flares.demandFor(GENRE);
        expect(d.waiting).toBe(flares.THRESHOLD - 1);
        expect(d.met).toBe(false);

        await flare(await learner(99));
        d = await flares.demandFor(GENRE);
        expect(d.waiting).toBe(flares.THRESHOLD);
        expect(d.met).toBe(true);
    });
});

describe("rankMentors", () => {
    it("ranks a topic match above a genre match above a constellation match", () => {
        const rows = flares.rankMentors([
            { _id: "c", constellations: ["music-sound"] },
            { _id: "t", topics: [TOPIC] },
            { _id: "g", genres: [GENRE] },
        ], GENRE);
        expect(rows.map((r) => r._id)).toEqual(["t", "g", "c"]);
    });

    it("drops mentors with no relationship to the genre", () => {
        const rows = flares.rankMentors([{ _id: "x", topics: [OTHER_TOPIC] }], GENRE);
        expect(rows).toHaveLength(0);
    });
});

describe("evaluateGenre", () => {
    it("notifies nobody below the threshold", async () => {
        await mentor({ topics: [TOPIC] });
        await flare(await learner(1));
        const out = await flares.evaluateGenre(null, GENRE);
        expect(out.met).toBe(false);
        expect(out.notified).toBe(0);
    });

    it("notifies matching approved mentors once the threshold is met", async () => {
        await mentor({ topics: [TOPIC] });
        await mentor({ genres: [GENRE] });
        await mentor({ topics: [OTHER_TOPIC] });
        for (let i = 0; i < flares.THRESHOLD; i += 1) await flare(await learner(i));

        const out = await flares.evaluateGenre(null, GENRE);
        expect(out.met).toBe(true);
        expect(out.notified).toBe(2);
    });

    it("skips mentors who are not approved", async () => {
        await mentor({ topics: [TOPIC], approved: false });
        for (let i = 0; i < flares.THRESHOLD; i += 1) await flare(await learner(i));
        const out = await flares.evaluateGenre(null, GENRE);
        expect(out.notified).toBe(0);
    });

    it("does not notify when the genre is already served", async () => {
        const m = await mentor({ topics: [TOPIC] });
        for (let i = 0; i < flares.THRESHOLD; i += 1) await flare(await learner(i));
        await Course.create({
            mentorId: m._id,
            title: "Tabla from scratch",
            category: GENRE,
            isPublished: true,
            publishedAt: new Date(),
            lessons: [{ title: "One", videoUrl: "u", order: 1, isIntro: true, isFree: true }],
        });
        const out = await flares.evaluateGenre(null, GENRE);
        expect(out.reason).toBe("already_served");
        expect(out.notified).toBe(0);
    });

    it("does not re-notify the same mentor inside the cooldown", async () => {
        await mentor({ topics: [TOPIC] });
        for (let i = 0; i < flares.THRESHOLD; i += 1) await flare(await learner(i));
        expect((await flares.evaluateGenre(null, GENRE)).notified).toBe(1);
        expect((await flares.evaluateGenre(null, GENRE)).notified).toBe(0);
    });
});

describe("onCoursePublished", () => {
    it("answers every waiting flare exactly once", async () => {
        const m = await mentor({ topics: [TOPIC] });
        const a = await learner(1);
        const b = await learner(2);
        await flare(a);
        await flare(b);

        const course = await Course.create({
            mentorId: m._id,
            title: "Tabla from scratch",
            category: GENRE,
            lessons: [{ title: "Intro", videoUrl: "u", order: 1, isIntro: true, isFree: true }],
        });

        const first = await flares.onCoursePublished(null, course);
        expect(first.answered).toBe(2);
        expect(first.userIds.sort()).toEqual([String(a._id), String(b._id)].sort());

        const second = await flares.onCoursePublished(null, course);
        expect(second.answered).toBe(0);
    });

    it("leaves flares for other genres alone", async () => {
        const m = await mentor({ topics: [TOPIC] });
        const u = await learner(1);
        await flares.fireFlare(u._id, { constellation: "computing", genre: "computing.security" });
        const course = await Course.create({
            mentorId: m._id, title: "Tabla", category: GENRE,
            lessons: [{ title: "Intro", videoUrl: "u", order: 1, isIntro: true, isFree: true }],
        });
        expect((await flares.onCoursePublished(null, course)).answered).toBe(0);
        expect(await SignalFlare.countDocuments({ respondedCourseId: null })).toBe(1);
    });
});

describe("openFields", () => {
    it("lists unserved genres by demand, hiding served ones", async () => {
        const m = await mentor({ topics: [TOPIC] });
        for (let i = 0; i < 3; i += 1) await flare(await learner(i));
        for (let i = 10; i < 15; i += 1) {
            const u = await learner(i);
            await flares.fireFlare(u._id, { constellation: "computing", genre: "computing.security" });
        }
        await Course.create({
            mentorId: m._id, title: "Sec", category: "computing.security", isPublished: true, publishedAt: new Date(),
            lessons: [{ title: "Intro", videoUrl: "u", order: 1, isIntro: true, isFree: true }],
        });

        const fields = await flares.openFields();
        expect(fields.map((f) => f.genre)).toEqual([GENRE]);
        expect(fields[0].waiting).toBe(3);
        expect(fields[0].label).toBe("Indian Classical");
    });
});

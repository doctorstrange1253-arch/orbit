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

let mongo;
let app;

beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri());
    app = express();
    app.set("io", null);
    app.use(express.json());
    app.use("/api/sessions", require("../routes/sessionRoutes"));
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
const MentorProfile = require("../models/MentorProfile");

function tokenFor(user) {
    return jwt.sign(
        { id: String(user._id), roles: user.roles, rolesVersion: user.rolesVersion || 0 },
        process.env.JWT_SECRET,
    );
}

async function makeUser(roles = ["peer_learner"]) {
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

const readMe = (user) => request(app)
    .get("/api/sessions/mentor/me")
    .set("Authorization", `Bearer ${tokenFor(user)}`);

describe("applying is the approval — there is no review queue", () => {
    it("approves the profile immediately instead of parking it at submitted", async () => {
        const user = await makeUser();
        const res = await apply(user).expect(201);
        expect(res.body.applicationStatus).toBe("approved");
        const profile = await MentorProfile.findOne({ userId: user._id }).lean();
        expect(profile.applicationStatus).toBe("approved");
        expect(profile.status).toBe("active");
    });

    it("grants the mentor role and bumps rolesVersion so the stale JWT is refused", async () => {
        const user = await makeUser(["peer_learner"]);
        const res = await apply(user).expect(201);
        expect(res.body.rolesGranted).toBe(true);

        const fresh = await User.findById(user._id).select("roles rolesVersion").lean();
        expect(fresh.roles).toContain("mentor");
        expect(fresh.rolesVersion).toBe((user.rolesVersion || 0) + 1);

        await readMe(user).expect(401);
        await readMe(fresh.roles ? { ...fresh, _id: user._id } : user).expect(200);
    });

    it("does not bump rolesVersion when the caller is already a mentor", async () => {
        const user = await makeUser(["peer_learner", "mentor"]);
        const res = await apply(user).expect(201);
        expect(res.body.rolesGranted).toBe(false);
        const fresh = await User.findById(user._id).select("roles rolesVersion").lean();
        expect(fresh.rolesVersion).toBe(user.rolesVersion || 0);
        await readMe(user).expect(200);
    });

    it("refuses to let a suspended mentor re-approve itself by re-submitting", async () => {
        const user = await makeUser(["peer_learner", "mentor"]);
        await MentorProfile.create({
            userId: user._id,
            headline: "Old",
            bio: "y".repeat(60),
            hourlyRateInr: 500,
            applicationStatus: "suspended",
            status: "paused",
        });

        const res = await apply(user).expect(403);
        expect(res.body.code).toBe("MENTOR_SUSPENDED");
        const profile = await MentorProfile.findOne({ userId: user._id }).lean();
        expect(profile.applicationStatus).toBe("suspended");
        expect(profile.headline).toBe("Old");
    });
});

describe("GET /sessions/mentor/me settles a stranded profile on read", () => {
    it("promotes a legacy submitted profile to approved", async () => {
        const user = await makeUser(["peer_learner", "mentor"]);
        await MentorProfile.create({
            userId: user._id,
            headline: "Ten years of this",
            bio: "x".repeat(60),
            hourlyRateInr: 1000,
            applicationStatus: "submitted",
            status: "active",
        });

        const res = await readMe(user).expect(200);
        expect(res.body.profile.applicationStatus).toBe("approved");
        expect((await MentorProfile.findOne({ userId: user._id }).lean()).applicationStatus).toBe("approved");
    });

    it("leaves rejected and suspended profiles alone", async () => {
        for (const status of ["rejected", "suspended"]) {
            const user = await makeUser(["peer_learner", "mentor"]);
            await MentorProfile.create({
                userId: user._id,
                headline: "Ten years of this",
                bio: "x".repeat(60),
                hourlyRateInr: 1000,
                applicationStatus: status,
                status: "active",
            });
            const res = await readMe(user).expect(200);
            expect(res.body.profile.applicationStatus).toBe(status);
        }
    });

    it("still returns a null profile when nothing has been submitted", async () => {
        const user = await makeUser(["peer_learner", "mentor"]);
        const res = await readMe(user).expect(200);
        expect(res.body.profile).toBeNull();
    });
});

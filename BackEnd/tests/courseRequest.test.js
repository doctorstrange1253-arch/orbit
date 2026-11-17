const request = require("supertest");
const express = require("express");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const courseRoutes = require("../routes/courseRoutes");
const User = require("../models/user");
const CourseRequest = require("../models/CourseRequest");
const jwt = require("jsonwebtoken");

let mongoServer;
let app;
let studentToken;
let mentorToken;
let studentUser;
let mentorUser;

beforeAll(async () => {
    process.env.JWT_SECRET = "test_jwt_secret_12345678901234567890";
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    app = express();
    app.use(express.json());
    app.use("/api/courses", courseRoutes);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

beforeEach(async () => {
    await CourseRequest.deleteMany({});
    await User.deleteMany({});

    studentUser = await User.create({
        name: "Student One",
        email: "student@orbit.app",
        password: "hash",
        roles: ["student"],
        rolesVersion: 1
    });
    studentToken = jwt.sign({ id: studentUser._id, rolesVersion: 1 }, process.env.JWT_SECRET);

    mentorUser = await User.create({
        name: "Mentor One",
        email: "mentor@orbit.app",
        password: "hash",
        roles: ["mentor"],
        rolesVersion: 1
    });
    mentorToken = jwt.sign({ id: mentorUser._id, rolesVersion: 1 }, process.env.JWT_SECRET);
});

describe("Course-Request Engine", () => {
    test("POST /api/courses/requests — submits a new request", async () => {
        const res = await request(app)
            .post("/api/courses/requests")
            .set("Authorization", `Bearer ${studentToken}`)
            .send({
                topic: "Advanced Data Structures & Algorithms in Java",
                category: "Computer Science",
                description: "Deep dive into trees and graphs"
            });

        expect(res.status).toBe(201);
        expect(res.body.ok).toBe(true);
        expect(res.body.request.votes).toBe(1);
        expect(res.body.request.clusterKey).toBe("advanced-algorithms-data-in-java-structures");
    });

    test("POST /api/courses/requests — semantic deduplication clusters requests and upvotes", async () => {
        // First submission
        await request(app)
            .post("/api/courses/requests")
            .set("Authorization", `Bearer ${studentToken}`)
            .send({
                topic: "DSA in Java",
                category: "Computer Science"
            });

        // Second submission with different wording/casing
        const res2 = await request(app)
            .post("/api/courses/requests")
            .set("Authorization", `Bearer ${mentorToken}`)
            .send({
                topic: "Java in DSA!",
                category: "Computer Science"
            });

        expect(res2.status).toBe(200);
        expect(res2.body.clustered).toBe(true);
        expect(res2.body.request.votes).toBe(2);
    });

    test("GET /api/courses/requests — lists requests with thresholdTier calculation", async () => {
        await CourseRequest.create({
            topic: "WebGPU Shaders",
            category: "Graphics",
            clusterKey: "graphics-shaders-webgpu",
            requestedBy: studentUser._id,
            votes: 27,
            voters: [studentUser._id],
            status: "pending"
        });

        const res = await request(app).get("/api/courses/requests");
        expect(res.status).toBe(200);
        expect(res.body.ok).toBe(true);
        expect(res.body.requests.length).toBe(1);
        expect(res.body.requests[0].thresholdTier).toBe("mentor_notified");
    });

    test("POST /api/courses/requests/:id/claim — mentor claims request when threshold reached", async () => {
        const reqDoc = await CourseRequest.create({
            topic: "Rust for Systems",
            category: "Programming",
            clusterKey: "for-programming-rust-systems",
            requestedBy: studentUser._id,
            votes: 30, // >= 25 threshold
            voters: [studentUser._id],
            status: "pending"
        });

        const res = await request(app)
            .post(`/api/courses/requests/${reqDoc._id}/claim`)
            .set("Authorization", `Bearer ${mentorToken}`);

        expect(res.status).toBe(200);
        expect(res.body.ok).toBe(true);
        expect(res.body.request.status).toBe("claimed");
        expect(res.body.request.claimedBy).toBe(String(mentorUser._id));
    });

    test("POST /api/courses/requests/:id/claim — rejects claim if votes < 25", async () => {
        const reqDoc = await CourseRequest.create({
            topic: "Quantum Computing",
            category: "Physics",
            clusterKey: "computing-quantum",
            requestedBy: studentUser._id,
            votes: 10, // < 25
            voters: [studentUser._id],
            status: "pending"
        });

        const res = await request(app)
            .post(`/api/courses/requests/${reqDoc._id}/claim`)
            .set("Authorization", `Bearer ${mentorToken}`);

        expect(res.status).toBe(403);
        expect(res.body.message).toMatch(/25-vote/);
    });
});

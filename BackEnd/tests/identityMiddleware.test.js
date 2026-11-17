const { requireRoles, preventSelfReview } = require("../middleware/identity");
const User = require("../models/user");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe("Identity & RBAC Middleware", () => {
    let testUser;

    beforeEach(async () => {
        await User.deleteMany({});
        testUser = await User.create({
            name: "Test User",
            email: "test@orbit.app",
            password: "hashedpassword123",
            roles: ["student", "peer_learner"],
            rolesVersion: 1
        });
    });

    test("should allow request if user has required role and fresh rolesVersion", async () => {
        const req = {
            user: { _id: testUser._id, rolesVersion: 1 }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const next = jest.fn();

        const middleware = requireRoles(["student"]);
        await middleware(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
    });

    test("should reject request if user lacks required role", async () => {
        const req = {
            user: { _id: testUser._id, rolesVersion: 1 }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const next = jest.fn();

        const middleware = requireRoles(["mentor"]);
        await middleware(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining("Access denied") }));
    });

    test("should reject request if rolesVersion is stale (BA-06)", async () => {
        // Increment user's rolesVersion in DB
        testUser.rolesVersion = 2;
        await testUser.save();

        const req = {
            user: { _id: testUser._id, rolesVersion: 1 } // token has older version 1
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const next = jest.fn();

        const middleware = requireRoles(["student"]);
        await middleware(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ code: "ROLES_STALE" }));
    });

    test("preventSelfReview should block user reviewing themselves", async () => {
        const userId = new mongoose.Types.ObjectId();
        const req = {
            user: { _id: userId }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const next = jest.fn();

        const middleware = preventSelfReview(() => userId);
        await middleware(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(403);
    });
});

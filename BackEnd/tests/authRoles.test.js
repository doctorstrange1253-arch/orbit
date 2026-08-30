/**
 * authRoles.test.js — DB-backed end-to-end tests for the role-aware auth flow.
 *
 * Covers:
 *   - register: optional `roles` array is validated and persisted
 *   - register: omitting `roles` defaults to ['peer_learner']
 *   - register: invalid role name → 400
 *   - register: peer_learner is always forced into the array
 *   - register: response carries a token + user (so the client can skip a
 *     second /user/profile round-trip after signup)
 *   - login: response carries a token + user with the live roles
 *   - JWT payload: contains `roles` and `rolesVersion` claims
 *   - updateMyRoles: bumps rolesVersion and re-mints a token
 *   - updateMyRoles: rejects empty array, unknown role, suspended mentor
 *   - updateMyRoles: no-op when the requested set is unchanged
 *   - auth middleware: ROLES_STALE when JWT's rolesVersion lags the DB
 */
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const MentorProfile = require("../models/MentorProfile");
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");

// Set the JWT secret BEFORE requiring auth middleware (it reads from env).
process.env.JWT_SECRET = process.env.JWT_SECRET || "test_secret_for_roles";
const auth = require("../middleware/auth");

let mongo;

const mockRes = () => {
    const res = {};
    res.status = jest.fn(() => res);
    res.json = jest.fn((b) => b);
    return res;
};

const mockReq = (overrides = {}) => ({
    body: {},
    headers: {},
    user: null,
    ...overrides,
});

beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri());
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongo.stop();
});

afterEach(async () => {
    for (const key of Object.keys(mongoose.connection.collections)) {
        await mongoose.connection.collections[key].deleteMany();
    }
});

async function createUser(extra = {}) {
    return User.create({
        name: "U",
        email: `u${Date.now()}_${Math.random().toString(36).slice(2)}@test.io`,
        password: "$2a$10$x", // not used — we don't call bcrypt in these tests
        roles: extra.roles || ["peer_learner"],
        rolesVersion: extra.rolesVersion ?? 0,
    });
}

// ── REGISTER ──────────────────────────────────────────────────────────────

describe("authController.register — role selection", () => {
    test("default roles when no array is sent", async () => {
        const req = mockReq({
            body: { name: "Alice", email: `a${Date.now()}@t.io`, password: "Strong1!pw" },
        });
        const res = mockRes();
        await authController.register(req, res);
        expect(res.status).toHaveBeenCalledWith(201);
        const body = res.json.mock.results[0].value;
        expect(body.user.roles).toEqual(["peer_learner"]);
        expect(body.user.rolesVersion).toBe(0);
        expect(typeof body.token).toBe("string");
    });

    test("accepts an explicit roles array", async () => {
        const req = mockReq({
            body: {
                name: "Bob",
                email: `b${Date.now()}@t.io`,
                password: "Strong1!pw",
                roles: ["mentor"],
            },
        });
        const res = mockRes();
        await authController.register(req, res);
        expect(res.status).toHaveBeenCalledWith(201);
        const body = res.json.mock.results[0].value;
        // peer_learner is always forced into the set. Order is not part of
        // the contract — Set preserves insertion order, which for a
        // mentor-only signup is [mentor, peer_learner].
        expect(new Set(body.user.roles)).toEqual(new Set(["peer_learner", "mentor"]));
    });

    test("preserves the full roles array when peer_learner is already present", async () => {
        const req = mockReq({
            body: {
                name: "Cara",
                email: `c${Date.now()}@t.io`,
                password: "Strong1!pw",
                roles: ["peer_learner", "student"],
            },
        });
        const res = mockRes();
        await authController.register(req, res);
        const body = res.json.mock.results[0].value;
        expect(new Set(body.user.roles)).toEqual(new Set(["peer_learner", "student"]));
    });

    test("rejects an empty roles array with 400", async () => {
        const req = mockReq({
            body: {
                name: "Dan", email: `d${Date.now()}@t.io`, password: "Strong1!pw", roles: [],
            },
        });
        const res = mockRes();
        await authController.register(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json.mock.results[0].value.message).toMatch(/at least one/i);
    });

    test("rejects an unknown role with 400", async () => {
        const req = mockReq({
            body: {
                name: "Eve", email: `e${Date.now()}@t.io`, password: "Strong1!pw", roles: ["wizard"],
            },
        });
        const res = mockRes();
        await authController.register(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json.mock.results[0].value.message).toMatch(/wizard/);
    });

    test("JWT payload carries roles + rolesVersion", async () => {
        const req = mockReq({
            body: {
                name: "Finn", email: `f${Date.now()}@t.io`, password: "Strong1!pw",
                roles: ["student"],
            },
        });
        const res = mockRes();
        await authController.register(req, res);
        const body = res.json.mock.results[0].value;
        const decoded = jwt.verify(body.token, process.env.JWT_SECRET);
        expect(new Set(decoded.roles)).toEqual(new Set(["peer_learner", "student"]));
        expect(decoded.rolesVersion).toBe(0);
    });
});

// ── LOGIN ─────────────────────────────────────────────────────────────────

describe("authController.login — response shape + JWT", () => {
    test("login response includes user with roles", async () => {
        const u = await createUser({ roles: ["peer_learner", "mentor"], rolesVersion: 3 });
        // bcrypt is a real dep — set a known password by hashing inline.
        const bcrypt = require("bcrypt");
        u.password = await bcrypt.hash("Strong1!pw", 4);
        await u.save();

        const req = mockReq({ body: { email: u.email, password: "Strong1!pw" } });
        const res = mockRes();
        await authController.login(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        const body = res.json.mock.results[0].value;
        expect(new Set(body.user.roles)).toEqual(new Set(["peer_learner", "mentor"]));
        expect(body.user.rolesVersion).toBe(3);
    });
});

// ── updateMyRoles (PATCH /api/user/roles) ─────────────────────────────────

describe("userController.updateMyRoles — toggle API", () => {
    test("bumps rolesVersion and re-mints a token on a real change", async () => {
        const u = await createUser({ roles: ["peer_learner"], rolesVersion: 0 });
        const req = mockReq({
            user: { _id: u._id, id: u._id, roles: u.roles, rolesVersion: 0 },
            body: { roles: ["peer_learner", "student"] },
        });
        const res = mockRes();
        await userController.updateMyRoles(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        const body = res.json.mock.results[0].value;
        expect(new Set(body.roles)).toEqual(new Set(["peer_learner", "student"]));
        expect(body.rolesVersion).toBe(1);
        const decoded = jwt.verify(body.token, process.env.JWT_SECRET);
        expect(decoded.rolesVersion).toBe(1);
    });

    test("rejects an empty array with 422", async () => {
        const u = await createUser();
        const req = mockReq({
            user: { _id: u._id, id: u._id, roles: u.roles, rolesVersion: 0 },
            body: { roles: [] },
        });
        const res = mockRes();
        await userController.updateMyRoles(req, res);
        expect(res.status).toHaveBeenCalledWith(422);
        expect(res.json.mock.results[0].value.code).toBe("EMPTY_ROLES");
    });

    test("rejects an unknown role with 400", async () => {
        const u = await createUser();
        const req = mockReq({
            user: { _id: u._id, id: u._id, roles: u.roles, rolesVersion: 0 },
            body: { roles: ["peer_learner", "wizard"] },
        });
        const res = mockRes();
        await userController.updateMyRoles(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json.mock.results[0].value.code).toBe("UNKNOWN_ROLE");
    });

    test("no-op fast path: same set returns 200 without bumping version", async () => {
        const u = await createUser({ roles: ["peer_learner", "mentor"], rolesVersion: 7 });
        const req = mockReq({
            user: { _id: u._id, id: u._id, roles: u.roles, rolesVersion: 7 },
            body: { roles: ["peer_learner", "mentor"] },
        });
        const res = mockRes();
        await userController.updateMyRoles(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        const body = res.json.mock.results[0].value;
        expect(body.rolesVersion).toBe(7); // unchanged
        expect(res.json.mock.results[0].value.message).toBe("Roles unchanged");
    });

    test("blocks mentor-add when a SUSPENDED MentorProfile exists", async () => {
        const u = await createUser({ roles: ["peer_learner", "student"], rolesVersion: 0 });
        await MentorProfile.create({
            userId: u._id,
            applicationStatus: "suspended",
            headline: "Old",
            hourlyRateInr: 1000,
            payoutMultiplier: 0.85,
        });
        const req = mockReq({
            user: { _id: u._id, id: u._id, roles: u.roles, rolesVersion: 0 },
            body: { roles: ["peer_learner", "student", "mentor"] },
        });
        const res = mockRes();
        await userController.updateMyRoles(req, res);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json.mock.results[0].value.code).toBe("MENTOR_SUSPENDED");
    });

    test("allows mentor-add when no MentorProfile exists yet", async () => {
        const u = await createUser({ roles: ["peer_learner"], rolesVersion: 0 });
        const req = mockReq({
            user: { _id: u._id, id: u._id, roles: u.roles, rolesVersion: 0 },
            body: { roles: ["peer_learner", "mentor"] },
        });
        const res = mockRes();
        await userController.updateMyRoles(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
    });
});

// ── auth middleware ROLES_STALE ────────────────────────────────────────────

describe("auth middleware — ROLES_STALE detection", () => {
    test("401 with code ROLES_STALE when JWT's rolesVersion lags the DB", async () => {
        const u = await createUser({ roles: ["peer_learner"], rolesVersion: 5 });
        // Mint a token with the OLD version (0) so the DB row's 5 is "ahead".
        const staleToken = jwt.sign(
            { id: u._id, roles: ["peer_learner"], rolesVersion: 0 },
            process.env.JWT_SECRET
        );
        const req = { header: () => `Bearer ${staleToken}` };
        const res = mockRes();
        const next = jest.fn();
        await auth(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json.mock.results[0].value.code).toBe("ROLES_STALE");
        expect(next).not.toHaveBeenCalled();
    });

    test("passes through when JWT's rolesVersion matches the DB", async () => {
        const u = await createUser({ roles: ["peer_learner", "mentor"], rolesVersion: 2 });
        const freshToken = jwt.sign(
            { id: u._id, roles: ["peer_learner", "mentor"], rolesVersion: 2 },
            process.env.JWT_SECRET
        );
        const req = { header: () => `Bearer ${freshToken}` };
        const res = mockRes();
        const next = jest.fn();
        await auth(req, res, next);
        expect(next).toHaveBeenCalled();
        expect(req.user.roles).toEqual(["peer_learner", "mentor"]);
        expect(req.user.rolesVersion).toBe(2);
        expect(req.user.rolesStale).toBe(false);
    });

    test("lets GET /user/roles through when stale (so the controller can mint a fresh token)", async () => {
        const u = await createUser({ roles: ["peer_learner"], rolesVersion: 9 });
        const staleToken = jwt.sign(
            { id: u._id, roles: ["peer_learner"], rolesVersion: 0 },
            process.env.JWT_SECRET
        );
        // auth middleware only inspects req.method + req.path for the bypass
        // check — the real Express router sets these; the mock just needs the
        // same shape.
        const req = {
            header: () => `Bearer ${staleToken}`,
            method: "GET",
            path: "/user/roles",
        };
        const res = mockRes();
        const next = jest.fn();
        await auth(req, res, next);
        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
        expect(req.user.roles).toEqual(["peer_learner"]);
        expect(req.user.rolesVersion).toBe(9);
        expect(req.user.rolesStale).toBe(true);
    });
});

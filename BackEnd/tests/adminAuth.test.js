/**
 * adminAuth.test.js — the requireAdmin gate, both auth paths.
 *
 * (a) cookie path: ssctl_sid cookie + CSRF double-submit on mutations.
 * (b) bearer path: Authorization header (split-deploy fallback when the
 *     browser blocks third-party cookies) — no CSRF needed by construction.
 * Every failure must be a bare 404 (cloaked), never 401/403.
 */
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

process.env.ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || "test-admin-secret";

const User = require("../models/user");
const { requireAdmin } = require("../middleware/adminAuth");
const { signAdminToken } = require("../utils/adminCrypto");

function mockRes() {
    return {
        statusCode: 200,
        ended: false,
        status(c) { this.statusCode = c; return this; },
        end() { this.ended = true; return this; },
        json(b) { this.body = b; return this; },
    };
}

const run = (req) => new Promise((resolve) => {
    const res = mockRes();
    requireAdmin(req, res, () => resolve({ next: true, res, req }));
    // requireAdmin is async; give the 404 path a beat to land.
    setTimeout(() => resolve({ next: false, res, req }), 300);
});

let mongoServer;
let adminUser;
let sessionToken;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    adminUser = await User.create({
        name: "Admin", email: "admin@test.com", password: "password123",
        role: "admin", status: "active", admin: { tokenVersion: 0 },
    });
    sessionToken = signAdminToken(
        { sub: String(adminUser._id), tv: 0, purpose: "session" },
        { expiresIn: "10m" }
    );
});
afterAll(async () => { await mongoose.disconnect(); await mongoServer.stop(); });

describe("requireAdmin — cookie path", () => {
    it("accepts the session cookie on GET", async () => {
        const { next } = await run({ method: "GET", headers: { cookie: `ssctl_sid=${sessionToken}` } });
        expect(next).toBe(true);
    });

    it("rejects a mutation without matching CSRF (404, cloaked)", async () => {
        const { next, res } = await run({ method: "POST", headers: { cookie: `ssctl_sid=${sessionToken}` } });
        expect(next).toBe(false);
        expect(res.statusCode).toBe(404);
    });

    it("accepts a mutation when CSRF cookie === header", async () => {
        const { next } = await run({
            method: "POST",
            headers: { cookie: `ssctl_sid=${sessionToken}; ssctl_csrf=tok123`, "x-ssctl-csrf": "tok123" },
        });
        expect(next).toBe(true);
    });
});

describe("requireAdmin — bearer path (split-deploy fallback)", () => {
    it("accepts Authorization: Bearer with no cookies at all", async () => {
        const { next, req } = await run({ method: "GET", headers: { authorization: `Bearer ${sessionToken}` } });
        expect(next).toBe(true);
        expect(String(req.adminUser._id)).toBe(String(adminUser._id));
    });

    it("accepts mutations via bearer WITHOUT CSRF (header auth is CSRF-immune)", async () => {
        const { next } = await run({ method: "POST", headers: { authorization: `Bearer ${sessionToken}` } });
        expect(next).toBe(true);
    });

    it("rejects a garbage bearer token with a bare 404", async () => {
        const { next, res } = await run({ method: "GET", headers: { authorization: "Bearer not-a-jwt" } });
        expect(next).toBe(false);
        expect(res.statusCode).toBe(404);
    });

    it("rejects a USER-purpose token minted with the admin secret", async () => {
        const wrongPurpose = signAdminToken({ sub: String(adminUser._id), tv: 0, purpose: "totp_pending" }, { expiresIn: "10m" });
        const { next, res } = await run({ method: "GET", headers: { authorization: `Bearer ${wrongPurpose}` } });
        expect(next).toBe(false);
        expect(res.statusCode).toBe(404);
    });

    it("rejects a revoked session (tokenVersion bumped)", async () => {
        await User.updateOne({ _id: adminUser._id }, { $inc: { "admin.tokenVersion": 1 } });
        const { next, res } = await run({ method: "GET", headers: { authorization: `Bearer ${sessionToken}` } });
        expect(next).toBe(false);
        expect(res.statusCode).toBe(404);
        await User.updateOne({ _id: adminUser._id }, { $set: { "admin.tokenVersion": 0 } });
    });

    it("rejects a non-admin user's token", async () => {
        const civilian = await User.create({ name: "Civ", email: "civ@test.com", password: "password123", role: "user", status: "active" });
        const civToken = signAdminToken({ sub: String(civilian._id), tv: 0, purpose: "session" }, { expiresIn: "10m" });
        const { next, res } = await run({ method: "GET", headers: { authorization: `Bearer ${civToken}` } });
        expect(next).toBe(false);
        expect(res.statusCode).toBe(404);
    });
});

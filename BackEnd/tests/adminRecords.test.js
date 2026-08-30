const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const User = require("../models/user");
const Skill = require("../models/skill");
const Connection = require("../models/Connection");
const AuditLog = require("../models/AuditLog");
const records = require("../controllers/adminRecordsController");

function mockRes() {
    return {
        statusCode: 200,
        body: null,
        status(c) { this.statusCode = c; return this; },
        json(b) { this.body = b; return this; },
        end() { return this; },
    };
}
const adminReq = (params, body = {}) => ({
    params,
    body,
    query: {},
    adminUser: { _id: new mongoose.Types.ObjectId(), email: "admin@test" },
    headers: {},
});

let mongoServer;
beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
});
afterAll(async () => { await mongoose.disconnect(); await mongoServer.stop(); });
afterEach(async () => {
    for (const key in mongoose.connection.collections) await mongoose.connection.collections[key].deleteMany();
});

describe("adminRecordsController deletion pipeline", () => {
    it("softDelete sets status, deletedAt/By and a far-future ban, and is restorable", async () => {
        const u = await User.create({ name: "Target", email: "t@test.com", password: "password123" });
        const res = mockRes();
        await records.softDelete(adminReq({ id: String(u._id) }, { reason: "spam" }), res);
        expect(res.statusCode).toBe(200);
        expect(res.body.ok).toBe(true);

        const after = await User.findById(u._id).select("status deletedAt deletedBy bannedUntil").lean();
        expect(after.status).toBe("soft_deleted");
        expect(after.deletedAt).toBeTruthy();
        expect(after.bannedUntil.getFullYear()).toBe(9999);

        const res2 = mockRes();
        await records.restore(adminReq({ id: String(u._id) }), res2);
        const restored = await User.findById(u._id).select("status deletedAt bannedUntil").lean();
        expect(restored.status).toBe("active");
        expect(restored.deletedAt).toBeNull();
        expect(restored.bannedUntil).toBeNull();
    });

    it("softDelete refuses admins and self", async () => {
        const adm = await User.create({ name: "Adm", email: "a@test.com", password: "password123", role: "admin" });
        const res = mockRes();
        await records.softDelete(adminReq({ id: String(adm._id) }), res);
        expect(res.statusCode).toBe(400);

        const self = adminReq({ id: "x" });
        self.params.id = String(self.adminUser._id);
        const res2 = mockRes();
        await records.softDelete(self, res2);
        expect(res2.statusCode).toBe(400);
    });

    it("hardDelete erases the user and cascade docs when email confirmation matches", async () => {
        const u = await User.create({ name: "Gone", email: "gone@test.com", password: "password123" });
        const other = await User.create({ name: "Other", email: "o@test.com", password: "password123" });
        const sk = await Skill.create({ userId: u._id, skillOffered: "JS", skillWanted: "Py", description: "d" });
        await Connection.create({ requester: u._id, receiver: other._id, skill: sk._id, status: "accepted" });

        const res = mockRes();
        await records.hardDelete(adminReq({ id: String(u._id) }, { confirmEmail: "GONE@test.com ", reason: "gdpr" }), res);
        expect(res.statusCode).toBe(200);
        expect(res.body.ok).toBe(true);

        expect(await User.findById(u._id)).toBeNull();
        expect(await Skill.countDocuments({ userId: u._id })).toBe(0);
        expect(await Connection.countDocuments({ requester: u._id })).toBe(0);
        const auditRows = await AuditLog.find({ action: "records.hardDelete" }).lean();
        expect(auditRows).toHaveLength(1);
    });

    it("hardDelete rejects a wrong confirmation email and a missing reason", async () => {
        const u = await User.create({ name: "Stay", email: "stay@test.com", password: "password123" });
        const r1 = mockRes();
        await records.hardDelete(adminReq({ id: String(u._id) }, { confirmEmail: "wrong@test.com", reason: "x" }), r1);
        expect(r1.statusCode).toBe(400);

        const r2 = mockRes();
        await records.hardDelete(adminReq({ id: String(u._id) }, { confirmEmail: "stay@test.com" }), r2);
        expect(r2.statusCode).toBe(400);

        expect(await User.findById(u._id)).not.toBeNull();
    });
});

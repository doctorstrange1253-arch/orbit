const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const User = require("../models/user");
const Message = require("../models/Message");
const Report = require("../models/Report");
const trust = require("../controllers/trustController");
const messages = require("../controllers/messageController");

function mockRes() {
    return { statusCode: 200, body: null, status(c) { this.statusCode = c; return this; }, json(b) { this.body = b; return this; } };
}
const reqAs = (userId, over = {}) => ({ body: {}, params: {}, query: {}, user: { id: String(userId) }, ...over });

let mongoServer;
let alice, bob;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
});
afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});
beforeEach(async () => {
    await Promise.all([User.deleteMany({}), Message.deleteMany({}), Report.deleteMany({})]);
    alice = await User.create({ name: "Alice", email: `a${Date.now()}@t.com`, password: "hashhashhash" });
    bob = await User.create({ name: "Bob", email: `b${Date.now()}@t.com`, password: "hashhashhash" });
});

describe("reportUser (POST /trust/report)", () => {
    it("files a moderation report, bumps reportCount and returns 200", async () => {
        const res = mockRes();
        await trust.reportUser(reqAs(alice._id, { body: { userId: String(bob._id), reason: "spam messages" } }), res);
        expect(res.statusCode).toBe(200);
        const rows = await Report.find({ targetUserId: bob._id });
        expect(rows.length).toBe(1);
        expect(rows[0].reason).toBe("spam messages");
        expect(String(rows[0].reporterId)).toBe(String(alice._id));
        const bobAfter = await User.findById(bob._id);
        expect(bobAfter.reportCount).toBe(1);
    });

    it("rejects self-report and missing userId", async () => {
        const r1 = mockRes();
        await trust.reportUser(reqAs(alice._id, { body: { userId: String(alice._id), reason: "x" } }), r1);
        expect(r1.statusCode).toBe(400);
        const r2 = mockRes();
        await trust.reportUser(reqAs(alice._id, { body: { reason: "x" } }), r2);
        expect(r2.statusCode).toBe(400);
    });

    it("defaults the reason when blank so the queue row is never invalid", async () => {
        const res = mockRes();
        await trust.reportUser(reqAs(alice._id, { body: { userId: String(bob._id), reason: "   " } }), res);
        expect(res.statusCode).toBe(200);
        const row = await Report.findOne({ targetUserId: bob._id });
        expect(row.reason).toBe("No reason given");
    });
});

describe("clearConversation (DELETE /messages/conversation/:userId)", () => {
    it("hides the whole thread for the requester only", async () => {
        await Message.create({ sender: alice._id, receiver: bob._id, content: "hi bob" });
        await Message.create({ sender: bob._id, receiver: alice._id, content: "hi alice" });

        const res = mockRes();
        await messages.clearConversation(reqAs(alice._id, { params: { userId: String(bob._id) } }), res);
        expect(res.statusCode).toBe(200);

        const forAlice = await Message.find({
            $or: [{ sender: alice._id, receiver: bob._id }, { sender: bob._id, receiver: alice._id }],
            deletedFor: { $ne: alice._id },
        });
        expect(forAlice.length).toBe(0);

        const forBob = await Message.find({
            $or: [{ sender: alice._id, receiver: bob._id }, { sender: bob._id, receiver: alice._id }],
            deletedFor: { $ne: bob._id },
        });
        expect(forBob.length).toBe(2);
    });

    it("hard-deletes messages once BOTH sides cleared them", async () => {
        await Message.create({ sender: alice._id, receiver: bob._id, content: "ephemeral" });
        await messages.clearConversation(reqAs(alice._id, { params: { userId: String(bob._id) } }), mockRes());
        await messages.clearConversation(reqAs(bob._id, { params: { userId: String(alice._id) } }), mockRes());
        const left = await Message.countDocuments({
            $or: [{ sender: alice._id, receiver: bob._id }, { sender: bob._id, receiver: alice._id }],
        });
        expect(left).toBe(0);
    });

    it("cleared messages stay hidden from getConversation for the clearer", async () => {
        await Message.create({ sender: bob._id, receiver: alice._id, content: "old text" });
        await messages.clearConversation(reqAs(alice._id, { params: { userId: String(bob._id) } }), mockRes());
        const res = mockRes();
        await messages.getConversation(reqAs(alice._id, { params: { userId: String(bob._id) } }), res);
        expect(res.statusCode).toBe(200);
        const list = res.body.messages || res.body;
        expect(Array.isArray(list)).toBe(true);
        expect(list.length).toBe(0);
    });
});

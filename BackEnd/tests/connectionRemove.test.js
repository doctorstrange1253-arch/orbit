const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const User = require("../models/user");
const Skill = require("../models/skill");
const Connection = require("../models/Connection");
const ctrl = require("../controllers/connectionController");

function mockRes() {
    return { statusCode: 200, body: null, status(c) { this.statusCode = c; return this; }, json(b) { this.body = b; return this; } };
}
const reqAs = (userId, over = {}) => ({
    body: {}, params: {}, query: {},
    user: { id: String(userId) },
    app: { get: () => null },
    ...over,
});

let mongoServer;
let alice, bob, carol, skill;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
});
afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});
beforeEach(async () => {
    await Promise.all([User.deleteMany({}), Skill.deleteMany({}), Connection.deleteMany({})]);
    alice = await User.create({ name: "Alice", email: `a${Date.now()}@t.com`, password: "hashhashhash" });
    bob = await User.create({ name: "Bob", email: `b${Date.now()}@t.com`, password: "hashhashhash" });
    carol = await User.create({ name: "Carol", email: `c${Date.now()}@t.com`, password: "hashhashhash" });
    skill = await Skill.create({ userId: alice._id, skillOffered: "JS", skillWanted: "Py", description: "d" });
});

describe("removeConnection (DELETE /connections/:id)", () => {
    it("lets the requester unfriend an accepted connection", async () => {
        const conn = await Connection.create({ requester: alice._id, receiver: bob._id, skill: skill._id, status: "accepted" });
        const res = mockRes();
        await ctrl.removeConnection(reqAs(alice._id, { params: { id: String(conn._id) } }), res);
        expect(res.statusCode).toBe(200);
        expect(await Connection.findById(conn._id)).toBeNull();
    });

    it("lets the receiver unfriend too, and works for completed swaps", async () => {
        const conn = await Connection.create({ requester: alice._id, receiver: bob._id, skill: skill._id, status: "completed" });
        const res = mockRes();
        await ctrl.removeConnection(reqAs(bob._id, { params: { id: String(conn._id) } }), res);
        expect(res.statusCode).toBe(200);
        expect(await Connection.findById(conn._id)).toBeNull();
    });

    it("refuses pending connections (cancel/decline own those flows)", async () => {
        const conn = await Connection.create({ requester: alice._id, receiver: bob._id, skill: skill._id, status: "pending" });
        const res = mockRes();
        await ctrl.removeConnection(reqAs(alice._id, { params: { id: String(conn._id) } }), res);
        expect(res.statusCode).toBe(400);
        expect(await Connection.findById(conn._id)).not.toBeNull();
    });

    it("404s for a user who is not part of the connection", async () => {
        const conn = await Connection.create({ requester: alice._id, receiver: bob._id, skill: skill._id, status: "accepted" });
        const res = mockRes();
        await ctrl.removeConnection(reqAs(carol._id, { params: { id: String(conn._id) } }), res);
        expect(res.statusCode).toBe(404);
        expect(await Connection.findById(conn._id)).not.toBeNull();
    });

    it("notifies the other user's room via socket", async () => {
        const conn = await Connection.create({ requester: alice._id, receiver: bob._id, skill: skill._id, status: "accepted" });
        const emitted = [];
        const io = { to: (room) => ({ emit: (event, payload) => emitted.push({ room, event, payload }) }) };
        const res = mockRes();
        await ctrl.removeConnection(reqAs(alice._id, { params: { id: String(conn._id) }, app: { get: () => io } }), res);
        expect(res.statusCode).toBe(200);
        expect(emitted.length).toBe(1);
        expect(emitted[0].room).toBe(`user_${bob._id}`);
        expect(emitted[0].event).toBe("connection-removed");
        expect(emitted[0].payload.connectionId).toBe(String(conn._id));
    });
});

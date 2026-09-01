const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const User = require("../models/user");
const Skill = require("../models/skill");
const Connection = require("../models/Connection");
const Rating = require("../models/rating");
const MentorInvite = require("../models/MentorInvite");
const Notification = require("../models/Notification");
const { topSwapperScan, pendingInvite, respond } = require("../services/crossSoulService");

let mongoServer;
let alice, bob, carol, r1, r2;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

beforeEach(async () => {
    await Promise.all([
        User.deleteMany({}),
        Skill.deleteMany({}),
        Connection.deleteMany({}),
        Rating.deleteMany({}),
        MentorInvite.deleteMany({}),
        Notification.deleteMany({}),
    ]);
    const mk = (n) => User.create({ name: n, email: `${n.toLowerCase()}${Date.now()}${Math.random()}@t.com`, password: "hashhashhash" });
    alice = await mk("Alice");
    bob = await mk("Bob");
    carol = await mk("Carol");
    r1 = await mk("Rater1");
    r2 = await mk("Rater2");
});

// 10 completed swaps: alice↔bob (5) + alice↔carol (5).
async function seedSwaps() {
    const skills = await Skill.create(
        Array.from({ length: 10 }, (_, i) => ({
            userId: alice._id,
            skillOffered: `S${i}-${Date.now()}`,
            skillWanted: `W${i}-${Date.now()}`,
            description: "d",
        }))
    );
    const conns = [];
    for (let i = 0; i < 5; i += 1) {
        conns.push({ requester: alice._id, receiver: bob._id, skill: skills[i]._id, status: "completed", completedAt: new Date() });
        conns.push({ requester: alice._id, receiver: carol._id, skill: skills[i + 5]._id, status: "completed", completedAt: new Date() });
    }
    await Connection.create(conns);
}

describe("topSwapperScan", () => {
    it("invites a user with 10+ swaps and avg rating >= 4.5, counting BOTH participants", async () => {
        await seedSwaps();
        await Rating.create({ fromUser: r1._id, toUser: alice._id, score: 5 });
        await Rating.create({ fromUser: r2._id, toUser: alice._id, score: 4 });

        const r = await topSwapperScan();
        expect(r.invited).toBe(1);

        const invites = await MentorInvite.find({ kind: "top_swapper" }).lean();
        expect(invites).toHaveLength(1);
        expect(String(invites[0].userId)).toBe(String(alice._id));
        expect(invites[0].metrics.swaps).toBe(10);
        expect(invites[0].metrics.avgRating).toBeCloseTo(4.5);

        const notif = await Notification.findOne({ userId: alice._id, type: "mentor_invite" }).lean();
        expect(notif).toBeTruthy();
        expect(notif.data?.link).toBe("/mentor/apply");
    });

    it("skips users below the swap or rating thresholds", async () => {
        await seedSwaps();
        await Rating.create({ fromUser: r1._id, toUser: bob._id, score: 5 });
        const r = await topSwapperScan();
        expect(r.invited).toBe(0);
        expect(await MentorInvite.countDocuments({})).toBe(0);
    });

    it("never invites a mentor", async () => {
        await seedSwaps();
        await Rating.create({ fromUser: r1._id, toUser: alice._id, score: 5 });
        await Rating.create({ fromUser: r2._id, toUser: alice._id, score: 5 });
        await User.updateOne({ _id: alice._id }, { $addToSet: { roles: "mentor" } });
        const r = await topSwapperScan();
        expect(r.invited).toBe(0);
    });

    it("respects the 90-day cooldown on re-run", async () => {
        await seedSwaps();
        await Rating.create({ fromUser: r1._id, toUser: alice._id, score: 5 });
        await Rating.create({ fromUser: r2._id, toUser: alice._id, score: 5 });
        const first = await topSwapperScan();
        expect(first.invited).toBe(1);
        const second = await topSwapperScan();
        expect(second.invited).toBe(0);
        expect(await MentorInvite.countDocuments({ kind: "top_swapper" })).toBe(1);
    });
});

describe("pendingInvite + respond", () => {
    it("returns the pending invite; dismiss sets cooldownUntil and clears pending", async () => {
        await MentorInvite.create({ userId: alice._id, kind: "top_student", metrics: { xp: 1200, level: 7 } });

        const pending = await pendingInvite(alice._id);
        expect(pending).toBeTruthy();
        expect(pending.kind).toBe("top_student");

        await respond(alice._id, "top_student", "dismissed");
        expect(await pendingInvite(alice._id)).toBeNull();

        const row = await MentorInvite.findOne({ userId: alice._id }).lean();
        expect(row.status).toBe("dismissed");
        expect(row.cooldownUntil.getTime()).toBeGreaterThan(Date.now());
    });

    it("ignores invalid actions", async () => {
        await MentorInvite.create({ userId: alice._id, kind: "top_swapper", metrics: {} });
        const out = await respond(alice._id, "top_swapper", "maybe");
        expect(out).toBeNull();
        const row = await MentorInvite.findOne({ userId: alice._id }).lean();
        expect(row.status).toBe("pending");
    });
});

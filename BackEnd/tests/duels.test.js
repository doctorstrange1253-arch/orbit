const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

const duels = require("../services/duels");
const { addDuelPoints } = require("../services/duelScoring");
const Duel = require("../models/Duel");
const User = require("../models/user");
const Connection = require("../models/Connection");
const PhotonLedger = require("../models/PhotonLedger");
const controller = require("../controllers/duelController");
const { isoWeekId } = require("../services/orbitActivity");

const A = new mongoose.Types.ObjectId();
const B = new mongoose.Types.ObjectId();

const duelDoc = (over = {}) => ({
    _id: new mongoose.Types.ObjectId(),
    weekId: "2026-W36",
    challenger: { userId: A, score: 0 },
    opponent: { userId: B, score: 0 },
    status: "active",
    winnerId: null,
    draw: false,
    ...over,
});

describe("duels service — pure", () => {
    it("gives the week to whoever scored more", () => {
        const win = duels.settle(duelDoc({ challenger: { userId: A, score: 90 }, opponent: { userId: B, score: 40 } }));
        expect(String(win.winnerId)).toBe(String(A));
        expect(win.draw).toBe(false);
        expect(win.payoutPhotons).toBe(duels.WIN_PHOTONS);

        const loss = duels.settle(duelDoc({ challenger: { userId: A, score: 10 }, opponent: { userId: B, score: 11 } }));
        expect(String(loss.winnerId)).toBe(String(B));
    });

    it("calls an equal week a draw and still pays both sides", () => {
        const drew = duels.settle(duelDoc({ challenger: { userId: A, score: 55 }, opponent: { userId: B, score: 55 } }));
        expect(drew.draw).toBe(true);
        expect(drew.winnerId).toBeNull();
        expect(drew.payoutPhotons).toBe(duels.DRAW_PHOTONS);
        expect(duels.settle(duelDoc()).draw).toBe(true);
    });

    it("reads the outcome from each side", () => {
        const settled = duelDoc({ status: "settled", winnerId: A });
        expect(duels.outcomeFor(settled, A)).toBe("won");
        expect(duels.outcomeFor(settled, B)).toBe("lost");
        expect(duels.outcomeFor({ ...settled, draw: true, winnerId: null }, A)).toBe("drew");
        expect(duels.outcomeFor(duelDoc({ status: "active" }), A)).toBeNull();
    });

    it("always puts the reader first, whichever side they are", () => {
        const d = duelDoc({ challenger: { userId: A, score: 12 }, opponent: { userId: B, score: 7 } });
        const names = new Map([[String(B), { name: "Bea", avatar: "" }], [String(A), { name: "Ash", avatar: "" }]]);
        const asA = duels.shapeDuel(d, A, names);
        expect(asA.you.score).toBe(12);
        expect(asA.them.score).toBe(7);
        expect(asA.them.name).toBe("Bea");
        expect(asA.iChallenged).toBe(true);

        const asB = duels.shapeDuel(d, B, names);
        expect(asB.you.score).toBe(7);
        expect(asB.them.name).toBe("Ash");
        expect(asB.iChallenged).toBe(false);
    });

    it("tallies a record from settled duels only", () => {
        const record = duels.recordFrom([
            duelDoc({ status: "settled", winnerId: A }),
            duelDoc({ status: "settled", winnerId: B }),
            duelDoc({ status: "settled", draw: true }),
            duelDoc({ status: "active" }),
        ], A);
        expect(record).toEqual({ won: 1, lost: 1, drew: 1 });
    });
});

describe("duels against the database", () => {
    let mongo;
    beforeAll(async () => {
        mongo = await MongoMemoryServer.create();
        await mongoose.connect(mongo.getUri());
        await Duel.init();
    });
    afterAll(async () => {
        await mongoose.disconnect();
        await mongo.stop();
    });
    afterEach(async () => {
        for (const key in mongoose.connection.collections) await mongoose.connection.collections[key].deleteMany();
    });

    const mockRes = () => ({
        statusCode: 200,
        body: null,
        status(c) { this.statusCode = c; return this; },
        json(b) { this.body = b; return this; },
    });
    const req = (userId, body = {}, params = {}) => ({ body, params, user: { id: String(userId) }, app: { get: () => null } });

    async function peer(name, stardust = 0) {
        return User.create({
            name,
            email: `${name}${Math.random().toString(36).slice(2, 8)}@t.co`,
            password: "hashhashhash",
            orbit: { stardust },
        });
    }

    async function connect(a, b) {
        return Connection.create({ requester: a._id, receiver: b._id, skill: new mongoose.Types.ObjectId(), status: "accepted" });
    }

    async function challengeAccepted(a, b) {
        await connect(a, b);
        const res = mockRes();
        await controller.challenge(req(a._id, { toUserId: String(b._id) }), res);
        const id = res.body.current._id;
        const answer = mockRes();
        await controller.respond(req(b._id, { accept: true }, { id }), answer);
        return id;
    }

    it("refuses a challenge to a stranger, to yourself, and to a bad id", async () => {
        const a = await peer("ash");
        const b = await peer("bea");

        const stranger = mockRes();
        await controller.challenge(req(a._id, { toUserId: String(b._id) }), stranger);
        expect(stranger.statusCode).toBe(403);
        expect(stranger.body.reason).toBe("not_connected");

        const self = mockRes();
        await controller.challenge(req(a._id, { toUserId: String(a._id) }), self);
        expect(self.body.reason).toBe("self");

        const bad = mockRes();
        await controller.challenge(req(a._id, { toUserId: "nope" }), bad);
        expect(bad.statusCode).toBe(400);
    });

    it("challenges a swap partner, and only they can answer", async () => {
        const a = await peer("ash");
        const b = await peer("bea");
        const c = await peer("cai");
        await connect(a, b);

        const res = mockRes();
        await controller.challenge(req(a._id, { toUserId: String(b._id) }), res);
        expect(res.statusCode).toBe(201);
        expect(res.body.current.status).toBe("pending");
        expect(res.body.current.iChallenged).toBe(true);
        expect(res.body.current.them.name).toBe("bea");
        const id = res.body.current._id;

        const wrongHand = mockRes();
        await controller.respond(req(c._id, { accept: true }, { id }), wrongHand);
        expect(wrongHand.statusCode).toBe(403);

        const challengerCannot = mockRes();
        await controller.respond(req(a._id, { accept: true }, { id }), challengerCannot);
        expect(challengerCannot.statusCode).toBe(403);

        const accepted = mockRes();
        await controller.respond(req(b._id, { accept: true }, { id }), accepted);
        expect(accepted.statusCode).toBe(200);
        expect(accepted.body.current.status).toBe("active");

        const again = mockRes();
        await controller.respond(req(b._id, { accept: true }, { id }), again);
        expect(again.statusCode).toBe(409);
    });

    it("declining closes the duel and frees the week", async () => {
        const a = await peer("ash");
        const b = await peer("bea");
        await connect(a, b);

        const res = mockRes();
        await controller.challenge(req(a._id, { toUserId: String(b._id) }), res);
        const declined = mockRes();
        await controller.respond(req(b._id, { accept: false }, { id: res.body.current._id }), declined);
        expect(declined.body.current).toBeNull();
        expect((await Duel.findById(res.body.current._id).lean()).status).toBe("declined");

        const retry = mockRes();
        await controller.challenge(req(b._id, { toUserId: String(a._id) }), retry);
        expect(retry.statusCode).toBe(201);
    });

    it("allows one live duel per person per week on each side", async () => {
        const a = await peer("ash");
        const b = await peer("bea");
        const c = await peer("cai");
        await connect(a, b);
        await connect(a, c);
        await connect(b, c);

        await challengeAccepted(a, b);

        const mine = mockRes();
        await controller.challenge(req(a._id, { toUserId: String(c._id) }), mine);
        expect(mine.statusCode).toBe(409);
        expect(mine.body.reason).toBe("already_duelling");

        const theirs = mockRes();
        await controller.challenge(req(c._id, { toUserId: String(b._id) }), theirs);
        expect(theirs.statusCode).toBe(409);
        expect(theirs.body.reason).toBe("opponent_busy");
    });

    it("scores each side independently and only while the duel is active", async () => {
        const a = await peer("ash");
        const b = await peer("bea");
        await connect(a, b);
        const week = isoWeekId(new Date());

        const pending = mockRes();
        await controller.challenge(req(a._id, { toUserId: String(b._id) }), pending);
        expect(await addDuelPoints(a._id, 10, week)).toBe(false);

        await controller.respond(req(b._id, { accept: true }, { id: pending.body.current._id }), mockRes());
        expect(await addDuelPoints(a._id, 10, week)).toBe(true);
        expect(await addDuelPoints(a._id, 5, week)).toBe(true);
        expect(await addDuelPoints(b._id, 7, week)).toBe(true);
        expect(await addDuelPoints(a._id, 9, "1999-W01")).toBe(false);

        const row = await Duel.findById(pending.body.current._id).lean();
        expect(row.challenger.score).toBe(15);
        expect(row.opponent.score).toBe(7);

        const read = mockRes();
        await controller.mine(req(b._id), read);
        expect(read.body.current.you.score).toBe(7);
        expect(read.body.current.them.score).toBe(15);
        expect(read.body.winPhotons).toBe(duels.WIN_PHOTONS);
    });

    it("settles last week's duel on the next read, pays the winner once, and logs it", async () => {
        const a = await peer("ash");
        const b = await peer("bea");
        await connect(a, b);
        const id = await challengeAccepted(a, b);
        await Duel.updateOne({ _id: id }, {
            $set: { weekId: "2001-W01", "challenger.score": 120, "opponent.score": 60 },
        });

        const read = mockRes();
        await controller.mine(req(a._id), read);
        expect(read.body.current).toBeNull();
        expect(read.body.history).toHaveLength(1);
        expect(read.body.history[0].outcome).toBe("won");
        expect(read.body.record).toEqual({ won: 1, lost: 0, drew: 0 });

        const winner = await User.findById(a._id).select("orbit.stardust").lean();
        const loser = await User.findById(b._id).select("orbit.stardust").lean();
        expect(winner.orbit.stardust).toBe(duels.WIN_PHOTONS);
        expect(loser.orbit.stardust).toBe(0);

        const secondRead = mockRes();
        await controller.mine(req(b._id), secondRead);
        expect(secondRead.body.history[0].outcome).toBe("lost");
        const stillOnce = await User.findById(a._id).select("orbit.stardust").lean();
        expect(stillOnce.orbit.stardust).toBe(duels.WIN_PHOTONS);

        for (let i = 0; i < 40 && !(await PhotonLedger.countDocuments({ userId: a._id })); i += 1) {
            await new Promise((r) => setTimeout(r, 15));
        }
        const rows = await PhotonLedger.find({ userId: a._id }).lean();
        expect(rows).toHaveLength(1);
        expect(rows[0].source).toBe("duel_settled");
        expect(rows[0].delta).toBe(duels.WIN_PHOTONS);
    });

    it("pays both sides of a drawn week", async () => {
        const a = await peer("ash");
        const b = await peer("bea");
        await connect(a, b);
        const id = await challengeAccepted(a, b);
        await Duel.updateOne({ _id: id }, { $set: { weekId: "2001-W02", "challenger.score": 44, "opponent.score": 44 } });

        await controller.mine(req(a._id), mockRes());
        const first = await User.findById(a._id).select("orbit.stardust").lean();
        const second = await User.findById(b._id).select("orbit.stardust").lean();
        expect(first.orbit.stardust).toBe(duels.DRAW_PHOTONS);
        expect(second.orbit.stardust).toBe(duels.DRAW_PHOTONS);
        expect((await Duel.findById(id).lean()).draw).toBe(true);
    });

    it("expires a challenge nobody answered, and lets the week start clean", async () => {
        const a = await peer("ash");
        const b = await peer("bea");
        await connect(a, b);
        const res = mockRes();
        await controller.challenge(req(a._id, { toUserId: String(b._id) }), res);
        await Duel.updateOne({ _id: res.body.current._id }, { $set: { weekId: "2001-W03" } });

        const read = mockRes();
        await controller.mine(req(a._id), read);
        expect(read.body.current).toBeNull();
        expect((await Duel.findById(res.body.current._id).lean()).status).toBe("expired");
        expect(await User.findById(a._id).select("orbit.stardust").lean().then((u) => u.orbit.stardust)).toBe(0);

        const fresh = mockRes();
        await controller.challenge(req(a._id, { toUserId: String(b._id) }), fresh);
        expect(fresh.statusCode).toBe(201);
    });
});

const {
    pickDailyQuest,
    rollDailyQuest,
    applyDailyProgress,
    claimDailyQuest,
    questsToNextShield,
    DAILY_TEMPLATES,
    DAILY_SHIELD_EVERY,
    FREEZE_CAP,
} = require("../services/orbitEngine");

const DAY = "2026-09-03";
const NEXT = "2026-09-04";
const LATER = "2026-09-06";

function questFor(day, over = {}) {
    return { ...rollDailyQuest(null, day).quest, ...over };
}

describe("orbitEngine — daily quest is the same for everyone, all day", () => {
    it("picks one template deterministically from the day string", () => {
        const a = pickDailyQuest(DAY);
        const b = pickDailyQuest(DAY);
        expect(a.key).toBe(b.key);
        expect(DAILY_TEMPLATES).toContain(a);
    });

    it("gives different days different quests across a week", () => {
        const week = ["2026-09-01", "2026-09-02", "2026-09-03", "2026-09-04", "2026-09-05", "2026-09-06", "2026-09-07"];
        const keys = new Set(week.map((d) => pickDailyQuest(d).key));
        expect(keys.size).toBeGreaterThan(1);
    });

    it("does not reroll on a reload within the same day", () => {
        const first = rollDailyQuest(null, DAY);
        expect(first.rolled).toBe(true);
        const again = rollDailyQuest(first.quest, DAY);
        expect(again.rolled).toBe(false);
        expect(again.quest).toBe(first.quest);
    });

    it("keeps progress made earlier in the day", () => {
        const q = applyDailyProgress(questFor(DAY), pickDailyQuest(DAY).metric, 1).quest;
        expect(rollDailyQuest(q, DAY).quest.progress).toBe(q.progress);
    });
});

describe("orbitEngine — daily quest progress", () => {
    it("bumps only its own metric and stops at the target", () => {
        const q = questFor(DAY, { metric: "swap", target: 2, progress: 0 });
        const wrongMetric = applyDailyProgress(q, "message", 1);
        expect(wrongMetric.quest.progress).toBe(0);
        expect(wrongMetric.completedNow).toBeNull();

        const once = applyDailyProgress(q, "swap", 1);
        expect(once.quest.progress).toBe(1);
        expect(once.completedNow).toBeNull();

        const twice = applyDailyProgress(once.quest, "swap", 5);
        expect(twice.quest.progress).toBe(2);
        expect(twice.completedNow).toBeTruthy();
    });

    it("reports completion exactly once", () => {
        const q = questFor(DAY, { metric: "swap", target: 1, progress: 0 });
        const first = applyDailyProgress(q, "swap", 1);
        expect(first.completedNow).toBeTruthy();
        const again = applyDailyProgress(first.quest, "swap", 1);
        expect(again.completedNow).toBeNull();
    });

    it("ignores progress once claimed", () => {
        const q = questFor(DAY, { metric: "swap", target: 2, progress: 2, claimed: true });
        expect(applyDailyProgress(q, "swap", 1).quest.progress).toBe(2);
    });
});

describe("orbitEngine — claiming the daily quest", () => {
    it("pays once and refuses a second claim", () => {
        const q = questFor(DAY, { metric: "swap", target: 1, progress: 1, stardust: 30 });
        const first = claimDailyQuest(q, DAY);
        expect(first.ok).toBe(true);
        expect(first.stardust).toBe(30);
        expect(first.quest.claimed).toBe(true);
        expect(first.quest.streak).toBe(1);

        const second = claimDailyQuest(first.quest, DAY);
        expect(second.ok).toBe(false);
        expect(second.reason).toBe("already_claimed");
        expect(second.stardust).toBe(0);
    });

    it("refuses an incomplete quest, a stale day and no quest at all", () => {
        expect(claimDailyQuest(questFor(DAY, { progress: 0, target: 2 }), DAY).reason).toBe("incomplete");
        expect(claimDailyQuest(questFor(DAY, { progress: 9, target: 1 }), NEXT).reason).toBe("stale");
        expect(claimDailyQuest(null, DAY).reason).toBe("no_quest");
    });
});

describe("orbitEngine — the streak shield is earned by turning up", () => {
    function claimStraight(days) {
        let quest = null;
        let shields = 0;
        for (let i = 0; i < days; i += 1) {
            const day = `2026-09-${String(i + 1).padStart(2, "0")}`;
            quest = rollDailyQuest(quest, day).quest;
            quest = { ...quest, progress: quest.target };
            const claimed = claimDailyQuest(quest, day);
            quest = claimed.quest;
            if (claimed.shieldEarned) shields += 1;
        }
        return { quest, shields };
    }

    it(`grants a Gravity Assist every ${DAILY_SHIELD_EVERY} consecutive claims`, () => {
        const four = claimStraight(DAILY_SHIELD_EVERY - 1);
        expect(four.shields).toBe(0);
        expect(four.quest.streak).toBe(DAILY_SHIELD_EVERY - 1);

        const five = claimStraight(DAILY_SHIELD_EVERY);
        expect(five.shields).toBe(1);
        expect(five.quest.streak).toBe(DAILY_SHIELD_EVERY);
        expect(five.quest.shieldsEarned).toBe(1);

        const ten = claimStraight(DAILY_SHIELD_EVERY * 2);
        expect(ten.shields).toBe(2);
        expect(ten.quest.shieldsEarned).toBe(2);
    });

    it("carries the count across a day that was claimed", () => {
        const claimed = claimDailyQuest(questFor(DAY, { progress: 1, target: 1 }), DAY);
        expect(rollDailyQuest(claimed.quest, NEXT).quest.streak).toBe(1);
    });

    it("drops the count when a day is skipped, and when a day is unclaimed", () => {
        const claimed = claimDailyQuest(questFor(DAY, { progress: 1, target: 1, streak: 3 }), DAY);
        expect(claimed.quest.streak).toBe(4);
        expect(rollDailyQuest(claimed.quest, LATER).quest.streak).toBe(0);

        const unclaimed = questFor(DAY, { progress: 0, target: 1, streak: 3 });
        expect(rollDailyQuest(unclaimed, NEXT).quest.streak).toBe(0);
    });

    it("keeps the lifetime shield tally through a reset", () => {
        const earned = claimStraight(DAILY_SHIELD_EVERY).quest;
        const afterGap = rollDailyQuest(earned, "2026-10-01").quest;
        expect(afterGap.streak).toBe(0);
        expect(afterGap.shieldsEarned).toBe(1);
    });

    it("counts down to the next shield", () => {
        expect(questsToNextShield({ streak: 0 })).toBe(DAILY_SHIELD_EVERY);
        expect(questsToNextShield({ streak: 1 })).toBe(DAILY_SHIELD_EVERY - 1);
        expect(questsToNextShield({ streak: DAILY_SHIELD_EVERY })).toBe(DAILY_SHIELD_EVERY);
        expect(questsToNextShield(null)).toBe(DAILY_SHIELD_EVERY);
    });
});

describe("POST /orbit/quest/claim — against the database", () => {
    const mongoose = require("mongoose");
    const { MongoMemoryServer } = require("mongodb-memory-server");
    const User = require("../models/user");
    const PhotonLedger = require("../models/PhotonLedger");
    const { claimDailyQuest: claimHandler, getMyOrbit } = require("../controllers/orbitController");
    const { utcDayStr, rollForward } = require("../services/orbitActivity");
    const thisWeek = () => rollForward({}, new Date()).weekId;

    let mongo;
    beforeAll(async () => {
        mongo = await MongoMemoryServer.create();
        await mongoose.connect(mongo.getUri());
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
    const req = (userId) => ({ body: {}, params: {}, user: { id: String(userId) }, app: { get: () => null } });

    async function seedUser(over = {}) {
        return User.create({
            name: "Quester",
            email: `q${Math.random().toString(36).slice(2, 9)}@test.io`,
            password: "hashhashhash",
            orbit: { stardust: 0, ...over },
        });
    }

    async function completeToday(userId, over = {}) {
        const today = utcDayStr(new Date());
        const { quest } = rollDailyQuest(null, today);
        const seeded = { ...quest, progress: quest.target, ...over };
        await User.updateOne({ _id: userId }, { $set: { "orbit.dailyQuest": seeded } });
        return { today, quest: { ...seeded, photons: seeded.stardust } };
    }

    it("hands the reader today's quest and self-heals it on first read", async () => {
        const user = await seedUser();
        const res = mockRes();
        await getMyOrbit(req(user._id), res);
        expect(res.body.dailyQuest).toBeTruthy();
        expect(res.body.dailyQuest.day).toBe(utcDayStr(new Date()));
        expect(res.body.dailyQuest.claimed).toBe(false);
        expect(res.body.dailyQuest.shieldEvery).toBe(DAILY_SHIELD_EVERY);
        expect(res.body.dailyQuest.toNextShield).toBe(DAILY_SHIELD_EVERY);
    });

    it("refuses a claim while the quest is unfinished", async () => {
        const user = await seedUser();
        await completeToday(user._id, { progress: 0 });
        const res = mockRes();
        await claimHandler(req(user._id), res);
        expect(res.statusCode).toBe(400);
        expect(res.body.reason).toBe("incomplete");
    });

    it("pays the quest, writes the ledger row, and refuses the replay", async () => {
        const user = await seedUser();
        const { quest } = await completeToday(user._id);

        const res = mockRes();
        await claimHandler(req(user._id), res);
        expect(res.statusCode).toBe(200);
        expect(res.body.awarded).toBe(quest.photons);
        expect(res.body.dailyQuest.claimed).toBe(true);
        expect(res.body.dailyQuest.streak).toBe(1);
        expect(res.body.shieldEarned).toBe(false);

        const after = await User.findById(user._id).select("orbit.stardust").lean();
        expect(after.orbit.stardust).toBe(quest.photons);

        const replay = mockRes();
        await claimHandler(req(user._id), replay);
        expect(replay.statusCode).toBe(400);
        expect(replay.body.reason).toBe("already_claimed");
        const stillOnce = await User.findById(user._id).select("orbit.stardust").lean();
        expect(stillOnce.orbit.stardust).toBe(quest.photons);

        for (let i = 0; i < 40 && !(await PhotonLedger.countDocuments({ userId: user._id })); i += 1) {
            await new Promise((r) => setTimeout(r, 15));
        }
        const rows = await PhotonLedger.find({ userId: user._id }).lean();
        expect(rows).toHaveLength(1);
        expect(rows[0].delta).toBe(quest.photons);
    });

    it("grants a Gravity Assist on the fifth consecutive claim", async () => {
        const user = await seedUser();
        const { today } = await completeToday(user._id, { streak: DAILY_SHIELD_EVERY - 1 });
        await User.updateOne({ _id: user._id }, { $set: { "orbit.freeze": { tokens: 0, lastGrantWeek: thisWeek() } } });

        const res = mockRes();
        await claimHandler(req(user._id), res);
        expect(res.statusCode).toBe(200);
        expect(res.body.shieldEarned).toBe(true);
        expect(res.body.dailyQuest.streak).toBe(DAILY_SHIELD_EVERY);
        expect(res.body.dailyQuest.shieldsEarned).toBe(1);
        expect(res.body.freeze.tokens).toBe(1);

        const after = await User.findById(user._id).select("orbit").lean();
        expect(after.orbit.freeze.tokens).toBe(1);
        expect(after.orbit.dailyQuest.day).toBe(today);
    });

    it("never banks a shield past the cap", async () => {
        const user = await seedUser();
        await completeToday(user._id, { streak: DAILY_SHIELD_EVERY - 1 });
        await User.updateOne({ _id: user._id }, { $set: { "orbit.freeze": { tokens: FREEZE_CAP, lastGrantWeek: thisWeek() } } });

        const res = mockRes();
        await claimHandler(req(user._id), res);
        expect(res.statusCode).toBe(200);
        expect(res.body.shieldEarned).toBe(false);
        expect(res.body.freeze.tokens).toBe(FREEZE_CAP);
        expect(res.body.dailyQuest.shieldsEarned).toBe(1);
    });
});

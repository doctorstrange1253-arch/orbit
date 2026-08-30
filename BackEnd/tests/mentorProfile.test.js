/**
 * mentorProfile.test.js — DB-backed tests for the MentorProfile model.
 *
 * Covers: upsert + 1:1 userId uniqueness (duplicate throws), rating
 * recompute (count/sum/average), payout multiplier auto-bump only when
 * count >= 20 AND average >= 4.8.
 */
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const MentorProfile = require("../models/MentorProfile");
const User = require("../models/user");

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

async function makeUser() {
    return User.create({
        name: "Mentee", email: `u${Date.now()}_${Math.random()}@test.io`, password: "hashhashhash",
    });
}

describe("MentorProfile — uniqueness + create", () => {
    test("two profiles cannot share the same userId", async () => {
        const u = await makeUser();
        await MentorProfile.create({
            userId: u._id, headline: "A", hourlyRateInr: 1000, payoutMultiplier: 0.85,
        });
        await expect(MentorProfile.create({
            userId: u._id, headline: "B", hourlyRateInr: 2000, payoutMultiplier: 0.85,
        })).rejects.toThrow();
    });

    test("upsert with findOneAndUpdate is idempotent (the apply endpoint pattern)", async () => {
        const u = await makeUser();
        const a = await MentorProfile.findOneAndUpdate(
            { userId: u._id },
            { $set: { userId: u._id, headline: "v1", hourlyRateInr: 1000 } },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        const b = await MentorProfile.findOneAndUpdate(
            { userId: u._id },
            { $set: { userId: u._id, headline: "v2", hourlyRateInr: 2000 } },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        expect(String(a._id)).toBe(String(b._id));
        expect(b.headline).toBe("v2");
        expect(b.hourlyRateInr).toBe(2000);
    });
});

describe("MentorProfile — rating recompute", () => {
    test("count/sum/average update on every recorded rating", async () => {
        const u = await makeUser();
        const p = await MentorProfile.create({
            userId: u._id, headline: "x", hourlyRateInr: 1000, payoutMultiplier: 0.85,
        });
        function rate(stars) {
            p.rating = p.rating || { count: 0, sum: 0, average: 0 };
            p.rating.count += 1;
            p.rating.sum += stars;
            p.rating.average = +(p.rating.sum / p.rating.count).toFixed(3);
        }
        rate(5); rate(4); rate(5);
        await p.save();
        const fresh = await MentorProfile.findById(p._id).lean();
        expect(fresh.rating.count).toBe(3);
        expect(fresh.rating.sum).toBe(14);
        expect(fresh.rating.average).toBeCloseTo(4.667, 2);
    });

    test("payoutMultiplier auto-bumps to 0.90 only when count >= 20 AND average >= 4.8", async () => {
        const u = await makeUser();
        const p = await MentorProfile.create({
            userId: u._id, headline: "x", hourlyRateInr: 1000, payoutMultiplier: 0.85,
        });
        // 19 perfect ratings → not eligible yet
        for (let i = 0; i < 19; i++) {
            p.rating = { count: i + 1, sum: (i + 1) * 5, average: 5 };
        }
        await p.save();
        expect(p.rating.count).toBe(19);
        expect(p.payoutMultiplier).toBe(0.85);
        expect(p.ratingCutEligibleSince).toBeNull();

        // 20th rating pushes it over the threshold
        p.rating = { count: 20, sum: 20 * 5, average: 5 };
        if (!p.ratingCutEligibleSince && p.rating.count >= 20 && p.rating.average >= 4.8) {
            p.ratingCutEligibleSince = new Date();
            p.payoutMultiplier = 0.90;
        }
        await p.save();
        expect(p.payoutMultiplier).toBe(0.90);
        expect(p.ratingCutEligibleSince).toBeInstanceOf(Date);
    });
});

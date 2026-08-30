/**
 * migrateUserRoles.test.js — DB-backed idempotency test.
 *
 * Verifies the backfill:
 *   1. Pre-migration user with no `roles` field gets `["peer_learner"]` + 0.
 *   2. Re-running the migration is a no-op (zero matched, zero modified).
 *   3. A pre-migration user whose `roles` is an empty array also gets
 *      `["peer_learner"]` (belt-and-braces repair).
 *   4. Users that already have `roles` are NEVER touched — their array and
 *      version are left exactly as they were.
 *   5. The legacy `role: "admin"` field (staff/admin tooling) is preserved.
 */
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const User = require("../models/user");
const { main } = require("../scripts/migrateUserRoles");

let mongo;
let origMongoUri;

beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    origMongoUri = process.env.MONGO_URI;
    process.env.MONGO_URI = mongo.getUri();
    // Open the connection BEFORE any test runs, so that `User.create` calls
    // inside the test bodies do not buffer while waiting for a connect.
    await mongoose.connect(mongo.getUri());
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongo.stop();
    if (origMongoUri !== undefined) process.env.MONGO_URI = origMongoUri;
    else delete process.env.MONGO_URI;
});

afterEach(async () => {
    for (const key of Object.keys(mongoose.connection.collections)) {
        await mongoose.connection.collections[key].deleteMany();
    }
});

async function makeUser(extra = {}) {
    return User.create({
        name: extra.name || "U",
        email: extra.email || `u${Date.now()}_${Math.random()}@test.io`,
        password: "x",
        ...(extra.roles !== undefined ? { roles: extra.roles } : {}),
        ...(extra.rolesVersion !== undefined ? { rolesVersion: extra.rolesVersion } : {}),
        ...(extra.role !== undefined ? { role: extra.role } : {}),
    });
}

/**
 * Insert a doc directly into the `users` collection, BYPASSING the Mongoose
 * schema. The schema now has `default: ["peer_learner"]` on `roles`, so a
 * normal `User.create({})` would auto-fill the default. We want to simulate
 * a doc that was written before the roles feature existed, so the field is
 * genuinely missing on disk and the migration has something to backfill.
 */
async function makeRawUser(extra = {}) {
    const now = new Date();
    const doc = {
        name: extra.name || "U",
        email: extra.email || `raw${Date.now()}_${Math.random()}@test.io`,
        password: "x",
        ...extra,
        createdAt: now,
        updatedAt: now,
    };
    const res = await mongoose.connection.collection("users").insertOne(doc);
    return { _id: res.insertedId, ...doc };
}

describe("migrateUserRoles.main — backfill", () => {
    test("user with no roles field gets ['peer_learner'] + rolesVersion 0", async () => {
        const u = await makeRawUser();
        // Pre-migration: the doc on disk has NO roles field at all.
        const onDisk = await mongoose.connection.collection("users").findOne({ _id: u._id });
        expect(onDisk.roles).toBeUndefined();
        expect(onDisk.rolesVersion).toBeUndefined();

        await main({ skipExit: true });

        const after = await User.findById(u._id).lean();
        expect(after.roles).toEqual(["peer_learner"]);
        expect(after.rolesVersion).toBe(0);
    });

    test("second invocation is a no-op (idempotency)", async () => {
        await makeRawUser();
        const r1 = await main({ skipExit: true });
        expect(r1.modified).toBe(1);
        expect(r1.remaining).toBe(0);

        const r2 = await main({ skipExit: true });
        expect(r2.modified).toBe(0);
        expect(r2.remaining).toBe(0);

        const after = await User.findOne().lean();
        expect(after.roles).toEqual(["peer_learner"]);
        expect(after.rolesVersion).toBe(0);
    });

    test("user with an empty roles array gets repaired to ['peer_learner']", async () => {
        const u = await makeRawUser({ roles: [] });
        await main({ skipExit: true });
        const after = await User.findById(u._id).lean();
        expect(after.roles).toEqual(["peer_learner"]);
    });

    test("user that already has roles is left untouched", async () => {
        const u = await makeRawUser({ roles: ["peer_learner", "student"], rolesVersion: 5 });
        await main({ skipExit: true });
        const after = await User.findById(u._id).lean();
        expect(after.roles).toEqual(["peer_learner", "student"]);
        expect(after.rolesVersion).toBe(5);
    });

    test("admin staff role (string 'admin') is preserved on the same doc", async () => {
        // Schema default for `roles` would auto-fill, so write the pre-migration
        // doc via the raw collection driver.
        const u = await makeRawUser({ role: "admin" });
        await main({ skipExit: true });
        const after = await User.findById(u._id).lean();
        expect(after.role).toBe("admin");
        expect(after.roles).toEqual(["peer_learner"]); // baseline added
    });

    test("remaining count is accurate when nothing was migrated", async () => {
        // All users already have roles — nothing to do.
        await makeRawUser({ roles: ["peer_learner", "mentor"], rolesVersion: 1 });
        await makeRawUser({ roles: ["student"], rolesVersion: 2 });
        const r = await main({ skipExit: true });
        expect(r.modified).toBe(0);
        expect(r.remaining).toBe(0);
    });
});

/**
 * whiteboardModel.test.js — the ephemerality contract.
 *
 * A session whiteboard must never outlive its call: the server deletes on
 * call-ended and on empty-room disconnect, and this TTL is the final backstop
 * (crash/restart between events). These tests pin the backstop's shape.
 */
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const Whiteboard = require("../models/whiteboard");

let mongoServer;
beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
});
afterAll(async () => { await mongoose.disconnect(); await mongoServer.stop(); });

describe("Whiteboard model — ephemerality backstop", () => {
    it("stamps a future expiresAt by default", async () => {
        const before = Date.now();
        const doc = await Whiteboard.create({ roomName: "room-ttl-a" });
        expect(doc.expiresAt).toBeInstanceOf(Date);
        expect(doc.expiresAt.getTime()).toBeGreaterThan(before);
        expect(doc.expiresAt.getTime()).toBeLessThanOrEqual(before + Whiteboard.WB_TTL_MS + 5000);
    });

    it("declares a TTL index on expiresAt (expireAfterSeconds: 0)", () => {
        const idx = Whiteboard.schema.indexes().find(([fields]) => fields.expiresAt === 1);
        expect(idx).toBeTruthy();
        expect(idx[1].expireAfterSeconds).toBe(0);
    });

    it("exports the TTL constant the save route uses to refresh liveness", () => {
        expect(typeof Whiteboard.WB_TTL_MS).toBe("number");
        expect(Whiteboard.WB_TTL_MS).toBeGreaterThan(0);
    });
});

/**
 * sessionService.test.js — pure-math tests for the pricing + scheduling service.
 *
 * No DB, no Date.now() — every test pins its inputs. configStore is allowed
 * (it's an in-memory KV already wired in tests). Covers the price edge
 * (mentorPayoutInr floor at the 99/15 boundary), the IANA-correct conflict
 * detection, the availability check, and the deterministic room name.
 */
const sessionService = require("../services/sessionService");
const configStore = require("../services/configStore");

// `readPlatformCutPercent` is a sync read of the in-memory cache; we mutate
// the cache directly so this test runs without a connected DB. The DB-backed
// `configStore.set/clear` paths are exercised by configStore.test.js.
function withCut(pct, fn) {
    const real = configStore.get;
    configStore.get = (ns, k) => (ns === "sessions" && k === "platformCutPercent") ? pct : real(ns, k);
    try { fn(); }
    finally { configStore.get = real; }
}

describe("sessionService — readPlatformCutPercent", () => {
    test("defaults to 15 when configStore is empty", () => {
        const real = configStore.get;
        configStore.get = () => undefined;
        try { expect(sessionService.readPlatformCutPercent()).toBe(15); }
        finally { configStore.get = real; }
    });

    test("returns 0 when explicitly set to 0", () => {
        withCut(0, () => {
            expect(sessionService.readPlatformCutPercent()).toBe(0);
        });
    });

    test("ignores out-of-range and non-finite values", () => {
        withCut(200, () => {
            expect(sessionService.readPlatformCutPercent()).toBe(15);
        });
        withCut("not a number", () => {
            expect(sessionService.readPlatformCutPercent()).toBe(15);
        });
    });

    test("accepts a valid override", () => {
        withCut(20, () => {
            expect(sessionService.readPlatformCutPercent()).toBe(20);
        });
    });
});

describe("sessionService — priceSession", () => {
    test("computes the headline snapshot: 1000 INR × 60 min / 60 = 1000, 15% cut → 850", () => {
        const p = sessionService.priceSession({ rateInr: 1000, durationMin: 60 });
        expect(p.totalInr).toBe(1000);
        expect(p.platformCutPct).toBe(15);
        expect(p.platformCutInr).toBe(150);
        expect(p.mentorPayoutInr).toBe(850);
    });

    test("uses live configStore override for the percent", () => {
        withCut(25, () => {
            const p = sessionService.priceSession({ rateInr: 1000, durationMin: 60 });
            expect(p.platformCutPct).toBe(25);
            expect(p.platformCutInr).toBe(250);
            expect(p.mentorPayoutInr).toBe(750);
        });
    });

    test("honours 30 min and 45 min buckets", () => {
        const p30 = sessionService.priceSession({ rateInr: 1200, durationMin: 30 });
        const p45 = sessionService.priceSession({ rateInr: 1200, durationMin: 45 });
        // 1200 × 30 / 60 = 600,  × 45/60 = 900 (Math.round for the half)
        expect(p30.totalInr).toBe(600);
        expect(p45.totalInr).toBe(900);
    });

    test("rejects invalid durations", () => {
        expect(() => sessionService.priceSession({ rateInr: 1000, durationMin: 15 })).toThrow();
        expect(() => sessionService.priceSession({ rateInr: 1000, durationMin: 90 })).toThrow();
    });

    test("rejects negative or non-finite rates", () => {
        expect(() => sessionService.priceSession({ rateInr: -1, durationMin: 60 })).toThrow();
        expect(() => sessionService.priceSession({ rateInr: NaN, durationMin: 60 })).toThrow();
    });

    test("edge: 99 INR with 15% cut → floor(14.85) = 14, mentor gets 85", () => {
        const p = sessionService.priceSession({ rateInr: 99, durationMin: 60 });
        expect(p.totalInr).toBe(99);
        expect(p.platformCutInr).toBe(14);
        expect(p.mentorPayoutInr).toBe(85);
    });
});

describe("sessionService — allowedDurations", () => {
    test("exposes the three allowed buckets in minutes", () => {
        expect(sessionService.allowedDurations()).toEqual([30, 45, 60]);
    });
});

describe("sessionService — buildRoomId", () => {
    test("is order-independent (deterministic) and 12 hex chars after `Session-`", () => {
        const a = sessionService.buildRoomId("uA", "uB");
        const b = sessionService.buildRoomId("uB", "uA");
        expect(a).toBe(b);
        expect(a).toMatch(/^Session-[a-f0-9]{12}$/);
    });

    test("differs from the free `SkillSwap-…` rooms (no collision)", () => {
        const r = sessionService.buildRoomId("uA", "uB");
        expect(r.startsWith("Session-")).toBe(true);
    });
});

describe("sessionService — hasConflict", () => {
    const slot = (iso, durationMin, status = "booked") => ({
        scheduledAt: new Date(iso), durationMin, status,
    });

    test("returns false on an empty list", () => {
        expect(sessionService.hasConflict({
            scheduledAt: new Date("2030-01-01T10:00:00Z"),
            durationMin: 60,
            existing: [],
        })).toBe(false);
    });

    test("returns true on direct overlap", () => {
        expect(sessionService.hasConflict({
            scheduledAt: new Date("2030-01-01T10:00:00Z"),
            durationMin: 60,
            existing: [slot("2030-01-01T10:30:00Z", 60, "booked")],
        })).toBe(true);
    });

    test("returns false on a clean adjacent slot (back-to-back is OK)", () => {
        expect(sessionService.hasConflict({
            scheduledAt: new Date("2030-01-01T11:00:00Z"),
            durationMin: 60,
            existing: [slot("2030-01-01T10:00:00Z", 60, "booked")],
        })).toBe(false);
    });

    test("ignores completed/cancelled/no_show sessions", () => {
        expect(sessionService.hasConflict({
            scheduledAt: new Date("2030-01-01T10:00:00Z"),
            durationMin: 60,
            existing: [
                slot("2030-01-01T10:00:00Z", 60, "completed"),
                slot("2030-01-01T10:00:00Z", 60, "cancelled"),
                slot("2030-01-01T10:00:00Z", 60, "no_show"),
            ],
        })).toBe(false);
    });
});

describe("sessionService — isWithinAvailability", () => {
    const availability = { weekly: [
        { dayOfWeek: 1, slots: [{ startUtcHour: 9, durationMin: 120 }] }, // Mon 09:00–11:00 UTC
        { dayOfWeek: 3, slots: [{ startUtcHour: 14, durationMin: 60 }] },  // Wed 14:00–15:00 UTC
    ] };

    test("accepts a Monday 10:00 UTC 30-min slot", () => {
        const ok = sessionService.isWithinAvailability({
            scheduledAt: new Date("2030-01-07T10:00:00Z"), // 2030-01-07 is a Monday
            durationMin: 30,
            availability,
        });
        expect(ok).toBe(true);
    });

    test("rejects a Monday 12:00 UTC slot (outside the window)", () => {
        const ok = sessionService.isWithinAvailability({
            scheduledAt: new Date("2030-01-07T12:00:00Z"),
            durationMin: 30,
            availability,
        });
        expect(ok).toBe(false);
    });

    test("rejects a Tuesday 10:00 UTC slot (wrong day)", () => {
        const ok = sessionService.isWithinAvailability({
            scheduledAt: new Date("2030-01-08T10:00:00Z"), // Tuesday
            durationMin: 30,
            availability,
        });
        expect(ok).toBe(false);
    });

    test("rejects a slot that overflows the window", () => {
        const ok = sessionService.isWithinAvailability({
            scheduledAt: new Date("2030-01-07T10:30:00Z"),
            durationMin: 60, // ends 11:30 > 11:00
            availability,
        });
        expect(ok).toBe(false);
    });

    test("an empty availability object opts out of gating", () => {
        const ok = sessionService.isWithinAvailability({
            scheduledAt: new Date("2030-01-07T03:00:00Z"),
            durationMin: 30,
            availability: { weekly: [] },
        });
        expect(ok).toBe(true);
    });
});

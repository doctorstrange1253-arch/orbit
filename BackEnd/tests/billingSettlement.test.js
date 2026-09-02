const P = require("../services/billingPlans");
const S = require("../services/billingSettlement");

const FIVE = P.PLAN_SEED.find((p) => p.key === "orbit_five");
const econ = (gross = FIVE.priceMinor) => P.periodEconomics(FIVE, gross);

function seat(i, { gated = 3, stages = 2 } = {}) {
    return { courseId: `c${String(i).padStart(2, "0")}`, mentorId: `m${i}`, gatedLessonsCompleted: gated, stagesCleared: stages };
}

function sum(shares) {
    return shares.reduce((n, s) => n + s.shareMinor, 0);
}

describe("distribute", () => {
    it("hands out every last paise", () => {
        for (const total of [0, 1, 7, 99, 100, 82564, 1397670]) {
            for (const n of [1, 2, 3, 5, 7, 10]) {
                const out = S.distribute(total, Array(n).fill(1));
                expect(out.reduce((a, b) => a + b, 0)).toBe(total);
            }
        }
    });

    it("respects weights", () => {
        expect(S.distribute(100, [3, 1])).toEqual([75, 25]);
        expect(S.distribute(90, [1, 1, 1])).toEqual([30, 30, 30]);
    });

    it("gives the remainder to weighted entries only, never to zero-weight ones", () => {
        const out = S.distribute(10, [1, 0, 1]);
        expect(out[1]).toBe(0);
        expect(out[0] + out[2]).toBe(10);
    });

    it("returns zeros when there is nothing to split", () => {
        expect(S.distribute(0, [1, 1])).toEqual([0, 0]);
        expect(S.distribute(100, [])).toEqual([]);
        expect(S.distribute(100, [0, 0])).toEqual([0, 0]);
    });
});

describe("settlement — half flat, half by stages cleared", () => {
    it("splits evenly when every seat is engaged equally", () => {
        const r = S.settle({ economics: econ(), seats: [0, 1, 2, 3, 4].map((i) => seat(i)) });
        expect(r.balance.ok).toBe(true);
        expect(sum(r.shares)).toBe(econ().poolMinor);
        const values = r.shares.map((s) => s.shareMinor);
        expect(Math.max(...values) - Math.min(...values)).toBeLessThanOrEqual(2);
    });

    it("pays a deeper student's mentor more, but never more than the whole pool", () => {
        const r = S.settle({
            economics: econ(),
            seats: [seat(0, { stages: 5 }), seat(1, { stages: 1 })],
        });
        const [deep, shallow] = r.shares;
        expect(deep.shareMinor).toBeGreaterThan(shallow.shareMinor);
        expect(deep.shareMinor).toBeLessThan(econ().poolMinor);
        expect(sum(r.shares)).toBe(econ().poolMinor);
    });

    it("caps any single mentor at the whole pool no matter how deep the study", () => {
        const r = S.settle({ economics: econ(), seats: [seat(0, { stages: 6 })] });
        expect(r.shares[0].shareMinor).toBe(econ().poolMinor);
    });

    it("cannot be gamed by lesson count — only stages move the merit half", () => {
        const padded = S.settle({
            economics: econ(),
            seats: [seat(0, { gated: 200, stages: 2 }), seat(1, { gated: 4, stages: 2 })],
        });
        expect(padded.shares[0].shareMinor).toBe(padded.shares[1].shareMinor);
    });

    it("pays an unstudied seat nothing and redistributes to the engaged ones", () => {
        const r = S.settle({
            economics: econ(),
            seats: [seat(0), seat(1), seat(2, { gated: 0, stages: 0 })],
        });
        expect(r.shares[2].shareMinor).toBe(0);
        expect(r.shares[2].engaged).toBe(false);
        expect(sum(r.shares)).toBe(econ().poolMinor);
        expect(r.engagedCount).toBe(2);
    });

    it("still pays the flat half when a student started but cleared no stage", () => {
        const r = S.settle({
            economics: econ(),
            seats: [seat(0, { gated: 1, stages: 0 }), seat(1, { gated: 1, stages: 0 })],
        });
        expect(r.meritMinor).toBe(0);
        expect(r.flatMinor).toBe(econ().poolMinor);
        expect(sum(r.shares)).toBe(econ().poolMinor);
        for (const s of r.shares) expect(s.shareMinor).toBeGreaterThan(0);
    });

    it("routes an entirely unstudied month to platform:unallocated, not to revenue", () => {
        const r = S.settle({
            economics: econ(),
            seats: [seat(0, { gated: 0, stages: 0 }), seat(1, { gated: 0, stages: 0 })],
        });
        expect(r.distributedMinor).toBe(0);
        expect(r.unallocatedMinor).toBe(econ().poolMinor);
        expect(r.unallocatedReason).toBe("no_engagement");
    });

    it("handles a subscriber who claimed no seats at all", () => {
        const r = S.settle({ economics: econ(), seats: [] });
        expect(r.unallocatedMinor).toBe(econ().poolMinor);
        expect(r.shares).toEqual([]);
    });

    it("is deterministic — same input, byte-identical output", () => {
        const input = { economics: econ(), seats: [seat(2, { stages: 3 }), seat(0, { stages: 1 }), seat(1, { stages: 5 })] };
        const a = S.settle(input);
        const b = S.settle(input);
        expect(JSON.stringify(a.shares)).toBe(JSON.stringify(b.shares));
    });

    it("orders shares by courseId so a replay hits the same idempotency keys", () => {
        const r = S.settle({ economics: econ(), seats: [seat(4), seat(0), seat(2)] });
        expect(r.shares.map((s) => s.courseId)).toEqual(["c00", "c02", "c04"]);
    });
});

describe("the money invariant", () => {
    it("balances for every tier and every engagement pattern", () => {
        for (const plan of P.PLAN_SEED.filter((p) => p.seats > 0)) {
            const periods = P.periodCountFor(plan);
            const spread = P.spreadAcrossPeriods(plan.priceMinor, periods);
            const e = P.periodEconomics(plan, spread[0]);
            for (let engaged = 0; engaged <= plan.seats; engaged += 1) {
                const rows = Array.from({ length: plan.seats }, (_, i) =>
                    seat(i, i < engaged ? { gated: 2, stages: (i % 4) + 1 } : { gated: 0, stages: 0 }));
                const r = S.settle({ economics: e, seats: rows });
                expect(r.balance.ok).toBe(true);
                expect(e.taxMinor + e.platformCutMinor + sum(r.shares) + r.unallocatedMinor).toBe(e.grossMinor);
            }
        }
    });
});

describe("ledger rows", () => {
    const r = S.settle({ economics: econ(), seats: [seat(0), seat(1)] });
    const rows = S.ledgerRows({
        txnId: "t1", periodId: "p1", userId: "u1", computeVersion: 1, economics: econ(), result: r,
    });

    it("sums to zero, like double entry demands", () => {
        expect(rows.reduce((n, x) => n + x.amountMinor, 0)).toBe(0);
    });

    it("uses a unique idempotency key per row", () => {
        const keys = rows.map((x) => x.idempotencyKey);
        expect(new Set(keys).size).toBe(keys.length);
    });

    it("versions the keys so a rules change never double-credits", () => {
        const v2 = S.ledgerRows({ txnId: "t2", periodId: "p1", userId: "u1", computeVersion: 2, economics: econ(), result: r });
        for (const k of v2.map((x) => x.idempotencyKey)) expect(rows.map((x) => x.idempotencyKey)).not.toContain(k);
    });

    it("credits tax to a payable account, not to revenue", () => {
        const tax = rows.find((x) => x.kind === "tax_withheld");
        expect(tax.account).toBe("platform:tax_payable");
        expect(tax.amountMinor).toBe(econ().taxMinor);
    });

    it("writes one payable row per earning mentor", () => {
        const payable = rows.filter((x) => x.account.startsWith("mentor:"));
        expect(payable).toHaveLength(2);
        expect(payable.reduce((n, x) => n + x.amountMinor, 0)).toBe(sum(r.shares));
    });

    it("emits no mentor rows and one unallocated row for a dead month", () => {
        const dead = S.settle({ economics: econ(), seats: [seat(0, { gated: 0, stages: 0 })] });
        const out = S.ledgerRows({ txnId: "t3", periodId: "p2", userId: "u1", computeVersion: 1, economics: econ(), result: dead });
        expect(out.filter((x) => x.account.startsWith("mentor:"))).toHaveLength(0);
        expect(out.find((x) => x.account === "platform:unallocated").amountMinor).toBe(econ().poolMinor);
        expect(out.reduce((n, x) => n + x.amountMinor, 0)).toBe(0);
    });
});

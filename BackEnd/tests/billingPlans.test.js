const P = require("../services/billingPlans");
const S = require("../services/billingSettlement");

const GST = 18;
const CUT = 25;

function plan({ priceMinor, seats, taxInclusive = true, taxRatePct = GST, platformCutPct = CUT, interval = "month", intervalCount = 1 }) {
    return { key: "t", name: "T", priceMinor, seats, taxInclusive, taxRatePct, platformCutPct, interval, intervalCount };
}

function seats(n, per = {}) {
    return Array.from({ length: n }, (_, i) => ({
        courseId: `c${String(i).padStart(2, "0")}`,
        mentorId: `m${i}`,
        gatedLessonsCompleted: per.gated ?? 3,
        stagesCleared: per.stages ?? 2,
    }));
}

describe("GST is inclusive and exact", () => {
    it("carves 18% out of the sticker price, never adds to it", () => {
        const r = P.splitTax({ priceMinor: 59900, taxInclusive: true, taxRatePct: GST });
        expect(r.grossMinor).toBe(59900);
        expect(r.netMinor).toBe(50763);
        expect(r.taxMinor).toBe(9137);
        expect(r.netMinor + r.taxMinor).toBe(r.grossMinor);
    });

    it("adds tax on top when the plan is exclusive", () => {
        const r = P.splitTax({ priceMinor: 10000, taxInclusive: false, taxRatePct: GST });
        expect(r.netMinor).toBe(10000);
        expect(r.taxMinor).toBe(1800);
        expect(r.grossMinor).toBe(11800);
    });

    it("is a no-op at zero rate", () => {
        const r = P.splitTax({ priceMinor: 59900, taxInclusive: true, taxRatePct: 0 });
        expect(r).toEqual({ grossMinor: 59900, netMinor: 59900, taxMinor: 0 });
    });

    it("never loses a paise for any price up to 100000", () => {
        for (let g = 0; g <= 100000; g += 7) {
            const r = P.splitTax({ priceMinor: g, taxInclusive: true, taxRatePct: GST });
            expect(r.netMinor + r.taxMinor).toBe(g);
        }
    });
});

describe("the shipped plan ladder", () => {
    const byKey = Object.fromEntries(P.PLAN_SEED.map((p) => [p.key, p]));

    it("has a free tier plus three paid monthly tiers", () => {
        expect(byKey.free.priceMinor).toBe(0);
        expect(byKey.free.seats).toBe(0);
        expect(byKey.orbit_two.priceMinor).toBe(59900);
        expect(byKey.orbit_five.priceMinor).toBe(129900);
        expect(byKey.orbit_ten.priceMinor).toBe(219900);
    });

    it("sells 2, 5 and 10 seats", () => {
        expect(byKey.orbit_two.seats).toBe(2);
        expect(byKey.orbit_five.seats).toBe(5);
        expect(byKey.orbit_ten.seats).toBe(10);
    });

    it("prices every paid tier GST-inclusive at 18% with a 25% platform cut", () => {
        for (const key of ["orbit_two", "orbit_five", "orbit_ten", "orbit_two_year", "orbit_five_year", "orbit_ten_year"]) {
            expect(byKey[key].taxInclusive).toBe(true);
            expect(byKey[key].taxRatePct).toBe(GST);
            expect(byKey[key].platformCutPct).toBe(CUT);
        }
    });

    it("charges ten months for a year", () => {
        expect(byKey.orbit_two_year.priceMinor).toBe(byKey.orbit_two.priceMinor * 10);
        expect(byKey.orbit_five_year.priceMinor).toBe(byKey.orbit_five.priceMinor * 10);
        expect(byKey.orbit_ten_year.priceMinor).toBe(byKey.orbit_ten.priceMinor * 10);
    });

    it("gets cheaper per course as the tier rises", () => {
        const two = P.quote(byKey.orbit_two).perSeatMinor;
        const five = P.quote(byKey.orbit_five).perSeatMinor;
        const ten = P.quote(byKey.orbit_ten).perSeatMinor;
        expect(five).toBeLessThan(two);
        expect(ten).toBeLessThan(five);
    });

    it("says all taxes are included, in the copy", () => {
        expect(P.quote(byKey.orbit_five).taxNote).toContain("including all taxes");
        expect(P.quote(byKey.orbit_five).taxNote).toContain("18% GST");
    });

    it("splits a yearly charge into twelve settleable months", () => {
        const p = byKey.orbit_five_year;
        expect(P.periodCountFor(p)).toBe(12);
        const spread = P.spreadAcrossPeriods(p.priceMinor, 12);
        expect(spread).toHaveLength(12);
        expect(spread.reduce((a, b) => a + b, 0)).toBe(p.priceMinor);
    });

    it("quotes a yearly plan per month, not per year, for the seat price", () => {
        const q = P.quote(byKey.orbit_five_year);
        expect(q.perSeatMinor).toBeLessThan(P.quote(byKey.orbit_five).perSeatMinor);
        expect(q.monthsFree).toBe(2);
    });
});

describe("period economics", () => {
    it("matches the worked example for Orbit Five", () => {
        const e = P.periodEconomics(plan({ priceMinor: 129900, seats: 5 }), 129900);
        expect(e.netMinor).toBe(110085);
        expect(e.taxMinor).toBe(19815);
        expect(e.platformCutMinor).toBe(27521);
        expect(e.poolMinor).toBe(82564);
        expect(e.taxMinor + e.platformCutMinor + e.poolMinor).toBe(129900);
    });

    it("takes nothing on the free tier", () => {
        const e = P.periodEconomics(plan({ priceMinor: 0, seats: 0, taxRatePct: 0, platformCutPct: 0 }), 0);
        expect(e.poolMinor).toBe(0);
        expect(e.platformCutMinor).toBe(0);
    });
});

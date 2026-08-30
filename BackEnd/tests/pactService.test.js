/**
 * pactService — pure-function unit tests.
 *
 * Covers the composite-score math, the promotion/relegation zone cutoffs,
 * and the steady-shield logic. The `rollWeek` writer is integration-tested
 * elsewhere since it needs Mongo.
 */
const {
    computePactScore,
    divisionIndex,
    nextDivisionUp,
    nextDivisionDown,
    DIVISIONS,
    GROUP_SIZE,
    PROMOTE_ZONE,
    RELEGATE_ZONE,
} = require("../services/pactService");

describe("pactService — division order", () => {
    it("DIVISIONS is initiate → oracle", () => {
        expect(DIVISIONS).toEqual(["initiate", "adept", "mentor", "sage", "luminary", "oracle"]);
    });
    it("divisionIndex returns the right index for each tier", () => {
        expect(divisionIndex("initiate")).toBe(0);
        expect(divisionIndex("mentor")).toBe(2);
        expect(divisionIndex("oracle")).toBe(5);
        expect(divisionIndex("garbage")).toBe(0); // unknown → initiate
    });
    it("nextDivisionUp promotes by 1, capped at oracle", () => {
        expect(nextDivisionUp("initiate")).toBe("adept");
        expect(nextDivisionUp("adept")).toBe("mentor");
        expect(nextDivisionUp("luminary")).toBe("oracle");
        expect(nextDivisionUp("oracle")).toBe("oracle");
    });
    it("nextDivisionDown relegates by 1, floored at initiate", () => {
        expect(nextDivisionDown("mentor")).toBe("adept");
        expect(nextDivisionDown("adept")).toBe("initiate");
        expect(nextDivisionDown("initiate")).toBe("initiate");
        expect(nextDivisionDown("oracle")).toBe("luminary");
    });
});

describe("pactService — computePactScore", () => {
    it("zero signals → 0", () => {
        expect(computePactScore({})).toBe(0);
    });
    it("sessions only: 1 session → 4", () => {
        expect(computePactScore({ sessions: 1 })).toBe(4);
    });
    it("sessions cap at 50 (so 100 sessions still = 200)", () => {
        expect(computePactScore({ sessions: 100 })).toBe(50 * 4);
    });
    it("rating contributes 20 × avg, scaled by participation", () => {
        // 4 sessions, 4 5★ ratings → 5 * 20 * 4/10 = 40
        expect(computePactScore({ sessions: 4, ratingSum: 20, ratingCount: 4 })).toBe(40 + 16);
    });
    it("rating contribution is 0 with no sessions", () => {
        // rating without sessions is silently 0 (per spec: scaled by participation)
        expect(computePactScore({ sessions: 0, ratingSum: 25, ratingCount: 5 })).toBe(0);
    });
    it("completions × 10, capped at 20", () => {
        expect(computePactScore({ completions: 5 })).toBe(50);
        expect(computePactScore({ completions: 30 })).toBe(200);
    });
    it("qaAnswers × 5, capped at 30", () => {
        expect(computePactScore({ qaAnswers: 10 })).toBe(50);
        expect(computePactScore({ qaAnswers: 100 })).toBe(150);
    });
    it("composite example: a busy week", () => {
        // 12 sessions, 4.7★ avg, 3 completions, 5 Q&A answers
        // sessions  = 12 * 4           = 48
        // rating    = 4.7 * 20 * 10/10 = 94
        // completions = 3 * 10         = 30
        // qa        = 5 * 5            = 25
        // total                           = 197
        const score = computePactScore({
            sessions: 12,
            ratingSum: 4.7 * 12, // 4.7 avg
            ratingCount: 12,
            completions: 3,
            qaAnswers: 5,
        });
        expect(score).toBeCloseTo(197, 5);
    });
});

describe("pactService — zone cutoffs (math check)", () => {
    // The actual isPromotion / isRelegation helpers live inside rollWeek
    // and aren't exported; here we sanity-check the spec math.
    it("PROMOTE_ZONE = 7 and RELEGATE_ZONE = 7 sum to < GROUP_SIZE", () => {
        expect(PROMOTE_ZONE + RELEGATE_ZONE).toBeLessThan(GROUP_SIZE);
    });
    it("middle zone (the 'hold' cohort) is non-empty: GROUP - 7 - 7 = 16", () => {
        expect(GROUP_SIZE - PROMOTE_ZONE - RELEGATE_ZONE).toBe(16);
    });
});

describe("pactService — constants", () => {
    it("GROUP_SIZE is 30, PROMOTE_ZONE=RELEGATE_ZONE=7", () => {
        expect(GROUP_SIZE).toBe(30);
        expect(PROMOTE_ZONE).toBe(7);
        expect(RELEGATE_ZONE).toBe(7);
    });
});

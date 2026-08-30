/**
 * gameologyService — pure-function unit tests.
 *
 * The pure helpers (level math, league thresholds, ISO week, streak tick)
 * live alongside the service so we can require them directly. The
 * `awardXp` writer is integration-tested via the route suite (see
 * gameologyRoutes.test.js) since it needs Mongo + socket.
 */
const {
    computeLevel,
    xpForLevel,
    leagueForWeeklyXp,
    isoWeek,
    todayUTC,
    tickStreak,
    XP_VALUES,
} = require("../services/gameologyService");

describe("gameologyService — level curve", () => {
    it("L1 starts at 0 XP", () => {
        expect(xpForLevel(1)).toBe(0);
        expect(computeLevel(0)).toBe(1);
    });
    it("L2 at 100 XP, L3 at 400 XP, L4 at 900", () => {
        expect(xpForLevel(2)).toBe(100);
        expect(xpForLevel(3)).toBe(400);
        expect(xpForLevel(4)).toBe(900);
    });
    it("clamps to MAX_LEVEL 50", () => {
        expect(computeLevel(10_000_000)).toBe(50);
        expect(computeLevel(xpForLevel(50))).toBe(50);
    });
    it("xpForLevel + computeLevel are inverses for L<MAX", () => {
        for (let L = 1; L <= 49; L++) {
            const xp = xpForLevel(L);
            expect(computeLevel(xp)).toBe(L);
        }
    });
    it("never returns < 1", () => {
        expect(computeLevel(-5)).toBe(1);
    });
});

describe("gameologyService — league thresholds", () => {
    it("buckets correctly", () => {
        expect(leagueForWeeklyXp(0)).toBe("bronze");
        expect(leagueForWeeklyXp(99)).toBe("bronze");
        expect(leagueForWeeklyXp(100)).toBe("silver");
        expect(leagueForWeeklyXp(499)).toBe("silver");
        expect(leagueForWeeklyXp(500)).toBe("gold");
        expect(leagueForWeeklyXp(1999)).toBe("gold");
        expect(leagueForWeeklyXp(2000)).toBe("platinum");
        expect(leagueForWeeklyXp(4999)).toBe("platinum");
        expect(leagueForWeeklyXp(5000)).toBe("diamond");
        expect(leagueForWeeklyXp(9999)).toBe("diamond");
        expect(leagueForWeeklyXp(10000)).toBe("legend");
    });
});

describe("gameologyService — isoWeek", () => {
    it("returns 'YYYY-Www' format", () => {
        const w = isoWeek(new Date(Date.UTC(2026, 0, 1))); // 2026-01-01 (Thu)
        expect(w).toMatch(/^\d{4}-W\d{2}$/);
    });
    it("two adjacent Mondays get different week ids", () => {
        const a = isoWeek(new Date(Date.UTC(2026, 6, 13))); // 2026-07-13
        const b = isoWeek(new Date(Date.UTC(2026, 6, 20))); // 2026-07-20
        expect(a).not.toBe(b);
    });
    it("a Mon and Sun of the same week get the same id", () => {
        const mon = isoWeek(new Date(Date.UTC(2026, 6, 13)));
        const sun = isoWeek(new Date(Date.UTC(2026, 6, 19)));
        expect(mon).toBe(sun);
    });
});

describe("gameologyService — todayUTC", () => {
    it("matches the YYYY-MM-DD prefix of new Date().toISOString()", () => {
        const t = todayUTC();
        expect(t).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(t).toBe(new Date().toISOString().slice(0, 10));
    });
});

describe("gameologyService — tickStreak", () => {
    const yesterday = () => new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const today = () => new Date().toISOString().slice(0, 10);

    it("first ever action sets streak to 1", () => {
        const r = tickStreak({ currentStreak: 0, longestStreak: 0, lastActiveDate: null }, today());
        expect(r.currentStreak).toBe(1);
        expect(r.longestStreak).toBe(1);
    });
    it("same day is a no-op (no double count)", () => {
        const r = tickStreak({ currentStreak: 5, longestStreak: 7, lastActiveDate: today() }, today());
        expect(r.currentStreak).toBe(5);
        expect(r.longestStreak).toBe(7);
    });
    it("yesterday → +1 streak", () => {
        const r = tickStreak({ currentStreak: 3, longestStreak: 3, lastActiveDate: yesterday() }, today());
        expect(r.currentStreak).toBe(4);
        expect(r.longestStreak).toBe(4);
    });
    it("older → reset to 1, preserve longest", () => {
        const r = tickStreak({ currentStreak: 10, longestStreak: 22, lastActiveDate: "2024-01-01" }, today());
        expect(r.currentStreak).toBe(1);
        expect(r.longestStreak).toBe(22);
    });
});

describe("gameologyService — XP_VALUES catalog", () => {
    it("lesson_completed is 50", () => {
        expect(XP_VALUES.lesson_completed).toBe(50);
    });
    it("course_completed is 200", () => {
        expect(XP_VALUES.course_completed).toBe(200);
    });
    it("session_completed is 100", () => {
        expect(XP_VALUES.session_completed).toBe(100);
    });
    it("peer_swap_completed is 40", () => {
        expect(XP_VALUES.peer_swap_completed).toBe(40);
    });
    it("streak_bonus is 20", () => {
        expect(XP_VALUES.streak_bonus).toBe(20);
    });
});

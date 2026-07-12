/**
 * missionReroll — pure-engine tests for the swap-a-mission feature.
 * No DB: rerollMission is a pure function of (missions, key, weekId).
 */
const {
    rollMissions,
    rerollMission,
    applyMissionProgress,
    claimMission,
    REROLLS_PER_WEEK,
    MISSION_TEMPLATES,
} = require("../services/orbitEngine");

const WEEK = "2026-W28";

function freshMissions() {
    return rollMissions(null, WEEK).missions;
}

describe("rerollMission — swap one mission per week", () => {
    test("swaps an untouched mission for a template not already in the set", () => {
        const missions = freshMissions();
        const target = missions.items[0].key;
        const before = missions.items.map((m) => m.key);

        const res = rerollMission(missions, target, WEEK);
        expect(res.ok).toBe(true);
        expect(res.replaced).toBe(target);

        const after = res.missions.items.map((m) => m.key);
        expect(after).not.toContain(target);
        expect(after).toHaveLength(before.length);
        // replacement is brand new to the set and progress starts at zero
        expect(before).not.toContain(res.swappedFor.key);
        const swapped = res.missions.items.find((m) => m.key === res.swappedFor.key);
        expect(swapped.progress).toBe(0);
        expect(swapped.claimed).toBe(false);
        // no duplicate keys after the swap
        expect(new Set(after).size).toBe(after.length);
    });

    test("is deterministic for a given week", () => {
        const a = rerollMission(freshMissions(), freshMissions().items[0].key, WEEK);
        const b = rerollMission(freshMissions(), freshMissions().items[0].key, WEEK);
        expect(a.swappedFor.key).toBe(b.swappedFor.key);
    });

    test("enforces the weekly limit", () => {
        const missions = freshMissions();
        const first = rerollMission(missions, missions.items[0].key, WEEK);
        expect(first.ok).toBe(true);
        expect(first.missions.rerollsUsed).toBe(1);

        const second = rerollMission(first.missions, first.missions.items[1].key, WEEK);
        expect(second.ok).toBe(false);
        expect(second.reason).toBe("no_rerolls_left");
        expect(REROLLS_PER_WEEK).toBe(1);
    });

    test("refuses completed and claimed missions", () => {
        const missions = freshMissions();
        const m0 = missions.items[0];

        // complete it
        const { missions: progressed } = applyMissionProgress(missions, m0.metric, m0.target);
        const completedNow = progressed.items.find((m) => m.key === m0.key);
        expect(completedNow.progress).toBeGreaterThanOrEqual(completedNow.target);
        const resComplete = rerollMission(progressed, m0.key, WEEK);
        expect(resComplete.ok).toBe(false);
        expect(resComplete.reason).toBe("already_complete");

        // claim it
        const { missions: claimed } = claimMission(progressed, m0.key);
        const resClaimed = rerollMission(claimed, m0.key, WEEK);
        expect(resClaimed.ok).toBe(false);
        expect(resClaimed.reason).toBe("already_claimed");
    });

    test("rejects unknown keys and empty mission state", () => {
        expect(rerollMission(freshMissions(), "nope", WEEK).reason).toBe("not_found");
        expect(rerollMission(null, "x", WEEK).reason).toBe("no_missions");
    });

    test("weekly roll resets the swap allowance", () => {
        const missions = freshMissions();
        const used = rerollMission(missions, missions.items[0].key, WEEK).missions;
        expect(used.rerollsUsed).toBe(1);
        const nextWeek = rollMissions(used, "2026-W29").missions;
        expect(nextWeek.rerollsUsed || 0).toBe(0);
    });

    test("pool is large enough that a swap always has an alternative", () => {
        expect(MISSION_TEMPLATES.length).toBeGreaterThan(4);
    });
});

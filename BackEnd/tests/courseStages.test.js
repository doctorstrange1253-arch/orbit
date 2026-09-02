const stages = require("../services/courseStages");

function lessonsOf(n) {
    return Array.from({ length: n }, (_, i) => ({ _id: `l${i + 1}`, order: i + 1 }));
}

describe("stageCount — derives from video count", () => {
    it("is zero for an empty course", () => {
        expect(stages.stageCount(0)).toBe(0);
    });

    it("is one for a single-sitting course", () => {
        expect(stages.stageCount(1)).toBe(1);
        expect(stages.stageCount(2)).toBe(1);
    });

    it("climbs logarithmically and caps at six", () => {
        expect(stages.stageCount(4)).toBe(2);
        expect(stages.stageCount(8)).toBe(3);
        expect(stages.stageCount(16)).toBe(4);
        expect(stages.stageCount(32)).toBe(5);
        expect(stages.stageCount(64)).toBe(6);
        expect(stages.stageCount(500)).toBe(6);
    });

    it("never decreases as videos are added", () => {
        let prev = 0;
        for (let n = 0; n <= 200; n += 1) {
            const c = stages.stageCount(n);
            expect(c).toBeGreaterThanOrEqual(prev);
            prev = c;
        }
    });

    it("tolerates junk input", () => {
        expect(stages.stageCount(-5)).toBe(0);
        expect(stages.stageCount(undefined)).toBe(0);
        expect(stages.stageCount(null)).toBe(0);
        expect(stages.stageCount(3.7)).toBe(2);
    });
});

describe("buildStages", () => {
    it("partitions every lesson exactly once", () => {
        for (const n of [1, 3, 7, 12, 25, 40, 64, 97]) {
            const built = stages.buildStages(lessonsOf(n));
            const ids = built.flatMap((s) => s.lessonIds);
            expect(ids).toHaveLength(n);
            expect(new Set(ids).size).toBe(n);
            expect(built.reduce((a, s) => a + s.lessonCount, 0)).toBe(n);
        }
    });

    it("keeps lessons in order across stages", () => {
        const built = stages.buildStages(lessonsOf(12));
        const flat = built.flatMap((s) => s.lessonIds);
        expect(flat).toEqual(lessonsOf(12).map((l) => l._id));
    });

    it("sorts by order before partitioning", () => {
        const shuffled = [
            { _id: "c", order: 3 },
            { _id: "a", order: 1 },
            { _id: "d", order: 4 },
            { _id: "b", order: 2 },
        ];
        const built = stages.buildStages(shuffled);
        expect(built.flatMap((s) => s.lessonIds)).toEqual(["a", "b", "c", "d"]);
    });

    it("always ends on the finale, and only the last stage is the finale", () => {
        for (const n of [1, 4, 10, 30, 70]) {
            const built = stages.buildStages(lessonsOf(n));
            expect(built[built.length - 1].name).toBe(stages.FINALE);
            expect(built[built.length - 1].isFinale).toBe(true);
            expect(built.filter((s) => s.isFinale)).toHaveLength(1);
        }
    });

    it("names stages in ladder order", () => {
        const built = stages.buildStages(lessonsOf(64));
        expect(built.map((s) => s.name)).toEqual([
            "Ignition", "Ascent", "Orbit", "Transit", "Apex", "Eclipse",
        ]);
    });

    it("escalates the stage reward", () => {
        const built = stages.buildStages(lessonsOf(32));
        const rewards = built.map((s) => s.xpReward);
        expect(rewards).toEqual([50, 75, 100, 125, 150]);
        for (let i = 1; i < rewards.length; i += 1) {
            expect(rewards[i]).toBeGreaterThan(rewards[i - 1]);
        }
    });

    it("gives every stage a blurb", () => {
        for (const s of stages.buildStages(lessonsOf(64))) {
            expect(s.blurb.length).toBeGreaterThan(10);
        }
    });

    it("returns nothing for a course with no lessons", () => {
        expect(stages.buildStages([])).toEqual([]);
        expect(stages.buildStages(undefined)).toEqual([]);
    });
});

describe("courseCompletionXp — scales with video count", () => {
    it("rewards a longer course more", () => {
        expect(stages.courseCompletionXp(0)).toBe(200);
        expect(stages.courseCompletionXp(3)).toBe(260);
        expect(stages.courseCompletionXp(40)).toBe(1000);
    });

    it("is strictly increasing in video count", () => {
        for (let n = 1; n <= 100; n += 1) {
            expect(stages.courseCompletionXp(n)).toBeGreaterThan(stages.courseCompletionXp(n - 1));
        }
    });
});

describe("stageProgress + stagesJustCleared", () => {
    const built = stages.buildStages(lessonsOf(6));

    it("marks a stage cleared only when every lesson in it is done", () => {
        const first = built[0];
        const partial = stages.stageProgress(built, first.lessonIds.slice(0, 1));
        expect(partial[0].isCleared).toBe(false);
        const full = stages.stageProgress(built, first.lessonIds);
        expect(full[0].isCleared).toBe(true);
        expect(full[1].isCleared).toBe(false);
    });

    it("reports the newly cleared stage on the completing lesson", () => {
        const first = built[0];
        const before = first.lessonIds.slice(0, first.lessonCount - 1);
        const after = first.lessonIds;
        const cleared = stages.stagesJustCleared(built, before, after);
        expect(cleared).toHaveLength(1);
        expect(cleared[0].name).toBe("Ignition");
    });

    it("reports nothing when no stage boundary was crossed", () => {
        const first = built[0];
        expect(stages.stagesJustCleared(built, [], first.lessonIds.slice(0, 1))).toHaveLength(0);
    });

    it("does not re-report an already-cleared stage", () => {
        const first = built[0];
        const withNext = [...first.lessonIds, built[1].lessonIds[0]];
        const cleared = stages.stagesJustCleared(built, first.lessonIds, withNext);
        expect(cleared).toHaveLength(0);
    });

    it("computes a percentage per stage", () => {
        const first = built[0];
        const p = stages.stageProgress(built, first.lessonIds.slice(0, 1));
        expect(p[0].pct).toBe(Math.round((1 / first.lessonCount) * 100));
        expect(p[1].pct).toBe(0);
    });

    it("finds the stage a lesson belongs to", () => {
        const target = built[1].lessonIds[0];
        expect(stages.stageOfLesson(built, target).name).toBe(built[1].name);
        expect(stages.stageOfLesson(built, "nope")).toBeNull();
    });
});

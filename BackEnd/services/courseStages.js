const STAGE_NAMES = Object.freeze([
    "Ignition",
    "Ascent",
    "Orbit",
    "Transit",
    "Apex",
]);

const FINALE = "Eclipse";
const MAX_STAGES = 6;

const STAGE_BLURBS = Object.freeze({
    Ignition: "The first spark. Nothing is expected of you yet.",
    Ascent:   "You are climbing now. The ground is further than it looks.",
    Orbit:    "You circle the idea. It stops being new and starts being yours.",
    Transit:  "The crossing. Everything you carry gets used.",
    Apex:     "The high point. From here you can see the whole shape.",
    Eclipse:  "The last stretch. This is where it is proved.",
});

function stageCount(videoCount) {
    const n = Math.max(0, Math.floor(videoCount) || 0);
    if (n === 0) return 0;
    if (n === 1) return 1;
    return Math.min(MAX_STAGES, Math.max(1, Math.round(Math.log2(n))));
}

function stageNames(count) {
    if (count <= 0) return [];
    if (count === 1) return [FINALE];
    const lead = STAGE_NAMES.slice(0, count - 1);
    while (lead.length < count - 1) lead.push(`Stage ${lead.length + 1}`);
    return [...lead, FINALE];
}

function partition(total, buckets) {
    if (buckets <= 0 || total <= 0) return [];
    const base = Math.floor(total / buckets);
    const extra = total % buckets;
    const sizes = Array.from({ length: buckets }, (_, i) => base + (i >= buckets - extra ? 1 : 0));
    return sizes;
}

function stageXp(index) {
    return 50 + 25 * index;
}

function courseCompletionXp(videoCount) {
    const n = Math.max(0, Math.floor(videoCount) || 0);
    return 200 + 20 * n;
}

function buildStages(lessons) {
    const ordered = (lessons || [])
        .slice()
        .sort((a, b) => (a.order || 0) - (b.order || 0));
    const count = stageCount(ordered.length);
    if (count === 0) return [];

    const names = stageNames(count);
    const sizes = partition(ordered.length, count);

    const stages = [];
    let cursor = 0;
    for (let i = 0; i < count; i += 1) {
        const slice = ordered.slice(cursor, cursor + sizes[i]);
        cursor += sizes[i];
        stages.push({
            index: i,
            number: i + 1,
            name: names[i],
            blurb: STAGE_BLURBS[names[i]] || "",
            isFinale: i === count - 1,
            lessonIds: slice.map((l) => String(l._id)),
            lessonCount: slice.length,
            xpReward: stageXp(i),
        });
    }
    return stages;
}

function stageOfLesson(stages, lessonId) {
    const id = String(lessonId);
    return (stages || []).find((s) => s.lessonIds.includes(id)) || null;
}

function stageProgress(stages, completedLessonIds) {
    const done = new Set((completedLessonIds || []).map(String));
    return (stages || []).map((s) => {
        const cleared = s.lessonIds.filter((id) => done.has(id)).length;
        return {
            ...s,
            lessonsDone: cleared,
            isCleared: s.lessonCount > 0 && cleared === s.lessonCount,
            pct: s.lessonCount === 0 ? 0 : Math.round((cleared / s.lessonCount) * 100),
        };
    });
}

function stagesJustCleared(stages, beforeIds, afterIds) {
    const before = stageProgress(stages, beforeIds);
    const after = stageProgress(stages, afterIds);
    return after.filter((s, i) => s.isCleared && !before[i]?.isCleared);
}

module.exports = {
    STAGE_NAMES,
    FINALE,
    MAX_STAGES,
    STAGE_BLURBS,
    stageCount,
    stageNames,
    stageXp,
    courseCompletionXp,
    buildStages,
    stageOfLesson,
    stageProgress,
    stagesJustCleared,
};

export const STAGE_NAMES = ['Ignition', 'Ascent', 'Orbit', 'Transit', 'Apex'];
export const FINALE = 'Eclipse';
export const MAX_STAGES = 6;

export const STAGE_GLOW = {
  Ignition: '#7c83ff',
  Ascent:   '#5eead4',
  Orbit:    '#a78bfa',
  Transit:  '#f59e0b',
  Apex:     '#fb7185',
  Eclipse:  '#fde68a',
};

export const STAGE_BLURBS = {
  Ignition: 'The first spark. Nothing is expected of you yet.',
  Ascent:   'You are climbing now. The ground is further than it looks.',
  Orbit:    'You circle the idea. It stops being new and starts being yours.',
  Transit:  'The crossing. Everything you carry gets used.',
  Apex:     'The high point. From here you can see the whole shape.',
  Eclipse:  'The last stretch. This is where it is proved.',
};

export const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI'];

export function stageCount(videoCount) {
  const n = Math.max(0, Math.floor(videoCount) || 0);
  if (n === 0) return 0;
  if (n === 1) return 1;
  return Math.min(MAX_STAGES, Math.max(1, Math.round(Math.log2(n))));
}

export function stageNames(count) {
  if (count <= 0) return [];
  if (count === 1) return [FINALE];
  const lead = STAGE_NAMES.slice(0, count - 1);
  while (lead.length < count - 1) lead.push(`Stage ${lead.length + 1}`);
  return [...lead, FINALE];
}

export function stageXp(index) {
  return 50 + 25 * index;
}

export function courseCompletionXp(videoCount) {
  return 200 + 20 * Math.max(0, Math.floor(videoCount) || 0);
}

function partition(total, buckets) {
  if (buckets <= 0 || total <= 0) return [];
  const base = Math.floor(total / buckets);
  const extra = total % buckets;
  return Array.from({ length: buckets }, (_, i) => base + (i >= buckets - extra ? 1 : 0));
}

export function buildStages(lessons) {
  const ordered = (lessons || []).slice().sort((a, b) => (a.order || 0) - (b.order || 0));
  const count = stageCount(ordered.length);
  if (count === 0) return [];

  const names = stageNames(count);
  const sizes = partition(ordered.length, count);

  const out = [];
  let cursor = 0;
  for (let i = 0; i < count; i += 1) {
    const slice = ordered.slice(cursor, cursor + sizes[i]);
    cursor += sizes[i];
    out.push({
      index: i,
      number: i + 1,
      name: names[i],
      blurb: STAGE_BLURBS[names[i]] || '',
      isFinale: i === count - 1,
      lessonIds: slice.map((l) => String(l._id)),
      lessonCount: slice.length,
      xpReward: stageXp(i),
    });
  }
  return out;
}

export function stagesOf(course) {
  if (Array.isArray(course?.stages) && course.stages.length > 0) return course.stages;
  return buildStages(course?.lessons);
}

export function withProgress(stageList, completedLessonIds) {
  const done = new Set((completedLessonIds || []).map(String));
  let unlocked = true;
  return (stageList || []).map((s) => {
    const lessonsDone = s.lessonIds.filter((id) => done.has(id)).length;
    const isCleared = s.lessonCount > 0 && lessonsDone === s.lessonCount;
    const row = {
      ...s,
      lessonsDone,
      isCleared,
      isUnlocked: unlocked,
      isCurrent: unlocked && !isCleared,
      pct: s.lessonCount === 0 ? 0 : Math.round((lessonsDone / s.lessonCount) * 100),
      glow: STAGE_GLOW[s.name] || '#a78bfa',
      roman: ROMAN[s.index] || String(s.number),
    };
    if (!isCleared) unlocked = false;
    return row;
  });
}

export function stageOfLesson(stageList, lessonId) {
  const id = String(lessonId);
  return (stageList || []).find((s) => s.lessonIds.includes(id)) || null;
}

export function courseShape(course, completedLessonIds) {
  const list = withProgress(stagesOf(course), completedLessonIds);
  const cleared = list.filter((s) => s.isCleared).length;
  const current = list.find((s) => s.isCurrent) || null;
  const videoCount = course?.lessonsCount ?? (course?.lessons || []).length;
  return {
    stages: list,
    stageCount: list.length,
    clearedCount: cleared,
    current,
    videoCount,
    completionXp: course?.completionXp ?? courseCompletionXp(videoCount),
    scaleLabel: scaleLabel(videoCount),
  };
}

export function scaleLabel(videoCount) {
  const n = Math.max(0, Math.floor(videoCount) || 0);
  if (n === 0) return 'Unwritten';
  if (n <= 2) return 'A single sitting';
  if (n <= 5) return 'A short arc';
  if (n <= 10) return 'A full arc';
  if (n <= 20) return 'A long haul';
  if (n <= 40) return 'An expedition';
  return 'An epic';
}

export function lessonPosition(course, lessonId, completedLessonIds) {
  const shape = courseShape(course, completedLessonIds);
  const stage = stageOfLesson(shape.stages, lessonId);
  if (!stage) return null;
  const indexInStage = stage.lessonIds.indexOf(String(lessonId));
  return {
    stage,
    indexInStage,
    numberInStage: indexInStage + 1,
    label: `${stage.roman} · ${stage.name}`,
    detail: `Lesson ${indexInStage + 1} of ${stage.lessonCount}`,
    ofTotal: `Stage ${stage.number} of ${shape.stageCount}`,
  };
}

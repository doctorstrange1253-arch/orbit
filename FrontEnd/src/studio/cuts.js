const EPS = 0.05;

export function normalizeCuts(list) {
  if (!Array.isArray(list)) return [];
  const ranges = list
    .map((c) => ({ fromSec: Number(c?.fromSec), toSec: Number(c?.toSec) }))
    .filter((c) => Number.isFinite(c.fromSec) && Number.isFinite(c.toSec) && c.fromSec >= 0 && c.toSec - c.fromSec > EPS)
    .sort((a, b) => a.fromSec - b.fromSec);
  const merged = [];
  for (const r of ranges) {
    const last = merged[merged.length - 1];
    if (last && r.fromSec <= last.toSec + EPS) last.toSec = Math.max(last.toSec, r.toSec);
    else merged.push({ fromSec: r.fromSec, toSec: r.toSec });
  }
  return merged;
}

export function addCut(list, fromSec, toSec) {
  return normalizeCuts([...(list || []), { fromSec, toSec }]);
}

export function cutTotal(list) {
  return (list || []).reduce((n, c) => n + Math.max(0, c.toSec - c.fromSec), 0);
}

export function skipTarget(list, t) {
  for (const c of list || []) {
    if (t >= c.fromSec - EPS && t < c.toSec - EPS) return c.toSec;
  }
  return null;
}

export function toEffective(list, t) {
  let removed = 0;
  for (const c of list || []) {
    if (c.fromSec >= t) break;
    removed += Math.min(t, c.toSec) - c.fromSec;
  }
  return Math.max(0, t - removed);
}

export function fromEffective(list, effective) {
  let t = effective;
  for (const c of list || []) {
    if (c.fromSec <= t + EPS) t += Math.max(0, c.toSec - c.fromSec);
    else break;
  }
  return t;
}

export const LAYOUTS = ['solo', 'screen', 'split', 'spotlight'];

export function buildScript(lesson) {
  if (!lesson) return '';
  return [
    lesson.title,
    lesson.promiseCopy && `By the end of this: ${lesson.promiseCopy}`,
    lesson.whyCopy && `Why it matters: ${lesson.whyCopy}`,
    lesson.bossChallenge && `The challenge: ${lesson.bossChallenge}`,
    lesson.description,
    lesson.rememberCopy && `One thing to remember: ${lesson.rememberCopy}`,
  ].filter(Boolean).join('\n\n');
}

export const LAYOUT_LABEL = {
  solo: 'Solo',
  screen: 'Screen',
  split: 'Split',
  spotlight: 'Spotlight',
};

export const LAYOUT_TRANSITION_MS = 400;

const PIP = { x: 0.705, y: 0.615, w: 0.27, h: 0.3 };

const SPEC = {
  solo: {
    screen: { x: 0, y: 0, w: 1, h: 1, a: 0, r: 0 },
    camera: { x: 0, y: 0, w: 1, h: 1, a: 1, r: 0 },
  },
  screen: {
    screen: { x: 0, y: 0, w: 1, h: 1, a: 1, r: 0 },
    camera: { ...PIP, a: 0, r: 0.02 },
  },
  split: {
    screen: { x: 0, y: 0.14, w: 0.5, h: 0.72, a: 1, r: 0.014 },
    camera: { x: 0.5, y: 0.14, w: 0.5, h: 0.72, a: 1, r: 0.014 },
  },
  spotlight: {
    screen: { x: 0, y: 0, w: 1, h: 1, a: 1, r: 0 },
    camera: { ...PIP, a: 1, r: 0.02 },
  },
};

export function resolveLayout(layout, { hasScreen, hasCamera }) {
  if (!hasScreen && !hasCamera) return 'screen';
  if (!hasScreen) return 'solo';
  if (!hasCamera) return 'screen';
  return LAYOUTS.includes(layout) ? layout : 'spotlight';
}

export function specFor(layout) {
  return SPEC[layout] || SPEC.spotlight;
}

function ease(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function blendRect(from, to, t) {
  return {
    x: lerp(from.x, to.x, t),
    y: lerp(from.y, to.y, t),
    w: lerp(from.w, to.w, t),
    h: lerp(from.h, to.h, t),
    a: lerp(from.a, to.a, t),
    r: lerp(from.r, to.r, t),
  };
}

export function blendLayouts(fromLayout, toLayout, progress) {
  const from = specFor(fromLayout);
  const to = specFor(toLayout);
  const t = ease(Math.max(0, Math.min(1, progress)));
  return {
    screen: blendRect(from.screen, to.screen, t),
    camera: blendRect(from.camera, to.camera, t),
  };
}

function roundedPath(ctx, x, y, w, h, r) {
  const radius = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

export function drawCover(ctx, el, rect, W, H) {
  if (!el || el.readyState < 2 || rect.a <= 0.01) return;
  const dw = rect.w * W;
  const dh = rect.h * H;
  if (dw < 2 || dh < 2) return;
  const dx = rect.x * W;
  const dy = rect.y * H;
  const sw = el.videoWidth || dw;
  const sh = el.videoHeight || dh;
  const scale = Math.max(dw / sw, dh / sh);
  const cw = dw / scale;
  const ch = dh / scale;
  const cx = (sw - cw) / 2;
  const cy = (sh - ch) / 2;
  const radius = rect.r * W;

  ctx.save();
  ctx.globalAlpha = rect.a;
  if (radius > 0.5) {
    roundedPath(ctx, dx, dy, dw, dh, radius);
    ctx.clip();
  }
  ctx.drawImage(el, cx, cy, cw, ch, dx, dy, dw, dh);
  ctx.restore();
}

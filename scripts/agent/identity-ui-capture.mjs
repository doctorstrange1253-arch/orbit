import { resolve, sep, dirname, extname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import { readFile, writeFile, mkdir, realpath, stat, appendFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { createServer } from 'node:http';
import { createHash, randomUUID } from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

export function safeAssetPath(root, pathname) {
  if (typeof pathname !== 'string' || !pathname.startsWith('/')) return null;
  let decoded;
  try { decoded = decodeURIComponent(pathname); } catch { return null; }
  if (decoded.includes('\0') || decoded.includes('\\')) return null;
  const parts = decoded.split('/');
  if (parts.some((part) => part === '..' || part.startsWith('.') || /^(?:google-services|service[-_]?account)/i.test(part) || part.includes(':'))) return null;
  const base = resolve(root);
  const path = resolve(base, `.${decoded}`);
  return path.startsWith(`${base}${sep}`) ? path : null;
}

export function networkKind(value, localOrigin) {
  let url;
  try { url = new URL(value); } catch { return 'block'; }
  if (url.username || url.password) return 'block';
  if (url.protocol === 'http:' && url.hostname === '127.0.0.1' && url.origin === localOrigin) return 'local';
  if (url.protocol !== 'https:' || url.port) return 'block';
  if (url.hostname === 'fonts.googleapis.com' && url.pathname.startsWith('/css2')) return 'font';
  if (url.hostname === 'fonts.gstatic.com' && url.pathname.startsWith('/s/') && /\.(?:woff2?|ttf|otf)$/.test(url.pathname)) return 'font';
  return 'block';
}

export function checkedLevelCount(value) {
  if (!Number.isSafeInteger(value) || value < 1 || value > 300) throw new RangeError('Fixture level count must be an integer from 1 through 300.');
  return value;
}

const DESTINATIONS = {
  Peer: { path: '/peer/dashboard', get: '/skills/my', button: 'Add a new skill' },
  Mentor: { path: '/mentor/observatory', get: '/sessions/mentor/me', heading: 'The Observatory' },
  Student: { path: '/student/universe', get: '/courses/enrollments/me', heading: 'Your universe' }
};

export function destinationEvidenceReady(sample, identity, contextId, requests) {
  const destination = DESTINATIONS[identity];
  if (!destination || sample.path !== destination.path || sample.hasSplash) return false;
  const marker = destination.button ? sample.visibleButtonNames?.includes(destination.button) : sample.headings?.some((text) => text.includes(destination.heading));
  return !!marker && requests.some((request) => request.contextId === contextId && request.path === destination.get && request.status === 200 && !!request.fulfilledAt);
}

export function transitionSummary(samples, destinationPath) {
  if (!Array.isArray(samples) || typeof destinationPath !== 'string' || !destinationPath) throw new TypeError('Ordered observations and destination path required.');
  let previous = -1;
  for (const sample of samples) {
    if (!sample || !Number.isFinite(sample.elapsedMs) || sample.elapsedMs < 0 || sample.elapsedMs < previous || typeof sample.path !== 'string' || typeof sample.destinationReady !== 'boolean' || !Number.isSafeInteger(sample.overlayCount) || sample.overlayCount < 0 || !Array.isArray(sample.overlayTexts) || sample.overlayTexts.some((text) => typeof text !== 'string')) throw new TypeError('Malformed or unordered transition observation.');
    previous = sample.elapsedMs;
  }
  const firstDestinationRouteMs = samples.find((sample) => sample.path === destinationPath)?.elapsedMs ?? null;
  const firstDestinationReadyMs = samples.find((sample) => sample.path === destinationPath && sample.destinationReady)?.elapsedMs ?? null;
  const withOverlay = samples.filter((sample) => sample.overlayCount > 0);
  const lastOverlayObservedMs = withOverlay.at(-1)?.elapsedMs ?? null;
  const firstOverlayMs = withOverlay[0]?.elapsedMs ?? null;
  const firstClearAfterOverlayMs = firstOverlayMs === null ? null : samples.find((sample) => sample.elapsedMs > firstOverlayMs && sample.overlayCount === 0)?.elapsedMs ?? null;
  return {
    sampleCount: samples.length, firstDestinationRouteMs, firstDestinationReadyMs, lastOverlayObservedMs, firstClearAfterOverlayMs,
    overlayClearedBeforeReady: firstClearAfterOverlayMs === null || firstDestinationReadyMs === null ? null : firstClearAfterOverlayMs < firstDestinationReadyMs,
    observedTexts: [...new Set(samples.flatMap((sample) => sample.overlayTexts))],
  };
}

export async function withinBudget(action, milliseconds) {
  if (typeof action !== 'function') throw new TypeError('Evidence stage must be a function.');
  if (!Number.isSafeInteger(milliseconds) || milliseconds < 1) throw new RangeError('Evidence stage budget must be a positive safe integer.');
  let timer;
  try {
    return await Promise.race([Promise.resolve().then(action), new Promise((_, reject) => { timer = setTimeout(() => reject(new Error(`Capture evidence stage exceeded ${milliseconds}ms.`)), milliseconds); })]);
  } finally { clearTimeout(timer); }
}

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const FRONT = resolve(ROOT, 'FrontEnd');
const frontRequire = createRequire(resolve(FRONT, 'package.json'));
export function loadCaptureTools() {
  return { chromium: frontRequire('playwright').chromium, AxeBuilder: frontRequire('@axe-core/playwright').default };
}
const exec = promisify(execFile);
const hash = (value) => createHash('sha256').update(value).digest('hex');
const SCREENS = [
  ['student-universe', '/student/universe'], ['student-learning', '/student/learning'], ['student-certificates', '/student/certificates'],
  ['mentor-observatory', '/mentor/observatory'], ['peer-dashboard', '/peer/dashboard'], ['mentor-apply', '/mentor/apply'], ['mentor-hub', '/mentor/hub'],
  ['mentor-courses', '/mentor/courses'], ['mentor-course-new', '/mentor/courses/new'], ['mentor-course-edit', '/mentor/courses/course-fixture/edit'],
  ['mentor-lesson-edit', '/mentor/courses/course-fixture/lessons/lesson-1'], ['mentor-recorder', '/mentor/recorder'], ['mentor-media', '/mentor/media'],
  ['mentor-sessions', '/mentor/sessions'], ['mentor-earnings', '/mentor/earnings'], ['mentor-pact', '/mentor/pact'], ['mentor-moderation', '/mentor/moderation'],
  ['mentor-analytics', '/mentor/analytics'], ['mentor-students', '/mentor/students'], ['student-sessions', '/student/sessions'], ['student-mentors', '/student/mentors'],
  ['student-mentor-detail', '/student/mentors/mentor-fixture'], ['student-room-terminal', '/student/room/session-fixture'], ['courses', '/courses'],
  ['course-detail', '/courses/course-fixture'], ['course-learn', '/courses/course-fixture/learn/lesson-1'], ['certificate', '/courses/course-fixture/certificate/certificate-fixture'],
  ['plans', '/plans'], ['gameology', '/gameology'], ['skill-map', '/skill-map'], ['public-skill-map', '/skill-map/peer-one'], ['identity', '/identity'], ['settings', '/settings'],
  ['profile', '/profile'], ['public-profile', '/profile/peer-one'], ['leaderboard', '/leaderboard'], ['orbit', '/orbit'], ['mission-log', '/orbit/history'], ['shop', '/shop'],
  ['holobay', '/holobay'], ['cosmic-observatory', '/observatory'], ['tier-atlas', '/cosmic-atlas'], ['peer-browse', '/peer/browse'], ['peer-matches', '/peer/matches'],
  ['peer-connections', '/peer/connections'], ['peer-nearby', '/peer/nearby'], ['peer-trust', '/peer/trust'], ['peer-calls', '/peer/calls'], ['not-found', '/route-fixture-not-found'],
];

const RUNTIME_CASES = ['navigation-keyboard-reflow', 'identity-choice', 'transit-normal', 'transit-slow', 'transit-failed', 'transit-reduced-motion', 'journey-runtime-1', 'journey-runtime-30', 'journey-runtime-100', 'journey-runtime-300', 'webgl-unavailable', 'journey-reduced-motion', 'journey-2d-1', 'journey-2d-100', 'journey-2d-300'];

export function captureSelection(args) {
  const values = (flag) => {
    const index = args.indexOf(flag);
    if (index < 0) return null;
    if (args.lastIndexOf(flag) !== index || !args[index + 1] || args[index + 1].startsWith('--')) throw new TypeError(`One value required for ${flag}.`);
    return args[index + 1].split(',');
  };
  const ids = values('--screens');
  const widthValues = values('--widths');
  const requestedCases = values('--runtime-cases');
  const runtime = args.includes('--runtime');
  const all = args.includes('--all');
  const statesOnly = args.includes('--states-only');
  if ((all && ids) || (statesOnly && (all || ids))) throw new TypeError('Choose only one screen selection mode.');
  if (ids && ids.some((id) => !SCREENS.some(([slug]) => slug === id))) throw new RangeError('Unknown screen ID.');
  if (widthValues && widthValues.some((width) => !['360', '768', '1280'].includes(width))) throw new RangeError('Capture widths must be 360, 768 or 1280.');
  if (requestedCases && !runtime) throw new TypeError('Runtime case selection requires --runtime.');
  if (requestedCases?.some((name) => !RUNTIME_CASES.includes(name))) throw new RangeError('Unknown runtime case.');
  return {
    mode: statesOnly ? 'states-only' : all ? 'matrix' : ids ? 'batch' : 'smoke',
    screens: statesOnly ? [] : ids ? [...new Set(ids)].map((id) => SCREENS.find(([slug]) => slug === id)) : all ? SCREENS.slice() : SCREENS.slice(0, 5),
    widths: widthValues ? [...new Set(widthValues)].map(Number) : [360, 768, 1280],
    viewportOnly: args.includes('--viewport-only'),
    runtime,
    runtimeCases: runtime ? [...new Set(requestedCases || RUNTIME_CASES)] : []
  };
}

export function fixtureBody(path, data, options = {}) {
  const now = Date.now();
  const account = structuredClone(data.account);
  if (options.single) account.roles = ['peer_learner'];
  const mentor = { ...structuredClone(data.mentor), user: { _id: 'mentor-fixture', name: 'Mentor Fixture', avatar: null } };
  if (options.pending) mentor.applicationStatus = 'submitted';
  const levelCount = checkedLevelCount(options.levels || data.course.lessons.length);
  const course = structuredClone(data.course);
  if (levelCount !== course.lessons.length) course.lessons = Array.from({ length: levelCount }, (_, i) => ({ ...structuredClone(data.course.lessons[i % 6]), _id: `lesson-${i + 1}`, title: `Fixture lesson ${i + 1}`, order: i + 1 }));
  course.lessonsCount = course.lessons.length;
  const history = options.empty ? [] : data.history.map((item, i) => ({ ...item, xpAwarded: item.xp, createdAt: new Date(now - i * 86_400_000).toISOString(), occurredAt: new Date(now - i * 86_400_000).toISOString() }));
  const enrollments = options.empty ? [] : data.enrollments.map((row) => ({ ...row, updatedAt: new Date(now - 3_600_000).toISOString(), course: { ...course, _id: row.courseId, title: row.courseTitle || course.title } }));
  const peers = data.peers;
  const skills = options.empty ? [] : data.skills.map((skill) => ({ ...skill, createdAt: new Date(now - 86_400_000).toISOString(), userId: skill.userId === account._id ? account : peers.find((p) => p._id === skill.userId) || account }));
  const bookings = options.empty ? [] : [
    { _id: 'session-upcoming', studentId: account._id, mentorId: 'mentor-fixture', student: account, mentor, scheduledAt: new Date(now + 86_400_000).toISOString(), durationMin: 30, totalInr: 600, status: 'booked', roomId: 'room-fixture' },
    { _id: 'session-past', studentId: account._id, mentorId: 'mentor-fixture', student: account, mentor, scheduledAt: new Date(now - 86_400_000).toISOString(), durationMin: 30, totalInr: 600, mentorPayoutInr: 510, status: 'completed', roomId: 'room-past' },
  ];
  const people = options.empty ? [] : peers.map((p, i) => ({ userId: p._id, name: p.name, avatar: null, lastActiveMs: now - i * 86_400_000, avgProgressPct: 40 + i * 25, courseCount: 1, finished: i, enrolled: 1, started: 1, halfway: i, courses: [{ _id: course._id, title: course.title, progressPct: 40 + i * 25, completedAt: i ? new Date(now).toISOString() : null }] }));
  const courseRows = options.empty ? [] : [course, { ...course, _id: 'course-draft', title: 'Geometry workshop (fixture)', isPublished: false }];
  const cosmicRows = options.empty ? [] : peers.map((p, i) => ({ userId: p._id, _id: p._id, name: p.name, avatar: null, rank: i + 1, score: 1200 - i * 100, tierId: 'moon_4', city: 'Fixture City', orbit: p.orbit, progress: { pct: 0.25, nextTierId: 'moon_3', nextFloor: 1300 }, mastery: { total: 18, score: 12 } }));
  const hall = { weekId: 'fixture-week', items: options.empty ? [] : Array.from({ length: 12 }, (_, i) => ({ _id: `mentor-row-${i}`, name: `Mentor fixture ${i + 1}`, rank: i + 1, isMe: i === 7, pact: { ...data.pact, weekScore: 240 - i * 10 } })) };
  const routes = {
    '/user/profile': account, '/user/roles': { user: account, roles: account.roles, rolesVersion: 1 },
    '/taxonomy/tree': { constellations: [] }, '/moderation/me/fp-rate': { total: 0, rate: 0 },
    '/skills/my': skills.filter((s) => s.userId._id === account._id), '/skills/all': skills, '/skills/matches': skills.filter((s) => s.userId._id !== account._id),
    '/connections/pending': { incoming: [], outgoing: [], sent: [], incomingCount: 0 }, '/connections/all': [], '/connections/completed': [],
    '/connections': { items: peers.map((p) => ({ _id: `connection-${p._id}`, user: p, otherUser: p, requester: account, receiver: p, status: 'accepted' })) },
    '/notifications': { items: [] }, '/notifications/unread': { count: 0, unread: 0 }, '/notifications/unread-count': { count: 0 },
    '/mentor-invites/pending': { invite: null }, '/modifications/me': { items: [] }, '/moderation/me': { items: [] },
    '/courses': { items: courseRows, total: courseRows.length }, '/courses/categories': { items: options.empty ? [] : [course.category] },
    '/courses/enrollments/me': { items: enrollments }, '/courses/mentor/learners': { items: people, courses: [{ _id: course._id, title: course.title, enrolled: 2, started: 2, halfway: 1, finished: 1, lessonsCount: 6, dropOff: [{ lessonId: 'lesson-3', title: 'Patterns and relations', order: 3, stalled: 1 }] }] },
    '/gameology/me': { ...account.gameology, lastActiveDate: history.find((item) => item.event === 'lesson_completed')?.createdAt.slice(0, 10) || null }, '/gameology/history': { items: history }, '/gameology/achievements': { items: data.achievements.map((item) => ({ ...item, title: item.name })) }, '/gameology/achievements/me': { items: options.empty ? [] : data.achievements.map((item) => ({ ...item, title: item.name })) },
    '/gameology/leaderboard': { items: options.empty ? [] : [account, ...peers].map((p) => ({ ...p, ...p.gameology })) },
    '/sessions/mentor/me': { profile: mentor, earnings: { totalInr: 1530, pendingInr: 510, releasedInr: 1020 } }, '/sessions/mentor/bookings': { items: bookings }, '/sessions/me': { items: bookings },
    '/sessions/mentors/account-fixture/honours': { totals: { count: 0, byTier: { beacon: 0, comet: 0, supernova: 0 } }, items: [], canHonourToday: false },
    '/sessions/mentors': { items: options.empty ? [] : [mentor] }, '/sessions/mentors/mentor-fixture': mentor,
    '/sessions/session-fixture': { ...bookings[1], _id: 'session-fixture', status: 'completed' },
    '/pact/me': { pact: data.pact }, '/pact/hall': hall, '/pact/rivals': { items: [] }, '/pact/history': { items: [] }, '/pact/pulse': { items: [] },
    '/orbit/shop': { photons: 3200, stardust: 3200, owned: ['bg_pulsar'], equipped: {}, catalog: options.empty ? [] : data.catalog.map((item) => ({ ...item, hint: item.description, category: item.type === 'name_glow' ? 'identity' : item.type === 'background' ? 'themes' : item.type })) },
    '/orbit/me': { photons: 3200, stardust: 3200, streak: { current: account.gameology.currentStreak, longest: account.gameology.longestStreak, state: 'active' }, freeze: { tokens: 1, cap: 3, costPhotons: 200 }, currentStreak: 4, bestStreak: 8, freezes: 1, missions: [], weeklyMissions: [], nextMilestone: null, milestones: [], today: { done: true }, preferences: {}, prefs: {}, quest: null, gift: { sentToday: 0, dailyCap: 200 }, orbit: account.orbit },
    '/orbit/ledger': { items: [] }, '/orbit/constellations': { items: [] }, '/orbit/binary-stars': { items: [] },
    '/orbit/league': { division: { id: 'asteroid_belt', name: 'Asteroid Belt', color: '#9ca3af', index: 0 }, standings: [], you: null, promoteCount: 5, relegateCount: 5, lastResult: null, resetsAtUTC: new Date(now + 7 * 86_400_000).toISOString() },
    '/orbit/duels': { items: [] }, '/orbit/duels/me': { current: null, record: { won: 0, lost: 0, drew: 0 }, history: [] },
    '/cosmic/leaderboard': { entries: cosmicRows, label: 'Fixture City', scope: 'city', scopeCounts: { city: 2, region: 2, country: 2 }, you: null },
    '/cosmic/observatory/me': { entries: cosmicRows, items: cosmicRows, champions: [], label: 'Fixture City' },
    '/billing/plans': { items: data.plans, plans: data.plans }, '/billing/me': { subscription: null, enrolled: [], slots: [] },
    '/knowledge/me': { nodes: [], edges: [], concepts: [] }, '/knowledge/me/skill-map': { stars: [], edges: [], clusters: [], path: [], meta: { totalConceptsTouched: 0 } }, '/knowledge/peer-one/skill-map': { stars: [], edges: [], clusters: [], path: [], meta: { totalConceptsTouched: 0 } },
    '/trust/my-score': { score: 82, trustScore: 82, totalSessions: 12, averageRating: 4.8, ratings: [], history: [] }, '/trust/my-given': { ratings: [] },
    '/ratings/received': { items: [] }, '/video/history': [], '/geo/nearby-skills': [],
  };
  if (routes[path] !== undefined) return routes[path];
  if (/^\/user\/[^/]+$/.test(path)) return peers.find((p) => path.endsWith(p._id)) || account;
  if (path.startsWith('/trust/ratings/')) return { ratings: [] };
  if (path.startsWith('/cosmic/mentor/')) return { ...cosmicRows[0], tierId: 'moon_4', score: 1200 };
  if (path.startsWith('/pact/user/')) return { pact: data.pact };
  if (/^\/courses\/[^/]+\/enrollments\/me$/.test(path)) return enrollments[0] || null;
  if (/^\/courses\/[^/]+\/enrollments$/.test(path)) return { items: people.map((person) => ({ _id: `enrollment-${person.userId}`, user: { _id: person.userId, name: person.name, avatar: person.avatar }, enrolledAt: new Date(now - 7 * 86_400_000).toISOString(), progressPct: person.courses[0].progressPct, completedAt: person.courses[0].completedAt })) };
  if (/^\/courses\/[^/]+\/comments$/.test(path)) return { items: [] };
  if (/^\/courses\/[^/]+\/certificate$/.test(path)) return { certificate: { certId: 'certificate-fixture', issuedAt: new Date(now).toISOString() }, course, mentor, learner: account };
  if (/^\/courses\/[^/]+$/.test(path)) return { ...course, _id: path.split('/')[2] };
  return undefined;
}

async function buildFrontend(scratch) {
  for (const key of Object.keys(process.env)) if (key.startsWith('VITE_')) delete process.env[key];
  const original = await readFile(resolve(FRONT, 'vite.config.js'), 'utf8');
  const marker = 'const FCM_CONFIGURED = detectFcmConfigured();';
  if (original.split(marker).length !== 2) throw new Error('Unique FCM configuration marker required.');
  const text = original.replace(marker, 'const FCM_CONFIGURED = false;').replace(/from '([^']+)'/g, (_, id) => `from '${id.startsWith('node:') ? id : pathToFileURL(frontRequire.resolve(id)).href}'`);
  const config = (await import(`data:text/javascript;base64,${Buffer.from(text).toString('base64')}`)).default;
  const out = resolve(scratch, 'build');
  config.root = FRONT;
  config.configFile = false;
  config.envDir = false;
  config.cacheDir = resolve(scratch, 'vite-cache');
  config.define = { ...config.define, 'import.meta.env.VITE_API_URL': JSON.stringify('/api'), 'import.meta.env.VITE_SOCKET_URL': JSON.stringify('/') };
  config.build = { ...config.build, outDir: out, emptyOutDir: false };
  const { build } = await import(pathToFileURL(frontRequire.resolve('vite')).href);
  await build(config);
  return out;
}

async function runCapture() {
  const selection = captureSelection(process.argv.slice(2));
  const extras = process.argv.includes('--extras');
  const stress = process.argv.includes('--stress');
  const reuseIndex = process.argv.indexOf('--build-root');
  const runId = `iw-a2-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-${randomUUID().slice(0, 8)}`;
  const scratch = resolve(ROOT, '.agent/scratch', runId);
  const output = resolve(ROOT, 'docs/progress/screenshots/identity-worlds', runId);
  await mkdir(scratch, { recursive: false });
  await mkdir(output, { recursive: true });
  const dataBytes = await readFile(resolve(ROOT, 'scripts/agent/identity-ui-fixtures.json'));
  const data = JSON.parse(dataBytes.toString('utf8'));
  if (data.synthetic !== true) throw new Error('Only explicitly synthetic fixture data is supported.');
  const report = { runId, startedAt: new Date().toISOString(), synthetic: true, note: data.purpose, inputs: { fixtureSha256: hash(dataBytes), helperSha256: hash(await readFile(fileURLToPath(import.meta.url))) }, mode: selection.mode, selection: { screens: selection.screens.map(([slug, route]) => ({ slug, route })), widths: selection.widths, viewportOnly: selection.viewportOnly, runtime: selection.runtime, runtimeCases: selection.runtimeCases, extras, stress }, screenshots: [], captureAttempts: [], requests: [], missingFixtures: [], blocked: [], fonts: [], interactions: [], stress: [], failures: [] };
  const register = async (path, purpose) => {
    const bytes = await readFile(path);
    const name = path.slice(ROOT.length + 1).replaceAll('\\', '/');
    await appendFile(resolve(ROOT, '.agent/FILE_REGISTRY.md'), `| ${name} | ${purpose} | IW-A2 | ${bytes.length}bytes/SHA256${hash(bytes)} generated and metadata verified; synthetic Chromium evidence | ${new Date().toISOString().slice(0, 10)} |\n`);
    await appendFile(resolve(ROOT, '.agent/SESSION_LOG.md'), `- ${new Date().toISOString()} IW-A2 created/verified/registered ${name},${bytes.length}bytes, synthetic local browser evidence; no live product data.\n`);
    return { path: name, bytes: bytes.length, sha256: hash(bytes) };
  };
  let browser;
  let server;
  let buildRoot;
  try {
    buildRoot = reuseIndex >= 0 ? resolve(process.argv[reuseIndex + 1] || '') : await buildFrontend(scratch);
    if (!buildRoot.startsWith(resolve(ROOT, '.agent/scratch') + sep) || !existsSync(resolve(buildRoot, 'index.html'))) throw new Error('Build root must be an existing isolated scratch frontend build.');
    report.buildRoot = buildRoot;
    const baseRoot = await realpath(buildRoot);
    const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.woff2': 'font/woff2', '.mp3': 'audio/mpeg' };
    server = createServer(async (req, res) => {
      try {
        const pathname = new URL(req.url, 'http://127.0.0.1').pathname;
        let path = safeAssetPath(buildRoot, pathname === '/' ? '/index.html' : pathname);
        if (!path) { res.writeHead(403); res.end('Static path rejected.'); return; }
        if (!existsSync(path) || !(await stat(path)).isFile()) path = resolve(buildRoot, 'index.html');
        path = await realpath(path);
        if (!path.startsWith(baseRoot + sep)) { res.writeHead(403); res.end('Static root escape rejected.'); return; }
        res.writeHead(200, { 'Content-Type': types[extname(path)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
        res.end(await readFile(path));
      } catch { res.writeHead(500); res.end('Local static server failure.'); }
    });
    await new Promise((resolveListen, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolveListen); });
    const base = `http://127.0.0.1:${server.address().port}`;
    report.base = base;
    console.log(`UI_CAPTURE_START ${runId} ${base} ${output}`);
    const { chromium, AxeBuilder } = loadCaptureTools();
    browser = await chromium.launch({ headless: true, args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-webgl', '--enable-unsafe-swiftshader', '--enable-precise-memory-info'] });
    report.browser = browser.version();
    const fonts = new Map();
    const getFont = (url) => {
      if (!fonts.has(url)) fonts.set(url, (async () => {
        const key = hash(url);
        const dir = resolve(scratch, 'fonts', key);
        await mkdir(dir, { recursive: true });
        const result = await exec('curl', ['--disable', '--fail', '--show-error', '--silent', '--max-time', '30', '-A', 'Mozilla/5.0 Chrome/156.0.0.0 Safari/537.36', url], { encoding: 'buffer', maxBuffer: 8 * 1024 * 1024 });
        const bytes = result.stdout;
        if (!bytes.length) throw new Error('Font response was empty.');
        await writeFile(resolve(dir, 'asset'), bytes, { flag: 'wx' });
        report.fonts.push({ url, bytes: bytes.length, sha256: hash(bytes) });
        return bytes;
      })());
      return fonts.get(url);
    };
    const openPage = async (width, options = {}) => {
      const contextId = randomUUID().slice(0, 8);
      const context = await browser.newContext({ viewport: { width, height: width === 360 ? 740 : width === 768 ? 1024 : 800 }, reducedMotion: options.motion || 'reduce', locale: 'en-IN', serviceWorkers: 'block' });
      const account = structuredClone(data.account);
      if (options.single) account.roles = ['peer_learner'];
      await context.addInitScript(({ account, light, webglUnavailable }) => {
        localStorage.setItem('auth-storage', JSON.stringify({ state: { user: account, token: 'synthetic-ui-token-not-a-credential' }, version: 2 }));
        localStorage.setItem('skillswap-sounds-enabled', 'false');
        localStorage.setItem('skillswap-music-enabled', 'false');
        if (light) {
          localStorage.setItem('skillswap-theme-mode', JSON.stringify({ state: { isDark: false }, version: 0 }));
          localStorage.setItem('skillswap-appearance', JSON.stringify({ state: { theme: 'morning-sky', backgroundStyle: 'minimal', animationSpeed: 'off' }, version: 0 }));
        }
        if (webglUnavailable) {
          const original = HTMLCanvasElement.prototype.getContext;
          HTMLCanvasElement.prototype.getContext = function (type, ...args) { return ['webgl', 'webgl2', 'experimental-webgl'].includes(type) ? null : original.call(this, type, ...args); };
        }
        if (navigator.mediaDevices) navigator.mediaDevices.getUserMedia = async () => { throw new DOMException('Media intentionally unavailable in UI fixture captures.', 'NotAllowedError'); };
        window.RTCPeerConnection = class { constructor() { throw new Error('RTC network disabled for local UI evidence.'); } };
      }, { account, light: options.light || false, webglUnavailable: options.webglUnavailable || false });
      await context.routeWebSocket('**/*', (socket) => { report.blocked.push({ kind: 'websocket', url: socket.url() }); socket.close(); });
      await context.route('**/*', async (route) => {
        const request = route.request();
        const url = new URL(request.url());
        const kind = networkKind(url.href, base);
        try {
          if (kind === 'local' && url.pathname.startsWith('/api/')) {
            const path = url.pathname.slice(4);
            if (request.method() !== 'GET') { report.blocked.push({ kind: 'mutation', path, method: request.method() }); await route.fulfill({ status: 405, json: { code: 'UI_CAPTURE_MUTATION_BLOCKED' } }); return; }
            const body = fixtureBody(path, data, options);
            const entry = { contextId, path, configured: body !== undefined, requestedAt: Date.now() };
            report.requests.push(entry);
            if (options.fail && (path.startsWith('/courses') || path === '/sessions/mentor/me')) { await route.fulfill({ status: 503, json: { message: 'Synthetic loading failure for UI evidence.' } }); entry.status = 503; entry.fulfilledAt = Date.now(); return; }
            if (body === undefined) { report.missingFixtures.push(path); await route.fulfill({ status: 501, json: { code: 'UI_FIXTURE_MISSING', message: 'Synthetic response not configured.' } }); entry.status = 501; entry.fulfilledAt = Date.now(); return; }
            if (options.slow && ['/courses/enrollments/me', '/sessions/mentor/me'].includes(path)) await new Promise((done) => setTimeout(done, 6500));
            await route.fulfill({ status: 200, json: body });
            entry.status = 200;
            entry.fulfilledAt = Date.now();
            return;
          }
          if (kind === 'local' && url.pathname.startsWith('/socket.io/')) { await route.fulfill({ status: 400, json: { code: 'UI_CAPTURE_SOCKET_DISABLED' } }); return; }
          if (kind === 'local') { await route.continue(); return; }
          if (kind === 'font') { await route.fulfill({ status: 200, contentType: url.hostname === 'fonts.googleapis.com' ? 'text/css' : 'font/woff2', body: await getFont(url.href) }); return; }
          report.blocked.push({ kind: 'external', url: url.href });
          await route.abort('blockedbyclient');
        } catch (error) { report.failures.push({ kind: 'request', url: url.href, message: error.message }); await route.abort().catch(() => {}); }
      });
      const page = await context.newPage();
      page.setDefaultTimeout(7000);
      const errors = [];
      page.captureConsoleErrors = [];
      page.on('pageerror', (error) => errors.push(error.message));
      page.on('console', (message) => { if (message.type() === 'error') page.captureConsoleErrors.push(message.text().slice(0, 3000)); });
      return { context, page, errors, contextId };
    };
    const save = async (page, slug, width, options = {}) => {
      await withinBudget(() => page.evaluate(() => document.fonts.ready), 15000).catch((error) => report.failures.push({ kind: 'font-ready', slug, width, message: error.message }));
      const geometry = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth, scrollHeight: document.documentElement.scrollHeight, title: document.title, headings: Array.from(document.querySelectorAll('h1,h2')).map((e) => e.textContent.trim()).slice(0, 12), fonts: Array.from(document.fonts).filter((f) => f.status === 'loaded').map((f) => f.family), canvases: Array.from(document.querySelectorAll('canvas')).map((c) => ({ width: c.width, height: c.height })), text: document.body.innerText.slice(0, 1800), memory: performance.memory?.usedJSHeapSize || null }));
      const path = resolve(output, `${slug}-${width}.png`);
      const fullPage = geometry.scrollHeight < 6000 && !options.viewportOnly;
      const attempt = { slug, width, captureMode: fullPage ? 'full-page' : 'viewport-only', startedAt: Date.now(), geometry, saved: false };
      report.captureAttempts.push(attempt);
      await page.screenshot({ path, fullPage, animations: 'disabled', timeout: 20000 });
      const bytes = await readFile(path);
      if (bytes.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a' || bytes.length < 1000) throw new Error('Screenshot did not produce a valid nonempty PNG.');
      const info = await register(path, `Actual existing frontend ${slug},${width}px fixture capture`);
      const record = { ...info, slug, width, captureMode: attempt.captureMode, pngWidth: bytes.readUInt32BE(16), pngHeight: bytes.readUInt32BE(20), actualPath: new URL(page.url()).pathname, consoleErrors: page.captureConsoleErrors.slice(), geometry };
      attempt.saved = true;
      attempt.finishedAt = Date.now();
      report.screenshots.push(record);
      return record;
    };
    const screens = selection.screens;
    for (const width of selection.widths) {
      for (const [slug, route] of screens) {
        const { context, page, errors } = await openPage(width);
        try {
          const started = Date.now();
          await page.goto(`${base}${route}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
          await page.waitForFunction(() => !!document.querySelector('header, main, h1') && !document.getElementById('app-splash'), { timeout: 15000 });
          await page.waitForTimeout(650);
          const record = await save(page, slug, width, { viewportOnly: selection.viewportOnly });
          record.requestedRoute = route;
          record.errors = errors;
          record.crash = await page.getByText('Something went wrong', { exact: true }).isVisible().catch(() => false);
          record.timings = { navigationAndCaptureMs: Date.now() - started };
          if ((selection.mode !== 'smoke' && ['student-universe', 'mentor-observatory', 'peer-dashboard'].includes(slug)) || (selection.mode === 'smoke' && width === 1280)) {
            const axeStarted = Date.now();
            console.log(`UI_CAPTURE_AXE_START ${runId} ${slug} width=${width}`);
            try { const axe = await withinBudget(() => new AxeBuilder({ page }).analyze(), 45000); record.axe = { violations: axe.violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.map((n) => ({ target: n.target, summary: n.failureSummary })) })), incomplete: axe.incomplete.map((v) => ({ id: v.id, impact: v.impact })), passes: axe.passes.length }; } catch (error) { record.axeError = error.message; }
            finally { record.timings.axeMs = Date.now() - axeStarted; console.log(`UI_CAPTURE_AXE_DONE ${runId} ${slug} width=${width} ms=${record.timings.axeMs} error=${!!record.axeError}`); }
          }
          if (record.crash || errors.length) report.failures.push({ kind: 'render', slug, width, errors, crash: record.crash });
        } catch (error) { report.failures.push({ kind: 'capture', slug, width, message: error.message }); }
        finally { await context.close(); }
      }
      console.log(`UI_CAPTURE_PROGRESS ${runId} width=${width} images=${report.screenshots.length} failures=${report.failures.length}`);
    }
    if (extras) {
      for (const width of selection.widths) {
        for (const [slug, route, options] of [
          ['student-empty', '/student/universe', { empty: true }], ['student-failed', '/student/universe', { fail: true }],
          ['mentor-pending', '/mentor/observatory', { pending: true }], ['mentor-locked', '/mentor/observatory', { single: true }],
          ['student-light', '/student/universe', { light: true }], ['mentor-light', '/mentor/observatory', { light: true }],
        ]) {
          const { context, page, errors } = await openPage(width, options);
          try { await page.goto(`${base}${route}`, { waitUntil: 'domcontentloaded' }); await page.waitForTimeout(options.fail ? 4500 : 900); const record = await save(page, slug, width); record.errors = errors; record.options = options; } catch (error) { report.failures.push({ slug, width, message: error.message }); } finally { await context.close(); }
        }
        const { context, page } = await openPage(width);
        try {
          await page.goto(`${base}/student/universe`, { waitUntil: 'domcontentloaded' }); await page.waitForTimeout(800);
          const menu = page.getByRole('button', { name: 'Open menu', exact: true });
          if (await menu.isVisible().catch(() => false)) await menu.click();
          const switcher = page.getByRole('button', { name: /Switch window/ });
          const visible = await switcher.isVisible().catch(() => false);
          const before = new URL(page.url()).pathname;
          if (visible) await switcher.click();
          await page.waitForTimeout(400);
          const focus = await page.evaluate(() => ({ tag: document.activeElement?.tagName, text: document.activeElement?.textContent?.trim().slice(0, 100) }));
          report.interactions.push({ kind: 'switcher-open', width, visible, before, after: new URL(page.url()).pathname, menuVisible: await page.getByRole('menu').isVisible().catch(() => false), focus });
          await save(page, 'switcher-open-attempt', width);
          await page.keyboard.press('Escape');
          await page.keyboard.press('Tab');
          report.interactions.push({ kind: 'keyboard-focus', width, active: await page.evaluate(() => ({ tag: document.activeElement?.tagName, text: document.activeElement?.textContent?.trim().slice(0, 100), outline: getComputedStyle(document.activeElement).outline })) });
        } finally { await context.close(); }
      }
    }
    if (stress) {
      for (const levels of [1, 30, 100, 300]) {
        const { context, page, errors } = await openPage(1280, { levels, motion: 'no-preference' });
        try {
          const start = Date.now();
          await page.goto(`${base}/courses/course-fixture/learn/lesson-1`, { waitUntil: 'domcontentloaded' });
          await page.waitForTimeout(1600);
          const map = page.getByRole('button', { name: '2D map', exact: true });
          const has3d = await map.isVisible().catch(() => false);
          const frames = await page.evaluate(() => new Promise((done) => { let count = 0; const start = performance.now(); const tick = () => { count++; if (performance.now() - start >= 2000) done({ frames: count, elapsed: performance.now() - start }); else requestAnimationFrame(tick); }; requestAnimationFrame(tick); setTimeout(() => done({ frames: count, elapsed: performance.now() - start, timedOut: true }), 4000); }));
          await page.locator('canvas').last().scrollIntoViewIfNeeded().catch(() => {});
          const record = await save(page, `journey-${levels}-levels`, 1280, { viewportOnly: true });
          report.stress.push({ levels, has3d, loadAndSampleMs: Date.now() - start, frames, memory: record.geometry.memory, canvases: record.geometry.canvases, errors });
        } catch (error) { report.failures.push({ kind: 'stress', levels, message: error.message }); } finally { await context.close(); }
      }
    }
    if (selection.runtime) {
      const runtimeStart = Date.now();
      const runtimeDeadline = runtimeStart + 420000;
      report.runtimeScope = { widths: selection.widths, cases: selection.runtimeCases, navigation: '16 Tab observations, ordinary trigger click and Escape; no forced clicks', reflow: 'simulated CSS zoom 2, not native browser zoom; intended Student route re-established after switcher observations', identity: 'one choice per width; desktop Student choice normal/slow/failed/reduced motion', readiness: 'destination path plus heading or visible Peer skill action and a fulfilled200 required synthetic GET; not asset/scene/full-app readiness', timing: 'screenshot-free250ms polling stamped after browser evaluation, not a native paint trace', journeyWidths: selection.widths.includes(1280) ? [1280] : [], journeyLevels: [1, 30, 100, 300], budgetMs: 420000, limitations: 'ARIA snapshots are browser-computed, not human screen-reader proof. DOM overlay texts may be covered by another layer and are not verified quotations. Headless SwiftShader/JS heap/finite sampling is not physical-device/GPU/full-memory/infinite acceptance.' };
      report.runtimeSkipped = [];
      report.runtimeExcluded = RUNTIME_CASES.filter((label) => !selection.runtimeCases.includes(label));
      const snapshot = async (page) => withinBudget(() => page.locator('body').ariaSnapshot({ timeout: 5000 }), 7000);
      const observe = async (page) => withinBudget(() => page.evaluate(() => {
        const focus = document.activeElement;
        const describe = (element) => { if (!element) return null; const style = getComputedStyle(element); const rect = element.getBoundingClientRect(); return { tag: element.tagName, role: element.getAttribute('role'), name: element.getAttribute('aria-label') || element.textContent?.trim().slice(0, 140), outline: style.outline, display: style.display, visibility: style.visibility, rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height } }; };
        const overlays = Array.from(document.querySelectorAll('div[role="status"],div[aria-hidden="true"]')).filter((element) => { const style = getComputedStyle(element); const rect = element.getBoundingClientRect(); return style.position === 'fixed' && Number(style.zIndex) >= 200 && Number(style.zIndex) <= 300 && style.visibility !== 'hidden' && Number(style.opacity) > 0.01 && rect.width > innerWidth * 0.8 && rect.height > innerHeight * 0.8; }).map((element) => ({ text: element.textContent.trim().slice(0, 1200), role: element.getAttribute('role'), ariaHidden: element.getAttribute('aria-hidden'), zIndex: getComputedStyle(element).zIndex, opacity: getComputedStyle(element).opacity, pointerEvents: getComputedStyle(element).pointerEvents, backdropFilter: getComputedStyle(element).backdropFilter }));
        return { path: location.pathname, visibleButtonNames: Array.from(document.querySelectorAll('button')).filter((element) => { const rect = element.getBoundingClientRect(); const style = getComputedStyle(element); return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && Number(style.opacity) > 0; }).map((element) => element.getAttribute('aria-label') || element.textContent.trim()), focus: describe(focus), headings: Array.from(document.querySelectorAll('h1,h2,h3')).map((element) => element.textContent.trim()).slice(0, 15), text: document.body.innerText.slice(0, 1200), hasSplash: !!document.getElementById('app-splash'), overlayCount: overlays.length, overlayTexts: overlays.map((overlay) => overlay.text).filter(Boolean), overlays, scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth, scrollHeight: document.documentElement.scrollHeight, cssZoom: document.documentElement.style.zoom || '', memory: performance.memory?.usedJSHeapSize ?? null, canvases: Array.from(document.querySelectorAll('canvas')).map((canvas) => ({ width: canvas.width, height: canvas.height })), domElements: document.querySelectorAll('*').length };
      }), 7000);
      const runProbe = async (label, width, options, action, budget = 65000) => {
        if (!selection.runtimeCases.includes(label)) return;
        if (Date.now() >= runtimeDeadline) { report.runtimeSkipped.push({ label, width, reason: 'Declared runtime observation budget reached before this case.' }); console.log(`UI_CAPTURE_RUNTIME_SKIPPED ${runId} ${label} width=${width}`); return; }
        const item = { kind: 'runtime', label, width, options, startedAt: Date.now() };
        report.interactions.push(item);
        let opened;
        console.log(`UI_CAPTURE_RUNTIME_START ${runId} ${label} width=${width}`);
        try { opened = await openPage(width, options); item.contextId = opened.contextId; await withinBudget(() => action(opened.page, item), Math.min(budget, Math.max(1, runtimeDeadline - Date.now()))); item.outcome = 'observations-recorded'; }
        catch (error) { item.outcome = 'incomplete'; item.message = error.message; report.failures.push({ kind: 'runtime', label, width, message: error.message }); }
        finally { item.finishedAt = Date.now(); item.errors = opened?.errors.slice() || []; if (opened) { item.consoleErrors = opened.page.captureConsoleErrors.slice(); await opened.context.close(); } console.log(`UI_CAPTURE_RUNTIME_DONE ${runId} ${label} width=${width} outcome=${item.outcome}`); }
      };
      const goto = async (page, path) => { await page.goto(`${base}${path}`, { waitUntil: 'domcontentloaded', timeout: 30000 }); await page.waitForFunction(() => !!document.querySelector('header,main,h1') && !document.getElementById('app-splash'), { timeout: 15000 }); };
      const traceChoice = async (page, item, identity, duration) => {
        const homes = Object.fromEntries(Object.entries(DESTINATIONS).map(([name, entry]) => [name, entry.path]));
        const endpoints = Object.fromEntries(Object.entries(DESTINATIONS).map(([name, entry]) => [name, entry.get]));
        item.destination = homes[identity]; item.requiredGet = endpoints[identity];
        await page.getByRole('button', { name: new RegExp(`^Choose ${identity}:`) }).waitFor({ state: 'visible', timeout: 15000 });
        item.choices = await page.locator('[aria-label^="Choose "]').evaluateAll((elements) => elements.map((element) => ({ name: element.getAttribute('aria-label'), pressed: element.getAttribute('aria-pressed'), disabled: element.disabled, rect: { width: element.getBoundingClientRect().width, height: element.getBoundingClientRect().height } })));
        item.beforeAria = await snapshot(page);
        item.tapAt = Date.now();
        await page.getByRole('button', { name: new RegExp(`^Choose ${identity}:`) }).click();
        const begin = page.getByRole('button', { name: /^Begin/ });
        await begin.waitFor({ state: 'visible', timeout: 5000 });
        item.beginVisibleAfterTapMs = Date.now() - item.tapAt;
        item.selectedAria = await snapshot(page);
        const started = performance.now();
        item.samples = [];
        const sample = async () => { const row = await observe(page); row.elapsedMs = Math.round(performance.now() - started); row.destinationReady = destinationEvidenceReady(row, identity, item.contextId, report.requests); item.samples.push(row); };
        await sample();
        item.beginActivatedAt = Date.now();
        await begin.click();
        while (performance.now() - started < duration) { await sample(); await page.waitForTimeout(250); }
        await sample();
        item.summary = transitionSummary(item.samples, homes[identity]);
        item.afterAria = await snapshot(page);
        item.requests = report.requests.filter((request) => request.contextId === item.contextId && request.path === endpoints[identity]).map((request) => ({ ...request }));
        await save(page, item.label, item.width, { viewportOnly: true });
      };
      for (const width of selection.widths) {
        await runProbe('navigation-keyboard-reflow', width, {}, async (page, item) => {
          await goto(page, '/student/universe');
          item.before = await observe(page); item.beforeAria = await snapshot(page); item.tabs = [];
          for (let index = 0; index < 16; index++) { await page.keyboard.press('Tab'); item.tabs.push((await observe(page)).focus); }
          const drawer = page.getByRole('button', { name: 'Open menu', exact: true });
          item.drawerAvailable = await drawer.isVisible().catch(() => false);
          if (item.drawerAvailable) await drawer.click();
          const triggers = page.getByRole('button', { name: /Switch window/ });
          item.triggerCount = await triggers.count(); item.triggerVisible = false;
          for (let index = 0; index < item.triggerCount; index++) if (await triggers.nth(index).isVisible()) { item.triggerVisible = true; await triggers.nth(index).click(); break; }
          await page.waitForTimeout(300);
          item.afterClick = await observe(page); item.menuVisible = await page.getByRole('menu').isVisible().catch(() => false); item.openAria = await snapshot(page);
          await save(page, 'runtime-switcher-attempt', width, { viewportOnly: true });
          await page.keyboard.press('Escape'); item.afterEscape = await observe(page); item.escapeTest = item.menuVisible ? 'Escape issued after an observed open menu' : 'No menu opened; trigger-focus restoration not proven';
          item.reflowRequestedPath = '/student/universe'; item.reflowPathBeforeReset = new URL(page.url()).pathname;
          if (item.reflowPathBeforeReset !== item.reflowRequestedPath) await goto(page, item.reflowRequestedPath);
          await page.getByRole('heading', { name: 'Your universe', exact: true }).waitFor({ state: 'visible', timeout: 15000 });
          const oldZoom = await page.evaluate(() => { const old = document.documentElement.style.zoom; document.documentElement.style.zoom = '2'; return old; });
          try { item.reflow = await observe(page); item.reflowAria = await snapshot(page); await save(page, 'runtime-reflow-css2x', width, { viewportOnly: true }); } finally { await page.evaluate((zoom) => { document.documentElement.style.zoom = zoom; }, oldZoom); }
          if (width === 1280) { const start = Date.now(); try { const axe = await withinBudget(() => new AxeBuilder({ page }).analyze(), 45000); item.axe = { path: new URL(page.url()).pathname, violations: axe.violations.map((violation) => ({ id: violation.id, impact: violation.impact, help: violation.help, nodes: violation.nodes.map((node) => ({ target: node.target, summary: node.failureSummary })) })), incomplete: axe.incomplete.map((rule) => ({ id: rule.id, impact: rule.impact })), passes: axe.passes.length }; } catch (error) { item.axeError = error.message; } item.axeMs = Date.now() - start; }
        }, 110000);
        await runProbe('identity-choice', width, {}, async (page, item) => { await goto(page, '/identity'); await page.getByRole('button', { name: /^Choose Peer:/ }).waitFor({ state: 'visible', timeout: 15000 }); await save(page, 'runtime-identity-before', width, { viewportOnly: true }); await traceChoice(page, item, width === 360 ? 'Mentor' : width === 768 ? 'Student' : 'Peer', 6500); });
      }
      if (selection.widths.includes(1280)) {
        for (const [label, options, duration] of [['transit-normal', { motion: 'no-preference' }, 6500], ['transit-slow', { motion: 'no-preference', slow: true }, 11000], ['transit-failed', { motion: 'no-preference', fail: true }, 11000], ['transit-reduced-motion', { motion: 'reduce' }, 6500]]) await runProbe(label, 1280, options, async (page, item) => { await goto(page, '/identity'); await traceChoice(page, item, 'Student', duration); });
        const selectLevels = async (page, item, mode, levels) => {
          item.selections ||= [];
          for (const [position, index] of [['first', 1], ['middle', Math.ceil(levels / 2)], ['final', levels], ['reverse', 1]]) {
            const selection = { mode, position, index, before: new URL(page.url()).pathname, startedAt: Date.now() };
            item.selections.push(selection);
            const button = mode === '2d' ? page.getByRole('region', { name: 'Course level map, 2D', exact: true }).getByRole('button', { name: new RegExp(`^Level ${index}\\b`) }) : page.getByRole('button', { name: new RegExp(`^${index}\\. `) });
            try {
              selection.initialMatches = await button.count();
              if (selection.initialMatches === 0) await button.waitFor({ state: 'visible', timeout: 5000 });
              selection.matches = await button.count(); selection.visible = selection.matches === 1 && await button.isVisible();
              if (selection.matches !== 1) { selection.outcome = 'target-not-unique-or-absent'; continue; }
              selection.beforeGeometry = await button.evaluate((element) => { const rect = element.getBoundingClientRect(); return { rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height }, pressed: element.getAttribute('aria-pressed'), focus: document.activeElement === element }; });
              if (selection.before === `/courses/course-fixture/learn/lesson-${index}`) selection.outcome = 'already-selected-no-travel';
              else { await button.click({ timeout: 5000 }); await page.waitForURL(`${base}/courses/course-fixture/learn/lesson-${index}`, { timeout: 10000 }); selection.outcome = 'destination-route-observed'; }
              selection.afterPressed = await button.getAttribute('aria-pressed');
            } catch (error) { selection.outcome = 'action-or-arrival-incomplete'; selection.message = error.message; report.failures.push({ kind: 'journey-action', levels, mode, position, message: error.message }); }
            finally { selection.after = new URL(page.url()).pathname; selection.finishedAt = Date.now(); }
          }
        };
        for (const levels of [1, 30, 100, 300]) await runProbe(`journey-runtime-${levels}`, 1280, { levels, motion: 'no-preference' }, async (page, item) => {
          await goto(page, '/courses/course-fixture/learn/lesson-1');
          await page.getByRole('button', { name: /^(2D map|3D view)$/ }).waitFor({ state: 'visible', timeout: 15000 });
          const mode3d = page.getByRole('button', { name: '2D map', exact: true });
          item.initial = await observe(page); item.mode3dObserved = await mode3d.isVisible().catch(() => false);
          if (item.mode3dObserved) {
            await selectLevels(page, item, '3d', levels);
            await page.locator('canvas').last().scrollIntoViewIfNeeded();
            await save(page, `runtime-journey-${levels}-3d`, 1280, { viewportOnly: true });
            if (levels === 30) {
              item.contextLoss = await page.evaluate(() => { const canvas = Array.from(document.querySelectorAll('canvas')).at(-1); const gl = canvas?.getContext('webgl2'); const extension = gl?.getExtension('WEBGL_lose_context'); if (!extension) return { available: false }; const events = []; canvas.addEventListener('webglcontextlost', () => events.push({ type: 'lost', at: performance.now() })); canvas.addEventListener('webglcontextrestored', () => events.push({ type: 'restored', at: performance.now() })); window.__iwA2Graphics = { extension, events }; extension.loseContext(); return { available: true }; });
              if (item.contextLoss.available) { await page.waitForTimeout(700); item.contextLoss.lost = await observe(page); item.contextLoss.alertVisible = await page.getByRole('alert').filter({ hasText: 'Graphics context lost' }).isVisible().catch(() => false); await save(page, 'runtime-context-lost', 1280, { viewportOnly: true }); await page.evaluate(() => window.__iwA2Graphics.extension.restoreContext()); await page.waitForTimeout(1200); item.contextLoss.restored = await observe(page); item.contextLoss.events = await page.evaluate(() => window.__iwA2Graphics.events); }
              item.finiteHeapSamples = [];
              for (let index = 0; index < 5; index++) { item.finiteHeapSamples.push({ at: Date.now(), ...(await observe(page)) }); if (index < 4) await page.waitForTimeout(5000); }
            }
            if (await mode3d.isVisible().catch(() => false)) await mode3d.click();
          }
          const map = page.getByRole('region', { name: 'Course level map, 2D', exact: true });
          await map.waitFor({ state: 'visible', timeout: 7000 });
          item.mapAria = await snapshot(page); await selectLevels(page, item, '2d', levels); item.final = await observe(page);
          await map.scrollIntoViewIfNeeded(); await save(page, `runtime-journey-${levels}-2d`, 1280, { viewportOnly: true });
        }, 110000);
        const fallbackCases = [
          ['webgl-unavailable', { levels: 30, motion: 'no-preference', webglUnavailable: true }],
          ['journey-reduced-motion', { levels: 30, motion: 'reduce' }],
          ...[1, 100, 300].map((levels) => [`journey-2d-${levels}`, { levels, motion: 'no-preference', webglUnavailable: true }])
        ];
        for (const [label, options] of fallbackCases) await runProbe(label, 1280, options, async (page, item) => {
          await goto(page, '/courses/course-fixture/learn/lesson-1');
          const map = page.getByRole('region', { name: 'Course level map, 2D', exact: true });
          await map.waitFor({ state: 'visible', timeout: 15000 });
          await map.getByRole('button', { name: /^Level 1\b/ }).waitFor({ state: 'visible', timeout: 7000 });
          item.before = await observe(page); item.mapAria = await snapshot(page);
          item.toggleDisabled = await page.getByRole('button', { name: '3D view', exact: true }).isDisabled();
          await selectLevels(page, item, '2d', options.levels);
          item.after = await observe(page); item.afterAria = await snapshot(page);
          item.keyboard = { outcome: options.levels === 1 ? 'not-applicable-single-level' : 'no-unselected-visible-level-within-40-tabs', tabs: [] };
          if (options.levels > 1) {
            for (let index = 0; index < 40; index++) {
              await page.keyboard.press('Tab');
              const candidate = await page.evaluate(() => {
                const element = document.activeElement; const rect = element?.getBoundingClientRect();
                const inMap = !!element?.closest('[aria-label="Course level map, 2D"]');
                const match = inMap && element.tagName === 'BUTTON' && element.textContent.trim().match(/^Level (\d+)\b/);
                return { name: element?.getAttribute('aria-label') || element?.textContent?.trim().slice(0, 140), level: match ? Number(match[1]) : null, pressed: element?.getAttribute('aria-pressed'), inViewport: !!rect && rect.width > 0 && rect.height > 0 && rect.x >= 0 && rect.y >= 0 && rect.right <= innerWidth && rect.bottom <= innerHeight };
              });
              item.keyboard.tabs.push(candidate);
              if (!candidate.level || candidate.pressed === 'true' || !candidate.inViewport) continue;
              item.keyboard.level = candidate.level; item.keyboard.before = new URL(page.url()).pathname;
              try { await page.keyboard.press('Enter'); await page.waitForURL(`${base}/courses/course-fixture/learn/lesson-${candidate.level}`, { timeout: 10000 }); item.keyboard.outcome = 'destination-route-observed'; }
              catch (error) { item.keyboard.outcome = 'activation-or-arrival-incomplete'; item.keyboard.message = error.message; }
              item.keyboard.after = new URL(page.url()).pathname;
              break;
            }
          }
          item.afterKeyboard = await observe(page);
          try { await map.scrollIntoViewIfNeeded(); await save(page, label, 1280, { viewportOnly: true }); }
          catch (error) { item.captureError = error.message; report.failures.push({ kind: 'runtime-capture', label, width: 1280, message: error.message }); }
        }, 65000);
      }
      report.runtimeElapsedMs = Date.now() - runtimeStart;
    }
    report.status = 'completed-with-observations';
  } catch (error) { report.status = 'failed'; report.failures.push({ kind: 'terminal', message: error.message, stack: error.stack }); process.exitCode = 1; }
  finally {
    if (browser) await browser.close().catch((error) => report.failures.push({ kind: 'browser-close', message: error.message }));
    if (server) { server.closeAllConnections(); await new Promise((done) => server.close(done)); }
    report.finishedAt = new Date().toISOString();
    report.missingFixtures = [...new Set(report.missingFixtures)];
    const path = resolve(output, 'capture-results.json');
    await writeFile(path, JSON.stringify(report, null, 2) + '\n', { flag: 'wx' });
    await register(path, 'Synthetic current-frontend capture/interaction/axe/network/headless metrics and terminal status');
    console.log(`UI_CAPTURE_DONE ${runId} status=${report.status} screenshots=${report.screenshots.length} failures=${report.failures.length} missingFixtures=${report.missingFixtures.length} results=${path}`);
    if (!report.screenshots.length) process.exitCode = 1;
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await runCapture();

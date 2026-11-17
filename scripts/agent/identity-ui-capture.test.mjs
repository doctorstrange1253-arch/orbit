import test from 'node:test';
import assert from 'node:assert/strict';
import { resolve, join } from 'node:path';
import { readFile } from 'node:fs/promises';

const helper = () => import('./identity-ui-capture.mjs');
const root = resolve('D:/orbit-main/orbit-main/.agent/scratch/build-contract');
const origin = 'http://127.0.0.1:8765';
const fixture = async () => JSON.parse(await readFile(new URL('./identity-ui-fixtures.json', import.meta.url), 'utf8'));

test('synthetic honours endpoint has the inspected totals and items contract', async () => {
  const { fixtureBody } = await helper();
  const response = fixtureBody('/sessions/mentors/account-fixture/honours', await fixture());
  assert.deepEqual(response, { totals: { count: 0, byTier: { beacon: 0, comet: 0, supernova: 0 } }, items: [], canHonourToday: false });
});

test('synthetic skill cards have actual offered and wanted labels', async () => {
  const { fixtureBody } = await helper();
  const response = fixtureBody('/skills/all', await fixture());
  for (const skill of response) {
    assert.equal(typeof skill.skillOffered, 'string');
    assert.ok(skill.skillOffered.length > 0);
    assert.equal(typeof skill.skillWanted, 'string');
    assert.ok(skill.skillWanted.length > 0);
  }
});

test('capture selection declares the default smoke and full matrix', async () => {
  const { captureSelection } = await helper();
  assert.deepEqual(captureSelection([]).widths, [360, 768, 1280]);
  assert.equal(captureSelection([]).screens.length, 5);
  assert.equal(captureSelection(['--all']).screens.length, 49);
});

test('capture selection supports exact bounded batches and state-only execution', async () => {
  const { captureSelection } = await helper();
  const selection = captureSelection(['--screens', 'mentor-courses,mentor-students', '--widths', '360,768']);
  assert.deepEqual(selection.screens.map(([id]) => id), ['mentor-courses', 'mentor-students']);
  assert.deepEqual(selection.widths, [360, 768]);
  assert.deepEqual(captureSelection(['--states-only']).screens, []);
});

for (const args of [['--screens', 'unknown'], ['--screens'], ['--widths', '500'], ['--widths', 'NaN'], ['--widths']]) {
  test(`capture selection rejects unsupported or missing input ${args.join(' ')}`, async () => {
    const { captureSelection } = await helper();
    assert.equal(typeof captureSelection, 'function');
    assert.throws(() => captureSelection(args));
  });
}

test('viewport-only retry selection is explicit while retaining the requested route and width', async () => {
  const { captureSelection } = await helper();
  assert.equal(typeof captureSelection, 'function');
  assert.equal(captureSelection([]).viewportOnly, false);
  const selection = captureSelection(['--screens', 'course-detail', '--widths', '1280', '--viewport-only']);
  assert.equal(selection.viewportOnly, true);
  assert.deepEqual(selection.screens, [['course-detail', '/courses/course-fixture']]);
  assert.deepEqual(selection.widths, [1280]);
});

test('runtime evidence selection does not silently run normal screenshots or change requested widths', async () => {
  const { captureSelection } = await helper();
  assert.equal(captureSelection([]).runtime, false);
  const selected = captureSelection(['--states-only', '--runtime', '--widths', '768,1280']);
  assert.equal(selected.runtime, true);
  assert.deepEqual(selected.screens, []);
  assert.deepEqual(selected.widths, [768, 1280]);
});

test('runtime case selection isolates declared probes without running other cases', async () => {
  const { captureSelection } = await helper();
  assert.deepEqual(captureSelection([]).runtimeCases, []);
  const selected = captureSelection(['--states-only', '--runtime', '--runtime-cases', 'webgl-unavailable,journey-reduced-motion,journey-2d-100', '--widths', '1280']);
  assert.deepEqual(selected.runtimeCases, ['webgl-unavailable', 'journey-reduced-motion', 'journey-2d-100']);
  assert.deepEqual(selected.screens, []);
  assert.deepEqual(selected.widths, [1280]);
});

for (const args of [['--runtime-cases', 'webgl-unavailable'], ['--runtime', '--runtime-cases'], ['--runtime', '--runtime-cases', 'unknown'], ['--runtime', '--runtime-cases', '']]) {
  test(`runtime case selection rejects incomplete or unsupported input ${args.join(' ')}`, async () => {
    const { captureSelection } = await helper();
    assert.throws(() => captureSelection(args));
  });
}

test('Peer readiness uses its rendered skill action rather than its document title', async () => {
  const { destinationEvidenceReady } = await helper();
  assert.equal(typeof destinationEvidenceReady, 'function');
  const sample = { path: '/peer/dashboard', hasSplash: false, headings: ['Good afternoon, UI.'], visibleButtonNames: ['Add a new skill'] };
  const requests = [{ contextId: 'ctx-peer', path: '/skills/my', status: 200, fulfilledAt: 100 }];
  assert.equal(destinationEvidenceReady(sample, 'Peer', 'ctx-peer', requests), true);
  assert.equal(destinationEvidenceReady({ ...sample, visibleButtonNames: [] }, 'Peer', 'ctx-peer', requests), false);
  assert.equal(destinationEvidenceReady({ ...sample, path: '/identity' }, 'Peer', 'ctx-peer', requests), false);
  assert.equal(destinationEvidenceReady({ ...sample, hasSplash: true }, 'Peer', 'ctx-peer', requests), false);
});

test('destination readiness requires its same-context fulfilled successful core GET', async () => {
  const { destinationEvidenceReady } = await helper();
  assert.equal(typeof destinationEvidenceReady, 'function');
  const sample = { path: '/student/universe', hasSplash: false, headings: ['Your universe'], visibleButtonNames: [] };
  const request = { contextId: 'ctx-student', path: '/courses/enrollments/me', status: 200, fulfilledAt: 100 };
  assert.equal(destinationEvidenceReady(sample, 'Student', 'ctx-student', [request]), true);
  for (const patch of [{ contextId: 'other' }, { path: '/courses' }, { status: 503 }, { status: 501 }, { fulfilledAt: null }]) assert.equal(destinationEvidenceReady(sample, 'Student', 'ctx-student', [{ ...request, ...patch }]), false);
  assert.equal(destinationEvidenceReady({ ...sample, headings: [] }, 'Student', 'ctx-student', [request]), false);
  assert.equal(destinationEvidenceReady(sample, 'Student', 'ctx-student', []), false);
  assert.equal(destinationEvidenceReady(sample, 'Unknown', 'ctx-student', [request]), false);
});

test('transition summary distinguishes destination routing, actual readiness and an early overlay clearance', async () => {
  const { transitionSummary } = await helper();
  assert.equal(typeof transitionSummary, 'function');
  const samples = [
    { elapsedMs: 0, path: '/student/universe', destinationReady: false, overlayCount: 0, overlayTexts: [] },
    { elapsedMs: 200, path: '/mentor/observatory', destinationReady: false, overlayCount: 2, overlayTexts: ['Legacy DOM thought'] },
    { elapsedMs: 3000, path: '/mentor/observatory', destinationReady: false, overlayCount: 1, overlayTexts: ['Legacy DOM thought'] },
    { elapsedMs: 3250, path: '/mentor/observatory', destinationReady: false, overlayCount: 0, overlayTexts: [] },
    { elapsedMs: 6750, path: '/mentor/observatory', destinationReady: true, overlayCount: 0, overlayTexts: [] },
  ];
  assert.deepEqual(transitionSummary(samples, '/mentor/observatory'), {
    sampleCount: 5, firstDestinationRouteMs: 200, firstDestinationReadyMs: 6750,
    lastOverlayObservedMs: 3000, firstClearAfterOverlayMs: 3250,
    overlayClearedBeforeReady: true, observedTexts: ['Legacy DOM thought'],
  });
});

test('transition summary never invents timing or readiness from absent samples', async () => {
  const { transitionSummary } = await helper();
  assert.equal(typeof transitionSummary, 'function');
  assert.deepEqual(transitionSummary([], '/mentor/observatory'), {
    sampleCount: 0, firstDestinationRouteMs: null, firstDestinationReadyMs: null,
    lastOverlayObservedMs: null, firstClearAfterOverlayMs: null,
    overlayClearedBeforeReady: null, observedTexts: [],
  });
  const result = transitionSummary([{ elapsedMs: 500, path: '/mentor/observatory', destinationReady: false, overlayCount: 0, overlayTexts: [] }], '/mentor/observatory');
  assert.equal(result.firstDestinationRouteMs, 500);
  assert.equal(result.firstDestinationReadyMs, null);
  assert.equal(result.firstClearAfterOverlayMs, null);
});

test('transition summary rejects unordered or malformed evidence instead of reporting fabricated timings', async () => {
  const { transitionSummary } = await helper();
  assert.equal(typeof transitionSummary, 'function');
  const sample = { elapsedMs: 20, path: '/mentor/observatory', destinationReady: false, overlayCount: 1, overlayTexts: [] };
  for (const patch of [{ elapsedMs: -1 }, { elapsedMs: NaN }, { elapsedMs: Infinity }, { path: null }, { destinationReady: 'yes' }, { overlayCount: -1 }, { overlayTexts: [null] }]) {
    assert.throws(() => transitionSummary([{ ...sample, ...patch }], '/mentor/observatory'), TypeError);
  }
  assert.throws(() => transitionSummary([sample, { ...sample, elapsedMs: 10 }], '/mentor/observatory'), TypeError);
  assert.throws(() => transitionSummary([], ''), TypeError);
  assert.throws(() => transitionSummary(null, '/mentor/observatory'), TypeError);
});

test('capture tools expose the installed Chromium launcher and axe constructor without launching', async () => {
  const { loadCaptureTools } = await helper();
  const { chromium, AxeBuilder } = loadCaptureTools();
  assert.equal(typeof chromium.launch, 'function');
  assert.equal(typeof AxeBuilder, 'function');
});

test('secondary Orbit fixture supplies nested streak, freeze and milestone contracts', async () => {
  const { fixtureBody } = await helper();
  const data = await fixture();
  const response = fixtureBody('/orbit/me', data);
  assert.deepEqual(response.streak, { current: data.account.gameology.currentStreak, longest: data.account.gameology.longestStreak, state: 'active' });
  assert.deepEqual(response.freeze, { tokens: 1, cap: 3, costPhotons: 200 });
  assert.deepEqual(response.milestones, []);
  assert.equal(response.nextMilestone, null);
});

test('secondary league and actual duel endpoint fixtures preserve explicit empty states', async () => {
  const { fixtureBody } = await helper();
  const data = await fixture();
  const league = fixtureBody('/orbit/league', data);
  assert.deepEqual(league.division, { id: 'asteroid_belt', name: 'Asteroid Belt', color: '#9ca3af', index: 0 });
  assert.deepEqual(league.standings, []);
  assert.equal(league.you, null);
  assert.equal(league.promoteCount, 5);
  assert.equal(league.relegateCount, 5);
  assert.ok(Number.isFinite(Date.parse(league.resetsAtUTC)));
  assert.deepEqual(fixtureBody('/orbit/duels/me', data), { current: null, record: { won: 0, lost: 0, drew: 0 }, history: [] });
});

test('secondary Gameology fixtures retain original achievement labels and XP amounts', async () => {
  const { fixtureBody } = await helper();
  const data = await fixture();
  const achievements = fixtureBody('/gameology/achievements', data).items;
  assert.equal(achievements.length, data.achievements.length);
  assert.deepEqual(achievements.map((item) => item.title), data.achievements.map((item) => item.name));
  const history = fixtureBody('/gameology/history', data).items;
  assert.deepEqual(history.map((item) => item.xpAwarded), data.history.map((item) => item.xp));
});

test('synthetic streak date follows supplied lesson history and is not invented for empty history', async () => {
  const { fixtureBody } = await helper();
  const data = await fixture();
  const activity = fixtureBody('/gameology/history', data).items.find((item) => item.event === 'lesson_completed');
  assert.equal(fixtureBody('/gameology/me', data).lastActiveDate, activity.createdAt.slice(0, 10));
  assert.equal(fixtureBody('/gameology/me', data, { empty: true }).lastActiveDate, null);
});

test('secondary Shop fixtures preserve descriptions and inspected tab categories', async () => {
  const { fixtureBody } = await helper();
  const data = await fixture();
  const catalog = fixtureBody('/orbit/shop', data).catalog;
  assert.deepEqual(catalog.map((item) => item.hint), data.catalog.map((item) => item.description));
  assert.deepEqual(catalog.map((item) => item.category), ['identity', 'themes']);
  assert.deepEqual(fixtureBody('/orbit/shop', data, { empty: true }).catalog, []);
});

test('course-editor fixture enrollments retain existing learners and course outcomes', async () => {
  const { fixtureBody } = await helper();
  const data = await fixture();
  const people = fixtureBody('/courses/mentor/learners', data).items;
  const enrollments = fixtureBody('/courses/course-fixture/enrollments', data).items;
  assert.equal(enrollments.length, people.length);
  for (const [index, enrollment] of enrollments.entries()) {
    assert.equal(typeof enrollment._id, 'string');
    assert.equal(enrollment.user.name, people[index].name);
    assert.equal(enrollment.user._id, people[index].userId);
    assert.ok(Number.isFinite(Date.parse(enrollment.enrolledAt)));
    assert.equal(enrollment.progressPct, people[index].courses[0].progressPct);
    assert.equal(Boolean(enrollment.completedAt), Boolean(people[index].courses[0].completedAt));
  }
});

test('captured taxonomy and moderation queries have explicit empty synthetic contracts', async () => {
  const { fixtureBody } = await helper();
  const data = await fixture();
  assert.deepEqual(fixtureBody('/taxonomy/tree', data), { constellations: [] });
  assert.deepEqual(fixtureBody('/moderation/me/fp-rate', data), { total: 0, rate: 0 });
});

test('course category fixture follows the string-list contract rendered by catalog options', async () => {
  const { fixtureBody } = await helper();
  const data = await fixture();
  assert.deepEqual(fixtureBody('/courses/categories', data), { items: [data.course.category] });
  assert.deepEqual(fixtureBody('/courses/categories', data, { empty: true }), { items: [] });
});

test('actual private and public skill-map paths have explicit empty knowledge contracts', async () => {
  const { fixtureBody } = await helper();
  const data = await fixture();
  for (const path of ['/knowledge/me/skill-map', '/knowledge/peer-one/skill-map']) {
    assert.deepEqual(fixtureBody(path, data), { stars: [], edges: [], clusters: [], path: [], meta: { totalConceptsTouched: 0 } });
  }
});

test('capture evidence budget returns a completed operation and its failure unchanged', async () => {
  const { withinBudget } = await helper();
  assert.equal(typeof withinBudget, 'function');
  assert.equal(await withinBudget(() => Promise.resolve('observed'), 1000), 'observed');
  const failure = new Error('actual stage failure');
  await assert.rejects(withinBudget(() => Promise.reject(failure), 1000), (error) => error === failure);
});

test('capture evidence budget rejects a nonterminating stage', async () => {
  const { withinBudget } = await helper();
  assert.equal(typeof withinBudget, 'function');
  await assert.rejects(withinBudget(() => new Promise(() => {}), 25), /exceeded 25ms/);
});

test('capture evidence budget rejects invalid limits before invoking the operation', async () => {
  const { withinBudget } = await helper();
  assert.equal(typeof withinBudget, 'function');
  for (const limit of [0, -1, 1.5, NaN, Infinity, '25']) {
    let called = false;
    await assert.rejects(withinBudget(() => { called = true; }, limit), RangeError);
    assert.equal(called, false);
  }
  await assert.rejects(withinBudget(null, 25), TypeError);
});

test('static asset resolution stays within the isolated build root', async () => {
  const { safeAssetPath } = await helper();
  assert.equal(safeAssetPath(root, '/assets/app.js'), join(root, 'assets', 'app.js'));
});

for (const path of ['/../private.txt', '/assets/%2e%2e/%2e%2e/private.txt', '/assets/..\\private.txt', '/assets/a%00.svg', '/%zz']) {
  test(`static asset resolution rejects traversal or malformed path ${path}`, async () => {
    const { safeAssetPath } = await helper();
    assert.equal(safeAssetPath(root, path), null);
  });
}

for (const path of ['/.env', '/assets/.env.production', '/google-services.json', '/assets/service-account.json']) {
  test(`static asset resolution rejects sensitive basename ${path}`, async () => {
    const { safeAssetPath } = await helper();
    assert.equal(safeAssetPath(root, path), null);
  });
}

test('network routing permits only the exact owned loopback origin', async () => {
  const { networkKind } = await helper();
  assert.equal(networkKind(`${origin}/assets/app.js`, origin), 'local');
  assert.equal(networkKind(`${origin}/api/courses`, origin), 'local');
});

for (const url of ['http://127.0.0.1:8766/api', 'http://localhost:8765/api', 'https://127.0.0.1:8765/api', 'https://orbit-2-he28.onrender.com/api', 'http://user@127.0.0.1:8765/api', 'not a URL']) {
  test(`network routing rejects unowned or credential-bearing origin ${url}`, async () => {
    const { networkKind } = await helper();
    assert.equal(networkKind(url, origin), 'block');
  });
}

test('network routing permits only the existing public font asset hosts and paths', async () => {
  const { networkKind } = await helper();
  assert.equal(networkKind('https://fonts.googleapis.com/css2?family=Poppins', origin), 'font');
  assert.equal(networkKind('https://fonts.gstatic.com/s/poppins/v23/font.woff2', origin), 'font');
  assert.equal(networkKind('https://fonts.gstatic.com.evil.invalid/s/font.woff2', origin), 'block');
  assert.equal(networkKind('http://fonts.gstatic.com/s/font.woff2', origin), 'block');
  assert.equal(networkKind('https://fonts.gstatic.com:8443/s/font.woff2', origin), 'block');
  assert.equal(networkKind('https://fonts.gstatic.com/private.js', origin), 'block');
});

test('fixture level count accepts the stated one-to-three-hundred limits', async () => {
  const { checkedLevelCount } = await helper();
  assert.equal(checkedLevelCount(1), 1);
  assert.equal(checkedLevelCount(30), 30);
  assert.equal(checkedLevelCount(300), 300);
});

for (const value of [0, -1, 301, 1.5, NaN, Infinity, '30', null, true]) {
  test(`fixture level count rejects invalid or unbounded value ${String(value)}`, async () => {
    const { checkedLevelCount } = await helper();
    assert.throws(() => checkedLevelCount(value));
  });
}

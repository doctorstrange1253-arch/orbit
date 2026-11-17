const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '../../..');
const state = require(path.join(root, 'scripts/agent/supervisor-state.js'));
const lock = JSON.parse(fs.readFileSync(path.join(root, '.agent/RUNLOCK'), 'utf8'));
const owner = state.identity(lock.pid);
if (owner.state !== 'live' || owner.processStarted !== lock.processStarted || lock.pid !== 13460) throw state.blocked('Current writer requires inspection');
const lease = state.acquire(root, 'ST-0', lock.token);
try {
  const dir = path.join(root, '.agent/side');
  const copy = path.join(dir, 'main-state-copy');
  for (const rel of ['main-snapshot.md', 'main-preservation.json', 'main-state-copy/STATE.md', 'main-state-copy/HANDOFF.md']) {
    if (fs.existsSync(path.join(dir, rel))) throw new Error(`Existing snapshot must not be overwritten: ${rel}`);
  }
  const git = args => {
    const result = spawnSync('git', ['-C', root, ...args], { encoding: 'utf8', timeout: 60000, maxBuffer: 16777216 });
    if (result.status !== 0) throw new Error(result.stderr || 'Git inspection failed');
    return result.stdout;
  };
  const stamp = state.utc();
  const stateBytes = fs.readFileSync(path.join(root, '.agent/STATE.md'));
  const handoffBytes = fs.readFileSync(path.join(root, '.agent/HANDOFF.md'));
  const current = stateBytes.toString('utf8').split(/\r?\n## (?:Historical|User-requested sleep-pause resume)/)[0];
  const gate = current.match(/\bGATE:\s*([^\r\n]+)/)?.[1];
  const last = current.match(/LAST_COMPLETED_STEP:\s*([^\r\n]+)/)?.[1];
  const next = current.match(/- Next:\s*([^\r\n]+)/)?.[1];
  if (!gate || !last || !next) throw new Error('Required exact main state fields missing');
  const branch = git(['branch', '--show-current']).trim();
  const head = git(['rev-parse', 'HEAD']).trim();
  const status = git(['status', '--short']);
  const stat = git(['diff', '--stat']);
  const register = (relative, purpose) => {
    const bytes = fs.readFileSync(path.join(root, relative));
    if (!bytes.length) throw new Error(`Empty artifact: ${relative}`);
    const hash = state.hash(bytes);
    state.durableAppend(path.join(root, '.agent/FILE_REGISTRY.md'), `| ${relative} | ${purpose} | ST-0 | ${bytes.length}bytes/SHA256${hash}; private recovery, verified | 2026-11-13 |`);
    state.durableAppend(path.join(root, '.agent/SESSION_LOG.md'), `- ${stamp} ST-0 created/verified/registered ${relative}, ${bytes.length}bytes; no application change.`);
    console.log(JSON.stringify({ file: relative, bytes: bytes.length, sha256: hash, firstLines: bytes.toString('utf8').split(/\r?\n/).slice(0, 2) }));
  };
  fs.mkdirSync(copy, { recursive: true });
  for (const [name, bytes] of [['STATE.md', stateBytes], ['HANDOFF.md', handoffBytes]]) {
    fs.writeFileSync(path.join(copy, name), bytes, { flag: 'wx' });
    if (!fs.readFileSync(path.join(copy, name)).equals(bytes)) throw new Error('Verbatim state copy mismatch');
    register(`.agent/side/main-state-copy/${name}`, `Verbatim main ${name} before Shark Tank parking`);
  }
  const paths = [...new Set(git(['ls-files', '--cached', '--others', '--exclude-standard', '-z']).split('\0').filter(Boolean))];
  const excluded = [], files = [];
  for (const relative of paths) {
    if (relative.split('/').some(part => /^\.env(?:\.|$)/i.test(part) || ['node_modules', '.git'].includes(part)) || ['.agent/scratch/', '.agent/side/', '.agent/quarantine/', 'docs/pitch/'].some(prefix => relative.startsWith(prefix))) {
      excluded.push(relative); continue;
    }
    let item;
    try { item = fs.lstatSync(path.join(root, relative)); }
    catch (error) { if (error.code === 'ENOENT') { files.push({ path: relative, missing: true }); continue; } throw error; }
    if (!item.isFile() || item.isSymbolicLink()) { excluded.push(relative); continue; }
    const bytes = fs.readFileSync(path.join(root, relative));
    files.push({ path: relative, bytes: bytes.length, sha256: state.hash(bytes) });
  }
  const baseline = {
    created: stamp, branch, head, gateExact: gate, files, excluded,
    allowedBookkeeping: ['CLAUDE.md', '.agent/STATE.md', '.agent/PATHS.md', '.agent/DECISIONS.md', '.agent/ERRORS.md', '.agent/FILE_REGISTRY.md', '.agent/SESSION_LOG.md', '.agent/RUN_JOURNAL.md', '.agent/RUNLOCK'],
    limits: 'Comparison hashes are not backups. Environment basenames excluded before content reads. Ignored files, dependencies, scratch and quarantine outside baseline.'
  };
  fs.writeFileSync(path.join(dir, 'main-preservation.json'), JSON.stringify(baseline, null, 2) + '\n', { flag: 'wx' });
  register('.agent/side/main-preservation.json', 'Safe-file restoration comparison baseline excluding secrets');
  const lines = [
    '# Main-task snapshot before Shark Tank', '', `Private recovery record. Created: ${stamp}`, '',
    '## Exact main state', '', '- Phase: C / Identity Worlds.', '- Task: IW-C-MLOCK within IW-C.',
    `- Main gate status, verbatim: ${gate}`, `- Branch: ${branch}`, `- HEAD: ${head}`,
    `- Last verified step, verbatim: ${last}`, `- Next step, verbatim: ${next}`,
    '- Main mission: .agent/MISSION.md v1.4, unchanged.',
    '- Verbatim copies: main-state-copy/STATE.md and HANDOFF.md.', '',
    '## In-flight tasks and corrections to stale main prose', '',
    '- Explicit user exception: resume two read-only research workflows before parking. Initial resumes naming w7nvua9f5 / wf_fbaa79e3-d7e and course w239ayi24 / wf_23543be6-0be ended with402quota errors. Founder subsequently stated402resolved and requested retry. Latest task IDs are recorded in side STATE/journal. No main fixes, materialization or dependent stages while parked.',
    '- Course journal retains the actual prior d5 result (22claims/8sources/36reads). Initial launch-only check saw only d2/d3 starts, but later d5 was incorrectly attempted again and failed402. Revised course script explicitly removes d5 from dispatch; no reliance on broken cache reuse. Original evidence remains preserved, not accepted by semantic review.',
    '- Original namingd1/d2, coursed1, scouts/plans and partial captures remain retained.',
    '- Naming comparison wx4zk02s2 completed with qualified independent discussion check; no name selected. Stale RUNNING wording must not trigger replay.',
    '- Journey wzf7dmw59 ended504/integratednull; older3FIX/3CHECK retained, nine-gap closure absent. Process investigation wjwapqz27 ended503/0returns. Both parked, not pending workers.',
    '- Supervisor54 and hook16 local tests passed in recorded scopes; current whole-tool suite, descendant/log-I/O, launcher CLI and corrected review/host acceptance unfinished. Hooks NOT_INSTALLED; launcher API-only.', '',
    '## Running processes and ports', '',
    `- Persistent claude.exePID13460/start2026-11-13T10:03:16.0506930Z owns RUNLOCK, token ${lock.token}.`,
    '- Previous2928confirmeddead by helper and exact CIMcount0; old bytes archived at .agent/scratch/stale-runlock-9e3e1c3e-883a-42a7-9e1d-ea53323563a9.json. No process killed.',
    '- OS inventory11:16:47UTC: persistent13460/conhost16636; transient inspection bash13352/18512/1256,node4140,powershell10412,conhost8908/15484. These tool children are not app servers.',
    '- Get-NetTCPConnection returned zero listening TCP ports for this owned tree. Unrelated sessions/machine ports are outside this scoped observation.', '',
    '## Preservation and restoration', '',
    `- main-preservation.json records ${files.length} safe files; ${excluded.length} paths excluded before content reads. Hashes are not backups.`,
    '- No stash, commit, reset, discard, app/dependency edits or publication. New pitch files remain provisionally untracked; local exclusion choice pending.',
    '- Do not restore obsolete RUNLOCK from copies. Verify actual current ownership first.',
    '- Copies are immutable provenance and intentionally retain stale earlier status wording. Snapshot corrections above take precedence for resumption.',
    '- Retain arriving research results in the harness; no main materialization or new downstream stage during side task.',
    '- At ST-END compare this baseline, remove only the exact parking block, keep the recorded main gate, add the side completion pointer and request RESTORED. Main resumes only after founder confirmation.', '',
    '## Key documents', '',
    '- .agent/MISSION.md, STATE.md, HANDOFF.md, TASKS.md, DECISIONS.md, ERRORS.md, CAPABILITIES.md, RUN_JOURNAL.md, RESUME_PROMPT.md.',
    '- docs/design/v3/02-world-bible.md,03-identity-switcher-spec.md,04-transition-spec.md,05-quotes-pool.md,01-ui-audit.md,01-ui-visual-evidence.md,research-log.md.',
    '- docs/plan/v2/02-master-plan.md,03-platform-contracts.md,04-signal-flare.md,05-ratings.md,10-currencies-ledger.md,11-studio-capture.md,13-mentorship-sessions.md,15-delivery-sequence.md,17-feature-portfolio-plan.md.',
    '- docs/research/digest.md exact ENOENT; no contents inferred. Main work-plan/newCP-W0/newCP-C remain unfinished per ledger.',
    '- Side authority: .agent/side/shark-tank/MISSION.md,STATE.md,FACTS.md. Side outputs: docs/pitch/.', '',
    '## Git status --short (verbatim output)', '', '```text', status.trimEnd(), '```', '',
    '## Git diff --stat (verbatim output)', '', '```text', stat.trimEnd(), '```', ''
  ];
  fs.writeFileSync(path.join(dir, 'main-snapshot.md'), lines.join('\n'), { flag: 'wx' });
  register('.agent/side/main-snapshot.md', 'Exact main gate/work/Git/process snapshot and restoration');
  state.journal(lease, 'DONE', 'ST-0', 'resume-before-park', 'Two actual resumes with retainedcoursed5; verbatimSTATE/HANDOFFcopies and snapshot/baseline verified registered. Long inline shell parsing failed before effects; dedicated file method succeeds.');
  console.log(JSON.stringify({ snapshotTime: stamp, gateExact: gate, branch, head, files: files.length, excluded: excluded.length, stateCopyMatches: fs.readFileSync(path.join(copy, 'STATE.md')).equals(stateBytes), handoffCopyMatches: fs.readFileSync(path.join(copy, 'HANDOFF.md')).equals(handoffBytes) }));
} finally { state.release(lease); }

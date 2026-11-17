const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const root = 'D:/orbit-main/orbit-main';
const base = path.join(root, '.agent/index');
const state = require(path.join(root, 'scripts/agent/supervisor-state.js'));
const lease = { root, lockFile: path.join(root, '.agent/RUNLOCK'), token: '6ea73f5a-3898-49c5-800c-0610667d07d2' };
state.assertLease(lease);
const git = args => cp.execFileSync('git', ['-C', root, ...args], { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 }).split('\0').filter(Boolean);
const tracked = new Set(git(['ls-files', '-z']));
const loose = new Set(git(['ls-files', '--others', '--exclude-standard', '-z']));
const listed = new Set([...tracked, ...loose]);
const rows = new Map();
const dirs = [];
const ignoredDirectory = rel => {
  const parts = rel.split('/');
  if (parts.includes('.git')) return 'Git internal database';
  if (parts.some(p => ['node_modules', 'dist', 'build', 'coverage', '.venv', 'venv', '__pycache__', '.pytest_cache', '.vite', '.gradle'].includes(p))) return 'Dependency, generated build, coverage or cache subtree';
  if (/^\.agent\/(scratch|quarantine)(\/|$)/.test(rel)) return 'Scratch or quarantine subtree; no content reads';
  if (/^\.agent\/index(\/|$)/.test(rel)) return 'Index outputs; tracked separately to avoid recursive indexing';
  if (/^docs\/pitch\/deck\/tooling\//.test(rel)) return 'Isolated third-party pitch tooling; dependency/vendor contents excluded';
  return '';
};
const classify = rel => {
  const name = path.posix.basename(rel);
  if (/^\.env/i.test(name)) return ['excluded', 'Environment filename only; never read content'];
  if (/(^|[-_.])(credentials?|secrets?|service[-_]?account)([-_.]|$)|^google-services\.json$/i.test(name) || /\.(pem|key|p12|pfx|keystore|jks)$/i.test(name)) return ['excluded', 'Credential-sensitive filename; metadata only'];
  if (/^(package-lock\.json|npm-shrinkwrap\.json|yarn\.lock|pnpm-lock\.yaml|.*\.lock)$/i.test(name)) return ['excluded', 'Lockfile contents excluded'];
  if (/\.(png|jpe?g|gif|webp|avif|svg|ico|bmp|tiff?|mp4|mov|webm|mp3|wav|ogg|flac|woff2?|ttf|otf|glb|gltf|bin|fbx|obj|blend|pdf|pptx?|docx?|xlsx?|zip|gz|7z|exe|dll|wasm|pyc)$/i.test(name)) return ['excluded', 'Binary, media, model or generated document; path and size only'];
  if (/\.output$|\.min\.(js|css)$|\.map$|\.tsbuildinfo$/i.test(name)) return ['excluded', 'Workflow output or generated/minified bundle'];
  if (/^\.agent\/(STATE|HANDOFF|FILE_REGISTRY|RUN_JOURNAL|ERRORS)\.md$/.test(rel) || /^\.agent\/side\/(main-preservation\.json|main-state-copy\/)/.test(rel)) return ['bounded', 'Protected large history or immutable snapshot; head40/tail30/narrow search only'];
  if (rel.startsWith('docs/pitch/') || rel.startsWith('.agent/side/shark-tank/')) return ['pitch', 'Side-stream title/status only; no pitch work'];
  if (/^docs\//.test(rel) || /^\.agent\//.test(rel) || /^\.\.\/docs\//.test(rel)) return ['L1', 'Documents/control; full <=600 lines, sections/key parts above600'];
  if (/(^|\/)(tests?|__tests__|scripts)(\/|$)|\.(test|spec)\.[^.]+$|\.(css|scss|sass|less)$|(^|\/)[^/]*config[^/]*$/.test(rel)) return ['L2', 'Tests/scripts/config/styles: head60, signatures and key sections'];
  if (/^(BackEnd|FrontEnd\/src)\//.test(rel)) return ['L1', 'Application source; full <=600 lines, sections/key parts above600'];
  return ['L3', 'Other source/config: one-line role inventory'];
};
const moduleFor = rel => {
  if (rel.startsWith('../docs/')) return 'workspace-docs';
  const p = rel.split('/');
  if (p[0] === '.agent') return p[1] === 'side' ? 'agent-side' : 'agent-control';
  if (p[0] === 'docs') return 'docs-' + (p[1] || 'root') + (['design', 'plan', 'progress'].includes(p[1]) && p.length > 3 ? '-' + p[2] : '');
  if (p[0] === 'BackEnd') return 'backend-' + (p.length > 2 ? p[1] : 'root');
  if (p[0] === 'FrontEnd') return p[1] === 'src' ? 'frontend-' + (p.length > 3 ? p[2] : 'src-root') : 'frontend-' + (p.length > 2 ? p[1] : 'root');
  return p.length > 1 ? p[0].replace(/[^a-z0-9-]/gi, '') : 'root';
};
function add(rel, abs, status) {
  if (rows.has(rel)) return;
  const st = fs.lstatSync(abs);
  const [depth, reason] = st.isSymbolicLink() ? ['excluded', 'Symbolic link; not followed'] : classify(rel);
  rows.set(rel, { path: rel, size: st.size, type: st.isSymbolicLink() ? 'symlink' : (path.extname(rel).slice(1) || 'text'), module: moduleFor(rel), depth, reason, status: status || (tracked.has(rel) ? 'tracked' : loose.has(rel) ? 'untracked' : 'ignored-or-workspace') });
}
function walk(abs, rel = '') {
  for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
    const next = rel ? rel + '/' + entry.name : entry.name;
    const target = path.join(abs, entry.name);
    if (entry.isDirectory()) {
      const reason = ignoredDirectory(next);
      if (reason) dirs.push({ path: next + '/', reason, count: 'not-enumerated' });
      else walk(target, next);
    } else add(next, target);
  }
}
walk(root);
const workspaceDocs = 'D:/orbit-main/docs';
if (fs.existsSync(workspaceDocs)) walk(workspaceDocs, '../docs');
for (const rel of listed) {
  if (rows.has(rel)) continue;
  const abs = path.join(root, rel);
  if (!fs.existsSync(abs)) { rows.set(rel, { path: rel, size: null, type: 'missing', module: moduleFor(rel), depth: 'missing', reason: 'Git-listed path absent on disk', status: tracked.has(rel) ? 'tracked' : 'untracked' }); continue; }
  const reason = ignoredDirectory(rel);
  if (reason) {
    const st = fs.lstatSync(abs);
    rows.set(rel, { path: rel, size: st.size, type: path.extname(rel).slice(1), module: moduleFor(rel), depth: 'excluded', reason, status: tracked.has(rel) ? 'tracked' : 'untracked' });
  } else add(rel, abs);
}
const all = [...rows.values()].sort((a, b) => a.path.localeCompare(b.path));
const modules = [...new Set(all.map(r => r.module))].sort();
const counts = modules.map(module => ({ module, files: all.filter(r => r.module === module).length, eligible: all.filter(r => r.module === module && !['excluded', 'missing'].includes(r.depth)).length, bytes: all.filter(r => r.module === module && !['excluded', 'missing'].includes(r.depth)).reduce((n, r) => n + r.size, 0) }));
const batches = [];
for (const { module } of counts) {
  let selected = [], bytes = 0, n = 1;
  const flush = () => { if (selected.length) batches.push({ id: module + '-' + String(n++).padStart(3, '0'), module, bytes, files: selected }); selected = []; bytes = 0; };
  for (const row of all.filter(r => r.module === module && !['excluded', 'missing'].includes(r.depth))) {
    if (selected.length && (selected.length >= 25 || bytes + row.size > 80000)) flush();
    selected.push(row.path); bytes += row.size;
  }
  flush();
}
function chunks(file, lines) {
  for (let i = 0; i < lines.length; i += 150) fs.writeFileSync(path.join(base, file), lines.slice(i, i + 150).join('\n') + '\n', { flag: i ? 'a' : 'wx' });
}
chunks('manifest.ndjson', all.map(r => JSON.stringify(r)));
chunks('batches.ndjson', batches.map(r => JSON.stringify(r)));
chunks('MANIFEST.md', ['# Project manifest', 'Metadata snapshot 2026-11-15; no environment/media/dependency content read.', 'Root D:/orbit-main/orbit-main plus workspace documentation ../docs/. Parent tmp-* clones and .claude settings are outside product scope and unread.', 'Directory exclusions are explicit subtrees, not counted as enumerated files. Eligible includes bounded-history and title/status-only exceptions; completion must preserve these labels.', '', '| Module | Files | Eligible | Eligible bytes |', '|---|---:|---:|---:|', ...counts.map(c => `| ${c.module} | ${c.files} | ${c.eligible} | ${c.bytes} |`), '', '| Excluded subtree | Reason | Enumeration |', '|---|---|---|', ...dirs.map(d => `| ${d.path} | ${d.reason} | ${d.count} |`), '', '| Path | Bytes | Type | Module | Depth | Status / reason |', '|---|---:|---|---|---|---|', ...all.map(r => `| ${r.path} | ${r.size ?? 'absent'} | ${r.type} | ${r.module} | ${r.depth} | ${r.status}; ${r.reason} |`)]);
chunks('PROGRESS.md', ['# Index progress', 'Manifest snapshot 2026-11-15. Pending is not read or digested. Individual >80KB sources require bounded sections rather than a full batch load.', '', '| Module | Batch | Files | Bytes | Status |', '|---|---|---:|---:|---|', ...batches.map(b => `| ${b.module} | ${b.id} | ${b.files.length} | ${b.bytes} | PENDING |`)]);
console.log(JSON.stringify({ files: all.length, eligible: all.filter(r => !['excluded', 'missing'].includes(r.depth)).length, excluded: all.filter(r => r.depth === 'excluded').length, missing: all.filter(r => r.depth === 'missing').length, excludedSubtrees: dirs.length, batches: batches.length }));
for (const c of counts) console.log(JSON.stringify(c));

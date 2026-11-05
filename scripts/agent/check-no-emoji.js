const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const project = path.resolve(__dirname, '../..');
const args = process.argv.slice(2);
if (args.length && (args.length !== 2 || args[0] !== '--root')) {
  console.error('Usage: node scripts/agent/check-no-emoji.js [--root directory]');
  process.exit(2);
}
const root = args.length ? path.resolve(args[1]) : project;
const emoji = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{200D}\u{FE0E}\u{FE0F}\u{20E3}]/gu;
const textExtensions = new Set(['.js', '.jsx', '.ts', '.tsx', '.cjs', '.mjs', '.glsl', '.css', '.html', '.svg', '.json', '.md', '.txt', '.yaml', '.yml', '.xml']);
const ignoredDirectories = new Set(['.git', 'node_modules', 'dist', 'build', '.gradle', '.venv', 'playwright-report', 'test-results']);
const excludedPaths = new Set(['.agent/scratch', '.agent/quarantine']);
const hits = [];
const errors = [];
let scanned = 0;
let excluded = 0;

function inspect(text, file) {
  text.split(/\r?\n/).forEach((line, index) => {
    const matches = [...line.matchAll(emoji)];
    if (matches.length) {
      const points = [...new Set(matches.map((match) => `U+${match[0].codePointAt(0).toString(16).toUpperCase()}`))];
      hits.push(`${file}:${index + 1}: ${points.join(', ')}`);
    }
  });
}

function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    const relative = path.relative(root, absolute).replace(/\\/g, '/');
    if (entry.isSymbolicLink() || excludedPaths.has(relative)) { excluded++; continue; }
    if (entry.isDirectory()) {
      if (ignoredDirectories.has(entry.name)) { excluded++; continue; }
      walk(absolute);
    } else if (entry.isFile()) {
      if (!textExtensions.has(path.extname(entry.name).toLowerCase()) || entry.name.startsWith('.env') || /service.?account/i.test(entry.name)) { excluded++; continue; }
      try {
        inspect(fs.readFileSync(absolute, 'utf8'), relative);
        scanned++;
      } catch (error) { errors.push(`${relative}: ${error.code}`); }
    }
  }
}

try { walk(root); } catch (error) { errors.push(`Scan failed: ${error.code || error.message}`); }
if (!args.length) {
  try {
    const history = execFileSync('git', ['log', '-n', '50', '--format=%h %s%n%b'], { cwd: root, encoding: 'utf8', timeout: 10000, stdio: ['ignore', 'pipe', 'pipe'] });
    inspect(history, 'commit-history');
  } catch (error) { errors.push(`Commit history unavailable: ${error.code || error.status}`); }
}
console.log(`check-no-emoji: scanned ${scanned} text files; ${hits.length} matching lines; excluded ${excluded} generated, binary or sensitive entries`);
for (const hit of hits) console.log(hit);
for (const error of errors) console.error(error);
process.exitCode = errors.length ? 2 : hits.length ? 1 : 0;

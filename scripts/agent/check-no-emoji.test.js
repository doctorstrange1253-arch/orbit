const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '../..');
const fixture = fs.mkdtempSync(path.join(root, '.agent/scratch/emoji-check-'));
const script = path.join(__dirname, 'check-no-emoji.js');
const write = (name, content) => {
  const file = path.join(fixture, name);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
};
const run = () => spawnSync(process.execPath, [script, '--root', fixture], {
  encoding: 'utf8', timeout: 120000,
});

test('scans authored text without interpreting binary assets or generated logs as UI', () => {
  write('src/main.jsx', 'export const title = "Course journey";');
  write('public/planet.png', Buffer.from('\u{1F680}', 'utf8'));
  write('.agent/scratch/test.log', '\u{1F680}');
  write('.agent/quarantine/legacy.js', '\u{1F680}');
  const clean = run();
  assert.equal(clean.status, 0, clean.stdout + clean.stderr);
  assert.match(clean.stdout, /scanned 1 text file/);
  write('docs/guide.md', '\u{1F680}');
  const dirty = run();
  assert.equal(dirty.status, 1);
  assert.match(dirty.stdout, /docs\/guide.md:1/);
  assert.match(dirty.stdout, /U\+1F680/);
});

test('detects joiners and variation sequences while allowing plain digits', () => {
  write('docs/guide.md', '123 cost 500');
  assert.equal(run().status, 0);
  write('src/label.js', String.fromCodePoint(0x200d, 0xfe0f));
  const result = run();
  assert.equal(result.status, 1);
  assert.match(result.stdout, /U\+200D/);
  assert.match(result.stdout, /U\+FE0F/);
});

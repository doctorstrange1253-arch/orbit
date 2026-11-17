const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const test = require('node:test');
const root = 'D:/orbit-main/orbit-main';
const base = path.join(root, '.agent/index');
const code = fs.readFileSync(path.join(base, 'update-progress.cjs'), 'utf8');
function fixture(rows, digest) {
  const dir = fs.mkdtempSync(path.join(base, 'accounting-fixture-'));
  const index = path.join(dir, '.agent/index');
  fs.mkdirSync(path.join(index, 'modules'), { recursive: true });
  const put = (name, text) => fs.writeFileSync(path.join(index, name), text);
  put('manifest.ndjson', rows.map(r => JSON.stringify(r)).join('\n') + '\n');
  put('batches.ndjson', JSON.stringify({ id: 'sample-001', module: 'sample', files: rows.map(r => r.path) }) + '\n');
  put('modules/sample.md', digest);
  put('coverage.ndjson', 'OLD COVERAGE\n');
  const translate = p => typeof p === 'string' && p.replaceAll('\\', '/').startsWith(root) && !p.replaceAll('\\', '/').startsWith(dir.replaceAll('\\', '/')) ? path.join(dir, p.replaceAll('\\', '/').slice(root.length)) : p;
  const io = new Proxy(fs, { get(target, name) {
    if (typeof target[name] !== 'function') return target[name];
    return (...args) => {
      if (args.length) args[0] = translate(args[0]);
      if (name === 'renameSync') args[1] = translate(args[1]);
      return target[name](...args);
    };
  } });
  const run = override => vm.runInNewContext(code, {
    require: name => name === 'node:fs' ? override || io : name.endsWith('supervisor-state.js') ? { assertLease() {}, durableAppend() {}, journal() {} } : require(name),
    console: { log() {} }, process: { argv: [] }
  }, { filename: 'update-progress.cjs' });
  return { dir, index, put, io, run, read: name => fs.readFileSync(path.join(index, name), 'utf8') };
}
const row = (name, depth = 'L1') => ({ path: name, module: 'sample', depth, size: 10 });
test('a pending digest row cannot earn completed coverage', () => {
  const f = fixture([row('BackEnd/a.js')], 'BackEnd/a.js | 10 | unread | READ:PENDING |\n');
  f.run();
  assert.equal(f.read('coverage.ndjson'), '');
});
test('a completed assigned-depth receipt earns coverage', () => {
  const f = fixture([row('BackEnd/a.js')], 'BackEnd/a.js | 10 | full | READ:FULL |\n');
  f.run();
  assert.equal(JSON.parse(f.read('coverage.ndjson')).path, 'BackEnd/a.js');
});
test('empty coverage replaces an old nonempty coverage file', () => {
  const f = fixture([row('BackEnd/a.js')], '# No completed rows\n');
  f.run();
  assert.equal(f.read('coverage.ndjson'), '');
});
test('missing paths never earn eligible credit and remain visible', () => {
  const f = fixture([row('BackEnd/gone.js', 'missing')], 'BackEnd/gone.js | 10 | full | READ:FULL |\n');
  f.run();
  assert.equal(f.read('coverage.ndjson'), '');
  assert.match(f.read('INDEX.md'), /1 missing/);
});
test('a interrupted multi-chunk write retains the previous coverage', () => {
  const rows = Array.from({ length: 151 }, (_, n) => row('BackEnd/a' + n + '.js'));
  const f = fixture(rows, rows.map(r => r.path + ' | 10 | full | READ:FULL |').join('\n'));
  let chunks = 0;
  const io = new Proxy(f.io, { get(target, name) {
    if (name !== 'writeFileSync') return target[name];
    return (file, data, opts) => {
      if (String(file).includes('coverage.ndjson') && ++chunks === 2) throw new Error('injected write interruption');
      return target[name](file, data, opts);
    };
  } });
  assert.throws(() => f.run(io), /injected write interruption/);
  assert.equal(f.read('coverage.ndjson'), 'OLD COVERAGE\n');
});
test('Gradle generated caches are excluded before content reads', () => {
  const source = fs.readFileSync(path.join(base, 'manifest.cjs'), 'utf8').split('\nwalk(root);')[0];
  const result = vm.runInNewContext(source + '\nignoredDirectory("FrontEnd/android/.gradle");', {
    require: name => name === 'node:child_process' ? { execFileSync: () => '' } : name.endsWith('supervisor-state.js') ? { assertLease() {} } : require(name)
  });
  assert.ok(result.includes('cache'));
});

async function importFixture(previous, incoming) {
  const f=fixture([row('FrontEnd/a.jsx')],previous);
  f.put('returned.json', '{\n"digest": '+JSON.stringify(incoming)+'\n}');
  const importer=fs.readFileSync(path.join(base,'import-reviewed.cjs'),'utf8');
  const processState={argv:['node','import-reviewed.cjs',path.join(f.index,'returned.json'),'0','sample'],exitCode:0},errors=[];
  await vm.runInNewContext(importer,{
    require:name=>name==='node:fs'?f.io:name.endsWith('supervisor-state.js')?{assertLease(){}}:require(name),
    process:processState,console:{log(){},error(message){errors.push(message);}}
  });
  return {...f,exitCode:processState.exitCode,errors};
}
test('import replaces a pending row with its completed receipt',async()=>{
  const f=await importFixture('FrontEnd/a.jsx | 10 | pending | READ:PENDING\n','FrontEnd/a.jsx | 10 | full | role | deps | risk | READ:FULL');
  assert.equal(f.exitCode,0);
  assert.ok(f.read('modules/sample.md').includes('READ:FULL'));
  assert.ok(!f.read('modules/sample.md').includes('READ:PENDING'));
});
test('duplicate incoming paths are rejected without modifying the digest',async()=>{
  const prior='# Existing\n';
  const r='FrontEnd/a.jsx | 10 | full | role | deps | risk | READ:FULL';
  const f=await importFixture(prior,r+'\n'+r);
  assert.equal(f.exitCode,1);
  assert.equal(f.read('modules/sample.md'),prior);
});
test('partial receipt tokens are rejected without modifying the digest',async()=>{
  const prior='# Existing\n';
  const f=await importFixture(prior,'FrontEnd/a.jsx | 10 | pending | role | deps | risk | READ:FULL_PENDING');
  assert.equal(f.exitCode,1);
  assert.equal(f.read('modules/sample.md'),prior);
});
test('progress refresh never appends canonical registry entries automatically',()=>{
  const f=fixture([row('BackEnd/a.js')],'BackEnd/a.js | 10 | full | READ:FULL |\n');
  let appends=0;
  vm.runInNewContext(code,{require:name=>name==='node:fs'?f.io:name.endsWith('supervisor-state.js')?{assertLease(){},durableAppend(){appends++;},journal(){}}:require(name),console:{log(){}},process:{argv:[]}});
  assert.equal(appends,0);
});

test('wrong read depth is not accepted for a full source file', () => {
  const f = fixture([row('BackEnd/a.js')], 'BackEnd/a.js | 10 | title only | READ:TITLE |\n');
  f.run();
  assert.equal(f.read('coverage.ndjson'), '');
});

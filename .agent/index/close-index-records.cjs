const fs=require('node:fs');
const path=require('node:path');
const root='D:/orbit-main/orbit-main',base=path.join(root,'.agent/index');
const state=require(path.join(root,'scripts/agent/supervisor-state.js'));
state.assertLease({lockFile:path.join(root,'.agent/RUNLOCK'),token:'6ea73f5a-3898-49c5-800c-0610667d07d2'});
const headers={
  'docs-plan-v2.md':'All49eligible v2plan/model-text files indexed at assigned depth; historical claims are not current reproduced defects or executed model results.',
  'frontend-components.md':'All95shared component files indexed at assigned depth; no browser/runtime tests or application edits.',
  'frontend-src-root.md':'All5entry/style/setup files indexed at assigned depth; no frontend server, browser, build or application test run.',
  'frontend-whiteboard.md':'All10whiteboard source/style/test files indexed at assigned depth; no RTC, socket, browser or application test execution.',
  'frontend-studio.md':'All3studio source/test files indexed; no media, canvas or application test execution.',
  'backend-utils.md':'All8utilities indexed as source only; no imports, external calls or runtime checks.',
  'backend-routes.md':'All29route files indexed; router presence alone is not runtime proof. Current server mounts were cross-checked separately.',
};
for(const [name,header]of Object.entries(headers)){
  const file=path.join(base,'modules',name),lines=fs.readFileSync(file,'utf8').split(/\r?\n/);
  lines[1]=header;
  fs.writeFileSync(file,lines.join('\n'));
}
const log='| IDX-E03 | Index importer recheck2026-11-15 | Corrected fixture run11tests:4failed/7passed; initial fixture translation accidentally double-prefixed paths and was corrected before acceptance | Pending-row filename suppression, duplicate incoming rows, partial receipt tokens, registry/marker interruption | Exact receipt/depth validation, duplicate rejection before writes, pending-row replacement and atomic importer; registry refresh now queues manual registration only. Final11PASS/exit0, accounting-import-green.log. Original RED logs retained; no application/toolkit tests or source changes. |';
state.durableAppend(path.join(root,'.agent/ERRORS.md'),log);
state.durableAppend(path.join(root,'.agent/RUN_JOURNAL.md'),'DONE IW-C-MLOCK step index-review-corrections '+new Date().toISOString()+' ElevenisolatedindexaccountingtestsPASSafteractualRED;42linecountconventionsnormalized;10randomsourcecomparisonsmatched. Previous updater message registered:2 after auto-registration removal meant pendingRegistration:2, not completed registration; queue/manualcheck now explicit. No application/recovery-toolkit changes.');
console.log(JSON.stringify({headersUpdated:Object.keys(headers).length,errorLogged:'IDX-E03'}));

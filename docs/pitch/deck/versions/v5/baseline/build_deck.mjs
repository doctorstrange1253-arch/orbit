import {readFile,writeFile,mkdir,access} from 'node:fs/promises';
import {join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
const root=dirname(fileURLToPath(import.meta.url));
const version=process.argv[2]||'v1';
if(!/^v\d+$/.test(version))throw Error('Use v0,v1,v2 version');
const out=join(root,version);
for(const name of [`Deck_${version}.pptx`,`Deck_${version}.pdf`]){let exists=false;try{await access(join(out,name));exists=true;}catch{}if(exists)throw Error(`Preserve existing ${version}; choose a new version number.`);}
await mkdir(out,{recursive:true});
const commands=[['node',[join(root,'generate_pages.mjs')]],['python',['-I',join(root,'build_model.py')]],['node',[join(root,'render_deck.mjs'),version]],['python',['-I',join(root,'finish_outputs.py'),version]],['node',[join(root,'tooling/sn-exporter/html_to_pptx.mjs'),'--deck-dir',root,'--pages-dir',join(root,'slides'),'--output',join(out,`Deck_${version}.pptx`),'--force']],['python',['-I',join(root,'add_notes.py'),version]],['python',['-I',join(root,'check_outputs.py'),version]],['node',[join(root,'make-preview.mjs'),version]]];
for(const [exe,args] of commands){const result=spawnSync(exe,args,{stdio:'inherit',env:{...process.env,PPT_SKILL_BROWSER_EXE:'C:/Users/Dell/AppData/Local/ms-playwright/chromium-1248/chrome-win64/chrome.exe'},timeout:180000});if(result.status!==0)throw Error(`${exe} failed ${result.status}: ${result.error?.message||''}`);}
console.log(`Built ${version} from deck-data.json; inspect contact-sheet.png and qa-report before approval.`);

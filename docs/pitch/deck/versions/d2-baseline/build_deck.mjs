import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {spawnSync} from 'node:child_process';
import {renderNative} from './native/render.mjs';
import {buildModel} from './native/model.mjs';
import {finishRender} from './native/finish.mjs';
import {assertFreshVersion} from './native/contracts.mjs';
const root=path.dirname(fileURLToPath(import.meta.url)),version=process.argv[2]||'v9';
const out=root+'/versions/'+version;
assertFreshVersion(out,version);
const data=JSON.parse(fs.readFileSync(root+'/deck-data.json'));
const layout=JSON.parse(fs.readFileSync(root+'/deck-layout.json'));
const sources=JSON.parse(fs.readFileSync(root+'/sources.json'));
if(data.slides.length!==10)throw Error('Exactly10slides required');
fs.mkdirSync(out,{recursive:true});
console.log(JSON.stringify(await renderNative(data,layout,sources,out,version)));
if(!process.argv.includes('--build-only')){
 const poppler='C:/Users/Dell/AppData/Local/Microsoft/WinGet/Packages/oschwartz10612.Poppler_Microsoft.Winget.Source_8wekyb3d8bbwe/poppler-25.07.0/Library/bin/';
 const render=root+'/render/'+version;fs.mkdirSync(render,{recursive:true});
 for(const [exe,args] of [['C:/Program Files/LibreOffice/program/soffice.com',['-env:UserInstallation='+pathToFileURL(root+'/_tools/lo-'+version+'-profile').href,'--headless','--convert-to','pdf','--outdir',out,out+'/Deck_'+version+'.pptx']],[poppler+'pdftoppm.exe',['-r','200','-png',out+'/Deck_'+version+'.pdf',render+'/slide']]]){const r=spawnSync(exe,args,{encoding:'utf8',timeout:180000});if(r.status!==0)throw Error(JSON.stringify({exe,status:r.status,signal:r.signal,error:r.error?.message,stdout:r.stdout,stderr:r.stderr}));}
 console.log(JSON.stringify(await buildModel(data,root)));console.log(JSON.stringify(await finishRender(root,version)));
 const check=spawnSync(root+'/_tools/pyenv/Scripts/python.exe',['-I',root+'/native/check_artifacts.py',root,version],{encoding:'utf8'});console.log(check.stdout);if(check.status!==0)throw Error(check.stderr||'Artifact check failed');
}


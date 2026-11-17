import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {join,dirname} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {chromium} from './tooling/sn-exporter/node_modules/playwright/index.mjs';
const root=dirname(fileURLToPath(import.meta.url));
const version=process.argv[2]||'v0';
const out=join(root,version);await mkdir(out,{recursive:true});await mkdir(join(out,'renders'),{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:'C:/Users/Dell/AppData/Local/ms-playwright/chromium-1248/chrome-win64/chrome.exe'});
const page=await browser.newPage({viewport:{width:1920,height:1080},deviceScaleFactor:1});
await page.route(/^https?:/,route=>route.abort());
const data=JSON.parse(await readFile(join(root,'deck-data.json'),'utf8'));
const checks=[];
try{
 for(const s of data.slides){
  const file=join(root,'slides',`slide_${String(s.number).padStart(2,'0')}.html`);
  await page.goto(pathToFileURL(file).href,{waitUntil:'load',timeout:20000});await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(150);
  const issues=await page.evaluate(()=>{
   const root=document.querySelector('.slide');const rb=root.getBoundingClientRect();const problems=[];
   for(const e of root.querySelectorAll('h1,h2,h3,p,li,td,th,.kicker,.small,.tag,.data-row,.hero,.step-num,.slide-footer')){
    if(!e.textContent.trim())continue;
    const b=e.getBoundingClientRect();const st=getComputedStyle(e);
    if(b.width>0&&(b.left<rb.left-1||b.top<rb.top-1||b.right>rb.right+1||b.bottom>rb.bottom+1))problems.push({kind:'outside',text:e.textContent.slice(0,55),bounds:{x:b.x,y:b.y,w:b.width,h:b.height}});
    if(e.scrollWidth>e.clientWidth+3&&e.clientWidth>0)problems.push({kind:'horizontal-overflow',text:e.textContent.slice(0,55)});
    if(e.matches('p,li,td,th')&&parseFloat(st.fontSize)<40)problems.push({kind:'small-body',size:st.fontSize,text:e.textContent.slice(0,35)});
   }
   return problems;
  });
  await page.screenshot({path:join(out,'renders',`slide_${String(s.number).padStart(2,'0')}.png`),animations:'disabled'});
  await page.pdf({path:join(out,`slide_${String(s.number).padStart(2,'0')}.pdf`),width:'20in',height:'11.25in',printBackground:true,preferCSSPageSize:false});
  checks.push({slide:s.number,issues});
 }
 await writeFile(join(out,'geometry-checks.json'),JSON.stringify(checks,null,2));
 console.log(JSON.stringify({version,slides:checks.length,geometryIssues:checks.reduce((n,s)=>n+s.issues.length,0),out}));
}finally{await browser.close();}

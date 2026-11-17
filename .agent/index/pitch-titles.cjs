const fs = require('node:fs');
const path = require('node:path');
const root = 'D:/orbit-main/orbit-main';
const rows = fs.readFileSync(path.join(root,'.agent/index/manifest.ndjson'),'utf8').trim().split('\n').map(JSON.parse).filter(r=>r.module==='docs-pitch'&&r.depth==='pitch');
const start = Number(process.argv[2] || 0);
if(!Number.isInteger(start)||start<0) throw Error('Invalid offset');
for(const row of rows.slice(start,start+25)){
  const file=path.join(root,row.path),st=fs.lstatSync(file);
  if(!st.isFile()||st.isSymbolicLink()||/^\.env/i.test(path.basename(file))) throw Error('Unsafe file');
  const fd=fs.openSync(file,'r'),buffer=Buffer.alloc(3000);
  let n;try{n=fs.readSync(fd,buffer,0,buffer.length,0);}finally{fs.closeSync(fd);}
  const first=buffer.subarray(0,n).toString('utf8').split(/\r?\n/).slice(0,20);
  const title=first.find(s=>/^#{1,2} /.test(s))||first.join(' ').match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]||path.basename(file);
  const status=first.filter(s=>/^(?:\*\*)?(Status|Stage|Gate|Version|Draft|Private preparation|Updated|Date)[ :]/i.test(s)).slice(0,2).join(' / ');
  console.log(JSON.stringify({path:row.path,bytes:row.size,read:'title/status only: first20lines within3000bytes',title,status:status||'Status not found in bounded header; inherited side G1 awaiting founder review, not file acceptance',type:row.type}));
}

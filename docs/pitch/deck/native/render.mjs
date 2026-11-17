import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {speakerNotes} from './notes.mjs';
import {validateGrid,validateSources,checkText} from './contracts.mjs';
const require=createRequire(import.meta.url);
const PptxGenJS=require('../_tools/node_modules/pptxgenjs');
const sharp=require('../_tools/node_modules/sharp');
const ROOT=path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/,'$1')),'..');
const py=ROOT+'/_tools/pyenv/Scripts/python.exe';
export async function renderNative(data,layout,sources,out,version){
 const pptx=new PptxGenJS();pptx.defineLayout({name:'READ',width:13.333,height:7.5});pptx.layout='READ';pptx.author='Orbit pitch preparation';pptx.subject='D1 draft / source-qualified estimates';pptx.title='Orbit — TBI-GEU';pptx.lang='en-IN';pptx.theme={headFontFace:'Segoe UI Semibold',bodyFontFace:'Segoe UI',lang:'en-IN'};
 const C=layout.palette, reports=[],numberRegistry=[],textOps=[],overflows=[];let requests=[],metrics=new Map();
 const key=(t,s,w,b)=>JSON.stringify([String(t),s,+w.toFixed(5),b]);
 function request(t,s,w,b=false){const k=key(t,s,w,b);if(!metrics.has(k))requests.push({key:k,text:String(t),size:s,width:w,bold:b});}
 function flush(){const unique=[...new Map(requests.map(r=>[r.key,r])).values()];if(!unique.length)return;const r=spawnSync(py,['-I',ROOT+'/native/measure_text.py'],{input:JSON.stringify(unique),encoding:'utf8',maxBuffer:5000000});if(r.status!==0)throw Error('Measurement failed: '+r.stderr);const a=JSON.parse(r.stdout);unique.forEach((r,i)=>metrics.set(r.key,a[i]));requests=[];}
 function measure(t,s,w,b=false){const k=key(t,s,w,b);if(!metrics.has(k)){request(t,s,w,b);flush();}return metrics.get(k);}
 function text(slide,t,x,y,w,h,size=10.5,bold=false,color=C.ink,kind='body',align='left'){
  if(t===undefined||t===null||t==='')return;const m=measure(t,size,w,bold);try{checkText(String(t),{maxChars:kind==='body'?550:kind==='heading'?64:2000,maxHeight:h,height:m.height});}catch(e){overflows.push({slide:reports.at(-1)?.number||1,kind,text:String(t),measured:m.height,available:h,message:e.message});}
  const value=m.lines.join('\n');slide.addText(value,{x,y,w,h,fontFace:bold?'Segoe UI Semibold':'Segoe UI',fontSize:size,color,margin:0,breakLine:false,fit:'none',valign:'top',align,paraSpaceAfterPt:0,lineSpacingMultiple:1.02});textOps.push({slide:reports.at(-1)?.number||1,text:String(t),x,y,w,h,size,color,kind,lines:m.lines.length,measuredHeight:m.height});
 }
 function shape(slide,type,x,y,w,h,fill,line=fill,width=0){slide.addShape(pptx.ShapeType[type],{x,y,w,h,fill:{color:fill},line:{color:line,width},rectRadius:0.04});}
 function line(slide,x,y,w,h,color=C.border,width=0.75){slide.addShape(pptx.ShapeType.line,{x,y,w,h,line:{color,width}});}
 function steps(slide,items,x,y,w,h,dark=false){const cw=w/items.length;items.forEach((t,i)=>{shape(slide,'rect',x+i*cw,y,cw-0.03,h,dark?'FFFFFF':C.tint);text(slide,t,x+i*cw+0.05,y+0.06,cw-0.13,h-0.1,10,true,C.ink,'step');if(i<items.length-1){line(slide,x+(i+1)*cw-0.08,y+h/2,0.12,0,C.primary,1.5);shape(slide,'chevron',x+(i+1)*cw-0.02,y+h/2-0.04,0.07,0.08,C.primary);}});}
 function table(slide,p,q){const x=q.x+0.1,w=q.w-0.2;let y=q.y+0.51;const split=p.split||0.56,ww=[w*split-0.08,w*(1-split)-0.02];const hhead=Math.max(...p.headers.map((t,i)=>measure(t,10.5,ww[i],true).height));text(slide,p.headers[0],x,y,ww[0],hhead,10.5,true,C.muted,'table');text(slide,p.headers[1],x+w*split,y,ww[1],hhead,10.5,true,C.muted,'table');y+=hhead+0.06;line(slide,x,y-0.025,w,0);
  const bodyH=p.text?measure(p.text,10.5,w).height:0;const rowFloor=Math.min(0.39,(q.h-1.12-hhead-bodyH)/p.rows.length);for(const row of p.rows){const h=Math.max(rowFloor,Math.max(...row.map((t,i)=>measure(t,10.5,ww[i]).height))+0.045);text(slide,row[0],x,y,ww[0],h,10.5,false,C.ink,'table');text(slide,row[1],x+w*split,y,ww[1],h,10.5,false,C.ink,'table');y+=h;line(slide,x,y-0.025,w,0);}
  if(p.text){y+=0.045;text(slide,p.text,x,y,w,q.y+q.h-0.28-y,10.5,false,C.ink);}
 }
 async function images(slide,p,q){const x=q.x+0.1,w=q.w-0.2;let y=q.y+0.49;const maxH=q.h>3?1.72:p.images.length===2?0.50:1.03;
  for(const im of p.images){const file=ROOT+'/assets/d1-details/'+im.name+'.png',m=await sharp(file).metadata();const h=Math.min(maxH,w*m.height/m.width),iw=h*m.width/m.height;slide.addImage({path:file,x:x+(w-iw)/2,y,w:iw,h});reports.at(-1)?.images?.push({file,ppi:m.width/iw});y+=h+0.04;text(slide,im.caption,x,y,w,0.15,8,false,C.muted,'caption');y+=0.19;}
  if(p.text)text(slide,p.text,x,y+0.03,w,q.y+q.h-0.28-y-0.03,10.5,false,C.ink);
 }
 function bars(slide,p,q){const x=q.x+0.1,w=q.w-0.2;let y=q.y+0.48;const max=Math.max(...p.values);p.values.forEach((v,i)=>{text(slide,p.labels[i],x,y,w*0.65,0.23,10.5,false,C.ink,'chart');text(slide,String(v),x+w*0.68,y,w*0.32,0.23,10.5,true,C.ink,'chart','right');y+=0.27;shape(slide,'rect',x,y,w,0.12,C.tint);shape(slide,'rect',x,y,w*v/max,0.12,C.primary);y+=0.22;});text(slide,p.unit,x,y,w,0.18,8,false,C.muted,'caption');text(slide,p.text,x,y+0.23,w,q.y+q.h-0.28-y-0.23,10.5,false,C.ink);}
 function waterfall(slide,p,q){const x=q.x+0.1,w=q.w-0.2;let y=q.y+0.47,total=0;for(let i=0;i<p.values.length;i++){const v=p.values[i],isTotal=i===0||i===p.values.length-1,start=isTotal?0:total+v,end=isTotal?v:total;if(isTotal)total=v;else total+=v;text(slide,p.labels[i],x,y,w*0.32,0.20,10.5,false,C.ink,'chart');text(slide,(v<0?'-':'')+Math.abs(v).toFixed(2),x+w*0.75,y,w*0.25,0.20,10.5,false,C.ink,'chart','right');shape(slide,'rect',x+w*0.33+w*0.38*start/110,y+0.06,w*0.38*Math.abs(end-start)/110,0.08,isTotal?C.primary:C.warm);y+=0.23;}text(slide,p.text,x,y+0.04,w,q.y+q.h-0.28-y-0.04,10.5,false,C.ink);}
 function gantt(slide,p,q){const x=q.x+0.1,w=q.w-0.2,barX=x+w*0.42,bw=w*0.58;let y=q.y+0.51;for(const tick of [1,30,60,90])text(slide,String(tick),barX+bw*(tick-1)/90-0.05,y,0.35,0.22,10.5,false,C.muted,'chart');y+=0.29;for(const t of p.tasks){text(slide,t.label,x,y,w*0.39,0.5,10.5,false,C.ink,'chart');shape(slide,'rect',barX,y+0.09,bw,0.17,C.tint);shape(slide,'rect',barX+bw*(t.start-1)/90,y+0.09,bw*(t.end-t.start+1)/90,0.17,C.primary);y+=0.38;}line(slide,barX+bw*44/90,q.y+0.76,0,1.12,C.warm,1);text(slide,'Day45 stop gate',x,q.y+2.02,w,0.22,10.5,true,C.ink,'chart');text(slide,p.text,x,q.y+2.29,w,q.h-2.57,10.5,false,C.ink);}
 function fundbars(slide,p,q){const x=q.x+0.1,w=q.w-0.2;let y=q.y+0.47;data.funding.forEach(f=>{text(slide,f.label,x,y,w*0.67,0.2,10.5,false,C.ink,'table');text(slide,(f.amount/1000)+'k',x+w*0.68,y,w*0.32,0.2,10.5,true,C.ink,'table','right');y+=0.23;shape(slide,'rect',x,y,w*f.amount/45000,0.055,C.primary);y+=0.08;});if(p.text)text(slide,p.text,x,y+0.05,w,q.y+q.h-0.28-y-0.05,10.5,false,C.ink);}
 for(const s of data.slides){const spans=s.number===1?layout.cover:layout.content,g=validateGrid(spans);validateSources(s.panels,sources);const slide=pptx.addSlide();slide.background={color:C.paper};
  text(slide,String(s.number).padStart(2,'0')+' / '+s.topic,0.35,0.3,11.8,0.18,8,true,C.muted,'chrome');line(slide,0.35,0.58,12.633,0);text(slide,s.headline,0.35,0.65,12.5,0.50,28,true,C.ink,'heading');text(slide,'Orbit / TBI-GEU Pitch / D1 draft',0.35,7.13,10,0.15,8,false,C.muted,'chrome');text(slide,s.number+'/10',11.9,7.13,1,0.15,8,false,C.muted,'chrome','right');
  const report={number:s.number,coverage:g.coverage,heroArea:g.heroArea,modules:s.panels.length,words:0,quantities:0,visuals:0,images:[]};reports.push(report);
  for(let i=0;i<s.panels.length;i++){const p=s.panels[i],q=g.rects[i],dark=p.type==='hero',ink=dark?'FFFFFF':C.ink;shape(slide,'roundRect',q.x,q.y,q.w,q.h,dark?C.ink:C.panel,C.border,0.75);text(slide,s.number+'.'+(i+1)+' '+p.title,q.x+0.1,q.y+0.09,q.w-0.2,0.35,10,true,ink,'module');const src=p.source.map(id=>id==='E'?'Planned':id==='M'?'Model estimate':id==='P'?'Source only':id==='F'?'Founder report':id==='V'?'Sample screen':id==='I'?'Index scope':id==='J15'?'Jordan 2015 / IRRODL':id==='CP26'?'Coursera.com / 16 Nov':id==='BI26'?'Brilliant.org / 16 Nov':id==='CF'?'Cloudflare pricing':id==='RZP'?'Razorpay pricing':'Organizer').join(' + ');text(slide,src,q.x+0.1,q.y+q.h-0.20,q.w-0.2,0.14,8,false,dark?'FFFFFF':C.muted,'source');
   const blob=[p.subtitle||'',p.text||'',...(p.rows||[]).flat(),...(p.steps||[]),...(p.tasks||[]).map(t=>t.label)].join(' ');report.words+=blob.split(/\s+/).filter(Boolean).length;const nums=blob.match(/\d[\d,]*(?:\.\d+)?%?/g)||[];report.quantities+=nums.length;numberRegistry.push(...nums.map(v=>({slide:s.number,module:i+1,value:v,sources:p.source,status:p.source.includes('E')||p.source.includes('M')?'ESTIMATE':p.source.includes('V')?'SAMPLE':p.source.includes('J15')?'PUBLISHED':'SOURCE/REPORT'})));
   if(p.type==='hero'){text(slide,p.value,q.x+0.1,q.y+0.42,q.w-0.2,0.96,56,true,'FFFFFF','hero');text(slide,p.subtitle,q.x+0.1,q.y+1.40,q.w-0.2,0.40,10.5,true,'FFFFFF');text(slide,p.text,q.x+0.1,q.y+1.85,q.w-0.2,0.78,10.5,false,'FFFFFF');}
   else if(p.type==='table')table(slide,p,q);
   else if(p.type==='image'){await images(slide,p,q);report.visuals++;}
   else if(p.type==='flow'){let y=q.y+0.5;if(s.number===1){steps(slide,p.steps,q.x+0.1,y,q.w-0.2,0.65);y+=0.72;}else{const sh=0.27;p.steps.forEach((t,j)=>{shape(slide,'rect',q.x+0.1,y,q.w-0.2,sh,C.tint);text(slide,String(j+1)+'  '+t,q.x+0.18,y+0.03,q.w-0.36,sh-0.045,10.5,true,C.ink,'step');y+=sh+0.04;});}text(slide,p.text,q.x+0.1,y+0.05,q.w-0.2,q.y+q.h-0.28-y-0.05,10.5,false,C.ink);report.visuals++;}
   else if(p.type==='bars'){bars(slide,p,q);report.visuals++;}
   else if(p.type==='waterfall'){waterfall(slide,p,q);report.visuals++;}
   else if(p.type==='gantt'){gantt(slide,p,q);report.visuals++;}
   else if(p.type==='fundbars'){fundbars(slide,p,q);report.visuals++;}
   else if(p.type==='cover'){text(slide,'Orbit',q.x+0.1,q.y+0.55,q.w-0.2,1.23,72,true,C.ink,'hero');text(slide,p.subtitle,q.x+0.1,q.y+1.92,q.w-0.2,1.06,24,true,C.ink);text(slide,p.text,q.x+0.1,q.y+3.04,q.w-0.2,0.54,10.5,false,C.ink);}
  }
  if(s.number>1&&(report.words<160||report.words>300||report.quantities<10||report.visuals<2||report.coverage<0.93||report.heroArea<0.18))throw Error('Density failed '+JSON.stringify(report));
  slide.addNotes(speakerNotes(s,sources));
 }
 if(overflows.length){fs.writeFileSync(out+'/overflow-failures.json',JSON.stringify(overflows,null,2));throw Error('Fixed-size overflow slots: '+overflows.length+'; inspect overflow-failures.json');}
 await pptx.writeFile({fileName:out+'/Deck_'+version+'.pptx',compression:true});fs.writeFileSync(out+'/density-report.json',JSON.stringify({slides:reports,textOps,numberRegistry},null,2));fs.writeFileSync(out+'/speaker-notes.md',data.slides.map(s=>'## '+s.number+' '+s.topic+' / '+s.seconds+' seconds\nReading path: headline → hero → modules.\n\n'+s.speech+'\n\nQuestion: '+s.question+'\nAnswer: '+s.answer+'\nSources: '+[...new Set(s.panels.flatMap(p=>p.source))].join(', ')).join('\n\n'));return reports;
}

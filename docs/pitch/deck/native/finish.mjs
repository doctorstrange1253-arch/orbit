import {speakerNotes} from './notes.mjs';
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),PptxGenJS=require('../_tools/node_modules/pptxgenjs'),sharp=require('../_tools/node_modules/sharp');
export async function finishRender(root,version){
 const out=root+'/versions/'+version,render=root+'/render/'+version;
 const names=fs.readdirSync(render).filter(n=>/^slide-\d+\.png$/.test(n)).sort();if(names.length!==10)throw Error('Render must have ten pages');
 const parts=[];for(let i=0;i<names.length;i++){const p=render+'/'+names[i];await sharp(p).resize({width:1280}).jpeg({quality:90}).toFile(p.replace('.png','-preview.jpg'));parts.push({input:await sharp(p).resize(640,360).png().toBuffer(),left:(i%2)*640,top:Math.floor(i/2)*360});}
 await sharp({create:{width:1280,height:1800,channels:3,background:'#FAF8F4'}}).composite(parts).png().toFile(out+'/contact-sheet.png');
 const d=JSON.parse(fs.readFileSync(root+'/deck-data.json')),sources=JSON.parse(fs.readFileSync(root+'/sources.json')),pptx=new PptxGenJS();pptx.defineLayout({name:'READ',width:13.333,height:7.5});pptx.layout='READ';pptx.author='Orbit pitch preparation';pptx.title='Orbit D1 / presentation-safe';
 for(let i=0;i<10;i++){const s=pptx.addSlide();s.addImage({path:render+'/'+names[i],x:0,y:0,w:13.333,h:7.5});s.addNotes(speakerNotes(d.slides[i],sources));}
 await pptx.writeFile({fileName:out+'/Deck_'+version+'_presentation-safe.pptx',compression:true});return {pages:names.length,contact:out+'/contact-sheet.png'};
}

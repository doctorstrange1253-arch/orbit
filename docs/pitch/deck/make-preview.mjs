import { readFile, writeFile, stat } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = dirname(fileURLToPath(import.meta.url));
const version = process.argv[2] || 'v3';
if (!/^v\d+$/.test(version)) throw new Error('Use a numbered version');
const data = JSON.parse(await readFile(join(root, 'deck-data.json'), 'utf8'));
const images = [];
for (const slide of data.slides) {
  const path = `${version}/renders/slide_${String(slide.number).padStart(2, '0')}.png`;
  if (!(await stat(join(root, path))).size) throw new Error(`Missing render ${path}`);
  images.push(path);
}
const html = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Orbit TBI-GEU draft preview</title><style>html,body{margin:0;height:100%;background:#182C35;font:16px Arial;color:#FBF8F2}main{height:calc(100% - 48px);display:flex;align-items:center;justify-content:center}img{max-width:100%;max-height:100%;object-fit:contain}nav{height:48px;display:flex;gap:24px;align-items:center;justify-content:center}button{padding:8px 20px;font:16px Arial;background:#FBF8F2;color:#182C35;border:0}a{color:#FBF8F2}</style><main><img id="slide" alt="Pitch slide"></main><nav><button id="prev">Previous</button><span id="count"></span><button id="next">Next</button><a href="${version}/Deck_${version}.pdf">PDF</a></nav><script>const images=${JSON.stringify(images)};let i=0;function show(n){i=Math.max(0,Math.min(images.length-1,n));document.getElementById('slide').src=images[i];document.getElementById('slide').alt='Slide '+(i+1);document.getElementById('count').textContent=(i+1)+' / '+images.length;}document.getElementById('prev').onclick=()=>show(i-1);document.getElementById('next').onclick=()=>show(i+1);document.onkeydown=e=>{if(['ArrowRight','PageDown',' '].includes(e.key)){e.preventDefault();show(i+1)}if(['ArrowLeft','PageUp'].includes(e.key)){e.preventDefault();show(i-1)}};show(0);</script></html>`;
await writeFile(join(root, 'present.html'), html);
console.log(JSON.stringify({ preview: 'present.html', slides: images.length, mode: 'verified raster preview; SN portable-font player not passed' }));

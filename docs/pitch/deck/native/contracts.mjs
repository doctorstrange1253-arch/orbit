import fs from 'node:fs';
export const grid={x:0.35,y:1.15,w:12.633,h:5.82,cw:0.94275,rh:0.87,g:0.12};
export function validateGrid(panels){
 const used=new Set();let area=0,heroArea=0;
 const rects=panels.map(p=>{for(const k of ['c','r','cs','rs'])if(!Number.isInteger(p[k]))throw Error('Integer grid spans required');if(p.c<1||p.r<1||p.cs<1||p.rs<1||p.c+p.cs-1>12||p.r+p.rs-1>6)throw Error('Panel outside grid');for(let c=p.c;c<p.c+p.cs;c++)for(let r=p.r;r<p.r+p.rs;r++){const key=c+':'+r;if(used.has(key))throw Error('Panel overlap');used.add(key);}const q={x:grid.x+(p.c-1)*(grid.cw+grid.g),y:grid.y+(p.r-1)*(grid.rh+grid.g),w:p.cs*grid.cw+(p.cs-1)*grid.g,h:p.rs*grid.rh+(p.rs-1)*grid.g};area+=q.w*q.h;if(p.hero)heroArea+=q.w*q.h;return q;});return {rects,coverage:area/(grid.w*grid.h),heroArea:heroArea/(grid.w*grid.h)};
}
export function validateSources(panels,sources){for(const p of panels){if(!p.source?.length)throw Error('Missing source list');for(const id of p.source)if(!sources[id])throw Error('Unknown source '+id);}return true;}
export function checkText(text,{maxChars,maxHeight,height}){if(text.length>maxChars)throw Error('Text characters exceed slot');if(height>maxHeight+0.002)throw Error('Text height exceeds slot');return true;}
export function unitEconomics(p){if(p.price<=0||p.storageLearners<=0)throw Error('Positive price and learners required');const base=p.price/(1+p.gst),platform=base*p.platform,mentorPool=base*(1-p.platform),gateway=p.price*p.gateway*(1+p.gatewayTax),video=p.watch/1000*p.fx,storage=p.storageUsd*p.fx/p.storageLearners,contribution=platform-gateway-video-storage-p.ai-p.support;return {base,platform,mentorPool,gateway,video,storage,ai:p.ai,support:p.support,contribution};}
export function breakEven(fixed,contribution){if(contribution<=0||fixed<0)throw Error('Contribution must be positive');return Math.ceil(fixed/contribution);}
export function assertFreshVersion(out,version){if(!/^v\d+$/.test(version))throw Error('Use numbered version');for(const ext of ['pptx','pdf'])if(fs.existsSync(out+'/Deck_'+version+'.'+ext))throw Error('Preserve existing output; choose next version');}

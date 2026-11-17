const fs=require('node:fs');
const path=require('node:path');
const {randomUUID,createHash}=require('node:crypto');
const root='D:/orbit-main/orbit-main';
const state=require(path.join(root,'scripts/agent/supervisor-state.js'));
const lockFile=path.join(root,'.agent/RUNLOCK'),guard=lockFile+'.claim';
const own=state.identity(9232);
if(own.state!=='live'||own.processStarted!=='2026-11-16T13:39:07.6616730Z')throw Error('Current host changed');
const fd=fs.openSync(guard,'wx');
try{
 fs.writeFileSync(fd,JSON.stringify({pid:process.pid,task:'Typed20196-to9232decktransfer'}));fs.fsyncSync(fd);
 if(fs.existsSync(path.join(root,'.agent/RUNLOCK.execution')))throw Error('Execution claim active');
 const bytes=fs.readFileSync(lockFile),old=JSON.parse(bytes);
 if(old.pid!==20196||old.processStarted!=='2026-11-16T11:49:07.8878510Z'||old.token!=='00513845-3e6a-4cb7-88e3-35437a035ed6')throw Error('Prior lease changed');
 const archive=path.join(root,'.agent/index','authorized-runlock-20196-'+randomUUID()+'.json');
 fs.writeFileSync(archive,bytes,{flag:'wx'});
 const token=randomUUID();
 state.atomicWrite(lockFile,JSON.stringify({pid:9232,processStarted:own.processStarted,timestamp:new Date().toISOString(),token,task:'Job D / dense ten-slide D1',scope:'PPT first; M-0/M1 deferred; application and M4 closed',transferAuthority:'User selected Transfer now (Recommended) for20196-to9232 only',archivedLock:path.relative(root,archive).replaceAll('\\','/')},null,2)+'\n');
 const lease={root,lockFile,token};
 state.journal(lease,'START','JOB-D-D1','resume-approved-transfer','Typed20196-to9232 exception; oldbytespreserved,no processkilled. Fourcapturefiles/researchoutput retained; nativev5 missing, continue build only.');
 state.durableAppend(path.join(root,'.agent/DECISIONS.md'),'\n### One-time deck writer transfer20196-to9232 - 2026-11-16\nUser selected "Transfer now (Recommended)" in the explicit20196-to9232 question. Oldleasebytes archived intact; no process killed. Only ten-slide D1deck continuation; all main implementation/M4 gates unchanged. Existingfourcaptures and completedpublishedresearch reused, not replayed.\n');
 console.log(JSON.stringify({writer:9232,token,archive,sha256:createHash('sha256').update(bytes).digest('hex')}));
}finally{fs.closeSync(fd);fs.unlinkSync(guard);}

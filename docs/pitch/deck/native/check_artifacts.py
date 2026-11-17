import json, zipfile, sys, re
from pathlib import Path
from xml.etree import ElementTree as E
root=Path(sys.argv[1]); version=sys.argv[2]
out=root/'versions'/version
ns={'a':'http://schemas.openxmlformats.org/drawingml/2006/main','p':'http://schemas.openxmlformats.org/presentationml/2006/main'}
findings=[]
results={}
for suffix in ['', '_presentation-safe']:
 p=out/f'Deck_{version}{suffix}.pptx'
 with zipfile.ZipFile(p) as z:
  slides=sorted(n for n in z.namelist() if re.fullmatch(r'ppt/slides/slide\d+.xml',n))
  notes=sorted(n for n in z.namelist() if re.fullmatch(r'ppt/notesSlides/notesSlide\d+.xml',n))
  if len(slides)!=10 or len(notes)!=10: findings.append('Wrong slide/notes count '+suffix)
  sizes=[]; bad=[]; texts=[]; shapes=0
  for name in slides:
   t=E.fromstring(z.read(name)); shapes+=len(t.findall('.//p:sp',ns))
   texts.extend(v.text or '' for v in t.findall('.//a:t',ns))
   for r in t.findall('.//a:rPr',ns):
    if 'sz' in r.attrib:sizes.append(int(r.attrib['sz'])/100)
   if t.findall('.//a:normAutofit',ns):findings.append('Autofit found '+name)
  for t in texts:
   if any(v in t for v in ['Â','Ã','â€','[FILL','TODO','placeholder']):bad.append(t)
  if bad:findings.append('Bad text '+suffix+': '+repr(bad[:3]))
  results[suffix or 'editable']={'slides':len(slides),'notes':len(notes),'nativeTextRuns':len(texts),'nativeShapes':shapes,'fontSizes':sorted(set(sizes)),'bytes':p.stat().st_size}
report=json.loads((out/'density-report.json').read_text())
for s in report['slides']:
 if s['number']>1:
  if not(160<=s['words']<=300):findings.append('Wordcount'+str(s['number']))
  if s['coverage']<.93 or s['heroArea']<.18:findings.append('Area'+str(s['number']))
  if s['visuals']<2 or s['modules']<6:findings.append('Visuals/modules'+str(s['number']))
for t in report['textOps']:
 if t['kind'] in ['body','table','chart'] and t['size']<10.5:findings.append('Body font too small')
 if t['measuredHeight']>t['h']+.002:findings.append('Overflow'+t['text'][:30])
 if t['x']<.3 or t['x']+t['w']>13.1 or t['y']<.25 or t['y']+t['h']>7.32:findings.append('Bounds'+t['text'][:30])
results['checks']={'failures':findings,'status':'PASS' if not findings else 'FAIL','scope':'Native count/text/fonts/fixed-slot bounds and declared density; visual and founder facts separate'}
(out/'artifact-check.json').write_text(json.dumps(results,indent=2))
print(json.dumps(results))
sys.exit(bool(findings))

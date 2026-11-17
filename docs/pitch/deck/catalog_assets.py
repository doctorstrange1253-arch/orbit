from pathlib import Path
import sys,json,shutil
sys.path.insert(0,str(Path(__file__).parent/'tooling/python'))
from PIL import Image
r=Path(__file__).resolve().parents[3]
deck=Path(__file__).parent
assets=deck/'assets'
assets.mkdir(exist_ok=True)
data=json.loads((deck/'deck-data.json').read_text())
rows=[]
for p in (r/'docs').rglob('*'):
    if p.is_file() and p.suffix.lower() in ('.png','.jpg','.jpeg','.webp') and not p.is_relative_to(deck):
        try:
            im=Image.open(p)
            rows.append({'path':p.relative_to(r).as_posix(),'resolution':list(im.size),'quality':3,'safe':'not yet visually reviewed; historical fixture, not traction'})
        except Exception:
            pass
journey=r/'docs/progress/screenshots/identity-worlds/iw-a2-20261109-bc5341f4/student-universe-1280.png'
im=Image.open(journey)
im.crop((30,335,1250,1045)).save(assets/'journey-crop.png')
recorders=[p for p in (r/'docs/progress/screenshots/identity-worlds').rglob('*.png') if 'recorder' in p.name.lower() and '1280' in p.name]
print('recorderCandidates',[p.relative_to(r).as_posix() for p in recorders])
ready=[{'asset_id':'journey','path':'assets/journey-crop.png','origin':str(journey),'crop':[30,335,1250,1045],'status':'ready','qualification':'Historical test data; source image visually read; header cropped'}]
if recorders:
    p=recorders[0]
    im=Image.open(p)
    im.crop((0,min(110,im.height//5),im.width,im.height)).save(assets/'recorder-crop.png')
    ready.append({'asset_id':'recorder','path':'assets/recorder-crop.png','origin':str(p),'status':'candidate','qualification':'Must visually verify no emoji/private data before use'})
(assets/'catalog.json').write_text(json.dumps({'candidates':rows,'ready':ready},indent=2))
(assets/'catalog.md').write_text('# Product image catalog\n\nHistorical prototype images, not traction. Original resolution retained; no upscale. Candidate safety must be visually verified.\n\n| Path | Resolution | Quality | Safe |\n|---|---|---|---|\n'+'\n'.join('|'+x['path']+'|'+str(x['resolution'])+'|3/5|Not yet reviewed|' for x in rows))
for s in data['slides']:
    text='# Slide '+str(s['number']).zfill(2)+' — '+s['headline']+'\n\n## Final screen copy\n'+s['headline']+'\n'+'\n'.join(s['body'])+'\n'+s['footnote']+'\n\n## Visual implementation\n- image_opportunity: '+('reuse' if s.get('image') else 'none')+'\n'+('- presentation: evidence-crop\n' if s.get('image') else '')+'- production_group: all-v0\n- layout: '+s['layout']+'\n- Source facts: deck-data.json, outline.md; no new facts.\n\n## Speaker notes\n'+s['notes']+'\n'
    (deck/'plan'/('slide_'+str(s['number']).zfill(2)+'.md')).write_text(text,encoding='utf-8')
(assets/'vendor').mkdir(exist_ok=True)
shutil.copyfile(deck/'tooling/sn-exporter/node_modules/echarts/dist/echarts.min.js',assets/'vendor/echarts.min.js')
print('catalog images',len(rows),'slides',len(data['slides']))

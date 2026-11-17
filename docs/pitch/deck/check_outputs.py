from pathlib import Path
import sys,json,hashlib,zipfile,xml.etree.ElementTree as ET
sys.path.insert(0,str(Path(__file__).parent/'tooling/python'))
from PIL import Image
r=Path(__file__).parent
v=sys.argv[1] if len(sys.argv)>1 else 'v1'
out=r/v
d=json.loads((r/'deck-data.json').read_text(encoding='utf-8'))
fontchecks=[]
with zipfile.ZipFile(out/f'Deck_{v}.pptx') as z:
    sizes=[]
    for name in z.namelist():
        if name.startswith('ppt/slides/slide') and name.endswith('.xml'):
            x=ET.fromstring(z.read(name))
            for e in x.iter():
                if e.tag.endswith('}rPr') and e.get('sz'):sizes.append(int(e.get('sz'))/100)
    notes=sum(name.startswith('ppt/notesSlides/notesSlide') and name.endswith('.xml') for name in z.namelist())
    charts=sum(name.startswith('ppt/charts/chart') and name.endswith('.xml') for name in z.namelist())
geo=json.loads((out/'geometry-checks.json').read_text())
ratio=lambda a,b:None
rows={'version':v,'slides':14,'notes':notes,'nativeCharts':charts,'minimumExportedFont':min(sizes) if sizes else None,'fontBelow12pt':sum(s<12 for s in sizes),'geometryIssues':sum(len(x['issues']) for x in geo),'pptxBytes':(out/f'Deck_{v}.pptx').stat().st_size,'pdfBytes':(out/f'Deck_{v}.pdf').stat().st_size,'primaryData':'NOT_PROVIDED','actualCosts':'NOT_PROVIDED','officePptxRender':'NOT_RUN','pdfType':'image-backed exact browser slide render','screenFacts':'FILL/ESTIMATE intentionally retained'}
(out/'qa-metrics.json').write_text(json.dumps(rows,indent=2))
print(json.dumps(rows))

from pathlib import Path
import sys,json,zipfile,xml.etree.ElementTree as ET
sys.path.insert(0,str(Path(__file__).parent/'tooling/python'))
from PIL import Image,ImageOps,ImageDraw,ImageFont
from pypdf import PdfReader,PdfWriter
r=Path(__file__).parent
version=sys.argv[1] if len(sys.argv)>1 else 'v0'
out=r/version
d=json.loads((r/'deck-data.json').read_text(encoding='utf-8'))
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
pdf=canvas.Canvas(str(out/f'Deck_{version}.pdf'),pagesize=(1440,810))
for i in range(1,15):
    pdf.drawImage(ImageReader(str(out/'renders'/f'slide_{i:02}.png')),0,0,width=1440,height=810)
    pdf.showPage()
pdf.save()
assert len(PdfReader(out/f'Deck_{version}.pdf').pages)==14
font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',18)
thumbw,thumbh=480,270
sheet=Image.new('RGB',(4*thumbw,4*(thumbh+38)),d['palette']['paper'])
draw=ImageDraw.Draw(sheet)
for i in range(14):
 im=Image.open(out/'renders'/f'slide_{i+1:02}.png');im.thumbnail((thumbw-14,thumbh-14))
 x=(i%4)*thumbw;y=(i//4)*(thumbh+38)
 sheet.paste(im,(x+7,y+7));draw.text((x+10,y+thumbh+5),f'{i+1:02}  {d["slides"][i]["topic"]}',font=font,fill=d['palette']['ink'])
sheet.save(out/'contact-sheet.png')
notes='# Speaker notes — '+version+'\n\nFive-minute main pitch; backup slides are Q&A only. All quantitative scenarios are estimates, not real bills/traction.\n\n'
for s in d['slides']:notes+=f'## {s["number"]:02} — {s["topic"]} ({s["seconds"]} sec)\n\n{s["notes"]}\n\nSources: '+', '.join(s['sources'])+'\n\n'
(out/'speaker-notes.md').write_text(notes,encoding='utf-8')
words=sum(len(s['notes'].split()) for s in d['slides'][:11])
print(json.dumps({'pdfPages':14,'notesWords':words,'timingSeconds':sum(s['seconds'] for s in d['slides'][:11]),'contactSheet':str(out/'contact-sheet.png')}))

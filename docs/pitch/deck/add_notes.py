from pathlib import Path
import json,sys,zipfile,xml.etree.ElementTree as ET
root=Path(__file__).parent
v=sys.argv[1] if len(sys.argv)>1 else 'v0'
ppt=root/v/f'Deck_{v}.pptx'
d=json.loads((root/'deck-data.json').read_text(encoding='utf-8'))
ns={'p':'http://schemas.openxmlformats.org/presentationml/2006/main','a':'http://schemas.openxmlformats.org/drawingml/2006/main'}
with zipfile.ZipFile(ppt) as z:
    entries={n:z.read(n) for n in z.namelist()}
ct=ET.fromstring(entries['[Content_Types].xml'])
ctns='http://schemas.openxmlformats.org/package/2006/content-types'
relsns='http://schemas.openxmlformats.org/package/2006/relationships'
for i,s in enumerate(d['slides'],1):
    path=f'ppt/notesSlides/notesSlide{i}.xml'
    n=ET.Element('{'+ns['p']+'}notes')
    cs=ET.SubElement(n,'{'+ns['p']+'}cSld')
    tree=ET.SubElement(cs,'{'+ns['p']+'}spTree')
    nv=ET.SubElement(tree,'{'+ns['p']+'}nvGrpSpPr')
    ET.SubElement(nv,'{'+ns['p']+'}cNvPr',{'id':'1','name':''});ET.SubElement(nv,'{'+ns['p']+'}cNvGrpSpPr');ET.SubElement(nv,'{'+ns['p']+'}nvPr')
    ET.SubElement(tree,'{'+ns['p']+'}grpSpPr')
    sp=ET.SubElement(tree,'{'+ns['p']+'}sp');nvs=ET.SubElement(sp,'{'+ns['p']+'}nvSpPr')
    ET.SubElement(nvs,'{'+ns['p']+'}cNvPr',{'id':'2','name':'Notes'});ET.SubElement(nvs,'{'+ns['p']+'}cNvSpPr')
    np=ET.SubElement(nvs,'{'+ns['p']+'}nvPr');ET.SubElement(np,'{'+ns['p']+'}ph',{'type':'body','idx':'1'})
    ET.SubElement(sp,'{'+ns['p']+'}spPr');tx=ET.SubElement(sp,'{'+ns['p']+'}txBody');ET.SubElement(tx,'{'+ns['a']+'}bodyPr');ET.SubElement(tx,'{'+ns['a']+'}lstStyle')
    for text in [s['notes'],'Timing: '+str(s['seconds'])+' seconds.','Sources: '+', '.join(s['sources'])]:
        para=ET.SubElement(tx,'{'+ns['a']+'}p');run=ET.SubElement(para,'{'+ns['a']+'}r');ET.SubElement(run,'{'+ns['a']+'}rPr',{'lang':'en-US'});ET.SubElement(run,'{'+ns['a']+'}t').text=text
    clr=ET.SubElement(n,'{'+ns['p']+'}clrMapOvr');ET.SubElement(clr,'{'+ns['a']+'}masterClrMapping')
    entries[path]=ET.tostring(n,encoding='utf-8',xml_declaration=True)
    note_rel=ET.Element('{'+relsns+'}Relationships');ET.SubElement(note_rel,'{'+relsns+'}Relationship',{'Id':'rId1','Type':ns['p'].replace('presentationml/2006/main','officeDocument/2006/relationships/slide'),'Target':f'../slides/slide{i}.xml'})
    entries[f'ppt/notesSlides/_rels/notesSlide{i}.xml.rels']=ET.tostring(note_rel,encoding='utf-8',xml_declaration=True)
    rel_path=f'ppt/slides/_rels/slide{i}.xml.rels'
    rel=ET.fromstring(entries[rel_path]) if rel_path in entries else ET.Element('{'+relsns+'}Relationships')
    ET.SubElement(rel,'{'+relsns+'}Relationship',{'Id':'rIdDeckNotes','Type':'http://schemas.openxmlformats.org/officeDocument/2006/relationships/notesSlide','Target':f'../notesSlides/notesSlide{i}.xml'})
    entries[rel_path]=ET.tostring(rel,encoding='utf-8',xml_declaration=True)
    if not any(x.get('PartName')=='/'+path for x in ct):ET.SubElement(ct,'{'+ctns+'}Override',{'PartName':'/'+path,'ContentType':'application/vnd.openxmlformats-officedocument.presentationml.notesSlide+xml'})
entries['[Content_Types].xml']=ET.tostring(ct,encoding='utf-8',xml_declaration=True)
with zipfile.ZipFile(ppt,'w',zipfile.ZIP_DEFLATED) as z:
    for name,content in entries.items():z.writestr(name,content)
print(json.dumps({'pptx':str(ppt),'speakerNotes':14,'bytes':ppt.stat().st_size,'slideSource':'SN-exporter; notes metadata postprocess only'}))

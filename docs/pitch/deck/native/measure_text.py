import json, sys
from PIL import ImageFont
scale=8
font_cache={}
def font(size,bold):
 key=(size,bold)
 if key not in font_cache:
  font_cache[key]=ImageFont.truetype('C:/Windows/Fonts/seguisb.ttf' if bold else 'C:/Windows/Fonts/segoeui.ttf',round(size*scale))
 return font_cache[key]
def wrap(text,size,width,bold=False):
 f=font(size,bold)
 cap=width*72*scale
 lines=[]
 for para in str(text).split('\n'):
  if not para:
   lines.append('')
   continue
  line=''
  for word in para.split():
   if f.getlength(word)>cap:
    raise ValueError('Unbreakable token wider than slot: '+word)
   trial=(line+' '+word).strip()
   if f.getlength(trial)>cap:
    lines.append(line)
    line=word
   else:
    line=trial
  lines.append(line)
 return {'lines':lines,'height':len(lines)*size*1.22/72,'width':max((f.getlength(l)/scale/72 for l in lines),default=0)}
if __name__=='__main__':
 values=json.loads(sys.stdin.buffer.read().decode('utf-8'))
 print(json.dumps([wrap(v['text'],v['size'],v['width'],v.get('bold',False)) for v in values]))

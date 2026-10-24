"""Read-only RGBA component analysis; emits metadata without editing PNGs."""
from pathlib import Path
from PIL import Image
from collections import deque
import json
BASE=Path('sprite_preview/patilife_v2')
def frames(name,columns,rows):
 im=Image.open(BASE/'assets'/f'{name}.png');w,h=im.size
 mask=bytearray(1 if v>=100 else 0 for v in im.getchannel('A').getdata());found=[]
 for index in range(w*h):
  if not mask[index]:continue
  q=deque([index]);mask[index]=0;x0=x1=index%w;y0=y1=index//w;n=0
  while q:
   at=q.pop();x,y=at%w,at//w;n+=1;x0=min(x0,x);x1=max(x1,x);y0=min(y0,y);y1=max(y1,y)
   for j in ([at-1] if x else [])+([at+1] if x<w-1 else [])+([at-w] if y else [])+([at+w] if y<h-1 else []):
    if mask[j]:mask[j]=0;q.append(j)
  if n>500:found.append((x0,y0,x1+1,y1+1,n))
 found=sorted(found,key=lambda p:p[4],reverse=True)[:columns*rows];groups=[]
 for col in range(columns):
  points=sorted([p for p in found if min(columns-1,int(((p[0]+p[2])/2)/w*columns))==col],key=lambda p:p[1]);assert len(points)==rows,(name,col,len(points))
  groups.append({'unit':max(max(p[2]-p[0],p[3]-p[1]) for p in points),'frames':[{'x':p[0],'y':p[1],'width':p[2]-p[0],'height':p[3]-p[1]} for p in points]})
 if name in ['toilet-kitten','toilet-young','toilet-adult']:
  alpha=im.getchannel('A')
  for g in groups:
   for f in g['frames']:
    xs=[x for y in range(f['y']+int(f['height']*.92),f['y']+f['height']) for x in range(f['x'],f['x']+f['width']) if alpha.getpixel((x,y))>=150]
    f['footX']=round((sum(xs)/len(xs)-f['x'])/f['width'],5) if xs else .62
 return {'src':f'assets/{name}.png','imageWidth':w,'imageHeight':h,'groups':groups}
if __name__=='__main__':
 data={name:frames(name,*size) for name,size in {'toilet-cleaning':(4,1),'toilet-upgrades':(4,2),'room-toys':(4,4),'toilet-kitten':(4,4),'toilet-young':(4,4),'toilet-adult':(4,4)}.items()}
 cleaning=data['toilet-cleaning']['groups']
 cleaning_unit=max(g['unit'] for g in cleaning)
 for g in cleaning:g['unit']=cleaning_unit
 (BASE/'household-atlases.js').write_text('window.PatiLifeHouseholdAtlases = '+json.dumps(data,indent=2)+';\n')
 print('Household art metadata:',sum(len(g['frames']) for a in data.values() for g in a['groups']),'frames')

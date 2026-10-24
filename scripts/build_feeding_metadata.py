from PIL import Image
from collections import deque
from pathlib import Path
import json
allframes={}
for kind in ['food','water']:
 im=Image.open(f'sprite_preview/patilife_v2/assets/feeding-{kind}-states.png');w,h=im.size
 mask=bytearray(1 if v>=100 else 0 for v in im.getchannel('A').getdata());components=[]
 for index in range(w*h):
  if not mask[index]:continue
  queue=deque([index]);mask[index]=0;x0=x1=index%w;y0=y1=index//w;n=0
  while queue:
   at=queue.pop();x,y=at%w,at//w;n+=1;x0=min(x0,x);x1=max(x1,x);y0=min(y0,y);y1=max(y1,y)
   for neighbor in ([at-1] if x else [])+([at+1] if x<w-1 else [])+([at-w] if y else [])+([at+w] if y<h-1 else []):
    if mask[neighbor]:mask[neighbor]=0;queue.append(neighbor)
  if n>400:components.append((x0,y0,x1+1,y1+1,n))
 components.sort(key=lambda p:p[4],reverse=True);components=components[:15]
 assert len(components)==15,(kind,components)
 # Each column's three isolated objects have their own alpha-bound crop.
 cols=[]
 for col in range(5):
  frames=sorted([p for p in components if int(((p[0]+p[2])/2)/w*5)==col],key=lambda p:p[1])
  assert len(frames)==3,(kind,col,frames)
  unit=max(max(p[2]-p[0],p[3]-p[1]) for p in frames)
  cols.append({'unit':unit,'frames':[{'x':p[0],'y':p[1],'width':p[2]-p[0],'height':p[3]-p[1]} for p in frames]})
 allframes[kind]={'src':f'assets/feeding-{kind}-states.png','width':w,'height':h,'stages':cols}
 print(kind,(w,h),[[[p['x'],p['y'],p['width'],p['height']] for p in col['frames']] for col in cols])
Path('sprite_preview/patilife_v2/feeding-atlases.js').write_text('/* Read-only alpha analysis: isolated crops, shared scale and baseline per upgrade. */\nwindow.PatiLifeFeedingAtlases = '+json.dumps(allframes,indent=2)+';\n')

"""Read generated alpha PNGs; never modify their pixels."""
from build_household_metadata import frames,BASE
from PIL import Image
import json
metadata={age:frames('needs-'+age,4,4) for age in ['kitten','young','adult']}
source='window.PatiLifeNeedsAtlases = '+json.dumps(metadata,indent=2)+';\n'
source+='''(function(root){
 for(const [age,atlas] of Object.entries(root.PatiLifeNeedsAtlases))for(const [i,id] of ['sarman','tekir','smokin','calico'].entries()){
  const cat=age==='kitten'?root.PatiLifeSpriteAtlases[id]:root.PatiLifeSpriteAtlases[id].ages[age],group=atlas.groups[i];cat.special=cat.special||{};
  cat.special.exhausted={src:atlas.src,unit:group.unit,frames:group.frames.slice(0,2)};
  cat.special.unhappy={src:atlas.src,unit:group.unit,frames:group.frames.slice(2,4)};
 }
})(window);
'''
(BASE/'needs-atlases.js').write_text(source)
# The squat's bottom opaque pixels identify paws, rather than the tail-biased bounding-box centre.
p=BASE/'household-atlases.js';household=json.loads(p.read_text().split(' = ',1)[1].strip().rstrip(';'))
for age in ['kitten','young','adult']:
 atlas=household['toilet-'+age];alpha=Image.open(BASE/atlas['src']).getchannel('A')
 for group in atlas['groups']:
  for f in group['frames']:
   values=[x for y in range(f['y']+int(f['height']*.92),f['y']+f['height']) for x in range(f['x'],f['x']+f['width']) if alpha.getpixel((x,y))>=150]
   f['footX']=round((sum(values)/len(values)-f['x'])/f['width'],5) if values else .62
p.write_text('window.PatiLifeHouseholdAtlases = '+json.dumps(household,indent=2)+';\n')
print('Needs metadata: 48 frames; toilet paw anchors measured for all twelve cats')

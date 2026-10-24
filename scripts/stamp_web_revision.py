#!/usr/bin/env python3
"""Version local scripts/styles using their content; keep the same entry URL and saves."""
import argparse
import hashlib
from pathlib import Path
import re

ROOT=Path(__file__).resolve().parents[1]
META=re.compile(r'^[ \t]*<meta name="patilife-revision" content="[^"]*">\n',re.M)
ASSET=re.compile(r'''(?P<start>\b(?:src|href)=["'])(?P<path>patilife_v2/[^"'?]+\.(?:js|css))(?:\?v=[^"']*)?(?P<end>["'])''')

def rendered(source):
    source=Path(source)
    html=(source/'patilife_app.html').read_text()
    plain=META.sub('',html)
    plain=ASSET.sub(lambda m:m['start']+m['path']+m['end'],plain)
    digest=hashlib.sha256(plain.encode())
    for path in sorted((source/'patilife_v2').rglob('*')):
        if path.is_file() and path.suffix in {'.js','.css','.json'}:
            digest.update(path.relative_to(source).as_posix().encode())
            digest.update(path.read_bytes())
    revision=digest.hexdigest()[:12]
    result=ASSET.sub(lambda m:m['start']+m['path']+'?v='+revision+m['end'],plain)
    result=result.replace('    <title>',f'    <meta name="patilife-revision" content="{revision}">\n    <title>',1)
    return revision,result

def stamp(source,check=False):
    path=Path(source)/'patilife_app.html'
    revision,result=rendered(source)
    changed=path.read_text()!=result
    if check and changed:
        raise ValueError('Web sürüm damgası güncel değil; build:web ile yenileyin.')
    if changed and not check:path.write_text(result)
    return revision

if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check',action='store_true')
    args=parser.parse_args()
    print('PatiLife web revision:',stamp(ROOT/'sprite_preview',args.check))

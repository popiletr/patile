#!/usr/bin/env python3
"""Read PNG alpha bounds to write playback metadata. Does not modify any image."""
import json
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / 'sprite_preview/patilife_v2/assets'



def inspect_objects(path, columns=4, rows=4):
    # Read connected silhouettes so a tall item is not cut at an artificial row border.
    with Image.open(path) as image:
        if image.mode != 'RGBA' or (image.getchannel('A').getextrema()[0] != 0 or image.getchannel('A').getextrema()[1] < 240):
            raise ValueError(f'{path.name}: genuine alpha required')
        width, height = image.size
        mask = bytearray(1 if value > 50 else 0 for value in image.getchannel('A').tobytes())
        cells = {}
        for seed in range(width * height):
            if not mask[seed]:
                continue
            stack = [seed]
            mask[seed] = 0
            area, x0, y0, x1, y1 = 0, width, height, 0, 0
            while stack:
                idx = stack.pop()
                x, y = idx % width, idx // width
                area += 1
                x0, y0, x1, y1 = min(x0, x), min(y0, y), max(x1, x), max(y1, y)
                for other in ([idx - 1] if x else []) + ([idx + 1] if x < width - 1 else []) + ([idx - width] if y else []) + ([idx + width] if y < height - 1 else []):
                    if mask[other]:
                        mask[other] = 0
                        stack.append(other)
            if area <= 100:
                continue
            cell = min(rows - 1, int((y0 + y1) / 2 / height * rows)) * columns + min(columns - 1, int((x0 + x1) / 2 / width * columns))
            if cell in cells:
                raise ValueError(f'{path.name}: multiple silhouettes assigned to cell {cell}')
            left, top, right, bottom = max(0, x0 - 6), max(0, y0 - 6), min(width, x1 + 7), min(height, y1 + 7)
            cells[cell] = dict(x=left, y=top, width=right - left, height=bottom - top)
        if set(cells) != set(range(columns * rows)):
            raise ValueError(f'{path.name}: expected {columns * rows} independent objects, found {len(cells)}')
        frames = [cells[i] for i in range(columns * rows)]
        return dict(src='assets/' + path.name, imageWidth=width, imageHeight=height, columns=columns, rows=rows, unit=max(max(f['width'], f['height']) for f in frames), frames=frames)


def inspect(path, columns=4, rows=2):
    with Image.open(path) as image:
        if image.mode != 'RGBA':
            raise ValueError(f'{path.name}: alpha required')
        alpha = image.getchannel('A')
        if alpha.getextrema()[0] != 0 or alpha.getextrema()[1] < 240:
            raise ValueError(f'{path.name}: transparent and opaque pixels required')
        def split_runs(mask, length, vertical=False, merge_gap=12):
            runs, start = [], None
            for n in range(length + 1):
                strip = (0, n, mask.width, n + 1) if vertical else (n, 0, n + 1, mask.height)
                occupied = n < length and sum(mask.crop(strip).histogram()[51:]) > 3
                if occupied and start is None:
                    start = n
                elif not occupied and start is not None:
                    if runs and start - runs[-1][1] < merge_gap:
                        runs[-1][1] = n
                    else:
                        runs.append([start, n])
                    start = None
            return runs

        vertical = split_runs(alpha, image.height, vertical=True)
        if len(vertical) != rows:
            raise ValueError(f'{path.name}: has {len(vertical)} silhouette rows, expected {rows}')
        yedges = [0] + [round((vertical[i - 1][1] + vertical[i][0]) / 2) for i in range(1, rows)] + [image.height]
        frames = []
        for row in range(rows):
            top, bottom = yedges[row], yedges[row + 1]
            band = alpha.crop((0, top, image.width, bottom))
            runs = split_runs(band, image.width)
            for gap in [6, 2, 0]:
                if len(runs) == columns:
                    break
                runs = split_runs(band, image.width, merge_gap=gap)
            if len(runs) != columns:
                raise ValueError(f'{path.name}: row {row} has {len(runs)} silhouettes, expected {columns}')
            edges = [0] + [round((runs[i - 1][1] + runs[i][0]) / 2) for i in range(1, columns)] + [image.width]
            for col in range(columns):
                left, right = edges[col], edges[col + 1]
                bounds = alpha.crop((left, top, right, bottom)).point(lambda p: 255 if p > 50 else 0).getbbox()
                if bounds is None:
                    raise ValueError(f'{path.name}: empty frame {row}, {col}')
                x1, y1, x2, y2 = bounds
                x1, y1 = max(0, x1 - 6), max(0, y1 - 6)
                x2, y2 = min(right - left, x2 + 6), min(bottom - top, y2 + 6)
                frames.append(dict(x=left + x1, y=top + y1, width=x2 - x1, height=y2 - y1))
        return dict(src='assets/' + path.name, imageWidth=image.width, imageHeight=image.height,
                    columns=columns, rows=rows, unit=max(max(f['width'], f['height']) for f in frames), frames=frames)


def main():
    atlas = {cat: inspect(ASSETS / f'{cat}-kitten-cartoon.png') for cat in ['sarman', 'tekir', 'smokin', 'calico']}
    for cat in atlas:
        path = ASSETS / f'{cat}-kitten-care.png'
        if path.exists():
            atlas[cat]['care'] = inspect(path, rows=3)
            # Keep a common physical scale between seated/walking and care poses.
            # Row heights can differ, so normalize the care source unit by cell height.
            care = atlas[cat]['care']
            care['unit'] = atlas[cat]['unit'] * (care['imageHeight'] / 3) / (atlas[cat]['imageHeight'] / 2)
    for cat in atlas:
        atlas[cat]['ages'] = {}
        for stage in ['young', 'adult']:
            path = ASSETS / f'{cat}-{stage}.png'
            if path.exists():
                data = inspect(path, rows=5)
                care = {**data, 'frames': data['frames'][8:]}
                data['frames'] = data['frames'][:8]
                data['care'] = care
                atlas[cat]['ages'][stage] = data
    for stage in ['kitten', 'young', 'adult']:
        path = ASSETS / f'special-{stage}.png'
        if not path.exists():
            continue
        sheet = inspect_objects(path, columns=8, rows=6)
        for coat_index, cat in enumerate(atlas):
            target_stage = atlas[cat] if stage == 'kitten' else atlas[cat]['ages'][stage]
            special = {}
            for action_index, action in enumerate(['pet', 'jump', 'scratch']):
                start = (action_index * 2 + coat_index // 2) * 8 + (coat_index % 2) * 4
                frames = sheet['frames'][start:start + 4]
                special[action] = {**sheet, 'frames': frames,
                                   'unit': max(max(f['width'], f['height']) for f in frames)}
            target_stage['special'] = special
    for stage in ['kitten', 'young', 'adult']:
        path = ASSETS / f'bath-{stage}.png'
        if path.exists():
            sheet = inspect_objects(path, columns=4, rows=4)
            for row, cat in enumerate(atlas):
                target_stage = atlas[cat] if stage == 'kitten' else atlas[cat]['ages'][stage]
                frames = sheet['frames'][row * 4:row * 4 + 4]
                target_stage['special']['bath'] = {**sheet, 'frames': frames, 'unit': max(max(f['width'], f['height']) for f in frames)}
    repair = ASSETS / 'pet-repair.png'
    if repair.exists():
        sheet = inspect_objects(repair, columns=4, rows=3)
        for row, (cat, stage) in enumerate([('smokin', 'young'), ('calico', 'young'), ('smokin', 'adult')]):
            frames = sheet['frames'][row * 4:row * 4 + 4]
            atlas[cat]['ages'][stage]['special']['pet'] = {**sheet, 'frames': frames,
                'unit': max(max(f['width'], f['height']) for f in frames)}
    target = ROOT / 'sprite_preview/patilife_v2/sprite-atlases.js'
    target.write_text('/* Generated alpha-bound metadata; sprites are not modified. */\nwindow.PatiLifeSpriteAtlases = ' + json.dumps(atlas, indent=2) + ';\n')
    total = sum(len(a['frames']) + len(a.get('care', {}).get('frames', [])) + sum(len(age['frames']) + len(age['care']['frames']) for age in a['ages'].values()) for a in atlas.values())
    special_total = sum(sum(len(s['frames']) for s in a.get('special', {}).values()) + sum(sum(len(s['frames']) for s in age.get('special', {}).values()) for age in a['ages'].values()) for a in atlas.values())
    print(f'Audited four characters, {total} base/care and {special_total} special animation frames.')
    props = ASSETS / 'starter-props.png'
    if props.exists():
        data = inspect(props)
        names = ['carrier', 'water', 'food', 'bed', 'litter', 'yarn', 'scratch', 'hideout']
        data['items'] = dict(zip(names, data.pop('frames')))
        out = ROOT / 'sprite_preview/patilife_v2/prop-atlas.js'
        out.write_text('/* Generated alpha-bound metadata; sprites are not modified. */\nwindow.PatiLifePropAtlas = ' + json.dumps(data, indent=2) + ';\n')
        catalog_path = ROOT / 'sprite_preview/patilife_v2/catalog.json'
        if catalog_path.exists():
            catalog = json.loads(catalog_path.read_text())
            for sheet, rows in [('furniture-1', 4), ('furniture-2', 4), ('furniture-3', 2)]:
                image = ASSETS / f'{sheet}.png'
                if not image.exists():
                    continue
                source = inspect_objects(image, rows=rows)
                for definition in catalog:
                    if definition['sheet'] == sheet:
                        data['items'][definition['id']] = {**source['frames'][definition['index']], 'src': source['src']}
            (ROOT / 'sprite_preview/patilife_v2/catalog-data.js').write_text('/* Generated from catalog.json. */\nwindow.PatiLifeCatalogData = ' + json.dumps(catalog, ensure_ascii=False) + ';\n')
            out.write_text('/* Generated alpha-bound metadata; sprites are not modified. */\nwindow.PatiLifePropAtlas = ' + json.dumps(data, indent=2) + ';\n')
        print(f"Audited {len(data['items'])} objects.")

if __name__ == '__main__':
    main()

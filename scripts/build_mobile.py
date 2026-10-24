#!/usr/bin/env python3
"""Manifest-based mobile package; source tree is never copied wholesale."""
import argparse
import json
import os
from pathlib import Path
import shutil
import subprocess
import tempfile

BASE_DIR = Path(__file__).resolve().parent.parent


def collect(source, manifest):
    source = Path(source).resolve()
    result = {}

    def add(relative, target=None):
        path = (source / relative).resolve()
        if not path.is_relative_to(source) or not path.is_file():
            raise ValueError(f"Eksik veya izin verilmeyen varlık: {relative}")
        result[target or path.relative_to(source).as_posix()] = path

    add(manifest['entry'], 'index.html')
    add(manifest['entry'])
    for name in manifest['files']:
        add(name)
    for folder in manifest['assetDirectories'] + manifest['featureDirectories']:
        directory = (source / folder).resolve()
        if not directory.is_relative_to(source) or not directory.is_dir():
            raise ValueError(f"Eksik veya izin verilmeyen klasör: {folder}")
        allowed = set(manifest['assetExtensions'])
        if folder in manifest['featureDirectories']:
            allowed = allowed | {'.html', '.json'}
        for path in directory.rglob('*'):
            relative = path.relative_to(source)
            if any(part.startswith('.') or part in {'node_modules', '__pycache__', 'backup_original'} for part in relative.parts):
                continue
            if path.is_file() and path.suffix.lower() in allowed:
                add(relative)
    return result


def package(source, destination, manifest):
    source, destination = Path(source).resolve(), Path(destination).resolve()
    if source == destination or source in destination.parents or destination in source.parents:
        raise ValueError('Kaynak ve dağıtım klasörleri iç içe olamaz.')
    files = collect(source, manifest)  # Validate everything before touching destination.
    if destination.exists() and any(destination.iterdir()):
        raise ValueError('Hedef klasör boş olmalı; mevcut dağıtımın üzerine yazılmadı.')
    destination.mkdir(parents=True, exist_ok=True)
    for relative, original in files.items():
        target = destination / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(original, target)
    return len(files), sum(path.stat().st_size for path in files.values())


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true', help='Manifesti doğrula; dosya yazma.')
    parser.add_argument('--web-only', action='store_true', help='Capacitor senkronizasyonunu atla.')
    parser.add_argument('--output', type=Path, help='Yeni/boş dağıtım klasörü.')
    args = parser.parse_args()
    manifest = json.loads((BASE_DIR / 'scripts/mobile-assets.json').read_text())
    source = BASE_DIR / 'sprite_preview'
    files = collect(source, manifest)
    size = sum(path.stat().st_size for path in files.values())
    print(f'Manifest doğrulandı: {len(files)} dosya, {size / 1024**2:.1f} MiB.')
    if args.check:
        return
    if args.output:
        package(source, args.output, manifest)
    else:
        # Keep old distribution as a recoverable sibling; commit completed staging only.
        with tempfile.TemporaryDirectory(prefix='patilife-build-', dir=BASE_DIR) as temp:
            staged = Path(temp) / 'www'
            package(source, staged, manifest)
            target = BASE_DIR / 'www'
            backups = BASE_DIR / 'backups'
            backups.mkdir(exist_ok=True)
            previous = Path(tempfile.mkdtemp(prefix='www-before-build-', dir=backups)) / 'www'
            moved = False
            try:
                if target.exists():
                    target.rename(previous)
                    moved = True
                staged.rename(target)
            except Exception:
                if moved and not target.exists():
                    previous.rename(target)
                raise
            print(f'Önceki dağıtım korundu: {previous}')
    if not args.web_only and not args.output:
        env = os.environ.copy()
        env['PATH'] = '/opt/homebrew/bin:/usr/local/bin:' + env.get('PATH', '')
        subprocess.run(['npx', 'cap', 'sync', 'ios'], cwd=BASE_DIR, env=env, check=True)
    print('Web paketi hazır.')


if __name__ == '__main__':
    main()

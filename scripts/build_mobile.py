#!/usr/bin/env python3
import os
import shutil
import subprocess
import sys

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
SRC_HTML = os.path.join(BASE_DIR, "sprite_preview", "patilife_app.html")
WWW_DIR = os.path.join(BASE_DIR, "www")
WWW_INDEX = os.path.join(WWW_DIR, "index.html")
WWW_APP = os.path.join(WWW_DIR, "patilife_app.html")

print("1. Web varlıkları senkronize ediliyor...")
os.makedirs(WWW_DIR, exist_ok=True)
shutil.copyfile(SRC_HTML, WWW_INDEX)
shutil.copyfile(SRC_HTML, WWW_APP)

src_dir = os.path.join(BASE_DIR, "sprite_preview")
for root, dirs, files in os.walk(src_dir):
    rel = os.path.relpath(root, src_dir)
    target_root = os.path.join(WWW_DIR, rel) if rel != "." else WWW_DIR
    os.makedirs(target_root, exist_ok=True)
    for f in files:
        if f.startswith("."): continue
        s_path = os.path.join(root, f)
        d_path = os.path.join(target_root, f)
        if not os.path.exists(d_path) or os.path.getmtime(s_path) > os.path.getmtime(d_path):
            shutil.copy2(s_path, d_path)

print("2. Capacitor iOS senkronizasyonu çalıştırılıyor...")
env = os.environ.copy()
env["PATH"] = f"/opt/homebrew/bin:/usr/local/bin:{env.get('PATH', '')}"
subprocess.run(["npx", "cap", "sync", "ios"], cwd=BASE_DIR, env=env, check=True)

print("\n Dosyalar iOS projesine başarıyla aktarıldı! (Xcode üzerinden doğrudan çalıştırabilirsiniz)")


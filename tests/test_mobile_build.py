import importlib.util
import json
from pathlib import Path
import tempfile
import unittest

spec = importlib.util.spec_from_file_location('mobile_build', Path(__file__).resolve().parents[1] / 'scripts/build_mobile.py')
build = importlib.util.module_from_spec(spec)
spec.loader.exec_module(build)

class MobilePackageTest(unittest.TestCase):
    def test_entry_and_exclusions_and_no_stale_overwrite(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            source, target = root / 'src', root / 'out'
            source.mkdir()
            for file, body in [('app.html', 'GAME'), ('index.html', 'EDITOR'), ('favicon.ico', 'ICON'), ('assets/cat.png', 'CAT'), ('assets/preview.html', 'DEV'), ('backup_original/old.png', 'BACKUP'), ('feature/index.html', 'STORY')]:
                path = source / file
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_text(body)
            manifest = {'entry':'app.html','files':['favicon.ico'],'assetDirectories':['assets'],'featureDirectories':['feature'],'assetExtensions':['.png']}
            build.package(source, target, manifest)
            self.assertEqual((target / 'index.html').read_text(), 'GAME')
            self.assertTrue((target / 'feature/index.html').exists())
            self.assertFalse((target / 'assets/preview.html').exists())
            self.assertFalse((target / 'backup_original').exists())
            with self.assertRaises(ValueError):
                build.package(source, target, manifest)
            manifest['files'].append('../outside.png')
            with self.assertRaises(ValueError):
                build.collect(source, manifest)

    def test_real_manifest_is_complete_and_excludes_development_html(self):
        root = Path(__file__).resolve().parents[1]
        manifest = json.loads((root / 'scripts/mobile-assets.json').read_text())
        files = build.collect(root / 'sprite_preview', manifest)
        self.assertEqual(files['index.html'].name, 'patilife_app.html')
        self.assertIn('patilife_v2/model.js', files)
        self.assertNotIn('debug.html', files)
        self.assertFalse(any('backup' in name or 'frame_dump' in name for name in files))

if __name__ == '__main__':
    unittest.main()

import importlib.util
from pathlib import Path
import re
import tempfile
import unittest

spec=importlib.util.spec_from_file_location('web_revision',Path(__file__).resolve().parents[1]/'scripts/stamp_web_revision.py')
revision=importlib.util.module_from_spec(spec)
spec.loader.exec_module(revision)

class RevisionTest(unittest.TestCase):
    def test_content_versions_are_stable_and_change_after_module_edit(self):
        with tempfile.TemporaryDirectory() as temp:
            root=Path(temp);feature=root/'patilife_v2';feature.mkdir()
            (feature/'household.js').write_text('let version=1;')
            (feature/'game.css').write_text('body{color:brown}')
            html='''<html><head>
    <title>Game</title>
<script src="patilife_v2/household.js"></script>
<link href="patilife_v2/game.css" rel="stylesheet">
</head></html>'''
            entry=root/'patilife_app.html';entry.write_text(html)
            first=revision.stamp(root);stamped=entry.read_text()
            self.assertIn('?v='+first,stamped)
            self.assertIn('content="'+first+'"',stamped)
            self.assertEqual(revision.stamp(root),first)
            self.assertEqual(revision.stamp(root,check=True),first)
            (feature/'household.js').write_text('let version=2;')
            with self.assertRaises(ValueError):revision.stamp(root,check=True)
            second=revision.stamp(root)
            self.assertNotEqual(first,second)
            self.assertEqual(entry.read_text().count('patilife-revision'),1)
            self.assertEqual(entry.read_text().count('?v='),2)
            self.assertNotIn(first,entry.read_text())

    def test_stamping_preserves_the_entry_name_and_does_not_rewrite_game_storage(self):
        with tempfile.TemporaryDirectory() as temp:
            root=Path(temp);(root/'patilife_v2').mkdir()
            entry=root/'patilife_app.html';entry.write_text('    <title>PatiLife</title>\n<script>localStorage.getItem("pet_state")</script>\n')
            saved=root/'saved-game.json';saved.write_text('{"coins":252}')
            revision.stamp(root)
            self.assertIn('localStorage.getItem("pet_state")',entry.read_text())
            self.assertEqual(saved.read_text(),'{"coins":252}')
            self.assertEqual(list(root.glob('*.html')),[entry])

if __name__=='__main__':unittest.main()

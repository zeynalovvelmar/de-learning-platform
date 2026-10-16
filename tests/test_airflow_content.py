import unittest
from pathlib import Path
import yaml
from modules.airflow import load_airflow_lessons

class TestAirflowContent(unittest.TestCase):
    def setUp(self):
        self.content_dir = Path(__file__).parent.parent / "data" / "content" / "airflow"

    def test_01_all_12_lessons_exist(self):
        files = sorted(self.content_dir.glob("*.yaml"))
        self.assertEqual(len(files), 12, f"Expected exactly 12 Airflow lessons, found {len(files)}")

    def test_02_load_airflow_lessons_module_function(self):
        lessons = load_airflow_lessons()
        self.assertEqual(len(lessons), 12, f"load_airflow_lessons() should return 12 lessons, got {len(lessons)}")
        for idx, l in enumerate(lessons, start=1):
            self.assertEqual(l.get("order"), idx, f"Lesson {l.get('id')} order should be {idx}")

    def test_03_validate_lesson_schemas_and_bilingual_fields(self):
        files = sorted(self.content_dir.glob("*.yaml"))
        bilingual_fields = [
            "title", "infographic", "explanation", "quick_recap", 
            "what_it_does", "real_world_use", "common_mistakes", "output_description"
        ]

        total_flashcards = 0

        for idx, fpath in enumerate(files, start=1):
            with open(fpath, "r", encoding="utf-8") as f:
                data = yaml.safe_load(f)

            fname = fpath.name
            self.assertEqual(data.get("order"), idx, f"Order mismatch in {fname}")
            self.assertIn(data.get("level"), ["junior", "intermediate", "advanced"], f"Invalid level in {fname}")

            # Verify bilingual fields
            for bf in bilingual_fields:
                self.assertIn(bf, data, f"Missing '{bf}' in {fname}")
                val = data[bf]
                self.assertIsInstance(val, dict, f"'{bf}' must be dict in {fname}")
                self.assertTrue(val.get("en"), f"Missing EN in '{bf}' in {fname}")
                self.assertTrue(val.get("az"), f"Missing AZ in '{bf}' in {fname}")

            # Verify code and visual output
            code = data.get("code", "")
            self.assertTrue(code.strip(), f"Empty 'code' in {fname}")
            vis_out = data.get("visual_output", "")
            self.assertTrue(vis_out.strip(), f"Empty 'visual_output' in {fname}")

            # Verify interview question
            iq = data.get("interview_question", {})
            self.assertTrue(iq.get("question", {}).get("en"), f"Missing EN interview question in {fname}")
            self.assertTrue(iq.get("question", {}).get("az"), f"Missing AZ interview question in {fname}")
            self.assertTrue(iq.get("answer", {}).get("en"), f"Missing EN interview answer in {fname}")
            self.assertTrue(iq.get("answer", {}).get("az"), f"Missing AZ interview answer in {fname}")
            self.assertTrue(iq.get("interviewer_tips", {}).get("en"), f"Missing EN interviewer tips in {fname}")
            self.assertTrue(iq.get("interviewer_tips", {}).get("az"), f"Missing AZ interviewer tips in {fname}")

            # Verify flashcards
            fc = data.get("flashcards", [])
            self.assertEqual(len(fc), 5, f"Each lesson must have exactly 5 flashcards, {fname} has {len(fc)}")
            for c_idx, card in enumerate(fc, start=1):
                self.assertTrue(card.get("front", {}).get("en"), f"Card {c_idx} missing EN front in {fname}")
                self.assertTrue(card.get("front", {}).get("az"), f"Card {c_idx} missing AZ front in {fname}")
                self.assertTrue(card.get("back", {}).get("en"), f"Card {c_idx} missing EN back in {fname}")
                self.assertTrue(card.get("back", {}).get("az"), f"Card {c_idx} missing AZ back in {fname}")

            total_flashcards += len(fc)

        self.assertEqual(total_flashcards, 60, f"Expected 60 total flashcards across 12 lessons, got {total_flashcards}")

if __name__ == "__main__":
    unittest.main(verbosity=2)

import unittest
from pathlib import Path
import yaml
from modules.python_engine import PythonEngine

class TestPythonEngine(unittest.TestCase):
    def setUp(self):
        self.engine = PythonEngine(default_timeout=3.0)

    def test_01_execute_normal_stdout(self):
        code = "print('Hello Data Engineer!')\nprint(10 + 20)"
        out, err = self.engine.execute_code(code)
        self.assertIsNone(err)
        self.assertIn("Hello Data Engineer!", out)
        self.assertIn("30", out)

    def test_02_execute_runtime_error(self):
        code = "x = 10 / 0"
        out, err = self.engine.execute_code(code)
        self.assertIsNotNone(err)
        self.assertIn("ZeroDivisionError", err)

    def test_03_execute_timeout_protection(self):
        code = "while True: pass"
        out, err = self.engine.execute_code(code, timeout=1.0)
        self.assertIsNotNone(err)
        self.assertIn("TimeoutError", err)

    def test_04_security_disallowed_modules(self):
        code = "import os\nos.system('dir')"
        out, err = self.engine.execute_code(code)
        self.assertIsNotNone(err)
        self.assertIn("SecurityError", err)

        code_from = "from subprocess import Popen"
        out, err = self.engine.execute_code(code_from)
        self.assertIsNotNone(err)
        self.assertIn("SecurityError", err)

    def test_05_check_answer_success(self):
        user_code = """
def clean_email(email):
    return email.strip().lower()
"""
        test_code = """
assert clean_email('  User@Domain.COM ') == 'user@domain.com'
assert clean_email('Data@Engineer.io') == 'data@engineer.io'
"""
        ok, status, details = self.engine.check_answer(user_code, test_code)
        self.assertTrue(ok)
        self.assertEqual(status, "ok")
        self.assertIsNone(details)

    def test_06_check_answer_values_mismatch(self):
        user_code = """
def clean_email(email):
    return email.upper()  # Incorrect logic
"""
        test_code = """
assert clean_email('test@domain.com') == 'test@domain.com', "Expected lowercase email"
"""
        ok, status, details = self.engine.check_answer(user_code, test_code)
        self.assertFalse(ok)
        self.assertEqual(status, "values_mismatch")
        self.assertIn("Expected lowercase email", details)

    def test_07_check_answer_syntax_error(self):
        user_code = "def clean_email(email): return ___"
        test_code = "assert clean_email('a') == 'a'"
        ok, status, details = self.engine.check_answer(user_code, test_code)
        self.assertFalse(ok)
        self.assertEqual(status, "user_error")

    def test_08_check_answer_timeout(self):
        user_code = """
def clean_email(email):
    while True:
        pass
"""
        test_code = "assert clean_email('a') == 'a'"
        ok, status, details = self.engine.check_answer(user_code, test_code, timeout=1.0)
        self.assertFalse(ok)
        self.assertEqual(status, "timeout")

    def test_09_all_lessons_content_and_execution(self):
        content_dir = Path(__file__).parent.parent / "data" / "content" / "python"
        lesson_files = sorted(content_dir.glob("*.yaml"))
        self.assertEqual(len(lesson_files), 11, f"Expected 11 Python lesson YAML files, found {len(lesson_files)}")

        bilingual_keys = ["title", "quick_recap", "explanation", "what_it_does", "real_world_use", "common_mistakes"]

        for idx, fpath in enumerate(lesson_files, start=1):
            with open(fpath, "r", encoding="utf-8") as f:
                lesson = yaml.safe_load(f)

            fname = fpath.name
            self.assertEqual(lesson.get("order"), idx, f"Lesson {fname} order should be {idx}")
            self.assertIn(lesson.get("level"), ["junior", "intermediate", "advanced"], f"Invalid level in {fname}")

            # Check bilingual fields
            for key in bilingual_keys:
                self.assertIn(key, lesson, f"Missing '{key}' in {fname}")
                val = lesson[key]
                self.assertIsInstance(val, dict, f"'{key}' must be dict in {fname}")
                self.assertTrue(val.get("en"), f"Missing EN in '{key}' in {fname}")
                self.assertTrue(val.get("az"), f"Missing AZ in '{key}' in {fname}")

            # Check interview question
            iq = lesson.get("interview_question", {})
            self.assertTrue(iq.get("question", {}).get("en"), f"Missing EN interview question in {fname}")
            self.assertTrue(iq.get("question", {}).get("az"), f"Missing AZ interview question in {fname}")
            self.assertTrue(iq.get("answer", {}).get("en"), f"Missing EN interview answer in {fname}")
            self.assertTrue(iq.get("answer", {}).get("az"), f"Missing AZ interview answer in {fname}")

            # Check flashcards (must be exactly 5 cards)
            flashcards = lesson.get("flashcards", [])
            self.assertEqual(len(flashcards), 5, f"Lesson {fname} must contain exactly 5 flashcards, got {len(flashcards)}")
            for c_idx, card in enumerate(flashcards, start=1):
                self.assertTrue(card.get("front", {}).get("en"), f"Card {c_idx} missing EN front in {fname}")
                self.assertTrue(card.get("front", {}).get("az"), f"Card {c_idx} missing AZ front in {fname}")
                self.assertTrue(card.get("back", {}).get("en"), f"Card {c_idx} missing EN back in {fname}")
                self.assertTrue(card.get("back", {}).get("az"), f"Card {c_idx} missing AZ back in {fname}")

            # Check code execution
            code_str = lesson.get("code", "")
            self.assertTrue(code_str.strip(), f"Empty code block in {fname}")
            out, err = self.engine.execute_code(code_str)
            self.assertIsNone(err, f"Execution failed for lesson code in {fname}: {err}\nCode was:\n{code_str}")

            # Check exercise
            exercise = lesson.get("exercise")
            if exercise:
                self.assertTrue(exercise.get("question", {}).get("en"), f"Exercise missing EN question in {fname}")
                self.assertTrue(exercise.get("question", {}).get("az"), f"Exercise missing AZ question in {fname}")
                self.assertTrue(exercise.get("starter_code"), f"Missing starter_code in {fname}")
                self.assertTrue(exercise.get("solution"), f"Missing solution in {fname}")
                self.assertTrue(exercise.get("test_code"), f"Missing test_code in {fname}")

                # Solution must pass
                sol_ok, status, details = self.engine.check_answer(exercise["solution"], exercise["test_code"])
                self.assertTrue(sol_ok, f"Exercise solution failed in {fname}: status={status}, details={details}")
                self.assertEqual(status, "ok")

                # Starter code must NOT pass
                starter_ok, _, _ = self.engine.check_answer(exercise["starter_code"], exercise["test_code"])
                self.assertFalse(starter_ok, f"Starter code unexpectedly passed in {fname}")

if __name__ == '__main__':
    unittest.main(verbosity=2)

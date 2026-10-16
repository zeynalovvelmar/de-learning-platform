import unittest
from fastapi.testclient import TestClient
from server.main import app

class TestFastAPIBackend(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_01_health_check(self):
        res = self.client.get("/api/health")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "healthy")
        self.assertEqual(data["modules_count"], 8)

    def test_02_get_all_modules(self):
        res = self.client.get("/api/modules")
        self.assertEqual(res.status_code, 200)
        modules = res.json()
        self.assertEqual(len(modules), 8)
        mod_ids = [m["id"] for m in modules]
        expected_ids = ["python", "sql", "spark", "kafka", "airflow", "devops", "data_architecture", "dbt"]
        self.assertEqual(mod_ids, expected_ids)

    def test_03_get_module_lessons(self):
        res = self.client.get("/api/modules/data_architecture/lessons")
        self.assertEqual(res.status_code, 200)
        lessons = res.json()
        self.assertEqual(len(lessons), 12)
        self.assertEqual(lessons[0]["id"], "01-oltp-vs-olap-columnar")

    def test_04_get_single_lesson_detail(self):
        res = self.client.get("/api/modules/dbt/lessons/01-what-is-dbt-elt-philosophy")
        self.assertEqual(res.status_code, 200)
        lesson = res.json()
        self.assertEqual(lesson["id"], "01-what-is-dbt-elt-philosophy")
        self.assertIn("infographic", lesson)
        self.assertIn("explanation", lesson)
        self.assertIn("flashcards", lesson)
        self.assertEqual(len(lesson["flashcards"]), 5)

    def test_05_get_module_flashcards_master_deck(self):
        res = self.client.get("/api/modules/dbt/flashcards")
        self.assertEqual(res.status_code, 200)
        cards = res.json()
        self.assertEqual(len(cards), 30)
        self.assertIn("lesson_id", cards[0])

    def test_06_i18n_endpoints(self):
        res_az = self.client.get("/api/i18n/az")
        self.assertEqual(res_az.status_code, 200)
        self.assertEqual(res_az.json()["app_title"], "Data Mühəndisliyi Təkrarı")

        res_en = self.client.get("/api/i18n/en")
        self.assertEqual(res_en.status_code, 200)
        self.assertEqual(res_en.json()["app_title"], "Data Engineering Revision")

    def test_07_execute_sql_valid_query(self):
        payload = {"query": "SELECT category_id, category_name FROM categories ORDER BY category_id LIMIT 2;"}
        res = self.client.post("/api/execute/sql", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["success"])
        self.assertEqual(data["columns"], ["category_id", "category_name"])
        self.assertEqual(len(data["rows"]), 2)
        self.assertGreater(data["execution_time_ms"], 0.0)

    def test_08_execute_sql_security_denied(self):
        payload = {"query": "DROP TABLE categories;"}
        res = self.client.post("/api/execute/sql", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertFalse(data["success"])
        self.assertIn("not authorized", data["error"])

    def test_09_execute_sql_check_answer(self):
        payload = {
            "lesson_id": "04-joins",
            "user_query": """
                SELECT c.category_id, c.category_name
                FROM categories c
                LEFT JOIN products p ON c.category_id = p.category_id
                WHERE p.product_id IS NULL;
            """
        }
        res = self.client.post("/api/execute/sql/check", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["is_correct"])
        self.assertEqual(data["status"], "ok")

    def test_10_execute_python_valid(self):
        payload = {"code": "print('FASTAPI_PYTHON_OK')"}
        res = self.client.post("/api/execute/python", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["success"])
        self.assertIn("FASTAPI_PYTHON_OK", data["stdout"])

    def test_11_execute_python_security_error(self):
        payload = {"code": "import os; print(os.name)"}
        res = self.client.post("/api/execute/python", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertFalse(data["success"])
        self.assertIn("SecurityError", data["error"])

if __name__ == "__main__":
    unittest.main(verbosity=2)

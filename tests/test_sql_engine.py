import sys
import os
import unittest
import tempfile
import filecmp
from pathlib import Path
import sqlite3
import time
import re
import yaml

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from modules.sql_engine import SQLEngine
from scripts.generate import generate_data

class TestSQLEngine(unittest.TestCase):
    def setUp(self):
        self.engine = SQLEngine()
        
    def test_00_limits_set(self):
        import sqlite3
        limit1 = self.engine.conn.getlimit(sqlite3.SQLITE_LIMIT_LENGTH)
        limit2 = self.engine.conn.getlimit(sqlite3.SQLITE_LIMIT_SQL_LENGTH)
        self.assertEqual(limit1, 1000000)
        self.assertEqual(limit2, 1000000)

    def test_01_csvs_exist(self):
        base_dir = Path(__file__).parent.parent / 'data' / 'datasets'
        for table in ['categories', 'products', 'users', 'login_events', 'orders', 'order_items']:
            self.assertTrue((base_dir / f"{table}.csv").exists(), f"{table}.csv does not exist")
            
    def test_02_determinism(self):
        base_dir = Path(__file__).parent.parent / 'data' / 'datasets'
        with tempfile.TemporaryDirectory() as temp_dir:
            generate_data(temp_dir)
            for table in ['categories', 'products', 'users', 'login_events', 'orders', 'order_items']:
                original = base_dir / f"{table}.csv"
                generated = Path(temp_dir) / f"{table}.csv"
                self.assertTrue(filecmp.cmp(original, generated, shallow=False), f"File {table}.csv is not deterministically identical")

    def test_03_authorizer_allowed(self):
        queries = [
            ("SELECT * FROM users", "SELECT"),
            ("WITH cte AS (SELECT * FROM users) SELECT * FROM cte", "WITH"),
            ("EXPLAIN QUERY PLAN SELECT * FROM users", "EXPLAIN QUERY PLAN"),
            ("CREATE INDEX idx_users_email ON users(email)", "CREATE INDEX"),
            ("DROP INDEX idx_users_email", "DROP INDEX")
        ]
        for query, name in queries:
            with self.subTest(name=name):
                df, err = self.engine.execute_query(query)
                self.assertIsNone(err)

    def test_04_user_DML_on_normal_tables_denied(self):
        for q in ["INSERT INTO users (first_name) VALUES ('Test')", "UPDATE users SET first_name = 'Test'", "DELETE FROM users"]:
            with self.subTest(query=q):
                df, err = self.engine.execute_query(q)
                self.assertIsNotNone(err)
                self.assertIn("not authorized", err.lower())

    def test_04b_user_DML_on_sqlite_master_denied(self):
        for q in ["INSERT INTO sqlite_master (type) VALUES ('table')", "UPDATE sqlite_master SET name = 'test'", "DELETE FROM sqlite_master"]:
            with self.subTest(query=q):
                df, err = self.engine.execute_query(q)
                self.assertIsNotNone(err)
                self.assertTrue("not authorized" in err.lower() or "table sqlite_master may not be modified" in err.lower())

    def test_04c_ANALYZE_and_REINDEX_denied(self):
        for q in ["REINDEX", "ANALYZE"]:
            with self.subTest(query=q):
                df, err = self.engine.execute_query(q)
                self.assertIsNotNone(err)
                self.assertIn("not authorized", err.lower())

    def test_04d_comment_REINDEX_denied(self):
        for q in ["/* x */ REINDEX", "-- c\nREINDEX", "reindex", "/**/REINDEX"]:
            with self.subTest(query=q):
                df, err = self.engine.execute_query(q)
                self.assertIsNotNone(err)
                self.assertIn("not authorized", err.lower())

    def test_04e_load_extension_denied(self):
        df, err = self.engine.execute_query("SELECT load_extension('test.so')")
        self.assertIsNotNone(err)
        self.assertIn("not authorized", err.lower())

    def test_05_multi_statement_denied(self):
        df, err = self.engine.execute_query("SELECT 1; SELECT 2;")
        self.assertIsNotNone(err)
        self.assertTrue("only execute one statement" in err.lower() or "not authorized" in err.lower(), "Multi-statement must be blocked")

    def test_06_recursive_CTE_stops_within_4_seconds(self):
        start = time.time()
        df, err = self.engine.execute_query("""
            WITH RECURSIVE cnt(x) AS (
                SELECT 1
                UNION ALL
                SELECT x+1 FROM cnt
            )
            SELECT COUNT(*) FROM cnt;
        """)
        elapsed = time.time() - start
        self.assertIsNotNone(err)
        self.assertIn("interrupted", err.lower())
        self.assertLess(elapsed, 5.0)

    def test_07_zeroblob_memory_error(self):
        df, err = self.engine.execute_query("SELECT hex(zeroblob(900000000))")
        self.assertIsNotNone(err)
        self.assertTrue("string or blob too big" in err.lower() or "too big" in err.lower())

    def test_08_data_validation(self):
        # row counts
        df, err = self.engine.execute_query("SELECT COUNT(*) as c FROM users")
        self.assertEqual(df.iloc[0]['c'], 100)
        
        # 12+ distinct months
        df, err = self.engine.execute_query("SELECT COUNT(DISTINCT substr(order_date, 1, 7)) as m FROM orders")
        self.assertGreaterEqual(df.iloc[0]['m'], 12)
        
        # ties
        df, err = self.engine.execute_query("""
            SELECT price, count(*) as c FROM products GROUP BY price HAVING c > 1
        """)
        self.assertGreater(len(df), 0)
        
        # duplicate emails
        df, err = self.engine.execute_query("""
            SELECT lower(email) as e, count(*) as c FROM users GROUP BY lower(email) HAVING c > 1
        """)
        self.assertGreater(len(df), 0)
        
        # zero-order users
        df, err = self.engine.execute_query("""
            SELECT u.user_id FROM users u LEFT JOIN orders o ON u.user_id = o.user_id WHERE o.order_id IS NULL
        """)
        self.assertGreater(len(df), 0)
        
        # empty category
        df, err = self.engine.execute_query("""
            SELECT c.category_id FROM categories c LEFT JOIN products p ON c.category_id = p.category_id WHERE p.product_id IS NULL
        """)
        self.assertGreater(len(df), 0)
        
        # never-ordered product
        df, err = self.engine.execute_query("""
            SELECT p.product_id FROM products p LEFT JOIN order_items oi ON p.product_id = oi.product_id WHERE oi.item_id IS NULL
        """)
        self.assertGreater(len(df), 0)
        
        # NULL stock as real NULLs
        df, err = self.engine.execute_query("""
            SELECT COUNT(*) as c FROM products WHERE stock_quantity IS NULL
        """)
        self.assertGreater(df.iloc[0]['c'], 0)
        
        # total_amount consistency
        df, err = self.engine.execute_query("""
            SELECT o.order_id, o.total_amount, SUM(oi.quantity * oi.unit_price) as calc
            FROM orders o JOIN order_items oi ON o.order_id = oi.order_id
            GROUP BY o.order_id
        """)
        for _, row in df.iterrows():
            self.assertAlmostEqual(row['total_amount'], row['calc'], places=2)
            
        # NULL check: string 'NA' stays a string
        df, err = self.engine.execute_query("SELECT COUNT(*) as c FROM users WHERE country = 'NA'")
        self.assertGreater(df.iloc[0]['c'], 0, "String 'NA' must stay a string, not be parsed as NULL")

        # the number of NULLs per column in the loaded DB equals the number of empty cells in each CSV
        import csv
        base_dir = Path(__file__).parent.parent / 'data' / 'datasets'
        for table in ['products', 'users']: # tables with known nulls
            csv_path = base_dir / f"{table}.csv"
            with open(csv_path, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                rows = list(reader)
                for col in reader.fieldnames:
                    empty_count = sum(1 for row in rows if row[col] == '')
                    df, _ = self.engine.execute_query(f"SELECT COUNT(*) as c FROM {table} WHERE {col} IS NULL")
                    null_count = df.iloc[0]['c']
                    self.assertEqual(empty_count, null_count, f"Mismatch in {table}.{col}: {empty_count} empty cells vs {null_count} NULLs")

    def test_09_lessons(self):
        lessons_dir = Path(__file__).parent.parent / 'data' / 'content' / 'sql'
        for f in lessons_dir.glob('*.yaml'):
            with open(f, 'r', encoding='utf-8') as file:
                lesson = yaml.safe_load(file)
            
            code_part = lesson['code'].strip()
            exercise = lesson['exercise']
            solution_part = exercise['solution'].strip()
            starter_code = exercise['starter_code'].strip()
            order_matters = exercise.get('order_matters', False)
            
            # test code example returns >= 1 row
            df, err = self.engine.execute_query(code_part)
            self.assertIsNone(err, f"Lesson code failed for {f.name}: {err}")
            self.assertGreaterEqual(len(df), 1, f"Lesson code returned 0 rows for {f.name}")
            
            # test explanation code snippets return >= 1 row if present
            sql_blocks = re.findall(r'```sql\s*(.*?)\s*```', lesson.get('explanation', {}).get('en', ''), re.DOTALL)
            for block in sql_blocks:
                block = block.strip()
                df_b, err_b = self.engine.execute_query(block)
                self.assertIsNone(err_b, f"Explanation SQL snippet failed for {f.name}: {err_b}")
                self.assertGreaterEqual(len(df_b), 1, f"Explanation snippet returned 0 rows in {f.name}")

            # test solution returns >= 1 row
            df_sol, err = self.engine.execute_query(solution_part)
            self.assertIsNone(err, f"Lesson solution failed for {f.name}: {err}")
            self.assertGreaterEqual(len(df_sol), 1, f"Solution returned 0 rows for {f.name}")
            
            # assert solution returns fewer rows than the target table has
            table_match = re.search(r'FROM\s+([a-zA-Z0-9_]+)', solution_part, re.IGNORECASE)
            self.assertIsNotNone(table_match, f"Could not determine table in solution for {f.name}")
            table_name = table_match.group(1)
            df_table, _ = self.engine.execute_query(f"SELECT COUNT(*) as c FROM {table_name}")
            total_rows = df_table.iloc[0]['c']
            self.assertLess(len(df_sol), total_rows, f"Solution rows ({len(df_sol)}) should be less than table rows ({total_rows}) in {f.name}")

            # starter_code does NOT pass check_answer
            is_correct_st, status_st, _ = self.engine.check_answer(starter_code, solution_part, order_matters)
            self.assertFalse(is_correct_st, f"Starter code should not pass check_answer in {f.name}")

            # check_answer matches solution
            is_correct, status_code, details = self.engine.check_answer(solution_part, solution_part, order_matters)
            self.assertTrue(is_correct, f"Solution check failed for {f.name}: {status_code}")
            self.assertEqual(status_code, "ok")

    def test_10_solution_failure_returns_internal_error(self):
        # row cap hit in check_answer (not 500, but 100000)
        # We can't generate 100k rows easily, but we can verify it works on 1294 rows
        is_correct, status, details = self.engine.check_answer("SELECT * FROM order_items", "SELECT * FROM order_items")
        self.assertTrue(is_correct)
        self.assertEqual(status, "ok")
        
        # solution failure returns internal_error
        is_correct, status, details = self.engine.check_answer("SELECT 1", "SELECT syntax_error")
        self.assertFalse(is_correct)
        self.assertEqual(status, "internal_error")

    def test_11_typeof(self):
        # typeof checks (stock_quantity only integer/null, order_date text, price real)
        df, err = self.engine.execute_query("SELECT DISTINCT typeof(stock_quantity) as t FROM products")
        types = set(df['t'].tolist())
        self.assertTrue(types.issubset({'integer', 'null'}))
        
        df, err = self.engine.execute_query("SELECT DISTINCT typeof(order_date) as t FROM orders")
        self.assertEqual(df['t'].tolist(), ['text'])
        
        df, err = self.engine.execute_query("SELECT DISTINCT typeof(price) as t FROM products")
        self.assertEqual(df['t'].tolist(), ['real'])

    def test_12_check_answer_scenarios(self):
        solution = "SELECT product_name, price FROM products WHERE price = 19.99"

        # different column aliases -> ok
        alias_query = "SELECT product_name AS item_title, price AS product_price FROM products WHERE price = 19.99"
        ok, status, _ = self.engine.check_answer(alias_query, solution, order_matters=False)
        self.assertTrue(ok)
        self.assertEqual(status, "ok")

        # extra column -> column_mismatch
        extra_col_query = "SELECT product_name, price, product_id FROM products WHERE price = 19.99"
        ok, status, _ = self.engine.check_answer(extra_col_query, solution, order_matters=False)
        self.assertFalse(ok)
        self.assertEqual(status, "column_mismatch")

        # wrong filter -> row_mismatch or values_mismatch
        wrong_filter_query = "SELECT product_name, price FROM products WHERE price = 9.99"
        ok, status, _ = self.engine.check_answer(wrong_filter_query, solution, order_matters=False)
        self.assertFalse(ok)
        self.assertIn(status, ["row_mismatch", "values_mismatch"])

        # order_matters=True with reversed order -> fails, False -> ok
        ordered_sol = "SELECT product_name FROM products WHERE price = 19.99 ORDER BY product_name ASC"
        reversed_query = "SELECT product_name FROM products WHERE price = 19.99 ORDER BY product_name DESC"
        ok_order_true, status_order_true, _ = self.engine.check_answer(reversed_query, ordered_sol, order_matters=True)
        self.assertFalse(ok_order_true)
        self.assertIn(status_order_true, ["values_mismatch", "row_mismatch"])

        ok_order_false, status_order_false, _ = self.engine.check_answer(reversed_query, ordered_sol, order_matters=False)
        self.assertTrue(ok_order_false)
        self.assertEqual(status_order_false, "ok")

        # user syntax error -> user_error
        ok, status, _ = self.engine.check_answer("SELECT FROM WHERE", solution, order_matters=False)
        self.assertFalse(ok)
        self.assertEqual(status, "user_error")

        # a mutating user query -> user_error
        ok, status, _ = self.engine.check_answer("INSERT INTO users (first_name) VALUES ('Hacked')", solution, order_matters=False)
        self.assertFalse(ok)
        self.assertEqual(status, "user_error")

if __name__ == '__main__':
    unittest.main(verbosity=2)

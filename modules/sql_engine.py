import sqlite3
import pandas as pd
import time
import logging
from pathlib import Path
import re

def strip_sql_comments(sql: str) -> str:
    sql = re.sub(r'/\*.*?\*/', ' ', sql, flags=re.DOTALL)
    sql = re.sub(r'--[^\r\n]*', ' ', sql)
    return sql.strip()

class SQLEngine:
    def __init__(self):
        self.sqlite_version = sqlite3.sqlite_version
        logging.info(f"Initialized SQLEngine with SQLite version: {self.sqlite_version}")
        self.conn = self.get_db_connection()
        
    def get_db_connection(self):
        conn = sqlite3.connect(':memory:', check_same_thread=False)
        self.harden_db(conn)
        self.populate_db(conn)
        self.setup_authorizer(conn)
        return conn
        
    def harden_db(self, conn):
        conn.setlimit(sqlite3.SQLITE_LIMIT_LENGTH, 1000000)
        conn.setlimit(sqlite3.SQLITE_LIMIT_SQL_LENGTH, 1000000)
        
    def reset_database(self):
        if hasattr(self, 'conn') and self.conn:
            self.conn.close()
        self.conn = self.get_db_connection()
        
    def populate_db(self, conn):
        cursor = conn.cursor()
        cursor.executescript("""
            CREATE TABLE categories (
                category_id INTEGER PRIMARY KEY,
                category_name TEXT
            );
            CREATE TABLE products (
                product_id INTEGER PRIMARY KEY,
                category_id INTEGER,
                product_name TEXT,
                price REAL,
                stock_quantity INTEGER,
                FOREIGN KEY(category_id) REFERENCES categories(category_id)
            );
            CREATE TABLE users (
                user_id INTEGER PRIMARY KEY,
                first_name TEXT,
                last_name TEXT,
                email TEXT,
                country TEXT,
                created_at TEXT
            );
            CREATE TABLE login_events (
                event_id INTEGER PRIMARY KEY,
                user_id INTEGER,
                login_time TEXT,
                ip_address TEXT,
                FOREIGN KEY(user_id) REFERENCES users(user_id)
            );
            CREATE TABLE orders (
                order_id INTEGER PRIMARY KEY,
                user_id INTEGER,
                order_date TEXT,
                status TEXT,
                total_amount REAL,
                FOREIGN KEY(user_id) REFERENCES users(user_id)
            );
            CREATE TABLE order_items (
                item_id INTEGER PRIMARY KEY,
                order_id INTEGER,
                product_id INTEGER,
                quantity INTEGER,
                unit_price REAL,
                FOREIGN KEY(order_id) REFERENCES orders(order_id),
                FOREIGN KEY(product_id) REFERENCES products(product_id)
            );
        """)

        base_dir = Path(__file__).parent.parent / 'data' / 'datasets'
        
        tables = ['categories', 'products', 'users', 'login_events', 'orders', 'order_items']
        for table in tables:
            csv_path = base_dir / f"{table}.csv"
            df = pd.read_csv(csv_path, keep_default_na=False, na_values=[''])
            df = df.astype(object).where(df.notna(), None)
            
            placeholders = ', '.join(['?'] * len(df.columns))
            sql = f"INSERT INTO {table} ({', '.join(df.columns)}) VALUES ({placeholders})"
            cursor.executemany(sql, df.values.tolist())
            
        conn.commit()

    def setup_authorizer(self, conn):
        allowed_actions = {
            sqlite3.SQLITE_SELECT,
            sqlite3.SQLITE_READ,
            sqlite3.SQLITE_FUNCTION,
            sqlite3.SQLITE_RECURSIVE,
            sqlite3.SQLITE_CREATE_INDEX,
            sqlite3.SQLITE_DROP_INDEX,
        }
        
        def authorizer(action_code, arg1, arg2, db_name, source_name):
            if action_code == sqlite3.SQLITE_FUNCTION and arg2 and arg2.lower() == 'load_extension':
                return sqlite3.SQLITE_DENY
                
            if action_code == sqlite3.SQLITE_REINDEX:
                # SQLite internally invokes SQLITE_REINDEX on the new index during CREATE INDEX.
                # Explicit REINDEX is blocked by query normalization, and also denied here.
                if getattr(self, 'current_first_word', '') == 'REINDEX':
                    return sqlite3.SQLITE_DENY
                return sqlite3.SQLITE_OK

            if action_code == sqlite3.SQLITE_ANALYZE:
                return sqlite3.SQLITE_DENY

            if action_code in allowed_actions:
                return sqlite3.SQLITE_OK
                
            # Verified by experiment: 
            # - CREATE INDEX needs SQLITE_INSERT on sqlite_master and SQLITE_REINDEX
            # - DROP INDEX needs SQLITE_DELETE and SQLITE_UPDATE on sqlite_master
            if action_code in (sqlite3.SQLITE_INSERT, sqlite3.SQLITE_UPDATE, sqlite3.SQLITE_DELETE):
                if arg1 in ('sqlite_master', 'sqlite_temp_master'):
                    return sqlite3.SQLITE_OK
            return sqlite3.SQLITE_DENY

        conn.set_authorizer(authorizer)

    def execute_query(self, query, max_rows=500):
        clean_query = strip_sql_comments(query)
        tokens = clean_query.split()
        first_word = tokens[0].upper() if tokens else ''
        self.current_first_word = first_word

        if first_word in ('REINDEX', 'ANALYZE'):
            return None, "not authorized"

        if not self.conn:
            self.conn = self.get_db_connection()
            
        start_time = time.time()
        def handler():
            if time.time() - start_time > 3.0:
                return 1
            return 0
        self.conn.set_progress_handler(handler, 100)
        
        cursor = self.conn.cursor()
        try:
            cursor.execute(query)
            if cursor.description:
                if max_rows is not None:
                    rows = cursor.fetchmany(max_rows)
                else:
                    rows = cursor.fetchall()
                columns = [desc[0] for desc in cursor.description]
                return pd.DataFrame(rows, columns=columns), None
            else:
                return pd.DataFrame(), None
        except Exception as e:
            return None, str(e)
        finally:
            self.conn.set_progress_handler(None, 0)
            
    def check_answer(self, user_query, solution_query, order_matters=False):
        user_df, user_err = self.execute_query(user_query, max_rows=100000)
        if user_err:
            return False, "user_error", user_err
        if user_df is not None and len(user_df) == 100000:
            return False, "too_many_rows", ""
            
        solution_df, sol_err = self.execute_query(solution_query, max_rows=100000)
        if sol_err:
            return False, "internal_error", sol_err
        if solution_df is not None and len(solution_df) == 100000:
            return False, "internal_error", "Solution has too many rows"
            
        if user_df is None or solution_df is None:
            return False, "user_error", "No results."
            
        if len(user_df.columns) != len(solution_df.columns):
            return False, "column_mismatch", ""
            
        if len(user_df) != len(solution_df):
            return False, "row_mismatch", ""

        try:
            user_df = user_df.round(2)
            solution_df = solution_df.round(2)
            
            standard_cols = [f"col_{i}" for i in range(len(solution_df.columns))]
            user_df.columns = standard_cols
            solution_df.columns = standard_cols
            
            if not order_matters:
                user_df = user_df.sort_values(by=standard_cols).reset_index(drop=True)
                solution_df = solution_df.sort_values(by=standard_cols).reset_index(drop=True)
                
            pd.testing.assert_frame_equal(user_df, solution_df, check_dtype=False)
            return True, "ok", ""
        except (AssertionError, TypeError, ValueError):
            return False, "values_mismatch", ""

import time
from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List
from server.schemas import (
    ExecuteSQLRequest, ExecuteSQLResponse,
    CheckSQLAnswerRequest, CheckAnswerResponse,
    ExecutePythonRequest, ExecutePythonResponse,
    CheckPythonAnswerRequest
)
from modules.sql_engine import SQLEngine
from modules.python_engine import PythonEngine
from pathlib import Path
import yaml

router = APIRouter(prefix="/api/execute", tags=["execute"])

# Singletons for execution engines
sql_engine = SQLEngine()
python_engine = PythonEngine()

DATA_CONTENT_DIR = Path(__file__).parent.parent.parent / "data" / "content"

def load_lesson(module_id: str, lesson_id: str) -> Dict[str, Any]:
    fpath = DATA_CONTENT_DIR / module_id / f"{lesson_id}.yaml"
    if not fpath.exists():
        raise HTTPException(status_code=404, detail=f"Lesson '{lesson_id}' in '{module_id}' not found")
    with open(fpath, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)

# --- SQL ENDPOINTS ---

@router.post("/sql", response_model=ExecuteSQLResponse)
def execute_sql(req: ExecuteSQLRequest) -> ExecuteSQLResponse:
    """Executes a SQL query in the sandboxed SQLite in-memory database."""
    start_time = time.perf_counter()
    df, err = sql_engine.execute_query(req.query, max_rows=req.max_rows)
    duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
    
    if err:
        return ExecuteSQLResponse(
            success=False,
            error=str(err),
            execution_time_ms=duration_ms
        )
    
    columns = list(df.columns)
    # Convert dataframe rows to list of lists, handling nulls/NaNs
    rows = df.where(df.notnull(), None).values.tolist()
    
    return ExecuteSQLResponse(
        success=True,
        columns=columns,
        rows=rows,
        row_count=len(rows),
        truncated=(len(rows) == req.max_rows),
        execution_time_ms=duration_ms
    )

@router.get("/sql/schema")
def get_sql_schema() -> Dict[str, str]:
    """Returns the DDL schema of the current SQLite database tables."""
    return {"schema": sql_engine.get_schema()}

@router.post("/sql/reset")
def reset_sql_database() -> Dict[str, str]:
    """Resets the SQLite database to its original tables and CSV sample data."""
    sql_engine.reset_database()
    return {"message": "Database reset to initial state successfully."}

@router.post("/sql/check", response_model=CheckAnswerResponse)
def check_sql_answer(req: CheckSQLAnswerRequest) -> CheckAnswerResponse:
    """Validates user's SQL query against the official solution for a lesson."""
    lesson = load_lesson("sql", req.lesson_id)
    if "exercise" not in lesson:
        raise HTTPException(status_code=400, detail="This lesson does not contain an interactive exercise.")
    
    solution_query = lesson["exercise"]["solution"]
    order_matters = lesson["exercise"].get("order_matters", False)
    
    is_correct, status, details = sql_engine.check_answer(req.user_query, solution_query, order_matters)
    
    return CheckAnswerResponse(
        is_correct=is_correct,
        status=status,
        details=str(details) if details else None
    )

# --- PYTHON ENDPOINTS ---

@router.post("/python", response_model=ExecutePythonResponse)
def execute_python(req: ExecutePythonRequest) -> ExecutePythonResponse:
    """Executes Python code in an isolated, sandboxed subprocess with timeout protection."""
    start_time = time.perf_counter()
    stdout, err = python_engine.execute_code(req.code)
    duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
    
    if err:
        return ExecutePythonResponse(
            success=False,
            stdout=stdout,
            error=err,
            execution_time_ms=duration_ms
        )
        
    return ExecutePythonResponse(
        success=True,
        stdout=stdout,
        execution_time_ms=duration_ms
    )

@router.post("/python/check", response_model=CheckAnswerResponse)
def check_python_answer(req: CheckPythonAnswerRequest) -> CheckAnswerResponse:
    """Validates user's Python code against the official lesson test suite/solution."""
    lesson = load_lesson("python_core", req.lesson_id)
    if "exercise" not in lesson:
        raise HTTPException(status_code=400, detail="This lesson does not contain an interactive exercise.")
        
    exercise = lesson["exercise"]
    solution_code = exercise.get("solution", "")
    test_inputs = exercise.get("test_inputs", None)
    
    is_correct, status, details = python_engine.check_answer(req.user_code, solution_code, test_inputs)
    
    return CheckAnswerResponse(
        is_correct=is_correct,
        status=status,
        details=str(details) if details else None
    )

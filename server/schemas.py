from pydantic import BaseModel, Field
from typing import Optional, List, Any, Dict

class ExecuteSQLRequest(BaseModel):
    query: str
    max_rows: Optional[int] = 500

class ExecuteSQLResponse(BaseModel):
    success: bool
    columns: List[str] = []
    rows: List[List[Any]] = []
    row_count: int = 0
    execution_time_ms: float = 0.0
    truncated: bool = False
    error: Optional[str] = None

class CheckSQLAnswerRequest(BaseModel):
    lesson_id: str
    user_query: str

class CheckAnswerResponse(BaseModel):
    is_correct: bool
    status: str
    details: Optional[str] = None

class ExecutePythonRequest(BaseModel):
    code: str

class ExecutePythonResponse(BaseModel):
    success: bool
    stdout: str = ""
    execution_time_ms: float = 0.0
    error: Optional[str] = None

class CheckPythonAnswerRequest(BaseModel):
    lesson_id: str
    user_code: str

class ModuleSummary(BaseModel):
    id: str
    title: Dict[str, str]
    total_lessons: int
    levels: Dict[str, int] = {}

class LessonSummary(BaseModel):
    id: str
    order: int
    level: str
    title: Dict[str, str]
    has_exercise: bool = False
    flashcard_count: int = 0

class InterviewQuestionItem(BaseModel):
    module_id: str
    module_title: Dict[str, str]
    lesson_id: str
    lesson_order: int
    lesson_title: Dict[str, str]
    level: str
    question: Dict[str, str]
    answer: Dict[str, str]
    interviewer_tips: Optional[Dict[str, str]] = None

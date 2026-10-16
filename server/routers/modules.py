from fastapi import APIRouter, HTTPException
from pathlib import Path
import yaml
from typing import List, Dict, Any
from server.schemas import ModuleSummary, LessonSummary

router = APIRouter(prefix="/api/modules", tags=["modules"])

DATA_CONTENT_DIR = Path(__file__).parent.parent.parent / "data" / "content"

MODULE_ORDER = [
    "python_core",
    "sql",
    "spark",
    "kafka",
    "airflow",
    "devops",
    "data_architecture",
    "dbt"
]

MODULE_TITLES = {
    "python_core": {"en": "Python Core", "az": "Python Əsasları"},
    "sql": {"en": "SQL", "az": "SQL"},
    "spark": {"en": "Apache Spark", "az": "Apache Spark"},
    "kafka": {"en": "Apache Kafka", "az": "Apache Kafka"},
    "airflow": {"en": "Apache Airflow", "az": "Apache Airflow"},
    "devops": {"en": "DevOps", "az": "DevOps"},
    "data_architecture": {"en": "Data Architecture & DWH", "az": "Data Arxitekturası və DWH"},
    "dbt": {"en": "dbt (Data Build Tool)", "az": "dbt (Data Build Tool)"}
}

def load_lessons_from_dir(module_id: str) -> List[Dict[str, Any]]:
    m_dir = DATA_CONTENT_DIR / module_id
    if not m_dir.exists():
        return []
    lessons = []
    for f in sorted(m_dir.glob("*.yaml")):
        with open(f, "r", encoding="utf-8") as file:
            data = yaml.safe_load(file)
            if data:
                lessons.append(data)
    lessons.sort(key=lambda x: x.get("order", 999))
    return lessons

@router.get("/", response_model=List[ModuleSummary])
def list_modules() -> List[ModuleSummary]:
    """Returns all 8 modules with total lessons and level breakdowns."""
    summaries = []
    for mod_id in MODULE_ORDER:
        lessons = load_lessons_from_dir(mod_id)
        levels: Dict[str, int] = {}
        for l in lessons:
            lvl = l.get("level", "junior")
            levels[lvl] = levels.get(lvl, 0) + 1
        
        summaries.append(ModuleSummary(
            id=mod_id,
            title=MODULE_TITLES.get(mod_id, {"en": mod_id, "az": mod_id}),
            total_lessons=len(lessons),
            levels=levels
        ))
    return summaries

@router.get("/{module_id}/lessons", response_model=List[LessonSummary])
def get_module_lessons(module_id: str) -> List[LessonSummary]:
    """Returns the list of lessons (summaries) for a specific module."""
    if module_id not in MODULE_TITLES:
        raise HTTPException(status_code=404, detail=f"Module '{module_id}' not found")
    
    lessons = load_lessons_from_dir(module_id)
    summaries = []
    for l in lessons:
        summaries.append(LessonSummary(
            id=l["id"],
            order=l.get("order", 0),
            level=l.get("level", "junior"),
            title=l.get("title", {}),
            has_exercise="exercise" in l,
            flashcard_count=len(l.get("flashcards", []))
        ))
    return summaries

@router.get("/{module_id}/lessons/{lesson_id}")
def get_lesson_detail(module_id: str, lesson_id: str) -> Dict[str, Any]:
    """Returns full lesson payload (theory, code, infographic, interview Q&A, flashcards, exercise)."""
    if module_id not in MODULE_TITLES:
        raise HTTPException(status_code=404, detail=f"Module '{module_id}' not found")
    
    lessons = load_lessons_from_dir(module_id)
    for l in lessons:
        if l["id"] == lesson_id:
            return l
            
    raise HTTPException(status_code=404, detail=f"Lesson '{lesson_id}' not found in module '{module_id}'")

@router.get("/{module_id}/flashcards")
def get_module_master_deck(module_id: str) -> List[Dict[str, Any]]:
    """Returns combined master deck of all flashcards across all lessons in the module."""
    if module_id not in MODULE_TITLES:
        raise HTTPException(status_code=404, detail=f"Module '{module_id}' not found")
    
    lessons = load_lessons_from_dir(module_id)
    cards = []
    for l in lessons:
        l_cards = l.get("flashcards", [])
        for c in l_cards:
            # Attach lesson origin metadata
            card_item = dict(c)
            card_item["lesson_id"] = l["id"]
            card_item["lesson_order"] = l.get("order", 0)
            cards.append(card_item)
    return cards

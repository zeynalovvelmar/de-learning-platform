import json
import yaml
from pathlib import Path

content_dir = Path("data/content")
output_file = Path("frontend/src/data/staticData.json")
output_file.parent.mkdir(parents=True, exist_ok=True)

MODULE_ORDER = [
    "sql",
    "ms_sql",
    "python",
    "data_architecture",
    "devops",
    "spark",
    "airflow",
    "dbt",
    "kafka",
    "modern_lakehouse"
]

MODULE_TITLES = {
    "sql": {"en": "SQL", "az": "SQL"},
    "ms_sql": {"en": "MS SQL Server & T-SQL", "az": "MS SQL Server və T-SQL"},
    "python": {"en": "Python Core", "az": "Python Əsasları"},
    "data_architecture": {"en": "Data Architecture & DWH", "az": "Data Arxitekturası və DWH"},
    "devops": {"en": "DevOps & Docker", "az": "DevOps və Docker"},
    "spark": {"en": "Apache Spark", "az": "Apache Spark"},
    "airflow": {"en": "Apache Airflow", "az": "Apache Airflow"},
    "dbt": {"en": "dbt (Data Build Tool)", "az": "dbt (Data Build Tool)"},
    "kafka": {"en": "Apache Kafka", "az": "Apache Kafka"},
    "modern_lakehouse": {"en": "Modern Lakehouse (Iceberg, Nessie, Trino)", "az": "Modern Lakehouse (Iceberg, Nessie, Trino)"}
}

modules_summary = []
module_lessons = {}
interview_questions = []
all_flashcards = {}
lessons_detail = {}

for mod_id in MODULE_ORDER:
    m_dir = content_dir / mod_id
    if not m_dir.exists():
        continue
    
    lessons = []
    for f in sorted(m_dir.glob("*.yaml")):
        with open(f, "r", encoding="utf-8") as file:
            data = yaml.safe_load(file)
            if data:
                lessons.append(data)
    lessons.sort(key=lambda x: x.get("order", 999))

    # 1. Module Summary
    levels = {}
    for l in lessons:
        lvl = l.get("level", "junior")
        levels[lvl] = levels.get(lvl, 0) + 1
    
    modules_summary.append({
        "id": mod_id,
        "title": MODULE_TITLES.get(mod_id, {"en": mod_id, "az": mod_id}),
        "total_lessons": len(lessons),
        "levels": levels
    })

    # 2. Module Lessons
    summaries = []
    for l in lessons:
        les_id = l["id"]
        summaries.append({
            "id": les_id,
            "order": l.get("order", 0),
            "level": l.get("level", "junior"),
            "title": l.get("title", {}),
            "has_exercise": "exercise" in l,
            "flashcard_count": len(l.get("flashcards", []))
        })
        # 3. Lesson Detail
        lessons_detail[f"{mod_id}/{les_id}"] = l

        # 4. Interview questions
        iq = l.get("interview_question")
        if iq and "question" in iq and "answer" in iq:
            interview_questions.append({
                "module_id": mod_id,
                "module_title": MODULE_TITLES.get(mod_id, {"en": mod_id, "az": mod_id}),
                "lesson_id": les_id,
                "lesson_order": l.get("order", 0),
                "lesson_title": l.get("title", {}),
                "level": l.get("level", "junior"),
                "question": iq["question"],
                "answer": iq["answer"],
                "interviewer_tips": iq.get("interviewer_tips")
            })

    module_lessons[mod_id] = summaries

    # 5. Flashcards
    cards = []
    for l in lessons:
        for c in l.get("flashcards", []):
            card_item = dict(c)
            card_item["lesson_id"] = l["id"]
            card_item["lesson_order"] = l.get("order", 0)
            cards.append(card_item)
    all_flashcards[mod_id] = cards

bundle = {
    "modules": modules_summary,
    "moduleLessons": module_lessons,
    "interviewQuestions": interview_questions,
    "flashcards": all_flashcards,
    "lessons": lessons_detail
}

with open(output_file, "w", encoding="utf-8") as out:
    json.dump(bundle, out, ensure_ascii=False)

print("Static bundle written successfully!")
print(f"Modules: {len(modules_summary)}")
print(f"Total Lessons: {len(lessons_detail)}")
print(f"Interview Questions: {len(interview_questions)}")
print(f"File size: {output_file.stat().st_size / 1024:.2f} KB")

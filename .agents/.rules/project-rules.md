# Project Rules

- This is a bilingual (AZ/EN) Data Engineering learning and interview-preparation platform targeted at **Intern and Junior Data Engineer** candidates (progressing toward Middle level).
- **Architecture**:
  - **Primary Frontend**: Next.js 16 + React 19 + Tailwind CSS (`frontend/`).
  - **Static Data Pipeline**: All lesson content lives in `data/content/<module>/*.yaml`. Running `python export_static.py` compiles the YAML files into `frontend/src/data/staticData.json` for zero-latency loading.
  - **Interactive Diagrams**: All 87 lessons have curated, bilingual React/SVG architecture infographics in `frontend/src/components/viz/registry.tsx` and `frontend/src/components/viz/*.tsx`.
  - **Backend API & Sandboxes**: FastAPI (`server/main.py`) provides live SQL (SQLite) and Python execution sandboxes (`/api/execute/sql`, `/api/execute/python`) and API endpoints.
- **Language & Terminology Rules (`data/glossary_az.yaml`)**:
  - Follow `data/glossary_az.yaml` strictly.
  - Do **not** translate technical terms into unnatural or meaning-distorting Azerbaijani phrases. Terms in `keep_english` (`pipeline`, `production`, `Star schema`, `Snowflake schema`, `Slowly Changing Dimensions (SCD)`, `Lazy Evaluation`, `Data Skew`, `Window Functions`, `Dynamic Task Mapping`, `Delivery Semantics`, `Bucketing`, `Executor`, `Worker`, `Docker image`, `layer`, etc.) must remain in English (with a brief parenthetical explanation on first mention if helpful).
  - Never use expressions listed in `forbidden_literal_translations` (such as `boru kəməri`, `istehsalat`, `qar dənəciyi sxemi`, `tənbəl hesablama`, `məlumat əyriliyi`, `kilitləmək`). Use correct Azerbaijani orthography (`kilidləmək`, `hər şey`, `heç nə`) and hyphenated suffixes according to vowel harmony (`Spark-ın`, `Kafka-nın`, `Airflow-un`, `dbt-nin`, `Docker-in`).
- **Lesson Content Standards**:
  - Every lesson includes: `id`, `order`, `level` (`junior` | `intermediate` | `advanced`), `title`, `explanation`, `quick_recap`, `what_it_does`, `real_world_use`, `common_mistakes`, `code`, `interview_question` (`question`, `answer`, `interviewer_tips`), and `flashcards` (5 cards).
  - Technical claims must match official documentation. Avoid unverified benchmark multipliers; if giving an order-of-magnitude example, mark it clearly as an illustrative estimate.
- **Workflow & Safety**:
  - Only do what the current approved step asks. Do not create extra unrequested modules or files.
  - Never change lesson `id` values (they are used in URLs, `localStorage` progress tracking, and `registry.tsx` keys); adjust `order` when reordering lessons.
  - Never commit secrets.

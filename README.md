# Data Engineering Learning & Interview Preparation Platform (`DataEng.AZ`)

Bilingual (**AZ / EN**) interactive learning platform designed to prepare candidates for **Intern and Junior Data Engineer** positions.

## Overview

- **8 Core Modules (87 Lessons)**:
  1. **SQL** (10 lessons + interactive SQL sandbox exercises)
  2. **Python Core** (11 lessons + interactive Python sandbox exercises)
  3. **Data Architecture & DWH** (12 lessons)
  4. **DevOps & Containers** (12 lessons)
  5. **Apache Spark** (12 lessons)
  6. **Apache Airflow** (12 lessons)
  7. **dbt (Data Build Tool)** (6 lessons)
  8. **Apache Kafka** (12 lessons)
- **87 Interactive SVG Architecture Diagrams**: Curated bilingual schematics in `frontend/src/components/viz/`.
- **Technical Interview Hub**: 87 interview questions with detailed answers, active-recall mode, and interviewer tips.
- **435 Bilingual Flashcards**: 5 flashcards per lesson for rapid revision.

---

## Project Structure

```text
├── data/
│   ├── content/          # 87 bilingual YAML lesson files across 8 modules
│   ├── glossary_az.yaml  # Azerbaijani terminology & orthography standard
│   └── i18n.yaml         # Shared UI translations
├── export_static.py      # Compiles YAML lessons into frontend/src/data/staticData.json
├── frontend/             # Next.js 16 (React 19, Tailwind CSS v4) web application
│   └── src/
│       ├── app/          # Next.js App Router pages
│       ├── components/   # Reader UI, HomeHub, InterviewHub, Sandboxes, Viz diagrams
│       └── data/         # Precompiled staticData.json bundle
├── server/               # FastAPI backend for live SQL & Python code execution
├── modules/              # Lesson loaders & SQL/Python sandbox execution engines
└── tests/                # Content schema, sandbox engine, and API unit tests
```

---

## Local Development

### 1. Python Environment & Backend API

```bash
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
```

Whenever you edit lesson files in `data/content/*/*.yaml`, regenerate the static frontend bundle:

```bash
python export_static.py
```

To start the FastAPI backend (required for interactive SQL and Python sandbox execution on port `8000`):

```bash
uvicorn server.main:app --reload --host 127.0.0.1 --port 8000
```

### 2. Next.js Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## Running Tests

Run the unit test suite (content validation, SQL/Python sandbox engines, and FastAPI endpoints):

```bash
venv\Scripts\python.exe -m unittest tests/test_airflow_content.py tests/test_data_architecture_content.py tests/test_dbt_content.py tests/test_devops_content.py tests/test_kafka_content.py tests/test_spark_content.py tests/test_python_engine.py tests/test_sql_engine.py tests/test_api.py
```

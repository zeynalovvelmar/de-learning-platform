# 📘 Data Engineering Fərdi Tədris Platforması — Yekun Master Plan

> **Fəlsəfə və Məqsəd**: Bu platforma yalnız fərdi istifadə üçün nəzərdə tutulub. Məqsəd lazımsız oyun elementləri (XP, streak, nişanlar) deyil, **nəzəriyyəni göz yorulmadan, dərindən və rahat oxumaq**, **ayrıca peşəkar giriş səhifəsi ilə platformanı idarə etmək** və **yüksək keyfiyyətli peşəkar arxitektura diaqramları ilə mövzunu vizual olaraq dərhal anlamaqdır**.

---

## 🧭 Planın İcmalı & Status

| Mərhələ | Status | Əsas Hədəf |
|---|:---:|---|
| **Mərhələ 1: Peşəkar Giriş Səhifəsi (Overview Hub & Landing)** | ✅ **TAMAMLANDI** | Sayt açıldıqda birbaşa dərslərə deyil, möhtəşəm bir İcmal Hub səhifəsinə daxil olur: 8 modulun vizual xəritəsi, Data Pipeline axını, statistika və "Son dərsi davam et" seçimi. |
| **Mərhələ 2: Minimalist Header & 3-Sütunlu Qlobal Shell** | ✅ **TAMAMLANDI** | Yuxarı paneldən XP/streak/oyun elementləri çıxarıldı; Stripe/Geist standartında loqo, dil və tema seçimi, sol naviqasiyada sakit monoxrom iyerarxiya quruldu. |
| **Mərhələ 3: Oxu Zonasının 0-dan Yenidən Qurulması (Reader UI)** | ✅ **TAMAMLANDI** | 65-75 simvol optimal oxu eni ($700\text{px}$), $1.75$ sətir hündürlüyü, sakit monoxrom/slate palitra, sağ tərəfdə dinamik "Bu səhifədə" (TOC) menyusu və şəxsi dərs konspekti (Notes) sahəsi. |
| **Mərhələ 4: Diaqramların ByteByteGo Üslubuna Keçirilməsi** | ✅ **TAMAMLANDI** | Oyuncaq CSS qutucuqları ləğv edildi; SQL Joins, Lakehouse Medallion, Docker vs VM, Spark Shuffle, Kafka Partition Logs və dbt Lineage peşəkar, yüksək keyfiyyətli vektor/interaktiv sxemlərlə əvəzləndi. |
| **Mərhələ 5: Google Stitch UI İnteqrasiyası** | ✅ **TAMAMLANDI** | Google Stitch "Obsidian Protocol" dizayn sistemi (`#121318` fon, `#1e1f25` kartlar, 3-sütunlu oxucu, yeni Navbar/Sidebar/HomeHub) tam tətbiq edildi. |
| **Mərhələ 6: Bütün 87 Dərsin Arxitektura Sxemlərinin Yenilənməsi** | ✅ **TAMAMLANDI (87/87 Dərs — 100%)** | Köhnə qarışıq ASCII terminal qutularının ləğvi və bütün 87 dərsin peşəkar React/SVG vizual arxitektura komponentlərinə keçirilməsi. |

---

## 🛠️ Mərhələ 6: Bütün 87 Dərsin Arxitektura Sxemlərinin Yenilənməsi Planı (Addım-Addım)

Köhnə sistemdə 87 dərsin yalnız 25-də vizual komponent var idi, qalan **62 dərsdə** isə qarışıq monospace ASCII mətni (`AsciiDiagram.tsx`) açılırdı. Bütün dərsləri 100% peşəkar vizual sxemlərə keçirmək üçün 6 addımlı plan tam icra olundu:

### Addım 6.1: `Data Architecture & DWH` (12/12) + `dbt` (6/6) Modulları [✅ TAMAMLANDI]
- [x] **Data Skipping (`DataSkippingViz.tsx`)**: Partisiya qovluq kəsimi (Partition Pruning), Bucketing (`hash(user_id) % 4`) və 2D Morton Z-Order əyrisini göstərən interaktiv 3-tablı vizual komponent yaradıldı.
- [x] `data_architecture:04-dimensional-modeling-kimball` ➔ Kimball 4 Addımlı Modelləşdirmə sxemi.
- [x] `data_architecture:05-fact-and-dimension-tables` ➔ Fact vs Dimension və Additive/Semi-Additive müqayisə sxemi.
- [x] `data_architecture:07-slowly-changing-dimensions-scd` ➔ SCD Type 1 (Overwrite) vs SCD Type 2 (Tarixçə saxlayan sətir) sxemi.
- [x] `data_architecture:09-open-table-formats-delta-iceberg` ➔ Parquet + `_delta_log`/Iceberg Metadata ➔ ACID & Time Travel sxemi.
- [x] `data_architecture:12-data-quality-lineage-governance` ➔ Unity Catalog / Data Governance Hub-and-Spoke sxemi.
- [x] `dbt` modulunun bütün 6 dərsi (`source/ref DAG`, `View/Table/Incremental`, `dbt snapshot SCD2`, `Staging/Intermediate/Marts`) tam vizual sxemlərə keçirildi.
- [x] `LessonView.tsx`-dən köhnə `"ASCII Sxeminə Bax"` düyməsi yığışdırıldı.

### Addım 6.2: `Apache Kafka` (12/12) & `Apache Airflow` (12/12) Modulları [✅ TAMAMLANDI]
- [x] **Airflow Budaqlanma & Trigger Rules (`BranchingViz.tsx`)**: `@task.branch` iş günü vs həftəsonu budaqlanması və `all_success` vs `none_failed_min_one_success` tələsini interaktiv göstərən DAG simulyatoru.
- [x] **Kafka Log Retention vs Compaction (`LogCompactionViz.tsx`)**: Standart seqment silinməsi (`delete`) vs Açar üzrə son vəziyyətin saxlanması (`compact`) və `Tombstone` vizualı.
- [x] Kafka-nın digər dərsləri (`KRaft`, `Offsets`, `Producer ACKs & Idempotence`, `Rebalance`, `Exactly-Once EOS`, `Consumer Lag`).
- [x] Airflow-un digər dərsləri (`TaskFlow API`, `XComs`, `Logical Date & Data Interval`, `Catchup & Backfill`, `Sensors & Reschedule mode`, `Executors`, `Dynamic Task Mapping .expand()`, `SLA & Callbacks`).

### Addım 6.3: `Apache Spark` Modulu (12/12) [✅ TAMAMLANDI]
- [x] **Window Functions (`WindowFunctionViz.tsx`)**: `PARTITION BY dept ORDER BY salary DESC` üzrə sürüşən pəncərə və `row_number`, `rank`, `dense_rank`, `lag` hesablamasını vizual göstərən komponent (`spark:08` və `sql:08`).
- [x] Spark-ın digər dərsləri (`In-Memory vs Disk MapReduce`, `DataFrame Transformations`, `Repartition vs Coalesce`, `Cache/Persist & OOM`, `Data Skew & Key Salting`, `Parquet & Predicate Pushdown`, `Catalyst Optimizer & Explain Plan`).

### Addım 6.4: `DevOps` Modulu (12/12) [✅ TAMAMLANDI]
- [x] DevOps-un çatışmayan 8 dərsi (`Linux Pipes & Cron`, `Git Branching & Rebase`, `Docker CLI Lifecycle`, `Multi-Stage Builds & Layer Caching`, `Volumes vs Bind Mounts`, `Docker DNS Networking`, `Secrets & Env Security`, `Kubernetes Pods & Prometheus/Grafana`) tam vizual sxemlərə keçirildi.

### Addım 6.5: `SQL` (10/10) & `Python` (11/11) Modulları [✅ TAMAMLANDI]
- [x] SQL-in çatışmayan dərsləri (`SELECT/WHERE Execution Order`, `ORDER BY/LIMIT`, `PK/FK & 1NF-3NF Normalization`, `GROUP BY & HAVING Filter`, `String/Date Cleansing`, `CASE/COALESCE/NULLIF`, `CTE vs Subquery`, `UNION/INTERSECT/EXCEPT`) tam vizual sxemlərə keçirildi.
- [x] Python-un çatışmayan 10 dərsi (`Memory References & Types`, `String Cleansing`, `List Slicing`, `Dict Hash Table & JSON`, `Set O(1) Lookup vs Tuple`, `Control Flow`, `Zip/Enumerate Iteration`, `Functions & Mutable Default Trap`, `Comprehensions`, `Try/Except & Dead-Letter Queue`) tam vizual sxemlərə keçirildi.

### Addım 6.6: Köhnə `AsciiDiagram.tsx`-in Tam Silinməsi və Yekun Vizual Audit [✅ TAMAMLANDI]
- [x] Bütün 87/87 dərsin vizual komponentlərlə təmin olunduğu (`Missing from registry: []`) təsdiqləndi və köhnə `AsciiDiagram.tsx` faylı kod bazasından tamamilə silindi.


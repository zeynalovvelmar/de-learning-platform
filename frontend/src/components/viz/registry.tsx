import React from 'react';
import { FlowDiagram, type FlowSpec } from './FlowDiagram';
import { HubSpokeDiagram, type HubSpec } from './HubSpokeDiagram';
import { ColumnarScanViz } from './ColumnarScanViz';
import { JoinVenn } from './JoinVenn';
import { PartitionLogViz } from './PartitionLogViz';
import { ShuffleViz } from './ShuffleViz';
import { MedallionViz } from './MedallionViz';
import { ContainerVsVmViz } from './ContainerVsVmViz';
import { L } from './shared';

/**
 * Curated, animated infographics keyed by "<moduleId>:<lessonId>".
 * Every other lesson falls back to the polished ASCII renderer.
 */

/* ============================== DATA ARCHITECTURE ============================== */

const dwhWhy: FlowSpec = {
  title: L('Data Warehouse: bütün mənbələr → tək həqiqət mənbəyi', 'Data Warehouse: many sources → one source of truth'),
  badge: 'DWH',
  footer: L(
    'DWH müxtəlif əməliyyat sistemlərindən datanı toplayır, təmizləyir və analitika üçün vahid modelə gətirir.',
    'A warehouse collects data from many operational systems, cleans it and models it for analytics.',
  ),
  rows: [
    {
      stages: [
        {
          title: L('Mənbələr', 'Sources'),
          nodes: [
            { label: 'CRM', sub: L('müştərilər', 'customers'), icon: 'users', tone: 'blue' },
            { label: 'ERP', sub: L('maliyyə, stok', 'finance, stock'), icon: 'factory', tone: 'blue' },
            { label: L('Veb loqlar', 'Web logs'), sub: L('klik hadisələri', 'click events'), icon: 'globe', tone: 'blue' },
          ],
        },
        {
          title: 'ETL / ELT',
          arrowLabel: 'batch',
          nodes: [{ label: L('Təmizlə & Birləşdir', 'Clean & Integrate'), sub: 'Extract · Transform · Load', icon: 'hammer', tone: 'amber' }],
        },
        {
          title: 'Data Warehouse',
          nodes: [{ label: 'DWH', sub: L('tək həqiqət mənbəyi', 'single source of truth'), icon: 'db', tone: 'indigo', badge: 'SQL' }],
        },
        {
          title: L('İstifadəçilər', 'Consumers'),
          nodes: [
            { label: 'BI Dashboard', icon: 'chart', tone: 'emerald' },
            { label: L('ML modelləri', 'ML models'), icon: 'cpu', tone: 'emerald' },
            { label: L('Hesabatlar', 'Reports'), icon: 'file', tone: 'emerald' },
          ],
        },
      ],
    },
  ],
};

const evolution: FlowSpec = {
  title: L('Təkamül: Warehouse → Lake → Lakehouse', 'Evolution: Warehouse → Lake → Lakehouse'),
  badge: L('3 nəsil', '3 eras'),
  footer: L(
    'Lakehouse, Lake-in ucuz açıq saxlancını Warehouse-un ACID və SQL imkanları ilə birləşdirir.',
    'The lakehouse combines the lake’s cheap open storage with the warehouse’s ACID guarantees and SQL.',
  ),
  rows: [
    {
      label: L('Data Warehouse · 1990-cı illər', 'Data Warehouse · 1990s'),
      tone: 'blue',
      stages: [
        { nodes: [{ label: L('Strukturlu mənbələr', 'Structured sources'), icon: 'db', tone: 'blue' }] },
        { nodes: [{ label: 'ETL', sub: L('əvvəlcə transform', 'transform first'), icon: 'hammer', tone: 'blue' }] },
        { nodes: [{ label: 'DWH', sub: L('bahalı, sxem sərt', 'pricey, rigid schema'), icon: 'server', tone: 'blue' }] },
        { nodes: [{ label: 'BI', icon: 'chart', tone: 'blue' }] },
      ],
    },
    {
      label: L('Data Lake · 2010-cu illər', 'Data Lake · 2010s'),
      tone: 'amber',
      stages: [
        { nodes: [{ label: L('İstənilən data', 'Any data'), sub: 'JSON · logs · images', icon: 'shapes', tone: 'amber' }] },
        { nodes: [{ label: L('Xam fayllar', 'Raw files'), sub: 'S3 / HDFS', icon: 'archive', tone: 'amber' }] },
        { nodes: [{ label: 'Spark / Hive', sub: 'schema-on-read', icon: 'zap', tone: 'amber' }] },
        { nodes: [{ label: 'ML + BI', sub: L('keyfiyyət problemi', 'quality issues'), icon: 'bug', tone: 'amber' }] },
      ],
    },
    {
      label: L('Lakehouse · 2020-ci illər', 'Lakehouse · 2020s'),
      tone: 'emerald',
      stages: [
        { nodes: [{ label: L('Batch + Stream', 'Batch + Stream'), icon: 'waypoints', tone: 'emerald' }] },
        { nodes: [{ label: 'Delta / Iceberg', sub: L('ucuz saxlanc + ACID', 'cheap storage + ACID'), icon: 'layers3', tone: 'emerald', badge: 'ACID' }] },
        { nodes: [{ label: L('Vahid mühərrik', 'Unified engine'), sub: 'SQL · Spark · ML', icon: 'zap', tone: 'emerald' }] },
        { nodes: [{ label: 'BI · ML · Streaming', icon: 'rocket', tone: 'emerald' }] },
      ],
    },
  ],
};

const starSchema: HubSpec = {
  title: L('Ulduz Sxemi (Star Schema)', 'Star Schema'),
  subtitle: L('Mərkəzdə Fact, ətrafda Dimension-lar', 'Fact in the centre, dimensions around it'),
  badge: 'Kimball',
  footer: L(
    'Fact cədvəli ölçüləri (məbləğ, say) saxlayır; Dimension-lar “kim, nə, harada, nə vaxt” kontekstini verir.',
    'The fact table stores measures (amount, quantity); dimensions give the who / what / where / when context.',
  ),
  center: { label: 'fact_sales', sub: L('ölçülər: amount, qty', 'measures: amount, qty'), icon: 'table', tone: 'indigo' },
  spokes: [
    { label: 'dim_customer', sub: L('kim?', 'who?'), icon: 'users', tone: 'blue', direction: 'in' },
    { label: 'dim_product', sub: L('nə?', 'what?'), icon: 'package', tone: 'emerald', direction: 'in' },
    { label: 'dim_date', sub: L('nə vaxt?', 'when?'), icon: 'calendar', tone: 'amber', direction: 'in' },
    { label: 'dim_store', sub: L('harada?', 'where?'), icon: 'globe', tone: 'violet', direction: 'in' },
    { label: 'dim_promotion', sub: L('niyə?', 'why?'), icon: 'spark', tone: 'rose', direction: 'in' },
  ],
};

const medallion: FlowSpec = {
  title: L('Medallion Arxitekturası: Bronze → Silver → Gold', 'Medallion architecture: Bronze → Silver → Gold'),
  badge: 'Lakehouse',
  footer: L(
    'Hər təbəqə datanın keyfiyyətini artırır. Xam data Bronze-da toxunulmaz qalır, ona görə həmişə yenidən emal etmək olar.',
    'Each layer raises data quality. Raw data stays untouched in Bronze, so you can always reprocess.',
  ),
  rows: [
    {
      stages: [
        {
          title: L('Mənbələr', 'Sources'),
          nodes: [
            { label: 'Kafka / CDC', icon: 'radio', tone: 'slate' },
            { label: 'REST APIs', icon: 'webhook', tone: 'slate' },
            { label: L('Log faylları', 'Log files'), icon: 'file', tone: 'slate' },
          ],
        },
        {
          title: 'Bronze',
          arrowLabel: 'ingest',
          nodes: [{ label: L('Xam data', 'Raw data'), sub: L('append-only · toxunulmaz', 'append-only · untouched'), icon: 'archive', tone: 'orange', badge: 'RAW' }],
        },
        {
          title: 'Silver',
          arrowLabel: L('təmizlə', 'clean'),
          nodes: [{ label: L('Təmizlənmiş', 'Cleansed'), sub: L('dedupe · tip · NULL', 'dedupe · types · NULLs'), icon: 'filter', tone: 'slate', badge: 'CLEAN' }],
        },
        {
          title: 'Gold',
          arrowLabel: L('aqreqasiya', 'aggregate'),
          nodes: [{ label: L('Biznes-hazır', 'Business-ready'), sub: 'KPI · star schema', icon: 'trophy', tone: 'amber', badge: 'KPI' }],
        },
        {
          title: L('İstifadə', 'Serve'),
          arrowLabel: 'serve',
          nodes: [
            { label: 'BI', icon: 'chart', tone: 'emerald' },
            { label: 'ML', icon: 'cpu', tone: 'emerald' },
          ],
        },
      ],
    },
  ],
};

const etlVsElt: FlowSpec = {
  title: L('ETL vs ELT', 'ETL vs ELT'),
  badge: L('Fərq', 'Compare'),
  footer: L(
    'ELT-də xam data əvvəlcə yüklənir, transform isə bulud anbarının gücü ilə SQL/dbt vasitəsilə orada aparılır.',
    'With ELT, raw data is loaded first and transformed inside the warehouse using SQL/dbt and its scalable compute.',
  ),
  rows: [
    {
      label: L('ETL — klassik', 'ETL — classic'),
      tone: 'amber',
      stages: [
        { nodes: [{ label: L('Mənbələr', 'Sources'), icon: 'db', tone: 'amber' }] },
        { arrowLabel: 'Extract', nodes: [{ label: L('Transform serveri', 'Transform server'), sub: L('anbardan kənarda', 'outside the warehouse'), icon: 'hammer', tone: 'amber' }] },
        { arrowLabel: 'Load', nodes: [{ label: 'Warehouse', sub: L('yalnız təmiz data', 'clean data only'), icon: 'server', tone: 'amber' }] },
      ],
    },
    {
      label: L('ELT — müasir', 'ELT — modern'),
      tone: 'emerald',
      stages: [
        { nodes: [{ label: L('Mənbələr', 'Sources'), icon: 'db', tone: 'emerald' }] },
        { arrowLabel: 'Extract + Load', nodes: [{ label: L('Xam təbəqə', 'Raw layer'), sub: L('Lakehouse / Warehouse', 'Lakehouse / Warehouse'), icon: 'archive', tone: 'emerald' }] },
        { arrowLabel: 'Transform (dbt)', nodes: [{ label: L('Anbar daxilində', 'Inside the warehouse'), sub: 'SQL · dbt', icon: 'dbzap', tone: 'emerald', badge: 'dbt' }] },
        { arrowLabel: 'marts', nodes: [{ label: 'BI / ML', icon: 'chart', tone: 'emerald' }] },
      ],
    },
  ],
};

/* ==================================== KAFKA ==================================== */

const kafkaWhat: FlowSpec = {
  title: L('Kafka: paylanmış event log', 'Kafka: a distributed event log'),
  badge: 'Kafka',
  footer: L(
    'Producer-lər yazır, Consumer-lər müstəqil oxuyur. Broker mesajı silmir — retention bitənə qədər saxlayır.',
    'Producers write, consumers read independently. The broker does not delete on read — it retains until retention expires.',
  ),
  rows: [
    {
      stages: [
        {
          title: 'Producers',
          nodes: [
            { label: 'Web App', icon: 'globe', tone: 'blue' },
            { label: 'IoT Sensors', icon: 'activity', tone: 'blue' },
            { label: 'DB CDC', icon: 'db', tone: 'blue' },
          ],
        },
        {
          title: 'Kafka Cluster',
          arrowLabel: 'publish',
          nodes: [{ label: 'topic: orders', sub: 'P0 · P1 · P2 · replicated', icon: 'radio', tone: 'violet', badge: 'LOG' }],
        },
        {
          title: 'Consumers',
          arrowLabel: 'subscribe',
          nodes: [
            { label: 'Analytics', sub: 'group: bi', icon: 'chart', tone: 'emerald' },
            { label: 'ML Scoring', sub: 'group: ml', icon: 'cpu', tone: 'emerald' },
            { label: 'Search Index', sub: 'group: search', icon: 'search', tone: 'emerald' },
          ],
        },
      ],
    },
  ],
};

const kafkaReplication: HubSpec = {
  title: L('Replikasiya: Leader və ISR', 'Replication: leader & ISR'),
  badge: 'HA',
  footer: L(
    'Yazma və oxuma Leader üzərindən gedir; ISR (in-sync replicas) Leader-lə ayaqlaşan follower-lərdir. Leader düşsə, ISR-dən yenisi seçilir.',
    'Reads and writes go through the leader; the ISR are followers that keep up. If the leader dies, a new one is elected from the ISR.',
  ),
  center: { label: 'Leader · Broker 1', sub: L('partition P0', 'partition P0'), icon: 'server', tone: 'violet' },
  spokes: [
    { label: 'Producer', sub: 'acks=all', icon: 'send', tone: 'blue', direction: 'in' },
    { label: 'Follower · Broker 2', sub: 'ISR ✓', icon: 'server', tone: 'emerald', direction: 'out' },
    { label: 'Consumer', icon: 'inbox', tone: 'amber', direction: 'out' },
    { label: 'Follower · Broker 3', sub: 'ISR ✓', icon: 'server', tone: 'emerald', direction: 'out' },
  ],
};

const kafkaGroups: FlowSpec = {
  title: L('Consumer Group: partition-lar necə bölünür', 'Consumer groups: how partitions are shared'),
  badge: 'Groups',
  footer: L(
    'Bir partition qrupda eyni anda yalnız bir consumer-ə aiddir. Fərqli qruplar isə eyni datanı müstəqil oxuyur.',
    'Within a group a partition belongs to one consumer at a time. Different groups read the same data independently.',
  ),
  rows: [
    {
      label: L('Qrup: analytics (2 consumer)', 'Group: analytics (2 consumers)'),
      tone: 'emerald',
      stages: [
        {
          nodes: [
            { label: 'P0', icon: 'radio', tone: 'violet' },
            { label: 'P1', icon: 'radio', tone: 'violet' },
            { label: 'P2', icon: 'radio', tone: 'violet' },
          ],
        },
        {
          arrowLabel: 'assign',
          nodes: [
            { label: 'Consumer 1', sub: 'P0 + P1', icon: 'inbox', tone: 'emerald' },
            { label: 'Consumer 2', sub: 'P2', icon: 'inbox', tone: 'emerald' },
          ],
        },
      ],
    },
    {
      label: L('Qrup: ml-scoring (1 consumer)', 'Group: ml-scoring (1 consumer)'),
      tone: 'amber',
      stages: [
        {
          nodes: [
            { label: 'P0', icon: 'radio', tone: 'violet' },
            { label: 'P1', icon: 'radio', tone: 'violet' },
            { label: 'P2', icon: 'radio', tone: 'violet' },
          ],
        },
        {
          arrowLabel: 'assign',
          nodes: [{ label: 'Consumer 1', sub: 'P0 + P1 + P2', icon: 'inbox', tone: 'amber' }],
        },
      ],
    },
  ],
};

/* ==================================== SPARK ==================================== */

const sparkArch: FlowSpec = {
  title: L('Spark Cluster Arxitekturası', 'Spark cluster architecture'),
  badge: 'Spark',
  footer: L(
    'Driver planı qurur, Cluster Manager resurs verir, Executor-lar isə task-ları paralel icra edir.',
    'The driver builds the plan, the cluster manager hands out resources, and executors run tasks in parallel.',
  ),
  rows: [
    {
      stages: [
        { title: 'Driver', nodes: [{ label: 'SparkSession', sub: L('DAG qurur, task planlayır', 'builds the DAG, schedules tasks'), icon: 'cpu', tone: 'orange' }] },
        { title: 'Cluster Manager', arrowLabel: L('resurs istə', 'request'), nodes: [{ label: 'YARN · K8s · Standalone', icon: 'servercog', tone: 'slate' }] },
        {
          title: 'Executors',
          arrowLabel: 'launch',
          nodes: [
            { label: 'Worker 1', sub: 'tasks · cache', icon: 'server', tone: 'amber' },
            { label: 'Worker 2', sub: 'tasks · cache', icon: 'server', tone: 'amber' },
            { label: 'Worker 3', sub: 'tasks · cache', icon: 'server', tone: 'amber' },
          ],
        },
      ],
    },
  ],
};

const sparkDag: FlowSpec = {
  title: L('Lazy Evaluation və DAG', 'Lazy evaluation & the DAG'),
  badge: 'Lazy',
  footer: L(
    'Transformasiyalar yalnız plan yazır. Action (count, show, write) çağırılanda Spark DAG-ı Stage və Task-lara bölüb icra edir.',
    'Transformations only record a plan. When an action (count, show, write) runs, Spark splits the DAG into stages and tasks.',
  ),
  rows: [
    {
      stages: [
        {
          title: L('Transformasiyalar (lazy)', 'Transformations (lazy)'),
          nodes: [
            { label: 'read.parquet()', icon: 'download', tone: 'blue' },
            { label: 'filter()', icon: 'filter', tone: 'blue' },
            { label: 'groupBy().agg()', icon: 'combine', tone: 'blue' },
          ],
        },
        { title: 'Action', arrowLabel: L('trigger', 'trigger'), nodes: [{ label: '.count() / .show()', sub: L('icranı başladır', 'starts execution'), icon: 'play', tone: 'rose', badge: 'ACTION' }] },
        { title: 'DAG Scheduler', nodes: [{ label: 'Stages', sub: L('shuffle sərhədlərində', 'split at shuffles'), icon: 'listtree', tone: 'violet' }] },
        { title: 'Tasks', nodes: [{ label: L('Partition başına task', 'One task per partition'), icon: 'zap', tone: 'amber' }] },
      ],
    },
  ],
};

const sparkJoins: FlowSpec = {
  title: L('Shuffle Join vs Broadcast Join', 'Shuffle join vs broadcast join'),
  badge: 'Join',
  footer: L(
    'Kiçik cədvəli bütün executor-lara göndərmək (broadcast) böyük cədvəlin shuffle-ından qat-qat ucuzdur.',
    'Copying the small table to every executor (broadcast) is far cheaper than shuffling the big one.',
  ),
  rows: [
    {
      label: L('Shuffle Join — böyük ⨝ böyük', 'Shuffle join — large ⨝ large'),
      tone: 'rose',
      stages: [
        { nodes: [{ label: L('Cədvəl A', 'Table A'), sub: L('böyük', 'large'), icon: 'table', tone: 'rose' }, { label: L('Cədvəl B', 'Table B'), sub: L('böyük', 'large'), icon: 'table', tone: 'rose' }] },
        { arrowLabel: 'shuffle by key', nodes: [{ label: L('Hər iki tərəf köçür', 'Both sides move'), sub: L('şəbəkə + disk', 'network + disk'), icon: 'shuffle', tone: 'rose', badge: L('bahalı', 'costly') }] },
        { nodes: [{ label: L('Executor-da join', 'Join on executors'), icon: 'merge', tone: 'rose' }] },
      ],
    },
    {
      label: L('Broadcast Join — böyük ⨝ kiçik', 'Broadcast join — large ⨝ small'),
      tone: 'emerald',
      stages: [
        { nodes: [{ label: L('Böyük cədvəl', 'Large table'), sub: L('yerində qalır', 'stays in place'), icon: 'table', tone: 'emerald' }, { label: L('Kiçik cədvəl', 'Small table'), sub: '< 10 MB', icon: 'table', tone: 'emerald' }] },
        { arrowLabel: 'broadcast', nodes: [{ label: L('Kopya hər executor-da', 'Copy on every executor'), sub: L('shuffle yoxdur', 'no shuffle'), icon: 'share', tone: 'emerald', badge: L('sürətli', 'fast') }] },
        { nodes: [{ label: L('Lokal join', 'Local join'), icon: 'merge', tone: 'emerald' }] },
      ],
    },
  ],
};

/* =================================== AIRFLOW =================================== */

const airflowWhat: FlowSpec = {
  title: L('Airflow: DAG-dan icraya', 'Airflow: from DAG file to execution'),
  badge: 'Airflow',
  footer: L(
    'Scheduler DAG fayllarını oxuyur, vaxtı çatan task-ları Executor-a verir, Worker-lər isə icra edib nəticəni Metadata DB-yə yazır.',
    'The scheduler parses DAG files, hands due tasks to the executor, workers run them and results are written to the metadata DB.',
  ),
  rows: [
    {
      stages: [
        { title: 'DAG', nodes: [{ label: 'my_dag.py', sub: L('Python kodu', 'Python code'), icon: 'filecode', tone: 'blue' }] },
        { title: 'Scheduler', arrowLabel: 'parse', nodes: [{ label: L('Planlayır', 'Schedules'), sub: L('vaxtı çatanı seçir', 'picks due tasks'), icon: 'clock', tone: 'violet' }] },
        { title: 'Executor', arrowLabel: 'queue', nodes: [{ label: 'Queue', sub: 'Local · Celery · K8s', icon: 'layers', tone: 'amber' }] },
        { title: 'Workers', arrowLabel: 'run', nodes: [{ label: L('Task icrası', 'Run tasks'), icon: 'cpu', tone: 'emerald' }] },
        { title: 'Metadata DB + UI', arrowLabel: 'state', nodes: [{ label: L('Status & Log', 'State & Logs'), icon: 'db', tone: 'indigo' }] },
      ],
    },
  ],
};

const airflowArch: HubSpec = {
  title: L('Airflow Komponentləri', 'Airflow components'),
  badge: 'Architecture',
  footer: L(
    'Bütün komponentlər vəziyyəti Metadata DB vasitəsilə paylaşır — Scheduler və Webserver bir-biri ilə birbaşa danışmır.',
    'All components share state through the metadata database — the scheduler and webserver never talk to each other directly.',
  ),
  center: { label: 'Metadata DB', sub: 'PostgreSQL', icon: 'db', tone: 'indigo' },
  spokes: [
    { label: 'Scheduler', sub: L('DAG-ları planlayır', 'schedules DAGs'), icon: 'clock', tone: 'violet', direction: 'both' },
    { label: 'Webserver (UI)', sub: L('izləmə', 'monitoring'), icon: 'eye', tone: 'blue', direction: 'both' },
    { label: 'Workers', sub: L('task icra edir', 'run tasks'), icon: 'cpu', tone: 'emerald', direction: 'both' },
    { label: 'Triggerer', sub: 'deferrable', icon: 'timer', tone: 'amber', direction: 'both' },
    { label: 'DAGs folder', sub: '.py', icon: 'filecode', tone: 'slate', direction: 'in' },
  ],
};

const airflowDeps: FlowSpec = {
  title: L('Task asılılıqları: extract >> transform >> load', 'Task dependencies: extract >> transform >> load'),
  badge: 'DAG',
  footer: L(
    '`>>` operatoru icra ardıcıllığını təyin edir. Paralel task-lar eyni anda işləyir, növbətisi hamısı bitəndə başlayır.',
    'The `>>` operator defines order. Parallel tasks run together; the next task starts once all of them succeed.',
  ),
  rows: [
    {
      stages: [
        { nodes: [{ label: 'extract_api', icon: 'download', tone: 'blue' }] },
        {
          arrowLabel: '>>',
          nodes: [
            { label: 'transform_users', icon: 'hammer', tone: 'violet' },
            { label: 'transform_orders', icon: 'hammer', tone: 'violet' },
          ],
        },
        { arrowLabel: '>>', nodes: [{ label: 'load_dwh', icon: 'db', tone: 'emerald' }] },
        { arrowLabel: '>>', nodes: [{ label: 'notify_slack', icon: 'bell', tone: 'amber' }] },
      ],
    },
  ],
};

/* =================================== DEVOPS =================================== */

const containersVsVm: FlowSpec = {
  title: L('Virtual Maşın vs Container', 'Virtual machine vs container'),
  badge: 'Docker',
  footer: L(
    'Container-lər host OS-in nüvəsini paylaşır — buna görə MB ölçüsündə olur və saniyələrdə açılır. VM-lər isə tam OS daşıyır (GB).',
    'Containers share the host kernel, so they are MBs and start in seconds. VMs each carry a full OS (GBs).',
  ),
  rows: [
    {
      label: L('Virtual Maşınlar', 'Virtual Machines'),
      tone: 'rose',
      stages: [
        { nodes: [{ label: 'Hardware', icon: 'server', tone: 'slate' }] },
        { nodes: [{ label: 'Hypervisor', icon: 'layers', tone: 'rose' }] },
        { nodes: [{ label: 'Guest OS × 3', sub: L('hər biri GB-larla', 'GBs each'), icon: 'disk', tone: 'rose' }] },
        { nodes: [{ label: L('Tətbiqlər', 'Apps'), icon: 'box', tone: 'rose' }] },
      ],
    },
    {
      label: 'Containers',
      tone: 'emerald',
      stages: [
        { nodes: [{ label: 'Hardware', icon: 'server', tone: 'slate' }] },
        { nodes: [{ label: 'Host OS', icon: 'terminal', tone: 'emerald' }] },
        { nodes: [{ label: 'Docker Engine', icon: 'container', tone: 'emerald' }] },
        { nodes: [{ label: L('Container × 3', 'Container × 3'), sub: L('MB-larla, saniyələrdə', 'MBs, seconds'), icon: 'boxes', tone: 'emerald', badge: L('yüngül', 'light') }] },
      ],
    },
  ],
};

const dockerBuild: FlowSpec = {
  title: L('Dockerfile → Image → Container', 'Dockerfile → Image → Container'),
  badge: 'Docker',
  footer: L(
    'Hər Dockerfile sətri bir Layer yaradır. Dəyişməyən layer-lər keşdən götürülür, ona görə build sürətlənir.',
    'Each Dockerfile line creates a layer. Unchanged layers come from cache, which makes rebuilds fast.',
  ),
  rows: [
    {
      stages: [
        { title: 'Dockerfile', nodes: [{ label: 'FROM · COPY · RUN', icon: 'filecode', tone: 'blue' }] },
        { title: 'docker build', arrowLabel: 'build', nodes: [{ label: 'Image', sub: L('layer-lər, keşlənir', 'cached layers'), icon: 'layers3', tone: 'violet' }] },
        { title: 'Registry', arrowLabel: 'push', nodes: [{ label: 'Docker Hub / ECR', icon: 'cloud', tone: 'amber' }] },
        { title: 'docker run', arrowLabel: 'pull + run', nodes: [{ label: 'Container', sub: L('işləyən proses', 'running process'), icon: 'container', tone: 'emerald' }] },
      ],
    },
  ],
};

const composeStack: HubSpec = {
  title: L('Docker Compose: bütün stack bir əmrlə', 'Docker Compose: the whole stack in one command'),
  badge: 'Compose',
  footer: L(
    'docker compose up bütün servisləri eyni şəbəkədə qaldırır; servislər bir-birini ad ilə tapır (postgres, kafka, ...).',
    'docker compose up starts every service on one network; services find each other by name (postgres, kafka, ...).',
  ),
  center: { label: 'docker compose up', sub: 'docker-compose.yml', icon: 'container', tone: 'blue' },
  spokes: [
    { label: 'PostgreSQL', sub: ':5432', icon: 'db', tone: 'indigo' },
    { label: 'Airflow', sub: ':8080', icon: 'workflow', tone: 'teal' },
    { label: 'Kafka', sub: ':9092', icon: 'radio', tone: 'violet' },
    { label: 'Spark', sub: ':7077', icon: 'zap', tone: 'amber' },
    { label: 'Grafana', sub: ':3000', icon: 'chart', tone: 'orange' },
  ],
};

const cicd: FlowSpec = {
  title: L('CI/CD: PR-dan production-a', 'CI/CD: from pull request to production'),
  badge: 'GitHub Actions',
  footer: L(
    'Bütün yoxlamalar paralel işləyir. Hamısı yaşıl olmadan merge və deploy bloklanır.',
    'All checks run in parallel. Merge and deploy stay blocked until every check is green.',
  ),
  rows: [
    {
      stages: [
        { title: 'Pull Request', nodes: [{ label: L('PR açılır', 'PR opened'), icon: 'pr', tone: 'blue' }] },
        {
          title: 'CI checks',
          arrowLabel: 'trigger',
          nodes: [
            { label: 'Lint', sub: 'flake8 · black', icon: 'search', tone: 'violet' },
            { label: 'Types', sub: 'mypy', icon: 'binary', tone: 'violet' },
            { label: 'Unit tests', sub: 'pytest', icon: 'flask', tone: 'violet' },
            { label: 'Docker build', sub: 'trivy scan', icon: 'container', tone: 'violet' },
          ],
        },
        { title: 'Merge', arrowLabel: L('hamısı ✓', 'all ✓'), nodes: [{ label: 'main', icon: 'branch', tone: 'emerald' }] },
        { title: 'CD', arrowLabel: 'deploy', nodes: [{ label: 'Production', icon: 'rocket', tone: 'amber', badge: 'LIVE' }] },
      ],
    },
  ],
};

/* ==================================== DBT ==================================== */

const dbtLineage: FlowSpec = {
  title: L('dbt: xam datadan Mart-a lineage', 'dbt: lineage from raw to marts'),
  badge: 'dbt',
  footer: L(
    'Hər model bir SELECT-dir; ref() modellər arasında asılılıq qurur və dbt DAG-ı düzgün ardıcıllıqla icra edir.',
    'Every model is a SELECT; ref() wires dependencies and dbt runs the DAG in the right order.',
  ),
  rows: [
    {
      stages: [
        { title: 'Sources', nodes: [{ label: 'raw.orders', sub: 'source()', icon: 'db', tone: 'slate' }, { label: 'raw.users', sub: 'source()', icon: 'db', tone: 'slate' }] },
        { title: 'Staging', arrowLabel: 'ref()', nodes: [{ label: 'stg_orders', sub: L('təmizlə, adlandır', 'clean, rename'), icon: 'filter', tone: 'blue' }, { label: 'stg_users', icon: 'filter', tone: 'blue' }] },
        { title: 'Intermediate', arrowLabel: 'ref()', nodes: [{ label: 'int_orders_joined', icon: 'combine', tone: 'violet' }] },
        { title: 'Marts', arrowLabel: 'ref()', nodes: [{ label: 'fct_orders', icon: 'table', tone: 'emerald' }, { label: 'dim_customers', icon: 'users', tone: 'emerald' }] },
        { title: 'BI', arrowLabel: 'query', nodes: [{ label: 'Dashboard', icon: 'chart', tone: 'amber' }] },
      ],
    },
  ],
};

const dbtTests: FlowSpec = {
  title: L('dbt testləri: data keyfiyyəti qapısı', 'dbt tests: a data quality gate'),
  badge: 'Tests',
  footer: L(
    '`dbt test` hər testi SELECT kimi icra edir; sətir qaytarırsa test uğursuzdur.',
    '`dbt test` runs each test as a SELECT; if it returns any rows, the test fails.',
  ),
  rows: [
    {
      stages: [
        { title: 'Model', nodes: [{ label: 'dim_customers', icon: 'table', tone: 'blue' }] },
        {
          title: 'Tests',
          arrowLabel: 'dbt test',
          nodes: [
            { label: 'unique', icon: 'gem', tone: 'violet' },
            { label: 'not_null', icon: 'shield', tone: 'violet' },
            { label: 'relationships', icon: 'link', tone: 'violet' },
            { label: 'accepted_values', icon: 'check', tone: 'violet' },
          ],
        },
        {
          title: L('Nəticə', 'Result'),
          arrowLabel: 'PASS / FAIL',
          nodes: [
            { label: 'PASS', sub: L('deploy davam edir', 'pipeline continues'), icon: 'ok', tone: 'emerald' },
            { label: 'FAIL', sub: L('xəbərdarlıq + dayan', 'alert + stop'), icon: 'bell', tone: 'rose' },
          ],
        },
      ],
    },
  ],
};

/* =================================== PYTHON =================================== */

const generators: FlowSpec = {
  title: L('List vs Generator: yaddaş istifadəsi', 'List vs generator: memory usage'),
  badge: 'Memory',
  footer: L(
    'Generator `yield` ilə dəyəri bir-bir verir — milyonlarla sətir olsa belə yaddaş sabit qalır.',
    'A generator hands out one value at a time with `yield` — memory stays flat even for millions of rows.',
  ),
  rows: [
    {
      label: L('List — hamısı yaddaşda', 'List — everything in RAM'),
      tone: 'rose',
      stages: [
        { nodes: [{ label: L('1M sətir', '1M rows'), icon: 'file', tone: 'rose' }] },
        { arrowLabel: '[...]', nodes: [{ label: L('Hamısını yüklə', 'Load all'), sub: 'O(n) RAM', icon: 'disk', tone: 'rose', badge: 'MemoryError?' }] },
        { nodes: [{ label: L('Emal et', 'Process'), icon: 'cpu', tone: 'rose' }] },
      ],
    },
    {
      label: L('Generator — bir-bir', 'Generator — one by one'),
      tone: 'emerald',
      stages: [
        { nodes: [{ label: L('1M sətir', '1M rows'), icon: 'file', tone: 'emerald' }] },
        { arrowLabel: 'yield', nodes: [{ label: L('Bir sətir', 'One row'), sub: 'O(1) RAM', icon: 'zap', tone: 'emerald', badge: L('yüngül', 'light') }] },
        { arrowLabel: 'next()', nodes: [{ label: L('Emal et', 'Process'), icon: 'cpu', tone: 'emerald' }] },
      ],
    },
  ],
};

/* ================================== REGISTRY ================================== */

const flow = (spec: FlowSpec) => () => <FlowDiagram spec={spec} />;
const hub = (spec: HubSpec) => () => <HubSpokeDiagram spec={spec} />;

const REGISTRY: Record<string, () => React.ReactNode> = {
  'data_architecture:01-oltp-vs-olap-columnar': () => <ColumnarScanViz />,
  'data_architecture:02-what-is-dwh-why-needed': flow(dwhWhy),
  'data_architecture:03-evolution-dwh-lake-lakehouse': flow(evolution),
  'data_architecture:06-star-vs-snowflake-schema': hub(starSchema),
  'data_architecture:08-medallion-architecture-layers': () => <MedallionViz />,
  'data_architecture:11-etl-vs-elt-evolution': flow(etlVsElt),

  'kafka:01-what-is-kafka': flow(kafkaWhat),
  'kafka:03-topics-partitions-log': () => <PartitionLogViz />,
  'kafka:05-producer-keys-partitioner': () => <PartitionLogViz />,
  'kafka:07-replication-isr-leader': hub(kafkaReplication),
  'kafka:08-consumer-consumer-groups': flow(kafkaGroups),

  'spark:02-architecture-cluster': flow(sparkArch),
  'spark:03-execution-dag-lazy': flow(sparkDag),
  'spark:04-narrow-wide-shuffle': () => <ShuffleViz />,
  'spark:07-joins-broadcast': flow(sparkJoins),

  'airflow:01-what-is-airflow': flow(airflowWhat),
  'airflow:02-architecture-components': hub(airflowArch),
  'airflow:03-operators-tasks-dependencies': flow(airflowDeps),

  'devops:03-containers-docker-vs-vm': () => <ContainerVsVmViz />,
  'devops:05-dockerfile-builds': flow(dockerBuild),
  'devops:09-docker-compose-stack': hub(composeStack),
  'devops:11-cicd-github-actions': flow(cicd),

  'dbt:01-what-is-dbt-elt-philosophy': flow(dbtLineage),
  'dbt:04-testing-and-data-quality': flow(dbtTests),

  'sql:04-joins': () => <JoinVenn />,
  'python:11-generators-memory': flow(generators),
};

export function hasAnimatedInfographic(moduleId: string, lessonId: string): boolean {
  return `${moduleId}:${lessonId}` in REGISTRY;
}

export function AnimatedInfographic({ moduleId, lessonId }: { moduleId: string; lessonId: string }) {
  const render = REGISTRY[`${moduleId}:${lessonId}`];
  return render ? <>{render()}</> : null;
}

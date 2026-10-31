import React from 'react';
import { FlowDiagram, type FlowSpec } from './FlowDiagram';
import { HubSpokeDiagram, type HubSpec } from './HubSpokeDiagram';
import { ColumnarScanViz } from './ColumnarScanViz';
import { JoinVenn } from './JoinVenn';
import { PartitionLogViz } from './PartitionLogViz';
import { ProducerPartitionerViz } from './ProducerPartitionerViz';
import { ShuffleViz } from './ShuffleViz';
import { MedallionViz } from './MedallionViz';
import { ContainerVsVmViz } from './ContainerVsVmViz';
import { DataSkippingViz } from './DataSkippingViz';
import { BranchingViz } from './BranchingViz';
import { LogCompactionViz } from './LogCompactionViz';
import { WindowFunctionViz } from './WindowFunctionViz';
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
  title: L('Star Schema (Ulduz Sxemi)', 'Star Schema'),
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

const kimballFourSteps: FlowSpec = {
  title: L('Kimball-ın 4 Addımlı Dimensional Modeling Prosesi', 'Kimball 4-Step Dimensional Modeling'),
  badge: 'Kimball',
  footer: L(
    'Denormalizasiya (3NF → Star Schema) JOIN sayını azaldır və analitik sorğuları dəfələrlə sürətləndirir.',
    'Denormalizing from 3NF to a Star Schema minimizes JOIN hops and accelerates analytical queries.'
  ),
  rows: [
    {
      stages: [
        { title: 'Addım 1', nodes: [{ label: L('Biznes Prosesi', 'Business Process'), sub: L('məs: pərakəndə satış', 'e.g. retail checkout'), icon: 'factory', tone: 'blue' }] },
        { title: 'Addım 2', arrowLabel: 'grain', nodes: [{ label: L('Grain (Dənəvərlik)', 'Declare Grain'), sub: L('1 sətir = 1 qəbz', '1 row = 1 line item'), icon: 'target', tone: 'amber', badge: 'CRITICAL' }] },
        { title: 'Addım 3', arrowLabel: 'context', nodes: [{ label: L('Dimensions (Ölçülər)', 'Identify Dimensions'), sub: 'who · what · where · when', icon: 'shapes', tone: 'violet' }] },
        { title: 'Addım 4', arrowLabel: 'metrics', nodes: [{ label: L('Facts (Faktlar)', 'Identify Facts'), sub: 'qty · revenue · discount', icon: 'chart', tone: 'emerald' }] },
      ],
    },
  ],
};

const factVsDim: FlowSpec = {
  title: L('Fact Cədvəlləri vs Dimension Cədvəlləri', 'Fact Tables vs Dimension Tables'),
  badge: 'Modeling',
  footer: L(
    'Additive faktlar (satış) hər ölçü üzrə toplanır. Semi-Additive (balans) zaman üzrə toplanmaz (AVG/LAST istifadə edilir).',
    'Additive facts sum across all dimensions. Semi-additive facts (account balance) cannot be summed across time.'
  ),
  rows: [
    {
      label: L('Fact Table — Rəqəmsal Hadisələr (Dar və Uzun)', 'Fact Table — Numeric Measurements (Narrow & Deep)'),
      tone: 'indigo',
      stages: [
        { nodes: [{ label: 'Foreign Keys', sub: 'customer_sk · date_sk', icon: 'link', tone: 'indigo' }] },
        { arrowLabel: '+', nodes: [{ label: 'Additive', sub: 'SUM(revenue), SUM(qty)', icon: 'chart', tone: 'emerald', badge: 'SUM ✓' }] },
        { arrowLabel: '+', nodes: [{ label: 'Semi-Additive', sub: 'balance (zaman üzrə toplanmır)', icon: 'gauge', tone: 'amber', badge: 'NO TIME SUM' }] },
      ],
    },
    {
      label: L('Dimension Table — Təsviri Kontekst (Geniş və Qısa)', 'Dimension Table — Descriptive Context (Wide & Shallow)'),
      tone: 'blue',
      stages: [
        { nodes: [{ label: 'Surrogate Key', sub: 'customer_sk (INT PK)', icon: 'gem', tone: 'blue', badge: 'PK' }] },
        { arrowLabel: 'attributes', nodes: [{ label: L('Zəngin Atributlar', 'Rich Attributes'), sub: 'name · city · segment · tier', icon: 'users', tone: 'blue' }] },
        { arrowLabel: 'role', nodes: [{ label: 'WHERE / GROUP BY', sub: L('filtr və başlıqlar', 'filters & headers'), icon: 'filter', tone: 'violet' }] },
      ],
    },
  ],
};

const scdTypes: FlowSpec = {
  title: L('Slowly Changing Dimensions (SCD): Type 1 vs Type 2', 'Slowly Changing Dimensions: SCD Type 1 vs SCD Type 2'),
  badge: 'SCD',
  footer: L(
    'SCD Type 1 köhnə dəyərin üzərinə yazır (tarixçə itir). SCD Type 2 isə yeni sətir əlavə edib tarixçəni tam qoruyur.',
    'SCD Type 1 overwrites in place (history lost). SCD Type 2 inserts a new versioned row to preserve full history.'
  ),
  rows: [
    {
      label: L('SCD Type 1 — Üzərinə Yazma (Tarixçə Silinir)', 'SCD Type 1 — Overwrite (History Lost)'),
      tone: 'amber',
      stages: [
        { nodes: [{ label: 'Müştəri köçür: Bakı → Gəncə', icon: 'users', tone: 'amber' }] },
        { arrowLabel: 'UPDATE', nodes: [{ label: "city = 'Gəncə'", sub: L('Bakı dəyəri silindi', 'old value overwritten'), icon: 'refresh', tone: 'amber', badge: 'NO HISTORY' }] },
      ],
    },
    {
      label: L('SCD Type 2 — Yeni Sətir və Tarixçə (Qızıl Standart)', 'SCD Type 2 — Versioned Row (Gold Standard)'),
      tone: 'emerald',
      stages: [
        { nodes: [{ label: 'Köhnə Sətir (Bakı)', sub: 'valid_to: 2026-10-18 · is_current: false', icon: 'archive', tone: 'slate' }] },
        { arrowLabel: 'INSERT', nodes: [{ label: 'Yeni Sətir (Gəncə)', sub: 'valid_from: 2026-10-18 · is_current: true', icon: 'ok', tone: 'emerald', badge: 'ACTIVE' }] },
      ],
    },
  ],
};

const openTableFormats: FlowSpec = {
  title: L('Açıq Cədvəl Formatları: Delta Lake & Apache Iceberg', 'Open Table Formats: Delta Lake & Apache Iceberg'),
  badge: 'Lakehouse',
  footer: L(
    'Adi Parquet fayllarının üzərinə JSON/Avro Tranzaksiya Loqu əlavə edərək S3/GCS üzərində ACID, Time Travel və MERGE yaradır.',
    'Adds a transactional metadata layer over Parquet files on object storage, enabling ACID, Time Travel, and MERGE.'
  ),
  rows: [
    {
      stages: [
        {
          title: L('Bulud Saxlanc (S3 / GCS)', 'Object Storage'),
          nodes: [
            { label: 'part-001.parquet', sub: L('dəyişməz data', 'immutable data'), icon: 'file', tone: 'slate' },
            { label: 'part-002.parquet', sub: L('sütunlu fayl', 'columnar file'), icon: 'file', tone: 'slate' },
          ],
        },
        {
          title: L('Metadata & Log Qatı', 'Metadata & Transaction Log'),
          arrowLabel: 'tracks',
          nodes: [
            { label: '_delta_log / Iceberg Manifest', sub: '00001.json · snapshots · min/max stats', icon: 'listtree', tone: 'violet', badge: 'ACID LOG' },
          ],
        },
        {
          title: L('Qazanılan İmkanlar', 'Capabilities Unlocked'),
          arrowLabel: 'enables',
          nodes: [
            { label: 'Time Travel', sub: 'VERSION AS OF 12', icon: 'clock', tone: 'emerald' },
            { label: 'UPSERT / MERGE', sub: 'ACID isolation', icon: 'merge', tone: 'blue' },
            { label: 'Schema Evolution', sub: 'safe column add/rename', icon: 'shield', tone: 'amber' },
          ],
        },
      ],
    },
  ],
};

const dataGovernance: HubSpec = {
  title: L('Data Governance: Keyfiyyət, Lineage və Təhlükəsizlik', 'Data Governance: Quality, Lineage & Security'),
  subtitle: L('Etibarlı, izlənilə bilən və qorunan korporativ data ekosistemi', 'Trusted, traceable, and compliant enterprise data platform'),
  badge: 'Governance',
  footer: L(
    'Data Governance olmadan Data Lake qısa müddətdə "Data Bataqlığına" (Data Swamp) çevrilir.',
    'Without active governance, a Data Lake rapidly degrades into an untrusted Data Swamp.'
  ),
  center: { label: 'Data Catalog & Governance', sub: 'Unity Catalog · DataHub', icon: 'shield', tone: 'indigo' },
  spokes: [
    { label: 'Data Quality', sub: 'freshness · null · schema checks', icon: 'ok', tone: 'emerald', direction: 'both' },
    { label: 'Column Lineage', sub: 'source → staging → BI impact', icon: 'waypoints', tone: 'blue', direction: 'both' },
    { label: 'RBAC & Masking', sub: 'PII encryption · row filter', icon: 'lock', tone: 'rose', direction: 'both' },
    { label: 'Data Contracts', sub: 'SLA · schema ownership', icon: 'filecode', tone: 'amber', direction: 'in' },
  ],
};

const batchVsStreamingCdc: FlowSpec = {
  title: L('Batch vs Real-Time Streaming & Log-Əsaslı CDC (Debezium + Kafka)', 'Batch vs. Real-Time Streaming & Log-Based CDC (Debezium + Kafka)'),
  badge: 'CDC & Streaming',
  footer: L(
    'Polling sorğuları silinən sətirləri (Hard Delete) itirir; Log-əsaslı CDC isə WAL-dan hər bir INSERT/UPDATE/DELETE əməliyyatını bazanı yükləmədən tutub yönləndirir.',
    'Polling queries miss hard deletes and overload OLTP; log-based CDC tails the WAL/binlog to stream full-fidelity mutation events with zero query overhead.'
  ),
  rows: [
    {
      label: L('Anti-Pattern — Periodik SELECT Polling (Hard Delete-ləri İtirir & DB CPU-nu Doldurur)', 'Anti-Pattern — Periodic Polling (Misses Deletes & Overloads DB)'),
      tone: 'rose',
      stages: [
        { nodes: [{ label: 'OLTP Database', sub: 'Postgres / MySQL', icon: 'db', tone: 'rose' }] },
        { arrowLabel: 'WHERE updated_at > t', nodes: [{ label: 'SELECT Polling', sub: L('DELETE itir · Ağır skan', 'Misses hard deletes'), icon: 'flame', tone: 'rose', badge: 'LOST DELETES' }] },
      ],
    },
    {
      label: L('Standart — Log-Əsaslı CDC (Debezium WAL Oxuyur → Kafka → Lakehouse)', 'Gold Standard — Log-Based CDC (Debezium Tails WAL → Kafka → Lakehouse)'),
      tone: 'emerald',
      stages: [
        { nodes: [{ label: 'PostgreSQL WAL', sub: 'fiziki ikili jurnal', icon: 'file', tone: 'blue' }] },
        { arrowLabel: 'tail WAL', nodes: [{ label: 'Debezium CDC', sub: 'op: c / u / d · before & after', icon: 'zap', tone: 'violet', badge: 'ZERO LOAD' }] },
        { arrowLabel: 'stream to', nodes: [{ label: 'Kafka Topic', sub: 'replicated event log', icon: 'radio', tone: 'emerald' }] },
        { arrowLabel: 'MERGE INTO', nodes: [{ label: 'Iceberg / Delta Lake', sub: L('Sub-second real vaxt', 'Sub-second real-time sync'), icon: 'trophy', tone: 'emerald', badge: 'CDC REALTIME ✓' }] },
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

const kafkaKraft: FlowSpec = {
  title: L('Kafka Klaster İdarəetməsi: ZooKeeper vs KRaft', 'Kafka Cluster Consensus: ZooKeeper vs KRaft'),
  badge: 'KRaft',
  footer: L(
    'KRaft xarici ZooKeeper asılılığını ləğv edir; metadata Raft protokolu ilə birbaşa Kafka daxilində saxlanılır və milyonlarla partisiyanı dəstəkləyir.',
    'KRaft removes external ZooKeeper; cluster metadata is replicated via an internal Raft quorum supporting millions of partitions.'
  ),
  rows: [
    {
      label: L('Köhnə (Legacy) — Xarici ZooKeeper Ansamblı', 'Legacy — External ZooKeeper Ensemble'),
      tone: 'rose',
      stages: [
        { nodes: [{ label: 'ZooKeeper × 3', sub: L('ayrı JVM klasteri', 'separate JVM cluster'), icon: 'server', tone: 'rose' }] },
        { arrowLabel: 'RPC bottleneck', nodes: [{ label: 'Kafka Brokers', sub: L('< 200K partisiya limiti', '< 200K partition limit'), icon: 'radio', tone: 'rose', badge: 'DEPRECATED' }] },
      ],
    },
    {
      label: L('Müasir (Kafka 3.3+ / 4.0) — Daxili KRaft Konsensusu', 'Modern (Kafka 3.3+ / 4.0) — Native KRaft Consensus'),
      tone: 'emerald',
      stages: [
        { nodes: [{ label: 'Controller Quorum', sub: '__cluster_metadata topic (Raft)', icon: 'shield', tone: 'emerald', badge: 'KRAFT' }] },
        { arrowLabel: 'instant failover', nodes: [{ label: 'Kafka Brokers', sub: L('Milyonlarla partisiya · ms bərpa', 'Millions of partitions · ms recovery'), icon: 'zap', tone: 'emerald' }] },
      ],
    },
  ],
};

const kafkaOffsetsOrdering: FlowSpec = {
  title: L('Partisiya Daxili Sıralama və __consumer_offsets', 'Partition-Level Ordering & __consumer_offsets'),
  badge: 'Ordering',
  footer: L(
    'Kafka yalnız TƏK partisiya daxilində sıralamanı (FIFO) 100% qarantiyalayır. Eyni müştərinin hadisələri eyni Key ilə eyni partisiyaya göndərilməlidir.',
    'Kafka guarantees strict FIFO ordering ONLY within a single partition. Route related events with the same Key (e.g. customer_id).'
  ),
  rows: [
    {
      stages: [
        { title: 'Event Key', nodes: [{ label: 'key = "user_42"', sub: 'Create → Pay → Ship', icon: 'send', tone: 'blue' }] },
        { title: 'Deterministic Hash', arrowLabel: 'murmur2(key)', nodes: [{ label: 'Partition 0', sub: 'Offset 10 → 11 → 12 (Sıralı ✓)', icon: 'listtree', tone: 'emerald', badge: 'FIFO' }] },
        { title: 'Offset Tracking', arrowLabel: 'commit', nodes: [{ label: '__consumer_offsets', sub: 'current: 12 · committed: 13', icon: 'db', tone: 'violet' }] },
      ],
    },
  ],
};

const kafkaProducerAcks: FlowSpec = {
  title: L('Producer Etibarlılığı: ACKs və İdempotentlik', 'Producer Durability: ACKs & Idempotence'),
  badge: 'Durability',
  footer: L(
    'acks=all + min.insync.replicas=2 + enable.idempotence=true həm məlumat itkisinin, həm də şəbəkə təkrarında dublikatların qarşısını alır.',
    'acks=all + min.insync.replicas=2 + enable.idempotence=true prevents both data loss and retry duplicates.'
  ),
  rows: [
    {
      stages: [
        {
          title: 'ACK Modes',
          nodes: [
            { label: 'acks = 0', sub: L('gözləmir · itki riski yüksək', 'fire & forget · loss risk'), icon: 'flame', tone: 'rose' },
            { label: 'acks = 1', sub: L('yalnız Leader təsdiqi', 'Leader only'), icon: 'server', tone: 'amber' },
            { label: 'acks = all (-1)', sub: L('Leader + bütün ISR təsdiqi', 'Leader + all ISR replicas'), icon: 'shield', tone: 'emerald', badge: 'SAFE' },
          ],
        },
        {
          title: 'Idempotent Producer',
          arrowLabel: 'PID + Seq#',
          nodes: [
            { label: 'enable.idempotence = true', sub: L('Təkrar göndərişdə dublikatı rədd edir', 'Broker deduplicates retries via Seq#'), icon: 'ok', tone: 'violet', badge: 'NO DUPLICATES' },
          ],
        },
      ],
    },
  ],
};

const kafkaRebalanceCommit: FlowSpec = {
  title: L('Rebalance Protokolları: Eager vs Cooperative Sticky', 'Rebalance Protocols: Eager vs Cooperative Sticky'),
  badge: 'Rebalance',
  footer: L(
    'CooperativeStickyAssignor zamanı yalnız köçürülən partisiya dayanır, digər consumer-lər fasiləsiz işləməyə davam edir.',
    'With CooperativeStickyAssignor only reassigned partitions pause; unaffected consumers keep processing.'
  ),
  rows: [
    {
      label: L('Eager Rebalance — Bütün Klaster Dayanır (Stop-the-World)', 'Eager Rebalance — Stop-the-World Pause'),
      tone: 'rose',
      stages: [
        { nodes: [{ label: 'Yeni Consumer qoşulur', icon: 'users', tone: 'rose' }] },
        { arrowLabel: 'revoke ALL', nodes: [{ label: L('Bütün Partisiyalar Alınır', 'All Partitions Revoked'), sub: L('emal tam dayanır', 'zero throughput gap'), icon: 'bug', tone: 'rose', badge: 'PAUSE' }] },
        { arrowLabel: 'reassign', nodes: [{ label: 'Yenidən Paylanır', icon: 'shuffle', tone: 'rose' }] },
      ],
    },
    {
      label: L('Cooperative Sticky — Fasiləsiz Artımlı Rebalance', 'Cooperative Sticky — Incremental Non-Stop Rebalance'),
      tone: 'emerald',
      stages: [
        { nodes: [{ label: 'Yeni Consumer qoşulur', icon: 'users', tone: 'emerald' }] },
        { arrowLabel: 'keep P0, P1', nodes: [{ label: L('Yalnız P2 köçürülür', 'Only P2 Migrates'), sub: L('P0 və P1 dayanmadan işləyir', 'P0 & P1 never stop'), icon: 'zap', tone: 'emerald', badge: 'ZERO DOWNTIME' }] },
      ],
    },
  ],
};

const kafkaDeliverySemantics: FlowSpec = {
  title: L('Delivery Semantics (Çatdırılma Semantikası): At-Most-Once, At-Least-Once, Exactly-Once', 'Delivery Semantics: At-Most, At-Least & Exactly-Once (EOS)'),
  badge: 'EOS',
  footer: L(
    'Maliyyə və ödəniş axınlarında İdempotent Producer + Transactional API + read_committed birlikdə Exactly-Once (EOS) təmin edir.',
    'Financial pipelines combine Idempotent Producer + Transactions + isolation.level=read_committed for Exactly-Once (EOS).'
  ),
  rows: [
    {
      stages: [
        {
          title: 'At-Most-Once (≤ 1)',
          nodes: [{ label: L('Əvvəl Commit → Sonra Emal', 'Commit before Process'), sub: L('Dublikat yoxdur · İtki ola bilər', 'No dupes · Data loss possible'), icon: 'flame', tone: 'rose' }],
        },
        {
          title: 'At-Least-Once (≥ 1)',
          arrowLabel: 'standard',
          nodes: [{ label: L('Əvvəl Emal → Sonra Commit', 'Process before Commit'), sub: L('İtki yoxdur · Dublikat ola bilər', '0 loss · Dupes possible'), icon: 'repeat', tone: 'amber' }],
        },
        {
          title: 'Exactly-Once (== 1)',
          arrowLabel: 'atomic tx',
          nodes: [{ label: 'Transactional EOS', sub: L('0 İtki · 0 Dublikat · read_committed', '0 loss · 0 dupes · atomic'), icon: 'shield', tone: 'emerald', badge: 'GOLD' }],
        },
      ],
    },
  ],
};

const kafkaLagEcosystem: HubSpec = {
  title: L('Real-Time Kafka Ekosistemi və Consumer Lag Monitorinqi', 'Real-Time Kafka Ecosystem & Consumer Lag Monitoring'),
  subtitle: L('CDC mənbələrindən sxem qorunması və axın emalına qədər tam arxitektura', 'End-to-end streaming architecture with Schema Registry, Connect, and Lag alerting'),
  badge: 'Ecosystem',
  footer: L(
    'Consumer Lag = Latest Log Offset − Committed Offset. Lag artırsa, partisiya və consumer sayını artırın.',
    'Consumer Lag = Log End Offset − Committed Offset. Rising lag indicates consumers cannot keep up with producers.'
  ),
  center: { label: 'Kafka Cluster', sub: 'Lag = LogEnd − Committed', icon: 'radio', tone: 'violet' },
  spokes: [
    { label: 'Debezium / Connect', sub: 'Postgres WAL CDC', icon: 'dbzap', tone: 'blue', direction: 'in' },
    { label: 'Schema Registry', sub: 'Avro · Protobuf compatibility', icon: 'shield', tone: 'emerald', direction: 'both' },
    { label: 'Flink / Spark Stream', sub: 'stateful windowing', icon: 'zap', tone: 'amber', direction: 'out' },
    { label: 'Prometheus Alert', sub: 'Consumer Lag > threshold', icon: 'gauge', tone: 'rose', direction: 'out' },
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

const sparkInMemory: FlowSpec = {
  title: L('Hadoop MapReduce (Disk) vs Apache Spark (In-Memory RAM)', 'Hadoop MapReduce (Disk) vs Apache Spark (In-Memory RAM)'),
  badge: '100x Faster',
  footer: L(
    'MapReduce hər mərhələdən sonra aralıq nəticəni fiziki diskə (HDFS) yazıb-oxuyur. Spark isə məlumatı RAM-da saxlayaraq DAG üzrə ötürür.',
    'MapReduce flushes intermediate results to HDFS disk after every step. Spark pipelines stages in RAM via the DAG engine.'
  ),
  rows: [
    {
      label: L('Hadoop MapReduce — Hər Addımda Disk I/O Darboğazı', 'Hadoop MapReduce — Disk I/O Bottleneck at Every Step'),
      tone: 'rose',
      stages: [
        { nodes: [{ label: 'Map', icon: 'cpu', tone: 'rose' }] },
        { arrowLabel: 'write/read', nodes: [{ label: 'HDFS Disk', sub: L('yavaş I/O', 'slow disk flush'), icon: 'disk', tone: 'rose', badge: 'SLOW' }] },
        { arrowLabel: 'write/read', nodes: [{ label: 'Reduce → HDFS Disk', icon: 'disk', tone: 'rose' }] },
      ],
    },
    {
      label: L('Apache Spark — Yaddaşda (In-Memory) Fasiləsiz DAG Pipeline-ı', 'Apache Spark — In-Memory RAM DAG Execution'),
      tone: 'emerald',
      stages: [
        { nodes: [{ label: 'Read Source', icon: 'download', tone: 'blue' }] },
        { arrowLabel: 'in RAM', nodes: [{ label: 'Filter → Map → Join', sub: L('Executor RAM yaddaşında', 'pipelined in Executor RAM'), icon: 'zap', tone: 'emerald', badge: '100x FASTER' }] },
        { arrowLabel: 'final output', nodes: [{ label: 'Lakehouse / S3', icon: 'archive', tone: 'emerald' }] },
      ],
    },
  ],
};

const sparkDataFrameOps: FlowSpec = {
  title: L('PySpark DataFrame Transformasiya Zənciri', 'PySpark Immutable DataFrame Transformation Pipeline'),
  badge: 'DataFrame API',
  footer: L(
    'DataFrame dəyişməzdir (immutable): hər .withColumn() və ya .filter() mövcud cədvəli dəyişmir, yeni məntiqi plan qaytarır.',
    'DataFrames are immutable: chaining .withColumn() or .filter() returns a new logical plan optimized by Catalyst.'
  ),
  rows: [
    {
      stages: [
        { title: 'Raw Ingest', nodes: [{ label: 'spark.read.parquet()', sub: '10M sətir · 25 sütun', icon: 'file', tone: 'slate' }] },
        { title: 'Cleanse', arrowLabel: '.filter().fillna()', nodes: [{ label: 'Null & Keyfiyyət Filtri', sub: 'col("amount") > 0', icon: 'filter', tone: 'blue' }] },
        { title: 'Enrich', arrowLabel: '.withColumn()', nodes: [{ label: 'Yeni Hesablanmış Sütun', sub: 'F.when() · F.to_date()', icon: 'code', tone: 'violet' }] },
        { title: 'Write', arrowLabel: '.write.parquet()', nodes: [{ label: 'Silver / Gold Cədvəl', sub: 'mode("overwrite")', icon: 'db', tone: 'emerald', badge: 'OUTPUT' }] },
      ],
    },
  ],
};

const sparkRepartitionCoalesce: FlowSpec = {
  title: L('Partisiya İdarəetməsi: repartition(N) vs coalesce(N)', 'Partition Management: repartition(N) vs coalesce(N)'),
  badge: 'Partitions',
  footer: L(
    'Partisiya sayını azaltmaq üçün (məs: S3-ə yazmazdan əvvəl 200 → 10) həmişə coalesce() seçin ki, şəbəkə Shuffle-ı baş verməsin!',
    'To reduce partition count before writing files (e.g. 200 → 10), always prefer coalesce() to avoid a full network shuffle!'
  ),
  rows: [
    {
      label: L('repartition(N) — Tam Şəbəkə Shuffle-ı (Artırmaq və Bərabər Bölmək Üçün)', 'repartition(N) — Full Network Shuffle (Increase or Rebalance)'),
      tone: 'amber',
      stages: [
        { nodes: [{ label: 'Əyri Partisiyalar (Skewed)', icon: 'boxes', tone: 'amber' }] },
        { arrowLabel: 'full shuffle', nodes: [{ label: 'Şəbəkə Üzərindən Paylanma', sub: 'RoundRobin / Hash', icon: 'shuffle', tone: 'amber', badge: 'SHUFFLE' }] },
        { nodes: [{ label: 'N Bərabər Partisiya', sub: '128 MB ideal ölçü', icon: 'ok', tone: 'emerald' }] },
      ],
    },
    {
      label: L('coalesce(N) — 0 Shuffle ilə Lokal Birləşdirmə (Yalnız Azaltmaq Üçün)', 'coalesce(N) — Zero-Shuffle Local Merge (Decrease Only)'),
      tone: 'emerald',
      stages: [
        { nodes: [{ label: '200 Xırda Partisiya', icon: 'boxes', tone: 'blue' }] },
        { arrowLabel: 'local merge', nodes: [{ label: 'Eyni Executor-da Birləşir', sub: L('şəbəkə xərci yoxdur', '0 network movement'), icon: 'combine', tone: 'emerald', badge: '0 SHUFFLE ✓' }] },
        { nodes: [{ label: '10 Böyük Fayl', icon: 'file', tone: 'emerald' }] },
      ],
    },
  ],
};

const sparkCachingOom: FlowSpec = {
  title: L('Yaddaş İdarəetməsi: cache() / persist() və Driver collect() OOM Tələsi', 'Memory Management: cache() / persist() & Driver collect() OOM Trap'),
  badge: 'Memory & OOM',
  footer: L(
    'Eyni DataFrame üzərində birdən çox Action çağırılırsa .persist(MEMORY_AND_DISK) edin. Böyük datada heç vaxt .collect() çağırmayın!',
    'Use .persist(MEMORY_AND_DISK) when reusing a DataFrame across multiple actions. Never call .collect() on large datasets!'
  ),
  rows: [
    {
      label: L('Təhlükə — Böyük DataFrame-də df.collect() (Driver OOM Crash!)', 'Danger — Calling df.collect() on 50 GB DataFrame'),
      tone: 'rose',
      stages: [
        { nodes: [{ label: '10 Executor (50 GB)', icon: 'server', tone: 'blue' }] },
        { arrowLabel: 'collect()', nodes: [{ label: 'Tək Driver (4 GB RAM)', sub: 'java.lang.OutOfMemoryError!', icon: 'flame', tone: 'rose', badge: 'DRIVER CRASH' }] },
      ],
    },
    {
      label: L('Optimal — Executor-larda .persist(MEMORY_AND_DISK) + df.take(20)', 'Optimal — Distributed .persist(MEMORY_AND_DISK) on Executors'),
      tone: 'emerald',
      stages: [
        { nodes: [{ label: 'Ağır ETL Hesablaması', icon: 'hammer', tone: 'violet' }] },
        { arrowLabel: '.persist()', nodes: [{ label: 'Executor RAM + Disk Spill', sub: L('Təkrar oxuma 10x sürətli', 'Reused by Action 1 & Action 2'), icon: 'zap', tone: 'emerald', badge: 'CACHED' }] },
      ],
    },
  ],
};

const sparkSkewSalting: FlowSpec = {
  title: L('Data Skew (Məlumat Əyriliyi) və Key Salting Həlli', 'Data Skew Bottleneck & Key Salting Technique'),
  badge: 'Data Skew',
  footer: L(
    'Məlumatın 90%-i tək açara (məs: user_id="guest") düşdükdə 1 Executor saatlarla ilişir (99% task bitir, 1-i qalır). Salting açarı N yerə bölür.',
    'When 90% of rows share one key, a single straggler task bottlenecks the job. Key Salting appends random prefixes (0..N) to spread load.'
  ),
  rows: [
    {
      label: L('Data Skew — 199 Task 5 saniyəyə bitir, 1 Task (99/100) saatlarla ilişir!', 'Data Skew — Single Straggler Executor Bottlenecks Entire Stage'),
      tone: 'rose',
      stages: [
        { nodes: [{ label: 'key = "guest" (80M sətir)', icon: 'users', tone: 'rose' }] },
        { arrowLabel: 'hash("guest")', nodes: [{ label: 'Executor 1 (100% CPU / Spill)', sub: L('Digər 15 Executor boş gözləyir!', 'Other 15 Executors sit idle!'), icon: 'flame', tone: 'rose', badge: 'STRAGGLER' }] },
      ],
    },
    {
      label: L('Key Salting + AQE — Açara Təsadüfi [0..7] Duz Əlavə Edərək Bərabər Bölgü', 'Key Salting — Appending Random Salt [0..7] for Uniform Parallelism'),
      tone: 'emerald',
      stages: [
        { nodes: [{ label: 'concat(key, "_", rand(0,7))', sub: 'guest_0 · guest_1 ... guest_7', icon: 'split', tone: 'blue' }] },
        { arrowLabel: 'uniform hash', nodes: [{ label: 'Bütün 8 Executor Paralel İşləyir', sub: L('OOM yoxdur · 15x sürətli', 'Balanced RAM · 15x faster'), icon: 'zap', tone: 'emerald', badge: 'BALANCED ✓' }] },
      ],
    },
  ],
};

const sparkParquetPushdown: FlowSpec = {
  title: L('Parquet Optimallaşdırması: Column Projection və Predicate Pushdown', 'Parquet Optimization: Column Projection & Predicate Pushdown'),
  badge: 'Parquet',
  footer: L(
    'Parquet faylının sonunda (Footer) hər Row Group üçün Min/Max statistika saxlanılır — uyğun gəlməyən bloklar diskdən heç oxunmur.',
    'Parquet footers store per-Row-Group Min/Max statistics, enabling Spark to skip irrelevant blocks and read only requested columns.'
  ),
  rows: [
    {
      stages: [
        { title: 'SQL Query', nodes: [{ label: 'SELECT user_id, rev WHERE age > 60', icon: 'code', tone: 'blue' }] },
        { title: 'Column Projection', arrowLabel: 'prune cols', nodes: [{ label: '50 Sütundan Yalnız 2-si Oxunur', sub: '48 sütun diskdə qalır', icon: 'table', tone: 'violet', badge: '96% LESS I/O' }] },
        { title: 'Predicate Pushdown', arrowLabel: 'min/max stats', nodes: [{ label: 'Row Group [max(age)=45] → SKIP', sub: L('Yalnız uyğun bloklar oxunur', 'Skips entire Row Groups'), icon: 'zap', tone: 'emerald', badge: 'PUSHDOWN ✓' }] },
      ],
    },
  ],
};

const sparkCatalystPlan: FlowSpec = {
  title: L('Spark Catalyst Optimizer: Məntiqi Plandan Fiziki İcraya (.explain())', 'Spark Catalyst Optimizer: From SQL/DataFrame to Physical Plan'),
  badge: 'Catalyst',
  footer: L(
    'Catalyst Optimizer JOIN-dan əvvəl WHERE filtrlərini avtomatik aşağı itələyir (Filter Pushdown) və ən ucuz fiziki planı seçir.',
    'Catalyst automatically pushes filters below joins, prunes unused columns, and selects the lowest-cost physical execution plan.'
  ),
  rows: [
    {
      stages: [
        { title: '1. Unresolved Plan', nodes: [{ label: 'AST Sözdizimi', sub: 'cədvəl/sütun hələ yoxlanmayıb', icon: 'code', tone: 'slate' }] },
        { title: '2. Analyzed Plan', arrowLabel: 'Catalog', nodes: [{ label: 'Tiplər və Adlar Doğrulanır', sub: 'AnalysisException yoxlanışı', icon: 'search', tone: 'blue' }] },
        { title: '3. Optimized Plan', arrowLabel: 'Catalyst rules', nodes: [{ label: 'Filter Pushdown + Pruning', sub: L('WHERE filtri JOIN-dan əvvələ keçir', 'Filters pushed before Join'), icon: 'spark', tone: 'violet', badge: 'OPTIMIZED' }] },
        { title: '4. Physical Plan', arrowLabel: 'Cost Model', nodes: [{ label: 'WholeStageCodegen +Tungsten', sub: '.explain(True)', icon: 'cpu', tone: 'emerald', badge: 'EXECUTION' }] },
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
    'Bütün komponentlər vəziyyəti Metadata DB vasitəsilə paylaşır — Scheduler və Webserver (Airflow 3-də API Server) bir-biri ilə birbaşa danışmır.',
    'All components share state through the metadata database — the scheduler and webserver (API server in Airflow 3) never talk to each other directly.',
  ),
  center: { label: 'Metadata DB', sub: 'PostgreSQL', icon: 'db', tone: 'indigo' },
  spokes: [
    { label: 'Scheduler', sub: L('DAG-ları planlayır', 'schedules DAGs'), icon: 'clock', tone: 'violet', direction: 'both' },
    { label: 'Webserver / API Server', sub: L('UI & REST API', 'UI & REST API'), icon: 'eye', tone: 'blue', direction: 'both' },
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

const airflowTaskflow: FlowSpec = {
  title: L('TaskFlow API: @dag və @task Dekoratorları', 'TaskFlow API: @dag & @task Decorators'),
  badge: 'TaskFlow',
  footer: L(
    'TaskFlow API-də adi Python funksiyası kimi çağırış (load(transform(extract()))) həm asılılığı, həm də XCom ötürülməsini avtomatik qurur.',
    'Calling tasks like regular Python functions automatically wires dependencies and passes return values via XCom.'
  ),
  rows: [
    {
      stages: [
        { title: '@task', nodes: [{ label: 'raw = extract()', sub: 'return {"rows": 500}', icon: 'code', tone: 'blue' }] },
        { title: '@task', arrowLabel: 'auto XCom', nodes: [{ label: 'clean = transform(raw)', sub: L('tipləri yoxlayır', 'type-safe dict'), icon: 'zap', tone: 'violet', badge: 'CLEAN' }] },
        { title: '@task', arrowLabel: 'auto XCom', nodes: [{ label: 'load(clean)', sub: 'INSERT INTO warehouse', icon: 'db', tone: 'emerald' }] },
      ],
    },
  ],
};

const airflowXcoms: FlowSpec = {
  title: L('XComs: Kiçik Metadata vs Böyük DataFrame Tələsi', 'XComs: Small Metadata vs The Large DataFrame Trap'),
  badge: 'XCom',
  footer: L(
    'XCom yalnız kiçik metadata (S3 fayl yolu, sətir sayı < 48KB) üçündür! Böyük DataFrame-ləri S3/GCS-də saxlayıb yalnız URI-ni XCom-la ötürün.',
    'XCom is strictly for small metadata (< 48KB). Store large DataFrames in S3/GCS and pass only the object URI via XCom.'
  ),
  rows: [
    {
      label: L('Anti-Pattern — 1 GB DataFrame-i XCom-a Yazmaq (Metadata DB Çökür!)', 'Anti-Pattern — Pushing 1 GB DataFrame to XCom (OOM Crash!)'),
      tone: 'rose',
      stages: [
        { nodes: [{ label: 'Task A (1 GB df)', icon: 'table', tone: 'rose' }] },
        { arrowLabel: 'xcom_push(df)', nodes: [{ label: 'Airflow Metadata DB', sub: 'PostgreSQL şişir & OOM xətası verir', icon: 'bug', tone: 'rose', badge: 'CRASH' }] },
      ],
    },
    {
      label: L('Production Qaydası — S3/Parquet + XCom-da Yalnız Fayl Ünvanı (URI)', 'Production Pattern — S3 Parquet + Pass Only URI String in XCom'),
      tone: 'emerald',
      stages: [
        { nodes: [{ label: 'Task A → S3 Parquet', sub: 's3://bucket/run_01.parquet', icon: 'cloud', tone: 'blue' }] },
        { arrowLabel: '120 bytes URI', nodes: [{ label: 'XCom (Metadata DB)', sub: '"s3://bucket/run_01.parquet"', icon: 'link', tone: 'emerald', badge: 'FAST ✓' }] },
        { arrowLabel: 'read parquet', nodes: [{ label: 'Task B', sub: 'S3-dən birbaşa oxuyur', icon: 'cpu', tone: 'emerald' }] },
      ],
    },
  ],
};

const airflowDataInterval: FlowSpec = {
  title: L('Airflow Zamanlama Paradoksu: data_interval_start vs İcra Vaxtı', 'Airflow Scheduling Paradox: data_interval_start vs Execution Time'),
  badge: 'Schedule',
  footer: L(
    'Gündəlik DAG dövrün SONUNDA işə düşür! 15 Oktyabr məlumatlarını emal edən iş 16 Oktyabr 00:00-da başlayır.',
    'A daily job runs at the END of its data interval! The run covering Oct 15 data starts at Oct 16 00:00.'
  ),
  rows: [
    {
      stages: [
        { title: 'data_interval_start', nodes: [{ label: '2026-10-15 00:00', sub: 'logical_date (ds)', icon: 'calendar', tone: 'blue', badge: 'START' }] },
        { title: L('Məlumat Toplanır (24 saat)', 'Data Accumulation Window'), arrowLabel: 'collect events', nodes: [{ label: '15 Oktyabr Hadisələri', sub: '00:00 → 23:59:59', icon: 'clock', tone: 'violet' }] },
        { title: 'data_interval_end', arrowLabel: 'trigger!', nodes: [{ label: '2026-10-16 00:00', sub: L('DAG İndi İşə Düşür!', 'DAG Actually Triggers Now!'), icon: 'play', tone: 'emerald', badge: 'RUN' }] },
      ],
    },
  ],
};

const airflowIdempotence: FlowSpec = {
  title: L('Catchup, Backfill və İdempotent Pipeline Dizaynı', 'Catchup, Backfill & Idempotent Pipeline Design'),
  badge: 'Idempotence',
  footer: L(
    'İdempotent task-ı eyni tarix üçün 1 dəfə də, 10 dəfə də işlətsəniz hədəf cədvəldə dublikat yaranmır (DELETE + INSERT və ya MERGE).',
    'An idempotent task produces the exact same target table state whether executed once or retried 10 times.'
  ),
  rows: [
    {
      label: L('Qeyri-İdempotent (Təhlükəli) — Kor-koranə INSERT INTO', 'Non-Idempotent (Broken) — Blind INSERT INTO'),
      tone: 'rose',
      stages: [
        { nodes: [{ label: 'Backfill / Retry', icon: 'repeat', tone: 'rose' }] },
        { arrowLabel: 'INSERT INTO', nodes: [{ label: 'Hədəf Cədvəl', sub: L('2x Dublikat sətirlər! Hesabatlar səhv çıxır', '2x Duplicate rows! Corrupted KPIs'), icon: 'bug', tone: 'rose', badge: 'DUPLICATES' }] },
      ],
    },
    {
      label: L('İdempotent (Qızıl Standart) — Partisiyanı Təmizlə & Yaz (Overwrite / MERGE)', 'Idempotent (Gold Standard) — Partition Overwrite or MERGE'),
      tone: 'emerald',
      stages: [
        { nodes: [{ label: "DELETE WHERE dt = '{{ ds }}'", icon: 'filter', tone: 'blue' }] },
        { arrowLabel: 'then INSERT', nodes: [{ label: 'Hədəf Cədvəl', sub: L('100% təkrar işlədilə bilən · 0 dublikat', 'Safe backfill & retries · 0 duplicates'), icon: 'shield', tone: 'emerald', badge: 'IDEMPOTENT' }] },
      ],
    },
  ],
};

const airflowSensors: FlowSpec = {
  title: L('Sensor Rejimləri: poke (Deadlock Tələsi) vs reschedule / Deferrable', 'Sensor Modes: poke (Worker Deadlock) vs reschedule / Deferrable'),
  badge: 'Sensors',
  footer: L(
    'Uzun gözləmələrdə həmişə mode="reschedule" və ya Deferrable Sensor istifadə edin ki, Worker slotları boş qalsın.',
    'Always use mode="reschedule" or Deferrable Operators for long waits so worker slots are freed between checks.'
  ),
  rows: [
    {
      label: L('mode="poke" — Worker Slotunu Tutub Saxlayır (Deadlock Riski)', 'mode="poke" — Holds Worker Slot While Sleeping'),
      tone: 'rose',
      stages: [
        { nodes: [{ label: 'S3KeySensor (poke)', icon: 'search', tone: 'rose' }] },
        { arrowLabel: 'sleep(60)', nodes: [{ label: 'Worker Slot Bloklanır', sub: L('Digər tasklar növbədə ilişib qalır!', 'Starves cluster worker pool!'), icon: 'lock', tone: 'rose', badge: 'DEADLOCK' }] },
      ],
    },
    {
      label: L('mode="reschedule" / Deferrable — Gözləyərkən Slotu Boşaldır', 'mode="reschedule" / Deferrable — Releases Slot Between Checks'),
      tone: 'emerald',
      stages: [
        { nodes: [{ label: 'Fayl hələ yoxdur', icon: 'search', tone: 'blue' }] },
        { arrowLabel: 'release slot', nodes: [{ label: 'up_for_reschedule / Triggerer', sub: L('0 Worker CPU məsrəfi · Başqa işlər işləyir', '0 Worker slots held · Async event loop'), icon: 'zap', tone: 'emerald', badge: 'OPTIMAL' }] },
      ],
    },
  ],
};

const airflowExecutors: FlowSpec = {
  title: L('Airflow Executor-ları: Local vs Celery vs KubernetesExecutor', 'Airflow Executors: Local vs Celery vs KubernetesExecutor'),
  badge: 'Executors',
  footer: L(
    'Kiçik komanda üçün LocalExecutor, yüksək sürətli sabit klaster üçün CeleryExecutor, tam izolyasiya üçün KubernetesExecutor seçilir.',
    'Choose LocalExecutor for single-node, CeleryExecutor for high-throughput queues, and KubernetesExecutor for per-task pod isolation.'
  ),
  rows: [
    {
      stages: [
        {
          title: 'LocalExecutor',
          nodes: [{ label: 'Tək Server (Subprocess)', sub: L('Sadə · Orta yük · Redis lazım deyil', 'Simple · Single host · No broker'), icon: 'terminal', tone: 'blue' }],
        },
        {
          title: 'CeleryExecutor',
          arrowLabel: 'scale out',
          nodes: [{ label: 'Redis/RabbitMQ + Workers', sub: L('Sürətli start · Sabit açıq worker hovuzu', 'Zero cold-start · Standing worker fleet'), icon: 'layers', tone: 'amber' }],
        },
        {
          title: 'KubernetesExecutor',
          arrowLabel: 'isolated pods',
          nodes: [{ label: 'Hər Task = 1 K8s Pod', sub: L('Fərqli Docker image-i · İş bitəndə 0 resurs', 'Custom image per task · Scales to zero'), icon: 'container', tone: 'emerald', badge: 'CLOUD NATIVE' }],
        },
      ],
    },
  ],
};

const airflowDynamicMapping: FlowSpec = {
  title: L('Dynamic Task Mapping: .expand() ilə Paralel İcra', 'Dynamic Task Mapping: Runtime Parallelism with .expand()'),
  badge: '.expand()',
  footer: L(
    'İcra vaxtı neçə fayl gələcəyi əvvəlcədən bilinmədikdə .expand() siyahıdakı hər element üçün paralel task nüsxəsi yaradır.',
    '.expand() dynamically spawns parallel task instances at runtime based on the upstream list length.'
  ),
  rows: [
    {
      stages: [
        { title: 'Upstream Task', nodes: [{ label: 'list_s3_files()', sub: '["a.csv", "b.csv", "c.csv"]', icon: 'tree', tone: 'blue' }] },
        {
          title: 'process_file.expand()',
          arrowLabel: 'fan-out × 3',
          nodes: [
            { label: 'map_index = 0 ("a.csv")', icon: 'cpu', tone: 'violet' },
            { label: 'map_index = 1 ("b.csv")', icon: 'cpu', tone: 'violet' },
            { label: 'map_index = 2 ("c.csv")', icon: 'cpu', tone: 'violet' },
          ],
        },
        { title: 'Reduce Task', arrowLabel: 'fan-in', nodes: [{ label: 'combine_results()', sub: L('bütün nəticələri birləşdirir', 'aggregates mapped outputs'), icon: 'merge', tone: 'emerald', badge: 'REDUCE' }] },
      ],
    },
  ],
};

const airflowMonitoring: FlowSpec = {
  title: L('Production Qaydaları: Top-Level Kod Tələsi və SLA / Deadline Alerts', 'Production Rules: Top-Level Code Anti-Pattern & SLA / Deadline Alerts'),
  badge: 'Best Practices',
  footer: L(
    'DAG faylının çölündə (top-level) DB sorğusu və ya API çağırışı yazmayın — Scheduler hər 30 saniyədən bir həmin kodu icra edib sistemi çökdürəcək!',
    'Never place DB queries or API calls at top-level DAG scope — the parser runs every 30s and will overload your infrastructure!'
  ),
  rows: [
    {
      label: L('Anti-Pattern — Top-Level Sorğu (Hər 30 saniyədə Parser İcra Edir!)', 'Anti-Pattern — Top-Level DB/API Call in DAG File'),
      tone: 'rose',
      stages: [
        { nodes: [{ label: 'my_dag.py (Top-Level SQL)', icon: 'filecode', tone: 'rose' }] },
        { arrowLabel: 'every 30s parse', nodes: [{ label: 'Scheduler CPU 100%', sub: L('DB bağlantıları tükənir', 'Connection pool exhausted'), icon: 'flame', tone: 'rose', badge: 'ANTI-PATTERN' }] },
      ],
    },
    {
      label: L('Production Standartı — Yalnız @task Daxilində Kod + Alert Callback', 'Production Standard — Queries Strictly Inside @task + Callbacks'),
      tone: 'emerald',
      stages: [
        { nodes: [{ label: 'Yüngül DAG Tərifləri', sub: 'parse < 50ms', icon: 'ok', tone: 'emerald' }] },
        { arrowLabel: 'runtime only', nodes: [{ label: '@task daxilində Hook/SQL', icon: 'db', tone: 'blue' }] },
        { arrowLabel: 'on failure / SLA', nodes: [{ label: 'Slack / PagerDuty Alert', sub: 'on_failure_callback', icon: 'bell', tone: 'amber', badge: 'MONITORED' }] },
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

const devopsLinuxBash: FlowSpec = {
  title: L('Linux Pipe (`|`) Axını və Production Bash Skripti', 'Linux Pipe (`|`) Stream & Production Bash Scripting'),
  badge: 'Bash & Cron',
  footer: L(
    'set -euo pipefail ilk xətada skripti dərhal dayandırır (exit code != 0) ki, yarımçıq data anbara yüklənməsin.',
    'set -euo pipefail aborts immediately on any command or pipe failure so corrupted data never reaches the warehouse.'
  ),
  rows: [
    {
      stages: [
        { title: 'stdin / file', nodes: [{ label: 'cat app.log', sub: '10 GB xam log', icon: 'file', tone: 'slate' }] },
        { title: 'Filter', arrowLabel: '| pipe', nodes: [{ label: 'grep "ERROR"', sub: L('yalnız xətalar', 'filter lines'), icon: 'filter', tone: 'rose' }] },
        { title: 'Extract', arrowLabel: '| pipe', nodes: [{ label: "awk '{print $4}'", sub: L('sütunu kəsir', 'parse column'), icon: 'code', tone: 'blue' }] },
        { title: 'Aggregate', arrowLabel: '| pipe', nodes: [{ label: 'sort | uniq -c', sub: 'exit code 0 ✓', icon: 'ok', tone: 'emerald', badge: 'STREAM' }] },
      ],
    },
  ],
};

const devopsGitFlow: FlowSpec = {
  title: L('Git Branching Strategiyası, Pull Request və Code Review', 'Git Feature Branch Workflow, Pull Request & Code Review'),
  badge: 'Git & GitHub',
  footer: L(
    'Heç vaxt birbaşa main budağına push etməyin! Hər dəyişiklik izolyasiya olunmuş feature budağında yazılıb PR və CI testindən keçməlidir.',
    'Never push directly to main! Develop in isolated feature branches and merge via Pull Request after CI checks pass.'
  ),
  rows: [
    {
      stages: [
        { title: '1. Branch', nodes: [{ label: 'git checkout -b feat/dbt', sub: L('izolyasiya olunmuş iş', 'isolated branch'), icon: 'branch', tone: 'blue' }] },
        { title: '2. Commit & Push', arrowLabel: 'git push', nodes: [{ label: 'Kiçik Atomik Commit-lər', sub: 'conventional commits', icon: 'code', tone: 'violet' }] },
        { title: '3. Pull Request', arrowLabel: 'open PR', nodes: [{ label: 'Code Review + CI Test', sub: 'pytest · sqlfluff ✓', icon: 'pr', tone: 'amber', badge: 'REVIEW' }] },
        { title: '4. Merge', arrowLabel: 'squash', nodes: [{ label: 'main (Production)', sub: L('təmiz tarixçə', 'clean linear history'), icon: 'ok', tone: 'emerald', badge: 'PROTECTED' }] },
      ],
    },
  ],
};

const devopsDockerLifecycle: FlowSpec = {
  title: L('Docker CLI və Konteynerin Həyat Dövrü (Lifecycle)', 'Docker CLI & Container Lifecycle Management'),
  badge: 'Docker CLI',
  footer: L(
    'docker run -d konteyneri arxa planda (detached) işə salır; docker exec -it isə işləyən konteynerin daxilinə terminal açır.',
    'docker run -d starts a detached container; docker exec -it opens an interactive shell inside a running container.'
  ),
  rows: [
    {
      stages: [
        { title: 'Registry', nodes: [{ label: 'docker pull postgres:16', sub: L('image-i endirir', 'download image'), icon: 'download', tone: 'blue' }] },
        { title: 'Start', arrowLabel: 'docker run -d', nodes: [{ label: 'Running Container', sub: '-p 5432:5432 · --name pg', icon: 'play', tone: 'emerald', badge: 'UP' }] },
        { title: 'Debug', arrowLabel: 'exec / logs', nodes: [{ label: 'docker exec -it pg psql', sub: 'docker logs -f pg', icon: 'terminal', tone: 'violet' }] },
        { title: 'Teardown', arrowLabel: 'stop & rm', nodes: [{ label: 'docker stop && docker rm', sub: L('resursları boşaldır', 'clean teardown'), icon: 'archive', tone: 'slate' }] },
      ],
    },
  ],
};

const devopsMultiStage: FlowSpec = {
  title: L('Docker Layer Caching və Multi-Stage Build Optimallaşdırması', 'Docker Layer Caching & Multi-Stage Builds'),
  badge: 'Multi-Stage',
  footer: L(
    'requirements.txt faylını mənbə kodundan (COPY . .) ƏVVƏL kopyalayın ki, kod dəyişəndə paketlər yenidən endirilməsin!',
    'Copy requirements.txt BEFORE application code so dependency layers remain cached across code edits.'
  ),
  rows: [
    {
      label: L('Single-Stage Build — Ağır və Təhlükəli Image (1.2 GB)', 'Single-Stage Build — Bloated Image with Compilers (1.2 GB)'),
      tone: 'rose',
      stages: [
        { nodes: [{ label: 'FROM python:3.11 (Full)', icon: 'box', tone: 'rose' }] },
        { arrowLabel: '+ gcc + build tools', nodes: [{ label: '1.2 GB Production Image', sub: L('Yavaş deploy · Geniş hücum səthi', 'Slow pull · Large attack surface'), icon: 'bug', tone: 'rose', badge: 'BLOATED' }] },
      ],
    },
    {
      label: L('Multi-Stage Build — Builder + Yüngül Runtime Image (120 MB)', 'Multi-Stage Build — Builder Stage + Slim Runtime (120 MB)'),
      tone: 'emerald',
      stages: [
        { nodes: [{ label: 'Stage 1: Builder', sub: 'compile wheels', icon: 'hammer', tone: 'blue' }] },
        { arrowLabel: 'COPY --from=builder', nodes: [{ label: 'Stage 2: python:3.11-slim', sub: L('Yalnız hazır paketlər · 10x kiçik', 'Only runtime wheels · 120 MB'), icon: 'zap', tone: 'emerald', badge: '90% SMALLER' }] },
      ],
    },
  ],
};

const devopsVolumesMounts: FlowSpec = {
  title: L('Davamlı Yaddaş: Ephemeral Layer vs Docker Volumes vs Bind Mounts', 'Persistent Storage: Volumes vs Bind Mounts'),
  badge: 'Storage',
  footer: L(
    'Konteyner silinəndə daxili faylları uçur! Verilənlər bazası (Postgres/Kafka) üçün mütləq Named Volume istifadə edilməlidir.',
    'Container writable layers are ephemeral! Always mount a Named Volume for databases like PostgreSQL or Kafka.'
  ),
  rows: [
    {
      label: L('Volume Olmadan — Konteyner Silinən Kimi Bütün Data İtir!', 'Without Volume — Ephemeral Container Layer (Data Lost on rm!)'),
      tone: 'rose',
      stages: [
        { nodes: [{ label: 'Postgres Container', icon: 'container', tone: 'rose' }] },
        { arrowLabel: 'docker rm -f', nodes: [{ label: 'Bütün Cədvəllər Silindi!', sub: L('davamlı yaddaş yoxdur', 'ephemeral writable layer destroyed'), icon: 'flame', tone: 'rose', badge: 'DATA LOSS' }] },
      ],
    },
    {
      label: L('Named Volume — Konteyner Yenilənsə də Data Host Diskində Qorunur', 'Named Volume — Host-Managed Persistent Disk Storage'),
      tone: 'emerald',
      stages: [
        { nodes: [{ label: 'Postgres Container', icon: 'container', tone: 'blue' }] },
        { arrowLabel: '-v pgdata:/var/lib/postgresql/data', nodes: [{ label: 'Docker Named Volume', sub: L('Host diskində təhlükəsiz qalır', 'Survives container restarts & upgrades'), icon: 'disk', tone: 'emerald', badge: 'PERSISTENT ✓' }] },
      ],
    },
  ],
};

const devopsDockerNetwork: HubSpec = {
  title: L('Docker Şəbəkəsi və Daxili DNS Xidmət Aşkarlanması', 'Docker Custom Bridge Network & Automatic DNS Discovery'),
  subtitle: L('Konteynerlər IP ünvanı ilə deyil, birbaşa servis adı (hostname) ilə danışır', 'Containers communicate via service hostnames resolved by embedded Docker DNS'),
  badge: 'DNS Network',
  footer: L(
    'Eyni custom bridge şəbəkəsində olan Spark konteyneri Postgres-ə localhost:5432 deyil, postgres:5432 yazaraq qoşulur.',
    'Inside a custom bridge network, Spark connects to jdbc:postgresql://postgres:5432/db using the service name, never localhost.'
  ),
  center: { label: 'Embedded Docker DNS', sub: 'network: de_platform_net', icon: 'network', tone: 'blue' },
  spokes: [
    { label: 'postgres:5432', sub: 'Warehouse DB', icon: 'db', tone: 'indigo', direction: 'both' },
    { label: 'kafka:9092', sub: 'Event Broker', icon: 'radio', tone: 'violet', direction: 'both' },
    { label: 'spark-worker', sub: 'reads kafka & writes pg', icon: 'zap', tone: 'emerald', direction: 'both' },
    { label: 'airflow-scheduler', sub: 'triggers jobs', icon: 'clock', tone: 'amber', direction: 'both' },
  ],
};

const devopsSecretsSecurity: FlowSpec = {
  title: L('Məxfilik İdarəetməsi (Secrets) və Konteyner Təhlükəsizliyi', 'Secrets Management & Container Security Hardening'),
  badge: 'Security',
  footer: L(
    'Heç vaxt parol və API açarlarını Git-ə və ya Dockerfile ENV sətrinə yazmayın! Runtime mühit dəyişənləri və ya Secrets Manager istifadə edin.',
    'Never hardcode credentials in Git or Dockerfile ENV layers! Inject secrets at runtime and run as a non-root user.'
  ),
  rows: [
    {
      label: L('Təhlükəli — Git Kodunda və ya Docker Image-də Açıq Parol', 'Vulnerable — Hardcoded Credentials in Git or Image History'),
      tone: 'rose',
      stages: [
        { nodes: [{ label: 'ENV DB_PASS="secret123"', icon: 'filecode', tone: 'rose' }] },
        { arrowLabel: 'docker history', nodes: [{ label: 'Şifrə Hər Kəsə Görünür!', sub: L('Git tarixçəsində və image-də sızma', 'Leaked in image layer metadata'), icon: 'bug', tone: 'rose', badge: 'LEAKED' }] },
      ],
    },
    {
      label: L('Təhlükəsiz — Secret Manager + Runtime Injection + Non-Root User', 'Hardened — Secret Store + Runtime Injection + Non-Root User'),
      tone: 'emerald',
      stages: [
        { nodes: [{ label: 'AWS Secrets / Vault / .env', sub: '.gitignore ilə qorunur', icon: 'lock', tone: 'blue' }] },
        { arrowLabel: 'runtime inject', nodes: [{ label: 'os.environ["DB_PASS"]', sub: 'USER appuser (UID 1000)', icon: 'shield', tone: 'emerald', badge: 'SECURE ✓' }] },
      ],
    },
  ],
};

const devopsK8sMonitoring: HubSpec = {
  title: L('Kubernetes Orkestrləməsi və Prometheus/Grafana Monitorinqi', 'Kubernetes Orchestration & Prometheus/Grafana Observability'),
  subtitle: L('Avtomatik miqyaslanma (HPA), özünü-bərpa (Self-Healing Pods) və real-vaxt metrikaları', 'Self-healing pods, Horizontal Pod Autoscaling, and real-time metrics scraping'),
  badge: 'K8s & SRE',
  footer: L(
    'Kubernetes çökən Pod-u dərhal yenisi ilə əvəz edir; Prometheus metrikaları toplayır, Grafana isə SLA panellərini göstərir.',
    'Kubernetes automatically restarts failed pods; Prometheus scrapes metrics and Grafana visualizes pipeline SLAs.'
  ),
  center: { label: 'Kubernetes Control Plane', sub: 'Deployment · StatefulSet · HPA', icon: 'servercog', tone: 'blue' },
  spokes: [
    { label: 'Spark & Airflow Pods', sub: 'Liveness & Readiness probes', icon: 'boxes', tone: 'emerald', direction: 'both' },
    { label: 'ConfigMap & Secret', sub: 'decoupled config', icon: 'lock', tone: 'violet', direction: 'in' },
    { label: 'Prometheus', sub: 'scrapes /metrics endpoint', icon: 'gauge', tone: 'amber', direction: 'out' },
    { label: 'Grafana & Alertmanager', sub: 'CPU · Lag · SLA dashboards', icon: 'chart', tone: 'orange', direction: 'out' },
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

const dbtModelsRef: FlowSpec = {
  title: L('source() və ref() ilə Avtomatik DAG Asılılığı', 'Automatic DAG Dependency Graph with source() & ref()'),
  badge: 'dbt DAG',
  footer: L(
    'Heç vaxt cədvəl adını birbaşa yazmayın! source() xam cədvəlləri, ref() isə dbt modellərini bir-birinə bağlayır.',
    'Never hardcode schema.table names! source() declares raw tables and ref() automatically builds the execution DAG.'
  ),
  rows: [
    {
      stages: [
        {
          title: 'sources.yml',
          nodes: [
            { label: "source('raw', 'orders')", sub: L('təravətlilik yoxlanışı', 'freshness check'), icon: 'db', tone: 'slate', badge: 'RAW' },
          ],
        },
        {
          title: 'Staging Model',
          arrowLabel: 'Jinja compile',
          nodes: [
            { label: 'stg_orders.sql', sub: 'CAST · RENAME · DEDUPE', icon: 'filter', tone: 'blue' },
          ],
        },
        {
          title: 'Mart Model',
          arrowLabel: "ref('stg_orders')",
          nodes: [
            { label: 'fct_revenue.sql', sub: L('biznes aqreqasiyası', 'business aggregation'), icon: 'table', tone: 'emerald', badge: 'MART' },
          ],
        },
      ],
    },
  ],
};

const dbtMaterializations: FlowSpec = {
  title: L('dbt Materializasiyalar: View vs Table vs Incremental', 'dbt Materializations: View vs Table vs Incremental'),
  badge: 'Materialize',
  footer: L(
    'Staging üçün View (0 disk xərci), BI Mart üçün Table (sürətli SELECT), Milyardlarla sətirlik event üçün Incremental seçilir.',
    'Use View for staging, Table for BI marts, and Incremental for multi-billion-row event streams.'
  ),
  rows: [
    {
      label: L('View & Table — Sadə və Tam Yenilənən', 'View & Table — Full Refresh'),
      tone: 'blue',
      stages: [
        { nodes: [{ label: 'View', sub: L('disk tutmur · hər sorğuda hesablanır', '0 storage · computed on read'), icon: 'eye', tone: 'blue', badge: 'STAGING' }] },
        { arrowLabel: 'vs', nodes: [{ label: 'Table', sub: L('CREATE TABLE AS · sürətli BI oxuma', 'CTAS · fast BI queries'), icon: 'table', tone: 'indigo', badge: 'MARTS' }] },
      ],
    },
    {
      label: L('Incremental — Yalnız Yeni Sətirləri Emal Edən', 'Incremental — Process Only New / Updated Rows'),
      tone: 'emerald',
      stages: [
        { nodes: [{ label: 'is_incremental()', sub: 'WHERE event_time > MAX(event_time)', icon: 'clock', tone: 'emerald' }] },
        { arrowLabel: 'MERGE / APPEND', nodes: [{ label: 'Hədəf Cədvəl', sub: L('99% qənaət · saniyələr içində bitir', '99% compute saved · finishes in seconds'), icon: 'dbzap', tone: 'emerald', badge: 'BIG DATA' }] },
      ],
    },
  ],
};

const dbtSnapshots: FlowSpec = {
  title: L('dbt Snapshots: Avtomatik SCD Type 2 Tarixçəsi', 'dbt Snapshots: Automated SCD Type 2 History'),
  badge: 'Snapshots',
  footer: L(
    'dbt snapshot mənbədə dəyişən sətirləri tutur, köhnə sətrin dbt_valid_to tarixini bağlayır və yeni aktiv sətir əlavə edir.',
    'dbt snapshot detects source changes, closes dbt_valid_to on the prior version, and inserts a new active record.'
  ),
  rows: [
    {
      stages: [
        { title: L('Mənbə (OLTP)', 'Source Table'), nodes: [{ label: 'orders (status: shipped)', sub: 'updated_at: 14:00', icon: 'db', tone: 'blue' }] },
        { title: 'dbt snapshot', arrowLabel: 'timestamp / check', nodes: [{ label: 'Dəyişikliyi Aşkarla', sub: 'pending → shipped', icon: 'search', tone: 'violet' }] },
        {
          title: 'snapshots.orders_history',
          arrowLabel: 'SCD Type 2',
          nodes: [
            { label: 'v1: status = pending', sub: 'valid_to: 14:00 (bağlandı)', icon: 'archive', tone: 'slate' },
            { label: 'v2: status = shipped', sub: 'valid_to: NULL (aktiv)', icon: 'ok', tone: 'emerald', badge: 'CURRENT' },
          ],
        },
      ],
    },
  ],
};

const dbtProjectStructure: FlowSpec = {
  title: L('Production dbt Layihə Arxitekturası: Staging → Intermediate → Marts', 'Production dbt Project Architecture'),
  badge: 'Structure',
  footer: L(
    'Seeds statik CSV sorğu cədvəllərini yükləyir; dbt docs generate isə bütün layihənin interaktiv Lineage kataloqunu yaradır.',
    'Seeds version-control static CSV lookups; dbt docs generate builds the interactive lineage portal.'
  ),
  rows: [
    {
      stages: [
        {
          title: 'Inputs & Seeds',
          nodes: [
            { label: 'Raw Sources', sub: 'sources.yml', icon: 'db', tone: 'slate' },
            { label: 'Seeds (CSV)', sub: 'country_codes.csv', icon: 'file', tone: 'amber' },
          ],
        },
        {
          title: 'models/staging/',
          arrowLabel: '1:1 clean',
          nodes: [{ label: 'stg_*.sql', sub: 'views · tip & ad standartı', icon: 'filter', tone: 'blue' }],
        },
        {
          title: 'models/intermediate/',
          arrowLabel: 'joins',
          nodes: [{ label: 'int_*.sql', sub: 'ephemeral · mürəkkəb məntiq', icon: 'combine', tone: 'violet' }],
        },
        {
          title: 'models/marts/',
          arrowLabel: 'expose',
          nodes: [{ label: 'fct_* & dim_*', sub: 'tables · departament kataloqu', icon: 'trophy', tone: 'emerald', badge: 'GOLD' }],
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

const pythonVariablesTypes: FlowSpec = {
  title: L('Python Data Tipləri və Sxem Təhlükəsiz Çevirmələr (Type Casting)', 'Python Data Types & Explicit Schema Type Casting'),
  badge: 'Types',
  footer: L(
    'CSV və API-dən gələn rəqəmlər həmişə mətn (str) kimi oxunur; riyazi əməliyyatdan əvvəl mütləq int() və ya float() edin.',
    'CSV and query string values arrive as str; always cast explicitly with int(), float(), or bool() before aggregation.'
  ),
  rows: [
    {
      stages: [
        { title: 'Raw CSV Row', nodes: [{ label: '"42", "19.95", "true"', sub: 'type: str (mətn)', icon: 'file', tone: 'slate' }] },
        { title: 'Explicit Cast', arrowLabel: 'int / float', nodes: [{ label: 'int("42") · float("19.95")', sub: 'tip doğrulanması', icon: 'wrench', tone: 'blue' }] },
        { title: 'Typed Record', arrowLabel: 'schema safe', nodes: [{ label: 'id: 42 · price: 19.95', sub: 'Parquet / DB üçün hazır', icon: 'ok', tone: 'emerald', badge: 'TYPED ✓' }] },
      ],
    },
  ],
};

const pythonStringOps: FlowSpec = {
  title: L('Mətn Təmizlənməsi (String Cleansing) və F-String Formatlaşdırma', 'String Cleansing Pipeline & F-String Formatting'),
  badge: 'Strings',
  footer: L(
    'Python-da str dəyişməzdir (immutable): .strip().lower().replace() zənciri xam loqları saniyədə yüz minlərlə sətir sürətlə təmizləyir.',
    'Strings are immutable in Python: chaining .strip().lower().split() normalizes messy raw logs for downstream tables.'
  ),
  rows: [
    {
      stages: [
        { title: 'Dirty Input', nodes: [{ label: '"  ALİ@Mail.COM \\n"', sub: L('boşluqlar & qarışıq hərf', 'whitespace & mixed case'), icon: 'file', tone: 'rose' }] },
        { title: 'Normalize', arrowLabel: '.strip().lower()', nodes: [{ label: '"ali@mail.com"', sub: L('standart format', 'clean canonical key'), icon: 'filter', tone: 'blue' }] },
        { title: 'F-String Path', arrowLabel: 'f"s3://..."', nodes: [{ label: 'f"s3://lake/dt={ds}/data.parquet"', sub: L('dinamik S3 ünvanı', 'dynamic partition URI'), icon: 'cloud', tone: 'emerald', badge: 'CLEAN' }] },
      ],
    },
  ],
};

const pythonListsSlicing: FlowSpec = {
  title: L('Siyahılar (Lists), Dilimləmə (Slicing) və İstinad Tələsi', 'Python Lists, Slicing Chunks & The Reference Trap'),
  badge: 'Lists',
  footer: L(
    'b = a yeni siyahı yaratmır, eyni yaddaş ünvanına işarə edir! Müstəqil kopya üçün b = a.copy() və ya b = a[:] istifadə edin.',
    'b = a copies the reference, not the list! Use b = a.copy() or slicing a[:] to avoid mutating upstream data.'
  ),
  rows: [
    {
      label: L('Tələ — b = a (Eyni Yaddaş İstinadı: b dəyişəndə a da korlanır!)', 'Reference Trap — b = a Points to Same Memory Object'),
      tone: 'rose',
      stages: [
        { nodes: [{ label: 'raw_batch = [10, 20, 30]', icon: 'boxes', tone: 'rose' }] },
        { arrowLabel: 'b = raw_batch', nodes: [{ label: 'b.append(999)', sub: L('raw_batch də dəyişdi!', 'mutates original list!'), icon: 'bug', tone: 'rose', badge: 'MUTATED!' }] },
      ],
    },
    {
      label: L('Təhlükəsiz — Slicing ilə Batch Hissələrə Bölmə (batch[0:500])', 'Safe — Slicing & Chunking for Batch API Ingestion'),
      tone: 'emerald',
      stages: [
        { nodes: [{ label: '10,000 Sətirlik Siyahı', icon: 'boxes', tone: 'blue' }] },
        { arrowLabel: 'rows[i : i+500]', nodes: [{ label: '20 × 500-lük Paket (Chunk)', sub: L('toplu DB INSERT üçün ideal', 'safe batch size'), icon: 'ok', tone: 'emerald', badge: 'CHUNKED ✓' }] },
      ],
    },
  ],
};

const pythonDictJson: FlowSpec = {
  title: L('Lüğətlər (Dict O(1) Hash), JSON Parsing və .get() Qalxanı', 'Dictionaries (O(1) Hash), JSON Parsing & Safe .get()'),
  badge: 'Dict & JSON',
  footer: L(
    'API-dən gələn JSON-da açar olmaya bilər: data["user"]["id"] KeyError verib pipeline-ı çökdürür, data.get("user", {}).get("id") isə təhlükəsiz None qaytarır.',
    'Never use raw bracket indexing on external JSON! Chain .get("key", default) to prevent KeyError pipeline crashes.'
  ),
  rows: [
    {
      stages: [
        { title: 'REST API Payload', nodes: [{ label: '{"event": "buy", "meta": {...}}', sub: 'JSON string', icon: 'json', tone: 'blue' }] },
        { title: 'Deserialize', arrowLabel: 'json.loads()', nodes: [{ label: 'Python dict (Hash Table)', sub: 'O(1) ani axtarış', icon: 'code', tone: 'violet' }] },
        { title: 'Safe Extraction', arrowLabel: '.get() shield', nodes: [{ label: 'row.get("discount", 0.0)', sub: L('KeyError xətası yoxdur', 'No KeyError crash'), icon: 'shield', tone: 'emerald', badge: 'O(1) SAFE' }] },
      ],
    },
  ],
};

const pythonSetsTuples: FlowSpec = {
  title: L('Set (O(1) Unikal Çoxluq) vs List (O(n) Axtarış) və Dəyişməz Tuple', 'Set O(1) Deduplication vs List O(n) Scan & Immutable Tuples'),
  badge: 'Set & Tuple',
  footer: L(
    '100,000 ID içində `x in my_list` axtarışı saatlarla çəkir (O(n)); `x in my_set` isə heş cədvəli ilə 0.001 saniyəyə bitir (O(1)).',
    'Membership testing `x in set` is O(1) instant via hashing, whereas `x in list` scans every element O(n).'
  ),
  rows: [
    {
      label: L('List Axtarışı — Hər Elementi Tək-Tək Yoxlayır (O(n) Yavaş)', 'List Lookup — Linear Scan O(n) Bottleneck'),
      tone: 'rose',
      stages: [
        { nodes: [{ label: 'seen_list (1M user_id)', icon: 'listtree', tone: 'rose' }] },
        { arrowLabel: 'if id in seen_list', nodes: [{ label: '1,000,000 Müqayisə!', sub: L('CPU 100% donur', 'quadratic slowdown'), icon: 'flame', tone: 'rose', badge: 'O(n) SLOW' }] },
      ],
    },
    {
      label: L('Set & Tuple — O(1) Ani Dublikat Silmə və Dəyişməz DB Sətri', 'Set & Tuple — O(1) Hash Lookup & Immutable Composite Keys'),
      tone: 'emerald',
      stages: [
        { nodes: [{ label: 'seen_set = set(ids)', sub: 'dublikatlar dərhal silinir', icon: 'gem', tone: 'blue' }] },
        { arrowLabel: 'hash(id)', nodes: [{ label: 'if id in seen_set (1 addım)', sub: 'Tuple: (user_id, dt) dict açarı', icon: 'zap', tone: 'emerald', badge: 'O(1) INSTANT' }] },
      ],
    },
  ],
};

const pythonConditionals: FlowSpec = {
  title: L('Şərti Məntiq və Data Keyfiyyəti Qapısı (Validation Guard)', 'Conditional Logic & Data Quality Validation Gate'),
  badge: 'Validation',
  footer: L(
    'Erkən Qaytarma (Guard Clauses) ilə çirkli və ya NULL sətirləri dərhal başlanğıcda süzün ki, əsas transformasiya təmiz qalsın.',
    'Use early guard clauses to filter out nulls and invalid records before running expensive transformations.'
  ),
  rows: [
    {
      stages: [
        { title: 'Incoming Event', nodes: [{ label: 'record = {"id": 7, "amt": -50}', icon: 'inbox', tone: 'blue' }] },
        {
          title: 'Validation Rules',
          arrowLabel: 'if / elif / else',
          nodes: [
            { label: 'if not record.get("id")', sub: '→ DROP (Null PK)', icon: 'filter', tone: 'rose' },
            { label: 'elif record["amt"] < 0', sub: '→ QUARANTINE (Anomaliya)', icon: 'bell', tone: 'amber' },
            { label: 'else: valid_row', sub: '→ LOAD TO SILVER ✓', icon: 'ok', tone: 'emerald', badge: 'PASSED' },
          ],
        },
      ],
    },
  ],
};

const pythonLoopsIteration: FlowSpec = {
  title: L('İterasiya: enumerate() İndeksi və zip() ilə Sütun-Dəyər Birləşməsi', 'Iteration Patterns: enumerate() & zip() Record Construction'),
  badge: 'Iteration',
  footer: L(
    'dict(zip(columns, row_values)) verilənlər bazası kursorundan gələn xam sətirləri bir sətirdə strukturlu JSON/Dict obyektinə çevirir.',
    'dict(zip(col_names, row_tuple)) cleanly transforms raw database cursor tuples into structured dictionaries.'
  ),
  rows: [
    {
      stages: [
        {
          title: 'Parallel Inputs',
          nodes: [
            { label: 'cols = ["id", "name", "sal"]', icon: 'table', tone: 'blue' },
            { label: 'vals = (101, "Aysel", 4500)', icon: 'listtree', tone: 'violet' },
          ],
        },
        { title: 'Pair & Index', arrowLabel: 'zip() + enumerate()', nodes: [{ label: 'dict(zip(cols, vals))', sub: 'idx, row = enumerate(batch)', icon: 'combine', tone: 'amber' }] },
        { title: 'Structured Dict', arrowLabel: 'output', nodes: [{ label: '{"id": 101, "name": "Aysel", "sal": 4500}', icon: 'json', tone: 'emerald', badge: 'READY' }] },
      ],
    },
  ],
};

const pythonFunctionsTrap: FlowSpec = {
  title: L('Modulyar Funksiyalar və Mutable Default Argument Tələsi (buf=[])', 'Modular Functions & The Mutable Default Argument Trap'),
  badge: 'Functions',
  footer: L(
    'Heç vaxt def process(row, batch=[]): yazmayın! Python default siyahını yalnız 1 dəfə yaradır və köhnə çağırışların datası bir-birinə qarışır.',
    'Never use a mutable default like def fn(x, buf=[]):! Python evaluates default args once at definition time, leaking state across calls.'
  ),
  rows: [
    {
      label: L('Tələ — def parse(x, errors=[]): (Köhnə Xətalar Yeni Batch-ə Sızır!)', 'Bug — Mutable Default errors=[] Persists Across Function Calls!'),
      tone: 'rose',
      stages: [
        { nodes: [{ label: 'Call 1: parse(row1)', sub: 'errors → ["err1"]', icon: 'code', tone: 'rose' }] },
        { arrowLabel: 'shared list!', nodes: [{ label: 'Call 2: parse(row2)', sub: 'errors → ["err1", "err2"] (Sızma!)', icon: 'bug', tone: 'rose', badge: 'STATE LEAK' }] },
      ],
    },
    {
      label: L('Qızıl Qayda — def parse(x, errors=None): if errors is None: errors = []', 'Gold Standard — Use None Sentinel & Pure Type-Hinted Functions'),
      tone: 'emerald',
      stages: [
        { nodes: [{ label: 'def clean(r: dict, err: list | None = None)', icon: 'code', tone: 'blue' }] },
        { arrowLabel: 'pure function', nodes: [{ label: 'Hər Çağırış Tam İzolyasiyalı', sub: 'Unit test üçün 100% təhlükəsiz', icon: 'shield', tone: 'emerald', badge: 'PURE ✓' }] },
      ],
    },
  ],
};

const pythonComprehensions: FlowSpec = {
  title: L('List & Dict Comprehensions: Bir Sətirdə C-Sürətli Transformasiya', 'List & Dict Comprehensions: Vectorized Single-Line Transforms'),
  badge: 'Comprehension',
  footer: L(
    'List comprehension adi for + .append() dövrəsindən həm daha oxunaqlıdır, həm də CPython daxilində ~2x daha sürətli icra olunur.',
    'Comprehensions execute bytecode-level appends without method lookup overhead, running ~2x faster than manual for-loops.'
  ),
  rows: [
    {
      stages: [
        { title: 'Raw Batch', nodes: [{ label: 'users = [{"id": 1, "active": True}, ...]', icon: 'boxes', tone: 'slate' }] },
        { title: 'Filter + Transform', arrowLabel: '[x for x in ... if ...]', nodes: [{ label: '[u["id"] for u in users if u["active"]]', sub: 'Dict: {u["id"]: u["name"]}', icon: 'zap', tone: 'violet', badge: '2x FASTER' }] },
        { title: 'Clean Output', arrowLabel: 'result', nodes: [{ label: 'active_ids = [1, 4, 9, 12]', icon: 'ok', tone: 'emerald' }] },
      ],
    },
  ],
};

const pythonErrorHandlingDlq: FlowSpec = {
  title: L('Defensive Pipelines: try/except, Context Manager və Dead-Letter Queue (DLQ)', 'Defensive Pipelines: try/except, Context Managers & Dead-Letter Queue'),
  badge: 'DLQ Pattern',
  footer: L(
    '1 milyon sətirdən 1-i xarabdırsa, bütün ETL pipeline-ı çökməməlidir! Xətalı sətri tutub Dead-Letter Queue (DLQ) cədvəlinə yazın və davam edin.',
    'A single malformed record out of 1M must not crash the nightly batch! Route bad rows to a Dead-Letter Queue (DLQ) for inspection.'
  ),
  rows: [
    {
      stages: [
        { title: 'with open() Stream', nodes: [{ label: '1,000,000 JSON Sətir', sub: 'avtomatik fayl bağlama', icon: 'file', tone: 'blue' }] },
        {
          title: 'try / except Block',
          arrowLabel: 'parse & validate',
          nodes: [
            { label: 'try: 999,995 Təmiz Sətir', sub: '→ Target Data Warehouse ✓', icon: 'db', tone: 'emerald', badge: 'SUCCESS' },
            { label: 'except ValueError: 5 Xətalı Sətir', sub: '→ s3://lake/dlq/bad_rows.json', icon: 'inbox', tone: 'amber', badge: 'DLQ SAVED' },
          ],
        },
      ],
    },
  ],
};

const pythonRestApiIngestion: FlowSpec = {
  title: L('REST API Data Toplanması: Səhifələmə, Rate Limit və Exponential Backoff', 'REST API Ingestion: Cursor Pagination, Rate Limit & Exponential Backoff'),
  badge: 'API Ingestion',
  footer: L(
    '429 Too Many Requests xətası zamanı dərhal təkrar sorğu göndərməyin! Gözləmə müddətini 2^attempt düsturu ilə artırın.',
    'Never retry immediately on HTTP 429 Too Many Requests! Scale delays exponentially (2^attempt) with random jitter.'
  ),
  rows: [
    {
      stages: [
        { title: '1. API Request', nodes: [{ label: 'GET /v1/events?cursor=evt_100', sub: 'Bearer token auth', icon: 'cloud', tone: 'blue' }] },
        {
          title: '2. Status Guard',
          arrowLabel: 'HTTP status',
          nodes: [
            { label: '200 OK: 100 Sətir', sub: '→ növbəti cursor səhifəsi', icon: 'ok', tone: 'emerald', badge: 'PAGE ✓' },
            { label: '429 / 503: Rate Limit', sub: 'sleep(base * 2^attempt + jitter)', icon: 'clock', tone: 'amber', badge: 'BACKOFF' },
          ],
        },
        { title: '3. Lake Storage', arrowLabel: 'append', nodes: [{ label: 's3://lake/bronze/events/', sub: 'Parquet / JSONL batch', icon: 'db', tone: 'emerald', badge: 'STORED' }] },
      ],
    },
  ],
};

const pythonPandasBasics: FlowSpec = {
  title: L('Pandas Vektorlaşdırma vs Sətir Dövrəsi (.iterrows()) və NULL İdarəsi', 'Pandas Vectorization vs Row Iteration (.iterrows()) & Missing Data'),
  badge: 'Pandas Vectorization',
  footer: L(
    '.iterrows() təmiz Python interpretasiyası olduğu üçün ləngdir; vektorlaşdırma isə compiled C/NumPy buferlərində 100x sürətlə icra olunur.',
    '.iterrows() runs in slow interpreted Python; vectorized expressions delegate directly to compiled C/NumPy memory buffers.'
  ),
  rows: [
    {
      label: L('Anti-Pattern — for idx, row in df.iterrows(): (Dəqiqələrlə Donma)', 'Anti-Pattern — .iterrows() Row-by-Row Interpretation (100x Slower)'),
      tone: 'rose',
      stages: [
        { nodes: [{ label: '100,000 Sətirlik DataFrame', icon: 'table', tone: 'rose' }] },
        { arrowLabel: '.iterrows()', nodes: [{ label: '100,000 Python Series Obyekti', sub: L('Hər sətir üçün overhead', 'Pure Python loop'), icon: 'flame', tone: 'rose', badge: '100x SLOWER' }] },
      ],
    },
    {
      label: L('Standart — df["tax"] = df["amt"] * 0.18 & fillna(0.0) (C-Sürətli)', 'Gold Standard — Vectorized C Execution & Defensive fillna(0.0)'),
      tone: 'emerald',
      stages: [
        { nodes: [{ label: 'fillna(0.0) + SIMD Array', sub: 'NumPy C-Memory buffer', icon: 'boxes', tone: 'blue' }] },
        { arrowLabel: 'compiled C', nodes: [{ label: 'Vektor Hesablama (1 addım)', sub: L('Bütün sütun eyni anda hesablanır', 'SIMD processor parallelism'), icon: 'zap', tone: 'emerald', badge: 'VECTORIZED ✓' }] },
        { arrowLabel: 'groupby()', nodes: [{ label: 'Aggregated Metrics', sub: 'clean grouped KPIs', icon: 'trophy', tone: 'emerald', badge: 'CLEAN' }] },
      ],
    },
  ],
};

/* ==================================== SQL ==================================== */

const sqlSelectWhere: FlowSpec = {
  title: L('SQL Sorğusunun Həqiqi İcra Ardıcıllığı: FROM → WHERE → SELECT', 'SQL Logical Query Execution Order: FROM → WHERE → SELECT'),
  badge: 'Execution Order',
  footer: L(
    'SQL-də SELECT ilk yazılsa da, mühərrik əvvəlcə FROM ilə cədvəli tapır, WHERE ilə sətirləri süzür və ən sonda SELECT sütunlarını hesablayır!',
    'Although SELECT is written first, the database engine executes FROM first, filters rows with WHERE second, and projects SELECT aliases last!'
  ),
  rows: [
    {
      stages: [
        { title: '1. FROM', nodes: [{ label: 'FROM orders', sub: L('cədvəli diskdən götürür', 'load source table'), icon: 'db', tone: 'blue' }] },
        { title: '2. WHERE', arrowLabel: 'row filter', nodes: [{ label: "WHERE status = 'PAID' AND amt > 100", sub: L('lazımsız sətirləri atır', 'early row pruning'), icon: 'filter', tone: 'violet', badge: 'BEFORE SELECT' }] },
        { title: '3. SELECT', arrowLabel: 'project cols', nodes: [{ label: 'SELECT user_id, amt * 1.18 AS total', sub: L('yalnız qalan sətirlər üçün', 'compute aliases'), icon: 'table', tone: 'emerald' }] },
      ],
    },
  ],
};

const sqlOrderByLimit: FlowSpec = {
  title: L('DISTINCT, ORDER BY və LIMIT/OFFSET ilə Top-N Analitika', 'DISTINCT Deduplication, ORDER BY Sorting & LIMIT Pagination'),
  badge: 'Top-N Sort',
  footer: L(
    'Milyardlarla sətirdə LIMIT olmadan ORDER BY etmək RAM-ı doldurur (Disk Spill). ORDER BY + LIMIT N isə yalnız Top-N kopiyanı yaddaşda saxlayır.',
    'Combining ORDER BY with LIMIT N allows the engine to use an in-memory Top-N heap instead of sorting the entire table on disk.'
  ),
  rows: [
    {
      stages: [
        { title: '1. DISTINCT', nodes: [{ label: 'SELECT DISTINCT country', sub: L('dublikatları təmizləyir', 'remove duplicates'), icon: 'gem', tone: 'blue' }] },
        { title: '2. ORDER BY', arrowLabel: 'sort heap', nodes: [{ label: 'ORDER BY revenue DESC, id ASC', sub: L('NULLS LAST standartı', 'deterministic sort'), icon: 'listtree', tone: 'violet' }] },
        { title: '3. LIMIT / OFFSET', arrowLabel: 'slice top N', nodes: [{ label: 'LIMIT 10 OFFSET 0', sub: L('Yalnız ən böyük 10 sətir', 'Top-10 rows returned'), icon: 'trophy', tone: 'emerald', badge: 'TOP 10' }] },
      ],
    },
  ],
};

const sqlKeysNormalization: FlowSpec = {
  title: L('Əsas Açar (PK), Xarici Açar (FK) və 1NF → 2NF → 3NF Normallaşdırma', 'Primary Key, Foreign Key & 1NF → 2NF → 3NF Normalization'),
  badge: '3NF Integrity',
  footer: L(
    'OLTP bazalarda 3NF təkrarlanmanı (redundancy) və yeniləmə anomaliyalarını sıfırlayır; Xarici Açar (FK) isə yetim sətirlərin qarşısını alır.',
    '3NF eliminates update anomalies in OLTP databases, while Foreign Keys enforce referential integrity between tables.'
  ),
  rows: [
    {
      stages: [
        { title: '1NF (Atomik)', nodes: [{ label: 'Hər Xanada 1 Dəyər', sub: L('vergüllü siyahılar bölünür', 'no repeating arrays'), icon: 'table', tone: 'blue' }] },
        { title: '2NF (Tam Asılılıq)', arrowLabel: 'split PK', nodes: [{ label: 'Qismən Asılılıq Silinir', sub: L('məhsul adı ayrı cədvələ', 'depend on whole PK'), icon: 'split', tone: 'violet' }] },
        { title: '3NF (Tranzitiv Yoxdur)', arrowLabel: 'PK ↔ FK', nodes: [{ label: 'users (PK) ← orders (FK)', sub: L('0 dublikat · Tam bütövlük', 'Zero data redundancy'), icon: 'link', tone: 'emerald', badge: '3NF CLEAN' }] },
      ],
    },
  ],
};

const sqlGroupByHaving: FlowSpec = {
  title: L('Aqreqasiya Pipeline-ı: WHERE (Sətir Filtri) vs GROUP BY vs HAVING (Qrup Filtri)', 'Aggregation Pipeline: WHERE (Pre-Filter) vs GROUP BY vs HAVING (Post-Filter)'),
  badge: 'GROUP BY',
  footer: L(
    'Qızıl Qayda: Qruplaşdırmadan əvvəl sətirləri WHERE ilə süzün ki, GROUP BY heş cədvəli kiçik olsun; HAVING yalnız SUM/COUNT nəticəsi üçündür!',
    'Filter raw rows with WHERE before GROUP BY to shrink the hash table; use HAVING strictly for conditions on aggregate functions!'
  ),
  rows: [
    {
      stages: [
        { title: '1. WHERE (Sətir)', nodes: [{ label: "WHERE year = 2026", sub: L('Aqreqasiyadan ƏVVƏL süzür', 'Filters raw rows first'), icon: 'filter', tone: 'blue', badge: 'PRE-FILTER' }] },
        { title: '2. GROUP BY', arrowLabel: 'bucket & sum', nodes: [{ label: 'GROUP BY dept_id', sub: 'COUNT(*) · SUM(sal) · AVG(sal)', icon: 'boxes', tone: 'violet' }] },
        { title: '3. HAVING (Qrup)', arrowLabel: 'group filter', nodes: [{ label: 'HAVING COUNT(*) > 5', sub: L('Aqreqasiyadan SONRA süzür', 'Filters aggregated groups'), icon: 'ok', tone: 'emerald', badge: 'POST-FILTER' }] },
      ],
    },
  ],
};

const sqlStringDateClean: FlowSpec = {
  title: L('SQL ilə Mətn və Tarix Təmizlənməsi: TRIM, LOWER, DATE_TRUNC, EXTRACT', 'SQL String & Date Standardization: TRIM, LOWER, DATE_TRUNC'),
  badge: 'Data Cleaning',
  footer: L(
    'DATE_TRUNC("month", created_at) saniyə dəqiqliyində olan zaman damğalarını ayın 1-nə yuvarlaqlaşdıraraq aylıq kohort və gəlir qruplaşması yaradır.',
    'DATE_TRUNC buckets granular timestamps into clean daily, weekly, or monthly intervals for time-series reporting.'
  ),
  rows: [
    {
      stages: [
        {
          title: 'Raw Columns',
          nodes: [
            { label: 'email: "  User@Mail.AZ "', icon: 'file', tone: 'rose' },
            { label: 'ts: "2026-10-19 16:45:12"', icon: 'clock', tone: 'rose' },
          ],
        },
        {
          title: 'SQL Functions',
          arrowLabel: 'transform',
          nodes: [
            { label: 'LOWER(TRIM(email))', sub: 'SPLIT_PART(email, "@", 2)', icon: 'wrench', tone: 'blue' },
            { label: "DATE_TRUNC('month', ts)", sub: 'EXTRACT(DOW FROM ts)', icon: 'calendar', tone: 'violet' },
          ],
        },
        {
          title: 'Analytics Ready',
          arrowLabel: 'clean',
          nodes: [
            { label: '"user@mail.az" · "2026-10-01"', sub: L('JOIN və GROUP BY üçün tam uyğun', 'Canonical keys'), icon: 'ok', tone: 'emerald', badge: 'STANDARDIZED' },
          ],
        },
      ],
    },
  ],
};

const sqlCaseCoalesce: FlowSpec = {
  title: L('Şərti Transformasiya və NULL Qalxanı: CASE WHEN, COALESCE, NULLIF', 'Conditional Logic & NULL Defense: CASE WHEN, COALESCE & NULLIF'),
  badge: 'NULL Safety',
  footer: L(
    'SQL-də `100 + NULL = NULL`! Hesablamalarda COALESCE(col, 0) ilə NULL-ları sıfırlayın, bölmədə isə NULLIF(denominator, 0) ilə xətanın qarşısını alın.',
    'In SQL any arithmetic with NULL yields NULL! Wrap nullable metrics in COALESCE(x, 0) and guard division with NULLIF(divisor, 0).'
  ),
  rows: [
    {
      stages: [
        { title: 'COALESCE', nodes: [{ label: 'COALESCE(discount, 0)', sub: L('İlk NULL olmayanı seçir', 'Replaces NULL with 0'), icon: 'shield', tone: 'blue', badge: 'NO NULL' }] },
        { title: 'NULLIF', arrowLabel: 'safe divide', nodes: [{ label: 'rev / NULLIF(orders, 0)', sub: L('0-a bölmə xətasını önləyir', 'Prevents division by zero'), icon: 'zap', tone: 'violet' }] },
        { title: 'CASE WHEN', arrowLabel: 'segment', nodes: [{ label: "WHEN rev > 1000 THEN 'VIP' ELSE 'Std'", sub: L('Sütun daxili PIVOT & seqment', 'In-query bucketing'), icon: 'trophy', tone: 'emerald', badge: 'SEGMENTED' }] },
      ],
    },
  ],
};

const sqlCteVsSubquery: FlowSpec = {
  title: L('CTE (WITH — Common Table Expressions) vs İç-İçə Subquery Piramidası', 'Modular CTEs (WITH Clause) vs Nested Subquery Pyramids'),
  badge: 'CTE Pipeline',
  footer: L(
    'CTE (Common Table Expressions) mürəkkəb 200 sətirlik sorğunu yuxarıdan aşağıya oxunan təmiz məntiqi addımlara bölür (dbt modellərinin əsasıdır).',
    'CTEs break monolithic nested subqueries into readable, testable top-to-bottom pipeline steps.'
  ),
  rows: [
    {
      label: L('İç-İçə Subquery — İçəridən Çölə Oxunan Qarışıq Spagetti Kod', 'Nested Subqueries — Hard-to-Debug Inside-Out Pyramid'),
      tone: 'rose',
      stages: [
        { nodes: [{ label: 'SELECT * FROM (SELECT * FROM (SELECT ...))', sub: L('Oxumaq və test etmək çox çətindir', 'Unreadable & non-reusable'), icon: 'bug', tone: 'rose', badge: 'SPAGHETTI' }] },
      ],
    },
    {
      label: L('Müasir CTE (WITH) — Yuxarıdan Aşağıya Modulyar Pipeline', 'Modern CTE — Linear, Reusable Step-by-Step Pipeline'),
      tone: 'emerald',
      stages: [
        { nodes: [{ label: 'WITH clean_orders AS (...)', icon: 'filter', tone: 'blue' }] },
        { arrowLabel: 'reuse', nodes: [{ label: 'user_metrics AS (...)', icon: 'combine', tone: 'violet' }] },
        { arrowLabel: 'final', nodes: [{ label: 'SELECT * FROM user_metrics', sub: L('Təmiz və aydın', 'Clean & maintainable'), icon: 'ok', tone: 'emerald', badge: 'MODULAR ✓' }] },
      ],
    },
  ],
};

const sqlSetOperations: FlowSpec = {
  title: L('Çoxluq Əməliyyatları: UNION ALL vs UNION vs INTERSECT vs EXCEPT', 'SQL Set Operations: UNION ALL, UNION, INTERSECT & EXCEPT'),
  badge: 'Set Ops',
  footer: L(
    'Dublikatların silinməsi lazım deyilsə həmişə UNION ALL yazın! Adi UNION bütün cədvəli sıralayıb dublikat axtardığı üçün əhəmiyyətli dərəcədə yavaşdır.',
    'Always prefer UNION ALL unless deduplication is strictly required — plain UNION triggers an expensive full-table sort!'
  ),
  rows: [
    {
      stages: [
        { title: 'UNION ALL', nodes: [{ label: 'Sürətli Alt-Alta Birləşdirmə', sub: L('Sıralama yoxdur · Dublikat qalır', '0 sort overhead · Fastest'), icon: 'zap', tone: 'emerald', badge: 'FASTEST' }] },
        { title: 'UNION', arrowLabel: 'vs', nodes: [{ label: 'Birləşdir + Dublikatı Sil', sub: L('Ağır Sort/Hash əməliyyatı', 'Deduplicates rows'), icon: 'layers', tone: 'blue' }] },
        { title: 'INTERSECT', arrowLabel: 'vs', nodes: [{ label: 'Hər İki Cədvəldə Ortaq', sub: 'A ∩ B kəsişməsi', icon: 'combine', tone: 'violet' }] },
        { title: 'EXCEPT / MINUS', arrowLabel: 'vs', nodes: [{ label: 'A-da Olub B-də Olmayan', sub: 'Data diff & barışıq testi', icon: 'split', tone: 'amber', badge: 'QA DIFF' }] },
      ],
    },
  ],
};

const sqlIndexesBTree: FlowSpec = {
  title: L('İndekslər, B-Tree Strukturu və EXPLAIN QUERY PLAN', 'Indexes, B-Tree Traversal & EXPLAIN QUERY PLAN'),
  badge: 'B-Tree & EXPLAIN',
  footer: L(
    'İndeks O(N) tam skanı O(log N) axtarışına çevirir; lakin hər yeni indeks INSERT/UPDATE/DELETE əməliyyatlarını yavaşladır!',
    'Indexes convert O(N) full scans into O(log N) seeks; however, each extra index degrades INSERT/UPDATE write throughput.'
  ),
  rows: [
    {
      label: L('Full Table Scan (SCAN users) — Bütün Diski Ardıcıl Oxuyur', 'Full Table Scan (SCAN) — Sequential Disk Read O(N)'),
      tone: 'rose',
      stages: [
        { nodes: [{ label: '1,000,000 Sətir (Disk)', icon: 'db', tone: 'rose' }] },
        { arrowLabel: 'SCAN users', nodes: [{ label: 'Blok-blok Skan', sub: L('Yüksək disk I/O və gecikmə', 'High disk I/O bottleneck'), icon: 'flame', tone: 'rose', badge: 'O(N) SCAN' }] },
      ],
    },
    {
      label: L('B-Tree İndeksi (SEARCH USING INDEX) — Loqarifmik Sürətli Tapıntı', 'B-Tree Index (SEARCH) — Direct Pointer Seek O(log N)'),
      tone: 'emerald',
      stages: [
        { nodes: [{ label: 'Root Node', sub: 'A – Z aralığı', icon: 'listtree', tone: 'blue' }] },
        { arrowLabel: 'Index Seek', nodes: [{ label: 'Leaf Node + RowID', sub: L('3 səviyyəli keçid', 'O(log N) tree hop'), icon: 'zap', tone: 'violet' }] },
        { arrowLabel: 'table fetch', nodes: [{ label: 'Target Record', sub: L('Dərhal tapıldı', 'Instant record lookup'), icon: 'ok', tone: 'emerald', badge: 'O(log N) ✓' }] },
      ],
    },
  ],
};

const sqlThreeValuedLogic: FlowSpec = {
  title: L('SQL Üçqiymətli Məntiqi (3VL) və NULL Tələləri: TRUE, FALSE, UNKNOWN', 'SQL Three-Valued Logic (3VL) & NULL Traps: TRUE, FALSE, UNKNOWN'),
  badge: '3VL & NULL',
  footer: L(
    'SQL-də `col = NULL` həmişə UNKNOWN verir (0 sətir seçilir)! NOT IN tərkibində bircə NULL varsa, bütün sorğu boş qayıdır.',
    'In SQL `col = NULL` always yields UNKNOWN! A single NULL in a NOT IN subquery collapses the entire query to 0 rows.'
  ),
  rows: [
    {
      label: L('Tələ — col = NULL və NOT IN (..., NULL) (0 Sətir Qaytarır!)', 'Trap — col = NULL & NOT IN (..., NULL) Returns 0 Rows!'),
      tone: 'rose',
      stages: [
        { nodes: [{ label: "WHERE country = NULL", icon: 'filter', tone: 'rose' }] },
        { arrowLabel: 'evaluates to', nodes: [{ label: 'UNKNOWN!', sub: L('WHERE yalnız TRUE qəbul edir', 'Only TRUE passes WHERE'), icon: 'bug', tone: 'rose', badge: '0 ROWS' }] },
        { arrowLabel: 'x NOT IN (1, NULL)', nodes: [{ label: 'x != NULL → UNKNOWN', sub: L('Bütün sorğu partlayır', 'Collapses whole filter'), icon: 'flame', tone: 'rose', badge: 'EMPTY SET' }] },
      ],
    },
    {
      label: L('Təhlükəsiz — IS NULL, NOT EXISTS və COALESCE Qalxanı', 'Defensive — IS NULL, NOT EXISTS & COALESCE Guard'),
      tone: 'emerald',
      stages: [
        { nodes: [{ label: 'WHERE country IS NULL', icon: 'shield', tone: 'blue' }] },
        { arrowLabel: 'deterministic', nodes: [{ label: 'TRUE / FALSE', sub: L('2-qiymətli dəqiq filtr', 'Two-valued logic'), icon: 'ok', tone: 'violet' }] },
        { arrowLabel: 'clean', nodes: [{ label: "COALESCE(c, 'N/A')", sub: L('Hesablamalar üçün təhlükəsiz', 'Safe for aggregations'), icon: 'trophy', tone: 'emerald', badge: '3VL SAFE ✓' }] },
      ],
    },
  ],
};

/* ================================== REGISTRY ================================== */

const flow = (spec: FlowSpec) => () => <FlowDiagram spec={spec} />;
const hub = (spec: HubSpec) => () => <HubSpokeDiagram spec={spec} />;

const REGISTRY: Record<string, () => React.ReactNode> = {
  // 1. DATA ARCHITECTURE (13/13 Complete)
  'data_architecture:01-oltp-vs-olap-columnar': () => <ColumnarScanViz />,
  'data_architecture:02-what-is-dwh-why-needed': flow(dwhWhy),
  'data_architecture:03-evolution-dwh-lake-lakehouse': flow(evolution),
  'data_architecture:04-dimensional-modeling-kimball': flow(kimballFourSteps),
  'data_architecture:05-fact-and-dimension-tables': flow(factVsDim),
  'data_architecture:06-star-vs-snowflake-schema': hub(starSchema),
  'data_architecture:07-slowly-changing-dimensions-scd': flow(scdTypes),
  'data_architecture:08-medallion-architecture-layers': () => <MedallionViz />,
  'data_architecture:09-open-table-formats-delta-iceberg': flow(openTableFormats),
  'data_architecture:10-partitioning-bucketing-zorder': () => <DataSkippingViz />,
  'data_architecture:11-etl-vs-elt-evolution': flow(etlVsElt),
  'data_architecture:12-data-quality-lineage-governance': hub(dataGovernance),
  'data_architecture:13-batch-vs-streaming-cdc': flow(batchVsStreamingCdc),

  // 2. DBT (6/6 Complete)
  'dbt:01-what-is-dbt-elt-philosophy': flow(dbtLineage),
  'dbt:02-models-ref-and-sources': flow(dbtModelsRef),
  'dbt:03-materializations-view-table-incremental': flow(dbtMaterializations),
  'dbt:04-testing-and-data-quality': flow(dbtTests),
  'dbt:05-snapshots-automated-scd2': flow(dbtSnapshots),
  'dbt:06-docs-seeds-and-project-structure': flow(dbtProjectStructure),

  // 3. KAFKA (12/12 Complete)
  'kafka:01-what-is-kafka': flow(kafkaWhat),
  'kafka:02-architecture-cluster-kraft': flow(kafkaKraft),
  'kafka:03-topics-partitions-log': () => <PartitionLogViz />,
  'kafka:04-offsets-ordering': flow(kafkaOffsetsOrdering),
  'kafka:05-producer-keys-partitioner': () => <ProducerPartitionerViz />,
  'kafka:06-producer-acks-idempotence': flow(kafkaProducerAcks),
  'kafka:07-replication-isr-leader': hub(kafkaReplication),
  'kafka:08-consumer-consumer-groups': flow(kafkaGroups),
  'kafka:09-rebalance-offset-commit': flow(kafkaRebalanceCommit),
  'kafka:10-delivery-semantics-eos': flow(kafkaDeliverySemantics),
  'kafka:11-retention-log-compaction': () => <LogCompactionViz />,
  'kafka:12-consumer-lag-ecosystem': hub(kafkaLagEcosystem),

  // 4. SPARK (12/12 Complete)
  'spark:01-what-is-spark': flow(sparkInMemory),
  'spark:02-architecture-cluster': flow(sparkArch),
  'spark:03-execution-dag-lazy': flow(sparkDag),
  'spark:04-narrow-wide-shuffle': () => <ShuffleViz />,
  'spark:05-dataframe-operations': flow(sparkDataFrameOps),
  'spark:06-partitions-coalesce': flow(sparkRepartitionCoalesce),
  'spark:07-joins-broadcast': flow(sparkJoins),
  'spark:08-window-functions': () => <WindowFunctionViz />,
  'spark:09-caching-memory-oom': flow(sparkCachingOom),
  'spark:10-data-skew-salting': flow(sparkSkewSalting),
  'spark:11-file-formats-parquet': flow(sparkParquetPushdown),
  'spark:12-catalyst-explain-plan': flow(sparkCatalystPlan),

  // 5. AIRFLOW (12/12 Complete)
  'airflow:01-what-is-airflow': flow(airflowWhat),
  'airflow:02-architecture-components': hub(airflowArch),
  'airflow:03-operators-tasks-dependencies': flow(airflowDeps),
  'airflow:04-taskflow-api-decorators': flow(airflowTaskflow),
  'airflow:05-xcoms-data-sharing': flow(airflowXcoms),
  'airflow:06-scheduling-data-interval': flow(airflowDataInterval),
  'airflow:07-catchup-backfill-idempotence': flow(airflowIdempotence),
  'airflow:08-branching-trigger-rules': () => <BranchingViz />,
  'airflow:09-sensors-hooks-connections': flow(airflowSensors),
  'airflow:10-executors-local-celery-k8s': flow(airflowExecutors),
  'airflow:11-dynamic-task-mapping-groups': flow(airflowDynamicMapping),
  'airflow:12-monitoring-sla-antipatterns': flow(airflowMonitoring),

  // 6. DEVOPS (12/12 Complete)
  'devops:01-linux-bash-scripting': flow(devopsLinuxBash),
  'devops:02-git-github-collaboration': flow(devopsGitFlow),
  'devops:03-containers-docker-vs-vm': () => <ContainerVsVmViz />,
  'devops:04-docker-cli-lifecycle': flow(devopsDockerLifecycle),
  'devops:05-dockerfile-builds': flow(dockerBuild),
  'devops:06-layers-caching-multistage': flow(devopsMultiStage),
  'devops:07-storage-volumes-mounts': flow(devopsVolumesMounts),
  'devops:08-networking-service-discovery': hub(devopsDockerNetwork),
  'devops:09-docker-compose-stack': hub(composeStack),
  'devops:10-secrets-env-security': flow(devopsSecretsSecurity),
  'devops:11-cicd-github-actions': flow(cicd),
  'devops:12-kubernetes-monitoring-observability': hub(devopsK8sMonitoring),

  // 7. SQL (12/12 Complete)
  'sql:01-select-where': flow(sqlSelectWhere),
  'sql:02-order-by-limit': flow(sqlOrderByLimit),
  'sql:03-keys-normalization': flow(sqlKeysNormalization),
  'sql:04-joins': () => <JoinVenn />,
  'sql:05-aggregations-group-by': flow(sqlGroupByHaving),
  'sql:06-string-date-functions': flow(sqlStringDateClean),
  'sql:07-case-coalesce': flow(sqlCaseCoalesce),
  'sql:08-window-functions': () => <WindowFunctionViz />,
  'sql:09-ctes-subqueries': flow(sqlCteVsSubquery),
  'sql:10-set-operations': flow(sqlSetOperations),
  'sql:11-indexes-b-tree-explain': flow(sqlIndexesBTree),
  'sql:12-three-valued-logic-null': flow(sqlThreeValuedLogic),

  // 8. PYTHON (13/13 Complete)
  'python:01-variables-types': flow(pythonVariablesTypes),
  'python:02-string-operations': flow(pythonStringOps),
  'python:03-lists-slicing': flow(pythonListsSlicing),
  'python:04-dictionaries-json': flow(pythonDictJson),
  'python:05-sets-tuples': flow(pythonSetsTuples),
  'python:06-conditionals-logic': flow(pythonConditionals),
  'python:07-loops-iteration': flow(pythonLoopsIteration),
  'python:08-functions-modularity': flow(pythonFunctionsTrap),
  'python:09-comprehensions': flow(pythonComprehensions),
  'python:10-error-handling-files': flow(pythonErrorHandlingDlq),
  'python:11-generators-memory': flow(generators),
  'python:12-rest-api-ingestion-retry': flow(pythonRestApiIngestion),
  'python:13-pandas-basics-dataframes': flow(pythonPandasBasics),
};

export function hasAnimatedInfographic(moduleId: string, lessonId: string): boolean {
  return `${moduleId}:${lessonId}` in REGISTRY;
}

export function AnimatedInfographic({ moduleId, lessonId }: { moduleId: string; lessonId: string }) {
  const render = REGISTRY[`${moduleId}:${lessonId}`];
  return render ? <>{render()}</> : null;
}

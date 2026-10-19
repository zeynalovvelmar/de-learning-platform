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
| **Mərhələ 5: Google Stitch UI İnteqrasiyası** | ⏳ **GÖZLƏYİR (İstifadəçi Stitch-də generasiya edir)** | İstifadəçinin Google Stitch üzərində yaradacağı yeni peşəkar UI konseptinin qəbul edilməsi və layihəyə tam tətbiq edilməsi. |

---

## 🛠️ Detallı Addımlar və Tərəqqi

### 1. Peşəkar Giriş Səhifəsi (Home Hub / Dashboard) [✅ TAMAMLANDI]
- [x] `frontend/src/components/HomeHub.tsx` yaradıldı.
- [x] **Hero Bölməsi**: "Data Mühəndisliyi Bilik Bazası" təqdimatı.
- [x] **Pipeline Xəritəsi**: Məlumatın hərəkət axını (Sources ➔ Kafka ➔ Spark ➔ Lakehouse ➔ dbt ➔ Airflow).
- [x] **8 Modul Kartı**: Hər modul üçün təmiz texnoloji kart və dərslərə birbaşa keçid.
- [x] **Son Dərsi Davam Et**: localStorage vasitəsilə son oxunan dərsin yadda saxlanması və tək kliklə bərpa edilməsi.

### 2. Header & Shell Təmizlənməsi (Stripe / Geist Standartı) [✅ TAMAMLANDI]
- [x] Yuxarı paneldəki "🔥 1 gün", "0 XP", "Junior DE" bəzəkləri tamamilə silindi.
- [x] Minimalist Loqo (Kliklədikdə həmişə Giriş İcmal Səhifəsinə qayıdır).
- [x] Dil (`AZ` / `EN`) və Tema (`Light` / `Dark`) dəyişdiricisi.
- [x] Dərs daxilində olduqda aktiv modul və dərs adını göstərən təmiz naviqasiya yolu (breadcrumb).

### 3. Dərs Oxu Səhifəsi (3-Sütunlu Tədqiqat Mühiti) [✅ TAMAMLANDI]
- [x] **Sol Sidebar**: 8 modul və dərslərin təmiz ağacı, ən başda "🏠 İcmal & Yol Xəritəsi" linki, sakit neytral ikonlar.
- [x] **Mərkəz (Reading Well)**: $700\text{px}$ en, sətirlər arası $1.75$ məsafə, sakit semantik bloklar (TL;DR, Nəzəriyyə, İstehsalat Qaydaları).
- [x] **Sağ (Table of Contents)**: `TableOfContents.tsx` vasitəsilə dərsin alt başlıqlarını izləyən və istifadəçi oxuduqca sürüşən sağ panel.
- [x] **Fərdi Qeydlər (Konspekt)**: Hər dərsin altında istifadəçinin öz sözləri ilə qeyd yaza biləcəyi və avtomatik saxlanan sahə.
- [x] **Dərslər Arası Naviqasiya**: Dərsin sonunda "Əvvəlki Dərs" və "Növbəti Dərs" düymələri.

### 4. Diaqramlar və Qrafiklər (ByteByteGo Standartı) [✅ TAMAMLANDI]
- [x] **SQL Birləşmələri (`JoinVenn.tsx`)**: Venn dairələri ləğv edildi; `users` və `orders` cədvəlləri, sətir-sətir uyğunluq rəngləri, icra edilən SQL və `<NULL>` göstəricili nəticə cədvəli yaradıldı (INNER, LEFT, RIGHT, FULL, LEFT ANTI).
- [x] **Medallion Arxitekturası (`MedallionViz.tsx`)**: Ingestion ➔ Bronze ➔ Silver ➔ Gold ➔ BI/ML axını; hər təbəqə üçün interaktiv klikləmə, Sxem qaydası (Strict vs Schema-on-read), Saxlanma müddəti və real production SQL transformasiyası (`MERGE INTO`).
- [x] **Virtual Machine vs Docker (`ContainerVsVmViz.tsx`)**: ByteByteGo standartında şaquli yığılmış laylar (Apps ➔ Bins/Libs ➔ Guest OS 10-20GB vs Docker Engine / Shared Kernel ➔ Hardware) və Performans/Resurs müqayisə matrisi.
- [x] **Columnar vs Row Storage (`ColumnarScanViz.tsx`)**: OLTP vs OLAP fiziki disk oxuma fərqi, analitik sorğu vs tək sətir axtarışı və disk müraciəti faiz göstəriciləri.
- [x] **Apache Kafka Partisiyaları (`PartitionLogViz.tsx`)**: Dynamic `murmur2(key) % 3` Producer axını və real-vaxtda P0, P1, P2 append-only offset yuvalarının dolması.
- [x] **Apache Spark Shuffle (`ShuffleViz.tsx`)**: Narrow dependency (eyni stage daxilində filtrasiya) vs Wide dependency (şəbəkə və disk üzərindən shuffle axını).
- [x] **dbt Lineage & Testlər (`FlowDiagram.tsx` + `globals.css`)**: 5 mərhələli dbt axınında kəsilmələrin ləğvi, tam model adları (`int_orders_joined`, `dim_customers`) və oxlar üzərində təmiz `ref()` nişanları.

### 5. Google Stitch UI İnteqrasiyası [⏳ GÖZLƏYİR]
- [ ] İstifadəçinin Google Stitch-də generasiya etdiyi yeni UI konseptinin qəbul edilməsi.
- [ ] Bəyənilən dizaynın layihənin Next.js, Tailwind və komponent arxitekturasına tam tətbiq edilməsi.

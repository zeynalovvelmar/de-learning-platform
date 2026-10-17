# 📘 Data Engineering Fərdi Tədris Platforması — Yekun Master Plan

> **Fəlsəfə və Məqsəd**: Bu platforma yalnız fərdi istifadə üçün nəzərdə tutulub. Məqsəd lazımsız oyun elementləri (XP, streak, nişanlar) deyil, **nəzəriyyəni göz yorulmadan, dərindən və rahat oxumaq**, **ayrıca peşəkar giriş səhifəsi ilə platformanı idarə etmək** və **yüksək keyfiyyətli peşəkar arxitektura diaqramları ilə mövzunu vizual olaraq dərhal anlamaqdır**.

---

## 🧭 Planın İcmalı & Status

| Mərhələ | Status | Əsas Hədəf |
|---|:---:|---|
| **Mərhələ 1: Peşəkar Giriş Səhifəsi (Overview Hub & Landing)** | ✅ **TAMAMLANDI** | Sayt açıldıqda birbaşa dərslərə deyil, möhtəşəm bir İcmal Hub səhifəsinə daxil olur: 8 modulun vizual xəritəsi, Data Pipeline axını, statistika və "Son dərsi davam et" seçimi. |
| **Mərhələ 2: Minimalist Header & 3-Sütunlu Qlobal Shell** | ✅ **TAMAMLANDI** | Yuxarı paneldən XP/streak/oyun elementləri çıxarıldı; Stripe/Geist standartında loqo, dil və tema seçimi, sol naviqasiyada sakit monoxrom iyerarxiya quruldu. |
| **Mərhələ 3: Oxu Zonasının 0-dan Yenidən Qurulması (Reader UI)** | ✅ **TAMAMLANDI** | 65-75 simvol optimal oxu eni ($700\text{px}$), $1.75$ sətir hündürlüyü, sakit monoxrom/slate palitra, sağ tərəfdə dinamik "Bu səhifədə" (TOC) menyusu və şəxsi dərs konspekti (Notes) sahəsi. |
| **Mərhələ 4: Diaqramların ByteByteGo Üslubuna Keçirilməsi** | ⏳ **HAL-HAZIRDA BURADAYIQ** | Oyuncaq CSS qutucuqlarının ləğvi; hər mövzu üçün baxdıqda məlumat axınını anında başa salan aydın, yüksək keyfiyyətli texniki vektor sxemləri (SVG). |
| **Mərhələ 5: Qlobal Axtarış (`Ctrl + K` Command Palette)** | 📋 GÖZLƏYİR | `Ctrl + K` ilə modal əmr palitrası açılması və 87 dərs/mövzu üzrə anında axtarış və sürətli keçid. |

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

### 4. Diaqramlar və Qrafiklər (ByteByteGo Standartı) [⏳ NÖVBƏTİ ADDIM]
- [ ] Mövcud animasiyalı kiçik qutucuqların ləğvi.
- [ ] Əsas dərslər üçün baxanda mövzunu anında izah edən peşəkar, yüksək dəqiqlikli SVG arxitektura diaqramlarının qurulması:
  - **DWH & Lakehouse**: Mənbələr ➔ Ingestion ➔ DWH / Data Lake ➔ Marts ➔ BI axını.
  - **Medallion Arxitekturası**: Bronze (Raw append-only) ➔ Silver (Cleaned/Deduplicated) ➔ Gold (Aggregated Star Schema).
  - **Apache Kafka**: Producer ➔ Broker Klasteri (Leader/Follower ISR) ➔ Partisiyalar & Offset-lər ➔ Consumer Groups.
  - **Apache Spark**: Driver ➔ Cluster Manager ➔ Worker Executors; Narrow vs Wide Dependency və Shuffle mexanizmi.
  - **Apache Airflow**: DAG arxitekturası, Scheduler, Meta DB, Worker növbəsi və tapşırıq vəziyyətləri.
  - **dbt**: Sources ➔ Staging ➔ Intermediate ➔ Marts DAG zənciri və Keyfiyyət Test Qapıları.
  - **DevOps**: Hypervisor (VM) vs Docker Engine (Shared Kernel) təbəqələri; Docker Compose şəbəkəsi.
  - **SQL**: Real cədvəl sətirlərinin birləşməsi (Inner, Left, Full, Cross).

### 5. Qlobal Axtarış (`Ctrl + K` Command Palette) [📋 GÖZLƏYİR]
- [ ] İstənilən yerdən klaviatura qısayolu ilə açılan axtarış pəncərəsi.
- [ ] Bütün 87 dərs, əsas açar sözlər və diaqramlar üzrə dərhal axtarış və bir kliklə keçid.

# 📘 Data Engineering Fərdi Tədris Platforması — Yekun Master Plan

> **Fəlsəfə və Məqsəd**: Bu platforma yalnız fərdi istifadə üçün nəzərdə tutulub. Məqsəd lazımsız oyun elementləri (XP, streak, nişanlar) deyil, **nəzəriyyəni göz yorulmadan, dərindən və rahat oxumaq**, **ayrıca peşəkar giriş səhifəsi ilə platformanı idarə etmək** və **yüksək keyfiyyətli peşəkar arxitektura diaqramları ilə mövzunu vizual olaraq dərhal anlamaqdır**.

---

## 🧭 Planın İcmalı & Mərhələlər

| Mərhələ | Status | Əsas Hədəf |
|---|:---:|---|
| **Mərhələ 1: Peşəkar Giriş Səhifəsi (Overview Hub & Landing)** | ⏳ **İCRADA** | Sayt açıldıqda dərsə deyil, möhtəşəm bir İcmal Hub səhifəsinə daxil olmaq: 8 modulun vizual xəritəsi, Data Pipeline axını, statistika və "Son dərsi davam et" seçimi. |
| **Mərhələ 2: Minimalist Header & 3-Sütunlu Qlobal Shell** | 📋 NÖVBƏTİ | Yuxarı paneldən XP/streak/oyun elementlərinin çıxarılması; Stripe/Geist standartında loqo, `Ctrl+K` axtarış, dil və tema seçimi. |
| **Mərhələ 3: Oxu Zonasının 0-dan Yenidən Qurulması (Reader UI)** | 📋 NÖVBƏTİ | 65-75 simvol optimal oxu eni ($700\text{px}$), $1.7$ sətir hündürlüyü, sakit monoxrom/slate palitra, sağ tərəfdə dinamik "Bu səhifədə" (TOC) menyusu. |
| **Mərhələ 4: Diaqramların ByteByteGo Üslubuna Keçirilməsi** | 📋 NÖVBƏTİ | Oyuncaq CSS qutularının ləğvi; hər mövzu üçün baxdıqda məlumat axınını anında başa salan aydın, yüksək keyfiyyətli texniki vektor sxemləri. |
| **Mərhələ 5: Təmiz Kod Pəncərəsi və Fərdi Dərs Qeydləri** | 📋 NÖVBƏTİ | Yüksək kontrastlı JetBrains Mono kod pəncərəsi və hər dərsin altında şəxsi konspekt yazmaq üçün daimi yadda qalan qeyd bölməsi. |

---

## 🛠️ Detallı Addımlar

### 1. Peşəkar Giriş Səhifəsi (Home Hub / Dashboard)
- Sayt açıldıqda (`http://localhost:3000`) birbaşa dərsi açmaq əvəzinə, peşəkar və möhtəşəm bir **Data Engineering Roadmap Hub** səhifəsi təqdim etmək:
  - **Hero Bölməsi**: "Data Mühəndisliyi Bilik Bazası" — Junior-dan Senior-a sistemli yol xəritəsi.
  - **Pipeline Xəritəsi**: Məlumatın hərəkət axını (Mənbə ➔ Kafka Streaming ➔ Spark Processing ➔ DWH/Lakehouse ➔ dbt Modelləşdirmə ➔ Airflow Orkestrasiya).
  - **8 Modul Kartı**: Hər modul üçün təmiz texnoloji kart (loqo, dərs sayı, əhatə olunan əsas anlayışlar və "Modula Bax" düyməsi).
  - **Sürətli Giriş**: Sonuncu oxunan dərsə tək kliklə qayıtmaq ("Davam Et").

### 2. Header & Shell Təmizlənməsi (Stripe / Geist Standartı)
- Yuxarı paneldəki diqqət yayıcı "🔥 1 gün", "0 XP", "Junior DE" bəzəklərinin silinməsi.
- Təmiz Loqo (Loqoya kliklədikdə həmişə Giriş Səhifəsinə qayıdır).
- `Ctrl + K` Qlobal Axtarış düyməsi.
- Dil (`AZ` / `EN`) və Tema (`Light` / `Dark`) dəyişdiricisi.

### 3. Dərs Oxu Səhifəsi (3-Sütunlu Tədqiqat Mühiti)
- **Sol Sidebar**: 8 modul və dərslərin təmiz ağacı, ən başda "🏠 İcmal / Ana Səhifə" linki. Rainbow ikonlar əvəzinə sakit mühəndislik ikonları.
- **Mərkəz (Reading Well)**: $700\text{px}$ en, sətirlər arası $1.7$ məsafə, sakit semantik bloklar (TL;DR, Nəzəriyyə, Analoqiya, İstehsalat Qaydaları).
- **Sağ (Table of Contents)**: Dərsin alt başlıqlarını izləyən və istifadəçi oxuduqca sürüşən sakit sağ panel.

### 4. Diaqramlar və Qrafiklər (ByteByteGo Standartı)
- Bütün oyuncaq neon/CSS animasiyalarının ləğvi.
- Sxemlərin kristal təmiz SVG və texniki vektor qrafikləri ilə əvəzlənməsi.

---

Bu plan əsasında icraya başlanılır.

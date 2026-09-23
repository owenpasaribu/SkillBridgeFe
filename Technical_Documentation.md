# SkillBridge — Technical Documentation

Dokumen ini menjelaskan arsitektur teknis SkillBridge secara lebih rinci
dibanding README (yang berfokus pada cara instalasi & menjalankan).

## Daftar Isi

1. [Ringkasan Arsitektur](#1-ringkasan-arsitektur)
2. [Alur Data (FE ↔ BE ↔ ML)](#2-alur-data-fe--be--ml)
3. [Skema Database](#3-skema-database)
4. [Kontrak API — Backend ↔ ML Service](#4-kontrak-api--backend--ml-service)
5. [Pipeline Scraping & Data Pipeline](#5-pipeline-scraping--data-pipeline)
6. [Deployment](#6-deployment)

---

## 1. Ringkasan Arsitektur

Tiga komponen utama:

- **Frontend** — HTML/CSS/JS murni, mengakses Backend lewat REST API.
- **Backend (Laravel, monolitik)** — orkestrator utama: auth, business
  logic, database, cron/scraper, agregasi data industri.
- **ML Service (Python/Flask, terpisah)** — menangani ekstraksi &
  normalisasi skill dari teks lowongan, dipanggil Backend lewat HTTP API.



## 2. Alur Data (FE ↔ BE ↔ ML)

### Alur A — Real-time (student-facing, tidak melibatkan ML)

```
FE → GET /skill-gap (BE) → BE query career_skill + user_skills
   → BE hitung gap & prioritas → BE balas JSON → FE render
```

Pola yang sama berlaku untuk sebagian besar fitur student-facing (readiness
score, roadmap, portfolio) — FE minta, BE baca dari database yang sudah
matang, BE balas cepat.

### Alur B — Background, terjadwal (scraping + ML)

```
Cron (eksternal, lihat §5) → BE jalankan scrape:jobs
   → Scraper ambil lowongan dari Karirhub Kemnaker
   → BE simpan mentah ke job_postings (status: pending)
   → BE kirim batch teks ke ML lewat POST /extract-skills
   → ML proses teks & cocokkan ke skill taxonomy
   → ML balas daftar skill yang ditemukan per lowongan
   → BE simpan hasil ke job_posting_skills, ubah status jadi processed
   → BE hitung agregasi (demand skill & role, global + per region)
   → BE tulis hasil ke industry_insights / role_demand_history
```

### Alur C — ML mengambil kamus skill dari BE

```
ML (cache berkala) → GET /internal/skills (BE)
   → BE balas daftar skill + alias dari tabel skills
   → ML pakai ini sebagai kamus untuk mencocokkan teks lowongan
```

## 3. Skema Database

Ringkasan tabel utama yang relevan dengan Data Pipeline & Insights:

| Tabel | Fungsi |
|---|---|
| `job_postings` | Data mentah lowongan hasil scraping (title, company, location, region, role_category, description, status) |
| `job_posting_skills` | Pivot hasil ekstraksi ML: skill apa saja yang match ke satu lowongan |
| `skills` | Master data skill (code, name, aliases, category) |
| `industry_insights` | Snapshot demand skill terkini (1 baris per skill) |
| `industry_insight_history` | Riwayat demand skill dari waktu ke waktu (banyak baris per skill) |
| `industry_insight_region_history` | Riwayat demand skill per region |
| `role_demand_history` | Riwayat demand per kategori role (Frontend, Backend, dst), global & per region |
| `scrape_runs` | Log tiap siklus scraping (untuk transparansi ke admin) |
| `app_settings` | Konfigurasi global, termasuk `industry_insight_mode` (auto/manual) |

## 4. Kontrak API — Backend ↔ ML Service

### Format Response Standar

```json
// Sukses
{ "status": 200, "message": "OK", "data": { } }

// Gagal
{ "status": 422, "message": "Validasi gagal", "data": { "errors": {} } }
```

### BE memanggil ML

**`POST /extract-skills`** (auth: service token)

```json
// Request
{
  "jobs": [
    { "job_posting_id": 101, "text": "Kami mencari Data Analyst yang menguasai SQL, Excel..." }
  ]
}

// Response
{
  "status": 200,
  "message": "OK",
  "data": {
    "results": [
      { "job_posting_id": 101, "matched_skills": ["sql", "excel", "powerbi"] }
    ]
  }
}
```

> `matched_skills` berisi **skill `code`**, bukan `name` — BE melakukan
> lookup `Skill::pluck('id', 'code')` untuk memetakan ke `skill_id`.

**`GET /health`** (auth: service token)

Dipanggil BE sebelum trigger batch. Kalau ML tidak merespons
(timeout/connection error, bukan response error), BE melewati langkah
ekstraksi untuk siklus itu tanpa membuat scraper gagal total — job tetap
tersimpan dengan status `pending`.

### ML memanggil BE

**`GET /internal/skills`** (auth: service token)

```json
{
  "status": 200,
  "message": "OK",
  "data": {
    "skills": [
      { "code": "sql", "name": "SQL", "aliases": ["Structured Query Language"] }
    ]
  }
}
```

Dipakai ML sebagai kamus taxonomy untuk exact/substring matching. Di-cache
di sisi ML, di-refresh berkala (`TAXONOMY_REFRESH_SECONDS`).

### Strategi Matching di ML Service

1. **Exact/substring match** terhadap taxonomy (nama + alias skill), dengan
   whole-word boundary matching dan diurutkan dari term terpanjang ke
   terpendek (mencegah partial match yang salah, mis. "machine learning"
   dicek sebelum "learning").
2. **Fallback dictionary manual** — kalau taxonomy matching tidak
   menemukan skill apapun (kasus umum: field skill dari sumber data
   kosong), dipakai aturan manual berbasis kata kunci di title lowongan
   (mis. title mengandung "full stack" → skill umum full stack).


## 5. Pipeline Scraping & Data Pipeline

### Sumber Data

Lowongan diambil dari **Karirhub Kemnaker** (`karirhub.kemnaker.go.id`),
portal lowongan resmi Kementerian Ketenagakerjaan RI, lewat:
- Endpoint pencarian (Algolia search-only API, publik)
- Endpoint detail lowongan per job (parsing RSC payload Next.js)

### Klasifikasi & Filtering Otomatis

- **`JobRelevanceFilter`** — menyaring judul lowongan yang ambigu (mis.
  "Security" bisa berarti satpam ATAU cyber security) berdasarkan
  kombinasi kata ambigu + kata kualifikasi teknis.
- **`LocationNormalizer`** — normalisasi teks lokasi bebas jadi nama
  provinsi kanonik (best-effort, dictionary keyword).
- **`JobRoleClassifier`** — klasifikasi title lowongan jadi kategori role
  kanonik (Frontend, Backend, Full Stack, dst.), best-effort.

Data yang tidak berhasil diklasifikasi otomatis (region/role bernilai
`null`) dapat diisi manual oleh admin lewat endpoint
`PATCH /admin/job-postings/{id}/classification`.


## 6. Deployment

| Komponen | Platform | URL |
|---|---|---|
| Frontend | `[ISI]` | `[ISI]` |
| Backend | Railway | https://skillbridge-production-f8ed.up.railway.app |
| ML Service | Vercel | https://skill-bridge-ml-asaj.vercel.app/ |
| Database | MySQL di Railway | — |


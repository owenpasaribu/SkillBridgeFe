# SkillBridge

Platform career readiness & skill gap analysis untuk mahasiswa. Repo ini
adalah **Front-End** SkillBridge, tapi README ini juga menjelaskan cara
menjalankan **Back-End (Laravel)** dan **ML Service (Python/Flask)** secara
lengkap, karena FE tidak bisa berfungsi penuh tanpa keduanya.

## Live Demo

| Komponen | Link |
|---|---|
| Frontend | `[ISI: link deploy FE, mis. Netlify/Vercel/GitHub Pages]` |
| Backend API | https://skillbridge-production-f8ed.up.railway.app |
| Backend API Docs (Scribe) | https://skillbridge-production-f8ed.up.railway.app/docs |
| ML Service | https://skill-bridge-ml-asaj.vercel.app |

## Repository

| Komponen | Repo |
|---|---|
| Frontend (repo ini) | https://github.com/owenpasaribu/SkillBridgeFe.git |
| Backend (Laravel) | https://github.com/DwiAmandaAP/SkillBridge.git |
| ML Service (Python/Flask) | https://github.com/DwiAmandaAP/skillBridge-ml.git |

## Tech Stack

**Frontend**
- HTML, CSS, JavaScript murni — tanpa framework

**Backend**
- Laravel 10
- PHP 8.2
- MySQL
- Laravel Sanctum (autentikasi token)
- Scribe (dokumentasi API otomatis)

**ML Service**
- Python 3.10
- Flask
- Exact/substring skill matching + fallback dictionary manual

## Arsitektur Sistem

```
┌─────────────┐        ┌───────────────────────┐                  ┌──────────────────┐
│  Frontend   │──HTTP─►│   Backend (Laravel)   │◄───────HTTP─────►│   ML Service     │
│ (HTML/JS)   │  /api  │   - Auth, Career,     │ /extract-skills  │ (Python/Flask)   │
│             │        │     Skill Gap, dst.   │ /internal/skills │ - Skill matching │
│             │        │   - Scraper (Karirhub)│                  │   dari taxonomy  │
│             │        │   - Admin & Insights  │                 │                  │
└─────────────┘        └──────────┬────────────┘                  └──────────────────┘
                                  │
                                  ▼
                              ┌───────────┐
                              │   MySQL   │
                              └───────────┘
```

Alur singkat:
1. **FE** memanggil BE lewat `js/api.js` (lihat bagian [Arsitektur API Client](#arsitektur-api-client---terhubung-ke-laravel-be) di bawah).
2. **BE** menjalankan scraping lowongan (dari Karirhub Kemnaker) secara terjadwal, menyimpan mentah ke database.
3. **BE** mengirim batch teks lowongan ke **ML Service** lewat `POST /extract-skills` untuk ekstraksi skill.
4. **BE** mengagregasi hasil ekstraksi jadi data demand skill & role (Industry Insights, Role Insights) yang ditampilkan ke FE.

---

## Instalasi & Menjalankan Sistem

Urutan menjalankan: **Backend → ML Service → Frontend** (BE dan ML sebaiknya
sudah hidup sebelum FE mulai dipakai, supaya semua fitur berfungsi).

### 1. Backend (Laravel)

**Prasyarat:** PHP 8.2, Composer, MySQL.

```bash
git clone https://github.com/DwiAmandaAP/SkillBridge.git
cd skillbridge-backend

composer install
cp .env.example .env
php artisan key:generate
```

Buka `.env`, sesuaikan koneksi database (`DB_DATABASE`, `DB_USERNAME`,
`DB_PASSWORD`), lalu isi juga:

```env
ML_SERVICE_URL=http://localhost:8001
ML_SERVICE_TOKEN=isi-token-rahasia-sama-dengan-ml-service
ML_SERVICE_TIMEOUT=15
```

Jalankan migrasi & seeder:

```bash
php artisan migrate --seed
```

Jalankan server:

```bash
php artisan serve
```

Backend berjalan di `http://localhost:8000`, API di `http://localhost:8000/api/v1`.

**Menjalankan scraping lowongan secara manual** (opsional, untuk generate data demand skill/role):

```bash
php artisan scrape:jobs
```

> Catatan: di hosting gratis yang tidak punya fitur cron job bawaan, scraping
> dijadwalkan lewat layanan eksternal (cron-job.org) yang memanggil endpoint
> HTTP terproteksi token, bukan lewat scheduler Laravel biasa. Lihat
> dokumentasi teknis untuk detail endpoint ini.

**Akun admin** tidak dibuat lewat seeder produksi — perlu dibuat manual
dengan mengubah kolom `role` user menjadi `admin` di database.

### 2. ML Service (Python/Flask)

**Prasyarat:** Python 3.10.

```bash
git clone https://skill-bridge-ml-asaj.vercel.app
cd skillbridge-ml

python -m venv venv
source venv/bin/activate      

pip install -r requirements.txt
cp .env.example .env
```

Isi `.env`:

```env
BE_BASE_URL=http://localhost:8000/api/v1
SERVICE_TOKEN=isi-token-rahasia-sama-dengan-backend
TAXONOMY_REFRESH_SECONDS=86400
PORT=8001
```

> **Penting:** `SERVICE_TOKEN` di sini harus **persis sama** dengan
> `ML_SERVICE_TOKEN` di `.env` Backend — token ini yang dipakai untuk
> autentikasi dua arah antara BE dan ML.

Jalankan:

```bash
python app.py
```

ML Service berjalan di `http://localhost:8001`. Pastikan Backend sudah
berjalan lebih dulu, karena ML Service mengambil daftar skill taxonomy dari
Backend saat start (`GET /internal/skills`).

### 3. Frontend

Tidak butuh instalasi dependency apapun (tanpa `npm install`).

```bash
git clone https://github.com/owenpasaribu/SkillBridgeFe.git
cd skillbridge-frontend
```

Buka `js/api.js`, pastikan:

```js
API_MODE = 'live';
API_BASE_URL = 'http://localhost:8000/api/v1'; atau URL backend production
```

Jalankan lewat local server (bukan double-click `index.html`, supaya semua
fitur — termasuk fetch ke API — berjalan normal):

```bash
npx serve .
```

Buka `http://localhost:3000`.

---

## Cara Mencoba Alurnya

1. Buka `index.html`, klik **Analyze My Skills** untuk daftar, atau
2. Buka `login.html` lalu isi "Budi@gmail.com" untuk email dengan password
  "password" untuk langsung masuk dengan ke akun testing yang sudah
  memiliki data contoh (target karier Data Engineer, skill sudah terisi).

### Login terpadu (satu alur untuk Student & Admin)

Hanya ada **satu halaman login** (`login.html`) untuk kedua role — tidak ada
halaman login admin terpisah. Sistem otomatis mendeteksi dari email yang
dipakai lalu mengarahkan ke dashboard yang sesuai:

- Akun **admin**: dibuat manual di database backend (`role = 'admin'`),
  tidak ada akun demo bawaan di mode `live`.
- Akun **student**: hasil register lewat halaman Register.

> Tombol "Coba sebagai akun demo" hanya berfungsi saat `API_MODE = 'mock'`.

---

## Struktur Folder (Frontend)

```
skillbridge/
├── index.html              Landing page
├── about.html               Halaman About
├── how-it-works.html        Halaman How It Works
├── login.html / register.html
├── forgot-password.html / reset-password.html
├── onboarding.html           Wizard 5 langkah setelah daftar
├── dashboard.html             Pusat informasi utama
├── career-explorer.html       Daftar & filter karier
├── career-detail.html         Detail satu karier (?slug=...)
├── skill-assessment.html      Assessment berbasis skenario
├── skill-gap.html              Core feature: perbandingan skill vs target
├── learning-roadmap.html       Roadmap belajar, dibuat otomatis dari gap
├── industry-insights.html      Data demand skill (dari BE, hasil scraping+ML)
├── portfolio-readiness.html    Checklist kesiapan portofolio
├── progress.html                Riwayat perkembangan & achievement
├── profile.html                  Profil & pengaturan akun
├── admin-dashboard.html            Ringkasan statistik platform
├── admin-careers.html               CRUD career + skill requirement
├── admin-skills.html                 CRUD daftar skill
├── admin-industry-insights.html       CRUD data demand skill industri
├── admin-learning-resources.html       CRUD resource belajar per skill
├── admin-users.html                    Daftar user (read-only)
├── admin-analytics.html                 Statistik lebih lengkap
├── admin-settings.html                    Konfigurasi bobot formula Career Readiness Score
├── admin-scrape-runs.html                  Data Pipeline: riwayat & trigger scraping
├── 404.html
├── favicon.svg
├── css/
│   ├── base.css               Variabel warna/font, reset, tipografi
│   └── components.css          Semua komponen UI (card, button, table, dst)
└── js/
    ├── data.js                 Seed data mentah (dipakai mode mock)
    ├── admin-store.js            Accessor bersama untuk data admin (mode mock)
    ├── storage.js                Helper localStorage untuk sesi & data akun student
    ├── scoring.js                 Logika Career Readiness Score, Skill Gap, generator Roadmap
    ├── api.js                      API client — satu-satunya file yang dipanggil halaman lain
    ├── api-mock.js                  "Backend palsu" (localStorage), untuk demo tanpa BE
    ├── api-live.js                  Adapter ke backend Laravel asli (mode live)
    ├── main.js                     Util bersama (sidebar mobile, nav aktif, logout)
    ├── auth.js, onboarding.js, dashboard.js, career-explorer.js,
    │   career-detail.js, assessment.js, skill-gap.js, roadmap.js,
    │   industry-insights.js, portfolio.js, progress.js, profile.js
    ├── admin-dashboard.js, admin-careers.js, admin-skills.js,
    │   admin-industry.js, admin-resources.js, admin-users.js,
    │   admin-analytics.js, admin-settings.js, admin-scrape-runs.js
    └── (satu file JS per halaman, isinya logika halaman itu saja)
```

---

## Arsitektur API Client — terhubung ke Laravel BE

Seluruh halaman FE **tidak mengakses localStorage/backend secara langsung**.
Semua data lewat satu lapisan:

```
Halaman (dashboard.js, admin-careers.js, dst)
        │  memanggil Api.xxx.yyy()
        ▼
   js/api.js            ← satu-satunya file yang halaman lain kenal
        │
        ├─ API_MODE = 'live' (default) ─► js/api-live.js ─► Backend Laravel (/api/v1)
        │                                  (adapter: menyeragamkan amplop respons,
        │                                   menerjemahkan id angka <-> slug/kode skill,
        │                                   dan menyesuaikan bentuk data BE ke bentuk FE)
        │
        └─ API_MODE = 'mock'         ─► js/api-mock.js ─► "backend palsu" di localStorage
```


### Kenapa ada `js/api-live.js`

Bentuk respons BE yang sebenarnya beda dari yang diasumsikan prototype awal
(mis. `GET /me` dibungkus `data.user`, id career/skill berupa angka, bukan
slug/kode). Semua penyesuaian itu dikumpulkan di satu file supaya
halaman-halaman lain tidak perlu tahu detail BE.

---

## Technical Documentation

Dokumentasi teknis (arsitektur detail, skema database/ERD, kontrak API
BE↔ML, dan penjelasan pipeline scraping) ada di file terpisah:

📄 **[`TECHNICAL_DOCUMENTATION.md`](./Technical_Documentation.md)**

---

## Catatan Penting — Batasan Prototype

- **Mode mock** (localStorage) hanya untuk demo cepat tanpa backend —
  password tidak diverifikasi sungguhan, data hilang kalau localStorage
  dibersihkan, dan tidak multi-perangkat.
- **Mode live** (default) sepenuhnya terhubung ke Backend Laravel asli;
  token dari login/register disimpan di `localStorage` key
  `skillbridge_auth_token_v1`, dikirim sebagai header
  `Authorization: Bearer <token>`.
- **Analisis GitHub** (`Api.portfolio.analyzeGithub`) memanggil GitHub API
  publik langsung dari browser (`api.github.com/users/{username}/repos`,
  mendukung CORS tanpa API key) — bukan simulasi, sungguhan menghitung
  bahasa pemrograman dari repository publik user.
- Data Industry Insights & Role Insights yang tampil di FE berasal dari
  hasil scraping + ekstraksi ML sungguhan (lihat Backend & ML Service di
  atas), bukan data statis.


# SkillBridge — Prototype (HTML/CSS/JS)

Prototype front-end untuk SkillBridge — platform career readiness & skill gap
analysis untuk mahasiswa. Dibuat dengan HTML, CSS, dan JavaScript murni
(tanpa framework, tanpa build tool) supaya bisa langsung dibuka di browser.

## Cara menjalankan

Buka `index.html` langsung di browser (double click), atau jalankan local
server sederhana supaya lebih stabil, contoh:

```
npx serve .
```

lalu buka `http://localhost:3000`.

## Cara mencoba alurnya

1. Buka `index.html`, klik **Analyze My Skills** untuk daftar, atau
2. Buka `login.html` lalu klik **Coba sebagai akun demo (Student)** untuk langsung
   masuk dengan data contoh (target karier Data Engineer, skill sudah terisi).

### Login terpadu (satu alur untuk Student & Admin)

Hanya ada **satu halaman login** (`login.html`) untuk kedua role — tidak ada
halaman login admin terpisah. Sistem otomatis mendeteksi dari email yang
dipakai lalu mengarahkan ke dashboard yang sesuai:

- Akun **admin demo**: `admin@skillbridge.id` / `admin123` (atau klik tombol
  "Coba sebagai Admin" di halaman login) → masuk ke `admin-dashboard.html`.
- Akun **student**: hasil register di browser yang sama, atau tombol
  "Coba sebagai akun demo (Student)" → masuk ke `dashboard.html`.

Sesi admin dan sesi student disimpan terpisah di localStorage
(`skillbridge_admin_session_v1` vs `skillbridge_state_v1`), jadi keduanya
bisa aktif berdampingan tanpa saling menimpa data.

## Struktur folder

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
├── industry-insights.html      Data demand skill (demo data)
├── portfolio-readiness.html    Checklist kesiapan portofolio
├── progress.html                Riwayat perkembangan & achievement
├── profile.html                  Profil & pengaturan akun
├── admin-dashboard.html            Ringkasan statistik platform
├── admin-careers.html               CRUD career + skill requirement
├── admin-skills.html                 CRUD daftar skill
├── admin-industry-insights.html       CRUD data demand skill industri
├── admin-learning-resources.html       CRUD resource belajar per skill
├── admin-users.html                    Daftar user (demo + akun aktif browser ini)
├── admin-analytics.html                 Statistik lebih lengkap
├── admin-settings.html                    Konfigurasi bobot formula Career Readiness Score
├── css/
│   ├── base.css               Variabel warna/font, reset, tipografi
│   └── components.css          Semua komponen UI (card, button, table, dst)
└── js/
    ├── data.js                 Seed data mentah: skill, career, roadmap content, industry insight
    ├── admin-store.js            Penyimpanan konten yang dikelola admin + fungsi accessor bersama
    │                              (getCareerBySlug, skillName, dst) — dipakai SEMUA halaman
    ├── storage.js                Helper localStorage untuk sesi & data akun student
    ├── scoring.js                 Logika Career Readiness Score, Skill Gap, generator Roadmap
    ├── api.js                      API client — satu-satunya file yang dipanggil halaman lain
    ├── api-mock.js                  "Backend palsu" — implementasi mock persis kontrak API
    ├── api-live.js                  Adapter ke backend Laravel asli (mode live)
    ├── main.js                     Util bersama (sidebar mobile, nav aktif, logout student & admin)
    ├── auth.js, onboarding.js, dashboard.js, career-explorer.js,
    │   career-detail.js, assessment.js, skill-gap.js, roadmap.js,
    │   industry-insights.js, portfolio.js, progress.js, profile.js
    ├── admin-dashboard.js, admin-careers.js, admin-skills.js,
    │   admin-industry.js, admin-resources.js, admin-users.js, admin-analytics.js,
    │   admin-settings.js
    └── (satu file JS per halaman, isinya logika halaman itu saja)
```

## Catatan penting — ini prototype front-end only

- **Tidak ada backend.** Semua data (profil, skill, roadmap, progres)
  disimpan di `localStorage` browser lewat `js/storage.js`. Data hanya
  tersimpan di perangkat/browser yang sama, dan hilang kalau localStorage
  dibersihkan.
- **"Login" tidak memverifikasi password sungguhan** — hanya mencocokkan
  email dengan akun yang pernah didaftarkan di browser tersebut. Ini
  disengaja karena belum ada backend/API auth.
- **Career Readiness Score & Skill Gap dihitung real-time** dari data yang
  ada di `localStorage`, lewat fungsi-fungsi di `js/scoring.js`. Formula
  dan bobotnya bisa diubah di sana.
- **Learning Roadmap dibuat otomatis** dari hasil skill gap (bukan
  ditulis manual per karier) — lihat `generateRoadmap()` di `scoring.js`
  dan konten pembelajaran generik per skill di `SKILL_CONTENT` (`data.js`).
- Semua angka industri/statistik yang ditampilkan (Industry Insights,
  statistik di landing page) adalah **data contoh**, ditandai "Demo Data"
  sesuai arahan dokumen perencanaan awal.

- **Career & Skill Management di admin benar-benar terhubung ke sisi student** —
  data career/skill dibaca lewat fungsi bersama di `js/admin-store.js`
  (`getAllCareers()`, `getCareerBySlug()`, `getAllSkills()`, `skillName()`,
  dst). Jadi kalau admin tambah/edit/hapus career atau skill, perubahannya
  langsung muncul di Career Explorer, Career Detail, Skill Gap, Skill
  Assessment, Onboarding, dan Roadmap sisi student — bukan cuma tampil di
  halaman admin saja.
- **Learning Resources dan Industry Insights juga terhubung** — resource yang
  ditambahkan admin muncul di Learning Roadmap student, dan angka demand
  yang diedit admin langsung tampil di halaman Industry Insights student.
- **User Management** menampilkan gabungan user contoh (dummy, untuk demo)
  dan akun student asli yang sedang aktif di browser ini — belum benar-benar
  multi-user lintas perangkat karena masih localStorage-based.
- **Admin Settings** memungkinkan bobot formula Career Readiness Score
  (Technical/Soft/Portfolio/Experience/Assessment) diubah langsung dari UI,
  sesuai catatan di dokumen perencanaan bahwa formula harus bisa
  dikonfigurasi, bukan hardcode permanen.
- **Forgot/Reset Password** hanya simulasi alurnya (tidak ada pengiriman
  email sungguhan, dan password memang tidak pernah disimpan di prototype
  ini) — dijelaskan langsung di halamannya supaya tidak menyesatkan saat
  didemokan.

## Halaman yang sudah lengkap

Seluruh 26 halaman di sitemap dokumen perencanaan awal sudah dibuat: 8
halaman public (termasuk forgot/reset password), 9 halaman student, dan 8
halaman admin (termasuk Settings).

## Peningkatan dari masukan revisi (skill demand, trend, GitHub, dll)

- **Skill demand naratif** — Industry Insights & Career Detail sekarang
  menampilkan kalimat seperti "SQL muncul di 82% dari ~350 lowongan yang
  dianalisis (3 bulan terakhir)", bukan cuma angka telanjang. Field
  `jobSampleSize` & `period` bisa diedit admin di Career Management dan
  Industry Data Management.
- **Trend chart** — tiap skill di Industry Insights punya sparkline mini
  dari histori 6 bulan (`getSkillTrendHistory()` di `admin-store.js`).
  Datanya di-generate deterministik dari demand + trend saat ini (bukan
  histori riil), jadi angkanya konsisten tiap dibuka ulang.
- **Roadmap prioritas & durasi lebih pintar** — `priorityFor()` di
  `scoring.js` sekarang ikut mempertimbangkan demand industri skill
  tersebut (bukan cuma gap & kebutuhan career), dan skill dengan demand
  lebih tinggi didahulukan kalau prioritasnya sama. Estimasi durasi
  belajar tiap fase roadmap juga menyesuaikan besar gap user — gap besar
  butuh waktu lebih lama dari gap kecil, bukan angka tetap per skill.
- **Validasi skill via GitHub (data publik ASLI, bukan simulasi)** — di
  halaman Portfolio Readiness, user bisa masukkan username GitHub lalu
  sistem memanggil `api.github.com/users/{username}/repos` langsung dari
  browser (GitHub REST API publik mendukung CORS tanpa perlu API key),
  menghitung bahasa pemrograman yang dipakai, dan menaikkan level skill
  teknis yang relevan berdasarkan aktivitas repo nyata. Ini beneran
  jalan selama user punya repository publik di GitHub — bukan mock data.
- **Sertifikat manual** — user bisa tambah/hapus sertifikat di Portfolio
  Readiness, ikut menyumbang ke Portfolio Readiness Score lewat kategori
  "Certifications" baru.
- **Filter region & remote** — Industry Insights punya filter region
  (Nasional/Jabodetabek/Jawa Timur/Jawa Barat/Remote) yang menyesuaikan
  angka demand lewat `REGION_MULTIPLIER` (simulasi, bukan data regional
  riil). Career Explorer & Career Detail punya badge dan filter
  "Remote-friendly" per career (`remoteFriendly` field, bisa diedit admin).
- **Transparansi metodologi** — semua badge "Demo Data" di seluruh
  halaman sekarang jadi tooltip interaktif (hover/tap) yang menjelaskan
  sumber data, sample size, dan periode — supaya tidak ada angka yang
  terkesan seperti data riil tanpa penjelasan.

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

### Menjalankan FE + BE

1. Backend sudah ada di Railway: `https://skillbridge-production-f8ed.up.railway.app`
   (dokumentasi di `/docs`). Untuk backend lokal: `php artisan migrate --seed` lalu
   `php artisan serve` (`http://localhost:8000`).
2. Buka `js/api.js`, pastikan `API_MODE = 'live'` dan `API_BASE_URL` **lengkap**
   (awalan `https://` dan akhiran `/api/v1`), mis.
   `https://skillbridge-production-f8ed.up.railway.app/api/v1` (Railway) atau
   `http://localhost:8000/api/v1` (lokal).
3. Jalankan FE lewat local server (bukan double-click `index.html`), mis.
   `npx serve .`. Backend sudah mengizinkan semua origin (`config/cors.php`).
4. Daftar akun student lewat halaman Register. Akun admin harus dibuat di
   database backend (kolom `role = 'admin'`) — tidak ada seeder admin di BE saat ini.

Mau demo tanpa backend? Ubah `API_MODE` jadi `'mock'` — tombol akun demo di
halaman login akan bekerja lagi seperti prototype awal.

### Bahasa & halaman tambahan

Antarmuka berbahasa Inggris. Ada halaman admin **Data Pipeline** (`admin-scrape-runs.html`),
halaman `404.html` (otomatis dipakai GitHub Pages/Netlify/Vercel), dan `favicon.svg`.
Komentar di dalam kode masih berbahasa Indonesia.

### Kenapa ada `js/api-live.js`

Bentuk respons BE yang sebenarnya beda dari yang diasumsikan prototype
(mis. `GET /me` dibungkus `data.user`, checklist portfolio berupa daftar datar,
sertifikat ada di `/portfolio/certificates`, id career/skill berupa angka).
Semua penyesuaian itu dikumpulkan di satu file supaya halaman-halaman tidak
perlu tahu detail BE. Daftar endpoint yang belum ada / berbeda di BE ada di
`ENDPOINT_TRACKER.md`.

### Endpoint usulan — belum ada di dokumen kontrak

Selama proses konversi, ditemukan beberapa kebutuhan FE yang belum
punya endpoint di dokumen PDF. Tolong didiskusikan dengan tim BE:

| Endpoint usulan | Kebutuhan |
|---|---|
| `GET /me/skills` | Level semua skill milik user (bukan cuma yang match target career, dipakai Career Detail & Onboarding step 3) |
| `GET /assessment/history` | Riwayat skor assessment dari waktu ke waktu (halaman My Growth) |
| `GET /skills` (public) | Onboarding step 3 & Skill Assessment butuh daftar semua skill, bukan cuma yang terkait satu career — saat ini masih baca `getAllSkills()` lokal |

Beberapa catatan tambahan (bukan endpoint baru, cuma penyesuaian kecil):
- `GET /careers` di dokumen tidak punya parameter pencarian nama —
  pencarian di Career Explorer masih difilter di FE.
- `GET /admin/careers` (list) cuma balas `required_skills_count`, jadi
  form edit career di admin memanggil `GET /careers/:slug` (endpoint
  publik) untuk ambil `required_skills` lengkap.
- `DELETE /admin/industry-insights/:skill_id` dan beberapa `PATCH` di
  Learning Resources dipakai FE untuk kelengkapan CRUD walau tidak
  ada di contoh dokumen — tolong dikonfirmasi apakah backend akan
  menyediakannya.
- `GET /admin/users` diperlakukan **read-only** di FE, sesuai fitur
  yang tertulis di dokumen ("List user (read-only)").

### Catatan lain
- Token dari login/register disimpan di `localStorage` key
  `skillbridge_auth_token_v1`, dikirim sebagai header
  `Authorization: Bearer <token>` saat `API_MODE = 'live'`.
- Analisis GitHub (`Api.portfolio.analyzeGithub`) saat ini masih
  memanggil GitHub API langsung dari browser (lihat komentar di
  `mockAnalyzeGithub`, `js/api-mock.js`) karena belum ada backend.
  Begitu `POST /portfolio/github-analyze` di BE sudah jalan, cukup
  ganti `API_MODE` — tidak ada perubahan di `portfolio.js`.
- Struktur data di `js/data.js` (skills, careers, requiredSkills,
  SKILL_CONTENT, industry insights) sudah dirancang selaras dengan
  skema database di `SkillBridge_Perencanaan.md` dan `SkillBridge.pdf`.

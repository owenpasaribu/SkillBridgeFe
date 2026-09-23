# SkillBridge — Endpoint Integration Tracker

> **Diperbarui 19 Sep 2026** mengikuti dokumentasi BE yang sudah di-deploy
> (`https://skillbridge-production-f8ed.up.railway.app/docs`). BE di Railway lebih baru
> dari zip BE: ada `region` di industry insights, endpoint trend, progress-history,
> achievements, dan role-insights, serta banyak skill (id sampai 159+) yang tidak ada
> di seed FE. Karena itu **kunci skill di FE sekarang = id angka BE (string, mis. `"22"`)**,
> bukan kode seperti `sql`/`python` (kolom `code` di BE bisa `null`).
> Uji otomatis di bawah dijalankan terhadap zip BE (respons lama) dan terhadap server
> tiruan yang bentuknya mengikuti dokumentasi Railway; **BE di Railway sendiri belum
> bisa diuji dari sini**.

Status integrasi FE ↔ BE, dicek dari kode repo BE (`routes/api.php` dan
controller-nya) **dan sudah dicoba menjalankan BE beneran** (Laravel + sqlite, seed
bawaan, dengan perbaikan nama tabel di poin 1 di bawah): 57 skenario API dan 60
pemeriksaan halaman lulus (uji terakhir setelah antarmuka diterjemahkan ke bahasa Inggris dan fitur baru ditambahkan). Belum dicoba: MySQL, `POST /portfolio/github-analyze`
(server uji tidak bisa menjangkau GitHub), dan tampilan visual di browser sungguhan.
Kolom "Dites FE" dikosongkan sampai dicoba manual di browser.

**Legenda:**
🟢 Ada di BE & FE sudah tersambung · 🟡 Ada di BE tapi bentuknya beda / kurang, FE menyesuaikan lewat `js/api-live.js` ·
🔴 Belum ada di BE, FE menampilkan data kosong / pesan

## Auth
| Endpoint | Status | Dites FE | Catatan |
|---|---|---|---|
| `POST /auth/register` | 🟢 | ⬜ | Error validasi 422 memakai format bawaan Laravel (`{message, errors}`), diseragamkan di FE |
| `POST /auth/login` | 🟢 | ⬜ | Satu endpoint student & admin (role dari `user.role`) |
| `POST /auth/logout` | 🟢 | ⬜ | |
| `GET /me` | 🟡 | ⬜ | BE membungkus di `data.user` & `target_career_id` berupa angka → FE meratakan dan mengubah ke slug |
| `PATCH /me` | 🟡 | ⬜ | FE kirim `target_career_id` angka (hasil terjemah dari slug) |
| `GET /me/skills` | 🟡 | ⬜ | Ada di BE (usulan FE terpenuhi); `level` di `POST /me/skills` dibatasi 0–5, beda dengan skala 0–100 lain — FE tidak memakai POST ini |

## Career (public)
| Endpoint | Status | Dites FE | Catatan |
|---|---|---|---|
| `GET /careers` | 🟡 | ⬜ | BE hanya kirim `id, slug, name, industry_demand, remote_friendly`. Kategori, tingkat kesulitan, deskripsi dst dilengkapi FE dari seed `data.js` berdasarkan slug (career baru dari admin akan kosong bagian itu) |
| `GET /careers/:slug` | 🟡 | ⬜ | Sama: BE hanya kirim `required_skills`; `description`, `responsibilities`, `tools`, `job_sample_size` dari seed FE |

## Onboarding
| Endpoint | Status | Dites FE | Catatan |
|---|---|---|---|
| `POST /onboarding` | 🟡 | ⬜ | BE hanya membuat baris roadmap tanpa fase → FE otomatis memanggil `POST /roadmap/generate` sesudahnya |

## Skill Assessment
| Endpoint | Status | Dites FE | Catatan |
|---|---|---|---|
| `GET /assessment/questions` | 🟡 | ⬜ | BE mengirim semua baris `assessment_questions` (tanpa opsi jawaban, tidak difilter career, dan tabelnya belum punya seeder). FE menyusun pertanyaan dari skill target career + opsi skenario bawaan FE; teks pertanyaan BE dipakai kalau ada |
| `POST /assessment/submit` | 🟡 | ⬜ | Dokumentasi BE Railway: menyimpan jawaban, menghitung rata-rata, **memperbarui skill user**, dan memberi achievement `first_assessment`. Zip BE lama hanya menyimpan skor. FE membaca `average_score` (atau `score`) |

## Skill Gap & Readiness
| Endpoint | Status | Dites FE | Catatan |
|---|---|---|---|
| `GET /skill-gap` | 🟡 | ⬜ | BE hanya mengirim skill yang masih punya gap. FE menambahkan baris "Strong Match" untuk skill target career yang sudah memenuhi standar (dari detail career + `/me/skills`, +2 request; detail career di-cache 5 menit). Kategori `minor`/`none` dipetakan ke `small`/`strong` |
| `GET /readiness-score` | 🟢 | ⬜ | Angka desimal dibulatkan di FE; label status BE: Not Ready / Almost Ready / Ready |

## Learning Roadmap
| Endpoint | Status | Dites FE | Catatan |
|---|---|---|---|
| `POST /roadmap/generate` | 🟢 | ⬜ | |
| `GET /roadmap` | 🟡 | ⬜ | `resources` per fase selalu `null` dari BE → FE pakai resource bawaan (`SKILL_CONTENT` di `data.js`) |
| `PATCH /roadmap/phases/:id` | 🟢 | ⬜ | |

## Portfolio Readiness
| Endpoint | Status | Dites FE | Catatan |
|---|---|---|---|
| `GET /portfolio` | 🟡 | ⬜ | BE kirim daftar datar `[{code, category, label, done}]` tanpa skor. FE mengelompokkan, menghitung persen, dan menambah grup Technical Skills & Certifications |
| `PATCH /portfolio/checklist/:item_code` | 🟢 | ⬜ | |
| `GET /certificates` | 🟡 | ⬜ | Di BE path-nya `/portfolio/certificates` |
| `POST /certificates` | 🟡 | ⬜ | Path `/portfolio/certificates`; BE membalas 200 (bukan 201) dan mewajibkan `year` (integer) → form FE sekarang mewajibkan tahun |
| `DELETE /certificates/:id` | 🟡 | ⬜ | Path `/portfolio/certificates/:id` |
| `POST /portfolio/github-analyze` | 🟡 | ⬜ | BE mengirim daftar repo mentah (hanya 30 repo pertama GitHub). FE menghitung ringkasan bahasa. BE belum menaikkan level skill dari hasil analisis (`boosted_skills` kosong) |

## Industry Insights
| Endpoint | Status | Dites FE | Catatan |
|---|---|---|---|
| `GET /industry-insights` | 🟢 | ⬜ | Di BE Railway `region` sudah didukung dan barisnya datar (`skill_id, skill_code, skill_name, demand, ...`); FE meneruskan `region` (kecuali 'Nasional'). Zip BE lama masih mengabaikan region dan mengirim skill bersarang — dua-duanya didukung. Hanya skill yang punya data demand yang muncul (43 dari 159+ skill). Juga jadi sumber katalog skill untuk student |
| `GET /industry-insights/:skill_id/trend` | 🟡 | ⬜ | Ada di BE Railway (`data.history[]`), tapi `history` masih kosong di contoh dokumentasi sehingga bentuk itemnya belum kelihatan. FE membacanya longgar (`month|period|label` dan `value|demand|percentage`) — **cek dengan data asli**. Zip BE lama tidak punya route-nya (FE: sparkline kosong). Hasil disimpan 10 menit di sessionStorage karena halaman memanggilnya per skill |

## Progress & Achievements
| Endpoint | Status | Dites FE | Catatan |
|---|---|---|---|
| `GET /progress-history` | 🟡 | ⬜ | Ada di BE Railway (urut terbaru dulu; FE membaliknya). Bentuk item tidak ada contohnya di dokumentasi → dibaca longgar (`date`/`recorded_at`, `readiness_score`, `skill_snapshot`). Zip BE lama: tidak ada route → FE menampilkan daftar kosong |
| `GET /achievements` | 🟡 | ⬜ | Ada di BE Railway; bentuk item belum ada contohnya (dibaca longgar: `code`, `title`, `earned_at`). Zip BE lama: tidak ada route → daftar kosong |
| `GET /assessment/history` (usulan FE) | 🔴 | ⬜ | Tabel `assessment_history` ada, endpoint belum. FE: daftar kosong |

## Admin
| Endpoint | Status | Dites FE | Catatan |
|---|---|---|---|
| `GET /admin/dashboard` | 🟡 | ⬜ | BE hanya hitung `total_users`, `total_careers`, `avg_readiness_score`; kartu lain tampil "–" |
| `GET /admin/careers` | 🟡 | ⬜ | BE hanya kirim `id, name, required_skills_count`; kolom lain dilengkapi dari `GET /careers` + seed FE |
| `POST /admin/careers` | 🟢 | ⬜ | |
| `PATCH /admin/careers/:id` | 🟢 | ⬜ | FE menerjemahkan slug → id angka |
| `DELETE /admin/careers/:id` | 🟢 | ⬜ | |
| `GET /admin/skills` | 🟢 | ⬜ | |
| `POST /admin/skills` | 🟡 | ⬜ | BE mewajibkan `code`; form FE tidak punya kolomnya → dibuat otomatis dari nama |
| `PATCH /admin/skills/:id` | 🟢 | ⬜ | |
| `DELETE /admin/skills/:id` | 🟢 | ⬜ | |
| `GET /admin/industry-insights` | 🟢 | ⬜ | |
| `POST /admin/industry-insights` | 🟢 | ⬜ | Upsert per `skill_id` |
| `DELETE /admin/industry-insights/:skill_id` | 🔴 | ⬜ | Belum ada di BE; FE menampilkan pesan |
| `GET /admin/learning-resources` | 🟡 | ⬜ | BE mengabaikan filter `skill_id`; difilter di FE |
| `POST /admin/learning-resources` | 🟡 | ⬜ | BE mewajibkan `url` → form FE sekarang punya kolom URL |
| `PATCH /admin/learning-resources/:id` | 🔴 | ⬜ | Belum ada di BE; FE menampilkan pesan (hapus lalu tambah ulang) |
| `DELETE /admin/learning-resources/:id` | 🟢 | ⬜ | |
| `GET /admin/users` | 🟢 | ⬜ | Read-only |
| `GET /admin/analytics` | 🟡 | ⬜ | `gap_distribution` masih kosong dari BE; `user_growth` tidak ada |
| `GET /admin/scoring-settings` | 🟢 | ⬜ | |
| `PUT /admin/scoring-settings` | 🟢 | ⬜ | |
| `PATCH /admin/settings/industry-insight-mode` | 🟡 | ⬜ | Tidak ada GET untuk membaca mode saat ini; pilihan terakhir diingat di browser |
| `GET /admin/scrape-runs` | 🟢 | ⬜ | Dipakai halaman admin baru **Data Pipeline** (`admin-scrape-runs.html`) |
| `POST /admin/scrape-runs/trigger` | 🟡 | ⬜ | BE baru membuat baris log; command `scrape:jobs` belum dipanggil (dikomentari). Dipakai tombol "Run scraping now" di halaman Data Pipeline |

## Catatan antarmuka (bahasa & UX)

- Seluruh antarmuka sekarang berbahasa Inggris. Pesan BE yang berbahasa Indonesia diterjemahkan lewat kamus `BE_MESSAGES` di `js/api-live.js`; pesan yang tidak ada di kamus tampil apa adanya. Isi database (deskripsi career, nama skill, kolom `period`) tampil sesuai isinya (`period` bentuk "N bulan terakhir" diubah otomatis).
- Lupa/reset password: BE tidak punya endpoint-nya, jadi tautan di halaman login dihapus dan kedua halaman berisi pemberitahuan.
- Toast error otomatis muncul untuk status 0 (server tak terjangkau), 429, dan 5xx (`js/api.js`).

## Usulan endpoint baru
| Endpoint | Status | Catatan |
|---|---|---|
| `GET /skills` (student) | 🔴 | Saat ini katalog skill student dirangkai dari `GET /industry-insights` (hanya skill yang punya data insight). `GET /skills` akan lebih bersih — cukup ganti isi `ensureSkillCatalog()` di `js/api-live.js` |

---

## Catatan dari dokumentasi BE Railway

- **Belum dipakai FE:** `GET /role-insights` dan `GET /role-insights/:role/trend` (tidak ada halaman FE untuk ini).
- **Kategori skill tidak dikirim ke student.** `category` (technical/soft) hanya ada di `/admin/skills` dan objek skill di `/me/skills`. Untuk student, FE menebak soft skill dari namanya (daftar kata di `SOFT_SKILL_PATTERN`, `js/api-live.js`). Lebih baik BE menambahkan `category` ke respons career detail / industry insights.
- **`GET /careers` masih hanya 5 kolom** (`id, slug, name, industry_demand, remote_friendly`). Kategori, deskripsi, tools, dll dari seed FE untuk career yang slug-nya dikenal (mis. `data-analyst`, `frontend-developer`); career lain (mis. `ai-engineer`) tampil dengan deskripsi kosong.
- **`importance`** di BE Railway bernilai `critical/important/optional` (seed lama: `critical/high/medium/low`).
- Rate limit terlihat di header respons: `x-ratelimit-limit: 60` per menit.

## Temuan untuk tim BE (perlu dicek sebelum demo)

1. **Nama tabel pivot tidak konsisten di zip BE (kemungkinan error 500).** Detail career di BE Railway berhasil dimuat, jadi di sana kemungkinan sudah diperbaiki — pastikan repo BE yang dipakai tim juga sudah. Migration
   `2026_09_15_095527_create_career_skills_table.php` membuat tabel
   **`career_skill`** (singular), sedangkan `CareerSkill::$table`,
   `Career::skills()` dan `Skill::careers()` memakai **`career_skills`**
   (plural). Di database baru (`migrate:fresh --seed`) ini membuat
   `/careers/:slug`, `/skill-gap`, `/roadmap/generate`, `/admin/careers`, dan
   `CareerSeeder` gagal (sudah dikonfirmasi: `migrate:fresh --seed` berhenti dengan
   `no such table: career_skills`). Perbaikan paling kecil: ubah `Schema::create('career_skill'…)`
   dan `dropIfExists('career_skill')` di migration itu jadi `career_skills`.
2. `GET /careers` dan `GET /careers/:slug` sebaiknya juga mengirim `category`,
   `difficulty`, `short_description`, `description`, `responsibilities`, `tools`,
   `job_sample_size` (kolomnya sudah ada). Sekarang FE menambal dari seed lokal.
3. `POST /assessment/submit` belum memperbarui `user_skills` sehingga skill gap
   tidak berubah setelah assessment. `POST /me/skills` membatasi `level` 0–5
   padahal skala lain 0–100.
4. `app/Exceptions/Handler.php` membalas 401 dengan `status: 'error'` (string) dan
   `AuthController` memakai `'success'`; kontrak memakai angka. FE sudah menyeragamkan,
   tapi sebaiknya konsisten (bisa pakai trait `ApiResponse`).
5. Route belum ada: `industry-insights/{skill}/trend`, `progress-history`,
   `achievements`, `assessment/history`, `DELETE admin/industry-insights/{skill}`,
   `PATCH admin/learning-resources/{id}`.
6. `assessment_questions` belum punya seeder, jadi tabelnya kosong.
7. Tidak ada seeder akun admin (register selalu membuat role `student`).
8. Rate limit `throttle:api` = 60 request/menit, dan karena middleware throttle
   jalan sebelum autentikasi, hitungannya per IP. Satu halaman FE memicu 1–9 request
   (admin-skills 12), jadi berpindah-pindah halaman dengan cepat bisa kena 429 dan
   halaman FE menjadi kosong. Saat pengujian, error itu hilang setelah limit dinaikkan.
   Untuk demo/development, naikkan di `RouteServiceProvider` (mis. 300).

## Endpoint Usulan — Belum Ada di Dokumen Kontrak Awal

Selama proses pengembangan FE, ditemukan beberapa kebutuhan yang belum
punya endpoint di dokumen kontrak API awal:

| Endpoint usulan | Kebutuhan |
|---|---|
| `GET /me/skills` | Level semua skill milik user (dipakai Career Detail & Onboarding step 3) |
| `GET /assessment/history` | Riwayat skor assessment dari waktu ke waktu (halaman My Growth) |
| `GET /skills` (public) | Onboarding step 3 & Skill Assessment butuh daftar semua skill |

Catatan tambahan:
- `GET /careers` belum punya parameter pencarian nama — pencarian di
  Career Explorer masih difilter di FE.
- `GET /admin/careers` (list) cuma balas `required_skills_count`, jadi
  form edit career di admin memanggil `GET /careers/:slug` (endpoint
  publik) untuk ambil `required_skills` lengkap.
- `GET /admin/users` diperlakukan **read-only** di FE, sesuai dokumen.
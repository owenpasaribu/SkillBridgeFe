# SkillBridge — Endpoint Integration Tracker

Dokumen ini buat mantau endpoint mana yang sudah dibangun BE dan sudah
dites nyambung ke FE. Update manual tiap ada progress — kasih tanda
🟢/🟡/🔴 dan centang kolom "Dites FE" begitu sudah dicoba dari FE
beneran (bukan cuma Postman).

**Legenda Status BE:** 🔴 Belum dibuat · 🟡 Sedang dikerjakan · 🟢 Sudah jalan

Begitu satu endpoint jadi 🟢 dan lolos tes FE, tambahkan barisnya ke
`LIVE_ENDPOINTS` di `js/api.js` supaya FE mulai pakai data asli untuk
endpoint itu (baca komentar di bagian atas file itu).

## Auth
| Endpoint | Status BE | Dites FE | Catatan |
|---|---|---|---|
| `POST /auth/register` | 🔴 | ⬜ | |
| `POST /auth/login` | 🔴 | ⬜ | Satu endpoint buat student & admin (deteksi role dari email) |
| `POST /auth/logout` | 🔴 | ⬜ | |
| `GET /me` | 🔴 | ⬜ | |
| `PATCH /me` | 🔴 | ⬜ | `target_career_id` di DB integer, FE kirim slug — perlu resolve di BE |

## Career (public)
| Endpoint | Status BE | Dites FE | Catatan |
|---|---|---|---|
| `GET /careers` | 🟡 | ⬜ | Controller & route sudah ada (folder admin), cek juga versi publiknya |
| `GET /careers/:slug` | 🟡 | ⬜ | |

## Onboarding
| Endpoint | Status BE | Dites FE | Catatan |
|---|---|---|---|
| `POST /onboarding` | 🔴 | ⬜ | |

## Skill Assessment
| Endpoint | Status BE | Dites FE | Catatan |
|---|---|---|---|
| `GET /assessment/questions` | 🔴 | ⬜ | |
| `POST /assessment/submit` | 🔴 | ⬜ | |

## Skill Gap & Readiness
| Endpoint | Status BE | Dites FE | Catatan |
|---|---|---|---|
| `GET /skill-gap` | 🔴 | ⬜ | |
| `GET /readiness-score` | 🔴 | ⬜ | |

## Learning Roadmap
| Endpoint | Status BE | Dites FE | Catatan |
|---|---|---|---|
| `POST /roadmap/generate` | 🔴 | ⬜ | |
| `GET /roadmap` | 🔴 | ⬜ | |
| `PATCH /roadmap/phases/:id` | 🔴 | ⬜ | |

## Portfolio Readiness
| Endpoint | Status BE | Dites FE | Catatan |
|---|---|---|---|
| `GET /portfolio` | 🔴 | ⬜ | |
| `PATCH /portfolio/checklist/:item_code` | 🔴 | ⬜ | |
| `GET /certificates` | 🔴 | ⬜ | |
| `POST /certificates` | 🔴 | ⬜ | |
| `DELETE /certificates/:id` | 🔴 | ⬜ | |
| `POST /portfolio/github-analyze` | 🔴 | ⬜ | BE yang panggil GitHub API (bukan FE) |

## Industry Insights (public)
| Endpoint | Status BE | Dites FE | Catatan |
|---|---|---|---|
| `GET /industry-insights` | 🟡 | ⬜ | Cek versi publiknya (yang ada baru admin) |
| `GET /industry-insights/:skill_id/trend` | 🔴 | ⬜ | |

## Progress & Achievements
| Endpoint | Status BE | Dites FE | Catatan |
|---|---|---|---|
| `GET /progress-history` | 🔴 | ⬜ | |
| `GET /achievements` | 🔴 | ⬜ | |

## Admin
| Endpoint | Status BE | Dites FE | Catatan |
|---|---|---|---|
| `GET /admin/dashboard` | 🟡 | ⬜ | Controller ada, tapi lokasi file salah folder (fatal error) — lihat docs/fe-integration-notes.md |
| `GET /admin/careers` | 🟡 | ⬜ | idem |
| `POST /admin/careers` | 🟡 | ⬜ | idem |
| `PATCH /admin/careers/:id` | 🟡 | ⬜ | idem |
| `DELETE /admin/careers/:id` | 🟡 | ⬜ | idem |
| `GET /admin/skills` | 🟡 | ⬜ | idem |
| `POST /admin/skills` | 🟡 | ⬜ | idem |
| `PATCH /admin/skills/:id` | 🟡 | ⬜ | idem |
| `DELETE /admin/skills/:id` | 🟡 | ⬜ | idem |
| `GET /admin/industry-insights` | 🟡 | ⬜ | idem |
| `POST /admin/industry-insights` | 🟡 | ⬜ | idem |
| `GET /admin/learning-resources` | 🟡 | ⬜ | idem |
| `POST /admin/learning-resources` | 🟡 | ⬜ | idem |
| `DELETE /admin/learning-resources/:id` | 🟡 | ⬜ | idem |
| `GET /admin/users` | 🟡 | ⬜ | Read-only sesuai dokumen |
| `GET /admin/analytics` | 🟡 | ⬜ | idem |
| `GET /admin/scoring-settings` | 🟡 | ⬜ | idem |
| `PUT /admin/scoring-settings` | 🟡 | ⬜ | idem |
| `PATCH /admin/settings/industry-insight-mode` | 🔴 | ⬜ | |
| `GET /admin/scrape-runs` | 🔴 | ⬜ | |
| `POST /admin/scrape-runs/trigger` | 🔴 | ⬜ | |

## Usulan Endpoint Baru (belum di dokumen kontrak resmi)
| Endpoint | Status BE | Dites FE | Catatan |
|---|---|---|---|
| `GET /me/skills` | 🔴 | ⬜ | Perlu didiskusikan dulu sama tim BE |
| `GET /assessment/history` | 🔴 | ⬜ | Perlu didiskusikan dulu sama tim BE |
| `GET /skills` (public) | 🔴 | ⬜ | Perlu didiskusikan dulu sama tim BE |

---

**Progress saat ini:** 0 dari 46 endpoint kontrak resmi sudah lolos tes FE.
Sebagian route admin sudah ke-scaffold di `routes/api.php` tapi masih
fatal error karena bug lokasi file controller (lihat
`laravel-seeders/docs/fe-integration-notes.md`).

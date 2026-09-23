/**
 * SkillBridge — LIVE ADAPTER (FE ⇄ Backend Laravel)
 * ==================================================
 * Dipakai oleh js/api.js saat mode 'live'. File ini adalah satu-satunya
 * tempat yang tahu bentuk respons BE yang SEBENARNYA (lihat repo BE:
 * routes/api.php + app/Http/Controllers/*), lalu menerjemahkannya ke
 * bentuk yang sudah dipakai semua halaman FE (bentuk yang sama dengan
 * js/api-mock.js). Jadi halaman seperti dashboard.js / skill-gap.js
 * tetap manggil `Api.*` seperti biasa.
 *
 * Yang diterjemahkan di sini:
 *  1. Amplop respons. BE kadang balas status: 'success' (string), kadang
 *     angka, dan error validasi 422 memakai format bawaan Laravel
 *     ({message, errors}). Di sini semuanya diseragamkan jadi
 *     {status: <angka HTTP>, message, data}.
 *  2. ID. FE memakai id string (slug career, kode skill: 'sql', 'python')
 *     sedangkan BE memakai id angka. Penerjemahan dua arah dilakukan di
 *     sini lewat cache /careers dan katalog skill.
 *  3. Bentuk data yang beda (mis. GET /me dibungkus data.user, portfolio
 *     dikirim BE sebagai daftar datar, sertifikat ada di
 *     /portfolio/certificates, dst).
 *  4. Endpoint yang belum ada di BE (progress-history, achievements,
 *     assessment/history, trend): dijawab kosong di sisi FE supaya
 *     halaman tetap jalan — lihat daftar di ENDPOINT_TRACKER.md.
 *
 * Tidak ada logika bisnis (hitung skor/gap) di sini — itu tetap tugas BE.
 */

const ROLE_KEY = 'skillbridge_role_v1';

/* ============================================================
   Helper umum
   ============================================================ */

function liveOk(data, message = 'OK', status = 200) { return { status, message, data }; }
function liveFail(status, message, data = null) { return { status, message, data }; }

function toInt(value) {
  if (value === '' || value === null || value === undefined) return undefined;
  const n = Number(value);
  return Number.isNaN(n) ? undefined : n;
}

function roundNum(value) {
  const n = Number(value);
  return Number.isNaN(n) ? 0 : Math.round(n);
}

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try { const parsed = JSON.parse(value); return Array.isArray(parsed) ? parsed : []; } catch (e) { return []; }
  }
  return [];
}

/* ============================================================
   Lapisan HTTP + penyeragaman amplop
   ============================================================ */

/* ============================================================
   Terjemahan pesan dari BE
   ============================================================
   Sebagian pesan BE berbahasa Indonesia. Antarmuka FE berbahasa Inggris,
   jadi pesan yang dikenal diterjemahkan di sini; pesan yang tidak dikenal
   ditampilkan apa adanya. */

const BE_MESSAGES = {
  'Data tidak ditemukan': 'Data not found',
  'Akses ditolak, hanya untuk admin': 'Access denied. Admins only.',
  'Target career belum dipilih': 'No target career has been chosen yet',
  'Roadmap tidak ditemukan': 'Roadmap not found',
  'Roadmap berhasil dibuat': 'Roadmap created',
  'Onboarding selesai': 'Onboarding complete',
  'Registrasi berhasil': 'Registration successful',
  'Login berhasil': 'Login successful',
  'Logout berhasil': 'Logout successful',
  'Profil diperbarui': 'Profile updated',
  'Assessment tersimpan': 'Assessment saved',
  'Status fase diperbarui': 'Phase status updated',
  'Checklist diperbarui': 'Checklist updated',
  'Sertifikat ditambahkan': 'Certificate added',
  'Sertifikat dihapus': 'Certificate deleted',
  'Analisis GitHub selesai': 'GitHub analysis complete',
  'Career ditambahkan': 'Career added',
  'Career diperbarui': 'Career updated',
  'Career dihapus': 'Career deleted',
  'Skill ditambahkan': 'Skill added',
  'Skill diperbarui': 'Skill updated',
  'Skill dihapus': 'Skill deleted',
  'Data industri disimpan': 'Industry data saved',
  'Resource ditambahkan': 'Resource added',
  'Resource dihapus': 'Resource deleted',
  'Bobot skor diperbarui': 'Score weights updated',
  'Mode industry insight diperbarui': 'Industry insight mode updated',
  'Scraping dijalankan di background': 'Scraping started in the background',
  'Validasi gagal': 'Validation failed',
  'Email sudah terdaftar': 'This email is already registered',
  'Email atau password salah': 'Incorrect email or password',
  'Unauthenticated.': 'Please sign in to continue.',
};

function translateBeMessage(message) {
  if (!message || typeof message !== 'string') return message;
  return BE_MESSAGES[message.trim().replace(/[.]$/, '')] || BE_MESSAGES[message.trim()] || message;
}

/** "3 bulan terakhir" -> "Last 3 months" (kolom period berisi teks bebas dari BE). */
function translatePeriod(period) {
  if (typeof period !== 'string') return period;
  return period.replace(/^(\d+)\s+bulan\s+terakhir$/i, 'Last $1 months').replace(/^(\d+)\s+minggu\s+terakhir$/i, 'Last $1 weeks');
}

/**
 * Menyeragamkan respons BE jadi {status, message, data}.
 * `status` selalu angka HTTP yang sebenarnya — BE ada yang mengisi
 * 'success'/'error' (string) di body, jadi body tidak bisa dipercaya
 * untuk status.
 */
function normalizeEnvelope(httpStatus, json, path) {
  // Token ditolak/kedaluwarsa: bersihkan sesi lokal (kecuali salah password di /auth/login).
  if (httpStatus === 401 && path !== '/auth/login') {
    clearAuthToken();
    localStorage.removeItem(ROLE_KEY);
  }

  // Halaman admin FE hanya mengecek 401 untuk redirect ke login. Student yang
  // membuka halaman admin dapat 403 dari BE → dianggap 401 supaya diarahkan keluar.
  let status = httpStatus;
  if (httpStatus === 403 && path.startsWith('/admin')) status = 401;

  if (!json || typeof json !== 'object') {
    return liveFail(status || 500, 'The server returned an invalid response.');
  }

  // Error validasi bawaan Laravel: {message, errors:{field:[...]}}
  if (httpStatus === 422 && json.errors) {
    const firstList = Object.values(json.errors)[0];
    const firstMessage = Array.isArray(firstList) ? firstList[0] : json.message;
    return liveFail(422, firstMessage || 'Validation failed', { errors: json.errors });
  }

  return {
    status,
    message: translateBeMessage(json.message) || (httpStatus < 400 ? 'OK' : 'Something went wrong'),
    data: json.data !== undefined ? json.data : null,
  };
}

/** Satu request ke BE. `path` relatif terhadap API_BASE_URL, mis. '/careers'. */
async function beCall(method, path, { query = {}, body = null } = {}) {
  const qs = new URLSearchParams(
    Object.entries(query).filter(([, v]) => v !== undefined && v !== null && v !== '')
  ).toString();
  const url = `${API_BASE_URL}${path}${qs ? `?${qs}` : ''}`;

  const headers = { Accept: 'application/json' };
  if (body !== null && body !== undefined) headers['Content-Type'] = 'application/json';
  const token = getAuthToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(url, { method, headers, body: body !== null && body !== undefined ? JSON.stringify(body) : undefined });
  } catch (err) {
    return liveFail(0, 'Could not reach the server. Please check your connection and try again.');
  }

  let json = null;
  try { json = await res.json(); } catch (e) { /* body kosong / bukan JSON */ }
  return normalizeEnvelope(res.status, json, path);
}

/* ---- Cache singkat di sessionStorage (mengurangi request; BE membatasi 60/menit) ---- */

function cacheGet(key, ttlMs) {
  try {
    const cached = JSON.parse(sessionStorage.getItem(key) || 'null');
    if (cached && Date.now() - cached.at < ttlMs) return cached.data;
  } catch (e) { /* abaikan cache rusak */ }
  return null;
}
function cacheSet(key, data) {
  try { sessionStorage.setItem(key, JSON.stringify({ at: Date.now(), data })); } catch (e) { /* storage penuh */ }
}
function cacheClear(prefix) {
  try { Object.keys(sessionStorage).filter(k => k.startsWith(prefix)).forEach(k => sessionStorage.removeItem(k)); } catch (e) { /* abaikan */ }
}
const CAREER_CACHE_PREFIX = 'skillbridge_career_';
const CAREER_CACHE_TTL = 5 * 60 * 1000;

/* ============================================================
   Cache career (id angka <-> slug)
   ============================================================ */

let careersPromise = null;

/** Daftar career tanpa filter (dari GET /careers publik). Dipakai untuk terjemah id<->slug. */
function loadCareers(force = false) {
  if (force || !careersPromise) {
    careersPromise = beCall('GET', '/careers').then(res => {
      if (res.status !== 200 || !Array.isArray(res.data)) { careersPromise = null; return []; }
      return res.data;
    });
  }
  return careersPromise;
}

async function findCareer(predicate) {
  let found = (await loadCareers()).find(predicate);
  if (!found) found = (await loadCareers(true)).find(predicate); // cache mungkin basi (admin baru nambah career)
  return found || null;
}

async function careerSlugToId(slug) {
  if (slug === null || slug === undefined || slug === '') return null;
  const career = await findCareer(c => c.slug === slug);
  if (career) return career.id;
  return /^\d+$/.test(String(slug)) ? Number(slug) : null;
}

async function careerIdToSlug(id) {
  if (id === null || id === undefined || id === '') return null;
  const career = await findCareer(c => String(c.id) === String(id));
  return career ? career.slug : String(id);
}

/** BE hanya mengirim id, slug, name, industry_demand, remote_friendly — sisanya dilengkapi dari seed FE (CAREERS di data.js) berdasarkan slug. */
function careerToFeDto(be) {
  const seed = (typeof CAREERS !== 'undefined' && CAREERS.find(c => c.slug === be.slug)) || {};
  return {
    id: be.slug,
    slug: be.slug,
    name: be.name ?? seed.name ?? be.slug,
    category: be.category ?? seed.category ?? 'General',
    difficulty: be.difficulty ?? seed.difficulty ?? 'Intermediate',
    industry_demand: be.industry_demand ?? seed.industryDemand ?? 0,
    job_sample_size: be.job_sample_size ?? seed.jobSampleSize ?? 0,
    remote_friendly: !!(be.remote_friendly ?? seed.remoteFriendly),
    short_description: be.short_description ?? seed.shortDescription ?? '',
    description: be.description ?? seed.description ?? '',
    responsibilities: be.responsibilities ?? seed.responsibilities ?? [],
     be.tools ?? seed.tools ?? (be.required_skills ? be.required_skills.map(s => s.skill_name).slice(0, 5) : []),
  };
}

/* ============================================================
   Katalog skill
   ============================================================
   Kunci skill di FE = id angka dari BE yang dijadikan string ("22").
   Kolom `code` di BE tidak bisa dijadikan kunci: bisa null, dan BE punya
   ratusan skill yang tidak ada di seed FE. `code` hanya dipakai sebagai
   petunjuk untuk data bawaan FE (kategori & resource per skill). */

const skillCatalog = { byKey: new Map() };
let catalogPromise = null;

// Nama skill soft skill yang dikenali. BE tidak mengirim `category` ke student
// (hanya admin/GET /me/skills yang punya), jadi kategori ditebak dari nama.
const SOFT_SKILL_PATTERN = /(communicat|komunikasi|teamwork|team work|collaborat|kolaborasi|problem[\s_-]?solving|critical[\s_-]?thinking|leadership|kepemimpinan|time[\s_-]?management|adaptab|creativ|kreativ|presentation|negotiat|stakeholder|analytical[\s_-]?thinking|attention[\s_-]?to[\s_-]?detail|self[\s_-]?learning|work[\s_-]?ethic|empath|interpersonal|decision[\s_-]?making|storytelling|public[\s_-]?speaking|mentoring|emotional)/i;

function guessSkillCategory(name, code) {
  if (typeof SKILLS !== 'undefined' && code) {
    const seeded = SKILLS.find(s => s.id === code);
    if (seeded) return seeded.category;
  }
  return SOFT_SKILL_PATTERN.test(String(name || '')) ? 'soft' : 'technical';
}

/** Daftarkan/perbarui skill. Boleh dipanggil dengan info sebagian (mis. hanya id + nama). */
function registerSkill(skill) {
  if (!skill || skill.id === undefined || skill.id === null) return;
  const key = String(skill.id);
  const prev = skillCatalog.byKey.get(key) || {};
  const name = skill.name || prev.name || key;
  const code = skill.code || prev.code || null;
  skillCatalog.byKey.set(key, {
    id: Number(skill.id),
    key,
    code,
    name,
    // kategori resmi dari BE menang; kalau tidak ada, pakai yang sudah diketahui, lalu tebakan
    category: skill.category || prev.officialCategory || guessSkillCategory(name, code),
    officialCategory: skill.category || prev.officialCategory || null,
  });
}

function skillIdToCode(id) {
  return id === null || id === undefined || id === '' ? null : String(id);
}

function skillCodeToId(key) {
  return /^\d+$/.test(String(key)) ? Number(key) : null;
}

function skillCategoryOf(key) {
  const entry = skillCatalog.byKey.get(String(key));
  if (entry) return entry.category;
  return typeof getSkillCategory === 'function' ? getSkillCategory(key) : 'technical';
}

function skillNameOf(key) {
  const entry = skillCatalog.byKey.get(String(key));
  if (entry) return entry.name;
  return typeof skillName === 'function' ? skillName(key) : String(key);
}

/**
 * Helper lama FE (skillName, getSkillCategory) membaca daftar skill dari
 * admin-store (localStorage). Skill dari BE ditambahkan ke sana supaya helper
 * itu tetap akurat.
 */
function syncCatalogToLocalStore() {
  if (typeof getAdminContent !== 'function') return;
  const content = getAdminContent();
  let changed = false;
  skillCatalog.byKey.forEach(entry => {
    const existing = content.skills.find(s => s.id === entry.key);
    if (!existing) {
      content.skills.push({ id: entry.key, name: entry.name, category: entry.category });
      changed = true;
    } else if (existing.name !== entry.name || existing.category !== entry.category) {
      existing.name = entry.name;
      existing.category = entry.category;
      changed = true;
    }
  });
  if (changed) saveAdminContent(content);
}

/** Bentuk baris insight dari BE: kolom rata (skill_id, skill_code, skill_name) atau bersarang (skill: {...}). */
function skillFromInsight(i) {
  return {
    id: i.skill_id ?? (i.skill && i.skill.id),
    code: i.skill_code ?? (i.skill && i.skill.code) ?? null,
    name: i.skill_name ?? (i.skill && i.skill.name),
    category: i.skill && i.skill.category,
  };
}

/**
 * Sumber katalog: admin → GET /admin/skills (lengkap, ada category). Student →
 * GET /industry-insights (hanya skill yang punya data demand). Skill lain
 * didaftarkan saat muncul di respons (detail career, skill gap, roadmap, dst).
 * BE belum punya GET /skills untuk student; kalau nanti ada, ganti isi fungsi ini.
 */
function ensureSkillCatalog(force = false) {
  if (!force && catalogPromise) return catalogPromise;
  catalogPromise = (async () => {
    let loaded = false;
    if (localStorage.getItem(ROLE_KEY) === 'admin') {
      const res = await beCall('GET', '/admin/skills');
      if (res.status === 200 && Array.isArray(res.data)) { res.data.forEach(registerSkill); loaded = true; }
    }
    if (!loaded) {
      const res = await beCall('GET', '/industry-insights');
      if (res.status === 200 && Array.isArray(res.data)) { res.data.forEach(i => registerSkill(skillFromInsight(i))); loaded = true; }
    }
    if (!loaded) catalogPromise = null; // gagal → coba lagi di panggilan berikutnya
    syncCatalogToLocalStore();
  })();
  return catalogPromise;
}

/* ============================================================
   Mapper bentuk data BE -> bentuk FE
   ============================================================ */

const GAP_CATEGORY_MAP = { critical: 'critical', moderate: 'moderate', minor: 'small', none: 'strong' };
const PRIORITY_RANK = { Critical: 3, High: 2, Medium: 1, Low: 0 };

async function feUser(user) {
  if (user && user.role) localStorage.setItem(ROLE_KEY, user.role);
  return { ...user, target_career_id: user && user.target_career_id ? await careerIdToSlug(user.target_career_id) : null };
}

function feRoadmapPhase(phase) {
  if (phase.skill) registerSkill(phase.skill);
  const key = phase.skill_id !== null && phase.skill_id !== undefined ? skillIdToCode(phase.skill_id) : null;
  const seedCode = key && skillCatalog.byKey.get(key) ? skillCatalog.byKey.get(key).code : null;
  const beResources = asArray(phase.resources);
  const fallback = seedCode && typeof SKILL_CONTENT !== 'undefined' && SKILL_CONTENT[seedCode] ? (SKILL_CONTENT[seedCode].resources || []) : [];
  return {
    id: phase.id,
    skill_id: key,
    title: phase.title,
    priority: phase.priority,
    status: phase.status,
    learning_objective: phase.learning_objective || `Improve your ${phase.title} skills.`,
    why: phase.why || '',
    after_text: phase.after_text || '',
    // roadmap_phases.resources diisi null oleh BE saat generate → pakai resource bawaan FE per skill.
    resources: beResources.length ? beResources : fallback,
    tasks: asArray(phase.tasks),
    mini_project: phase.mini_project || '',
    duration_days: phase.duration_days ?? 7,
  };
}

function feCertificate(c) {
  return { id: c.id, title: c.title, issuer: c.issuer, year: c.year };
}

async function beRequiredSkillsBody(requiredSkills) {
  await ensureSkillCatalog();
  return (requiredSkills || [])
    .map(r => ({ skill_id: skillCodeToId(r.skill_id), level: r.level, importance: r.importance }))
    .filter(r => r.skill_id !== null);
}

async function beCareerBody(body) {
  const payload = { ...body };
  if (payload.required_skills) payload.required_skills = await beRequiredSkillsBody(payload.required_skills);
  return payload;
}

/* ============================================================
   Handler per endpoint (yang bentuknya beda dari BE)
   Endpoint yang tidak ada di sini diteruskan apa adanya ke BE.
   ============================================================ */

const H = {};

/* ---------- Auth ---------- */

H['POST /auth/register'] = async ({ body }) => {
  const res = await beCall('POST', '/auth/register', {
    body: { ...body, semester: toInt(body.semester), graduation_year: toInt(body.graduation_year) },
  });
  if (res.data && res.data.user && res.data.user.role) localStorage.setItem(ROLE_KEY, res.data.user.role);
  return res;
};

H['POST /auth/login'] = async ({ body }) => {
  const res = await beCall('POST', '/auth/login', { body });
  if (res.status === 200 && res.data && res.data.user) localStorage.setItem(ROLE_KEY, res.data.user.role);
  return res;
};

H['POST /auth/logout'] = async () => {
  const res = await beCall('POST', '/auth/logout');
  localStorage.removeItem(ROLE_KEY);
  return res;
};

// BE membungkus profil di data.user; FE mengharapkan data = profil langsung.
H['GET /me'] = async () => {
  const res = await beCall('GET', '/me');
  if (res.status !== 200) return res;
  return { ...res, data: await feUser(res.data.user) };
};

H['PATCH /me'] = async ({ body }) => {
  const payload = { ...body };
  if (payload.target_career_id) {
    const careerId = await careerSlugToId(payload.target_career_id);
    if (careerId === null) return liveFail(422, 'Career not found.', { errors: { target_career_id: ['Career not found.'] } });
    payload.target_career_id = careerId;
  }
  ['semester', 'graduation_year'].forEach(key => { if (key in payload) payload[key] = toInt(payload[key]); });

  const res = await beCall('PATCH', '/me', { body: payload });
  if (res.status !== 200) return res;
  return { ...res, data: await feUser(res.data.user) };
};

H['GET /me/skills'] = async () => {
  const res = await beCall('GET', '/me/skills');
  if (res.status !== 200) return res;
  const list = asArray((res.data && res.data.skills) || res.data);
  list.forEach(us => registerSkill(us.skill));
  return {
    ...res,
    data: list.map(us => ({ skill_id: skillIdToCode(us.skill_id), level: Number(us.level), confidence: us.confidence, source: us.source })),
  };
};

// Usulan endpoint baru di FE (Api.skills.list) — dipenuhi dari katalog skill.
// Katalog student hanya berisi skill yang punya data demand, jadi kalau ?career=slug
// diberikan, skill yang dibutuhkan career itu ikut ditambahkan.
H['GET /skills'] = async ({ query }) => {
  await ensureSkillCatalog();
  if (query && query.career) await H['GET /careers/:slug']({ params: { slug: query.career } });
  syncCatalogToLocalStore();
  const list = [...skillCatalog.byKey.values()]
    .map(s => ({ id: s.key, code: s.code, name: s.name, category: s.category }))
    .sort((a, b) => a.name.localeCompare(b.name));
  return liveOk(list);
};

/* ---------- Career ---------- */

// Filter category/difficulty/remote dikerjakan di FE: BE hanya mengirim 5 kolom,
// jadi kategori & tingkat kesulitan yang tampil (dari seed FE) bisa beda tulisan
// dengan isi kolom di database BE. Dropdown filter FE dibangun dari data yang sama.
H['GET /careers'] = async ({ query }) => {
  const res = await beCall('GET', '/careers');
  if (res.status !== 200) return res;
  careersPromise = Promise.resolve(res.data);

  const same = (a, b) => String(a || '').toLowerCase() === String(b || '').toLowerCase();
  let list = asArray(res.data).map(careerToFeDto);
  if (query && query.category) list = list.filter(c => same(c.category, query.category));
  if (query && query.difficulty) list = list.filter(c => same(c.difficulty, query.difficulty));
  if (query && (query.remote_friendly === true || query.remote_friendly === 'true' || query.remote_friendly === '1')) list = list.filter(c => c.remote_friendly);
  return { ...res, data: list };
};

H['GET /careers/:slug'] = async ({ params }) => {
  await ensureSkillCatalog();
  let slug = params.slug;
  if (/^\d+$/.test(String(slug))) slug = await careerIdToSlug(slug); // jaga-jaga kalau ada yang kirim id angka

  const cached = cacheGet(CAREER_CACHE_PREFIX + slug, CAREER_CACHE_TTL);
  if (cached) {
    cached.required_skills.forEach(r => registerSkill({ id: r.skill_id, name: r.skill_name }));
    return liveOk(cached);
  }

  const [res, list] = await Promise.all([beCall('GET', `/careers/${encodeURIComponent(slug)}`), loadCareers()]);
  if (res.status !== 200) return res;

  const listItem = list.find(c => c.slug === res.data.slug) || {};
  const dto = careerToFeDto({ ...listItem, ...res.data });
  asArray(res.data.required_skills).forEach(r => registerSkill({ id: r.skill_id, name: r.skill_name }));
  syncCatalogToLocalStore();
  dto.required_skills = asArray(res.data.required_skills).map(r => ({
    skill_id: skillIdToCode(r.skill_id),
    skill_name: r.skill_name,
    required_level: Number(r.required_level),
    importance: r.importance,
  }));
  cacheSet(CAREER_CACHE_PREFIX + slug, dto);
  return { ...res, data: dto };
};

/* ---------- Onboarding ---------- */

H['POST /onboarding'] = async ({ body }) => {
  await ensureSkillCatalog();
  const careerId = await careerSlugToId(body.target_career_id);
  if (careerId === null) return liveFail(422, 'Career not found.', { errors: { target_career_id: ['Career not found.'] } });

  const skills = (body.skills || [])
    .map(s => ({ skill_id: skillCodeToId(s.skill_id), level: s.level }))
    .filter(s => s.skill_id !== null);

  const res = await beCall('POST', '/onboarding', {
    body: { target_career_id: careerId, target_timeline_months: body.target_timeline_months, skills },
  });
  if (res.status !== 200) return res;

  // BE hanya membuat baris roadmap saat onboarding, fase-fasenya baru dibuat oleh
  // POST /roadmap/generate. Dokumen kontrak bilang onboarding sekaligus generate
  // roadmap pertama, jadi dipanggil di sini.
  const generated = await beCall('POST', '/roadmap/generate');
  if (generated.status !== 200) console.warn('Onboarding succeeded, but generating the roadmap failed:', generated.message);

  return { ...res, data: { ...res.data, target_career_id: await careerIdToSlug(res.data.target_career_id) } };
};

/* ---------- Skill Assessment ---------- */

// BE mengirim semua baris tabel assessment_questions (tanpa opsi jawaban, tanpa
// filter career). Sesuai kontrak, pertanyaan disusun dari skill target career,
// memakai opsi skenario bawaan FE (SCENARIO_OPTIONS), dan teks pertanyaan dari
// BE dipakai bila ada.
H['GET /assessment/questions'] = async () => {
  await ensureSkillCatalog();
  const me = await H['GET /me']({});
  if (me.status !== 200) return me;

  let skills = [];
  if (me.data.target_career_id) {
    const career = await H['GET /careers/:slug']({ params: { slug: me.data.target_career_id } });
    if (career.status === 200) skills = career.data.required_skills.map(r => ({ code: r.skill_id, name: r.skill_name }));
  }
  if (skills.length === 0) skills = [...skillCatalog.byKey.values()].map(s => ({ code: s.key, name: s.name }));

  const textBySkill = {};
  const qRes = await beCall('GET', '/assessment/questions');
  if (qRes.status === 200 && Array.isArray(qRes.data)) {
    qRes.data.forEach(q => { if (q.question) textBySkill[skillIdToCode(q.skill_id)] = q.question; });
  }

  return liveOk(skills.map(s => ({
    skill_id: s.code,
    skill_name: s.name,
    question: textBySkill[s.code] || null,
    options: SCENARIO_OPTIONS.map(o => ({ label: o.label, value: o.value })),
  })));
};

H['POST /assessment/submit'] = async ({ body }) => {
  await ensureSkillCatalog();
  const answers = (body.answers || [])
    .map(a => ({ skill_id: skillCodeToId(a.skill_id), scenario_score: a.scenario_score, confidence: a.confidence }))
    .filter(a => a.skill_id !== null);

  const res = await beCall('POST', '/assessment/submit', { body: { answers } });
  if (res.status !== 200) return res;
  return { ...res, data: { average_score: res.data.average_score ?? res.data.score, achievements_unlocked: asArray(res.data.achievements_unlocked) } };
};

/* ---------- Skill Gap & Readiness ---------- */

H['GET /skill-gap'] = async () => {
  await ensureSkillCatalog();
  const res = await beCall('GET', '/skill-gap');
  if (res.status !== 200) return res;

  const gaps = asArray(res.data.gaps).map(g => ({
    skill_id: skillIdToCode(g.skill_id),
    skill_name: g.skill_name,
    user_level: Number(g.user_level),
    required_level: Number(g.required_level),
    demand: Number(g.demand),
    gap_value: Number(g.gap_value),
    category: GAP_CATEGORY_MAP[g.category] || g.category,
    priority: g.priority,
  }));
  gaps.sort((a, b) => (PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority]) || (a.gap_value - b.gap_value));

  // BE hanya mengirim skill yang masih kurang. Skill target career yang sudah
  // memenuhi standar ditambahkan di sini sebagai "Strong Match" supaya halaman
  // Skill Gap dan Dashboard juga menunjukkan yang sudah kuat. Kalau data
  // pendukung gagal dimuat, yang tampil tetap daftar dari BE.
  try {
    const me = await H['GET /me']({});
    if (me.status === 200 && me.data.target_career_id) {
      const [career, mySkills] = await Promise.all([
        H['GET /careers/:slug']({ params: { slug: me.data.target_career_id } }),
        H['GET /me/skills']({}),
      ]);
      if (career.status === 200 && mySkills.status === 200) {
        const listed = new Set(gaps.map(g => g.skill_id));
        const levels = {};
        mySkills.data.forEach(s => { levels[s.skill_id] = s.level; });
        career.data.required_skills.forEach(r => {
          if (listed.has(r.skill_id)) return;
          const userLevel = levels[r.skill_id] !== undefined ? levels[r.skill_id] : r.required_level;
          gaps.push({
            skill_id: r.skill_id, skill_name: r.skill_name,
            user_level: userLevel, required_level: r.required_level,
            demand: 0, gap_value: userLevel - r.required_level,
            category: 'strong', priority: 'Low',
          });
        });
      }
    }
  } catch (e) { /* tampilkan daftar dari BE saja */ }

  return { ...res, data: { career_name: res.data.career_name, gaps } };
};

H['GET /readiness-score'] = async () => {
  const res = await beCall('GET', '/readiness-score');
  if (res.status !== 200) return res;
  const d = res.data;
  return {
    ...res,
    data: {
      overall: roundNum(d.overall), technical: roundNum(d.technical), soft: roundNum(d.soft),
      portfolio: roundNum(d.portfolio), experience: roundNum(d.experience), assessment: roundNum(d.assessment),
      status: d.status,
    },
  };
};

/* ---------- Roadmap ---------- */

H['POST /roadmap/generate'] = async () => {
  const res = await beCall('POST', '/roadmap/generate');
  if (res.status !== 200) return res;
  return { ...res, data: { ...res.data, target_career_id: await careerIdToSlug(res.data.target_career_id) } };
};

H['GET /roadmap'] = async () => {
  await ensureSkillCatalog();
  const res = await beCall('GET', '/roadmap');
  if (res.status !== 200) return res;
  const r = res.data;
  return {
    ...res,
    data: {
      id: r.id,
      target_career_id: await careerIdToSlug(r.target_career_id),
      generated_at: r.generated_at,
      phases: asArray(r.phases).map(feRoadmapPhase),
    },
  };
};

/* ---------- Portfolio ---------- */

// BE mengirim checklist sebagai daftar datar [{code, category, label, done}].
// FE butuh {overall, groups[]} — grup Technical Skills dan Certifications
// dirangkai dari data lain (skill target career & sertifikat).
H['GET /portfolio'] = async () => {
  await ensureSkillCatalog();
  const [itemsRes, certRes, meRes, mySkillsRes] = await Promise.all([
    beCall('GET', '/portfolio'),
    beCall('GET', '/portfolio/certificates'),
    H['GET /me']({}),
    H['GET /me/skills']({}),
  ]);
  if (itemsRes.status !== 200) return itemsRes;

  const percentOf = items => (items.length ? Math.round((items.filter(i => i.done).length / items.length) * 100) : 0);

  // Technical Skills: skill teknis target career yang levelnya >= 80% dari yang dibutuhkan.
  let technicalItems = [];
  if (meRes.status === 200 && meRes.data.target_career_id) {
    const careerRes = await H['GET /careers/:slug']({ params: { slug: meRes.data.target_career_id } });
    if (careerRes.status === 200) {
      const levelMap = {};
      (mySkillsRes.data || []).forEach(s => { levelMap[s.skill_id] = s.level; });
      technicalItems = careerRes.data.required_skills
        .filter(r => skillCategoryOf(r.skill_id) === 'technical')
        .map(r => ({ id: r.skill_id, label: r.skill_name, done: (levelMap[r.skill_id] || 0) >= r.required_level * 0.8 }));
    }
  }
  const technicalGroup = { category: 'Technical Skills', items: technicalItems, percent: percentOf(technicalItems) };

  // Checklist dari BE dikelompokkan per kategori.
  const preferredOrder = ['Portfolio', 'Experience', 'Career Documents'];
  const byCategory = new Map();
  asArray(itemsRes.data).forEach(item => {
    if (!byCategory.has(item.category)) byCategory.set(item.category, []);
    byCategory.get(item.category).push({ id: item.code, label: item.label, done: !!item.done });
  });
  const categories = [
    ...preferredOrder.filter(c => byCategory.has(c)),
    ...[...byCategory.keys()].filter(c => !preferredOrder.includes(c)),
  ];
  const checklistGroups = categories.map(category => {
    const items = byCategory.get(category);
    return { category, items, percent: percentOf(items) };
  });

  const certs = certRes.status === 200 ? asArray(certRes.data) : [];
  const certGroup = {
    category: 'Certifications',
    items: certs.map(c => ({ id: c.id, label: `${c.title} — ${c.issuer}`, done: true })),
    percent: Math.min(100, certs.length * 34),
  };

  const groups = [technicalGroup, ...checklistGroups, certGroup];
  const overall = Math.round(groups.reduce((sum, g) => sum + g.percent, 0) / groups.length);
  return liveOk({ overall, groups });
};

H['PATCH /portfolio/checklist/:item_code'] = async ({ params, body }) => {
  const res = await beCall('PATCH', `/portfolio/checklist/${encodeURIComponent(params.item_code)}`, { body: { done: !!body.done } });
  if (res.status !== 200) return res;
  return { ...res, data: { item_code: res.data.code, done: res.data.done } };
};

// Di BE sertifikat ada di bawah /portfolio/certificates (bukan /certificates).
H['GET /certificates'] = async () => {
  const res = await beCall('GET', '/portfolio/certificates');
  if (res.status !== 200) return res;
  return { ...res, data: asArray(res.data).map(feCertificate) };
};

H['POST /certificates'] = async ({ body }) => {
  const res = await beCall('POST', '/portfolio/certificates', {
    body: { title: body.title, issuer: body.issuer, year: toInt(body.year) },
  });
  if (res.status !== 200 && res.status !== 201) return res;
  // BE membalas 200 untuk create; FE (dan dokumen kontrak) menunggu 201.
  return { ...res, status: 201, data: feCertificate(res.data) };
};

H['DELETE /certificates/:id'] = async ({ params }) => {
  return beCall('DELETE', `/portfolio/certificates/${encodeURIComponent(params.id)}`);
};

// BE mengembalikan daftar repo mentah dari GitHub; ringkasan bahasa dihitung di sini.
// BE belum mengubah level skill dari hasil analisis, jadi boosted_skills selalu kosong.
H['POST /portfolio/github-analyze'] = async ({ body }) => {
  const res = await beCall('POST', '/portfolio/github-analyze', { body: { github_username: body.github_username } });
  if (res.status !== 200) return res;

  const repos = asArray(res.data.repositories);
  const langCount = {};
  repos.forEach(r => { if (r.language) langCount[r.language] = (langCount[r.language] || 0) + 1; });

  // Simpan username supaya terisi otomatis lain kali (BE tidak menyimpannya sendiri).
  await beCall('PATCH', '/me', { body: { github_username: res.data.github_username || body.github_username } });

  return {
    ...res,
    message: 'GitHub analysis complete',
    data: {
      repos_analyzed: res.data.repository_count ?? repos.length,
      languages: Object.entries(langCount).sort((a, b) => b[1] - a[1]).map(([name, repo_count]) => ({ name, repo_count })),
      boosted_skills: [],
    },
  };
};

/* ---------- Industry Insights ---------- */

// BE mendukung ?region= (provinsi/kota) dan mengirim baris rata:
// {skill_id, skill_code, skill_name, demand, trend, job_sample_size, period, region}.
// Versi BE lama mengirim skill bersarang ({skill: {...}}) — dua-duanya didukung.
// 'National' means no region filter.
H['GET /industry-insights'] = async ({ query }) => {
  const region = query && query.region && query.region !== 'National' ? query.region : undefined;
  const res = await beCall('GET', '/industry-insights', { query: { region } });
  if (res.status !== 200) return res;

  const rows = asArray(res.data);
  rows.forEach(i => registerSkill(skillFromInsight(i)));
  syncCatalogToLocalStore();

  return {
    ...res,
    data: rows.map(i => {
      const skill = skillFromInsight(i);
      return {
        skill_id: skillIdToCode(skill.id),
        skill_name: skill.name || skillNameOf(skill.id),
        demand: Number(i.demand),
        trend: i.trend,
        job_sample_size: Number(i.job_sample_size || 0),
        period: translatePeriod(i.period),
      };
    }),
  };
};

/* ---------- Role Insights ---------- */

H['GET /role-insights'] = async ({ query }) => {
  const region = query && query.region && query.region !== 'National' ? query.region : undefined;
  const res = await beCall('GET', '/role-insights', { query: { region } });
  if (res.status !== 200) return res;
  return { ...res, data: asArray(res.data) };
};

H['GET /role-insights/:role/trend'] = async ({ params, query }) => {
  const region = query && query.region && query.region !== 'National' ? query.region : undefined;
  const res = await beCall('GET', `/role-insights/${encodeURIComponent(params.role)}/trend`, { query: { region } });
  if (res.status !== 200) return res;
  return { ...res, data: res.data.history || [] }; // sesuaikan: BE sekarang balas {role, slug, history}, bukan array langsung
};

// Riwayat demand suatu skill. Bentuk item `history` belum ada contohnya di dokumentasi BE
// (masih kosong), jadi field dibaca secara longgar → [{month, value}].
// Hasil disimpan sementara di sessionStorage karena halaman Industry Insights
// memanggil ini untuk banyak skill sekaligus dan BE membatasi 60 request/menit.
H['GET /industry-insights/:skill_id/trend'] = async ({ params }) => {
  const cacheKey = `skillbridge_trend_${params.skill_id}`;
  try {
    const cached = JSON.parse(sessionStorage.getItem(cacheKey) || 'null');
    if (cached && Date.now() - cached.at < 10 * 60 * 1000) return liveOk(cached.data);
  } catch (e) { /* abaikan cache rusak */ }

  const res = await beCall('GET', `/industry-insights/${encodeURIComponent(params.skill_id)}/trend`);
  if (res.status !== 200) return res;

  const history = asArray(res.data && res.data.history).map(h => ({
    month: h.month ?? h.period ?? h.label ?? '',
    value: Number(h.value ?? h.demand ?? h.percentage ?? 0),
  }));
  try { sessionStorage.setItem(cacheKey, JSON.stringify({ at: Date.now(), data: history })); } catch (e) { /* storage penuh */ }
  return { ...res, data: history };
};

/* ---------- Progress & Achievements ---------- */

// Ada di dokumentasi BE terbaru. Kalau BE yang jalan belum punya route-nya (404),
// dijawab daftar kosong supaya halaman tetap tampil.
H['GET /progress-history'] = async () => {
  await ensureSkillCatalog();
  const res = await beCall('GET', '/progress-history');
  if (res.status === 404 || res.status === 405) return liveOk([]);
  if (res.status !== 200) return res;

  // BE mengurutkan dari yang terbaru; FE membaca dari yang terlama ke terbaru.
  const list = asArray(res.data).map(h => {
    const snapshot = {};
    const raw = h.skill_snapshot && typeof h.skill_snapshot === 'object' ? h.skill_snapshot : {};
    Object.entries(raw).forEach(([k, v]) => {
      const byCode = [...skillCatalog.byKey.values()].find(s => s.code === k);
      snapshot[/^\d+$/.test(k) ? k : (byCode ? byCode.key : k)] = Number(v);
    });
    return {
      date: h.date || String(h.recorded_at || h.created_at || '').slice(0, 10),
      readiness_score: roundNum(h.readiness_score),
      skill_snapshot: snapshot,
    };
  });
  list.sort((a, b) => String(a.date).localeCompare(String(b.date)));
  return { ...res, data: list };
};

H['GET /achievements'] = async () => {
  const res = await beCall('GET', '/achievements');
  if (res.status === 404 || res.status === 405) return liveOk([]);
  if (res.status !== 200) return res;
  return {
    ...res,
    data: asArray(res.data).map(a => ({
      code: a.code ?? a.achievement_code,
      title: a.title ?? (a.achievement && a.achievement.title) ?? a.code,
      earned_at: a.earned_at,
    })),
  };
};

/* ---------- Belum ada di BE ---------- */

H['GET /assessment/history'] = async () => liveOk([]);

/* ---------- Admin ---------- */

H['GET /admin/dashboard'] = async () => {
  const res = await beCall('GET', '/admin/dashboard');
  if (res.status !== 200) return res;
  // BE baru menghitung 3 angka ini; sisanya null supaya FE menampilkan "–" (bukan "undefined").
  return {
    ...res,
    data: { active_users: null, roadmap_completion: null, assessment_completion: null, ...res.data },
  };
};

H['GET /admin/analytics'] = async () => {
  const res = await beCall('GET', '/admin/analytics');
  if (res.status !== 200) return res;
  return {
    ...res,
    data: {
      career_distribution: asArray(res.data.career_distribution).map(d => ({ career: d.career, count: Number(d.count) })),
      gap_distribution: asArray(res.data.gap_distribution),
      user_growth: asArray(res.data.user_growth),
    },
  };
};

H['GET /admin/careers'] = async () => {
  const [res, list] = await Promise.all([beCall('GET', '/admin/careers'), loadCareers(true)]);
  if (res.status !== 200) return res;
  return {
    ...res,
    data: asArray(res.data).map(c => {
      const listItem = list.find(x => String(x.id) === String(c.id)) || {};
      return { ...careerToFeDto({ ...listItem, name: c.name, slug: listItem.slug || String(c.id) }), required_skills_count: c.required_skills_count };
    }),
  };
};

H['POST /admin/careers'] = async ({ body }) => {
  const res = await beCall('POST', '/admin/careers', { body: await beCareerBody(body) });
  if (res.status !== 201 && res.status !== 200) return res;
  careersPromise = null;
  cacheClear(CAREER_CACHE_PREFIX);
  return { ...res, data: { id: res.data.slug, slug: res.data.slug } };
};

H['PATCH /admin/careers/:id'] = async ({ params, body }) => {
  const careerId = await careerSlugToId(params.id);
  if (careerId === null) return liveFail(404, 'Career not found.');
  const res = await beCall('PATCH', `/admin/careers/${careerId}`, { body: await beCareerBody(body) });
  if (res.status !== 200) return res;
  careersPromise = null;
  cacheClear(CAREER_CACHE_PREFIX);
  return { ...res, data: { id: params.id, name: res.data.name } };
};

H['DELETE /admin/careers/:id'] = async ({ params }) => {
  const careerId = await careerSlugToId(params.id);
  if (careerId === null) return liveFail(404, 'Career not found.');
  const res = await beCall('DELETE', `/admin/careers/${careerId}`);
  if (res.status === 200) { careersPromise = null; cacheClear(CAREER_CACHE_PREFIX); }
  return res;
};

H['GET /admin/skills'] = async () => {
  const res = await beCall('GET', '/admin/skills');
  if (res.status !== 200) return res;
  asArray(res.data).forEach(registerSkill);
  syncCatalogToLocalStore();
  return { ...res, data: asArray(res.data).map(s => ({ id: String(s.id), code: s.code, name: s.name, category: s.category })) };
};

H['POST /admin/skills'] = async ({ body }) => {
  // Form FE tidak punya kolom kode, sedangkan BE mewajibkannya → dibuat dari nama.
  const code = (body.code || String(body.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '')) || `skill${Date.now()}`;
  const res = await beCall('POST', '/admin/skills', { body: { code, name: body.name, category: body.category } });
  if (res.status !== 201 && res.status !== 200) return res;
  registerSkill({ id: res.data.id, code: res.data.code, name: res.data.name, category: body.category });
  syncCatalogToLocalStore();
  return { ...res, data: { id: String(res.data.id), code: res.data.code, name: res.data.name, category: body.category } };
};

H['PATCH /admin/skills/:id'] = async ({ params, body }) => {
  await ensureSkillCatalog();
  const skillId = skillCodeToId(params.id);
  if (skillId === null) return liveFail(404, 'Skill not found.');
  const res = await beCall('PATCH', `/admin/skills/${skillId}`, { body });
  if (res.status !== 200) return res;
  cacheClear(CAREER_CACHE_PREFIX);
  await ensureSkillCatalog(true);
  return { ...res, data: { id: params.id, code: params.id, name: res.data.name } };
};

H['DELETE /admin/skills/:id'] = async ({ params }) => {
  await ensureSkillCatalog();
  const skillId = skillCodeToId(params.id);
  if (skillId === null) return liveFail(404, 'Skill not found.');
  const res = await beCall('DELETE', `/admin/skills/${skillId}`);
  if (res.status === 200) {
    cacheClear(CAREER_CACHE_PREFIX);
    skillCatalog.byKey.delete(String(skillId));
  }
  return res;
};

H['GET /admin/industry-insights'] = async () => {
  await ensureSkillCatalog();
  const res = await beCall('GET', '/admin/industry-insights');
  if (res.status !== 200) return res;
  return {
    ...res,
    data: asArray(res.data).map(i => {
      const code = skillIdToCode(i.skill_id);
      return { skill_id: code, skill_name: skillNameOf(code), demand: Number(i.demand), trend: i.trend, job_sample_size: i.job_sample_size, period: translatePeriod(i.period) };
    }),
  };
};

H['POST /admin/industry-insights'] = async ({ body }) => {
  await ensureSkillCatalog();
  const skillId = skillCodeToId(body.skill_id);
  if (skillId === null) return liveFail(422, 'Skill not found.', { errors: { skill_id: ['Skill not found.'] } });
  const res = await beCall('POST', '/admin/industry-insights', { body: { ...body, skill_id: skillId } });
  if (res.status !== 200 && res.status !== 201) return res;
  return { ...res, data: { skill_id: body.skill_id, demand: res.data.demand } };
};

H['DELETE /admin/industry-insights/:skill_id'] = async () =>
  liveFail(501, 'The backend does not support deleting industry data yet.');

H['GET /admin/learning-resources'] = async ({ query }) => {
  await ensureSkillCatalog();
  const res = await beCall('GET', '/admin/learning-resources');
  if (res.status !== 200) return res;
  let list = asArray(res.data).map(r => ({ id: r.id, skill_id: skillIdToCode(r.skill_id), title: r.title, provider: r.provider || 'Unknown', type: r.type || 'course', url: r.url }));
  // BE mengembalikan semua resource; filter per skill dilakukan di sini.
  if (query && query.skill_id) list = list.filter(r => r.skill_id === query.skill_id);
  return { ...res, data: list };
};

H['POST /admin/learning-resources'] = async ({ body }) => {
  await ensureSkillCatalog();
  const skillId = skillCodeToId(body.skill_id);
  if (skillId === null) return liveFail(422, 'Skill not found.', { errors: { skill_id: ['Skill not found.'] } });
  return beCall('POST', '/admin/learning-resources', { body: { ...body, skill_id: skillId } });
};

H['PATCH /admin/learning-resources/:id'] = async () =>
  liveFail(501, 'The backend does not support editing resources yet. Delete it and add it again.');

H['PATCH /admin/settings/industry-insight-mode'] = async ({ body }) => {
  const res = await beCall('PATCH', '/admin/settings/industry-insight-mode', { body });
  if (res.status === 200 && typeof getAdminContent === 'function') {
    // BE belum punya GET untuk mode ini; pilihan terakhir diingat di browser untuk mengisi form.
    const content = getAdminContent();
    content.industryInsightMode = res.data.industry_insight_mode;
    saveAdminContent(content);
  }
  return res;
};

/* ============================================================
   Titik masuk — dipanggil oleh request() di js/api.js
   ============================================================ */

async function liveRoute(method, pathTemplate, params, query, body) {
  const key = `${method} ${pathTemplate}`;
  const handler = H[key];
  if (handler) return handler({ params: params || {}, query: query || {}, body: body || {} });

  // Tidak ada perbedaan bentuk → teruskan apa adanya ke BE.
  let path = pathTemplate;
  Object.entries(params || {}).forEach(([k, v]) => { path = path.replace(`:${k}`, encodeURIComponent(v)); });
  return beCall(method, path, { query, body: body || null });
}

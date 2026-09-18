/**
 * SkillBridge — API CLIENT
 * =========================
 * Satu-satunya file yang dipanggil halaman lain (dashboard.js, skill-gap.js,
 * admin-careers.js, dst) untuk komunikasi data. Nama fungsi & bentuk
 * request/response di sini mengikuti API Contract di dokumen teknis BE.
 *
 * CARA INTEGRASI BERTAHAP (BE rilis endpoint satu-satu, bukan sekaligus):
 * Begitu satu endpoint sudah dikonfirmasi jalan di BE, tinggal tambahkan
 * satu baris ke LIVE_ENDPOINTS di bawah — endpoint itu langsung manggil
 * backend asli, sisanya tetap jalan pakai mock. Tidak perlu nunggu semua
 * endpoint selesai baru mulai integrasi.
 *
 * CARA PINDAH SEPENUHNYA KE BACKEND ASLI (kalau semua endpoint sudah live):
 * 1. Ubah API_MODE di bawah dari 'mock' jadi 'live'.
 * 2. Isi API_BASE_URL sesuai domain backend Laravel-nya.
 * 3. Selesai — TIDAK ADA file lain yang perlu diubah, karena semua
 *    halaman manggil lewat objek `Api` di file ini, bukan langsung ke
 *    localStorage/api-mock.js.
 * (js/api-mock.js boleh dihapus setelah ini, sudah tidak dipakai.)
 */

const API_MODE = 'mock'; // 'mock' | 'live' — mode default untuk endpoint yang TIDAK ada di LIVE_ENDPOINTS
const API_BASE_URL = '/api/v1';
const AUTH_TOKEN_KEY = 'skillbridge_auth_token_v1';

/**
 * Endpoint yang SUDAH dikonfirmasi jalan di backend Laravel asli.
 * Format: 'METHOD /path/template' (persis seperti dipakai di mockRoute).
 * Endpoint yang belum ditambahkan ke sini otomatis tetap pakai mock,
 * walau API_MODE masih 'mock' — jadi aman diisi satu-satu sambil BE
 * merilis endpoint secara bertahap.
 *
 * Contoh begitu tim BE konfirmasi POST /auth/login sudah jalan:
 *   'POST /auth/login',
 */
const LIVE_ENDPOINTS = new Set([
  // 'POST /auth/login',
]);

function getAuthToken() { return localStorage.getItem(AUTH_TOKEN_KEY); }
function setAuthToken(token) { if (token) localStorage.setItem(AUTH_TOKEN_KEY, token); }
function clearAuthToken() { localStorage.removeItem(AUTH_TOKEN_KEY); }

/**
 * Titik pusat semua request. `pathTemplate` pakai placeholder `:nama`
 * (mis. '/careers/:slug'), diisi lewat `params` — supaya mode mock
 * tidak perlu parsing string URL, dan mode live tinggal substitusi.
 */
async function request(method, pathTemplate, { params = {}, query = {}, body = null } = {}) {
  const key = `${method} ${pathTemplate}`;
  const useLive = API_MODE === 'live' || LIVE_ENDPOINTS.has(key);

  const response = useLive
    ? await liveRequest(method, pathTemplate, params, query, body)
    : await mockRoute(method, pathTemplate, params, query, body);

  // Simpan/hapus token otomatis kalau responsnya bawa token (login/register).
  if (response?.data?.token) setAuthToken(response.data.token);
  return response;
}

async function liveRequest(method, pathTemplate, params, query, body) {
  let path = pathTemplate;
  Object.entries(params).forEach(([key, value]) => { path = path.replace(`:${key}`, encodeURIComponent(value)); });

  const qs = new URLSearchParams(
    Object.entries(query).filter(([, v]) => v !== undefined && v !== null && v !== '')
  ).toString();
  const url = `${API_BASE_URL}${path}${qs ? `?${qs}` : ''}`;

  const headers = { 'Content-Type': 'application/json', Accept: 'application/json' };
  const token = getAuthToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const res = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined });
    return await res.json(); // backend Laravel sudah balas {status, message, data}
  } catch (err) {
    return { status: 0, message: 'Tidak bisa menghubungi server. Cek koneksi internet kamu.', data: null };
  }
}

/** Router mock — memetakan "METHOD /path/template" ke handler di api-mock.js. */
async function mockRoute(method, pathTemplate, params, query, body) {
  const key = `${method} ${pathTemplate}`;
  switch (key) {
    case 'POST /auth/register': return mockRegister(body);
    case 'POST /auth/login': return mockLogin(body);
    case 'POST /auth/logout': return mockLogout();
    case 'GET /me': return mockGetMe();
    case 'PATCH /me': return mockUpdateMe(body);
    case 'GET /me/skills': return mockMySkills();

    case 'GET /careers': return mockListCareers(query);
    case 'GET /careers/:slug': return mockGetCareerBySlug(params);

    case 'POST /onboarding': return mockSubmitOnboarding(body);

    case 'GET /assessment/questions': return mockAssessmentQuestions();
    case 'POST /assessment/submit': return mockSubmitAssessment(body);
    case 'GET /assessment/history': return mockAssessmentHistory();

    case 'GET /skill-gap': return mockSkillGap();
    case 'GET /readiness-score': return mockReadinessScore();

    case 'POST /roadmap/generate': return mockGenerateRoadmap();
    case 'GET /roadmap': return mockGetRoadmap();
    case 'PATCH /roadmap/phases/:id': return mockUpdateRoadmapPhase(params, body);

    case 'GET /portfolio': return mockGetPortfolio();
    case 'PATCH /portfolio/checklist/:item_code': return mockToggleChecklist(params, body);
    case 'GET /certificates': return mockListCertificates();
    case 'POST /certificates': return mockAddCertificate(body);
    case 'DELETE /certificates/:id': return mockDeleteCertificate(params);
    case 'POST /portfolio/github-analyze': return mockAnalyzeGithub(body);

    case 'GET /industry-insights': return mockIndustryInsights(query);
    case 'GET /industry-insights/:skill_id/trend': return mockIndustryTrend(params);

    case 'GET /progress-history': return mockProgressHistory();
    case 'GET /achievements': return mockAchievements();

    case 'GET /admin/dashboard': return mockAdminDashboard();
    case 'GET /admin/careers': return mockAdminListCareers();
    case 'POST /admin/careers': return mockAdminCreateCareer(body);
    case 'PATCH /admin/careers/:id': return mockAdminUpdateCareer(params, body);
    case 'DELETE /admin/careers/:id': return mockAdminDeleteCareer(params);

    case 'GET /admin/skills': return mockAdminListSkills();
    case 'POST /admin/skills': return mockAdminCreateSkill(body);
    case 'PATCH /admin/skills/:id': return mockAdminUpdateSkill(params, body);
    case 'DELETE /admin/skills/:id': return mockAdminDeleteSkill(params);

    case 'GET /admin/industry-insights': return mockAdminListIndustryInsights();
    case 'POST /admin/industry-insights': return mockAdminSaveIndustryInsight(body);
    case 'DELETE /admin/industry-insights/:skill_id': return mockAdminDeleteIndustryInsight(params);

    case 'GET /admin/learning-resources': return mockAdminListLearningResources(query);
    case 'POST /admin/learning-resources': return mockAdminCreateLearningResource(body);
    case 'PATCH /admin/learning-resources/:id': return mockAdminUpdateLearningResource(params, body);
    case 'DELETE /admin/learning-resources/:id': return mockAdminDeleteLearningResource(params);

    case 'GET /admin/users': return mockAdminListUsers();
    case 'GET /admin/analytics': return mockAdminAnalytics();
    case 'GET /admin/scoring-settings': return mockAdminGetScoringSettings();
    case 'PUT /admin/scoring-settings': return mockAdminUpdateScoringSettings(body);
    case 'PATCH /admin/settings/industry-insight-mode': return mockAdminSetIndustryInsightMode(body);
    case 'GET /admin/scrape-runs': return mockAdminListScrapeRuns();
    case 'POST /admin/scrape-runs/trigger': return mockAdminTriggerScrapeRun();

    default:
      console.error(`Api mock: tidak ada handler untuk ${key}`);
      return { status: 501, message: `Belum ada mock handler untuk ${key}`, data: null };
  }
}

/* ============================================================
   PERMUKAAN PUBLIK — inilah yang dipanggil halaman lain
   ============================================================ */

const Api = {
  auth: {
    register: (body) => request('POST', '/auth/register', { body }),
    login: (email, password) => request('POST', '/auth/login', { body: { email, password } }),
    logout: () => request('POST', '/auth/logout'),
    me: () => request('GET', '/me'),
    updateMe: (body) => request('PATCH', '/me', { body }),
  },
  // Endpoint usulan (belum ada di dokumen kontrak) — lihat catatan di api-mock.js.
  me: {
    skills: () => request('GET', '/me/skills'),
  },
  career: {
    list: (query = {}) => request('GET', '/careers', { query }),
    get: (slug) => request('GET', '/careers/:slug', { params: { slug } }),
  },
  onboarding: {
    submit: (body) => request('POST', '/onboarding', { body }),
  },
  assessment: {
    questions: () => request('GET', '/assessment/questions'),
    submit: (answers) => request('POST', '/assessment/submit', { body: { answers } }),
    history: () => request('GET', '/assessment/history'), // usulan, belum di dokumen kontrak
  },
  skillGap: {
    get: () => request('GET', '/skill-gap'),
  },
  readiness: {
    get: () => request('GET', '/readiness-score'),
  },
  roadmap: {
    generate: () => request('POST', '/roadmap/generate'),
    get: () => request('GET', '/roadmap'),
    updatePhase: (id, status) => request('PATCH', '/roadmap/phases/:id', { params: { id }, body: { status } }),
  },
  portfolio: {
    get: () => request('GET', '/portfolio'),
    toggleChecklist: (itemCode, done) => request('PATCH', '/portfolio/checklist/:item_code', { params: { item_code: itemCode }, body: { done } }),
    analyzeGithub: (username) => request('POST', '/portfolio/github-analyze', { body: { github_username: username } }),
    certificates: {
      list: () => request('GET', '/certificates'),
      add: (title, issuer, year) => request('POST', '/certificates', { body: { title, issuer, year } }),
      remove: (id) => request('DELETE', '/certificates/:id', { params: { id } }),
    },
  },
  industry: {
    list: (region) => request('GET', '/industry-insights', { query: { region } }),
    trend: (skillId) => request('GET', '/industry-insights/:skill_id/trend', { params: { skill_id: skillId } }),
  },
  progress: {
    history: () => request('GET', '/progress-history'),
  },
  achievements: {
    list: () => request('GET', '/achievements'),
  },
  admin: {
    dashboard: () => request('GET', '/admin/dashboard'),
    careers: {
      list: () => request('GET', '/admin/careers'),
      create: (body) => request('POST', '/admin/careers', { body }),
      update: (id, body) => request('PATCH', '/admin/careers/:id', { params: { id }, body }),
      remove: (id) => request('DELETE', '/admin/careers/:id', { params: { id } }),
    },
    skills: {
      list: () => request('GET', '/admin/skills'),
      create: (body) => request('POST', '/admin/skills', { body }),
      update: (id, body) => request('PATCH', '/admin/skills/:id', { params: { id }, body }),
      remove: (id) => request('DELETE', '/admin/skills/:id', { params: { id } }),
    },
    industryInsights: {
      list: () => request('GET', '/admin/industry-insights'),
      save: (body) => request('POST', '/admin/industry-insights', { body }),
      remove: (skillId) => request('DELETE', '/admin/industry-insights/:skill_id', { params: { skill_id: skillId } }),
    },
    learningResources: {
      list: (skillId) => request('GET', '/admin/learning-resources', { query: { skill_id: skillId } }),
      create: (body) => request('POST', '/admin/learning-resources', { body }),
      update: (id, body) => request('PATCH', '/admin/learning-resources/:id', { params: { id }, body }),
      remove: (id) => request('DELETE', '/admin/learning-resources/:id', { params: { id } }),
    },
    users: {
      list: () => request('GET', '/admin/users'),
    },
    analytics: () => request('GET', '/admin/analytics'),
    scoringSettings: {
      get: () => request('GET', '/admin/scoring-settings'),
      update: (body) => request('PUT', '/admin/scoring-settings', { body }),
    },
    settings: {
      setIndustryInsightMode: (mode) => request('PATCH', '/admin/settings/industry-insight-mode', { body: { mode } }),
    },
    scrapeRuns: {
      list: () => request('GET', '/admin/scrape-runs'),
      trigger: () => request('POST', '/admin/scrape-runs/trigger'),
    },
  },
};

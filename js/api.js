/**
 * SkillBridge — API CLIENT
 * =========================
 * Satu-satunya file yang dipanggil halaman lain (dashboard.js, skill-gap.js,
 * admin-careers.js, dst) untuk komunikasi data. Nama fungsi & bentuk
 * request/response di sini mengikuti API Contract di dokumen teknis BE.
 *
 * MODE
 * ----
 * API_MODE = 'live'  → semua request ke backend Laravel (lihat js/api-live.js,
 *                      yang menerjemahkan respons BE ke bentuk yang dipakai FE).
 * API_MODE = 'mock'  → data palsu di localStorage (js/api-mock.js), tanpa backend.
 *                      Berguna untuk demo offline / development FE saja.
 *
 * Kalau tetap ingin campuran (sebagian endpoint mock, sebagian live), pakai
 * API_MODE = 'mock' lalu daftarkan endpoint yang sudah live di LIVE_ENDPOINTS.
 * Catatan: data mock dan data BE adalah dua "dunia" berbeda (akun, token,
 * progres), jadi campuran hanya cocok untuk endpoint yang berdiri sendiri.
 *
 * ALAMAT BACKEND
 * --------------
 * API_BASE_URL harus lengkap: diawali https:// (atau http://) DAN diakhiri /api/v1.
 * Saat ini menunjuk ke backend di Railway. Untuk backend di komputer sendiri
 * (`php artisan serve`), pakai 'http://localhost:8000/api/v1'.
 * Backend mengizinkan semua origin (config/cors.php), jadi FE boleh di host/port mana pun.
 */

const API_MODE = 'live'; // 'live' | 'mock'
const API_BASE_URL = 'https://skillbridge-production-f8ed.up.railway.app/api/v1';
const AUTH_TOKEN_KEY = 'skillbridge_auth_token_v1';

/**
 * Hanya dipakai kalau API_MODE = 'mock': endpoint yang dipaksa memanggil
 * backend asli. Format: 'METHOD /path/template', mis. 'POST /auth/login'.
 */
const LIVE_ENDPOINTS = new Set([
  // 'POST /auth/login',
]);

function isLiveMode() { return API_MODE === 'live'; }

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

  showLoader();
  let response;
  try {
    response = useLive
      ? await liveRoute(method, pathTemplate, params, query, body)
      : await mockRoute(method, pathTemplate, params, query, body);
  } finally {
    hideLoader();
  }

  // Simpan token otomatis kalau responsnya bawa token (login/register).
  if (response?.data?.token) setAuthToken(response.data.token);
  notifyRequestProblem(response);
  return response;
}

/* ============================================================
   Indikator loading & pesan error yang ramah
   ============================================================
   - Bar tipis di atas layar muncul kalau request berjalan lebih dari 0,25 detik.
   - Toast muncul kalau server tidak terjangkau (status 0), kena rate limit (429),
     atau error server (5xx). Error biasa (401/404/422) tetap ditangani halaman masing-masing.
   - Error JavaScript yang tak tertangani (mis. halaman gagal dirender) juga
     diberi pesan umum supaya pengguna tidak melihat halaman kosong tanpa penjelasan. */

let pendingRequests = 0;
let loaderTimer = null;
let toastTimer = null;

function showLoader() {
  pendingRequests += 1;
  if (pendingRequests !== 1 || typeof document === 'undefined') return;
  loaderTimer = setTimeout(() => {
    if (!document.body) return;
    let bar = document.getElementById('sb-loader');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'sb-loader';
      bar.className = 'api-loader';
      bar.setAttribute('role', 'progressbar');
      bar.setAttribute('aria-label', 'Loading');
      document.body.appendChild(bar);
    }
    bar.classList.add('is-active');
  }, 250);
}

function hideLoader() {
  pendingRequests = Math.max(0, pendingRequests - 1);
  if (pendingRequests > 0 || typeof document === 'undefined') return;
  clearTimeout(loaderTimer);
  const bar = document.getElementById('sb-loader');
  if (bar) bar.classList.remove('is-active');
}

function showToast(message, { retry = false, onlyIfIdle = false } = {}) {
  if (typeof document === 'undefined' || !document.body) return;
  let toast = document.getElementById('sb-toast');
  // Pesan umum tidak boleh menimpa pesan yang lebih spesifik yang sedang tampil.
  if (onlyIfIdle && toast && toast.classList.contains('is-visible')) return;
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'sb-toast';
    toast.className = 'sb-toast';
    toast.setAttribute('role', 'alert');
    document.body.appendChild(toast);
  }
  toast.innerHTML = '';
  const text = document.createElement('span');
  text.textContent = message;
  toast.appendChild(text);
  if (retry) {
    const reload = document.createElement('button');
    reload.type = 'button';
    reload.textContent = 'Reload';
    reload.addEventListener('click', () => window.location.reload());
    toast.appendChild(reload);
  }
  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'sb-toast-close';
  close.setAttribute('aria-label', 'Dismiss');
  close.textContent = '×';
  close.addEventListener('click', () => toast.classList.remove('is-visible'));
  toast.appendChild(close);

  toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 9000);
}

function notifyRequestProblem(response) {
  if (!response) return;
  if (response.status === 0) {
    showToast("We can't reach the server right now. Check your connection and try again.", { retry: true });
  } else if (response.status === 429) {
    showToast('Too many requests. Please wait a moment and try again.', { retry: true });
  } else if (response.status >= 500) {
    showToast('The server ran into a problem. Please try again in a moment.', { retry: true });
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', () => {
    showToast('Something went wrong while loading this page. Please reload and try again.', { retry: true, onlyIfIdle: true });
  });
  window.addEventListener('error', (event) => {
    if (event && event.message) showToast('Something went wrong while loading this page. Please reload and try again.', { retry: true, onlyIfIdle: true });
  });
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
    case 'GET /skills': return { status: 200, message: 'OK', data: getAllSkills().map(skillToDTO) };

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
      console.error(`Api mock: no handler for ${key}`);
      return { status: 501, message: `No mock handler for ${key}`, data: null };
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
  // Daftar semua skill untuk onboarding (usulan — BE belum punya GET /skills;
  // di mode live dipenuhi dari katalog skill di js/api-live.js).
  skills: {
    list: (careerSlug) => request('GET', '/skills', { query: { career: careerSlug } }),
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

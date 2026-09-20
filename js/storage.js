/**
 * SkillBridge — storage helper
 *
 * Prototype ini belum punya backend, jadi seluruh state user disimpan di
 * localStorage browser. Semua fungsi baca/tulis state ada di sini supaya
 * halaman lain tidak perlu tahu detail penyimpanannya.
 */

const STORAGE_KEY = 'skillbridge_state_v1';

function defaultState() {
  return {
    auth: { isLoggedIn: false },
    onboardingComplete: false,
    profile: {
      fullName: '',
      email: '',
      university: '',
      major: '',
      semester: '',
      graduationYear: '',
      targetCareerId: null,
      targetTimelineMonths: null,
    },
    userSkills: {},          // { skillId: { level: 0-100, confidence: 1-5, source: 'self'|'github' } }
    assessment: { lastScore: 0, history: [] },
    roadmap: null,           // { targetCareerId, generatedAt, phases: [...] }
    portfolio: {},           // { itemId: true|false }
    certificates: [],        // [{ id, title, issuer, year }]
    githubUsername: null,
    progressHistory: [],     // [{ date, readinessScore, skillSnapshot }]
    achievements: [],        // [{ code, earnedAt }]
  };
}

function getState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    // Migrasi ringan untuk akun yang dibuat sebelum field ini ada.
    if (!parsed.certificates) parsed.certificates = [];
    if (parsed.githubUsername === undefined) parsed.githubUsername = null;
    return parsed;
  } catch (err) {
    console.warn('SkillBridge: state was corrupted and has been reset.', err);
    return null;
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function logout() {
  localStorage.removeItem(STORAGE_KEY);
  window.location.href = 'index.html';
}

/** Data akun contoh, dipakai tombol "Coba tanpa daftar" di halaman login. */
function seedDemoState() {
  const state = defaultState();
  state.auth.isLoggedIn = true;
  state.onboardingComplete = true;
  state.profile = {
    fullName: 'Alex Pratama',
    email: 'alex.pratama@example.com',
    university: 'Sample University',
    major: 'Computer Science',
    semester: '6',
    graduationYear: '2027',
    targetCareerId: 'data-engineer',
    targetTimelineMonths: 12,
  };
  state.userSkills = {
    python: { level: 80, confidence: 4 },
    sql: { level: 90, confidence: 5 },
    cloud: { level: 40, confidence: 2 },
    docker: { level: 35, confidence: 2 },
    datapipeline: { level: 50, confidence: 3 },
    statistics: { level: 60, confidence: 3 },
    communication: { level: 65, confidence: 3 },
  };
  state.assessment = {
    lastScore: 68,
    history: [{ date: daysAgoIso(20), score: 55 }, { date: daysAgoIso(2), score: 68 }],
  };
  state.portfolio = {
    project_basic: true,
    project_realworld: false,
    github_docs: false,
    internship: true,
    open_source: false,
    cv: true,
    portfolio_site: false,
  };
  state.certificates = [
    { id: 'cert-1', title: 'SQL for Data Analysis', issuer: 'Coursera', year: '2025' },
  ];
  state.githubUsername = null;
  state.progressHistory = [
    { date: daysAgoIso(45), readinessScore: 48, skillSnapshot: { python: 55, sql: 70, cloud: 20, docker: 15, datapipeline: 25 } },
    { date: daysAgoIso(20), readinessScore: 61, skillSnapshot: { python: 70, sql: 85, cloud: 30, docker: 25, datapipeline: 40 } },
    { date: daysAgoIso(2), readinessScore: 72, skillSnapshot: { python: 80, sql: 90, cloud: 40, docker: 35, datapipeline: 50 } },
  ];
  state.achievements = [{ code: 'first_assessment', earnedAt: daysAgoIso(20) }];
  saveState(state);
  return state;
}

function daysAgoIso(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function todayLabel() {
  return new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

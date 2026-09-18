/**
 * SkillBridge — admin content store & shared data accessors.
 *
 * File ini dimuat di SEMUA halaman (student maupun admin). Isinya dua hal:
 *
 * 1. Penyimpanan konten yang bisa dikelola admin (careers, skills,
 *    industry insights, learning resources, daftar user) — disimpan di
 *    localStorage terpisah dari data akun student (skillbridge_state_v1).
 * 2. Fungsi accessor bersama (getCareerBySlug, skillName, dst) yang
 *    dipakai seluruh halaman student — supaya begitu admin
 *    menambah/mengedit career atau skill, perubahannya langsung
 *    terlihat di seluruh aplikasi tanpa perlu ubah halaman lain.
 */

const ADMIN_CONTENT_KEY = 'skillbridge_admin_content_v1';
const ADMIN_SESSION_KEY = 'skillbridge_admin_session_v1';

const ADMIN_ACCOUNT = {
  email: 'admin@skillbridge.id',
  password: 'admin123',
  fullName: 'Admin SkillBridge',
};

/* ---------------- Admin session (terpisah dari sesi student) ---------------- */

function isAdminLoggedIn() {
  return localStorage.getItem(ADMIN_SESSION_KEY) === 'true';
}
function loginAsAdmin() {
  localStorage.setItem(ADMIN_SESSION_KEY, 'true');
}
function logoutAdmin() {
  localStorage.removeItem(ADMIN_SESSION_KEY);
  window.location.href = 'index.html';
}

/* ---------------- Konten yang dikelola admin ---------------- */

function seedLearningResources() {
  const list = [];
  let counter = 1;
  Object.keys(SKILL_CONTENT).forEach(skillId => {
    (SKILL_CONTENT[skillId].resources || []).forEach(r => {
      list.push({ id: `res-${counter++}`, skillId, title: r.title, provider: r.provider, type: r.type });
    });
  });
  return list;
}

function seedDummyUsers() {
  return [
    { id: 'u1', fullName: 'Naila Ramadhani', university: 'Universitas Airlangga', major: 'Sistem Informasi', targetCareerId: 'data-analyst' },
    { id: 'u2', fullName: 'Fajar Ardiansyah', university: 'Institut Teknologi Bandung', major: 'Teknik Informatika', targetCareerId: 'software-engineer' },
    { id: 'u3', fullName: 'Dinda Puspitasari', university: 'Universitas Gadjah Mada', major: 'Manajemen', targetCareerId: 'product-manager' },
    { id: 'u4', fullName: 'Bima Setiawan', university: 'Universitas Brawijaya', major: 'Teknik Informatika', targetCareerId: 'cloud-engineer' },
    { id: 'u5', fullName: 'Clara Wijaya', university: 'Universitas Indonesia', major: 'Desain Komunikasi Visual', targetCareerId: 'uiux-designer' },
    { id: 'u6', fullName: 'Rizky Maulana', university: 'Universitas Diponegoro', major: 'Teknik Informatika', targetCareerId: 'cybersecurity-analyst' },
  ];
}

function defaultAdminContent() {
  return {
    careers: JSON.parse(JSON.stringify(CAREERS)),
    skills: JSON.parse(JSON.stringify(SKILLS)),
    industryInsights: JSON.parse(JSON.stringify(INDUSTRY_INSIGHTS)),
    learningResources: seedLearningResources(),
    users: seedDummyUsers(),
    scoringWeights: { technical: 0.4, soft: 0.15, portfolio: 0.2, experience: 0.15, assessment: 0.1 },
    industryInsightMode: 'manual', // 'auto' | 'manual' — lihat app_settings di dokumen BE
    scrapeRuns: [
      { id: 1, startedAt: daysAgoIsoLocal(9), finishedAt: daysAgoIsoLocal(9), status: 'success', jobsFound: 182, jobsProcessed: 182, errorMessage: null },
      { id: 2, startedAt: daysAgoIsoLocal(2), finishedAt: daysAgoIsoLocal(2), status: 'partial', jobsFound: 140, jobsProcessed: 96, errorMessage: 'ML service timeout pada sebagian batch.' },
    ],
  };
}

function daysAgoIsoLocal(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function getAdminContent() {
  const raw = localStorage.getItem(ADMIN_CONTENT_KEY);
  if (!raw) {
    const fresh = defaultAdminContent();
    localStorage.setItem(ADMIN_CONTENT_KEY, JSON.stringify(fresh));
    return fresh;
  }
  try {
    const parsed = JSON.parse(raw);
    // Migrasi ringan untuk konten lama yang dibuat sebelum field ini ada.
    if (!parsed.scoringWeights) parsed.scoringWeights = defaultAdminContent().scoringWeights;
    if (!parsed.industryInsightMode) parsed.industryInsightMode = 'manual';
    if (!parsed.scrapeRuns) parsed.scrapeRuns = defaultAdminContent().scrapeRuns;
    return parsed;
  } catch (err) {
    console.warn('SkillBridge: admin content korup, direset.', err);
    const fresh = defaultAdminContent();
    localStorage.setItem(ADMIN_CONTENT_KEY, JSON.stringify(fresh));
    return fresh;
  }
}

function saveAdminContent(content) {
  localStorage.setItem(ADMIN_CONTENT_KEY, JSON.stringify(content));
}

function getScoringWeights() {
  return getAdminContent().scoringWeights;
}

function resetAdminContent() {
  const fresh = defaultAdminContent();
  saveAdminContent(fresh);
  return fresh;
}

/** Gabungan daftar user dummy (untuk demo admin) + akun student asli di browser ini, kalau ada. */
function getAllUsersForAdmin() {
  const content = getAdminContent();
  const users = content.users.map(u => ({ ...u, isLive: false }));
  const studentState = getState();
  if (studentState && studentState.profile.email) {
    users.push({
      id: 'live-student',
      fullName: studentState.profile.fullName,
      university: studentState.profile.university,
      major: studentState.profile.major,
      targetCareerId: studentState.profile.targetCareerId,
      readiness: studentState.profile.targetCareerId ? computeReadinessScore(studentState).overall : null,
      isLive: true,
    });
  }
  return users;
}

/* ---------------- Accessor bersama (dipakai halaman student & admin) ---------------- */

function getAllCareers() {
  return getAdminContent().careers;
}

function getCareerBySlug(slug) {
  return getAllCareers().find(c => c.slug === slug) || null;
}

function getAllSkills() {
  return getAdminContent().skills;
}

function skillName(id) {
  const s = getAllSkills().find(sk => sk.id === id);
  return s ? s.name : id;
}

function getSkillCategory(id) {
  const s = getAllSkills().find(sk => sk.id === id);
  return s ? s.category : 'technical';
}

function getIndustryInsights() {
  return getAdminContent().industryInsights;
}

function getLearningResourcesFor(skillId) {
  return getAdminContent().learningResources.filter(r => r.skillId === skillId);
}

/* ---------------- Trend & region (untuk Industry Insights) ---------------- */

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) % 100000;
  return hash;
}

function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/**
 * Menghasilkan histori demand 6 bulan terakhir untuk satu skill.
 * Deterministik (seed dari nama skill) supaya angkanya konsisten
 * setiap kali dibuka, dan titik terakhir selalu sama dengan demand
 * saat ini. Ini bukan data historis riil — dipakai untuk menyimulasikan
 * grafik trend di prototype.
 */
function getSkillTrendHistory(skillId) {
  const insight = getIndustryInsights().find(i => i.skillId === skillId);
  if (!insight) return [];
  const months = ['Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep'];
  const seed = hashString(skillId);
  const slopePerStep = insight.trend === 'up' ? 3 : insight.trend === 'down' ? -2.5 : 0;

  const points = months.map((month, i) => {
    const stepsFromEnd = months.length - 1 - i;
    const noise = (seededRandom(seed + i) - 0.5) * 4;
    const value = Math.max(5, Math.min(98, Math.round(insight.demand - slopePerStep * stepsFromEnd + noise)));
    return { month, value };
  });
  points[points.length - 1].value = insight.demand;
  return points;
}

/** Demand yang disesuaikan multiplier region — simulasi variasi regional dari angka nasional. */
function getRegionalDemand(demand, region) {
  const multiplier = REGION_MULTIPLIER[region] ?? 1;
  return Math.min(99, Math.max(1, Math.round(demand * multiplier)));
}

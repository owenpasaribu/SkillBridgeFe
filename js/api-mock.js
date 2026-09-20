/**
 * SkillBridge — API MOCK (backend palsu)
 * =======================================
 * File ini mensimulasikan Laravel Backend di dokumentasi teknis, memakai
 * localStorage sebagai "database"-nya. Bentuk request & response di sini
 * SENGAJA dibuat identik dengan API Contract (snake_case, amplop
 * {status,message,data}, dst) supaya saat backend Laravel-nya jalan,
 * yang perlu diganti CUMA fungsi request() di js/api.js — tidak ada
 * satupun halaman (dashboard.js, skill-gap.js, dst) yang perlu diubah,
 * karena mereka semua manggil lewat js/api.js, bukan file ini langsung.
 *
 * Struktur tiap handler mengikuti urutan section di dokumen PDF:
 * Auth → Career → Onboarding → Assessment → Skill Gap & Readiness →
 * Roadmap → Portfolio → Industry Insights → Progress & Achievements →
 * Admin.
 */

/* ============================================================
   Helper amplop response & auth
   ============================================================ */

function ok(data, message = 'OK', status = 200) {
  return { status, message, data };
}
function fail(status, message, data = null) {
  return { status, message, data };
}
function unauthenticated() {
  return fail(401, 'Unauthenticated. Please sign in again.');
}
function notFound(message = 'Data not found') {
  return fail(404, message, null);
}

/** Mengambil state student aktif, atau null kalau belum login — dipakai semua endpoint token student. */
function currentStudent() {
  const state = getState();
  if (!state || !state.auth.isLoggedIn) return null;
  return state;
}

/* ============================================================
   Transform: internal object (camelCase) -> DTO kontrak (snake_case)
   ============================================================ */

function careerToDTO(c, includeSkills) {
  const dto = {
    id: c.id,
    slug: c.slug,
    name: c.name,
    category: c.category,
    difficulty: c.difficulty,
    industry_demand: c.industryDemand,
    job_sample_size: c.jobSampleSize,
    remote_friendly: !!c.remoteFriendly,
    short_description: c.shortDescription,
    description: c.description,
    responsibilities: c.responsibilities,
    tools: c.tools,
  };
  if (includeSkills) {
    dto.required_skills = c.requiredSkills.map(r => ({
      skill_id: r.skillId,
      skill_name: skillName(r.skillId),
      required_level: r.level,
      importance: r.importance,
    }));
  }
  return dto;
}

function skillToDTO(s) {
  return { id: s.id, code: s.id, name: s.name, category: s.category };
}

function gapToDTO(g) {
  return {
    skill_id: g.skillId,
    skill_name: g.skillName,
    user_level: g.userLevel,
    required_level: g.requiredLevel,
    demand: g.demand,
    gap_value: g.gapValue,
    category: g.category,
    priority: g.priority,
  };
}

function readinessToDTO(r) {
  return {
    overall: r.overall,
    technical: r.technical,
    soft: r.soft,
    portfolio: r.portfolio,
    experience: r.experience,
    assessment: r.assessment,
    status: r.status.label, // FE menerima label string, kelas badge dihitung di FE
  };
}

function roadmapPhaseToDTO(p) {
  return {
    id: p.id,
    skill_id: p.skillId === '__portfolio__' ? null : p.skillId,
    title: p.title,
    priority: p.priority,
    status: p.status,
    learning_objective: p.learningObjective,
    why: p.why,
    after_text: p.after,
    resources: p.resources,
    tasks: p.tasks,
    mini_project: p.miniProject,
    duration_days: p.durationDays,
  };
}

function roadmapToDTO(r) {
  return { id: r.id, target_career_id: r.targetCareerId, generated_at: r.generatedAt, phases: r.phases.map(roadmapPhaseToDTO) };
}

function certToDTO(c) {
  return { id: c.id, title: c.title, issuer: c.issuer, year: c.year };
}

function industryToDTO(i) {
  return { skill_id: i.skillId, skill_name: skillName(i.skillId), demand: i.demand, trend: i.trend, job_sample_size: i.jobSampleSize, period: i.period };
}

function userToDTO(profile) {
  return {
    full_name: profile.fullName,
    email: profile.email,
    university: profile.university,
    major: profile.major,
    semester: profile.semester,
    graduation_year: profile.graduationYear,
    target_career_id: profile.targetCareerId,
    target_timeline_months: profile.targetTimelineMonths,
    github_username: profile.githubUsername,
    role: 'student',
  };
}

/* ============================================================
   AUTH
   ============================================================ */

function mockRegister(body) {
  const state = defaultState();
  state.auth.isLoggedIn = true;
  state.profile.fullName = body.full_name || '';
  state.profile.email = body.email || '';
  state.profile.university = body.university || '';
  state.profile.major = body.major || '';
  state.profile.semester = body.semester || '';
  state.profile.graduationYear = body.graduation_year || '';
  saveState(state);
  const token = `mock-token-${Date.now()}`;
  return ok(
    { user: { id: 1, full_name: state.profile.fullName, email: state.profile.email, role: 'student' }, token },
    'Registration successful', 201
  );
}

function mockLogin(body) {
  const email = (body.email || '').toLowerCase();

  // Satu endpoint untuk dua role — deteksi dari email, sama seperti desain FE saat ini.
  if (email === ADMIN_ACCOUNT.email.toLowerCase()) {
    if (body.password !== ADMIN_ACCOUNT.password) return fail(401, 'Incorrect email or password.');
    loginAsAdmin();
    return ok({ user: { id: 0, full_name: ADMIN_ACCOUNT.fullName, role: 'admin' }, token: `mock-admin-token-${Date.now()}` }, 'Login successful');
  }

  const existing = getState();
  if (!existing || !existing.profile.email) return fail(401, 'Incorrect email or password.');
  if (existing.profile.email.toLowerCase() !== email) return fail(401, 'Incorrect email or password.');

  existing.auth.isLoggedIn = true;
  saveState(existing);
  return ok({ user: { id: 1, full_name: existing.profile.fullName, role: 'student', onboarding_complete: existing.onboardingComplete }, token: `mock-token-${Date.now()}` }, 'Login successful');
}

function mockLogout() {
  if (isAdminLoggedIn()) { logoutAdmin(); return ok(null, 'Logout successful'); }
  const state = getState();
  if (state) { state.auth.isLoggedIn = false; saveState(state); }
  return ok(null, 'Logout successful');
}

function mockGetMe() {
  const state = currentStudent();
  if (!state) return unauthenticated();
  return ok({ id: 1, ...userToDTO(state.profile), onboarding_complete: state.onboardingComplete });
}

function mockUpdateMe(body) {
  const state = currentStudent();
  if (!state) return unauthenticated();
  const fieldMap = {
    full_name: 'fullName', university: 'university', major: 'major', semester: 'semester',
    graduation_year: 'graduationYear', github_username: 'githubUsername',
    target_career_id: 'targetCareerId', target_timeline_months: 'targetTimelineMonths',
  };
  Object.entries(body).forEach(([key, value]) => {
    if (fieldMap[key]) state.profile[fieldMap[key]] = value;
  });
  saveState(state);
  return ok({ id: 1, ...userToDTO(state.profile) }, 'Profile updated');
}

/* ============================================================
   CAREER (public)
   ============================================================ */

function mockListCareers(query) {
  let list = getAllCareers();
  if (query.category) list = list.filter(c => c.category === query.category);
  if (query.difficulty) list = list.filter(c => c.difficulty === query.difficulty);
  if (query.remote_friendly !== undefined) {
    const wantRemote = query.remote_friendly === true || query.remote_friendly === 'true';
    list = list.filter(c => !!c.remoteFriendly === wantRemote);
  }
  return ok(list.map(c => careerToDTO(c, false)));
}

function mockGetCareerBySlug(params) {
  const career = getCareerBySlug(params.slug);
  if (!career) return notFound('Career not found');
  return ok(careerToDTO(career, true));
}

/* ============================================================
   ONBOARDING
   ============================================================ */

function mockSubmitOnboarding(body) {
  const state = currentStudent();
  if (!state) return unauthenticated();

  state.profile.targetCareerId = body.target_career_id;
  state.profile.targetTimelineMonths = body.target_timeline_months;
  (body.skills || []).forEach(s => {
    state.userSkills[s.skill_id] = { level: s.level, confidence: 3, source: 'self' };
  });
  state.onboardingComplete = true;
  state.roadmap = generateRoadmap(state);
  recordProgressSnapshot(state);
  saveState(state);

  return ok({ target_career_id: state.profile.targetCareerId, roadmap_id: state.roadmap.id }, 'Onboarding complete');
}

/* ============================================================
   SKILL ASSESSMENT
   ============================================================ */

function mockAssessmentQuestions() {
  const state = currentStudent();
  if (!state) return unauthenticated();
  const career = getCareerBySlug(state.profile.targetCareerId);
  const skillIds = career ? career.requiredSkills.map(r => r.skillId) : getAllSkills().map(s => s.id);

  const data = skillIds.map(skillId => ({
    skill_id: skillId,
    skill_name: skillName(skillId),
    options: SCENARIO_OPTIONS.map(o => ({ label: o.label, value: o.value })),
  }));
  return ok(data);
}

function mockSubmitAssessment(body) {
  const state = currentStudent();
  if (!state) return unauthenticated();

  const scores = [];
  (body.answers || []).forEach(a => {
    const previous = state.userSkills[a.skill_id];
    const newLevel = previous ? Math.round(previous.level * 0.3 + a.scenario_score * 0.7) : a.scenario_score;
    state.userSkills[a.skill_id] = { level: newLevel, confidence: a.confidence, source: 'scenario' };
    scores.push(a.scenario_score);
  });

  const averageScore = scores.length ? Math.round(scores.reduce((s, v) => s + v, 0) / scores.length) : 0;
  state.assessment.lastScore = averageScore;
  state.assessment.history.push({ date: new Date().toISOString(), score: averageScore });

  const before = state.achievements.length;
  grantAchievement(state, 'first_assessment');
  const achievementsUnlocked = state.achievements.length > before ? ['first_assessment'] : [];

  recordProgressSnapshot(state);
  saveState(state);

  return ok({ average_score: averageScore, achievements_unlocked: achievementsUnlocked }, 'Assessment saved');
}

/* ============================================================
   SKILL GAP & READINESS
   ============================================================ */

function mockSkillGap() {
  const state = currentStudent();
  if (!state) return unauthenticated();
  const career = getCareerBySlug(state.profile.targetCareerId);
  if (!career) return fail(422, 'No target career yet.', { errors: { target_career_id: ['Choose a target career first.'] } });

  const gaps = computeSkillGaps(state);
  return ok({ career_name: career.name, gaps: gaps.map(gapToDTO) });
}

function mockReadinessScore() {
  const state = currentStudent();
  if (!state) return unauthenticated();
  return ok(readinessToDTO(computeReadinessScore(state)));
}

/* ============================================================
   LEARNING ROADMAP
   ============================================================ */

function mockGenerateRoadmap() {
  const state = currentStudent();
  if (!state) return unauthenticated();
  const career = getCareerBySlug(state.profile.targetCareerId);
  if (!career) return fail(422, 'No target career yet.');

  state.roadmap = generateRoadmap(state);
  saveState(state);
  return ok({ roadmap_id: state.roadmap.id, phases_count: state.roadmap.phases.length }, 'Roadmap created');
}

function mockGetRoadmap() {
  const state = currentStudent();
  if (!state) return unauthenticated();
  if (!state.roadmap) return notFound('No roadmap has been created yet.');
  return ok(roadmapToDTO(state.roadmap));
}

function mockUpdateRoadmapPhase(params, body) {
  const state = currentStudent();
  if (!state) return unauthenticated();
  if (!state.roadmap) return notFound('No roadmap has been created yet.');

  const phase = state.roadmap.phases.find(p => String(p.id) === String(params.id));
  if (!phase) return notFound('Roadmap phase not found.');

  phase.status = body.status;
  if (body.status === 'in_progress') grantAchievement(state, 'first_roadmap');
  if (body.status === 'completed') {
    grantAchievement(state, 'first_module_done');
    if (state.roadmap.phases.every(p => p.status === 'completed')) grantAchievement(state, 'roadmap_completed');
    recordProgressSnapshot(state);
  }
  saveState(state);
  return ok({ id: phase.id, status: phase.status }, 'Phase status updated');
}

/* ============================================================
   PORTFOLIO READINESS
   ============================================================ */

function mockGetPortfolio() {
  const state = currentStudent();
  if (!state) return unauthenticated();
  const result = computePortfolioReadiness(state);
  if (result.overall >= 80) grantAchievement(state, 'portfolio_ready');
  saveState(state);
  return ok({
    overall: result.overall,
    groups: result.groups.map(g => ({
      category: g.category,
      percent: g.percent,
      items: g.items.map(i => ({ id: i.id, label: i.label, done: i.done })),
    })),
  });
}

function mockToggleChecklist(params, body) {
  const state = currentStudent();
  if (!state) return unauthenticated();
  state.portfolio[params.item_code] = !!body.done;
  recordProgressSnapshot(state);
  saveState(state);
  return ok({ item_code: params.item_code, done: !!body.done }, 'Checklist updated');
}

function mockListCertificates() {
  const state = currentStudent();
  if (!state) return unauthenticated();
  return ok((state.certificates || []).map(certToDTO));
}

function mockAddCertificate(body) {
  const state = currentStudent();
  if (!state) return unauthenticated();
  if (!body.title || !body.issuer) return fail(422, 'Validation failed', { errors: { title: ['Title and issuer are required.'] } });

  const cert = { id: `cert-${Date.now()}`, title: body.title, issuer: body.issuer, year: body.year || null };
  state.certificates = state.certificates || [];
  state.certificates.push(cert);
  recordProgressSnapshot(state);
  saveState(state);
  return ok(certToDTO(cert), 'Certificate added', 201);
}

function mockDeleteCertificate(params) {
  const state = currentStudent();
  if (!state) return unauthenticated();
  state.certificates = (state.certificates || []).filter(c => String(c.id) !== String(params.id));
  saveState(state);
  return ok(null, 'Certificate deleted');
}

/**
 * Catatan arsitektur: di backend Laravel nanti, endpoint ini akan
 * memanggil GitHub API dari SERVER (bukan browser user). Di mock ini,
 * karena belum ada server, kita tetap panggil GitHub API publik
 * langsung dari browser sebagai gantinya — hasilnya tetap data GitHub
 * asli, cuma titik panggilnya beda. Saat backend jalan, ganti isi
 * fungsi ini jadi delegasi ke request('POST','/portfolio/github-analyze',...)
 * dan hapus pemanggilan fetch ke api.github.com dari sini.
 */
async function mockAnalyzeGithub(body) {
  const state = currentStudent();
  if (!state) return unauthenticated();

  const username = body.github_username;
  if (!username) return fail(422, 'Validation failed', { errors: { github_username: ['Username is required.'] } });

  let repos;
  try {
    const res = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100`);
    if (res.status === 404) return fail(404, 'GitHub username not found.');
    if (!res.ok) return fail(503, 'The GitHub API is rate limiting requests. Please try again later.');
    repos = await res.json();
  } catch (err) {
    return fail(503, 'Could not reach GitHub. Check your internet connection.');
  }

  if (!Array.isArray(repos) || repos.length === 0) {
    return ok({ repos_analyzed: 0, languages: [], boosted_skills: [] }, 'GitHub analysis complete');
  }

  const langCount = {};
  repos.forEach(r => { if (r.language) langCount[r.language] = (langCount[r.language] || 0) + 1; });

  const boosted = [];
  Object.entries(langCount).forEach(([lang, count]) => {
    const skillId = GITHUB_LANGUAGE_MAP[lang];
    if (!skillId) return;
    const inferredLevel = count >= 7 ? 88 : count >= 4 ? 75 : count >= 2 ? 60 : 45;
    const existing = state.userSkills[skillId];
    const existingLevel = existing ? existing.level : 0;
    const newLevel = Math.round(Math.max(existingLevel, inferredLevel * 0.9));
    if (newLevel > existingLevel) {
      state.userSkills[skillId] = { level: newLevel, confidence: existing ? existing.confidence : 3, source: 'github' };
      boosted.push({ skill_name: skillName(skillId), from: existingLevel, to: newLevel });
    }
  });

  state.githubUsername = username;
  recordProgressSnapshot(state);
  saveState(state);

  return ok({
    repos_analyzed: repos.length,
    languages: Object.entries(langCount).sort((a, b) => b[1] - a[1]).map(([name, repo_count]) => ({ name, repo_count })),
    boosted_skills: boosted,
  }, 'GitHub analysis complete');
}

/* ============================================================
   INDUSTRY INSIGHTS (public)
   ============================================================ */

function mockIndustryInsights(query) {
  const region = query.region || 'National';
  const list = getIndustryInsights().map(i => ({
    ...i,
    demand: getRegionalDemand(i.demand, region),
    jobSampleSize: Math.round(i.jobSampleSize * (REGION_MULTIPLIER[region] ?? 1)),
  }));
  return ok(list.map(industryToDTO));
}

function mockIndustryTrend(params) {
  const history = getSkillTrendHistory(params.skill_id);
  if (!history.length) return notFound('No trend data found for this skill.');
  return ok(history);
}

/**
 * USULAN ENDPOINT — belum ada di dokumen API contract (yang ada baru
 * /assessment/questions dan /assessment/submit). Dibutuhkan halaman
 * My Growth untuk menampilkan riwayat skor assessment dari waktu ke waktu.
 */
function mockAssessmentHistory() {
  const state = currentStudent();
  if (!state) return unauthenticated();
  return ok(state.assessment.history.map(h => ({ date: h.date, score: h.score })));
}

/* ============================================================
   PROGRESS & ACHIEVEMENTS
   ============================================================ */

function mockProgressHistory() {
  const state = currentStudent();
  if (!state) return unauthenticated();
  return ok(state.progressHistory.map(h => ({ date: h.date, readiness_score: h.readinessScore, skill_snapshot: h.skillSnapshot })));
}

function mockAchievements() {
  const state = currentStudent();
  if (!state) return unauthenticated();
  const data = state.achievements.map(a => {
    const def = ACHIEVEMENT_DEFS.find(d => d.code === a.code);
    return { code: a.code, title: def ? def.title : a.code, description: def ? def.description : '', earned_at: a.earnedAt };
  });
  return ok(data);
}

/**
 * USULAN ENDPOINT — belum ada di dokumen API contract.
 * Dibutuhkan untuk: (1) Career Detail menampilkan level skill user vs
 * career yang SEDANG DIBROWSE (bukan cuma target aktif, yang sudah
 * dicover /skill-gap), dan (2) Onboarding step "Rate Skill Level".
 * Tolong didiskusikan dengan tim BE untuk ditambahkan sebagai
 * GET /me/skills.
 */
function mockMySkills() {
  const state = currentStudent();
  if (!state) return unauthenticated();
  return ok(Object.entries(state.userSkills).map(([skillId, s]) => ({
    skill_id: skillId, level: s.level, confidence: s.confidence, source: s.source || 'self',
  })));
}

/* ============================================================
   ADMIN
   ============================================================ */

function mockAdminDashboard() {
  if (!isAdminLoggedIn()) return unauthenticated();
  const users = getAllUsersForAdmin();
  const avgReadiness = users.length
    ? Math.round(users.reduce((s, u) => s + (u.readiness || 0), 0) / users.filter(u => u.readiness != null).length || 0)
    : 0;
  return ok({
    total_users: users.length,
    total_careers: getAllCareers().length,
    active_users: Math.max(1, Math.round(users.length * 0.7)),
    avg_readiness_score: avgReadiness,
    roadmap_completion: 42,
    assessment_completion: 65,
  });
}

function mockAdminListCareers() {
  if (!isAdminLoggedIn()) return unauthenticated();
  return ok(getAllCareers().map(c => ({ ...careerToDTO(c, false), required_skills_count: c.requiredSkills.length })));
}

function mockAdminCreateCareer(body) {
  if (!isAdminLoggedIn()) return unauthenticated();
  if (!body.name) return fail(422, 'Validation failed', { errors: { name: ['Career name is required.'] } });

  const content = getAdminContent();
  let slug = body.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  if (content.careers.some(c => c.slug === slug)) slug = `${slug}-${Date.now().toString().slice(-4)}`;

  const career = {
    id: slug, slug, name: body.name,
    category: body.category || 'General', difficulty: body.difficulty || 'Intermediate',
    industryDemand: body.industry_demand || 0, jobSampleSize: body.job_sample_size || 0,
    remoteFriendly: !!body.remote_friendly,
    shortDescription: body.short_description || '', description: body.description || '',
    responsibilities: body.responsibilities || [], tools: body.tools || [],
    requiredSkills: (body.required_skills || []).map(r => ({ skillId: r.skill_id, level: r.level, importance: r.importance })),
  };
  content.careers.push(career);
  saveAdminContent(content);
  return ok({ id: career.id, slug: career.slug }, 'Career added', 201);
}

function mockAdminUpdateCareer(params, body) {
  if (!isAdminLoggedIn()) return unauthenticated();
  const content = getAdminContent();
  const idx = content.careers.findIndex(c => String(c.id) === String(params.id));
  if (idx === -1) return notFound('Career not found.');

  const fieldMap = {
    name: 'name', category: 'category', difficulty: 'difficulty',
    industry_demand: 'industryDemand', job_sample_size: 'jobSampleSize', remote_friendly: 'remoteFriendly',
    short_description: 'shortDescription', description: 'description', responsibilities: 'responsibilities', tools: 'tools',
  };
  Object.entries(body).forEach(([key, value]) => {
    if (fieldMap[key]) content.careers[idx][fieldMap[key]] = value;
  });
  if (body.required_skills) {
    content.careers[idx].requiredSkills = body.required_skills.map(r => ({ skillId: r.skill_id, level: r.level, importance: r.importance }));
  }
  saveAdminContent(content);
  return ok({ id: content.careers[idx].id, name: content.careers[idx].name }, 'Career updated');
}

function mockAdminDeleteCareer(params) {
  if (!isAdminLoggedIn()) return unauthenticated();
  const content = getAdminContent();
  content.careers = content.careers.filter(c => String(c.id) !== String(params.id));
  saveAdminContent(content);
  return ok(null, 'Career deleted');
}

function mockAdminListSkills() {
  if (!isAdminLoggedIn()) return unauthenticated();
  return ok(getAllSkills().map(skillToDTO));
}

function mockAdminCreateSkill(body) {
  if (!isAdminLoggedIn()) return unauthenticated();
  if (!body.name) return fail(422, 'Validation failed', { errors: { name: ['Skill name is required.'] } });

  const content = getAdminContent();
  let id = (body.code || body.name).toLowerCase().replace(/[^a-z0-9]+/g, '');
  if (content.skills.some(s => s.id === id)) id = `${id}${Date.now().toString().slice(-4)}`;
  const skill = { id, name: body.name, category: body.category || 'technical' };
  content.skills.push(skill);
  saveAdminContent(content);
  return ok(skillToDTO(skill), 'Skill added', 201);
}

function mockAdminUpdateSkill(params, body) {
  if (!isAdminLoggedIn()) return unauthenticated();
  const content = getAdminContent();
  const idx = content.skills.findIndex(s => String(s.id) === String(params.id));
  if (idx === -1) return notFound('Skill not found.');
  if (body.name) content.skills[idx].name = body.name;
  if (body.category) content.skills[idx].category = body.category;
  saveAdminContent(content);
  return ok(skillToDTO(content.skills[idx]), 'Skill updated');
}

function mockAdminDeleteSkill(params) {
  if (!isAdminLoggedIn()) return unauthenticated();
  const content = getAdminContent();
  content.skills = content.skills.filter(s => String(s.id) !== String(params.id));
  saveAdminContent(content);
  return ok(null, 'Skill deleted');
}

function mockAdminListIndustryInsights() {
  if (!isAdminLoggedIn()) return unauthenticated();
  return ok(getIndustryInsights().map(industryToDTO));
}

/** Upsert — sama seperti dokumen (skill_id unique di tabel industry_insights). */
function mockAdminSaveIndustryInsight(body) {
  if (!isAdminLoggedIn()) return unauthenticated();
  const content = getAdminContent();
  const idx = content.industryInsights.findIndex(i => i.skillId === body.skill_id);
  const record = { skillId: body.skill_id, demand: body.demand, trend: body.trend, jobSampleSize: body.job_sample_size, period: body.period || 'Last 3 months' };
  if (idx === -1) content.industryInsights.push(record);
  else content.industryInsights[idx] = record;
  saveAdminContent(content);
  return ok({ skill_id: record.skillId, demand: record.demand }, 'Industry data saved');
}

function mockAdminDeleteIndustryInsight(params) {
  if (!isAdminLoggedIn()) return unauthenticated();
  const content = getAdminContent();
  content.industryInsights = content.industryInsights.filter(i => i.skillId !== params.skill_id);
  saveAdminContent(content);
  return ok(null, 'Industry data deleted');
}

function mockAdminListLearningResources(query) {
  if (!isAdminLoggedIn()) return unauthenticated();
  let list = getAdminContent().learningResources;
  if (query.skill_id) list = list.filter(r => r.skillId === query.skill_id);
  return ok(list.map(r => ({ id: r.id, skill_id: r.skillId, title: r.title, provider: r.provider, type: r.type })));
}

function mockAdminCreateLearningResource(body) {
  if (!isAdminLoggedIn()) return unauthenticated();
  if (!body.title) return fail(422, 'Validation failed', { errors: { title: ['Title is required.'] } });
  const content = getAdminContent();
  const resource = { id: `res-${Date.now()}`, skillId: body.skill_id, title: body.title, provider: body.provider || 'Unknown', type: body.type || 'course' };
  content.learningResources.push(resource);
  saveAdminContent(content);
  return ok({ id: resource.id, title: resource.title }, 'Resource added', 201);
}

function mockAdminUpdateLearningResource(params, body) {
  if (!isAdminLoggedIn()) return unauthenticated();
  const content = getAdminContent();
  const idx = content.learningResources.findIndex(r => String(r.id) === String(params.id));
  if (idx === -1) return notFound('Resource not found.');
  const fieldMap = { title: 'title', provider: 'provider', type: 'type', skill_id: 'skillId' };
  Object.entries(body).forEach(([key, value]) => { if (fieldMap[key]) content.learningResources[idx][fieldMap[key]] = value; });
  saveAdminContent(content);
  return ok({ id: content.learningResources[idx].id }, 'Resource updated');
}

function mockAdminDeleteLearningResource(params) {
  if (!isAdminLoggedIn()) return unauthenticated();
  const content = getAdminContent();
  content.learningResources = content.learningResources.filter(r => String(r.id) !== String(params.id));
  saveAdminContent(content);
  return ok(null, 'Resource deleted');
}

function mockAdminListUsers() {
  if (!isAdminLoggedIn()) return unauthenticated();
  return ok(getAllUsersForAdmin().map(u => {
    const career = getCareerBySlug(u.targetCareerId);
    return { id: u.id, full_name: u.fullName, target_career: career ? career.name : null, readiness_score: u.readiness ?? null };
  }));
}

function mockAdminAnalytics() {
  if (!isAdminLoggedIn()) return unauthenticated();
  const users = getAllUsersForAdmin();
  const counts = {};
  users.forEach(u => { if (u.targetCareerId) counts[u.targetCareerId] = (counts[u.targetCareerId] || 0) + 1; });
  const careerDistribution = Object.entries(counts).map(([id, count]) => ({ career: getCareerBySlug(id)?.name || id, count }));

  return ok({
    career_distribution: careerDistribution,
    gap_distribution: [
      { label: 'Critical Gap', value: 28 }, { label: 'Moderate Gap', value: 35 },
      { label: 'Small Gap', value: 22 }, { label: 'Strong Match', value: 15 },
    ],
    user_growth: [120, 180, 260, 340, 410, 480],
  });
}

function mockAdminGetScoringSettings() {
  if (!isAdminLoggedIn()) return unauthenticated();
  return ok(getScoringWeights());
}

function mockAdminUpdateScoringSettings(body) {
  if (!isAdminLoggedIn()) return unauthenticated();
  const total = ['technical', 'soft', 'portfolio', 'experience', 'assessment'].reduce((s, k) => s + (Number(body[k]) || 0), 0);
  if (Math.abs(total - 1) > 0.001) return fail(422, 'Validation failed', { errors: { total: ['Weights must total 1.0'] } });

  const content = getAdminContent();
  content.scoringWeights = {
    technical: body.technical, soft: body.soft, portfolio: body.portfolio,
    experience: body.experience, assessment: body.assessment,
  };
  saveAdminContent(content);
  return ok(content.scoringWeights, 'Score weights updated');
}

function mockAdminSetIndustryInsightMode(body) {
  if (!isAdminLoggedIn()) return unauthenticated();
  if (!['auto', 'manual'].includes(body.mode)) return fail(422, 'Validation failed', { errors: { mode: ['Mode must be auto or manual.'] } });
  const content = getAdminContent();
  content.industryInsightMode = body.mode;
  saveAdminContent(content);
  return ok({ industry_insight_mode: content.industryInsightMode }, 'Industry insight mode updated');
}

function mockAdminListScrapeRuns() {
  if (!isAdminLoggedIn()) return unauthenticated();
  const runs = getAdminContent().scrapeRuns || [];
  return ok(runs.map(r => ({
    id: r.id, started_at: r.startedAt, finished_at: r.finishedAt, status: r.status,
    jobs_found: r.jobsFound, jobs_processed: r.jobsProcessed, error_message: r.errorMessage,
  })));
}

/**
 * Catatan: di backend asli, ini akan men-trigger command `scrape:jobs`
 * secara async (job queue) lalu memanggil ML lewat POST /extract-skills.
 * Mock ini cuma menambahkan satu log baru bergaya "berhasil" untuk
 * kebutuhan demo — tidak benar-benar melakukan scraping apapun.
 */
function mockAdminTriggerScrapeRun() {
  if (!isAdminLoggedIn()) return unauthenticated();
  const content = getAdminContent();
  const newRun = {
    id: (content.scrapeRuns.length ? Math.max(...content.scrapeRuns.map(r => r.id)) : 0) + 1,
    startedAt: new Date().toISOString(), finishedAt: new Date().toISOString(),
    status: 'success', jobsFound: 150, jobsProcessed: 150, errorMessage: null,
  };
  content.scrapeRuns.push(newRun);
  saveAdminContent(content);
  return ok({ scrape_run_id: newRun.id }, 'Scraping started in the background (simulated)', 202);
}

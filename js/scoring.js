/**
 * SkillBridge — scoring logic
 *
 * Semua rumus di sini adalah formula prototype yang transparan dan bisa
 * dikonfigurasi ulang — bukan diklaim sebagai standar industri resmi.
 */

function getUserLevel(state, skillId) {
  const s = state.userSkills[skillId];
  return s ? s.level : 0;
}

function gapCategory(gapValue) {
  if (gapValue >= 0) return 'strong';
  if (gapValue >= -15) return 'small';
  if (gapValue >= -30) return 'moderate';
  return 'critical';
}

const GAP_LABEL = {
  strong: 'Strong Match',
  small: 'Small Gap',
  moderate: 'Moderate Gap',
  critical: 'Critical Gap',
};

/** Gabungkan kategori gap + importance skill di career menjadi label prioritas. */
/**
 * Gabungkan kategori gap + importance skill di career + demand industri
 * jadi satu label prioritas. Skill yang sering muncul di lowongan (demand
 * tinggi) mendapat dorongan prioritas, bukan cuma dinilai dari kebutuhan
 * career saja — supaya urutan roadmap merefleksikan skill yang paling
 * "dicari pasar" duluan.
 */
function priorityFor(category, importance, demand) {
  const rank = { strong: 0, small: 1, moderate: 2, critical: 3 };
  const impRank = { low: 0, medium: 1, high: 2, critical: 3 };
  const demandRank = demand >= 65 ? 1.5 : demand >= 45 ? 0.75 : 0;
  const score = rank[category] + impRank[importance || 'medium'] + demandRank;
  if (category === 'strong') return 'Low';
  if (score >= 5.5) return 'Critical';
  if (score >= 4) return 'High';
  if (score >= 2) return 'Medium';
  return 'Low';
}

/**
 * Menghitung skill gap user terhadap target career.
 * Mengembalikan array terurut: Critical dulu, lalu High, Medium, Low.
 */
function computeSkillGaps(state) {
  const career = getCareerBySlug(state.profile.targetCareerId);
  if (!career) return [];

  const rows = career.requiredSkills.map(req => {
    const userLevel = getUserLevel(state, req.skillId);
    const gapValue = userLevel - req.level;
    const category = gapCategory(gapValue);
    const industryInsight = getIndustryInsights().find(i => i.skillId === req.skillId);
    const demand = industryInsight ? industryInsight.demand : 50;
    const priority = priorityFor(category, req.importance, demand);
    return {
      skillId: req.skillId,
      skillName: skillName(req.skillId),
      skillCategory: getSkillCategory(req.skillId),
      userLevel,
      requiredLevel: req.level,
      importance: req.importance,
      demand,
      gapValue,
      category,
      categoryLabel: GAP_LABEL[category],
      priority,
    };
  });

  const priorityRank = { Critical: 3, High: 2, Medium: 1, Low: 0 };
  rows.sort((a, b) => {
    const byPriority = priorityRank[b.priority] - priorityRank[a.priority];
    if (byPriority !== 0) return byPriority;
    return b.demand - a.demand; // dalam prioritas yang sama, skill dengan demand lebih tinggi didahulukan
  });
  return rows;
}

function statusForScore(score) {
  if (score >= 86) return { label: 'Highly Ready', className: 'badge-success' };
  if (score >= 66) return { label: 'Ready', className: 'badge-success' };
  if (score >= 41) return { label: 'Developing', className: 'badge-warning' };
  return { label: 'Beginning', className: 'badge-critical' };
}

/**
 * Career Readiness Score = kombinasi technical match, soft skill match,
 * portfolio readiness, experience readiness, dan performa assessment.
 * Bobot dapat dikonfigurasi ulang sesuai kebutuhan.
 */
function computeReadinessScore(state) {
  const career = getCareerBySlug(state.profile.targetCareerId);
  if (!career) {
    return { overall: 0, technical: 0, soft: 0, portfolio: 0, experience: 0, assessment: 0, status: statusForScore(0) };
  }

  const technicalReq = career.requiredSkills.filter(r => getSkillCategory(r.skillId) === 'technical');
  const softReq = career.requiredSkills.filter(r => getSkillCategory(r.skillId) === 'soft');

  const matchRatio = req => Math.min(100, (getUserLevel(state, req.skillId) / req.level) * 100);

  const technical = technicalReq.length
    ? Math.round(technicalReq.reduce((sum, r) => sum + matchRatio(r), 0) / technicalReq.length)
    : 0;
  const soft = softReq.length
    ? Math.round(softReq.reduce((sum, r) => sum + matchRatio(r), 0) / softReq.length)
    : 60; // default netral kalau career tidak punya syarat soft skill eksplisit

  const portfolioItems = PORTFOLIO_CHECKLIST.filter(i => i.category === 'Portfolio');
  const portfolio = Math.round(
    (portfolioItems.filter(i => state.portfolio[i.id]).length / portfolioItems.length) * 100
  );

  const experienceItems = PORTFOLIO_CHECKLIST.filter(i => i.category === 'Experience');
  const experience = Math.round(
    (experienceItems.filter(i => state.portfolio[i.id]).length / experienceItems.length) * 100
  );

  const assessment = state.assessment.lastScore || 0;

  const weights = getScoringWeights();
  const overall = Math.round(
    technical * weights.technical + soft * weights.soft + portfolio * weights.portfolio
    + experience * weights.experience + assessment * weights.assessment
  );

  return { overall, technical, soft, portfolio, experience, assessment, status: statusForScore(overall) };
}

/** Skor kesiapan portofolio (halaman Portfolio Readiness), terpisah dari readiness score utama. */
function computePortfolioReadiness(state) {
  const career = getCareerBySlug(state.profile.targetCareerId);
  const technicalReq = career ? career.requiredSkills.filter(r => getSkillCategory(r.skillId) === 'technical') : [];
  const technicalMet = technicalReq.filter(r => getUserLevel(state, r.skillId) >= r.level * 0.8);

  const groups = ['Portfolio', 'Experience', 'Career Documents'].map(category => {
    const items = PORTFOLIO_CHECKLIST.filter(i => i.category === category);
    return {
      category,
      items: items.map(i => ({ ...i, done: !!state.portfolio[i.id] })),
      percent: Math.round((items.filter(i => state.portfolio[i.id]).length / items.length) * 100),
    };
  });

  const technicalGroup = {
    category: 'Technical Skills',
    items: technicalReq.map(r => ({ id: r.skillId, label: skillName(r.skillId), done: getUserLevel(state, r.skillId) >= r.level * 0.8 })),
    percent: technicalReq.length ? Math.round((technicalMet.length / technicalReq.length) * 100) : 0,
  };

  const certificates = state.certificates || [];
  const certGroup = {
    category: 'Certifications',
    items: certificates.map(c => ({ id: c.id, label: `${c.title} — ${c.issuer}`, done: true })),
    percent: Math.min(100, certificates.length * 34),
  };

  const allGroups = [technicalGroup, ...groups, certGroup];
  const overall = Math.round(allGroups.reduce((sum, g) => sum + g.percent, 0) / allGroups.length);

  return { overall, groups: allGroups };
}

/**
 * Membuat Learning Roadmap otomatis dari hasil skill gap — bukan template
 * tetap per career. Fase diurutkan dari prioritas tertinggi, ditutup
 * dengan fase Portfolio Project.
 */
function generateRoadmap(state) {
  const career = getCareerBySlug(state.profile.targetCareerId);
  if (!career) return null;

  const gaps = computeSkillGaps(state).filter(g => g.category !== 'strong');
  const phases = gaps.map(g => {
    const content = SKILL_CONTENT[g.skillId] || {};
    // Resource yang dikelola admin diprioritaskan; kalau admin belum menambahkan
    // apa-apa untuk skill ini, pakai resource bawaan dari SKILL_CONTENT.
    const adminResources = getLearningResourcesFor(g.skillId);
    const resources = adminResources.length ? adminResources : (content.resources || []);
    // Durasi disesuaikan dari besar gap: gap kecil selesai lebih cepat dari
    // estimasi dasar, gap besar butuh waktu lebih lama — bukan angka tetap
    // per skill terlepas dari level user sekarang.
    const baseDuration = content.durationDays || 7;
    const gapSeverity = Math.min(1.6, Math.abs(g.gapValue) / 50);
    const durationDays = Math.max(4, Math.round(baseDuration * (0.5 + gapSeverity)));
    return {
      skillId: g.skillId,
      title: skillName(g.skillId),
      priority: g.priority,
      status: 'not_started', // not_started | in_progress | completed
      learningObjective: content.objective || `Improve your ${skillName(g.skillId)} skills.`,
      why: content.why || `This skill is required to reach your goal of becoming a ${career.name}.`,
      after: content.after || 'You will be better prepared for tasks that use this skill.',
      resources,
      tasks: content.tasks || [],
      miniProject: content.miniProject || '',
      durationDays,
    };
  });

  phases.push({
    skillId: '__portfolio__',
    title: 'Portfolio Project',
    priority: 'High',
    status: 'not_started',
    learningObjective: `Build one end-to-end project that shows you are ready to work as a ${career.name}.`,
    why: 'A real project proves the skills you have learned, not just the theory.',
    after: 'You will have one strong portfolio piece to show recruiters.',
    resources: [],
    tasks: ['Choose a project case study', 'Build it end to end, from data/design to the final result', 'Document it on GitHub / your portfolio'],
    miniProject: `A capstone project themed around ${career.name}.`,
    durationDays: 14,
  });

  return {
    id: 1, // satu roadmap aktif per user (sesuai unique(user_id) di skema roadmaps)
    targetCareerId: career.id,
    generatedAt: new Date().toISOString(),
    phases: phases.map((p, i) => ({ id: i + 1, ...p })),
  };
}

function roadmapProgress(roadmap) {
  if (!roadmap || !roadmap.phases.length) return 0;
  const done = roadmap.phases.filter(p => p.status === 'completed').length;
  return Math.round((done / roadmap.phases.length) * 100);
}

/** Menambahkan snapshot progres hari ini ke riwayat, dipanggil setelah aksi penting (assessment, module selesai, dll). */
function recordProgressSnapshot(state) {
  const readiness = computeReadinessScore(state);
  const skillSnapshot = {};
  Object.keys(state.userSkills).forEach(id => { skillSnapshot[id] = state.userSkills[id].level; });
  state.progressHistory.push({ date: new Date().toISOString(), readinessScore: readiness.overall, skillSnapshot });
  if (state.progressHistory.length > 24) state.progressHistory.shift();
}

function grantAchievement(state, code) {
  if (!state.achievements.some(a => a.code === code)) {
    state.achievements.push({ code, earnedAt: new Date().toISOString() });
  }
}

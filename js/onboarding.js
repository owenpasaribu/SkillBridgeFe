/**
 * SkillBridge — wizard onboarding (5 langkah).
 * Sudah lewat Api.* — lihat js/api.js. Memilih skill di Step 3 butuh daftar
 * SEMUA skill (bukan cuma yang dibutuhkan satu career) → Api.skills.list().
 * Backend belum punya GET /skills publik, jadi di mode live daftar itu
 * dirangkai dari katalog skill di js/api-live.js.
 */

const LEVEL_OPTIONS = [
  { label: 'Beginner', value: 15 },
  { label: 'Elementary', value: 35 },
  { label: 'Intermediate', value: 55 },
  { label: 'Advanced', value: 75 },
  { label: 'Expert', value: 92 },
];

let currentStep = 1;
const TOTAL_STEPS = 5;
let careersCache = [];
let skillsCache = [];

const draft = {
  selectedCareerId: null,
  selectedSkills: new Set(),
  skillLevels: {}, // { skillId: numericLevel }
  timelineMonths: 12,
};

document.addEventListener('DOMContentLoaded', async () => {
  const meRes = await Api.auth.me();
  if (meRes.status === 401) { window.location.href = 'login.html'; return; }
  if (meRes.data.onboarding_complete) { window.location.href = 'dashboard.html'; return; }

  // Prefill step 1 dari data register
  document.getElementById('ob-fullName').value = meRes.data.full_name || '';
  document.getElementById('ob-university').value = meRes.data.university || '';
  document.getElementById('ob-major').value = meRes.data.major || '';
  document.getElementById('ob-semester').value = meRes.data.semester || '';
  document.getElementById('ob-gradYear').value = meRes.data.graduation_year || '';

  await renderCareerPicker();
  const skillsRes = await Api.skills.list();
  skillsCache = skillsRes.data || [];
  renderSkillPicker();
  document.getElementById('skillSearch').addEventListener('input', renderSkillPicker);

  document.getElementById('nextBtn').addEventListener('click', handleNext);
  document.getElementById('backBtn').addEventListener('click', handleBack);
  updateStepUI();
});

async function renderCareerPicker() {
  const grid = document.getElementById('careerPickGrid');
  grid.innerHTML = '<p class="text-sm text-faint">Loading careers...</p>';

  const res = await Api.career.list();
  careersCache = res.data;

  grid.innerHTML = '';
  careersCache.forEach(career => {
    const card = document.createElement('div');
    card.className = 'career-pick-card';
    card.dataset.careerId = career.id;
    card.innerHTML = `<strong>${career.name}</strong><p class="text-sm mb-0">${career.short_description}</p>`;
    card.addEventListener('click', () => {
      draft.selectedCareerId = career.id;
      grid.querySelectorAll('.career-pick-card').forEach(c => c.classList.remove('is-selected'));
      card.classList.add('is-selected');
    });
    grid.appendChild(card);
  });
}

/** Skill yang dibutuhkan career target (untuk ditampilkan paling atas). */
let recommendedSkillIds = new Set();

/** Memuat daftar skill (di mode live ditambah skill milik career yang dipilih) + rekomendasi. */
async function refreshSkillPicker() {
  const [skillsRes, careerRes] = await Promise.all([
    Api.skills.list(draft.selectedCareerId),
    draft.selectedCareerId ? Api.career.get(draft.selectedCareerId) : Promise.resolve(null),
  ]);
  if (skillsRes.status === 200 && Array.isArray(skillsRes.data)) skillsCache = skillsRes.data;
  recommendedSkillIds = new Set(
    careerRes && careerRes.status === 200 ? careerRes.data.required_skills.map(r => r.skill_id) : []
  );
  renderSkillPicker();
}

function skillChip(skill) {
  const chip = document.createElement('button');
  chip.type = 'button';
  chip.className = 'chip' + (draft.selectedSkills.has(skill.id) ? ' is-selected' : '');
  chip.textContent = skill.name;
  chip.addEventListener('click', () => {
    if (draft.selectedSkills.has(skill.id)) {
      draft.selectedSkills.delete(skill.id);
      chip.classList.remove('is-selected');
    } else {
      draft.selectedSkills.add(skill.id);
      chip.classList.add('is-selected');
    }
  });
  return chip;
}

function renderSkillPicker() {
  const area = document.getElementById('skillPickArea');
  const searchEl = document.getElementById('skillSearch');
  const query = ((searchEl && searchEl.value) || '').trim().toLowerCase();
  const matches = skill => !query || skill.name.toLowerCase().includes(query);

  const groups = [];
  const recommended = skillsCache.filter(s => recommendedSkillIds.has(s.id) && matches(s));
  if (recommended.length) groups.push({ label: 'Recommended for your target career', skills: recommended });
  [['technical', 'Technical Skills'], ['soft', 'Soft Skills']].forEach(([cat, label]) => {
    const list = skillsCache.filter(s => s.category === cat && !recommendedSkillIds.has(s.id) && matches(s));
    if (list.length) groups.push({ label, skills: list });
  });

  area.innerHTML = '';
  if (groups.length === 0) {
    area.innerHTML = '<p class="empty-state">No skills match your search.</p>';
    return;
  }
  groups.forEach(group => {
    const label = document.createElement('p');
    label.className = 'skill-group-label';
    label.textContent = group.label;
    area.appendChild(label);

    const grid = document.createElement('div');
    grid.className = 'chip-grid';
    group.skills.forEach(skill => grid.appendChild(skillChip(skill)));
    area.appendChild(grid);
  });
}

function renderLevelRater() {
  const area = document.getElementById('levelRateArea');
  area.innerHTML = '';
  if (draft.selectedSkills.size === 0) {
    area.innerHTML = '<p class="empty-state">You have not selected any skills in the previous step.</p>';
    return;
  }
  draft.selectedSkills.forEach(skillId => {
    const row = document.createElement('div');
    row.className = 'level-row';
    const btnsHtml = LEVEL_OPTIONS.map(opt =>
      `<button type="button" class="level-btn" data-skill="${skillId}" data-value="${opt.value}">${opt.label}</button>`
    ).join('');
    const skill = skillsCache.find(s => s.id === skillId);
    row.innerHTML = `<strong>${skill ? skill.name : skillName(skillId)}</strong><div class="level-btns">${btnsHtml}</div>`;
    area.appendChild(row);
  });

  area.querySelectorAll('.level-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const skillId = btn.dataset.skill;
      const value = Number(btn.dataset.value);
      draft.skillLevels[skillId] = value;
      area.querySelectorAll(`.level-btn[data-skill="${skillId}"]`).forEach(b => b.classList.remove('is-selected'));
      btn.classList.add('is-selected');
    });
  });
}

function renderGoalSummary() {
  const career = careersCache.find(c => c.id === draft.selectedCareerId);
  const summary = document.getElementById('goalSummary');
  summary.textContent = career
    ? `My target is to become a ${career.name}.`
    : 'You have not chosen a target career yet.';
}

function updateStepUI() {
  document.querySelectorAll('.onboarding-step').forEach(section => {
    section.hidden = Number(section.dataset.step) !== currentStep;
  });
  document.getElementById('progressFill').style.width = `${(currentStep / TOTAL_STEPS) * 100}%`;
  const titles = ['Basic Profile', 'Choose Career Interest', 'Select Current Skills', 'Rate Skill Level', 'Set Career Goal'];
  document.getElementById('stepLabel').textContent = `Step ${currentStep} of ${TOTAL_STEPS} — ${titles[currentStep - 1]}`;
  document.getElementById('backBtn').style.visibility = currentStep === 1 ? 'hidden' : 'visible';
  document.getElementById('nextBtn').textContent = currentStep === TOTAL_STEPS ? 'Finish & View Dashboard' : 'Next';

  if (currentStep === 3) refreshSkillPicker();
  if (currentStep === 4) renderLevelRater();
  if (currentStep === 5) renderGoalSummary();
}

function validateStep() {
  if (currentStep === 1) {
    const required = ['ob-fullName', 'ob-university', 'ob-major', 'ob-semester', 'ob-gradYear'];
    const ok = required.every(id => document.getElementById(id).value.trim() !== '');
    if (!ok) alert('Please complete all of your basic profile details first.');
    return ok;
  }
  if (currentStep === 2) {
    if (!draft.selectedCareerId) alert('Please choose one target career first.');
    return !!draft.selectedCareerId;
  }
  if (currentStep === 3) {
    if (draft.selectedSkills.size === 0) alert('Please select at least one skill you have learned.');
    return draft.selectedSkills.size > 0;
  }
  if (currentStep === 4) {
    const allRated = [...draft.selectedSkills].every(id => draft.skillLevels[id] !== undefined);
    if (!allRated) alert('Please rate your level for every skill you selected.');
    return allRated;
  }
  return true;
}

function handleNext() {
  if (!validateStep()) return;
  if (currentStep < TOTAL_STEPS) {
    currentStep += 1;
    updateStepUI();
  } else {
    finishOnboarding();
  }
}

function handleBack() {
  if (currentStep > 1) {
    currentStep -= 1;
    updateStepUI();
  }
}

async function finishOnboarding() {
  draft.timelineMonths = Number(document.getElementById('ob-timeline').value) || 12;

  document.getElementById('loadingOverlay').classList.add('is-visible');

  // Update basic profile dulu (field Step 1 mungkin diedit ulang oleh user).
  await Api.auth.updateMe({
    full_name: document.getElementById('ob-fullName').value.trim(),
    university: document.getElementById('ob-university').value.trim(),
    major: document.getElementById('ob-major').value.trim(),
    semester: document.getElementById('ob-semester').value,
    graduation_year: document.getElementById('ob-gradYear').value,
  });

  await Api.onboarding.submit({
    target_career_id: draft.selectedCareerId,
    target_timeline_months: draft.timelineMonths,
    skills: [...draft.selectedSkills].map(skillId => ({ skill_id: skillId, level: draft.skillLevels[skillId] })),
  });

  window.location.href = 'dashboard.html';
}

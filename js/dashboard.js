/**
 * SkillBridge — logika halaman Dashboard.
 * Sudah lewat Api.* — lihat js/api.js.
 */

document.addEventListener('DOMContentLoaded', async () => {
  const meRes = await Api.auth.me();
  if (meRes.status === 401) { window.location.href = 'login.html'; return; }
  if (!meRes.data.onboarding_complete) { window.location.href = 'onboarding.html'; return; }

  const profile = meRes.data;
  const firstName = (profile.full_name || '').split(' ')[0] || 'there';
  document.getElementById('greeting').textContent = `Hello, ${firstName}!`;

  let career = null;
  if (profile.target_career_id) {
    const careerRes = await Api.career.get(profile.target_career_id);
    if (careerRes.status === 200) career = careerRes.data;
  }

  document.getElementById('profileLine').textContent = career
    ? `${profile.university} · ${profile.major} · Target: ${career.name}`
    : `${profile.university} · ${profile.major}`;

  if (!career) document.getElementById('noCareerCard').hidden = false;

  const [readinessRes, roadmapRes, progressRes] = await Promise.all([
    Api.readiness.get(), Api.roadmap.get(), Api.progress.history(),
  ]);
  renderReadiness(readinessRes.data, progressRes.data);

  let gaps = [];
  if (career) {
    const gapRes = await Api.skillGap.get();
    if (gapRes.status === 200) gaps = gapRes.data.gaps;
  }
  renderSkillOverview(gaps, career);
  renderGapSummary(gaps, career);
  renderRoadmapProgress(roadmapRes, career);
  renderNextAction(gaps, career);
});

function renderReadiness(readiness, progressHistory) {
  document.getElementById('readinessNumber').textContent = `${readiness.overall}%`;
  const statusEl = document.getElementById('readinessStatus');
  statusEl.textContent = readiness.status;
  statusEl.className = `gauge-status ${readinessBadgeClass(readiness.status)}`;

  const trendEl = document.getElementById('readinessTrend');
  if (progressHistory.length >= 2) {
    const prev = progressHistory[progressHistory.length - 2].readiness_score;
    const diff = readiness.overall - prev;
    trendEl.textContent = diff === 0
      ? 'Unchanged since your last check'
      : `${diff > 0 ? 'Up' : 'Down'} ${Math.abs(diff)}% from last time`;
  } else {
    trendEl.textContent = 'This is your first calculation';
  }
}

function renderSkillOverview(gaps, career) {
  const list = document.getElementById('skillOverviewList');
  list.innerHTML = '';

  if (!career || gaps.length === 0) {
    list.innerHTML = '<p class="empty-state">No skill data yet. Take the Skill Assessment first.</p>';
    return;
  }

  gaps.slice(0, 6).forEach(g => {
    const row = document.createElement('div');
    row.className = 'skill-row';
    row.innerHTML = `
      <div class="skill-row-head"><span>${g.skill_name}</span><strong>${g.user_level}%</strong></div>
      <div class="progress-track"><div class="progress-fill" style="width:${g.user_level}%"></div></div>`;
    list.appendChild(row);
  });
}

function renderGapSummary(gaps, career) {
  const critical = document.getElementById('criticalList');
  const moderate = document.getElementById('moderateList');
  const strong = document.getElementById('strongList');

  if (!career) {
    [critical, moderate, strong].forEach(el => el.innerHTML = '<span class="text-faint">No target career yet</span>');
    return;
  }

  const bucket = { critical: [], moderate: [], strong: [] };
  gaps.forEach(g => {
    if (g.category === 'critical') bucket.critical.push(g.skill_name);
    else if (g.category === 'moderate') bucket.moderate.push(g.skill_name);
    else bucket.strong.push(g.skill_name);
  });

  critical.innerHTML = bucket.critical.length ? bucket.critical.join(', ') : '<span class="text-faint">None</span>';
  moderate.innerHTML = bucket.moderate.length ? bucket.moderate.join(', ') : '<span class="text-faint">None</span>';
  strong.innerHTML = bucket.strong.length ? bucket.strong.join(', ') : '<span class="text-faint">None</span>';
}

function renderRoadmapProgress(roadmapRes, career) {
  const titleEl = document.getElementById('roadmapTitle');
  const fillEl = document.getElementById('roadmapProgressFill');
  const labelEl = document.getElementById('roadmapProgressLabel');

  if (roadmapRes.status !== 200) {
    titleEl.textContent = 'No active roadmap yet';
    labelEl.textContent = 'Finish onboarding or visit Learning Roadmap to create one.';
    return;
  }
  const phases = roadmapRes.data.phases;
  const doneCount = phases.filter(p => p.status === 'completed').length;
  const pct = phases.length ? Math.round((doneCount / phases.length) * 100) : 0;

  titleEl.textContent = `${career ? career.name : ''} Roadmap`;
  fillEl.style.width = `${pct}%`;
  labelEl.textContent = `${pct}% complete — ${doneCount} of ${phases.length} phases`;
}

function renderNextAction(gaps, career) {
  const titleEl = document.getElementById('nextActionTitle');
  const bodyEl = document.getElementById('nextActionBody');

  if (!career) {
    titleEl.textContent = 'Choose a target career to get started';
    bodyEl.textContent = 'Open Career Explorer to browse careers and the skills they require.';
    return;
  }

  const relevant = gaps.filter(g => g.category !== 'strong');
  if (relevant.length === 0) {
    titleEl.textContent = 'Your skills are already strong!';
    bodyEl.textContent = 'Next focus: complete Portfolio Readiness so you are ready to apply.';
    return;
  }
  const top = relevant[0];
  titleEl.textContent = `Top priority: ${top.skill_name}`;
  bodyEl.textContent = `Your level is currently ${top.user_level}%, and ${top.required_level}% is required for ${career.name}. Start with the first phase in Learning Roadmap.`;
}

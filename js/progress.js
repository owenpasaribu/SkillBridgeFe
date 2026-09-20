/**
 * SkillBridge — logika halaman My Growth (Progress).
 * Sudah lewat Api.* — lihat js/api.js.
 */

document.addEventListener('DOMContentLoaded', async () => {
  const meRes = await Api.auth.me();
  if (meRes.status === 401) { window.location.href = 'login.html'; return; }

  const [progressRes, assessmentHistoryRes, achievementsRes] = await Promise.all([
    Api.progress.history(), Api.assessment.history(), Api.achievements.list(),
  ]);

  renderReadinessChart(progressRes.data);
  renderSkillProgress(progressRes.data);
  renderAssessmentHistory(assessmentHistoryRes.data);
  renderAchievements(achievementsRes.data);
});

function renderReadinessChart(history) {
  const container = document.getElementById('readinessChart');
  if (history.length < 2) {
    container.innerHTML = '<p class="empty-state">Not enough data yet. History will appear after a few activities.</p>';
    return;
  }

  const width = 600, height = 160, padding = 24;
  const maxScore = 100;
  const step = (width - padding * 2) / (history.length - 1);

  const points = history.map((h, i) => {
    const x = padding + i * step;
    const y = height - padding - (h.readiness_score / maxScore) * (height - padding * 2);
    return `${x},${y}`;
  }).join(' ');

  const dots = history.map((h, i) => {
    const x = padding + i * step;
    const y = height - padding - (h.readiness_score / maxScore) * (height - padding * 2);
    return `<circle cx="${x}" cy="${y}" r="4" fill="#55662E"></circle>`;
  }).join('');

  const labels = history.map((h, i) => {
    const x = padding + i * step;
    const date = new Date(h.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    return `<text x="${x}" y="${height - 4}" font-size="10" fill="#6F644D" text-anchor="middle">${date}</text>`;
  }).join('');

  container.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" style="width:100%; height:auto;">
      <polyline points="${points}" fill="none" stroke="#55662E" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
      ${dots}
      ${labels}
    </svg>`;
}

function renderSkillProgress(history) {
  const list = document.getElementById('skillProgressList');
  if (history.length < 2) {
    list.innerHTML = '<p class="empty-state">No skill history to compare yet.</p>';
    return;
  }
  const first = history[0].skill_snapshot;
  const last = history[history.length - 1].skill_snapshot;
  const skillIds = [...new Set([...Object.keys(first), ...Object.keys(last)])];

  list.innerHTML = skillIds.map(id => `
    <div class="skill-progress-row">
      <span>${skillName(id)}</span>
      <span>${first[id] ?? 0}% &rarr; <strong>${last[id] ?? 0}%</strong></span>
    </div>`).join('') || '<p class="empty-state">No skill data yet.</p>';
}

function renderAssessmentHistory(history) {
  const list = document.getElementById('assessmentHistoryList');
  if (history.length === 0) {
    list.innerHTML = '<p class="empty-state">You have not taken an assessment yet.</p>';
    return;
  }
  list.innerHTML = [...history].reverse().map(h => `
    <div class="skill-progress-row">
      <span>${new Date(h.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
      <strong>${h.score}%</strong>
    </div>`).join('');
}

function renderAchievements(achievements) {
  const grid = document.getElementById('achievementGrid');
  grid.innerHTML = ACHIEVEMENT_DEFS.map(def => {
    const earned = achievements.find(a => a.code === def.code);
    const earnedLabel = earned ? new Date(earned.earned_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
    return `
      <div class="achievement-card ${earned ? 'is-earned' : ''}">
        <div class="achievement-icon">${earned ? '🏆' : '🔒'}</div>
        <strong class="text-sm">${def.title}</strong>
        <p class="text-sm text-faint mb-0">${def.description}</p>
        ${earned ? `<p class="text-sm text-faint mb-0" style="margin-top:4px;">${earnedLabel}</p>` : ''}
      </div>`;
  }).join('');
}

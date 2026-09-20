/**
 * SkillBridge — logika halaman Skill Gap Analysis (core feature).
 * Sudah lewat Api.skillGap.get() — lihat js/api.js.
 */

const PRIORITY_BADGE_CLASS = {
  Critical: 'badge-critical',
  High: 'badge-warning',
  Medium: 'badge-primary',
  Low: 'badge-neutral',
};

document.addEventListener('DOMContentLoaded', async () => {
  const meRes = await Api.auth.me();
  if (meRes.status === 401) { window.location.href = 'login.html'; return; }

  const gapRes = await Api.skillGap.get();
  if (gapRes.status === 422) {
    document.getElementById('noCareerState').hidden = false;
    return;
  }

  document.getElementById('pageSub').textContent = `Your current target career: ${gapRes.data.career_name}.`;
  document.getElementById('gapBody').hidden = false;

  const gaps = gapRes.data.gaps;
  renderTable(gaps);
  renderCompareVisual(gaps);
  renderReasons(gaps, gapRes.data.career_name);
});

function renderTable(gaps) {
  const tbody = document.getElementById('gapTableBody');
  tbody.innerHTML = gaps.map(g => `
    <tr>
      <td>${g.skill_name}</td>
      <td>${g.user_level}%</td>
      <td>${g.required_level}%</td>
      <td>${g.gap_value > 0 ? '+' : ''}${g.gap_value}%</td>
      <td><span class="badge ${PRIORITY_BADGE_CLASS[g.priority]}">${g.priority}</span></td>
    </tr>`).join('');
}

function renderCompareVisual(gaps) {
  const container = document.getElementById('compareVisual');
  container.innerHTML = gaps.map(g => `
    <div class="compare-row">
      <div class="compare-row-head">
        <span class="name">${g.skill_name} <span class="badge ${PRIORITY_BADGE_CLASS[g.priority]}" style="margin-left:6px;">${GAP_CATEGORY_LABEL[g.category]}</span></span>
        <span class="text-sm text-faint">${g.user_level}% / ${g.required_level}%</span>
      </div>
      <div class="compare-track">
        <div class="compare-fill-required" style="width:${g.required_level}%"></div>
        <div class="compare-fill-user" style="width:${g.user_level}%"></div>
      </div>
    </div>`).join('');
}

function gapReason(g, careerName) {
  if (g.category === 'strong') {
    return `${g.skill_name} meets or exceeds the standard required for ${careerName} — keep your level up.`;
  }
  return `${g.skill_name} is ${g.priority} priority because industry demand for this skill is fairly high (${g.demand}%) and your current level (${g.user_level}%) is still ${Math.abs(g.gap_value)}% below the standard (${g.required_level}%) for ${careerName}.`;
}

function renderReasons(gaps, careerName) {
  const list = document.getElementById('reasonList');
  const relevant = gaps.filter(g => g.category !== 'strong');
  if (relevant.length === 0) {
    list.innerHTML = '<p class="text-sm">All of your skills already meet the standard for this target career. Next, focus on Portfolio Readiness.</p>';
    return;
  }
  list.innerHTML = relevant.map(g => `<div class="reason-item"><p class="text-sm mb-0">${gapReason(g, careerName)}</p></div>`).join('');
}

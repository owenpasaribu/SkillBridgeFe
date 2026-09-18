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

  document.getElementById('pageSub').textContent = `Target karier kamu saat ini: ${gapRes.data.career_name}.`;
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
    return `${g.skill_name} sudah sesuai atau melampaui standar yang dibutuhkan ${careerName} — pertahankan levelnya.`;
  }
  return `${g.skill_name} berstatus ${g.priority} karena demand skill ini di industri cukup tinggi (${g.demand}%) dan level kamu saat ini (${g.user_level}%) masih ${Math.abs(g.gap_value)}% di bawah standar (${g.required_level}%) untuk ${careerName}.`;
}

function renderReasons(gaps, careerName) {
  const list = document.getElementById('reasonList');
  const relevant = gaps.filter(g => g.category !== 'strong');
  if (relevant.length === 0) {
    list.innerHTML = '<p class="text-sm">Semua skill kamu sudah memenuhi standar target karier ini. Fokus selanjutnya bisa ke Portfolio Readiness.</p>';
    return;
  }
  list.innerHTML = relevant.map(g => `<div class="reason-item"><p class="text-sm mb-0">${gapReason(g, careerName)}</p></div>`).join('');
}

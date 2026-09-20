/**
 * SkillBridge — logika halaman Admin Dashboard.
 * Sudah lewat Api.admin.* — lihat js/api.js.
 */

const DEMO_COMMON_GAPS = ['Cloud Computing', 'Docker', 'Power BI', 'Machine Learning'];

document.addEventListener('DOMContentLoaded', async () => {
  const dashRes = await Api.admin.dashboard();
  if (dashRes.status === 401) { window.location.href = 'login.html'; return; }

  // Backend baru menghitung total_users, total_careers, avg_readiness_score.
  // Angka lain dari mock ditampilkan "–" kalau tidak dikirim (null/undefined).
  const show = (value, suffix = '') => (value === null || value === undefined ? '–' : `${value}${suffix}`);
  document.getElementById('statTotalUsers').textContent = show(dashRes.data.total_users);
  document.getElementById('statActiveUsers').textContent = show(dashRes.data.active_users);
  document.getElementById('statRoadmapCompletion').textContent = show(dashRes.data.roadmap_completion, '%');
  document.getElementById('statAssessmentCompletion').textContent = show(dashRes.data.assessment_completion, '%');

  const analyticsRes = await Api.admin.analytics();
  renderTopCareers(analyticsRes.data.career_distribution, dashRes.data.total_users);

  document.getElementById('commonGapsList').innerHTML = DEMO_COMMON_GAPS
    .map(name => `<span class="badge badge-warning" style="margin:0 6px 6px 0;">${name}</span>`).join('');
});

function renderTopCareers(distribution, totalUsers) {
  const list = document.getElementById('topCareersList');
  if (!distribution || distribution.length === 0) {
    list.innerHTML = '<p class="empty-state">No users with a target career yet.</p>';
    return;
  }

  const sorted = [...distribution].sort((a, b) => b.count - a.count);
  list.innerHTML = sorted.map(item => {
    const pct = totalUsers ? Math.round((item.count / totalUsers) * 100) : 0;
    return `
      <div class="skill-row">
        <div class="skill-row-head"><span>${item.career}</span><strong>${item.count} user</strong></div>
        <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
      </div>`;
  }).join('');
}

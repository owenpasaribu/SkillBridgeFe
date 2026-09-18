/**
 * SkillBridge — logika halaman Admin Dashboard.
 * Sudah lewat Api.admin.* — lihat js/api.js.
 */

const DEMO_COMMON_GAPS = ['Cloud Computing', 'Docker', 'Power BI', 'Machine Learning'];

document.addEventListener('DOMContentLoaded', async () => {
  const dashRes = await Api.admin.dashboard();
  if (dashRes.status === 401) { window.location.href = 'login.html'; return; }

  document.getElementById('statTotalUsers').textContent = dashRes.data.total_users;
  document.getElementById('statActiveUsers').textContent = dashRes.data.active_users;
  document.getElementById('statRoadmapCompletion').textContent = `${dashRes.data.roadmap_completion}%`;
  document.getElementById('statAssessmentCompletion').textContent = `${dashRes.data.assessment_completion}%`;

  const analyticsRes = await Api.admin.analytics();
  renderTopCareers(analyticsRes.data.career_distribution, dashRes.data.total_users);

  document.getElementById('commonGapsList').innerHTML = DEMO_COMMON_GAPS
    .map(name => `<span class="badge badge-warning" style="margin:0 6px 6px 0;">${name}</span>`).join('');
});

function renderTopCareers(distribution, totalUsers) {
  const list = document.getElementById('topCareersList');
  if (!distribution || distribution.length === 0) {
    list.innerHTML = '<p class="empty-state">Belum ada user dengan target karier.</p>';
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

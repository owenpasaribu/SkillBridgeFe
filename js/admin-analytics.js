/**
 * SkillBridge — Admin: Analytics.
 * Sudah lewat Api.admin.analytics() — lihat js/api.js. Growth chart dan
 * distribusi skill gap masih demo data di sisi mock (belum ada histori
 * multi-user sungguhan); career_distribution dihitung dari data user asli.
 */

document.addEventListener('DOMContentLoaded', async () => {
  const res = await Api.admin.analytics();
  if (res.status === 401) { window.location.href = 'login.html'; return; }

  renderGrowthChart(res.data.user_growth);
  renderCareerDistribution(res.data.career_distribution);
  renderGapDistribution(res.data.gap_distribution);
});

function renderGrowthChart(growth) {
  const width = 600, height = 160, padding = 24;
  const max = Math.max(...growth);
  const step = (width - padding * 2) / (growth.length - 1);
  const months = ['Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep'];

  const points = growth.map((v, i) => {
    const x = padding + i * step;
    const y = height - padding - (v / max) * (height - padding * 2);
    return `${x},${y}`;
  }).join(' ');

  const dots = growth.map((v, i) => {
    const x = padding + i * step;
    const y = height - padding - (v / max) * (height - padding * 2);
    return `<circle cx="${x}" cy="${y}" r="4" fill="#37409C"></circle>`;
  }).join('');

  const labels = months.map((m, i) => `<text x="${padding + i * step}" y="${height - 4}" font-size="10" fill="#8A8FA3" text-anchor="middle">${m}</text>`).join('');

  document.getElementById('growthChart').innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" style="width:100%; height:auto;">
      <polyline points="${points}" fill="none" stroke="#37409C" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
      ${dots}${labels}
    </svg>`;
}

function renderCareerDistribution(distribution) {
  const container = document.getElementById('careerDistribution');
  if (!distribution || distribution.length === 0) {
    container.innerHTML = '<p class="empty-state">Belum ada data.</p>';
    return;
  }
  const total = distribution.reduce((s, d) => s + d.count, 0);
  const sorted = [...distribution].sort((a, b) => b.count - a.count);

  container.innerHTML = sorted.map(d => {
    const pct = total ? Math.round((d.count / total) * 100) : 0;
    return `
      <div class="demand-row">
        <span class="name">${d.career}</span>
        <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
        <span class="value">${d.count}</span>
      </div>`;
  }).join('');
}

function renderGapDistribution(distribution) {
  const container = document.getElementById('gapDistribution');
  const classMap = { 'Critical Gap': 'is-critical', 'Moderate Gap': 'is-warning', 'Small Gap': '', 'Strong Match': 'is-success' };
  container.innerHTML = distribution.map(g => `
    <div class="demand-row">
      <span class="name">${g.label}</span>
      <div class="progress-track"><div class="progress-fill ${classMap[g.label] || ''}" style="width:${g.value}%"></div></div>
      <span class="value">${g.value}%</span>
    </div>`).join('');
}

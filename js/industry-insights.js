/**
 * SkillBridge — logika halaman Industry Insights.
 * Sudah lewat Api.industry.* — lihat js/api.js.
 * Catatan: filter "Experience Level" murni kalkulasi tampilan di FE
 * (bukan konsep di backend), sesuai desain awal fitur ini.
 */

const LEVEL_MULTIPLIER = { entry: 1, mid: 0.93, senior: 0.85 };
const TREND_ICON = { up: '▲', down: '▼', stable: '▬' };
const TREND_COLOR = { up: '#2F9E6B', down: '#C1483D', stable: '#8A8FA3' };

const GENERIC_CERTS = [
  'Sertifikasi dasar sesuai bidang (mis. cloud practitioner, data analytics)',
  'Pengalaman proyek portofolio yang bisa didemokan',
  'Kontribusi pada proyek open source atau organisasi kampus',
];

let allCareersCache = [];

document.addEventListener('DOMContentLoaded', async () => {
  const meRes = await Api.auth.me();
  if (meRes.status === 401) { window.location.href = 'login.html'; return; }

  const careerFilter = document.getElementById('careerFilter');
  const careersRes = await Api.career.list();
  allCareersCache = careersRes.data;
  allCareersCache.forEach(c => careerFilter.insertAdjacentHTML('beforeend', `<option value="${c.id}">${c.name}</option>`));
  if (meRes.data.target_career_id) careerFilter.value = meRes.data.target_career_id;

  const regionFilter = document.getElementById('regionFilter');
  REGIONS.forEach(r => regionFilter.insertAdjacentHTML('beforeend', `<option value="${r}">${r}</option>`));

  await render();
  careerFilter.addEventListener('change', render);
  regionFilter.addEventListener('change', render);
  document.getElementById('levelFilter').addEventListener('change', render);
});

async function render() {
  const careerId = document.getElementById('careerFilter').value;
  const region = document.getElementById('regionFilter').value;
  const level = document.getElementById('levelFilter').value;
  const multiplier = LEVEL_MULTIPLIER[level];

  const insightsRes = await Api.industry.list(region);
  let list = insightsRes.data;

  // GET /industry-insights cuma difilter by region di kontrak — filter by
  // career dilakukan di FE dengan join ke required_skills career terpilih.
  let career = null;
  if (careerId) {
    const careerRes = await Api.career.get(careerId);
    career = careerRes.data;
    const requiredIds = new Set(career.required_skills.map(r => r.skill_id));
    list = list.filter(i => requiredIds.has(i.skill_id));
  }

  list = list.map(i => ({ ...i, demand: Math.round(i.demand * multiplier) })).sort((a, b) => b.demand - a.demand);

  renderNarrative(list, career, region);

  const technical = list.filter(i => getSkillCategory(i.skill_id) === 'technical').slice(0, 8);
  const soft = list.filter(i => getSkillCategory(i.skill_id) === 'soft').slice(0, 8);
  const fallbackSoft = [{ skill_id: 'communication', skill_name: skillName('communication'), demand: Math.round(71 * multiplier), trend: 'stable', job_sample_size: 300 }];

  await renderDemandList('technicalDemand', technical, career);
  await renderDemandList('softDemand', soft.length ? soft : fallbackSoft, career);

  const tools = career ? career.tools : [...new Set(allCareersCache.flatMap(c => c.tools || []))].slice(0, 10);
  document.getElementById('toolsArea').innerHTML = tools.map(t => `<span class="badge badge-neutral">${t}</span>`).join('');

  document.getElementById('certList').innerHTML = GENERIC_CERTS.map(c => `<li>${c}</li>`).join('');

  const totalSample = list.reduce((sum, i) => sum + i.job_sample_size, 0);
  document.getElementById('methodologyBadge').dataset.tooltip =
    `Data disimulasikan untuk kebutuhan prototype dari kombinasi ~${totalSample} lowongan contoh, periode 3 bulan terakhir. Bukan hasil scraping data lowongan riil.`;
}

function renderNarrative(list, career, region) {
  const top = list[0];
  if (!top) return;
  const regionText = region === 'Nasional' ? 'secara nasional' : region === 'Remote' ? 'untuk posisi remote' : `di ${region}`;
  const careerText = career ? career.name : 'berbagai posisi';
  document.getElementById('narrativeSummary').innerHTML =
    `<strong>${top.skill_name}</strong> muncul di sekitar <strong>${top.demand}%</strong> dari ~${top.job_sample_size} lowongan ${careerText} yang dianalisis ${regionText} (3 bulan terakhir).`;
}

async function renderDemandList(containerId, items, career) {
  const container = document.getElementById(containerId);
  if (items.length === 0) {
    container.innerHTML = '<p class="empty-state">Belum ada data untuk kombinasi filter ini.</p>';
    return;
  }

  const trends = await Promise.all(items.map(i => Api.industry.trend(i.skill_id)));

  container.innerHTML = items.map((i, idx) => {
    const history = trends[idx].status === 200 ? trends[idx].data : [];
    const sparkline = renderSparkline(history, 70, 22, TREND_COLOR[i.trend]);
    const tooltip = `${i.skill_name} muncul di ${i.demand}% dari ~${i.job_sample_size} lowongan yang dianalisis${career ? ` untuk ${career.name}` : ''} (periode 3 bulan terakhir).`;
    return `
      <div class="demand-row info-badge" tabindex="0" data-tooltip="${tooltip}">
        <span class="name">${i.skill_name}</span>
        <div class="progress-track"><div class="progress-fill" style="width:${i.demand}%"></div></div>
        <span class="value">${i.demand}% <span class="trend-${i.trend}">${TREND_ICON[i.trend]}</span></span>
        ${sparkline}
      </div>`;
  }).join('');
}

/**
 * SkillBridge — logika halaman Career Detail.
 * Karier ditentukan lewat query string ?slug=...
 * Sudah lewat Api.* — lihat js/api.js.
 */

document.addEventListener('DOMContentLoaded', async () => {
  const meRes = await Api.auth.me();
  if (meRes.status === 401) { window.location.href = 'login.html'; return; }

  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');

  const [careerRes, mySkillsRes] = await Promise.all([Api.career.get(slug), Api.me.skills()]);

  if (careerRes.status !== 200) {
    document.getElementById('notFoundState').hidden = false;
    return;
  }
  document.getElementById('detailBody').hidden = false;

  const skillLevelMap = {};
  mySkillsRes.data.forEach(s => { skillLevelMap[s.skill_id] = s.level; });

  renderCareer(meRes.data, careerRes.data, skillLevelMap);
});

function renderCareer(profile, career, skillLevelMap) {
  document.title = `${career.name} — SkillBridge`;
  document.getElementById('careerMeta').textContent = `${career.category} · ${career.difficulty}`;
  document.getElementById('careerName').innerHTML = `${career.name} ${career.remote_friendly ? '<span class="badge badge-primary" style="vertical-align:middle;">Remote-friendly</span>' : ''}`;
  document.getElementById('careerShortDesc').textContent = career.short_description;
  document.getElementById('careerDescription').textContent = career.description;

  const respList = document.getElementById('responsibilitiesList');
  respList.innerHTML = career.responsibilities.map(r => `<li>${r}</li>`).join('');

  document.getElementById('toolsList').innerHTML = career.tools.map(t => `<span class="badge badge-neutral">${t}</span>`).join('');
  document.getElementById('demandFill').style.width = `${career.industry_demand}%`;
  document.getElementById('demandLabel').textContent = `${career.industry_demand}% dari ~${career.job_sample_size} lowongan ${career.name} yang dianalisis mencari profil seperti ini (3 bulan terakhir, Demo Data).`;

  const setGoalBtn = document.getElementById('setGoalBtn');
  const isTarget = profile.target_career_id === career.id;
  setGoalBtn.textContent = isTarget ? 'Karier Target Kamu Saat Ini' : 'Set as My Career Goal';
  setGoalBtn.disabled = isTarget;
  setGoalBtn.addEventListener('click', async () => {
    setGoalBtn.disabled = true;
    setGoalBtn.textContent = 'Menyimpan...';
    await Api.auth.updateMe({ target_career_id: career.id });
    await Api.roadmap.generate();
    window.location.href = 'skill-gap.html';
  });

  // Catatan: kategori skill (technical/soft) di sini masih dibaca dari
  // getSkillCategory() lokal karena belum ada endpoint publik daftar skill
  // (lihat catatan di js/onboarding.js). required_skills dari API belum
  // membawa field category.
  renderCompare(career, skillLevelMap, 'technical', 'technicalCompare');
  const softReq = career.required_skills.filter(r => getSkillCategory(r.skill_id) === 'soft');
  if (softReq.length === 0) {
    document.getElementById('noSoftNote').hidden = false;
  } else {
    renderCompare(career, skillLevelMap, 'soft', 'softCompare');
  }

  renderRelated(career);
}

function renderCompare(career, skillLevelMap, category, containerId) {
  const container = document.getElementById(containerId);
  const rows = career.required_skills.filter(r => getSkillCategory(r.skill_id) === category);
  container.innerHTML = rows.map(r => {
    const userLevel = skillLevelMap[r.skill_id] || 0;
    return `
      <div class="compare-row">
        <div class="compare-row-head">
          <span class="name">${r.skill_name}</span>
          <span class="text-sm text-faint">${userLevel}% / ${r.required_level}%</span>
        </div>
        <div class="compare-track">
          <div class="compare-fill-required" style="width:${r.required_level}%"></div>
          <div class="compare-fill-user" style="width:${userLevel}%"></div>
        </div>
      </div>`;
  }).join('');
}

async function renderRelated(career) {
  const res = await Api.career.list({ category: career.category });
  const related = res.data.filter(c => c.id !== career.id).slice(0, 3);
  const grid = document.getElementById('relatedGrid');
  grid.innerHTML = related.map(c => `
    <a href="career-detail.html?slug=${c.slug}" class="card-flat" style="display:block;">
      <strong>${c.name}</strong>
      <p class="text-sm mb-0">${c.short_description}</p>
    </a>`).join('') || '<p class="text-sm text-faint">Belum ada karier terkait di kategori yang sama.</p>';
}

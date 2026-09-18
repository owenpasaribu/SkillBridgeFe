/**
 * SkillBridge — logika halaman Dashboard.
 * Sudah lewat Api.* — lihat js/api.js.
 */

document.addEventListener('DOMContentLoaded', async () => {
  const meRes = await Api.auth.me();
  if (meRes.status === 401) { window.location.href = 'login.html'; return; }
  if (!meRes.data.onboarding_complete) { window.location.href = 'onboarding.html'; return; }

  const profile = meRes.data;
  const firstName = (profile.full_name || '').split(' ')[0] || 'Sobat SkillBridge';
  document.getElementById('greeting').textContent = `Halo, ${firstName}!`;

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
      ? 'Stabil dari pengecekan sebelumnya'
      : `${diff > 0 ? 'Naik' : 'Turun'} ${Math.abs(diff)}% dari sebelumnya`;
  } else {
    trendEl.textContent = 'Ini adalah perhitungan pertamamu';
  }
}

function renderSkillOverview(gaps, career) {
  const list = document.getElementById('skillOverviewList');
  list.innerHTML = '';

  if (!career || gaps.length === 0) {
    list.innerHTML = '<p class="empty-state">Belum ada data skill. Yuk kerjakan Skill Assessment dulu.</p>';
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
    [critical, moderate, strong].forEach(el => el.innerHTML = '<span class="text-faint">Belum ada target karier</span>');
    return;
  }

  const bucket = { critical: [], moderate: [], strong: [] };
  gaps.forEach(g => {
    if (g.category === 'critical') bucket.critical.push(g.skill_name);
    else if (g.category === 'moderate') bucket.moderate.push(g.skill_name);
    else bucket.strong.push(g.skill_name);
  });

  critical.innerHTML = bucket.critical.length ? bucket.critical.join(', ') : '<span class="text-faint">Tidak ada</span>';
  moderate.innerHTML = bucket.moderate.length ? bucket.moderate.join(', ') : '<span class="text-faint">Tidak ada</span>';
  strong.innerHTML = bucket.strong.length ? bucket.strong.join(', ') : '<span class="text-faint">Tidak ada</span>';
}

function renderRoadmapProgress(roadmapRes, career) {
  const titleEl = document.getElementById('roadmapTitle');
  const fillEl = document.getElementById('roadmapProgressFill');
  const labelEl = document.getElementById('roadmapProgressLabel');

  if (roadmapRes.status !== 200) {
    titleEl.textContent = 'Belum ada roadmap aktif';
    labelEl.textContent = 'Selesaikan onboarding atau kunjungi Learning Roadmap untuk membuatnya.';
    return;
  }
  const phases = roadmapRes.data.phases;
  const doneCount = phases.filter(p => p.status === 'completed').length;
  const pct = phases.length ? Math.round((doneCount / phases.length) * 100) : 0;

  titleEl.textContent = `${career ? career.name : ''} Roadmap`;
  fillEl.style.width = `${pct}%`;
  labelEl.textContent = `${pct}% selesai — ${doneCount} dari ${phases.length} fase`;
}

function renderNextAction(gaps, career) {
  const titleEl = document.getElementById('nextActionTitle');
  const bodyEl = document.getElementById('nextActionBody');

  if (!career) {
    titleEl.textContent = 'Pilih target karier untuk mulai';
    bodyEl.textContent = 'Buka Career Explorer untuk melihat pilihan karier dan skill yang dibutuhkan.';
    return;
  }

  const relevant = gaps.filter(g => g.category !== 'strong');
  if (relevant.length === 0) {
    titleEl.textContent = 'Skill kamu sudah cukup kuat!';
    bodyEl.textContent = 'Fokus selanjutnya: lengkapi Portfolio Readiness supaya makin siap melamar.';
    return;
  }
  const top = relevant[0];
  titleEl.textContent = `Prioritas tertinggi: ${top.skill_name}`;
  bodyEl.textContent = `Level kamu saat ini ${top.user_level}%, dibutuhkan ${top.required_level}% untuk ${career.name}. Mulai dari fase pertama di Learning Roadmap.`;
}

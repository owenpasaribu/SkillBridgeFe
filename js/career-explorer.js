/**
 * SkillBridge — logika halaman Career Explorer.
 * Sudah lewat Api.* — tiap filter berubah, FE minta ulang ke
 * GET /careers dengan query yang sesuai (server-side filtering).
 */

let currentTargetCareerId = null;

document.addEventListener('DOMContentLoaded', async () => {
  const meRes = await Api.auth.me();
  if (meRes.status === 401) { window.location.href = 'login.html'; return; }
  currentTargetCareerId = meRes.data.target_career_id;

  await populateFilters();
  await renderGrid();

  document.getElementById('searchInput').addEventListener('input', debounce(renderGrid, 250));
  document.getElementById('categoryFilter').addEventListener('change', renderGrid);
  document.getElementById('difficultyFilter').addEventListener('change', renderGrid);
  document.getElementById('remoteFilter').addEventListener('change', renderGrid);
});

function debounce(fn, delay) {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); };
}

async function populateFilters() {
  const res = await Api.career.list();
  const categories = [...new Set(res.data.map(c => c.category))];
  const difficulties = [...new Set(res.data.map(c => c.difficulty))];
  const categorySelect = document.getElementById('categoryFilter');
  const difficultySelect = document.getElementById('difficultyFilter');
  categories.forEach(cat => categorySelect.insertAdjacentHTML('beforeend', `<option value="${cat}">${cat}</option>`));
  difficulties.forEach(d => difficultySelect.insertAdjacentHTML('beforeend', `<option value="${d}">${d}</option>`));
}

async function renderGrid() {
  const search = document.getElementById('searchInput').value.toLowerCase().trim();
  const category = document.getElementById('categoryFilter').value;
  const difficulty = document.getElementById('difficultyFilter').value;
  const remoteOnly = document.getElementById('remoteFilter').checked;

  const res = await Api.career.list({ category, difficulty, remote_friendly: remoteOnly || undefined });
  // Pencarian nama masih di FE karena dokumen kontrak GET /careers belum
  // mendukung parameter search — tolong diomongin ke tim BE kalau butuh.
  const filtered = res.data.filter(c => c.name.toLowerCase().includes(search));

  const grid = document.getElementById('careerGrid');
  const emptyState = document.getElementById('emptyState');
  grid.innerHTML = '';
  emptyState.hidden = filtered.length > 0;

  filtered.forEach(career => {
    const isTarget = currentTargetCareerId === career.id;
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="flex-between" style="align-items:flex-start;">
        <div>
          <p class="card-eyebrow">${career.category} · ${career.difficulty}</p>
          <h3 style="margin-bottom:6px;">${career.name}</h3>
        </div>
        ${isTarget ? '<span class="badge badge-primary">Target Kamu</span>' : ''}
        ${career.remote_friendly ? '<span class="badge badge-neutral">Remote-friendly</span>' : ''}
      </div>
      <p class="text-sm">${career.short_description}</p>
      <div class="explorer-card-foot">
        <span class="text-sm text-faint">Demand: ${career.industry_demand}%</span>
        <a href="career-detail.html?slug=${career.slug}" class="btn btn-ghost btn-sm">Lihat Detail</a>
      </div>`;
    grid.appendChild(card);
  });
}

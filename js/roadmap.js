/**
 * SkillBridge — logika halaman Learning Roadmap.
 * Sudah lewat Api.roadmap.* — lihat js/api.js.
 */

let currentPhases = [];

document.addEventListener('DOMContentLoaded', async () => {
  const meRes = await Api.auth.me();
  if (meRes.status === 401) { window.location.href = 'login.html'; return; }

  if (!meRes.data.target_career_id) {
    document.getElementById('noCareerState').hidden = false;
    return;
  }
  const careerRes = await Api.career.get(meRes.data.target_career_id);
  const career = careerRes.data;
  document.getElementById('pageSub').textContent = `Your roadmap to becoming a ${career.name}.`;

  const roadmapRes = await Api.roadmap.get();

  if (roadmapRes.status !== 200) {
    document.getElementById('noRoadmapState').hidden = false;
    document.getElementById('generateBtn').addEventListener('click', async () => {
      await Api.roadmap.generate();
      window.location.reload();
    });
    return;
  }

  if (roadmapRes.data.target_career_id !== career.id) {
    document.getElementById('staleState').hidden = false;
    document.getElementById('regenerateBtn').addEventListener('click', async () => {
      await Api.roadmap.generate();
      window.location.reload();
    });
  }

  document.getElementById('roadmapBody').hidden = false;
  document.getElementById('roadmapCareerLabel').textContent = career.name;
  currentPhases = roadmapRes.data.phases;
  renderRoadmap();
});

function renderRoadmap() {
  const doneCount = currentPhases.filter(p => p.status === 'completed').length;
  const pct = currentPhases.length ? Math.round((doneCount / currentPhases.length) * 100) : 0;
  document.getElementById('roadmapProgressLabel').textContent = `${pct}% complete (${doneCount}/${currentPhases.length} phases)`;
  document.getElementById('roadmapProgressFill').style.width = `${pct}%`;

  const list = document.getElementById('phaseList');
  list.innerHTML = currentPhases.map((phase, index) => {
    const isDone = phase.status === 'completed';
    const resourcesHtml = phase.resources.length
      ? `<ul class="resource-list">${phase.resources.map(r => `<li>${r.title} — <span class="text-faint">${r.provider}</span></li>`).join('')}</ul>`
      : '<p class="text-sm text-faint">No specific resources for this phase yet.</p>';
    const tasksHtml = phase.tasks.length ? `<ul class="text-sm">${phase.tasks.map(t => `<li>${t}</li>`).join('')}</ul>` : '';

    return `
      <div class="accordion-item" data-index="${index}">
        <div class="accordion-head" data-toggle="${index}">
          <div class="accordion-head-left">
            <div class="phase-index ${isDone ? 'is-done' : ''}">${isDone ? '✓' : index + 1}</div>
            <div>
              <strong>Phase ${index + 1} — ${phase.title}</strong>
              <div class="text-sm text-faint">${phase.duration_days} days · Priority ${phase.priority} · ${statusLabel(phase.status)}</div>
            </div>
          </div>
          <svg class="accordion-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="#5F5646" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
        <div class="accordion-body">
          <h4>Learning Objective</h4>
          <p class="text-sm">${phase.learning_objective}</p>
          <h4>Why This Skill Matters</h4>
          <p class="text-sm">${phase.why}</p>
          <h4>Resources</h4>
          ${resourcesHtml}
          ${tasksHtml ? `<h4>Tasks</h4>${tasksHtml}` : ''}
          <h4>Mini Project</h4>
          <p class="text-sm">${phase.mini_project}</p>
          <h4>What You'll Be Able To Do After</h4>
          <p class="text-sm">${phase.after_text}</p>
          <div class="phase-actions">
            ${phase.status === 'not_started' ? `<button class="btn btn-primary btn-sm" data-start="${phase.id}">Start Module</button>` : ''}
            ${phase.status === 'in_progress' ? `<button class="btn btn-primary btn-sm" data-complete="${phase.id}">Mark Complete</button>` : ''}
            ${phase.status === 'completed' ? `<span class="badge badge-success">Completed</span>` : ''}
          </div>
        </div>
      </div>`;
  }).join('');

  list.querySelectorAll('[data-toggle]').forEach(head => {
    head.addEventListener('click', () => head.closest('.accordion-item').classList.toggle('is-open'));
  });
  list.querySelectorAll('[data-start]').forEach(btn => {
    btn.addEventListener('click', (e) => { e.stopPropagation(); updatePhaseStatus(Number(btn.dataset.start), 'in_progress'); });
  });
  list.querySelectorAll('[data-complete]').forEach(btn => {
    btn.addEventListener('click', (e) => { e.stopPropagation(); updatePhaseStatus(Number(btn.dataset.complete), 'completed'); });
  });
}

function statusLabel(status) {
  return { not_started: 'Not started', in_progress: 'In progress', completed: 'Completed' }[status] || status;
}

async function updatePhaseStatus(phaseId, status) {
  const res = await Api.roadmap.updatePhase(phaseId, status);
  if (res.status !== 200) { alert(res.message); return; }
  const phase = currentPhases.find(p => p.id === phaseId);
  if (phase) phase.status = status;
  renderRoadmap();
}

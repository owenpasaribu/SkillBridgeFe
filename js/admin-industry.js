/**
 * SkillBridge — Admin: Industry Data Management (CRUD).
 * Sudah lewat Api.admin.industryInsights.* — lihat js/api.js.
 * Catatan: dokumen kontrak cuma contohkan GET & POST (upsert by skill_id)
 * untuk endpoint ini. DELETE /admin/industry-insights/:skill_id dipakai
 * di sini untuk kelengkapan CRUD — tolong dikonfirmasi ke tim BE apakah
 * mau ditambahkan atau dihilangkan saja dari kebutuhan admin.
 */

let editingInsightSkillId = null;
let skillsCache = [];

const TREND_LABEL = { up: 'Rising', down: 'Falling', stable: 'Stable' };

document.addEventListener('DOMContentLoaded', async () => {
  const insightsRes = await Api.admin.industryInsights.list();
  if (insightsRes.status === 401) { window.location.href = 'login.html'; return; }

  const skillsRes = await Api.admin.skills.list();
  skillsCache = skillsRes.data;

  renderTable(insightsRes.data);
  document.getElementById('addInsightBtn').addEventListener('click', () => openForm(null));
  document.getElementById('cancelFormBtn').addEventListener('click', closeForm);
  document.getElementById('saveInsightBtn').addEventListener('click', saveInsight);
});

async function reloadTable() {
  const res = await Api.admin.industryInsights.list();
  renderTable(res.data);
}

function renderTable(insights) {
  const tbody = document.getElementById('insightTableBody');
  const sorted = [...insights].sort((a, b) => b.demand - a.demand);
  tbody.innerHTML = sorted.map(i => `
    <tr>
      <td><strong>${i.skill_name}</strong></td>
      <td>${i.demand}%</td>
      <td>${i.job_sample_size ?? '-'}</td>
      <td><span class="badge ${i.trend === 'up' ? 'badge-success' : i.trend === 'down' ? 'badge-critical' : 'badge-neutral'}">${TREND_LABEL[i.trend]}</span></td>
      <td class="action-cell">
        <button class="btn btn-ghost btn-sm" data-edit="${i.skill_id}">Edit</button>
        <button class="btn btn-danger btn-sm" data-delete="${i.skill_id}">Delete</button>
      </td>
    </tr>`).join('');

  tbody.querySelectorAll('[data-edit]').forEach(btn => {
    btn.addEventListener('click', () => openForm(insights.find(i => i.skill_id === btn.dataset.edit)));
  });
  tbody.querySelectorAll('[data-delete]').forEach(btn => {
    btn.addEventListener('click', () => deleteInsight(btn.dataset.delete));
  });
}

function openForm(insight) {
  editingInsightSkillId = insight ? insight.skill_id : null;
  document.getElementById('formTitle').textContent = insight ? `Edit — ${insight.skill_name}` : 'Add Skill Data';

  const skillSelect = document.getElementById('f-skill');
  skillSelect.innerHTML = skillsCache.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
  skillSelect.disabled = !!insight;
  if (insight) skillSelect.value = insight.skill_id;

  document.getElementById('f-demand').value = insight ? insight.demand : 50;
  document.getElementById('f-trend').value = insight ? insight.trend : 'stable';
  document.getElementById('f-samplesize').value = insight ? (insight.job_sample_size ?? 200) : 200;
  document.getElementById('f-period').value = insight ? (insight.period || 'Last 3 months') : 'Last 3 months';

  const panel = document.getElementById('formPanel');
  panel.classList.add('is-open');
  panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function closeForm() {
  document.getElementById('formPanel').classList.remove('is-open');
  document.getElementById('f-skill').disabled = false;
  editingInsightSkillId = null;
}

async function saveInsight() {
  const body = {
    skill_id: document.getElementById('f-skill').value,
    demand: Number(document.getElementById('f-demand').value) || 0,
    trend: document.getElementById('f-trend').value,
    job_sample_size: Number(document.getElementById('f-samplesize').value) || 0,
    period: document.getElementById('f-period').value.trim() || 'Last 3 months',
  };

  const res = await Api.admin.industryInsights.save(body);
  if (res.status !== 200) { alert(res.message); return; }
  closeForm();
  reloadTable();
}

async function deleteInsight(skillId) {
  if (!confirm('Delete the demand data for this skill?')) return;
  const res = await Api.admin.industryInsights.remove(skillId);
  if (res.status !== 200) { alert(res.message); return; }
  reloadTable();
}

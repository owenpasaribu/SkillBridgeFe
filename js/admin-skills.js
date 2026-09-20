/**
 * SkillBridge — Admin: Skill Management (CRUD).
 * Sudah lewat Api.admin.skills.* — lihat js/api.js.
 */

let editingSkillId = null;
let usageCountMap = {};

document.addEventListener('DOMContentLoaded', async () => {
  const skillsRes = await Api.admin.skills.list();
  if (skillsRes.status === 401) { window.location.href = 'login.html'; return; }

  await computeUsageCounts();
  renderTable(skillsRes.data);

  document.getElementById('addSkillBtn').addEventListener('click', () => openForm(null));
  document.getElementById('cancelFormBtn').addEventListener('click', closeForm);
  document.getElementById('saveSkillBtn').addEventListener('click', saveSkill);
});

/**
 * Catatan performa: GET /admin/careers (list) cuma balas
 * required_skills_count, bukan detail skill-nya, jadi untuk tahu skill
 * mana dipakai di career mana kita fetch detail tiap career satu-satu
 * (N+1). Wajar untuk jumlah career yang masih kecil di prototype ini;
 * kalau career sudah banyak, sebaiknya diusulkan endpoint agregat baru
 * ke tim BE, mis. GET /admin/skills/usage-count.
 */
async function computeUsageCounts() {
  const careersRes = await Api.admin.careers.list();
  const details = await Promise.all(careersRes.data.map(c => Api.career.get(c.id)));
  usageCountMap = {};
  details.forEach(res => {
    (res.data.required_skills || []).forEach(r => {
      usageCountMap[r.skill_id] = (usageCountMap[r.skill_id] || 0) + 1;
    });
  });
}

async function reloadTable() {
  const res = await Api.admin.skills.list();
  await computeUsageCounts();
  renderTable(res.data);
}

function renderTable(skills) {
  const tbody = document.getElementById('skillTableBody');
  tbody.innerHTML = skills.map(s => `
    <tr>
      <td><strong>${s.name}</strong></td>
      <td><span class="badge badge-neutral">${s.category === 'technical' ? 'Technical' : 'Soft Skill'}</span></td>
      <td>${usageCountMap[s.id] || 0} career</td>
      <td class="action-cell">
        <button class="btn btn-ghost btn-sm" data-edit="${s.id}">Edit</button>
        <button class="btn btn-danger btn-sm" data-delete="${s.id}">Delete</button>
      </td>
    </tr>`).join('');

  tbody.querySelectorAll('[data-edit]').forEach(btn => {
    btn.addEventListener('click', () => openForm(skills.find(s => s.id === btn.dataset.edit)));
  });
  tbody.querySelectorAll('[data-delete]').forEach(btn => {
    btn.addEventListener('click', () => deleteSkill(btn.dataset.delete));
  });
}

function openForm(skill) {
  editingSkillId = skill ? skill.id : null;
  document.getElementById('formTitle').textContent = skill ? `Edit — ${skill.name}` : 'Add Skill';
  document.getElementById('f-skillname').value = skill ? skill.name : '';
  document.getElementById('f-skillcategory').value = skill ? skill.category : 'technical';
  const panel = document.getElementById('formPanel');
  panel.classList.add('is-open');
  panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function closeForm() {
  document.getElementById('formPanel').classList.remove('is-open');
  editingSkillId = null;
}

async function saveSkill() {
  const name = document.getElementById('f-skillname').value.trim();
  if (!name) { alert('Skill name is required.'); return; }
  const category = document.getElementById('f-skillcategory').value;

  const res = editingSkillId
    ? await Api.admin.skills.update(editingSkillId, { name, category })
    : await Api.admin.skills.create({ name, category });

  if (res.status !== 200 && res.status !== 201) { alert(res.message); return; }
  closeForm();
  reloadTable();
}

async function deleteSkill(id) {
  const used = usageCountMap[id] || 0;
  const msg = used > 0
    ? `This skill is used in ${used} career(s). Deleting it will not remove the requirement from those careers, but the skill name will no longer appear. Continue?`
    : 'Delete this skill?';
  if (!confirm(msg)) return;
  await Api.admin.skills.remove(id);
  reloadTable();
}

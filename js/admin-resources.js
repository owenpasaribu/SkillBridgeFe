/**
 * SkillBridge — Admin: Learning Resource Management (CRUD).
 * Sudah lewat Api.admin.learningResources.* — lihat js/api.js.
 */

let editingResourceId = null;
let skillsCache = [];

document.addEventListener('DOMContentLoaded', async () => {
  const skillsRes = await Api.admin.skills.list();
  if (skillsRes.status === 401) { window.location.href = 'login.html'; return; }
  skillsCache = skillsRes.data;

  const skillFilter = document.getElementById('skillFilter');
  skillsCache.forEach(s => skillFilter.insertAdjacentHTML('beforeend', `<option value="${s.id}">${s.name}</option>`));
  skillFilter.addEventListener('change', renderTable);

  await renderTable();
  document.getElementById('addResourceBtn').addEventListener('click', () => openForm(null));
  document.getElementById('cancelFormBtn').addEventListener('click', closeForm);
  document.getElementById('saveResourceBtn').addEventListener('click', saveResource);
});

async function renderTable() {
  const filterSkill = document.getElementById('skillFilter').value;
  const res = await Api.admin.learningResources.list(filterSkill || undefined);
  const list = res.data;

  const tbody = document.getElementById('resourceTableBody');
  if (list.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5"><p class="empty-state">Belum ada resource.</p></td></tr>';
    return;
  }

  tbody.innerHTML = list.map(r => `
    <tr>
      <td>${skillName(r.skill_id)}</td>
      <td>${r.title}</td>
      <td>${r.provider}</td>
      <td><span class="badge badge-neutral">${r.type}</span></td>
      <td class="action-cell">
        <button class="btn btn-ghost btn-sm" data-edit="${r.id}">Edit</button>
        <button class="btn btn-danger btn-sm" data-delete="${r.id}">Hapus</button>
      </td>
    </tr>`).join('');

  tbody.querySelectorAll('[data-edit]').forEach(btn => {
    btn.addEventListener('click', () => openForm(list.find(r => String(r.id) === btn.dataset.edit)));
  });
  tbody.querySelectorAll('[data-delete]').forEach(btn => {
    btn.addEventListener('click', () => deleteResource(btn.dataset.delete));
  });
}

function openForm(resource) {
  editingResourceId = resource ? resource.id : null;
  document.getElementById('formTitle').textContent = resource ? 'Edit Resource' : 'Tambah Resource';

  const skillSelect = document.getElementById('f-skill');
  skillSelect.innerHTML = skillsCache.map(s => `<option value="${s.id}">${s.name}</option>`).join('');

  document.getElementById('f-skill').value = resource ? resource.skill_id : skillsCache[0]?.id;
  document.getElementById('f-title').value = resource ? resource.title : '';
  document.getElementById('f-provider').value = resource ? resource.provider : '';
  document.getElementById('f-type').value = resource ? resource.type : 'course';

  const panel = document.getElementById('formPanel');
  panel.classList.add('is-open');
  panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function closeForm() {
  document.getElementById('formPanel').classList.remove('is-open');
  editingResourceId = null;
}

async function saveResource() {
  const title = document.getElementById('f-title').value.trim();
  if (!title) { alert('Judul resource wajib diisi.'); return; }

  const body = {
    skill_id: document.getElementById('f-skill').value,
    title,
    provider: document.getElementById('f-provider').value.trim() || 'Tidak diketahui',
    type: document.getElementById('f-type').value,
  };

  const res = editingResourceId
    ? await Api.admin.learningResources.update(editingResourceId, body)
    : await Api.admin.learningResources.create(body);

  if (res.status !== 200 && res.status !== 201) { alert(res.message); return; }
  closeForm();
  renderTable();
}

async function deleteResource(id) {
  if (!confirm('Hapus resource ini?')) return;
  await Api.admin.learningResources.remove(id);
  renderTable();
}

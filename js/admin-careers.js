/**
 * SkillBridge — Admin: Career Management (CRUD).
 * Sudah lewat Api.admin.careers.* — lihat js/api.js. Perubahan di sini
 * langsung terlihat di Career Explorer, Career Detail, Skill Gap, dan
 * Roadmap sisi student.
 *
 * Catatan: GET /admin/careers (list) tidak membawa required_skills penuh
 * (cuma required_skills_count, sesuai contoh di dokumen kontrak). Untuk
 * form edit, kita pakai GET /careers/:slug (endpoint publik) yang
 * sudah membawa required_skills lengkap — id career sama dengan slug
 * di sistem ini, jadi aman dipakai.
 */

const IMPORTANCE_OPTIONS = ['low', 'medium', 'high', 'critical'];

let editingCareerId = null;
let skillReqDraft = [];
let skillsCache = [];

document.addEventListener('DOMContentLoaded', async () => {
  const listRes = await Api.admin.careers.list();
  if (listRes.status === 401) { window.location.href = 'login.html'; return; }

  const skillsRes = await Api.admin.skills.list();
  skillsCache = skillsRes.data;

  renderTable(listRes.data);

  document.getElementById('addCareerBtn').addEventListener('click', () => openForm(null));
  document.getElementById('cancelFormBtn').addEventListener('click', closeForm);
  document.getElementById('addSkillReqBtn').addEventListener('click', addSkillReqRow);
  document.getElementById('saveCareerBtn').addEventListener('click', saveCareer);
});

async function reloadTable() {
  const res = await Api.admin.careers.list();
  renderTable(res.data);
}

function renderTable(careers) {
  const tbody = document.getElementById('careerTableBody');
  tbody.innerHTML = careers.map(c => `
    <tr>
      <td><strong>${c.name}</strong></td>
      <td>${c.category}</td>
      <td>${c.difficulty}</td>
      <td>${c.industry_demand}% ${c.remote_friendly ? '<span class="badge badge-neutral">Remote</span>' : ''}</td>
      <td>${c.required_skills_count} skill</td>
      <td class="action-cell">
        <button class="btn btn-ghost btn-sm" data-edit="${c.id}">Edit</button>
        <button class="btn btn-danger btn-sm" data-delete="${c.id}">Hapus</button>
      </td>
    </tr>`).join('');

  tbody.querySelectorAll('[data-edit]').forEach(btn => {
    btn.addEventListener('click', () => openFormById(btn.dataset.edit));
  });
  tbody.querySelectorAll('[data-delete]').forEach(btn => {
    btn.addEventListener('click', () => deleteCareer(btn.dataset.delete));
  });
}

async function openFormById(id) {
  const res = await Api.career.get(id); // lihat catatan di atas file
  openForm(res.data);
}

function openForm(career) {
  editingCareerId = career ? career.id : null;
  document.getElementById('formTitle').textContent = career ? `Edit — ${career.name}` : 'Tambah Career';

  document.getElementById('f-name').value = career ? career.name : '';
  document.getElementById('f-category').value = career ? career.category : '';
  document.getElementById('f-difficulty').value = career ? career.difficulty : '';
  document.getElementById('f-demand').value = career ? career.industry_demand : 50;
  document.getElementById('f-samplesize').value = career ? career.job_sample_size : 200;
  document.getElementById('f-remote').value = career ? String(!!career.remote_friendly) : 'true';
  document.getElementById('f-shortdesc').value = career ? career.short_description : '';
  document.getElementById('f-desc').value = career ? career.description : '';
  document.getElementById('f-resp').value = career ? career.responsibilities.join('\n') : '';
  document.getElementById('f-tools').value = career ? career.tools.join(', ') : '';

  skillReqDraft = career
    ? career.required_skills.map(r => ({ skillId: r.skill_id, level: r.required_level, importance: r.importance }))
    : [];
  renderSkillReqRows();

  const panel = document.getElementById('formPanel');
  panel.classList.add('is-open');
  panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function closeForm() {
  document.getElementById('formPanel').classList.remove('is-open');
  editingCareerId = null;
  skillReqDraft = [];
}

function renderSkillReqRows() {
  const area = document.getElementById('skillReqArea');

  if (skillReqDraft.length === 0) {
    area.innerHTML = '<p class="text-sm text-faint">Belum ada skill requirement. Tambahkan minimal satu.</p>';
    return;
  }

  area.innerHTML = skillReqDraft.map((req, i) => `
    <div class="skill-req-row" data-index="${i}">
      <select data-field="skillId" data-index="${i}">
        ${skillsCache.map(s => `<option value="${s.id}" ${s.id === req.skillId ? 'selected' : ''}>${s.name}</option>`).join('')}
      </select>
      <input type="number" min="0" max="100" data-field="level" data-index="${i}" value="${req.level}" placeholder="Level %">
      <select data-field="importance" data-index="${i}">
        ${IMPORTANCE_OPTIONS.map(imp => `<option value="${imp}" ${imp === req.importance ? 'selected' : ''}>${imp}</option>`).join('')}
      </select>
      <button type="button" class="icon-btn" data-remove="${i}" title="Hapus baris ini">✕</button>
    </div>`).join('');

  area.querySelectorAll('[data-field]').forEach(input => {
    input.addEventListener('change', () => {
      const i = Number(input.dataset.index);
      const field = input.dataset.field;
      skillReqDraft[i][field] = field === 'level' ? Number(input.value) : input.value;
    });
  });
  area.querySelectorAll('[data-remove]').forEach(btn => {
    btn.addEventListener('click', () => {
      skillReqDraft.splice(Number(btn.dataset.remove), 1);
      renderSkillReqRows();
    });
  });
}

function addSkillReqRow() {
  if (skillsCache.length === 0) return;
  skillReqDraft.push({ skillId: skillsCache[0].id, level: 50, importance: 'medium' });
  renderSkillReqRows();
}

async function saveCareer() {
  const name = document.getElementById('f-name').value.trim();
  if (!name) { alert('Nama career wajib diisi.'); return; }
  if (skillReqDraft.length === 0) { alert('Tambahkan minimal satu skill requirement.'); return; }

  const responsibilities = document.getElementById('f-resp').value.split('\n').map(s => s.trim()).filter(Boolean);
  const tools = document.getElementById('f-tools').value.split(',').map(s => s.trim()).filter(Boolean);

  const body = {
    name,
    category: document.getElementById('f-category').value.trim() || 'Umum',
    difficulty: document.getElementById('f-difficulty').value.trim() || 'Intermediate',
    industry_demand: Number(document.getElementById('f-demand').value) || 0,
    job_sample_size: Number(document.getElementById('f-samplesize').value) || 0,
    remote_friendly: document.getElementById('f-remote').value === 'true',
    short_description: document.getElementById('f-shortdesc').value.trim(),
    description: document.getElementById('f-desc').value.trim(),
    responsibilities,
    tools,
    required_skills: skillReqDraft.map(r => ({ skill_id: r.skillId, level: r.level, importance: r.importance })),
  };

  const res = editingCareerId
    ? await Api.admin.careers.update(editingCareerId, body)
    : await Api.admin.careers.create(body);

  if (res.status !== 200 && res.status !== 201) { alert(res.message); return; }

  closeForm();
  reloadTable();
}

async function deleteCareer(id) {
  if (!confirm('Hapus career ini? Skill gap dan roadmap student yang menargetkan career ini akan kosong sampai mereka memilih target baru.')) return;
  await Api.admin.careers.remove(id);
  reloadTable();
}

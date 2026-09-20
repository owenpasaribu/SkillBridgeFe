/**
 * SkillBridge — Admin: User Management.
 * Sudah lewat Api.admin.users.list() — read-only sesuai dokumen kontrak
 * (fitur "List user (read-only)"), jadi tidak ada aksi hapus di sini.
 */

document.addEventListener('DOMContentLoaded', async () => {
  const res = await Api.admin.users.list();
  if (res.status === 401) { window.location.href = 'login.html'; return; }
  renderTable(res.data);
});

function renderTable(users) {
  const tbody = document.getElementById('userTableBody');
  if (users.length === 0) {
    tbody.innerHTML = '<tr><td colspan="3"><p class="empty-state">No registered users yet.</p></td></tr>';
    return;
  }
  tbody.innerHTML = users.map(u => `
    <tr>
      <td><strong>${u.full_name || '(no name)'}</strong></td>
      <td>${u.target_career || '-'}</td>
      <td>${u.readiness_score !== null ? `${u.readiness_score}%` : '<span class="text-faint">-</span>'}</td>
    </tr>`).join('');
}

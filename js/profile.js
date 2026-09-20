/**
 * SkillBridge — logika halaman Profile & Settings.
 * Sudah lewat Api.* — lihat js/api.js.
 */

document.addEventListener('DOMContentLoaded', async () => {
  const meRes = await Api.auth.me();
  if (meRes.status === 401) { window.location.href = 'login.html'; return; }

  fillForm(meRes.data);
  document.getElementById('profileForm').addEventListener('submit', (e) => { e.preventDefault(); saveProfile(); });
  document.getElementById('saveTimelineBtn').addEventListener('click', saveTimeline);
  document.getElementById('logoutBtn').addEventListener('click', async () => {
    await Api.auth.logout();
    clearAuthToken();
    window.location.href = 'index.html';
  });
  // Di mode live belum ada endpoint hapus akun di backend, jadi bagian
  // "Zona Berbahaya" (yang hanya menghapus data lokal di browser) disembunyikan.
  if (typeof isLiveMode === 'function' && isLiveMode()) {
    const resetCard = document.getElementById('resetBtn').closest('.card');
    if (resetCard) resetCard.style.display = 'none';
  }
  document.getElementById('resetBtn').addEventListener('click', () => {
    if (confirm('Are you sure you want to delete all data and sign out? This cannot be undone.')) {
      // Ini beda dari logout biasa — benar-benar menghapus data akun,
      // bukan cuma mengakhiri sesi. Belum ada endpoint "hapus akun" di
      // dokumen kontrak, jadi masih pakai fungsi lokal langsung.
      logout();
    }
  });
});

function fillForm(profile) {
  document.getElementById('avatarCircle').textContent = initials(profile.full_name);
  document.getElementById('p-fullName').value = profile.full_name || '';
  document.getElementById('p-email').value = profile.email || '';
  document.getElementById('p-university').value = profile.university || '';
  document.getElementById('p-major').value = profile.major || '';
  document.getElementById('p-semester').value = profile.semester || '';
  document.getElementById('p-gradYear').value = profile.graduation_year || '';
  document.getElementById('p-timeline').value = profile.target_timeline_months || '';
  document.getElementById('currentCareerLine').dataset.careerId = profile.target_career_id || '';

  if (profile.target_career_id) {
    Api.career.get(profile.target_career_id).then(res => {
      document.getElementById('currentCareerLine').textContent = `Your current target: ${res.data.name}.`;
    });
  } else {
    document.getElementById('currentCareerLine').textContent = 'You have not set a target career yet.';
  }
}

async function saveProfile() {
  const res = await Api.auth.updateMe({
    full_name: document.getElementById('p-fullName').value.trim(),
    university: document.getElementById('p-university').value.trim(),
    major: document.getElementById('p-major').value.trim(),
    semester: document.getElementById('p-semester').value,
    graduation_year: document.getElementById('p-gradYear').value,
  });
  if (res.status !== 200) { alert(res.message); return; }
  showToast();
}

async function saveTimeline() {
  const months = Number(document.getElementById('p-timeline').value) || null;
  const res = await Api.auth.updateMe({ target_timeline_months: months });
  if (res.status !== 200) { alert(res.message); return; }
  showToast();
}

function showToast() {
  const toast = document.getElementById('saveToast');
  toast.classList.add('is-visible');
  setTimeout(() => toast.classList.remove('is-visible'), 2000);
}

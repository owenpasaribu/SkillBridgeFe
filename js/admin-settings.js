/**
 * SkillBridge — Admin: Settings (bobot formula Career Readiness Score
 * + mode Industry Insight). Sudah lewat Api.admin.* — lihat js/api.js.
 */

const WEIGHT_FIELDS = ['technical', 'soft', 'portfolio', 'experience', 'assessment'];

document.addEventListener('DOMContentLoaded', async () => {
  const weightsRes = await Api.admin.scoringSettings.get();
  if (weightsRes.status === 401) { window.location.href = 'login.html'; return; }

  fillForm(weightsRes.data);
  WEIGHT_FIELDS.forEach(f => document.getElementById(`w-${f}`).addEventListener('input', updateTotal));
  updateTotal();

  // Mode Industry Insight belum ada getter khusus di dokumen kontrak
  // (cuma PATCH untuk set), jadi baca nilai awalnya langsung dari
  // admin content lokal untuk mengisi tampilan form.
  document.getElementById('insightModeSelect').value = getAdminContent().industryInsightMode;
  document.getElementById('saveModeBtn').addEventListener('click', saveInsightMode);

  document.getElementById('saveWeightsBtn').addEventListener('click', saveWeights);
  document.getElementById('resetWeightsBtn').addEventListener('click', () => {
    fillForm(defaultAdminContent().scoringWeights);
    updateTotal();
  });
  document.getElementById('resetAllBtn').addEventListener('click', resetAll);
});

function fillForm(weights) {
  WEIGHT_FIELDS.forEach(f => {
    document.getElementById(`w-${f}`).value = Math.round(weights[f] * 100);
  });
}

function currentTotal() {
  return WEIGHT_FIELDS.reduce((sum, f) => sum + (Number(document.getElementById(`w-${f}`).value) || 0), 0);
}

function updateTotal() {
  const total = currentTotal();
  const box = document.getElementById('weightTotal');
  box.textContent = `Total saat ini: ${total}%`;
  box.className = `weight-total ${total === 100 ? 'is-ok' : 'is-off'}`;
}

async function saveWeights() {
  const total = currentTotal();
  if (total !== 100) {
    alert('Total bobot harus tepat 100% sebelum disimpan.');
    return;
  }
  const body = {};
  WEIGHT_FIELDS.forEach(f => { body[f] = Number(document.getElementById(`w-${f}`).value) / 100; });

  const res = await Api.admin.scoringSettings.update(body);
  if (res.status !== 200) { alert(res.message); return; }
  showToast();
}

async function saveInsightMode() {
  const mode = document.getElementById('insightModeSelect').value;
  const res = await Api.admin.settings.setIndustryInsightMode(mode);
  if (res.status !== 200) { alert(res.message); return; }
  showToast();
}

function resetAll() {
  if (!confirm('Reset semua data yang dikelola admin (career, skill, industry data, learning resource, bobot skor) ke kondisi awal?')) return;
  // Catatan: ini utilitas khusus mock/demo untuk reset localStorage —
  // tidak ada endpoint "reset semua data" di dokumen kontrak BE.
  const fresh = resetAdminContent();
  fillForm(fresh.scoringWeights);
  document.getElementById('insightModeSelect').value = fresh.industryInsightMode;
  updateTotal();
  showToast();
}

function showToast() {
  const toast = document.getElementById('saveToast');
  toast.classList.add('is-visible');
  setTimeout(() => toast.classList.remove('is-visible'), 2000);
}

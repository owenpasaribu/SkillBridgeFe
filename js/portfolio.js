/**
 * SkillBridge — logika halaman Portfolio Readiness.
 * Sudah lewat Api.portfolio.* — lihat js/api.js. Catatan arsitektur:
 * analisis GitHub tetap memakai data publik GitHub asli, cuma nanti
 * titik pemanggilannya pindah dari FE ke BE (lihat komentar di
 * api-mock.js bagian mockAnalyzeGithub).
 */

const RECOMMENDATION_BY_CATEGORY = {
  'Technical Skills': 'Lengkapi dulu skill teknis yang masih di bawah 80% dari level yang dibutuhkan lewat Skill Assessment.',
  'Portfolio': 'Bangun satu proyek end-to-end untuk meningkatkan portfolio readiness kamu.',
  'Experience': 'Cari pengalaman magang atau kontribusi open source untuk memperkuat bagian ini.',
  'Career Documents': 'Siapkan CV dan website portofolio supaya mudah dibagikan ke recruiter.',
  'Certifications': 'Tambahkan sertifikat yang relevan dengan target karier kamu di bagian atas.',
};

document.addEventListener('DOMContentLoaded', async () => {
  const meRes = await Api.auth.me();
  if (meRes.status === 401) { window.location.href = 'login.html'; return; }

  await render();
  await renderCertList();

  if (meRes.data.github_username) document.getElementById('githubUsername').value = meRes.data.github_username;

  document.getElementById('analyzeGithubBtn').addEventListener('click', analyzeGithub);
  document.getElementById('addCertBtn').addEventListener('click', addCertificate);
});

async function render() {
  const res = await Api.portfolio.get();
  const result = res.data;
  document.getElementById('overallScore').textContent = `${result.overall}%`;

  const weakest = [...result.groups].sort((a, b) => a.percent - b.percent)[0];
  document.getElementById('recommendation').textContent = weakest
    ? RECOMMENDATION_BY_CATEGORY[weakest.category]
    : 'Kesiapan portofolio kamu sudah cukup merata di semua kategori.';

  const area = document.getElementById('categoriesArea');
  area.innerHTML = result.groups.map(group => {
    const isTechnical = group.category === 'Technical Skills';
    const isCertifications = group.category === 'Certifications';

    let bodyHtml;
    if (isCertifications) {
      bodyHtml = `<p class="text-sm text-faint mb-0">${group.items.length} sertifikat ditambahkan — kelola di bagian "Sertifikat" di atas.</p>`;
    } else {
      const itemsHtml = group.items.map(item => `
        <li class="${item.done ? 'is-done' : ''}">
          ${isTechnical
            ? `<span>${item.done ? '✓' : '✗'}</span><span>${item.label}</span>`
            : `<input type="checkbox" data-item="${item.id}" ${item.done ? 'checked' : ''}><span>${item.label}</span>`}
        </li>`).join('') || '<li><span class="text-faint">Belum ada target karier untuk menghitung ini.</span></li>';
      bodyHtml = `<ul class="checklist">${itemsHtml}</ul>`;
    }

    return `
      <div class="card category-card">
        <div class="category-head">
          <h3 style="margin:0;">${group.category}</h3>
          <span class="badge ${group.percent >= 70 ? 'badge-success' : group.percent >= 40 ? 'badge-warning' : 'badge-critical'}">${group.percent}%</span>
        </div>
        ${bodyHtml}
      </div>`;
  }).join('');

  area.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', async () => {
      await Api.portfolio.toggleChecklist(cb.dataset.item, cb.checked);
      render();
    });
  });
}

/* ---------------- GitHub validation ---------------- */

async function analyzeGithub() {
  const username = document.getElementById('githubUsername').value.trim();
  const resultBox = document.getElementById('githubResult');
  const btn = document.getElementById('analyzeGithubBtn');

  if (!username) {
    resultBox.innerHTML = '<div class="github-result is-error">Masukkan username GitHub dulu.</div>';
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Menganalisis...';
  resultBox.innerHTML = '';

  const res = await Api.portfolio.analyzeGithub(username);

  if (res.status !== 200) {
    resultBox.innerHTML = `<div class="github-result is-error">${res.message}</div>`;
    btn.disabled = false;
    btn.textContent = 'Analisis GitHub';
    return;
  }

  const { repos_analyzed, languages, boosted_skills } = res.data;
  const langTags = languages.map(l => `<span class="badge badge-neutral">${l.name} (${l.repo_count} repo)</span>`).join('');
  const boostText = boosted_skills.length
    ? `<p class="text-sm" style="margin-top:10px;"><strong>Level yang disesuaikan:</strong></p><ul class="text-sm">${boosted_skills.map(b => `<li>${b.skill_name}: ${b.from}% &rarr; ${b.to}%</li>`).join('')}</ul>`
    : '<p class="text-sm" style="margin-top:10px;">Tidak ada level skill yang perlu dinaikkan — hasil self-assessment kamu sudah sejalan atau lebih tinggi dari aktivitas GitHub.</p>';

  resultBox.innerHTML = `
    <div class="github-result">
      <strong>${repos_analyzed} repository publik dianalisis</strong> untuk @${username}.
      <div class="lang-tag-row">${langTags || '<span class="text-faint text-sm">Tidak ada bahasa terdeteksi.</span>'}</div>
      ${boostText}
    </div>`;

  btn.disabled = false;
  btn.textContent = 'Analisis GitHub';
  render();
}

/* ---------------- Sertifikat manual ---------------- */

async function renderCertList() {
  const list = document.getElementById('certList');
  const res = await Api.portfolio.certificates.list();
  const certs = res.data;

  if (certs.length === 0) {
    list.innerHTML = '<li><span class="text-faint">Belum ada sertifikat ditambahkan.</span></li>';
    return;
  }
  list.innerHTML = certs.map(c => `
    <li>
      <span>${c.title} — <span class="text-faint">${c.issuer}${c.year ? `, ${c.year}` : ''}</span></span>
      <button class="btn btn-ghost btn-sm" data-remove-cert="${c.id}">Hapus</button>
    </li>`).join('');

  list.querySelectorAll('[data-remove-cert]').forEach(btn => {
    btn.addEventListener('click', () => removeCertificate(btn.dataset.removeCert));
  });
}

async function addCertificate() {
  const title = document.getElementById('certTitle').value.trim();
  const issuer = document.getElementById('certIssuer').value.trim();
  const year = document.getElementById('certYear').value.trim();

  if (!title || !issuer) {
    alert('Nama sertifikat dan penerbit wajib diisi.');
    return;
  }

  const res = await Api.portfolio.certificates.add(title, issuer, year);
  if (res.status !== 201) { alert(res.message); return; }

  document.getElementById('certTitle').value = '';
  document.getElementById('certIssuer').value = '';
  document.getElementById('certYear').value = '';

  await renderCertList();
  render();
}

async function removeCertificate(id) {
  await Api.portfolio.certificates.remove(id);
  await renderCertList();
  render();
}

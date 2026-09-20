/**
 * SkillBridge — logika halaman Portfolio Readiness.
 * Sudah lewat Api.portfolio.* — lihat js/api.js. Catatan arsitektur:
 * analisis GitHub tetap memakai data publik GitHub asli, cuma nanti
 * titik pemanggilannya pindah dari FE ke BE (lihat komentar di
 * api-mock.js bagian mockAnalyzeGithub).
 */

const RECOMMENDATION_BY_CATEGORY = {
  'Technical Skills': 'First improve the technical skills that are still below 80% of the required level, using Skill Assessment.',
  'Portfolio': 'Build one end-to-end project to raise your portfolio readiness.',
  'Experience': 'Look for an internship or open source contribution to strengthen this area.',
  'Career Documents': 'Prepare a CV and portfolio website so they are easy to share with recruiters.',
  'Certifications': 'Add certificates relevant to your target career in the section above.',
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
    : 'Your portfolio readiness is fairly even across all categories.';

  const area = document.getElementById('categoriesArea');
  area.innerHTML = result.groups.map(group => {
    const isTechnical = group.category === 'Technical Skills';
    const isCertifications = group.category === 'Certifications';

    let bodyHtml;
    if (isCertifications) {
      bodyHtml = `<p class="text-sm text-faint mb-0">${group.items.length} certificate(s) added — manage them in the "Certificates" section above.</p>`;
    } else {
      const itemsHtml = group.items.map(item => `
        <li class="${item.done ? 'is-done' : ''}">
          ${isTechnical
            ? `<span>${item.done ? '✓' : '✗'}</span><span>${item.label}</span>`
            : `<input type="checkbox" data-item="${item.id}" ${item.done ? 'checked' : ''}><span>${item.label}</span>`}
        </li>`).join('') || '<li><span class="text-faint">No target career yet to calculate this.</span></li>';
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
    resultBox.innerHTML = '<div class="github-result is-error">Please enter a GitHub username first.</div>';
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Analyzing...';
  resultBox.innerHTML = '';

  const res = await Api.portfolio.analyzeGithub(username);

  if (res.status !== 200) {
    resultBox.innerHTML = `<div class="github-result is-error">${res.message}</div>`;
    btn.disabled = false;
    btn.textContent = 'Analyze GitHub';
    return;
  }

  const { repos_analyzed, languages, boosted_skills } = res.data;
  const langTags = languages.map(l => `<span class="badge badge-neutral">${l.name} (${l.repo_count} repo)</span>`).join('');
  const boostText = boosted_skills.length
    ? `<p class="text-sm" style="margin-top:10px;"><strong>Adjusted levels:</strong></p><ul class="text-sm">${boosted_skills.map(b => `<li>${b.skill_name}: ${b.from}% &rarr; ${b.to}%</li>`).join('')}</ul>`
    : '<p class="text-sm" style="margin-top:10px;">This analysis has not adjusted any skill levels.</p>';

  resultBox.innerHTML = `
    <div class="github-result">
      <strong>${repos_analyzed} public repositories analyzed</strong> for @${username}.
      <div class="lang-tag-row">${langTags || '<span class="text-faint text-sm">No languages detected.</span>'}</div>
      ${boostText}
    </div>`;

  btn.disabled = false;
  btn.textContent = 'Analyze GitHub';
  render();
}

/* ---------------- Sertifikat manual ---------------- */

async function renderCertList() {
  const list = document.getElementById('certList');
  const res = await Api.portfolio.certificates.list();
  const certs = res.data;

  if (certs.length === 0) {
    list.innerHTML = '<li><span class="text-faint">No certificates added yet.</span></li>';
    return;
  }
  list.innerHTML = certs.map(c => `
    <li>
      <span>${c.title} — <span class="text-faint">${c.issuer}${c.year ? `, ${c.year}` : ''}</span></span>
      <button class="btn btn-ghost btn-sm" data-remove-cert="${c.id}">Delete</button>
    </li>`).join('');

  list.querySelectorAll('[data-remove-cert]').forEach(btn => {
    btn.addEventListener('click', () => removeCertificate(btn.dataset.removeCert));
  });
}

async function addCertificate() {
  const title = document.getElementById('certTitle').value.trim();
  const issuer = document.getElementById('certIssuer').value.trim();
  const year = document.getElementById('certYear').value.trim();

  if (!title || !issuer || !year) {
    alert('Certificate name, issuer, and year are required.');
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

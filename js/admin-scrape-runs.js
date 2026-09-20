/**
 * SkillBridge — Admin: Data Pipeline (riwayat scraping).
 * Memakai Api.admin.scrapeRuns.list() dan .trigger(). Endpoint ini dipakai untuk
 * transparansi proses scraper → ML → agregasi Industry Insights.
 */

const STATUS_BADGE = { success: 'badge-success', partial: 'badge-warning', failed: 'badge-critical' };
const STATUS_LABEL = { success: 'Success', partial: 'Partial', failed: 'Failed' };

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('runScrapeBtn').addEventListener('click', triggerRun);
  loadRuns();
});

function formatDate(value) {
  if (!value) return '<span class="text-faint">—</span>';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

async function loadRuns() {
  const res = await Api.admin.scrapeRuns.list();
  if (res.status === 401) { window.location.href = 'login.html'; return; }
  renderRuns(Array.isArray(res.data) ? res.data : []);
}

function renderRuns(runs) {
  const tbody = document.getElementById('runTableBody');
  const summary = document.getElementById('pipelineSummary');

  if (runs.length === 0) {
    summary.innerHTML = '';
    tbody.innerHTML = '<tr><td colspan="7"><p class="empty-state">No scraping runs yet. Use "Run scraping now" to start the first one.</p></td></tr>';
    return;
  }

  const sorted = [...runs].sort((a, b) => new Date(b.started_at) - new Date(a.started_at));
  const latest = sorted[0];
  const succeeded = sorted.filter(r => r.status === 'success').length;
  const totalProcessed = sorted.reduce((sum, r) => sum + (Number(r.jobs_processed) || 0), 0);

  summary.innerHTML = `
    <div class="card-flat">
      <p class="card-eyebrow">Latest run</p>
      <span class="badge ${STATUS_BADGE[latest.status] || 'badge-neutral'}">${STATUS_LABEL[latest.status] || latest.status}</span>
      <p class="text-sm text-faint" style="margin:8px 0 0;">${formatDate(latest.started_at)}</p>
    </div>
    <div class="card-flat">
      <p class="card-eyebrow">Successful runs</p>
      <h3 style="margin:0;">${succeeded} of ${sorted.length}</h3>
    </div>
    <div class="card-flat">
      <p class="card-eyebrow">Job postings processed (all runs)</p>
      <h3 style="margin:0;">${totalProcessed.toLocaleString('en-US')}</h3>
    </div>`;

  tbody.innerHTML = sorted.map(r => `
    <tr>
      <td>#${r.id}</td>
      <td>${formatDate(r.started_at)}</td>
      <td>${formatDate(r.finished_at)}</td>
      <td><span class="badge ${STATUS_BADGE[r.status] || 'badge-neutral'}">${STATUS_LABEL[r.status] || r.status || '—'}</span></td>
      <td>${r.jobs_found ?? '—'}</td>
      <td>${r.jobs_processed ?? '—'}</td>
      <td class="text-sm">${r.error_message ? r.error_message : '<span class="text-faint">—</span>'}</td>
    </tr>`).join('');
}

async function triggerRun() {
  const btn = document.getElementById('runScrapeBtn');
  const note = document.getElementById('runNote');
  btn.disabled = true;
  btn.textContent = 'Starting…';

  const res = await Api.admin.scrapeRuns.trigger();
  if (res.status === 401) { window.location.href = 'login.html'; return; }

  note.hidden = false;
  if (res.status === 202 || res.status === 200) {
    note.style.color = 'var(--color-primary)';
    note.textContent = 'Scraping started in the background. The table refreshes automatically.';
    await loadRuns();
    setTimeout(loadRuns, 5000);
  } else {
    note.style.color = 'var(--color-critical)';
    note.textContent = res.message || 'Could not start scraping.';
  }
  btn.disabled = false;
  btn.textContent = 'Run scraping now';
}

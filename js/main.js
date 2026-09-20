/**
 * SkillBridge — util bersama yang dipakai di semua halaman
 * (toggle sidebar mobile, highlight menu aktif, tombol logout).
 */

document.addEventListener('DOMContentLoaded', () => {
  initSidebarToggle();
  highlightActiveNav();
  bindLogoutButtons();
  bindMobileTopnavToggle();
  hideMockOnlyNotes();
});

/**
 * Label "Demo Data" / catatan simulasi hanya benar untuk mode mock.
 * Di mode live datanya dari backend, jadi elemen bertanda data-mock-only disembunyikan.
 */
function hideMockOnlyNotes() {
  if (typeof isLiveMode !== 'function' || !isLiveMode()) return;
  document.querySelectorAll('[data-mock-only]').forEach(el => { el.hidden = true; el.style.display = 'none'; });
}

function initSidebarToggle() {
  const toggle = document.querySelector('[data-action="toggle-sidebar"]');
  const sidebar = document.querySelector('.sidebar');
  if (!toggle || !sidebar) return;
  toggle.addEventListener('click', () => sidebar.classList.toggle('is-open'));
  document.addEventListener('click', (e) => {
    if (sidebar.classList.contains('is-open') && !sidebar.contains(e.target) && e.target !== toggle && !toggle.contains(e.target)) {
      sidebar.classList.remove('is-open');
    }
  });
}

function bindMobileTopnavToggle() {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.topnav-links');
  if (!toggle || !links) return;
  toggle.addEventListener('click', () => {
    const isOpen = links.style.display === 'flex';
    links.style.display = isOpen ? '' : 'flex';
    links.style.flexDirection = 'column';
    links.style.position = 'absolute';
    links.style.top = '72px';
    links.style.left = '0';
    links.style.right = '0';
    links.style.background = 'var(--color-surface)';
    links.style.padding = '16px 24px';
    links.style.borderBottom = '1px solid var(--color-border)';
  });
}

function highlightActiveNav() {
  const current = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.sidebar-nav a, .topnav-links a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === current) link.classList.add('is-active');
  });
}

function bindLogoutButtons() {
  const doLogout = async (e) => {
    e.preventDefault();
    await Api.auth.logout();
    clearAuthToken();
    window.location.href = 'index.html';
  };
  document.querySelectorAll('[data-action="logout"], [data-action="logout-admin"]').forEach(btn => {
    btn.addEventListener('click', doLogout);
  });
}

/** Peta label status readiness (string dari API) ke kelas badge CSS. */
function readinessBadgeClass(label) {
  return {
    Beginning: 'badge-critical',
    Developing: 'badge-warning',
    Ready: 'badge-success',
    'Highly Ready': 'badge-success',
    // Label yang dikirim backend (ReadinessController)
    'Not Ready': 'badge-critical',
    'Almost Ready': 'badge-warning',
  }[label] || 'badge-neutral';
}

/** Peta category gap (string dari API) ke label yang enak dibaca. */
const GAP_CATEGORY_LABEL = { strong: 'Strong Match', small: 'Small Gap', moderate: 'Moderate Gap', critical: 'Critical Gap' };

/** Helper kecil untuk isi elemen dengan initial nama (dipakai di avatar bulat). */
function initials(fullName) {
  if (!fullName) return '?';
  return fullName.trim().split(/\s+/).slice(0, 2).map(w => w[0].toUpperCase()).join('');
}

/**
 * Render sparkline (mini trend chart) dari array {month, value}.
 * Dipakai di Industry Insights untuk menunjukkan naik/turunnya demand skill.
 */
function renderSparkline(points, width = 100, height = 28, color = '#55662E') {
  if (!points || points.length < 2) return '';
  const max = Math.max(...points.map(p => p.value));
  const min = Math.min(...points.map(p => p.value));
  const range = Math.max(1, max - min);
  const step = width / (points.length - 1);

  const coords = points.map((p, i) => {
    const x = i * step;
    const y = height - ((p.value - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  });

  return `
    <svg class="sparkline-wrap" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <polyline points="${coords.join(' ')}" fill="none" stroke="${color}" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/>
    </svg>`;
}

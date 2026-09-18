/**
 * SkillBridge — logika halaman login & register.
 * Sudah lewat Api.auth.* (lihat js/api.js) — begitu backend Laravel
 * jalan, file ini TIDAK perlu diubah sama sekali.
 */

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  if (loginForm) loginForm.addEventListener('submit', handleLogin);

  const demoBtn = document.getElementById('demoBtn');
  if (demoBtn) demoBtn.addEventListener('click', () => {
    seedDemoState();
    window.location.href = 'dashboard.html';
  });

  const demoAdminBtn = document.getElementById('demoAdminBtn');
  if (demoAdminBtn) demoAdminBtn.addEventListener('click', () => {
    loginAsAdmin();
    window.location.href = 'admin-dashboard.html';
  });

  const registerForm = document.getElementById('registerForm');
  if (registerForm) registerForm.addEventListener('submit', handleRegister);
});

function showLoginError(message) {
  const errorBox = document.getElementById('loginError');
  errorBox.textContent = message;
  errorBox.style.display = 'block';
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  const res = await Api.auth.login(email, password);

  if (res.status !== 200) {
    showLoginError(res.message || 'Email atau password salah.');
    return;
  }

  if (res.data.user.role === 'admin') {
    window.location.href = 'admin-dashboard.html';
  } else {
    window.location.href = res.data.user.onboarding_complete ? 'dashboard.html' : 'onboarding.html';
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const body = {
    full_name: document.getElementById('fullName').value.trim(),
    email: document.getElementById('email').value.trim(),
    // Password dikirim ke BE untuk di-hash & disimpan di sana — FE tidak
    // pernah menyimpan password mentah sendiri.
    password: document.getElementById('password').value,
    university: document.getElementById('university').value.trim(),
    major: document.getElementById('major').value.trim(),
    semester: document.getElementById('semester').value,
    graduation_year: document.getElementById('graduationYear').value,
  };

  const res = await Api.auth.register(body);

  if (res.status !== 201) {
    alert(res.message || 'Registrasi gagal. Coba lagi.');
    return;
  }

  window.location.href = 'onboarding.html';
}

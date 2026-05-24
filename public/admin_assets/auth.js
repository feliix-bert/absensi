/**
 * auth.js — Modul Autentikasi Frontend
 * =====================================
 * Mengganti logika login localStorage dengan autentikasi ke backend.
 *
 * CARA KERJA:
 * 1. User isi form (nama+NIK+password) → dikirim ke backend
 * 2. Backend verifikasi vs database → kembalikan JWT token
 * 3. Token disimpan di sessionStorage (bukan localStorage, lebih aman)
 * 4. Setiap request ke backend menyertakan token di header Authorization
 * 5. Role user diambil dari token (sudah dikunci di backend), tidak bisa dipalsukan
 */

const API_BASE = '/api/admin-api';

// ============================================================
// TOKEN MANAGEMENT — menggunakan sessionStorage
// (sessionStorage otomatis hilang saat browser ditutup)
// ============================================================

const Auth = {
  /**
   * Simpan token JWT setelah login berhasil
   */
  saveToken(token) {
    sessionStorage.setItem('tel_intern_token', token);
  },

  /**
   * Ambil token JWT
   */
  getToken() {
    return sessionStorage.getItem('tel_intern_token');
  },

  /**
   * Hapus token (logout)
   */
  clearToken() {
    sessionStorage.removeItem('tel_intern_token');
    sessionStorage.removeItem('tel_intern_user');
  },

  /**
   * Simpan data user (dari response token)
   */
  saveUser(user) {
    sessionStorage.setItem('tel_intern_user', JSON.stringify(user));
  },

  /**
   * Ambil data user dari storage
   */
  getUser() {
    try {
      const raw = sessionStorage.getItem('tel_intern_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  /**
   * Cek apakah user sudah login (ada token)
   */
  isLoggedIn() {
    return !!this.getToken();
  },
};

// ============================================================
// API HELPERS
// ============================================================

/**
 * Helper untuk melakukan fetch ke backend dengan token otomatis
 */
async function apiFetch(path, options = {}) {
  const token = Auth.getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json();
  return { ok: response.ok, status: response.status, data };
}

// ============================================================
// FUNGSI LOGIN — mengganti initLogin() yang lama
// ============================================================

/**
 * Inisialisasi form login dengan autentikasi backend
 * Dipanggil di DOMContentLoaded
 */
function initLoginWithBackend() {
  const form = document.getElementById('login-form');
  if (!form) return;

  // Tambahkan field password ke form login
  injectPasswordField();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await handleLoginSubmit();
  });
}

/**
 * Inject field password ke form login yang sudah ada
 * (karena form asli hanya punya Nama, NIK, Role)
 */
function injectPasswordField() {
  // Cek apakah sudah ada
  if (document.getElementById('login-password')) return;

  // Ubah label NIK
  const nikLabel = document.querySelector('label[for="login-nik"]');
  if (nikLabel) nikLabel.textContent = 'NIK / ID Karyawan';

  // Sembunyikan field Role (role ditentukan backend, bukan user)
  const roleGroup = document.getElementById('login-role')?.closest('.form-group');
  if (roleGroup) {
    roleGroup.style.display = 'none';
  }

  // Sembunyikan field Nama juga (tidak perlu, NIK + password cukup)
  // Tapi kita biarkan nama untuk UX yang lebih personal
  // Catatan: nama dari form TIDAK dipakai untuk auth, hanya untuk greeting

  // Tambahkan field password sebelum tombol submit
  const submitBtn = form.querySelector('button[type="submit"]');
  if (!submitBtn) return;

  const form = document.getElementById('login-form');

  const passwordGroup = document.createElement('div');
  passwordGroup.className = 'form-group';
  passwordGroup.innerHTML = `
    <label for="login-password">Password</label>
    <div class="input-wrap">
      <span class="material-symbols-outlined input-icon">lock</span>
      <input
        type="password"
        id="login-password"
        name="password"
        placeholder="Password Anda"
        required
        autocomplete="current-password"
        minlength="6"
      />
      <button type="button" id="toggle-password" class="password-toggle" aria-label="Tampilkan password">
        <span class="material-symbols-outlined">visibility</span>
      </button>
    </div>
  `;

  form.insertBefore(passwordGroup, submitBtn);

  // Toggle show/hide password
  const toggleBtn = document.getElementById('toggle-password');
  const passwordInput = document.getElementById('login-password');
  if (toggleBtn && passwordInput) {
    toggleBtn.addEventListener('click', () => {
      const isHidden = passwordInput.type === 'password';
      passwordInput.type = isHidden ? 'text' : 'password';
      toggleBtn.querySelector('.material-symbols-outlined').textContent =
        isHidden ? 'visibility_off' : 'visibility';
    });
  }
}

/**
 * Handle submit form login
 */
async function handleLoginSubmit() {
  const nikInput = document.getElementById('login-nik');
  const passwordInput = document.getElementById('login-password');
  const submitBtn = document.querySelector('#login-form button[type="submit"]');
  const btnLabel = submitBtn?.querySelector('span:first-child');

  const nik = nikInput?.value.trim().toUpperCase();
  const password = passwordInput?.value;

  if (!nik || !password) {
    showToast('NIK dan password wajib diisi.', 'error');
    return;
  }

  // Loading state
  if (submitBtn) submitBtn.disabled = true;
  if (btnLabel) btnLabel.textContent = 'Memverifikasi...';

  try {
    const { ok, data } = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ nik, password }),
    });

    if (!ok) {
      showToast(data.error || 'Login gagal. Coba lagi.', 'error');
      return;
    }

    // Simpan token dan data user
    Auth.saveToken(data.token);
    Auth.saveUser(data.user);

    // Set state aplikasi dari response backend (bukan dari input form)
    const user = data.user;
    state.currentUser = {
      name: user.name,
      nik: user.nik,
      role: user.role,   // << Role dari BACKEND, tidak bisa dipalsukan
      cohort: user.cohort,
      loginTime: new Date().toISOString(),
    };

    // Simpan ke localStorage untuk persistensi
    LS.set('ap_user', state.currentUser);

    // Load records
    state.records = LS.get('ap_records', {});
    ensureAllRecords();

    // Boot aplikasi
    bootApp();

  } catch (err) {
    console.error('Login network error:', err);
    showToast('Tidak dapat terhubung ke server. Pastikan backend berjalan.', 'error');
  } finally {
    if (submitBtn) submitBtn.disabled = false;
    if (btnLabel) btnLabel.textContent = 'Masuk';
  }
}

/**
 * Verifikasi token saat halaman dimuat
 * Jika token masih valid, langsung masuk ke app
 */
async function verifySessionOnLoad() {
  const token = Auth.getToken();
  if (!token) return false;

  try {
    const { ok, data } = await apiFetch('/auth/verify');
    if (!ok) {
      Auth.clearToken();
      return false;
    }

    // Token masih valid — restore session
    const user = data.user;
    state.currentUser = {
      name: user.name,
      nik: user.nik,
      role: user.role,
      cohort: user.cohort,
      loginTime: new Date().toISOString(),
    };
    LS.set('ap_user', state.currentUser);

    state.records = LS.get('ap_records', {});
    ensureAllRecords();

    return true;
  } catch {
    Auth.clearToken();
    return false;
  }
}

// ============================================================
// FUNGSI REGISTER INTERN
// ============================================================

/**
 * Daftarkan intern baru ke backend
 * Role otomatis dikunci ke 'intern' oleh backend
 */
async function registerIntern(name, nik, password) {
  const { ok, data } = await apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, nik, password }),
  });

  if (ok) {
    Auth.saveToken(data.token);
    Auth.saveUser(data.user);
  }

  return { ok, data };
}

// Export untuk dipakai di app.js / modul lain
// (karena project ini vanilla JS tanpa bundler, semua global)
window.Auth = Auth;
window.apiFetch = apiFetch;
window.initLoginWithBackend = initLoginWithBackend;
window.verifySessionOnLoad = verifySessionOnLoad;
window.registerIntern = registerIntern;

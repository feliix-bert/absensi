/**
 * AttendancePro — app.js
 * Vanilla JS SPA: Auth · RBAC · GPS · Attendance · Charts · Analytics
 */

console.log("app.js loaded and executing...");

/* ============================================================
   SUPABASE INITIALIZATION
   ============================================================ */
const SUPABASE_URL = 'YOUR_SUPABASE_URL'; // Replace with your Supabase project URL
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'; // Replace with your Supabase anon key

let supabaseClient = null;
if (SUPABASE_URL !== 'YOUR_SUPABASE_URL' && SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY') {
  try {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } catch (error) {
    console.error("Failed to initialize Supabase client:", error);
  }
} else {
  console.warn("Supabase is not initialized. Please configure SUPABASE_URL and SUPABASE_ANON_KEY in app.js.");
}

/* ============================================================
   SECTION 1: CONSTANTS & STATE
   ============================================================ */

const OFFICE_DEFAULTS = { lat: -6.1754, lng: 106.8272, radius: 200 };

const LOCATIONS = ['HQ - Lantai 1', 'HQ - Lantai 2', 'HQ - Lantai 3', 'HQ - Gerbang A', 'Remote - VPN', 'WFH'];

const DUMMY_INTERNS = [
  { name: 'Rina Kusuma', nik: 'EMP-10001', role: 'intern', cohort: '2024' },
  { name: 'Dimas Pratama', nik: 'EMP-10002', role: 'intern', cohort: '2024' },
  { name: 'Sari Wulandari', nik: 'EMP-10003', role: 'intern', cohort: '2024' },
  { name: 'Eko Santoso', nik: 'EMP-10004', role: 'intern', cohort: '2024' },
  { name: 'Laila Putri', nik: 'EMP-10005', role: 'intern', cohort: '2024' },
  { name: 'Bagas Setiawan', nik: 'EMP-10006', role: 'intern', cohort: '2024' },
];

// In-memory + localStorage state
let state = {
  currentUser: null,
  records: {},          // { nik: [record, ...] }
  gpsWatchId: null,
  gpsPosition: null,
  officeCoords: { ...OFFICE_DEFAULTS },
  todayCheckedIn: false,
  todayCheckedOut: false,
  charts: {},
  historyPage: 1,
  historyPageSize: 10,
  authNavigatedToRegister: false,
};

/* ============================================================
   SECTION 2: STORAGE HELPERS
   ============================================================ */

const LS = {
  get: (k, fallback = null) => {
    try {
      const v = localStorage.getItem(k);
      if (v === null || v === undefined) return fallback;
      const parsed = JSON.parse(v);
      return (parsed !== null && parsed !== undefined) ? parsed : fallback;
    }
    catch { return fallback; }
  },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { } },
  remove: (k) => { try { localStorage.removeItem(k); } catch { } },
};

/* ============================================================
   SECTION 3: UTILITY — DATES & FORMATTING
   ============================================================ */

/** Format a Date to 'DD Mon YYYY' */
function fmtDate(d) {
  const date = d instanceof Date ? d : new Date(d);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  return `${String(date.getDate()).padStart(2, '0')} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

/** Format a Date to 'HH:MM AM/PM' */
function fmtTime12(d) {
  const date = d instanceof Date ? d : new Date(d);
  let h = date.getHours(), m = date.getMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
}

/** Today's date-string key 'YYYY-MM-DD' */
function todayKey() {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
}

/** Parse 'YYYY-MM-DD' to Date */
function parseKey(k) { return new Date(k + 'T00:00:00'); }

/** Get initials from name */
function initials(name) {
  return (name || '?').split(' ').slice(0, 2).map(w => w[0]?.toUpperCase()).join('');
}

/* ============================================================
   SECTION 4: DUMMY DATA GENERATION
   ============================================================ */

/**
 * Generate 14–30 days of attendance records for a user.
 * Returns array of record objects.
 */
function generateDummyRecords(nik) {
  const days = Math.floor(Math.random() * 17) + 14; // 14–30
  const records = [];
  const now = new Date();

  for (let i = days; i >= 1; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dow = d.getDay();
    if (dow === 0 || dow === 6) continue; // skip weekends

    const roll = Math.random();
    if (roll < 0.08) {
      // Absent (no record or explicit absent)
      records.push({
        date: d.toISOString().slice(0, 10),
        timeIn: null,
        timeOut: null,
        location: 'N/A',
        status: 'Tidak Hadir',
      });
    } else if (roll < 0.16) {
      // Excused / izin
      records.push({
        date: d.toISOString().slice(0, 10),
        timeIn: null,
        timeOut: null,
        location: 'N/A',
        status: 'Izin',
      });
    } else if (roll < 0.28) {
      // WFH
      const inH = 8 + Math.floor(Math.random() * 2);
      const inM = Math.floor(Math.random() * 30);
      const inT = new Date(d); inT.setHours(inH, inM, 0);
      const outT = new Date(inT); outT.setHours(17 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 30), 0);
      records.push({
        date: d.toISOString().slice(0, 10),
        timeIn: inT.toISOString(),
        timeOut: outT.toISOString(),
        location: 'Remote - VPN',
        status: 'WFH',
      });
    } else if (roll < 0.45) {
      // Terlambat
      const inH = 9 + Math.floor(Math.random() * 2);
      const inM = 5 + Math.floor(Math.random() * 55);
      const inT = new Date(d); inT.setHours(inH, inM, 0);
      const outT = new Date(inT); outT.setHours(17 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 30), 0);
      records.push({
        date: d.toISOString().slice(0, 10),
        timeIn: inT.toISOString(),
        timeOut: outT.toISOString(),
        location: LOCATIONS[Math.floor(Math.random() * 4)],
        status: 'Terlambat',
      });
    } else {
      // Hadir (on time)
      const inH = 7 + Math.floor(Math.random() * 2);
      const inM = Math.floor(Math.random() * 59);
      const inT = new Date(d); inT.setHours(inH, inM, 0);
      const outT = new Date(inT); outT.setHours(17 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 30), 0);
      records.push({
        date: d.toISOString().slice(0, 10),
        timeIn: inT.toISOString(),
        timeOut: outT.toISOString(),
        location: LOCATIONS[Math.floor(Math.random() * 4)],
        status: 'Hadir',
      });
    }
  }
  return records.sort((a, b) => b.date.localeCompare(a.date));
}

/** Ensure records exist for all dummy interns + current user */
function ensureAllRecords() {
  if (!state.records || typeof state.records !== 'object' || Array.isArray(state.records)) {
    state.records = {};
  }
  const allNiks = [...DUMMY_INTERNS.map(u => u.nik)];
  if (state.currentUser && !allNiks.includes(state.currentUser.nik)) {
    allNiks.push(state.currentUser.nik);
  }
  allNiks.forEach(nik => {
    if (!state.records[nik] || state.records[nik].length === 0) {
      state.records[nik] = generateDummyRecords(nik);
    }
  });
  LS.set('ap_records', state.records);
}

/* ============================================================
   SECTION 5: PERFORMANCE METRICS
   ============================================================ */

/**
 * Calculate metrics for a given NIK's records.
 * @returns { streak, onTimePct, lateDays, totalHours, presentDays }
 */
function calcMetrics(nik) {
  const recs = (state.records[nik] || [])
    .filter(r => r.date <= todayKey())
    .sort((a, b) => b.date.localeCompare(a.date));

  let streak = 0, onTime = 0, late = 0, totalMs = 0, present = 0;

  // Streak — count consecutive days from today backwards
  const today = new Date(); today.setHours(0, 0, 0, 0);
  for (const r of recs) {
    if (r.status === 'Hadir' || r.status === 'Terlambat' || r.status === 'WFH') {
      const rDate = parseKey(r.date); rDate.setHours(0, 0, 0, 0);
      const expected = new Date(today); expected.setDate(today.getDate() - streak);
      if (rDate.getTime() === expected.getTime()) streak++;
      else break;
    } else {
      break;
    }
  }

  recs.forEach(r => {
    if (r.status === 'Hadir' || r.status === 'WFH') { present++; onTime++; }
    if (r.status === 'Terlambat') { present++; late++; }
    if (r.timeIn && r.timeOut) {
      totalMs += new Date(r.timeOut) - new Date(r.timeIn);
    }
  });

  const onTimePct = present > 0 ? ((onTime / present) * 100).toFixed(1) : '0.0';
  const totalHours = (totalMs / 3_600_000).toFixed(1);
  return { streak, onTimePct, lateDays: late, totalHours, presentDays: present };
}

/** Org-level metrics for Admin/Manager */
function calcOrgMetrics() {
  const allNiks = DUMMY_INTERNS.map(u => u.nik);
  const key = todayKey();
  let present = 0, late = 0, absent = 0;
  allNiks.forEach(nik => {
    const rec = (state.records[nik] || []).find(r => r.date === key);
    if (!rec || rec.status === 'Tidak Hadir') absent++;
    else if (rec.status === 'Terlambat') { present++; late++; }
    else present++;
  });
  const total = allNiks.length;
  const rate = total > 0 ? ((present / total) * 100).toFixed(1) : '0.0';
  return { total, present, late, absent, rate };
}

/* ============================================================
   SECTION 6: HAVERSINE GPS FORMULA
   ============================================================ */

/**
 * Haversine formula — returns distance in meters between two coords.
 */
function haversine(lat1, lng1, lat2, lng2) {
  const R = 6_371_000; // Earth radius in meters
  const toRad = x => x * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/* ============================================================
   SECTION 7: SPA ROUTING
   ============================================================ */

/** Navigate to a named page, apply RBAC, refresh content */
function mapsTo(pageId) {
  const user = state.currentUser;

  // Clear viewing state when navigating to team page
  if (pageId === 'team') {
    state._viewingNik = null;
    sessionStorage.removeItem('ap_viewing_nik');
  }

  // Check RBAC
  const target = document.getElementById(`page-${pageId}`);
  if (target) {
    const allowed = target.dataset.roles;
    if (allowed && !allowed.split(',').includes(user?.role)) {
      // Redirect to a default allowed page
      const fallback = user?.role === 'intern' ? 'attendance' : 'dashboard';
      window.location.hash = fallback;
      return;
    }
  }

  // Hide all app pages
  document.querySelectorAll('.app-page').forEach(p => p.classList.remove('active'));

  // Show target
  if (target) target.classList.add('active');

  // Update sidebar active state
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.dataset.page === pageId);
  });

  // Update bottom nav
  document.querySelectorAll('.bottom-nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.page === pageId);
  });

  // Close mobile sidebar
  closeSidebar();

  // Refresh content for each page
  switch (pageId) {
    case 'dashboard': refreshDashboard(); break;
    case 'attendance': refreshAttendance(); break;
    case 'performance': refreshPerformance(); break;
    case 'history': refreshHistory(); break;
    case 'team': refreshTeam(); break;
    case 'settings': refreshSettings(); break;
    case 'signout': {
      const sessionEl = document.getElementById('logout-sess-id');
      if (sessionEl) {
        const randNum = Math.floor(1000 + Math.random() * 9000);
        const randChars = Math.random().toString(36).substring(2, 4).toUpperCase();
        const randSfx = String(Math.floor(Math.random() * 99)).padStart(2, '0');
        sessionEl.textContent = `Sess_ID: ${randNum}-${randChars}-${randSfx}`;
      }
      break;
    }
  }
}

/* ============================================================
   SECTION 8: RBAC — DOM VISIBILITY
   ============================================================ */

/** Hide/show elements based on data-roles vs currentUser.role */
function applyRBAC() {
  const role = state.currentUser?.role;
  document.querySelectorAll('[data-roles]').forEach(el => {
    const allowed = el.dataset.roles.split(',');
    el.style.display = allowed.includes(role) ? '' : 'none';
  });
}

/* ============================================================
   SECTION 9: AUTHENTICATION
   ============================================================ */

/* ============================================================
   AUTH HELPERS — panel switching
   ============================================================ */

function showLoginPanel() {
  const loginPanel = document.getElementById('login-panel');
  const registerPanel = document.getElementById('register-panel');
  const title = document.getElementById('auth-modal-title');
  const subtitle = document.getElementById('auth-modal-subtitle');

  registerPanel.classList.add('auth-panel--hidden');
  loginPanel.classList.remove('auth-panel--hidden');
  loginPanel.classList.add('slide-back');
  setTimeout(() => loginPanel.classList.remove('slide-back'), 300);

  if (title) title.textContent = 'Tel Intern';
  if (subtitle) subtitle.textContent = 'Akses aman ke sistem manajemen.';
}

function showRegisterPanel() {
  const loginPanel = document.getElementById('login-panel');
  const registerPanel = document.getElementById('register-panel');
  const title = document.getElementById('auth-modal-title');
  const subtitle = document.getElementById('auth-modal-subtitle');

  loginPanel.classList.add('auth-panel--hidden');
  registerPanel.classList.remove('auth-panel--hidden');
  registerPanel.classList.remove('slide-back');

  if (title) title.textContent = 'Daftar Akun';
  if (subtitle) subtitle.textContent = 'Buat akun intern baru.';
}

/* Helper: pasang toggle show/hide password */
function bindPasswordToggle(toggleId, inputId) {
  const btn = document.getElementById(toggleId);
  const inp = document.getElementById(inputId);
  if (!btn || !inp) return;
  btn.addEventListener('click', () => {
    const hidden = inp.type === 'password';
    inp.type = hidden ? 'text' : 'password';
    const icon = btn.querySelector('.material-symbols-outlined');
    if (icon) icon.textContent = hidden ? 'visibility_off' : 'visibility';
  });
}

/* ============================================================
   INIT LOGIN
   ============================================================ */
function initLogin() {
  console.log("initLogin() called...");

  /* ── Password toggles ── */
  bindPasswordToggle('toggle-password', 'login-password');
  bindPasswordToggle('toggle-reg-password', 'reg-password');
  bindPasswordToggle('toggle-reg-confirm', 'reg-confirm');

  /* ── Panel switching ── */
  document.getElementById('show-register-btn')?.addEventListener('click', () => {
    sessionStorage.setItem('navigated_to_register', 'true');
    window.location.hash = 'register';
  });
  document.getElementById('back-to-login-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    if (sessionStorage.getItem('navigated_to_register') === 'true') {
      sessionStorage.removeItem('navigated_to_register');
      history.back();
    } else {
      history.replaceState(null, '', window.location.pathname + window.location.search);
      showLoginPanel();
    }
  });

  /* ── Back button (hardware/gesture) & forward button support via hashchange ── */
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash;

    if (!state.currentUser) {
      if (hash === '#register') {
        showRegisterPanel();
      } else {
        sessionStorage.removeItem('navigated_to_register');
        showLoginPanel();
      }
    } else {
      const pageId = hash ? hash.slice(1) : (state.currentUser.role === 'intern' ? 'attendance' : 'dashboard');
      const validPages = ['dashboard', 'attendance', 'performance', 'history', 'team', 'settings', 'signout'];
      if (validPages.includes(pageId)) {
        if (pageId === 'performance') {
          sessionStorage.setItem('navigated_to_perf', 'true');
        } else {
          sessionStorage.removeItem('navigated_to_perf');
        }
        mapsTo(pageId);
      }
    }
  });

  // Sinkronisasi panel berdasarkan hash pada saat inisialisasi awal
  if (window.location.hash === '#register') {
    if (sessionStorage.getItem('navigated_to_register') !== 'true') {
      history.replaceState(null, '', window.location.pathname + window.location.search);
      history.pushState(null, '', '#register');
      sessionStorage.setItem('navigated_to_register', 'true');
    }
    showRegisterPanel();
  } else {
    showLoginPanel();
  }

  /* ── Forgot / contact (placeholder toasts) ── */
  document.getElementById('forgot-password-btn')?.addEventListener('click', () => {
    showToast('Hubungi admin untuk reset password. Lihat kontak di halaman Tim.', 'info');
  });
  document.getElementById('contact-admin-btn')?.addEventListener('click', () => {
    showToast('Silakan hubungi admin sistem melalui email atau WhatsApp grup intern.', 'info');
  });

  /* ════════════════════════════════════════════
     FORM LOGIN — Nama + NIK + Password → backend
     ════════════════════════════════════════════ */
  const loginForm = document.getElementById('login-form');
  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('login-name')?.value.trim();
    const nik  = document.getElementById('login-nik')?.value.trim().toUpperCase();
    const password = document.getElementById('login-password')?.value;

    if (!name || !nik || !password) {
      showToast('Nama, NIK, dan password wajib diisi.', 'error');
      return;
    }

    const btn = document.getElementById('login-submit-btn');
    const lbl = btn?.querySelector('span:first-child');
    if (btn) btn.disabled = true;
    if (lbl) lbl.textContent = 'Memverifikasi…';

    try {
      const res = await fetch('/api/admin-api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nik, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || 'Login gagal. Periksa NIK dan password.', 'error');
        return;
      }

      /* Simpan token */
      if (window.Auth) { Auth.saveToken(data.token); Auth.saveUser(data.user); }

      /* Role DARI BACKEND — tidak bisa dipalsukan */
      const user = {
        name:      data.user.name,
        nik:       data.user.nik,
        role:      data.user.role,
        cohort:    data.user.cohort,
        loginTime: new Date().toISOString(),
      };
      LS.set('ap_user', user);
      state.currentUser = user;

      state.records = LS.get('ap_records', {});
      ensureAllRecords();
      bootApp();

    } catch (err) {
      console.error('Login network error:', err);
      showToast('Tidak dapat terhubung ke server. Pastikan Anda memiliki koneksi internet atau coba beberapa saat lagi.', 'error');
    } finally {
      if (btn) btn.disabled = false;
      if (lbl) lbl.textContent = 'Masuk';
    }
  });

  /* ════════════════════════════════════════════
     FORM REGISTER — Nama + NIK + Password → backend
     (role dikunci 'intern' oleh backend)
     ════════════════════════════════════════════ */
  const registerForm = document.getElementById('register-form');
  registerForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name     = document.getElementById('reg-name')?.value.trim();
    const nik      = document.getElementById('reg-nik')?.value.trim().toUpperCase();
    const password = document.getElementById('reg-password')?.value;
    const confirm  = document.getElementById('reg-confirm')?.value;

    if (!name || !nik || !password || !confirm) {
      showToast('Semua field wajib diisi.', 'error');
      return;
    }
    if (password.length < 6) {
      showToast('Password minimal 6 karakter.', 'error');
      return;
    }
    if (password !== confirm) {
      showToast('Konfirmasi password tidak cocok.', 'error');
      return;
    }

    const btn = document.getElementById('register-submit-btn');
    const lbl = btn?.querySelector('span:first-child');
    if (btn) btn.disabled = true;
    if (lbl) lbl.textContent = 'Mendaftarkan…';

    try {
      const res = await fetch('/api/admin-api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, nik, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || 'Pendaftaran gagal. Coba lagi.', 'error');
        return;
      }

      /* Simpan token dari register */
      if (window.Auth) { Auth.saveToken(data.token); Auth.saveUser(data.user); }

      /* Login langsung setelah register */
      const user = {
        name:      data.user.name,
        nik:       data.user.nik,
        role:      data.user.role,   // selalu 'intern'
        cohort:    data.user.cohort,
        loginTime: new Date().toISOString(),
      };
      LS.set('ap_user', user);
      state.currentUser = user;

      state.records = LS.get('ap_records', {});
      ensureAllRecords();
      bootApp();

    } catch (err) {
      console.error('Register network error:', err);
      showToast('Tidak dapat terhubung ke server. Pastikan Anda memiliki koneksi internet atau coba beberapa saat lagi.', 'error');
    } finally {
      if (btn) btn.disabled = false;
      if (lbl) lbl.textContent = 'Buat Akun';
    }
  });
}

function logout() {
  // Stop GPS
  if (state.gpsWatchId !== null) {
    navigator.geolocation.clearWatch(state.gpsWatchId);
    state.gpsWatchId = null;
  }
  // Destroy charts
  Object.values(state.charts).forEach(c => { try { c.destroy(); } catch { } });
  state.charts = {};

  LS.remove('ap_user');
  if (window.Auth && typeof window.Auth.clearToken === 'function') {
    window.Auth.clearToken();
  }
  state.currentUser = null;
  state.todayCheckedIn = false;
  state.todayCheckedOut = false;

  // Reset history/hash state
  history.replaceState(null, '', window.location.pathname + window.location.search);
  sessionStorage.removeItem('navigated_to_register');
  sessionStorage.removeItem('ap_viewing_nik');
  sessionStorage.removeItem('navigated_to_perf');

  // Show login, hide app
  document.getElementById('app-shell').style.display = 'none';
  const loginPage = document.getElementById('page-login');
  loginPage.classList.remove('hidden');
  loginPage.style.display = '';
  showLoginPanel();

  // Clear form
  document.getElementById('login-form').reset();
}

/* ============================================================
   SECTION 10: BOOT APP
   ============================================================ */

function bootApp() {
  sessionStorage.removeItem('navigated_to_register');

  // Hide login
  const loginPage = document.getElementById('page-login');
  loginPage.style.display = 'none';

  // Show app shell
  const shell = document.getElementById('app-shell');
  shell.style.display = 'flex';

  // Load saved settings
  const savedSettings = LS.get('ap_settings');
  if (savedSettings) state.officeCoords = { ...OFFICE_DEFAULTS, ...savedSettings };

  // Populate sidebar user info
  const u = state.currentUser;
  document.getElementById('sidebar-user-name').textContent = u.name;
  document.getElementById('sidebar-user-role').textContent = u.role.charAt(0).toUpperCase() + u.role.slice(1);
  document.getElementById('sidebar-avatar-initials').textContent = initials(u.name);
  document.getElementById('topbar-avatar').textContent = initials(u.name);

  // Apply RBAC
  applyRBAC();

  // Check today's attendance state
  const todayRec = (state.records[u.nik] || []).find(r => r.date === todayKey());
  if (todayRec && todayRec.timeIn) state.todayCheckedIn = true;
  if (todayRec && todayRec.timeOut) state.todayCheckedOut = true;

  // Navigate to page based on current hash or default
  const validPages = ['dashboard', 'attendance', 'performance', 'history', 'team', 'settings', 'signout'];
  let defaultPage = window.location.hash ? window.location.hash.slice(1) : '';
  if (!validPages.includes(defaultPage)) {
    defaultPage = u.role === 'intern' ? 'attendance' : 'dashboard';
  }

  // Update hash to trigger routing, or force load if already matching
  if (defaultPage === 'performance' && u.role !== 'intern' && sessionStorage.getItem('ap_viewing_nik')) {
    if (sessionStorage.getItem('navigated_to_perf') !== 'true') {
      history.replaceState(null, '', '#team');
      history.pushState(null, '', '#performance');
      sessionStorage.setItem('navigated_to_perf', 'true');
    }
    mapsTo('performance');
  } else if (window.location.hash !== '#' + defaultPage) {
    window.location.hash = defaultPage;
  } else {
    mapsTo(defaultPage);
  }

  // Start clock
  startClock();

  showToast(`Selamat datang kembali, ${u.name}!`, 'success');
}

/* ============================================================
   SECTION 11: LIVE CLOCK
   ============================================================ */

function startClock() {
  function tick() {
    const now = new Date();
    const ts = now.toLocaleTimeString('en-US', { hour12: false });
    const el = document.getElementById('topbar-clock');
    if (el) el.textContent = ts;

    // Attendance page clock
    const ac = document.getElementById('att-clock');
    if (ac) ac.textContent = ts;

    const ad = document.getElementById('att-date');
    if (ad) ad.textContent = now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }
  tick();
  setInterval(tick, 1000);
}

/* ============================================================
   SECTION 12: GPS & CHECK-IN LOGIC
   ============================================================ */

let gpsWatcher = null;

// [API MOCK] Fungsi ini siap dihubungkan ke Endpoint API Koordinat Kantor
async function getOfficeConfigAPI() {
  // Nanti ganti dengan: return await fetch('[https://api.anda.com/office](https://api.anda.com/office)').then(res => res.json());
  return state.officeCoords;
}

// [API MOCK] Fungsi ini membungkus logika GPS yang bisa diganti dengan layanan API Tracking
async function getUserLocationAPI(onSuccess, onError) {
  if (!navigator.geolocation) {
    onError({ code: 0, message: 'GPS tidak didukung.' });
    return null;
  }
  return navigator.geolocation.watchPosition(onSuccess, onError, {
    enableHighAccuracy: true, timeout: 15000, maximumAge: 5000
  });
}

async function startGPS() {
  if (!navigator.geolocation) {
    setGPSState('invalid', 'GPS tidak didukung oleh browser ini.', '—');
    return;
  }

  setGPSState('validation', 'Memvalidasi Lokasi...', 'Menghubungkan ke API…');

  try {
    // 1. Ambil Data Koordinat Kantor dari API
    const office = await getOfficeConfigAPI();

    // 2. Mulai Pelacakan Lokasi Pengguna
    gpsWatcher = await getUserLocationAPI(
      pos => {
        const { latitude: lat, longitude: lng, accuracy } = pos.coords;
        state.gpsPosition = { lat, lng };

        // 3. Kalkulasi jarak berdasarkan data dari API Kantor
        const dist = haversine(lat, lng, office.lat, office.lng);
        const maxR = office.radius;
        const pct = Math.min((dist / (maxR * 2)) * 100, 100);

        updateDistanceBar(pct, dist, maxR);

        if (dist <= maxR) {
          setGPSState('valid', 'GPS Valid — Dalam Radius', `Akurasi: ${Math.round(accuracy)}m`);
          enableCheckin();
        } else {
          setGPSState('invalid', `Di Luar Jangkauan — ${Math.round(dist)}m dari kantor`, `Maks: ${maxR}m`);
          disableCheckin('Di luar radius kantor');
        }
      },
      err => {
        const msgs = {
          0: err.message,
          1: 'Izin lokasi ditolak.',
          2: 'Posisi GPS tidak tersedia.',
          3: 'Permintaan GPS habis waktu.',
        };
        setGPSState('invalid', msgs[err.code] || 'Kesalahan GPS.', '—');
        disableCheckin(msgs[err.code]);
      }
    );

    state.gpsWatchId = gpsWatcher;
  } catch (error) {
    setGPSState('invalid', 'Gagal memuat API GPS', '—');
    disableCheckin('API Error');
  }
}

function stopGPS() {
  if (state.gpsWatchId !== null) {
    navigator.geolocation.clearWatch(state.gpsWatchId);
    state.gpsWatchId = null;
  }
}

function setGPSState(type, text, accuracy) {
  const banner = document.getElementById('gps-banner');
  const gpsText = document.getElementById('gps-text');
  const gpsAcc = document.getElementById('gps-accuracy');
  const icon = document.getElementById('gps-icon');
  if (!banner) return;
  banner.className = `gps-banner ${type}`;
  if (gpsText) gpsText.textContent = text;
  if (gpsAcc) gpsAcc.textContent = accuracy;
  if (icon) icon.textContent = type === 'valid' ? 'location_on' : type === 'invalid' ? 'location_off' : 'my_location';
}

function updateDistanceBar(pct, dist, maxR) {
  const fill = document.getElementById('distance-fill');
  const txt = document.getElementById('distance-text');
  if (fill) {
    fill.style.width = `${pct}%`;
    fill.classList.toggle('far', dist > maxR);
  }
  if (txt) txt.textContent = `${Math.round(dist)}m dari kantor`;
}

function enableCheckin() {
  const btn = document.getElementById('checkin-btn');
  if (!btn) return;
  if (state.todayCheckedOut) {
    btn.disabled = true;
    const lbl = document.getElementById('checkin-btn-label');
    if (lbl) lbl.textContent = 'Selesai Hari Ini';
    return;
  }
  btn.disabled = false;
  const lbl = document.getElementById('checkin-btn-label');
  if (lbl) lbl.textContent = state.todayCheckedIn ? 'Check-Out' : 'Check-In';
}

function disableCheckin(reason) {
  const btn = document.getElementById('checkin-btn');
  if (btn) btn.disabled = true;
}

function handleCheckin() {
  const user = state.currentUser;
  const now = new Date();
  const key = todayKey();

  if (!state.records[user.nik]) state.records[user.nik] = [];
  let todayRec = state.records[user.nik].find(r => r.date === key);

  if (!state.todayCheckedIn) {
    // Determine status: before 9 AM = Hadir, else Terlambat
    const status = now.getHours() < 9 ? 'Hadir' : 'Terlambat';
    if (!todayRec) {
      todayRec = { date: key, timeIn: now.toISOString(), timeOut: null, location: 'HQ - Gerbang A', status };
      state.records[user.nik].unshift(todayRec);
    } else {
      todayRec.timeIn = now.toISOString();
      todayRec.status = status;
    }
    state.todayCheckedIn = true;
    showToast(`Berhasil check-in pukul ${fmtTime12(now)}. Status: ${status}`, 'success');

    // Update status card
    updateStatusCard(`Sedang Bekerja`, `Checked in at ${fmtTime12(now)}`, 'working');

  } else if (!state.todayCheckedOut) {
    // Check-out
    if (todayRec) todayRec.timeOut = now.toISOString();
    state.todayCheckedOut = true;
    showToast(`Berhasil check-out pukul ${fmtTime12(now)}. Selamat beristirahat!`, 'info');
    updateStatusCard('Selesai Bekerja', `Checked out at ${fmtTime12(now)}`, 'idle');
  }

  LS.set('ap_records', state.records);
  refreshRecapTable();
  enableCheckin();
}

function updateStatusCard(value, sub, type) {
  const v = document.getElementById('att-status-value');
  const s = document.getElementById('att-status-sub');
  const card = document.getElementById('att-status-card');
  const iconWrap = card?.querySelector('.status-icon-wrap');
  if (v) v.textContent = value;
  if (s) s.textContent = sub;
  if (v) {
    v.style.color = type === 'working' ? 'var(--green)' : 'var(--text-secondary)';
  }
  if (iconWrap) {
    iconWrap.className = `status-icon-wrap status-${type}`;
    iconWrap.querySelector('.material-symbols-outlined').textContent = type === 'working' ? 'work' : 'check_circle';
  }
}

function refreshRecapTable() {
  const tbody = document.getElementById('recap-body');
  if (!tbody) return;
  const user = state.currentUser;
  const key = todayKey();
  const todayR = (state.records[user.nik] || []).find(r => r.date === key);

  let rows = '';
  if (todayR?.timeIn) {
    rows += `<tr>
      <td style="display:flex;align-items:center;gap:6px;">
        <span class="material-symbols-outlined" style="font-size:16px;color:var(--brand);">login</span> Check-In
      </td>
      <td class="mono">${fmtTime12(new Date(todayR.timeIn))}</td>
      <td>${todayR.location}</td>
      <td><span class="badge badge-green">Sukses</span></td>
    </tr>`;
  }
  if (todayR?.timeOut) {
    rows += `<tr>
      <td style="display:flex;align-items:center;gap:6px;">
        <span class="material-symbols-outlined" style="font-size:16px;color:var(--text-muted);">logout</span> Check-Out
      </td>
      <td class="mono">${fmtTime12(new Date(todayR.timeOut))}</td>
      <td>${todayR.location}</td>
      <td><span class="badge badge-blue">Tercatat</span></td>
    </tr>`;
  }
  if (!rows) rows = `<tr><td colspan="4" class="empty-row">Belum ada aktivitas hari ini.</td></tr>`;
  tbody.innerHTML = rows;
}

/* ============================================================
   SECTION 13: PAGE REFRESH FUNCTIONS
   ============================================================ */

/** --- DASHBOARD --- */
function refreshDashboard() {
  const org = calcOrgMetrics();
  setText('dash-total', org.total);
  setText('dash-present', org.present);
  setText('dash-late', org.late);
  setText('dash-absent', org.absent);
  setText('dash-rate', `${org.rate}% Tingkat Kehadiran`);
  renderDashCharts(org);
  renderDashTable();
}

function renderDashCharts(org) {
  if (typeof Chart === 'undefined') {
    console.warn("Chart.js is not loaded. Skipping chart rendering.");
    return;
  }
  // Trend Chart
  const trendEl = document.getElementById('trendChart');
  if (trendEl) {
    if (state.charts.trend) { state.charts.trend.destroy(); }
    // Build weekly data from all interns' records
    const weeks = ['Minggu 1', 'Minggu 2', 'Minggu 3', 'Minggu 4'];
    const rates = [92, 94, 89, parseFloat(org.rate)]; // last point = today's real rate
    state.charts.trend = new Chart(trendEl, {
      type: 'line',
      data: {
        labels: weeks,
        datasets: [{
          label: 'Tingkat Kehadiran (%)',
          data: rates,
          borderColor: '#c41020',
          backgroundColor: 'rgba(196,16,32,.08)',
          borderWidth: 3,
          tension: .4,
          fill: true,
          pointBackgroundColor: '#c41020',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 6,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { min: 70, max: 100, grid: { color: '#e5bdb9' }, ticks: { font: { family: 'IBM Plex Mono' }, color: '#181c20' } },
          x: { grid: { display: false }, ticks: { font: { family: 'IBM Plex Mono' }, color: '#181c20' } }
        }
      }
    });
  }

  // Status Donut
  const statusEl = document.getElementById('statusChart');
  if (statusEl) {
    if (state.charts.status) { state.charts.status.destroy(); }
    state.charts.status = new Chart(statusEl, {
      type: 'doughnut',
      data: {
        labels: ['Hadir', 'Terlambat', 'Absen'],
        datasets: [{
          data: [org.present - org.late, org.late, org.absent],
          backgroundColor: ['#10b981', '#f59e0b', '#c41020'],
          borderWidth: 0,
          hoverOffset: 6,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        plugins: {
          legend: { position: 'bottom', labels: { font: { family: 'DM Sans', size: 13 }, color: '#181c20', usePointStyle: true, padding: 20 } }
        }
      }
    });
  }
}

function renderDashTable(filter = '') {
  const tbody = document.getElementById('dash-logs-body');
  if (!tbody) return;
  const allNiks = DUMMY_INTERNS.map(u => u.nik);
  if (state.currentUser && !allNiks.includes(state.currentUser.nik)) allNiks.push(state.currentUser.nik);

  const allRecs = [];
  allNiks.forEach(nik => {
    const intern = DUMMY_INTERNS.find(u => u.nik === nik) ||
      (state.currentUser?.nik === nik ? state.currentUser : null);
    const recs = (state.records[nik] || []).slice(0, 5);
    recs.forEach(r => allRecs.push({ ...r, name: intern?.name || nik, nik }));
  });

  allRecs.sort((a, b) => b.date.localeCompare(a.date));
  const filtered = filter
    ? allRecs.filter(r => r.name.toLowerCase().includes(filter.toLowerCase()) || r.nik.toLowerCase().includes(filter.toLowerCase()))
    : allRecs.slice(0, 20);

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="empty-row">Tidak ada catatan ditemukan.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(r => `
    <tr>
      <td><strong>${r.name}</strong></td>
      <td class="mono">${r.nik}</td>
      <td>${fmtDate(parseKey(r.date))}</td>
      <td class="mono">${r.timeIn ? fmtTime12(new Date(r.timeIn)) : '—'}</td>
      <td class="mono">${r.timeOut ? fmtTime12(new Date(r.timeOut)) : '—'}</td>
      <td>${statusBadge(r.status)}</td>
    </tr>
  `).join('');
}

/** --- ATTENDANCE --- */
function refreshAttendance() {
  refreshRecapTable();

  // Restore today's status
  const user = state.currentUser;
  const key = todayKey();
  const todayR = (state.records[user?.nik] || []).find(r => r.date === key);

  if (state.todayCheckedOut) {
    updateStatusCard('Selesai Bekerja', todayR ? `Checked out at ${fmtTime12(new Date(todayR.timeOut))}` : '—', 'idle');
    disableCheckin();
    const lbl = document.getElementById('checkin-btn-label');
    if (lbl) lbl.textContent = 'Selesai Hari Ini';
  } else if (state.todayCheckedIn) {
    updateStatusCard('Sedang Bekerja', todayR ? `Checked in at ${fmtTime12(new Date(todayR.timeIn))}` : '—', 'working');
  } else {
    updateStatusCard('Belum Check-In', '—', 'idle');
  }

  // Start GPS on attendance page
  stopGPS();
  startGPS();
}

/** --- PERFORMANCE --- */
function refreshPerformance() {
  const user = state.currentUser;
  const isIntern = user?.role === 'intern';

  // Admin can drill into a specific intern's record via viewInternPerf()
  const viewingNik = state._viewingNik || sessionStorage.getItem('ap_viewing_nik') || null;
  const targetNik  = (isIntern || !viewingNik) ? user.nik : viewingNik;
  const targetUser = viewingNik ? (DUMMY_INTERNS.find(u => u.nik === viewingNik) || user) : user;

  const displayName = isIntern ? user.name
    : viewingNik ? targetUser.name
    : 'Organisasi';
  const displayRole = isIntern
    ? `${user.role.charAt(0).toUpperCase() + user.role.slice(1)} · Angkatan ${user.cohort || '2024'}`
    : viewingNik ? `Intern · ${targetUser.nik}`
    : 'Semua Intern · Angkatan 2024';

  setText('perf-name', displayName);
  setText('perf-role', displayRole);

  const backBtn = document.getElementById('perf-back-btn');
  if (backBtn) {
    if (!isIntern && viewingNik) {
      backBtn.style.display = 'inline-flex';
    } else {
      backBtn.style.display = 'none';
    }
  }

  const m = calcMetrics(targetNik);
  setText('perf-streak', `${m.streak}`);
  setText('perf-ontime', `${m.onTimePct}%`);
  setText('perf-hours', m.totalHours);

  const bar = document.getElementById('perf-ontime-bar');
  if (bar) bar.style.width = `${m.onTimePct}%`;

  renderPerfChart(targetNik);

  // Reset drill-down key after rendering
  state._viewingNik = null;

  // Show/hide manual entry button
  const manualBtn = document.getElementById('manual-entry-btn');
  if (manualBtn) manualBtn.style.display = isIntern ? 'none' : '';
}

function renderPerfChart(nik) {
  if (typeof Chart === 'undefined') {
    console.warn("Chart.js is not loaded. Skipping chart rendering.");
    return;
  }
  const el = document.getElementById('perfChart');
  if (!el) return;
  if (state.charts.perf) { state.charts.perf.destroy(); }

  const user = state.currentUser;
  const targetNik = nik || user.nik;
  const recs = (state.records[targetNik] || [])
    .filter(r => r.date <= todayKey())
    .slice(0, 14)
    .reverse();

  const labels = recs.map(r => {
    const d = parseKey(r.date);
    return `${d.getDate()}/${d.getMonth() + 1}`;
  });

  const dataPresent = recs.map(r => (r.status === 'Hadir' || r.status === 'WFH') ? 1 : 0);
  const dataTerlambat = recs.map(r => r.status === 'Terlambat' ? 1 : 0);

  state.charts.perf = new Chart(el, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'Tepat Waktu', data: dataPresent, backgroundColor: '#10b981', borderRadius: 4 },
        { label: 'Terlambat', data: dataTerlambat, backgroundColor: '#f59e0b', borderRadius: 4 },
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { stacked: true, grid: { display: false }, ticks: { font: { family: 'IBM Plex Mono' } } },
        y: { stacked: true, max: 1, display: false },
      },
      plugins: {
        legend: { position: 'bottom', labels: { font: { family: 'DM Sans', size: 13 }, usePointStyle: true, padding: 20 } }
      }
    }
  });
}

/** --- HISTORY --- */
let historyAllRecords = [];

function refreshHistory(page = 1) {
  state.historyPage = page;
  const user = state.currentUser;
  const isAdmin = user?.role !== 'intern';
  const filterVal = document.getElementById('history-filter')?.value || '30';
  const search = (document.getElementById('history-search')?.value || '').toLowerCase();

  setText('history-subtitle', isAdmin ? 'Log kehadiran organisasi.' : 'Log kehadiran lengkap Anda.');

  // Gather records
  let recs = [];
  if (isAdmin) {
    const allNiks = DUMMY_INTERNS.map(u => u.nik);
    allNiks.forEach(nik => {
      const intern = DUMMY_INTERNS.find(u => u.nik === nik);
      (state.records[nik] || []).forEach(r => recs.push({ ...r, name: intern?.name || nik, nik }));
    });
  } else {
    recs = (state.records[user.nik] || []).map(r => ({ ...r, name: user.name, nik: user.nik }));
  }

  // Date filter
  const cutoff = new Date();
  if (filterVal !== 'all') {
    cutoff.setDate(cutoff.getDate() - parseInt(filterVal));
    recs = recs.filter(r => parseKey(r.date) >= cutoff);
  }

  // Search
  if (search) {
    recs = recs.filter(r =>
      (r.name || '').toLowerCase().includes(search) ||
      (r.nik || '').toLowerCase().includes(search) ||
      r.date.includes(search)
    );
  }

  recs.sort((a, b) => b.date.localeCompare(a.date));
  historyAllRecords = recs;

  // Pagination
  const total = recs.length;
  const pageSize = state.historyPageSize;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const pg = Math.min(page, pages);
  const slice = recs.slice((pg - 1) * pageSize, pg * pageSize);

  setText('history-count', `Menampilkan ${Math.min((pg - 1) * pageSize + 1, total)}–${Math.min(pg * pageSize, total)} dari ${total} log`);

  // Render table (add name/nik columns for admin)
  const tbody = document.getElementById('history-body');
  const thead = document.querySelector('#history-table thead tr');
  if (thead && isAdmin && !thead.querySelector('.col-name')) {
    thead.insertAdjacentHTML('afterbegin',
      '<th class="col-name">Nama</th><th>NIK</th>'
    );
  }

  if (slice.length === 0) {
    tbody.innerHTML = `<tr><td colspan="${isAdmin ? 7 : 5}" class="empty-row">Tidak ada catatan ditemukan.</td></tr>`;
  } else {
    tbody.innerHTML = slice.map(r => `
      <tr>
        ${isAdmin ? `<td><strong>${r.name}</strong></td><td class="mono">${r.nik}</td>` : ''}
        <td>${fmtDate(parseKey(r.date))}</td>
        <td class="mono">${r.timeIn ? fmtTime12(new Date(r.timeIn)) : '<span style="opacity:.4">—</span>'}</td>
        <td class="mono">${r.timeOut ? fmtTime12(new Date(r.timeOut)) : '<span style="opacity:.4">—</span>'}</td>
        <td>${r.location || 'N/A'}</td>
        <td class="text-right">${statusBadge(r.status)}</td>
      </tr>
    `).join('');
  }

  // Pagination buttons
  renderPagination('history-pagination', pg, pages, p => refreshHistory(p));
}

/** --- TEAM --- */
function refreshTeam() {
  renderTeamTable();
}

function renderTeamTable(filter = '') {
  const tbody = document.getElementById('team-body');
  if (!tbody) return;

  const interns = DUMMY_INTERNS.filter(u =>
    !filter || u.name.toLowerCase().includes(filter) || u.nik.toLowerCase().includes(filter)
  );
  const key = todayKey();

  if (interns.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="empty-row">Tidak ada intern ditemukan.</td></tr>`;
    return;
  }

  tbody.innerHTML = interns.map(intern => {
    const m = calcMetrics(intern.nik);
    const todayR = (state.records[intern.nik] || []).find(r => r.date === key);
    const todayStatus = todayR ? todayR.status : 'Tidak Hadir';
    return `<tr>
      <td><strong>${intern.name}</strong></td>
      <td class="mono">${intern.nik}</td>
      <td>${m.streak} hari</td>
      <td>${m.onTimePct}%</td>
      <td>${statusBadge(todayStatus)}</td>
      <td>
        <button class="btn-text" onclick="viewInternPerf('${intern.nik}')">Lihat →</button>
        <button class="btn-text" onclick="exportInternCSV('${intern.nik}')" title="Ekspor CSV" style="margin-left: 8px;">
          <span class="material-symbols-outlined" style="font-size: 16px; vertical-align: middle;">download</span> CSV
        </button>
        <button class="btn-text" onclick="exportInternPDF('${intern.nik}')" title="Ekspor PDF" style="margin-left: 8px; color: var(--brand);">
          <span class="material-symbols-outlined" style="font-size: 16px; vertical-align: middle;">picture_as_pdf</span> PDF
        </button>
      </td>
    </tr>`;
  }).join('');
}

function viewInternPerf(nik) {
  const intern = DUMMY_INTERNS.find(u => u.nik === nik);
  if (!intern) return;
  // Temporarily set as viewing subject then go to performance
  state._viewingNik = nik;
  sessionStorage.setItem('ap_viewing_nik', nik);
  window.location.hash = 'performance';
}

/** --- SETTINGS --- */
function refreshSettings() {
  const u = state.currentUser;
  if (!u) return;
  setText('settings-name', u.name);
  setText('settings-role-display', u.role.charAt(0).toUpperCase() + u.role.slice(1));
  setText('settings-nik', u.nik);

  const av = document.getElementById('settings-avatar');
  if (av) av.textContent = initials(u.name);
}

/* ============================================================
   SECTION 14: CHART.JS — PERFORMANCE (org view)
   ============================================================ */

function refreshPerfChartForOrg() {
  if (typeof Chart === 'undefined') {
    console.warn("Chart.js is not loaded. Skipping chart rendering.");
    return;
  }
  const el = document.getElementById('perfChart');
  if (!el) return;
  if (state.charts.perf) { state.charts.perf.destroy(); }

  // Aggregate weekly attendance across all interns
  const weeks = { 'Minggu 1': { p: 0, t: 0 }, 'Minggu 2': { p: 0, t: 0 }, 'Minggu 3': { p: 0, t: 0 }, 'Minggu 4': { p: 0, t: 0 } };
  DUMMY_INTERNS.forEach(intern => {
    (state.records[intern.nik] || []).slice(0, 28).forEach((r, i) => {
      const w = `Minggu ${4 - Math.floor(i / 7)}`;
      if (!weeks[w]) return;
      if (r.status === 'Hadir' || r.status === 'WFH') weeks[w].p++;
      if (r.status === 'Terlambat') weeks[w].t++;
    });
  });

  const labels = Object.keys(weeks);
  const pData = labels.map(k => weeks[k].p);
  const tData = labels.map(k => weeks[k].t);

  state.charts.perf = new Chart(el, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'Tepat Waktu', data: pData, backgroundColor: '#10b981', borderRadius: 6 },
        { label: 'Terlambat', data: tData, backgroundColor: '#f59e0b', borderRadius: 6 },
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { stacked: true, grid: { display: false }, ticks: { font: { family: 'IBM Plex Mono' } } },
        y: { stacked: true, grid: { color: '#e5bdb9' }, ticks: { font: { family: 'IBM Plex Mono' } } },
      },
      plugins: {
        legend: { position: 'bottom', labels: { font: { family: 'DM Sans', size: 13 }, usePointStyle: true, padding: 20 } }
      }
    }
  });
}

/* ============================================================
   SECTION 15: TOAST NOTIFICATIONS
   ============================================================ */

const TOAST_ICONS = {
  success: 'check_circle',
  error: 'error',
  info: 'info',
  warning: 'warning',
};

/**
 * Show a toast notification.
 * @param {string} message
 * @param {'success'|'error'|'info'|'warning'} type
 * @param {number} duration ms
 */
function showToast(message, type = 'info', duration = 3500) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.innerHTML = `
    <span class="material-symbols-outlined" style="font-variation-settings:'FILL' 1;">${TOAST_ICONS[type]}</span>
    <span>${message}</span>
  `;
  container.appendChild(el);

  setTimeout(() => {
    el.classList.add('removing');
    el.addEventListener('animationend', () => el.remove());
  }, duration);
}

/* ============================================================
   SECTION 16: PAGINATION HELPER
   ============================================================ */

function renderPagination(containerId, currentPage, totalPages, onPageClick) {
  const el = document.getElementById(containerId);
  if (!el) return;

  let html = `<button class="page-btn" ${currentPage === 1 ? 'disabled' : ''} data-p="${currentPage - 1}">
    <span class="material-symbols-outlined" style="font-size:18px;">chevron_left</span>
  </button>`;

  const range = paginationRange(currentPage, totalPages);
  range.forEach(p => {
    if (p === '…') {
      html += `<span style="padding:0 4px;color:var(--text-muted)">…</span>`;
    } else {
      html += `<button class="page-btn ${p === currentPage ? 'active' : ''}" data-p="${p}">${p}</button>`;
    }
  });

  html += `<button class="page-btn" ${currentPage === totalPages ? 'disabled' : ''} data-p="${currentPage + 1}">
    <span class="material-symbols-outlined" style="font-size:18px;">chevron_right</span>
  </button>`;

  el.innerHTML = html;
  el.querySelectorAll('.page-btn:not(:disabled)').forEach(btn => {
    btn.addEventListener('click', () => onPageClick(parseInt(btn.dataset.p)));
  });
}

function paginationRange(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, '…', total];
  if (current >= total - 3) return [1, '…', total - 4, total - 3, total - 2, total - 1, total];
  return [1, '…', current - 1, current, current + 1, '…', total];
}

/* ============================================================
   SECTION 17: BADGE HELPER
   ============================================================ */

function statusBadge(status) {
  const map = {
    'Hadir': 'badge-green',
    'Terlambat': 'badge-amber',
    'WFH': 'badge-blue',
    'Izin': 'badge-gray',
    'Sakit': 'badge-gray',
    'Tidak Hadir': 'badge-red',
    'Present': 'badge-green',
    'Late': 'badge-amber',
    'Excused': 'badge-gray',
    'WFH (Remote)': 'badge-blue',
    'Absent': 'badge-red',
  };
  const cls = map[status] || 'badge-gray';
  return `<span class="badge ${cls}">${status}</span>`;
}

/* ============================================================
   SECTION 17b: EXPORT UTILITIES
   ============================================================ */

/** Export attendance records to CSV for a list of NIKs */
function exportAttendanceToCSV(niks, filename) {
  const allRecs = [];
  const user = state.currentUser;
  niks.forEach(nik => {
    const who = DUMMY_INTERNS.find(u => u.nik === nik) || (user?.nik === nik ? user : null);
    if (!who) return;
    (state.records[nik] || []).forEach(r => {
      allRecs.push([
        r.date,
        who.name || nik,
        nik,
        r.timeIn  ? fmtTime12(new Date(r.timeIn))  : '—',
        r.timeOut ? fmtTime12(new Date(r.timeOut)) : '—',
        r.location || 'N/A',
        r.status,
      ]);
    });
  });
  allRecs.sort((a, b) => b[0].localeCompare(a[0]));
  const headers = ['Tanggal', 'Nama', 'NIK', 'Waktu Masuk', 'Waktu Keluar', 'Lokasi', 'Status'];
  const csv = [headers, ...allRecs].map(row => row.map(c => `"${c}"`).join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Laporan CSV berhasil diunduh!', 'success');
}

/** Row-level intern CSV export */
function exportInternCSV(nik) {
  const intern = DUMMY_INTERNS.find(u => u.nik === nik);
  if (!intern) return;
  const filename = `laporan_kehadiran_${intern.name.replace(/\s+/g, '_')}_${todayKey()}.csv`;
  exportAttendanceToCSV([nik], filename);
}

/** Export attendance records to PDF for a list of NIKs */
function exportAttendanceToPDF(niks, filename, titleText = 'Laporan Kehadiran') {
  if (!window.jspdf) {
    showToast('Library PDF belum siap atau gagal dimuat.', 'error');
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const allRecs = [];
  const user = state.currentUser;

  // Collect data
  niks.forEach(nik => {
    const who = DUMMY_INTERNS.find(u => u.nik === nik) || (user?.nik === nik ? user : null);
    if (!who) return;
    (state.records[nik] || []).forEach(r => {
      allRecs.push({
        date: r.date,
        name: who.name || nik,
        nik: nik,
        timeIn: r.timeIn ? fmtTime12(new Date(r.timeIn)) : '—',
        timeOut: r.timeOut ? fmtTime12(new Date(r.timeOut)) : '—',
        location: r.location || 'N/A',
        status: r.status,
      });
    });
  });

  // Sort descending by date
  allRecs.sort((a, b) => b.date.localeCompare(a.date));

  // PDF Page Width: 210mm, Height: 297mm
  const marginX = 15;
  let currentY = 15;

  // Header Title
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(30, 41, 59); // Slate 800
  doc.text(titleText.toUpperCase(), marginX, currentY);
  currentY += 6;

  // Subtitle
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139); // Slate 500
  doc.text('PILLAR MANAGEMENT SYSTEM — LAPORAN KEHADIRAN MAGANG', marginX, currentY);
  currentY += 4;

  // Thin line
  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.setLineWidth(0.5);
  doc.line(marginX, currentY, 210 - marginX, currentY);
  currentY += 8;

  // Metadata Section
  doc.setFontSize(10);
  if (niks.length === 1) {
    const targetNik = niks[0];
    const who = DUMMY_INTERNS.find(u => u.nik === targetNik) || (user?.nik === targetNik ? user : null);
    const m = calcMetrics(targetNik);

    // Left Column Info
    doc.setFont('Helvetica', 'bold');
    doc.setTextColor(71, 85, 105); // Slate 600
    doc.text('Informasi Intern:', marginX, currentY);
    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(30, 41, 59);
    doc.text(`Nama: ${who.name}`, marginX, currentY + 5);
    doc.text(`NIK: ${who.nik}`, marginX, currentY + 10);
    doc.text(`Cohort: ${who.cohort || '2024'}`, marginX, currentY + 15);

    // Right Column Info
    doc.setFont('Helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('Ringkasan Kinerja:', 120, currentY);
    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(30, 41, 59);
    doc.text(`Total Kehadiran: ${m.presentDays} hari`, 120, currentY + 5);
    doc.text(`Tepat Waktu: ${m.onTimePct}%`, 120, currentY + 10);
    doc.text(`Total Jam Kerja: ${m.totalHours} jam`, 120, currentY + 15);

    currentY += 23;
  } else {
    // Team Report Info
    doc.setFont('Helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('Informasi Laporan Tim:', marginX, currentY);
    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(30, 41, 59);
    doc.text(`Tipe Laporan: Seluruh Anggota Tim`, marginX, currentY + 5);
    doc.text(`Total Anggota: ${niks.length} Intern`, marginX, currentY + 10);
    doc.text(`Tanggal Cetak: ${fmtDate(new Date())}`, marginX, currentY + 15);

    // Summary stats for team
    const totalRecords = allRecs.length;
    const totalPresent = allRecs.filter(r => r.status === 'Hadir' || r.status === 'WFH').length;
    const totalLate = allRecs.filter(r => r.status === 'Terlambat').length;
    const pctOnTime = totalPresent + totalLate > 0 ? (((totalPresent) / (totalPresent + totalLate)) * 100).toFixed(1) : '0.0';

    doc.setFont('Helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('Statistik Kehadiran Tim:', 120, currentY);
    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(30, 41, 59);
    doc.text(`Total Log Data: ${totalRecords} Entri`, 120, currentY + 5);
    doc.text(`Kehadiran Tepat Waktu: ${totalPresent} kali`, 120, currentY + 10);
    doc.text(`Kehadiran Terlambat: ${totalLate} kali (${pctOnTime}% tepat waktu)`, 120, currentY + 15);

    currentY += 23;
  }

  // Draw table using AutoTable
  const headers = niks.length === 1 
    ? [['Tanggal', 'Waktu Masuk', 'Waktu Keluar', 'Lokasi', 'Status']]
    : [['Tanggal', 'Nama', 'NIK', 'Waktu Masuk', 'Waktu Keluar', 'Lokasi', 'Status']];

  const tableData = allRecs.map(r => {
    const formattedDate = fmtDate(parseKey(r.date));
    return niks.length === 1
      ? [formattedDate, r.timeIn, r.timeOut, r.location, r.status]
      : [formattedDate, r.name, r.nik, r.timeIn, r.timeOut, r.location, r.status];
  });

  doc.autoTable({
    startY: currentY,
    head: headers,
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [30, 41, 59], // Slate 800
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'left',
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [51, 65, 85], // Slate 700
    },
    didParseCell: function(data) {
      if (data.section === 'body' && data.column.index === headers[0].length - 1) {
        const val = data.cell.raw;
        if (val === 'Hadir' || val === 'WFH') {
          data.cell.styles.textColor = [21, 128, 61]; // Green 700
        } else if (val === 'Terlambat') {
          data.cell.styles.textColor = [180, 83, 9]; // Amber 700
        } else if (val === 'Tidak Hadir' || val === 'Absen') {
          data.cell.styles.textColor = [196, 16, 32]; // Red / Brand 700
        } else if (val === 'Izin' || val === 'Sakit') {
          data.cell.styles.textColor = [100, 116, 139]; // Slate 500
        }
      }
    },
    margin: { left: marginX, right: marginX },
    styles: { font: 'Helvetica' },
    didDrawPage: function(data) {
      const totalPages = doc.internal.getNumberOfPages();
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184); // Slate 400
      
      const str = `Halaman ${data.pageNumber} dari ${totalPages}`;
      doc.text(str, data.settings.margin.left, doc.internal.pageSize.height - 10);
      
      const printTime = new Date().toLocaleString('id-ID');
      doc.text(`Dicetak pada: ${printTime}`, doc.internal.pageSize.width - data.settings.margin.right - 55, doc.internal.pageSize.height - 10);
    }
  });

  doc.save(filename);
  showToast('Laporan PDF berhasil diunduh!', 'success');
}

/** Row-level intern PDF export */
function exportInternPDF(nik) {
  const intern = DUMMY_INTERNS.find(u => u.nik === nik);
  if (!intern) return;
  const filename = `laporan_kehadiran_${intern.name.replace(/\s+/g, '_')}_${todayKey()}.pdf`;
  exportAttendanceToPDF([nik], filename, `Laporan Kehadiran - ${intern.name}`);
}

/* ============================================================
   SECTION 18: DOM HELPERS
   ============================================================ */

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

/* ============================================================
   SECTION 19: SIDEBAR MOBILE
   ============================================================ */

function openSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (sidebar && !sidebar.classList.contains('open')) {
    sidebar.classList.add('open');
    const overlay = document.getElementById('sidebar-overlay');
    if (overlay) overlay.classList.add('visible');
    history.pushState({ sidebar: 'open' }, '');
  }
}
function closeSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (sidebar && sidebar.classList.contains('open')) {
    sidebar.classList.remove('open');
    const overlay = document.getElementById('sidebar-overlay');
    if (overlay) overlay.classList.remove('visible');
    if (history.state && history.state.sidebar === 'open') {
      history.back();
    }
  }
}

/* ============================================================
   SECTION 20: EVENT LISTENERS — BOOTSTRAP
   ============================================================ */

function initApp() {
  console.log("initApp() starting, binding listeners...");
  // ── Init login form
  initLogin();

  // ── Menu button (mobile)
  document.getElementById('menu-btn').addEventListener('click', openSidebar);
  document.getElementById('sidebar-overlay').addEventListener('click', closeSidebar);

  // ── Sidebar nav links
  document.querySelectorAll('.nav-link[data-page]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const targetPage = link.dataset.page;
      const sidebar = document.getElementById('sidebar');
      if (sidebar && sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
        const overlay = document.getElementById('sidebar-overlay');
        if (overlay) overlay.classList.remove('visible');
        if (history.state && history.state.sidebar === 'open') {
          history.back();
          setTimeout(() => {
            window.location.hash = targetPage;
          }, 50);
          return;
        }
      }
      window.location.hash = targetPage;
    });
  });

  // ── Bottom nav links
  document.querySelectorAll('.bottom-nav-item[data-page]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      window.location.hash = link.dataset.page;
    });
  });

  // ── Check-In button
  document.getElementById('checkin-btn').addEventListener('click', handleCheckin);

  // ── Logout
  document.getElementById('logout-btn')?.addEventListener('click', () => {
    window.location.hash = 'signout';
  });
  document.getElementById('confirm-logout-btn')?.addEventListener('click', logout);

  // ── Manual entry modal
  const manualBtn = document.getElementById('manual-entry-btn');
  const modal = document.getElementById('manual-modal');
  const closeBtn = document.getElementById('modal-close-btn');
  const cancelBtn = document.getElementById('modal-cancel-btn');
  const manualForm = document.getElementById('manual-entry-form');

  if (manualBtn) {
    manualBtn.addEventListener('click', () => {
      // Pre-fill today's date
      const dateEl = document.getElementById('me-date');
      if (dateEl) dateEl.value = todayKey();
      modal.style.display = 'flex';
      history.pushState({ modal: 'manual' }, '');
    });
  }
  const closeModal = () => {
    modal.style.display = 'none';
    if (history.state && history.state.modal === 'manual') {
      history.back();
    }
  };
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
  if (modal) {
    modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  }

  if (manualForm) {
    manualForm.addEventListener('submit', e => {
      e.preventDefault();
      const nik = document.getElementById('me-intern').value.trim().toUpperCase();
      const date = document.getElementById('me-date').value;
      const timeIn = document.getElementById('me-timein').value;
      const timeOut = document.getElementById('me-timeout').value;
      const status = document.getElementById('me-status').value;

      if (!nik || !date || !timeIn) {
        showToast('Isi bidang yang diwajibkan.', 'error');
        return;
      }

      if (!state.records[nik]) state.records[nik] = [];
      const existing = state.records[nik].findIndex(r => r.date === date);
      const rec = {
        date,
        timeIn: timeIn ? new Date(`${date}T${timeIn}:00`).toISOString() : null,
        timeOut: timeOut ? new Date(`${date}T${timeOut}:00`).toISOString() : null,
        location: 'HQ - Manual Entry',
        status,
      };

      if (existing >= 0) state.records[nik][existing] = rec;
      else state.records[nik].unshift(rec);

      state.records[nik].sort((a, b) => b.date.localeCompare(a.date));
      LS.set('ap_records', state.records);
      modal.style.display = 'none';
      manualForm.reset();
      if (history.state && history.state.modal === 'manual') {
        history.back();
      }
      showToast('Entri berhasil disimpan.', 'success');
    });
  }

  // ── Dashboard table search
  const dashSearch = document.getElementById('dash-table-search');
  if (dashSearch) {
    dashSearch.addEventListener('input', () => renderDashTable(dashSearch.value));
  }

  // ── History filter + search
  const histFilter = document.getElementById('history-filter');
  const histSearch = document.getElementById('history-search');
  if (histFilter) histFilter.addEventListener('change', () => refreshHistory(1));
  if (histSearch) histSearch.addEventListener('input', () => refreshHistory(1));

  // ── Team search
  const teamSearch = document.getElementById('team-search');
  if (teamSearch) teamSearch.addEventListener('input', () => renderTeamTable(teamSearch.value.toLowerCase()));

  // ── Export report button
  const exportBtn = document.getElementById('export-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const user = state.currentUser;
      const isIntern = user?.role === 'intern';
      const viewingNik = sessionStorage.getItem('ap_viewing_nik');
      const targetNik = (isIntern || !viewingNik) ? user.nik : viewingNik;
      const targetUser = DUMMY_INTERNS.find(u => u.nik === targetNik) || (user?.nik === targetNik ? user : null);
      const namePart = targetUser ? targetUser.name.replace(/\s+/g, '_') : 'tim';
      const filename = `laporan_kehadiran_${namePart}_${todayKey()}.csv`;
      exportAttendanceToCSV([targetNik], filename);
    });
  }

  // ── Export PDF button
  const exportPdfBtn = document.getElementById('export-pdf-btn');
  if (exportPdfBtn) {
    exportPdfBtn.addEventListener('click', () => {
      const user = state.currentUser;
      const isIntern = user?.role === 'intern';
      const viewingNik = sessionStorage.getItem('ap_viewing_nik');
      const targetNik = (isIntern || !viewingNik) ? user.nik : viewingNik;
      const targetUser = DUMMY_INTERNS.find(u => u.nik === targetNik) || (user?.nik === targetNik ? user : null);
      const namePart = targetUser ? targetUser.name.replace(/\s+/g, '_') : 'tim';
      const filename = `laporan_kehadiran_${namePart}_${todayKey()}.pdf`;
      exportAttendanceToPDF([targetNik], filename, `Laporan Kehadiran - ${targetUser ? targetUser.name : 'Intern'}`);
    });
  }

  // ── Team export button
  const teamExportBtn = document.getElementById('team-export-btn');
  if (teamExportBtn) {
    teamExportBtn.addEventListener('click', () => {
      const niks = DUMMY_INTERNS.map(u => u.nik);
      const filename = `laporan_kehadiran_tim_${todayKey()}.csv`;
      exportAttendanceToCSV(niks, filename);
    });
  }

  // ── Team export PDF button
  const teamExportPdfBtn = document.getElementById('team-export-pdf-btn');
  if (teamExportPdfBtn) {
    teamExportPdfBtn.addEventListener('click', () => {
      const niks = DUMMY_INTERNS.map(u => u.nik);
      const filename = `laporan_kehadiran_tim_${todayKey()}.pdf`;
      exportAttendanceToPDF(niks, filename, 'Laporan Kehadiran Tim Magang');
    });
  }

  // ── Notification button (demo)
  document.getElementById('notif-btn')?.addEventListener('click', () => {
    showToast('Tidak ada notifikasi baru.', 'info');
  });

  // ── Tombol Jadwal (Jam) di Kanan Atas
  document.getElementById('schedule-btn')?.addEventListener('click', () => {
    showToast('Fitur Jadwal Shift (via API) segera hadir!', 'info');
  });

  // ── Shortcut ke Pengaturan Akun
  document.getElementById('sidebar-user-wrap')?.addEventListener('click', () => {
    const sidebar = document.getElementById('sidebar');
    if (sidebar && sidebar.classList.contains('open')) {
      sidebar.classList.remove('open');
      const overlay = document.getElementById('sidebar-overlay');
      if (overlay) overlay.classList.remove('visible');
      if (history.state && history.state.sidebar === 'open') {
        history.back();
        setTimeout(() => {
          window.location.hash = 'settings';
        }, 50);
        return;
      }
    }
    window.location.hash = 'settings';
  });
  document.getElementById('topbar-avatar')?.addEventListener('click', () => {
    window.location.hash = 'settings';
  });

  // ── Tombol Kembali Kinerja Tim
  document.getElementById('perf-back-btn')?.addEventListener('click', () => {
    history.back();
  });

  // ── Global popstate listener for back key support on overlays
  window.addEventListener('popstate', (e) => {
    const stateObj = e.state;

    // Check if manual entry modal is open and should be closed
    const modal = document.getElementById('manual-modal');
    if (modal && modal.style.display === 'flex' && (!stateObj || stateObj.modal !== 'manual')) {
      modal.style.display = 'none';
      document.getElementById('manual-entry-form')?.reset();
    }

    // Check if sidebar is open and should be closed
    const sidebar = document.getElementById('sidebar');
    if (sidebar && sidebar.classList.contains('open') && (!stateObj || stateObj.sidebar !== 'open')) {
      sidebar.classList.remove('open');
      const overlay = document.getElementById('sidebar-overlay');
      if (overlay) overlay.classList.remove('visible');
    }
  });

  // ── Check for persisted session
  const savedUser = LS.get('ap_user');
  if (savedUser) {
    state.currentUser = savedUser;
    state.records = LS.get('ap_records', {});
    ensureAllRecords();
    bootApp();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

/**
 * server.js — Backend API untuk Tel Intern Absensi
 * ================================================
 * Express REST API dengan autentikasi JWT.
 * Data disimpan di file JSON (tidak butuh database eksternal).
 *
 * ENDPOINT:
 *   POST /api/auth/login          — Login untuk semua role
 *   POST /api/auth/register       — Registrasi intern baru (role dikunci ke 'intern')
 *   GET  /api/auth/verify         — Verifikasi token JWT
 *
 *   GET  /api/admin/users         — [admin/manager] Lihat semua user
 *   POST /api/admin/users         — [admin] Tambah user manual (admin/manager)
 *   PUT  /api/admin/users/:id     — [admin] Edit user
 *   DELETE /api/admin/users/:id   — [admin] Hapus user
 *   POST /api/admin/reset-password — [admin] Reset password user
 */

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

// ============================================================
// KONFIGURASI — GANTI JWT_SECRET DENGAN STRING ACAK YANG KUAT!
// ============================================================
const JWT_SECRET = process.env.JWT_SECRET || 'RAHASIA_SUPER_KUAT_GANTI_INI_SEKARANG_2026!';
const JWT_EXPIRES_IN = '8h'; // Token expired setelah 8 jam (satu hari kerja)
const BCRYPT_ROUNDS = 10;

// ============================================================
// MIDDLEWARE
// ============================================================
app.use(cors({
  origin: [
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'http://localhost:8080',
    'http://127.0.0.1:8080',
    'http://localhost:3000',
    'null', // Untuk file:// (development langsung buka HTML)
  ],
  credentials: true,
}));

app.use(express.json());

// Request logger
app.use((req, res, next) => {
  const ts = new Date().toISOString();
  console.log(`[${ts}] ${req.method} ${req.path}`);
  next();
});

// ============================================================
// HELPERS — DATABASE (Dialihkan ke db.js)
// ============================================================
// Semua operasi database dipindahkan ke ./db.js asinkron.

// ============================================================
// MIDDLEWARE — AUTENTIKASI JWT
// ============================================================

/** Middleware: wajib login (token JWT valid) */
function requireAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Tidak terautentikasi. Silakan login terlebih dahulu.'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, nik, name, role }
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'Token tidak valid atau sudah kadaluarsa. Silakan login ulang.'
    });
  }
}

/** Middleware: khusus admin saja */
function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Akses ditolak. Hanya admin yang dapat melakukan tindakan ini.'
    });
  }
  next();
}

/** Middleware: admin atau manager */
function requireAdminOrManager(req, res, next) {
  const allowed = ['admin', 'manager'];
  if (!allowed.includes(req.user?.role)) {
    return res.status(403).json({
      success: false,
      error: 'Akses ditolak. Hanya admin dan manager yang dapat melihat data ini.'
    });
  }
  next();
}

// ============================================================
// ROUTES — AUTH
// ============================================================

/**
 * POST /api/auth/login
 * Body: { nik, password }
 *
 * Validasi NIK + password terhadap database.
 * TIDAK BISA memilih role — role sudah dikunci di database.
 * Ini mencegah orang ngaku-ngaku jadi manager/admin.
 */
app.post('/api/auth/login', async (req, res) => {
  try {
    const { nik, password } = req.body;

    // Validasi input
    if (!nik || !password) {
      return res.status(400).json({
        success: false,
        error: 'NIK dan password wajib diisi.'
      });
    }

    // Cari user di database
    const user = await db.findUserByNIK(nik.trim());
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'NIK tidak ditemukan. Pastikan NIK Anda benar atau hubungi admin.'
      });
    }

    // Cek apakah akun aktif
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: 'Akun Anda telah dinonaktifkan. Hubungi admin.'
      });
    }

    // Verifikasi password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Password salah. Silakan coba lagi.'
      });
    }

    // Buat JWT token — role diambil dari DATABASE, bukan dari input user
    const tokenPayload = {
      id: user.id,
      nik: user.nik,
      name: user.name,
      role: user.role, // << DIKUNCI DARI DATABASE, tidak bisa dimanipulasi
      cohort: user.cohort,
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    // Response sukses
    return res.json({
      success: true,
      message: `Selamat datang, ${user.name}!`,
      token,
      user: {
        id: user.id,
        name: user.name,
        nik: user.nik,
        role: user.role, // Role dari database, tidak bisa dipalsukan
        cohort: user.cohort,
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, error: 'Terjadi kesalahan server.' });
  }
});

/**
 * POST /api/auth/register
 * Body: { name, nik, password }
 *
 * Pendaftaran mandiri KHUSUS INTERN.
 * Role otomatis dikunci ke 'intern' — tidak bisa memilih role lain.
 * NIK yang sudah dipakai tidak bisa didaftarkan ulang.
 */
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, nik, password } = req.body;

    // Validasi input
    if (!name || !nik || !password) {
      return res.status(400).json({
        success: false,
        error: 'Nama, NIK, dan password wajib diisi.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password minimal 6 karakter.'
      });
    }

    const nikUpper = nik.trim().toUpperCase();

    // Cek apakah NIK sudah terdaftar
    const existing = await db.findUserByNIK(nikUpper);
    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'NIK sudah terdaftar. Jika Anda lupa password, hubungi admin.'
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    // Buat user baru — ROLE DIKUNCI KE 'intern'
    const newUser = {
      id: `usr_intern_${uuidv4().slice(0, 8)}`,
      name: name.trim(),
      nik: nikUpper,
      role: 'intern', // << TIDAK BISA DIUBAH OLEH USER SENDIRI
      passwordHash,
      cohort: new Date().getFullYear().toString(),
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    // Simpan ke database
    await db.addUser(newUser);

    // Buat token langsung (auto-login setelah register)
    const token = jwt.sign(
      { id: newUser.id, nik: newUser.nik, name: newUser.name, role: newUser.role, cohort: newUser.cohort },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.status(201).json({
      success: true,
      message: 'Akun berhasil dibuat! Selamat datang.',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        nik: newUser.nik,
        role: newUser.role,
        cohort: newUser.cohort,
      }
    });

  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ success: false, error: 'Terjadi kesalahan server.' });
  }
});

/**
 * GET /api/auth/verify
 * Header: Authorization: Bearer <token>
 *
 * Verifikasi apakah token masih valid.
 * Dipakai oleh frontend saat halaman pertama dibuka.
 */
app.get('/api/auth/verify', requireAuth, async (req, res) => {
  try {
    // Ambil data terbaru dari DB (bukan dari token yang mungkin outdated)
    const user = await db.findUserById(req.user.id);
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Akun tidak lagi aktif.'
      });
    }

    return res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        nik: user.nik,
        role: user.role,
        cohort: user.cohort,
      }
    });
  } catch (err) {
    console.error('Verify error:', err);
    return res.status(500).json({ success: false, error: 'Terjadi kesalahan server.' });
  }
});

// ============================================================
// ROUTES — ADMIN (Manajemen User)
// ============================================================

/**
 * GET /api/admin/users
 * [admin, manager] Lihat semua user terdaftar
 */
app.get('/api/admin/users', requireAuth, requireAdminOrManager, async (req, res) => {
  try {
    const users = await db.getAllUsers();
    // Jangan tampilkan passwordHash
    const safeUsers = users.map(({ passwordHash, _password_plain, ...u }) => u);
    return res.json({ success: true, users: safeUsers, total: safeUsers.length });
  } catch (err) {
    console.error('Get all users error:', err);
    return res.status(500).json({ success: false, error: 'Terjadi kesalahan server.' });
  }
});

/**
 * POST /api/admin/users
 * [admin ONLY] Tambah user baru (admin/manager/intern)
 * Body: { name, nik, role, password, cohort? }
 *
 * INI ADALAH cara resmi menambah admin/manager — dilakukan manual oleh admin.
 */
app.post('/api/admin/users', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { name, nik, role, password, cohort } = req.body;

    // Validasi role — hanya boleh role yang dikenali
    const allowedRoles = ['intern', 'admin', 'manager'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        error: `Role tidak valid. Pilihan: ${allowedRoles.join(', ')}`
      });
    }

    if (!name || !nik || !role || !password) {
      return res.status(400).json({
        success: false,
        error: 'Nama, NIK, role, dan password wajib diisi.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password minimal 6 karakter.'
      });
    }

    const nikUpper = nik.trim().toUpperCase();
    if (await db.findUserByNIK(nikUpper)) {
      return res.status(409).json({
        success: false,
        error: 'NIK sudah terdaftar.'
      });
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const newUser = {
      id: `usr_${role}_${uuidv4().slice(0, 8)}`,
      name: name.trim(),
      nik: nikUpper,
      role,
      passwordHash,
      cohort: cohort || 'staff',
      isActive: true,
      createdAt: new Date().toISOString(),
      createdBy: req.user.nik, // Siapa yang menambahkan
    };

    await db.addUser(newUser);

    const { passwordHash: _, ...safeUser } = newUser;
    return res.status(201).json({
      success: true,
      message: `User ${name} (${role}) berhasil ditambahkan.`,
      user: safeUser,
    });

  } catch (err) {
    console.error('Add user error:', err);
    return res.status(500).json({ success: false, error: 'Terjadi kesalahan server.' });
  }
});

/**
 * PUT /api/admin/users/:id
 * [admin ONLY] Update data user (nama, role, status aktif)
 */
app.put('/api/admin/users/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, cohort, isActive } = req.body;

    const user = await db.findUserById(id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User tidak ditemukan.' });
    }

    // Jangan biarkan admin mengedit diri sendiri untuk mencegah lock-out
    if (user.id === req.user.id && isActive === false) {
      return res.status(400).json({
        success: false,
        error: 'Anda tidak dapat menonaktifkan akun Anda sendiri.'
      });
    }

    const allowedRoles = ['intern', 'admin', 'manager'];
    if (role && !allowedRoles.includes(role)) {
      return res.status(400).json({ success: false, error: 'Role tidak valid.' });
    }

    // Update field
    const updates = {};
    if (name) updates.name = name.trim();
    if (role) updates.role = role;
    if (cohort) updates.cohort = cohort;
    if (typeof isActive === 'boolean') updates.isActive = isActive;
    updates.updatedAt = new Date().toISOString();
    updates.updatedBy = req.user.nik;

    const updatedUser = await db.updateUser(id, updates);
    const { passwordHash, _password_plain, ...safeUser } = updatedUser;
    return res.json({ success: true, message: 'User berhasil diperbarui.', user: safeUser });

  } catch (err) {
    console.error('Update user error:', err);
    return res.status(500).json({ success: false, error: 'Terjadi kesalahan server.' });
  }
});

/**
 * DELETE /api/admin/users/:id
 * [admin ONLY] Hapus user (nonaktifkan, bukan benar-benar hapus data)
 */
app.delete('/api/admin/users/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (id === req.user.id) {
      return res.status(400).json({
        success: false,
        error: 'Anda tidak dapat menghapus akun Anda sendiri.'
      });
    }

    const user = await db.findUserById(id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User tidak ditemukan.' });
    }

    await db.deleteUser(id, req.user.nik);

    return res.json({
      success: true,
      message: `User ${user.name} telah dinonaktifkan.`
    });
  } catch (err) {
    console.error('Delete user error:', err);
    return res.status(500).json({ success: false, error: 'Terjadi kesalahan server.' });
  }
});

/**
 * POST /api/admin/reset-password
 * [admin ONLY] Reset password user lain
 * Body: { userId, newPassword }
 */
app.post('/api/admin/reset-password', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { userId, newPassword } = req.body;

    if (!userId || !newPassword) {
      return res.status(400).json({ success: false, error: 'userId dan newPassword wajib diisi.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, error: 'Password baru minimal 6 karakter.' });
    }

    const user = await db.findUserById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User tidak ditemukan.' });
    }

    const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    await db.resetPassword(userId, passwordHash, req.user.nik);

    return res.json({
      success: true,
      message: `Password ${user.name} berhasil direset.`
    });

  } catch (err) {
    console.error('Reset password error:', err);
    return res.status(500).json({ success: false, error: 'Terjadi kesalahan server.' });
  }
});

// ============================================================
// HEALTH CHECK
// ============================================================
app.get('/api/health', async (req, res) => {
  try {
    const stats = await db.getHealthStats();
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      totalUsers: stats.total,
      activeUsers: stats.active,
    });
  } catch (err) {
    console.error('Health check error:', err);
    res.status(500).json({ success: false, error: 'Database bermasalah.' });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Endpoint ${req.method} ${req.path} tidak ditemukan.` });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, error: 'Terjadi kesalahan internal server.' });
});

// ============================================================
// START SERVER
// ============================================================
app.listen(PORT, () => {
  console.log('');
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║   Tel Intern Backend API — RUNNING           ║');
  console.log(`║   http://localhost:${PORT}                       ║`);
  console.log('╠══════════════════════════════════════════════╣');
  console.log('║   ENDPOINT TERSEDIA:                         ║');
  console.log(`║   POST /api/auth/login                       ║`);
  console.log(`║   POST /api/auth/register                    ║`);
  console.log(`║   GET  /api/auth/verify                      ║`);
  console.log(`║   GET  /api/admin/users    [admin/manager]   ║`);
  console.log(`║   POST /api/admin/users    [admin only]      ║`);
  console.log(`║   PUT  /api/admin/users/:id [admin only]     ║`);
  console.log(`║   DELETE /api/admin/users/:id [admin only]   ║`);
  console.log(`║   POST /api/admin/reset-password [admin]     ║`);
  console.log('╚══════════════════════════════════════════════╝');
  console.log('');

  // Tampilkan user yang ada di database saat startup
  db.getAllUsers().then(usersList => {
    console.log(`📋 Users terdaftar: ${usersList.length} akun`);
    usersList.forEach(u => {
      const status = u.isActive ? '✅' : '❌';
      console.log(`   ${status} [${u.role.padEnd(7)}] ${u.name} — NIK: ${u.nik}`);
    });
  }).catch(err => {
    console.error('⚠️ Gagal membaca data user pada saat startup:', err.message);
  });
  console.log('');
  console.log('⚠️  PERINGATAN: Ganti JWT_SECRET di server.js sebelum deploy ke production!');
  console.log('');
});

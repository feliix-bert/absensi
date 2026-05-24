/**
 * manage-users.js — CLI Lengkap Manajemen User Tel Intern
 * =========================================================
 * Jalankan: node manage-users.js
 *
 * FITUR:
 *   1. Lihat semua user (beserta password asal jika ada)
 *   2. Tambah user baru (admin / manager / intern)
 *   3. Reset password user
 *   4. Nonaktifkan / aktifkan akun user
 *
 * Bekerja otomatis dengan Supabase (jika .env terkonfigurasi)
 * atau file JSON lokal (backend/data/users.json) sebagai fallback.
 */

const bcrypt   = require('bcryptjs');
const readline = require('readline');
const { v4: uuidv4 } = require('uuid');
const db       = require('./db');

const BCRYPT_ROUNDS = 10;

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

function ask(question) {
  return new Promise(resolve => rl.question(question, resolve));
}

function cls() {
  process.stdout.write('\x1Bc');
}

function separator() {
  console.log('─'.repeat(55));
}

function header(title) {
  console.log('');
  console.log('╔' + '═'.repeat(53) + '╗');
  console.log('║' + (' Tel Intern — ' + title).padEnd(53) + '║');
  console.log('╚' + '═'.repeat(53) + '╝');
  console.log('');
}

/* ============================================================
   TAMPILKAN SEMUA USER
   ============================================================ */
async function listUsers() {
  header('Daftar Semua User');

  const users = await db.getAllUsers();
  if (users.length === 0) {
    console.log('  (Belum ada user terdaftar)');
    return users;
  }

  console.log(`  Total: ${users.length} akun\n`);
  separator();

  users.forEach((u, i) => {
    const status  = u.isActive ? '✅ Aktif' : '❌ Nonaktif';
    const roleTag = { admin: '🔴 ADMIN', manager: '🟡 MANAGER', intern: '🟢 INTERN' }[u.role] || u.role;
    console.log(`  [${i + 1}] ${u.name}`);
    console.log(`      NIK    : ${u.nik}`);
    console.log(`      Role   : ${roleTag}`);
    console.log(`      Status : ${status}`);
    console.log(`      ID     : ${u.id}`);
    console.log(`      Dibuat : ${u.createdAt ? new Date(u.createdAt).toLocaleString('id-ID') : '—'}`);
    separator();
  });

  return users;
}

/* ============================================================
   TAMBAH USER BARU
   ============================================================ */
async function addUser() {
  header('Tambah User Baru');

  const name = (await ask('  Nama lengkap             : ')).trim();
  const nik  = (await ask('  NIK / ID Karyawan        : ')).trim().toUpperCase();

  console.log('  Role tersedia            : intern | admin | manager');
  const role = (await ask('  Role                     : ')).trim().toLowerCase();

  if (!['intern', 'admin', 'manager'].includes(role)) {
    console.error('\n  ❌ Role tidak valid! Pilih: intern | admin | manager\n');
    return;
  }

  const password = (await ask('  Password (min 6 karakter): ')).trim();
  const cohortInput = role === 'intern'
    ? (await ask(`  Angkatan (Enter = ${new Date().getFullYear()}): `)).trim()
    : '';

  if (!name || !nik || !password) {
    console.error('\n  ❌ Nama, NIK, dan password wajib diisi!\n');
    return;
  }
  if (password.length < 6) {
    console.error('\n  ❌ Password minimal 6 karakter!\n');
    return;
  }

  // Cek duplikasi NIK
  const existing = await db.findUserByNIK(nik);
  if (existing) {
    console.error(`\n  ❌ NIK "${nik}" sudah terdaftar untuk: ${existing.name} (${existing.role})\n`);
    return;
  }

  console.log('\n  ⏳ Mengenkripsi password...');
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  const newUser = {
    id          : `usr_${role}_${uuidv4().slice(0, 8)}`,
    name,
    nik,
    role,
    passwordHash,
    cohort      : cohortInput || (role === 'intern' ? new Date().getFullYear().toString() : 'staff'),
    isActive    : true,
    createdAt   : new Date().toISOString(),
    createdBy   : 'CLI/manage-users',
  };

  await db.addUser(newUser);

  console.log('');
  console.log('  ✅ User berhasil ditambahkan!');
  separator();
  console.log(`  Nama     : ${newUser.name}`);
  console.log(`  NIK      : ${newUser.nik}`);
  console.log(`  Role     : ${newUser.role}`);
  console.log(`  Password : ${password}   ← SIMPAN INI! Tidak bisa dilihat lagi.`);
  console.log(`  ID       : ${newUser.id}`);
  separator();
  console.log('');
}

/* ============================================================
   RESET PASSWORD USER
   ============================================================ */
async function resetPassword() {
  header('Reset Password User');

  const users = await db.getAllUsers();
  users.forEach((u, i) => {
    const tag = u.isActive ? '✅' : '❌';
    console.log(`  [${i + 1}] ${tag} ${u.name} (${u.nik}) — ${u.role}`);
  });
  console.log('');

  const idxStr = (await ask('  Pilih nomor user         : ')).trim();
  const idx    = parseInt(idxStr, 10) - 1;

  if (isNaN(idx) || idx < 0 || idx >= users.length) {
    console.error('\n  ❌ Nomor tidak valid!\n');
    return;
  }

  const target = users[idx];
  console.log(`\n  User terpilih: ${target.name} (${target.nik})`);

  const newPass = (await ask('  Password baru (min 6 kar): ')).trim();
  if (newPass.length < 6) {
    console.error('\n  ❌ Password minimal 6 karakter!\n');
    return;
  }

  console.log('\n  ⏳ Mengenkripsi password baru...');
  const passwordHash = await bcrypt.hash(newPass, BCRYPT_ROUNDS);
  await db.resetPassword(target.id, passwordHash, 'CLI/manage-users');

  console.log('');
  console.log(`  ✅ Password ${target.name} (${target.nik}) berhasil direset!`);
  console.log(`  Password baru : ${newPass}   ← SIMPAN INI!`);
  console.log('');
}

/* ============================================================
   TOGGLE AKTIF / NONAKTIF
   ============================================================ */
async function toggleUserStatus() {
  header('Aktifkan / Nonaktifkan User');

  const users = await db.getAllUsers();
  users.forEach((u, i) => {
    const tag = u.isActive ? '✅ Aktif' : '❌ Nonaktif';
    console.log(`  [${i + 1}] ${tag} — ${u.name} (${u.nik}) — ${u.role}`);
  });
  console.log('');

  const idxStr = (await ask('  Pilih nomor user         : ')).trim();
  const idx    = parseInt(idxStr, 10) - 1;

  if (isNaN(idx) || idx < 0 || idx >= users.length) {
    console.error('\n  ❌ Nomor tidak valid!\n');
    return;
  }

  const target  = users[idx];
  const newStatus = !target.isActive;
  const action    = newStatus ? 'mengaktifkan' : 'menonaktifkan';

  const confirm = (await ask(`  Yakin ${action} akun "${target.name}"? (y/n): `)).toLowerCase();
  if (confirm !== 'y') {
    console.log('  ⚠️  Dibatalkan.\n');
    return;
  }

  await db.updateUser(target.id, { isActive: newStatus, updatedAt: new Date().toISOString() });
  console.log(`\n  ✅ Akun ${target.name} berhasil ${action}!\n`);
}

/* ============================================================
   VERIFIKASI PASSWORD (cek apakah password cocok)
   ============================================================ */
async function verifyPassword() {
  header('Verifikasi Password User');

  const users = await db.getAllUsers();
  users.forEach((u, i) => {
    console.log(`  [${i + 1}] ${u.name} (${u.nik}) — ${u.role}`);
  });
  console.log('');

  const idxStr = (await ask('  Pilih nomor user    : ')).trim();
  const idx    = parseInt(idxStr, 10) - 1;

  if (isNaN(idx) || idx < 0 || idx >= users.length) {
    console.error('\n  ❌ Nomor tidak valid!\n');
    return;
  }

  const target = users[idx];
  const testPass = (await ask('  Masukkan password   : ')).trim();

  const isMatch = await bcrypt.compare(testPass, target.passwordHash);
  if (isMatch) {
    console.log(`\n  ✅ Password COCOK untuk ${target.name} (${target.nik})\n`);
  } else {
    console.log(`\n  ❌ Password SALAH untuk ${target.name} (${target.nik})\n`);
  }
}

/* ============================================================
   MENU UTAMA
   ============================================================ */
async function main() {
  console.log('');
  console.log('╔═══════════════════════════════════════════════════════╗');
  console.log('║        Tel Intern — Manajemen User (CLI)              ║');
  console.log('║  Database: ' + (db.isSupabase ? 'Supabase Cloud ☁️ ' : 'JSON Lokal 📁      ').padEnd(43) + '║');
  console.log('╚═══════════════════════════════════════════════════════╝');

  while (true) {
    console.log('');
    console.log('  Pilih aksi:');
    console.log('  [1] Lihat semua user');
    console.log('  [2] Tambah user baru (admin/manager/intern)');
    console.log('  [3] Reset password user');
    console.log('  [4] Aktifkan / nonaktifkan akun');
    console.log('  [5] Verifikasi password (cek apakah password cocok)');
    console.log('  [0] Keluar');
    console.log('');

    const choice = (await ask('  Pilihan (0–5)       : ')).trim();
    console.log('');

    switch (choice) {
      case '1': await listUsers(); break;
      case '2': await addUser(); break;
      case '3': await resetPassword(); break;
      case '4': await toggleUserStatus(); break;
      case '5': await verifyPassword(); break;
      case '0':
        console.log('  Selamat tinggal!\n');
        rl.close();
        process.exit(0);
      default:
        console.log('  ⚠️  Pilihan tidak valid. Masukkan angka 0–5.\n');
    }
  }
}

main().catch(err => {
  console.error('\n❌ Error:', err.message || err);
  rl.close();
  process.exit(1);
});

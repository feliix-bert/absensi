/**
 * add-user.js — Script CLI untuk menambah user admin/manager secara manual
 * =========================================================================
 * Jalankan: node add-user.js
 *
 * Gunakan script ini untuk menambah akun admin atau manager
 * TANPA harus menjalankan server.
 */

const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { v4: uuidv4 } = require('uuid');

const DB_PATH = path.join(__dirname, 'data', 'users.json');
const BCRYPT_ROUNDS = 10;

function readDB() {
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return { users: [] };
  }
}

function writeDB(data) {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

function ask(question) {
  return new Promise(resolve => rl.question(question, resolve));
}

async function main() {
  console.log('');
  console.log('╔══════════════════════════════════════╗');
  console.log('║   Tambah User — Tel Intern Backend   ║');
  console.log('╚══════════════════════════════════════╝');
  console.log('');

  // Tampilkan user yang ada
  const db = readDB();
  console.log(`Users yang sudah ada (${db.users.length} total):`);
  db.users.forEach(u => {
    const status = u.isActive ? '✅' : '❌';
    console.log(`  ${status} [${u.role}] ${u.name} — ${u.nik}`);
  });
  console.log('');

  const name = (await ask('Nama lengkap        : ')).trim();
  const nik = (await ask('NIK / ID Karyawan   : ')).trim().toUpperCase();

  console.log('Role yang tersedia  : intern | admin | manager');
  const role = (await ask('Role                : ')).trim().toLowerCase();

  if (!['intern', 'admin', 'manager'].includes(role)) {
    console.error('\n❌ Role tidak valid! Hanya boleh: intern, admin, manager');
    rl.close();
    process.exit(1);
  }

  const password = (await ask('Password (min 6 karakter): ')).trim();

  if (!name || !nik || !password) {
    console.error('\n❌ Semua field wajib diisi!');
    rl.close();
    process.exit(1);
  }

  if (password.length < 6) {
    console.error('\n❌ Password minimal 6 karakter!');
    rl.close();
    process.exit(1);
  }

  // Cek duplikasi NIK
  const existing = db.users.find(u => u.nik.toUpperCase() === nik);
  if (existing) {
    console.error(`\n❌ NIK "${nik}" sudah terdaftar untuk: ${existing.name} (${existing.role})`);
    rl.close();
    process.exit(1);
  }

  console.log('\n⏳ Mengenkripsi password...');
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  const newUser = {
    id: `usr_${role}_${uuidv4().slice(0, 8)}`,
    name,
    nik,
    role,
    passwordHash,
    cohort: role === 'intern' ? new Date().getFullYear().toString() : 'staff',
    isActive: true,
    createdAt: new Date().toISOString(),
    createdBy: 'CLI/manual',
  };

  db.users.push(newUser);
  writeDB(db);

  console.log('');
  console.log('✅ User berhasil ditambahkan!');
  console.log('──────────────────────────────');
  console.log(`   Nama  : ${newUser.name}`);
  console.log(`   NIK   : ${newUser.nik}`);
  console.log(`   Role  : ${newUser.role}`);
  console.log(`   ID    : ${newUser.id}`);
  console.log('──────────────────────────────');
  console.log('');
  console.log('⚠️  INGAT: Simpan password ini dengan aman. Server tidak menyimpan password dalam bentuk plain text.');
  console.log('');

  rl.close();
}

main().catch(err => {
  console.error('Error:', err);
  rl.close();
  process.exit(1);
});

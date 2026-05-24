/**
 * migrate.js — Script Migrasi Data JSON ke Supabase
 * ==============================================================
 * Cara menjalankan:
 *   node migrate.js
 *
 * Pastikan Anda sudah membuat tabel 'users' di Supabase dengan schema.sql
 * dan sudah mengisi file '.env' dengan kredensial Supabase Anda.
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const DB_PATH = path.join(__dirname, 'data', 'users.json');

async function runMigration() {
  console.log('🚀 Memulai proses migrasi database...');

  // 1. Cek file .env
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ ERROR: Kredensial Supabase belum diisi di backend/.env.');
    console.error('   Silakan buka file backend/.env dan lengkapi SUPABASE_URL serta SUPABASE_SERVICE_KEY.');
    console.error('   Migrasi dibatalkan.');
    process.exit(1);
  }

  // 2. Baca database JSON lokal
  if (!fs.existsSync(DB_PATH)) {
    console.warn(`⚠️ WARNING: File database lokal tidak ditemukan di: ${DB_PATH}`);
    console.warn('   Tidak ada data user lokal yang bisa dimigrasikan.');
    process.exit(0);
  }

  let localData;
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    localData = JSON.parse(raw);
  } catch (err) {
    console.error(`❌ ERROR: Gagal membaca file JSON lokal: ${err.message}`);
    process.exit(1);
  }

  const usersToMigrate = localData.users || [];
  if (usersToMigrate.length === 0) {
    console.log('ℹ️ Tidak ada data user lokal untuk dimigrasikan.');
    process.exit(0);
  }

  console.log(`📋 Menemukan ${usersToMigrate.length} user di JSON lokal.`);

  // 3. Bersihkan data (hapus properti dummy seperti _password_plain yang tidak masuk kolom DB)
  const cleanedUsers = usersToMigrate.map(user => {
    const { _password_plain, ...rest } = user;
    
    // Pastikan field Boolean & String bernilai default jika kosong
    return {
      ...rest,
      cohort: rest.cohort || '2026',
      isActive: rest.isActive !== undefined ? rest.isActive : true,
      createdAt: rest.createdAt || new Date().toISOString()
    };
  });

  // 4. Hubungkan ke Supabase
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  console.log('🔌 Menghubungkan ke Supabase Cloud...');

  // 5. Eksekusi Upsert ke Supabase
  try {
    const { data, error } = await supabase
      .from('users')
      .upsert(cleanedUsers, { onConflict: 'id' })
      .select();

    if (error) {
      throw error;
    }

    console.log('====================================================');
    console.log('✅ MIGRASI SELESAI DENGAN SUKSES!');
    console.log(`📊 Berhasil memigrasi ${data.length} user ke Supabase.`);
    console.log('====================================================');
    
    console.log('\nUser yang berhasil dimigrasikan:');
    data.forEach(u => {
      console.log(`   - [${u.role.padEnd(7)}] ${u.name} (NIK: ${u.nik})`);
    });
    console.log('');
  } catch (err) {
    console.error('\n❌ ERROR SAAT MIGRASI:');
    console.error(err.message);
    console.error('\nTips Pemecahan Masalah:');
    console.error('1. Apakah Anda sudah membuat tabel "users" di Supabase menggunakan schema.sql?');
    console.error('2. Pastikan field-field di table memiliki nama camelCase yang sesuai (gunakan tanda kutip dua "");');
    console.error('3. Periksa kembali apakah kunci SUPABASE_SERVICE_KEY di .env adalah "service_role" key, bukan "anon" key.');
    process.exit(1);
  }
}

runMigration();

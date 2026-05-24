/**
 * db.js — Abstraksi Database Layer (Supabase / JSON Fallback)
 * ==============================================================
 * Jika SUPABASE_URL dan SUPABASE_SERVICE_KEY diisi di .env,
 * modul ini akan mengarahkan semua query ke cloud database Supabase.
 * Jika tidak, akan menggunakan file database JSON lokal (users.json).
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const DB_PATH = path.join(__dirname, 'data', 'users.json');
const isSupabaseConfigured = !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY);

let supabaseClient = null;

if (isSupabaseConfigured) {
  console.log('🔌 Supabase terdeteksi! Menggunakan database Supabase Cloud.');
  supabaseClient = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
} else {
  console.warn('⚠️ WARNING: SUPABASE_URL atau SUPABASE_SERVICE_KEY tidak ditemukan di .env.');
  console.warn('📁 Fallback: Menggunakan database file JSON lokal (backend/data/users.json).');
}

// ============================================================
// LOGIK FILE JSON LOKAL (FALLBACK)
// ============================================================
function readJSON() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      const dir = path.dirname(DB_PATH);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(DB_PATH, JSON.stringify({ users: [] }, null, 2), 'utf-8');
    }
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('ERROR membaca JSON:', err.message);
    return { users: [] };
  }
}

function writeJSON(data) {
  try {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('ERROR menulis JSON:', err.message);
    return false;
  }
}

// ============================================================
// INTERFACE DATABASE UTAMA (DIEXPORT ASINKRON)
// ============================================================
const db = {
  isSupabase: isSupabaseConfigured,
  client: supabaseClient,

  /**
   * Cari user berdasarkan NIK (case-insensitive)
   */
  async findUserByNIK(nik) {
    const cleanNIK = nik.trim().toUpperCase();
    if (isSupabaseConfigured) {
      const { data, error } = await supabaseClient
        .from('users')
        .select('*')
        .eq('nik', cleanNIK)
        .maybeSingle();

      if (error) {
        console.error('Error Supabase (findUserByNIK):', error.message);
        throw error;
      }
      return data;
    } else {
      const json = readJSON();
      return json.users.find(u => u.nik.toUpperCase() === cleanNIK) || null;
    }
  },

  /**
   * Cari user berdasarkan ID
   */
  async findUserById(id) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabaseClient
        .from('users')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('Error Supabase (findUserById):', error.message);
        throw error;
      }
      return data;
    } else {
      const json = readJSON();
      return json.users.find(u => u.id === id) || null;
    }
  },

  /**
   * Ambil semua user terdaftar
   */
  async getAllUsers() {
    if (isSupabaseConfigured) {
      const { data, error } = await supabaseClient
        .from('users')
        .select('*')
        .order('createdAt', { ascending: false });

      if (error) {
        console.error('Error Supabase (getAllUsers):', error.message);
        throw error;
      }
      return data || [];
    } else {
      const json = readJSON();
      return json.users || [];
    }
  },

  /**
   * Tambah user baru
   */
  async addUser(user) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabaseClient
        .from('users')
        .insert(user)
        .select()
        .single();

      if (error) {
        console.error('Error Supabase (addUser):', error.message);
        throw error;
      }
      return data;
    } else {
      const json = readJSON();
      json.users.push(user);
      writeJSON(json);
      return user;
    }
  },

  /**
   * Update data user
   */
  async updateUser(id, updates) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabaseClient
        .from('users')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error Supabase (updateUser):', error.message);
        throw error;
      }
      return data;
    } else {
      const json = readJSON();
      const idx = json.users.findIndex(u => u.id === id);
      if (idx === -1) return null;

      json.users[idx] = { ...json.users[idx], ...updates };
      writeJSON(json);
      return json.users[idx];
    }
  },

  /**
   * Soft-delete user (Menonaktifkan akun)
   */
  async deleteUser(id, deletedBy) {
    const updates = {
      isActive: false,
      deletedAt: new Date().toISOString(),
      deletedBy: deletedBy
    };

    if (isSupabaseConfigured) {
      const { data, error } = await supabaseClient
        .from('users')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error Supabase (deleteUser):', error.message);
        throw error;
      }
      return data;
    } else {
      const json = readJSON();
      const idx = json.users.findIndex(u => u.id === id);
      if (idx === -1) return null;

      json.users[idx] = { ...json.users[idx], ...updates };
      writeJSON(json);
      return json.users[idx];
    }
  },

  /**
   * Reset password user
   */
  async resetPassword(id, passwordHash, resetBy) {
    const updates = {
      passwordHash,
      passwordResetAt: new Date().toISOString(),
      passwordResetBy: resetBy
    };

    if (isSupabaseConfigured) {
      const { data, error } = await supabaseClient
        .from('users')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error Supabase (resetPassword):', error.message);
        throw error;
      }
      return data;
    } else {
      const json = readJSON();
      const idx = json.users.findIndex(u => u.id === id);
      if (idx === -1) return null;

      json.users[idx] = { ...json.users[idx], ...updates };
      writeJSON(json);
      return json.users[idx];
    }
  },

  /**
   * Mendapatkan statistik kesehatan database
   */
  async getHealthStats() {
    if (isSupabaseConfigured) {
      // Hitung total dan aktif via query Supabase
      const { count: total, error: totalError } = await supabaseClient
        .from('users')
        .select('*', { count: 'exact', head: true });

      const { count: active, error: activeError } = await supabaseClient
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('isActive', true);

      if (totalError || activeError) {
        console.error('Error Supabase (getHealthStats):', totalError?.message || activeError?.message);
        return { total: 0, active: 0 };
      }

      return { total: total || 0, active: active || 0 };
    } else {
      const json = readJSON();
      const total = json.users.length;
      const active = json.users.filter(u => u.isActive).length;
      return { total, active };
    }
  }
};

module.exports = db;

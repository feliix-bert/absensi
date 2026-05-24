import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@supabase/supabase-js';

const JWT_SECRET = process.env.JWT_SECRET || 'RAHASIA_SUPER_KUAT_GANTI_INI_SEKARANG_2026!';
const JWT_EXPIRES_IN = '8h';
const BCRYPT_ROUNDS = 10;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper for extracting token
function getAuthToken(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  return authHeader && authHeader.split(' ')[1];
}

// Authentication middleware
function requireAuth(req: NextRequest) {
  const token = getAuthToken(req);
  if (!token) throw new Error('Unauthenticated');
  
  try {
    return jwt.verify(token, JWT_SECRET) as any;
  } catch (err) {
    throw new Error('InvalidToken');
  }
}

function requireAdmin(user: any) {
  if (user?.role !== 'admin') throw new Error('Forbidden');
}

function requireAdminOrManager(user: any) {
  if (!['admin', 'manager'].includes(user?.role)) throw new Error('Forbidden');
}

// Handler functions
async function handlePost(path: string, req: NextRequest) {
  if (path === 'auth/login') {
    const { nik, password } = await req.json();
    if (!nik || !password) return NextResponse.json({ success: false, error: 'NIK dan password wajib diisi.' }, { status: 400 });

    const cleanNIK = nik.trim().toUpperCase();
    const { data: user, error } = await supabase.from('users').select('*').eq('nik', cleanNIK).maybeSingle();

    if (error) return NextResponse.json({ success: false, error: 'Terjadi kesalahan server.' }, { status: 500 });
    if (!user) return NextResponse.json({ success: false, error: 'NIK tidak ditemukan.' }, { status: 401 });
    if (!user.isActive) return NextResponse.json({ success: false, error: 'Akun dinonaktifkan.' }, { status: 403 });

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) return NextResponse.json({ success: false, error: 'Password salah.' }, { status: 401 });

    const tokenPayload = { id: user.id, nik: user.nik, name: user.name, role: user.role, cohort: user.cohort };
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return NextResponse.json({ success: true, message: `Selamat datang, ${user.name}!`, token, user: tokenPayload });
  }

  if (path === 'auth/register') {
    const { name, nik, password } = await req.json();
    if (!name || !nik || !password || password.length < 6) {
      return NextResponse.json({ success: false, error: 'Data tidak valid.' }, { status: 400 });
    }

    const nikUpper = nik.trim().toUpperCase();
    const { data: existing } = await supabase.from('users').select('*').eq('nik', nikUpper).maybeSingle();
    if (existing) return NextResponse.json({ success: false, error: 'NIK sudah terdaftar.' }, { status: 409 });

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const newUser = {
      id: `usr_intern_${uuidv4().slice(0, 8)}`,
      name: name.trim(),
      nik: nikUpper,
      role: 'intern',
      passwordHash,
      cohort: new Date().getFullYear().toString(),
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    const { error } = await supabase.from('users').insert(newUser);
    if (error) return NextResponse.json({ success: false, error: 'Gagal daftar.' }, { status: 500 });

    const token = jwt.sign({ id: newUser.id, nik: newUser.nik, name: newUser.name, role: newUser.role, cohort: newUser.cohort }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    return NextResponse.json({ success: true, message: 'Akun berhasil dibuat!', token, user: newUser }, { status: 201 });
  }

  if (path === 'admin/users') {
    let user;
    try { user = requireAuth(req); requireAdmin(user); } catch (e: any) { return handleAuthError(e); }

    const { name, nik, role, password, cohort } = await req.json();
    const allowedRoles = ['intern', 'admin', 'manager'];
    if (!allowedRoles.includes(role)) return NextResponse.json({ success: false, error: 'Role tidak valid.' }, { status: 400 });

    const nikUpper = nik.trim().toUpperCase();
    const { data: existing } = await supabase.from('users').select('*').eq('nik', nikUpper).maybeSingle();
    if (existing) return NextResponse.json({ success: false, error: 'NIK sudah terdaftar.' }, { status: 409 });

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const newUser = {
      id: `usr_${role}_${uuidv4().slice(0, 8)}`,
      name: name.trim(),
      nik: nikUpper, role, passwordHash,
      cohort: cohort || 'staff', isActive: true,
      createdAt: new Date().toISOString(), createdBy: user.nik,
    };

    const { error } = await supabase.from('users').insert(newUser);
    if (error) return NextResponse.json({ success: false, error: 'Gagal tambah user.' }, { status: 500 });
    
    return NextResponse.json({ success: true, message: 'User berhasil ditambahkan.', user: newUser }, { status: 201 });
  }

  if (path === 'admin/reset-password') {
    let user;
    try { user = requireAuth(req); requireAdmin(user); } catch (e: any) { return handleAuthError(e); }

    const { userId, newPassword } = await req.json();
    if (newPassword.length < 6) return NextResponse.json({ success: false, error: 'Password min 6 karakter.' }, { status: 400 });

    const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    const { error } = await supabase.from('users').update({
      passwordHash, passwordResetAt: new Date().toISOString(), passwordResetBy: user.nik
    }).eq('id', userId);

    if (error) return NextResponse.json({ success: false, error: 'Gagal reset password.' }, { status: 500 });
    return NextResponse.json({ success: true, message: 'Password berhasil direset.' });
  }

  return NextResponse.json({ success: false, error: 'Route not found' }, { status: 404 });
}

async function handleGet(path: string, req: NextRequest) {
  if (path === 'auth/verify') {
    let user;
    try { user = requireAuth(req); } catch (e: any) { return handleAuthError(e); }

    const { data: dbUser } = await supabase.from('users').select('*').eq('id', user.id).maybeSingle();
    if (!dbUser || !dbUser.isActive) return NextResponse.json({ success: false, error: 'Akun tidak aktif.' }, { status: 401 });

    return NextResponse.json({
      success: true,
      user: { id: dbUser.id, name: dbUser.name, nik: dbUser.nik, role: dbUser.role, cohort: dbUser.cohort }
    });
  }

  if (path === 'admin/users') {
    let user;
    try { user = requireAuth(req); requireAdminOrManager(user); } catch (e: any) { return handleAuthError(e); }

    const { data: users, error } = await supabase.from('users').select('*').order('createdAt', { ascending: false });
    if (error) return NextResponse.json({ success: false, error: 'Gagal ambil data.' }, { status: 500 });

    return NextResponse.json({ success: true, users, total: users?.length || 0 });
  }

  if (path === 'health') {
    return NextResponse.json({ status: 'OK', timestamp: new Date().toISOString() });
  }

  return NextResponse.json({ success: false, error: 'Route not found' }, { status: 404 });
}

async function handlePut(path: string, req: NextRequest) {
  if (path.startsWith('admin/users/')) {
    const id = path.split('/')[2];
    let user;
    try { user = requireAuth(req); requireAdmin(user); } catch (e: any) { return handleAuthError(e); }

    const { name, role, cohort, isActive } = await req.json();
    if (id === user.id && isActive === false) return NextResponse.json({ success: false, error: 'Anda tidak dapat menonaktifkan akun Anda sendiri.' }, { status: 400 });

    const updates: any = { updatedAt: new Date().toISOString(), updatedBy: user.nik };
    if (name) updates.name = name.trim();
    if (role) updates.role = role;
    if (cohort) updates.cohort = cohort;
    if (typeof isActive === 'boolean') updates.isActive = isActive;

    const { data: updatedUser, error } = await supabase.from('users').update(updates).eq('id', id).select().single();
    if (error) return NextResponse.json({ success: false, error: 'Gagal update user.' }, { status: 500 });

    return NextResponse.json({ success: true, message: 'User berhasil diperbarui.', user: updatedUser });
  }
  return NextResponse.json({ success: false, error: 'Route not found' }, { status: 404 });
}

async function handleDelete(path: string, req: NextRequest) {
  if (path.startsWith('admin/users/')) {
    const id = path.split('/')[2];
    let user;
    try { user = requireAuth(req); requireAdmin(user); } catch (e: any) { return handleAuthError(e); }

    if (id === user.id) return NextResponse.json({ success: false, error: 'Anda tidak dapat menghapus akun Anda sendiri.' }, { status: 400 });

    const updates = { isActive: false, deletedAt: new Date().toISOString(), deletedBy: user.nik };
    const { error } = await supabase.from('users').update(updates).eq('id', id);
    if (error) return NextResponse.json({ success: false, error: 'Gagal hapus user.' }, { status: 500 });

    return NextResponse.json({ success: true, message: 'User telah dinonaktifkan.' });
  }
  return NextResponse.json({ success: false, error: 'Route not found' }, { status: 404 });
}

function handleAuthError(e: any) {
  if (e.message === 'Unauthenticated') return NextResponse.json({ success: false, error: 'Tidak terautentikasi.' }, { status: 401 });
  if (e.message === 'InvalidToken') return NextResponse.json({ success: false, error: 'Token tidak valid.' }, { status: 401 });
  if (e.message === 'Forbidden') return NextResponse.json({ success: false, error: 'Akses ditolak.' }, { status: 403 });
  return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
}

// MAIN HANDLERS
export async function GET(req: NextRequest, { params }: { params: { slug?: string[] } }) {
  const path = params.slug ? params.slug.join('/') : '';
  return handleGet(path, req);
}

export async function POST(req: NextRequest, { params }: { params: { slug?: string[] } }) {
  const path = params.slug ? params.slug.join('/') : '';
  return handlePost(path, req);
}

export async function PUT(req: NextRequest, { params }: { params: { slug?: string[] } }) {
  const path = params.slug ? params.slug.join('/') : '';
  return handlePut(path, req);
}

export async function DELETE(req: NextRequest, { params }: { params: { slug?: string[] } }) {
  const path = params.slug ? params.slug.join('/') : '';
  return handleDelete(path, req);
}

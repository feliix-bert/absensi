'use client';

import Link from 'next/link';
import { useState, useActionState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, LogIn, AlertCircle, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { signIn } from '@/actions/auth.actions';
import { AuthPromoPanel } from '@/components/auth/AuthPromoPanel';

export default function LoginPage() {
  const [showPass, setShowPass] = useState(false);
  const [state, formAction, isPending] = useActionState(signIn, null);

  return (
    <div className="min-h-dvh bg-neutral-50 flex flex-col">
      {/* ─── Back link ─── */}
      <div className="p-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-neutral-500 hover:text-neutral-800 text-body-md transition-colors"
        >
          <ArrowLeft size={16} /> Kembali ke Beranda
        </Link>
      </div>

      {/* ─── Center layout ─── */}
      <div className="flex-1 flex items-start justify-center px-4 py-6">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          <AuthPromoPanel variant="login" />
          <div className="w-full max-w-lg mx-auto lg:mx-0 flex items-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="card-modern p-8 w-full"
          >
            {/* Logo */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-primary-600 flex items-center justify-center mb-4 shadow-md">
                <span className="text-white font-bold text-xl">TI</span>
              </div>
              <h1 className="text-heading-xl text-neutral-900">Selamat Datang</h1>
              <p className="text-body-md text-neutral-500 mt-1">Masuk ke akun TelIntern kamu</p>
            </div>

            {/* Error Alert */}
            {state?.error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-3 p-3.5 rounded-lg bg-danger-50 border border-danger-100 mb-5"
              >
                <AlertCircle size={16} className="text-danger-500 flex-shrink-0" />
                <p className="text-body-sm text-danger-700">{state.error}</p>
              </motion.div>
            )}

            <form action={formAction} className="space-y-5" noValidate>
              {/* Email */}
              <div>
                <label htmlFor="login-email" className="form-label">
                  Email
                </label>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="nama@intern.telkom.co.id"
                  className={cn('input', state?.error && 'input-error')}
                  disabled={isPending}
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="login-password" className="form-label">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    name="password"
                    type={showPass ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Masukkan password"
                    className={cn('input pr-11', state?.error && 'input-error')}
                    disabled={isPending}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors p-1"
                    aria-label={showPass ? 'Sembunyikan password' : 'Tampilkan password'}
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    id="remember-me"
                    name="rememberMe"
                    type="checkbox"
                    className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-body-sm text-neutral-600">Ingat saya</span>
                </label>
                <button
                  type="button"
                  className="text-body-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Lupa password?
                </button>
              </div>

              {/* Submit */}
              <button
                id="login-submit"
                type="submit"
                disabled={isPending}
                className="btn btn-primary btn-full btn-lg mt-2 relative"
              >
                {isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Memverifikasi...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <LogIn size={18} />
                    Masuk
                  </div>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-body-sm text-neutral-400">Belum punya akun?</span>
              </div>
            </div>

            <Link
              href="/signup"
              className="btn btn-outline btn-full btn-md text-center justify-center"
            >
              Daftar sebagai peserta magang
            </Link>
          </motion.div>
          </div>
        </div>
      </div>

      <p className="text-center text-body-sm text-neutral-400 pb-6">
        © 2025 Telkom Indonesia. All rights reserved.
      </p>
    </div>
  );
}

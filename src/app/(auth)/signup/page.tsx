'use client';

import Link from 'next/link';
import { useState, useActionState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, ChevronRight, ChevronLeft, Check, AlertCircle, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DIVISIONS } from '@/lib/constants';
import { AuthPromoPanel } from '@/components/auth/AuthPromoPanel';
import { signUp } from '@/actions/auth.actions';
import { createClient } from '@/utils/supabase/client';

type Step = 1 | 2;

interface FormData {
  name: string; nim: string; division: string; mentor: string;
  startDate: string; endDate: string; officeLocation: string;
  email: string; password: string; confirmPassword: string;
}

const EMPTY_FORM: FormData = {
  name: '', nim: '', division: '', mentor: '',
  startDate: '', endDate: '', officeLocation: '',
  email: '', password: '', confirmPassword: '',
};

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const labels = ['', 'Lemah', 'Cukup', 'Kuat', 'Sangat Kuat'];
  const colors = ['', 'bg-danger-500', 'bg-warning-500', 'bg-success-400', 'bg-success-500'];

  if (!password) return null;
  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={cn(
              'h-1 flex-1 rounded-full transition-all duration-300',
              i <= score ? colors[score] : 'bg-neutral-200'
            )}
          />
        ))}
      </div>
      <p className={cn('text-[11px] font-medium', score >= 3 ? 'text-success-600' : score === 2 ? 'text-warning-600' : 'text-danger-500')}>
        {labels[score]}
      </p>
    </div>
  );
}

const Field = ({
  id, label, error, children
}: { id: string; label: string; error?: string; children: React.ReactNode }) => (
  <div>
    <label htmlFor={id} className="form-label">{label}</label>
    {children}
    {error && (
      <p className="form-error flex items-center gap-1 mt-1">
        <AlertCircle size={12} /> {error}
      </p>
    )}
  </div>
);

export default function SignupPage() {
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [offices, setOffices] = useState<any[]>([]);
  
  const [state, formAction, isPending] = useActionState(signUp, null);

  useEffect(() => {
    const fetchOffices = async () => {
      const supabase = createClient();
      const { data } = await supabase.from('offices').select('id, nama');
      if (data) setOffices(data);
    };
    fetchOffices();
  }, []);

  const set = (key: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((er) => ({ ...er, [key]: '' }));
  };

  const validateStep1 = () => {
    const errs: Partial<FormData> = {};
    if (!form.name.trim()) errs.name = 'Nama wajib diisi';
    if (!form.nim.trim()) errs.nim = 'NIM / ID Magang wajib diisi';
    if (!form.division) errs.division = 'Pilih divisi';
    if (!form.mentor.trim()) errs.mentor = 'Nama pembimbing wajib diisi';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    const errs: Partial<FormData> = {};
    if (!form.startDate) errs.startDate = 'Tanggal mulai wajib diisi';
    if (!form.endDate) errs.endDate = 'Tanggal selesai wajib diisi';
    if (!form.officeLocation.trim()) errs.officeLocation = 'Nama lokasi kantor wajib diisi';
    if (!form.email.includes('@')) errs.email = 'Email tidak valid';
    if (form.password.length < 8) errs.password = 'Password minimal 8 karakter';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Password tidak cocok';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) setStep(2);
  };



  return (
    <div className="min-h-dvh bg-neutral-50 flex flex-col">
      <div className="p-4">
        <Link href="/" className="inline-flex items-center gap-2 text-neutral-500 hover:text-neutral-800 text-body-md transition-colors">
          <ArrowLeft size={16} /> Kembali ke Beranda
        </Link>
      </div>

      <div className="flex-1 flex items-start justify-center px-4 py-6">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <AuthPromoPanel variant="signup" />

          <div className="w-full max-w-lg mx-auto lg:mx-0">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="card-modern p-7 md:p-8"
          >
            {/* Header */}
            <div className="flex flex-col items-center mb-7">
              <div className="w-12 h-12 rounded-xl bg-primary-600 flex items-center justify-center mb-3 shadow-md">
                <span className="text-white font-bold text-base">TI</span>
              </div>
              <h1 className="text-heading-xl text-neutral-900">Daftar Magang</h1>
              <p className="text-body-md text-neutral-500 mt-1">Buat akun TelIntern-mu sekarang</p>
            </div>

            {/* Step Indicator */}
            <div className="flex items-center gap-3 mb-8">
              {[1, 2].map((s) => (
                <div key={s} className="flex items-center gap-3 flex-1">
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all',
                    s < step ? 'bg-success-500 text-white' : s === step ? 'bg-primary-600 text-white' : 'bg-neutral-100 text-neutral-400'
                  )}>
                    {s < step ? <Check size={14} /> : s}
                  </div>
                  <div className="flex-1">
                    <p className={cn('text-[11px] font-semibold', s === step ? 'text-primary-600' : 'text-neutral-400')}>
                      {s === 1 ? 'Data Diri' : 'Akun & Lokasi'}
                    </p>
                  </div>
                  {s < 2 && (
                    <div className={cn('h-px flex-1', step > 1 ? 'bg-success-400' : 'bg-neutral-200')} />
                  )}
                </div>
              ))}
            </div>

            {/* Step 1 */}
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4"
                >
                  <Field id="signup-name" label="Nama Lengkap" error={errors.name}>
                    <input id="signup-name" type="text" placeholder="Nama sesuai identitas" value={form.name} onChange={set('name')} className={cn('input', errors.name && 'input-error')} />
                  </Field>
                  <Field id="signup-nim" label="NIM / NIS / ID Magang" error={errors.nim}>
                    <input id="signup-nim" type="text" placeholder="Contoh: 1301213456" value={form.nim} onChange={set('nim')} className={cn('input', errors.nim && 'input-error')} />
                  </Field>
                  <Field id="signup-division" label="Divisi" error={errors.division}>
                    <select id="signup-division" value={form.division} onChange={set('division')} className={cn('input', errors.division && 'input-error')}>
                      <option value="">Pilih divisi...</option>
                      {DIVISIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </Field>
                  <Field id="signup-mentor" label="Nama Pembimbing" error={errors.mentor}>
                    <input id="signup-mentor" type="text" placeholder="Nama pembimbing lapangan" value={form.mentor} onChange={set('mentor')} className={cn('input', errors.mentor && 'input-error')} />
                  </Field>

                  <button onClick={handleNext} className="btn btn-primary btn-full btn-lg mt-2">
                    Lanjut <ChevronRight size={18} />
                  </button>
                </motion.div>
              )}

              {/* Step 2 */}
              {step === 2 && (
                <motion.form
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  action={formAction}
                  className="space-y-4"
                  noValidate
                >
                  {state?.error && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-danger-50 border border-danger-100 mb-2">
                      <AlertCircle size={14} className="text-danger-500" />
                      <p className="text-body-sm text-danger-700">{state.error}</p>
                    </div>
                  )}
                  {/* Hidden inputs for Step 1 data */}
                  <input type="hidden" name="nama" value={form.name} />
                  <input type="hidden" name="nim" value={form.nim} />
                  <input type="hidden" name="divisi" value={form.division} />
                  <input type="hidden" name="pembimbing" value={form.mentor} />
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Field id="signup-startdate" label="Durasi Magang" error={errors.startDate}>
                      <input id="signup-startdate" name="durasi_magang" type="text" placeholder="Misal: 3 Bulan" value={form.startDate} onChange={set('startDate')} className={cn('input', errors.startDate && 'input-error')} />
                    </Field>
                  </div>

                  <Field id="signup-office" label="Lokasi Kantor" error={errors.officeLocation}>
                    <select id="signup-office" name="lokasi_kantor" value={form.officeLocation} onChange={set('officeLocation')} className={cn('input', errors.officeLocation && 'input-error')}>
                      <option value="">Pilih lokasi kantor...</option>
                      {offices.map(o => <option key={o.id} value={o.id}>{o.nama}</option>)}
                    </select>
                  </Field>

                  <Field id="signup-email" label="Email" error={errors.email}>
                    <input id="signup-email" name="email" type="email" autoComplete="email" placeholder="email@intern.telkom.co.id" value={form.email} onChange={set('email')} className={cn('input', errors.email && 'input-error')} />
                  </Field>

                  <Field id="signup-password" label="Password" error={errors.password}>
                    <div className="relative">
                      <input id="signup-password" name="password" type={showPass ? 'text' : 'password'} autoComplete="new-password" placeholder="Minimal 8 karakter" value={form.password} onChange={set('password')} className={cn('input pr-11', errors.password && 'input-error')} />
                      <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 p-1">
                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <PasswordStrength password={form.password} />
                  </Field>

                  <Field id="signup-confirm" label="Konfirmasi Password" error={errors.confirmPassword}>
                    <div className="relative">
                      <input id="signup-confirm" type={showConfirm ? 'text' : 'password'} autoComplete="new-password" placeholder="Ulangi password" value={form.confirmPassword} onChange={set('confirmPassword')} className={cn('input pr-11', errors.confirmPassword && 'input-error')} />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 p-1">
                        {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </Field>

                  <div className="flex gap-3 mt-2">
                    <button type="button" onClick={() => setStep(1)} className="btn btn-outline btn-lg flex-1">
                      <ChevronLeft size={18} /> Kembali
                    </button>
                    <button id="signup-submit" type="submit" disabled={isPending} className="btn btn-primary btn-lg flex-2 flex-1">
                      {isPending ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Mendaftar...
                        </div>
                      ) : 'Daftar Sekarang'}
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Login link */}
            <p className="text-center text-body-sm text-neutral-500 mt-6">
              Sudah punya akun?{' '}
              <Link href="/login" className="text-primary-600 font-medium hover:underline">
                Masuk di sini
              </Link>
            </p>
          </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

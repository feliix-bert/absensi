'use client';

import Link from 'next/link';
import { useState, useActionState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, ChevronRight, ChevronLeft, Check, AlertCircle, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AuthPromoPanel } from '@/components/auth/AuthPromoPanel';
import { signUp } from '@/actions/auth.actions';
import { createClient } from '@/utils/supabase/client';

type Step = 1 | 2;

interface FormData {
  name: string; nim: string; mentor: string;
  startDate: string; endDate: string;
  email: string; password: string; confirmPassword: string;
}

const EMPTY_FORM: FormData = {
  name: '', nim: '', mentor: '',
  startDate: '', endDate: '',
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
  const labels = ['', 'Weak', 'Fair', 'Strong', 'Very Strong'];
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
  
  const [state, formAction, isPending] = useActionState(signUp, null);

  const set = (key: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((er) => ({ ...er, [key]: '' }));
  };

  const validateStep1 = () => {
    const errs: Partial<FormData> = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.nim.trim()) errs.nim = 'NIM / Intern ID is required';
    if (!form.mentor.trim()) errs.mentor = 'Mentor name is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    const errs: Partial<FormData> = {};
    if (!form.startDate) errs.startDate = 'Start date is required';
    if (!form.endDate) errs.endDate = 'End date is required';
    if (!form.email.includes('@')) errs.email = 'Invalid email';
    if (form.password.length < 8) errs.password = 'Password must be at least 8 characters';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
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
          <ArrowLeft size={16} /> Back to Home
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
              <h1 className="text-heading-xl text-neutral-900">Internship Registration</h1>
              <p className="text-body-md text-neutral-500 mt-1">Create your TelIntern account now</p>
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
                      {s === 1 ? 'Personal Info' : 'Account & Location'}
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
                  <Field id="signup-name" label="Full Name" error={errors.name}>
                    <input id="signup-name" type="text" placeholder="Name according to ID" value={form.name} onChange={set('name')} className={cn('input', errors.name && 'input-error')} />
                  </Field>
                  <Field id="signup-nim" label="NIM / NIS / Intern ID" error={errors.nim}>
                    <input id="signup-nim" type="text" placeholder="Example: 1301213456" value={form.nim} onChange={set('nim')} className={cn('input', errors.nim && 'input-error')} />
                  </Field>

                  <Field id="signup-mentor" label="Mentor Name" error={errors.mentor}>
                    <input id="signup-mentor" type="text" placeholder="Field mentor name" value={form.mentor} onChange={set('mentor')} className={cn('input', errors.mentor && 'input-error')} />
                  </Field>

                  <button onClick={handleNext} className="btn btn-primary btn-full btn-lg mt-2">
                    Next <ChevronRight size={18} />
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
                  <input type="hidden" name="pembimbing" value={form.mentor} />
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Field id="signup-startdate" label="Start Date" error={errors.startDate}>
                      <input id="signup-startdate" name="mulai_magang" type="date" value={form.startDate} onChange={set('startDate')} className={cn('input', errors.startDate && 'input-error')} />
                    </Field>
                    <Field id="signup-enddate" label="End Date" error={errors.endDate}>
                      <input id="signup-enddate" name="selesai_magang" type="date" value={form.endDate} onChange={set('endDate')} className={cn('input', errors.endDate && 'input-error')} />
                    </Field>
                  </div>

                  <Field id="signup-email" label="Email" error={errors.email}>
                    <input id="signup-email" name="email" type="email" autoComplete="email" placeholder="email@intern.telkom.co.id" value={form.email} onChange={set('email')} className={cn('input', errors.email && 'input-error')} />
                  </Field>

                  <Field id="signup-password" label="Password" error={errors.password}>
                    <div className="relative">
                      <input id="signup-password" name="password" type={showPass ? 'text' : 'password'} autoComplete="new-password" placeholder="Minimum 8 characters" value={form.password} onChange={set('password')} className={cn('input pr-11', errors.password && 'input-error')} />
                      <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 p-1">
                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <PasswordStrength password={form.password} />
                  </Field>

                  <Field id="signup-confirm" label="Confirm Password" error={errors.confirmPassword}>
                    <div className="relative">
                      <input id="signup-confirm" type={showConfirm ? 'text' : 'password'} autoComplete="new-password" placeholder="Repeat password" value={form.confirmPassword} onChange={set('confirmPassword')} className={cn('input pr-11', errors.confirmPassword && 'input-error')} />
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
                          Registering...
                        </div>
                      ) : 'Register Now'}
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Login link */}
            <p className="text-center text-body-sm text-neutral-500 mt-6">
              Already have an account?{' '}
              <Link href="/login" className="text-primary-600 font-medium hover:underline">
                Login here
              </Link>
            </p>
          </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

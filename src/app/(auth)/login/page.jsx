'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

const schema = z.object({
  email:    z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export default function LoginPage() {
  const router       = useRouter();
  const { login }    = useAuth();
  const [showPw, setShowPw] = useState(false);
  const [apiError, setApiError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values) => {
    setApiError('');
    try {
      await login(values.email, values.password);
      toast.success('Welcome back!');
      router.push('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please try again.';
      setApiError(msg);
    }
  };

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="font-display text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Welcome back
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Sign in to your MyBusiness account
        </p>
      </div>

      {/* API Error banner */}
      {apiError && (
        <div className="flex items-start gap-3 p-4 rounded-xl animate-slide-in-up"
             style={{ background: 'var(--danger-muted)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <AlertCircle size={16} className="mt-0.5 shrink-0" style={{ color: 'var(--danger)' }} />
          <p className="text-sm" style={{ color: '#fca5a5' }}>{apiError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email */}
        <div>
          <label className="label">Email Address</label>
          <input
            {...register('email')}
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            className={`input ${errors.email ? 'input-error' : ''}`}
          />
          {errors.email && (
            <p className="mt-1.5 text-xs flex items-center gap-1" style={{ color: 'var(--danger)' }}>
              <AlertCircle size={11} /> {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="label mb-0">Password</label>
            <Link href="/forgot-password"
                  className="text-xs font-medium transition-colors hover:underline"
                  style={{ color: 'var(--primary)' }}>
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              {...register('password')}
              type={showPw ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              className={`input pr-10 ${errors.password ? 'input-error' : ''}`}
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 btn-ghost btn-icon p-1"
              style={{ color: 'var(--text-muted)' }}>
              {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1.5 text-xs flex items-center gap-1" style={{ color: 'var(--danger)' }}>
              <AlertCircle size={11} /> {errors.password.message}
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary btn-lg w-full mt-2">
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
              Signing in…
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <LogIn size={15} /> Sign In
            </span>
          )}
        </button>
      </form>

      {/* Demo credentials hint */}
      <div className="p-4 rounded-xl text-xs space-y-1"
           style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.12)' }}>
        <p className="font-semibold" style={{ color: '#a5b4fc' }}>Demo credentials</p>
        <p style={{ color: 'var(--text-secondary)' }}>admin@acmetech.in / Admin@1234</p>
      </div>

      {/* Sign up link */}
      <p className="text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
        Don't have an account?{' '}
        <Link href="/register" className="font-semibold hover:underline" style={{ color: 'var(--primary)' }}>
          Create one
        </Link>
      </p>
    </div>
  );
}

'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { authApi } from '@/lib/api';

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
});

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async ({ email }) => {
    await authApi.forgotPassword({ email });
    setSent(true);
  };

  if (sent) {
    return (
      <div className="space-y-6 text-center animate-scale-in">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
             style={{ background: 'var(--success-muted)', border: '1px solid rgba(34,197,94,0.2)' }}>
          <CheckCircle2 size={28} style={{ color: 'var(--success)' }} />
        </div>
        <div className="space-y-2">
          <h2 className="font-display text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Check your email
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            If that email exists in our system, a reset link has been sent. It expires in 1 hour.
          </p>
        </div>
        <Link href="/login" className="btn-secondary btn-lg inline-flex">
          <ArrowLeft size={15} /> Back to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      <div className="space-y-1">
        <h1 className="font-display text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Reset password
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Enter your email and we'll send a reset link
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="label">Email Address</label>
          <div className="relative">
            <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input
              {...register('email')}
              type="email"
              placeholder="you@company.com"
              className={`input pl-9 ${errors.email ? 'input-error' : ''}`}
            />
          </div>
          {errors.email && (
            <p className="mt-1.5 text-xs" style={{ color: 'var(--danger)' }}>
              {errors.email.message}
            </p>
          )}
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-primary btn-lg w-full">
          {isSubmitting ? 'Sending…' : 'Send Reset Link'}
        </button>
      </form>

      <Link href="/login" className="flex items-center gap-2 text-sm justify-center hover:underline"
            style={{ color: 'var(--text-secondary)' }}>
        <ArrowLeft size={14} /> Back to login
      </Link>
    </div>
  );
}

'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import { authApi } from '@/lib/api';

const schema = z.object({
  password: z.string().min(8,'At least 8 characters').regex(/[A-Z]/,'Needs uppercase').regex(/[a-z]/,'Needs lowercase').regex(/[0-9]/,'Needs a number'),
  confirm:  z.string(),
}).refine((d) => d.password === d.confirm, { message:'Passwords do not match', path:['confirm'] });

export default function ResetPasswordContent() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const token        = searchParams.get('token');
  const [showPw,    setShowPw]    = useState(false);
  const [success,   setSuccess]   = useState(false);
  const [apiError,  setApiError]  = useState('');

  const { register, handleSubmit, formState:{ errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async ({ password }) => {
    setApiError('');
    try {
      await authApi.resetPassword({ token, password });
      setSuccess(true);
      setTimeout(() => router.push('/login'), 2500);
    } catch (err) {
      setApiError(err.response?.data?.message || 'Reset failed. The link may have expired.');
    }
  };

  if (!token) return (
    <div style={{ textAlign:'center' }}>
      <p style={{ color:'var(--danger)' }}>Invalid reset link. Please request a new one.</p>
      <Link href="/forgot-password" className="btn-primary btn-lg" style={{ marginTop:'16px', display:'inline-flex' }}>Request Reset</Link>
    </div>
  );

  if (success) return (
    <div style={{ textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center', gap:'16px' }} className="animate-scale-in">
      <div style={{ width:'64px', height:'64px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--success-muted)', border:'1px solid rgba(34,197,94,0.2)' }}>
        <CheckCircle2 size={28} style={{ color:'var(--success)' }} />
      </div>
      <h2 className="font-display" style={{ fontSize:'24px', fontWeight:700, color:'var(--text-primary)' }}>Password reset!</h2>
      <p style={{ color:'var(--text-secondary)', fontSize:'14px' }}>Redirecting you to login…</p>
    </div>
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'28px' }}>
      <div>
        <h1 className="font-display" style={{ fontSize:'28px', fontWeight:700, color:'var(--text-primary)', margin:0 }}>Set new password</h1>
        <p style={{ color:'var(--text-secondary)', fontSize:'14px', marginTop:'4px' }}>Enter your new password below</p>
      </div>

      {apiError && (
        <div style={{ display:'flex', alignItems:'flex-start', gap:'10px', padding:'14px', borderRadius:'10px', background:'var(--danger-muted)', border:'1px solid rgba(239,68,68,0.2)' }} className="animate-slide-in-up">
          <AlertCircle size={16} style={{ color:'var(--danger)', marginTop:'1px', flexShrink:0 }} />
          <p style={{ fontSize:'13px', color:'#fca5a5', margin:0 }}>{apiError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} style={{ display:'flex', flexDirection:'column', gap:'18px' }}>
        <div>
          <label className="label">New Password</label>
          <div style={{ position:'relative' }}>
            <input {...register('password')} type={showPw ? 'text' : 'password'} placeholder="Min 8 characters"
              className={`input${errors.password ? ' input-error' : ''}`} style={{ paddingRight:'40px' }} />
            <button type="button" onClick={() => setShowPw(!showPw)} style={{ position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)' }}>
              {showPw ? <EyeOff size={15}/> : <Eye size={15}/>}
            </button>
          </div>
          {errors.password && <p style={{ marginTop:'6px', fontSize:'12px', color:'var(--danger)' }}>{errors.password.message}</p>}
        </div>
        <div>
          <label className="label">Confirm Password</label>
          <input {...register('confirm')} type="password" placeholder="Repeat your new password"
            className={`input${errors.confirm ? ' input-error' : ''}`} />
          {errors.confirm && <p style={{ marginTop:'6px', fontSize:'12px', color:'var(--danger)' }}>{errors.confirm.message}</p>}
        </div>
        <button type="submit" disabled={isSubmitting} className="btn-primary btn-lg" style={{ width:'100%', marginTop:'4px' }}>
          {isSubmitting ? 'Resetting…' : 'Reset Password'}
        </button>
      </form>

      <Link href="/login" style={{ textAlign:'center', fontSize:'13px', color:'var(--text-secondary)', textDecoration:'none' }}>← Back to login</Link>
    </div>
  );
}

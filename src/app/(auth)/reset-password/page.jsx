'use client';

import { Suspense } from 'react';
import ResetPasswordContent from './ResetPasswordContent';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center' }}>Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
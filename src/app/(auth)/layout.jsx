
export const metadata = { title: 'Sign In' };

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-dvh flex items-stretch">
      {/* ── Left decorative panel ── */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[42%] relative flex-col justify-between p-12 overflow-hidden"
           style={{ background: 'linear-gradient(145deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' }}>

        {/* Grid texture */}
        <div className="absolute inset-0 bg-grid-subtle bg-grid opacity-60" />

        {/* Glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full"
             style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full"
             style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.15) 0%, transparent 70%)', filter: 'blur(30px)' }} />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <img src="https://i.ibb.co/Pvx4Bd4N/favicon-copy.png" alt="Logo" className="w-10 h-10" />
          <span className="font-display font-bold text-lg text-white">MyBusiness</span>
        </div>

        {/* Center testimonial */}
        <div className="relative space-y-8">
          <div className="space-y-4">
            <h2 className="font-display text-4xl xl:text-5xl font-bold leading-tight"
                style={{ color: '#f1f5f9' }}>
              Run your business<br />
              <span style={{ color: '#818cf8' }}>without the chaos.</span>
            </h2>
            <p className="text-base leading-relaxed max-w-sm" style={{ color: '#94a3b8' }}>
              Invoices, inventory, payroll, clients — all in one platform built for growing businesses.
            </p>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2">
            {['GST Invoicing', 'Attendance', 'Inventory', 'Reports', 'Quotations'].map((f) => (
              <span key={f} className="px-3 py-1.5 rounded-full text-xs font-semibold"
                    style={{ background: 'rgba(99,102,241,0.12)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.2)' }}>
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom stat row */}
        <div className="relative flex gap-8">
          {[['10+', 'Modules'], ['∞', 'Scalable'], ['100%', 'Yours']].map(([val, label]) => (
            <div key={label}>
              <div className="font-display text-2xl font-bold" style={{ color: '#f1f5f9' }}>{val}</div>
              <div className="text-xs" style={{ color: '#64748b' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10"
           style={{ background: 'var(--bg-base)' }}>
        <div className="w-full max-w-md animate-scale-in">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                 style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <span className="font-display font-bold text-white">MyBusiness</span>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}

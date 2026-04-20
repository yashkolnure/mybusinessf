'use client';
import { cn } from '@/lib/utils';
import { X, AlertTriangle, Loader2, Search } from 'lucide-react';
import { useEffect } from 'react';

// ── STAT CARD ────────────────────────────────────────────────────────────────
export function StatCard({ title, value, subtitle, icon: Icon, trend, trendLabel, accentColor = '#6366f1', loading }) {
  if (loading) {
    return (
      <div className="stat-card" style={{ minHeight: '108px' }}>
        <div className="skeleton" style={{ position: 'absolute', inset: 0, borderRadius: '0.875rem' }} />
      </div>
    );
  }
  const positive = trend > 0;
  const negative = trend < 0;
  return (
    <div className="stat-card">
      <div style={{ position: 'absolute', top: 0, right: 0, width: '112px', height: '112px', borderRadius: '50%', background: `radial-gradient(circle, ${accentColor}22 0%, transparent 70%)`, filter: 'blur(20px)', transform: 'translate(30%,-30%)', pointerEvents: 'none' }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative' }}>
        <div>
          <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: '2px' }}>{title}</p>
          <p className="font-display" style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>{value}</p>
          {subtitle && <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{subtitle}</p>}
        </div>
        {Icon && (
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${accentColor}18`, border: `1px solid ${accentColor}30`, flexShrink: 0 }}>
            <Icon size={18} style={{ color: accentColor }} />
          </div>
        )}
      </div>
      {trend !== undefined && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: positive ? '#4ade80' : negative ? '#f87171' : 'var(--text-muted)' }}>
            {positive ? '↑' : negative ? '↓' : '→'} {Math.abs(trend)}%
          </span>
          {trendLabel && <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{trendLabel}</span>}
        </div>
      )}
    </div>
  );
}

// ── PAGE HEADER ──────────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, actions, children }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '24px' }}>
      <div>
        <h1 className="font-display" style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{title}</h1>
        {subtitle && <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '2px' }}>{subtitle}</p>}
      </div>
      {(actions || children) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>{actions || children}</div>
      )}
    </div>
  );
}

// ── EMPTY STATE ──────────────────────────────────────────────────────────────
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 24px', textAlign: 'center' }}>
      {Icon && (
        <div style={{ width: '56px', height: '56px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', background: 'var(--primary-muted)', border: '1px solid rgba(99,102,241,0.15)' }}>
          <Icon size={24} style={{ color: 'var(--primary)' }} />
        </div>
      )}
      <h3 style={{ fontWeight: 600, fontSize: '16px', color: 'var(--text-primary)', margin: '0 0 8px' }}>{title}</h3>
      {description && <p style={{ fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '340px', margin: 0 }}>{description}</p>}
      {action && <div style={{ marginTop: '20px' }}>{action}</div>}
    </div>
  );
}

// ── SKELETON ─────────────────────────────────────────────────────────────────
export function Skeleton({ className = '', style = {} }) {
  return <div className={`skeleton ${className}`} style={style} />;
}

export function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>{Array.from({ length: cols }).map((_, i) => <th key={i}><Skeleton style={{ height: '12px', width: '80px' }} /></th>)}</tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i}>{Array.from({ length: cols }).map((_, j) => <td key={j}><Skeleton style={{ height: '16px', width: `${60 + Math.random() * 80}px` }} /></td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── STATUS BADGE ─────────────────────────────────────────────────────────────
export function StatusBadge({ statusMap, status }) {
  const config = (statusMap && statusMap[status]) || { label: status, class: 'badge-neutral' };
  return <span className={`badge ${config.class}`}>{config.label}</span>;
}

// ── MODAL ────────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, size = 'md', footer }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape' && onClose) onClose(); };
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  const widths = { sm: '440px', md: '560px', lg: '760px', xl: '1020px' };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div className="animate-fade-in" onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }} />
      <div className="animate-scale-in" style={{ position: 'relative', width: '100%', maxWidth: widths[size], borderRadius: '16px', overflow: 'hidden', background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
          <h2 className="font-display" style={{ fontWeight: 700, fontSize: '18px', color: 'var(--text-primary)', margin: 0 }}>{title}</h2>
          <button onClick={onClose} className="btn-ghost btn-icon"><X size={16} /></button>
        </div>
        <div style={{ padding: '20px 24px', overflowY: 'auto', maxHeight: '70vh' }}>{children}</div>
        {footer && (
          <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid var(--border-subtle)' }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// ── CONFIRM DIALOG ───────────────────────────────────────────────────────────
export function ConfirmDialog({ open, onClose, onConfirm, title, description, confirmLabel = 'Confirm', danger = false, loading }) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm"
      footer={<>
        <button className="btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
        <button className={danger ? 'btn-danger' : 'btn-primary'} onClick={onConfirm} disabled={loading}>
          {loading ? <><Loader2 size={14} className="animate-spin" /> Working…</> : confirmLabel}
        </button>
      </>}>
      {description && (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: danger ? 'var(--danger-muted)' : 'var(--primary-muted)' }}>
            <AlertTriangle size={18} style={{ color: danger ? 'var(--danger)' : 'var(--primary)' }} />
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', paddingTop: '8px', margin: 0 }}>{description}</p>
        </div>
      )}
    </Modal>
  );
}

// ── SEARCH INPUT ─────────────────────────────────────────────────────────────
export function SearchInput({ value, onChange, placeholder = 'Search…', style: extraStyle = {} }) {
  return (
    <div style={{ position: 'relative', ...extraStyle }}>
      <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
      <input
        type="text" value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input"
        style={{ paddingLeft: '36px', height: '38px', minWidth: '220px' }}
      />
    </div>
  );
}

// ── PAGINATION ───────────────────────────────────────────────────────────────
export function Pagination({ meta, onPageChange }) {
  if (!meta || meta.totalPages <= 1) return null;
  const { page, totalPages, total, limit } = meta;
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderTop: '1px solid var(--border-subtle)' }}>
      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Showing {from}–{to} of {total}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <button onClick={() => onPageChange(page - 1)} disabled={page <= 1} className="btn-secondary btn-sm" style={{ padding: '4px 12px' }}>← Prev</button>
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
          const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
          if (p < 1 || p > totalPages) return null;
          return <button key={p} onClick={() => onPageChange(p)} className={p === page ? 'btn-primary btn-sm' : 'btn-secondary btn-sm'} style={{ padding: '4px 10px' }}>{p}</button>;
        })}
        <button onClick={() => onPageChange(page + 1)} disabled={page >= totalPages} className="btn-secondary btn-sm" style={{ padding: '4px 12px' }}>Next →</button>
      </div>
    </div>
  );
}

// ── FORM FIELD ───────────────────────────────────────────────────────────────
export function FormField({ label, error, required, children, hint }) {
  return (
    <div>
      {label && <label className="label">{label}{required && <span style={{ color: 'var(--danger)' }}> *</span>}</label>}
      {children}
      {hint && !error && <p style={{ marginTop: '4px', fontSize: '12px', color: 'var(--text-muted)' }}>{hint}</p>}
      {error && <p style={{ marginTop: '6px', fontSize: '12px', color: 'var(--danger)' }}>{error}</p>}
    </div>
  );
}

// ── SELECT ───────────────────────────────────────────────────────────────────
export function Select({ options = [], value, onChange, placeholder = 'Select…', error }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className={`input${error ? ' input-error' : ''}`}
      style={{ cursor: 'pointer', appearance: 'none' }}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(({ label, value: v }) => <option key={v} value={v}>{label}</option>)}
    </select>
  );
}

// ── SPINNER ──────────────────────────────────────────────────────────────────
export function Spinner({ size = 18 }) {
  return <Loader2 size={size} className="animate-spin" style={{ color: 'var(--primary)' }} />;
}

// ── TABS ─────────────────────────────────────────────────────────────────────
export function Tabs({ tabs, active, onChange }) {
  return (
    <div style={{ display: 'flex', gap: '4px', padding: '4px', borderRadius: '12px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', overflowX: 'auto' }}>
      {tabs.map((tab) => (
        <button key={tab.value} onClick={() => onChange(tab.value)}
          className={active === tab.value ? 'btn-primary' : 'btn-ghost'}
          style={{ fontSize: '13px', padding: '6px 14px', borderRadius: '8px', whiteSpace: 'nowrap' }}>
          {tab.label}
          {tab.count !== undefined && (
            <span style={{ marginLeft: '6px', padding: '1px 6px', borderRadius: '9999px', fontSize: '10px', fontWeight: 700, background: active === tab.value ? 'rgba(255,255,255,0.2)' : 'var(--bg-elevated)' }}>{tab.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}

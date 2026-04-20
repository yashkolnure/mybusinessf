'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { notificationsApi } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import {
  Menu, Bell, Search, ChevronRight, Settings, LogOut,
  User, Shield, Building2, X
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Breadcrumb builder ───────────────────────────────────────────────────────
const LABELS = {
  dashboard: 'Dashboard', clients: 'Clients', invoices: 'Invoices',
  quotations: 'Quotations', workforce: 'Workforce', vendors: 'Vendors',
  inventory: 'Inventory', finance: 'Finance', reports: 'Reports',
  settings: 'Settings', notifications: 'Notifications', audit: 'Audit Log',
  users: 'Users', new: 'New', edit: 'Edit',
};

function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);
  return (
    <nav className="hidden sm:flex items-center gap-1 text-sm">
      {segments.map((seg, i) => {
        const isLast = i === segments.length - 1;
        const label  = LABELS[seg] || seg;
        const href   = '/' + segments.slice(0, i + 1).join('/');
        return (
          <span key={seg} className="flex items-center gap-1">
            {i > 0 && <ChevronRight size={12} style={{ color: 'var(--text-muted)' }} />}
            {isLast ? (
              <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{label}</span>
            ) : (
              <Link href={href} className="transition-colors hover:underline"
                    style={{ color: 'var(--text-secondary)' }}>{label}</Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}

// ── User dropdown ────────────────────────────────────────────────────────────
function UserMenu() {
  const { user, business, logout, hasRole } = useAuth();
  const router   = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const items = [
    { label: 'Profile',  icon: User,     onClick: () => router.push('/settings?tab=profile') },
    { label: 'Settings', icon: Settings, onClick: () => router.push('/settings') },
    ...(hasRole('SUPER_ADMIN','ADMIN') ? [{ label: 'Audit Log', icon: Shield, onClick: () => router.push('/audit') }] : []),
    { divider: true },
    { label: 'Sign Out', icon: LogOut, onClick: logout, danger: true },
  ];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all duration-150"
        style={{ background: open ? 'var(--bg-hover)' : 'transparent' }}>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold uppercase"
             style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#fff' }}>
          {user?.name?.[0]}
        </div>
        <div className="hidden md:block text-left">
          <p className="text-xs font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>
            {user?.name?.split(' ')[0]}
          </p>
          <p className="text-xs leading-tight" style={{ color: 'var(--text-muted)' }}>
            {user?.role?.replace('_', ' ')}
          </p>
        </div>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-52 rounded-xl overflow-hidden animate-scale-in z-50"
             style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-lg)' }}>
          {/* Business info */}
          <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{business?.name}</p>
            <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
          </div>

          <div className="p-1.5">
            {items.map((item, i) => {
              if (item.divider) return <div key={i} className="my-1" style={{ borderTop: '1px solid var(--border-subtle)' }} />;
              const Icon = item.icon;
              return (
                <button key={i} onClick={() => { item.onClick(); setOpen(false); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150 text-left"
                        style={{ color: item.danger ? 'var(--danger)' : 'var(--text-secondary)' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = item.danger ? 'var(--danger-muted)' : 'var(--bg-hover)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <Icon size={14} />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Notification bell ─────────────────────────────────────────────────────────
function NotificationBell() {
  const router = useRouter();
  const { data } = useQuery({
    queryKey: ['notif-count'],
    queryFn:  () => notificationsApi.unreadCount().then((r) => r.data.data.unreadCount),
    refetchInterval: 60000,
  });

  const count = data || 0;

  return (
    <button
      onClick={() => router.push('/notifications')}
      className="btn-ghost btn-icon relative"
      style={{ color: 'var(--text-secondary)' }}>
      <Bell size={17} />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center"
              style={{ background: 'var(--danger)', color: '#fff' }}>
          {count > 9 ? '9+' : count}
        </span>
      )}
    </button>
  );
}

// ── Header ───────────────────────────────────────────────────────────────────
export default function Header({ sidebarCollapsed, onOpenMobileSidebar }) {
  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between px-5 sm:px-6"
      style={{
        height:      'var(--header-height)',
        background:  'rgba(8, 14, 26, 0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom:'1px solid var(--border-subtle)',
      }}>

      {/* Left */}
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <button onClick={onOpenMobileSidebar} className="btn-ghost btn-icon lg:hidden">
          <Menu size={18} />
        </button>

        <Breadcrumbs />
      </div>

      {/* Right */}
      <div className="flex items-center gap-1.5">
        <NotificationBell />
        <div className="w-px h-4 mx-1" style={{ background: 'var(--border-subtle)' }} />
        <UserMenu />
      </div>
    </header>
  );
}

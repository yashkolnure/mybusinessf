'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Users, FileText, Receipt, ShoppingCart, Package,
  DollarSign, BarChart3, Settings, Bell, Shield, Building2,
  ChevronLeft, ChevronRight, UsersRound, Store, ClipboardList,
  X, LogOut, User
} from 'lucide-react';

// ── Nav config ───────────────────────────────────────────────────────────────
const NAV = [
  {
    group: 'Overview',
    items: [
      { label: 'Dashboard',     href: '/dashboard',      icon: LayoutDashboard, module: null },
      { label: 'Notifications', href: '/notifications',  icon: Bell,            module: 'notifications', badge: 'unread' },
    ],
  },
  {
    group: 'Business',
    items: [
      { label: 'Clients',       href: '/clients',        icon: UsersRound,      module: 'clients' },
      { label: 'Quotations',    href: '/quotations',     icon: ClipboardList,   module: 'quotations' },
      { label: 'Invoices',      href: '/invoices',       icon: Receipt,         module: 'invoicing' },
    ],
  },
  {
    group: 'Operations',
    items: [
      { label: 'Workforce',     href: '/workforce',      icon: Users,           module: 'workforce' },
      { label: 'Vendors',       href: '/vendors',        icon: Store,           module: 'vendors' },
      { label: 'Inventory',     href: '/inventory',      icon: Package,         module: 'inventory' },
    ],
  },
  {
    group: 'Finance & Reports',
    items: [
      { label: 'Finance',       href: '/finance',        icon: DollarSign,      module: 'finance' },
      { label: 'Reports',       href: '/reports',        icon: BarChart3,       module: 'reports' },
    ],
  },
  {
    group: 'Admin',
    items: [
      { label: 'Users',         href: '/users',          icon: User,            module: 'users',   adminOnly: true },
      { label: 'Audit Log',     href: '/audit',          icon: Shield,          module: 'audit',   adminOnly: true },
      { label: 'Settings',      href: '/settings',       icon: Settings,        module: 'settings' },
    ],
  },
];

// ── Sidebar ──────────────────────────────────────────────────────────────────
export default function Sidebar({ collapsed, mobileOpen, onToggleCollapse, onCloseMobile }) {
  const pathname   = usePathname();
  const { user, can, hasRole, logout, business } = useAuth();

  const isActive = (href) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  const canSee = (item) => {
    if (item.adminOnly && !hasRole('SUPER_ADMIN', 'ADMIN')) return false;
    if (!item.module) return true;
    return can(item.module, 'view');
  };

  const sidebarW = collapsed ? 'lg:w-[var(--sidebar-collapsed)]' : 'lg:w-[var(--sidebar-width)]';

  return (
    <aside
      className={cn(
        'fixed top-0 left-0 h-full z-50 flex flex-col transition-all duration-300',
        'w-[var(--sidebar-width)]',
        sidebarW,
        // Mobile: slide in/out
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      )}
      style={{
        background:  'var(--bg-surface)',
        borderRight: '1px solid var(--border-subtle)',
      }}>

      {/* ── Logo ─────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 h-[var(--header-height)] shrink-0"
           style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center"
                 style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', boxShadow: '0 0 12px rgba(99,102,241,0.35)' }}>
              <Building2 size={15} color="white" />
            </div>
            <span className="font-display font-bold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
              {business?.name || 'MyBusiness'}
            </span>
          </Link>
        )}

        {collapsed && (
          <div className="w-8 h-8 mx-auto rounded-lg flex items-center justify-center"
               style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}>
            <Building2 size={15} color="white" />
          </div>
        )}

        {/* Mobile close */}
        <button onClick={onCloseMobile} className="btn-ghost btn-icon lg:hidden" aria-label="Close sidebar">
          <X size={16} />
        </button>
      </div>

      {/* ── Nav ──────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-3 space-y-0.5">
        {NAV.map((group) => {
          const visible = group.items.filter(canSee);
          if (!visible.length) return null;
          return (
            <div key={group.group} className="mb-3">
              {!collapsed && (
                <div className="px-3 mb-1">
                  <span style={{ color: 'var(--text-muted)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase' }}>
                    {group.group}
                  </span>
                </div>
              )}
              {collapsed && <div className="border-t my-2" style={{ borderColor: 'var(--border-subtle)' }} />}

              {visible.map((item) => {
                const active = isActive(item.href);
                const Icon   = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      'nav-item relative',
                      collapsed && 'justify-center px-2',
                      active && 'nav-item-active',
                    )}>
                    <Icon size={17} className="shrink-0" />
                    {!collapsed && (
                      <span className="truncate flex-1">{item.label}</span>
                    )}
                    {/* Active indicator dot */}
                    {active && !collapsed && (
                      <div className="w-1.5 h-1.5 rounded-full shrink-0"
                           style={{ background: 'var(--primary)' }} />
                    )}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* ── User footer ──────────────────────────────── */}
      <div className="px-3 py-3 shrink-0" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        {!collapsed ? (
          <div className="flex items-center gap-2.5">
            {/* Avatar */}
            <div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center font-bold text-sm uppercase"
                 style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#fff' }}>
              {user?.name?.[0] || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{user?.name}</p>
              <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{user?.role?.replace('_',' ')}</p>
            </div>
            <button onClick={logout} className="btn-ghost btn-icon shrink-0" title="Logout">
              <LogOut size={14} style={{ color: 'var(--text-muted)' }} />
            </button>
          </div>
        ) : (
          <button onClick={logout} className="btn-ghost btn-icon w-full justify-center" title="Logout">
            <LogOut size={15} />
          </button>
        )}
      </div>

      {/* ── Collapse toggle (desktop only) ───────────── */}
      <button
        onClick={onToggleCollapse}
        className="hidden lg:flex absolute -right-3 top-[76px] w-6 h-6 rounded-full items-center justify-center z-10 transition-all duration-150"
        style={{
          background:  'var(--bg-elevated)',
          border:      '1px solid var(--border-default)',
          color:       'var(--text-secondary)',
          boxShadow:   'var(--shadow-md)',
        }}>
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
}

'use client';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi, financeApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { StatCard, PageHeader, Skeleton, EmptyState } from '@/components/ui/index.jsx';
import { formatCurrency, formatDate, INVOICE_STATUS } from '@/lib/utils';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  Receipt, Users, TrendingUp, AlertCircle, Package,
  UserCheck, Clock, DollarSign, ArrowRight, ChevronRight
} from 'lucide-react';
import Link from 'next/link';

// ── Custom chart tooltip ─────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label, symbol = '₹' }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-4 py-3 text-sm"
         style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-lg)' }}>
      <p className="font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
          <span style={{ color: 'var(--text-primary)' }}>
            {entry.name}: <strong>{symbol}{Number(entry.value).toLocaleString('en-IN')}</strong>
          </span>
        </div>
      ))}
    </div>
  );
};

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user, currencySymbol } = useAuth();

  const { data: dash, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn:  () => dashboardApi.get().then((r) => r.data.data),
  });

  const { data: cashFlow } = useQuery({
    queryKey: ['cash-flow', new Date().getFullYear()],
    queryFn:  () => financeApi.cashFlow({ year: new Date().getFullYear() }).then((r) => r.data.data),
  });

  const chartData = cashFlow?.months?.map((m) => ({
    month:   MONTH_NAMES[m.month - 1],
    Income:  m.income,
    Expense: m.expense,
    Profit:  m.profit,
  })) || [];

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-6 max-w-[1400px]">

      {/* ── Welcome ─────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {greeting()}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* ── KPI Row 1 ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Revenue This Month"
          value={formatCurrency(dash?.revenue?.thisMonth, currencySymbol)}
          subtitle={`${formatCurrency(dash?.revenue?.thisYear, currencySymbol)} this year`}
          icon={TrendingUp}
          accentColor="#6366f1"
          loading={isLoading}
        />
        <StatCard
          title="Overdue Invoices"
          value={dash?.invoices?.overdueCount ?? '—'}
          subtitle={formatCurrency(dash?.invoices?.overdueAmount, currencySymbol) + ' outstanding'}
          icon={AlertCircle}
          accentColor="#ef4444"
          loading={isLoading}
        />
        <StatCard
          title="Total Clients"
          value={dash?.clients?.total ?? '—'}
          subtitle={`+${dash?.clients?.newThisMonth ?? 0} this month`}
          icon={Users}
          accentColor="#f59e0b"
          loading={isLoading}
        />
        <StatCard
          title="Pending Approvals"
          value={(dash?.workforce?.pendingLeaves ?? 0) + (dash?.quotations?.pendingApproval ?? 0)}
          subtitle={`${dash?.workforce?.pendingLeaves ?? 0} leaves, ${dash?.quotations?.pendingApproval ?? 0} quotes`}
          icon={Clock}
          accentColor="#22c55e"
          loading={isLoading}
        />
      </div>

      {/* ── KPI Row 2 ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Vendor Payables"
          value={formatCurrency(dash?.payables?.totalAmount, currencySymbol)}
          subtitle={`${dash?.payables?.count ?? 0} open purchases`}
          icon={DollarSign}
          accentColor="#a78bfa"
          loading={isLoading}
        />
        <StatCard
          title="Low Stock Products"
          value={dash?.inventory?.lowStockCount ?? '—'}
          subtitle="Needs reordering"
          icon={Package}
          accentColor="#fb923c"
          loading={isLoading}
        />
        <StatCard
          title="Total Employees"
          value={dash?.workforce?.totalEmployees ?? '—'}
          subtitle={`${dash?.workforce?.todayAbsent ?? 0} absent today`}
          icon={UserCheck}
          accentColor="#34d399"
          loading={isLoading}
        />
        <StatCard
          title="Pending Quotes"
          value={dash?.quotations?.pendingApproval ?? '—'}
          subtitle="Awaiting client response"
          icon={Receipt}
          accentColor="#60a5fa"
          loading={isLoading}
        />
      </div>

      {/* ── Charts Row ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

        {/* Cash Flow - area chart */}
        <div className="xl:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-display font-bold text-base" style={{ color: 'var(--text-primary)' }}>
                Cash Flow {new Date().getFullYear()}
              </h2>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Monthly income vs expenses</p>
            </div>
          </div>

          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#f87171" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#f87171" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false}
                       tickFormatter={(v) => `${currencySymbol}${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<ChartTooltip symbol={currencySymbol} />} />
                <Area type="monotone" dataKey="Income"  stroke="#6366f1" strokeWidth={2} fill="url(#incomeGrad)"  dot={false} />
                <Area type="monotone" dataKey="Expense" stroke="#f87171" strokeWidth={2} fill="url(#expenseGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] skeleton rounded-xl" />
          )}
        </div>

        {/* Invoice Status Breakdown */}
        <div className="card p-5">
          <div className="mb-5">
            <h2 className="font-display font-bold text-base" style={{ color: 'var(--text-primary)' }}>
              Invoice Status
            </h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Current breakdown</p>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-8 rounded-lg" />)}
            </div>
          ) : (
            <div className="space-y-2.5">
              {Object.entries(dash?.invoices?.byStatus || {}).map(([status, info]) => {
                const cfg = INVOICE_STATUS[status];
                if (!cfg) return null;
                const pct = dash?.invoices?.byStatus
                  ? Math.round((info.count / Object.values(dash.invoices.byStatus).reduce((s, v) => s + v.count, 0)) * 100)
                  : 0;
                return (
                  <div key={status}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`badge badge-sm ${cfg.class}`}>{cfg.label}</span>
                      <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                        {info.count} • {formatCurrency(info.outstanding, currencySymbol)}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-overlay)' }}>
                      <div className="h-full rounded-full transition-all duration-500"
                           style={{ width: `${pct}%`, background: 'var(--primary)' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Recent Invoices ──────────────────────────────────────────── */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4"
             style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <div>
            <h2 className="font-display font-bold text-base" style={{ color: 'var(--text-primary)' }}>Recent Invoices</h2>
          </div>
          <Link href="/invoices" className="flex items-center gap-1 text-xs font-semibold hover:underline"
                style={{ color: 'var(--primary)' }}>
            View all <ArrowRight size={12} />
          </Link>
        </div>

        {isLoading ? (
          <div className="p-5 space-y-3">
            {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-12 rounded-lg" />)}
          </div>
        ) : !dash?.recentInvoices?.length ? (
          <EmptyState
            icon={Receipt}
            title="No invoices yet"
            description="Create your first invoice to get started."
            action={<Link href="/invoices/new" className="btn-primary btn-sm">+ New Invoice</Link>}
          />
        ) : (
          <div className="table-wrapper border-0 rounded-none">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Client</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Balance</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {dash.recentInvoices.map((inv) => {
                  const cfg = INVOICE_STATUS[inv.status];
                  return (
                    <tr key={inv.id} className="cursor-pointer"
                        onClick={() => window.location.href = `/invoices/${inv.id}`}>
                      <td>
                        <span className="font-mono text-xs font-semibold" style={{ color: 'var(--primary)' }}>
                          {inv.invoiceNumber}
                        </span>
                      </td>
                      <td className="font-medium">{inv.client?.name}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{formatDate(inv.date)}</td>
                      <td className="font-semibold">{formatCurrency(inv.totalAmount, currencySymbol)}</td>
                      <td>{formatCurrency(inv.balanceAmount, currencySymbol)}</td>
                      <td>
                        {cfg && <span className={`badge ${cfg.class}`}>{cfg.label}</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Quick Actions ─────────────────────────────────────────────── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'12px' }} className="sm:grid-cols-6">
        {[
          { label: 'New Invoice',   href: '/invoices/new',         color: '#6366f1', icon: '🧾' },
          { label: 'New Quotation', href: '/quotations/new',       color: '#f59e0b', icon: '📋' },
          { label: 'Add Client',    href: '/clients/new',          color: '#22c55e', icon: '👤' },
          { label: 'Add Expense',   href: '/finance?modal=expense', color: '#ef4444', icon: '💸' },
          { label: 'Add Product',   href: '/inventory?modal=add',  color: '#a78bfa', icon: '📦' },
          { label: 'Attendance',    href: '/workforce?tab=attendance', color: '#34d399', icon: '✅' },
        ].map(({ label, href, color, icon }) => (
          <Link key={href} href={href} style={{ textDecoration:'none' }}>
            <div className="card-hover" style={{ padding:'16px', display:'flex', flexDirection:'column', alignItems:'center', gap:'8px', textAlign:'center', cursor:'pointer' }}>
              <div style={{ width:'36px', height:'36px', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', background:`${color}18`, border:`1px solid ${color}30` }}>
                {icon}
              </div>
              <span style={{ fontSize:'12px', fontWeight:600, color:'var(--text-secondary)' }}>{label}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

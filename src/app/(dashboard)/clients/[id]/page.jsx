'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { clientsApi, invoicesApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader, Tabs, EmptyState, Skeleton, StatusBadge } from '@/components/ui/index.jsx';
import { formatCurrency, formatDate, INVOICE_STATUS } from '@/lib/utils';
import { ArrowLeft, Pencil, Mail, Phone, Building2, Receipt, FileText } from 'lucide-react';
import Link from 'next/link';

const TABS = [{ label:'Overview', value:'overview' }, { label:'Invoices', value:'invoices' }, { label:'Statement', value:'statement' }];

export default function ClientDetailPage({ params }) {
  const { currencySymbol, can } = useAuth();
  const [tab, setTab] = useState('overview');

  const { data: client, isLoading } = useQuery({
    queryKey: ['client', params.id],
    queryFn:  () => clientsApi.get(params.id).then((r) => r.data.data),
  });

  const { data: activity } = useQuery({
    queryKey: ['client-activity', params.id],
    queryFn:  () => clientsApi.getActivity(params.id).then((r) => r.data.data),
    enabled:  tab === 'invoices' || tab === 'overview',
  });

  const { data: statement } = useQuery({
    queryKey: ['client-statement', params.id],
    queryFn:  () => clientsApi.getStatement(params.id, {}).then((r) => r.data.data),
    enabled:  tab === 'statement',
  });

  if (isLoading) return (
    <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
      {[...Array(4)].map((_,i) => <Skeleton key={i} style={{ height:'60px', borderRadius:'10px' }} />)}
    </div>
  );

  if (!client) return <div style={{ color:'var(--danger)' }}>Client not found.</div>;

  const Row = ({ icon:Icon, label, value }) => value ? (
    <div style={{ display:'flex', alignItems:'center', gap:'10px', padding:'10px 0', borderBottom:'1px solid var(--border-subtle)' }}>
      <Icon size={14} style={{ color:'var(--text-muted)', flexShrink:0 }} />
      <span style={{ fontSize:'12px', color:'var(--text-muted)', width:'120px', flexShrink:0 }}>{label}</span>
      <span style={{ fontSize:'13px', color:'var(--text-primary)', fontWeight:500 }}>{value}</span>
    </div>
  ) : null;

  return (
    <div style={{ maxWidth:'960px', display:'flex', flexDirection:'column', gap:'20px' }}>
      <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
        <Link href="/clients" className="btn-ghost btn-icon"><ArrowLeft size={16}/></Link>
        <PageHeader
          title={client.name}
          subtitle={client.company || client.email || ''}
          actions={can('clients','edit') && <Link href={`/clients/${params.id}/edit`} className="btn-secondary"><Pencil size={13}/> Edit</Link>}
        />
      </div>

      {/* Stats row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'12px' }}>
        {[
          { label:'Total Invoiced',  value: formatCurrency(statement?.summary?.totalInvoiced || activity?.invoices?.reduce((s,i)=>s+i.totalAmount,0) || 0, currencySymbol), color:'#a5b4fc' },
          { label:'Total Paid',      value: formatCurrency(statement?.summary?.totalPaid     || activity?.invoices?.reduce((s,i)=>s+i.paidAmount,0)  || 0, currencySymbol), color:'#4ade80' },
          { label:'Outstanding',     value: formatCurrency(client.outstandingBalance || 0, currencySymbol), color: client.outstandingBalance > 0 ? '#f87171' : '#4ade80' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card" style={{ padding:'16px' }}>
            <p style={{ fontSize:'11px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--text-muted)', margin:'0 0 4px' }}>{label}</p>
            <p className="font-display" style={{ fontSize:'22px', fontWeight:700, color, margin:0 }}>{value}</p>
          </div>
        ))}
      </div>

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {/* Overview Tab */}
      {tab === 'overview' && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
          <div className="card" style={{ padding:'20px' }}>
            <h3 style={{ margin:'0 0 12px', fontSize:'13px', fontWeight:700, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'0.06em' }}>Contact Details</h3>
            <Row icon={Mail}      label="Email"     value={client.email} />
            <Row icon={Phone}     label="Phone"     value={client.phone} />
            <Row icon={Phone}     label="Alt Phone" value={client.alternatePhone} />
            <Row icon={Building2} label="Company"   value={client.company} />
            <Row icon={FileText}  label="GSTIN"     value={client.gstin} />
            <Row icon={FileText}  label="PAN"       value={client.pan} />
          </div>
          <div className="card" style={{ padding:'20px' }}>
            <h3 style={{ margin:'0 0 12px', fontSize:'13px', fontWeight:700, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'0.06em' }}>Billing Address</h3>
            {[client.billingAddress, client.billingCity, client.billingState, client.billingPincode].filter(Boolean).join(', ')
              ? <p style={{ fontSize:'14px', color:'var(--text-primary)', lineHeight:1.6 }}>
                  {[client.billingAddress, client.billingCity, client.billingState, client.billingPincode].filter(Boolean).join(', ')}
                </p>
              : <p style={{ color:'var(--text-muted)', fontSize:'13px' }}>No billing address on file.</p>}
            {client.notes && (
              <>
                <h3 style={{ margin:'16px 0 8px', fontSize:'13px', fontWeight:700, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'0.06em' }}>Notes</h3>
                <p style={{ fontSize:'13px', color:'var(--text-secondary)', lineHeight:1.6 }}>{client.notes}</p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Invoices Tab */}
      {tab === 'invoices' && (
        <div className="card" style={{ overflow:'hidden' }}>
          {!activity?.invoices?.length ? (
            <EmptyState icon={Receipt} title="No invoices for this client"
              action={can('invoicing','create') && <Link href={`/invoices/new?clientId=${params.id}`} className="btn-primary btn-sm">Create Invoice</Link>} />
          ) : (
            <table className="data-table">
              <thead><tr><th>Invoice #</th><th>Date</th><th>Total</th><th>Paid</th><th>Balance</th><th>Status</th></tr></thead>
              <tbody>
                {activity.invoices.map((inv) => {
                  const cfg = INVOICE_STATUS[inv.status];
                  return (
                    <tr key={inv.id}>
                      <td><Link href={`/invoices/${inv.id}`} style={{ fontFamily:'monospace', fontSize:'12px', fontWeight:600, color:'var(--primary)', textDecoration:'none' }}>{inv.invoiceNumber}</Link></td>
                      <td style={{ color:'var(--text-secondary)' }}>{formatDate(inv.date)}</td>
                      <td style={{ fontWeight:600 }}>{formatCurrency(inv.totalAmount, currencySymbol)}</td>
                      <td style={{ color:'#4ade80' }}>{formatCurrency(inv.paidAmount, currencySymbol)}</td>
                      <td style={{ color: inv.balanceAmount > 0 ? '#f87171' : '#4ade80', fontWeight:600 }}>{formatCurrency(inv.balanceAmount, currencySymbol)}</td>
                      <td>{cfg && <span className={`badge ${cfg.class}`}>{cfg.label}</span>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Statement Tab */}
      {tab === 'statement' && (
        <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
          {statement && (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px' }}>
              {[
                { label:'Total Invoiced', value: statement.summary.totalInvoiced },
                { label:'Total Paid',     value: statement.summary.totalPaid },
                { label:'Balance Due',    value: statement.summary.totalBalance },
                { label:'Overdue',        value: statement.summary.overdueAmount },
              ].map(({ label, value }) => (
                <div key={label} className="card" style={{ padding:'14px' }}>
                  <p style={{ fontSize:'11px', color:'var(--text-muted)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', margin:'0 0 4px' }}>{label}</p>
                  <p style={{ fontSize:'18px', fontWeight:700, color:'var(--text-primary)', margin:0 }}>{formatCurrency(value, currencySymbol)}</p>
                </div>
              ))}
            </div>
          )}
          <div className="card" style={{ overflow:'hidden' }}>
            {!statement?.invoices?.length ? (
              <EmptyState icon={FileText} title="No invoices in this period" />
            ) : (
              <table className="data-table">
                <thead><tr><th>Invoice #</th><th>Date</th><th>Due</th><th>Total</th><th>Paid</th><th>Balance</th><th>Status</th></tr></thead>
                <tbody>
                  {statement.invoices.map((inv) => {
                    const cfg = INVOICE_STATUS[inv.status];
                    return (
                      <tr key={inv.id}>
                        <td><Link href={`/invoices/${inv.id}`} style={{ fontFamily:'monospace', fontSize:'12px', fontWeight:600, color:'var(--primary)', textDecoration:'none' }}>{inv.invoiceNumber}</Link></td>
                        <td style={{ color:'var(--text-secondary)' }}>{formatDate(inv.date)}</td>
                        <td style={{ color:'var(--text-secondary)' }}>{formatDate(inv.dueDate)}</td>
                        <td style={{ fontWeight:600 }}>{formatCurrency(inv.totalAmount, currencySymbol)}</td>
                        <td>{formatCurrency(inv.paidAmount, currencySymbol)}</td>
                        <td style={{ color: inv.balanceAmount > 0 ? '#f87171' : '#4ade80', fontWeight:600 }}>{formatCurrency(inv.balanceAmount, currencySymbol)}</td>
                        <td>{cfg && <span className={`badge ${cfg.class}`}>{cfg.label}</span>}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

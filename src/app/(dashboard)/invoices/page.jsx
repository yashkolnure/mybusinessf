'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invoicesApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader, SearchInput, EmptyState, TableSkeleton, Pagination, Tabs, ConfirmDialog } from '@/components/ui/index.jsx';
import { formatCurrency, formatDate, INVOICE_STATUS, downloadBlob } from '@/lib/utils';
import { Plus, Receipt, Send, Download, Copy, XCircle, CreditCard, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

const STATUS_TABS = [
  { label: 'All', value: '' },
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Sent', value: 'SENT' },
  { label: 'Overdue', value: 'OVERDUE' },
  { label: 'Partial', value: 'PARTIALLY_PAID' },
  { label: 'Paid', value: 'PAID' },
];

export default function InvoicesPage() {
  const { can, currencySymbol } = useAuth();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [cancelTarget, setCancelTarget] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['invoices', page, search, status],
    queryFn: () => invoicesApi.list({ page, limit: 20, search, ...(status && { status }) }).then((r) => r.data),
    placeholderData: (prev) => prev,
  });

  const sendMutation = useMutation({
    mutationFn: (id) => invoicesApi.send(id),
    onSuccess: () => { toast.success('Invoice sent!'); qc.invalidateQueries({ queryKey: ['invoices'] }); },
    onError: () => toast.error('Failed to send invoice.'),
  });

  const cancelMutation = useMutation({
    mutationFn: (id) => invoicesApi.cancel(id),
    onSuccess: () => { toast.success('Invoice cancelled.'); qc.invalidateQueries({ queryKey: ['invoices'] }); setCancelTarget(null); },
    onError: () => toast.error('Failed to cancel.'),
  });

  const duplicateMutation = useMutation({
    mutationFn: (id) => invoicesApi.duplicate(id),
    onSuccess: (res) => { toast.success('Invoice duplicated.'); qc.invalidateQueries({ queryKey: ['invoices'] }); window.location.href = `/invoices/${res.data.data.id}`; },
    onError: () => toast.error('Failed to duplicate.'),
  });

  const handleDownload = async (id, number) => {
    try {
      const res = await invoicesApi.downloadPDF(id);
      downloadBlob(res.data, `${number}.pdf`);
    } catch { toast.error('Failed to download PDF.'); }
  };

  const invoices = data?.data || [];
  const meta = data?.meta;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <PageHeader
        title="Invoices"
        subtitle={meta ? `${meta.total} invoices total` : ''}
        actions={can('invoicing', 'create') && (
          <Link href="/invoices/new" className="btn-primary"><Plus size={14} /> New Invoice</Link>
        )}
      />

      <div style={{ overflowX: 'auto', paddingBottom: '4px' }}>
        <Tabs tabs={STATUS_TABS} active={status} onChange={(v) => { setStatus(v); setPage(1); }} />
      </div>

      <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search invoice number…" />

      <div className="card" style={{ overflow: 'hidden' }}>
        {isLoading ? <TableSkeleton rows={8} cols={7} /> : !invoices.length ? (
          <EmptyState icon={Receipt} title="No invoices found"
            description={status ? `No ${status.toLowerCase()} invoices.` : 'Create your first invoice to start getting paid.'}
            action={can('invoicing', 'create') && <Link href="/invoices/new" className="btn-primary btn-sm"><Plus size={13} /> New Invoice</Link>} />
        ) : (
          <>
            <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Invoice #</th><th>Client</th><th>Date</th>
                    <th>Due Date</th><th>Total</th><th>Balance</th>
                    <th>Status</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => {
                    const cfg = INVOICE_STATUS[inv.status];
                    return (
                      <tr key={inv.id}>
                        <td>
                          <Link href={`/invoices/${inv.id}`} style={{ fontFamily: 'monospace', fontSize: '12px', fontWeight: 600, color: 'var(--primary)', textDecoration: 'none' }}>
                            {inv.invoiceNumber}
                          </Link>
                        </td>
                        <td style={{ fontWeight: 500 }}>{inv.client?.name}</td>
                        <td style={{ color: 'var(--text-secondary)' }}>{formatDate(inv.date)}</td>
                        <td style={{ color: inv.status === 'OVERDUE' ? '#f87171' : 'var(--text-secondary)' }}>{formatDate(inv.dueDate)}</td>
                        <td style={{ fontWeight: 600 }}>{formatCurrency(inv.totalAmount, currencySymbol)}</td>
                        <td>
                          <span style={{ fontWeight: 600, color: inv.balanceAmount > 0 ? '#f87171' : '#4ade80' }}>
                            {formatCurrency(inv.balanceAmount, currencySymbol)}
                          </span>
                        </td>
                        <td>{cfg && <span className={`badge ${cfg.class}`}>{cfg.label}</span>}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {can('invoicing', 'edit') && inv.status !== 'CANCELLED' && (
                              <button onClick={() => sendMutation.mutate(inv.id)} className="btn-ghost btn-icon"
                                title={['SENT','VIEWED','OVERDUE','PARTIALLY_PAID','PAID'].includes(inv.status) ? 'Resend' : 'Send'}>
                                {['SENT','VIEWED','OVERDUE','PARTIALLY_PAID','PAID'].includes(inv.status) ? <RefreshCw size={13}/> : <Send size={13}/>}
                              </button>
                            )}
                            <button onClick={() => handleDownload(inv.id, inv.invoiceNumber)} className="btn-ghost btn-icon" title="Download PDF"><Download size={13} /></button>
                            {can('invoicing', 'edit') && inv.balanceAmount > 0 && inv.status !== 'CANCELLED' && (
                              <Link href={`/invoices/${inv.id}?action=pay`} className="btn-ghost btn-icon" title="Record payment"><CreditCard size={13} /></Link>
                            )}
                            {can('invoicing', 'create') && (
                              <button onClick={() => duplicateMutation.mutate(inv.id)} className="btn-ghost btn-icon" title="Duplicate"><Copy size={13} /></button>
                            )}
                            {can('invoicing', 'edit') && !['PAID', 'CANCELLED'].includes(inv.status) && (
                              <button onClick={() => setCancelTarget(inv)} className="btn-ghost btn-icon" title="Cancel" style={{ color: 'var(--danger)' }}><XCircle size={13} /></button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination meta={meta} onPageChange={setPage} />
          </>
        )}
      </div>

      <ConfirmDialog
        open={!!cancelTarget} onClose={() => setCancelTarget(null)}
        onConfirm={() => cancelMutation.mutate(cancelTarget?.id)}
        loading={cancelMutation.isPending}
        title="Cancel Invoice"
        description={`Cancel invoice "${cancelTarget?.invoiceNumber}"? This cannot be undone.`}
        confirmLabel="Cancel Invoice" danger
      />
    </div>
  );
}

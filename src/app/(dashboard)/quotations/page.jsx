'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { quotationsApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader, SearchInput, EmptyState, TableSkeleton, Pagination, Tabs, ConfirmDialog } from '@/components/ui/index.jsx';
import { formatCurrency, formatDate, QUOTATION_STATUS } from '@/lib/utils';
import { Plus, ClipboardList, ArrowRight, Trash2, Send, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

const STATUS_TABS = [
  { label: 'All', value: '' },
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Sent', value: 'SENT' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'Converted', value: 'CONVERTED' },
];

export default function QuotationsPage() {
  const { can, currencySymbol } = useAuth();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['quotations', page, search, status],
    queryFn: () => quotationsApi.list({ page, limit: 20, search, ...(status && { status }) }).then((r) => r.data),
    placeholderData: (prev) => prev,
  });

  const convertMutation = useMutation({
    mutationFn: (id) => quotationsApi.convertToInvoice(id, {}),
    onSuccess: (res) => { toast.success('Converted to invoice!'); window.location.href = `/invoices/${res.data.data.id}`; },
    onError: () => toast.error('Failed to convert.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => quotationsApi.delete(id),
    onSuccess: () => { toast.success('Deleted.'); qc.invalidateQueries({ queryKey: ['quotations'] }); setDeleteTarget(null); },
    onError: () => toast.error('Failed to delete.'),
  });

  const quotations = data?.data || [];
  const meta = data?.meta;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <PageHeader
        title="Quotations"
        subtitle={meta ? `${meta.total} total` : ''}
        actions={can('quotations', 'create') && (
          <Link href="/quotations/new" className="btn-primary"><Plus size={14} /> New Quotation</Link>
        )}
      />
      <Tabs tabs={STATUS_TABS} active={status} onChange={(v) => { setStatus(v); setPage(1); }} />
      <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search quotation number…" />
      <div className="card" style={{ overflow: 'hidden' }}>
        {isLoading ? <TableSkeleton rows={8} cols={6} /> : !quotations.length ? (
          <EmptyState icon={ClipboardList} title="No quotations" description="Create a quotation to send to a client."
            action={can('quotations', 'create') && <Link href="/quotations/new" className="btn-primary btn-sm"><Plus size={13} /> New</Link>} />
        ) : (
          <>
            <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
              <table className="data-table">
                <thead>
                  <tr><th>Quote #</th><th>Client</th><th>Date</th><th>Valid Until</th><th>Total</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {quotations.map((q) => {
                    const cfg = QUOTATION_STATUS[q.status];
                    return (
                      <tr key={q.id}>
                        <td>
                          <Link href={`/quotations/${q.id}`} style={{ fontFamily: 'monospace', fontSize: '12px', fontWeight: 600, color: 'var(--primary)', textDecoration: 'none' }}>
                            {q.quotationNumber}
                          </Link>
                        </td>
                        <td style={{ fontWeight: 500 }}>{q.client?.name}</td>
                        <td style={{ color: 'var(--text-secondary)' }}>{formatDate(q.date)}</td>
                        <td style={{ color: 'var(--text-secondary)' }}>{formatDate(q.validUntil)}</td>
                        <td style={{ fontWeight: 600 }}>{formatCurrency(q.totalAmount, currencySymbol)}</td>
                        <td>{cfg && <span className={`badge ${cfg.class}`}>{cfg.label}</span>}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {can('quotations', 'edit') && !['CONVERTED','REJECTED'].includes(q.status) && (
                              <button onClick={() => {}} className="btn-ghost btn-icon"
                                title={['SENT','VIEWED'].includes(q.status) ? 'Resend' : 'Send'}>
                                {['SENT','VIEWED'].includes(q.status) ? <RefreshCw size={13}/> : <Send size={13}/>}
                              </button>
                            )}
                            {can('invoicing', 'create') && q.status === 'APPROVED' && (
                              <button onClick={() => convertMutation.mutate(q.id)} className="btn-ghost btn-icon" title="Convert to invoice"><ArrowRight size={13} /></button>
                            )}
                            {can('quotations', 'delete') && q.status !== 'CONVERTED' && (
                              <button onClick={() => setDeleteTarget(q)} className="btn-ghost btn-icon" style={{ color: 'var(--danger)' }}><Trash2 size={13} /></button>
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
        open={!!deleteTarget} onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget?.id)}
        loading={deleteMutation.isPending}
        title="Delete Quotation"
        description={`Delete "${deleteTarget?.quotationNumber}"?`}
        confirmLabel="Delete" danger
      />
    </div>
  );
}

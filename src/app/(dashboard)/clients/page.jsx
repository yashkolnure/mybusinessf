'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientsApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader, SearchInput, EmptyState, TableSkeleton, Pagination, ConfirmDialog } from '@/components/ui/index.jsx';
import { formatCurrency, formatDate, initials } from '@/lib/utils';
import { Plus, Users, Pencil, Trash2, Eye, Phone, Mail } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function ClientsPage() {
  const { can, currencySymbol } = useAuth();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['clients', page, search],
    queryFn: () => clientsApi.list({ page, limit: 20, search }).then((r) => r.data),
    placeholderData: (prev) => prev,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => clientsApi.delete(id),
    onSuccess: () => { toast.success('Client deleted.'); qc.invalidateQueries({ queryKey: ['clients'] }); setDeleteTarget(null); },
    onError: () => toast.error('Failed to delete client.'),
  });

  const clients = data?.data || [];
  const meta = data?.meta;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <PageHeader
        title="Clients"
        subtitle={meta ? `${meta.total} total clients` : 'Manage your client database'}
        actions={can('clients', 'create') && (
          <Link href="/clients/new" className="btn-primary"><Plus size={14} /> Add Client</Link>
        )}
      />

      <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search name, email, company…" />

      <div className="card" style={{ overflow: 'hidden' }}>
        {isLoading ? <TableSkeleton rows={8} cols={6} /> : !clients.length ? (
          <EmptyState icon={Users} title="No clients yet" description="Add your first client to get started with invoicing."
            action={can('clients', 'create') && <Link href="/clients/new" className="btn-primary btn-sm"><Plus size={13} /> Add Client</Link>} />
        ) : (
          <>
            <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Client</th><th>Contact</th><th>GSTIN</th>
                    <th>Outstanding</th><th>Since</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client) => (
                    <tr key={client.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, flexShrink: 0, background: 'var(--primary-muted)', color: '#a5b4fc' }}>
                            {initials(client.name)}
                          </div>
                          <div>
                            <p style={{ fontWeight: 600, fontSize: '14px', margin: 0 }}>{client.name}</p>
                            {client.company && <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>{client.company}</p>}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          {client.email && (
                            <a href={`mailto:${client.email}`} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)', textDecoration: 'none' }}>
                              <Mail size={11} /> {client.email}
                            </a>
                          )}
                          {client.phone && (
                            <a href={`tel:${client.phone}`} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)', textDecoration: 'none' }}>
                              <Phone size={11} /> {client.phone}
                            </a>
                          )}
                        </div>
                      </td>
                      <td>
                        {client.gstin
                          ? <span style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--text-secondary)' }}>{client.gstin}</span>
                          : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, fontSize: '14px', color: client.outstandingBalance > 0 ? '#f87171' : '#4ade80' }}>
                          {formatCurrency(client.outstandingBalance, currencySymbol)}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{formatDate(client.createdAt)}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Link href={`/clients/${client.id}`} className="btn-ghost btn-icon" title="View"><Eye size={14} /></Link>
                          {can('clients', 'edit') && <Link href={`/clients/${client.id}/edit`} className="btn-ghost btn-icon" title="Edit"><Pencil size={14} /></Link>}
                          {can('clients', 'delete') && (
                            <button onClick={() => setDeleteTarget(client)} className="btn-ghost btn-icon" title="Delete" style={{ color: 'var(--danger)' }}>
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
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
        title="Delete Client"
        description={`Delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete Client" danger
      />
    </div>
  );
}

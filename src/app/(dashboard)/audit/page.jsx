'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { auditApi } from '@/lib/api';
import { PageHeader, SearchInput, EmptyState, TableSkeleton, Pagination } from '@/components/ui/index.jsx';
import { formatDateTime } from '@/lib/utils';
import { Shield } from 'lucide-react';

const ACTION_COLORS = { CREATE:'badge-success', UPDATE:'badge-warning', DELETE:'badge-danger', LOGIN:'badge-primary', LOGOUT:'badge-neutral', SEND:'badge-info', PAYMENT:'badge-success', CANCEL:'badge-danger', EXPORT:'badge-info' };

export default function AuditPage() {
  const [search, setSearch] = useState('');
  const [page,   setPage]   = useState(1);
  const [module, setModule] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['audit', page, search, module],
    queryFn:  () => auditApi.list({ page, limit:25, search, ...(module && { module }) }).then(r=>r.data),
    placeholderData: (p) => p,
  });

  const logs   = data?.data || [];
  const MODULES = ['auth','users','clients','invoicing','quotations','workforce','vendors','purchases','inventory','finance','settings'];

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
      <PageHeader title="Audit Log" subtitle="Complete trail of all actions across the platform"/>

      <div style={{ display:'flex', gap:'12px', flexWrap:'wrap' }}>
        <SearchInput value={search} onChange={(v)=>{setSearch(v);setPage(1);}} placeholder="Search description or email…"/>
        <select className="input" value={module} onChange={e=>{setModule(e.target.value);setPage(1);}} style={{ width:'160px' }}>
          <option value="">All Modules</option>
          {MODULES.map(m=><option key={m} value={m}>{m.charAt(0).toUpperCase()+m.slice(1).replace(/_/g,' ')}</option>)}
        </select>
      </div>

      <div className="card" style={{ overflow:'hidden' }}>
        {isLoading ? <TableSkeleton rows={10} cols={6}/> : !logs.length ? (
          <EmptyState icon={Shield} title="No audit logs" description="Actions performed in the system will appear here."/>
        ) : <>
          <div className="table-wrapper" style={{ border:'none', borderRadius:0 }}>
            <table className="data-table">
              <thead><tr><th>Timestamp</th><th>User</th><th>Module</th><th>Action</th><th>Description</th><th>IP</th></tr></thead>
              <tbody>
                {logs.map((log) => {
                  const actionKey = log.action?.split('_')[0];
                  const badgeClass = ACTION_COLORS[actionKey] || 'badge-neutral';
                  return (
                    <tr key={log.id}>
                      <td style={{ fontSize:'12px', color:'var(--text-secondary)', whiteSpace:'nowrap' }}>{formatDateTime(log.createdAt)}</td>
                      <td>
                        <div>
                          <p style={{ fontWeight:500, margin:0, fontSize:'13px' }}>{log.userEmail||'System'}</p>
                          {log.userRole && <p style={{ fontSize:'11px', color:'var(--text-muted)', margin:0 }}>{log.userRole.replace(/_/g,' ')}</p>}
                        </div>
                      </td>
                      <td><span className="badge badge-neutral" style={{ fontSize:'10px' }}>{log.module}</span></td>
                      <td><span className={`badge ${badgeClass}`} style={{ fontSize:'10px' }}>{log.action}</span></td>
                      <td style={{ fontSize:'13px', color:'var(--text-secondary)', maxWidth:'250px' }}>{log.description || (log.entityType && `${log.entityType}${log.entityId ? ` #${log.entityId.slice(0,8)}` : ''}`) || '—'}</td>
                      <td style={{ fontFamily:'monospace', fontSize:'11px', color:'var(--text-muted)' }}>{log.ipAddress||'—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination meta={data?.meta} onPageChange={setPage}/>
        </>}
      </div>
    </div>
  );
}

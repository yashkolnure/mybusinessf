'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workforceApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader, EmptyState, TableSkeleton, Pagination, Tabs, SearchInput } from '@/components/ui/index.jsx';
import { formatDate, LEAVE_STATUS } from '@/lib/utils';
import { Plus, Users, CalendarDays, Check, X } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

const TABS = [
  { label: 'Employees', value: 'employees' },
  { label: 'Attendance', value: 'attendance' },
  { label: 'Leave Requests', value: 'leaves' },
  { label: 'Salary', value: 'salaries' },
];

export default function WorkforcePage() {
  const { can } = useAuth();
  const qc = useQueryClient();
  const [tab, setTab] = useState('employees');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const empQuery = useQuery({
    queryKey: ['employees', page, search],
    queryFn: () => workforceApi.listEmployees({ page, limit: 20, search }).then((r) => r.data),
    enabled: tab === 'employees',
    placeholderData: (prev) => prev,
  });

  const leaveQuery = useQuery({
    queryKey: ['leaves', page],
    queryFn: () => workforceApi.listLeaves({ page, limit: 20 }).then((r) => r.data),
    enabled: tab === 'leaves',
    placeholderData: (prev) => prev,
  });

  const leaveStatusMutation = useMutation({
    mutationFn: ({ id, status }) => workforceApi.updateLeaveStatus(id, { status }),
    onSuccess: () => { toast.success('Leave status updated.'); qc.invalidateQueries({ queryKey: ['leaves'] }); },
    onError: () => toast.error('Failed to update leave status.'),
  });

  const employees = empQuery.data?.data || [];
  const leaves    = leaveQuery.data?.data || [];
  const empMeta   = empQuery.data?.meta;
  const leaveMeta = leaveQuery.data?.meta;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <PageHeader
        title="Workforce"
        subtitle="Employees, attendance, leaves and payroll"
        actions={tab === 'employees' && can('workforce', 'create') && (
          <Link href="/workforce/employees/new" className="btn-primary"><Plus size={14} /> Add Employee</Link>
        )}
      />
      <Tabs tabs={TABS} active={tab} onChange={(v) => { setTab(v); setPage(1); }} />

      {tab === 'employees' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search employees…" />
          <div className="card" style={{ overflow: 'hidden' }}>
            {empQuery.isLoading ? <TableSkeleton rows={6} cols={5} /> : !employees.length ? (
              <EmptyState icon={Users} title="No employees" description="Add your first employee."
                action={<Link href="/workforce/employees/new" className="btn-primary btn-sm"><Plus size={13} /> Add</Link>} />
            ) : (
              <>
                <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
                  <table className="data-table">
                    <thead>
                      <tr><th>Employee</th><th>Department</th><th>Designation</th><th>Type</th><th>Joined</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                      {employees.map((e) => (
                        <tr key={e.id}>
                          <td>
                            <div>
                              <p style={{ fontWeight: 500, margin: 0 }}>{e.name}</p>
                              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>{e.email}</p>
                            </div>
                          </td>
                          <td style={{ color: 'var(--text-secondary)' }}>{e.department || '—'}</td>
                          <td style={{ color: 'var(--text-secondary)' }}>{e.designation || '—'}</td>
                          <td><span className="badge badge-neutral">{e.employmentType}</span></td>
                          <td style={{ color: 'var(--text-secondary)' }}>{formatDate(e.dateOfJoining)}</td>
                          <td><div style={{ display:'flex', gap:'4px' }}><Link href={`/workforce/employees/${e.id}`} className="btn-secondary btn-sm">View</Link>{can('workforce','edit') && <Link href={`/workforce/employees/${e.id}/edit`} className="btn-ghost btn-sm">Edit</Link>}</div></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Pagination meta={empMeta} onPageChange={setPage} />
              </>
            )}
          </div>
        </div>
      )}

      {tab === 'leaves' && (
        <div className="card" style={{ overflow: 'hidden' }}>
          {leaveQuery.isLoading ? <TableSkeleton rows={6} cols={6} /> : !leaves.length ? (
            <EmptyState icon={CalendarDays} title="No leave requests" description="Leave requests from employees will appear here." />
          ) : (
            <>
              <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
                <table className="data-table">
                  <thead>
                    <tr><th>Employee</th><th>Type</th><th>From</th><th>To</th><th>Days</th><th>Status</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {leaves.map((l) => {
                      const cfg = LEAVE_STATUS[l.status];
                      return (
                        <tr key={l.id}>
                          <td style={{ fontWeight: 500 }}>{l.employee?.name}</td>
                          <td><span className="badge badge-neutral">{l.leaveType}</span></td>
                          <td style={{ color: 'var(--text-secondary)' }}>{formatDate(l.startDate)}</td>
                          <td style={{ color: 'var(--text-secondary)' }}>{formatDate(l.endDate)}</td>
                          <td>{l.totalDays}</td>
                          <td>{cfg && <span className={`badge ${cfg.class}`}>{cfg.label}</span>}</td>
                          <td>
                            {l.status === 'PENDING' && can('workforce', 'approve') && (
                              <div style={{ display: 'flex', gap: '4px' }}>
                                <button className="btn-primary btn-sm" onClick={() => leaveStatusMutation.mutate({ id: l.id, status: 'APPROVED' })} title="Approve">
                                  <Check size={12} /> Approve
                                </button>
                                <button className="btn-danger btn-sm" onClick={() => leaveStatusMutation.mutate({ id: l.id, status: 'REJECTED' })} title="Reject">
                                  <X size={12} />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <Pagination meta={leaveMeta} onPageChange={setPage} />
            </>
          )}
        </div>
      )}

      {(tab === 'attendance' || tab === 'salaries') && (
        <div className="card" style={{ padding: '48px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)' }}>
            {tab === 'attendance' ? 'Attendance' : 'Salary'} management — full UI ready to build out with the workforceApi.
          </p>
        </div>
      )}
    </div>
  );
}

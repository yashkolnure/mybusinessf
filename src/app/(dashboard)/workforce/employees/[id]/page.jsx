'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { workforceApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader, Tabs, Skeleton, EmptyState, Modal, FormField, Spinner, ConfirmDialog } from '@/components/ui/index.jsx';
import { formatCurrency, formatDate, LEAVE_STATUS, SALARY_STATUS } from '@/lib/utils';
import { ArrowLeft, Pencil, UserCheck, CalendarDays, DollarSign, CreditCard, Check, X, Trash2 } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

const TABS = [
  { label:'Profile',    value:'profile' },
  { label:'Attendance', value:'attendance' },
  { label:'Leaves',     value:'leaves' },
  { label:'Salary',     value:'salary' },
];

export default function EmployeeDetailPage({ params }) {
  const { currencySymbol, can } = useAuth();
  const qc = useQueryClient();
  const [tab, setTab] = useState('profile');
  const [salaryModal, setSalaryModal] = useState(false);
  const [attModal,    setAttModal]    = useState(false);
  const [leaveModal,  setLeaveModal]  = useState(false);
  const [salaryForm,  setSalaryForm]  = useState({ month: new Date().getMonth()+1, year: new Date().getFullYear(), baseSalary:'', allowances:'0', bonus:'0', deductions:'0', tax:'0' });
  const [attForm,     setAttForm]     = useState({ date: new Date().toISOString().split('T')[0], status:'PRESENT', checkIn:'', checkOut:'', notes:'' });
  const [leaveForm,   setLeaveForm]   = useState({ leaveType:'ANNUAL', startDate:'', endDate:'', reason:'' });

  const { data: emp, isLoading } = useQuery({
    queryKey: ['employee', params.id],
    queryFn:  () => workforceApi.getEmployee(params.id).then(r=>r.data.data),
  });

  const { data: attData } = useQuery({
    queryKey: ['attendance', params.id],
    queryFn:  () => workforceApi.listAttendance({ employeeId: params.id, limit: 30 }).then(r=>r.data),
    enabled: tab === 'attendance',
  });

  const { data: leaveData } = useQuery({
    queryKey: ['leaves-emp', params.id],
    queryFn:  () => workforceApi.listLeaves({ employeeId: params.id, limit: 30 }).then(r=>r.data),
    enabled: tab === 'leaves',
  });

  const { data: salaryData } = useQuery({
    queryKey: ['salaries-emp', params.id],
    queryFn:  () => workforceApi.listSalaries({ employeeId: params.id, limit: 20 }).then(r=>r.data),
    enabled: tab === 'salary',
  });

  const attMutation = useMutation({
    mutationFn: (data) => workforceApi.markAttendance(data),
    onSuccess: () => { toast.success('Attendance marked.'); qc.invalidateQueries({ queryKey:['attendance',params.id] }); setAttModal(false); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed.'),
  });

  const leaveMutation = useMutation({
    mutationFn: (data) => workforceApi.createLeave(data),
    onSuccess: () => { toast.success('Leave request created.'); qc.invalidateQueries({ queryKey:['leaves-emp',params.id] }); setLeaveModal(false); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed.'),
  });

  const salaryMutation = useMutation({
    mutationFn: (data) => workforceApi.createSalary(data),
    onSuccess: () => { toast.success('Salary record created.'); qc.invalidateQueries({ queryKey:['salaries-emp',params.id] }); setSalaryModal(false); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed.'),
  });

  const markPaidMutation = useMutation({
    mutationFn: (id) => workforceApi.markSalaryPaid(id, { paymentMethod:'BANK_TRANSFER' }),
    onSuccess: () => { toast.success('Salary marked as paid.'); qc.invalidateQueries({ queryKey:['salaries-emp',params.id] }); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed.'),
  });

  const leaveStatusMutation = useMutation({
    mutationFn: ({ id, status }) => workforceApi.updateLeaveStatus(id, { status }),
    onSuccess: () => { toast.success('Status updated.'); qc.invalidateQueries({ queryKey:['leaves-emp',params.id] }); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed.'),
  });

  if (isLoading) return <div style={{ display:'flex', justifyContent:'center', padding:'60px' }}><Spinner size={28}/></div>;
  if (!emp) return <p style={{ color:'var(--danger)' }}>Employee not found.</p>;

  const netSalary = () => {
    const b=parseFloat(salaryForm.baseSalary)||0, a=parseFloat(salaryForm.allowances)||0, bo=parseFloat(salaryForm.bonus)||0;
    const d=parseFloat(salaryForm.deductions)||0, t=parseFloat(salaryForm.tax)||0;
    return (b+a+bo-d-t).toFixed(2);
  };

  const upd = (setter) => (k,v) => setter(f=>({...f,[k]:v}));
  const updS = upd(setSalaryForm), updA = upd(setAttForm), updL = upd(setLeaveForm);

  const inpStyle = { fontSize:'13px', padding:'7px 10px' };

  const InfoRow = ({ label, value }) => value ? (
    <div style={{ display:'flex', padding:'8px 0', borderBottom:'1px solid var(--border-subtle)', fontSize:'13px' }}>
      <span style={{ color:'var(--text-muted)', width:'160px', flexShrink:0 }}>{label}</span>
      <span style={{ color:'var(--text-primary)', fontWeight:500 }}>{value}</span>
    </div>
  ) : null;

  return (
    <div style={{ maxWidth:'900px', display:'flex', flexDirection:'column', gap:'20px' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
        <Link href="/workforce" className="btn-ghost btn-icon"><ArrowLeft size={16}/></Link>
        <div style={{ display:'flex', alignItems:'center', gap:'14px', flex:1 }}>
          <div style={{ width:'48px', height:'48px', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', fontWeight:700, color:'#fff', background:'linear-gradient(135deg,#4f46e5,#7c3aed)', flexShrink:0 }}>
            {emp.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h1 className="font-display" style={{ fontSize:'22px', fontWeight:700, color:'var(--text-primary)', margin:0 }}>{emp.name}</h1>
            <p style={{ color:'var(--text-secondary)', fontSize:'13px', margin:0 }}>
              {emp.designation}{emp.department ? ` · ${emp.department}` : ''} {emp.employeeCode ? `· #${emp.employeeCode}`:'' }
            </p>
          </div>
        </div>
        <span className={`badge ${emp.isActive ? 'badge-success':'badge-neutral'}`}>{emp.isActive?'Active':'Inactive'}</span>
        {can('workforce','edit') && <Link href={`/workforce/employees/${params.id}/edit`} className="btn-secondary btn-sm"><Pencil size={12}/> Edit</Link>}
      </div>

      <Tabs tabs={TABS} active={tab} onChange={setTab}/>

      {/* PROFILE */}
      {tab === 'profile' && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
          <div className="card" style={{ padding:'20px' }}>
            <h3 style={{ margin:'0 0 12px', fontSize:'12px', fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em' }}>Employment</h3>
            <InfoRow label="Employee Code"   value={emp.employeeCode}/>
            <InfoRow label="Department"      value={emp.department}/>
            <InfoRow label="Designation"     value={emp.designation}/>
            <InfoRow label="Employment Type" value={emp.employmentType?.replace('_',' ')}/>
            <InfoRow label="Date of Joining" value={formatDate(emp.dateOfJoining)}/>
            <InfoRow label="Base Salary"     value={formatCurrency(emp.baseSalary, currencySymbol)}/>
          </div>
          <div className="card" style={{ padding:'20px' }}>
            <h3 style={{ margin:'0 0 12px', fontSize:'12px', fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em' }}>Contact & Personal</h3>
            <InfoRow label="Email"     value={emp.email}/>
            <InfoRow label="Phone"     value={emp.phone}/>
            <InfoRow label="Address"   value={emp.address}/>
            <InfoRow label="Date of Birth" value={formatDate(emp.dateOfBirth)}/>
            <InfoRow label="Emergency Contact" value={emp.emergencyContact}/>
          </div>
          <div className="card" style={{ padding:'20px' }}>
            <h3 style={{ margin:'0 0 12px', fontSize:'12px', fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em' }}>Banking Details</h3>
            <InfoRow label="Bank"         value={emp.bankName}/>
            <InfoRow label="Account No"   value={emp.bankAccountNo}/>
            <InfoRow label="IFSC"         value={emp.ifscCode}/>
            <InfoRow label="PAN"          value={emp.panNumber}/>
          </div>
        </div>
      )}

      {/* ATTENDANCE */}
      {tab === 'attendance' && (
        <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
          {can('workforce','create') && (
            <div style={{ display:'flex', justifyContent:'flex-end' }}>
              <button className="btn-primary" onClick={()=>setAttModal(true)}><UserCheck size={13}/> Mark Attendance</button>
            </div>
          )}
          <div className="card" style={{ overflow:'hidden' }}>
            {!attData?.data?.length ? (
              <EmptyState icon={CalendarDays} title="No attendance records" description="Attendance will appear here after marking."/>
            ) : (
              <table className="data-table">
                <thead><tr><th>Date</th><th>Status</th><th>Check In</th><th>Check Out</th><th>Hours</th><th>Notes</th></tr></thead>
                <tbody>
                  {attData.data.map(a => {
                    const colors = { PRESENT:'badge-success', ABSENT:'badge-danger', HALF_DAY:'badge-warning', HOLIDAY:'badge-info', ON_LEAVE:'badge-neutral', WORK_FROM_HOME:'badge-primary' };
                    return (
                      <tr key={a.id}>
                        <td style={{ fontWeight:500 }}>{formatDate(a.date)}</td>
                        <td><span className={`badge ${colors[a.status]||'badge-neutral'}`}>{a.status.replace(/_/g,' ')}</span></td>
                        <td style={{ color:'var(--text-secondary)' }}>{a.checkIn ? new Date(a.checkIn).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'}) : '—'}</td>
                        <td style={{ color:'var(--text-secondary)' }}>{a.checkOut ? new Date(a.checkOut).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'}) : '—'}</td>
                        <td style={{ color:'var(--text-secondary)' }}>{a.hoursWorked ? `${a.hoursWorked}h` : '—'}</td>
                        <td style={{ color:'var(--text-muted)', fontSize:'12px' }}>{a.notes||'—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* LEAVES */}
      {tab === 'leaves' && (
        <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
          <div style={{ display:'flex', justifyContent:'flex-end' }}>
            <button className="btn-primary" onClick={()=>setLeaveModal(true)}><CalendarDays size={13}/> Add Leave Request</button>
          </div>
          <div className="card" style={{ overflow:'hidden' }}>
            {!leaveData?.data?.length ? (
              <EmptyState icon={CalendarDays} title="No leave requests"/>
            ) : (
              <table className="data-table">
                <thead><tr><th>Type</th><th>From</th><th>To</th><th>Days</th><th>Reason</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {leaveData.data.map(l => {
                    const cfg = LEAVE_STATUS[l.status];
                    return (
                      <tr key={l.id}>
                        <td><span className="badge badge-neutral">{l.leaveType.replace(/_/g,' ')}</span></td>
                        <td style={{ color:'var(--text-secondary)' }}>{formatDate(l.startDate)}</td>
                        <td style={{ color:'var(--text-secondary)' }}>{formatDate(l.endDate)}</td>
                        <td style={{ fontWeight:600 }}>{l.totalDays}</td>
                        <td style={{ color:'var(--text-muted)', fontSize:'12px', maxWidth:'150px' }}>{l.reason||'—'}</td>
                        <td>{cfg && <span className={`badge ${cfg.class}`}>{cfg.label}</span>}</td>
                        <td>
                          {l.status === 'PENDING' && can('workforce','approve') && (
                            <div style={{ display:'flex', gap:'4px' }}>
                              <button className="btn-primary btn-sm" onClick={()=>leaveStatusMutation.mutate({id:l.id,status:'APPROVED'})}><Check size={11}/>Approve</button>
                              <button className="btn-danger  btn-sm" onClick={()=>leaveStatusMutation.mutate({id:l.id,status:'REJECTED'})}><X size={11}/></button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* SALARY */}
      {tab === 'salary' && (
        <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
          {can('workforce','create') && (
            <div style={{ display:'flex', justifyContent:'flex-end' }}>
              <button className="btn-primary" onClick={()=>setSalaryModal(true)}><DollarSign size={13}/> Create Salary Record</button>
            </div>
          )}
          <div className="card" style={{ overflow:'hidden' }}>
            {!salaryData?.data?.length ? (
              <EmptyState icon={DollarSign} title="No salary records" description="Create a salary record to track payroll."/>
            ) : (
              <table className="data-table">
                <thead><tr><th>Period</th><th>Base</th><th>Allowances</th><th>Deductions</th><th>Net Salary</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {salaryData.data.map(s => {
                    const cfg = SALARY_STATUS[s.status];
                    return (
                      <tr key={s.id}>
                        <td style={{ fontWeight:500 }}>{s.month}/{s.year}</td>
                        <td>{formatCurrency(s.baseSalary,currencySymbol)}</td>
                        <td style={{ color:'#4ade80' }}>+{formatCurrency(s.allowances+s.bonus,currencySymbol)}</td>
                        <td style={{ color:'#f87171' }}>-{formatCurrency(s.deductions+s.tax,currencySymbol)}</td>
                        <td style={{ fontWeight:700 }}>{formatCurrency(s.netSalary,currencySymbol)}</td>
                        <td>{cfg && <span className={`badge ${cfg.class}`}>{cfg.label}</span>}</td>
                        <td>
                          {s.status !== 'PAID' && can('workforce','edit') && (
                            <button className="btn-primary btn-sm" onClick={()=>markPaidMutation.mutate(s.id)} disabled={markPaidMutation.isPending}>
                              <CreditCard size={11}/> Mark Paid
                            </button>
                          )}
                          {s.status === 'PAID' && s.paidAt && (
                            <span style={{ fontSize:'11px', color:'var(--text-muted)' }}>Paid {formatDate(s.paidAt)}</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Attendance Modal */}
      <Modal open={attModal} onClose={()=>setAttModal(false)} title="Mark Attendance"
        footer={<>
          <button className="btn-secondary" onClick={()=>setAttModal(false)}>Cancel</button>
          <button className="btn-primary" onClick={()=>attMutation.mutate({employeeId:params.id,...attForm})} disabled={attMutation.isPending}>
            {attMutation.isPending?<Spinner size={13}/>:'Mark Attendance'}
          </button>
        </>}>
        <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
          <FormField label="Date"><input type="date" className="input" style={inpStyle} value={attForm.date} onChange={e=>updA('date',e.target.value)}/></FormField>
          <FormField label="Status">
            <select className="input" style={inpStyle} value={attForm.status} onChange={e=>updA('status',e.target.value)}>
              {['PRESENT','ABSENT','HALF_DAY','HOLIDAY','ON_LEAVE','WORK_FROM_HOME'].map(s=><option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
            </select>
          </FormField>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
            <FormField label="Check In"><input type="time" className="input" style={inpStyle} value={attForm.checkIn} onChange={e=>updA('checkIn',e.target.value)}/></FormField>
            <FormField label="Check Out"><input type="time" className="input" style={inpStyle} value={attForm.checkOut} onChange={e=>updA('checkOut',e.target.value)}/></FormField>
          </div>
          <FormField label="Notes"><input className="input" style={inpStyle} value={attForm.notes} onChange={e=>updA('notes',e.target.value)} placeholder="Optional notes"/></FormField>
        </div>
      </Modal>

      {/* Leave Modal */}
      <Modal open={leaveModal} onClose={()=>setLeaveModal(false)} title="Add Leave Request"
        footer={<>
          <button className="btn-secondary" onClick={()=>setLeaveModal(false)}>Cancel</button>
          <button className="btn-primary" onClick={()=>leaveMutation.mutate({employeeId:params.id,...leaveForm,startDate:new Date(leaveForm.startDate),endDate:new Date(leaveForm.endDate)})} disabled={leaveMutation.isPending}>
            {leaveMutation.isPending?<Spinner size={13}/>:'Submit Leave'}
          </button>
        </>}>
        <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
          <FormField label="Leave Type">
            <select className="input" style={inpStyle} value={leaveForm.leaveType} onChange={e=>updL('leaveType',e.target.value)}>
              {['ANNUAL','SICK','CASUAL','MATERNITY','PATERNITY','UNPAID','COMP_OFF'].map(t=><option key={t} value={t}>{t.replace(/_/g,' ')}</option>)}
            </select>
          </FormField>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
            <FormField label="From"><input type="date" className="input" style={inpStyle} value={leaveForm.startDate} onChange={e=>updL('startDate',e.target.value)}/></FormField>
            <FormField label="To"><input type="date" className="input" style={inpStyle} value={leaveForm.endDate} onChange={e=>updL('endDate',e.target.value)}/></FormField>
          </div>
          <FormField label="Reason"><textarea className="input" rows={3} value={leaveForm.reason} onChange={e=>updL('reason',e.target.value)} style={{ resize:'vertical', fontSize:'13px' }} placeholder="Reason for leave…"/></FormField>
        </div>
      </Modal>

      {/* Salary Modal */}
      <Modal open={salaryModal} onClose={()=>setSalaryModal(false)} title="Create Salary Record" size="lg"
        footer={<>
          <button className="btn-secondary" onClick={()=>setSalaryModal(false)}>Cancel</button>
          <button className="btn-primary" onClick={()=>salaryMutation.mutate({employeeId:params.id,...salaryForm,baseSalary:parseFloat(salaryForm.baseSalary)||0,allowances:parseFloat(salaryForm.allowances)||0,bonus:parseFloat(salaryForm.bonus)||0,deductions:parseFloat(salaryForm.deductions)||0,tax:parseFloat(salaryForm.tax)||0})} disabled={salaryMutation.isPending}>
            {salaryMutation.isPending?<Spinner size={13}/>:'Create Record'}
          </button>
        </>}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
          <FormField label="Month">
            <select className="input" style={inpStyle} value={salaryForm.month} onChange={e=>updS('month',e.target.value)}>
              {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m,i)=><option key={i+1} value={i+1}>{m}</option>)}
            </select>
          </FormField>
          <FormField label="Year"><input type="number" className="input" style={inpStyle} value={salaryForm.year} onChange={e=>updS('year',e.target.value)}/></FormField>
          <FormField label="Base Salary *"><input type="number" min="0" step="0.01" className="input" style={inpStyle} value={salaryForm.baseSalary} onChange={e=>updS('baseSalary',e.target.value)} placeholder={emp.baseSalary||'0'}/></FormField>
          <FormField label="Allowances"><input type="number" min="0" step="0.01" className="input" style={inpStyle} value={salaryForm.allowances} onChange={e=>updS('allowances',e.target.value)}/></FormField>
          <FormField label="Bonus"><input type="number" min="0" step="0.01" className="input" style={inpStyle} value={salaryForm.bonus} onChange={e=>updS('bonus',e.target.value)}/></FormField>
          <FormField label="Deductions"><input type="number" min="0" step="0.01" className="input" style={inpStyle} value={salaryForm.deductions} onChange={e=>updS('deductions',e.target.value)}/></FormField>
          <FormField label="Tax / TDS"><input type="number" min="0" step="0.01" className="input" style={inpStyle} value={salaryForm.tax} onChange={e=>updS('tax',e.target.value)}/></FormField>
          <div className="card" style={{ padding:'14px', display:'flex', flexDirection:'column', gap:'4px' }}>
            <p style={{ fontSize:'11px', color:'var(--text-muted)', margin:0 }}>Net Salary</p>
            <p className="font-display" style={{ fontSize:'20px', fontWeight:700, color:'#4ade80', margin:0 }}>{formatCurrency(parseFloat(netSalary())||0, currencySymbol)}</p>
          </div>
        </div>
      </Modal>
    </div>
  );
}

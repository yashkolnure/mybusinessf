'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader, SearchInput, EmptyState, TableSkeleton, Pagination, Tabs, Modal, FormField, Spinner, ConfirmDialog } from '@/components/ui/index.jsx';
import { formatCurrency, formatDate } from '@/lib/utils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Plus, TrendingUp, TrendingDown, DollarSign, Trash2, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';

const TABS = [{ label:'Overview', value:'overview' }, { label:'Income', value:'INCOME' }, { label:'Expenses', value:'EXPENSE' }];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const INCOME_CATS  = ['Invoice Payment','Consulting','Sales','Other Income'];
const EXPENSE_CATS = ['Salary','Rent','Utilities','Travel','Software','Marketing','Vendor Payment','Office Supplies','Other Expense'];

function EntryModal({ open, onClose, entry, defaultType }) {
  const qc = useQueryClient();
  const isEdit = !!entry;
  const [form, setForm] = useState(entry || { type: defaultType||'INCOME', category:'', amount:'', date: new Date().toISOString().split('T')[0], description:'', paymentMethod:'BANK_TRANSFER' });
  const upd = (k,v) => setForm(f=>({...f,[k]:v}));

  const mutation = useMutation({
    mutationFn: (data) => {
      const d = { ...data, amount: parseFloat(data.amount) || 0 };
      return isEdit ? financeApi.update(entry.id, d) : financeApi.create(d);
    },
    onSuccess: () => { toast.success(isEdit ? 'Updated.' : 'Entry added.'); qc.invalidateQueries({ queryKey:['finance'] }); qc.invalidateQueries({ queryKey:['finance-dashboard'] }); onClose(); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed.'),
  });

  const cats = form.type === 'INCOME' ? INCOME_CATS : EXPENSE_CATS;

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Entry' : `Add ${form.type === 'INCOME' ? 'Income' : 'Expense'}`}
      footer={<><button className="btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn-primary" onClick={()=>mutation.mutate(form)} disabled={mutation.isPending}>
          {mutation.isPending ? <Spinner size={13}/> : isEdit ? 'Update' : 'Save Entry'}
        </button></>}>
      <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
        {!isEdit && (
          <div style={{ display:'flex', gap:'8px' }}>
            {['INCOME','EXPENSE'].map(t => (
              <button key={t} type="button" className={form.type===t?'btn-primary':'btn-secondary'} style={{ flex:1 }} onClick={()=>upd('type',t)}>
                {t==='INCOME' ? <TrendingUp size={13}/> : <TrendingDown size={13}/>} {t}
              </button>
            ))}
          </div>
        )}
        <FormField label="Category *">
          <select className="input" value={form.category} onChange={e=>upd('category',e.target.value)}>
            <option value="">Select category…</option>
            {cats.map(c=><option key={c} value={c}>{c}</option>)}
          </select>
        </FormField>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
          <FormField label="Amount *"><input type="number" min="0.01" step="0.01" className="input" value={form.amount} onChange={e=>upd('amount',e.target.value)} placeholder="0.00"/></FormField>
          <FormField label="Date *"><input type="date" className="input" value={form.date} onChange={e=>upd('date',e.target.value)}/></FormField>
        </div>
        <FormField label="Payment Method">
          <select className="input" value={form.paymentMethod||''} onChange={e=>upd('paymentMethod',e.target.value)}>
            {['CASH','BANK_TRANSFER','UPI','CHEQUE','CARD'].map(m=><option key={m} value={m}>{m.replace(/_/g,' ')}</option>)}
          </select>
        </FormField>
        <FormField label="Description"><textarea className="input" rows={2} value={form.description||''} onChange={e=>upd('description',e.target.value)} style={{ resize:'vertical' }} placeholder="What was this for?"/></FormField>
        <FormField label="Reference"><input className="input" value={form.reference||''} onChange={e=>upd('reference',e.target.value)} placeholder="Invoice #, receipt no…"/></FormField>
      </div>
    </Modal>
  );
}

export default function FinancePage() {
  const { can, currencySymbol } = useAuth();
  const searchParams = useSearchParams();

  useEffect(() => {
    const modal = searchParams.get('modal');
    if (modal === 'expense') { setDefaultType('EXPENSE'); setEditEntry(null); setEntryModal(true); }
    if (modal === 'income')  { setDefaultType('INCOME');  setEditEntry(null); setEntryModal(true); }
  }, [searchParams]);
  const qc = useQueryClient();
  const [tab, setTab] = useState('overview');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [entryModal, setEntryModal] = useState(false);
  const [editEntry, setEditEntry] = useState(null);
  const [defaultType, setDefaultType] = useState('INCOME');
  const [deleteTarget, setDeleteTarget] = useState(null);

  const dashQ  = useQuery({ queryKey:['finance-dashboard'], queryFn: ()=>financeApi.dashboard().then(r=>r.data.data) });
  const flowQ  = useQuery({ queryKey:['cash-flow'], queryFn: ()=>financeApi.cashFlow({ year: new Date().getFullYear() }).then(r=>r.data.data) });
  const entriesQ = useQuery({
    queryKey: ['finance', page, search, tab !== 'overview' ? tab : undefined],
    queryFn:  () => financeApi.list({ page, limit:20, search, ...(tab!=='overview'&&{type:tab}) }).then(r=>r.data),
    enabled: tab !== 'overview',
    placeholderData: (p)=>p,
  });

  const deleteM = useMutation({
    mutationFn: (id) => financeApi.delete(id),
    onSuccess: () => { toast.success('Deleted.'); qc.invalidateQueries({ queryKey:['finance'] }); qc.invalidateQueries({ queryKey:['finance-dashboard'] }); setDeleteTarget(null); },
  });

  const openAdd = (type) => { setDefaultType(type); setEditEntry(null); setEntryModal(true); };
  const d = dashQ.data;
  const chartData = flowQ.data?.months?.map((m,i)=>({ month: MONTHS[i], Income: m.income, Expense: m.expense })) || [];
  const entries = entriesQ.data?.data || [];

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
      <PageHeader title="Finance" subtitle="Income, expenses and cash flow"
        actions={can('finance','create') && (
          <div style={{ display:'flex', gap:'8px' }}>
            <button className="btn-secondary" onClick={()=>openAdd('EXPENSE')}><Plus size={13}/> Expense</button>
            <button className="btn-primary"   onClick={()=>openAdd('INCOME')} ><Plus size={13}/> Income</button>
          </div>
        )} />

      <Tabs tabs={TABS} active={tab} onChange={(v)=>{setTab(v);setPage(1);}}/>

      {tab === 'overview' && (
        <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
          {d && (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'12px' }}>
              {[
                { label:'This Month Income',  value: d.thisMonth.income,   color:'#4ade80' },
                { label:'This Month Expense', value: d.thisMonth.expense,  color:'#f87171' },
                { label:'This Month Profit',  value: d.thisMonth.profit,   color: d.thisMonth.profit >= 0 ? '#4ade80':'#f87171' },
                { label:'This Year Income',   value: d.thisYear.income,    color:'#4ade80' },
                { label:'This Year Expense',  value: d.thisYear.expense,   color:'#f87171' },
                { label:'This Year Profit',   value: d.thisYear.profit,    color: d.thisYear.profit >= 0 ? '#4ade80':'#f87171' },
              ].map(({ label, value, color }) => (
                <div key={label} className="card" style={{ padding:'16px' }}>
                  <p style={{ fontSize:'11px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--text-muted)', margin:'0 0 4px' }}>{label}</p>
                  <p className="font-display" style={{ fontSize:'20px', fontWeight:700, color, margin:0 }}>{formatCurrency(value, currencySymbol)}</p>
                </div>
              ))}
            </div>
          )}
          <div className="card" style={{ padding:'20px' }}>
            <h3 style={{ margin:'0 0 16px', fontSize:'13px', fontWeight:700, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'0.06em' }}>Cash Flow {new Date().getFullYear()}</h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData} margin={{ top:5, right:5, left:-10, bottom:0 }}>
                <defs>
                  <linearGradient id="incGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#4ade80" stopOpacity={0.25}/><stop offset="95%" stopColor="#4ade80" stopOpacity={0.02}/></linearGradient>
                  <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f87171" stopOpacity={0.2}/><stop offset="95%" stopColor="#f87171" stopOpacity={0.02}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                <XAxis dataKey="month" tick={{ fill:'#64748b', fontSize:11 }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fill:'#64748b', fontSize:11 }} axisLine={false} tickLine={false} tickFormatter={v=>`${currencySymbol}${(v/1000).toFixed(0)}k`}/>
                <Tooltip contentStyle={{ background:'var(--bg-elevated)', border:'1px solid var(--border-default)', borderRadius:'10px', fontSize:'13px' }}/>
                <Area type="monotone" dataKey="Income"  stroke="#4ade80" strokeWidth={2} fill="url(#incGrad)" dot={false}/>
                <Area type="monotone" dataKey="Expense" stroke="#f87171" strokeWidth={2} fill="url(#expGrad)" dot={false}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {tab !== 'overview' && (
        <>
          <SearchInput value={search} onChange={(v)=>{setSearch(v);setPage(1);}} placeholder={`Search ${tab.toLowerCase()} entries…`}/>
          <div className="card" style={{ overflow:'hidden' }}>
            {entriesQ.isLoading ? <TableSkeleton rows={8} cols={5}/> : !entries.length ? (
              <EmptyState icon={DollarSign} title={`No ${tab.toLowerCase()} entries`} description={`Add ${tab === 'INCOME' ? 'income' : 'expense'} entries to track your finances.`}
                action={can('finance','create')&&<button className="btn-primary btn-sm" onClick={()=>openAdd(tab)}><Plus size={13}/> Add Entry</button>}/>
            ) : <>
              <div className="table-wrapper" style={{ border:'none', borderRadius:0 }}>
                <table className="data-table">
                  <thead><tr><th>Date</th><th>Category</th><th>Description</th><th>Method</th><th>Amount</th><th>Actions</th></tr></thead>
                  <tbody>
                    {entries.map((e) => (
                      <tr key={e.id}>
                        <td style={{ color:'var(--text-secondary)' }}>{formatDate(e.date)}</td>
                        <td><span className={`badge ${e.type==='INCOME'?'badge-success':'badge-danger'}`}>{e.category}</span></td>
                        <td style={{ color:'var(--text-secondary)', maxWidth:'200px' }}>{e.description || e.reference || '—'}</td>
                        <td style={{ color:'var(--text-muted)', fontSize:'12px' }}>{e.paymentMethod?.replace(/_/g,' ')||'—'}</td>
                        <td style={{ fontWeight:700, color: e.type==='INCOME'?'#4ade80':'#f87171' }}>{e.type==='EXPENSE'&&'−'}{formatCurrency(e.amount, currencySymbol)}</td>
                        <td><div style={{ display:'flex', gap:'4px' }}>
                          {can('finance','edit')&&<button className="btn-ghost btn-icon" onClick={()=>{setEditEntry(e);setEntryModal(true);}}><Pencil size={13}/></button>}
                          {can('finance','delete')&&<button className="btn-ghost btn-icon" style={{color:'var(--danger)'}} onClick={()=>setDeleteTarget(e)}><Trash2 size={13}/></button>}
                        </div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination meta={entriesQ.data?.meta} onPageChange={setPage}/>
            </>}
          </div>
        </>
      )}

      {entryModal && <EntryModal open={entryModal} onClose={()=>setEntryModal(false)} entry={editEntry} defaultType={defaultType}/>}
      <ConfirmDialog open={!!deleteTarget} onClose={()=>setDeleteTarget(null)} onConfirm={()=>deleteM.mutate(deleteTarget?.id)}
        loading={deleteM.isPending} title="Delete Entry" description="Delete this finance entry?" confirmLabel="Delete" danger/>
    </div>
  );
}

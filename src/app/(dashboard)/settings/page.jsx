'use client';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader, Tabs, FormField, Spinner, Modal, ConfirmDialog } from '@/components/ui/index.jsx';
import { Save, Plus, Trash2, Pencil, Send, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const TABS = [
  { label: 'Business Profile', value: 'profile'   },
  { label: 'Tax Configuration', value: 'taxes'    },
  { label: 'SMTP / Email',      value: 'smtp'     },
  { label: 'Numbering',         value: 'numbering'},
];

// ── Business Profile Tab ──────────────────────────────────────────────────────
function ProfileTab() {
  const qc = useQueryClient();
  const { refreshUser } = useAuth();
  const { data, isLoading } = useQuery({ queryKey:['business-profile'], queryFn: ()=>settingsApi.getProfile().then(r=>r.data.data) });
  const [form, setForm] = useState({});
  useEffect(() => { if (data) setForm(data); }, [data]);
  const upd = (k,v) => setForm(f=>({...f,[k]:v}));

  const mutation = useMutation({
    mutationFn: (d) => settingsApi.updateProfile(d),
    onSuccess: () => { toast.success('Profile updated.'); qc.invalidateQueries({ queryKey:['business-profile'] }); refreshUser(); },
    onError: (err) => toast.error(err.response?.data?.message||'Failed.'),
  });

  if (isLoading) return <div style={{ display:'flex', justifyContent:'center', padding:'40px' }}><Spinner size={24}/></div>;

  const Row = (k, label, opts={}) => (
    <FormField label={label}>
      <input className="input" type={opts.type||'text'} value={form[k]||''} onChange={e=>upd(k,e.target.value)} placeholder={opts.placeholder||''}/>
    </FormField>
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
      <div className="card" style={{ padding:'24px' }}>
        <h3 style={{ margin:'0 0 18px', fontSize:'13px', fontWeight:700, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'0.06em' }}>Business Information</h3>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
          {Row('name','Business Name *',{ placeholder:'Acme Technologies Pvt Ltd' })}
          {Row('email','Business Email',{ type:'email' })}
          {Row('phone','Phone',{ placeholder:'+91 98765 43210' })}
          {Row('website','Website',{ placeholder:'https://yourbusiness.com' })}
          {Row('gstin','GSTIN',{ placeholder:'27AADCB2230M1ZT' })}
          {Row('pan','PAN',{ placeholder:'AADCB2230M' })}
        </div>
      </div>
      <div className="card" style={{ padding:'24px' }}>
        <h3 style={{ margin:'0 0 18px', fontSize:'13px', fontWeight:700, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'0.06em' }}>Address</h3>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
          {Row('address','Street Address')} {Row('city','City')}
          {Row('state','State')} {Row('pincode','Pincode')} {Row('country','Country')}
        </div>
      </div>
      <div className="card" style={{ padding:'24px' }}>
        <h3 style={{ margin:'0 0 18px', fontSize:'13px', fontWeight:700, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'0.06em' }}>Regional Settings</h3>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'16px' }}>
          <FormField label="Currency Symbol"><input className="input" value={form.currencySymbol||'₹'} onChange={e=>upd('currencySymbol',e.target.value)}/></FormField>
          <FormField label="Date Format">
            <select className="input" value={form.dateFormat||'DD/MM/YYYY'} onChange={e=>upd('dateFormat',e.target.value)}>
              {['DD/MM/YYYY','MM/DD/YYYY','YYYY-MM-DD'].map(f=><option key={f} value={f}>{f}</option>)}
            </select>
          </FormField>
          <FormField label="Fiscal Year Start">
            <select className="input" value={form.fiscalYearStart||'04'} onChange={e=>upd('fiscalYearStart',e.target.value)}>
              {[['01','January'],['04','April (India)'],['07','July'],['10','October']].map(([v,l])=><option key={v} value={v}>{l}</option>)}
            </select>
          </FormField>
        </div>
      </div>
      <div style={{ display:'flex', justifyContent:'flex-end' }}>
        <button className="btn-primary" onClick={()=>mutation.mutate(form)} disabled={mutation.isPending}>
          {mutation.isPending?<><Spinner size={13}/> Saving…</>:<><Save size={13}/> Save Profile</>}
        </button>
      </div>
    </div>
  );
}

// ── SMTP Tab ──────────────────────────────────────────────────────────────────
function SMTPTab() {
  const [form, setForm] = useState({ smtpHost:'', smtpPort:587, smtpSecure:false, smtpUser:'', smtpPass:'', smtpFromName:'', smtpFromEmail:'' });
  const [testEmail, setTestEmail] = useState('');
  const [testSent, setTestSent] = useState(false);
  const upd = (k,v) => setForm(f=>({...f,[k]:v}));

  const { data, isLoading } = useQuery({
    queryKey: ['smtp-config'],
    queryFn:  () => settingsApi.getSMTPConfig().then(r=>r.data.data),
  });

  useEffect(() => { if (data) setForm({ ...data, smtpPass: data.smtpPass||'' }); }, [data]);

  const saveMutation = useMutation({
    mutationFn: (d) => settingsApi.updateSMTPConfig(d),
    onSuccess: () => toast.success('SMTP configuration saved.'),
    onError: (err) => toast.error(err.response?.data?.message||'Failed.'),
  });

  const testMutation = useMutation({
    mutationFn: (email) => settingsApi.testSMTP({ testEmail: email }),
    onSuccess: () => { toast.success('Test email sent successfully!'); setTestSent(true); setTimeout(()=>setTestSent(false),3000); },
    onError: (err) => toast.error(err.response?.data?.message||'SMTP test failed.'),
  });

  if (isLoading) return <div style={{ display:'flex', justifyContent:'center', padding:'40px' }}><Spinner size={24}/></div>;

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
      <div className="card" style={{ padding:'24px' }}>
        <h3 style={{ margin:'0 0 6px', fontSize:'14px', fontWeight:700, color:'var(--text-primary)' }}>SMTP Email Configuration</h3>
        <p style={{ margin:'0 0 20px', fontSize:'13px', color:'var(--text-secondary)' }}>
          Configure your own SMTP server to send invoices, quotations and notifications from your business email address.
        </p>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
          <FormField label="SMTP Host *" hint="e.g. smtp.gmail.com, smtp.sendgrid.net">
            <input className="input" value={form.smtpHost||''} onChange={e=>upd('smtpHost',e.target.value)} placeholder="smtp.gmail.com"/>
          </FormField>
          <FormField label="SMTP Port">
            <input type="number" className="input" value={form.smtpPort||587} onChange={e=>upd('smtpPort',e.target.value)} placeholder="587"/>
          </FormField>
          <FormField label="Username / Email">
            <input type="email" className="input" value={form.smtpUser||''} onChange={e=>upd('smtpUser',e.target.value)} placeholder="your@gmail.com"/>
          </FormField>
          <FormField label="Password / App Password">
            <input type="password" className="input" value={form.smtpPass||''} onChange={e=>upd('smtpPass',e.target.value)} placeholder="Enter password (leave blank to keep current)"/>
          </FormField>
          <FormField label="From Name (displayed to recipient)">
            <input className="input" value={form.smtpFromName||''} onChange={e=>upd('smtpFromName',e.target.value)} placeholder="Acme Technologies"/>
          </FormField>
          <FormField label="From Email Address">
            <input type="email" className="input" value={form.smtpFromEmail||''} onChange={e=>upd('smtpFromEmail',e.target.value)} placeholder="billing@acme.com"/>
          </FormField>
        </div>
        <div style={{ marginTop:'16px' }}>
          <label style={{ display:'flex', alignItems:'center', gap:'8px', cursor:'pointer', fontSize:'14px', color:'var(--text-primary)' }}>
            <input type="checkbox" checked={form.smtpSecure||false} onChange={e=>upd('smtpSecure',e.target.checked)} style={{ width:'16px', height:'16px', accentColor:'var(--primary)' }}/>
            Use SSL/TLS (enable for port 465)
          </label>
        </div>
        <div style={{ padding:'14px', marginTop:'16px', borderRadius:'10px', background:'var(--primary-muted)', border:'1px solid rgba(99,102,241,0.2)' }}>
          <p style={{ margin:0, fontSize:'12px', color:'#a5b4fc', fontWeight:600 }}>Gmail tip:</p>
          <p style={{ margin:'4px 0 0', fontSize:'12px', color:'#a5b4fc' }}>Host: smtp.gmail.com · Port: 587 · Use an App Password (Google Account → Security → App Passwords)</p>
        </div>
      </div>

      <div className="card" style={{ padding:'24px' }}>
        <h3 style={{ margin:'0 0 14px', fontSize:'13px', fontWeight:700, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'0.06em' }}>Test Configuration</h3>
        <div style={{ display:'flex', gap:'12px', alignItems:'flex-end' }}>
          <FormField label="Send test email to" style={{ flex:1 }}>
            <input type="email" className="input" value={testEmail} onChange={e=>setTestEmail(e.target.value)} placeholder="your@email.com"/>
          </FormField>
          <button className="btn-secondary" style={{ whiteSpace:'nowrap' }}
            onClick={()=>testMutation.mutate(testEmail)} disabled={testMutation.isPending||!testEmail}>
            {testSent ? <><CheckCircle size={13} style={{ color:'var(--success)' }}/> Sent!</> : testMutation.isPending ? <Spinner size={13}/> : <><Send size={13}/> Send Test</>}
          </button>
        </div>
      </div>

      <div style={{ display:'flex', justifyContent:'flex-end' }}>
        <button className="btn-primary" onClick={()=>saveMutation.mutate(form)} disabled={saveMutation.isPending}>
          {saveMutation.isPending?<><Spinner size={13}/> Saving…</>:<><Save size={13}/> Save SMTP Config</>}
        </button>
      </div>
    </div>
  );
}

// ── Tax Tab ───────────────────────────────────────────────────────────────────
function TaxTab() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey:['taxes'], queryFn: ()=>settingsApi.listTaxes().then(r=>r.data.data) });
  const [modal, setModal] = useState(false);
  const [editTax, setEditTax] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({ name:'', rate:'', type:'GST', isDefault:false });
  const upd = (k,v) => setForm(f=>({...f,[k]:v}));

  const mutation = useMutation({
    mutationFn: (d) => {
      const data = { ...d, rate: parseFloat(d.rate)||0 };
      return editTax ? settingsApi.updateTax(editTax.id, data) : settingsApi.createTax(data);
    },
    onSuccess: () => { toast.success('Saved.'); qc.invalidateQueries({ queryKey:['taxes'] }); setModal(false); },
    onError: (err) => toast.error(err.response?.data?.message||'Failed.'),
  });

  const deleteM = useMutation({
    mutationFn: (id) => settingsApi.deleteTax(id),
    onSuccess: () => { toast.success('Deleted.'); qc.invalidateQueries({ queryKey:['taxes'] }); setDeleteTarget(null); },
  });

  const openAdd  = () => { setEditTax(null); setForm({ name:'', rate:'', type:'GST', isDefault:false }); setModal(true); };
  const openEdit = (t) => { setEditTax(t); setForm(t); setModal(true); };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
      <div style={{ display:'flex', justifyContent:'flex-end' }}>
        <button className="btn-primary" onClick={openAdd}><Plus size={13}/> Add Tax Rate</button>
      </div>
      <div className="card" style={{ overflow:'hidden' }}>
        {isLoading ? <Spinner size={20}/> : !data?.length ? (
          <div style={{ padding:'32px', textAlign:'center', color:'var(--text-muted)' }}>No tax configurations. Add GST slabs like 5%, 12%, 18%, 28%.</div>
        ) : (
          <table className="data-table">
            <thead><tr><th>Name</th><th>Rate</th><th>Type</th><th>Default</th><th>Actions</th></tr></thead>
            <tbody>
              {data.map(t=>(
                <tr key={t.id}>
                  <td style={{ fontWeight:600 }}>{t.name}</td>
                  <td><span className="badge badge-warning">{t.rate}%</span></td>
                  <td><span className="badge badge-neutral">{t.type}</span></td>
                  <td>{t.isDefault && <span className="badge badge-success">Default</span>}</td>
                  <td>
                    <div style={{ display:'flex', gap:'4px' }}>
                      <button className="btn-ghost btn-icon" onClick={()=>openEdit(t)}><Pencil size={13}/></button>
                      <button className="btn-ghost btn-icon" style={{ color:'var(--danger)' }} onClick={()=>setDeleteTarget(t)}><Trash2 size={13}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <Modal open={modal} onClose={()=>setModal(false)} title={editTax?'Edit Tax':'Add Tax Rate'}
        footer={<><button className="btn-secondary" onClick={()=>setModal(false)}>Cancel</button>
          <button className="btn-primary" onClick={()=>mutation.mutate(form)} disabled={mutation.isPending}>
            {mutation.isPending?<Spinner size={13}/>:editTax?'Update':'Add'}
          </button></>}>
        <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
          <FormField label="Name *"><input className="input" value={form.name} onChange={e=>upd('name',e.target.value)} placeholder="GST 18%"/></FormField>
          <FormField label="Rate (%) *"><input type="number" min="0" max="100" step="0.5" className="input" value={form.rate} onChange={e=>upd('rate',e.target.value)}/></FormField>
          <FormField label="Type">
            <select className="input" value={form.type} onChange={e=>upd('type',e.target.value)}>
              {['GST','IGST','CGST_SGST','TDS','OTHER'].map(t=><option key={t} value={t}>{t}</option>)}
            </select>
          </FormField>
          <label style={{ display:'flex', alignItems:'center', gap:'8px', cursor:'pointer', fontSize:'14px', color:'var(--text-primary)' }}>
            <input type="checkbox" checked={form.isDefault} onChange={e=>upd('isDefault',e.target.checked)} style={{ width:'16px', height:'16px', accentColor:'var(--primary)' }}/>
            Set as default for new line items
          </label>
        </div>
      </Modal>
      <ConfirmDialog open={!!deleteTarget} onClose={()=>setDeleteTarget(null)} onConfirm={()=>deleteM.mutate(deleteTarget?.id)}
        loading={deleteM.isPending} title="Delete Tax" description={`Delete "${deleteTarget?.name}"?`} confirmLabel="Delete" danger/>
    </div>
  );
}

// ── Numbering Tab ─────────────────────────────────────────────────────────────
function NumberingTab() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey:['business-profile'], queryFn: ()=>settingsApi.getProfile().then(r=>r.data.data) });
  const [type, setType] = useState('invoice');
  const [prefix, setPrefix] = useState('');
  const [startFrom, setStartFrom] = useState('1');

  const mutation = useMutation({
    mutationFn: (d) => settingsApi.resetNumbering(d),
    onSuccess: () => { toast.success('Numbering updated.'); qc.invalidateQueries({ queryKey:['business-profile'] }); },
    onError: (err) => toast.error(err.response?.data?.message||'Failed.'),
  });

  const prefixMap = { invoice:['invoicePrefix','nextInvoiceNo'], quotation:['quotationPrefix','nextQuotationNo'], purchase:['purchasePrefix','nextPurchaseNo'] };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
      {data && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'12px' }}>
          {[['Invoice','invoicePrefix','nextInvoiceNo'],['Quotation','quotationPrefix','nextQuotationNo'],['Purchase','purchasePrefix','nextPurchaseNo']].map(([label,pk,nk])=>(
            <div key={label} className="card" style={{ padding:'16px' }}>
              <p style={{ fontSize:'11px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--text-muted)', margin:'0 0 4px' }}>{label} Prefix</p>
              <p style={{ fontFamily:'monospace', fontSize:'18px', fontWeight:700, color:'var(--primary)', margin:'0 0 2px' }}>{data[pk]}</p>
              <p style={{ fontSize:'12px', color:'var(--text-muted)', margin:0 }}>Next: #{String(data[nk]).padStart(4,'0')}</p>
            </div>
          ))}
        </div>
      )}
      <div className="card" style={{ padding:'24px' }}>
        <h3 style={{ margin:'0 0 16px', fontSize:'13px', fontWeight:700, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'0.06em' }}>Reset Numbering</h3>
        <div style={{ display:'flex', gap:'12px', alignItems:'flex-end', flexWrap:'wrap' }}>
          <FormField label="Document Type">
            <select className="input" value={type} onChange={e=>setType(e.target.value)} style={{ minWidth:'160px' }}>
              <option value="invoice">Invoice</option>
              <option value="quotation">Quotation</option>
              <option value="purchase">Purchase</option>
            </select>
          </FormField>
          <FormField label="Start Number From">
            <input type="number" min="1" className="input" value={startFrom} onChange={e=>setStartFrom(e.target.value)} style={{ width:'120px' }}/>
          </FormField>
          <button className="btn-danger" onClick={()=>mutation.mutate({ type, startFrom: parseInt(startFrom,10)||1 })} disabled={mutation.isPending}>
            {mutation.isPending?<Spinner size={13}/>:'Reset Numbering'}
          </button>
        </div>
        <p style={{ marginTop:'10px', fontSize:'12px', color:'var(--danger)' }}>⚠ Resetting can cause duplicate numbers if existing documents aren't accounted for.</p>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [tab, setTab] = useState('profile');
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'20px', maxWidth:'900px' }}>
      <PageHeader title="Settings" subtitle="Business profile, email, tax and preferences"/>
      <Tabs tabs={TABS} active={tab} onChange={setTab}/>
      {tab === 'profile'   && <ProfileTab/>}
      {tab === 'taxes'     && <TaxTab/>}
      {tab === 'smtp'      && <SMTPTab/>}
      {tab === 'numbering' && <NumberingTab/>}
    </div>
  );
}

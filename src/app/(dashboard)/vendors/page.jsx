'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vendorsApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader, SearchInput, EmptyState, TableSkeleton, Pagination, Tabs, Modal, FormField, Spinner, ConfirmDialog } from '@/components/ui/index.jsx';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Plus, Store, ShoppingCart, Pencil, Trash2, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';

const TABS = [{ label:'Vendors', value:'vendors' }, { label:'Purchases', value:'purchases' }];

function VendorModal({ open, onClose, vendor }) {
  const qc = useQueryClient();
  const isEdit = !!vendor;
  const [form, setForm] = useState(vendor || { name:'', email:'', phone:'', company:'', gstin:'', address:'', city:'', state:'', creditPeriod:30 });
  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const mutation = useMutation({
    mutationFn: (data) => {
      const d = { ...data };
      if (d.creditPeriod !== undefined) d.creditPeriod = parseInt(d.creditPeriod, 10) || 0;
      return isEdit ? vendorsApi.updateVendor(vendor.id, d) : vendorsApi.createVendor(d);
    },
    onSuccess: () => { toast.success(isEdit ? 'Updated.' : 'Vendor added.'); qc.invalidateQueries({ queryKey: ['vendors'] }); onClose(); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed.'),
  });

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Vendor' : 'Add Vendor'} size="lg"
      footer={<><button className="btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn-primary" onClick={() => mutation.mutate(form)} disabled={mutation.isPending}>
          {mutation.isPending ? <><Spinner size={13}/> Saving…</> : isEdit ? 'Update' : 'Add Vendor'}
        </button></>}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
        {[['Name *','name'],['Company','company'],['Email','email'],['Phone','phone'],['GSTIN','gstin'],['PAN','pan'],['City','city'],['State','state']].map(([label, key]) => (
          <FormField key={key} label={label}>
            <input className="input" value={form[key]||''} onChange={e => upd(key, e.target.value)} />
          </FormField>
        ))}
        <FormField label="Credit Period (days)"><input type="number" className="input" value={form.creditPeriod||30} onChange={e => upd('creditPeriod', e.target.value)}/></FormField>
        <FormField label="Address"><input className="input" value={form.address||''} onChange={e => upd('address', e.target.value)}/></FormField>
      </div>
    </Modal>
  );
}

function PaymentModal({ open, onClose, purchase, currencySymbol }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ amount: purchase?.balanceAmount||'', method:'BANK_TRANSFER', paymentDate: new Date().toISOString().split('T')[0], reference:'' });
  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const mutation = useMutation({
    mutationFn: (data) => vendorsApi.recordPayment(purchase.id, { ...data, amount: parseFloat(data.amount) || 0 }),
    onSuccess: () => { toast.success('Payment recorded.'); qc.invalidateQueries({ queryKey: ['purchases'] }); onClose(); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed.'),
  });

  return (
    <Modal open={open} onClose={onClose} title="Record Vendor Payment"
      footer={<><button className="btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn-primary" onClick={() => mutation.mutate(form)} disabled={mutation.isPending}>
          {mutation.isPending ? <Spinner size={13}/> : 'Record Payment'}
        </button></>}>
      <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
        <FormField label="Amount"><input type="number" min="0.01" className="input" value={form.amount} onChange={e => upd('amount', e.target.value)}/></FormField>
        <FormField label="Date"><input type="date" className="input" value={form.paymentDate} onChange={e => upd('paymentDate', e.target.value)}/></FormField>
        <FormField label="Method">
          <select className="input" value={form.method} onChange={e => upd('method', e.target.value)}>
            {['CASH','BANK_TRANSFER','UPI','CHEQUE','NEFT','RTGS'].map(m => <option key={m} value={m}>{m.replace(/_/g,' ')}</option>)}
          </select>
        </FormField>
        <FormField label="Reference"><input className="input" value={form.reference} onChange={e => upd('reference', e.target.value)} placeholder="UTR / Cheque no."/></FormField>
      </div>
    </Modal>
  );
}

export default function VendorsPage() {
  const { can, currencySymbol } = useAuth();
  const qc = useQueryClient();
  const [tab, setTab] = useState('vendors');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [vendorModal, setVendorModal] = useState(false);
  const [editVendor, setEditVendor] = useState(null);
  const [payTarget, setPayTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const vendorQ = useQuery({ queryKey: ['vendors', page, search], queryFn: () => vendorsApi.listVendors({ page, limit:20, search }).then(r => r.data), enabled: tab === 'vendors', placeholderData: (p) => p });
  const purchaseQ = useQuery({ queryKey: ['purchases', page], queryFn: () => vendorsApi.listPurchases({ page, limit:20 }).then(r => r.data), enabled: tab === 'purchases', placeholderData: (p) => p });

  const deleteM = useMutation({
    mutationFn: (id) => vendorsApi.deleteVendor(id),
    onSuccess: () => { toast.success('Deleted.'); qc.invalidateQueries({ queryKey: ['vendors'] }); setDeleteTarget(null); },
  });

  const vendors   = vendorQ.data?.data   || [];
  const purchases = purchaseQ.data?.data || [];

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
      <PageHeader title="Vendors & Purchases" subtitle="Suppliers and purchase orders"
        actions={tab === 'vendors' && can('vendors','create') && (
          <button className="btn-primary" onClick={() => { setEditVendor(null); setVendorModal(true); }}><Plus size={14}/> Add Vendor</button>
        )} />
      <Tabs tabs={TABS} active={tab} onChange={(v) => { setTab(v); setPage(1); }} />

      {tab === 'vendors' && <>
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search vendors…" />
        <div className="card" style={{ overflow:'hidden' }}>
          {vendorQ.isLoading ? <TableSkeleton rows={6} cols={5}/> : !vendors.length ? (
            <EmptyState icon={Store} title="No vendors yet" description="Add your first vendor."
              action={<button className="btn-primary btn-sm" onClick={() => setVendorModal(true)}><Plus size={13}/> Add</button>}/>
          ) : <>
            <div className="table-wrapper" style={{ border:'none', borderRadius:0 }}>
              <table className="data-table">
                <thead><tr><th>Vendor</th><th>Contact</th><th>GSTIN</th><th>Outstanding</th><th>Actions</th></tr></thead>
                <tbody>
                  {vendors.map((v) => (
                    <tr key={v.id}>
                      <td><div><p style={{ fontWeight:600, margin:0 }}>{v.name}</p>{v.company&&<p style={{ fontSize:'12px', color:'var(--text-muted)', margin:0 }}>{v.company}</p>}</div></td>
                      <td><div style={{ display:'flex', flexDirection:'column', gap:'2px' }}>{v.email&&<span style={{ fontSize:'12px', color:'var(--text-secondary)' }}>{v.email}</span>}{v.phone&&<span style={{ fontSize:'12px', color:'var(--text-secondary)' }}>{v.phone}</span>}</div></td>
                      <td style={{ fontFamily:'monospace', fontSize:'12px', color:'var(--text-secondary)' }}>{v.gstin||'—'}</td>
                      <td style={{ fontWeight:600, color: v.outstandingBalance>0?'#f87171':'#4ade80' }}>{formatCurrency(v.outstandingBalance, currencySymbol)}</td>
                      <td><div style={{ display:'flex', gap:'4px' }}>
                        {can('vendors','edit')&&<button className="btn-ghost btn-icon" onClick={()=>{setEditVendor(v);setVendorModal(true);}}><Pencil size={13}/></button>}
                        {can('vendors','delete')&&<button className="btn-ghost btn-icon" style={{color:'var(--danger)'}} onClick={()=>setDeleteTarget(v)}><Trash2 size={13}/></button>}
                      </div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination meta={vendorQ.data?.meta} onPageChange={setPage}/>
          </>}
        </div>
      </>}

      {tab === 'purchases' && (
        <div className="card" style={{ overflow:'hidden' }}>
          {purchaseQ.isLoading ? <TableSkeleton rows={6} cols={7}/> : !purchases.length ? (
            <EmptyState icon={ShoppingCart} title="No purchases yet" description="Create a purchase order to track vendor expenses."/>
          ) : <>
            <div className="table-wrapper" style={{ border:'none', borderRadius:0 }}>
              <table className="data-table">
                <thead><tr><th>Purchase #</th><th>Vendor</th><th>Date</th><th>Total</th><th>Balance</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {purchases.map((p) => (
                    <tr key={p.id}>
                      <td style={{ fontFamily:'monospace', fontSize:'12px', fontWeight:600, color:'var(--primary)' }}>{p.purchaseNumber}</td>
                      <td style={{ fontWeight:500 }}>{p.vendor?.name}</td>
                      <td style={{ color:'var(--text-secondary)' }}>{formatDate(p.date)}</td>
                      <td style={{ fontWeight:600 }}>{formatCurrency(p.totalAmount, currencySymbol)}</td>
                      <td style={{ fontWeight:600, color:p.balanceAmount>0?'#f87171':'#4ade80' }}>{formatCurrency(p.balanceAmount, currencySymbol)}</td>
                      <td><span className={`badge ${p.status==='PAID'?'badge-success':p.status==='CANCELLED'?'badge-neutral':'badge-warning'}`}>{p.status.replace(/_/g,' ')}</span></td>
                      <td>{can('purchases','edit')&&p.balanceAmount>0&&p.status!=='CANCELLED'&&(
                        <button className="btn-primary btn-sm" onClick={()=>setPayTarget(p)}><CreditCard size={12}/> Pay</button>
                      )}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination meta={purchaseQ.data?.meta} onPageChange={setPage}/>
          </>}
        </div>
      )}

      {vendorModal && <VendorModal open={vendorModal} onClose={() => setVendorModal(false)} vendor={editVendor}/>}
      {payTarget && <PaymentModal open={!!payTarget} onClose={() => setPayTarget(null)} purchase={payTarget} currencySymbol={currencySymbol}/>}
      <ConfirmDialog open={!!deleteTarget} onClose={()=>setDeleteTarget(null)} onConfirm={()=>deleteM.mutate(deleteTarget?.id)}
        loading={deleteM.isPending} title="Delete Vendor" description={`Delete "${deleteTarget?.name}"?`} confirmLabel="Delete" danger/>
    </div>
  );
}

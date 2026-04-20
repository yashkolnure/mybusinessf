'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { invoicesApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader, Modal, FormField, Spinner, ConfirmDialog } from '@/components/ui/index.jsx';
import { formatCurrency, formatDate, INVOICE_STATUS, downloadBlob } from '@/lib/utils';
import { ArrowLeft, Send, Download, CreditCard, XCircle, Copy, Check, Trash2, RefreshCw, FileX } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

function PaymentModal({ open, onClose, invoice, currencySymbol }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ amount: invoice?.balanceAmount || '', method:'BANK_TRANSFER', paymentDate: new Date().toISOString().split('T')[0], reference:'', notes:'' });
  const upd = (k,v) => setForm(f=>({...f,[k]:v}));

  const mutation = useMutation({
    mutationFn: (data) => invoicesApi.recordPayment(invoice.id, { ...data, amount: parseFloat(data.amount)||0 }),
    onSuccess: () => { toast.success('Payment recorded.'); qc.invalidateQueries({ queryKey:['invoice',invoice.id] }); onClose(); },
    onError: (err) => toast.error(err.response?.data?.message||'Failed.'),
  });

  return (
    <Modal open={open} onClose={onClose} title="Record Payment"
      footer={<><button className="btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn-primary" onClick={()=>mutation.mutate(form)} disabled={mutation.isPending}>
          {mutation.isPending?<><Spinner size={13}/> Saving…</>:<><Check size={13}/> Record</>}
        </button></>}>
      <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
        <div style={{ padding:'12px', borderRadius:'10px', background:'var(--primary-muted)', border:'1px solid rgba(99,102,241,0.2)' }}>
          <p style={{ margin:0, fontSize:'12px', color:'#a5b4fc' }}>Balance Due: <strong>{currencySymbol}{invoice?.balanceAmount?.toFixed(2)}</strong></p>
        </div>
        <FormField label="Amount *"><input type="number" min="0.01" step="0.01" className="input" value={form.amount} onChange={e=>upd('amount',e.target.value)}/></FormField>
        <FormField label="Payment Date"><input type="date" className="input" value={form.paymentDate} onChange={e=>upd('paymentDate',e.target.value)}/></FormField>
        <FormField label="Method">
          <select className="input" value={form.method} onChange={e=>upd('method',e.target.value)}>
            {['CASH','BANK_TRANSFER','UPI','CHEQUE','CARD','NEFT','RTGS'].map(m=><option key={m} value={m}>{m.replace(/_/g,' ')}</option>)}
          </select>
        </FormField>
        <FormField label="Reference / UTR"><input className="input" placeholder="Transaction ref…" value={form.reference} onChange={e=>upd('reference',e.target.value)}/></FormField>
        <FormField label="Notes"><textarea className="input" rows={2} value={form.notes} onChange={e=>upd('notes',e.target.value)} style={{ resize:'vertical' }}/></FormField>
      </div>
    </Modal>
  );
}

function CreditNoteModal({ open, onClose, invoice, currencySymbol }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ amount:'', reason:'', sendEmail: true });
  const upd = (k,v) => setForm(f=>({...f,[k]:v}));

  const mutation = useMutation({
    mutationFn: (data) => invoicesApi.createCreditNote(invoice.id, { ...data, amount: parseFloat(data.amount)||0 }),
    onSuccess: () => { toast.success('Credit note issued.'); qc.invalidateQueries({ queryKey:['invoice',invoice.id] }); onClose(); },
    onError: (err) => toast.error(err.response?.data?.message||'Failed.'),
  });

  return (
    <Modal open={open} onClose={onClose} title="Issue Credit Note"
      footer={<><button className="btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn-primary" onClick={()=>mutation.mutate(form)} disabled={mutation.isPending}>
          {mutation.isPending?<><Spinner size={13}/> Issuing…</>:'Issue Credit Note'}
        </button></>}>
      <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
        <div style={{ padding:'12px', borderRadius:'10px', background:'var(--success-muted)', border:'1px solid rgba(34,197,94,0.2)' }}>
          <p style={{ margin:0, fontSize:'12px', color:'#4ade80' }}>Invoice: <strong>{invoice?.invoiceNumber}</strong> · Total Paid: <strong>{currencySymbol}{invoice?.paidAmount?.toFixed(2)}</strong></p>
        </div>
        <FormField label="Credit Amount *"><input type="number" min="0.01" step="0.01" className="input" value={form.amount} onChange={e=>upd('amount',e.target.value)} placeholder="Amount to credit back"/></FormField>
        <FormField label="Reason"><textarea className="input" rows={3} value={form.reason} onChange={e=>upd('reason',e.target.value)} placeholder="Reason for credit note…" style={{ resize:'vertical' }}/></FormField>
        <label style={{ display:'flex', alignItems:'center', gap:'8px', cursor:'pointer', fontSize:'14px', color:'var(--text-primary)' }}>
          <input type="checkbox" checked={form.sendEmail} onChange={e=>upd('sendEmail',e.target.checked)} style={{ width:'16px', height:'16px', accentColor:'var(--primary)' }}/>
          Email credit note to client
        </label>
      </div>
    </Modal>
  );
}

export default function InvoiceDetailPage({ params }) {
  const router = useRouter();
  const { currencySymbol, can } = useAuth();
  const qc = useQueryClient();
  const [payModal,      setPayModal]      = useState(false);
  const [creditModal,   setCreditModal]   = useState(false);
  const [cancelConfirm, setCancelConfirm] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['invoice', params.id],
    queryFn:  () => invoicesApi.get(params.id).then(r=>r.data.data),
  });

  const { data: creditNotes } = useQuery({
    queryKey: ['credit-notes', params.id],
    queryFn:  () => invoicesApi.listCreditNotes(params.id).then(r=>r.data.data),
    enabled:  !!data,
  });

  const sendMutation = useMutation({
    mutationFn: () => invoicesApi.send(params.id),
    onSuccess: () => { toast.success('Invoice sent!'); qc.invalidateQueries({ queryKey:['invoice',params.id] }); },
    onError: (err) => toast.error(err.response?.data?.message||'Failed to send.'),
  });

  const cancelMutation = useMutation({
    mutationFn: () => invoicesApi.cancel(params.id),
    onSuccess: () => { toast.success('Cancelled.'); qc.invalidateQueries({ queryKey:['invoice',params.id] }); setCancelConfirm(false); },
  });

  const dupMutation = useMutation({
    mutationFn: () => invoicesApi.duplicate(params.id),
    onSuccess: (res) => { toast.success('Duplicated.'); router.push(`/invoices/${res.data.data.id}`); },
  });

  const deletePayMutation = useMutation({
    mutationFn: (payId) => invoicesApi.deletePayment(params.id, payId),
    onSuccess: () => { toast.success('Payment removed.'); qc.invalidateQueries({ queryKey:['invoice',params.id] }); },
  });

  const handleDownload = async () => {
    try { const r = await invoicesApi.downloadPDF(params.id); downloadBlob(r.data, `${inv.invoiceNumber}.pdf`); }
    catch { toast.error('Failed to download PDF.'); }
  };

  if (isLoading) return <div style={{ display:'flex', justifyContent:'center', padding:'60px' }}><Spinner size={28}/></div>;
  const inv = data;
  if (!inv) return <div style={{ color:'var(--danger)' }}>Invoice not found.</div>;

  const cfg = INVOICE_STATUS[inv.status];
  const canSend = can('invoicing','edit') && !['CANCELLED'].includes(inv.status);
  const wasSent = ['SENT','VIEWED','PARTIALLY_PAID','PAID','OVERDUE'].includes(inv.status);

  return (
    <div style={{ maxWidth:'920px', display:'flex', flexDirection:'column', gap:'20px' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
        <Link href="/invoices" className="btn-ghost btn-icon"><ArrowLeft size={16}/></Link>
        <div style={{ flex:1 }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            <h1 className="font-display" style={{ fontSize:'22px', fontWeight:700, color:'var(--text-primary)', margin:0 }}>{inv.invoiceNumber}</h1>
            {cfg && <span className={`badge ${cfg.class}`}>{cfg.label}</span>}
          </div>
          <p style={{ color:'var(--text-secondary)', fontSize:'13px', margin:0 }}>{inv.client?.name}</p>
        </div>
        <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
          {canSend && !wasSent && <button className="btn-secondary" onClick={()=>sendMutation.mutate()} disabled={sendMutation.isPending}>{sendMutation.isPending?<Spinner size={13}/>:<Send size={13}/>} Send</button>}
          {canSend && wasSent  && <button className="btn-secondary" onClick={()=>sendMutation.mutate()} disabled={sendMutation.isPending}>{sendMutation.isPending?<Spinner size={13}/>:<RefreshCw size={13}/>} Resend</button>}
          <button className="btn-secondary" onClick={handleDownload}><Download size={13}/> PDF</button>
          {can('invoicing','create') && <button className="btn-secondary" onClick={()=>dupMutation.mutate()}><Copy size={13}/> Duplicate</button>}
          {can('invoicing','edit') && inv.balanceAmount > 0 && inv.status !== 'CANCELLED' && (
            <button className="btn-primary" onClick={()=>setPayModal(true)}><CreditCard size={13}/> Record Payment</button>
          )}
          {can('invoicing','create') && ['PAID','PARTIALLY_PAID'].includes(inv.status) && (
            <button className="btn-secondary" onClick={()=>setCreditModal(true)} style={{ borderColor:'rgba(34,197,94,0.3)', color:'#4ade80' }}><FileX size={13}/> Credit Note</button>
          )}
          {can('invoicing','edit') && !['PAID','CANCELLED'].includes(inv.status) && (
            <button className="btn-danger" onClick={()=>setCancelConfirm(true)}><XCircle size={13}/> Cancel</button>
          )}
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px' }}>
        {[
          { label:'Total',   value:inv.totalAmount,   color:'#a5b4fc' },
          { label:'Paid',    value:inv.paidAmount,    color:'#4ade80' },
          { label:'Balance', value:inv.balanceAmount, color: inv.balanceAmount>0?'#f87171':'#4ade80' },
          { label:'Tax',     value:inv.taxAmount,     color:'var(--text-secondary)' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card" style={{ padding:'16px' }}>
            <p style={{ fontSize:'11px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--text-muted)', margin:'0 0 4px' }}>{label}</p>
            <p className="font-display" style={{ fontSize:'20px', fontWeight:700, color, margin:0 }}>{formatCurrency(value, currencySymbol)}</p>
          </div>
        ))}
      </div>

      {/* Info */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
        <div className="card" style={{ padding:'20px' }}>
          <h3 style={{ margin:'0 0 12px', fontSize:'12px', fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em' }}>Invoice Info</h3>
          {[['Invoice Date',formatDate(inv.date)],['Due Date',formatDate(inv.dueDate)],['Sent At',inv.sentAt?formatDate(inv.sentAt):'Not sent'],['Viewed At',inv.viewedAt?formatDate(inv.viewedAt):'—'],['Source Quote',inv.quotation?.quotationNumber||'—']].map(([l,v])=>(
            <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'7px 0', borderBottom:'1px solid var(--border-subtle)', fontSize:'13px' }}>
              <span style={{ color:'var(--text-muted)' }}>{l}</span>
              <span style={{ color:'var(--text-primary)', fontWeight:500 }}>{v||'—'}</span>
            </div>
          ))}
        </div>
        <div className="card" style={{ padding:'20px' }}>
          <h3 style={{ margin:'0 0 12px', fontSize:'12px', fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em' }}>Bill To</h3>
          <p style={{ fontWeight:600, fontSize:'15px', color:'var(--text-primary)', margin:'0 0 4px' }}>{inv.client?.name}</p>
          {inv.client?.company   && <p style={{ fontSize:'13px', color:'var(--text-secondary)', margin:'0 0 2px' }}>{inv.client.company}</p>}
          {inv.client?.email     && <p style={{ fontSize:'13px', color:'var(--text-secondary)', margin:'0 0 2px' }}>{inv.client.email}</p>}
          {inv.client?.phone     && <p style={{ fontSize:'13px', color:'var(--text-secondary)', margin:'0 0 2px' }}>{inv.client.phone}</p>}
          {inv.client?.gstin     && <p style={{ fontSize:'12px', color:'var(--text-muted)', fontFamily:'monospace', margin:'4px 0 0' }}>GSTIN: {inv.client.gstin}</p>}
          {inv.client?.billingAddress && <p style={{ fontSize:'13px', color:'var(--text-secondary)', margin:'8px 0 0', lineHeight:1.5 }}>{[inv.client.billingAddress,inv.client.billingCity,inv.client.billingState].filter(Boolean).join(', ')}</p>}
        </div>
      </div>

      {/* Items */}
      <div className="card" style={{ overflow:'hidden' }}>
        <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--border-subtle)' }}>
          <h3 style={{ margin:0, fontSize:'13px', fontWeight:700, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'0.06em' }}>Line Items</h3>
        </div>
        <table className="data-table">
          <thead><tr><th>#</th><th>Description</th><th>Qty</th><th>Unit</th><th>Price</th><th>Tax %</th><th style={{ textAlign:'right' }}>Amount</th></tr></thead>
          <tbody>
            {inv.items?.map((item,idx)=>(
              <tr key={item.id}>
                <td style={{ color:'var(--text-muted)' }}>{idx+1}</td>
                <td style={{ fontWeight:500 }}>{item.description}</td>
                <td>{item.quantity}</td>
                <td style={{ color:'var(--text-muted)' }}>{item.unit||'—'}</td>
                <td>{formatCurrency(item.unitPrice,currencySymbol)}</td>
                <td><span className="badge badge-neutral">{item.taxRate}%</span></td>
                <td style={{ textAlign:'right', fontWeight:600 }}>{formatCurrency(item.amount,currencySymbol)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ display:'flex', justifyContent:'flex-end', padding:'16px 20px', borderTop:'1px solid var(--border-subtle)' }}>
          <div style={{ width:'260px', display:'flex', flexDirection:'column', gap:'6px' }}>
            {[['Subtotal',inv.subtotal],['Tax',inv.taxAmount]].map(([l,v])=>(
              <div key={l} style={{ display:'flex', justifyContent:'space-between', fontSize:'13px', color:'var(--text-secondary)' }}>
                <span>{l}</span><span>{formatCurrency(v,currencySymbol)}</span>
              </div>
            ))}
            {inv.discountAmount > 0 && (
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:'13px', color:'#f87171' }}>
                <span>Discount</span><span>-{formatCurrency(inv.discountAmount,currencySymbol)}</span>
              </div>
            )}
            <div style={{ height:'1px', background:'var(--border-default)', margin:'4px 0' }}/>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:'16px', fontWeight:700, color:'var(--primary)' }}>
              <span>Total</span><span>{formatCurrency(inv.totalAmount,currencySymbol)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes & Terms */}
      {(inv.notes||inv.terms) && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
          {inv.notes && <div className="card" style={{ padding:'16px' }}><h3 style={{ margin:'0 0 8px', fontSize:'12px', fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em' }}>Notes</h3><p style={{ fontSize:'13px', color:'var(--text-secondary)', lineHeight:1.6, margin:0 }}>{inv.notes}</p></div>}
          {inv.terms && <div className="card" style={{ padding:'16px' }}><h3 style={{ margin:'0 0 8px', fontSize:'12px', fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em' }}>Terms</h3><p style={{ fontSize:'13px', color:'var(--text-secondary)', lineHeight:1.6, margin:0 }}>{inv.terms}</p></div>}
        </div>
      )}

      {/* Payments */}
      <div className="card" style={{ overflow:'hidden' }}>
        <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--border-subtle)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <h3 style={{ margin:0, fontSize:'13px', fontWeight:700, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'0.06em' }}>Payments ({inv.payments?.length||0})</h3>
          {can('invoicing','edit') && inv.balanceAmount > 0 && inv.status !== 'CANCELLED' && (
            <button className="btn-primary btn-sm" onClick={()=>setPayModal(true)}><CreditCard size={12}/> Add</button>
          )}
        </div>
        {!inv.payments?.length ? (
          <div style={{ padding:'24px', textAlign:'center', color:'var(--text-muted)', fontSize:'13px' }}>No payments recorded yet.</div>
        ) : (
          <table className="data-table">
            <thead><tr><th>Date</th><th>Method</th><th>Reference</th><th>Amount</th><th></th></tr></thead>
            <tbody>
              {inv.payments.map(p=>(
                <tr key={p.id}>
                  <td style={{ color:'var(--text-secondary)' }}>{formatDate(p.paymentDate)}</td>
                  <td><span className="badge badge-success">{p.method?.replace(/_/g,' ')}</span></td>
                  <td style={{ color:'var(--text-muted)', fontFamily:'monospace', fontSize:'12px' }}>{p.reference||'—'}</td>
                  <td style={{ fontWeight:600, color:'#4ade80' }}>{formatCurrency(p.amount,currencySymbol)}</td>
                  <td>{can('invoicing','delete') && <button onClick={()=>deletePayMutation.mutate(p.id)} className="btn-ghost btn-icon" style={{ color:'var(--danger)' }}><Trash2 size={13}/></button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Credit Notes */}
      {creditNotes?.length > 0 && (
        <div className="card" style={{ overflow:'hidden' }}>
          <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--border-subtle)' }}>
            <h3 style={{ margin:0, fontSize:'13px', fontWeight:700, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'0.06em' }}>Credit Notes ({creditNotes.length})</h3>
          </div>
          <table className="data-table">
            <thead><tr><th>Credit Note #</th><th>Date</th><th>Amount</th><th>Reason</th><th>Sent</th></tr></thead>
            <tbody>
              {creditNotes.map(cn=>(
                <tr key={cn.id}>
                  <td style={{ fontFamily:'monospace', fontSize:'12px', fontWeight:600, color:'#4ade80' }}>{cn.creditNoteNumber}</td>
                  <td style={{ color:'var(--text-secondary)' }}>{formatDate(cn.date)}</td>
                  <td style={{ fontWeight:600, color:'#4ade80' }}>{formatCurrency(cn.amount,currencySymbol)}</td>
                  <td style={{ color:'var(--text-muted)', fontSize:'12px' }}>{cn.reason||'—'}</td>
                  <td>{cn.sentAt ? <span className="badge badge-success">Sent</span> : <span className="badge badge-neutral">Not sent</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <PaymentModal    open={payModal}    onClose={()=>setPayModal(false)}    invoice={inv} currencySymbol={currencySymbol}/>
      <CreditNoteModal open={creditModal} onClose={()=>setCreditModal(false)} invoice={inv} currencySymbol={currencySymbol}/>
      <ConfirmDialog   open={cancelConfirm} onClose={()=>setCancelConfirm(false)} onConfirm={()=>cancelMutation.mutate()} loading={cancelMutation.isPending} title="Cancel Invoice" description="Cancel this invoice? Cannot be undone." confirmLabel="Cancel Invoice" danger/>
    </div>
  );
}

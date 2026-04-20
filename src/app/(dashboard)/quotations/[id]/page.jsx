'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { quotationsApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader, Modal, FormField, Spinner, ConfirmDialog } from '@/components/ui/index.jsx';
import { formatCurrency, formatDate, QUOTATION_STATUS } from '@/lib/utils';
import { ArrowLeft, Send, ArrowRight, Trash2, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function QuotationDetailPage({ params }) {
  const router = useRouter();
  const { currencySymbol, can } = useAuth();
  const qc = useQueryClient();
  const [convertModal,  setConvertModal]  = useState(false);
  const [dueDate,       setDueDate]       = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['quotation', params.id],
    queryFn:  () => quotationsApi.get(params.id).then(r=>r.data.data),
  });

  const sendM = useMutation({
    mutationFn: () => quotationsApi.send(params.id),
    onSuccess: () => { toast.success('Quotation sent!'); qc.invalidateQueries({ queryKey:['quotation', params.id] }); },
    onError:   (err) => toast.error(err.response?.data?.message || 'Failed to send.'),
  });

  const statusM = useMutation({
    mutationFn: (status) => quotationsApi.updateStatus(params.id, { status }),
    onSuccess: () => { toast.success('Status updated.'); qc.invalidateQueries({ queryKey:['quotation', params.id] }); },
    onError:   (err) => toast.error(err.response?.data?.message || 'Failed.'),
  });

  const convertM = useMutation({
    mutationFn: () => quotationsApi.convertToInvoice(params.id, { dueDate: dueDate || undefined }),
    onSuccess: (res) => { toast.success('Converted to invoice!'); router.push(`/invoices/${res.data.data.id}`); },
    onError:   (err) => toast.error(err.response?.data?.message || 'Conversion failed.'),
  });

  const deleteM = useMutation({
    mutationFn: () => quotationsApi.delete(params.id),
    onSuccess: () => { toast.success('Deleted.'); router.push('/quotations'); },
    onError:   (err) => toast.error(err.response?.data?.message || 'Failed to delete.'),
  });

  if (isLoading) return <div style={{ display:'flex', justifyContent:'center', padding:'60px' }}><Spinner size={28}/></div>;
  const q = data;
  if (!q) return <div style={{ color:'var(--danger)' }}>Quotation not found.</div>;

  const cfg = QUOTATION_STATUS[q.status];

  return (
    <div style={{ maxWidth:'900px', display:'flex', flexDirection:'column', gap:'20px' }}>
      <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
        <Link href="/quotations" className="btn-ghost btn-icon"><ArrowLeft size={16}/></Link>
        <div style={{ flex:1 }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            <h1 className="font-display" style={{ fontSize:'22px', fontWeight:700, color:'var(--text-primary)', margin:0 }}>{q.quotationNumber}</h1>
            {cfg && <span className={`badge ${cfg.class}`}>{cfg.label}</span>}
          </div>
          <p style={{ color:'var(--text-secondary)', fontSize:'13px', margin:0 }}>{q.client?.name}</p>
        </div>
        <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
          {can('quotations','edit') && !['CONVERTED','REJECTED','EXPIRED'].includes(q.status) && (
            <button className="btn-secondary" onClick={() => sendM.mutate()} disabled={sendM.isPending}>
              {sendM.isPending ? <Spinner size={13}/> : ['SENT','VIEWED','APPROVED'].includes(q.status) ? <RefreshCw size={13}/> : <Send size={13}/>}
              {['SENT','VIEWED','APPROVED'].includes(q.status) ? ' Resend' : ' Send'}
            </button>
          )}
          {can('quotations','edit') && q.status === 'SENT' && (
            <>
              <button className="btn-primary" onClick={() => statusM.mutate('APPROVED')} disabled={statusM.isPending}><CheckCircle size={13}/> Approve</button>
              <button className="btn-danger" onClick={() => statusM.mutate('REJECTED')}  disabled={statusM.isPending}><XCircle size={13}/> Reject</button>
            </>
          )}
          {can('invoicing','create') && q.status === 'APPROVED' && (
            <button className="btn-primary" onClick={() => setConvertModal(true)}><ArrowRight size={13}/> Convert to Invoice</button>
          )}
          {can('quotations','delete') && !['CONVERTED'].includes(q.status) && (
            <button className="btn-danger btn-icon" onClick={() => setDeleteConfirm(true)} title="Delete"><Trash2 size={14}/></button>
          )}
        </div>
      </div>

      {/* Info */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
        <div className="card" style={{ padding:'20px' }}>
          <h3 style={{ margin:'0 0 12px', fontSize:'12px', fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em' }}>Quotation Info</h3>
          {[['Date', formatDate(q.date)], ['Valid Until', formatDate(q.validUntil)], ['Converted Invoice', q.invoice?.invoiceNumber || '—']].map(([label,val]) => (
            <div key={label} style={{ display:'flex', justifyContent:'space-between', padding:'7px 0', borderBottom:'1px solid var(--border-subtle)', fontSize:'13px' }}>
              <span style={{ color:'var(--text-muted)' }}>{label}</span>
              <span style={{ color:'var(--text-primary)', fontWeight:500 }}>{val}</span>
            </div>
          ))}
        </div>
        <div className="card" style={{ padding:'20px' }}>
          <h3 style={{ margin:'0 0 12px', fontSize:'12px', fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em' }}>Quote To</h3>
          <p style={{ fontWeight:600, fontSize:'15px', color:'var(--text-primary)', margin:'0 0 4px' }}>{q.client?.name}</p>
          {q.client?.email && <p style={{ fontSize:'13px', color:'var(--text-secondary)', margin:0 }}>{q.client.email}</p>}
          {q.client?.phone && <p style={{ fontSize:'13px', color:'var(--text-secondary)', margin:0 }}>{q.client.phone}</p>}
          {q.client?.gstin && <p style={{ fontSize:'12px', color:'var(--text-muted)', fontFamily:'monospace', margin:'4px 0 0' }}>GSTIN: {q.client.gstin}</p>}
        </div>
      </div>

      {/* Items */}
      <div className="card" style={{ overflow:'hidden' }}>
        <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--border-subtle)' }}>
          <h3 style={{ margin:0, fontSize:'13px', fontWeight:700, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'0.06em' }}>Items</h3>
        </div>
        <table className="data-table">
          <thead><tr><th>#</th><th>Description</th><th>Qty</th><th>Price</th><th>Tax</th><th style={{ textAlign:'right' }}>Amount</th></tr></thead>
          <tbody>
            {q.items?.map((item, idx) => (
              <tr key={item.id}>
                <td style={{ color:'var(--text-muted)' }}>{idx+1}</td>
                <td style={{ fontWeight:500 }}>{item.description}</td>
                <td>{item.quantity} {item.unit && <span style={{ color:'var(--text-muted)', fontSize:'12px' }}>{item.unit}</span>}</td>
                <td>{formatCurrency(item.unitPrice, currencySymbol)}</td>
                <td><span className="badge badge-neutral">{item.taxRate}%</span></td>
                <td style={{ textAlign:'right', fontWeight:600 }}>{formatCurrency(item.amount, currencySymbol)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ display:'flex', justifyContent:'flex-end', padding:'16px 20px', borderTop:'1px solid var(--border-subtle)' }}>
          <div style={{ width:'240px', display:'flex', flexDirection:'column', gap:'6px' }}>
            {[['Subtotal', q.subtotal], ['Tax', q.taxAmount]].map(([l,v]) => (
              <div key={l} style={{ display:'flex', justifyContent:'space-between', fontSize:'13px', color:'var(--text-secondary)' }}>
                <span>{l}</span><span>{formatCurrency(v, currencySymbol)}</span>
              </div>
            ))}
            <div style={{ height:'1px', background:'var(--border-default)', margin:'4px 0' }}/>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:'16px', fontWeight:700, color:'var(--primary)' }}>
              <span>Total</span><span>{formatCurrency(q.totalAmount, currencySymbol)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Convert Modal */}
      <Modal open={convertModal} onClose={() => setConvertModal(false)} title="Convert to Invoice"
        footer={<>
          <button className="btn-secondary" onClick={() => setConvertModal(false)}>Cancel</button>
          <button className="btn-primary" onClick={() => convertM.mutate()} disabled={convertM.isPending}>
            {convertM.isPending ? <><Spinner size={13}/> Converting…</> : <><ArrowRight size={13}/> Convert</>}
          </button>
        </>}>
        <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
          <p style={{ fontSize:'14px', color:'var(--text-secondary)', margin:0 }}>This will create a new draft invoice with all line items from this quotation.</p>
          <FormField label="Invoice Due Date (optional)">
            <input type="date" className="input" value={dueDate} onChange={e=>setDueDate(e.target.value)}/>
          </FormField>
        </div>
      </Modal>

      <ConfirmDialog open={deleteConfirm} onClose={() => setDeleteConfirm(false)}
        onConfirm={() => deleteM.mutate()} loading={deleteM.isPending}
        title="Delete Quotation" description="This will permanently delete the quotation." confirmLabel="Delete" danger/>
    </div>
  );
}

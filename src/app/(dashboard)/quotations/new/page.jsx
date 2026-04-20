'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { quotationsApi, settingsApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader, FormField, Spinner } from '@/components/ui/index.jsx';
import ClientSelect from '@/components/shared/ClientSelect';
import LineItemsEditor, { parseItem } from '@/components/shared/LineItemsEditor';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

const emptyItem = () => ({ id: Date.now(), description:'', quantity:1, unit:'', unitPrice:0, taxRate:18, discountRate:0 });

export default function NewQuotationPage() {
  const router = useRouter();
  const { currencySymbol } = useAuth();

  const [client,        setClient]        = useState(null);
  const [items,         setItems]         = useState([emptyItem()]);
  const [date,          setDate]          = useState(new Date().toISOString().split('T')[0]);
  const [validUntil,    setValidUntil]    = useState('');
  const [notes,         setNotes]         = useState('');
  const [terms,         setTerms]         = useState('');
  const [discountType,  setDiscountType]  = useState('PERCENT');
  const [discountValue, setDiscountValue] = useState(0);
  const [errors,        setErrors]        = useState({});

  const { data: taxData } = useQuery({ queryKey:['taxes'], queryFn: () => settingsApi.listTaxes().then(r=>r.data.data) });

  const mutation = useMutation({
    mutationFn: (data) => quotationsApi.create(data),
    onSuccess:  (res)  => { toast.success('Quotation created!'); router.push(`/quotations/${res.data.data.id}`); },
    onError:    (err)  => toast.error(err.response?.data?.message || 'Failed to create quotation.'),
  });

  const validate = () => {
    const e = {};
    if (!client) e.client = 'Please select a client';
    if (!items.length || items.some(i => !i.description.trim())) e.items = 'All items need a description';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    mutation.mutate({
      clientId:     client.id,
      date,
      validUntil:   validUntil || undefined,
      items:        items.map(parseItem),   // ── coerce all numerics ──
      discountType,
      discountValue:parseFloat(discountValue) || 0,
      notes:        notes  || undefined,
      terms:        terms  || undefined,
    });
  };

  const taxOptions = taxData?.map(t => ({ name: t.name, rate: t.rate })) || [];
  const inp = { background:'var(--bg-surface)', border:'1px solid var(--border-default)', borderRadius:'8px', padding:'8px 12px', fontSize:'14px', color:'var(--text-primary)', width:'100%', fontFamily:'inherit', outline:'none' };
  const lbl = { fontSize:'11px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--text-secondary)', display:'block', marginBottom:'6px' };

  return (
    <div style={{ maxWidth:'960px' }}>
      <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'24px' }}>
        <Link href="/quotations" className="btn-ghost btn-icon"><ArrowLeft size={16}/></Link>
        <PageHeader title="New Quotation" subtitle="Create a quotation to send to a client" />
      </div>

      <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
        <div className="card" style={{ padding:'24px' }}>
          <h3 style={{ margin:'0 0 18px', fontSize:'13px', fontWeight:700, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'0.06em' }}>Quotation Details</h3>
          <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr', gap:'16px' }}>
            <div>
              <label style={lbl}>Client *</label>
              <ClientSelect value={client} onChange={setClient} error={errors.client} />
              {errors.client && <p style={{ marginTop:'6px', fontSize:'12px', color:'var(--danger)' }}>{errors.client}</p>}
            </div>
            <div><label style={lbl}>Quote Date</label><input type="date" value={date} onChange={e=>setDate(e.target.value)} style={inp}/></div>
            <div><label style={lbl}>Valid Until</label><input type="date" value={validUntil} onChange={e=>setValidUntil(e.target.value)} style={inp}/></div>
          </div>
        </div>

        <div className="card" style={{ padding:'24px' }}>
          <h3 style={{ margin:'0 0 18px', fontSize:'13px', fontWeight:700, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'0.06em' }}>Line Items</h3>
          <LineItemsEditor items={items} onChange={setItems} currencySymbol={currencySymbol} taxOptions={taxOptions} />
          {errors.items && <p style={{ marginTop:'8px', fontSize:'12px', color:'var(--danger)' }}>{errors.items}</p>}
          <div style={{ display:'flex', gap:'12px', marginTop:'16px', alignItems:'flex-end' }}>
            <div>
              <label style={lbl}>Discount Type</label>
              <select value={discountType} onChange={e=>setDiscountType(e.target.value)} className="input" style={{ width:'140px' }}>
                <option value="PERCENT">Percent (%)</option>
                <option value="FIXED">Fixed Amount</option>
              </select>
            </div>
            <div>
              <label style={lbl}>Discount Value</label>
              <input type="number" min="0" value={discountValue} onChange={e=>setDiscountValue(e.target.value)} className="input" style={{ width:'120px' }}/>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding:'24px' }}>
          <h3 style={{ margin:'0 0 18px', fontSize:'13px', fontWeight:700, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'0.06em' }}>Notes & Terms</h3>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
            <FormField label="Customer Notes">
              <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={4} className="input" placeholder="Notes visible to client…" style={{ resize:'vertical' }}/>
            </FormField>
            <FormField label="Terms & Conditions">
              <textarea value={terms} onChange={e=>setTerms(e.target.value)} rows={4} className="input" placeholder="Payment terms, validity…" style={{ resize:'vertical' }}/>
            </FormField>
          </div>
        </div>

        <div style={{ display:'flex', gap:'10px', justifyContent:'flex-end' }}>
          <Link href="/quotations" className="btn-secondary">Cancel</Link>
          <button type="submit" disabled={mutation.isPending} className="btn-primary">
            {mutation.isPending ? <><Spinner size={14}/> Creating…</> : <><Save size={14}/> Create Quotation</>}
          </button>
        </div>
      </form>
    </div>
  );
}

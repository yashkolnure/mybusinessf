'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation } from '@tanstack/react-query';
import { clientsApi } from '@/lib/api';
import { PageHeader, FormField, Spinner } from '@/components/ui/index.jsx';
import { Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

// Strip empty strings and coerce numeric fields before sending to API
const sanitizeClientData = (data) => {
  const d = { ...data };
  // Coerce numeric fields
  d.creditLimit = parseFloat(d.creditLimit) || 0;
  // Remove empty optional strings so Prisma doesn't try to save ""
  const optionals = ['company','email','phone','alternatePhone','gstin','pan','website',
    'billingAddress','billingCity','billingState','billingPincode',
    'shippingAddress','shippingCity','shippingState','shippingPincode','notes'];
  optionals.forEach(k => { if (d[k] === '' || d[k] === null) d[k] = undefined; });
  return d;
};

export default function ClientForm({ params }) {
  const router  = useRouter();
  const isEdit  = !!params?.id;
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { creditLimit: 0 }
  });

  const { data: existing, isLoading } = useQuery({
    queryKey: ['client', params?.id],
    queryFn:  () => clientsApi.get(params.id).then((r) => r.data.data),
    enabled:  isEdit,
  });

  useEffect(() => { if (existing) reset(existing); }, [existing, reset]);

  const mutation = useMutation({
    mutationFn: (data) => isEdit
      ? clientsApi.update(params.id, sanitizeClientData(data))
      : clientsApi.create(sanitizeClientData(data)),
    onSuccess: () => {
      toast.success(isEdit ? 'Client updated.' : 'Client created.');
      router.push('/clients');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to save client.'),
  });

  if (isEdit && isLoading) return (
    <div style={{ display:'flex', justifyContent:'center', padding:'60px' }}>
      <Spinner size={28}/>
    </div>
  );

  const F = ({ name, label, opts = {} }) => (
    <FormField label={label} error={errors[name]?.message} required={opts.required}>
      <input
        {...register(name, opts.rules || {})}
        placeholder={opts.placeholder || ''}
        type={opts.type || 'text'}
        className={`input${errors[name] ? ' input-error' : ''}`}
      />
    </FormField>
  );

  return (
    <div style={{ maxWidth:'860px' }}>
      <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'24px' }}>
        <Link href="/clients" className="btn-ghost btn-icon"><ArrowLeft size={16}/></Link>
        <PageHeader
          title={isEdit ? 'Edit Client' : 'New Client'}
          subtitle={isEdit ? existing?.name : 'Add a new client to your CRM'}
        />
      </div>

      <form onSubmit={handleSubmit((d) => mutation.mutate(d))}>
        <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>

          <div className="card" style={{ padding:'24px' }}>
            <h3 style={{ margin:'0 0 18px', fontSize:'13px', fontWeight:700, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'0.06em' }}>Basic Information</h3>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
              <F name="name"    label="Client Name *"  opts={{ required:true, rules:{ required:'Name is required' }, placeholder:'John Doe / Acme Ltd' }}/>
              <F name="company" label="Company Name"   opts={{ placeholder:'Company Pvt Ltd' }}/>
              <F name="email"   label="Email Address"  opts={{ type:'email', placeholder:'billing@company.com' }}/>
              <F name="phone"   label="Phone"          opts={{ placeholder:'+91 98765 43210' }}/>
              <F name="alternatePhone" label="Alternate Phone"/>
              <F name="gstin"   label="GSTIN"          opts={{ placeholder:'27AADCB2230M1ZT' }}/>
              <F name="pan"     label="PAN"            opts={{ placeholder:'AADCB2230M' }}/>
              <FormField label="Credit Limit">
                <input
                  {...register('creditLimit')}
                  type="number" min="0" step="0.01"
                  className="input"
                  placeholder="0"
                />
              </FormField>
            </div>
            <div style={{ marginTop:'16px' }}>
              <FormField label="Notes">
                <textarea {...register('notes')} rows={3} className="input"
                  placeholder="Internal notes about this client…" style={{ resize:'vertical' }}/>
              </FormField>
            </div>
          </div>

          <div className="card" style={{ padding:'24px' }}>
            <h3 style={{ margin:'0 0 18px', fontSize:'13px', fontWeight:700, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'0.06em' }}>Billing Address</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
              <FormField label="Street Address">
                <input {...register('billingAddress')} className="input" placeholder="Plot 42, MG Road"/>
              </FormField>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'16px' }}>
                <F name="billingCity"    label="City"    opts={{ placeholder:'Pune' }}/>
                <F name="billingState"   label="State"   opts={{ placeholder:'Maharashtra' }}/>
                <F name="billingPincode" label="Pincode" opts={{ placeholder:'411001' }}/>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding:'24px' }}>
            <h3 style={{ margin:'0 0 18px', fontSize:'13px', fontWeight:700, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'0.06em' }}>
              Shipping Address <span style={{ color:'var(--text-muted)', fontSize:'12px', fontWeight:400 }}>(if different)</span>
            </h3>
            <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
              <FormField label="Street Address">
                <input {...register('shippingAddress')} className="input" placeholder="Shipping street address"/>
              </FormField>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'16px' }}>
                <F name="shippingCity"    label="City"/>
                <F name="shippingState"   label="State"/>
                <F name="shippingPincode" label="Pincode"/>
              </div>
            </div>
          </div>

          <div style={{ display:'flex', gap:'10px', justifyContent:'flex-end' }}>
            <Link href="/clients" className="btn-secondary">Cancel</Link>
            <button type="submit" disabled={isSubmitting || mutation.isPending} className="btn-primary">
              {(isSubmitting || mutation.isPending)
                ? <><Spinner size={14}/> Saving…</>
                : <><Save size={14}/> {isEdit ? 'Update Client' : 'Create Client'}</>}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

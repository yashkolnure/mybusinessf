'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation } from '@tanstack/react-query';
import { workforceApi } from '@/lib/api';
import { PageHeader, FormField, Spinner } from '@/components/ui/index.jsx';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function EditEmployeePage({ params }) {
  const router = useRouter();
  const { register, handleSubmit, reset } = useForm();

  const { data: emp, isLoading } = useQuery({
    queryKey: ['employee', params.id],
    queryFn:  () => workforceApi.getEmployee(params.id).then(r => r.data.data),
  });

  useEffect(() => {
    if (emp) reset({ ...emp, dateOfJoining: emp.dateOfJoining?.split('T')[0] || '', dateOfBirth: emp.dateOfBirth?.split('T')[0] || '' });
  }, [emp, reset]);

  const mutation = useMutation({
    mutationFn: (data) => {
      const d = { ...data };
      d.baseSalary = parseFloat(d.baseSalary) || 0;
      if (!d.dateOfJoining) delete d.dateOfJoining;
      if (!d.dateOfBirth)   delete d.dateOfBirth;
      return workforceApi.updateEmployee(params.id, d);
    },
    onSuccess: () => { toast.success('Employee updated.'); router.push(`/workforce/employees/${params.id}`); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed.'),
  });

  if (isLoading) return <div style={{ display:'flex', justifyContent:'center', padding:'60px' }}><Spinner size={28}/></div>;

  return (
    <div style={{ maxWidth:'860px' }}>
      <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'24px' }}>
        <Link href={`/workforce/employees/${params.id}`} className="btn-ghost btn-icon"><ArrowLeft size={16}/></Link>
        <PageHeader title="Edit Employee" subtitle={emp?.name}/>
      </div>
      <form onSubmit={handleSubmit(d => mutation.mutate(d))}>
        <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
          <div className="card" style={{ padding:'24px' }}>
            <h3 style={{ margin:'0 0 18px', fontSize:'13px', fontWeight:700, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'0.06em' }}>Personal Info</h3>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
              {[['name','Full Name'],['email','Email'],['phone','Phone'],['employeeCode','Employee Code'],['gender','Gender'],['emergencyContact','Emergency Contact'],['address','Address']].map(([k,l])=>(
                <FormField key={k} label={l}><input {...register(k)} className="input" /></FormField>
              ))}
              <FormField label="Date of Joining"><input {...register('dateOfJoining')} type="date" className="input"/></FormField>
              <FormField label="Date of Birth"><input {...register('dateOfBirth')} type="date" className="input"/></FormField>
            </div>
          </div>
          <div className="card" style={{ padding:'24px' }}>
            <h3 style={{ margin:'0 0 18px', fontSize:'13px', fontWeight:700, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'0.06em' }}>Employment</h3>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
              {[['department','Department'],['designation','Designation']].map(([k,l])=>(
                <FormField key={k} label={l}><input {...register(k)} className="input"/></FormField>
              ))}
              <FormField label="Employment Type">
                <select {...register('employmentType')} className="input">
                  <option value="FULL_TIME">Full Time</option>
                  <option value="PART_TIME">Part Time</option>
                  <option value="CONTRACT">Contract</option>
                </select>
              </FormField>
              <FormField label="Base Salary"><input {...register('baseSalary')} type="number" min="0" step="0.01" className="input"/></FormField>
            </div>
          </div>
          <div className="card" style={{ padding:'24px' }}>
            <h3 style={{ margin:'0 0 18px', fontSize:'13px', fontWeight:700, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'0.06em' }}>Banking</h3>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
              {[['bankName','Bank Name'],['bankAccountNo','Account No'],['ifscCode','IFSC Code'],['panNumber','PAN']].map(([k,l])=>(
                <FormField key={k} label={l}><input {...register(k)} className="input"/></FormField>
              ))}
            </div>
          </div>
          <div style={{ display:'flex', gap:'10px', justifyContent:'flex-end' }}>
            <Link href={`/workforce/employees/${params.id}`} className="btn-secondary">Cancel</Link>
            <button type="submit" disabled={mutation.isPending} className="btn-primary">
              {mutation.isPending ? <><Spinner size={14}/> Saving…</> : <><Save size={14}/> Update</>}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

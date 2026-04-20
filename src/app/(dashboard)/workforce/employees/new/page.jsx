'use client';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { workforceApi } from '@/lib/api';
import { PageHeader, FormField, Spinner } from '@/components/ui/index.jsx';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function NewEmployeePage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: { baseSalary: 0, employmentType: 'FULL_TIME' } });

  const mutation = useMutation({
    mutationFn: (data) => {
      const d = { ...data };
      d.baseSalary = parseFloat(d.baseSalary) || 0;
      if (!d.dateOfJoining) delete d.dateOfJoining;
      if (!d.dateOfBirth)   delete d.dateOfBirth;
      return workforceApi.createEmployee(d);
    },
    onSuccess: (res) => { toast.success('Employee created.'); router.push(`/workforce/employees/${res.data.data.id}`); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to create employee.'),
  });

  const F = ({ name, label, opts = {} }) => (
    <FormField label={label} error={errors[name]?.message} required={opts.required}>
      <input {...register(name, opts.rules || {})} type={opts.type || 'text'} placeholder={opts.placeholder || ''}
        className={`input${errors[name] ? ' input-error' : ''}`} />
    </FormField>
  );

  return (
    <div style={{ maxWidth: '860px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <Link href="/workforce" className="btn-ghost btn-icon"><ArrowLeft size={16} /></Link>
        <PageHeader title="New Employee" subtitle="Add a team member to your workforce" />
      </div>

      <form onSubmit={handleSubmit(d => mutation.mutate(d))}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ margin: '0 0 18px', fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Personal Info</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <F name="name"          label="Full Name *"   opts={{ required: true, rules: { required: 'Name required' } }} />
              <F name="email"         label="Email"         opts={{ type: 'email' }} />
              <F name="phone"         label="Phone" />
              <F name="employeeCode"  label="Employee Code" opts={{ placeholder: 'EMP-001' }} />
              <FormField label="Date of Joining">
                <input {...register('dateOfJoining')} type="date" className="input" />
              </FormField>
              <FormField label="Date of Birth">
                <input {...register('dateOfBirth')} type="date" className="input" />
              </FormField>
              <F name="gender" label="Gender" />
              <F name="emergencyContact" label="Emergency Contact" />
            </div>
          </div>

          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ margin: '0 0 18px', fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Employment Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <F name="department"  label="Department"  opts={{ placeholder: 'Engineering' }} />
              <F name="designation" label="Designation" opts={{ placeholder: 'Senior Developer' }} />
              <FormField label="Employment Type">
                <select {...register('employmentType')} className="input">
                  <option value="FULL_TIME">Full Time</option>
                  <option value="PART_TIME">Part Time</option>
                  <option value="CONTRACT">Contract</option>
                </select>
              </FormField>
              <FormField label="Base Salary">
                <input {...register('baseSalary')} type="number" min="0" step="0.01" className="input" placeholder="0" />
              </FormField>
            </div>
          </div>

          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ margin: '0 0 18px', fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Banking & Tax</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <F name="bankName"      label="Bank Name" />
              <F name="bankAccountNo" label="Account Number" />
              <F name="ifscCode"      label="IFSC Code" />
              <F name="panNumber"     label="PAN Number" />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <Link href="/workforce" className="btn-secondary">Cancel</Link>
            <button type="submit" disabled={mutation.isPending} className="btn-primary">
              {mutation.isPending ? <><Spinner size={14} /> Creating…</> : <><Save size={14} /> Create Employee</>}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

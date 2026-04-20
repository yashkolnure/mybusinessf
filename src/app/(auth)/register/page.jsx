'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building2, Phone, Mail, User, MessageSquare, AlertCircle, Send } from 'lucide-react';

const schema = z.object({
  businessName: z.string().min(2, 'Business name is required'),
  name:         z.string().min(2, 'Full name is required'),
  email:        z.string().email('Enter a valid email'),
  phone:        z.string().min(10, 'Enter a valid contact number'),
  message:      z.string().optional(),
});

export default function WhatsAppCallbackPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data) => {
    const MY_PHONE = "918767640530"; 
    
    const text = `*NEW CALLBACK REQUEST*%0A%0A` +
                 `*Business:* ${data.businessName}%0A` +
                 `*Name:* ${data.name}%0A` +
                 `*Email:* ${data.email}%0A` +
                 `*Phone:* ${data.phone}%0A` +
                 `*Message:* ${data.message || 'No message provided'}`;

    const whatsappUrl = `https://wa.me/${MY_PHONE}?text=${text}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="space-y-7">
      {/* Header - Matches Login Style */}
      <div className="space-y-1">
        <h1 className="font-display text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Request a call
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Leave your details to connect with us on WhatsApp
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        
        {/* Business Name */}
        <div>
          <label className="label flex items-center gap-2">
            Business Name
          </label>
          <input
            {...register('businessName')}
            placeholder="Acme Technologies Pvt Ltd"
            className={`input ${errors.businessName ? 'input-error' : ''}`}
          />
          {errors.businessName && (
            <p className="mt-1.5 text-xs flex items-center gap-1" style={{ color: 'var(--danger)' }}>
              <AlertCircle size={11} /> {errors.businessName.message}
            </p>
          )}
        </div>

        {/* Full Name */}
        <div>
          <label className="label flex items-center gap-2">
            Your Full Name
          </label>
          <input
            {...register('name')}
            placeholder="Rahul Sharma"
            className={`input ${errors.name ? 'input-error' : ''}`}
          />
          {errors.name && (
            <p className="mt-1.5 text-xs flex items-center gap-1" style={{ color: 'var(--danger)' }}>
              <AlertCircle size={11} /> {errors.name.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="label flex items-center gap-2">
          Email Address
          </label>
          <input
            {...register('email')}
            type="email"
            placeholder="you@company.com"
            className={`input ${errors.email ? 'input-error' : ''}`}
          />
          {errors.email && (
            <p className="mt-1.5 text-xs flex items-center gap-1" style={{ color: 'var(--danger)' }}>
              <AlertCircle size={11} /> {errors.email.message}
            </p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="label flex items-center gap-2">
           Phone Number
          </label>
          <input
            {...register('phone')}
            placeholder="8767640530"
            className={`input ${errors.phone ? 'input-error' : ''}`}
          />
          {errors.phone && (
            <p className="mt-1.5 text-xs flex items-center gap-1" style={{ color: 'var(--danger)' }}>
              <AlertCircle size={11} /> {errors.phone.message}
            </p>
          )}
        </div>

        {/* Message */}
        <div>
          <label className="label flex items-center gap-2">
            How can we help?
          </label>
          <textarea
            {...register('message')}
            placeholder="Tell us about your requirements..."
            className="input min-h-[100px] py-3 resize-none"
          />
        </div>

        {/* Submit Button - Styled like the Login Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary btn-lg w-full mt-2"
        >
          <span className="flex items-center gap-2">
            <Send size={15} /> {isSubmitting ? 'Redirecting...' : 'Connect on WhatsApp'}
          </span>
        </button>
      </form>

      {/* Support Hint - Matches the Demo Credentials box style */}
      <div className="p-4 rounded-xl text-xs space-y-1"
           style={{ background: 'rgba(37, 211, 102, 0.06)', border: '1px solid rgba(37, 211, 102, 0.12)' }}>
        <p className="font-semibold" style={{ color: '#4ade80' }}>Direct Support</p>
        <p style={{ color: 'var(--text-secondary)' }}>
          Our team usually responds within 15-30 minutes on WhatsApp.
        </p>
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import FormField from '@/components/shared/FormField';
import { toast } from 'sonner';

const FEATURES = [
  { label: 'Enquiry to delivery', desc: 'Full pipeline visibility in one place' },
  { label: 'Real-time job tracking', desc: 'Status, owner, and payment at a glance' },
  { label: 'Team collaboration', desc: 'Roles for admins, managers, and designers' },
];

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await login(data);
      toast.success('Welcome back!');
      navigate('/', { replace: true });
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left dark panel */}
      <div
        className="hidden lg:flex flex-col w-[440px] flex-shrink-0 relative overflow-hidden"
        style={{ background: 'oklch(17% 0.015 70)' }}
      >
        {/* PCB image — bottom half, fading up */}
        <div className="absolute bottom-0 left-0 right-0" style={{ height: '55%' }}>
          <img
            src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80"
            alt="PCB"
            className="w-full h-full object-cover"
            style={{ opacity: 0.35 }}
          />
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to bottom, oklch(17% 0.015 70) 0%, oklch(17% 0.015 70 / 0.1) 100%)' }}
          />
        </div>

        {/* Dot grid — subtle texture */}
        <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.04 }} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="1.5" cy="1.5" r="1.5" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full p-10">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl" style={{ background: 'oklch(58% 0.13 55 / 0.18)' }}>
              <img src="/logo.png" alt="TTP" className="h-8 w-8 object-contain" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">TTP CRM</p>
              <p className="text-[11px]" style={{ color: 'oklch(72% 0.018 75)' }}>Tracetech PCB Design</p>
            </div>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Tagline */}
          <div>
            <h2 className="text-white font-extrabold leading-[1.15] tracking-[-0.03em]" style={{ fontSize: 32 }}>
              Precision in<br />every layer.
            </h2>
            {/* Copper accent rule */}
            <div className="mt-4 mb-5 h-[2px] w-10 rounded-full" style={{ background: 'oklch(58% 0.13 55)' }} />
            <p className="text-sm leading-relaxed" style={{ color: 'oklch(68% 0.014 75)' }}>
              Manage your PCB design pipeline<br />from first enquiry to final delivery.
            </p>
          </div>

          {/* Feature list */}
          <div className="mt-8 space-y-4">
            {FEATURES.map((f) => (
              <div key={f.label} className="flex items-start gap-3">
                <div
                  className="mt-1 rounded-full flex-shrink-0"
                  style={{ width: 6, height: 6, background: 'oklch(58% 0.13 55)', marginTop: 6 }}
                />
                <div>
                  <p className="text-white text-xs font-semibold">{f.label}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: 'oklch(58% 0.012 75)' }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom padding */}
          <div className="mt-10" />
        </div>
      </div>

      {/* Right light panel */}
      <div className="flex-1 flex items-center justify-center p-8" style={{ background: 'oklch(99.5% 0.006 75)' }}>
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 mb-8">
            <img src="/logo.png" alt="TTP" className="h-8 w-8 object-contain" />
            <div>
              <p className="font-bold text-sm text-brand-900">TTP CRM</p>
              <p className="text-xs text-brand-400">Tracetech PCB Design</p>
            </div>
          </div>

          <div className="mb-8">
            <h1 className="text-[26px] font-extrabold text-brand-900 tracking-[-0.04em]">Sign in</h1>
            <p className="text-sm text-brand-400 mt-1">Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField label="Username" required error={errors.username}>
              <Input
                placeholder="Enter username"
                autoComplete="username"
                error={errors.username}
                {...register('username', { required: 'Username is required' })}
              />
            </FormField>
            <FormField label="Password" required error={errors.password}>
              <Input
                type="password"
                placeholder="Enter password"
                autoComplete="current-password"
                error={errors.password}
                {...register('password', { required: 'Password is required' })}
              />
            </FormField>
            <Button type="submit" className="w-full mt-1" size="lg" loading={loading}>
              Sign In
            </Button>
          </form>

          <p className="text-center text-xs text-brand-300 mt-6">
            Default: admin / admin123
          </p>
        </div>
      </div>
    </div>
  );
}

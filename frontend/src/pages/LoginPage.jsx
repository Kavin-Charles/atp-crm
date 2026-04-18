import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import FormField from '@/components/shared/FormField';
import { toast } from 'sonner';
import { Cpu } from 'lucide-react';

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-brand-950 to-slate-900 p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-brand-900 rounded-2xl mb-4 shadow-lg">
            <Cpu className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">ATP CRM</h1>
          <p className="text-slate-400 text-sm mt-1">Tracetech PCB Design Services</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">Sign in to your account</h2>
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
            <Button type="submit" className="w-full mt-2" size="lg" loading={loading}>
              Sign In
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          Default: admin / admin123
        </p>
      </div>
    </div>
  );
}

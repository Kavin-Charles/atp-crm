import React from 'react';
import { cn } from '@/lib/utils';
import Spinner from './Spinner';

const variants = {
  primary:   'bg-brand-900 text-white hover:bg-brand-800 focus-visible:ring-brand-900',
  secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 focus-visible:ring-slate-400',
  danger:    'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600',
  ghost:     'text-slate-600 hover:bg-slate-100 focus-visible:ring-slate-400',
  success:   'bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-600',
};

const sizes = {
  sm:  'h-7 px-3 text-xs gap-1.5',
  md:  'h-9 px-4 text-sm gap-2',
  lg:  'h-10 px-5 text-sm gap-2',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className,
  children,
  ...props
}) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading && <Spinner size="sm" className="text-current" />}
      {children}
    </button>
  );
}

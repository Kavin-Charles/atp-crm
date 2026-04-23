import React from 'react';
import { cn } from '@/lib/utils';
import Spinner from './Spinner';

const variants = {
  primary:   'bg-brand-500 text-white hover:bg-brand-600 focus-visible:ring-brand-500 shadow-[0_1px_3px_oklch(58%_0.13_55/0.3)]',
  secondary: 'bg-white text-brand-800 border border-brand-200 hover:bg-brand-50 focus-visible:ring-brand-300 shadow-sm',
  danger:    'bg-red-500 text-white hover:bg-red-600 focus-visible:ring-red-500 shadow-sm',
  ghost:     'text-brand-700 hover:bg-brand-100 focus-visible:ring-brand-300',
  success:   'bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-500 shadow-sm',
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
        'inline-flex items-center justify-center rounded-[7px] font-semibold transition-all',
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

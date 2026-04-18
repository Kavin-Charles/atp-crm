import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const Select = forwardRef(function Select({ className, error, children, ...props }, ref) {
  return (
    <select
      ref={ref}
      className={cn(
        'w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900',
        'focus:outline-none focus:ring-2 focus:ring-brand-900/20 focus:border-brand-900',
        'disabled:bg-slate-50 disabled:cursor-not-allowed',
        error ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : 'border-slate-200',
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
});

export default Select;

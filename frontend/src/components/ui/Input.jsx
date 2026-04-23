import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const Input = forwardRef(function Input({ className, error, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        'w-full rounded-[8px] border bg-brand-50 px-3 py-[10px] text-sm text-brand-900 placeholder:text-brand-400',
        'focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors',
        'disabled:bg-brand-50 disabled:cursor-not-allowed',
        error ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : 'border-brand-200',
        className
      )}
      {...props}
    />
  );
});

export default Input;

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const Textarea = forwardRef(function Textarea({ className, error, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      rows={3}
      className={cn(
        'w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 resize-y',
        'focus:outline-none focus:ring-2 focus:ring-brand-900/20 focus:border-brand-900',
        'disabled:bg-slate-50 disabled:cursor-not-allowed',
        error ? 'border-red-400' : 'border-slate-200',
        className
      )}
      {...props}
    />
  );
});

export default Textarea;

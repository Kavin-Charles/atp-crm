import React from 'react';
import { cn } from '@/lib/utils';

export default function FormField({ label, required, error, children, className }) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label className="text-xs font-semibold text-brand-700">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      {children}
      {error && <p className="text-xs text-red-500">{error.message || error}</p>}
    </div>
  );
}

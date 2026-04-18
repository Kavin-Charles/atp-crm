import React from 'react';
import { cn } from '@/lib/utils';

const config = {
  new:         'bg-blue-50 text-blue-700 ring-blue-100',
  quoted:      'bg-purple-50 text-purple-700 ring-purple-100',
  pending:     'bg-amber-50 text-amber-700 ring-amber-100',
  approved:    'bg-emerald-50 text-emerald-700 ring-emerald-100',
  rejected:    'bg-red-50 text-red-700 ring-red-100',
  converted:   'bg-indigo-50 text-indigo-700 ring-indigo-100',
  'in progress': 'bg-blue-50 text-blue-700 ring-blue-100',
  completed:   'bg-emerald-50 text-emerald-700 ring-emerald-100',
  'on hold':   'bg-amber-50 text-amber-700 ring-amber-100',
  cancelled:   'bg-slate-100 text-slate-600 ring-slate-200',
  partial:     'bg-orange-50 text-orange-700 ring-orange-100',
  received:    'bg-emerald-50 text-emerald-700 ring-emerald-100',
  admin:       'bg-red-50 text-red-700 ring-red-100',
  manager:     'bg-indigo-50 text-indigo-700 ring-indigo-100',
  designer:    'bg-slate-100 text-slate-600 ring-slate-200',
};

export default function Badge({ status, className }) {
  const key = (status || '').toLowerCase();
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset capitalize',
        config[key] || 'bg-slate-100 text-slate-600 ring-slate-200',
        className
      )}
    >
      {status || '—'}
    </span>
  );
}

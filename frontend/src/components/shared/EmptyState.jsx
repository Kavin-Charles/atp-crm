import React from 'react';
import { InboxIcon } from 'lucide-react';

export default function EmptyState({ title = 'No records found', description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="p-4 bg-slate-100 rounded-2xl mb-4">
        <InboxIcon className="h-8 w-8 text-slate-400" />
      </div>
      <p className="text-sm font-semibold text-slate-700">{title}</p>
      {description && <p className="text-sm text-slate-400 mt-1 max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

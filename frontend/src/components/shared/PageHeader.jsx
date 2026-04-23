import React from 'react';

export default function PageHeader({ title, description, action }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <h1 className="text-[26px] font-extrabold text-brand-900 tracking-[-0.04em] leading-tight">{title}</h1>
        {description && <p className="mt-1 text-sm text-brand-400">{description}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

import React from 'react';

const config = {
  new:           { bg: 'oklch(94% 0.06 250)',  color: 'oklch(32% 0.1 250)',  dot: 'oklch(52% 0.14 250)' },
  quoted:        { bg: 'oklch(94% 0.06 290)',  color: 'oklch(32% 0.1 290)',  dot: 'oklch(52% 0.14 290)' },
  pending:       { bg: 'oklch(95% 0.06 80)',   color: 'oklch(36% 0.12 65)',  dot: 'oklch(58% 0.13 55)'  },
  approved:      { bg: 'oklch(94% 0.06 150)',  color: 'oklch(30% 0.1 150)',  dot: 'oklch(50% 0.13 150)' },
  rejected:      { bg: 'oklch(94% 0.06 20)',   color: 'oklch(34% 0.1 20)',   dot: 'oklch(52% 0.15 20)'  },
  converted:     { bg: 'oklch(94% 0.06 150)',  color: 'oklch(30% 0.1 150)',  dot: 'oklch(50% 0.13 150)' },
  'in progress': { bg: 'oklch(95% 0.06 80)',   color: 'oklch(36% 0.12 65)',  dot: 'oklch(58% 0.13 55)'  },
  completed:     { bg: 'oklch(94% 0.06 150)',  color: 'oklch(30% 0.1 150)',  dot: 'oklch(50% 0.13 150)' },
  'on hold':     { bg: 'oklch(95% 0.06 55)',   color: 'oklch(36% 0.12 55)',  dot: 'oklch(58% 0.13 55)'  },
  cancelled:     { bg: 'oklch(93% 0.008 75)',  color: 'oklch(38% 0.01 75)',  dot: 'oklch(55% 0.01 75)'  },
  partial:       { bg: 'oklch(95% 0.06 55)',   color: 'oklch(36% 0.12 55)',  dot: 'oklch(58% 0.13 55)'  },
  received:      { bg: 'oklch(94% 0.06 150)',  color: 'oklch(30% 0.1 150)',  dot: 'oklch(50% 0.13 150)' },
  contacted:     { bg: 'oklch(94% 0.06 250)',  color: 'oklch(32% 0.1 250)',  dot: 'oklch(52% 0.14 250)' },
  closed:        { bg: 'oklch(93% 0.008 75)',  color: 'oklch(38% 0.01 75)',  dot: 'oklch(55% 0.01 75)'  },
  admin:         { bg: 'oklch(94% 0.06 20)',   color: 'oklch(34% 0.1 20)',   dot: 'oklch(52% 0.15 20)'  },
  manager:       { bg: 'oklch(94% 0.06 250)',  color: 'oklch(32% 0.1 250)',  dot: 'oklch(52% 0.14 250)' },
  designer:      { bg: 'oklch(93% 0.008 75)',  color: 'oklch(38% 0.01 75)',  dot: 'oklch(55% 0.01 75)'  },
};

const fallback = { bg: 'oklch(93% 0.008 75)', color: 'oklch(38% 0.01 75)', dot: 'oklch(55% 0.01 75)' };

export default function Badge({ status, className }) {
  const key = (status || '').toLowerCase();
  const c = config[key] || fallback;
  return (
    <span
      style={{ background: c.bg, color: c.color }}
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize${className ? ` ${className}` : ''}`}
    >
      <span style={{ background: c.dot, width: 6, height: 6, borderRadius: '50%', flexShrink: 0, display: 'inline-block' }} />
      {status || '—'}
    </span>
  );
}

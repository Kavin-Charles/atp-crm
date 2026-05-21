import React from 'react';
import { Link } from 'react-router-dom';

export default function StatCard({ label, value, sub, subLink, icon: Icon, color = 'brand' }) {
  const iconColors = {
    brand:  { bg: 'oklch(96.5% 0.015 75)',       color: 'oklch(38% 0.09 55)'  },
    green:  { bg: 'oklch(94% 0.06 150 / 0.18)',  color: 'oklch(35% 0.1 150)'  },
    amber:  { bg: 'oklch(95% 0.06 80 / 0.18)',   color: 'oklch(36% 0.12 65)'  },
    orange: { bg: 'oklch(95% 0.06 55 / 0.18)',   color: 'oklch(36% 0.12 55)'  },
  };
  const ic = iconColors[color] || iconColors.brand;
  return (
    <div className="card p-5 flex items-start gap-4">
      {Icon && (
        <div style={{ background: ic.bg, color: ic.color, width: 34, height: 34, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon style={{ width: 16, height: 16 }} />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-brand-400 uppercase tracking-wide">{label}</p>
        <p className="text-[28px] font-extrabold text-brand-900 tracking-[-0.04em] leading-none mt-1">{value ?? '—'}</p>
        {sub && (subLink
          ? <Link to={subLink} className="text-xs text-brand-400 mt-1 hover:text-brand-700 hover:underline block">{sub}</Link>
          : <p className="text-xs text-brand-400 mt-1">{sub}</p>
        )}
      </div>
    </div>
  );
}

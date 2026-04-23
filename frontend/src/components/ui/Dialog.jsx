import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Dialog({ open, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    if (!open) return;
    const handler = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      style={{ background: 'oklch(16% 0.012 70 / 0.35)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={cn(
          'relative w-full bg-white rounded-[12px] shadow-[0_16px_48px_oklch(16%_0.012_70/0.2)] flex flex-col max-h-[90vh]',
          widths[size]
        )}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-100 flex-shrink-0">
          <h2 className="text-base font-semibold text-brand-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-brand-400 hover:text-brand-700 hover:bg-brand-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1">{children}</div>
      </div>
    </div>,
    document.body
  );
}

export function DialogBody({ children, className }) {
  return <div className={cn('px-6 py-5', className)}>{children}</div>;
}

export function DialogFooter({ children }) {
  return (
    <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-brand-100 flex-shrink-0">
      {children}
    </div>
  );
}

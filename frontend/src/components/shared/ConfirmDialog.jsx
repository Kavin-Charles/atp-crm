import React from 'react';
import Dialog, { DialogBody, DialogFooter } from '@/components/ui/Dialog';
import Button from '@/components/ui/Button';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({ open, onClose, onConfirm, title, description, loading }) {
  return (
    <Dialog open={open} onClose={onClose} title={title} size="sm">
      <DialogBody>
        <div className="flex gap-4">
          <div className="p-2 bg-red-50 rounded-xl flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <p className="text-sm text-slate-600 pt-1">{description}</p>
        </div>
      </DialogBody>
      <DialogFooter>
        <Button variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
        <Button variant="danger" onClick={onConfirm} loading={loading}>Delete</Button>
      </DialogFooter>
    </Dialog>
  );
}

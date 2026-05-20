import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Plus, Pencil, Trash2, Briefcase } from 'lucide-react';
import { quotesApi } from '@/api/quotes';
import { jobsApi } from '@/api/jobs';
import { usersApi } from '@/api/users';
import { useAuth } from '@/context/AuthContext';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import FormField from '@/components/shared/FormField';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Spinner from '@/components/ui/Spinner';
import Dialog, { DialogBody, DialogFooter } from '@/components/ui/Dialog';
import { formatDate, formatDateInput } from '@/lib/utils';
import { toast } from 'sonner';

const STATUS_OPTIONS = ['pending', 'approved', 'rejected', 'converted'];

export default function QuotesPage() {
  const { can } = useAuth();
  const qc = useQueryClient();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [convertTarget, setConvertTarget] = useState(null);
  const [convertModalOpen, setConvertModalOpen] = useState(false);

  const { data: quotes = [], isLoading } = useQuery({
    queryKey: ['quotes'],
    queryFn: quotesApi.list,
  });

  const { data: users = [] } = useQuery({ queryKey: ['users'], queryFn: usersApi.list });

  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const { register: rj, handleSubmit: hsj, reset: resetJ, watch: watchJ, setValue: setValueJ, formState: { errors: eJ } } = useForm();

  const selectedDesigners = watchJ('designer') || [];
  function toggleDesigner(username) {
    const curr = watchJ('designer') || [];
    setValueJ('designer', curr.includes(username) ? curr.filter(d => d !== username) : [...curr, username]);
  }

  const saveMutation = useMutation({
    mutationFn: (data) => editing ? quotesApi.update(editing._id, data) : quotesApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['quotes'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
      toast.success(editing ? 'Quote updated' : 'Quote created');
      closeModal();
    },
    onError: () => toast.error('Failed to save quote'),
  });

  const deleteMutation = useMutation({
    mutationFn: quotesApi.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['quotes'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
      toast.success('Quote deleted');
      setDeleteTarget(null);
    },
    onError: () => toast.error('Failed to delete'),
  });

  const convertMutation = useMutation({
    mutationFn: jobsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['quotes'] });
      qc.invalidateQueries({ queryKey: ['jobs'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
      toast.success('Job created from quote');
      setConvertModalOpen(false);
      setConvertTarget(null);
    },
    onError: () => toast.error('Failed to convert to job'),
  });

  const staffOptions = users;

  function openCreate() {
    setEditing(null);
    reset({});
    setModalOpen(true);
  }

  function openEdit(q) {
    setEditing(q);
    reset({
      clientName: q.clientName,
      company: q.company,
      jobName: q.jobName,
      quotedHours: q.quotedHours,
      validUntil: formatDateInput(q.validUntil),
      status: q.status,
      quoteDetails: q.quoteDetails,
    });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditing(null);
    reset({});
  }

  function openConvert(q) {
    setConvertTarget(q);
    resetJ({
      clientName: q.clientName,
      company: q.company,
      jobName: q.jobName,
      quotedHours: q.quotedHours,
      jobOwner: '',
      designer: [],
      expectedCompletion: '',
    });
    setConvertModalOpen(true);
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="Quotes"
        description="Track and manage customer quotes"
        action={
          <Button onClick={openCreate} size="sm">
            <Plus className="h-4 w-4 mr-1.5" /> New Quote
          </Button>
        }
      />

      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : quotes.length === 0 ? (
          <EmptyState
            title="No quotes yet"
            description="Create a quote or convert an enquiry"
            action={<Button onClick={openCreate} size="sm"><Plus className="h-4 w-4 mr-1.5" />New Quote</Button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {['Client', 'Company', 'Job Name', 'Hours', 'Valid Until', 'Status', 'Date', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {quotes.map((q) => (
                  <tr key={q._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900">{q.clientName || '—'}</td>
                    <td className="px-4 py-3 text-slate-700">{q.company || '—'}</td>
                    <td className="px-4 py-3 text-slate-700 max-w-[180px] truncate">{q.jobName || '—'}</td>
                    <td className="px-4 py-3 text-slate-500">{q.quotedHours ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{q.validUntil ? formatDate(q.validUntil) : '—'}</td>
                    <td className="px-4 py-3"><Badge status={q.status} /></td>
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{formatDate(q.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {q.status !== 'converted' && (
                          <Button variant="ghost" size="sm" onClick={() => openConvert(q)} title="Convert to Job">
                            <Briefcase className="h-3.5 w-3.5 text-brand-900" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => openEdit(q)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        {can('admin', 'manager') && (
                          <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(q)}>
                            <Trash2 className="h-3.5 w-3.5 text-red-500" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Dialog open={modalOpen} onClose={closeModal} title={editing ? 'Edit Quote' : 'New Quote'} size="md">
        <form onSubmit={handleSubmit((d) => saveMutation.mutate(d))}>
          <DialogBody className="grid grid-cols-2 gap-4">
            <FormField label="Client Name" required error={errors.clientName}>
              <Input error={errors.clientName} {...register('clientName', { required: 'Required' })} />
            </FormField>
            <FormField label="Company" error={errors.company}>
              <Input {...register('company')} />
            </FormField>
            <div className="col-span-2">
              <FormField label="Job Name" required error={errors.jobName}>
                <Input placeholder="e.g. 4-Layer PCB Design" error={errors.jobName} {...register('jobName', { required: 'Required' })} />
              </FormField>
            </div>
            <FormField label="Quoted Hours" error={errors.quotedHours}>
              <Input type="number" min="0" step="0.5" placeholder="0" {...register('quotedHours')} />
            </FormField>
            <FormField label="Valid Until" error={errors.validUntil}>
              <Input type="date" {...register('validUntil')} />
            </FormField>
            <FormField label="Status" error={errors.status}>
              <Select {...register('status')}>
                {STATUS_OPTIONS.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
              </Select>
            </FormField>
            <div className="col-span-2">
              <FormField label="Quote Details" error={errors.quoteDetails}>
                <Textarea placeholder="Scope, deliverables, assumptions..." rows={3} {...register('quoteDetails')} />
              </FormField>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="secondary" type="button" onClick={closeModal}>Cancel</Button>
            <Button type="submit" loading={saveMutation.isPending}>
              {editing ? 'Save Changes' : 'Create Quote'}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* Convert to Job Modal */}
      <Dialog open={convertModalOpen} onClose={() => setConvertModalOpen(false)} title="Convert to Job" size="md">
        <form onSubmit={hsj((d) => convertMutation.mutate({ ...d, quoteId: convertTarget?._id }))}>
          <DialogBody className="grid grid-cols-2 gap-4">
            <FormField label="Client Name" required error={eJ.clientName}>
              <Input error={eJ.clientName} {...rj('clientName', { required: 'Required' })} />
            </FormField>
            <FormField label="Company" error={eJ.company}>
              <Input {...rj('company')} />
            </FormField>
            <div className="col-span-2">
              <FormField label="Job Name" required error={eJ.jobName}>
                <Input error={eJ.jobName} {...rj('jobName', { required: 'Required' })} />
              </FormField>
            </div>
            <FormField label="Job Owner" error={eJ.jobOwner}>
              <Select {...rj('jobOwner')}>
                <option value="">Select owner</option>
                {staffOptions.map((u) => <option key={u._id} value={u.username}>{u.username}</option>)}
              </Select>
            </FormField>
            <FormField label="Designers" error={eJ.designer}>
              <input type="hidden" {...rj('designer')} />
              <div className="flex flex-wrap gap-2 p-2 border border-slate-200 rounded-lg min-h-[44px] bg-white">
                {staffOptions.map((u) => {
                  const active = selectedDesigners.includes(u.username);
                  return (
                    <button
                      key={u._id}
                      type="button"
                      onClick={() => toggleDesigner(u.username)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                        active
                          ? 'bg-brand-900 text-white border-brand-900'
                          : 'bg-white text-slate-600 border-slate-300 hover:border-brand-900 hover:text-brand-900'
                      }`}
                    >
                      {u.username}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-slate-400 mt-1">Click to toggle designers</p>
            </FormField>
            <FormField label="Quoted Hours" error={eJ.quotedHours}>
              <Input type="number" min="0" step="0.5" {...rj('quotedHours')} />
            </FormField>
            <FormField label="Expected Completion" error={eJ.expectedCompletion}>
              <Input type="date" {...rj('expectedCompletion')} />
            </FormField>
          </DialogBody>
          <DialogFooter>
            <Button variant="secondary" type="button" onClick={() => setConvertModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={convertMutation.isPending}>Create Job</Button>
          </DialogFooter>
        </form>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget._id)}
        loading={deleteMutation.isPending}
        title="Delete Quote"
        description={`Delete quote for "${deleteTarget?.jobName}"? This cannot be undone.`}
      />
    </div>
  );
}

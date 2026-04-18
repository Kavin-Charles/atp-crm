import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { hoursApi } from '@/api/hours';
import { usersApi } from '@/api/users';
import { jobsApi } from '@/api/jobs';
import { useAuth } from '@/context/AuthContext';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import FormField from '@/components/shared/FormField';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Spinner from '@/components/ui/Spinner';
import Dialog, { DialogBody, DialogFooter } from '@/components/ui/Dialog';
import { formatDate, formatDateInput } from '@/lib/utils';
import { toast } from 'sonner';

export default function HoursPage() {
  const { can, user } = useAuth();
  const qc = useQueryClient();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [designerFilter, setDesignerFilter] = useState('');

  const { data: hours = [], isLoading } = useQuery({ queryKey: ['hours'], queryFn: hoursApi.list });
  const { data: users = [] } = useQuery({ queryKey: ['users'], queryFn: usersApi.list });
  const { data: jobs = [] } = useQuery({ queryKey: ['jobs'], queryFn: jobsApi.list });

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // Build a lookup map: jobId -> job
  const jobMap = Object.fromEntries(jobs.map((j) => [j._id, j]));

  const saveMutation = useMutation({
    mutationFn: (data) => {
      // Attach jobName from the selected job so hours entries are readable
      const job = jobMap[data.jobId];
      const payload = { ...data, jobName: job?.jobName || '' };
      return editing ? hoursApi.update(editing._id, payload) : hoursApi.create(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hours'] });
      qc.invalidateQueries({ queryKey: ['jobs'] }); // workedHours updated on backend
      toast.success(editing ? 'Hours updated' : 'Hours logged');
      closeModal();
    },
    onError: () => toast.error('Failed to save'),
  });

  const deleteMutation = useMutation({
    mutationFn: hoursApi.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hours'] });
      qc.invalidateQueries({ queryKey: ['jobs'] }); // workedHours updated on backend
      toast.success('Deleted');
      setDeleteTarget(null);
    },
    onError: () => toast.error('Failed to delete'),
  });

  function openCreate() {
    setEditing(null);
    reset({ date: formatDateInput(new Date()), designer: user?.username || '', jobId: '' });
    setModalOpen(true);
  }

  function openEdit(h) {
    setEditing(h);
    reset({
      jobId: h.jobId || '',
      designer: h.designer,
      date: formatDateInput(h.date),
      startTime: h.startTime,
      endTime: h.endTime,
      task: h.task,
      estimatedHours: h.estimatedHours,
      actualHours: h.actualHours,
      remarks: h.remarks,
    });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditing(null);
    reset({});
  }

  const filtered = designerFilter ? hours.filter((h) => h.designer === designerFilter) : hours;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="Daily Hours"
        description="Track designer work hours per job"
        action={
          <div className="flex items-center gap-2">
            {can('admin', 'manager') && (
              <select
                value={designerFilter}
                onChange={(e) => setDesignerFilter(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg px-3 py-2 text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-brand-900/20"
              >
                <option value="">All designers</option>
                {users.map((u) => <option key={u._id} value={u.username}>{u.username}</option>)}
              </select>
            )}
            <Button onClick={openCreate} size="sm">
              <Plus className="h-4 w-4 mr-1.5" /> Log Hours
            </Button>
          </div>
        }
      />

      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No hours logged"
            description="Start tracking daily work hours"
            action={<Button onClick={openCreate} size="sm"><Plus className="h-4 w-4 mr-1.5" />Log Hours</Button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {['Date', 'ATP #', 'Job', 'Designer', 'Start', 'End', 'Est. Hrs', 'Actual Hrs', 'Task', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((h) => {
                  const linkedJob = jobMap[h.jobId];
                  return (
                    <tr key={h._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{formatDate(h.date)}</td>
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-brand-900 whitespace-nowrap">
                        {linkedJob?.atpNumber || '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-700 max-w-[160px] truncate" title={h.jobName}>
                        {h.jobName || '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{h.designer || '—'}</td>
                      <td className="px-4 py-3 text-slate-500">{h.startTime || '—'}</td>
                      <td className="px-4 py-3 text-slate-500">{h.endTime || '—'}</td>
                      <td className="px-4 py-3 text-slate-500">{h.estimatedHours ?? '—'}</td>
                      <td className="px-4 py-3 text-slate-500">{h.actualHours ?? '—'}</td>
                      <td className="px-4 py-3 text-slate-500 max-w-[160px] truncate" title={h.task}>{h.task || '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(h)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          {can('admin', 'manager') && (
                            <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(h)}>
                              <Trash2 className="h-3.5 w-3.5 text-red-500" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={modalOpen} onClose={closeModal} title={editing ? 'Edit Hours' : 'Log Hours'} size="md">
        <form onSubmit={handleSubmit((d) => saveMutation.mutate(d))}>
          <DialogBody className="grid grid-cols-2 gap-4">
            <FormField label="Date" required error={errors.date}>
              <Input type="date" error={errors.date} {...register('date', { required: 'Required' })} />
            </FormField>
            <FormField label="Designer" required error={errors.designer}>
              <Select error={errors.designer} {...register('designer', { required: 'Required' })}>
                <option value="">Select designer</option>
                {users.map((u) => <option key={u._id} value={u.username}>{u.username}</option>)}
              </Select>
            </FormField>
            <div className="col-span-2">
              <FormField label="Job" required error={errors.jobId}>
                <Select error={errors.jobId} {...register('jobId', { required: 'Required' })}>
                  <option value="">Select job</option>
                  {jobs.map((j) => (
                    <option key={j._id} value={j._id}>
                      {j.atpNumber} — {j.jobName || j.company || 'Untitled'}
                    </option>
                  ))}
                </Select>
              </FormField>
            </div>
            <FormField label="Start Time" error={errors.startTime}>
              <Input type="time" {...register('startTime')} />
            </FormField>
            <FormField label="End Time" error={errors.endTime}>
              <Input type="time" {...register('endTime')} />
            </FormField>
            <FormField label="Estimated Hours" error={errors.estimatedHours}>
              <Input type="number" min="0" step="0.25" placeholder="0" {...register('estimatedHours')} />
            </FormField>
            <FormField label="Actual Hours" error={errors.actualHours}>
              <Input type="number" min="0" step="0.25" placeholder="0" {...register('actualHours')} />
            </FormField>
            <div className="col-span-2">
              <FormField label="Task Description" error={errors.task}>
                <Textarea placeholder="What was worked on..." rows={2} {...register('task')} />
              </FormField>
            </div>
            <div className="col-span-2">
              <FormField label="Remarks" error={errors.remarks}>
                <Textarea placeholder="Any remarks..." rows={2} {...register('remarks')} />
              </FormField>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="secondary" type="button" onClick={closeModal}>Cancel</Button>
            <Button type="submit" loading={saveMutation.isPending}>
              {editing ? 'Save Changes' : 'Log Hours'}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget._id)}
        loading={deleteMutation.isPending}
        title="Delete Entry"
        description="Delete this hours entry? This cannot be undone."
      />
    </div>
  );
}

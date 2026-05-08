import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Plus, Pencil, Trash2, Clock } from 'lucide-react';
import { jobsApi } from '@/api/jobs';
import { usersApi } from '@/api/users';
import { hoursApi } from '@/api/hours';
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

const JOB_STATUSES = ['pending', 'in progress', 'on hold', 'completed', 'cancelled'];
const PAYMENT_STATUSES = ['pending', 'partial', 'received'];

// ─── Hours sub-modal ────────────────────────────────────────────────────────

function HoursModal({ job, open, onClose }) {
  const { can, user } = useAuth();
  const qc = useQueryClient();
  const [editingHour, setEditingHour] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data: users = [] } = useQuery({ queryKey: ['users'], queryFn: usersApi.list });

  const { data: allHours = [], isLoading } = useQuery({
    queryKey: ['hours'],
    queryFn: hoursApi.list,
    enabled: open,
  });

  const jobHours = allHours.filter((h) => h.jobId?.toString() === job?._id?.toString());

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const saveMutation = useMutation({
    mutationFn: (data) => {
      const payload = { ...data, jobId: job._id, jobName: job.jobName || '' };
      return editingHour ? hoursApi.update(editingHour._id, payload) : hoursApi.create(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hours'] });
      qc.invalidateQueries({ queryKey: ['jobs'] });
      toast.success(editingHour ? 'Hours updated' : 'Hours logged');
      cancelForm();
    },
    onError: () => toast.error('Failed to save'),
  });

  const deleteMutation = useMutation({
    mutationFn: hoursApi.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hours'] });
      qc.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Deleted');
      setDeleteTarget(null);
    },
    onError: () => toast.error('Failed to delete'),
  });

  function openCreate() {
    setEditingHour(null);
    reset({ date: formatDateInput(new Date()), designer: user?.username || '' });
    setShowForm(true);
  }

  function openEdit(h) {
    setEditingHour(h);
    reset({
      designer: h.designer,
      date: formatDateInput(h.date),
      startTime: h.startTime,
      endTime: h.endTime,
      task: h.task,
      estimatedHours: h.estimatedHours,
      actualHours: h.actualHours,
      remarks: h.remarks,
    });
    setShowForm(true);
  }

  function cancelForm() {
    setShowForm(false);
    setEditingHour(null);
    reset({});
  }

  function handleClose() {
    cancelForm();
    onClose();
  }

  const totalActual = jobHours.reduce((sum, h) => sum + (parseFloat(h.actualHours) || 0), 0);

  return (
    <>
      <Dialog open={open} onClose={handleClose} title={`Hours — ${job?.atpNumber}`} size="xl">
        <DialogBody className="p-0">
          {/* Stats bar */}
          <div className="px-6 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-6 text-sm">
              <span className="text-slate-500">
                Quoted: <span className="font-semibold text-slate-800">{job?.quotedHours ?? '—'} hrs</span>
              </span>
              <span className="text-slate-500">
                Worked: <span className="font-semibold text-slate-800">{totalActual} hrs</span>
              </span>
              {job?.quotedHours && (
                <span className={`font-semibold text-sm ${totalActual > parseFloat(job.quotedHours) ? 'text-red-500' : 'text-green-600'}`}>
                  {totalActual > parseFloat(job.quotedHours)
                    ? `+${(totalActual - parseFloat(job.quotedHours)).toFixed(2)} over`
                    : `${(parseFloat(job.quotedHours) - totalActual).toFixed(2)} remaining`}
                </span>
              )}
            </div>
            {!showForm && (
              <Button size="sm" onClick={openCreate}>
                <Plus className="h-4 w-4 mr-1.5" /> Log Hours
              </Button>
            )}
          </div>

          {/* Inline form */}
          {showForm && (
            <form onSubmit={handleSubmit((d) => saveMutation.mutate(d))} className="px-6 py-4 border-b border-slate-100 bg-blue-50/40">
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">
                {editingHour ? 'Edit entry' : 'Log new hours'}
              </p>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <FormField label="Date" required error={errors.date}>
                  <Input type="date" error={errors.date} {...register('date', { required: 'Required' })} />
                </FormField>
                <FormField label="Designer" required error={errors.designer}>
                  <Select error={errors.designer} {...register('designer', { required: 'Required' })}>
                    <option value="">Select</option>
                    {users.map((u) => <option key={u._id} value={u.username}>{u.username}</option>)}
                  </Select>
                </FormField>
                <FormField label="Task" error={errors.task}>
                  <Input placeholder="What was done..." {...register('task')} />
                </FormField>
                <FormField label="Start Time" error={errors.startTime}>
                  <Input type="time" {...register('startTime')} />
                </FormField>
                <FormField label="End Time" error={errors.endTime}>
                  <Input type="time" {...register('endTime')} />
                </FormField>
                <div className="grid grid-cols-2 gap-2">
                  <FormField label="Est. Hrs" error={errors.estimatedHours}>
                    <Input type="number" min="0" step="0.25" placeholder="0" {...register('estimatedHours')} />
                  </FormField>
                  <FormField label="Actual Hrs" error={errors.actualHours}>
                    <Input type="number" min="0" step="0.25" placeholder="0" {...register('actualHours')} />
                  </FormField>
                </div>
              </div>
              <FormField label="Remarks" error={errors.remarks} className="mb-3">
                <Textarea placeholder="Any remarks..." rows={1} {...register('remarks')} />
              </FormField>
              <div className="flex gap-2">
                <Button type="submit" size="sm" loading={saveMutation.isPending}>
                  {editingHour ? 'Save Changes' : 'Log Hours'}
                </Button>
                <Button type="button" variant="secondary" size="sm" onClick={cancelForm}>Cancel</Button>
              </div>
            </form>
          )}

          {/* Hours table */}
          {isLoading ? (
            <div className="flex justify-center py-10"><Spinner /></div>
          ) : jobHours.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-sm">No hours logged for this job yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    {['Date', 'Designer', 'Start', 'End', 'Est. Hrs', 'Actual Hrs', 'Task', 'Remarks', ''].map((h) => (
                      <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {jobHours.map((h) => (
                    <tr key={h._id} className="hover:bg-slate-50">
                      <td className="px-4 py-2.5 text-slate-700 whitespace-nowrap">{formatDate(h.date)}</td>
                      <td className="px-4 py-2.5 text-slate-600">{h.designer || '—'}</td>
                      <td className="px-4 py-2.5 text-slate-500">{h.startTime || '—'}</td>
                      <td className="px-4 py-2.5 text-slate-500">{h.endTime || '—'}</td>
                      <td className="px-4 py-2.5 text-slate-500">{h.estimatedHours ?? '—'}</td>
                      <td className="px-4 py-2.5 text-slate-700 font-medium">{h.actualHours ?? '—'}</td>
                      <td className="px-4 py-2.5 text-slate-500 max-w-[160px] truncate" title={h.task}>{h.task || '—'}</td>
                      <td className="px-4 py-2.5 text-slate-400 max-w-[120px] truncate" title={h.remarks}>{h.remarks || '—'}</td>
                      <td className="px-4 py-2.5">
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
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-slate-200 bg-slate-50">
                    <td colSpan={5} className="px-4 py-2.5 text-xs text-slate-400">Total</td>
                    <td className="px-4 py-2.5 text-sm font-bold text-slate-800">{totalActual} hrs</td>
                    <td colSpan={3} />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </DialogBody>
        <DialogFooter>
          <Button variant="secondary" onClick={handleClose}>Close</Button>
        </DialogFooter>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget._id)}
        loading={deleteMutation.isPending}
        title="Delete Entry"
        description="Delete this hours entry? This cannot be undone."
      />
    </>
  );
}

// ─── Jobs page ───────────────────────────────────────────────────────────────

export default function JobsPage() {
  const { can } = useAuth();
  const qc = useQueryClient();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [hoursJob, setHoursJob] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  const { data: jobs = [], isLoading } = useQuery({ queryKey: ['jobs'], queryFn: jobsApi.list });
  const { data: users = [] } = useQuery({ queryKey: ['users'], queryFn: usersApi.list });

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const saveMutation = useMutation({
    mutationFn: (data) => editing ? jobsApi.update(editing._id, data) : jobsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['jobs'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
      toast.success(editing ? 'Job updated' : 'Job created');
      closeModal();
    },
    onError: () => toast.error('Failed to save job'),
  });

  const deleteMutation = useMutation({
    mutationFn: jobsApi.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['jobs'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
      toast.success('Job deleted');
      setDeleteTarget(null);
    },
    onError: () => toast.error('Failed to delete'),
  });

  function openCreate() {
    setEditing(null);
    reset({ status: 'pending', paymentStatus: 'pending' });
    setModalOpen(true);
  }

  function openEdit(job) {
    setEditing(job);
    reset({
      clientName: job.clientName,
      company: job.company,
      jobName: job.jobName,
      jobOwner: job.jobOwner,
      designer: job.designer,
      quotedHours: job.quotedHours,
      workedHours: job.workedHours,
      status: job.status,
      paymentStatus: job.paymentStatus,
      paymentMode: job.paymentMode,
      paymentNotes: job.paymentNotes,
      rajFeedback: job.rajFeedback,
      expectedCompletion: formatDateInput(job.expectedCompletion),
      releaseDate: formatDateInput(job.releaseDate),
      backupDate: formatDateInput(job.backupDate),
    });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditing(null);
    reset({});
  }

  const filtered = statusFilter ? jobs.filter((j) => j.status === statusFilter) : jobs;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="Jobs"
        description="Manage active and completed PCB design jobs"
        action={
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-3 py-2 text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-brand-900/20"
            >
              <option value="">All statuses</option>
              {JOB_STATUSES.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
            </select>
            <Button onClick={openCreate} size="sm">
              <Plus className="h-4 w-4 mr-1.5" /> New Job
            </Button>
          </div>
        }
      />

      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No jobs found"
            description={statusFilter ? `No jobs with status "${statusFilter}"` : 'Create your first job'}
            action={!statusFilter && <Button onClick={openCreate} size="sm"><Plus className="h-4 w-4 mr-1.5" />New Job</Button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {['ATP #', 'Company', 'Job Name', 'Owner', 'Designer', 'Hrs Q/W', 'Status', 'Payment', 'Expected', 'Released', 'Backup', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((job) => (
                  <tr key={job._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-brand-900 whitespace-nowrap">{job.atpNumber}</td>
                    <td className="px-4 py-3 text-slate-700">{job.company || '—'}</td>
                    <td className="px-4 py-3 text-slate-700 max-w-[160px] truncate" title={job.jobName}>{job.jobName || '—'}</td>
                    <td className="px-4 py-3 text-slate-500">{job.jobOwner || '—'}</td>
                    <td className="px-4 py-3 text-slate-500">{job.designer || '—'}</td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                      <span>{job.quotedHours ?? '—'}</span>
                      <span className="text-slate-300 mx-1">/</span>
                      <span className={parseFloat(job.workedHours) > parseFloat(job.quotedHours) ? 'text-red-500 font-semibold' : ''}>
                        {job.workedHours ?? '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3"><Badge status={job.status} /></td>
                    <td className="px-4 py-3"><Badge status={job.paymentStatus} /></td>
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                      {job.expectedCompletion ? formatDate(job.expectedCompletion) : '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                      {job.releaseDate ? formatDate(job.releaseDate) : '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                      {job.backupDate ? formatDate(job.backupDate) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => setHoursJob(job)} title="View Hours">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => openEdit(job)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        {can('admin', 'manager') && (
                          <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(job)}>
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

      {/* Job create/edit modal */}
      <Dialog open={modalOpen} onClose={closeModal} title={editing ? `Edit ${editing.atpNumber}` : 'New Job'} size="lg">
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
            <FormField label="Job Owner" error={errors.jobOwner}>
              <Select {...register('jobOwner')}>
                <option value="">Select owner</option>
                {users.map((u) => <option key={u._id} value={u.username}>{u.username}</option>)}
              </Select>
            </FormField>
            <FormField label="Designer" error={errors.designer}>
              <Select {...register('designer')}>
                <option value="">Select designer</option>
                {users.map((u) => <option key={u._id} value={u.username}>{u.username}</option>)}
              </Select>
            </FormField>
            <FormField label="Quoted Hours" error={errors.quotedHours}>
              <Input type="number" min="0" step="0.5" placeholder="0" {...register('quotedHours')} />
            </FormField>
            <FormField label="Worked Hours" error={errors.workedHours}>
              <Input type="number" min="0" step="0.5" placeholder="Auto-synced from hours log" {...register('workedHours')} />
            </FormField>
            <FormField label="Status" error={errors.status}>
              <Select {...register('status')}>
                {JOB_STATUSES.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
              </Select>
            </FormField>
            <FormField label="Payment Status" error={errors.paymentStatus}>
              <Select {...register('paymentStatus')}>
                {PAYMENT_STATUSES.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
              </Select>
            </FormField>
            <FormField label="Payment Mode" error={errors.paymentMode}>
              <Select {...register('paymentMode')}>
                <option value="">Select mode</option>
                {['bank transfer', 'cheque', 'cash', 'UPI', 'other'].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </Select>
            </FormField>
            <FormField label="Expected Completion" error={errors.expectedCompletion}>
              <Input type="date" {...register('expectedCompletion')} />
            </FormField>
            <FormField label="Release Date" error={errors.releaseDate}>
              <Input type="date" {...register('releaseDate')} />
            </FormField>
            <FormField label="Backup Date" error={errors.backupDate}>
              <Input type="date" {...register('backupDate')} />
            </FormField>
            <div className="col-span-2">
              <FormField label="Manager Feedback" error={errors.rajFeedback}>
                <Textarea placeholder="Notes or feedback..." rows={3} {...register('rajFeedback')} />
              </FormField>
            </div>
            <div className="col-span-2">
              <FormField label="Payment Notes" error={errors.paymentNotes}>
                <Textarea placeholder="Payment reference, notes..." rows={2} {...register('paymentNotes')} />
              </FormField>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="secondary" type="button" onClick={closeModal}>Cancel</Button>
            <Button type="submit" loading={saveMutation.isPending}>
              {editing ? 'Save Changes' : 'Create Job'}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* Hours modal */}
      <HoursModal job={hoursJob} open={!!hoursJob} onClose={() => setHoursJob(null)} />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget._id)}
        loading={deleteMutation.isPending}
        title="Delete Job"
        description={`Delete job ${deleteTarget?.atpNumber} — "${deleteTarget?.jobName}"? This cannot be undone.`}
      />
    </div>
  );
}

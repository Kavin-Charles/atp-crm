import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Plus, Pencil, Trash2, ArrowRight } from 'lucide-react';
import { enquiriesApi } from '@/api/enquiries';
import { quotesApi } from '@/api/quotes';
import { jobsApi } from '@/api/jobs';
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
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';

const STATUS_OPTIONS = ['new', 'contacted', 'quoted', 'converted', 'closed'];
const SOURCE_OPTIONS = ['referral', 'website', 'cold call', 'email', 'walk-in', 'other'];
const SERVICE_OPTIONS = ['PCB Layout', 'Schematics', 'Full Turn Key', 'Debugging', 'Reengineering', 'Other'];

export default function EnquiriesPage() {
  const { can } = useAuth();
  const qc = useQueryClient();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [quoteTarget, setQuoteTarget] = useState(null);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');

  const { data: enquiries = [], isLoading } = useQuery({
    queryKey: ['enquiries'],
    queryFn: enquiriesApi.list,
  });
  const { data: jobs = [] } = useQuery({ queryKey: ['jobs'], queryFn: jobsApi.list });

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();
  const watchedSource = watch('source');
  const { register: rq, handleSubmit: hsq, reset: resetQ, formState: { errors: eQ } } = useForm();

  const saveMutation = useMutation({
    mutationFn: (data) => editing ? enquiriesApi.update(editing._id, data) : enquiriesApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['enquiries'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
      toast.success(editing ? 'Enquiry updated' : 'Enquiry created');
      closeModal();
    },
    onError: () => toast.error('Failed to save enquiry'),
  });

  const deleteMutation = useMutation({
    mutationFn: enquiriesApi.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['enquiries'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
      toast.success('Enquiry deleted');
      setDeleteTarget(null);
    },
    onError: () => toast.error('Failed to delete'),
  });

  const quoteMutation = useMutation({
    mutationFn: quotesApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['enquiries'] });
      qc.invalidateQueries({ queryKey: ['quotes'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
      toast.success('Quote created from enquiry');
      setQuoteModalOpen(false);
      setQuoteTarget(null);
    },
    onError: () => toast.error('Failed to create quote'),
  });

  function openCreate() {
    setEditing(null);
    reset({});
    setModalOpen(true);
  }

  function openEdit(enq) {
    setEditing(enq);
    reset({
      name: enq.name,
      company: enq.company,
      phone: enq.phone,
      email: enq.email,
      address: enq.address,
      service: enq.service,
      source: enq.source,
      referredBy: enq.referredBy,
      jobId: enq.jobId?._id || enq.jobId || '',
      status: enq.status,
      notes: enq.notes,
    });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditing(null);
    reset({});
  }

  function openQuote(enq) {
    setQuoteTarget(enq);
    resetQ({
      clientName: enq.name,
      company: enq.company,
      jobName: '',
      quotedHours: '',
      quoteDetails: '',
    });
    setQuoteModalOpen(true);
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="Enquiries"
        description="Manage incoming customer enquiries"
        action={
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-3 py-2 text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-brand-900/20"
            >
              <option value="">All statuses</option>
              {STATUS_OPTIONS.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
            </select>
            <Button onClick={openCreate} size="sm">
              <Plus className="h-4 w-4 mr-1.5" /> New Enquiry
            </Button>
          </div>
        }
      />

      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : enquiries.length === 0 ? (
          <EmptyState
            title="No enquiries yet"
            description="Add your first customer enquiry to get started"
            action={<Button onClick={openCreate} size="sm"><Plus className="h-4 w-4 mr-1.5" />New Enquiry</Button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {['Name', 'Company', 'Service', 'Phone', 'Source', 'Job', 'Status', 'Date', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {(statusFilter ? enquiries.filter((e) => e.status === statusFilter) : enquiries).map((enq) => {
                  const linkedJob = jobs.find((j) => j._id === (enq.jobId?._id || enq.jobId));
                  return (
                  <tr key={enq._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900">{enq.name || '—'}</td>
                    <td className="px-4 py-3 text-slate-700">{enq.company || '—'}</td>
                    <td className="px-4 py-3 text-slate-500">{enq.service || '—'}</td>
                    <td className="px-4 py-3 text-slate-500">{enq.phone || '—'}</td>
                    <td className="px-4 py-3 text-slate-500 capitalize">
                      {enq.source || '—'}
                      {enq.referredBy && <span className="block text-xs text-slate-400">by {enq.referredBy}</span>}
                    </td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap font-mono text-xs">
                      {linkedJob ? `${linkedJob.atpNumber} / ${linkedJob.jobName || ''}` : '—'}
                    </td>
                    <td className="px-4 py-3"><Badge status={enq.status} /></td>
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{formatDate(enq.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {enq.status !== 'quoted' && enq.status !== 'converted' && (
                          <Button variant="ghost" size="sm" onClick={() => openQuote(enq)} title="Make Quote">
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => openEdit(enq)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        {can('admin', 'manager') && (
                          <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(enq)}>
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

      {/* Create/Edit Modal */}
      <Dialog open={modalOpen} onClose={closeModal} title={editing ? 'Edit Enquiry' : 'New Enquiry'} size="md">
        <form onSubmit={handleSubmit((d) => saveMutation.mutate(d))}>
          <DialogBody className="grid grid-cols-2 gap-4">
            <FormField label="Name" required error={errors.name}>
              <Input placeholder="Contact name" error={errors.name} {...register('name', { required: 'Required' })} />
            </FormField>
            <FormField label="Company" error={errors.company}>
              <Input placeholder="Company name" {...register('company')} />
            </FormField>
            <FormField label="Phone" error={errors.phone}>
              <Input placeholder="+91 ..." {...register('phone')} />
            </FormField>
            <FormField label="Email" error={errors.email}>
              <Input type="email" placeholder="email@example.com" {...register('email')} />
            </FormField>
            <div className="col-span-2">
              <FormField label="Address" error={errors.address}>
                <Input placeholder="Street, City, State, PIN" {...register('address')} />
              </FormField>
            </div>
            <FormField label="Service" error={errors.service}>
              <Select {...register('service')}>
                <option value="">Select service</option>
                {SERVICE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
            </FormField>
            <FormField label="Source" error={errors.source}>
              <Select {...register('source')}>
                <option value="">Select source</option>
                {SOURCE_OPTIONS.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
              </Select>
            </FormField>
            {watchedSource === 'referral' && (
              <FormField label="Referred By" error={errors.referredBy}>
                <Input placeholder="Who referred this client?" {...register('referredBy')} />
              </FormField>
            )}
            {watchedSource === 'other' && (
              <FormField label="Source Details" error={errors.referredBy}>
                <Input placeholder="Please specify..." {...register('referredBy')} />
              </FormField>
            )}
            <FormField label="Linked Job" error={errors.jobId}>
              <Select {...register('jobId')}>
                <option value="">No job linked</option>
                {jobs.map((j) => (
                  <option key={j._id} value={j._id}>{j.atpNumber} / {j.jobName || j.company}</option>
                ))}
              </Select>
            </FormField>
            <FormField label="Status" error={errors.status}>
              <Select {...register('status')}>
                {STATUS_OPTIONS.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
              </Select>
            </FormField>
            <div className="col-span-2">
              <FormField label="Notes" error={errors.notes}>
                <Textarea placeholder="Any additional notes..." rows={3} {...register('notes')} />
              </FormField>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="secondary" type="button" onClick={closeModal}>Cancel</Button>
            <Button type="submit" loading={saveMutation.isPending}>
              {editing ? 'Save Changes' : 'Create Enquiry'}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* Make Quote Modal */}
      <Dialog open={quoteModalOpen} onClose={() => setQuoteModalOpen(false)} title="Create Quote" size="md">
        <form onSubmit={hsq((d) => quoteMutation.mutate({ ...d, enquiryId: quoteTarget?._id }))}>
          <DialogBody className="grid grid-cols-2 gap-4">
            <FormField label="Client Name" required error={eQ.clientName}>
              <Input error={eQ.clientName} {...rq('clientName', { required: 'Required' })} />
            </FormField>
            <FormField label="Company" error={eQ.company}>
              <Input {...rq('company')} />
            </FormField>
            <div className="col-span-2">
              <FormField label="Job Name" required error={eQ.jobName}>
                <Input placeholder="e.g. 4-Layer PCB Design" error={eQ.jobName} {...rq('jobName', { required: 'Required' })} />
              </FormField>
            </div>
            <FormField label="Quoted Hours" error={eQ.quotedHours}>
              <Input type="number" min="0" step="0.5" placeholder="0" {...rq('quotedHours')} />
            </FormField>
            <FormField label="Valid Until" error={eQ.validUntil}>
              <Input type="date" {...rq('validUntil')} />
            </FormField>
            <div className="col-span-2">
              <FormField label="Quote Details" error={eQ.quoteDetails}>
                <Textarea placeholder="Scope of work, deliverables..." rows={3} {...rq('quoteDetails')} />
              </FormField>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="secondary" type="button" onClick={() => setQuoteModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={quoteMutation.isPending}>Create Quote</Button>
          </DialogFooter>
        </form>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget._id)}
        loading={deleteMutation.isPending}
        title="Delete Enquiry"
        description={`Delete enquiry from "${deleteTarget?.name || deleteTarget?.company}"? This cannot be undone.`}
      />
    </div>
  );
}

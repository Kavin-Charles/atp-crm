import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { tasksApi } from '@/api/tasks';
import { usersApi } from '@/api/users';
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
import { toast } from 'sonner';

const PRIORITY_STYLES = {
  high:   'bg-red-100 text-red-700 border-red-200',
  medium: 'bg-amber-100 text-amber-700 border-amber-200',
  low:    'bg-green-100 text-green-700 border-green-200',
};
const STATUS_STYLES = {
  pending:     'bg-slate-100 text-slate-600 border-slate-200',
  'in progress': 'bg-blue-100 text-blue-700 border-blue-200',
  completed:   'bg-green-100 text-green-700 border-green-200',
};

export default function TasksPage() {
  const { can, user } = useAuth();
  const qc = useQueryClient();
  const isAdmin = can('admin', 'manager');

  const [modalOpen, setModalOpen]       = useState(false);
  const [editing, setEditing]           = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [viewAll, setViewAll]           = useState(false);

  const { data: tasks = [], isLoading } = useQuery({ queryKey: ['tasks'], queryFn: tasksApi.list });
  const { data: users = [] } = useQuery({ queryKey: ['users'], queryFn: usersApi.list });

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm();
  const selectedUsers = watch('assignedTo') || [];

  function toggleUser(username) {
    const curr = watch('assignedTo') || [];
    setValue('assignedTo', curr.includes(username) ? curr.filter(u => u !== username) : [...curr, username]);
  }

  const saveMutation = useMutation({
    mutationFn: (data) => {
      const clean = { ...data };
      if (!clean.dueDate) delete clean.dueDate;
      return editing ? tasksApi.update(editing._id, clean) : tasksApi.create(clean);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      toast.success(editing ? 'Task updated' : 'Task created');
      closeModal();
    },
    onError: () => toast.error('Failed to save'),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => tasksApi.update(id, { status }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tasks'] }); toast.success('Status updated'); },
    onError: () => toast.error('Failed to update'),
  });

  const deleteMutation = useMutation({
    mutationFn: tasksApi.remove,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tasks'] }); toast.success('Task deleted'); setDeleteTarget(null); },
    onError: () => toast.error('Failed to delete'),
  });

  function openCreate() {
    setEditing(null);
    reset({ status: 'pending', priority: 'medium', assignedTo: [] });
    setModalOpen(true);
  }

  function openEdit(task) {
    setEditing(task);
    reset({
      title: task.title,
      description: task.description || '',
      assignedTo: Array.isArray(task.assignedTo) ? task.assignedTo : [],
      dueDate: task.dueDate || '',
      status: task.status,
      priority: task.priority,
      jobRef: task.jobRef || '',
    });
    setModalOpen(true);
  }

  function closeModal() { setModalOpen(false); setEditing(null); reset({}); }

  // Filter
  let filtered = tasks;
  if (!isAdmin || !viewAll) filtered = filtered.filter(t => t.assignedTo?.includes(user?.username));
  if (statusFilter) filtered = filtered.filter(t => t.status === statusFilter);

  const counts = { pending: tasks.filter(t=>t.status==='pending').length, 'in progress': tasks.filter(t=>t.status==='in progress').length, completed: tasks.filter(t=>t.status==='completed').length };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="Tasks"
        description="Assigned tasks and to-dos"
        action={isAdmin && (
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-1.5" /> New Task
          </Button>
        )}
      />

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        {isAdmin && (
          <div className="flex items-center bg-slate-100 rounded-lg p-1 text-sm">
            <button
              onClick={() => setViewAll(false)}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${!viewAll ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
            >
              My Tasks
            </button>
            <button
              onClick={() => setViewAll(true)}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${viewAll ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
            >
              All Tasks
            </button>
          </div>
        )}
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="text-xs border border-slate-200 rounded-lg px-3 py-2 text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-brand-900/20"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending ({counts.pending})</option>
          <option value="in progress">In Progress ({counts['in progress']})</option>
          <option value="completed">Completed ({counts.completed})</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No tasks found"
            description={!isAdmin ? "No tasks assigned to you" : "Create the first task"}
            action={isAdmin && <Button size="sm" onClick={openCreate}><Plus className="h-4 w-4 mr-1.5" />New Task</Button>}
          />
        ) : (
          <div className="divide-y divide-slate-50">
            {filtered.map(task => (
              <div key={task._id} className="px-6 py-4 flex items-start gap-4 hover:bg-slate-50 transition-colors">
                {/* Priority bar */}
                <div className={`w-1 h-full rounded-full self-stretch flex-shrink-0 mt-1 ${
                  task.priority === 'high' ? 'bg-red-400' : task.priority === 'medium' ? 'bg-amber-400' : 'bg-green-400'
                }`} style={{ minHeight: '40px' }} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 flex-wrap">
                    <p className={`text-sm font-medium ${task.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                      {task.title}
                    </p>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border capitalize ${PRIORITY_STYLES[task.priority]}`}>
                      {task.priority}
                    </span>
                    {task.jobRef && (
                      <span className="text-xs font-mono text-brand-900 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200">
                        {task.jobRef}
                      </span>
                    )}
                  </div>
                  {task.description && (
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{task.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    {/* Assignees */}
                    <div className="flex items-center gap-1 flex-wrap">
                      {(task.assignedTo || []).map(u => (
                        <span key={u} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{u}</span>
                      ))}
                    </div>
                    {task.dueDate && (
                      <span className={`text-xs ${new Date(task.dueDate) < new Date() && task.status !== 'completed' ? 'text-red-500 font-medium' : 'text-slate-400'}`}>
                        Due {task.dueDate}
                      </span>
                    )}
                    {task.assignedBy && (
                      <span className="text-xs text-slate-400">by {task.assignedBy}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Status select */}
                  <select
                    value={task.status}
                    onChange={e => statusMutation.mutate({ id: task._id, status: e.target.value })}
                    className={`text-xs font-medium px-2 py-1 rounded-lg border cursor-pointer focus:outline-none ${STATUS_STYLES[task.status]}`}
                  >
                    <option value="pending">Pending</option>
                    <option value="in progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                  {isAdmin && (
                    <>
                      <Button variant="ghost" size="sm" onClick={() => openEdit(task)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(task)}>
                        <Trash2 className="h-3.5 w-3.5 text-red-500" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit modal */}
      <Dialog open={modalOpen} onClose={closeModal} title={editing ? 'Edit Task' : 'New Task'} size="lg">
        <form onSubmit={handleSubmit(d => saveMutation.mutate(d))}>
          <DialogBody className="space-y-4">
            <FormField label="Title" required error={errors.title}>
              <Input error={errors.title} placeholder="Task title..." {...register('title', { required: 'Required' })} />
            </FormField>
            <FormField label="Description" error={errors.description}>
              <Textarea placeholder="Details, instructions..." rows={3} {...register('description')} />
            </FormField>
            <FormField label="Assign To" error={errors.assignedTo}>
              <input type="hidden" {...register('assignedTo')} />
              <div className="flex flex-wrap gap-2 p-2 border border-slate-200 rounded-lg min-h-[44px] bg-white">
                {users.map(u => {
                  const active = selectedUsers.includes(u.username);
                  return (
                    <button
                      key={u._id} type="button" onClick={() => toggleUser(u.username)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                        active ? 'bg-brand-900 text-white border-brand-900' : 'bg-white text-slate-600 border-slate-300 hover:border-brand-900 hover:text-brand-900'
                      }`}
                    >
                      {u.username}
                    </button>
                  );
                })}
              </div>
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Priority" error={errors.priority}>
                <Select {...register('priority')}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </Select>
              </FormField>
              <FormField label="Status" error={errors.status}>
                <Select {...register('status')}>
                  <option value="pending">Pending</option>
                  <option value="in progress">In Progress</option>
                  <option value="completed">Completed</option>
                </Select>
              </FormField>
              <FormField label="Due Date" error={errors.dueDate}>
                <Input type="date" {...register('dueDate')} />
              </FormField>
              <FormField label="Job Reference (ATP #)" error={errors.jobRef}>
                <Input placeholder="e.g. ATP-26-001" {...register('jobRef')} />
              </FormField>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="secondary" type="button" onClick={closeModal}>Cancel</Button>
            <Button type="submit" loading={saveMutation.isPending}>{editing ? 'Save Changes' : 'Create Task'}</Button>
          </DialogFooter>
        </form>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget._id)}
        loading={deleteMutation.isPending}
        title="Delete Task"
        description={`Delete "${deleteTarget?.title}"? This cannot be undone.`}
      />
    </div>
  );
}

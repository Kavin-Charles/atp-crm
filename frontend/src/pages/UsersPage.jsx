import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Plus, Pencil, Trash2, ShieldCheck, ShieldAlert } from 'lucide-react';
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
import Spinner from '@/components/ui/Spinner';
import Dialog, { DialogBody, DialogFooter } from '@/components/ui/Dialog';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';

const ROLE_OPTIONS = ['admin', 'manager', 'designer'];

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const qc = useQueryClient();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: usersApi.list,
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const saveMutation = useMutation({
    mutationFn: (data) => {
      // Remove empty password on edit so it doesn't overwrite
      const payload = { ...data };
      if (editing && !payload.password) delete payload.password;
      return editing ? usersApi.update(editing._id, payload) : usersApi.create(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      toast.success(editing ? 'User updated' : 'User created');
      closeModal();
    },
    onError: (err) => toast.error(typeof err === 'string' ? err : 'Failed to save user'),
  });

  const deleteMutation = useMutation({
    mutationFn: usersApi.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      toast.success('User deleted');
      setDeleteTarget(null);
    },
    onError: (err) => toast.error(typeof err === 'string' ? err : 'Failed to delete'),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }) => usersApi.update(id, { active }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      toast.success('User status updated');
    },
    onError: () => toast.error('Failed to update status'),
  });

  function openCreate() {
    setEditing(null);
    reset({ role: 'designer' });
    setModalOpen(true);
  }

  function openEdit(u) {
    setEditing(u);
    reset({
      username: u.username,
      name: u.name,
      role: u.role,
      password: '',
    });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditing(null);
    reset({});
  }

  const isSelf = (u) => u._id === currentUser?._id;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="Users"
        description="Manage system users and roles"
        action={
          <Button onClick={openCreate} size="sm">
            <Plus className="h-4 w-4 mr-1.5" /> New User
          </Button>
        }
      />

      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : users.length === 0 ? (
          <EmptyState
            title="No users yet"
            description="Create the first user account"
            action={<Button onClick={openCreate} size="sm"><Plus className="h-4 w-4 mr-1.5" />New User</Button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {['Name', 'Username', 'Role', 'Status', 'Created', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          u.role === 'admin'
                            ? 'bg-red-50 text-red-700'
                            : u.role === 'manager'
                            ? 'bg-brand-100 text-brand-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {(u.name || u.username || '?').charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-slate-900">{u.name || '—'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500 font-mono text-xs">{u.username}</td>
                    <td className="px-4 py-3"><Badge status={u.role} /></td>
                    <td className="px-4 py-3">
                      {u.active !== false ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                          <ShieldCheck className="h-3.5 w-3.5" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400">
                          <ShieldAlert className="h-3.5 w-3.5" /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{formatDate(u.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(u)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        {!isSelf(u) && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleMutation.mutate({ id: u._id, active: u.active === false })}
                              title={u.active !== false ? 'Deactivate' : 'Activate'}
                            >
                              {u.active !== false ? (
                                <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />
                              ) : (
                                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                              )}
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(u)}>
                              <Trash2 className="h-3.5 w-3.5 text-red-500" />
                            </Button>
                          </>
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
      <Dialog open={modalOpen} onClose={closeModal} title={editing ? 'Edit User' : 'New User'} size="sm">
        <form onSubmit={handleSubmit((d) => saveMutation.mutate(d))}>
          <DialogBody className="space-y-4">
            <FormField label="Full Name" required error={errors.name}>
              <Input
                placeholder="John Doe"
                error={errors.name}
                {...register('name', { required: 'Required' })}
              />
            </FormField>
            <FormField label="Username" required error={errors.username}>
              <Input
                placeholder="johndoe"
                autoComplete="username"
                error={errors.username}
                {...register('username', { required: 'Required' })}
              />
            </FormField>
            <FormField
              label={editing ? 'New Password' : 'Password'}
              required={!editing}
              error={errors.password}
            >
              <Input
                type="password"
                placeholder={editing ? 'Leave blank to keep current' : 'Enter password'}
                autoComplete="new-password"
                error={errors.password}
                {...register('password', editing ? {} : { required: 'Required' })}
              />
            </FormField>
            <FormField label="Role" error={errors.role}>
              <Select {...register('role')}>
                {ROLE_OPTIONS.map((r) => (
                  <option key={r} value={r} className="capitalize">{r}</option>
                ))}
              </Select>
            </FormField>
          </DialogBody>
          <DialogFooter>
            <Button variant="secondary" type="button" onClick={closeModal}>Cancel</Button>
            <Button type="submit" loading={saveMutation.isPending}>
              {editing ? 'Save Changes' : 'Create User'}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget._id)}
        loading={deleteMutation.isPending}
        title="Delete User"
        description={`Delete user "${deleteTarget?.name || deleteTarget?.username}"? This cannot be undone.`}
      />
    </div>
  );
}

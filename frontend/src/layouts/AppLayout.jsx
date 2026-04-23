import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Inbox, FileText, Briefcase,
  Upload, Database, Users, LogOut,
  ChevronLeft, ChevronRight, KeyRound,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '@/api/auth';
import Dialog, { DialogBody, DialogFooter } from '@/components/ui/Dialog';
import FormField from '@/components/shared/FormField';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { toast } from 'sonner';

const NAV_ITEMS = [
  { label: 'Dashboard',   icon: LayoutDashboard, path: '/',          exact: true },
  { label: 'Enquiries',   icon: Inbox,            path: '/enquiries'              },
  { label: 'Quotes',      icon: FileText,         path: '/quotes',   roles: ['admin', 'manager'] },
  { label: 'Jobs',        icon: Briefcase,        path: '/jobs'                   },
  { label: 'Import',      icon: Upload,           path: '/import',   roles: ['admin', 'manager'] },
  { label: 'Data Viewer', icon: Database,         path: '/data',     roles: ['admin'] },
  { label: 'Users',       icon: Users,            path: '/users',    roles: ['admin'] },
];

export default function AppLayout() {
  const { user, logout, can } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const handleLogout = async () => {
    await logout();
    toast.success('Signed out');
    navigate('/login');
  };

  const openPw = () => { reset(); setPwOpen(true); };
  const closePw = () => { reset(); setPwOpen(false); };

  const onChangePw = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setPwLoading(true);
    try {
      await authApi.changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword });
      toast.success('Password changed successfully');
      closePw();
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Failed to change password');
    } finally {
      setPwLoading(false);
    }
  };

  const visibleItems = NAV_ITEMS.filter((item) =>
    !item.roles || item.roles.some((r) => can(r))
  );

  return (
    <div className="flex h-screen overflow-hidden bg-brand-50">
      {/* Sidebar */}
      <aside
        className={`flex flex-col bg-brand-900 text-white transition-all duration-200 flex-shrink-0 ${
          collapsed ? 'w-16' : 'w-60'
        }`}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-brand-800">
          <img src="/logo.png" alt="TTP" className={`flex-shrink-0 object-contain ${collapsed ? 'h-7 w-7' : 'h-8 w-8'}`} />
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white leading-tight">TTP CRM</p>
              <p className="text-xs text-brand-300 truncate">Tracetech PCB</p>
            </div>
          )}
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="p-1.5 rounded-lg text-brand-300 hover:text-white hover:bg-brand-800 transition-colors flex-shrink-0"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
          {visibleItems.map(({ label, icon: Icon, path, exact }) => (
            <NavLink
              key={path}
              to={path}
              end={exact}
              className={({ isActive }) =>
                `flex items-center gap-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-800 text-white border-l-2 border-brand-500 pl-[10px] pr-3'
                    : 'text-brand-300 hover:text-white hover:bg-brand-800 px-3'
                }`
              }
              title={collapsed ? label : undefined}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="border-t border-brand-800 p-3">
          <div className={`flex items-center gap-2 ${collapsed ? 'justify-center' : ''}`}>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
                <p className="text-xs text-brand-300 capitalize">{user?.role}</p>
              </div>
            )}
            <button
              onClick={openPw}
              className="p-1.5 rounded-lg text-brand-300 hover:text-white hover:bg-brand-800 transition-colors flex-shrink-0"
              title="Change password"
            >
              <KeyRound className="h-4 w-4" />
            </button>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-brand-300 hover:text-red-400 hover:bg-brand-800 transition-colors flex-shrink-0"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>

      {/* Change Password Dialog */}
      <Dialog open={pwOpen} onClose={closePw} title="Change Password" size="sm">
        <form onSubmit={handleSubmit(onChangePw)}>
          <DialogBody className="space-y-4">
            <FormField label="Current Password" required error={errors.currentPassword}>
              <Input
                type="password"
                placeholder="Enter current password"
                error={errors.currentPassword}
                {...register('currentPassword', { required: 'Required' })}
              />
            </FormField>
            <FormField label="New Password" required error={errors.newPassword}>
              <Input
                type="password"
                placeholder="At least 6 characters"
                error={errors.newPassword}
                {...register('newPassword', { required: 'Required', minLength: { value: 6, message: 'Min 6 characters' } })}
              />
            </FormField>
            <FormField label="Confirm New Password" required error={errors.confirmPassword}>
              <Input
                type="password"
                placeholder="Repeat new password"
                error={errors.confirmPassword}
                {...register('confirmPassword', { required: 'Required' })}
              />
            </FormField>
          </DialogBody>
          <DialogFooter>
            <Button variant="secondary" type="button" onClick={closePw}>Cancel</Button>
            <Button type="submit" loading={pwLoading}>Change Password</Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}

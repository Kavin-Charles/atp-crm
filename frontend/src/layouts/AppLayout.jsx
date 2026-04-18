import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Inbox, FileText, Briefcase,
  Upload, Database, Users, LogOut,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
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

  const handleLogout = async () => {
    await logout();
    toast.success('Signed out');
    navigate('/login');
  };

  const visibleItems = NAV_ITEMS.filter((item) =>
    !item.roles || item.roles.some((r) => can(r))
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar */}
      <aside
        className={`flex flex-col bg-slate-900 text-white transition-all duration-200 flex-shrink-0 ${
          collapsed ? 'w-16' : 'w-60'
        }`}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-700/50">
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white leading-tight">ATP CRM</p>
              <p className="text-xs text-slate-400 truncate">Tracetech PCB</p>
            </div>
          )}
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors flex-shrink-0"
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
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-900 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
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
        <div className="border-t border-slate-700/50 p-3">
          <div className={`flex items-center gap-2 ${collapsed ? 'justify-center' : ''}`}>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
                <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors flex-shrink-0"
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
    </div>
  );
}

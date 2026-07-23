import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Clock, CheckCircle2, AlertCircle, LogOut, Filter, Calendar, UserCheck, Shield } from 'lucide-react';
import { attendanceApi } from '@/api/attendance';
import { usersApi } from '@/api/users';
import { useAuth } from '@/context/AuthContext';
import Spinner from '@/components/ui/Spinner';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { format, formatDistanceStrict, differenceInSeconds } from 'date-fns';

const EIGHT_HOURS_SEC = 8 * 60 * 60; // 28,800 seconds

export default function AttendancePage() {
  const { user, can } = useAuth();
  const isAdminOrManager = can('admin', 'manager');

  const [selectedUser, setSelectedUser] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Fetch users for admin/manager filter
  const { data: usersList = [] } = useQuery({
    queryKey: ['users'],
    queryFn: usersApi.list,
    enabled: isAdminOrManager,
  });

  // Current active session query
  const { data: currentData, isLoading: currentLoading, refetch: refetchCurrent } = useQuery({
    queryKey: ['attendance', 'current'],
    queryFn: attendanceApi.getCurrent,
    refetchInterval: 15000,
  });

  // Attendance history query
  const { data: logs = [], isLoading: logsLoading, refetch: refetchLogs } = useQuery({
    queryKey: ['attendance', 'list', selectedUser, statusFilter, startDate, endDate],
    queryFn: () => attendanceApi.list({
      username: selectedUser,
      status: statusFilter,
      startDate,
      endDate,
    }),
    refetchInterval: 30000,
  });

  // Local live tick counter for real-time countdown timer
  const [nowSec, setNowSec] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNowSec(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const activeSession = currentData?.activeSession;
  let elapsedSec = 0;
  let remainingSec = EIGHT_HOURS_SEC;
  let progressPct = 0;

  if (activeSession?.loginTime) {
    const loginMs = new Date(activeSession.loginTime).getTime();
    elapsedSec = Math.max(0, Math.floor((nowSec - loginMs) / 1000));
    remainingSec = Math.max(0, EIGHT_HOURS_SEC - elapsedSec);
    progressPct = Math.min(100, Math.max(0, (elapsedSec / EIGHT_HOURS_SEC) * 100));
  }

  const formatHMS = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  const getDurationText = (log) => {
    const start = new Date(log.loginTime);
    const end = log.logoutTime ? new Date(log.logoutTime) : (log.status === 'active' ? new Date(nowSec) : new Date());
    const sec = Math.max(0, differenceInSeconds(end, start));
    const hours = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    return `${hours}h ${mins}m`;
  };

  // Stats calculation
  const totalCount = logs.length;
  const activeCount = logs.filter(l => l.status === 'active').length;
  const completedCount = logs.filter(l => l.status === 'completed').length;
  const autoClosedCount = logs.filter(l => l.status === 'auto_closed').length;

  const resetFilters = () => {
    setSelectedUser('');
    setStatusFilter('');
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-900 tracking-tight flex items-center gap-2.5">
            <Clock className="h-6 w-6 text-brand-600" />
            Attendance Log
          </h1>
          <p className="text-sm text-brand-500 mt-1">
            Logs user login sessions. Every login session automatically closes after 8 hours.
          </p>
        </div>
      </div>

      {/* Current Active Session Widget */}
      {currentLoading ? (
        <div className="bg-white rounded-xl border border-brand-200 p-6 flex justify-center">
          <Spinner />
        </div>
      ) : activeSession ? (
        <div className="bg-gradient-to-r from-brand-900 via-brand-800 to-slate-900 text-white rounded-xl p-6 shadow-lg relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 opacity-10 flex items-center pr-8 pointer-events-none">
            <Clock className="w-64 h-64 text-white" />
          </div>

          <div className="relative z-10 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-semibold tracking-wider uppercase text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                  Active Attendance Session
                </span>
              </div>
              <span className="text-xs text-brand-300">
                Started: <strong className="text-white">{format(new Date(activeSession.loginTime), 'dd MMM yyyy, hh:mm:ss a')}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="bg-brand-950/50 backdrop-blur border border-brand-700/50 rounded-lg p-4">
                <p className="text-xs font-medium text-brand-300 uppercase">Elapsed Session Time</p>
                <p className="text-2xl font-bold text-white mt-1 font-mono tracking-tight">
                  {formatHMS(elapsedSec)}
                </p>
              </div>

              <div className="bg-brand-950/50 backdrop-blur border border-brand-700/50 rounded-lg p-4">
                <p className="text-xs font-medium text-amber-300 uppercase">Auto-Close Remaining</p>
                <p className="text-2xl font-bold text-amber-400 mt-1 font-mono tracking-tight">
                  {formatHMS(remainingSec)}
                </p>
              </div>

              <div className="bg-brand-950/50 backdrop-blur border border-brand-700/50 rounded-lg p-4">
                <p className="text-xs font-medium text-brand-300 uppercase">Auto-Close Deadline</p>
                <p className="text-lg font-semibold text-white mt-1.5">
                  {format(new Date(new Date(activeSession.loginTime).getTime() + EIGHT_HOURS_SEC * 1000), 'hh:mm:ss a')}
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs text-brand-300">
                <span>0h</span>
                <span>8h Session Limit</span>
              </div>
              <div className="w-full h-2.5 bg-brand-950 rounded-full overflow-hidden border border-brand-700/30">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-500 transition-all duration-500 rounded-full"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-200/80 rounded-lg text-slate-600">
              <LogOut className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">No Active Attendance Session</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Your previous session was closed. Logging in again creates a new 8-hour session.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-brand-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-brand-500">Total Logs</p>
            <p className="text-2xl font-bold text-brand-900 mt-1">{totalCount}</p>
          </div>
          <div className="p-3 bg-brand-50 text-brand-600 rounded-lg">
            <Calendar className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-brand-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-emerald-600">Active Sessions</p>
            <p className="text-2xl font-bold text-emerald-700 mt-1">{activeCount}</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <UserCheck className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-brand-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-blue-600">Completed Sessions</p>
            <p className="text-2xl font-bold text-blue-700 mt-1">{completedCount}</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-brand-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-amber-600">Auto-Closed (8h)</p>
            <p className="text-2xl font-bold text-amber-700 mt-1">{autoClosedCount}</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <AlertCircle className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Filters & Table */}
      <div className="bg-white rounded-xl border border-brand-200 shadow-sm overflow-hidden">
        {/* Filters toolbar */}
        <div className="p-4 border-b border-brand-100 bg-brand-50/50 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-medium text-brand-700 mr-2">
            <Filter className="h-4 w-4 text-brand-500" />
            Filters:
          </div>

          {isAdminOrManager && (
            <div className="w-48">
              <Select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
              >
                <option value="">All Users</option>
                {usersList.map((u) => (
                  <option key={u._id} value={u.username}>{u.name} ({u.username})</option>
                ))}
              </Select>
            </div>
          )}

          <div className="w-36">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="auto_closed">Auto Closed</option>
            </Select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-brand-600">
            <span>From:</span>
            <Input
              type="date"
              className="w-36 text-xs py-1"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs text-brand-600">
            <span>To:</span>
            <Input
              type="date"
              className="w-36 text-xs py-1"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          {(selectedUser || statusFilter || startDate || endDate) && (
            <Button variant="ghost" size="sm" onClick={resetFilters} className="text-xs text-brand-600">
              Clear
            </Button>
          )}
        </div>

        {/* Attendance Logs Table */}
        {logsLoading ? (
          <div className="py-12 flex justify-center">
            <Spinner />
          </div>
        ) : logs.length === 0 ? (
          <div className="py-12 text-center">
            <Clock className="h-10 w-10 text-brand-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-brand-700">No attendance records found</p>
            <p className="text-xs text-brand-400 mt-1">Try adjusting your filters or check back after logging in.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-brand-50/80 text-brand-700 text-xs font-semibold uppercase tracking-wider border-b border-brand-100">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Login Time</th>
                  <th className="py-3 px-4">Logout / Closed Time</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-100">
                {logs.map((log) => {
                  const isLogActive = log.status === 'active';
                  const isAutoClosed = log.status === 'auto_closed';

                  return (
                    <tr key={log._id} className="hover:bg-brand-50/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-medium text-brand-900">{log.name || log.username}</div>
                        <div className="text-xs text-brand-400">@{log.username}</div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-brand-100 text-brand-700 font-medium capitalize">
                          {log.role || 'user'}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono text-xs text-brand-800">
                        {log.loginTime ? format(new Date(log.loginTime), 'dd MMM yyyy, hh:mm:ss a') : '—'}
                      </td>

                      <td className="py-3 px-4 font-mono text-xs text-brand-800">
                        {log.logoutTime ? (
                          format(new Date(log.logoutTime), 'dd MMM yyyy, hh:mm:ss a')
                        ) : isLogActive ? (
                          <span className="text-emerald-600 font-sans font-medium flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            Session active
                          </span>
                        ) : '—'}
                      </td>

                      <td className="py-3 px-4 text-xs font-semibold text-brand-900">
                        {getDurationText(log)}
                      </td>

                      <td className="py-3 px-4">
                        {isLogActive ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Active
                          </span>
                        ) : isAutoClosed ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200" title="Automatically closed after 8 hours limit">
                            <AlertCircle className="h-3 w-3 text-amber-500" />
                            Auto Closed (8h)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                            <CheckCircle2 className="h-3 w-3 text-blue-500" />
                            Completed
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

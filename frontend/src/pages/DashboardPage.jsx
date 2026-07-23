import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Briefcase, CheckSquare, Inbox, ArrowRight, Calendar, User, Clock, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { jobsApi } from '@/api/jobs';
import { tasksApi } from '@/api/tasks';
import { enquiriesApi } from '@/api/enquiries';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import { format } from 'date-fns';

export default function DashboardPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // Query jobs (Backend automatically scopes to user's jobs if non-admin)
  const { data: jobs = [], isLoading: jobsLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn: jobsApi.list,
  });

  // Query tasks (Backend automatically scopes to assigned tasks if non-admin)
  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: tasksApi.list,
  });

  // Query top 5 enquiries (only for admin)
  const { data: enquiries = [], isLoading: enquiriesLoading } = useQuery({
    queryKey: ['enquiries'],
    queryFn: enquiriesApi.list,
    enabled: isAdmin,
  });

  const top5Enquiries = enquiries.slice(0, 5);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-900 tracking-tight">Dashboard</h1>
          <p className="text-sm text-brand-500 mt-1">
            Welcome back, <span className="font-semibold text-brand-800">{user?.name}</span> ({user?.role})
          </p>
        </div>
      </div>

      {/* Admin View: Top 5 Enquiries */}
      {isAdmin && (
        <div className="bg-white rounded-xl border border-brand-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-brand-100 bg-brand-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Inbox className="h-5 w-5 text-brand-600" />
              <h2 className="font-semibold text-brand-900 text-base">Top 5 Enquiries</h2>
              <span className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full font-medium">
                Latest Leads
              </span>
            </div>
            <Link
              to="/enquiries"
              className="text-xs font-medium text-brand-600 hover:text-brand-800 flex items-center gap-1 transition-colors"
            >
              View All Enquiries <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {enquiriesLoading ? (
            <div className="py-8 flex justify-center"><Spinner /></div>
          ) : top5Enquiries.length === 0 ? (
            <div className="py-8 text-center text-sm text-brand-400">No enquiries recorded yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-brand-50/50 text-brand-700 text-xs font-semibold uppercase tracking-wider border-b border-brand-100">
                  <tr>
                    <th className="py-2.5 px-4">Client Name</th>
                    <th className="py-2.5 px-4">Company</th>
                    <th className="py-2.5 px-4">Job Name</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-100">
                  {top5Enquiries.map((enq) => (
                    <tr key={enq._id} className="hover:bg-brand-50/40 transition-colors">
                      <td className="py-3 px-4 font-medium text-brand-900">{enq.clientName || '—'}</td>
                      <td className="py-3 px-4 text-brand-600">{enq.company || '—'}</td>
                      <td className="py-3 px-4 text-brand-800 font-medium">{enq.jobName || '—'}</td>
                      <td className="py-3 px-4"><Badge status={enq.status} /></td>
                      <td className="py-3 px-4 text-xs text-brand-500 font-mono">
                        {enq.createdAt ? format(new Date(enq.createdAt), 'dd MMM yyyy') : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Main Grid: Jobs & Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Jobs Section */}
        <div className="bg-white rounded-xl border border-brand-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-brand-100 bg-brand-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-amber-600" />
              <h2 className="font-semibold text-brand-900 text-base">
                {isAdmin ? 'Jobs Overview' : 'My Jobs'}
              </h2>
              <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-medium">
                {jobs.length} total
              </span>
            </div>
            <Link
              to="/jobs"
              className="text-xs font-medium text-brand-600 hover:text-brand-800 flex items-center gap-1 transition-colors"
            >
              View All Jobs <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {jobsLoading ? (
            <div className="py-12 flex justify-center flex-1 items-center"><Spinner /></div>
          ) : jobs.length === 0 ? (
            <div className="py-12 text-center text-sm text-brand-400 flex-1">
              No jobs assigned or available.
            </div>
          ) : (
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left text-sm">
                <thead className="bg-brand-50/50 text-brand-700 text-xs font-semibold uppercase tracking-wider border-b border-brand-100">
                  <tr>
                    <th className="py-2.5 px-4">ATP #</th>
                    <th className="py-2.5 px-4">Job Name</th>
                    <th className="py-2.5 px-4">Client</th>
                    <th className="py-2.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-100">
                  {jobs.slice(0, 8).map((job) => (
                    <tr key={job._id} className="hover:bg-brand-50/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-xs text-brand-800">
                        {job.atpNumber || '—'}
                      </td>
                      <td className="py-3 px-4 font-medium text-brand-900">{job.jobName || '—'}</td>
                      <td className="py-3 px-4 text-xs text-brand-600">{job.clientName || job.company || '—'}</td>
                      <td className="py-3 px-4"><Badge status={job.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Tasks Section */}
        <div className="bg-white rounded-xl border border-brand-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-brand-100 bg-brand-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-emerald-600" />
              <h2 className="font-semibold text-brand-900 text-base">
                {isAdmin ? 'Tasks Overview' : 'My Tasks'}
              </h2>
              <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-medium">
                {tasks.length} total
              </span>
            </div>
            <Link
              to="/tasks"
              className="text-xs font-medium text-brand-600 hover:text-brand-800 flex items-center gap-1 transition-colors"
            >
              View All Tasks <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {tasksLoading ? (
            <div className="py-12 flex justify-center flex-1 items-center"><Spinner /></div>
          ) : tasks.length === 0 ? (
            <div className="py-12 text-center text-sm text-brand-400 flex-1">
              No tasks assigned yet.
            </div>
          ) : (
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left text-sm">
                <thead className="bg-brand-50/50 text-brand-700 text-xs font-semibold uppercase tracking-wider border-b border-brand-100">
                  <tr>
                    <th className="py-2.5 px-4">Task Title</th>
                    {isAdmin && <th className="py-2.5 px-4">Assigned To</th>}
                    <th className="py-2.5 px-4">Priority</th>
                    <th className="py-2.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-100">
                  {tasks.slice(0, 8).map((task) => (
                    <tr key={task._id} className="hover:bg-brand-50/40 transition-colors">
                      <td className="py-3 px-4 font-medium text-brand-900">{task.title || '—'}</td>
                      {isAdmin && (
                        <td className="py-3 px-4 text-xs text-brand-600">
                          {task.assignedTo || '—'}
                        </td>
                      )}
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                          task.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                          task.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                          task.priority === 'medium' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {task.priority || 'medium'}
                        </span>
                      </td>
                      <td className="py-3 px-4"><Badge status={task.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

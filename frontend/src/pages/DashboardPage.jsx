import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Inbox, FileText, Briefcase, CheckCircle } from 'lucide-react';
import { statsApi } from '@/api/stats';
import { jobsApi } from '@/api/jobs';
import StatCard from '@/components/shared/StatCard';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import { formatDate } from '@/lib/utils';

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useQuery({ queryKey: ['stats'], queryFn: statsApi.get });
  const { data: jobs = [], isLoading: jobsLoading } = useQuery({ queryKey: ['jobs'], queryFn: jobsApi.list });

  const recentJobs = jobs.slice(0, 10);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-0.5">Overview of your CRM pipeline</p>
      </div>

      {/* Stats */}
      {statsLoading ? (
        <div className="flex justify-center py-8"><Spinner /></div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Total Enquiries"
            value={stats?.enquiries.total}
            sub={`${stats?.enquiries.new} new`}
            icon={Inbox}
            color="blue"
          />
          <StatCard
            label="Total Quotes"
            value={stats?.quotes.total}
            sub={`${stats?.quotes.pending} pending`}
            icon={FileText}
            color="indigo"
          />
          <StatCard
            label="Active Jobs"
            value={stats?.jobs.inProgress}
            sub={`${stats?.jobs.total} total`}
            icon={Briefcase}
            color="amber"
          />
          <StatCard
            label="Payments Received"
            value={stats?.payments.received}
            sub={`${stats?.payments.pending} pending`}
            icon={CheckCircle}
            color="green"
          />
        </div>
      )}

      {/* Recent Jobs */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Recent Jobs</h2>
          <Link to="/jobs" className="text-xs text-brand-900 font-medium hover:underline">
            View all →
          </Link>
        </div>
        {jobsLoading ? (
          <div className="flex justify-center py-10"><Spinner /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {['ATP #', 'Company', 'Job Name', 'Owner', 'Designer', 'Status', 'Payment'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentJobs.map((job) => (
                  <tr key={job._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-brand-900">{job.atpNumber}</td>
                    <td className="px-4 py-3 text-slate-700">{job.company || '—'}</td>
                    <td className="px-4 py-3 text-slate-700 max-w-[180px] truncate">{job.jobName || '—'}</td>
                    <td className="px-4 py-3 text-slate-500">{job.jobOwner || '—'}</td>
                    <td className="px-4 py-3 text-slate-500">{job.designer || '—'}</td>
                    <td className="px-4 py-3"><Badge status={job.status} /></td>
                    <td className="px-4 py-3"><Badge status={job.paymentStatus} /></td>
                  </tr>
                ))}
                {!recentJobs.length && (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-slate-400 text-sm">
                      No jobs yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

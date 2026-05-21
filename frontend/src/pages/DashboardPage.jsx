import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Inbox, FileText, Briefcase, CheckCircle, Send, HardDrive } from 'lucide-react';
import { statsApi } from '@/api/stats';
import { jobsApi } from '@/api/jobs';
import StatCard from '@/components/shared/StatCard';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import { formatDate } from '@/lib/utils';

const JOB_STATUSES = ['in progress', 'on hold', 'completed', 'cancelled'];

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useQuery({ queryKey: ['stats'], queryFn: statsApi.get });
  const { data: jobs = [], isLoading: jobsLoading } = useQuery({ queryKey: ['jobs'], queryFn: jobsApi.list });

  const [statusFilter, setStatusFilter] = useState('in progress');

  // Exclude paid jobs, apply status filter
  const displayJobs = jobs
    .filter((j) => j.paymentStatus !== 'received')
    .filter((j) => statusFilter ? j.status === statusFilter : true)
    .slice(0, 15);

  function isOverHours(job) {
    const q = parseFloat(job.quotedHours);
    const w = parseFloat(job.workedHours);
    return !isNaN(q) && !isNaN(w) && w > q;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-900 tracking-tight">Dashboard</h1>
        <p className="text-sm text-brand-400 mt-1">Overview of your CRM pipeline</p>
      </div>

      {/* Stats */}
      {statsLoading ? (
        <div className="flex justify-center py-8"><Spinner /></div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <StatCard
            label="Total Enquiries"
            value={stats?.enquiries.total}
            sub={`${stats?.enquiries.new} new`}
            subLink="/enquiries?status=new"
            icon={Inbox}
            color="brand"
          />
          <StatCard
            label="Total Quotes"
            value={stats?.quotes.total}
            sub={`${stats?.quotes.pending} pending`}
            icon={FileText}
            color="orange"
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
          <StatCard
            label="Released Jobs"
            value={stats?.jobs.released}
            sub={`of ${stats?.jobs.total} total`}
            icon={Send}
            color="brand"
          />
          <StatCard
            label="Backed Up"
            value={stats?.jobs.backedUp}
            sub={`of ${stats?.jobs.total} total`}
            icon={HardDrive}
            color="orange"
          />
        </div>
      )}

      {/* Jobs table */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-brand-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-brand-900">Jobs</h2>
          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-brand-900/20"
            >
              <option value="">All statuses</option>
              {JOB_STATUSES.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
            </select>
            <Link to="/jobs" className="text-xs text-brand-500 font-semibold hover:text-brand-700 hover:underline">
              View all →
            </Link>
          </div>
        </div>
        {jobsLoading ? (
          <div className="flex justify-center py-10"><Spinner /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-200 bg-brand-100">
                  {['ATP #', 'Company', 'Job Name', 'Owner', 'Designer', 'Hrs Q/W', 'Started', 'Status', 'Payment'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-[11px] font-bold text-brand-500 uppercase tracking-widest whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-200">
                {displayJobs.map((job) => {
                  const over = isOverHours(job);
                  return (
                    <tr key={job._id} className={`transition-colors ${over ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-brand-50'}`}>
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-brand-700">{job.atpNumber}</td>
                      <td className="px-4 py-3 text-brand-800">{job.company || '—'}</td>
                      <td className="px-4 py-3 text-brand-800 max-w-[180px] truncate" title={job.jobName}>{job.jobName || '—'}</td>
                      <td className="px-4 py-3 text-brand-500">{job.jobOwner || '—'}</td>
                      <td className="px-4 py-3 text-brand-500">
                        {Array.isArray(job.designer) ? (job.designer.join(' / ') || '—') : (job.designer || '—')}
                      </td>
                      <td className={`px-4 py-3 whitespace-nowrap font-medium ${over ? 'text-red-600' : 'text-brand-500'}`}>
                        <span>{job.quotedHours ?? '—'}</span>
                        <span className="mx-1 text-slate-300">/</span>
                        <span className={over ? 'text-red-600 font-bold' : ''}>{job.workedHours ?? '—'}</span>
                      </td>
                      <td className="px-4 py-3 text-brand-400 whitespace-nowrap text-xs">
                        {job.startedDate ? formatDate(job.startedDate) : '—'}
                      </td>
                      <td className="px-4 py-3"><Badge status={job.status} /></td>
                      <td className="px-4 py-3"><Badge status={job.paymentStatus} /></td>
                    </tr>
                  );
                })}
                {!displayJobs.length && (
                  <tr>
                    <td colSpan={9} className="px-4 py-10 text-center text-brand-400 text-sm">
                      No jobs {statusFilter ? `with status "${statusFilter}"` : ''}
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

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Inbox, FileText, Briefcase, CheckCircle, Send, HardDrive } from 'lucide-react';
import { statsApi } from '@/api/stats';
import StatCard from '@/components/shared/StatCard';
import Spinner from '@/components/ui/Spinner';

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useQuery({ queryKey: ['stats'], queryFn: statsApi.get });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-900 tracking-tight">Dashboard</h1>
        <p className="text-sm text-brand-400 mt-1">Overview of your CRM pipeline statistics</p>
      </div>

      {/* Stats */}
      {statsLoading ? (
        <div className="flex justify-center py-8"><Spinner /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
    </div>
  );
}


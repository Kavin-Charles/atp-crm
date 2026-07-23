import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Briefcase, CheckSquare, Inbox, ArrowRight, Calendar, User, Clock, ShieldCheck, FileText } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { jobsApi } from '@/api/jobs';
import { tasksApi } from '@/api/tasks';
import { enquiriesApi } from '@/api/enquiries';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import Dialog, { DialogBody, DialogFooter } from '@/components/ui/Dialog';
import Button from '@/components/ui/Button';
import { format } from 'date-fns';
import { formatDate } from '@/lib/utils';

export default function DashboardPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

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
                    <th className="py-2.5 px-4">Service</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-100">
                  {top5Enquiries.map((enq) => (
                    <tr
                      key={enq._id}
                      onClick={() => setSelectedEnquiry(enq)}
                      className="hover:bg-brand-50/60 transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-4 font-medium text-brand-900">{enq.name || enq.clientName || '—'}</td>
                      <td className="py-3 px-4 text-brand-600">{enq.company || '—'}</td>
                      <td className="py-3 px-4 text-brand-800 font-medium">{enq.service || '—'}</td>
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
                    <tr
                      key={job._id}
                      onClick={() => setSelectedJob(job)}
                      className="hover:bg-brand-50/60 transition-colors cursor-pointer"
                    >
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
                    <tr
                      key={task._id}
                      onClick={() => setSelectedTask(task)}
                      className="hover:bg-brand-50/60 transition-colors cursor-pointer"
                    >
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

      {/* Enquiry Detail Modal */}
      {selectedEnquiry && (
        <Dialog open={!!selectedEnquiry} onClose={() => setSelectedEnquiry(null)} title={`Enquiry: ${selectedEnquiry.name || selectedEnquiry.company || 'Details'}`} size="md">
          <DialogBody className="space-y-4">
            <div className="flex items-center gap-3">
              <Badge status={selectedEnquiry.status} />
              {selectedEnquiry.source && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium capitalize">
                  Source: {selectedEnquiry.source}
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">Client Name</p>
                <p className="text-sm font-medium text-slate-800">{selectedEnquiry.name || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">Company</p>
                <p className="text-sm font-medium text-slate-800">{selectedEnquiry.company || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">Phone</p>
                <p className="text-sm font-medium text-slate-800">{selectedEnquiry.phone || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">Email</p>
                <p className="text-sm font-medium text-slate-800">{selectedEnquiry.email || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">Service</p>
                <p className="text-sm font-medium text-slate-800">{selectedEnquiry.service || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">Referred By</p>
                <p className="text-sm font-medium text-slate-800">{selectedEnquiry.referredBy || '—'}</p>
              </div>
            </div>
            {selectedEnquiry.address && (
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">Address</p>
                <p className="text-sm text-slate-800">{selectedEnquiry.address}</p>
              </div>
            )}
            {selectedEnquiry.notes && (
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Notes</p>
                <p className="text-sm text-slate-700 bg-slate-50 rounded-lg p-3 whitespace-pre-wrap">{selectedEnquiry.notes}</p>
              </div>
            )}
          </DialogBody>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setSelectedEnquiry(null)}>Close</Button>
            <Link to="/enquiries">
              <Button>Go to Enquiries Page</Button>
            </Link>
          </DialogFooter>
        </Dialog>
      )}

      {/* Job Detail Modal */}
      {selectedJob && (
        <Dialog open={!!selectedJob} onClose={() => setSelectedJob(null)} title={`Job: ${selectedJob.atpNumber} — ${selectedJob.jobName || ''}`} size="lg">
          <DialogBody className="space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <Badge status={selectedJob.status} />
              <Badge status={selectedJob.paymentStatus} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">Client Name</p>
                <p className="text-sm font-medium text-slate-800">{selectedJob.clientName || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">Company</p>
                <p className="text-sm font-medium text-slate-800">{selectedJob.company || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">Job Owner</p>
                <p className="text-sm font-medium text-slate-800">{selectedJob.jobOwner || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">Designer(s)</p>
                <p className="text-sm font-medium text-slate-800">
                  {Array.isArray(selectedJob.designer) ? selectedJob.designer.join(' / ') : selectedJob.designer || '—'}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">Quoted Hours</p>
                <p className="text-sm font-medium text-slate-800">{selectedJob.quotedHours || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">Worked Hours</p>
                <p className="text-sm font-medium text-slate-800">{selectedJob.workedHours || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">Payment Mode</p>
                <p className="text-sm font-medium text-slate-800">{selectedJob.paymentMode || '—'}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">Started</p>
                <p className="text-sm text-slate-800">{selectedJob.startedDate ? formatDate(selectedJob.startedDate) : '—'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">Expected</p>
                <p className="text-sm text-slate-800">{selectedJob.expectedCompletion ? formatDate(selectedJob.expectedCompletion) : '—'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">Released</p>
                <p className="text-sm text-slate-800">{selectedJob.releaseDate ? formatDate(selectedJob.releaseDate) : '—'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">Backup</p>
                <p className="text-sm text-slate-800">{selectedJob.backupDate ? formatDate(selectedJob.backupDate) : '—'}</p>
              </div>
            </div>
            {selectedJob.info && (
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Job Info</p>
                <p className="text-sm text-slate-700 bg-slate-50 rounded-lg p-3 whitespace-pre-wrap">{selectedJob.info}</p>
              </div>
            )}
          </DialogBody>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setSelectedJob(null)}>Close</Button>
            <Link to="/jobs">
              <Button>Go to Jobs Page</Button>
            </Link>
          </DialogFooter>
        </Dialog>
      )}

      {/* Task Detail Modal */}
      {selectedTask && (
        <Dialog open={!!selectedTask} onClose={() => setSelectedTask(null)} title={`Task: ${selectedTask.title}`} size="md">
          <DialogBody className="space-y-4">
            <div className="flex items-center gap-3">
              <Badge status={selectedTask.status} />
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium capitalize border ${
                selectedTask.priority === 'urgent' ? 'bg-red-50 text-red-700 border-red-200' :
                selectedTask.priority === 'high' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                selectedTask.priority === 'medium' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                'bg-gray-50 text-gray-700 border-gray-200'
              }`}>
                Priority: {selectedTask.priority || 'medium'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">Assigned To</p>
                <p className="text-sm font-medium text-slate-800">{selectedTask.assignedTo || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">Assigned By</p>
                <p className="text-sm font-medium text-slate-800">{selectedTask.assignedBy || '—'}</p>
              </div>
              {selectedTask.jobRef && (
                <div className="col-span-2">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">Linked Job Ref</p>
                  <p className="text-sm font-mono font-medium text-brand-900">{selectedTask.jobRef}</p>
                </div>
              )}
            </div>
            {selectedTask.description && (
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Description</p>
                <p className="text-sm text-slate-700 bg-slate-50 rounded-lg p-3 whitespace-pre-wrap">{selectedTask.description}</p>
              </div>
            )}
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">Created Date</p>
              <p className="text-sm text-slate-600">{selectedTask.createdAt ? format(new Date(selectedTask.createdAt), 'dd MMM yyyy, hh:mm a') : '—'}</p>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setSelectedTask(null)}>Close</Button>
            <Link to="/tasks">
              <Button>Go to Tasks Page</Button>
            </Link>
          </DialogFooter>
        </Dialog>
      )}
    </div>
  );
}


import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  ExternalLink,
  DollarSign,
  Clock,
  CheckCircle2,
  Truck,
  AlertCircle,
  // Fix: Added missing MessageCircle icon import
  MessageCircle
} from 'lucide-react';
import { MOCK_JOBS } from '../constants';
import { JobStatus } from '../types';

const StatusBadge = ({ status }: { status: JobStatus }) => {
  const styles: Record<JobStatus, string> = {
    [JobStatus.QUOTE]: 'bg-slate-100 text-slate-600',
    [JobStatus.APPROVED]: 'bg-blue-50 text-blue-600',
    [JobStatus.IN_PROGRESS]: 'bg-yellow-50 text-yellow-600',
    [JobStatus.OUTSOURCED]: 'bg-purple-50 text-purple-600',
    [JobStatus.COMPLETED]: 'bg-green-50 text-green-600',
    [JobStatus.DELIVERED]: 'bg-emerald-100 text-emerald-700',
  };

  const icons: Record<JobStatus, any> = {
    [JobStatus.QUOTE]: Clock,
    [JobStatus.APPROVED]: CheckCircle2,
    [JobStatus.IN_PROGRESS]: Clock,
    [JobStatus.OUTSOURCED]: ExternalLink,
    [JobStatus.COMPLETED]: CheckCircle2,
    [JobStatus.DELIVERED]: Truck,
  };

  const Icon = icons[status];

  return (
    <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${styles[status]}`}>
      <Icon size={12} />
      {status.replace('_', ' ')}
    </span>
  );
};

export const JobManagement = () => {
  const [jobs] = useState(MOCK_JOBS);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Job Management</h1>
          <p className="text-slate-500">Track and manage your printing projects.</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 px-6 py-3 rounded-xl font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-700 transition-colors">
          <Plus size={20} /> Create New Job
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl">
          <Search className="text-slate-400" size={18} />
          <input type="text" placeholder="Search by job ID, title or customer..." className="bg-transparent flex-1 outline-none" />
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium hover:bg-slate-50">
            <Filter size={18} /> Filter Status
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium hover:bg-slate-50">
            Export Jobs
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {jobs.map(job => (
          <div key={job.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:border-blue-200 transition-colors group">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold group-hover:text-blue-600 transition-colors">{job.title}</h3>
                  <StatusBadge status={job.status} />
                  {job.isOutsourced && (
                    <span className="flex items-center gap-1 bg-amber-50 text-amber-600 px-2 py-0.5 rounded text-[10px] font-bold">
                      <AlertCircle size={10} /> OUTSOURCED
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-500">{job.description}</p>
                <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
                  <span>ID: {job.id}</span>
                  <span>•</span>
                  <span>Created: {new Date(job.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex flex-wrap lg:flex-nowrap items-center gap-8">
                <div className="text-right">
                  <p className="text-xs text-slate-400 font-medium uppercase mb-1">Budget</p>
                  <p className="text-xl font-bold">${job.totalAmount.toFixed(2)}</p>
                </div>
                
                <div className="text-right">
                  <p className="text-xs text-slate-400 font-medium uppercase mb-1">Payment</p>
                  <div className="flex flex-col items-end">
                    <p className={`text-sm font-bold ${job.paidAmount >= job.totalAmount ? 'text-green-600' : 'text-orange-600'}`}>
                      ${job.paidAmount.toFixed(2)} Paid
                    </p>
                    <div className="w-24 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                      <div 
                        className="h-full bg-blue-500" 
                        style={{ width: `${(job.paidAmount / job.totalAmount) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-slate-50 rounded-lg transition-colors border">
                    <DollarSign size={20} className="text-slate-600" />
                  </button>
                  <button className="p-2 hover:bg-slate-50 rounded-lg transition-colors border">
                    <MessageCircle className="text-green-600" size={20} />
                  </button>
                  <button className="p-2 hover:bg-slate-50 rounded-lg transition-colors border">
                    <MoreHorizontal size={20} className="text-slate-600" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

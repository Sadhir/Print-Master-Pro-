
import React, { useState, useEffect } from 'react';
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
  MessageCircle,
  X,
  Globe,
  Share2,
  Calendar,
  Hash,
  ArrowRight,
  Trash2,
  Edit2,
  User,
  Mail,
  Send,
  Sparkles,
  Loader2,
  CheckCircle,
  Video,
  Facebook,
  FileText,
  Star,
  MapPin,
  UserCheck,
  Briefcase,
  Contact,
  Phone,
  Calculator,
  TrendingUp,
  Percent,
  Timer,
  Factory,
  Home
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { JobStatus, CurrencyCode, UserRole, OrderSource, DeliveryMethod } from '../types';
import { generateProfessionalMessage, refineAndCheckMessage, MessageType } from '../services/geminiService';

const StatusBadge = ({ status }: { status: JobStatus }) => {
  const styles: Record<JobStatus, string> = {
    [JobStatus.QUOTE]: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    [JobStatus.APPROVED]: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    [JobStatus.IN_PROGRESS]: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
    [JobStatus.OUTSOURCED]: 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    [JobStatus.COMPLETED]: 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    [JobStatus.DELIVERED]: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  };

  const icons: Record<JobStatus, any> = {
    [JobStatus.QUOTE]: Clock,
    [JobStatus.APPROVED]: CheckCircle2,
    [JobStatus.IN_PROGRESS]: Timer,
    [JobStatus.OUTSOURCED]: ExternalLink,
    [JobStatus.COMPLETED]: CheckCircle2,
    [JobStatus.DELIVERED]: Truck,
  };

  const Icon = icons[status];

  return (
    <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${styles[status]}`}>
      <Icon size={10} strokeWidth={3} />
      {status.replace('_', ' ')}
    </span>
  );
};

export const JobManagement = () => {
  const { jobs, addJob, deleteJob, updateJob, updateJobStatus, currentCurrency, customers, suppliers, branches, currentUser, reviewLinks } = useApp();
  const [showModal, setShowModal] = useState(false);
  const isAdmin = currentUser.role === UserRole.ADMIN;
  
  const [productionFilter, setProductionFilter] = useState<'ALL' | 'INTERNAL' | 'OUTSOURCED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const [showCommHub, setShowCommHub] = useState<string | null>(null);
  const [commType, setCommType] = useState<MessageType>('DISPATCH_READY');
  const [aiMessage, setAiMessage] = useState('');

  const [newJob, setNewJob] = useState({
    title: '',
    description: '',
    customerId: '',
    totalAmount: 0,
    paidAmount: 0,
    deliveryDate: '',
    isOutsourced: false,
  });

  const filteredJobs = jobs.filter(j => {
    const matchesSearch = j.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         j.customerName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProduction = productionFilter === 'ALL' || 
                             (productionFilter === 'INTERNAL' && !j.isOutsourced) || 
                             (productionFilter === 'OUTSOURCED' && j.isOutsourced);
    return matchesSearch && matchesProduction;
  });

  const handleStatusChange = (jobId: string, newStatus: JobStatus) => {
    updateJobStatus(jobId, newStatus);
    if (newStatus === JobStatus.COMPLETED) {
      setCommType('DISPATCH_READY');
      setShowCommHub(jobId);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const customer = customers.find(c => c.id === newJob.customerId);
    const jobData: any = {
      ...newJob,
      customerName: customer?.name || 'Walk-in',
      status: newJob.isOutsourced ? JobStatus.OUTSOURCED : JobStatus.APPROVED,
      source: OrderSource.WALK_IN,
      currency: currentCurrency,
      items: [],
      jobTakenDate: new Date().toISOString().split('T')[0],
      advancePayment: newJob.paidAmount,
      createWhatsAppGroup: false,
    };
    addJob(jobData);
    setShowModal(false);
  };

  const getJobProgress = (status: JobStatus) => {
    const steps: Record<JobStatus, number> = {
      [JobStatus.QUOTE]: 0,
      [JobStatus.APPROVED]: 20,
      [JobStatus.IN_PROGRESS]: 50,
      [JobStatus.OUTSOURCED]: 60,
      [JobStatus.COMPLETED]: 90,
      [JobStatus.DELIVERED]: 100,
    };
    return steps[status];
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black dark:text-white uppercase tracking-tight">Production Pipeline</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Real-time task tracking and automated client dispatch.</p>
        </div>
        <button 
          type="button"
          onClick={() => setShowModal(true)}
          className="flex items-center gap-3 bg-blue-600 px-8 py-4 rounded-[1.5rem] font-black text-white shadow-xl hover:bg-blue-700 transition-all uppercase tracking-widest text-xs"
        >
          <Plus size={24} /> New Production Order
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 p-5 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-5">
        <div className="flex-1 flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 px-6 py-4 rounded-[1.5rem] border dark:border-slate-800">
          <Search className="text-slate-400 dark:text-slate-500" size={20} />
          <input 
            type="text" 
            placeholder="Search job titles or customers..." 
            className="bg-transparent flex-1 outline-none dark:text-white font-bold uppercase text-xs tracking-widest"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
           {(['ALL', 'INTERNAL', 'OUTSOURCED'] as const).map(f => (
             <button 
                key={f}
                type="button"
                onClick={() => setProductionFilter(f)}
                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${productionFilter === f ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-md' : 'text-slate-400'}`}
             >
               {f}
             </button>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {filteredJobs.length === 0 ? (
           <div className="py-40 text-center bg-white dark:bg-slate-900 rounded-[3.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
              <Briefcase size={80} className="mx-auto text-slate-100 dark:text-slate-800 mb-6" />
              <p className="text-sm font-black text-slate-400 uppercase tracking-[0.4em]">Queue Empty</p>
           </div>
        ) : (
          filteredJobs.map(job => {
            const progress = getJobProgress(job.status);
            return (
              <div key={job.id} className="bg-white dark:bg-slate-900 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-blue-400 transition-all overflow-hidden group">
                <div className="h-2 w-full bg-slate-50 dark:bg-slate-800">
                  <div className={`h-full transition-all duration-1000 ease-out ${progress === 100 ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${progress}%` }}></div>
                </div>
                <div className="p-10">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-10">
                    <div className="flex-1 space-y-6">
                      <div className="flex flex-wrap items-center gap-4">
                        <span className="text-[10px] font-black bg-slate-900 text-white dark:bg-blue-600 px-4 py-2 rounded-2xl uppercase tracking-[0.2em] shadow-lg">{job.id}</span>
                        <h3 className="text-2xl font-black dark:text-white uppercase tracking-tight line-clamp-1">{job.title}</h3>
                        <StatusBadge status={job.status} />
                        {job.isOutsourced && <span className="bg-purple-50 text-purple-600 text-[10px] font-black px-3 py-1 rounded-full uppercase flex items-center gap-1.5"><Factory size={12}/> OUTSOURCED</span>}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                        <DetailItem label="Client" icon={User} iconColor="text-blue-500" value={job.customerName || 'Walk-in'} />
                        <DetailItem label="Deadline" icon={Calendar} iconColor="text-amber-500" value={job.deliveryDate || 'ASAP'} />
                        <DetailItem label="Balance" icon={DollarSign} iconColor="text-red-500" value={`${job.currency} ${(job.totalAmount - job.paidAmount).toLocaleString()}`} />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <button type="button" onClick={() => handleStatusChange(job.id, JobStatus.COMPLETED)} className="px-6 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-blue-700 shadow-xl">Mark Done</button>
                        <button type="button" onClick={() => { if(window.confirm('Delete project?')) deleteJob(job.id); }} className="p-4 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 transition-colors"><Trash2 size={20} /></button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[150] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-xl p-10 animate-in zoom-in border dark:border-slate-800">
             <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black dark:text-white uppercase tracking-tight">New Production Order</h2>
                <button type="button" onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full dark:text-white"><X size={24} /></button>
             </div>
             <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Job Title</label>
                   <input required type="text" className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-bold" value={newJob.title} onChange={e => setNewJob({...newJob, title: e.target.value})} placeholder="e.g., Anniversary Banners x4" />
                </div>
                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Select Customer</label>
                   <select required className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-bold" value={newJob.customerId} onChange={e => setNewJob({...newJob, customerId: e.target.value})}>
                     <option value="">Choose...</option>
                     {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                   </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Total Value</label>
                    <input required type="number" className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-black" value={newJob.totalAmount || ''} onChange={e => setNewJob({...newJob, totalAmount: Number(e.target.value)})} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Deadline</label>
                    <input required type="date" className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-bold" value={newJob.deliveryDate} onChange={e => setNewJob({...newJob, deliveryDate: e.target.value})} />
                  </div>
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-blue-700 transition-all uppercase tracking-[0.2em] text-xs">
                  Inject to Production Pipeline
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

const DetailItem = ({ label, icon: Icon, iconColor, value }: any) => (
  <div className="space-y-2">
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
    <div className="flex items-center gap-3 text-xs font-black dark:text-slate-200 uppercase truncate">
      <div className={`p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 ${iconColor}`}>
        <Icon size={16} />
      </div>
      {value}
    </div>
  </div>
);

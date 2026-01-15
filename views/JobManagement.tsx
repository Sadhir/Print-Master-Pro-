
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
  Phone
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
  const { jobs, addJob, deleteJob, updateJob, updateJobStatus, currentCurrency, customers, suppliers, branches, allStaff, currentUser, reviewLinks } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [useForeignCurrency, setUseForeignCurrency] = useState(false);
  const isAdmin = currentUser.role === UserRole.ADMIN;
  
  // Communication States
  const [showCommHub, setShowCommHub] = useState<string | null>(null);
  const [commType, setCommType] = useState<MessageType>('DISPATCH_READY');
  const [reviewPlatform, setReviewPlatform] = useState<'GOOGLE' | 'FACEBOOK' | 'TEXT' | 'VIDEO'>('GOOGLE');
  const [aiMessage, setAiMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [showRefinedIndicator, setShowRefinedIndicator] = useState(false);

  const [newJob, setNewJob] = useState({
    title: '',
    description: '',
    customerId: '',
    customerName: '',
    address: '',
    contactNumber: '',
    whatsappNumber: '',
    manualJobNumber: '',
    orderTakenBy: currentUser.name,
    orderProcessedBy: '',
    collectionLocationId: branches[0]?.id || '',
    deliveryMethod: DeliveryMethod.IN_STORE_COLLECTION,
    totalAmount: 0,
    advancePayment: 0,
    jobTakenDate: new Date().toISOString().split('T')[0],
    deliveryDate: '',
    currency: currentCurrency,
    source: OrderSource.WALK_IN,
    createWhatsAppGroup: false,
    isOutsourced: false,
    outsourcedCost: 0,
    outsourcedVendorId: '',
    foreignAmount: 0,
    foreignCurrency: CurrencyCode.USD,
    exchangeRate: 300,
  });

  // Derived Balance
  const remainingBalance = newJob.totalAmount - newJob.advancePayment;

  // Auto-fill customer data
  useEffect(() => {
    if (newJob.customerId) {
      const customer = customers.find(c => c.id === newJob.customerId);
      if (customer) {
        setNewJob(prev => ({
          ...prev,
          customerName: customer.name,
          address: customer.address || '',
          contactNumber: customer.phone,
          whatsappNumber: customer.phone,
        }));
      }
    }
  }, [newJob.customerId]);

  const handleGenerateAiMessage = async (jobId: string, type: MessageType) => {
    setIsGenerating(true);
    setShowRefinedIndicator(false);
    const job = jobs.find(j => j.id === jobId);
    const customer = customers.find(c => c.id === job?.customerId);
    const branch = branches.find(b => b.id === job?.branchId);
    
    if (job && customer) {
      const msg = await generateProfessionalMessage(type, {
        customerName: customer.name,
        jobTitle: job.title,
        amount: `${job.currency} ${(job.totalAmount - job.paidAmount).toLocaleString()}`,
        status: job.status,
        branchName: branch?.name || 'Main Office',
        platform: type === 'REVIEW_REQUEST' ? reviewPlatform : undefined,
        reviewLink: type === 'REVIEW_REQUEST' ? (reviewPlatform === 'GOOGLE' ? reviewLinks.google : reviewPlatform === 'FACEBOOK' ? reviewLinks.facebook : '') : undefined
      });
      setAiMessage(msg);
    }
    setIsGenerating(false);
  };

  const handleRefineMessage = async () => {
    if (!aiMessage.trim()) return;
    setIsRefining(true);
    const refined = await refineAndCheckMessage(aiMessage);
    setAiMessage(refined);
    setIsRefining(false);
    setShowRefinedIndicator(true);
    setTimeout(() => setShowRefinedIndicator(false), 3000);
  };

  useEffect(() => {
    if (showCommHub) {
      handleGenerateAiMessage(showCommHub, commType);
    }
  }, [showCommHub, commType, reviewPlatform]);

  const handleSend = (channel: 'WA' | 'EMAIL') => {
    const job = jobs.find(j => j.id === showCommHub);
    const customer = customers.find(c => c.id === job?.customerId);
    
    if (channel === 'WA') {
      window.open(`https://wa.me/${customer?.phone || job?.whatsappNumber}?text=${encodeURIComponent(aiMessage)}`, '_blank');
    } else {
      const subject = encodeURIComponent(`${commType.replace('_', ' ')}: ${job?.title} - PrintMaster Pro`);
      window.open(`mailto:${customer?.email || ''}?subject=${subject}&body=${encodeURIComponent(aiMessage)}`, '_blank');
    }
    setShowCommHub(null);
  };

  const handleStatusChange = (jobId: string, newStatus: JobStatus) => {
    updateJobStatus(jobId, newStatus);
    if (newStatus === JobStatus.COMPLETED) {
      setCommType('DISPATCH_READY');
      setShowCommHub(jobId);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const jobData: any = {
      ...newJob,
      status: newJob.isOutsourced ? JobStatus.OUTSOURCED : JobStatus.APPROVED,
      paidAmount: newJob.advancePayment,
      items: [],
      currency: currentCurrency,
    };
    addJob(jobData);
    setShowModal(false);
    resetForm();
  };

  const resetForm = () => {
    setNewJob({
      title: '',
      description: '',
      customerId: '',
      customerName: '',
      address: '',
      contactNumber: '',
      whatsappNumber: '',
      manualJobNumber: '',
      orderTakenBy: currentUser.name,
      orderProcessedBy: '',
      collectionLocationId: branches[0]?.id || '',
      deliveryMethod: DeliveryMethod.IN_STORE_COLLECTION,
      totalAmount: 0,
      advancePayment: 0,
      jobTakenDate: new Date().toISOString().split('T')[0],
      deliveryDate: '',
      currency: currentCurrency,
      source: OrderSource.WALK_IN,
      createWhatsAppGroup: false,
      isOutsourced: false,
      outsourcedCost: 0,
      outsourcedVendorId: '',
      foreignAmount: 0,
      foreignCurrency: CurrencyCode.USD,
      exchangeRate: 300,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold dark:text-white uppercase tracking-tight">Production Pipeline</h1>
          <p className="text-slate-500 dark:text-slate-400">Detailed job sheets and delivery tracking.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 bg-blue-600 px-6 py-3 rounded-xl font-bold text-white shadow-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} /> Take New Job
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 flex items-center gap-3 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-xl">
          <Search className="text-slate-400 dark:text-slate-500" size={18} />
          <input type="text" placeholder="Search by Job ID or Client..." className="bg-transparent flex-1 outline-none dark:text-white" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {jobs.map(job => (
          <div key={job.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:border-blue-200 dark:hover:border-blue-700 transition-colors group">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-500 uppercase tracking-widest">{job.id}</span>
                  <h3 className="text-lg font-bold dark:text-white">{job.title}</h3>
                  <StatusBadge status={job.status} />
                  {job.manualJobNumber && <span className="text-[10px] font-bold text-blue-600 uppercase">Sheet #{job.manualJobNumber}</span>}
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <User size={14} className="text-slate-400" />
                    <span className="font-bold dark:text-slate-300">{job.customerName || 'Walk-in'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Phone size={14} className="text-slate-400" />
                    <span className="font-bold dark:text-slate-300">{job.contactNumber || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Calendar size={14} className="text-slate-400" />
                    <span className="font-bold dark:text-slate-300">Due: {job.deliveryDate || 'ASAP'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <MapPin size={14} className="text-slate-400" />
                    <span className="font-bold dark:text-slate-300 uppercase">{job.deliveryMethod?.replace('_', ' ')}</span>
                  </div>
                </div>
                
                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{job.description}</p>
              </div>

              <div className="flex flex-col items-end gap-3 min-w-[200px]">
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Balance Due</p>
                  <p className={`text-xl font-black ${job.totalAmount - job.paidAmount > 0 ? 'text-red-500' : 'text-green-600'}`}>
                    {job.currency} {(job.totalAmount - job.paidAmount).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => { setCommType('DISPATCH_READY'); setShowCommHub(job.id); }}
                    className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors border dark:border-slate-700"
                  >
                    <MessageCircle className="text-green-600 dark:text-green-400" size={20} />
                  </button>
                  <button 
                    onClick={() => handleStatusChange(job.id, JobStatus.COMPLETED)}
                    className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 rounded-lg border dark:border-slate-700"
                  >
                    <CheckCircle2 size={20} />
                  </button>
                  {isAdmin && (
                    <button 
                      onClick={() => { if(window.confirm('Delete this job?')) deleteJob(job.id); }}
                      className="p-2 hover:bg-red-50 text-red-600 rounded-lg border border-red-100"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* New Job Modal - Comprehensive Detailed Form */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[120] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-4xl max-h-[90vh] shadow-2xl border dark:border-slate-800 overflow-hidden animate-in zoom-in duration-300 flex flex-col">
             <div className="p-8 border-b dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
                <div>
                   <h2 className="text-2xl font-black dark:text-white uppercase tracking-tight">New Job Registration</h2>
                   <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">Capture complete job specs & financials</p>
                </div>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full dark:text-white"><X size={24} /></button>
             </div>

             <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 space-y-10">
                {/* Section 1: Client Identity */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 border-b dark:border-slate-800 pb-2">
                    <Contact className="text-blue-600" size={18} />
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Client Identity</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="md:col-span-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Search/Select Customer</label>
                      <select 
                        className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-bold"
                        value={newJob.customerId}
                        onChange={e => setNewJob({...newJob, customerId: e.target.value})}
                      >
                        <option value="">-- Choose Existing or Manual --</option>
                        {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>)}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Customer Full Name*</label>
                      <input required type="text" className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-bold" value={newJob.customerName} onChange={e => setNewJob({...newJob, customerName: e.target.value})} placeholder="Full legal name" />
                    </div>
                    <div className="md:col-span-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Billing/Delivery Address</label>
                      <input type="text" className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-bold" value={newJob.address} onChange={e => setNewJob({...newJob, address: e.target.value})} placeholder="Full physical address" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Primary Contact Number*</label>
                      <input required type="text" className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-bold" value={newJob.contactNumber} onChange={e => setNewJob({...newJob, contactNumber: e.target.value})} placeholder="+94..." />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">WhatsApp Number</label>
                      <div className="relative">
                        <MessageCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-green-500" size={18} />
                        <input type="text" className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl pl-12 pr-6 py-4 outline-none dark:text-white font-bold" value={newJob.whatsappNumber} onChange={e => setNewJob({...newJob, whatsappNumber: e.target.value})} placeholder="+94..." />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2: Production Logistics */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 border-b dark:border-slate-800 pb-2">
                    <Briefcase className="text-blue-600" size={18} />
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Production Logistics</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Job Title / Project Name*</label>
                      <input required type="text" className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-bold" value={newJob.title} onChange={e => setNewJob({...newJob, title: e.target.value})} placeholder="e.g. Wedding Invitations - Gold Leaf" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Manual Job Sheet #</label>
                      <input type="text" className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-black text-blue-600" value={newJob.manualJobNumber} onChange={e => setNewJob({...newJob, manualJobNumber: e.target.value})} placeholder="Optional Ref" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Order Date</label>
                      <input required type="date" className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-bold" value={newJob.jobTakenDate} onChange={e => setNewJob({...newJob, jobTakenDate: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Delivery/Deadline Date*</label>
                      <input required type="date" className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-bold" value={newJob.deliveryDate} onChange={e => setNewJob({...newJob, deliveryDate: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Delivery Method</label>
                      <select 
                        className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-bold"
                        value={newJob.deliveryMethod}
                        onChange={e => setNewJob({...newJob, deliveryMethod: e.target.value as any})}
                      >
                        <option value={DeliveryMethod.IN_STORE_COLLECTION}>In-Store Collection</option>
                        <option value={DeliveryMethod.ONLINE}>Online / Email</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Collection Location</label>
                      <select 
                        className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-bold"
                        value={newJob.collectionLocationId}
                        onChange={e => setNewJob({...newJob, collectionLocationId: e.target.value})}
                      >
                        {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Order Taken By</label>
                      <select 
                        className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-bold"
                        value={newJob.orderTakenBy}
                        onChange={e => setNewJob({...newJob, orderTakenBy: e.target.value})}
                      >
                        {allStaff.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                        <option value={currentUser.name}>{currentUser.name} (Current)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Assigned Designer/Operator</label>
                      <select 
                        className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-bold"
                        value={newJob.orderProcessedBy}
                        onChange={e => setNewJob({...newJob, orderProcessedBy: e.target.value})}
                      >
                        <option value="">-- Unassigned --</option>
                        {allStaff.map(s => <option key={s.id} value={s.name}>{s.name} ({s.designation})</option>)}
                      </select>
                    </div>
                    <div className="md:col-span-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Detailed Job Description*</label>
                      <textarea required className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-medium" rows={3} value={newJob.description} onChange={e => setNewJob({...newJob, description: e.target.value})} placeholder="Specify dimensions, paper type, finish, quantity, etc." />
                    </div>
                  </div>
                </div>

                {/* Section 3: Financial Settlement */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 border-b dark:border-slate-800 pb-2">
                    <DollarSign className="text-blue-600" size={18} />
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Financial Settlement</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-3xl border dark:border-slate-700">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Total Amount ({currentCurrency})</label>
                      <input required type="number" className="w-full bg-white dark:bg-slate-900 border dark:border-slate-700 rounded-xl px-4 py-4 outline-none dark:text-white font-black text-2xl" value={newJob.totalAmount || ''} onChange={e => setNewJob({...newJob, totalAmount: Number(e.target.value)})} />
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/10 p-8 rounded-3xl border border-blue-100 dark:border-blue-900/30">
                      <label className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest block mb-4">Advance Paid ({currentCurrency})</label>
                      <input required type="number" className="w-full bg-white dark:bg-slate-900 border dark:border-slate-700 rounded-xl px-4 py-4 outline-none dark:text-blue-600 font-black text-2xl" value={newJob.advancePayment || ''} onChange={e => setNewJob({...newJob, advancePayment: Number(e.target.value)})} />
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/10 p-8 rounded-3xl border border-red-100 dark:border-red-900/30 flex flex-col justify-center">
                      <label className="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-widest block mb-1">Live Balance</label>
                      <p className="text-4xl font-black text-red-600 dark:text-red-500">{currentCurrency} {remainingBalance.toLocaleString()}</p>
                      <p className="text-[8px] font-bold text-slate-400 uppercase mt-2 tracking-widest">Automatic Calculation</p>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t dark:border-slate-800">
                   <button type="submit" className="w-full bg-blue-600 text-white font-black py-6 rounded-[2rem] shadow-2xl hover:bg-blue-700 transition-all uppercase tracking-[0.3em] text-sm flex items-center justify-center gap-3">
                     <CheckCircle size={20} /> Register & Generate Job Sheet
                   </button>
                </div>
             </form>
          </div>
        </div>
      )}

      {/* AI Communication Hub Modal */}
      {showCommHub && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[130] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-xl shadow-2xl border dark:border-slate-800 overflow-hidden animate-in zoom-in duration-300">
             <div className="p-8 border-b dark:border-slate-800 flex items-center justify-between">
                <div>
                   <h2 className="text-2xl font-black dark:text-white uppercase tracking-tight flex items-center gap-2">
                     <Sparkles className="text-blue-600" size={24} /> {commType === 'REVIEW_REQUEST' ? 'Review Campaign' : 'Communication Center'}
                   </h2>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                     {commType === 'REVIEW_REQUEST' ? 'Ask for client feedback via multiple channels' : 'Craft the perfect message with Gemini AI'}
                   </p>
                </div>
                <button onClick={() => setShowCommHub(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full dark:text-white"><X size={24} /></button>
             </div>

             <div className="p-8 space-y-6">
                <div className="flex bg-slate-50 dark:bg-slate-800 p-1 rounded-2xl w-full border dark:border-slate-700 overflow-x-auto">
                   {(['DISPATCH_READY', 'PAYMENT_REMINDER', 'REVIEW_REQUEST'] as MessageType[]).map(type => (
                     <button 
                        key={type}
                        onClick={() => setCommType(type)}
                        className={`flex-1 px-4 py-3 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${commType === type ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-400'}`}
                     >
                       {type.replace('_', ' ')}
                     </button>
                   ))}
                </div>

                {commType === 'REVIEW_REQUEST' && (
                  <div className="grid grid-cols-4 gap-2">
                    <PlatformButton active={reviewPlatform === 'GOOGLE'} icon={Globe} label="Google" color="blue" onClick={() => setReviewPlatform('GOOGLE')} />
                    <PlatformButton active={reviewPlatform === 'FACEBOOK'} icon={Facebook} label="FB" color="indigo" onClick={() => setReviewPlatform('FACEBOOK')} />
                    <PlatformButton active={reviewPlatform === 'TEXT'} icon={FileText} label="Text" color="slate" onClick={() => setReviewPlatform('TEXT')} />
                    <PlatformButton active={reviewPlatform === 'VIDEO'} icon={Video} label="Video" color="purple" onClick={() => setReviewPlatform('VIDEO')} />
                  </div>
                )}

                <div className="relative">
                   <div className="flex items-center justify-between mb-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Message Draft (Editable)</label>
                     <button 
                        onClick={handleRefineMessage}
                        disabled={isRefining || isGenerating || !aiMessage.trim()}
                        className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 disabled:opacity-50 transition-colors"
                     >
                       {isRefining ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                       Refine Tone
                     </button>
                   </div>
                   {isGenerating ? (
                     <div className="h-40 w-full bg-slate-50 dark:bg-slate-800 rounded-2xl flex flex-col items-center justify-center gap-3 border dark:border-slate-700">
                        <Loader2 className="animate-spin text-blue-600" size={32} />
                     </div>
                   ) : (
                     <div className="relative">
                        <textarea 
                          className={`w-full h-40 bg-slate-50 dark:bg-slate-800 border ${isRefining ? 'border-blue-400' : 'dark:border-slate-700'} rounded-2xl px-6 py-4 outline-none dark:text-white font-medium text-sm leading-relaxed resize-none transition-all`}
                          value={aiMessage}
                          onChange={e => setAiMessage(e.target.value)}
                        />
                        {showRefinedIndicator && (
                          <div className="absolute top-4 right-4 animate-in fade-in zoom-in duration-300">
                            <div className="flex items-center gap-1.5 bg-blue-600 text-white px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg">
                              <CheckCircle size={10} /> Polished
                            </div>
                          </div>
                        )}
                     </div>
                   )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <button 
                    onClick={() => handleSend('WA')}
                    className="bg-green-600 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 hover:bg-green-700 transition-all uppercase tracking-widest text-[10px]"
                   >
                     <MessageCircle size={18} /> WhatsApp
                   </button>
                   <button 
                    onClick={() => handleSend('EMAIL')}
                    className="bg-blue-600 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 hover:bg-blue-700 transition-all uppercase tracking-widest text-[10px]"
                   >
                     <Mail size={18} /> Email
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

const PlatformButton = ({ icon: Icon, label, color, active, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all ${
      active 
        ? `border-${color}-600 bg-${color}-50 dark:bg-${color}-900/20 text-${color}-600` 
        : 'border-slate-100 dark:border-slate-800 text-slate-400'
    }`}
  >
    <Icon size={18} />
    <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
  </button>
);

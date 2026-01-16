
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  Users, 
  Package, 
  AlertCircle, 
  Plus, 
  ShoppingCart, 
  Sparkles,
  Briefcase,
  MessageCircle,
  Clock,
  CalendarDays,
  Globe,
  User,
  CheckCircle2,
  BarChart4,
  Mail,
  Send,
  Zap,
  ArrowRight,
  Cake,
  Gift,
  BellRing,
  EyeOff,
  Ghost
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';
import { analyzeSalesTrends, generateProfessionalMessage, MessageType } from '../services/geminiService';
import { useApp } from '../context/AppContext';
import { UserRole, OrderSource, JobStatus, Job } from '../types';

// Constants for Stealth Mode
const STEALTH_FACTOR = 0.12;

const StatCard = ({ title, value, sub, icon: Icon, color, isStealth }: any) => (
  <div className="bg-white dark:bg-slate-900 p-7 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
    <div className="flex items-start justify-between mb-5">
      <div className={`p-4 rounded-2xl ${color} transition-transform group-hover:scale-110`}>
        <Icon size={28} className="text-white" />
      </div>
      <span className="text-[10px] font-black text-green-500 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2.5 py-1 rounded-full">+12%</span>
    </div>
    <h3 className="text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-widest">{title}</h3>
    <div className="flex items-center gap-2">
      <p className="text-3xl font-black mt-2 dark:text-white tracking-tighter">{value}</p>
      {isStealth && <Ghost size={14} className="text-slate-300 dark:text-slate-700 animate-pulse mt-2" />}
    </div>
    <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase mt-1 tracking-tight">{sub}</p>
  </div>
);

export const Dashboard = () => {
  const navigate = useNavigate();
  const [insight, setInsight] = useState<string | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);
  const { isDarkMode, isStealthMode, customers, jobs, transactions, updateJob, currentCurrency, branches } = useApp();
  
  const [snoozedItems, setSnoozedItems] = useState<string[]>([]);

  useEffect(() => {
    const fetchInsight = async () => {
      setLoadingInsight(true);
      const res = await analyzeSalesTrends(`Weekly sales total ${currentCurrency} 19,550. Highest day Saturday. Low stocks in Glossy Paper.`);
      setInsight(res);
      setLoadingInsight(false);
    };
    fetchInsight();
  }, []);

  // Utility to apply stealth masking
  const mask = (val: number) => isStealthMode ? val * STEALTH_FACTOR : val;

  const realDailyRevenue = 45600; // Mock base for this example
  const displayDailyRevenue = mask(realDailyRevenue);

  const getReminderReason = (job: Job) => {
    if (job.paidAmount >= job.totalAmount) return null;
    if (snoozedItems.includes(job.id)) return null;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deliveryDate = new Date(job.deliveryDate);
    deliveryDate.setHours(0, 0, 0, 0);
    
    const diffTime = deliveryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const lastRemDate = job.lastReminderDate ? new Date(job.lastReminderDate) : null;
    if (lastRemDate && lastRemDate.toDateString() === today.toDateString()) return null;

    if (diffDays === 15) return "15-Day Notice";
    if (diffDays === 3) return "3-Day Warning";
    
    if (diffDays <= 0) {
      const daysOverdue = Math.abs(diffDays);
      if (daysOverdue % 3 === 0) return "Continuous Follow-up";
      if (lastRemDate) {
        const daysSinceLastRem = Math.ceil((today.getTime() - lastRemDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysSinceLastRem >= 3) return "Overdue Cycle";
      } else {
         return "Immediate Overdue";
      }
    }
    
    return null;
  };

  const snoozeItem = (id: string) => {
    setSnoozedItems([...snoozedItems, id]);
  };

  const paymentReminderQueue = jobs.map(j => ({ job: j, reason: getReminderReason(j) }))
                                  .filter(item => item.reason !== null)
                                  .slice(0, 5);

  const readyToDispatchJobs = jobs.filter(j => j.status === JobStatus.COMPLETED && !snoozedItems.includes(j.id)).slice(0, 3);

  const birthdaysToday = customers.filter(c => {
    if (!c.birthday) return false;
    if (snoozedItems.includes(c.id)) return false;
    const bday = new Date(c.birthday);
    const today = new Date();
    return today.getDate() === bday.getDate() && today.getMonth() === bday.getMonth();
  });

  const chartData = [
    { name: 'Mon', sales: mask(4000) },
    { name: 'Tue', sales: mask(3000) },
    { name: 'Wed', sales: mask(2000) },
    { name: 'Thu', sales: mask(2780) },
    { name: 'Fri', sales: mask(1890) },
    { name: 'Sat', sales: mask(2390) },
    { name: 'Sun', sales: mask(3490) },
  ];

  const handleSendComm = async (entity: any, type: MessageType, channel: 'WA' | 'EMAIL', reminderLabel?: string) => {
    const customer = type === 'BIRTHDAY_WISH' ? entity : customers.find(c => c.id === entity.customerId);
    const branch = branches.find(b => b.id === (entity.branchId || 'b1'));
    
    const msg = await generateProfessionalMessage(type, {
      customerName: customer?.name,
      jobTitle: entity.title || 'Special Order',
      amount: entity.totalAmount ? `${entity.currency} ${(entity.totalAmount - entity.paidAmount).toLocaleString()}` : undefined,
      status: entity.status || 'Active',
      branchName: branch?.name || 'Main Office',
      urgency: reminderLabel
    });

    if (channel === 'WA') {
      window.open(`https://wa.me/${customer?.phone}?text=${encodeURIComponent(msg)}`, '_blank');
    } else {
      const subject = encodeURIComponent(`${type.replace('_', ' ')}: ${entity.title || 'Notification'}`);
      window.open(`mailto:${customer?.email}?subject=${subject}&body=${encodeURIComponent(msg)}`, '_blank');
    }

    if (type === 'PAYMENT_REMINDER' && entity.id) {
      updateJob(entity.id, {
        lastReminderDate: new Date().toISOString(),
        lastReminderType: reminderLabel || 'Generic'
      });
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black dark:text-white uppercase tracking-tight">System Status: <span className="text-green-500">Operational</span></h1>
            {isStealthMode && (
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border dark:border-slate-700 animate-pulse">
                <Ghost size={14} className="text-slate-400" />
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Privacy Active</span>
              </div>
            )}
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Global branch aggregation and AI insights feed.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => navigate('/billing')}
            className="flex items-center gap-2 bg-white dark:bg-slate-800 px-6 py-3 rounded-2xl border dark:border-slate-700 font-black text-xs uppercase tracking-widest text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
          >
            <Plus size={20} /> New Quote
          </button>
          <button onClick={() => navigate('/pos')} className="flex items-center gap-2 bg-blue-600 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest text-white shadow-xl shadow-blue-100 dark:shadow-none hover:bg-blue-700 transition-all">
            <ShoppingCart size={20} /> Open POS
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard title="Daily Revenue" value={`${currentCurrency} ${displayDailyRevenue.toLocaleString()}`} sub="From masked retail sessions" icon={TrendingUp} color="bg-blue-500" isStealth={isStealthMode} />
        <StatCard title="Pipe Load" value={jobs.filter(j => j.status !== JobStatus.DELIVERED).length} sub="Active projects" icon={Briefcase} color="bg-purple-500" />
        <StatCard title="Active CRM" value={customers.length} sub="Linked Identities" icon={Users} color="bg-orange-500" />
        <StatCard title="Stock Safety" value="3" sub="Refills required" icon={AlertCircle} color="bg-red-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Communication Center */}
        <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col h-full">
           <div className="flex items-center justify-between mb-8">
              <h2 className="font-black text-xl uppercase tracking-[0.25em] text-slate-400 flex items-center gap-3">
                <Zap size={24} className="text-yellow-500" /> Dispatch Hub
              </h2>
              <span className="text-[10px] font-black bg-blue-50 dark:bg-blue-900/30 text-blue-600 px-3 py-1.5 rounded-full uppercase tracking-widest">Synced</span>
           </div>
           
           <div className="space-y-5 flex-1 overflow-y-auto max-h-[550px] pr-3 custom-scrollbar">
              {paymentReminderQueue.length === 0 && readyToDispatchJobs.length === 0 && birthdaysToday.length === 0 && (
                <div className="text-center py-24">
                   <CheckCircle2 size={56} className="mx-auto text-green-500 opacity-20 mb-5" />
                   <p className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">All queues cleared</p>
                </div>
              )}

              {birthdaysToday.map(customer => (
                <div key={customer.id} className="p-5 bg-pink-50 dark:bg-pink-900/10 rounded-[2rem] border border-pink-100 dark:border-pink-800/50 flex items-center justify-between animate-in zoom-in group">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-pink-100 dark:bg-pink-800 text-pink-600 flex items-center justify-center transition-transform group-hover:rotate-12">
                        <Cake size={24} />
                      </div>
                      <div>
                        <p className="font-black text-base dark:text-white uppercase tracking-tight">{customer.name}'s Birthday</p>
                        <p className="text-[10px] font-black text-pink-600 uppercase tracking-widest">Engagement Opportunity</p>
                      </div>
                   </div>
                   <div className="flex gap-2">
                      <button onClick={() => snoozeItem(customer.id)} className="p-3 text-slate-300 hover:text-slate-500 transition-colors" title="Snooze"><EyeOff size={18} /></button>
                      <button onClick={() => handleSendComm(customer, 'BIRTHDAY_WISH', 'WA')} className="p-3 bg-white dark:bg-slate-800 rounded-xl text-pink-600 border dark:border-slate-700 shadow-sm hover:scale-110 transition-all"><MessageCircle size={18} /></button>
                   </div>
                </div>
              ))}
              
              {paymentReminderQueue.map(({ job, reason }) => (
                <div key={job.id} className="p-5 bg-amber-50 dark:bg-amber-900/10 rounded-[2rem] border border-amber-100 dark:border-amber-800/50 flex items-center justify-between animate-in slide-in-from-right duration-300">
                   <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl ${reason?.includes('Overdue') ? 'bg-red-100 dark:bg-red-900/40 text-red-600' : 'bg-amber-100 dark:bg-amber-900/40 text-amber-600'} flex items-center justify-center`}>
                        <BellRing size={24} />
                      </div>
                      <div>
                        <p className="font-black text-sm dark:text-white line-clamp-1 uppercase tracking-tight">{job.title}</p>
                        <div className="flex items-center gap-3">
                          <p className={`text-[10px] font-black uppercase tracking-widest ${reason?.includes('Overdue') ? 'text-red-500' : 'text-amber-600'}`}>
                            {reason}
                          </p>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">• {currentCurrency} {mask(job.totalAmount - job.paidAmount).toLocaleString()}</span>
                        </div>
                      </div>
                   </div>
                   <div className="flex gap-2">
                      <button onClick={() => snoozeItem(job.id)} className="p-3 text-slate-300 hover:text-slate-500 transition-colors" title="Snooze"><EyeOff size={18} /></button>
                      <button onClick={() => handleSendComm(job, 'PAYMENT_REMINDER', 'WA', reason || undefined)} className="p-3 bg-white dark:bg-slate-800 rounded-xl text-green-600 border dark:border-slate-700 shadow-sm hover:scale-105 transition-all"><MessageCircle size={18} /></button>
                      <button onClick={() => handleSendComm(job, 'PAYMENT_REMINDER', 'EMAIL', reason || undefined)} className="p-3 bg-white dark:bg-slate-800 rounded-xl text-blue-600 border dark:border-slate-700 shadow-sm hover:scale-105 transition-all"><Mail size={18} /></button>
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Analytics Snapshot */}
        <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col h-full">
           <div className="flex items-center justify-between mb-10">
              <h2 className="font-black text-xl uppercase tracking-[0.25em] text-slate-400 flex items-center gap-3">
                <CheckCircle2 size={24} /> Yield Matrix
              </h2>
           </div>
           <div className="grid grid-cols-2 gap-5 flex-1">
              <div className="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] border dark:border-slate-800 flex flex-col justify-center items-center group hover:border-blue-400 transition-all">
                 <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Throughput</p>
                 <p className="text-5xl font-black text-green-600 tracking-tighter">{jobs.filter(j => j.status === JobStatus.COMPLETED && new Date(j.updatedAt).toDateString() === new Date().toDateString()).length}</p>
                 <p className="text-[9px] font-black text-slate-400 uppercase mt-3 tracking-widest">Closed Today</p>
              </div>
              <div className="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] border dark:border-slate-800 flex flex-col justify-center items-center group hover:border-amber-400 transition-all">
                 <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Escalations</p>
                 <p className="text-5xl font-black text-amber-500 tracking-tighter">{paymentReminderQueue.length}</p>
                 <p className="text-[9px] font-black text-slate-400 uppercase mt-3 tracking-widest">Unsettled</p>
              </div>
              <div className="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] border dark:border-slate-800 flex flex-col justify-center items-center group hover:border-pink-400 transition-all">
                 <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Social Hub</p>
                 <p className="text-5xl font-black text-pink-600 tracking-tighter">{birthdaysToday.length}</p>
                 <p className="text-[9px] font-black text-slate-400 uppercase mt-3 tracking-widest">Engagement</p>
              </div>
              <div className="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] border dark:border-slate-800 flex flex-col justify-center items-center group hover:border-blue-400 transition-all">
                 <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Gross Flow</p>
                 <p className="text-3xl font-black text-blue-600 tracking-tighter">{currentCurrency} {displayDailyRevenue.toLocaleString()}</p>
                 <p className="text-[9px] font-black text-slate-400 uppercase mt-3 tracking-widest">Real-time Revenue</p>
              </div>
           </div>
        </div>
      </div>

      {/* Sales Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-black text-xl uppercase tracking-tight dark:text-white">Growth Projection</h2>
              <select className="bg-slate-100 dark:bg-slate-800 border-none text-[10px] font-black uppercase tracking-widest rounded-xl px-4 py-2 outline-none dark:text-slate-200 shadow-inner">
                <option>Active Week</option>
                <option>Fiscal Month</option>
              </select>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={isDarkMode ? 0.3 : 0.1}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "#334155" : "#f1f5f9"} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: '800'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                      borderRadius: '24px', 
                      border: 'none', 
                      boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
                      fontSize: '12px',
                      fontWeight: '800'
                    }}
                    itemStyle={{ color: '#3b82f6' }}
                    cursor={{ stroke: '#3b82f6', strokeWidth: 2 }}
                  />
                  <Area type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorSales)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-blue-800 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-5">
                <Sparkles size={24} className="text-yellow-300 group-hover:rotate-12 transition-transform" />
                <h3 className="font-black text-lg uppercase tracking-tight">AI Strategy Core</h3>
              </div>
              {loadingInsight ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-3 bg-white/20 rounded-full w-full"></div>
                  <div className="h-3 bg-white/20 rounded-full w-5/6"></div>
                  <div className="h-3 bg-white/20 rounded-full w-4/6"></div>
                </div>
              ) : (
                <div className="prose prose-invert prose-sm">
                  <p className="text-sm leading-relaxed text-indigo-100 font-medium">
                    {insight}
                  </p>
                </div>
              )}
            </div>
            <Zap size={180} className="absolute -right-12 -bottom-12 opacity-5" />
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm">
            <h2 className="font-black text-base uppercase tracking-tight mb-6 dark:text-white flex items-center gap-2">
              <Clock size={18} className="text-blue-500" /> Real-time Pipeline
            </h2>
            <div className="space-y-4">
              {jobs.slice(0, 4).map((job) => (
                <div key={job.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer border border-transparent hover:border-blue-100">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
                      <Briefcase size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-black dark:text-slate-200 line-clamp-1 uppercase tracking-tight">{job.title}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{job.source}</p>
                    </div>
                  </div>
                  <span className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-tighter ${job.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{job.status}</span>
                </div>
              ))}
            </div>
            <button onClick={() => navigate('/jobs')} className="w-full mt-6 py-4 rounded-2xl bg-slate-900 dark:bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 transition-all">
               View Full Queue <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

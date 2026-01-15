
import React, { useEffect, useState } from 'react';
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
  Gift
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
import { UserRole, OrderSource, JobStatus } from '../types';

const StatCard = ({ title, value, sub, icon: Icon, color }: any) => (
  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-4">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
      <span className="text-xs font-bold text-green-500 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">+12%</span>
    </div>
    <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">{title}</h3>
    <p className="text-2xl font-bold mt-1 dark:text-white">{value}</p>
    <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">{sub}</p>
  </div>
);

const data = [
  { name: 'Mon', sales: 4000 },
  { name: 'Tue', sales: 3000 },
  { name: 'Wed', sales: 2000 },
  { name: 'Thu', sales: 2780 },
  { name: 'Fri', sales: 1890 },
  { name: 'Sat', sales: 2390 },
  { name: 'Sun', sales: 3490 },
];

export const Dashboard = () => {
  const [insight, setInsight] = useState<string | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);
  const { isDarkMode, customers, jobs, subscriptions, transactions, currentUser, currentCurrency, branches } = useApp();

  useEffect(() => {
    const fetchInsight = async () => {
      setLoadingInsight(true);
      const res = await analyzeSalesTrends("Weekly sales total $19,550. Highest day Saturday. Low stocks in Glossy Paper.");
      setInsight(res);
      setLoadingInsight(false);
    };
    fetchInsight();
  }, []);

  // Filter jobs for the "Pending Communications" widget
  const overdueUnpaidJobs = jobs.filter(j => 
    j.totalAmount > j.paidAmount && 
    (new Date().getTime() - new Date(j.createdAt).getTime()) > (3 * 24 * 60 * 60 * 1000)
  ).slice(0, 3);

  const readyToDispatchJobs = jobs.filter(j => j.status === JobStatus.COMPLETED).slice(0, 3);

  const birthdaysToday = customers.filter(c => {
    if (!c.birthday) return false;
    const today = new Date();
    const bday = new Date(c.birthday);
    return today.getDate() === bday.getDate() && today.getMonth() === bday.getMonth();
  });

  const handleSendComm = async (entity: any, type: MessageType, channel: 'WA' | 'EMAIL') => {
    // Entity could be a Job or a Customer (for birthday)
    const customer = type === 'BIRTHDAY_WISH' ? entity : customers.find(c => c.id === entity.customerId);
    const branch = branches.find(b => b.id === (entity.branchId || 'b1'));
    
    const msg = await generateProfessionalMessage(type, {
      customerName: customer?.name,
      jobTitle: entity.title || 'Special Celebration',
      amount: entity.totalAmount ? `${entity.currency} ${(entity.totalAmount - entity.paidAmount).toLocaleString()}` : undefined,
      status: entity.status || 'Active',
      branchName: branch?.name || 'Main Office'
    });

    if (channel === 'WA') {
      window.open(`https://wa.me/${customer?.phone}?text=${encodeURIComponent(msg)}`, '_blank');
    } else {
      const subject = encodeURIComponent(`${type.replace('_', ' ')}: Celebrate with PrintMaster Pro`);
      window.open(`mailto:${customer?.email}?subject=${subject}&body=${encodeURIComponent(msg)}`, '_blank');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold dark:text-white uppercase tracking-tight">System Status: OK</h1>
          <p className="text-slate-500 dark:text-slate-400">Overview of your print shop's performance today.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-xl border dark:border-slate-700 font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            <Plus size={18} /> New Quote
          </button>
          <button className="flex items-center gap-2 bg-blue-600 px-4 py-2 rounded-xl font-medium text-white shadow-lg shadow-blue-200 dark:shadow-none hover:bg-blue-700 transition-colors">
            <ShoppingCart size={18} /> Open POS
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Sales" value={`${currentCurrency} 45,600`} sub="From 24 orders today" icon={TrendingUp} color="bg-blue-500" />
        <StatCard title="Active Jobs" value={jobs.filter(j => j.status !== JobStatus.DELIVERED).length} sub="Requiring action" icon={Briefcase} color="bg-purple-500" />
        <StatCard title="New Customers" value={customers.length} sub="Total database" icon={Users} color="bg-orange-500" />
        <StatCard title="Low Stock Items" value="3" sub="Requires attention" icon={AlertCircle} color="bg-red-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Automated Communication Queue */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
           <div className="flex items-center justify-between mb-6">
              <h2 className="font-black text-lg uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Zap size={20} className="text-yellow-500" /> Communication Queue
              </h2>
              <span className="text-[10px] font-black bg-blue-50 dark:bg-blue-900/30 text-blue-600 px-2 py-1 rounded-full uppercase">AI Suggested</span>
           </div>
           
           <div className="space-y-4">
              {overdueUnpaidJobs.length === 0 && readyToDispatchJobs.length === 0 && birthdaysToday.length === 0 && (
                <div className="text-center py-10">
                   <CheckCircle2 size={40} className="mx-auto text-green-500 opacity-20 mb-3" />
                   <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Inbox is clear!</p>
                </div>
              )}

              {/* Birthday Wishes Queue */}
              {birthdaysToday.map(customer => (
                <div key={customer.id} className="p-4 bg-pink-50 dark:bg-pink-900/10 rounded-2xl border border-pink-100 dark:border-pink-800/50 flex items-center justify-between animate-in zoom-in">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-pink-100 dark:bg-pink-800 text-pink-600 flex items-center justify-center">
                        <Cake size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-sm dark:text-white">{customer.name}'s Birthday</p>
                        <p className="text-[10px] font-black text-pink-600 uppercase tracking-widest">Send Automated Wish</p>
                      </div>
                   </div>
                   <div className="flex gap-2">
                      <button onClick={() => handleSendComm(customer, 'BIRTHDAY_WISH', 'WA')} className="p-2 bg-white dark:bg-slate-800 rounded-lg text-pink-600 border dark:border-slate-700 shadow-sm hover:scale-110 transition-transform" title="Send B'Day WhatsApp"><MessageCircle size={16} /></button>
                      <button onClick={() => handleSendComm(customer, 'BIRTHDAY_WISH', 'EMAIL')} className="p-2 bg-white dark:bg-slate-800 rounded-lg text-indigo-600 border dark:border-slate-700 shadow-sm hover:scale-110 transition-transform" title="Send B'Day Email"><Mail size={16} /></button>
                   </div>
                </div>
              ))}
              
              {readyToDispatchJobs.map(job => (
                <div key={job.id} className="p-4 bg-green-50 dark:bg-green-900/10 rounded-2xl border border-green-100 dark:border-green-800/50 flex items-center justify-between">
                   <div>
                      <p className="font-bold text-sm dark:text-white">{job.title}</p>
                      <p className="text-[10px] font-black text-green-600 uppercase tracking-widest">Ready for Dispatch</p>
                   </div>
                   <div className="flex gap-2">
                      <button onClick={() => handleSendComm(job, 'DISPATCH_READY', 'WA')} className="p-2 bg-white dark:bg-slate-800 rounded-lg text-green-600 border dark:border-slate-700 shadow-sm" title="WhatsApp Notice"><MessageCircle size={16} /></button>
                      <button onClick={() => handleSendComm(job, 'DISPATCH_READY', 'EMAIL')} className="p-2 bg-white dark:bg-slate-800 rounded-lg text-blue-600 border dark:border-slate-700 shadow-sm" title="Email Notice"><Mail size={16} /></button>
                   </div>
                </div>
              ))}

              {overdueUnpaidJobs.map(job => (
                <div key={job.id} className="p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-800/50 flex items-center justify-between">
                   <div>
                      <p className="font-bold text-sm dark:text-white">{job.title}</p>
                      <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">Payment Overdue</p>
                   </div>
                   <div className="flex gap-2">
                      <button onClick={() => handleSendComm(job, 'PAYMENT_REMINDER', 'WA')} className="p-2 bg-white dark:bg-slate-800 rounded-lg text-green-600 border dark:border-slate-700 shadow-sm" title="WhatsApp Reminder"><MessageCircle size={16} /></button>
                      <button onClick={() => handleSendComm(job, 'PAYMENT_REMINDER', 'EMAIL')} className="p-2 bg-white dark:bg-slate-800 rounded-lg text-blue-600 border dark:border-slate-700 shadow-sm" title="Email Reminder"><Mail size={16} /></button>
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Completion Performance */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
           <div className="flex items-center justify-between mb-8">
              <h2 className="font-black text-lg uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <CheckCircle2 size={20} /> Completion Performance
              </h2>
           </div>
           <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border dark:border-slate-800">
                 <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Today</p>
                 <p className="text-2xl font-black text-green-600">{jobs.filter(j => j.status === JobStatus.COMPLETED && new Date(j.updatedAt).toDateString() === new Date().toDateString()).length}</p>
              </div>
              <div className="text-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border dark:border-slate-800">
                 <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Birthdays</p>
                 <p className="text-2xl font-black text-pink-600">{birthdaysToday.length}</p>
              </div>
              <div className="text-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border dark:border-slate-800">
                 <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Monthly</p>
                 <p className="text-2xl font-black text-blue-600">{jobs.filter(j => j.status === JobStatus.COMPLETED).length}</p>
              </div>
           </div>
           <p className="mt-6 text-[10px] font-bold text-slate-400 uppercase text-center tracking-widest">
             Engagement stats based on today's active customer base.
           </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-lg dark:text-white">Sales Analytics</h2>
              <select className="bg-slate-50 dark:bg-slate-800 border-none text-sm font-medium rounded-lg px-3 py-1 outline-none dark:text-slate-200">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
              </select>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={isDarkMode ? 0.3 : 0.1}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "#334155" : "#f1f5f9"} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                      borderRadius: '12px', 
                      border: 'none', 
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                      color: isDarkMode ? '#f8fafc' : '#0f172a'
                    }}
                    itemStyle={{ color: '#3b82f6' }}
                    cursor={{ stroke: '#3b82f6', strokeWidth: 2 }}
                  />
                  <Area type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-6 rounded-2xl text-white shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={20} className="text-yellow-300" />
              <h3 className="font-bold">AI Business Insights</h3>
            </div>
            {loadingInsight ? (
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-white/20 rounded w-full"></div>
                <div className="h-4 bg-white/20 rounded w-5/6"></div>
              </div>
            ) : (
              <p className="text-sm leading-relaxed text-indigo-100">
                {insight}
              </p>
            )}
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <h2 className="font-bold mb-4 dark:text-white">Recent Active Jobs</h2>
            <div className="space-y-4">
              {jobs.slice(0, 4).map((job) => (
                <div key={job.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <Briefcase size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold dark:text-slate-200">{job.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Source: {job.source}</p>
                    </div>
                  </div>
                  <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase ${job.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{job.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

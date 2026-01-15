
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  CalendarDays, Plus, Search, Filter, Trash2, 
  CreditCard, AlertCircle, CheckCircle2, X,
  ExternalLink, Bell
} from 'lucide-react';
import { UserRole } from '../types';

export const Subscriptions = () => {
  const { subscriptions, addSubscription, deleteSubscription, currentUser, currentCurrency } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [form, setForm] = useState({
    name: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    amount: 0,
    paymentDetails: '',
    status: 'ACTIVE' as 'ACTIVE' | 'EXPIRED' | 'CANCELLED'
  });

  const isAdmin = currentUser.role === UserRole.ADMIN;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addSubscription(form);
    setShowModal(false);
    setForm({
      name: '',
      purchaseDate: new Date().toISOString().split('T')[0],
      expiryDate: '',
      amount: 0,
      paymentDetails: '',
      status: 'ACTIVE'
    });
  };

  const filtered = subscriptions.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getUrgency = (expiry: string) => {
    const days = Math.ceil((new Date(expiry).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (days <= 0) return { label: 'EXPIRED', color: 'bg-red-100 text-red-600' };
    if (days <= 5) return { label: `CRITICAL: ${days}D`, color: 'bg-red-50 text-red-600' };
    if (days <= 15) return { label: `WARNING: ${days}D`, color: 'bg-amber-50 text-amber-600' };
    if (days <= 30) return { label: `NOTICE: ${days}D`, color: 'bg-blue-50 text-blue-600' };
    return { label: 'HEALTHY', color: 'bg-green-50 text-green-600' };
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold dark:text-white uppercase tracking-tight">Business Subscriptions</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage tool renewals, SaaS costs, and license tracking.</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 px-6 py-3 rounded-xl font-black text-white shadow-lg hover:bg-blue-700 transition-all uppercase tracking-widest text-xs"
          >
            <Plus size={18} /> New Subscription
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-3">
        <Search className="text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Search by tool name..." 
          className="flex-1 bg-transparent outline-none dark:text-white"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Bell size={20} className="text-amber-500" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(sub => {
          const urgency = getUrgency(sub.expiryDate);
          return (
            <div key={sub.id} className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden group hover:border-blue-300 transition-all relative">
              <div className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-2xl">
                    <CreditCard size={28} />
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${urgency.color}`}>
                    {urgency.label}
                  </div>
                </div>

                <h3 className="text-xl font-black dark:text-white mb-2">{sub.name}</h3>
                <div className="space-y-2 mb-6">
                  <p className="text-xs text-slate-500 flex items-center justify-between">
                    <span>Purchased:</span>
                    <span className="font-bold">{sub.purchaseDate}</span>
                  </p>
                  <p className="text-xs text-slate-500 flex items-center justify-between">
                    <span>Renews On:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{sub.expiryDate}</span>
                  </p>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border dark:border-slate-800 mb-6">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Billing Value</p>
                  <p className="text-xl font-black text-blue-600">{currentCurrency} {sub.amount.toLocaleString()}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button className="flex-1 bg-slate-900 dark:bg-slate-800 text-white font-black py-3 rounded-xl text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all">
                    Update Details
                  </button>
                  {isAdmin && (
                    <button 
                      onClick={() => { if(window.confirm('Delete this record?')) deleteSubscription(sub.id); }}
                      className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-lg p-10 animate-in zoom-in border dark:border-slate-800">
             <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black dark:text-white uppercase tracking-tight">New Subscription</h2>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-full dark:text-white"><X size={24} /></button>
             </div>
             <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Subscription Name</label>
                   <input 
                    type="text" 
                    className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-bold"
                    value={form.name}
                    onChange={e => setForm({...form, name: e.target.value})}
                    placeholder="e.g., Adobe Creative Cloud"
                    required
                   />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Purchase Date</label>
                    <input type="date" className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-bold" value={form.purchaseDate} onChange={e => setForm({...form, purchaseDate: e.target.value})} required />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Expiry Date</label>
                    <input type="date" className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-bold" value={form.expiryDate} onChange={e => setForm({...form, expiryDate: e.target.value})} required />
                  </div>
                </div>
                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Billing Amount ({currentCurrency})</label>
                   <input type="number" className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-black text-xl" value={form.amount || ''} onChange={e => setForm({...form, amount: Number(e.target.value)})} placeholder="0.00" required />
                </div>
                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Payment Details</label>
                   <input type="text" className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-medium" value={form.paymentDetails} onChange={e => setForm({...form, paymentDetails: e.target.value})} placeholder="e.g., Visa card ending in 4455" />
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-blue-700 transition-all uppercase tracking-[0.2em] text-xs">
                  Create Subscription Record
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

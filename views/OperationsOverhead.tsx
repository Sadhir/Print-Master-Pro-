
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Receipt, Plus, Search, Trash2, Edit3, X, 
  DollarSign, Calendar, Landmark, MapPin, 
  CheckCircle2, AlertCircle, Clock, Droplets, 
  Zap, Home, FileText, ShieldCheck, Key
} from 'lucide-react';
import { CommitmentCategory, UserRole, BusinessCommitment } from '../types';

export const OperationsOverhead = () => {
  const { commitments, addCommitment, updateCommitment, deleteCommitment, payCommitment, currentCurrency, branches, accounts, currentUser } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState<string | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState(accounts[0]?.id || '');

  const [form, setForm] = useState({
    name: '',
    category: CommitmentCategory.OTHER,
    amount: 0,
    dueDate: new Date().toISOString().split('T')[0],
    isRecurring: true,
    branchId: branches[0]?.id || '',
    notes: '',
    status: 'PENDING' as 'PAID' | 'PENDING' | 'OVERDUE'
  });

  const isAdmin = currentUser.role === UserRole.ADMIN;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) updateCommitment(isEditing, form);
    else addCommitment({ ...form, status: 'PENDING' });
    setShowModal(false);
    setIsEditing(null);
    setForm({ name: '', category: CommitmentCategory.OTHER, amount: 0, dueDate: new Date().toISOString().split('T')[0], isRecurring: true, branchId: branches[0]?.id || '', notes: '', status: 'PENDING' });
  };

  const handlePay = () => {
    if (showPaymentModal && selectedAccountId) {
      payCommitment(showPaymentModal, selectedAccountId);
      setShowPaymentModal(null);
    }
  };

  const getCategoryIcon = (category: CommitmentCategory) => {
    switch (category) {
      case CommitmentCategory.SHOP_RENTAL: return Home;
      case CommitmentCategory.ELECTRICITY: return Zap;
      case CommitmentCategory.WATER: return Droplets;
      case CommitmentCategory.MAINTENANCE: return FileText;
      case CommitmentCategory.GOVT_TAX: return Receipt;
      case CommitmentCategory.LICENCE: return ShieldCheck;
      case CommitmentCategory.BIZ_REGISTRATION: return FileText;
      case CommitmentCategory.KEYMONEY: return Key;
      default: return Receipt;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-green-50 text-green-600';
      case 'OVERDUE': return 'bg-red-50 text-red-600';
      default: return 'bg-amber-50 text-amber-600';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold dark:text-white uppercase tracking-tight">Operational Overheads</h1>
          <p className="text-slate-500 dark:text-slate-400">Track rental, utilities, taxes, and other commitments.</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => { setIsEditing(null); setShowModal(true); }}
            className="flex items-center gap-2 bg-blue-600 px-6 py-3 rounded-xl font-black text-white shadow-lg hover:bg-blue-700 transition-all uppercase tracking-widest text-xs"
          >
            <Plus size={18} /> New Bill/Commitment
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {commitments.map(c => {
          const Icon = getCategoryIcon(c.category);
          const branch = branches.find(b => b.id === c.branchId);
          return (
            <div key={c.id} className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm p-8 group hover:border-blue-300 transition-all relative">
              <div className="flex items-start justify-between mb-6">
                <div className={`p-4 rounded-2xl ${getStatusColor(c.status)}`}>
                  <Icon size={28} />
                </div>
                <div className="flex flex-col items-end gap-1">
                   <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${getStatusColor(c.status)}`}>
                    {c.status}
                  </span>
                  {c.isRecurring && <span className="text-[7px] font-black text-blue-500 uppercase tracking-widest">Recurring Monthly</span>}
                </div>
              </div>
              
              <h3 className="text-xl font-black dark:text-white mb-1 line-clamp-1">{c.name}</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">{c.category.replace('_', ' ')}</p>
              
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl font-black text-blue-600">{currentCurrency} {c.amount.toLocaleString()}</span>
              </div>

              <div className="space-y-3 mb-8 border-t dark:border-slate-800 pt-4">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                  <span className="flex items-center gap-1"><Calendar size={12} /> Due Date</span>
                  <span className="dark:text-slate-300">{c.dueDate || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                  <span className="flex items-center gap-1"><MapPin size={12} /> Branch</span>
                  <span className="dark:text-slate-300">{branch?.name || 'Main'}</span>
                </div>
              </div>

              <div className="flex gap-2">
                {c.status !== 'PAID' && isAdmin ? (
                  <button 
                    onClick={() => { setShowPaymentModal(c.id); setSelectedAccountId(accounts[0]?.id || ''); }}
                    className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                  >
                    Mark as Paid
                  </button>
                ) : (
                  <div className="flex-1 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl font-black text-[10px] uppercase tracking-widest text-center text-slate-400 border dark:border-slate-700">
                    Payment Logged: {c.paidDate || 'Historical'}
                  </div>
                )}
                
                <button 
                  onClick={() => { setIsEditing(c.id); setForm(c as any); setShowModal(true); }}
                  className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-blue-600 rounded-xl border dark:border-slate-700"
                >
                  <Edit3 size={16} />
                </button>
                {isAdmin && (
                  <button 
                    onClick={() => { if(window.confirm('Delete this record?')) deleteCommitment(c.id); }}
                    className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bill / Commitment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-lg p-10 animate-in zoom-in border dark:border-slate-800 max-h-[90vh] overflow-y-auto">
             <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black dark:text-white uppercase tracking-tight">{isEditing ? 'Update Commitment' : 'Add New Bill/Overhead'}</h2>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-full dark:text-white"><X size={24} /></button>
             </div>
             <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Description / Title</label>
                   <input required type="text" className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-bold" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g., Shop Rent - March" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Category</label>
                    <select className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-bold" value={form.category} onChange={e => setForm({...form, category: e.target.value as any})}>
                        {Object.values(CommitmentCategory).map(cat => (
                          <option key={cat} value={cat}>{cat.replace('_', ' ')}</option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Amount ({currentCurrency})</label>
                    <input required type="number" className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-black" value={form.amount || ''} onChange={e => setForm({...form, amount: Number(e.target.value)})} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Due Date</label>
                    <input type="date" className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-bold" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Branch</label>
                    <select required className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-bold" value={form.branchId} onChange={e => setForm({...form, branchId: e.target.value})}>
                      {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="recurring" checked={form.isRecurring} onChange={e => setForm({...form, isRecurring: e.target.checked})} className="w-5 h-5 accent-blue-600" />
                  <label htmlFor="recurring" className="text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer">This is a recurring monthly bill</label>
                </div>
                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Internal Notes</label>
                   <textarea className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-medium" rows={3} value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Technician details, account numbers, etc." />
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-blue-700 transition-all uppercase tracking-[0.2em] text-xs">
                  {isEditing ? 'Update commitment' : 'Add to ledger'}
                </button>
             </form>
          </div>
        </div>
      )}

      {/* Payment Selection Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[110] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-md p-10 animate-in zoom-in border dark:border-slate-800">
             <h2 className="text-2xl font-black mb-6 dark:text-white uppercase tracking-tight text-center">Confirm Payment</h2>
             <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Select Account to Debit</label>
                  <select 
                    className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-bold"
                    value={selectedAccountId}
                    onChange={e => setSelectedAccountId(e.target.value)}
                  >
                    {accounts.map(a => <option key={a.id} value={a.id}>{a.name} ({currentCurrency} {a.balance.toLocaleString()})</option>)}
                  </select>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                  <p className="text-[10px] font-bold text-blue-700 dark:text-blue-300 uppercase leading-relaxed">
                    This will create an expense transaction and deduct the balance from the selected account.
                  </p>
                </div>
                <div className="flex gap-4">
                   <button onClick={() => setShowPaymentModal(null)} className="flex-1 py-4 font-bold text-slate-500 uppercase tracking-widest text-[10px]">Cancel</button>
                   <button onClick={handlePay} className="flex-1 bg-green-600 text-white font-black py-4 rounded-2xl shadow-lg hover:bg-green-700 transition-all uppercase tracking-[0.2em] text-[10px]">Confirm Paid</button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

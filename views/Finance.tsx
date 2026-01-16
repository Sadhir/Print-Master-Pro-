
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Wallet, ArrowRightLeft, TrendingUp, Users, DollarSign, Plus, Info,
  Banknote, Landmark, PiggyBank, Key, Receipt, FileText, ShieldCheck, 
  Zap, Droplets, Home, Building, ArrowRight, X, Trash2, Edit3, Save, Percent
} from 'lucide-react';
import { CommitmentCategory, Transaction, Job, CurrencyCode, UserRole } from '../types';

export const Finance = () => {
  const { 
    accounts, partners, transferFunds, currentCurrency, jobs, transactions, 
    allCommitments, branches, addPartner, updatePartner, deletePartner, currentUser 
  } = useApp();
  
  const [showTransfer, setShowTransfer] = useState(false);
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [transferData, setTransferData] = useState({ from: '', to: '', amount: 0 });
  const [partnerForm, setPartnerForm] = useState({ name: '', sharePercentage: 50 });
  const [editingPartnerId, setEditingPartnerId] = useState<string | null>(null);

  const isAdmin = currentUser.role === UserRole.ADMIN;

  const totalSales = jobs.reduce((acc, j) => acc + j.paidAmount, 0) + 
                    transactions.filter(t => t.type === 'SALE').reduce((acc, t) => acc + t.amount, 0);
  
  const totalOperationalExpenses = transactions
    .filter(t => ['EXPENSE', 'OPERATIONAL_BILL', 'MACHINERY_SERVICE', 'STAFF_PAYROLL'].includes(t.type))
    .reduce((acc, t) => acc + t.amount, 0);

  const outsourcedCost = jobs.reduce((acc, j) => acc + (j.outsourcedCost || 0), 0);
  const netProfit = totalSales - outsourcedCost - totalOperationalExpenses;

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (transferData.from && transferData.to && transferData.amount > 0) {
      transferFunds(transferData.from, transferData.to, transferData.amount);
      setShowTransfer(false);
      setTransferData({ from: '', to: '', amount: 0 });
    }
  };

  const handlePartnerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPartnerId) {
      updatePartner(editingPartnerId, partnerForm);
    } else {
      addPartner(partnerForm);
    }
    setShowPartnerModal(false);
    setPartnerForm({ name: '', sharePercentage: 50 });
    setEditingPartnerId(null);
  };

  const accountIcons = { CASH: Banknote, BANK: Landmark, SAVINGS: PiggyBank };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold dark:text-white uppercase tracking-tight">Financial Value & Equity</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Global cash flow, liabilities, and partner ownership split.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowPartnerModal(true)}
            className="flex items-center gap-2 bg-white dark:bg-slate-800 border dark:border-slate-700 px-6 py-3 rounded-xl font-black text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 transition-all uppercase tracking-widest text-[10px]"
          >
            <Users size={18} /> Manage Partners
          </button>
          <button 
            onClick={() => setShowTransfer(true)}
            className="flex items-center gap-2 bg-blue-600 px-6 py-3 rounded-xl font-black text-white shadow-lg hover:bg-blue-700 transition-all uppercase tracking-widest text-[10px]"
          >
            <ArrowRightLeft size={20} /> Internal Transfer
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ValueStatCard label="Total Net Profit" value={netProfit} icon={TrendingUp} color="bg-green-600" currency={currentCurrency} sub="Available for Sharing" />
        <ValueStatCard label="Pending Bills" value={allCommitments.filter(c => c.status !== 'PAID').reduce((a,c)=>a+c.amount,0)} icon={Receipt} color="bg-red-500" currency={currentCurrency} sub="Unpaid Overheads" />
        <ValueStatCard label="Cash Pool" value={accounts.reduce((a,c)=>a+c.balance,0)} icon={Wallet} color="bg-blue-600" currency={currentCurrency} sub="Liquid Assets" />
        <ValueStatCard label="Compliance Costs" value={allCommitments.filter(c => [CommitmentCategory.GOVT_TAX, CommitmentCategory.LICENCE].includes(c.category)).reduce((a,c)=>a+c.amount,0)} icon={ShieldCheck} color="bg-amber-500" currency={currentCurrency} sub="Tax & Reg." />
      </div>

      <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-10">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="p-4 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-2xl">
                 <Users size={32} />
              </div>
              <div>
                 <h2 className="text-2xl font-black dark:text-white uppercase tracking-tight">Partner Equity Matrix</h2>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Real-time split of shareable profit pool</p>
              </div>
           </div>
           <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Stake %</p>
              <p className={`text-3xl font-black ${partners.reduce((a,b)=>a+b.sharePercentage,0) > 100 ? 'text-red-500' : 'text-blue-600'}`}>
                {partners.reduce((a,b)=>a+b.sharePercentage,0)}%
              </p>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           {partners.length === 0 ? (
             <div className="lg:col-span-2 py-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem]">
                <Users size={48} className="mx-auto text-slate-200 dark:text-slate-800 mb-4" />
                <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No partners registered</p>
             </div>
           ) : (
             partners.map(partner => {
               const shareValue = (netProfit * (partner.sharePercentage / 100));
               const currentEquity = shareValue - partner.totalDraws;
               return (
                 <div key={partner.id} className="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] border dark:border-slate-700 relative group overflow-hidden">
                    <div className="flex items-start justify-between mb-8 relative z-10">
                       <div>
                          <h4 className="font-black text-xl dark:text-white uppercase tracking-tight">{partner.name}</h4>
                          <div className="flex items-center gap-1.5 mt-1">
                             <Percent size={12} className="text-purple-600" />
                             <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest">{partner.sharePercentage}% Ownership Stake</span>
                          </div>
                       </div>
                       <div className="flex gap-2">
                          <button 
                            onClick={() => { setPartnerForm({ name: partner.name, sharePercentage: partner.sharePercentage }); setEditingPartnerId(partner.id); setShowPartnerModal(true); }}
                            className="p-3 bg-white dark:bg-slate-700 rounded-xl text-slate-400 hover:text-blue-600 transition-all shadow-sm"
                          >
                             <Edit3 size={18} />
                          </button>
                          <button 
                            onClick={() => { if(window.confirm(`Delete partner ${partner.name}?`)) deletePartner(partner.id); }}
                            className="p-3 bg-white dark:bg-slate-700 rounded-xl text-slate-400 hover:text-red-500 transition-all shadow-sm"
                          >
                             <Trash2 size={18} />
                          </button>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 relative z-10 border-t dark:border-slate-700 pt-8">
                       <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Gross Share</p>
                          <p className="text-xl font-black dark:text-white leading-none">{currentCurrency} {shareValue.toLocaleString()}</p>
                       </div>
                       <div className="text-right">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Available Equity</p>
                          <p className={`text-2xl font-black leading-none ${currentEquity < 0 ? 'text-red-500' : 'text-green-600'}`}>{currentCurrency} {currentEquity.toLocaleString()}</p>
                       </div>
                    </div>
                    <Users size={160} className="absolute -right-12 -bottom-12 opacity-[0.03] group-hover:rotate-12 transition-transform" />
                 </div>
               );
             })
           )}
        </div>
      </div>

      {/* Partner Management Modal */}
      {showPartnerModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[150] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-lg p-10 animate-in zoom-in border dark:border-slate-800 shadow-2xl">
             <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black dark:text-white uppercase tracking-tight">{editingPartnerId ? 'Edit Partner Stake' : 'Register New Partner'}</h2>
                <button onClick={() => { setShowPartnerModal(false); setEditingPartnerId(null); }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full dark:text-white"><X size={24} /></button>
             </div>
             <form onSubmit={handlePartnerSubmit} className="space-y-6">
                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Legal Partner Name</label>
                   <input required type="text" className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-bold" value={partnerForm.name} onChange={e => setPartnerForm({...partnerForm, name: e.target.value})} placeholder="e.g. Michael Thorne" />
                </div>
                <div>
                   <div className="flex justify-between items-center mb-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Share Percentage</label>
                     <span className="font-black text-blue-600">{partnerForm.sharePercentage}%</span>
                   </div>
                   <input 
                    type="range" min="1" max="100" 
                    className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    value={partnerForm.sharePercentage}
                    onChange={e => setPartnerForm({...partnerForm, sharePercentage: Number(e.target.value)})}
                   />
                   <div className="flex justify-between text-[8px] font-black text-slate-400 mt-2">
                      <span>1%</span>
                      <span>50%</span>
                      <span>100%</span>
                   </div>
                </div>
                <div className="p-6 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30 flex gap-4">
                   <Info size={20} className="text-blue-600 shrink-0" />
                   <p className="text-[10px] font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider leading-relaxed">
                     Profit split is calculated automatically based on this value after all expenses and overheads are deducted from gross revenue.
                   </p>
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-blue-700 transition-all uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-2">
                  <Save size={18} /> {editingPartnerId ? 'Update Equity Data' : 'Authorize Partner'}
                </button>
             </form>
          </div>
        </div>
      )}

      {/* Internal Transfer Modal remains as is from previous file content */}
      {showTransfer && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-lg shadow-2xl border dark:border-slate-800 overflow-hidden animate-in zoom-in duration-300 p-10">
            <div className="flex items-center justify-between mb-10">
               <div>
                <h2 className="text-2xl font-black dark:text-white uppercase tracking-tight">Fund Transfer</h2>
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Move money between business accounts</p>
               </div>
               <button onClick={() => setShowTransfer(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full dark:text-white">
                <X size={28} />
              </button>
            </div>
            <form onSubmit={handleTransfer} className="space-y-8">
               <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">From Source</label>
                    <select 
                      className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-bold"
                      value={transferData.from}
                      onChange={e => setTransferData({...transferData, from: e.target.value})}
                      required
                    >
                      <option value="">Choose Account...</option>
                      {accounts.map(a => <option key={a.id} value={a.id}>{a.name} ({currentCurrency} {a.balance})</option>)}
                    </select>
                  </div>
                  <div className="flex justify-center -my-3 relative z-10">
                     <div className="bg-blue-600 text-white p-3 rounded-full shadow-lg">
                        <ArrowRight className="rotate-90" size={20} />
                     </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">To Destination</label>
                    <select 
                      className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-bold"
                      value={transferData.to}
                      onChange={e => setTransferData({...transferData, to: e.target.value})}
                      required
                    >
                      <option value="">Choose Account...</option>
                      {accounts.map(a => <option key={a.id} value={a.id}>{a.name} ({currentCurrency} {a.balance})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Transfer Value ({currentCurrency})</label>
                    <input 
                      type="number" 
                      className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-3xl px-8 py-6 outline-none dark:text-white font-black text-4xl text-center"
                      value={transferData.amount || ''}
                      onChange={e => setTransferData({...transferData, amount: Number(e.target.value)})}
                      placeholder="0.00"
                      required
                    />
                  </div>
               </div>
               <button className="w-full bg-blue-600 text-white font-black py-6 rounded-[2rem] shadow-xl hover:bg-blue-700 transition-all uppercase tracking-[0.3em] text-xs">
                 AUTHENTICATE & TRANSFER
               </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const ValueStatCard = ({ label, value, icon: Icon, color, currency, sub }: any) => (
  <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm group hover:border-blue-300 transition-all overflow-hidden relative">
    <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform relative z-10`}>
      <Icon size={24} />
    </div>
    <div className="relative z-10">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</p>
      <p className="text-2xl font-black dark:text-white mb-1">
        {currency} {Math.abs(value).toLocaleString()}
      </p>
      <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{sub}</p>
    </div>
    <Icon size={80} className="absolute -right-4 -bottom-4 opacity-5 text-slate-900 dark:text-white" />
  </div>
);

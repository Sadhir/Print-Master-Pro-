
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Wallet, 
  ArrowRightLeft, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Plus, 
  Info,
  Banknote,
  Landmark,
  PiggyBank,
  Key,
  Receipt,
  FileText,
  ShieldCheck,
  Zap,
  Droplets,
  Home,
  Building,
  ArrowRight,
  // Added missing X icon import
  X
} from 'lucide-react';
import { CommitmentCategory, Transaction, Job, CurrencyCode } from '../types';

export const Finance = () => {
  const { 
    accounts, 
    partners, 
    transferFunds, 
    currentCurrency, 
    jobs, 
    transactions, 
    allCommitments,
    branches 
  } = useApp();
  
  const [showTransfer, setShowTransfer] = useState(false);
  const [transferData, setTransferData] = useState({ from: '', to: '', amount: 0 });

  // --- Financial Aggregations ---
  const totalSales = jobs.reduce((acc, j) => acc + j.paidAmount, 0) + 
                    transactions.filter(t => t.type === 'SALE').reduce((acc, t) => acc + t.amount, 0);
  
  const totalOperationalExpenses = transactions
    .filter(t => ['EXPENSE', 'OPERATIONAL_BILL', 'MACHINERY_SERVICE', 'STAFF_PAYROLL'].includes(t.type))
    .reduce((acc, t) => acc + t.amount, 0);

  const outsourcedCost = jobs.reduce((acc, j) => acc + (j.outsourcedCost || 0), 0);
  const netProfit = totalSales - outsourcedCost - totalOperationalExpenses;

  // --- Overhead Aggregations ---
  const pendingOverheads = allCommitments
    .filter(c => c.status !== 'PAID')
    .reduce((acc, c) => acc + c.amount, 0);

  const totalKeymoney = allCommitments
    .filter(c => c.category === CommitmentCategory.KEYMONEY)
    .reduce((acc, c) => acc + c.amount, 0);

  const totalGovtCompliance = allCommitments
    .filter(c => [CommitmentCategory.GOVT_TAX, CommitmentCategory.LICENCE, CommitmentCategory.BIZ_REGISTRATION].includes(c.category))
    .reduce((acc, c) => acc + c.amount, 0);

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (transferData.from && transferData.to && transferData.amount > 0) {
      transferFunds(transferData.from, transferData.to, transferData.amount);
      setShowTransfer(false);
      setTransferData({ from: '', to: '', amount: 0 });
    }
  };

  const accountIcons = {
    CASH: Banknote,
    BANK: Landmark,
    SAVINGS: PiggyBank
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold dark:text-white uppercase tracking-tight">Financial Value & Equity</h1>
          <p className="text-slate-500 dark:text-slate-400">Comprehensive overview of cash, assets, liabilities, and partner shares.</p>
        </div>
        <button 
          onClick={() => setShowTransfer(true)}
          className="flex items-center gap-2 bg-blue-600 px-6 py-3 rounded-xl font-black text-white shadow-lg hover:bg-blue-700 transition-all uppercase tracking-widest text-xs"
        >
          <ArrowRightLeft size={20} /> Internal Transfer
        </button>
      </div>

      {/* Main Asset Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ValueStatCard 
          label="Total Keymoney" 
          value={totalKeymoney} 
          icon={Key} 
          color="bg-indigo-600" 
          currency={currentCurrency} 
          sub="Locked Asset Value"
        />
        <ValueStatCard 
          label="Pending Bills" 
          value={pendingOverheads} 
          icon={Receipt} 
          color="bg-red-500" 
          currency={currentCurrency} 
          sub="Unpaid Overheads"
        />
        <ValueStatCard 
          label="Compliance Costs" 
          value={totalGovtCompliance} 
          icon={ShieldCheck} 
          color="bg-amber-500" 
          currency={currentCurrency} 
          sub="Tax, Licence & Reg."
        />
        <ValueStatCard 
          label="Current Net Profit" 
          value={netProfit} 
          icon={TrendingUp} 
          color="bg-green-600" 
          currency={currentCurrency} 
          sub="Available for Sharing"
        />
      </div>

      {/* Financial Accounts Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {accounts.map(acc => {
          const Icon = (accountIcons as any)[acc.type];
          const branch = branches.find(b => b.id === acc.branchId);
          return (
            <div key={acc.id} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-2xl transition-transform group-hover:scale-110">
                    <Icon size={24} />
                  </div>
                  <div>
                    <h3 className="font-black dark:text-white uppercase tracking-tight">{acc.name}</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{branch?.name || 'Central'}</p>
                  </div>
                </div>
                <span className="bg-slate-50 dark:bg-slate-800 text-[8px] font-black px-2 py-1 rounded-full text-slate-400 uppercase">{acc.type}</span>
              </div>
              <p className="text-3xl font-black dark:text-white">{currentCurrency} {acc.balance.toLocaleString()}</p>
              <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Icon size={140} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profit Sharing Panel */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-50 dark:bg-purple-900/30 text-purple-600 rounded-2xl">
                <Users size={24} />
              </div>
              <h2 className="font-black text-xl dark:text-white uppercase tracking-tight">Partner Equity Split</h2>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Shareable Pool</p>
              <p className="text-2xl font-black text-green-600">{currentCurrency} {netProfit.toLocaleString()}</p>
            </div>
          </div>

          <div className="space-y-4">
            {partners.map(partner => {
              const shareValue = (netProfit * (partner.sharePercentage / 100));
              const currentEquity = shareValue - partner.totalDraws;
              return (
                <div key={partner.id} className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800 group hover:border-purple-300 transition-all">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h4 className="font-black text-lg dark:text-white uppercase tracking-tight">{partner.name}</h4>
                      <p className="text-[10px] text-purple-600 font-black tracking-widest uppercase">{partner.sharePercentage}% Ownership Stake</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Share Val.</p>
                      <p className="font-black text-lg dark:text-white">{currentCurrency} {shareValue.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-8 pt-6 border-t dark:border-slate-700">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Withdrawn</p>
                      <p className="text-red-500 font-black">-{currentCurrency} {partner.totalDraws.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Available to Draw</p>
                      <p className="text-green-600 font-black text-xl">{currentCurrency} {currentEquity.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-[2rem] border border-blue-100 dark:border-blue-900/30 flex gap-4">
             <Info size={24} className="text-blue-600 shrink-0" />
             <div className="space-y-1">
                <p className="text-[10px] font-black text-blue-700 dark:text-blue-300 uppercase tracking-widest">Accounting Logic</p>
                <p className="text-xs font-medium text-blue-600 dark:text-blue-400 leading-relaxed">
                  Net Profit = (Total POS Sales + Job Revenue) - (Outsourced Costs + Rent + Utilities + Maintenance + Staff Costs).
                </p>
             </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Unpaid Overheads Preview */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-black text-xl dark:text-white uppercase tracking-tight">Pending Liabilities</h3>
              <span className="bg-red-50 text-red-600 text-[8px] font-black px-2 py-1 rounded-full">ACTION REQUIRED</span>
            </div>
            <div className="space-y-3">
              {allCommitments.filter(c => c.status !== 'PAID').length === 0 ? (
                <div className="py-10 text-center text-slate-400 font-black uppercase text-[10px] tracking-widest">No outstanding bills</div>
              ) : (
                allCommitments.filter(c => c.status !== 'PAID').slice(0, 4).map(c => (
                  <div key={c.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border dark:border-slate-800">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-white dark:bg-slate-700 rounded-xl shadow-sm text-slate-400">
                        {c.category === CommitmentCategory.SHOP_RENTAL ? <Home size={16} /> : 
                         c.category === CommitmentCategory.ELECTRICITY ? <Zap size={16} /> :
                         <Receipt size={16} />}
                      </div>
                      <div>
                        <p className="text-xs font-black dark:text-white uppercase tracking-tight">{c.name}</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Due: {c.dueDate || 'N/A'}</p>
                      </div>
                    </div>
                    <p className="font-black text-red-500 text-sm">{currentCurrency} {c.amount.toLocaleString()}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Keymoney / Deposit Values */}
          <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
             <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-blue-600 rounded-2xl">
                    <Key size={24} />
                  </div>
                  <h3 className="font-black text-xl uppercase tracking-tight">Business Security Values</h3>
                </div>
                <div className="space-y-6">
                   <div className="grid grid-cols-2 gap-6">
                      <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                         <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Total Keymoney</p>
                         <p className="text-2xl font-black text-blue-400">{currentCurrency} {totalKeymoney.toLocaleString()}</p>
                      </div>
                      <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                         <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Compliance Assets</p>
                         <p className="text-2xl font-black text-amber-400">{currentCurrency} {totalGovtCompliance.toLocaleString()}</p>
                      </div>
                   </div>
                   <p className="text-[10px] text-slate-400 font-medium leading-relaxed uppercase tracking-widest">
                     Security deposits (Keymoney) and business registration fees are considered non-liquid value entries in your business valuation.
                   </p>
                </div>
             </div>
             <Building size={180} className="absolute -right-12 -bottom-12 opacity-5" />
          </div>
        </div>
      </div>

      {/* Internal Transfer Modal */}
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

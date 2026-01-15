
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import { 
  DollarSign, TrendingUp, TrendingDown, Briefcase, ExternalLink, 
  Trash2, Wallet, Users, ArrowUpRight, ArrowDownLeft, PieChart as PieChartIcon,
  Filter, Calendar, Download, RefreshCcw, Landmark
} from 'lucide-react';
import { UserRole, Transaction, Job, CurrencyCode, CommitmentCategory } from '../types';

export const Reports = () => {
  const { 
    jobs, transactions, allTransactions, commitments, isDarkMode, currentUser, 
    deleteTransaction, currentCurrency, partners, staff, 
    machinery, subscriptions, selectedBranchId, branches 
  } = useApp();
  
  const [timeRange, setTimeRange] = useState<'7D' | '30D' | 'YTD' | 'ALL'>('ALL');
  const isAdmin = currentUser.role === UserRole.ADMIN;

  // --- FINANCIAL CALCULATIONS ---

  // 1. Total Revenue (Jobs + POS Sales + Legacy Imports)
  const totalJobRevenue = jobs.reduce((acc, j) => acc + (j.paidAmount || 0), 0);
  const totalPosRevenue = transactions.filter(t => t.type === 'SALE').reduce((acc, t) => acc + t.amount, 0);
  const legacyRevenue = transactions.filter(t => t.type === 'IMPORT').reduce((acc, t) => acc + t.amount, 0);
  const totalGrossRevenue = totalJobRevenue + totalPosRevenue + legacyRevenue;

  // 2. Total Expenses
  // Type: EXPENSE, STAFF_PAYROLL, STAFF_ADVANCE, MACHINERY_SERVICE, OPERATIONAL_BILL
  const transactionExpenses = transactions.filter(t => 
    ['EXPENSE', 'STAFF_PAYROLL', 'STAFF_ADVANCE', 'MACHINERY_SERVICE', 'OPERATIONAL_BILL'].includes(t.type)
  ).reduce((acc, t) => acc + t.amount, 0);
  
  // Job Outsourcing (Internal costs)
  const jobOutsourcedCosts = jobs.reduce((acc, j) => acc + (j.outsourcedCost || 0), 0);
  
  const totalExpenses = transactionExpenses + jobOutsourcedCosts;
  const netProfit = totalGrossRevenue - totalExpenses;

  // 3. Asset Value (Include Keymoney)
  const totalKeymoney = commitments
    .filter(c => c.category === CommitmentCategory.KEYMONEY)
    .reduce((acc, c) => acc + c.amount, 0);

  // 4. Partner Share Breakdown
  const partnerBreakdown = partners.map(p => ({
    name: p.name,
    share: p.sharePercentage,
    amount: (netProfit * (p.sharePercentage / 100)) - p.totalDraws
  }));

  // 5. Chart Data
  const expenseDistribution = [
    { name: 'Outsourced', value: jobOutsourcedCosts },
    { name: 'Operational Bills', value: transactions.filter(t => t.type === 'OPERATIONAL_BILL').reduce((acc, t) => acc + t.amount, 0) },
    { name: 'Staff Costs', value: transactions.filter(t => t.type === 'STAFF_PAYROLL' || t.type === 'STAFF_ADVANCE').reduce((acc, t) => acc + t.amount, 0) },
    { name: 'Maintenance', value: transactions.filter(t => t.type === 'MACHINERY_SERVICE').reduce((acc, t) => acc + t.amount, 0) },
    { name: 'General', value: transactions.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.amount, 0) },
  ].filter(d => d.value > 0);

  const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

  if (!isAdmin) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center p-8">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 mb-6">
          <Briefcase size={40} />
        </div>
        <h2 className="text-2xl font-black dark:text-white uppercase tracking-tight">Access Restricted</h2>
        <p className="text-slate-500 max-w-sm mt-2">Only administrators can view full financial performance reports and profit analytics.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black dark:text-white uppercase tracking-tight">Admin Financial Command</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Real-time aggregation of sales, expenses, and partner equity.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white dark:bg-slate-900 p-1 rounded-2xl border dark:border-slate-800 flex shadow-sm">
            {['7D', '30D', 'ALL'].map(range => (
              <button 
                key={range}
                onClick={() => setTimeRange(range as any)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${timeRange === range ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'}`}
              >
                {range}
              </button>
            ))}
          </div>
          <button className="p-3 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-2xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 transition-all">
            <Download size={20} />
          </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ReportStatCard 
          label="Gross Revenue" 
          value={totalGrossRevenue} 
          icon={TrendingUp} 
          color="text-blue-600" 
          bgColor="bg-blue-50 dark:bg-blue-900/20" 
          currency={currentCurrency}
        />
        <ReportStatCard 
          label="Total Expenses" 
          value={totalExpenses} 
          icon={TrendingDown} 
          color="text-red-500" 
          bgColor="bg-red-50 dark:bg-red-900/20" 
          currency={currentCurrency}
        />
        <ReportStatCard 
          label="Net Profit" 
          value={netProfit} 
          icon={DollarSign} 
          color="text-green-600" 
          bgColor="bg-green-50 dark:bg-green-900/20" 
          currency={currentCurrency}
        />
        <ReportStatCard 
          label="Shop Keymoney" 
          value={totalKeymoney} 
          icon={Landmark} 
          color="text-indigo-600" 
          bgColor="bg-indigo-50 dark:bg-indigo-900/20" 
          currency={currentCurrency}
        />
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-black text-lg dark:text-white uppercase tracking-widest flex items-center gap-2">
              <PieChartIcon size={20} className="text-blue-600" /> Income vs. Expense
            </h3>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'Income', amount: totalGrossRevenue, fill: '#3b82f6' },
                { name: 'Expenses', amount: totalExpenses, fill: '#f87171' }
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#1e293b' : '#f1f5f9'} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 'bold'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: 'transparent'}}
                  contentStyle={{ backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="amount" radius={[10, 10, 0, 0]} barSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
           <h3 className="font-black text-lg dark:text-white uppercase tracking-widest mb-8">Expense Breakdown</h3>
           <div className="flex flex-col items-center gap-8">
             <div className="w-full h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={expenseDistribution} innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                      {expenseDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                  </PieChart>
                </ResponsiveContainer>
             </div>
             <div className="w-full space-y-3">
                {expenseDistribution.map((d, i) => (
                  <div key={d.name} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }}></div>
                      <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase">{d.name}</span>
                    </div>
                    <span className="text-xs font-black dark:text-white">{currentCurrency} {d.value.toLocaleString()}</span>
                  </div>
                ))}
             </div>
           </div>
        </div>
      </div>

      {/* Partner Profit Shares */}
      <div className="bg-slate-900 dark:bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-blue-600 rounded-2xl">
            <Users size={24} />
          </div>
          <div>
            <h2 className="font-black text-xl uppercase tracking-tight">Partner Profit Split</h2>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Based on current net profit</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {partnerBreakdown.map((p, idx) => (
            <div key={p.name} className="p-6 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h4 className="font-black text-lg">{p.name}</h4>
                  <span className="text-blue-400 text-[10px] font-black uppercase tracking-widest">{p.share}% Stake</span>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Share Value</p>
                  <p className="text-xl font-black">{currentCurrency} {p.amount.toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Financial Ledger */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-8 border-b dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-black text-lg dark:text-white uppercase tracking-widest">Financial Ledger</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800 border-b dark:border-slate-800 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              <tr>
                <th className="px-8 py-6">Date</th>
                <th className="px-8 py-6">Category</th>
                <th className="px-8 py-6">Description</th>
                <th className="px-8 py-6">Amount</th>
                <th className="px-8 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-slate-800">
              {transactions.slice(0, 15).map(t => (
                <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-8 py-5">
                    <p className="font-bold dark:text-white text-sm">{new Date(t.timestamp).toLocaleDateString()}</p>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-2 py-1 rounded-full text-[8px] font-black uppercase ${
                      ['SALE', 'IMPORT'].includes(t.type) ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {t.type}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-sm dark:text-slate-300 font-medium">{t.description}</td>
                  <td className="px-8 py-5">
                    <p className={`font-black text-sm ${['SALE', 'IMPORT'].includes(t.type) ? 'text-green-600' : 'text-red-500'}`}>
                      {['SALE', 'IMPORT'].includes(t.type) ? '+' : '-'}{currentCurrency} {t.amount.toLocaleString()}
                    </p>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button onClick={() => deleteTransaction(t.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const ReportStatCard = ({ label, value, icon: Icon, color, bgColor, currency }: any) => (
  <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm group hover:border-blue-300 transition-all">
    <div className={`w-14 h-14 rounded-3xl ${bgColor} flex items-center justify-center ${color} mb-6 group-hover:scale-110 transition-transform`}>
      <Icon size={28} />
    </div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</p>
    <div className="flex items-baseline gap-1">
      <span className={`text-2xl font-black dark:text-white`}>
        {currency} {Math.abs(value).toLocaleString()}
      </span>
    </div>
  </div>
);

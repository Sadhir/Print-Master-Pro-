
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import { 
  DollarSign, TrendingUp, TrendingDown, Briefcase, ExternalLink, 
  Trash2, Wallet, Users, ArrowUpRight, ArrowDownLeft, PieChart as PieChartIcon,
  Filter, Calendar, Download, RefreshCcw, Landmark, Printer, FileSpreadsheet, Ghost,
  ChevronLeft
} from 'lucide-react';
import { UserRole, Transaction, Job, CurrencyCode, CommitmentCategory } from '../types';
import * as XLSX from 'xlsx';

// Constants for Stealth Mode
const STEALTH_FACTOR = 0.12;

export const Reports = () => {
  const { 
    jobs, transactions, allTransactions, commitments, isDarkMode, isStealthMode, currentUser, 
    deleteTransaction, currentCurrency, partners, staff, 
    machinery, subscriptions, selectedBranchId, branches 
  } = useApp();
  
  const [timeRange, setTimeRange] = useState<'7D' | '30D' | 'YTD' | 'ALL'>('ALL');
  const [isPrinting, setIsPrinting] = useState(false);
  const isAdmin = currentUser.role === UserRole.ADMIN;

  // Utility to apply stealth masking
  const mask = (val: number) => isStealthMode ? val * STEALTH_FACTOR : val;

  const totalJobRevenue = jobs.reduce((acc, j) => acc + (j.paidAmount || 0), 0);
  const totalPosRevenue = transactions.filter(t => t.type === 'SALE').reduce((acc, t) => acc + t.amount, 0);
  const legacyRevenue = transactions.filter(t => t.type === 'IMPORT').reduce((acc, t) => acc + t.amount, 0);
  
  const totalGrossRevenue = totalJobRevenue + totalPosRevenue + legacyRevenue;
  const displayGrossRevenue = mask(totalGrossRevenue);

  const transactionExpenses = transactions.filter(t => 
    ['EXPENSE', 'STAFF_PAYROLL', 'STAFF_ADVANCE', 'MACHINERY_SERVICE', 'OPERATIONAL_BILL'].includes(t.type)
  ).reduce((acc, t) => acc + t.amount, 0);
  
  const jobOutsourcedCosts = jobs.reduce((acc, j) => acc + (j.outsourcedCost || 0), 0);
  const totalExpenses = transactionExpenses + jobOutsourcedCosts;
  const displayTotalExpenses = mask(totalExpenses);
  const displayNetProfit = displayGrossRevenue - displayTotalExpenses;

  const handleExportSales = () => {
    if (isStealthMode && !window.confirm("Privacy Mask is ACTIVE. Do you want to export the REAL underlying data?")) return;
    
    const data = transactions.map(t => ({
      ID: t.id,
      Date: new Date(t.timestamp).toLocaleString(),
      Type: t.type,
      Description: t.description,
      Amount: t.amount,
      Currency: t.currency,
      Method: t.paymentMethod,
      Source: t.source
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sales_Transactions");
    XLSX.writeFile(workbook, `PrintMaster_Sales_Ledger_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  if (isPrinting) {
    return (
      <div className="min-h-screen bg-white p-12 text-black animate-in fade-in">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="flex items-center justify-between no-print">
             <button onClick={() => setIsPrinting(false)} className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600">
                <ChevronLeft size={18} /> Back to Interface
             </button>
             <button onClick={() => window.print()} className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-2">
                <Printer size={18} /> Confirm Print
             </button>
          </div>

          <div className="text-center border-b-4 border-slate-900 pb-10">
             <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">PrintMaster Pro: Executive Summary</h1>
             <p className="text-sm font-bold uppercase tracking-widest text-slate-500">Master Financial Report • {new Date().toLocaleDateString()}</p>
             {isStealthMode && <p className="mt-4 text-red-600 font-black uppercase text-[10px] tracking-widest">--- UI MASKED DATA ACTIVE ---</p>}
          </div>

          <div className="grid grid-cols-3 gap-12 text-center">
             <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Yield</p>
                <p className="text-3xl font-black">{currentCurrency} {displayGrossRevenue.toLocaleString()}</p>
             </div>
             <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Burn Rate</p>
                <p className="text-3xl font-black">{currentCurrency} {displayTotalExpenses.toLocaleString()}</p>
             </div>
             <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Net Position</p>
                <p className="text-3xl font-black text-blue-600">{currentCurrency} {displayNetProfit.toLocaleString()}</p>
             </div>
          </div>

          <div className="space-y-6">
             <h3 className="font-black text-lg uppercase tracking-widest border-b pb-2">Recent Transactions</h3>
             <table className="w-full text-left text-xs">
                <thead>
                   <tr className="bg-slate-50">
                      <th className="p-4 uppercase tracking-widest">Date</th>
                      <th className="p-4 uppercase tracking-widest">Type</th>
                      <th className="p-4 uppercase tracking-widest">Description</th>
                      <th className="p-4 uppercase tracking-widest text-right">Amount</th>
                   </tr>
                </thead>
                <tbody className="divide-y">
                   {transactions.slice(0, 30).map(t => (
                      <tr key={t.id}>
                         <td className="p-4 font-bold">{new Date(t.timestamp).toLocaleDateString()}</td>
                         <td className="p-4 font-black uppercase text-[9px]">{t.type}</td>
                         <td className="p-4">{t.description}</td>
                         <td className="p-4 text-right font-black">{currentCurrency} {mask(t.amount).toLocaleString()}</td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>

          <div className="pt-20 text-center opacity-30 text-[8px] font-black uppercase tracking-[0.4em]">
             System Authenticated • Enterprise Registry v3.4
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center p-8">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 mb-6">
          <Briefcase size={40} />
        </div>
        <h2 className="text-2xl font-black dark:text-white uppercase tracking-tight">Access Restricted</h2>
        <p className="text-slate-500 max-w-sm mt-2">Only administrators can view full financial performance reports.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 no-print">
        <div>
           <div className="flex items-center gap-4">
              <h1 className="text-3xl font-black dark:text-white uppercase tracking-tight">Financial Matrix</h1>
              {isStealthMode && (
                <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-full border border-amber-200 dark:border-amber-800 animate-pulse">
                  <Ghost size={14} className="text-amber-600" />
                  <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest">Privacy Active</span>
                </div>
              )}
           </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Real-time aggregation of sales and expense data.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => setIsPrinting(true)}
            className="flex items-center gap-2 bg-white dark:bg-slate-800 border dark:border-slate-700 px-6 py-4 rounded-2xl font-black text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 transition-all uppercase tracking-widest text-[10px]"
          >
            <Printer size={16} /> Print Sales Report
          </button>
          <button 
            type="button"
            onClick={handleExportSales}
            className="flex items-center gap-2 bg-white dark:bg-slate-800 border dark:border-slate-700 px-6 py-4 rounded-2xl font-black text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 transition-all uppercase tracking-widest text-[10px]"
          >
            <FileSpreadsheet size={16} /> Export Detailed CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ReportStatCard label="Gross Revenue" value={displayGrossRevenue} icon={TrendingUp} color="text-blue-600" bgColor="bg-blue-50 dark:bg-blue-900/20" currency={currentCurrency} isStealth={isStealthMode} />
        <ReportStatCard label="Total Expenses" value={displayTotalExpenses} icon={TrendingDown} color="text-red-500" bgColor="bg-red-50 dark:bg-red-900/20" currency={currentCurrency} isStealth={isStealthMode} />
        <ReportStatCard label="Net Profit" value={displayNetProfit} icon={DollarSign} color="text-green-600" bgColor="bg-green-50 dark:bg-green-900/20" currency={currentCurrency} isStealth={isStealthMode} />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden no-print">
        <div className="p-8 border-b dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-black text-lg dark:text-white uppercase tracking-widest">Master Transaction Ledger</h3>
          {isStealthMode && <Ghost size={18} className="text-slate-300 dark:text-slate-700" />}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800 border-b dark:border-slate-800 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              <tr>
                <th className="px-8 py-6">Timestamp</th>
                <th className="px-8 py-6">Type</th>
                <th className="px-8 py-6">Description</th>
                <th className="px-8 py-6">Settlement</th>
                <th className="px-8 py-6 text-right">Value</th>
                <th className="px-8 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-slate-800">
              {transactions.slice(0, 50).map(t => (
                <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-8 py-5">
                    <p className="font-bold dark:text-white text-sm">{new Date(t.timestamp).toLocaleDateString()}</p>
                    <p className="text-[9px] text-slate-400 uppercase">{new Date(t.timestamp).toLocaleTimeString()}</p>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-2 py-1 rounded-full text-[8px] font-black uppercase ${
                      ['SALE', 'IMPORT'].includes(t.type) ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {t.type}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-sm dark:text-slate-300 font-medium">{t.description}</td>
                  <td className="px-8 py-5 text-xs text-slate-400 font-black uppercase">{t.paymentMethod}</td>
                  <td className="px-8 py-5 text-right">
                    <p className={`font-black text-sm ${['SALE', 'IMPORT'].includes(t.type) ? 'text-green-600' : 'text-red-500'}`}>
                      {['SALE', 'IMPORT'].includes(t.type) ? '+' : '-'}{currentCurrency} {mask(t.amount).toLocaleString()}
                    </p>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button type="button" onClick={() => deleteTransaction(t.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
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

const ReportStatCard = ({ label, value, icon: Icon, color, bgColor, currency, isStealth }: any) => (
  <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm group hover:border-blue-300 transition-all overflow-hidden relative">
    <div className={`w-14 h-14 rounded-3xl ${bgColor} flex items-center justify-center ${color} mb-6 group-hover:scale-110 transition-transform relative z-10`}>
      <Icon size={28} />
    </div>
    <div className="relative z-10">
      <div className="flex items-center gap-2 mb-1">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</p>
        {isStealth && <Ghost size={12} className="text-slate-300 dark:text-slate-700" />}
      </div>
      <p className={`text-2xl font-black dark:text-white`}>
        {currency} {Math.abs(value).toLocaleString()}
      </p>
    </div>
    <Icon size={80} className="absolute -right-4 -bottom-4 opacity-5 text-slate-900 dark:text-white" />
  </div>
);

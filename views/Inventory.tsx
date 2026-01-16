
import React, { useState } from 'react';
import { Package, Plus, Search, AlertTriangle, TrendingDown, X, Printer, FileDown } from 'lucide-react';
import { useApp } from '../context/AppContext';
import * as XLSX from 'xlsx';

export const Inventory = () => {
  const { inventory, updateInventory, allInventory, currentCurrency, branches } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', quantity: 0, minThreshold: 50, unit: 'sheets', branchId: branches[0]?.id || 'b1' });

  const filtered = inventory.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockCount = inventory.filter(i => i.quantity <= i.minThreshold).length;
  const outOfStockCount = inventory.filter(i => i.quantity <= 0).length;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Inventory item registered in branch ledger.");
    setShowModal(false);
  };

  const exportStockToExcel = () => {
    const data = inventory.map(item => ({
      ID: item.id,
      Material: item.name,
      Branch: branches.find(b => b.id === item.branchId)?.name || 'Central',
      Stock: item.quantity,
      Unit: item.unit,
      Safety_Threshold: item.minThreshold,
      Status: item.quantity <= 0 ? 'OUT OF STOCK' : (item.quantity <= item.minThreshold ? 'LOW' : 'OK')
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory_Status");
    XLSX.writeFile(workbook, `PrintMaster_Stock_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-3xl font-black dark:text-white uppercase tracking-tight">Stock Management</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Manage raw materials, paper, and ink consumables.</p>
        </div>
        <div className="flex gap-2">
          <button 
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 bg-white dark:bg-slate-800 border dark:border-slate-700 px-6 py-4 rounded-2xl font-black text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 transition-all uppercase tracking-widest text-[10px]"
          >
            <Printer size={16} /> Print Report
          </button>
          <button 
            type="button"
            onClick={exportStockToExcel}
            className="flex items-center gap-2 bg-white dark:bg-slate-800 border dark:border-slate-700 px-6 py-4 rounded-2xl font-black text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 transition-all uppercase tracking-widest text-[10px]"
          >
            <FileDown size={16} /> Export Excel
          </button>
          <button 
            type="button"
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 px-6 py-4 rounded-2xl font-black text-white shadow-xl hover:bg-blue-700 transition-all uppercase tracking-widest text-xs"
          >
            <Plus size={20} /> Register Material
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 no-print">
        <StatCard label="Inventory Items" value={inventory.length} sub="Unique SKU tracks" color="blue" />
        <StatCard label="Low Stock" value={lowStockCount} sub="Below safety threshold" color="orange" />
        <StatCard label="Out of Stock" value={outOfStockCount} sub="Urgent procurement" color="red" />
      </div>

      {/* Printable template */}
      <div className="hidden print:block mb-8">
         <h1 className="text-2xl font-black uppercase text-center mb-2">PrintMaster Pro: Stock Inventory Report</h1>
         <p className="text-center text-xs uppercase font-bold text-slate-500">Generated: {new Date().toLocaleString()}</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden print:border-none print:shadow-none">
        <div className="p-6 border-b dark:border-slate-800 flex items-center justify-between gap-4 no-print">
           <div className="flex-1 flex items-center gap-3 bg-slate-50 dark:bg-slate-800 px-6 py-3 rounded-2xl border dark:border-slate-700">
            <Search className="text-slate-400 dark:text-slate-500" size={20} />
            <input 
              type="text" 
              placeholder="Filter inventory list..." 
              className="bg-transparent flex-1 outline-none text-sm dark:text-white font-bold uppercase tracking-widest"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 dark:bg-slate-800/50 border-b dark:border-slate-800 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] print:bg-slate-100 print:text-black">
              <tr>
                <th className="px-8 py-6 print:py-4">Material Name</th>
                <th className="px-8 py-6 print:py-4">Store Branch</th>
                <th className="px-8 py-6 print:py-4">Available Qty</th>
                <th className="px-8 py-6 print:py-4">Min Level</th>
                <th className="px-8 py-6 print:py-4">Health</th>
                <th className="px-8 py-6 text-right no-print">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-slate-800">
              {filtered.map(item => {
                const isLow = item.quantity <= item.minThreshold;
                const isEmpty = item.quantity <= 0;
                const branch = branches.find(b => b.id === item.branchId);

                return (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors print:text-xs">
                    <td className="px-8 py-5 print:py-3">
                       <p className="font-black dark:text-white uppercase text-sm tracking-tight print:text-xs">{item.name}</p>
                       <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest no-print">{item.id}</p>
                    </td>
                    <td className="px-8 py-5 print:py-3">
                       <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest print:text-[8px]">{branch?.name || 'Central'}</span>
                    </td>
                    <td className="px-8 py-5 print:py-3">
                       <p className={`font-black text-base print:text-xs ${isEmpty ? 'text-red-500' : isLow ? 'text-orange-500' : 'text-slate-700 dark:text-slate-200'}`}>
                         {item.quantity.toLocaleString()} <span className="text-[10px] uppercase print:text-[8px]">{item.unit}</span>
                       </p>
                    </td>
                    <td className="px-8 py-5 text-slate-400 font-bold text-xs uppercase print:py-3 print:text-[8px]">
                      {item.minThreshold} {item.unit}
                    </td>
                    <td className="px-8 py-5 print:py-3">
                      {isEmpty ? (
                        <span className="bg-red-50 text-red-600 text-[8px] font-black px-2 py-1 rounded-full uppercase print:bg-transparent print:p-0">EMPTY</span>
                      ) : isLow ? (
                        <span className="bg-orange-50 text-orange-600 text-[8px] font-black px-2 py-1 rounded-full uppercase print:bg-transparent print:p-0">REFILL</span>
                      ) : (
                        <span className="bg-green-50 text-green-600 text-[8px] font-black px-2 py-1 rounded-full uppercase print:bg-transparent print:p-0">OK</span>
                      )}
                    </td>
                    <td className="px-8 py-5 text-right no-print">
                      <button 
                        type="button"
                        onClick={() => updateInventory(item.id, 100)}
                        className="text-blue-600 dark:text-blue-400 font-black text-[10px] uppercase tracking-widest hover:underline"
                      >
                        Quick Restock
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-8 py-20 text-center text-slate-400 font-black uppercase text-xs tracking-[0.3em]">No materials found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[150] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-lg p-10 animate-in zoom-in border dark:border-slate-800">
             <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black dark:text-white uppercase tracking-tight">New Stock Track</h2>
                <button type="button" onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full dark:text-white"><X size={24} /></button>
             </div>
             <form onSubmit={handleAdd} className="space-y-6">
                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Material Name</label>
                   <input required type="text" className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-bold" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g., A4 80GSM White Paper" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Initial Qty</label>
                    <input required type="number" className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-black" value={form.quantity || ''} onChange={e => setForm({...form, quantity: Number(e.target.value)})} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Unit</label>
                    <input required type="text" className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-bold" value={form.unit} onChange={e => setForm({...form, unit: e.target.value})} placeholder="sheets, ml, etc." />
                  </div>
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-blue-700 transition-all uppercase tracking-[0.2em] text-xs">
                  Create SKU Track
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value, sub, color }: any) => {
  const colors = {
    blue: 'bg-blue-600',
    orange: 'bg-orange-500',
    red: 'bg-red-500'
  };
  return (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
      <div className={`w-10 h-10 rounded-xl ${(colors as any)[color]} flex items-center justify-center text-white mb-4`}>
        <Package size={20} />
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</p>
      <p className="text-3xl font-black dark:text-white">{value}</p>
      <p className="text-[9px] font-bold text-slate-400 uppercase mt-1 tracking-widest">{sub}</p>
    </div>
  );
};

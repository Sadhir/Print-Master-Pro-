
import React from 'react';
import { Package, Plus, Search, AlertTriangle, TrendingDown } from 'lucide-react';
import { MOCK_INVENTORY } from '../constants';

export const Inventory = () => {
  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold dark:text-white">Inventory</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage paper, ink, and consumables.</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 px-6 py-3 rounded-xl font-bold text-white shadow-lg shadow-blue-200 dark:shadow-none hover:bg-blue-700 transition-colors">
          <Plus size={20} /> Add Item
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border-l-4 border-l-blue-500 shadow-sm border border-slate-100 dark:border-slate-800">
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase">Total Stock Value</p>
          <h2 className="text-3xl font-black mt-1 dark:text-white">$12,450.00</h2>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border-l-4 border-l-orange-500 shadow-sm border border-slate-100 dark:border-slate-800">
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase">Low Stock Alerts</p>
          <h2 className="text-3xl font-black mt-1 text-orange-600 dark:text-orange-400">3 Items</h2>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border-l-4 border-l-red-500 shadow-sm border border-slate-100 dark:border-slate-800">
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase">Out of Stock</p>
          <h2 className="text-3xl font-black mt-1 text-red-600 dark:text-red-400">0 Items</h2>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="p-4 border-b dark:border-slate-800 flex items-center justify-between gap-4">
           <div className="flex-1 flex items-center gap-3 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-xl">
            <Search className="text-slate-400 dark:text-slate-500" size={18} />
            <input type="text" placeholder="Search inventory..." className="bg-transparent flex-1 outline-none text-sm dark:text-white dark:placeholder:text-slate-600" />
          </div>
          <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            Scan QR
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-widest border-b dark:border-slate-800">
                <th className="px-6 py-4">Item Name</th>
                <th className="px-6 py-4">Current Stock</th>
                <th className="px-6 py-4">Threshold</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-slate-800">
              {MOCK_INVENTORY.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-200">{item.name}</td>
                  <td className="px-6 py-4 font-medium dark:text-slate-300">{item.quantity} {item.unit}</td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{item.minThreshold} {item.unit}</td>
                  <td className="px-6 py-4">
                    {item.quantity <= item.minThreshold ? (
                      <span className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded-lg text-xs font-bold">
                        <AlertTriangle size={12} /> Low Stock
                      </span>
                    ) : (
                      <span className="text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-lg text-xs font-bold">
                        Healthy
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-blue-600 dark:text-blue-400 font-bold text-sm hover:underline">Restock</button>
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

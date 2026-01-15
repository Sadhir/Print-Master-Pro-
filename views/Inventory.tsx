
import React from 'react';
import { Package, Plus, Search, AlertTriangle, TrendingDown } from 'lucide-react';
import { MOCK_INVENTORY } from '../constants';

export const Inventory = () => {
  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Inventory</h1>
          <p className="text-slate-500">Manage paper, ink, and consumables.</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 px-6 py-3 rounded-xl font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-700 transition-colors">
          <Plus size={20} /> Add Item
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border-l-4 border-l-blue-500 shadow-sm">
          <p className="text-slate-500 text-sm font-medium uppercase">Total Stock Value</p>
          <h2 className="text-3xl font-black mt-1">$12,450.00</h2>
        </div>
        <div className="bg-white p-6 rounded-2xl border-l-4 border-l-orange-500 shadow-sm">
          <p className="text-slate-500 text-sm font-medium uppercase">Low Stock Alerts</p>
          <h2 className="text-3xl font-black mt-1 text-orange-600">3 Items</h2>
        </div>
        <div className="bg-white p-6 rounded-2xl border-l-4 border-l-red-500 shadow-sm">
          <p className="text-slate-500 text-sm font-medium uppercase">Out of Stock</p>
          <h2 className="text-3xl font-black mt-1 text-red-600">0 Items</h2>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between gap-4">
           <div className="flex-1 flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl">
            <Search className="text-slate-400" size={18} />
            <input type="text" placeholder="Search inventory..." className="bg-transparent flex-1 outline-none text-sm" />
          </div>
          <button className="px-4 py-2 bg-slate-100 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-200 transition-colors">
            Scan QR
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-[10px] uppercase font-bold tracking-widest border-b">
                <th className="px-6 py-4">Item Name</th>
                <th className="px-6 py-4">Current Stock</th>
                <th className="px-6 py-4">Threshold</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {MOCK_INVENTORY.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-700">{item.name}</td>
                  <td className="px-6 py-4 font-medium">{item.quantity} {item.unit}</td>
                  <td className="px-6 py-4 text-slate-500">{item.minThreshold} {item.unit}</td>
                  <td className="px-6 py-4">
                    {item.quantity <= item.minThreshold ? (
                      <span className="flex items-center gap-1.5 text-orange-600 bg-orange-50 px-2 py-1 rounded-lg text-xs font-bold">
                        <AlertTriangle size={12} /> Low Stock
                      </span>
                    ) : (
                      <span className="text-green-600 bg-green-50 px-2 py-1 rounded-lg text-xs font-bold">
                        Healthy
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-blue-600 font-bold text-sm hover:underline">Restock</button>
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

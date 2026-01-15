
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Truck, Plus, Search, Phone, MapPin, Tag, ArrowRight, ExternalLink, Briefcase } from 'lucide-react';

export const Suppliers = () => {
  const { suppliers } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold dark:text-white uppercase tracking-tight">Suppliers & Outsourcing</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage third-party print labs and specialty services.</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 px-6 py-3 rounded-xl font-black text-white shadow-lg hover:bg-blue-700 transition-all uppercase tracking-widest text-xs">
          <Plus size={18} /> New Supplier
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-3">
        <Search className="text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Search suppliers or services..." 
          className="flex-1 bg-transparent outline-none dark:text-white"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filtered.map(supplier => (
          <div key={supplier.id} className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden group hover:border-blue-300 transition-all">
            <div className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-3xl">
                    <Truck size={28} />
                  </div>
                  <div>
                    <h3 className="font-black text-xl dark:text-white">{supplier.name}</h3>
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">{supplier.category}</p>
                  </div>
                </div>
                <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                  <ExternalLink size={20} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-sm">
                  <Phone size={16} /> {supplier.contact}
                </div>
                <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-sm">
                  <MapPin size={16} /> HQ - Branch 01
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Available Services</h4>
                {supplier.services.map(service => (
                  <div key={service.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <Tag size={14} className="text-blue-500" />
                      <span className="text-sm font-bold dark:text-slate-200">{service.name}</span>
                    </div>
                    <span className="text-xs font-black text-slate-900 dark:text-white">Rs. {service.price.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <button className="w-full mt-8 flex items-center justify-center gap-2 py-4 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-800 transition-colors">
                Link to Job Order <ArrowRight size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Truck, Plus, Search, Phone, MapPin, Tag, ArrowRight, ExternalLink, Briefcase, X } from 'lucide-react';

export const Suppliers = () => {
  const { suppliers } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', category: 'General', contact: '', address: '' });

  const filtered = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    alert("New supplier registered in provider directory.");
    setShowModal(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black dark:text-white uppercase tracking-tight">Suppliers & Labs</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Manage third-party print labs and specialty service providers.</p>
        </div>
        <button 
          type="button"
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 px-6 py-4 rounded-2xl font-black text-white shadow-xl hover:bg-blue-700 transition-all uppercase tracking-widest text-xs"
        >
          <Plus size={18} /> New Provider
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-3">
        <Search className="text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Filter by lab name or specialty..." 
          className="flex-1 bg-transparent outline-none dark:text-white font-bold uppercase tracking-widest text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filtered.map(supplier => (
          <div key={supplier.id} className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden group hover:border-blue-300 transition-all">
            <div className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-[1.5rem]">
                    <Truck size={28} />
                  </div>
                  <div>
                    <h3 className="font-black text-xl dark:text-white uppercase tracking-tight">{supplier.name}</h3>
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">{supplier.category}</p>
                  </div>
                </div>
                <button type="button" className="p-2 text-slate-300 hover:text-blue-600 transition-colors">
                  <ExternalLink size={20} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-tight">
                  <Phone size={14} className="text-blue-500" /> {supplier.contact}
                </div>
                <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-tight">
                  <MapPin size={14} className="text-blue-500" /> Regional Node
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Contracted Services</h4>
                {supplier.services.map(service => (
                  <div key={service.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 transition-colors hover:bg-white dark:hover:bg-slate-800">
                    <div className="flex items-center gap-3">
                      <Tag size={14} className="text-blue-500" />
                      <span className="text-xs font-black dark:text-slate-200 uppercase tracking-tight">{service.name}</span>
                    </div>
                    <span className="text-xs font-black text-blue-600">Rs. {service.price.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <button type="button" className="w-full mt-8 flex items-center justify-center gap-2 py-4 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-800 transition-colors shadow-lg">
                Link to Pipeline <ArrowRight size={14} />
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="md:col-span-2 py-20 text-center font-black text-slate-300 dark:text-slate-800 uppercase tracking-[0.4em]">No partners found</div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[150] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-lg p-10 animate-in zoom-in border dark:border-slate-800">
             <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black dark:text-white uppercase tracking-tight">Register Partner</h2>
                <button type="button" onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full dark:text-white"><X size={24} /></button>
             </div>
             <form onSubmit={handleAddSupplier} className="space-y-6">
                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Provider Name</label>
                   <input required type="text" className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-bold" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g., Elite Color Labs" />
                </div>
                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Specialty / Category</label>
                   <input required type="text" className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-bold" value={form.category} onChange={e => setForm({...form, category: e.target.value})} placeholder="e.g., Large Format Printing" />
                </div>
                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Primary Contact</label>
                   <input required type="text" className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-bold" value={form.contact} onChange={e => setForm({...form, contact: e.target.value})} />
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-blue-700 transition-all uppercase tracking-[0.2em] text-xs">
                  Create Partner Record
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

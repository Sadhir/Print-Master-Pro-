
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MapPin, Plus, Search, Trash2, Edit3, Phone, User, X } from 'lucide-react';
import { Branch, UserRole } from '../types';

export const BranchManagement = () => {
  const { branches, addBranch, updateBranch, deleteBranch, currentUser } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', address: '', phone: '', managerName: '', status: 'ACTIVE' as any });

  const isAdmin = currentUser.role === UserRole.ADMIN;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) updateBranch(isEditing, form);
    else addBranch(form);
    setShowModal(false);
    setIsEditing(null);
    setForm({ name: '', address: '', phone: '', managerName: '', status: 'ACTIVE' });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold dark:text-white uppercase tracking-tight">Branch Management</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage multiple business locations and store details.</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 px-6 py-3 rounded-xl font-black text-white shadow-lg hover:bg-blue-700 transition-all uppercase tracking-widest text-xs"
          >
            <Plus size={18} /> Add New Branch
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {branches.map(branch => (
          <div key={branch.id} className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm p-8 group hover:border-blue-300 transition-all relative">
            <div className="flex items-start justify-between mb-6">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-2xl">
                <MapPin size={28} />
              </div>
              <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${branch.status === 'ACTIVE' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                {branch.status}
              </span>
            </div>
            <h3 className="text-xl font-black dark:text-white mb-2">{branch.name}</h3>
            <p className="text-sm text-slate-500 mb-6">{branch.address}</p>
            
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3 text-xs text-slate-500 font-bold uppercase tracking-widest">
                <Phone size={14} className="text-blue-600" /> {branch.phone}
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 font-bold uppercase tracking-widest">
                <User size={14} className="text-blue-600" /> Mgr: {branch.managerName}
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => { setIsEditing(branch.id); setForm(branch); setShowModal(true); }} className="flex-1 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl font-black text-[10px] uppercase tracking-widest">Edit</button>
              {isAdmin && <button onClick={() => deleteBranch(branch.id)} className="p-3 bg-red-50 text-red-600 rounded-xl"><Trash2 size={16} /></button>}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-lg p-10 animate-in zoom-in border dark:border-slate-800">
             <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black dark:text-white uppercase tracking-tight">{isEditing ? 'Edit Branch' : 'New Branch'}</h2>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-full dark:text-white"><X size={24} /></button>
             </div>
             <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Branch Name</label>
                   <input required type="text" className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-bold" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                </div>
                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Address</label>
                   <input required type="text" className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-bold" value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Phone</label>
                     <input required type="text" className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-bold" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                  </div>
                  <div>
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Manager Name</label>
                     <input required type="text" className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-bold" value={form.managerName} onChange={e => setForm({...form, managerName: e.target.value})} />
                  </div>
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-blue-700 transition-all uppercase tracking-[0.2em] text-xs">
                  {isEditing ? 'Update Branch' : 'Register Branch'}
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

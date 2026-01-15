
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Gem, Plus, Search, Trash2, Edit3, X, DollarSign, Calendar, Hash, MapPin } from 'lucide-react';
import { CompanyAsset, UserRole } from '../types';

export const AssetsManagement = () => {
  const { assets, branches, addAsset, updateAsset, deleteAsset, currentUser, currentCurrency } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', category: 'OTHER' as any, value: 0, purchaseDate: new Date().toISOString().split('T')[0], serialNumber: '', branchId: branches[0]?.id || '' });

  const isAdmin = currentUser.role === UserRole.ADMIN;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) updateAsset(isEditing, form);
    else addAsset(form);
    setShowModal(false);
    setIsEditing(null);
    setForm({ name: '', category: 'OTHER', value: 0, purchaseDate: new Date().toISOString().split('T')[0], serialNumber: '', branchId: branches[0]?.id || '' });
  };

  const totalValue = assets.reduce((acc, a) => acc + a.value, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold dark:text-white uppercase tracking-tight">Company Assets</h1>
          <p className="text-slate-500 dark:text-slate-400">Track company property, furniture, vehicles, and IT equipment.</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 px-6 py-3 rounded-xl font-black text-white shadow-lg hover:bg-blue-700 transition-all uppercase tracking-widest text-xs"
          >
            <Plus size={18} /> Register Asset
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
         <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Valuation</p>
            <p className="text-4xl font-black text-blue-600">{currentCurrency} {totalValue.toLocaleString()}</p>
         </div>
         <div className="flex gap-4">
           <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Items Tracked</p>
              <p className="text-xl font-black dark:text-white">{assets.length}</p>
           </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assets.map(asset => {
          const branch = branches.find(b => b.id === asset.branchId);
          return (
            <div key={asset.id} className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm p-8 group hover:border-blue-300 transition-all">
              <div className="flex items-start justify-between mb-6">
                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-2xl">
                  <Gem size={28} />
                </div>
                <span className="px-3 py-1 rounded-full bg-slate-50 dark:bg-slate-800 text-[8px] font-black uppercase tracking-widest dark:text-slate-400">
                  {asset.category.replace('_', ' ')}
                </span>
              </div>
              <h3 className="text-xl font-black dark:text-white mb-2">{asset.name}</h3>
              <p className="text-blue-600 font-black text-lg mb-6">{currentCurrency} {asset.value.toLocaleString()}</p>
              
              <div className="space-y-3 mb-8">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <span>Purchased</span>
                  <span className="text-slate-700 dark:text-slate-200">{asset.purchaseDate}</span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <span>Location</span>
                  <span className="text-slate-700 dark:text-slate-200">{branch?.name || 'Main'}</span>
                </div>
                {asset.serialNumber && (
                   <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <span>Serial No.</span>
                    <span className="text-slate-700 dark:text-slate-200">{asset.serialNumber}</span>
                  </div>
                )}
              </div>

              {isAdmin && (
                <div className="flex gap-2">
                  {/* Fix: Destructure asset to provide default value for serialNumber to match form state type */}
                  <button onClick={() => { 
                    setIsEditing(asset.id); 
                    setForm({
                      name: asset.name,
                      category: asset.category,
                      value: asset.value,
                      purchaseDate: asset.purchaseDate,
                      serialNumber: asset.serialNumber || '',
                      branchId: asset.branchId
                    }); 
                    setShowModal(true); 
                  }} className="flex-1 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl font-black text-[10px] uppercase tracking-widest">Update</button>
                  <button onClick={() => deleteAsset(asset.id)} className="p-3 bg-red-50 text-red-600 rounded-xl"><Trash2 size={16} /></button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-lg p-10 animate-in zoom-in border dark:border-slate-800">
             <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black dark:text-white uppercase tracking-tight">{isEditing ? 'Edit Asset' : 'New Asset Registration'}</h2>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-full dark:text-white"><X size={24} /></button>
             </div>
             <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Asset Name</label>
                   <input required type="text" className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-bold" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Category</label>
                     <select className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-bold" value={form.category} onChange={e => setForm({...form, category: e.target.value as any})}>
                        <option value="FURNITURE">Furniture</option>
                        <option value="IT_EQUIPMENT">IT / Tech</option>
                        <option value="VEHICLE">Vehicle</option>
                        <option value="OFFICE_SUPPLY">Office Supply</option>
                        <option value="OTHER">Other</option>
                     </select>
                  </div>
                  <div>
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Valuation ({currentCurrency})</label>
                     <input required type="number" className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-black" value={form.value || ''} onChange={e => setForm({...form, value: Number(e.target.value)})} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Purchase Date</label>
                      <input required type="date" className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-bold" value={form.purchaseDate} onChange={e => setForm({...form, purchaseDate: e.target.value})} />
                   </div>
                   <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Assigned Branch</label>
                      <select required className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-bold" value={form.branchId} onChange={e => setForm({...form, branchId: e.target.value})}>
                        {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                      </select>
                   </div>
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-blue-700 transition-all uppercase tracking-[0.2em] text-xs">
                  {isEditing ? 'Update Asset' : 'Register Asset'}
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};


import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Shield, Upload, Database, Settings as SettingsIcon, Save, Info, Cloud, 
  RefreshCw, CheckCircle, AlertCircle, HardDrive, UserCircle, Download, 
  FileJson, Globe, Facebook, Star 
} from 'lucide-react';
import { StorageProvider, UserRole } from '../types';

export const Settings = () => {
  const { 
    importLegacyData, 
    isCloudConnected, 
    connectCloud, 
    syncToCloud, 
    restoreFromCloud,
    exportAppState,
    importAppState,
    lastSync,
    currentUser,
    setCurrentRole,
    reviewLinks,
    setReviewLinks
  } = useApp();
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [links, setLinks] = useState(reviewLinks);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isAdmin = currentUser.role === UserRole.ADMIN;

  const handleSaveLinks = () => {
    setReviewLinks(links);
    alert("Review links updated successfully.");
  };

  const handleCloudConnect = async (provider: StorageProvider) => {
    if (!isAdmin) return;
    setIsSyncing(true);
    try {
      await connectCloud(provider);
    } catch (e) {
      alert(`Could not connect to ${provider}. Check your configurations.`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSync = async () => {
    if (!isAdmin) return;
    setIsSyncing(true);
    try {
      await syncToCloud();
    } catch (e) {
      alert("Sync failed.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const json = event.target?.result as string;
        importAppState(json);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl animate-in fade-in duration-500 pb-20">
      <div>
        <h1 className="text-2xl font-bold dark:text-white uppercase tracking-tight">System Configuration</h1>
        <p className="text-slate-500 dark:text-slate-400">Manage multi-cloud databases, automated backups, and shop profiles.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Review Platform Links */}
        <div className="md:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border dark:border-slate-800 shadow-sm space-y-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 rounded-2xl">
              <Star size={28} />
            </div>
            <div>
              <h2 className="font-black text-xl dark:text-white uppercase tracking-tight">Social & Reputation</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Links for automatic review requests</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Globe size={14} /> Google Review Link
              </label>
              <input 
                type="text" 
                className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl px-4 py-3 outline-none dark:text-white text-sm font-medium"
                placeholder="https://g.page/r/your-id/review"
                value={links.google}
                onChange={e => setLinks({...links, google: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Facebook size={14} /> Facebook Review Link
              </label>
              <input 
                type="text" 
                className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl px-4 py-3 outline-none dark:text-white text-sm font-medium"
                placeholder="https://facebook.com/yourpage/reviews"
                value={links.facebook}
                onChange={e => setLinks({...links, facebook: e.target.value})}
              />
            </div>
          </div>
          <button 
            onClick={handleSaveLinks}
            className="flex items-center gap-2 bg-slate-900 dark:bg-slate-800 text-white font-black px-6 py-3 rounded-xl text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all"
          >
            <Save size={16} /> Save Social Links
          </button>
        </div>

        {/* Role Simulator */}
        <div className="md:col-span-2 bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[2.5rem] text-white shadow-xl shadow-blue-100 dark:shadow-none">
          <div className="flex items-center gap-4 mb-6">
            <UserCircle size={32} />
            <div>
              <h2 className="font-black text-xl uppercase tracking-tight">Active Session Simulator</h2>
              <p className="text-blue-100 text-xs font-bold uppercase tracking-widest">Switch roles to test access control</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
             {Object.entries(UserRole).map(([key, value]) => (
               <button 
                key={key}
                onClick={() => setCurrentRole(value as UserRole)}
                className={`py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${currentUser.role === value ? 'bg-white text-blue-600 shadow-lg' : 'bg-white/10 hover:bg-white/20 text-white'}`}
               >
                 {key}
               </button>
             ))}
          </div>
        </div>

        {/* Data Portability */}
        <div className="md:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border dark:border-slate-800 shadow-sm space-y-8">
           <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-2xl">
                <FileJson size={28} />
              </div>
              <div>
                <h2 className="font-black text-xl dark:text-white uppercase tracking-tight">Data Portability</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Export system state or restore from backup</p>
              </div>
           </div>
           <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={exportAppState}
                className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-3xl text-center hover:border-blue-300 transition-all group"
              >
                <Download className="mx-auto mb-3 text-slate-400 group-hover:text-blue-600 transition-colors" size={32} />
                <p className="font-black text-xs uppercase tracking-widest dark:text-slate-200">Export All Data</p>
              </button>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-3xl text-center hover:border-green-300 transition-all group"
              >
                <Upload className="mx-auto mb-3 text-slate-400 group-hover:text-green-600 transition-colors" size={32} />
                <p className="font-black text-xs uppercase tracking-widest dark:text-slate-200">Import / Restore</p>
                <input type="file" ref={fileInputRef} onChange={handleFileImport} className="hidden" accept=".json" />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

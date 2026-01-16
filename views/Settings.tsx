import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Shield, Upload, Database, Settings as SettingsIcon, Save, Info, Cloud, 
  RefreshCw, CheckCircle, AlertCircle, HardDrive, UserCircle, Download, 
  FileJson, Globe, Facebook, Star, CloudRain, Zap, Trash2, AlertTriangle,
  Monitor, DownloadCloud, UploadCloud, Box, FileSpreadsheet, Share2, ArrowRightLeft, 
  ArrowRight, X, Table, FileText, CheckCircle2, Users, Package, Lock,
  Fingerprint, Key, Plus, UserCheck, Edit2, Ghost, EyeOff, Eye, Palette, 
  Layout as LayoutIcon, Type, Building, Smartphone
} from 'lucide-react';
import { StorageProvider, UserRole, PaymentMethod, OrderSource, User, InvoiceTemplate } from '../types';
import * as XLSX from 'xlsx';

export const Settings = () => {
  const { 
    isCloudConnected, isAutoSyncEnabled, setIsAutoSyncEnabled, isStealthMode, setIsStealthMode,
    connectCloud, syncToCloud, restoreFromCloud,
    exportAppState, importAppState, lastSync, currentUser, setCurrentUser, allUsers, addUser, updateUser, deleteUser,
    factoryReset, allTransactions, customers, allInventory, addTransaction, currentCurrency,
    invoiceSettings, updateInvoiceSettings
  } = useApp();
  
  const [activeSettingsTab, setActiveSettingsTab] = useState<'SYSTEM' | 'IDENTITY' | 'BRANDING'>('SYSTEM');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState('');
  
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userForm, setUserForm] = useState({ name: '', role: UserRole.CASHIER, pin: '' });
  
  const externalImportRef = useRef<HTMLInputElement>(null);
  const masterImportRef = useRef<HTMLInputElement>(null);
  const isAdmin = currentUser.role === UserRole.ADMIN;

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setDeferredPrompt(null);
  };

  const handleUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUserId) {
      updateUser(editingUserId, userForm);
    } else {
      const colors = ['bg-blue-600', 'bg-purple-600', 'bg-pink-600', 'bg-orange-600', 'bg-teal-600', 'bg-indigo-600', 'bg-rose-600'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      addUser({ ...userForm, avatarColor: randomColor });
    }
    setShowUserModal(false);
    setEditingUserId(null);
    setUserForm({ name: '', role: UserRole.CASHIER, pin: '' });
  };

  const handleEditUser = (user: User) => {
    setUserForm({ name: user.name, role: user.role, pin: user.pin || '' });
    setEditingUserId(user.id);
    setShowUserModal(true);
  };

  const handleCloudConnect = async (provider: StorageProvider) => {
    await connectCloud(provider);
  };

  const handleSync = async () => {
    setIsSyncing(true);
    await syncToCloud();
    setIsSyncing(false);
  };

  const handleRestore = async () => {
    if (window.confirm("Restore will overwrite ALL current local data with cloud version. Proceed?")) {
      setIsRestoring(true);
      await restoreFromCloud();
      setIsRestoring(false);
    }
  };

  const handleMasterFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!window.confirm("WARNING: This will replace ALL current data with the backup file. This cannot be undone. Proceed?")) {
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      importAppState(content);
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-10 max-w-5xl animate-in fade-in duration-500 pb-32">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black dark:text-white uppercase tracking-tighter">Enterprise Authority</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Manage security passcodes, branding aesthetics, and cloud persistence.</p>
        </div>
        <div className="flex bg-white dark:bg-slate-900 p-1 rounded-2xl border dark:border-slate-800 shadow-sm overflow-x-auto no-scrollbar shrink-0">
           {(['SYSTEM', 'IDENTITY', 'BRANDING'] as const).map(tab => (
             <button 
                key={tab}
                onClick={() => setActiveSettingsTab(tab)}
                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeSettingsTab === tab ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'}`}
             >
               {tab}
             </button>
           ))}
        </div>
      </div>

      {activeSettingsTab === 'SYSTEM' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4 duration-500">
           <div className="md:col-span-2 bg-gradient-to-br from-slate-900 to-slate-950 dark:from-slate-900 dark:to-slate-950 rounded-[3rem] p-10 border border-slate-800 shadow-2xl relative overflow-hidden group">
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                 <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-3xl shadow-xl transition-all ${isStealthMode ? 'bg-amber-600 text-white animate-pulse' : 'bg-slate-800 text-slate-400'}`}>
                       <Ghost size={32} />
                    </div>
                    <div>
                       <h2 className="text-2xl font-black text-white uppercase tracking-tight">Privacy Matrix</h2>
                       <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Mask financial growth & high-revenue stats</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${isStealthMode ? 'text-amber-500' : 'text-slate-500'}`}>
                       {isStealthMode ? 'Stealth Mode Active' : 'Normal Exposure'}
                    </span>
                    <button 
                     onClick={() => setIsStealthMode(!isStealthMode)}
                     className={`w-16 h-8 rounded-full p-1 transition-all duration-300 relative ${isStealthMode ? 'bg-amber-600' : 'bg-slate-700'}`}
                    >
                       <div className={`w-6 h-6 bg-white rounded-full shadow-lg transform transition-transform duration-300 flex items-center justify-center ${isStealthMode ? 'translate-x-8' : 'translate-x-0'}`}>
                          {isStealthMode ? <EyeOff size={12} className="text-amber-600" /> : <Eye size={12} className="text-slate-400" />}
                       </div>
                    </button>
                 </div>
              </div>
              <div className="mt-8 relative z-10 p-6 bg-white/5 rounded-2xl border border-white/10">
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-relaxed">
                   When active, all financial figures in Dashboard and Reports are multiplied by a privacy factor. 
                   The underlying ledger remains accurate for accounting purposes.
                 </p>
              </div>
           </div>

           {/* Cloud Persistence */}
           <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border dark:border-slate-800 shadow-sm space-y-6 flex flex-col">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl"><Cloud size={24} /></div>
                  <h2 className="font-black text-lg dark:text-white uppercase tracking-tight">Cloud Vault</h2>
                </div>
                {isCloudConnected && <span className="w-3 h-3 rounded-full bg-green-500 shadow-lg shadow-green-200 animate-pulse"></span>}
              </div>
              
              <div className="flex flex-col gap-3 flex-1">
                 <button onClick={() => handleCloudConnect(StorageProvider.GOOGLE_DRIVE)} className={`p-5 rounded-2xl border-2 transition-all flex items-center justify-between ${isCloudConnected === StorageProvider.GOOGLE_DRIVE ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-100 dark:border-slate-800 hover:border-slate-200'}`}>
                    <div className="flex items-center gap-3">
                       <Globe size={18} className="text-blue-600" />
                       <span className="font-black text-[11px] uppercase tracking-widest dark:text-white">Google Drive</span>
                    </div>
                    {isCloudConnected === StorageProvider.GOOGLE_DRIVE && <CheckCircle size={16} className="text-blue-600" />}
                 </button>
                 <button onClick={() => handleCloudConnect(StorageProvider.ONE_DRIVE)} className={`p-5 rounded-2xl border-2 transition-all flex items-center justify-between ${isCloudConnected === StorageProvider.ONE_DRIVE ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-100 dark:border-slate-800 hover:border-slate-200'}`}>
                    <div className="flex items-center gap-3">
                       <CloudRain size={18} className="text-blue-500" />
                       <span className="font-black text-[11px] uppercase tracking-widest dark:text-white">OneDrive</span>
                    </div>
                    {isCloudConnected === StorageProvider.ONE_DRIVE && <CheckCircle size={16} className="text-blue-600" />}
                 </button>
              </div>

              {isCloudConnected && (
                <div className="pt-6 border-t dark:border-slate-800 space-y-4">
                   <div className="flex items-center justify-between text-[10px] font-black uppercase text-slate-400">
                      <span>Last Sync State</span>
                      <span className="text-slate-900 dark:text-white">{lastSync ? new Date(lastSync).toLocaleString() : 'Never Sync'}</span>
                   </div>
                   <div className="grid grid-cols-2 gap-3">
                      <button 
                        disabled={isSyncing}
                        onClick={handleSync}
                        className="flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 disabled:opacity-50"
                      >
                         {isSyncing ? <RefreshCw className="animate-spin" size={14} /> : <UploadCloud size={14} />} Push Data
                      </button>
                      <button 
                        disabled={isRestoring}
                        onClick={handleRestore}
                        className="flex items-center justify-center gap-2 py-3 bg-slate-900 dark:bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 disabled:opacity-50"
                      >
                         {isRestoring ? <RefreshCw className="animate-spin" size={14} /> : <DownloadCloud size={14} />} Pull Master
                      </button>
                   </div>
                </div>
              )}
           </div>

           {/* App Installation Experience */}
           <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border dark:border-slate-800 shadow-sm space-y-6 flex flex-col">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-2xl"><Monitor size={24} /></div>
                <h2 className="font-black text-lg dark:text-white uppercase tracking-tight">Desktop Interface</h2>
              </div>
              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border dark:border-slate-700 space-y-4 flex-1">
                 <p className="text-[11px] font-bold text-slate-500 uppercase leading-relaxed tracking-wider">
                   Run PrintMaster Pro as a standalone application on your workstation. This eliminates browser tabs and provides a cleaner production workspace.
                 </p>
                 {deferredPrompt ? (
                    <button 
                      onClick={handleInstall}
                      className="w-full py-4 bg-green-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-green-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-100 dark:shadow-none"
                    >
                      <Download size={16} /> Get Application Now
                    </button>
                 ) : (
                    <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border dark:border-slate-800">
                       <CheckCircle2 size={16} className="text-green-500" />
                       <span className="text-[10px] font-black uppercase text-slate-400">Application Integrated</span>
                    </div>
                 )}
              </div>
           </div>

           <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-2xl"><Share2 size={24} /></div>
                <h2 className="font-black text-lg dark:text-white uppercase tracking-tight">External Data</h2>
              </div>
              <button onClick={() => externalImportRef.current?.click()} className="w-full p-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-between group hover:border-blue-400 transition-all">
                 <span className="font-black text-[10px] uppercase tracking-widest dark:text-slate-400">Import CSV/Excel</span>
                 <Upload size={18} className="text-slate-400 group-hover:text-blue-500" />
                 <input type="file" ref={externalImportRef} className="hidden" accept=".xlsx,.xls,.csv" />
              </button>
           </div>

           <div className="md:col-span-2 bg-red-50 dark:bg-red-900/10 p-10 rounded-[2.5rem] border-2 border-red-100 dark:border-red-900/20 space-y-6">
             <div className="flex items-center gap-4">
                <div className="p-4 bg-red-600 rounded-3xl text-white shadow-lg"><AlertTriangle size={32} /></div>
                <div>
                   <h3 className="text-xl font-black text-red-600 dark:text-red-400 uppercase tracking-tight">Nuclear Protocol</h3>
                   <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">Irreversible system data purge / restoration</p>
                </div>
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button onClick={exportAppState} className="p-5 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-2xl flex items-center gap-4 group hover:shadow-md transition-all">
                   <Download size={20} className="text-slate-400 group-hover:text-blue-600" />
                   <div className="text-left">
                      <p className="font-black text-xs uppercase dark:text-white">Master Backup</p>
                      <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">Vault Export</p>
                   </div>
                </button>
                <button 
                   onClick={() => masterImportRef.current?.click()} 
                   className="p-5 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-2xl flex items-center gap-4 group hover:shadow-md transition-all"
                >
                   <UploadCloud size={20} className="text-slate-400 group-hover:text-green-600" />
                   <div className="text-left">
                      <p className="font-black text-xs uppercase dark:text-white">Restore File</p>
                      <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">Vault Import</p>
                   </div>
                   <input type="file" ref={masterImportRef} onChange={handleMasterFileImport} className="hidden" accept=".json" />
                </button>
                <button 
                   onClick={() => setShowResetModal(true)} 
                   className="p-5 bg-red-600 text-white rounded-2xl flex items-center gap-4 shadow-xl shadow-red-100 dark:shadow-none hover:bg-red-700 transition-all"
                >
                   <Lock size={20} />
                   <div className="text-left">
                      <p className="font-black text-xs uppercase">System Wipe</p>
                      <p className="text-[8px] opacity-70 font-bold uppercase tracking-widest">Wipe Local Storage</p>
                   </div>
                </button>
             </div>
           </div>
        </div>
      )}

      {/* IDENTITY tab */}
      {activeSettingsTab === 'IDENTITY' && (
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm p-10 space-y-10 relative overflow-hidden group animate-in slide-in-from-bottom-4 duration-500">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="flex items-center gap-4">
                 <div className="p-4 bg-blue-600 rounded-3xl shadow-xl text-white">
                    <UserCircle size={32} />
                 </div>
                 <div>
                    <h2 className="text-2xl font-black dark:text-white uppercase tracking-tight">Identity Matrix</h2>
                    <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Global access control & user passcodes</p>
                 </div>
              </div>
              <button 
                onClick={() => { setEditingUserId(null); setUserForm({ name: '', role: UserRole.CASHIER, pin: '' }); setShowUserModal(true); }}
                className="bg-slate-950 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800 transition-all shadow-md"
              >
                <Plus size={16} /> Register New Entity
              </button>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 relative z-10">
              {allUsers.map(user => (
                <div 
                  key={user.id}
                  className={`p-6 rounded-[2.5rem] border-2 transition-all relative group/profile ${
                    currentUser.id === user.id 
                    ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/20 shadow-md' 
                    : 'border-slate-50 dark:border-slate-800 bg-white dark:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-4">
                     <div className={`w-14 h-14 rounded-2xl ${user.avatarColor || 'bg-blue-600'} flex items-center justify-center text-white font-black text-xl shadow-lg`}>
                        {user.name[0]}
                     </div>
                     <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-black dark:text-white truncate uppercase tracking-tight">{user.name}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                           <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">{user.role}</span>
                           {user.pin ? (
                             <div className="flex items-center gap-1 text-green-500">
                               <Fingerprint size={10} />
                               <span className="text-[7px] font-black uppercase tracking-tighter">SECURED</span>
                             </div>
                           ) : (
                             <div className="flex items-center gap-1 text-amber-500">
                               <Lock size={10} />
                               <span className="text-[7px] font-black uppercase tracking-tighter">UNSECURED</span>
                             </div>
                           )}
                        </div>
                     </div>
                     {currentUser.id === user.id && <UserCheck size={18} className="text-blue-600 shrink-0" />}
                  </div>
                  
                  <div className="mt-6 flex items-center gap-2">
                    <button 
                      onClick={() => handleEditUser(user)}
                      className="flex-1 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-[9px] font-black uppercase tracking-widest hover:border-blue-400 transition-all border dark:border-slate-700 flex items-center justify-center gap-2"
                    >
                      <Edit2 size={12} /> Manage
                    </button>
                    {isAdmin && user.id !== 'u-admin' && (
                      <button 
                        onClick={() => { if(window.confirm(`Permanently remove profile for ${user.name}?`)) deleteUser(user.id); }}
                        className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
           </div>
        </div>
      )}

      {/* BRANDING tab */}
      {activeSettingsTab === 'BRANDING' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-4 duration-500">
           <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm p-10 space-y-10">
              <div className="flex items-center gap-4">
                 <div className="p-4 bg-purple-600 rounded-3xl shadow-xl text-white">
                    <Palette size={32} />
                 </div>
                 <div>
                    <h2 className="text-2xl font-black dark:text-white uppercase tracking-tight">Invoice Customization</h2>
                    <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Adjust print aesthetics and business identity</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-6">
                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3 px-1">Active Template</label>
                       <div className="grid grid-cols-2 gap-3">
                          {(['MODERN', 'CLASSIC', 'THERMAL', 'MINIMAL'] as InvoiceTemplate[]).map(t => (
                            <button 
                              key={t}
                              onClick={() => updateInvoiceSettings({ template: t })}
                              className={`p-4 rounded-2xl border-2 transition-all text-left group ${invoiceSettings.template === t ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-100 dark:border-slate-800 hover:border-slate-200'}`}
                            >
                               <div className="flex items-center justify-between mb-2">
                                  <LayoutIcon size={16} className={invoiceSettings.template === t ? 'text-blue-600' : 'text-slate-400'} />
                                  {invoiceSettings.template === t && <CheckCircle2 size={12} className="text-blue-600" />}
                               </div>
                               <p className={`text-[10px] font-black uppercase tracking-widest ${invoiceSettings.template === t ? 'text-blue-600' : 'text-slate-500'}`}>{t}</p>
                            </button>
                          ))}
                       </div>
                    </div>

                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3 px-1">Brand Primary Color</label>
                       <div className="flex flex-wrap gap-3">
                          {['#2563eb', '#7c3aed', '#db2777', '#dc2626', '#0891b2', '#059669', '#1e293b'].map(c => (
                            <button 
                              key={c}
                              onClick={() => updateInvoiceSettings({ primaryColor: c })}
                              style={{ backgroundColor: c }}
                              className={`w-10 h-10 rounded-full border-4 transition-transform hover:scale-110 flex items-center justify-center ${invoiceSettings.primaryColor === c ? 'border-white dark:border-slate-800 ring-2 ring-blue-500' : 'border-transparent'}`}
                            >
                               {invoiceSettings.primaryColor === c && <CheckCircle2 size={14} className="text-white" />}
                            </button>
                          ))}
                       </div>
                    </div>

                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3 px-1">Business Logo URL</label>
                       <div className="relative">
                          <Globe size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input 
                            type="text" 
                            className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl pl-14 pr-6 py-4 outline-none dark:text-white font-bold text-sm"
                            value={invoiceSettings.businessLogoUrl}
                            onChange={e => updateInvoiceSettings({ businessLogoUrl: e.target.value })}
                            placeholder="https://..."
                          />
                       </div>
                    </div>
                 </div>

                 <div className="space-y-6">
                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3 px-1">Header Details</label>
                       <div className="space-y-3">
                          <div className="relative">
                             <Building size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                             <input 
                               type="text" 
                               className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl pl-12 pr-4 py-3 outline-none dark:text-white font-black text-xs uppercase tracking-tight"
                               value={invoiceSettings.businessName}
                               onChange={e => updateInvoiceSettings({ businessName: e.target.value })}
                               placeholder="Business Name"
                             />
                          </div>
                          <div className="relative">
                             <Type size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                             <input 
                               type="text" 
                               className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl pl-12 pr-4 py-3 outline-none dark:text-white font-medium text-xs"
                               value={invoiceSettings.businessTagline}
                               onChange={e => updateInvoiceSettings({ businessTagline: e.target.value })}
                               placeholder="Slogan / Tagline"
                             />
                          </div>
                       </div>
                    </div>

                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3 px-1">Bank & Payment Notes</label>
                       <textarea 
                          className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-medium text-xs"
                          rows={4}
                          value={invoiceSettings.bankDetails}
                          onChange={e => updateInvoiceSettings({ bankDetails: e.target.value })}
                          placeholder="Bank: ABC Bank&#10;Account: 0011223344"
                       />
                    </div>

                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3 px-1">Invoice Footer (Thank You Note)</label>
                       <textarea 
                          className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-medium text-xs"
                          rows={3}
                          value={invoiceSettings.footerNotes}
                          onChange={e => updateInvoiceSettings({ footerNotes: e.target.value })}
                          placeholder="Terms and conditions..."
                       />
                    </div>
                 </div>
              </div>
           </div>

           <div className="bg-slate-100 dark:bg-slate-950 rounded-[3rem] p-1 shadow-inner border border-slate-200 dark:border-slate-800 flex flex-col items-center">
              <div className="w-full p-6 flex items-center justify-between">
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Print Preview</p>
                 <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              </div>
              <div className="w-full max-w-[320px] aspect-[1/1.4] bg-white text-black shadow-2xl rounded-2xl overflow-hidden mb-10 transform scale-90 origin-top">
                 {invoiceSettings.template === 'THERMAL' ? (
                   <div className="p-6 font-mono text-[8px] leading-tight space-y-4">
                      <div className="text-center border-b pb-4">
                         <h4 className="font-black text-[12px] uppercase">{invoiceSettings.businessName}</h4>
                         <p>{invoiceSettings.businessAddress}</p>
                         <p>{invoiceSettings.businessPhone}</p>
                      </div>
                      <div className="space-y-1">
                         <div className="flex justify-between font-bold"><span>ITEM</span><span>TOTAL</span></div>
                         <div className="flex justify-between"><span>PRINT JOB A4 X 10</span><span>{currentCurrency} 100</span></div>
                         <div className="flex justify-between"><span>DESIGN SERVICE</span><span>{currentCurrency} 500</span></div>
                      </div>
                      <div className="border-t pt-4 text-right">
                         <p className="font-black text-[10px]">TOTAL: {currentCurrency} 600</p>
                      </div>
                   </div>
                 ) : (
                   <div className="h-full flex flex-col">
                      <div className="p-8 flex justify-between items-start" style={{ borderTop: `6px solid ${invoiceSettings.primaryColor}` }}>
                         <div>
                            <h4 className="font-black text-sm uppercase leading-none mb-1">{invoiceSettings.businessName}</h4>
                            <p className="text-[8px] opacity-60 leading-tight">{invoiceSettings.businessAddress}</p>
                         </div>
                         <img src={invoiceSettings.businessLogoUrl} alt="Logo" className="w-8 h-8 rounded-lg grayscale" />
                      </div>
                      <div className="px-8 flex-1">
                         <div className="mb-4">
                            <h5 className="font-black text-[14px] uppercase tracking-tighter" style={{ color: invoiceSettings.primaryColor }}>INVOICE</h5>
                            <p className="text-[6px] opacity-40 uppercase font-black">#INV-001 • SEP 12, 2023</p>
                         </div>
                         <div className="space-y-2 mb-6">
                            <div className="h-2 w-full bg-slate-100 rounded"></div>
                            <div className="h-2 w-5/6 bg-slate-100 rounded"></div>
                         </div>
                      </div>
                      <div className="p-8 bg-slate-50 flex justify-between items-end">
                         <div className="text-[6px] max-w-[60%] space-y-2">
                            <p className="font-bold opacity-40 uppercase">Notes</p>
                            <p className="italic">{invoiceSettings.footerNotes.slice(0, 60)}...</p>
                         </div>
                         <div className="text-right">
                            <p className="text-[12px] font-black" style={{ color: invoiceSettings.primaryColor }}>{currentCurrency} 0.00</p>
                         </div>
                      </div>
                   </div>
                 )}
              </div>
           </div>
        </div>
      )}

      {/* Secure Reset Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[250] flex items-center justify-center p-4">
           <div className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-xl p-12 text-center animate-in zoom-in duration-300 border border-red-100 dark:border-red-900/30 shadow-2xl">
              <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
                 <AlertTriangle size={40} />
              </div>
              <h2 className="text-3xl font-black dark:text-white uppercase tracking-tighter mb-4">CRITICAL DATA PURGE</h2>
              <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-10 leading-relaxed">
                This action will permanently destroy all local data. There is no undo.
              </p>
              
              <div className="space-y-6 text-left mb-10">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-center">Type <span className="text-red-600">DELETE ALL DATA</span> to confirm</label>
                 <input 
                    type="text" 
                    className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-red-100 dark:border-red-900/20 rounded-2xl px-6 py-5 text-center font-black uppercase text-xl dark:text-white outline-none focus:border-red-600 transition-all shadow-inner"
                    value={resetConfirmText}
                    onChange={e => setResetConfirmText(e.target.value)}
                    placeholder="CONFIRMATION REQUIRED"
                 />
              </div>

              <div className="flex flex-col gap-4">
                 <button 
                    disabled={resetConfirmText !== 'DELETE ALL DATA'}
                    onClick={factoryReset}
                    className="w-full bg-red-600 text-white font-black py-6 rounded-2xl uppercase tracking-[0.3em] text-xs shadow-xl hover:bg-red-700 transition-all disabled:opacity-30 disabled:grayscale"
                 >
                    INITIATE SYSTEM RESET
                 </button>
                 <button 
                    onClick={() => { setShowResetModal(false); setResetConfirmText(''); }}
                    className="font-black text-slate-400 uppercase tracking-widest text-[10px] hover:text-slate-600 dark:hover:text-slate-200"
                 >
                    Abort and Stay Safe
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[250] flex items-center justify-center p-4">
           <div className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-md p-10 shadow-2xl border dark:border-slate-800 animate-in zoom-in duration-300">
              <div className="flex items-center justify-between mb-8">
                 <h2 className="text-xl font-black dark:text-white uppercase tracking-tight">{editingUserId ? 'Edit Profile' : 'New Identity'}</h2>
                 <button onClick={() => setShowUserModal(false)} className="p-2 hover:bg-slate-100 rounded-full dark:text-white"><X size={24} /></button>
              </div>
              <form onSubmit={handleUserSubmit} className="space-y-6">
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Display Name</label>
                    <input required type="text" className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-bold" value={userForm.name} onChange={e => setUserForm({...userForm, name: e.target.value})} />
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">System Role</label>
                    <select className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-bold" value={userForm.role} onChange={e => setUserForm({...userForm, role: e.target.value as UserRole})}>
                       <option value={UserRole.CASHIER}>Cashier</option>
                       <option value={UserRole.DESIGNER}>Graphic Designer</option>
                       <option value={UserRole.STAFF}>Production Staff</option>
                       <option value={UserRole.ADMIN}>Administrator</option>
                    </select>
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Access PIN (Optional)</label>
                    <input type="password" maxLength={4} pattern="\d{4}" className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-black text-center text-2xl tracking-[0.5em]" value={userForm.pin} onChange={e => setUserForm({...userForm, pin: e.target.value.replace(/\D/g, '')})} placeholder="****" />
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-2 text-center">4-digit numeric code</p>
                 </div>
                 <button type="submit" className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-blue-700 transition-all uppercase tracking-[0.2em] text-xs">
                    Authorize Identity
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};
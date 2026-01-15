
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Cpu, Plus, Search, Trash2, Settings, 
  Calendar, Phone, User, DollarSign, X, 
  History, CheckCircle2, AlertCircle, Wrench,
  TrendingDown, TrendingUp, Info, Activity
} from 'lucide-react';
import { UserRole, Machinery, MachineryService } from '../types';

export const MachineryManagement = () => {
  const { machinery, machineServices, addMachinery, updateMachinery, deleteMachinery, addMachineryService, currentCurrency, currentUser } = useApp();
  const [activeTab, setActiveTab] = useState<'LIST' | 'HISTORY'>('LIST');
  const [showMachineModal, setShowMachineModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const isAdmin = currentUser.role === UserRole.ADMIN;

  const [machineForm, setMachineForm] = useState({
    name: '',
    model: '',
    serialNumber: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    purchasePrice: 0,
    salvageValue: 0,
    estimatedLifeYears: 5,
    monthlyOpCost: 0,
    expectedMonthlyHours: 160,
    status: 'OPERATIONAL' as any,
    location: ''
  });

  const [serviceForm, setServiceForm] = useState({
    technicianName: '',
    technicianPhone: '',
    visitDate: new Date().toISOString().split('T')[0],
    charges: 0,
    description: '',
    replacedParts: '',
    nextServiceDate: ''
  });

  const handleAddMachine = (e: React.FormEvent) => {
    e.preventDefault();
    addMachinery(machineForm);
    setShowMachineModal(false);
    setMachineForm({ 
      name: '', model: '', serialNumber: '', purchaseDate: new Date().toISOString().split('T')[0], 
      purchasePrice: 0, salvageValue: 0, estimatedLifeYears: 5, monthlyOpCost: 0, 
      expectedMonthlyHours: 160, status: 'OPERATIONAL', location: '' 
    });
  };

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    if (showServiceModal) {
      addMachineryService({
        ...serviceForm,
        machineryId: showServiceModal
      });
      setShowServiceModal(null);
      setServiceForm({ technicianName: '', technicianPhone: '', visitDate: new Date().toISOString().split('T')[0], charges: 0, description: '', replacedParts: '', nextServiceDate: '' });
    }
  };

  const calculateHourlyRate = (m: Machinery) => {
    const totalDepreciation = m.purchasePrice - m.salvageValue;
    const monthlyDepreciation = totalDepreciation / (m.estimatedLifeYears * 12);
    const totalMonthlyCost = monthlyDepreciation + m.monthlyOpCost;
    return (totalMonthlyCost / (m.expectedMonthlyHours || 1)).toFixed(2);
  };

  const filteredMachinery = machinery.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold dark:text-white uppercase tracking-tight">Machinery & Assets</h1>
          <p className="text-slate-500 dark:text-slate-400">Track heavy equipment, maintenance visits, and technician charges.</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => setShowMachineModal(true)}
            className="flex items-center gap-2 bg-blue-600 px-6 py-3 rounded-xl font-black text-white shadow-lg hover:bg-blue-700 transition-all uppercase tracking-widest text-xs"
          >
            <Plus size={18} /> Register Machine
          </button>
        )}
      </div>

      <div className="flex bg-white dark:bg-slate-900 p-1 rounded-2xl border dark:border-slate-800 w-fit overflow-x-auto">
        <button 
          onClick={() => setActiveTab('LIST')}
          className={`px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'LIST' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'}`}
        >
          Equipment List
        </button>
        <button 
          onClick={() => setActiveTab('HISTORY')}
          className={`px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'HISTORY' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'}`}
        >
          Full Service History
        </button>
      </div>

      {activeTab === 'LIST' && (
        <>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-3">
            <Search className="text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search machinery..." 
              className="flex-1 bg-transparent outline-none dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredMachinery.map(m => {
              const hourlyRate = calculateHourlyRate(m);
              const monthlyDep = ((m.purchasePrice - m.salvageValue) / (m.estimatedLifeYears * 12)).toFixed(0);
              
              return (
                <div key={m.id} className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden group hover:border-blue-300 transition-all">
                  <div className="p-10">
                    <div className="flex items-start justify-between mb-8">
                      <div className="p-5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-[2rem]">
                        <Cpu size={36} />
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          m.status === 'OPERATIONAL' ? 'bg-green-50 text-green-600' :
                          m.status === 'UNDER_MAINTENANCE' ? 'bg-amber-50 text-amber-600' :
                          'bg-red-50 text-red-600'
                        }`}>
                          {m.status.replace('_', ' ')}
                        </span>
                        <div className="flex items-center gap-1.5 text-blue-600">
                          <Activity size={14} />
                          <span className="text-[10px] font-black uppercase tracking-widest">Rate: {currentCurrency} {hourlyRate}/hr</span>
                        </div>
                      </div>
                    </div>

                    <h3 className="text-2xl font-black dark:text-white leading-tight mb-1">{m.name}</h3>
                    <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mb-8">{m.model} • S/N: {m.serialNumber}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                      <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border dark:border-slate-800">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                          <TrendingDown size={14} className="text-red-500" /> Depreciation
                        </p>
                        <p className="text-lg font-black dark:text-white">{currentCurrency} {Number(monthlyDep).toLocaleString()}<span className="text-xs text-slate-500">/mo</span></p>
                        <p className="text-[8px] font-bold text-slate-500 uppercase mt-1">Val: {currentCurrency} {m.purchasePrice.toLocaleString()}</p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border dark:border-slate-800">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                          <TrendingUp size={14} className="text-green-500" /> Operational
                        </p>
                        <p className="text-lg font-black dark:text-white">{currentCurrency} {m.monthlyOpCost.toLocaleString()}<span className="text-xs text-slate-500">/mo</span></p>
                        <p className="text-[8px] font-bold text-slate-500 uppercase mt-1">Based on {m.expectedMonthlyHours} hrs</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setShowServiceModal(m.id)}
                        className="flex-1 bg-blue-600 text-white font-black py-5 rounded-2xl text-xs uppercase tracking-[0.2em] hover:bg-blue-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-100 dark:shadow-none"
                      >
                        <Wrench size={18} /> Record Maintenance
                      </button>
                      {isAdmin && (
                        <button 
                          onClick={() => { if(window.confirm('Delete machine and all history?')) deleteMachinery(m.id); }}
                          className="p-5 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 transition-all"
                        >
                          <Trash2 size={20} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {activeTab === 'HISTORY' && (
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800 border-b dark:border-slate-800 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              <tr>
                <th className="px-8 py-6">Machine / Visit Date</th>
                <th className="px-8 py-6">Technician & Charge</th>
                <th className="px-8 py-6">Work Done / Parts</th>
                <th className="px-8 py-6">Next Service</th>
                <th className="px-8 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-slate-800">
              {machineServices.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400 font-bold uppercase tracking-widest text-xs">No service records found.</td>
                </tr>
              )}
              {machineServices.sort((a,b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime()).map(service => {
                const machine = machinery.find(m => m.id === service.machineryId);
                return (
                  <tr key={service.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-8 py-5">
                       <p className="font-bold dark:text-white">{machine?.name || 'Unknown Asset'}</p>
                       <p className="text-[10px] text-slate-400 font-black uppercase flex items-center gap-1"><Calendar size={10} /> {service.visitDate}</p>
                    </td>
                    <td className="px-8 py-5">
                       <p className="text-sm font-bold dark:text-slate-300">{service.technicianName}</p>
                       <p className="text-green-600 font-black text-xs">{currentCurrency} {service.charges.toLocaleString()}</p>
                    </td>
                    <td className="px-8 py-5">
                       <p className="text-xs dark:text-slate-400 line-clamp-1">{service.description}</p>
                       {service.replacedParts && <p className="text-[10px] text-blue-600 font-black uppercase mt-1">Parts: {service.replacedParts}</p>}
                    </td>
                    <td className="px-8 py-5">
                       {service.nextServiceDate ? (
                         <div className="flex items-center gap-1.5 text-[10px] font-black text-amber-600 uppercase">
                           <AlertCircle size={12} /> {service.nextServiceDate}
                         </div>
                       ) : <span className="text-slate-400">---</span>}
                    </td>
                    <td className="px-8 py-5 text-right">
                       <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><History size={16} /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Machine Modal */}
      {showMachineModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-2xl p-10 animate-in zoom-in border dark:border-slate-800 max-h-[90vh] overflow-y-auto">
             <div className="flex items-center justify-between mb-8">
                <div>
                   <h2 className="text-2xl font-black dark:text-white uppercase tracking-tight">Machine Registry</h2>
                   <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">Configure financial data for job costing</p>
                </div>
                <button onClick={() => setShowMachineModal(false)} className="p-2 hover:bg-slate-100 rounded-full dark:text-white"><X size={24} /></button>
             </div>
             <form onSubmit={handleAddMachine} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="md:col-span-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Equipment Name</label>
                      <input required type="text" className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-bold" value={machineForm.name} onChange={e => setMachineForm({...machineForm, name: e.target.value})} placeholder="e.g., Konica Minolta C4070" />
                   </div>
                   <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Model</label>
                      <input required type="text" className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-bold" value={machineForm.model} onChange={e => setMachineForm({...machineForm, model: e.target.value})} />
                   </div>
                   <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Serial Number</label>
                      <input required type="text" className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-bold" value={machineForm.serialNumber} onChange={e => setMachineForm({...machineForm, serialNumber: e.target.value})} />
                   </div>
                </div>

                <div className="p-8 bg-blue-50 dark:bg-blue-900/10 rounded-[2.5rem] border border-blue-100 dark:border-blue-900/50 space-y-6">
                   <div className="flex items-center gap-2 mb-2">
                      <DollarSign size={18} className="text-blue-600" />
                      <h3 className="font-black text-sm uppercase tracking-widest text-blue-700 dark:text-blue-400">Costing & Depreciation</h3>
                   </div>
                   <div className="grid grid-cols-2 gap-6">
                      <div>
                         <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Purchase Price ({currentCurrency})</label>
                         <input required type="number" className="w-full bg-white dark:bg-slate-900 border dark:border-slate-700 rounded-xl px-4 py-3 outline-none dark:text-white font-black" value={machineForm.purchasePrice || ''} onChange={e => setMachineForm({...machineForm, purchasePrice: Number(e.target.value)})} />
                      </div>
                      <div>
                         <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Salvage Value ({currentCurrency})</label>
                         <input required type="number" className="w-full bg-white dark:bg-slate-900 border dark:border-slate-700 rounded-xl px-4 py-3 outline-none dark:text-white font-black" value={machineForm.salvageValue || ''} onChange={e => setMachineForm({...machineForm, salvageValue: Number(e.target.value)})} />
                      </div>
                      <div>
                         <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Life Estimate (Years)</label>
                         <input required type="number" className="w-full bg-white dark:bg-slate-900 border dark:border-slate-700 rounded-xl px-4 py-3 outline-none dark:text-white font-black" value={machineForm.estimatedLifeYears || ''} onChange={e => setMachineForm({...machineForm, estimatedLifeYears: Number(e.target.value)})} />
                      </div>
                      <div>
                         <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Monthly Op. Cost ({currentCurrency})</label>
                         <input required type="number" className="w-full bg-white dark:bg-slate-900 border dark:border-slate-700 rounded-xl px-4 py-3 outline-none dark:text-white font-black" value={machineForm.monthlyOpCost || ''} onChange={e => setMachineForm({...machineForm, monthlyOpCost: Number(e.target.value)})} />
                      </div>
                      <div className="col-span-2">
                         <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Expected Usage (Hours/Month)</label>
                         <input required type="number" className="w-full bg-white dark:bg-slate-900 border dark:border-slate-700 rounded-xl px-4 py-3 outline-none dark:text-white font-black" value={machineForm.expectedMonthlyHours || ''} onChange={e => setMachineForm({...machineForm, expectedMonthlyHours: Number(e.target.value)})} />
                      </div>
                   </div>
                   <div className="flex items-center gap-3 p-4 bg-white/50 dark:bg-slate-900/50 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                      <Info size={20} className="text-blue-600" />
                      <p className="text-[10px] font-bold text-blue-700 dark:text-blue-300 leading-relaxed uppercase tracking-wider">
                        The hourly rate helps calculate the actual cost of a print job based on machine usage time.
                      </p>
                   </div>
                </div>

                <button type="submit" className="w-full bg-blue-600 text-white font-black py-6 rounded-[2rem] shadow-xl hover:bg-blue-700 transition-all uppercase tracking-[0.3em] text-xs">
                  Register & Calculate Rates
                </button>
             </form>
          </div>
        </div>
      )}

      {/* Service Modal */}
      {showServiceModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-xl p-10 animate-in zoom-in border dark:border-slate-800 max-h-[90vh] overflow-y-auto">
             <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-black dark:text-white uppercase tracking-tight">Record Maintenance</h2>
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Asset: {machinery.find(m=>m.id===showServiceModal)?.name}</p>
                </div>
                <button onClick={() => setShowServiceModal(null)} className="p-2 hover:bg-slate-100 rounded-full dark:text-white"><X size={24} /></button>
             </div>
             <form onSubmit={handleAddService} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Technician Name</label>
                      <input required type="text" className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-bold" value={serviceForm.technicianName} onChange={e => setServiceForm({...serviceForm, technicianName: e.target.value})} />
                   </div>
                   <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Contact Number</label>
                      <input required type="text" className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-bold" value={serviceForm.technicianPhone} onChange={e => setServiceForm({...serviceForm, technicianPhone: e.target.value})} />
                   </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Visit Date</label>
                      <input required type="date" className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-bold" value={serviceForm.visitDate} onChange={e => setServiceForm({...serviceForm, visitDate: e.target.value})} />
                   </div>
                   <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Charges ({currentCurrency})</label>
                      <input required type="number" className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-black" value={serviceForm.charges || ''} onChange={e => setServiceForm({...serviceForm, charges: Number(e.target.value)})} />
                   </div>
                </div>
                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Maintenance Description</label>
                   <textarea required className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-medium" rows={3} value={serviceForm.description} onChange={e => setServiceForm({...serviceForm, description: e.target.value})} placeholder="What was done?" />
                </div>
                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Replaced Parts (if any)</label>
                   <input type="text" className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-bold" value={serviceForm.replacedParts} onChange={e => setServiceForm({...serviceForm, replacedParts: e.target.value})} placeholder="e.g. Fuser, Ink heads, Rollers" />
                </div>
                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Next Service Date</label>
                   <input type="date" className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-bold" value={serviceForm.nextServiceDate} onChange={e => setServiceForm({...serviceForm, nextServiceDate: e.target.value})} />
                </div>
                <button type="submit" className="w-full bg-green-600 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-green-700 transition-all uppercase tracking-[0.2em] text-xs">
                  Save Service Record
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};


import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Cpu, Plus, Search, Trash2, Settings, 
  Calendar, Phone, User, DollarSign, X, 
  History, CheckCircle2, AlertCircle, Wrench,
  TrendingDown, TrendingUp, Info, Activity,
  Layers, Package, ShieldCheck, Banknote,
  ArrowUpCircle, Clock, ChevronRight, Hash, Database
} from 'lucide-react';
import { UserRole, Machinery, MachineryService } from '../types';

export const MachineryManagement = () => {
  const { machinery, machineServices, addMachinery, updateMachinery, deleteMachinery, addMachineryService, currentCurrency, currentUser, branches } = useApp();
  const [activeTab, setActiveTab] = useState<'FLEET' | 'TECHNICAL' | 'FINANCIAL' | 'STOCKS'>('FLEET');
  const [showMachineModal, setShowMachineModal] = useState(false);
  const [showLogModal, setShowLogModal] = useState<{ id: string, type: 'SERVICE' | 'COUNTER' } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const isAdmin = currentUser.role === UserRole.ADMIN;

  // New Machine Form State
  const [machineForm, setMachineForm] = useState<Omit<Machinery, 'id' | 'branchId'>>({
    name: '', model: '', serialNumber: '', purchaseDate: new Date().toISOString().split('T')[0],
    totalCost: 0, amountPaid: 0, purchasePrice: 0, salvageValue: 0, estimatedLifeYears: 5,
    monthlyOpCost: 0, expectedMonthlyHours: 160, status: 'OPERATIONAL', location: '',
    initialCounter: 0, currentCounter: 0, type: 'OWNED', consumableStocks: []
  });

  // Log Form (Service or Counter Reading)
  const [logForm, setLogForm] = useState({
    technicianName: '', technicianPhone: '', date: new Date().toISOString().split('T')[0],
    charges: 0, description: '', replacedParts: '', reading: 0
  });

  const handleAddMachine = (e: React.FormEvent) => {
    e.preventDefault();
    addMachinery({ ...machineForm, purchasePrice: machineForm.totalCost });
    setShowMachineModal(false);
  };

  const handleLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showLogModal) return;

    if (showLogModal.type === 'SERVICE') {
      addMachineryService({
        machineryId: showLogModal.id,
        technicianName: logForm.technicianName,
        technicianPhone: logForm.technicianPhone,
        visitDate: logForm.date,
        charges: logForm.charges,
        description: logForm.description,
        replacedParts: logForm.replacedParts,
        type: 'REPAIR'
      });
    } else {
      updateMachinery(showLogModal.id, { currentCounter: logForm.reading });
    }
    setShowLogModal(null);
  };

  const filteredFleet = machinery.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalLiability = machinery.reduce((acc, m) => acc + (m.totalCost - m.amountPaid), 0);
  const totalInvestment = machinery.reduce((acc, m) => acc + m.totalCost, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black dark:text-white uppercase tracking-tight">Hardware Authority</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Global fleet controller for production hardware and technical lifecycle.</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => setShowMachineModal(true)}
            className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-blue-100 dark:shadow-none hover:bg-blue-700 transition-all flex items-center gap-2"
          >
            <Plus size={20} /> Register Unit
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FleetStat label="Total Asset Value" value={totalInvestment} icon={ShieldCheck} color="bg-blue-600" currency={currentCurrency} />
        <FleetStat label="Remaining Liability" value={totalLiability} icon={Banknote} color="bg-red-500" currency={currentCurrency} />
        <FleetStat label="Active Fleet" value={machinery.filter(m=>m.status==='OPERATIONAL').length} icon={Activity} color="bg-green-600" sub="Hardware Online" />
      </div>

      <div className="flex bg-white dark:bg-slate-900 p-1 rounded-2xl border dark:border-slate-800 w-fit overflow-x-auto no-scrollbar">
        {(['FLEET', 'TECHNICAL', 'FINANCIAL', 'STOCKS'] as const).map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-3">
        <Search className="text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Lookup unit by name, model or serial..." 
          className="flex-1 bg-transparent outline-none dark:text-white font-bold uppercase tracking-widest text-xs"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {activeTab === 'FLEET' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredFleet.length === 0 && (
            <div className="lg:col-span-2 py-32 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[3rem]">
              <Database size={64} className="mx-auto text-slate-200 dark:text-slate-800 mb-4" />
              <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No hardware registered in system</p>
            </div>
          )}
          {filteredFleet.map(unit => (
            <div key={unit.id} className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden group hover:border-blue-300 transition-all">
              <div className="p-10 space-y-8">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-5">
                    <div className="p-5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-[2rem]">
                      <Cpu size={32} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black dark:text-white uppercase tracking-tight">{unit.name}</h3>
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{unit.model} • S/N: {unit.serialNumber}</p>
                    </div>
                  </div>
                  <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                    unit.status === 'OPERATIONAL' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                  }`}>
                    {unit.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                  <MachineData label="Counter" value={unit.currentCounter.toLocaleString()} icon={Hash} />
                  <MachineData label="Lifetime Vol" value={(unit.currentCounter - unit.initialCounter).toLocaleString()} icon={TrendingUp} />
                  <MachineData label="Install Read" value={unit.initialCounter.toLocaleString()} icon={ArrowUpCircle} />
                  <MachineData label="Install Date" value={unit.purchaseDate} icon={Calendar} />
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                      <span>Investment Payback</span>
                      <span className="text-blue-600">{currentCurrency} {unit.amountPaid.toLocaleString()} / {unit.totalCost.toLocaleString()}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 transition-all duration-1000" 
                        style={{ width: `${(unit.amountPaid / unit.totalCost) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <QuickAction icon={Activity} label="Log Counter" onClick={() => { setLogForm({...logForm, reading: unit.currentCounter}); setShowLogModal({id: unit.id, type: 'COUNTER'}); }} />
                  <QuickAction icon={Wrench} label="Repair Log" onClick={() => { setShowLogModal({id: unit.id, type: 'SERVICE'}); }} />
                  <QuickAction icon={Info} label="Specs" onClick={() => {}} />
                  {isAdmin && <QuickAction icon={Trash2} label="Remove" onClick={() => { if(window.confirm('Delete unit?')) deleteMachinery(unit.id); }} danger />}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'TECHNICAL' && (
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800 border-b dark:border-slate-800 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              <tr>
                <th className="px-8 py-6">Machine / Activity</th>
                <th className="px-8 py-6">Technician</th>
                <th className="px-8 py-6">Description</th>
                <th className="px-8 py-6">Next Service</th>
                <th className="px-8 py-6 text-right">Service Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-slate-800">
              {machineServices.map(service => {
                const machine = machinery.find(m => m.id === service.machineryId);
                return (
                  <tr key={service.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-8 py-5">
                      <p className="font-bold dark:text-white uppercase text-xs">{machine?.name}</p>
                      <p className="text-[9px] text-slate-400 font-black uppercase">{service.visitDate}</p>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-sm font-bold dark:text-slate-300">{service.technicianName}</p>
                      <p className="text-[9px] text-slate-400 font-black uppercase">{service.technicianPhone}</p>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-xs dark:text-slate-400 max-w-xs">{service.description}</p>
                      {service.replacedParts && <span className="text-[8px] font-black text-blue-600 uppercase tracking-widest mt-1 inline-block">PARTS: {service.replacedParts}</span>}
                    </td>
                    <td className="px-8 py-5">
                      {service.nextServiceDate ? (
                        <div className="flex items-center gap-2 text-[10px] font-black text-amber-600 uppercase">
                          <Clock size={12} /> {service.nextServiceDate}
                        </div>
                      ) : '---'}
                    </td>
                    <td className="px-8 py-5 text-right font-black text-red-500">{currentCurrency} {service.charges.toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'FINANCIAL' && (
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800 border-b dark:border-slate-800 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              <tr>
                <th className="px-8 py-6">Hardware Unit</th>
                <th className="px-8 py-6">Total Asset Cost</th>
                <th className="px-8 py-6">Amount Paid</th>
                <th className="px-8 py-6">Remaining to Pay</th>
                <th className="px-8 py-6 text-right">Maturity</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-slate-800">
              {machinery.map(unit => (
                <tr key={unit.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-8 py-5">
                    <p className="font-bold dark:text-white uppercase text-sm tracking-tight">{unit.name}</p>
                    <p className="text-[10px] text-slate-400 font-black uppercase">{unit.type}</p>
                  </td>
                  <td className="px-8 py-5 font-black text-slate-700 dark:text-slate-200">{currentCurrency} {unit.totalCost.toLocaleString()}</td>
                  <td className="px-8 py-5 font-black text-green-600">{currentCurrency} {unit.amountPaid.toLocaleString()}</td>
                  <td className="px-8 py-5 font-black text-red-500">{currentCurrency} {(unit.totalCost - unit.amountPaid).toLocaleString()}</td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex flex-col items-end gap-1">
                      <p className="text-xs font-black dark:text-white">{((unit.amountPaid / unit.totalCost) * 100).toFixed(0)}%</p>
                      <div className="w-24 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600" style={{ width: `${(unit.amountPaid / unit.totalCost) * 100}%` }} />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Registry Modal */}
      {showMachineModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[250] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-2xl p-10 shadow-2xl border dark:border-slate-800 animate-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black dark:text-white uppercase tracking-tight">Onboard New Unit</h2>
              <button onClick={() => setShowMachineModal(false)} className="p-2 hover:bg-slate-100 rounded-full dark:text-white"><X size={24} /></button>
            </div>
            <form onSubmit={handleAddMachine} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Machine Name</label>
                  <input required type="text" className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-bold" value={machineForm.name} onChange={e => setMachineForm({...machineForm, name: e.target.value})} placeholder="e.g. Roland VersaUV" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Model / Brand</label>
                  <input required type="text" className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-bold" value={machineForm.model} onChange={e => setMachineForm({...machineForm, model: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Serial Number</label>
                  <input required type="text" className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-bold" value={machineForm.serialNumber} onChange={e => setMachineForm({...machineForm, serialNumber: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Ownership Type</label>
                  <select className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-bold" value={machineForm.type} onChange={e => setMachineForm({...machineForm, type: e.target.value as any})}>
                    <option value="OWNED">Full Purchase (Owned)</option>
                    <option value="LEASED">Leased / Rental</option>
                  </select>
                </div>
              </div>

              <div className="p-8 bg-blue-50 dark:bg-blue-900/10 rounded-[2.5rem] border border-blue-100 dark:border-blue-900/50 space-y-6">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="text-blue-600" size={24} />
                  <h3 className="font-black text-sm uppercase tracking-widest text-blue-800 dark:text-blue-300">Financial Ledger</h3>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2 px-1">Total Unit Cost ({currentCurrency})</label>
                    <input required type="number" className="w-full bg-white dark:bg-slate-900 border dark:border-slate-700 rounded-xl px-4 py-3 outline-none dark:text-white font-black" value={machineForm.totalCost || ''} onChange={e => setMachineForm({...machineForm, totalCost: Number(e.target.value)})} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2 px-1">Amount Already Paid</label>
                    <input required type="number" className="w-full bg-white dark:bg-slate-900 border dark:border-slate-700 rounded-xl px-4 py-3 outline-none dark:text-white font-black text-green-600" value={machineForm.amountPaid || ''} onChange={e => setMachineForm({...machineForm, amountPaid: Number(e.target.value)})} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Installed Reading</label>
                  <input required type="number" className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-black" value={machineForm.initialCounter || ''} onChange={e => setMachineForm({...machineForm, initialCounter: Number(e.target.value), currentCounter: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Purchase/Install Date</label>
                  <input required type="date" className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-bold" value={machineForm.purchaseDate} onChange={e => setMachineForm({...machineForm, purchaseDate: e.target.value})} />
                </div>
              </div>

              <button type="submit" className="w-full bg-blue-600 text-white font-black py-6 rounded-[2rem] shadow-xl hover:bg-blue-700 transition-all uppercase tracking-[0.3em] text-xs">
                Commit to Fleet Authority
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Universal Log Modal (Counter or Service) */}
      {showLogModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[250] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-md p-10 shadow-2xl border dark:border-slate-800 animate-in zoom-in duration-300">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black dark:text-white uppercase tracking-tight">{showLogModal.type === 'COUNTER' ? 'Update Print Meter' : 'Log Technical Repair'}</h2>
              <button onClick={() => setShowLogModal(null)} className="p-2 hover:bg-slate-100 rounded-full dark:text-white"><X size={24} /></button>
            </div>
            <form onSubmit={handleLogSubmit} className="space-y-6">
              {showLogModal.type === 'COUNTER' ? (
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Current Counter Reading</label>
                  <input autoFocus required type="number" className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-5 outline-none dark:text-white font-black text-4xl text-center" value={logForm.reading || ''} onChange={e => setLogForm({...logForm, reading: Number(e.target.value)})} />
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Technician Name</label>
                    <input required type="text" className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-bold" value={logForm.technicianName} onChange={e => setLogForm({...logForm, technicianName: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Work Description</label>
                    <textarea required className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-medium text-xs" rows={3} value={logForm.description} onChange={e => setLogForm({...logForm, description: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Charge ({currentCurrency})</label>
                      <input required type="number" className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-4 py-3 outline-none dark:text-white font-black" value={logForm.charges || ''} onChange={e => setLogForm({...logForm, charges: Number(e.target.value)})} />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Date</label>
                      <input required type="date" className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-4 py-3 outline-none dark:text-white font-bold" value={logForm.date} onChange={e => setLogForm({...logForm, date: e.target.value})} />
                    </div>
                  </div>
                </div>
              )}
              <button type="submit" className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-blue-700 transition-all uppercase tracking-[0.2em] text-xs">
                Finalize Log Entry
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const FleetStat = ({ label, value, icon: Icon, color, currency, sub }: any) => (
  <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm group hover:border-blue-300 transition-all relative overflow-hidden">
    <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform relative z-10`}>
      <Icon size={24} />
    </div>
    <div className="relative z-10">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</p>
      <p className="text-3xl font-black dark:text-white">{currency ? `${currency} ` : ''}{Math.abs(value).toLocaleString()}</p>
      <p className="text-[9px] font-bold text-slate-400 uppercase mt-1 tracking-widest">{sub}</p>
    </div>
    <Icon size={120} className="absolute -right-6 -bottom-6 opacity-[0.03] group-hover:rotate-12 transition-transform dark:text-white" />
  </div>
);

const MachineData = ({ label, value, icon: Icon }: any) => (
  <div className="text-center md:text-left">
    <div className="flex items-center gap-1.5 mb-1 justify-center md:justify-start">
      <Icon size={12} className="text-slate-300" />
      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
    </div>
    <p className="text-sm font-black dark:text-slate-100 uppercase">{value}</p>
  </div>
);

const QuickAction = ({ icon: Icon, label, onClick, danger }: any) => (
  <button 
    onClick={onClick}
    className={`flex-1 flex flex-col items-center justify-center p-4 rounded-2xl border transition-all gap-2 ${
      danger 
      ? 'border-red-50 hover:bg-red-50 text-red-500 dark:border-slate-800 dark:hover:bg-red-900/10' 
      : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700 text-slate-400 hover:text-blue-600 hover:border-blue-200'
    }`}
  >
    <Icon size={18} />
    <span className="text-[8px] font-black uppercase tracking-widest text-center">{label}</span>
  </button>
);

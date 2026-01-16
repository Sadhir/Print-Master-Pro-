
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Printer, Plus, Search, Trash2, Edit3, 
  Banknote, History, Wrench, Package, 
  TrendingUp, TrendingDown, Clock, X,
  Activity, ShieldCheck, DollarSign,
  AlertCircle, ChevronRight, Hash, Database,
  ArrowUpCircle, Info
} from 'lucide-react';
import { PaymentMethod, RentalMachinery } from '../types';

export const RentalManagement = () => {
  const { rentalFleet, rentalReadings, rentalPayments, rentalRepairs, addRentalMachine, updateRentalMachine, deleteRentalMachine, addRentalReading, addRentalPayment, addRentalRepair, currentCurrency, currentUser } = useApp();
  const [activeTab, setActiveTab] = useState<'FLEET' | 'READINGS' | 'FINANCE'>('FLEET');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCounterModal, setShowCounterModal] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState<string | null>(null);
  const [showRepairModal, setShowRepairModal] = useState<string | null>(null);

  // Form states
  const [machineForm, setMachineForm] = useState({
    name: '', model: '', serialNumber: '', provider: '',
    depositAmount: 0, totalContractValue: 0, amountPaid: 0,
    monthlyFixedRent: 0, perClickRate: 0.10, initialCounter: 0,
    startDate: new Date().toISOString().split('T')[0],
    nextPaymentDate: '', status: 'ACTIVE' as any,
    tonerStock: 100, drumLifePercent: 100
  });

  const [counterForm, setCounterForm] = useState({ reading: 0 });
  const [paymentForm, setPaymentForm] = useState({ amount: 0, type: 'RENT' as any, method: PaymentMethod.CASH, notes: '' });
  const [repairForm, setRepairForm] = useState({ description: '', cost: 0, technician: '' });

  const totalDeposits = rentalFleet.reduce((a, b) => a + b.depositAmount, 0);
  const totalRemaining = rentalFleet.reduce((a, b) => a + (b.totalContractValue - b.amountPaid), 0);

  const handleAddMachine = (e: React.FormEvent) => {
    e.preventDefault();
    addRentalMachine({ ...machineForm, currentCounter: machineForm.initialCounter });
    setShowAddModal(false);
  };

  const handleCounterUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (showCounterModal) {
      const machine = rentalFleet.find(m => m.id === showCounterModal);
      if (machine) {
        const clicks = counterForm.reading - machine.currentCounter;
        const cost = clicks * machine.perClickRate;
        addRentalReading({
          machineId: machine.id,
          date: new Date().toISOString(),
          reading: counterForm.reading,
          previousReading: machine.currentCounter,
          clicks,
          cost
        });
        setShowCounterModal(null);
        setCounterForm({ reading: 0 });
      }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black dark:text-white uppercase tracking-tight">Rental Fleet & Leasing</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Manage lease contracts, usage counters, and provider settlements.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-blue-100 dark:shadow-none hover:bg-blue-700 transition-all flex items-center gap-2"
        >
          <Plus size={20} /> Onboard Machine
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <RentalStatCard label="Active Fleet" value={rentalFleet.filter(m=>m.status==='ACTIVE').length} sub="Production Units" icon={Printer} color="bg-blue-600" />
        <RentalStatCard label="Lease Deposit Pool" value={totalDeposits} sub="Recoverable Assets" icon={ShieldCheck} color="bg-green-600" currency={currentCurrency} />
        <RentalStatCard label="Outstanding Rent" value={totalRemaining} sub="Fleet Liabilities" icon={Banknote} color="bg-red-50" currency={currentCurrency} />
      </div>

      <div className="flex bg-white dark:bg-slate-900 p-1 rounded-2xl border dark:border-slate-800 w-fit">
        {(['FLEET', 'READINGS', 'FINANCE'] as const).map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'FLEET' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {rentalFleet.length === 0 && (
            <div className="lg:col-span-2 py-32 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[3rem]">
              <Database size={64} className="mx-auto text-slate-200 dark:text-slate-800 mb-4" />
              <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No leased machinery registered</p>
            </div>
          )}
          {rentalFleet.map(machine => (
            <div key={machine.id} className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden group hover:border-blue-300 transition-all relative">
              <div className="p-10 space-y-8">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-5">
                    <div className="p-5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-[2rem]">
                      <Printer size={32} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black dark:text-white uppercase tracking-tight">{machine.name}</h3>
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{machine.provider} • S/N: {machine.serialNumber}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="px-3 py-1 rounded-full bg-green-50 text-green-600 text-[8px] font-black uppercase">{machine.status}</span>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Starts: {machine.startDate}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                  <MachineStat label="Installed Read" value={machine.initialCounter.toLocaleString()} icon={ArrowUpCircle} />
                  <MachineStat label="Current Read" value={machine.currentCounter.toLocaleString()} icon={Activity} />
                  <MachineStat 
                    label="Lifetime Vol." 
                    value={(machine.currentCounter - machine.initialCounter).toLocaleString()} 
                    icon={TrendingUp}
                    highlight 
                  />
                  <MachineStat label="Toner Stock" value={`${machine.tonerStock}%`} icon={Package} />
                  <MachineStat label="Drum Life" value={`${machine.drumLifePercent}%`} icon={Clock} />
                  <MachineStat label="Click Rate" value={`${currentCurrency} ${machine.perClickRate}`} icon={Hash} />
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                      <span>Lease Payment Maturity</span>
                      <span className="text-blue-600">{currentCurrency} {machine.amountPaid.toLocaleString()} / {machine.totalContractValue.toLocaleString()}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 transition-all duration-1000" 
                        style={{ width: `${(machine.amountPaid / machine.totalContractValue) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <FleetAction icon={Activity} label="Read Counter" onClick={() => setShowCounterModal(machine.id)} />
                  <FleetAction icon={DollarSign} label="Log Payment" onClick={() => setShowPaymentModal(machine.id)} />
                  <FleetAction icon={Wrench} label="Log Repair" onClick={() => setShowRepairModal(machine.id)} />
                  <FleetAction icon={Trash2} label="Remove" onClick={() => { if(window.confirm('Terminate lease record?')) deleteRentalMachine(machine.id); }} danger />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'READINGS' && (
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800 border-b dark:border-slate-800 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              <tr>
                <th className="px-8 py-6">Machine / Date</th>
                <th className="px-8 py-6">Previous</th>
                <th className="px-8 py-6">Current Reading</th>
                <th className="px-8 py-6">Units Consumed</th>
                <th className="px-8 py-6 text-right">Click Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-slate-800">
              {rentalReadings.map(read => {
                const machine = rentalFleet.find(m => m.id === read.machineId);
                const isInstallReading = read.reading === machine?.initialCounter && read.clicks === 0;
                
                return (
                  <tr key={read.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-8 py-5">
                      <p className="font-bold dark:text-white uppercase text-xs">{machine?.name}</p>
                      <p className="text-[9px] text-slate-400 font-black uppercase">{new Date(read.date).toLocaleString()}</p>
                    </td>
                    <td className="px-8 py-5 font-medium text-slate-400">
                      {isInstallReading ? 'BASE' : read.previousReading.toLocaleString()}
                    </td>
                    <td className="px-8 py-5 font-black dark:text-white">{read.reading.toLocaleString()}</td>
                    <td className="px-8 py-5">
                      {isInstallReading ? (
                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-400 px-2 py-1 rounded text-[8px] font-black uppercase">Installation Point</span>
                      ) : (
                        <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 px-2 py-1 rounded text-[10px] font-black">{read.clicks.toLocaleString()} CLICKS</span>
                      )}
                    </td>
                    <td className="px-8 py-5 text-right font-black text-blue-600">
                      {isInstallReading ? '---' : `${currentCurrency} ${read.cost.toLocaleString()}`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[250] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-2xl p-10 shadow-2xl border dark:border-slate-800 animate-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black dark:text-white uppercase tracking-tight">Onboard Leased Unit</h2>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full dark:text-white"><X size={24} /></button>
            </div>
            <form onSubmit={handleAddMachine} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Machine Name</label>
                  <input required type="text" className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-bold" value={machineForm.name} onChange={e => setMachineForm({...machineForm, name: e.target.value})} placeholder="e.g. Ricoh Pro C5300" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Provider / Lessor</label>
                  <input required type="text" className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-bold" value={machineForm.provider} onChange={e => setMachineForm({...machineForm, provider: e.target.value})} placeholder="e.g. Apex Office Solutions" />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Deposit ({currentCurrency})</label>
                    <input required type="number" className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-black" value={machineForm.depositAmount || ''} onChange={e => setMachineForm({...machineForm, depositAmount: Number(e.target.value)})} />
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Monthly Fixed</label>
                    <input required type="number" className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-black" value={machineForm.monthlyFixedRent || ''} onChange={e => setMachineForm({...machineForm, monthlyFixedRent: Number(e.target.value)})} />
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Click Rate</label>
                    <input required type="number" step="0.01" className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-black" value={machineForm.perClickRate || ''} onChange={e => setMachineForm({...machineForm, perClickRate: Number(e.target.value)})} />
                 </div>
              </div>

              <div className="p-8 bg-blue-50 dark:bg-blue-900/10 rounded-[2.5rem] border border-blue-100 dark:border-blue-900/50 space-y-6">
                 <div className="flex items-center gap-3">
                    <ArrowUpCircle className="text-blue-600" size={24} />
                    <h3 className="font-black text-sm uppercase tracking-widest text-blue-800 dark:text-blue-300">Installed Hardware Metrics</h3>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2 px-1">Installed Reading (Starting Counter)</label>
                        <input required type="number" className="w-full bg-white dark:bg-slate-900 border dark:border-slate-700 rounded-xl px-4 py-3 outline-none dark:text-white font-black" value={machineForm.initialCounter || ''} onChange={e => setMachineForm({...machineForm, initialCounter: Number(e.target.value)})} placeholder="Counter reading at install" />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2 px-1">Installation Date</label>
                        <input required type="date" className="w-full bg-white dark:bg-slate-900 border dark:border-slate-700 rounded-xl px-4 py-3 outline-none dark:text-white font-bold" value={machineForm.startDate} onChange={e => setMachineForm({...machineForm, startDate: e.target.value})} />
                    </div>
                 </div>
                 <div className="flex items-center gap-3 p-4 bg-white/50 dark:bg-slate-900/50 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                    <Info size={18} className="text-blue-600 shrink-0" />
                    <p className="text-[9px] font-bold text-blue-700 dark:text-blue-300 uppercase leading-relaxed tracking-wider">
                       The 'Installed Reading' is the permanent starting point for tracking total production volume of this unit.
                    </p>
                 </div>
              </div>

              <button type="submit" className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-blue-700 transition-all uppercase tracking-[0.2em] text-xs">
                Authorize Lease Contract
              </button>
            </form>
          </div>
        </div>
      )}

      {showCounterModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[250] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-md p-10 animate-in zoom-in border dark:border-slate-800">
             <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-black dark:text-white uppercase tracking-tight">Record Counter Reading</h2>
                <button onClick={() => setShowCounterModal(null)} className="p-2 hover:bg-slate-100 rounded-full dark:text-white"><X size={24} /></button>
             </div>
             <form onSubmit={handleCounterUpdate} className="space-y-6">
                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">New Meter Reading</label>
                   <input 
                    autoFocus required type="number" 
                    className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-5 outline-none dark:text-white font-black text-3xl text-center" 
                    value={counterForm.reading || ''} 
                    onChange={e => setCounterForm({ reading: Number(e.target.value) })} 
                   />
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 rounded-2xl flex items-center gap-3">
                   <Activity className="text-blue-600" size={20} />
                   <p className="text-[10px] font-bold text-blue-700 dark:text-blue-300 uppercase leading-relaxed">
                     Cost will be calculated based on the difference from previous reading: {rentalFleet.find(m=>m.id===showCounterModal)?.currentCounter.toLocaleString()}
                   </p>
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-blue-700 transition-all uppercase tracking-[0.2em] text-xs">
                   Log Production Volume
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

const RentalStatCard = ({ label, value, sub, icon: Icon, color, currency }: any) => (
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

const MachineStat = ({ label, value, icon: Icon, highlight }: any) => (
  <div className="text-center md:text-left">
    <div className="flex items-center gap-1.5 mb-1 justify-center md:justify-start">
      <Icon size={12} className={highlight ? 'text-blue-500' : 'text-slate-300'} />
      <p className={`text-[8px] font-black uppercase tracking-widest ${highlight ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}>{label}</p>
    </div>
    <p className={`text-sm font-black dark:text-slate-100 uppercase ${highlight ? 'text-blue-600' : ''}`}>{value}</p>
  </div>
);

const FleetAction = ({ icon: Icon, label, onClick, danger }: any) => (
  <button 
    onClick={onClick}
    className={`flex-1 flex flex-col items-center justify-center p-4 rounded-2xl border transition-all gap-2 ${
      danger 
      ? 'border-red-50 hover:bg-red-50 text-red-500 dark:border-slate-800 dark:hover:bg-red-900/10' 
      : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700 text-slate-400 hover:text-blue-600 hover:border-blue-200'
    }`}
  >
    <Icon size={18} />
    <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
  </button>
);


import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Calculator, Beaker, Wrench, Plus, Trash2, 
  TrendingUp, DollarSign, Info, Layers, 
  Percent, Hash, Settings, Edit3, X, Save,
  Zap, Package, CheckCircle2, AlertCircle
} from 'lucide-react';
import { MaterialUnit, Material, ProductionProcess, CostBreakdown } from '../types';

export const CostCalculator = () => {
  const { materials, processes, addMaterial, updateMaterial, deleteMaterial, addProcess, updateProcess, deleteProcess, currentCurrency } = useApp();
  const [activeTab, setActiveTab] = useState<'ESTIMATOR' | 'MATERIALS' | 'PROCESSES'>('ESTIMATOR');
  
  // Modal states
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [editingProcess, setEditingProcess] = useState<ProductionProcess | null>(null);

  // Estimator State
  const [estimate, setEstimate] = useState<{
    materials: Array<{ id: string, qty: number, wastage: number }>,
    processes: Array<{ id: string, units: number }>,
    labor: number,
    markup: number,
    retailPrice: number
  }>({
    materials: [],
    processes: [],
    labor: 0,
    markup: 15, // 15% overhead default
    retailPrice: 0
  });

  const handleAddMaterialToEstimate = () => {
    if (materials.length === 0) {
      alert("Please register materials in the MATERIALS tab first.");
      return;
    }
    setEstimate({
      ...estimate, 
      materials: [...estimate.materials, { 
        id: materials[0].id, 
        qty: 1, 
        wastage: materials[0].defaultWastagePercent 
      }]
    });
  };

  const handleAddProcessToEstimate = () => {
    if (processes.length === 0) {
      alert("Please register processes in the PROCESSES tab first.");
      return;
    }
    setEstimate({
      ...estimate, 
      processes: [...estimate.processes, { id: processes[0].id, units: 1 }]
    });
  };

  const calculateDetailedEstimate = () => {
    let matCostTotal = 0;
    const matBreakdown = estimate.materials.map(em => {
      const mat = materials.find(m => m.id === em.id);
      if (!mat) return null;
      const consumed = em.qty;
      const wastage = consumed * (em.wastage / 100);
      const cost = (consumed + wastage) * mat.costPerUnit;
      matCostTotal += cost;
      return { name: mat.name, cost };
    }).filter(Boolean);

    let procCostTotal = 0;
    const procBreakdown = estimate.processes.map(ep => {
      const proc = processes.find(p => p.id === ep.id);
      if (!proc) return null;
      const cost = ep.units * proc.ratePerUnit;
      procCostTotal += cost;
      return { name: proc.name, cost };
    }).filter(Boolean);

    const subtotal = matCostTotal + procCostTotal + estimate.labor;
    const overheadValue = subtotal * (estimate.markup / 100);
    const totalActualCost = subtotal + overheadValue;

    return { 
      matCostTotal, 
      procCostTotal, 
      totalActualCost, 
      margin: estimate.retailPrice - totalActualCost,
      marginPercent: estimate.retailPrice > 0 ? ((estimate.retailPrice - totalActualCost) / estimate.retailPrice) * 100 : 0
    };
  };

  const results = calculateDetailedEstimate();

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black dark:text-white uppercase tracking-tight">Production Cost Engine</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Define consumable rates and calculate real job profitability.</p>
        </div>
        <div className="flex bg-white dark:bg-slate-900 p-1 rounded-2xl border dark:border-slate-800 shadow-sm overflow-x-auto no-scrollbar">
           {(['ESTIMATOR', 'MATERIALS', 'PROCESSES'] as const).map(tab => (
             <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'}`}
             >
               {tab}
             </button>
           ))}
        </div>
      </div>

      {activeTab === 'ESTIMATOR' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 space-y-8">
              <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-100 dark:border-slate-800 shadow-sm space-y-10">
                 <div className="space-y-6">
                    <div className="flex items-center justify-between">
                       <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Beaker size={16} /> Material Consumption</h3>
                       <button onClick={handleAddMaterialToEstimate} className="text-[10px] font-black text-blue-600 uppercase">+ Add Material</button>
                    </div>
                    <div className="space-y-4">
                       {estimate.materials.map((em, idx) => (
                          <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl">
                             <div className="md:col-span-2">
                                <label className="text-[8px] font-black text-slate-400 uppercase mb-2 block">Material Type</label>
                                <select 
                                   className="w-full bg-white dark:bg-slate-900 border dark:border-slate-700 rounded-xl px-4 py-2 text-xs font-bold dark:text-white"
                                   value={em.id}
                                   onChange={e => {
                                      const newMats = [...estimate.materials];
                                      newMats[idx].id = e.target.value;
                                      newMats[idx].wastage = materials.find(m => m.id === e.target.value)?.defaultWastagePercent || 0;
                                      setEstimate({...estimate, materials: newMats});
                                   }}
                                >
                                   {materials.map(m => <option key={m.id} value={m.id}>{m.name} ({m.unit})</option>)}
                                </select>
                             </div>
                             <div>
                                <label className="text-[8px] font-black text-slate-400 uppercase mb-2 block">Net Qty</label>
                                <input 
                                   type="number" className="w-full bg-white dark:bg-slate-900 border dark:border-slate-700 rounded-xl px-4 py-2 text-xs font-black dark:text-white"
                                   value={em.qty}
                                   onChange={e => {
                                      const newMats = [...estimate.materials];
                                      newMats[idx].qty = Number(e.target.value);
                                      setEstimate({...estimate, materials: newMats});
                                   }}
                                />
                             </div>
                             <div className="flex items-center gap-2">
                                <div className="flex-1">
                                   <label className="text-[8px] font-black text-slate-400 uppercase mb-2 block">Wastage %</label>
                                   <input 
                                      type="number" className="w-full bg-white dark:bg-slate-900 border dark:border-slate-700 rounded-xl px-4 py-2 text-xs font-black dark:text-white"
                                      value={em.wastage}
                                      onChange={e => {
                                         const newMats = [...estimate.materials];
                                         newMats[idx].wastage = Number(e.target.value);
                                         setEstimate({...estimate, materials: newMats});
                                      }}
                                   />
                                </div>
                                <button onClick={() => setEstimate({...estimate, materials: estimate.materials.filter((_, i) => i !== idx)})} className="p-2 text-red-400 hover:text-red-600 transition-colors"><Trash2 size={16}/></button>
                             </div>
                          </div>
                       ))}
                       {estimate.materials.length === 0 && (
                         <div className="text-center py-6 border-2 border-dashed dark:border-slate-800 rounded-2xl">
                           <p className="text-[10px] font-black text-slate-400 uppercase">No materials added to estimate</p>
                         </div>
                       )}
                    </div>
                 </div>

                 <div className="space-y-6">
                    <div className="flex items-center justify-between">
                       <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Wrench size={16} /> Labor & Process Costs</h3>
                       <button onClick={handleAddProcessToEstimate} className="text-[10px] font-black text-blue-600 uppercase">+ Add Process</button>
                    </div>
                    <div className="space-y-4">
                       {estimate.processes.map((ep, idx) => (
                          <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl">
                             <div className="md:col-span-2">
                                <label className="text-[8px] font-black text-slate-400 uppercase mb-2 block">Process Rate</label>
                                <select 
                                   className="w-full bg-white dark:bg-slate-900 border dark:border-slate-700 rounded-xl px-4 py-2 text-xs font-bold dark:text-white"
                                   value={ep.id}
                                   onChange={e => {
                                      const newProcs = [...estimate.processes];
                                      newProcs[idx].id = e.target.value;
                                      setEstimate({...estimate, processes: newProcs});
                                   }}
                                >
                                   {processes.map(p => <option key={p.id} value={p.id}>{p.name} ({p.unit})</option>)}
                                </select>
                             </div>
                             <div>
                                <label className="text-[8px] font-black text-slate-400 uppercase mb-2 block">Units (Hrs/Mtr/Etc)</label>
                                <input 
                                   type="number" className="w-full bg-white dark:bg-slate-900 border dark:border-slate-700 rounded-xl px-4 py-2 text-xs font-black dark:text-white"
                                   value={ep.units}
                                   onChange={e => {
                                      const newProcs = [...estimate.processes];
                                      newProcs[idx].units = Number(e.target.value);
                                      setEstimate({...estimate, processes: newProcs});
                                   }}
                                />
                             </div>
                             <div className="flex justify-end">
                                <button onClick={() => setEstimate({...estimate, processes: estimate.processes.filter((_, i) => i !== idx)})} className="p-2 text-red-400 hover:text-red-600 transition-colors"><Trash2 size={16}/></button>
                             </div>
                          </div>
                       ))}
                       {estimate.processes.length === 0 && (
                         <div className="text-center py-6 border-2 border-dashed dark:border-slate-800 rounded-2xl">
                           <p className="text-[10px] font-black text-slate-400 uppercase">No labor processes added</p>
                         </div>
                       )}
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6 border-t dark:border-slate-800">
                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Fixed Labor ({currentCurrency})</label>
                       <input 
                          type="number" className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-black"
                          value={estimate.labor || ''}
                          onChange={e => setEstimate({...estimate, labor: Number(e.target.value)})}
                          placeholder="0.00"
                       />
                    </div>
                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Overhead Markup (%)</label>
                       <input 
                          type="number" className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-black text-blue-600"
                          value={estimate.markup || ''}
                          onChange={e => setEstimate({...estimate, markup: Number(e.target.value)})}
                          placeholder="15"
                       />
                    </div>
                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Proposed Quote ({currentCurrency})</label>
                       <input 
                          type="number" className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-black text-green-600"
                          value={estimate.retailPrice || ''}
                          onChange={e => setEstimate({...estimate, retailPrice: Number(e.target.value)})}
                          placeholder="Price to Client"
                       />
                    </div>
                 </div>
              </div>
           </div>

           <div className="space-y-8">
              <div className="bg-slate-900 text-white rounded-[3rem] p-10 space-y-10 shadow-2xl relative overflow-hidden group">
                 <div className="relative z-10">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-8">Profitability Matrix</h3>
                    <div className="space-y-8">
                       <div className="flex justify-between items-end border-b border-white/5 pb-6">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Base Production Cost</p>
                          <p className="text-2xl font-black">{currentCurrency} {results.totalActualCost.toLocaleString()}</p>
                       </div>
                       <div className="flex justify-between items-end">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Projected Margin</p>
                          <p className={`text-4xl font-black ${results.margin < 0 ? 'text-red-500' : 'text-green-500'} tracking-tighter`}>
                             {currentCurrency} {results.margin.toLocaleString()}
                          </p>
                       </div>
                       <div className="bg-white/5 rounded-3xl p-6 border border-white/10 flex items-center justify-between">
                          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Net Margin %</p>
                          <p className={`text-xl font-black ${results.marginPercent < 20 ? 'text-amber-500' : 'text-green-400'}`}>{results.marginPercent.toFixed(1)}%</p>
                       </div>
                    </div>
                 </div>
                 <Calculator size={180} className="absolute -right-12 -bottom-12 opacity-[0.03] group-hover:rotate-12 transition-transform" />
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border dark:border-slate-800 shadow-sm">
                 <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Cost Distribution</h4>
                 <div className="space-y-4">
                    <CostBar label="Materials" value={results.matCostTotal} total={results.totalActualCost} color="bg-blue-600" />
                    <CostBar label="Processes" value={results.procCostTotal} total={results.totalActualCost} color="bg-purple-500" />
                    <CostBar label="Labor" value={estimate.labor} total={results.totalActualCost} color="bg-orange-500" />
                    <CostBar label="Overhead" value={results.totalActualCost - (results.matCostTotal + results.procCostTotal + estimate.labor)} total={results.totalActualCost} color="bg-slate-400" />
                 </div>
                 <div className="mt-10 p-6 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30 flex gap-4">
                    <Info size={20} className="text-blue-600 shrink-0" />
                    <p className="text-[9px] font-bold text-blue-700 dark:text-blue-300 leading-relaxed uppercase tracking-wider">
                       This tool allows you to simulate "What-if" scenarios for high-volume jobs before finalizing a client quote.
                    </p>
                 </div>
              </div>
           </div>
        </div>
      )}

      {(activeTab === 'MATERIALS' || activeTab === 'PROCESSES') && (
         <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-8 border-b dark:border-slate-800 flex items-center justify-between">
               <h2 className="text-xl font-black dark:text-white uppercase tracking-tight">
                  {activeTab === 'MATERIALS' ? 'Raw Materials & Consumables' : 'Labor & Machine Processing Rates'}
               </h2>
               <button 
                  onClick={() => activeTab === 'MATERIALS' ? setShowMaterialModal(true) : setShowProcessModal(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2"
               >
                  <Plus size={16} /> Register {activeTab === 'MATERIALS' ? 'Material' : 'Process'}
               </button>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800 border-b dark:border-slate-800 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                     <tr>
                        <th className="px-8 py-6">Name</th>
                        <th className="px-8 py-6">Unit</th>
                        <th className="px-8 py-6">Cost / Unit</th>
                        {activeTab === 'MATERIALS' && <th className="px-8 py-6">Default Wastage</th>}
                        <th className="px-8 py-6 text-right">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y dark:divide-slate-800">
                     {(activeTab === 'MATERIALS' ? materials : processes).map((item: any) => (
                        <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                           <td className="px-8 py-5">
                              <p className="font-bold dark:text-white uppercase text-sm tracking-tight">{item.name}</p>
                           </td>
                           <td className="px-8 py-5">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.unit}</span>
                           </td>
                           <td className="px-8 py-5">
                              <p className="font-black text-blue-600">{currentCurrency} {(activeTab === 'MATERIALS' ? item.costPerUnit : item.ratePerUnit).toLocaleString()}</p>
                           </td>
                           {activeTab === 'MATERIALS' && (
                              <td className="px-8 py-5 text-xs text-slate-400 font-bold uppercase">
                                 {item.defaultWastagePercent}% Margin
                              </td>
                           )}
                           <td className="px-8 py-5 text-right">
                              <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                 <button onClick={() => {
                                    if(activeTab === 'MATERIALS') { setEditingMaterial(item); setShowMaterialModal(true); }
                                    else { setEditingProcess(item); setShowProcessModal(true); }
                                 }} className="p-2 text-slate-400 hover:text-blue-600"><Edit3 size={16} /></button>
                                 <button onClick={() => {
                                    if(activeTab === 'MATERIALS') { if(window.confirm('Remove material?')) deleteMaterial(item.id); }
                                    else { if(window.confirm('Remove process?')) deleteProcess(item.id); }
                                 }} className="p-2 text-slate-400 hover:text-red-500"><Trash2 size={16} /></button>
                              </div>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      )}

      {/* Material Modal */}
      {showMaterialModal && (
         <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[250] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-lg p-10 shadow-2xl border dark:border-slate-800 animate-in zoom-in duration-300">
               <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-black dark:text-white uppercase tracking-tight">{editingMaterial ? 'Update Material' : 'Register New Material'}</h2>
                  <button onClick={() => setShowMaterialModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full dark:text-white"><X size={24} /></button>
               </div>
               <MaterialForm 
                  initialData={editingMaterial} 
                  onSubmit={(m) => {
                     if(editingMaterial) updateMaterial(editingMaterial.id, m);
                     else addMaterial(m);
                     setShowMaterialModal(false);
                     setEditingMaterial(null);
                  }}
                  currency={currentCurrency}
               />
            </div>
         </div>
      )}

      {/* Process Modal */}
      {showProcessModal && (
         <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[250] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-lg p-10 shadow-2xl border dark:border-slate-800 animate-in zoom-in duration-300">
               <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-black dark:text-white uppercase tracking-tight">{editingProcess ? 'Update Rate' : 'Register Process Rate'}</h2>
                  <button onClick={() => setShowProcessModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full dark:text-white"><X size={24} /></button>
               </div>
               <ProcessForm 
                  initialData={editingProcess}
                  onSubmit={(p) => {
                     if(editingProcess) updateProcess(editingProcess.id, p);
                     else addProcess(p);
                     setShowProcessModal(false);
                     setEditingProcess(null);
                  }}
                  currency={currentCurrency}
               />
            </div>
         </div>
      )}
    </div>
  );
};

const CostBar = ({ label, value, total, color }: any) => (
   <div className="space-y-1.5">
      <div className="flex justify-between text-[8px] font-black uppercase text-slate-400 tracking-widest">
         <span>{label}</span>
         <span>{total > 0 ? ((value / total) * 100).toFixed(0) : 0}%</span>
      </div>
      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
         <div className={`h-full ${color}`} style={{ width: `${total > 0 ? (value / total) * 100 : 0}%` }}></div>
      </div>
   </div>
);

const MaterialForm = ({ initialData, onSubmit, currency }: any) => {
   const [form, setForm] = useState(initialData || { name: '', unit: MaterialUnit.SHEETS, costPerUnit: 0, currentStock: 0, minThreshold: 10, defaultWastagePercent: 5 });
   return (
      <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-6">
         <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Material Name</label>
            <input required type="text" className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-bold" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Flex Material (Matte)" />
         </div>
         <div className="grid grid-cols-2 gap-4">
            <div>
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Unit Type</label>
               <select className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-bold" value={form.unit} onChange={e => setForm({...form, unit: e.target.value})}>
                  {Object.values(MaterialUnit).map(u => <option key={u} value={u}>{u}</option>)}
               </select>
            </div>
            <div>
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Cost / Unit ({currency})</label>
               <input required type="number" step="0.01" className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-black" value={form.costPerUnit || ''} onChange={e => setForm({...form, costPerUnit: Number(e.target.value)})} />
            </div>
         </div>
         <div className="grid grid-cols-2 gap-4">
            <div>
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Safety Wastage %</label>
               <input required type="number" className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-black" value={form.defaultWastagePercent || ''} onChange={e => setForm({...form, defaultWastagePercent: Number(e.target.value)})} />
            </div>
            <div>
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Current Inventory</label>
               <input required type="number" className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-black" value={form.currentStock || ''} onChange={e => setForm({...form, currentStock: Number(e.target.value)})} />
            </div>
         </div>
         <button type="submit" className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-blue-700 transition-all uppercase tracking-[0.2em] text-xs">
            {initialData ? 'Update Material' : 'Authorize Consumption Rate'}
         </button>
      </form>
   );
};

const ProcessForm = ({ initialData, onSubmit, currency }: any) => {
   const [form, setForm] = useState(initialData || { name: '', unit: 'HOUR', ratePerUnit: 0 });
   return (
      <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-6">
         <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Process / Labor Name</label>
            <input required type="text" className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-bold" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Manual Creasing" />
         </div>
         <div className="grid grid-cols-2 gap-4">
            <div>
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Rate Applied By</label>
               <select className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-bold" value={form.unit} onChange={e => setForm({...form, unit: e.target.value})}>
                  {['HOUR', 'JOB', 'METER', 'CLICK', 'PIECE'].map(u => <option key={u} value={u}>{u}</option>)}
               </select>
            </div>
            <div>
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Rate / Unit ({currency})</label>
               <input required type="number" step="0.01" className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-black text-blue-600" value={form.ratePerUnit || ''} onChange={e => setForm({...form, ratePerUnit: Number(e.target.value)})} />
            </div>
         </div>
         <button type="submit" className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-blue-700 transition-all uppercase tracking-[0.2em] text-xs">
            {initialData ? 'Update Process' : 'Register Production Rate'}
         </button>
      </form>
   );
};


import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Users, Clock, DollarSign, Plus, CheckCircle2, XCircle, 
  Calendar, Briefcase, History, MoreHorizontal, UserCheck, Banknote,
  Hourglass, Zap, ClipboardList, AlertCircle, Trash2, Send, Copy, Share2
} from 'lucide-react';
import { UserRole, DutyStatus, OrderSource } from '../types';

export const StaffManagement = () => {
  const { staff, duties, attendance, transactions, addDuty, updateDuty, updateStaffAdvance, clockInOut, currentCurrency, currentUser } = useApp();
  const [activeTab, setActiveTab] = useState<'ROSTER' | 'DUTIES' | 'ATTENDANCE' | 'PAYROLL' | 'SUMMARY'>('ROSTER');
  const [showAdvanceModal, setShowAdvanceModal] = useState<string | null>(null);
  const [advanceAmount, setAdvanceAmount] = useState(0);
  
  const [showDutyModal, setShowDutyModal] = useState(false);
  const [dutyForm, setDutyForm] = useState({
    staffId: staff[0]?.id || '',
    task: '',
    deadline: ''
  });

  const [cancelModal, setCancelModal] = useState<string | null>(null);
  const [cancelNote, setCancelNote] = useState('');

  const isAdmin = currentUser.role === UserRole.ADMIN;

  const handleAdvance = (e: React.FormEvent) => {
    e.preventDefault();
    if (showAdvanceModal && advanceAmount > 0) {
      updateStaffAdvance(showAdvanceModal, advanceAmount);
      setShowAdvanceModal(null);
      setAdvanceAmount(0);
    }
  };

  const handleAddDuty = (e: React.FormEvent) => {
    e.preventDefault();
    addDuty({
      ...dutyForm,
      status: DutyStatus.PENDING,
      assignedBy: currentUser.name
    });
    setShowDutyModal(false);
    setDutyForm({ staffId: staff[0]?.id || '', task: '', deadline: '' });
  };

  const handleDutyCancel = () => {
    if (cancelModal) {
      updateDuty(cancelModal, { status: DutyStatus.CANCELLED, cancellationNote: cancelNote });
      setCancelModal(null);
      setCancelNote('');
    }
  };

  const generateSummaryText = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayDuties = duties.filter(d => d.createdAt.startsWith(today) || d.deadline.startsWith(today));
    const todayAttendance = attendance.filter(a => a.date === today);

    let summary = `*END OF DAY STAFF SUMMARY - ${today}*\n\n`;
    
    staff.forEach(s => {
      const sDuties = todayDuties.filter(d => d.staffId === s.id);
      const sAttend = todayAttendance.find(a => a.staffId === s.id);
      const completed = sDuties.filter(d => d.status === DutyStatus.COMPLETED).length;
      const total = sDuties.length;
      
      summary += `👤 *${s.name}* (${s.designation})\n`;
      summary += `🕒 Status: ${sAttend ? 'Checked In' : 'Not Recorded'}\n`;
      summary += `✅ Tasks: ${completed}/${total} completed\n`;
      if (sDuties.length > 0) {
        sDuties.forEach(d => {
          summary += `  - ${d.task} [${d.status}]\n`;
        });
      }
      summary += `\n`;
    });

    return summary;
  };

  const copySummary = () => {
    navigator.clipboard.writeText(generateSummaryText());
    alert("Summary copied to clipboard for WhatsApp sharing!");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold dark:text-white uppercase tracking-tight">Staff & HR Management</h1>
          <p className="text-slate-500 dark:text-slate-400">Track working hours, commissions, and generate monthly payroll.</p>
        </div>
        <div className="flex gap-3">
          {isAdmin && (
            <button 
              onClick={() => { setActiveTab('DUTIES'); setShowDutyModal(true); }}
              className="bg-blue-600 px-6 py-3 rounded-xl font-black text-white shadow-lg hover:bg-blue-700 transition-all uppercase tracking-widest text-xs flex items-center gap-2"
            >
              <Plus size={18} /> Assign Duty
            </button>
          )}
          <button className="bg-white dark:bg-slate-900 border dark:border-slate-800 px-6 py-3 rounded-xl font-bold text-sm dark:text-white flex items-center gap-2">
            <Calendar size={18} /> Manage Leaves
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard label="Active Staff" value={staff.length} icon={Users} color="bg-blue-600" />
        <StatCard label="On Duty Now" value={staff.filter(s=>s.onDuty).length} icon={Zap} color="bg-yellow-500" />
        <StatCard label="Total Salary Pool" value={`${currentCurrency} 125k`} icon={Banknote} color="bg-green-600" />
        <StatCard label="Pending Advances" value={`${currentCurrency} 8.4k`} icon={Hourglass} color="bg-red-500" />
      </div>

      <div className="flex bg-white dark:bg-slate-900 p-1 rounded-2xl border dark:border-slate-800 w-fit overflow-x-auto">
        {['ROSTER', 'DUTIES', 'ATTENDANCE', 'PAYROLL', 'SUMMARY'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all whitespace-nowrap ${activeTab === tab ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'}`}
          >
            {tab.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {activeTab === 'ROSTER' && staff.map(member => (
          <div key={member.id} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-8 group">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-xl text-blue-600">
                  {member.name[0]}
                </div>
                <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-white dark:border-slate-900 ${member.onDuty ? 'bg-green-500' : 'bg-slate-300'}`}></div>
              </div>
              <div>
                <h3 className="text-xl font-black dark:text-white">{member.name}</h3>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{member.designation}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 flex-1 max-w-2xl">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Base Salary</p>
                <p className="font-bold dark:text-white">{currentCurrency} {member.baseSalary.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Commission</p>
                <p className="font-bold text-blue-600">{member.commissionRate}%</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Adv. Taken</p>
                <p className="font-bold text-red-500">{currentCurrency} {member.totalAdvances.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Clock In/Out</p>
                <button 
                  onClick={() => clockInOut(member.id)}
                  className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${member.onDuty ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}
                >
                  {member.onDuty ? 'Finish Duty' : 'Start Duty'}
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              {isAdmin && (
                <button 
                  onClick={() => setShowAdvanceModal(member.id)}
                  className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-600 rounded-2xl hover:bg-red-50 hover:text-red-600 transition-colors"
                  title="Pay Advance"
                >
                  <DollarSign size={20} />
                </button>
              )}
              <button className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-600 rounded-2xl hover:bg-blue-50 hover:text-blue-600 transition-colors">
                <History size={20} />
              </button>
              <button className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-600 rounded-2xl">
                <MoreHorizontal size={20} />
              </button>
            </div>
          </div>
        ))}

        {activeTab === 'DUTIES' && (
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b dark:border-slate-800 flex items-center justify-between">
              <h2 className="font-black text-lg uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <ClipboardList size={20} /> Staff Task Roster
              </h2>
            </div>
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 border-b dark:border-slate-800 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                <tr>
                  <th className="px-8 py-6">Staff Member</th>
                  <th className="px-8 py-6">Task Description</th>
                  <th className="px-8 py-6">Deadline</th>
                  <th className="px-8 py-6">Status</th>
                  <th className="px-8 py-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-slate-800">
                {duties.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-slate-400">No duties assigned yet.</td>
                  </tr>
                )}
                {duties.map(duty => {
                  const member = staff.find(s => s.id === duty.staffId);
                  return (
                    <tr key={duty.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-8 py-5">
                         <p className="font-bold dark:text-white">{member?.name || 'Unknown'}</p>
                         <p className="text-[10px] text-slate-400 uppercase">By {duty.assignedBy}</p>
                      </td>
                      <td className="px-8 py-5">
                        <p className="text-sm dark:text-slate-300 font-medium">{duty.task}</p>
                        {duty.status === DutyStatus.CANCELLED && (
                          <p className="text-[10px] text-red-500 font-bold italic mt-1">Note: {duty.cancellationNote}</p>
                        )}
                      </td>
                      <td className="px-8 py-5 text-sm text-slate-500">
                        {new Date(duty.deadline).toLocaleString()}
                      </td>
                      <td className="px-8 py-5">
                        <span className={`px-2 py-1 rounded-full text-[8px] font-black uppercase ${
                          duty.status === DutyStatus.COMPLETED ? 'bg-green-100 text-green-700' :
                          duty.status === DutyStatus.CANCELLED ? 'bg-red-100 text-red-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {duty.status}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {duty.status === DutyStatus.PENDING && (
                            <>
                              <button 
                                onClick={() => updateDuty(duty.id, { status: DutyStatus.COMPLETED })}
                                className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100" 
                                title="Mark Completed"
                              >
                                <CheckCircle2 size={16} />
                              </button>
                              <button 
                                onClick={() => setCancelModal(duty.id)}
                                className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100" 
                                title="Cancel Duty"
                              >
                                <XCircle size={16} />
                              </button>
                            </>
                          )}
                          <button className="p-2 text-slate-400 hover:text-slate-600"><MoreHorizontal size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'SUMMARY' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
               <h2 className="font-black text-xl dark:text-white uppercase tracking-tight">End of Day Reporting</h2>
               <button 
                onClick={copySummary}
                className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg"
               >
                 <Copy size={18} /> Copy WhatsApp Report
               </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {staff.map(member => {
                 const today = new Date().toISOString().split('T')[0];
                 const memberDuties = duties.filter(d => d.staffId === member.id && (d.createdAt.startsWith(today) || d.deadline.startsWith(today)));
                 const memberAttend = attendance.find(a => a.staffId === member.id && a.date === today);
                 const memberSales = transactions.filter(t => t.staffId === member.id && t.timestamp.startsWith(today));
                 const totalSales = memberSales.reduce((acc, t) => acc + t.amount, 0);

                 return (
                   <div key={member.id} className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
                      <div className="flex items-center justify-between mb-6">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center font-black text-blue-600">
                               {member.name[0]}
                            </div>
                            <div>
                               <h3 className="font-black dark:text-white uppercase tracking-widest text-sm">{member.name}</h3>
                               <p className="text-[10px] text-slate-400 font-bold uppercase">{member.designation}</p>
                            </div>
                         </div>
                         {memberAttend ? (
                           <span className="bg-green-50 text-green-600 text-[8px] font-black px-2 py-1 rounded-full">PRESENT</span>
                         ) : (
                           <span className="bg-slate-50 text-slate-400 text-[8px] font-black px-2 py-1 rounded-full">OFF-DUTY</span>
                         )}
                      </div>

                      <div className="space-y-6">
                         <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Today's Tasks</p>
                            <div className="space-y-2">
                               {memberDuties.map(d => (
                                 <div key={d.id} className="flex items-center justify-between text-xs font-bold p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border dark:border-slate-800">
                                    <span className="dark:text-slate-300">{d.task}</span>
                                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${d.status === DutyStatus.COMPLETED ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                       {d.status}
                                    </span>
                                 </div>
                               ))}
                               {memberDuties.length === 0 && <p className="text-xs text-slate-400 font-medium italic">No tasks assigned today.</p>}
                            </div>
                         </div>

                         <div className="pt-4 border-t dark:border-slate-800 grid grid-cols-2 gap-4">
                            <div>
                               <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Sales Handled</p>
                               <p className="text-lg font-black text-blue-600">{currentCurrency} {totalSales.toLocaleString()}</p>
                            </div>
                            <div>
                               <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Clock In</p>
                               <p className="text-lg font-black text-slate-700 dark:text-slate-200">
                                 {memberAttend ? new Date(memberAttend.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                               </p>
                            </div>
                         </div>
                      </div>
                   </div>
                 );
               })}
            </div>
          </div>
        )}

        {activeTab === 'ATTENDANCE' && (
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border dark:border-slate-800 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 border-b dark:border-slate-800 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                <tr>
                  <th className="px-8 py-6">Staff Name</th>
                  <th className="px-8 py-6">Date</th>
                  <th className="px-8 py-6">Clock In</th>
                  <th className="px-8 py-6">Clock Out</th>
                  <th className="px-8 py-6">OT Hours</th>
                  <th className="px-8 py-6 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-slate-800">
                {attendance.length === 0 ? (
                   <tr><td colSpan={6} className="text-center py-12 text-slate-400 uppercase font-black text-[10px] tracking-widest">No attendance records found.</td></tr>
                ) : (
                  attendance.map(record => {
                    const member = staff.find(s => s.id === record.staffId);
                    return (
                      <AttendanceRow 
                        key={record.id}
                        name={member?.name || 'Unknown'} 
                        date={record.date} 
                        in={new Date(record.clockIn).toLocaleTimeString()} 
                        out={record.clockOut ? new Date(record.clockOut).toLocaleTimeString() : '---'} 
                        ot={record.extraHours} 
                        status={record.status} 
                      />
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Advance Modal */}
      {showAdvanceModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-md p-10 animate-in zoom-in">
             <h2 className="text-2xl font-black mb-6 dark:text-white uppercase tracking-tight text-center">Release Advance</h2>
             <form onSubmit={handleAdvance} className="space-y-6">
                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Advance Amount ({currentCurrency})</label>
                   <input 
                    type="number" 
                    className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-black text-2xl" 
                    value={advanceAmount || ''}
                    onChange={e => setAdvanceAmount(Number(e.target.value))}
                    required
                   />
                </div>
                <div className="flex gap-4">
                   <button type="button" onClick={() => setShowAdvanceModal(null)} className="flex-1 py-4 font-bold text-slate-500 uppercase tracking-widest text-[10px]">Cancel</button>
                   <button type="submit" className="flex-1 bg-red-600 text-white font-black py-4 rounded-2xl shadow-lg hover:bg-red-700 transition-all uppercase tracking-[0.2em] text-[10px]">Release Funds</button>
                </div>
             </form>
          </div>
        </div>
      )}

      {/* Duty Assignment Modal */}
      {showDutyModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-lg p-10 animate-in zoom-in border dark:border-slate-800">
             <h2 className="text-2xl font-black mb-6 dark:text-white uppercase tracking-tight text-center">Assign New Duty</h2>
             <form onSubmit={handleAddDuty} className="space-y-6">
                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Assign To Staff</label>
                   <select 
                    className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-bold"
                    value={dutyForm.staffId}
                    onChange={e => setDutyForm({...dutyForm, staffId: e.target.value})}
                    required
                   >
                     {staff.map(s => <option key={s.id} value={s.id}>{s.name} ({s.designation})</option>)}
                   </select>
                </div>
                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Task Description</label>
                   <textarea 
                    className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-medium"
                    value={dutyForm.task}
                    onChange={e => setDutyForm({...dutyForm, task: e.target.value})}
                    rows={3}
                    placeholder="Describe the duty to be completed..."
                    required
                   />
                </div>
                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Completion Deadline</label>
                   <input 
                    type="datetime-local" 
                    className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-bold"
                    value={dutyForm.deadline}
                    onChange={e => setDutyForm({...dutyForm, deadline: e.target.value})}
                    required
                   />
                </div>
                <div className="flex gap-4">
                   <button type="button" onClick={() => setShowDutyModal(false)} className="flex-1 py-4 font-bold text-slate-500 uppercase tracking-widest text-[10px]">Discard</button>
                   <button type="submit" className="flex-1 bg-blue-600 text-white font-black py-4 rounded-2xl shadow-lg hover:bg-blue-700 transition-all uppercase tracking-[0.2em] text-[10px]">Assign Now</button>
                </div>
             </form>
          </div>
        </div>
      )}

      {/* Duty Cancellation Modal */}
      {cancelModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-md p-10 animate-in zoom-in border dark:border-slate-800">
             <div className="flex items-center gap-3 text-red-600 mb-6">
                <AlertCircle size={24} />
                <h2 className="text-2xl font-black uppercase tracking-tight">Cancel Duty</h2>
             </div>
             <p className="text-sm text-slate-500 mb-6">Please provide a reason for cancelling this task. This will be visible to the Admin.</p>
             <div className="space-y-6">
                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Cancellation Reason</label>
                   <textarea 
                    className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-medium"
                    value={cancelNote}
                    onChange={e => setCancelNote(e.target.value)}
                    rows={3}
                    placeholder="e.g., Equipment failure, Client retracted request..."
                    required
                   />
                </div>
                <div className="flex gap-4">
                   <button type="button" onClick={() => setCancelModal(null)} className="flex-1 py-4 font-bold text-slate-500 uppercase tracking-widest text-[10px]">Back</button>
                   <button 
                    onClick={handleDutyCancel}
                    className="flex-1 bg-red-600 text-white font-black py-4 rounded-2xl shadow-lg hover:bg-red-700 transition-all uppercase tracking-[0.2em] text-[10px]"
                   >
                    Confirm Cancellation
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value, icon: Icon, color }: any) => (
  <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
    <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center text-white mb-4`}>
      <Icon size={24} />
    </div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</p>
    <p className="text-2xl font-black dark:text-white">{value}</p>
  </div>
);

const AttendanceRow = ({ name, date, in: clockIn, out: clockOut, ot, status }: any) => (
  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
    <td className="px-8 py-5 font-bold dark:text-white">{name}</td>
    <td className="px-8 py-5 text-sm text-slate-500">{date}</td>
    <td className="px-8 py-5 text-sm font-bold text-green-600">{clockIn}</td>
    <td className="px-8 py-5 text-sm font-bold text-blue-600">{clockOut}</td>
    <td className="px-8 py-5 text-sm font-black text-purple-600">{ot} hrs</td>
    <td className="px-8 py-5 text-right">
      <span className="bg-green-100 text-green-700 text-[8px] font-black px-2 py-1 rounded-full">{status}</span>
    </td>
  </tr>
);

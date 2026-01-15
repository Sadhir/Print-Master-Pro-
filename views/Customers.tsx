
import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  UserPlus, Search, MessageCircle, Phone, Mail, History, 
  Download, Upload, X, Trash2, Building, Edit3, DollarSign, 
  FileText, CheckCircle2, Globe, FileSpreadsheet, Smartphone, 
  Mail as GmailIcon, ArrowRight, AlertCircle, FileCode,
  Cake, Calendar
} from 'lucide-react';
import { UserRole, JobStatus } from '../types';
import * as XLSX from 'xlsx';

export const Customers = () => {
  const { customers, jobs, transactions, addCustomer, updateCustomer, importCustomers, currentUser, deleteCustomer, currentCurrency } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [showImportWizard, setShowImportWizard] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [historyCustomer, setHistoryCustomer] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  
  // Wizard States
  const [wizardStep, setWizardStep] = useState<'SOURCE' | 'PREVIEW'>('SOURCE');
  const [previewContacts, setPreviewContacts] = useState<Array<{ name: string, phone: string, email?: string }>>([]);
  const [importLoading, setImportLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAdmin = currentUser.role === UserRole.ADMIN;

  const [form, setForm] = useState({
    name: '',
    businessName: '',
    phone: '',
    email: '',
    address: '',
    birthday: ''
  });

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  const isBirthdayToday = (dateStr?: string) => {
    if (!dateStr) return false;
    const today = new Date();
    const bday = new Date(dateStr);
    return today.getDate() === bday.getDate() && today.getMonth() === bday.getMonth();
  };

  // --- PARSERS ---

  const parseVCF = (text: string) => {
    const contacts: any[] = [];
    const entries = text.split('BEGIN:VCARD');
    entries.forEach(entry => {
      const nameMatch = entry.match(/FN:(.*)/);
      const telMatch = entry.match(/TEL.*:(.*)/);
      if (nameMatch && telMatch) {
        contacts.push({
          name: nameMatch[1].trim(),
          phone: telMatch[1].replace(/[^\d+]/g, '').trim(),
        });
      }
    });
    return contacts;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportLoading(true);
    const fileName = file.name.toLowerCase();

    try {
      if (fileName.endsWith('.vcf')) {
        const text = await file.text();
        const results = parseVCF(text);
        setPreviewContacts(results);
        setWizardStep('PREVIEW');
      } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        
        // Assume column 0 is name, column 1 is phone
        const results = json.slice(1).map(row => ({
          name: String(row[0] || '').trim(),
          phone: String(row[1] || '').replace(/[^\d+]/g, '').trim(),
          email: row[2] ? String(row[2]).trim() : undefined
        })).filter(c => c.name && c.phone);
        
        setPreviewContacts(results);
        setWizardStep('PREVIEW');
      } else if (fileName.endsWith('.csv')) {
        const text = await file.text();
        const lines = text.split('\n');
        const results = lines.slice(1).map(line => {
          const parts = line.split(',');
          return {
            name: parts[0]?.trim(),
            phone: parts[1]?.replace(/[^\d+]/g, '').trim(),
            email: parts[2]?.trim()
          };
        }).filter(c => c.name && c.phone);
        
        setPreviewContacts(results);
        setWizardStep('PREVIEW');
      }
    } catch (err) {
      alert("Error parsing file. Please check format.");
    } finally {
      setImportLoading(false);
    }
  };

  const handleMobileImport = async () => {
    // Check if Contact Picker API is available
    if ('contacts' in navigator && 'select' in (navigator as any).contacts) {
      try {
        const props = ['name', 'tel'];
        const opts = { multiple: true };
        const contacts = await (navigator as any).contacts.select(props, opts);
        
        const results = contacts.map((c: any) => ({
          name: c.name[0],
          phone: c.tel[0].replace(/[^\d+]/g, ''),
        }));

        setPreviewContacts(results);
        setWizardStep('PREVIEW');
      } catch (err) {
        console.error("Mobile contact picker error:", err);
      }
    } else {
      alert("Mobile Contact Picker is not supported in this browser. Please try Excel or VCF import.");
    }
  };

  const handleGmailImport = () => {
    // Simulated Google People API flow
    setImportLoading(true);
    setTimeout(() => {
      setPreviewContacts([
        { name: 'Gmail Contact 1', phone: '+123456789', email: 'c1@gmail.com' },
        { name: 'Gmail Contact 2', phone: '+987654321', email: 'c2@gmail.com' },
      ]);
      setWizardStep('PREVIEW');
      setImportLoading(false);
    }, 1500);
  };

  const finalizeImport = () => {
    importCustomers(previewContacts);
    setShowImportWizard(false);
    setWizardStep('SOURCE');
    setPreviewContacts([]);
  };

  // --- CRUD HANDLERS ---

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      updateCustomer(isEditing, form);
    } else {
      addCustomer(form);
    }
    setShowModal(false);
    setIsEditing(null);
    setForm({ name: '', businessName: '', phone: '', email: '', address: '', birthday: '' });
  };

  const handleEdit = (customer: any) => {
    setForm({
      name: customer.name,
      businessName: customer.businessName || '',
      phone: customer.phone,
      email: customer.email,
      address: customer.address || '',
      birthday: customer.birthday || ''
    });
    setIsEditing(customer.id);
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold dark:text-white uppercase tracking-tight">Customer CRM</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage client profiles and view detailed job/payment histories.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => { setWizardStep('SOURCE'); setShowImportWizard(true); }}
            className="flex items-center gap-2 bg-white dark:bg-slate-800 px-6 py-3 rounded-xl font-bold text-slate-700 dark:text-slate-200 border dark:border-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Upload size={20} /> Import Contacts
          </button>
          <button 
            onClick={() => { setIsEditing(null); setForm({ name: '', businessName: '', phone: '', email: '', address: '', birthday: '' }); setShowModal(true); }}
            className="flex items-center gap-2 bg-blue-600 px-6 py-3 rounded-xl font-bold text-white shadow-lg shadow-blue-100 dark:shadow-none hover:bg-blue-700 transition-colors"
          >
            <UserPlus size={20} /> Add Client
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-3 transition-colors">
        <Search className="text-slate-400 dark:text-slate-500" />
        <input 
          type="text" 
          placeholder="Search by client name, business, or phone..." 
          className="flex-1 outline-none bg-transparent dark:text-white dark:placeholder:text-slate-600"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(customer => {
          const customerJobs = jobs.filter(j => j.customerId === customer.id);
          const hasBirthday = isBirthdayToday(customer.birthday);
          
          return (
            <div key={customer.id} className={`group bg-white dark:bg-slate-900 rounded-[2.5rem] border ${hasBirthday ? 'border-pink-300 dark:border-pink-800 ring-2 ring-pink-50 dark:ring-pink-900/20' : 'border-slate-100 dark:border-slate-800'} shadow-sm overflow-hidden hover:shadow-md transition-all relative`}>
              {hasBirthday && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400 animate-pulse"></div>
              )}
              <div className="absolute top-4 right-4 flex gap-2">
                <button 
                  onClick={() => handleEdit(customer)}
                  className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  title="Edit Client"
                >
                  <Edit3 size={16} />
                </button>
                {isAdmin && (
                  <button 
                    onClick={() => { if(window.confirm(`Delete ${customer.name}? This will not delete their history.`)) deleteCustomer(customer.id); }}
                    className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    title="Delete Client"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              <div className="p-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-14 h-14 rounded-3xl ${hasBirthday ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-600' : 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'} flex items-center justify-center font-black text-xl transition-all`}>
                    {hasBirthday ? <Cake size={24} /> : customer.name[0]}
                  </div>
                  <div>
                    <h3 className="font-black text-xl dark:text-white leading-tight flex items-center gap-2">
                      {customer.name}
                      {hasBirthday && <span className="w-2 h-2 rounded-full bg-pink-500 animate-ping"></span>}
                    </h3>
                    {customer.businessName && (
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1">
                        <Building size={10} /> {customer.businessName}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-sm">
                    <Phone size={16} className="text-slate-300" /> {customer.phone}
                  </div>
                  <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-sm">
                    <Calendar size={16} className="text-slate-300" /> {customer.birthday || 'No birthday set'}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl mb-6 border dark:border-slate-800">
                  <div className="text-center flex-1">
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest mb-1">Total Jobs</p>
                    <p className="font-black text-lg text-slate-700 dark:text-slate-200">{customerJobs.length}</p>
                  </div>
                  <div className="w-px h-10 bg-slate-200 dark:bg-slate-700"></div>
                  <div className="text-center flex-1">
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest mb-1">Active</p>
                    <p className="font-black text-lg text-blue-600 dark:text-blue-400">{customerJobs.filter(j => j.status !== 'DELIVERED').length}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => window.open(`https://wa.me/${customer.phone}`, '_blank')}
                    className={`flex items-center justify-center gap-2 ${hasBirthday ? 'bg-pink-600 hover:bg-pink-700' : 'bg-green-600 hover:bg-green-700'} text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-md`}
                  >
                    {hasBirthday ? <Cake size={14} /> : <MessageCircle size={14} />} 
                    {hasBirthday ? 'Wish B\'day' : 'WhatsApp'}
                  </button>
                  <button 
                    onClick={() => setHistoryCustomer(customer.id)}
                    className="flex items-center justify-center gap-2 bg-slate-900 dark:bg-slate-800 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all"
                  >
                    <History size={14} /> Jobs
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Import Wizard Modal */}
      {showImportWizard && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[110] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-2xl max-h-[85vh] shadow-2xl border dark:border-slate-800 overflow-hidden animate-in zoom-in duration-300 flex flex-col">
            <div className="p-8 border-b dark:border-slate-800 flex items-center justify-between">
               <div>
                  <h2 className="text-2xl font-black dark:text-white uppercase tracking-tight">Import Magic</h2>
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Add clients from external sources</p>
               </div>
               <button onClick={() => setShowImportWizard(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full dark:text-white"><X size={24} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
               {wizardStep === 'SOURCE' ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <ImportSourceCard 
                      icon={Smartphone} 
                      label="Mobile Contacts" 
                      desc="Directly from Phone" 
                      onClick={handleMobileImport}
                      color="text-blue-600 bg-blue-50"
                    />
                    <ImportSourceCard 
                      icon={FileSpreadsheet} 
                      label="Excel / CSV" 
                      desc="Bulk Spreadsheet" 
                      onClick={() => fileInputRef.current?.click()}
                      color="text-green-600 bg-green-50"
                    />
                    <ImportSourceCard 
                      icon={FileCode} 
                      label="vCard (VCF)" 
                      desc="Address Book Export" 
                      onClick={() => fileInputRef.current?.click()}
                      color="text-purple-600 bg-purple-50"
                    />
                    <ImportSourceCard 
                      icon={GmailIcon} 
                      label="Gmail Contacts" 
                      desc="Google People Sync" 
                      onClick={handleGmailImport}
                      color="text-red-600 bg-red-50"
                    />
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".xlsx,.xls,.csv,.vcf" />
                 </div>
               ) : (
                 <div className="space-y-6 animate-in slide-in-from-right">
                    <div className="flex items-center justify-between">
                       <h3 className="font-black text-sm uppercase tracking-widest text-slate-400">Review Detected Contacts ({previewContacts.length})</h3>
                       <button onClick={() => setWizardStep('SOURCE')} className="text-[10px] font-black uppercase text-blue-600">Back to Sources</button>
                    </div>
                    <div className="border dark:border-slate-800 rounded-2xl overflow-hidden max-h-80 overflow-y-auto">
                       <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 dark:bg-slate-800 sticky top-0 font-black uppercase tracking-widest text-[8px] text-slate-400">
                             <tr>
                                <th className="px-4 py-3">Name</th>
                                <th className="px-4 py-3">Phone</th>
                                <th className="px-4 py-3">Email</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y dark:divide-slate-800">
                             {previewContacts.map((c, i) => (
                               <tr key={i} className="dark:text-slate-300">
                                  <td className="px-4 py-3 font-bold">{c.name}</td>
                                  <td className="px-4 py-3 font-mono">{c.phone}</td>
                                  <td className="px-4 py-3 opacity-60">{c.email || '---'}</td>
                               </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>
                    <button 
                      onClick={finalizeImport}
                      className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-blue-700 transition-all uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-2"
                    >
                      <UserPlus size={18} /> Add {previewContacts.length} Clients to CRM
                    </button>
                 </div>
               )}

               {importLoading && (
                 <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm z-20 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                       <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                       <p className="font-black text-xs uppercase tracking-[0.2em] dark:text-white">Parsing Contacts...</p>
                    </div>
                 </div>
               )}
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {historyCustomer && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-4xl max-h-[90vh] shadow-2xl border dark:border-slate-800 overflow-hidden animate-in zoom-in duration-300 flex flex-col">
            <div className="p-8 border-b dark:border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black dark:text-white uppercase tracking-tight">Customer Engagement History</h2>
                <p className="text-xs text-blue-600 font-black uppercase tracking-widest">{customers.find(c=>c.id===historyCustomer)?.name}'s Account</p>
              </div>
              <button onClick={() => setHistoryCustomer(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full dark:text-white">
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <section>
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <FileText size={14} /> Order History
                    </h3>
                    <div className="space-y-3">
                      {jobs.filter(j => j.customerId === historyCustomer).map(job => (
                        <div key={job.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border dark:border-slate-800">
                           <div className="flex items-center justify-between mb-2">
                             <p className="font-bold text-sm dark:text-white">{job.title}</p>
                             <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase ${job.status === JobStatus.COMPLETED ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{job.status}</span>
                           </div>
                           <div className="flex items-center justify-between text-[10px] font-black uppercase text-slate-400">
                             <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                             <span className="text-blue-600">{currentCurrency} {job.totalAmount.toLocaleString()}</span>
                           </div>
                        </div>
                      ))}
                      {jobs.filter(j => j.customerId === historyCustomer).length === 0 && <p className="text-center py-6 text-slate-400 text-xs font-bold uppercase">No orders recorded</p>}
                    </div>
                  </section>

                  <section>
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <DollarSign size={14} /> Payment History
                    </h3>
                    <div className="space-y-3">
                      {transactions.filter(t => t.customerId === historyCustomer).map(t => (
                        <div key={t.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border dark:border-slate-800">
                           <div className="flex items-center justify-between mb-1">
                             <p className="font-bold text-xs dark:text-white">{t.description}</p>
                             <span className="text-green-600 font-black text-xs">+{currentCurrency} {t.amount.toLocaleString()}</span>
                           </div>
                           <div className="flex items-center justify-between text-[8px] font-black uppercase text-slate-400">
                             <span>{new Date(t.timestamp).toLocaleString()}</span>
                             <span>{t.paymentMethod}</span>
                           </div>
                        </div>
                      ))}
                      {transactions.filter(t => t.customerId === historyCustomer).length === 0 && <p className="text-center py-6 text-slate-400 text-xs font-bold uppercase">No payments recorded</p>}
                    </div>
                  </section>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-200 border dark:border-slate-800 p-10">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black dark:text-white uppercase tracking-tight">{isEditing ? 'Edit Client Profile' : 'New Client Registration'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full dark:text-white">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Full Contact Name</label>
                  <input required type="text" className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-bold" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                </div>
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Business / Company Name</label>
                  <div className="relative">
                    <Building className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="text" className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl pl-14 pr-6 py-4 outline-none dark:text-white font-bold" value={form.businessName} onChange={e => setForm({...form, businessName: e.target.value})} placeholder="Optional business identity" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">WhatsApp / Phone</label>
                  <input required type="text" className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-bold" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Birthday (Optional)</label>
                  <div className="relative">
                    <Cake className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="date" className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl pl-12 pr-6 py-4 outline-none dark:text-white font-bold" value={form.birthday} onChange={e => setForm({...form, birthday: e.target.value})} />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Email Address</label>
                  <input type="email" className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-bold" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                </div>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-blue-700 transition-all uppercase tracking-[0.2em] text-xs">
                {isEditing ? 'UPDATE PROFILE' : 'REGISTER CUSTOMER'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const ImportSourceCard = ({ icon: Icon, label, desc, onClick, color }: any) => (
  <button 
    onClick={onClick}
    className="p-6 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 text-left hover:border-blue-300 dark:hover:border-blue-800 transition-all group"
  >
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${color}`}>
       <Icon size={24} />
    </div>
    <h4 className="font-black text-sm dark:text-white uppercase tracking-tight mb-1">{label}</h4>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{desc}</p>
  </button>
);

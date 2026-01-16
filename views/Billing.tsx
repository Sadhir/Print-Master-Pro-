
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  ArrowRight, 
  CheckCircle, 
  Share2, 
  Download, 
  X, 
  Trash2, 
  Calendar, 
  Clock, 
  AlertCircle,
  Printer,
  ChevronLeft,
  Info,
  Trash
} from 'lucide-react';
import { JobStatus, CurrencyCode, OrderSource, Job, InvoiceSettings } from '../types';

export const Billing = () => {
  const { jobs, customers, addJob, currentCurrency, invoiceSettings } = useApp();
  const [activeTab, setActiveTab] = useState<'INVOICES' | 'QUOTES'>('INVOICES');
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [printingJob, setPrintingJob] = useState<Job | null>(null);
  
  // Doc form state
  const [docData, setDocData] = useState({
    title: '',
    customerId: customers[0]?.id || '',
    items: [{ description: '', quantity: 1, unitPrice: 0 }]
  });

  const billingData = jobs.filter(j => activeTab === 'INVOICES' ? j.status !== 'QUOTE' : j.status === 'QUOTE');

  const handleAddItem = () => {
    setDocData({
      ...docData,
      items: [...docData.items, { description: '', quantity: 1, unitPrice: 0 }]
    });
  };

  const handleRemoveItem = (index: number) => {
    const newItems = docData.items.filter((_, i) => i !== index);
    setDocData({ ...docData, items: newItems });
  };

  const handleUpdateItem = (index: number, field: string, value: any) => {
    const newItems = docData.items.map((item, i) => {
      if (i === index) return { ...item, [field]: value };
      return item;
    });
    setDocData({ ...docData, items: newItems });
  };

  const calculateTotal = () => {
    return docData.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
  };

  const handleCreateDoc = (e: React.FormEvent, type: 'QUOTE' | 'INVOICE') => {
    e.preventDefault();
    const now = new Date();
    const expiry = type === 'QUOTE' ? new Date(now.setMonth(now.getMonth() + 1)).toISOString().split('T')[0] : undefined;

    addJob({
      title: docData.title,
      description: `${type === 'QUOTE' ? 'Quotation' : 'Tax Invoice'} for ${docData.title}`,
      customerId: docData.customerId,
      status: type === 'QUOTE' ? JobStatus.QUOTE : JobStatus.COMPLETED,
      source: OrderSource.WALK_IN,
      totalAmount: calculateTotal(),
      paidAmount: type === 'INVOICE' ? calculateTotal() : 0,
      advancePayment: type === 'INVOICE' ? calculateTotal() : 0,
      currency: currentCurrency,
      jobTakenDate: new Date().toISOString().split('T')[0],
      deliveryDate: new Date().toISOString().split('T')[0],
      createWhatsAppGroup: false,
      isOutsourced: false,
      expiryDate: expiry,
      items: docData.items
    });

    setShowQuoteModal(false);
    setShowInvoiceModal(false);
    setDocData({
      title: '',
      customerId: customers[0]?.id || '',
      items: [{ description: '', quantity: 1, unitPrice: 0 }]
    });
  };

  const isExpired = (expiryDate?: string) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  if (printingJob) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-12 animate-in fade-in duration-500">
         <div className="max-w-4xl mx-auto space-y-8 no-print">
            <div className="flex items-center justify-between">
               <button onClick={() => setPrintingJob(null)} className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors">
                  <ChevronLeft size={18} /> Exit Print Mode
               </button>
               <button onClick={() => window.print()} className="flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all">
                  <Printer size={18} /> Confirm Print
               </button>
            </div>
            <div className="p-10 bg-blue-50 dark:bg-blue-900/10 rounded-3xl border border-blue-100 dark:border-blue-900/30 flex items-center gap-6">
               <Info className="text-blue-600 shrink-0" size={32} />
               <p className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase leading-relaxed tracking-wider">
                  You are viewing the custom <span className="underline">{invoiceSettings.template}</span> template. You can change this style in System Authority > BRANDING settings.
               </p>
            </div>
         </div>
         
         {/* Printable Document */}
         <div className="max-w-4xl mx-auto mt-12 bg-white text-black shadow-2xl p-0 overflow-hidden" id="printable-invoice">
            <PrintableInvoice job={printingJob} settings={invoiceSettings} customer={customers.find(c => c.id === printingJob.customerId)} />
         </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black dark:text-white uppercase tracking-tight">Financial Artifacts</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Professional documentation for clients and tax audits.</p>
        </div>
        <button 
          onClick={() => {
            if (activeTab === 'QUOTES') setShowQuoteModal(true);
            else setShowInvoiceModal(true);
          }}
          className="flex items-center gap-2 bg-blue-600 px-6 py-4 rounded-2xl font-black text-white hover:bg-blue-700 shadow-xl shadow-blue-100 dark:shadow-none transition-all uppercase tracking-widest text-xs"
        >
          <Plus size={20} /> Create {activeTab === 'INVOICES' ? 'Manual Invoice' : 'Quotation'}
        </button>
      </div>

      <div className="flex bg-white dark:bg-slate-900 p-1 rounded-2xl border dark:border-slate-800 w-fit shadow-sm">
        <button 
          onClick={() => setActiveTab('INVOICES')}
          className={`px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all ${activeTab === 'INVOICES' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'}`}
        >
          Invoices
        </button>
        <button 
          onClick={() => setActiveTab('QUOTES')}
          className={`px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all ${activeTab === 'QUOTES' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'}`}
        >
          Quotations
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800 border-b dark:border-slate-800 text-slate-500 dark:text-slate-400 text-[10px] uppercase font-black tracking-[0.2em]">
              <tr>
                <th className="px-8 py-6">ID</th>
                <th className="px-8 py-6">Entity</th>
                <th className="px-8 py-6">Dated</th>
                {activeTab === 'QUOTES' && <th className="px-8 py-6">Validity</th>}
                <th className="px-8 py-6">Value</th>
                <th className="px-8 py-6">State</th>
                <th className="px-8 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-slate-800">
              {billingData.map(job => {
                const customer = customers.find(c => c.id === job.customerId);
                const expired = isExpired(job.expiryDate);
                
                return (
                  <tr key={job.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <span className="font-black dark:text-white uppercase text-xs tracking-tight">{activeTab === 'INVOICES' ? 'INV' : 'QT'}-{job.id.split('-')[1]}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <p className="font-black text-sm dark:text-white uppercase truncate tracking-tight">{customer?.name || 'Walk-in'}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{job.title}</p>
                    </td>
                    <td className="px-8 py-5 text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </td>
                    {activeTab === 'QUOTES' && (
                      <td className="px-8 py-5">
                        <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${expired ? 'text-red-500' : 'text-slate-500'}`}>
                          {job.expiryDate ? new Date(job.expiryDate).toLocaleDateString() : 'N/A'}
                        </div>
                      </td>
                    )}
                    <td className="px-8 py-5">
                      <span className="font-black text-blue-600">{currentCurrency} {job.totalAmount.toLocaleString()}</span>
                    </td>
                    <td className="px-8 py-5">
                      {activeTab === 'INVOICES' ? (
                        job.paidAmount >= job.totalAmount ? (
                          <span className="text-green-600 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest">PAID</span>
                        ) : (
                          <span className="text-orange-600 bg-orange-50 dark:bg-orange-900/20 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest">PENDING</span>
                        )
                      ) : (
                        <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${expired ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                          {expired ? 'EXPIRED' : job.status}
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button onClick={() => setPrintingJob(job)} className="p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-blue-600 rounded-xl border dark:border-slate-700 transition-colors" title="Print Customized Invoice"><Printer size={16} /></button>
                        <button className="p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-blue-600 rounded-xl border dark:border-slate-700 transition-colors"><Share2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quote/Invoice Modal */}
      {(showQuoteModal || showInvoiceModal) && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[150] flex items-center justify-center p-4">
           <div className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-4xl p-10 shadow-2xl border dark:border-slate-800 overflow-hidden animate-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-10">
                 <div>
                    <h2 className="text-2xl font-black dark:text-white uppercase tracking-tight">New {showQuoteModal ? 'Professional Quotation' : 'Manual Tax Invoice'}</h2>
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{showQuoteModal ? 'Formal cost assessment' : 'Direct manual billing artifact'}</p>
                 </div>
                 <button onClick={() => { setShowQuoteModal(false); setShowInvoiceModal(false); }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full dark:text-white"><X size={24} /></button>
              </div>

              <form onSubmit={(e) => handleCreateDoc(e, showQuoteModal ? 'QUOTE' : 'INVOICE')} className="space-y-8">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Project Title</label>
                       <input required type="text" className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-bold" value={docData.title} onChange={e => setDocData({...docData, title: e.target.value})} placeholder="e.g. Corporate Branding Package" />
                    </div>
                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Select Client</label>
                       <select required className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-bold" value={docData.customerId} onChange={e => setDocData({...docData, customerId: e.target.value})}>
                          {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                       </select>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                       <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Itemized Breakdown</h3>
                       <button type="button" onClick={handleAddItem} className="text-[9px] font-black text-blue-600 uppercase flex items-center gap-1 hover:underline">
                          <Plus size={12} /> Add Item
                       </button>
                    </div>
                    <div className="space-y-3">
                       {docData.items.map((item, index) => (
                          <div key={index} className="grid grid-cols-12 gap-4 items-center bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border dark:border-slate-800">
                             <div className="col-span-6">
                                <input required type="text" className="w-full bg-transparent outline-none dark:text-white text-xs font-bold" placeholder="Description of service..." value={item.description} onChange={e => handleUpdateItem(index, 'description', e.target.value)} />
                             </div>
                             <div className="col-span-2">
                                <input required type="number" className="w-full bg-transparent outline-none dark:text-white text-xs font-black text-center" placeholder="Qty" value={item.quantity} onChange={e => handleUpdateItem(index, 'quantity', Number(e.target.value))} />
                             </div>
                             <div className="col-span-3">
                                <div className="flex items-center gap-2">
                                   <span className="text-[10px] font-black text-slate-400">{currentCurrency}</span>
                                   <input required type="number" className="w-full bg-transparent outline-none dark:text-white text-xs font-black" placeholder="Rate" value={item.unitPrice || ''} onChange={e => handleUpdateItem(index, 'unitPrice', Number(e.target.value))} />
                                </div>
                             </div>
                             <div className="col-span-1 flex justify-end">
                                <button type="button" onClick={() => handleRemoveItem(index)} className="text-slate-300 hover:text-red-500"><Trash size={14} /></button>
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>

                 <div className="flex justify-between items-end pt-8 border-t dark:border-slate-800">
                    <div className="p-6 bg-blue-50 dark:bg-blue-900/10 rounded-3xl border border-blue-100 dark:border-blue-900/30 flex items-center gap-4 max-w-sm">
                       <AlertCircle className="text-blue-600 shrink-0" size={20} />
                       <p className="text-[9px] font-bold text-blue-700 dark:text-blue-300 uppercase leading-relaxed">
                          {showQuoteModal ? 'Quotes expire in 30 days.' : 'This invoice will mark the job as COMPLETED and FULLY PAID.'}
                       </p>
                    </div>
                    <div className="text-right space-y-4">
                       <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Document Value</p>
                          <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{currentCurrency} {calculateTotal().toLocaleString()}</p>
                       </div>
                       <button type="submit" className="bg-blue-600 text-white font-black py-5 px-12 rounded-2xl shadow-xl hover:bg-blue-700 transition-all uppercase tracking-[0.2em] text-xs">
                          Finalize {showQuoteModal ? 'Quotation' : 'Invoice'}
                       </button>
                    </div>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

const PrintableInvoice = ({ job, settings, customer }: { job: Job, settings: InvoiceSettings, customer?: any }) => {
   if (settings.template === 'THERMAL') {
      return (
         <div className="p-6 font-mono text-[11px] leading-tight text-black max-w-[80mm] mx-auto bg-white border-x border-dashed border-slate-200">
            <div className="text-center space-y-1 mb-6 border-b border-black border-dotted pb-6">
               <h2 className="text-[14px] font-black uppercase">{settings.businessName}</h2>
               <p>{settings.businessTagline}</p>
               <p className="mt-2">{settings.businessAddress}</p>
               <p>TEL: {settings.businessPhone}</p>
            </div>
            <div className="space-y-1 mb-4">
               <div className="flex justify-between font-bold"><span>ID:</span><span>#{job.id.split('-')[1]}</span></div>
               <div className="flex justify-between"><span>DATE:</span><span>{new Date(job.createdAt).toLocaleString()}</span></div>
               <div className="flex justify-between"><span>CLIENT:</span><span>{customer?.name || 'Walk-in'}</span></div>
            </div>
            <div className="border-y border-black border-dotted py-2 space-y-2 mb-4">
               <div className="flex justify-between font-bold text-[10px]">
                  <span>DESCRIPTION</span>
                  <span>TOTAL</span>
               </div>
               {job.items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between">
                     <span className="max-w-[70%]">{item.description} x{item.quantity}</span>
                     <span>{(item.quantity * item.unitPrice).toLocaleString()}</span>
                  </div>
               )) || (
                 <div className="flex justify-between">
                    <span className="max-w-[70%]">{job.title}</span>
                    <span>{job.totalAmount.toLocaleString()}</span>
                 </div>
               )}
            </div>
            <div className="text-right space-y-1 mb-6">
               <div className="flex justify-between font-black text-[13px]">
                  <span>NET TOTAL:</span>
                  <span>{job.currency} {job.totalAmount.toLocaleString()}</span>
               </div>
               <div className="flex justify-between">
                  <span>PAID:</span>
                  <span>{job.currency} {job.paidAmount.toLocaleString()}</span>
               </div>
               <div className="flex justify-between opacity-60">
                  <span>DUE:</span>
                  <span>{job.currency} {(job.totalAmount - job.paidAmount).toLocaleString()}</span>
               </div>
            </div>
            <div className="text-center space-y-4">
               <div className="flex flex-col items-center gap-1 opacity-60">
                  <p>***************************</p>
                  <p className="font-bold uppercase">{settings.footerNotes}</p>
                  <p>***************************</p>
               </div>
               <p className="text-[9px] opacity-40">SYSTEM GENERATED RECEIPT • PRINTMASTER PRO</p>
            </div>
         </div>
      );
   }

   const isMinimal = settings.template === 'MINIMAL';
   const isClassic = settings.template === 'CLASSIC';

   return (
      <div className="min-h-[297mm] p-[15mm] flex flex-col font-sans">
         <div className={`flex justify-between items-start mb-16 ${isClassic ? 'flex-row-reverse' : ''}`} style={!isMinimal ? { borderTop: `8px solid ${settings.primaryColor}`, paddingTop: '10mm' } : {}}>
            <div className="space-y-2">
               <img src={settings.businessLogoUrl} alt="Logo" className="h-16 w-auto object-contain mb-4" />
               <h1 className="text-3xl font-black uppercase tracking-tighter leading-none" style={!isMinimal ? { color: settings.primaryColor } : {}}>{settings.businessName}</h1>
               <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{settings.businessTagline}</p>
            </div>
            <div className={`text-right space-y-1 text-xs font-bold text-slate-400 uppercase tracking-wider ${isClassic ? 'text-left' : ''}`}>
               <p className="text-slate-900">{settings.businessAddress}</p>
               <p>{settings.businessPhone}</p>
               <p>{settings.businessEmail}</p>
               {settings.taxNumber && <p>TAX ID: {settings.taxNumber}</p>}
            </div>
         </div>

         <div className="flex justify-between items-end mb-16">
            <div>
               <h2 className="text-5xl font-black uppercase tracking-tighter mb-4" style={!isMinimal ? { color: settings.primaryColor } : {}}>
                  {job.status === JobStatus.QUOTE ? 'Quotation' : 'Tax Invoice'}
               </h2>
               <div className="grid grid-cols-2 gap-x-12 gap-y-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <span>Document #</span>
                  <span className="text-slate-900">PM-{job.id.split('-')[1]}</span>
                  <span>Issue Date</span>
                  <span className="text-slate-900">{new Date(job.createdAt).toLocaleDateString()}</span>
                  {job.expiryDate && (
                    <>
                       <span>Valid Until</span>
                       <span className="text-slate-900">{new Date(job.expiryDate).toLocaleDateString()}</span>
                    </>
                  )}
               </div>
            </div>
            <div className="text-right">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Billed To:</p>
               <h3 className="text-xl font-black uppercase">{customer?.name || 'Walk-in Client'}</h3>
               <p className="text-xs font-bold text-slate-500 uppercase">{customer?.phone}</p>
               {customer?.address && <p className="text-xs text-slate-400 max-w-[240px] ml-auto">{customer.address}</p>}
            </div>
         </div>

         <table className="w-full mb-12">
            <thead>
               <tr className="border-b-2 border-black text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  <th className="py-4 text-left">Service Description</th>
                  <th className="py-4 text-center">Qty</th>
                  <th className="py-4 text-right">Rate</th>
                  <th className="py-4 text-right">Line Total</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
               {job.items?.length > 0 ? job.items.map((item, i) => (
                  <tr key={i}>
                     <td className="py-6 font-black uppercase text-sm">{item.description}</td>
                     <td className="py-6 text-center font-bold text-sm">{item.quantity}</td>
                     <td className="py-6 text-right font-bold text-sm">{job.currency} {item.unitPrice.toLocaleString()}</td>
                     <td className="py-6 text-right font-black text-sm">{job.currency} {(item.quantity * item.unitPrice).toLocaleString()}</td>
                  </tr>
               )) : (
                  <tr>
                     <td className="py-6 font-black uppercase text-sm">{job.title}</td>
                     <td className="py-6 text-center font-bold text-sm">1</td>
                     <td className="py-6 text-right font-bold text-sm">{job.currency} {job.totalAmount.toLocaleString()}</td>
                     <td className="py-6 text-right font-black text-sm">{job.currency} {job.totalAmount.toLocaleString()}</td>
                  </tr>
               )}
            </tbody>
         </table>

         <div className="flex justify-between items-start mt-auto pt-16">
            <div className="max-w-sm space-y-8">
               {settings.showPaymentDetails && (
                 <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Payment Settlement</p>
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 font-bold text-[10px] uppercase leading-relaxed text-slate-600 whitespace-pre-wrap">
                       {settings.bankDetails}
                    </div>
                 </div>
               )}
               <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Terms & Signature</p>
                  <p className="text-[10px] font-medium text-slate-400 italic leading-relaxed">{settings.footerNotes}</p>
               </div>
            </div>
            <div className="w-80 space-y-3">
               <div className="flex justify-between text-xs font-black uppercase text-slate-400">
                  <span>Subtotal</span>
                  <span className="text-slate-900">{job.currency} {job.totalAmount.toLocaleString()}</span>
               </div>
               <div className="flex justify-between text-xs font-black uppercase text-slate-400 border-b pb-3">
                  <span>Tax (0%)</span>
                  <span className="text-slate-900">{job.currency} 0</span>
               </div>
               <div className="flex justify-between items-baseline pt-4">
                  <span className="text-sm font-black uppercase tracking-widest">Amount Due</span>
                  <span className="text-3xl font-black" style={!isMinimal ? { color: settings.primaryColor } : {}}>
                     {job.currency} {job.totalAmount.toLocaleString()}
                  </span>
               </div>
               {job.paidAmount > 0 && (
                  <div className="flex justify-between text-xs font-black uppercase text-green-600 bg-green-50 p-3 rounded-xl mt-4">
                     <span>Payment Received</span>
                     <span>-{job.currency} {job.paidAmount.toLocaleString()}</span>
                  </div>
               )}
            </div>
         </div>

         <div className="mt-16 text-center opacity-10">
            <p className="text-[8px] font-black uppercase tracking-[0.5em]">Digitally Authenticated Document • SECURED LEDGER</p>
         </div>
      </div>
   );
};

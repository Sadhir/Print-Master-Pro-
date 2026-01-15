
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
  AlertCircle 
} from 'lucide-react';
import { JobStatus, CurrencyCode, OrderSource } from '../types';

export const Billing = () => {
  const { jobs, customers, addJob, currentCurrency } = useApp();
  const [activeTab, setActiveTab] = useState<'INVOICES' | 'QUOTES'>('INVOICES');
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  
  // Quote form state
  const [quoteData, setQuoteData] = useState({
    title: '',
    customerId: customers[0]?.id || '',
    items: [{ description: '', quantity: 1, unitPrice: 0 }]
  });

  const billingData = jobs.filter(j => activeTab === 'INVOICES' ? j.status !== 'QUOTE' : j.status === 'QUOTE');

  const handleAddItem = () => {
    setQuoteData({
      ...quoteData,
      items: [...quoteData.items, { description: '', quantity: 1, unitPrice: 0 }]
    });
  };

  const handleRemoveItem = (index: number) => {
    const newItems = quoteData.items.filter((_, i) => i !== index);
    setQuoteData({ ...quoteData, items: newItems });
  };

  const handleUpdateItem = (index: number, field: string, value: any) => {
    const newItems = quoteData.items.map((item, i) => {
      if (i === index) return { ...item, [field]: value };
      return item;
    });
    setQuoteData({ ...quoteData, items: newItems });
  };

  const calculateTotal = () => {
    return quoteData.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
  };

  const handleCreateQuote = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Set expiry to 1 month from now
    const now = new Date();
    const expiry = new Date(now.setMonth(now.getMonth() + 1)).toISOString().split('T')[0];

    // Fix: Added missing source property
    addJob({
      title: quoteData.title,
      description: `Quotation for ${quoteData.title}`,
      customerId: quoteData.customerId,
      status: JobStatus.QUOTE,
      source: OrderSource.WALK_IN,
      totalAmount: calculateTotal(),
      paidAmount: 0,
      advancePayment: 0,
      currency: currentCurrency,
      jobTakenDate: new Date().toISOString().split('T')[0],
      deliveryDate: '',
      createWhatsAppGroup: false,
      isOutsourced: false,
      expiryDate: expiry,
      items: quoteData.items
    });

    setShowQuoteModal(false);
    setQuoteData({
      title: '',
      customerId: customers[0]?.id || '',
      items: [{ description: '', quantity: 1, unitPrice: 0 }]
    });
  };

  const isExpired = (expiryDate?: string) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold dark:text-white">Billing & Invoicing</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage financial records and sales documents.</p>
        </div>
        <button 
          onClick={() => {
            if (activeTab === 'QUOTES') setShowQuoteModal(true);
            // Invoices create could be handled by redirecting to POS or a similar invoice modal
          }}
          className="flex items-center gap-2 bg-blue-600 px-6 py-3 rounded-xl font-bold text-white hover:bg-blue-700 shadow-lg shadow-blue-100 dark:shadow-none transition-all"
        >
          <Plus size={20} /> Create {activeTab === 'INVOICES' ? 'Invoice' : 'Quotation'}
        </button>
      </div>

      <div className="flex bg-white dark:bg-slate-900 p-1 rounded-xl border dark:border-slate-800 w-fit shadow-sm">
        <button 
          onClick={() => setActiveTab('INVOICES')}
          className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'INVOICES' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
        >
          Invoices
        </button>
        <button 
          onClick={() => setActiveTab('QUOTES')}
          className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'QUOTES' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
        >
          Quotations
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800 border-b dark:border-slate-800 text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-widest">
              <tr>
                <th className="px-6 py-4">Document</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Date</th>
                {activeTab === 'QUOTES' && <th className="px-6 py-4">Valid Until</th>}
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-slate-800">
              {billingData.map(job => {
                const customer = customers.find(c => c.id === job.customerId);
                const expired = isExpired(job.expiryDate);
                
                return (
                  <tr key={job.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                          <FileText size={16} />
                        </div>
                        <span className="font-bold text-slate-700 dark:text-slate-200">{activeTab === 'INVOICES' ? 'INV' : 'QT'}-{job.id.split('-')[1]}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-sm dark:text-slate-200">{customer?.name || 'Walk-in'}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">{job.title}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </td>
                    {activeTab === 'QUOTES' && (
                      <td className="px-6 py-4">
                        <div className={`flex items-center gap-1.5 text-xs font-bold ${expired ? 'text-red-500' : 'text-slate-500 dark:text-slate-400'}`}>
                          {expired ? <AlertCircle size={14} /> : <Clock size={14} />}
                          {job.expiryDate ? new Date(job.expiryDate).toLocaleDateString() : 'N/A'}
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{currentCurrency} {job.totalAmount.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4">
                      {activeTab === 'INVOICES' ? (
                        job.paidAmount >= job.totalAmount ? (
                          <span className="text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded text-[10px] font-bold">PAID</span>
                        ) : (
                          <span className="text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded text-[10px] font-bold">PENDING</span>
                        )
                      ) : (
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${expired ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' : 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'}`}>
                          {expired ? 'Expired' : job.status}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" title="Share via WhatsApp"><Share2 size={16} /></button>
                        <button className="p-2 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" title="Download PDF"><Download size={16} /></button>
                        {activeTab === 'QUOTES' && !expired && (
                          <button 
                            className="flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-2 py-1 rounded border border-blue-200 dark:border-blue-800 transition-colors"
                            onClick={() => {
                              // Logical conversion to approved job would go here
                              alert("Quotation conversion logic triggered.");
                            }}
                          >
                            Convert <ArrowRight size={12} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {billingData.length === 0 && (
                <tr>
                  <td colSpan={activeTab === 'QUOTES' ? 7 : 6} className="px-6 py-12 text-center text-slate-400 dark:text-slate-600">
                    <FileText size={48} className="mx-auto mb-2 opacity-20" />
                    <p className="font-medium">No records found for {activeTab.toLowerCase()}</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quotation Creation Modal */}
      {showQuoteModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in duration-200 border dark:border-slate-800">
            <div className="p-8 border-b dark:border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black dark:text-white uppercase tracking-tight">Create Professional Quotation</h2>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Valid for 30 days from creation</p>
              </div>
              <button onClick={() => setShowQuoteModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full dark:text-white">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleCreateQuote} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Quote Subject</label>
                  <input 
                    required 
                    type="text" 
                    placeholder="e.g., Company Branding Package"
                    className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl px-4 py-3 outline-none dark:text-white font-bold"
                    value={quoteData.title}
                    onChange={e => setQuoteData({...quoteData, title: e.target.value})}
                  />
                </div>

                <div className="md:col-span-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Select Client</label>
                  <select 
                    className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl px-4 py-3 outline-none dark:text-white font-bold"
                    value={quoteData.customerId}
                    onChange={e => setQuoteData({...quoteData, customerId: e.target.value})}
                  >
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Line Items</h3>
                  <button 
                    type="button" 
                    onClick={handleAddItem}
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline"
                  >
                    <Plus size={14} /> Add Line
                  </button>
                </div>

                <div className="space-y-3">
                  {quoteData.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-3 items-end bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border dark:border-slate-700 animate-in fade-in slide-in-from-left-2">
                      <div className="col-span-5">
                        <label className="text-[8px] font-black text-slate-400 uppercase mb-1 block">Description</label>
                        <input 
                          type="text" 
                          required
                          placeholder="Item or service"
                          className="w-full bg-white dark:bg-slate-800 border dark:border-slate-600 rounded-lg px-3 py-2 text-xs outline-none dark:text-white"
                          value={item.description}
                          onChange={e => handleUpdateItem(index, 'description', e.target.value)}
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-[8px] font-black text-slate-400 uppercase mb-1 block">Qty</label>
                        <input 
                          type="number" 
                          required
                          className="w-full bg-white dark:bg-slate-800 border dark:border-slate-600 rounded-lg px-3 py-2 text-xs outline-none dark:text-white"
                          value={item.quantity}
                          onChange={e => handleUpdateItem(index, 'quantity', Number(e.target.value))}
                        />
                      </div>
                      <div className="col-span-3">
                        <label className="text-[8px] font-black text-slate-400 uppercase mb-1 block">Unit Price</label>
                        <input 
                          type="number" 
                          required
                          className="w-full bg-white dark:bg-slate-800 border dark:border-slate-600 rounded-lg px-3 py-2 text-xs outline-none dark:text-white"
                          value={item.unitPrice}
                          onChange={e => handleUpdateItem(index, 'unitPrice', Number(e.target.value))}
                        />
                      </div>
                      <div className="col-span-2 flex items-center justify-end">
                        <button 
                          type="button" 
                          onClick={() => handleRemoveItem(index)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t dark:border-slate-800 pt-6 flex flex-col items-end gap-2">
                <div className="flex items-center gap-12">
                   <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Quotation Value</span>
                   <span className="text-3xl font-black text-blue-600 dark:text-blue-400">{currentCurrency} {calculateTotal().toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  <Calendar size={12} />
                  Expiry: {new Date(new Date().setMonth(new Date().getMonth() + 1)).toLocaleDateString()}
                </div>
              </div>

              <button className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl shadow-xl hover:bg-blue-700 transition-all uppercase tracking-[0.2em] text-xs sticky bottom-0">
                GENERATE & SAVE QUOTATION
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

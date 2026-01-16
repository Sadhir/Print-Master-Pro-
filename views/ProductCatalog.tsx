
import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Plus, Search, Trash2, Edit3, X, Download, Upload, 
  FileSpreadsheet, Package, Tag, Layers, CheckCircle2,
  AlertCircle, ArrowRight, Loader2, Beaker, Settings2,
  Filter, Grid, List, Hash, ShoppingBag, Zap, Palette, 
  Layout, FileText, Gift, Briefcase, Cpu, Heart, Mail
} from 'lucide-react';
import { Product, UserRole, ProductComponent, ProductCategory } from '../types';

export const ProductCatalog = () => {
  const { products, addProduct, updateProduct, deleteProduct, importProducts, currentCurrency, currentUser, allInventory } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<Omit<Product, 'id'>>({
    name: '',
    category: 'PRINT_BW',
    price: 0,
    stock: 0,
    unit: 'units',
    components: []
  });

  const isAdmin = currentUser.role === UserRole.ADMIN;

  const filtered = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'ALL' || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const categories: string[] = Array.from(new Set(products.map(p => p.category as string))).sort() as string[];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      updateProduct(isEditing, form);
    } else {
      addProduct(form);
    }
    handleCloseModal();
  };

  const handleEdit = (product: Product) => {
    setForm({
      name: product.name,
      category: product.category,
      price: product.price,
      stock: product.stock,
      unit: product.unit,
      components: product.components || []
    });
    setIsEditing(product.id);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setIsEditing(null);
    setForm({ name: '', category: 'PRINT_BW', price: 0, stock: 0, unit: 'units', components: [] });
  };

  const addComponentRow = () => {
    if (!allInventory.length) return;
    setForm({
      ...form,
      components: [...(form.components || []), { inventoryItemId: allInventory[0].id, quantity: 1 }]
    });
  };

  const removeComponentRow = (index: number) => {
    const updated = [...(form.components || [])];
    updated.splice(index, 1);
    setForm({ ...form, components: updated });
  };

  const updateComponent = (index: number, field: keyof ProductComponent, value: any) => {
    const updated = [...(form.components || [])];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, components: updated });
  };

  const getCategoryColor = (cat: ProductCategory) => {
    if (cat === 'WEDDING_INVITATION') return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30';
    if (cat === 'ENVELOPE') return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30';
    return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black dark:text-white uppercase tracking-tight">Service Catalog</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Standardized pricing and material consumption for all shop products.</p>
        </div>
        <div className="flex gap-3">
          <button 
            type="button"
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 px-6 py-4 rounded-[1.5rem] font-black text-white shadow-xl hover:bg-blue-700 transition-all uppercase tracking-widest text-xs"
          >
            <Plus size={18} /> New Entry
          </button>
        </div>
      </div>

      <div className="flex bg-white dark:bg-slate-900 p-1 rounded-2xl border dark:border-slate-800 overflow-x-auto no-scrollbar scroll-smooth">
         <button type="button" onClick={() => setActiveCategory('ALL')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeCategory === 'ALL' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>All Services</button>
         {categories.map(cat => (
           <button key={cat} type="button" onClick={() => setActiveCategory(cat)} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeCategory === cat ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>{cat.replace(/_/g, ' ')}</button>
         ))}
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-3">
        <Search className="text-slate-400" size={20} />
        <input type="text" placeholder="Filter by name..." className="flex-1 bg-transparent outline-none dark:text-white text-lg font-medium" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 dark:bg-slate-800/50 border-b dark:border-slate-800 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              <tr><th className="px-8 py-6">Item Name</th><th className="px-8 py-6">Category</th><th className="px-8 py-6">Price</th><th className="px-8 py-6 text-right">Actions</th></tr>
            </thead>
            <tbody className="divide-y dark:divide-slate-800">
              {filtered.map(product => (
                <tr key={product.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className="px-8 py-5"><p className="font-bold dark:text-white uppercase text-sm tracking-tight">{product.name}</p></td>
                  <td className="px-8 py-5"><span className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${getCategoryColor(product.category)}`}>{product.category.replace(/_/g, ' ')}</span></td>
                  <td className="px-8 py-5"><p className="font-black text-blue-600">{currentCurrency} {product.price.toLocaleString()}</p></td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button type="button" onClick={() => handleEdit(product)} className="p-2 text-slate-400 hover:text-blue-600"><Edit3 size={16} /></button>
                      <button type="button" onClick={() => deleteProduct(product.id)} className="p-2 text-slate-400 hover:text-red-500"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[150] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-2xl p-10 animate-in zoom-in border dark:border-slate-800 shadow-2xl">
             <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black dark:text-white uppercase tracking-tight">{isEditing ? 'Modify Service' : 'New Catalog Entry'}</h2>
                <button type="button" onClick={handleCloseModal} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full dark:text-white"><X size={24} /></button>
             </div>
             <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Item Name</label>
                   <input required type="text" className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-bold" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Price ({currentCurrency})</label>
                    <input required type="number" className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-black" value={form.price || ''} onChange={e => setForm({...form, price: Number(e.target.value)})} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Unit</label>
                    <input required type="text" className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-bold" value={form.unit} onChange={e => setForm({...form, unit: e.target.value})} />
                  </div>
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-blue-700 transition-all uppercase tracking-[0.2em] text-xs">
                  Save Catalog Entry
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

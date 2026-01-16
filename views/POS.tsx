
import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Trash2, 
  UserPlus, 
  CreditCard, 
  Banknote, 
  QrCode, 
  Plus, 
  Minus,
  MessageCircle,
  X,
  ShoppingCart,
  CheckCircle2,
  Globe,
  ArrowRight,
  User,
  PackagePlus,
  ChevronDown,
  Tag,
  Percent,
  Edit2,
  Hash,
  Filter,
  Layers,
  Sparkles,
  ShoppingBag,
  Printer,
  Mail,
  PlusCircle,
  Flame,
  Zap,
  Star,
  AlertCircle,
  RotateCcw,
  Lock,
  ArrowLeft,
  CheckCircle,
  Wallet
} from 'lucide-react';
import { PaymentMethod, CurrencyCode, OrderSource, UserRole, ProductCategory } from '../types';
import { useApp } from '../context/AppContext';

export const POS = () => {
  const { 
    addTransaction, 
    updateInventory, 
    updateProduct,
    customers, 
    addCustomer, 
    products, 
    addProduct, 
    currentCurrency, 
    staff, 
    currentUser,
    allJobs,
    allInventory,
    accounts
  } = useApp();
  
  const [cart, setCart] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [isCustomerSearchOpen, setIsCustomerSearchOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || '');
  const [orderDiscount, setOrderDiscount] = useState(0);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutComplete, setCheckoutComplete] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  
  // Feedback state for cart addition
  const [cartAnimate, setCartAnimate] = useState(false);
  
  const customerSearchRef = useRef<HTMLDivElement>(null);

  const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);
  const [showNewProductModal, setShowNewProductModal] = useState(false);

  const [newCustomerForm, setNewCustomerForm] = useState({ name: '', phone: '', email: '', businessName: '' });
  const [newProductForm, setNewProductForm] = useState({ name: '', category: 'PRINT_BW' as ProductCategory, price: 0, unit: 'units', stock: 100 });

  const activeStaff = staff.find(s => s.name === currentUser.name);
  const currentCustomer = customers.find(c => c.id === selectedCustomerId) || customers[0];

  const [useForeignCurrency, setUseForeignCurrency] = useState(false);
  const [foreignCurrency, setForeignCurrency] = useState<CurrencyCode>(CurrencyCode.USD);
  const [exchangeRate, setExchangeRate] = useState(300);
  const [foreignAmount, setForeignAmount] = useState(0);

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const totalItemDiscounts = cart.reduce((acc, item) => acc + ((item.itemDiscount || 0) * item.quantity), 0);
  const totalLocal = Math.max(0, subtotal - totalItemDiscounts - orderDiscount);

  const categories: string[] = Array.from(new Set(products.map(p => p.category as string))).sort() as string[];

  // Initialize account selection when checkout opens
  useEffect(() => {
    if (showCheckout && accounts.length > 0 && !selectedAccountId) {
      setSelectedAccountId(accounts[0].id);
    }
  }, [showCheckout, accounts]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (customerSearchRef.current && !customerSearchRef.current.contains(event.target as Node)) {
        setIsCustomerSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (useForeignCurrency && totalLocal > 0) {
      setForeignAmount(Number((totalLocal / exchangeRate).toFixed(2)));
    }
  }, [totalLocal, exchangeRate, useForeignCurrency]);

  const addToCart = (product: any) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { ...product, quantity: 1, itemDiscount: 0 }]);
    }
    
    // Trigger cart feedback animation
    setCartAnimate(true);
    setTimeout(() => setCartAnimate(false), 300);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const q = Math.max(0, item.quantity + delta);
        return q === 0 ? null : { ...item, quantity: q };
      }
      return item;
    }).filter(Boolean));
  };

  const clearCart = () => {
    if (window.confirm("Abandon current shopping cart?")) {
      setCart([]);
    }
  };

  const updateItemDiscount = (id: string, discount: number) => {
    setCart(cart.map(item => item.id === id ? { ...item, itemDiscount: Math.max(0, discount) } : item));
  };

  const updateItemPrice = (id: string, price: number) => {
    setCart(cart.map(item => item.id === id ? { ...item, price: Math.max(0, price) } : item));
  };

  const priorityCategories: ProductCategory[] = [
    'PRINT_BW', 
    'PRINT_COLOR_INKJET', 
    'PRINT_COLOR_LASER', 
    'COPY_SCAN', 
    'LAMINATION', 
    'BIND_SPIRAL', 
    'BIND_COMB', 
    'BIND_OTHER'
  ];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = activeCategory === 'ALL' || p.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const aIndex = priorityCategories.indexOf(a.category);
    const bIndex = priorityCategories.indexOf(b.category);

    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    return 0;
  });

  const getProductStockStatus = (product: any) => {
    if (product.components && product.components.length > 0) {
      let minAvailable = Infinity;
      product.components.forEach((comp: any) => {
        const invItem = allInventory.find(i => i.id === comp.inventoryItemId);
        if (invItem) {
          const possibleUnits = Math.floor(invItem.quantity / comp.quantity);
          if (possibleUnits < minAvailable) minAvailable = possibleUnits;
        }
      });
      return { level: minAvailable === Infinity ? 0 : minAvailable, type: 'BOM' };
    }
    return { level: product.stock, type: 'DIRECT' };
  };

  const filteredCustomers = customers.filter(c => {
    const s = customerSearchTerm.toLowerCase();
    if (c.name.toLowerCase().includes(s)) return true;
    if (c.phone.includes(s)) return true;
    return false;
  });

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    const created = (addCustomer as any)(newCustomerForm);
    setSelectedCustomerId(created.id);
    setShowNewCustomerModal(false);
    setNewCustomerForm({ name: '', phone: '', email: '', businessName: '' });
    setCustomerSearchTerm('');
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    addProduct(newProductForm);
    setShowNewProductModal(false);
    setNewProductForm({ name: '', category: 'PRINT_BW', price: 0, unit: 'units', stock: 100 });
  };

  const handlePayment = () => {
    addTransaction({
      amount: totalLocal,
      currency: currentCurrency,
      type: 'SALE',
      source: OrderSource.WALK_IN,
      paymentMethod: selectedMethod,
      description: `POS Sale to ${currentCustomer?.name || 'Walk-in'}`,
      customerId: currentCustomer?.id,
      staffId: activeStaff?.id,
      accountId: selectedAccountId,
      ...(useForeignCurrency ? {
        foreignAmount: foreignAmount,
        foreignCurrency: foreignCurrency,
        exchangeRate: exchangeRate
      } : {})
    });

    cart.forEach(cartItem => {
      const masterProduct = products.find(p => p.id === cartItem.id);
      if (masterProduct) {
        if (masterProduct.components && masterProduct.components.length > 0) {
           masterProduct.components.forEach(comp => {
             const totalReduction = -(comp.quantity * cartItem.quantity);
             updateInventory(comp.inventoryItemId, totalReduction);
           });
        }
        if (masterProduct.stock > 0) {
           updateProduct(masterProduct.id, { 
             stock: Math.max(0, masterProduct.stock - cartItem.quantity) 
           });
        }
      }
    });

    setCheckoutComplete(true);
  };

  const resetPOS = () => {
    setCheckoutComplete(false);
    setShowCheckout(false);
    setCart([]);
    setOrderDiscount(0);
    setUseForeignCurrency(false);
    setSearchTerm('');
  };

  const generateReceiptText = () => {
    const date = new Date().toLocaleString();
    let text = `*RECEIPT - PRINTMASTER PRO*\n`;
    text += `Date: ${date}\n`;
    text += `Client: ${currentCustomer?.name || 'Walk-in'}\n`;
    text += `--------------------------\n`;
    cart.forEach(item => {
      const lineTotal = (item.price - (item.itemDiscount || 0)) * item.quantity;
      text += `${item.name} x${item.quantity} - ${currentCurrency} ${lineTotal.toLocaleString()}\n`;
    });
    text += `--------------------------\n`;
    if (orderDiscount > 0) text += `Discount: -${currentCurrency} ${orderDiscount.toLocaleString()}\n`;
    text += `*TOTAL PAYABLE: ${currentCurrency} ${totalLocal.toLocaleString()}*\n`;
    text += `Payment: ${selectedMethod}\n\n`;
    text += `Thank you for your business!`;
    return text;
  };

  const handleWhatsAppReceipt = () => {
    const text = encodeURIComponent(generateReceiptText());
    const phone = currentCustomer?.phone.replace(/[^\d]/g, '') || '';
    if (phone) {
      window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
    } else {
      alert("No phone number found for this customer.");
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 h-full min-h-0 overflow-hidden relative">
      {/* Main Catalog View */}
      <div className="flex-1 flex flex-col gap-6 min-w-0 h-full overflow-hidden">
        {/* Search Bar */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="flex-1 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-colors">
            <Search className="text-slate-400 dark:text-slate-500" size={24} />
            <input 
              type="text" 
              placeholder="Fast Catalog Lookup..." 
              className="flex-1 outline-none text-xl bg-transparent dark:text-white dark:placeholder:text-slate-600 font-black tracking-tight uppercase"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            type="button"
            onClick={() => setShowNewProductModal(true)}
            className="bg-blue-600 text-white p-5 rounded-3xl shadow-lg hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-2 font-black text-xs uppercase tracking-widest shrink-0"
          >
            <PackagePlus size={24} /> <span className="hidden lg:block">Custom Add</span>
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 shrink-0">
           <button 
            type="button"
            onClick={() => setActiveCategory('ALL')}
            className={`px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap border-2 ${activeCategory === 'ALL' ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400'}`}
           >
             All Items
           </button>
           {categories.map(cat => (
             <button 
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap border-2 ${activeCategory === cat ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400'}`}
             >
               {cat.replace(/_/g, ' ')}
             </button>
           ))}
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar pb-10">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
            {sortedProducts.map(product => {
              const isTrending = priorityCategories.includes(product.category);
              const { level: stockLevel } = getProductStockStatus(product);
              const isLowStock = stockLevel > 0 && stockLevel <= 10;
              const isOutOfStock = stockLevel <= 0;

              return (
                <button 
                  key={product.id}
                  type="button"
                  disabled={isOutOfStock}
                  onClick={() => addToCart(product)}
                  className={`bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border transition-all text-left flex flex-col justify-between group min-h-[12.5rem] relative overflow-hidden active:scale-95 ${
                    isOutOfStock ? 'opacity-50 grayscale cursor-not-allowed border-slate-200 dark:border-slate-800' : 
                    isTrending ? 'border-amber-200 dark:border-amber-900/50 ring-2 ring-amber-50 dark:ring-amber-900/10' : 
                    'border-slate-100 dark:border-slate-800 hover:shadow-xl hover:border-blue-400 dark:hover:border-blue-600'
                  }`}
                >
                  <div className="relative z-10 pointer-events-none">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className={`text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-widest ${
                          product.category.startsWith('PRINT') ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30' : 
                          product.category.startsWith('DESIGN') ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/30' : 
                          product.category === 'WEDDING_INVITATION' ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/30' :
                          'bg-slate-50 text-slate-500 dark:bg-slate-800'
                        }`}>
                          {product.category.split('_')[1] || product.category}
                        </span>
                        {isTrending && (
                          <span className="bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 text-[8px] font-black px-2 py-1 rounded-full flex items-center gap-1 animate-pulse">
                            <Flame size={10} fill="currentColor" /> TRENDING
                          </span>
                        )}
                      </div>
                      {isOutOfStock ? (
                         <span className="bg-red-50 text-red-600 text-[8px] font-black px-2 py-1 rounded-full uppercase flex items-center gap-1">
                           <Lock size={10} /> LOCK
                         </span>
                      ) : isLowStock ? (
                         <span className="bg-orange-50 text-orange-600 text-[8px] font-black px-2 py-1 rounded-full uppercase flex items-center gap-1">
                           <AlertCircle size={10} /> REFILL
                         </span>
                      ) : null}
                    </div>
                    <h3 className={`font-black uppercase text-xs leading-tight line-clamp-2 mb-2 tracking-tight ${isTrending ? 'text-slate-900 dark:text-amber-100' : 'text-slate-800 dark:text-slate-100'}`}>
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{product.unit}</p>
                      {stockLevel > 0 && (
                        <p className="text-[8px] font-black text-slate-300 uppercase tracking-tighter">Stock: {stockLevel}</p>
                      )}
                    </div>
                  </div>
                  <div className="mt-5 flex items-center justify-between relative z-10 pointer-events-none">
                    <p className={`text-base font-black ${isTrending ? 'text-amber-600 dark:text-amber-400' : 'text-blue-600 dark:text-blue-400'}`}>
                      {currentCurrency} {product.price.toLocaleString()}
                    </p>
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all transform shadow-sm ${
                      isOutOfStock ? 'bg-slate-100 text-slate-300' :
                      isTrending 
                        ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-500 group-hover:bg-amber-500 group-hover:text-white' 
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:bg-blue-600 group-hover:text-white'
                    }`}>
                      {isTrending ? <Zap size={18} fill={isTrending ? "currentColor" : "none"} /> : <Plus size={18} />}
                    </div>
                  </div>
                  <div className="absolute -right-6 -bottom-6 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity pointer-events-none">
                    {isTrending ? <Flame size={140} /> : <ShoppingBag size={140} />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Cart Sidebar */}
      <div className={`w-full md:w-[440px] bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-2xl flex flex-col h-full transition-all overflow-hidden shrink-0 z-10 ${cartAnimate ? 'scale-[1.01] ring-2 ring-blue-500/20' : ''}`}>
        <div className="p-6 border-b dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 shrink-0">
          <div className="flex items-center justify-between gap-4 mb-4">
             <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Checkout Session</h2>
             <button type="button" onClick={clearCart} disabled={cart.length === 0} className="flex items-center gap-2 text-[10px] font-black uppercase text-red-500 hover:text-red-600 disabled:opacity-30 transition-all">
                <RotateCcw size={14} /> Clear Cart
             </button>
          </div>

          <div className="relative" ref={customerSearchRef}>
            <div 
              onClick={() => setIsCustomerSearchOpen(!isCustomerSearchOpen)}
              className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-3xl cursor-pointer border dark:border-slate-700 hover:shadow-md transition-all shadow-sm"
            >
              <div className="w-12 h-12 rounded-[1.25rem] bg-blue-600 flex items-center justify-center text-white text-base font-black uppercase shadow-lg shadow-blue-200 dark:shadow-none">
                {currentCustomer?.name[0] || 'W'}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-xs font-black dark:text-white truncate uppercase tracking-tight">{currentCustomer?.name || 'Walk-in Client'}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{currentCustomer?.phone || 'Retail Settlement'}</p>
              </div>
              <ChevronDown size={18} className={`text-slate-400 transition-transform ${isCustomerSearchOpen ? 'rotate-180' : ''}`} />
            </div>

            {isCustomerSearchOpen && (
              <div className="absolute top-full left-0 right-0 mt-3 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-3xl shadow-2xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                 <div className="p-4 border-b dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center gap-3">
                   <Search size={18} className="text-slate-400" />
                   <input 
                    autoFocus
                    type="text" 
                    placeholder="Identify Client..." 
                    className="bg-transparent flex-1 outline-none text-xs font-black dark:text-white uppercase tracking-widest"
                    value={customerSearchTerm}
                    onChange={(e) => setCustomerSearchTerm(e.target.value)}
                   />
                 </div>
                 <div className="max-h-72 overflow-y-auto custom-scrollbar">
                   {filteredCustomers.length > 0 ? (
                     filteredCustomers.map(c => (
                      <button 
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setSelectedCustomerId(c.id);
                          setIsCustomerSearchOpen(false);
                          setCustomerSearchTerm('');
                        }}
                        className="w-full text-left p-5 hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center gap-5 transition-all border-b last:border-0 dark:border-slate-800"
                      >
                        <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-sm text-slate-500 uppercase">
                          {c.name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-black dark:text-white uppercase tracking-tight">{c.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{c.phone}</p>
                        </div>
                      </button>
                     ))
                   ) : (
                     <div className="p-8 text-center">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">No results for "{customerSearchTerm}"</p>
                        <button 
                          type="button"
                          onClick={() => { setShowNewCustomerModal(true); setIsCustomerSearchOpen(false); }}
                          className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-100 transition-all"
                        >
                          + New Client Profile
                        </button>
                     </div>
                   )}
                 </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-800 opacity-60 space-y-6">
              <ShoppingCart size={96} strokeWidth={1.5} className="text-slate-100 dark:text-slate-800" />
              <div className="text-center">
                 <p className="font-black text-sm uppercase tracking-[0.4em] mb-2">Cart is empty</p>
                 <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Ready for transaction</p>
              </div>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-[2rem] space-y-4 group border border-transparent hover:border-blue-100 dark:hover:border-blue-900/30 transition-all shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-[9px] font-black text-blue-600 uppercase tracking-[0.25em] mb-1.5">{item.category.replace(/_/g, ' ')}</p>
                    <p className="text-xs font-black line-clamp-2 dark:text-slate-100 uppercase leading-tight">{item.name}</p>
                  </div>
                  <button type="button" onClick={() => updateQuantity(item.id, -item.quantity)} className="p-2.5 text-slate-300 dark:text-slate-600 hover:text-red-500 transition-colors">
                    <Trash2 size={20} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-5">
                   <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block px-1">Unit Price</label>
                      <div className="relative">
                        <Edit2 size={12} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400" />
                        <input 
                          type="number" 
                          className="w-full bg-white dark:bg-slate-900 border dark:border-slate-700 rounded-2xl pl-10 pr-4 py-2.5 text-sm font-black outline-none dark:text-white focus:ring-2 ring-blue-500/20 transition-all shadow-sm"
                          value={item.price || ''}
                          onChange={(e) => updateItemPrice(item.id, Number(e.target.value))}
                        />
                      </div>
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block px-1">Disc/Unit</label>
                      <div className="relative">
                        <Tag size={12} className="absolute left-4 top-1/2 -translate-y-1/2 text-red-400" />
                        <input 
                          type="number" 
                          placeholder="0.00"
                          className="w-full bg-white dark:bg-slate-900 border dark:border-slate-700 rounded-2xl pl-10 pr-4 py-2.5 text-sm font-black outline-none text-red-500 focus:ring-2 ring-red-500/20 transition-all shadow-sm"
                          value={item.itemDiscount || ''}
                          onChange={(e) => updateItemDiscount(item.id, Number(e.target.value))}
                        />
                      </div>
                   </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t dark:border-slate-700">
                   <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border dark:border-slate-700 rounded-2xl px-3 py-1.5 shadow-sm">
                      <button type="button" onClick={() => updateQuantity(item.id, -1)} className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                        <Minus size={16} />
                      </button>
                      <span className="text-sm font-black w-10 text-center dark:text-slate-200">{item.quantity}</span>
                      <button type="button" onClick={() => addToCart(item)} className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                        <Plus size={16} />
                      </button>
                   </div>
                   <div className="text-right">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Line Total</p>
                      <p className="text-base font-black text-slate-800 dark:text-white leading-none">{currentCurrency} {((item.price - (item.itemDiscount || 0)) * item.quantity).toLocaleString()}</p>
                   </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Grand Total Bar */}
        <div className="p-8 bg-slate-950 text-white rounded-t-[3.5rem] space-y-5 shadow-2xl shrink-0">
          <div className="space-y-2.5 px-2">
             <div className="flex justify-between text-[11px] text-slate-500 font-black uppercase tracking-widest">
                <span>Gross Amount</span>
                <span>{currentCurrency} {subtotal.toLocaleString()}</span>
             </div>
             <div className="flex items-center justify-between gap-6 py-4 border-y border-white/10 my-3">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Global Adjust</span>
                <div className="relative w-36">
                   <Tag size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500" />
                   <input 
                    type="number" 
                    className="w-full bg-white/10 border border-white/20 rounded-2xl pl-11 pr-4 py-2.5 text-xs font-black outline-none text-red-400 focus:border-red-500 transition-all"
                    value={orderDiscount || ''}
                    onChange={(e) => setOrderDiscount(Number(e.target.value))}
                    placeholder="0.00"
                   />
                </div>
             </div>
          </div>
          <div className="flex justify-between items-center px-2 py-3">
            <div className="space-y-1">
              <span className="font-black text-slate-500 uppercase tracking-[0.4em] text-[10px] block">Grand Total Due</span>
              <span className="font-black text-5xl text-white tracking-tighter leading-none">{currentCurrency} {totalLocal.toLocaleString()}</span>
            </div>
          </div>
          <button 
            type="button"
            disabled={cart.length === 0}
            onClick={() => { setShowCheckout(true); setCheckoutComplete(false); }}
            className="w-full bg-blue-600 text-white font-black py-7 rounded-[2.5rem] shadow-xl hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale uppercase tracking-[0.4em] text-sm flex items-center justify-center gap-4"
          >
            START CHECKOUT <ArrowRight size={22} />
          </button>
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckout && !checkoutComplete && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl z-[150] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] w-full max-w-4xl shadow-2xl border dark:border-slate-800 overflow-hidden animate-in zoom-in duration-300 flex flex-col md:flex-row">
            <div className="flex-1 p-12 space-y-10">
              <div className="flex items-center justify-between">
                <button type="button" onClick={() => setShowCheckout(false)} className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors">
                  <ArrowLeft size={18} /> Back to Catalog
                </button>
                <h2 className="text-3xl font-black dark:text-white uppercase tracking-tighter">Settlement</h2>
              </div>
              <div className="space-y-8">
                <div>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-6">Choose Payment Method</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <PaymentMethodItem icon={Banknote} label="Cash Payment" active={selectedMethod === PaymentMethod.CASH} onClick={() => setSelectedMethod(PaymentMethod.CASH)} />
                    <PaymentMethodItem icon={CreditCard} label="Card Terminal" active={selectedMethod === PaymentMethod.CARD} onClick={() => setSelectedMethod(PaymentMethod.CARD)} />
                    <PaymentMethodItem icon={ArrowRightLeft} label="Bank Transfer" active={selectedMethod === PaymentMethod.BANK_TRANSFER} onClick={() => setSelectedMethod(PaymentMethod.BANK_TRANSFER)} />
                    <PaymentMethodItem icon={QrCode} label="Dynamic QR" active={selectedMethod === PaymentMethod.QR} onClick={() => setSelectedMethod(PaymentMethod.QR)} />
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-6">Deposit Destination</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {accounts.map(acc => (
                      <button 
                        key={acc.id}
                        type="button"
                        onClick={() => setSelectedAccountId(acc.id)}
                        className={`p-6 rounded-3xl border-2 transition-all flex items-center justify-between ${selectedAccountId === acc.id ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/20' : 'border-slate-100 dark:border-slate-800 opacity-60 hover:opacity-100'}`}
                      >
                        <div className="flex items-center gap-4">
                          <Wallet className={selectedAccountId === acc.id ? 'text-blue-600' : 'text-slate-400'} size={24} />
                          <div className="text-left">
                            <p className="font-black text-sm uppercase dark:text-white tracking-tight">{acc.name}</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{acc.type}</p>
                          </div>
                        </div>
                        {selectedAccountId === acc.id && <CheckCircle2 size={20} className="text-blue-600" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full md:w-[380px] bg-slate-50 dark:bg-slate-800/50 p-12 flex flex-col justify-between border-l dark:border-slate-800">
               <div className="space-y-8">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Transaction Details</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-xs font-black text-slate-500 uppercase tracking-widest">
                       <span>Total Items</span>
                       <span className="text-slate-900 dark:text-white">{cart.reduce((a,b)=>a+b.quantity,0)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-black text-slate-500 uppercase tracking-widest">
                       <span>Client</span>
                       <span className="text-slate-900 dark:text-white">{currentCustomer?.name || 'Walk-in'}</span>
                    </div>
                    <div className="pt-6 border-t dark:border-slate-700">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-2">Net Payable</p>
                       <p className="text-5xl font-black text-blue-600 dark:text-blue-400 tracking-tighter">{currentCurrency} {totalLocal.toLocaleString()}</p>
                    </div>
                  </div>
               </div>
               <button 
                type="button"
                onClick={handlePayment}
                className="w-full bg-blue-600 text-white font-black py-8 rounded-3xl shadow-xl hover:bg-blue-700 active:scale-95 transition-all uppercase tracking-[0.3em] text-sm mt-10"
               >
                 Confirm & Complete
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {checkoutComplete && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-2xl z-[200] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[4rem] w-full max-w-xl p-16 text-center animate-in zoom-in duration-500 border dark:border-slate-800 shadow-2xl">
            <div className="w-32 h-32 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-[3rem] flex items-center justify-center mx-auto mb-10 shadow-lg shadow-green-100 dark:shadow-none">
              <CheckCircle size={64} strokeWidth={2.5} className="animate-bounce" />
            </div>
            <h2 className="text-4xl font-black dark:text-white uppercase tracking-tighter mb-4">Transaction Successful</h2>
            <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs mb-12">Entry logged in branch {currentCurrency} records</p>
            
            <div className="grid grid-cols-1 gap-4 mb-12">
               <button onClick={handleWhatsAppReceipt} className="w-full py-6 rounded-3xl bg-green-600 text-white font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-green-700 transition-all shadow-xl shadow-green-100 dark:shadow-none">
                  <MessageCircle size={20} /> WhatsApp Receipt
               </button>
               <button onClick={() => window.print()} className="w-full py-6 rounded-3xl bg-slate-900 dark:bg-slate-800 text-white font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-slate-800 transition-all">
                  <Printer size={20} /> Print Physical Receipt
               </button>
            </div>

            <button 
              type="button"
              onClick={resetPOS}
              className="font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.5em] text-sm hover:underline"
            >
              Start New Session
            </button>
          </div>
        </div>
      )}

      {/* Other Modals (New Customer/Product) */}
      {showNewCustomerModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[110] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-md p-10 animate-in zoom-in border dark:border-slate-800">
             <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black dark:text-white uppercase tracking-tight">Quick Add Client</h2>
                <button onClick={() => setShowNewCustomerModal(false)} className="p-2 hover:bg-slate-100 rounded-full dark:text-white"><X size={24} /></button>
             </div>
             <form onSubmit={handleCreateCustomer} className="space-y-6">
                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Customer Name</label>
                   <input required type="text" className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-bold" value={newCustomerForm.name} onChange={e => setNewCustomerForm({...newCustomerForm, name: e.target.value})} />
                </div>
                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Phone / WhatsApp</label>
                   <input required type="text" className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-bold" value={newCustomerForm.phone} onChange={e => setNewCustomerForm({...newCustomerForm, phone: e.target.value})} />
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-blue-700 transition-all uppercase tracking-[0.2em] text-xs">
                  Create Client Record
                </button>
             </form>
          </div>
        </div>
      )}

      {showNewProductModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[110] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-md p-10 animate-in zoom-in border dark:border-slate-800">
             <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black dark:text-white uppercase tracking-tight">Add Custom Item</h2>
                <button onClick={() => setShowNewProductModal(false)} className="p-2 hover:bg-slate-100 rounded-full dark:text-white"><X size={24} /></button>
             </div>
             <form onSubmit={handleCreateProduct} className="space-y-6">
                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Item Name</label>
                   <input required type="text" className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-bold" value={newProductForm.name} onChange={e => setNewProductForm({...newProductForm, name: e.target.value})} />
                </div>
                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Unit Price ({currentCurrency})</label>
                   <input required type="number" className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-2xl px-6 py-4 outline-none dark:text-white font-black text-xl" value={newProductForm.price || ''} onChange={e => setNewProductForm({...newProductForm, price: Number(e.target.value)})} />
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-blue-700 transition-all uppercase tracking-[0.2em] text-xs">
                  Add to Active Cart
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

const PaymentMethodItem = ({ icon: Icon, label, active, onClick }: any) => (
  <button 
    type="button"
    onClick={onClick}
    className={`flex flex-col items-center justify-center p-8 rounded-[3rem] border-2 transition-all gap-5 ${
      active 
      ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 shadow-2xl shadow-blue-50 dark:shadow-none scale-105' 
      : 'border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-700 text-slate-400 dark:text-slate-500'
    }`}
  >
    <Icon size={48} strokeWidth={active ? 2.5 : 1.5} />
    <span className="font-black text-xs uppercase tracking-widest">{label}</span>
  </button>
);
const ArrowRightLeft = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m17 3 4 4-4 4"/><path d="M21 7H3"/><path d="m7 21-4-4 4-4"/><path d="M3 17h18"/></svg>
);

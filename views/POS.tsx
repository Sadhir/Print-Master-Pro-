
import React, { useState, useEffect } from 'react';
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
  User
} from 'lucide-react';
import { MOCK_PRODUCTS } from '../constants';
import { PaymentMethod, CurrencyCode, OrderSource, UserRole } from '../types';
import { useApp } from '../context/AppContext';

export const POS = () => {
  const { addTransaction, updateInventory, customers, currentCurrency, staff, currentUser } = useApp();
  const [cart, setCart] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [customer, setCustomer] = useState(customers[0]);
  const [discount, setDiscount] = useState(0);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutComplete, setCheckoutComplete] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  
  // Find current active staff ID for reporting
  const activeStaff = staff.find(s => s.name === currentUser.name);

  // Foreign currency states
  const [useForeignCurrency, setUseForeignCurrency] = useState(false);
  const [foreignCurrency, setForeignCurrency] = useState<CurrencyCode>(CurrencyCode.USD);
  const [exchangeRate, setExchangeRate] = useState(300);
  const [foreignAmount, setForeignAmount] = useState(0);

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const totalLocal = subtotal - discount;

  // Auto-calculate foreign or local based on toggle
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
      setCart([...cart, { ...product, quantity: 1 }]);
    }
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

  const filteredProducts = MOCK_PRODUCTS.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePayment = () => {
    addTransaction({
      amount: totalLocal,
      currency: currentCurrency,
      type: 'SALE',
      source: OrderSource.WALK_IN, // POS is primarily Walk-in
      paymentMethod: selectedMethod,
      description: `POS Sale to ${customer.name} - ${cart.length} items`,
      customerId: customer.id,
      staffId: activeStaff?.id, // Link to staff for EOD reporting
      ...(useForeignCurrency ? {
        foreignAmount: foreignAmount,
        foreignCurrency: foreignCurrency,
        exchangeRate: exchangeRate
      } : {})
    });

    cart.forEach(item => {
      updateInventory(item.id.replace('p', 'i'), -item.quantity);
    });

    setCheckoutComplete(true);
    setTimeout(() => {
      setCheckoutComplete(false);
      setShowCheckout(false);
      setCart([]);
      setDiscount(0);
      setUseForeignCurrency(false);
    }, 2000);
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col md:flex-row gap-6 animate-in slide-in-from-bottom duration-500">
      <div className="flex-1 flex flex-col gap-6">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-3 transition-colors">
          <Search className="text-slate-400 dark:text-slate-500" />
          <input 
            type="text" 
            placeholder="Search products..." 
            className="flex-1 outline-none text-lg bg-transparent dark:text-white dark:placeholder:text-slate-600"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 pb-4">
          {filteredProducts.map(product => (
            <button 
              key={product.id}
              onClick={() => addToCart(product)}
              className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all text-left flex flex-col justify-between group h-40"
            >
              <div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  product.category === 'PRINTING' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                }`}>
                  {product.category}
                </span>
                <h3 className="font-bold text-slate-700 dark:text-slate-200 mt-2 line-clamp-2">{product.name}</h3>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{currentCurrency} {product.price.toLocaleString()}</p>
                <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Plus size={16} />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="w-full md:w-96 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col sticky top-8 h-full transition-colors">
        <div className="p-4 border-b dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400 text-xs font-bold uppercase">
              {customer.name[0]}
            </div>
            <div className="text-left">
              <p className="text-sm font-bold dark:text-slate-200">{customer.name}</p>
              <div className="flex items-center gap-1">
                <User size={10} className="text-blue-600" />
                <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-black">Walk-in Client</p>
              </div>
            </div>
          </div>
          <button className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-2 rounded-lg transition-colors">
            <UserPlus size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 opacity-50 space-y-2">
              <ShoppingCart size={48} />
              <p className="font-bold text-sm">Cart is empty</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex items-center gap-3 group">
                <div className="flex-1">
                  <p className="text-sm font-bold line-clamp-1 dark:text-slate-200">{item.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{currentCurrency} {item.price.toLocaleString()} / {item.unit}</p>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-lg px-2 py-1">
                  <button onClick={() => updateQuantity(item.id, -1)} className="p-1 text-slate-400 dark:text-slate-500 hover:text-blue-600">
                    <Minus size={14} />
                  </button>
                  <span className="text-sm font-bold w-4 text-center dark:text-slate-200">{item.quantity}</span>
                  <button onClick={() => addToCart(item)} className="p-1 text-slate-400 dark:text-slate-500 hover:text-blue-600">
                    <Plus size={14} />
                  </button>
                </div>
                <button onClick={() => updateQuantity(item.id, -item.quantity)} className="p-2 text-slate-300 dark:text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-b-2xl border-t dark:border-slate-800 space-y-3">
          <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 font-bold uppercase text-[10px] tracking-widest">
            <span>Subtotal</span>
            <span className="dark:text-slate-200">{currentCurrency} {subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t dark:border-slate-800">
            <span className="font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest text-xs">Total</span>
            <span className="font-black text-3xl text-blue-600 dark:text-blue-400">{currentCurrency} {totalLocal.toLocaleString()}</span>
          </div>
          <button 
            disabled={cart.length === 0}
            onClick={() => {
              setShowCheckout(true);
            }}
            className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-100 dark:shadow-none hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 disabled:shadow-none uppercase tracking-widest"
          >
            CHECKOUT
          </button>
        </div>
      </div>

      {showCheckout && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[40px] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in duration-300 relative border dark:border-slate-800">
            <button onClick={() => setShowCheckout(false)} className="absolute top-8 right-8 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors dark:text-white"><X size={24} /></button>
            <div className="p-12">
              {checkoutComplete ? (
                <div className="text-center space-y-4 animate-in fade-in zoom-in">
                  <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 size={64} />
                  </div>
                  <h1 className="text-4xl font-black dark:text-white">Order Success!</h1>
                  <p className="text-slate-500 dark:text-slate-400 font-medium">Receipt sent to client via WhatsApp.</p>
                </div>
              ) : (
                <>
                  <div className="text-center mb-10">
                    <div className="flex flex-col items-center">
                      <div className="flex items-center gap-3 mb-6 bg-slate-50 dark:bg-slate-800 p-2 rounded-2xl border dark:border-slate-700">
                        <input 
                          type="checkbox" 
                          id="posUseForeign" 
                          className="w-5 h-5 accent-blue-600"
                          checked={useForeignCurrency}
                          onChange={e => setUseForeignCurrency(e.target.checked)}
                        />
                        <label htmlFor="posUseForeign" className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 cursor-pointer flex items-center gap-2">
                          <Globe size={14} /> Foreign Order
                        </label>
                      </div>

                      {useForeignCurrency ? (
                        <div className="w-full space-y-4 animate-in slide-in-from-top-2">
                          <div className="flex items-center justify-center gap-4">
                            <select 
                              value={foreignCurrency}
                              onChange={(e) => setForeignCurrency(e.target.value as CurrencyCode)}
                              className="bg-slate-100 dark:bg-slate-800 text-lg font-black uppercase rounded-xl px-4 py-2 outline-none dark:text-white border dark:border-slate-700"
                            >
                              {Object.entries(CurrencyCode).filter(([k]) => k !== 'LKR').map(([key, value]) => (
                                <option key={key} value={value}>{key} ({value})</option>
                              ))}
                            </select>
                            <h1 className="text-5xl font-black text-slate-900 dark:text-white">
                              {foreignCurrency} {foreignAmount.toLocaleString()}
                            </h1>
                          </div>
                          <div className="flex items-center justify-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest">
                            <span>Local: {currentCurrency} {totalLocal.toLocaleString()}</span>
                            <ArrowRight size={12} />
                            <div className="flex items-center gap-1">
                               <span>Rate:</span>
                               <input 
                                type="number" 
                                className="w-20 bg-transparent border-b border-slate-300 dark:border-slate-600 text-center outline-none dark:text-white"
                                value={exchangeRate}
                                onChange={e => setExchangeRate(Number(e.target.value))}
                               />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <h1 className="text-6xl font-black text-slate-900 dark:text-white">
                          {currentCurrency} {totalLocal.toLocaleString()}
                        </h1>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-10">
                    <PaymentMethodItem icon={Banknote} label="Cash" active={selectedMethod === PaymentMethod.CASH} onClick={() => setSelectedMethod(PaymentMethod.CASH)} />
                    <PaymentMethodItem icon={CreditCard} label="Card" active={selectedMethod === PaymentMethod.CARD} onClick={() => setSelectedMethod(PaymentMethod.CARD)} />
                    <PaymentMethodItem icon={QrCode} label="QR Pay" active={selectedMethod === PaymentMethod.QR} onClick={() => setSelectedMethod(PaymentMethod.QR)} />
                    <PaymentMethodItem icon={MessageCircle} label="Transfer" active={selectedMethod === PaymentMethod.BANK_TRANSFER} onClick={() => setSelectedMethod(PaymentMethod.BANK_TRANSFER)} />
                  </div>

                  <div className="space-y-4">
                    <button 
                      onClick={handlePayment}
                      className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 dark:shadow-none"
                    >
                      CONFIRM & PRINT
                    </button>
                    <button 
                       className="w-full bg-slate-900 dark:bg-slate-800 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-800 dark:hover:bg-slate-700 transition-all"
                    >
                      <MessageCircle size={20} /> SHARE TO WHATSAPP
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const PaymentMethodItem = ({ icon: Icon, label, active, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center p-6 rounded-3xl border-2 transition-all gap-3 ${
      active 
      ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 shadow-sm' 
      : 'border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-700 text-slate-400 dark:text-slate-500'
    }`}
  >
    <Icon size={32} />
    <span className="font-black text-xs uppercase tracking-widest">{label}</span>
  </button>
);

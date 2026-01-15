
import React, { useState } from 'react';
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
  // Fix: Added missing ShoppingCart icon import
  ShoppingCart
} from 'lucide-react';
import { MOCK_PRODUCTS, MOCK_CUSTOMERS } from '../constants';
import { PaymentMethod } from '../types';

export const POS = () => {
  const [cart, setCart] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [customer, setCustomer] = useState(MOCK_CUSTOMERS[0]);
  const [discount, setDiscount] = useState(0);
  const [showCheckout, setShowCheckout] = useState(false);

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

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const total = subtotal - discount;

  const filteredProducts = MOCK_PRODUCTS.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col md:flex-row gap-6 animate-in slide-in-from-bottom duration-500">
      {/* Product Grid */}
      <div className="flex-1 flex flex-col gap-6">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
          <Search className="text-slate-400" />
          <input 
            type="text" 
            placeholder="Search products or scan barcode..." 
            className="flex-1 outline-none text-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 pb-4">
          {filteredProducts.map(product => (
            <button 
              key={product.id}
              onClick={() => addToCart(product)}
              className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-300 transition-all text-left flex flex-col justify-between group"
            >
              <div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  product.category === 'PRINTING' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                }`}>
                  {product.category}
                </span>
                <h3 className="font-bold text-slate-700 mt-2 line-clamp-2">{product.name}</h3>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <p className="text-lg font-bold text-blue-600">${product.price.toFixed(2)}</p>
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Plus size={16} />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Cart Panel */}
      <div className="w-full md:w-96 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col sticky top-8">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold">
              {customer.name[0]}
            </div>
            <div className="text-left">
              <p className="text-sm font-bold">{customer.name}</p>
              <p className="text-[10px] text-slate-500">Walk-in Customer</p>
            </div>
          </div>
          <button className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors">
            <UserPlus size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50 space-y-2">
              <ShoppingCart size={48} />
              <p>Cart is empty</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex items-center gap-3 group">
                <div className="flex-1">
                  <p className="text-sm font-bold line-clamp-1">{item.name}</p>
                  <p className="text-xs text-slate-500">${item.price.toFixed(2)} / {item.unit}</p>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-2 py-1">
                  <button onClick={() => updateQuantity(item.id, -1)} className="p-1 text-slate-400 hover:text-blue-600">
                    <Minus size={14} />
                  </button>
                  <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                  <button onClick={() => addToCart(item)} className="p-1 text-slate-400 hover:text-blue-600">
                    <Plus size={14} />
                  </button>
                </div>
                <button onClick={() => updateQuantity(item.id, -item.quantity)} className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="p-4 bg-slate-50 rounded-b-2xl border-t space-y-3">
          <div className="flex justify-between text-sm text-slate-600">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-slate-600">
            <span>Discount</span>
            <input 
              type="number" 
              className="w-16 bg-transparent text-right border-b border-dashed border-slate-300 outline-none" 
              value={discount}
              onChange={(e) => setDiscount(Number(e.target.value))}
            />
          </div>
          <div className="flex justify-between items-center pt-2 border-t">
            <span className="font-bold text-slate-800">Total</span>
            <span className="font-black text-2xl text-blue-600">${total.toFixed(2)}</span>
          </div>
          <button 
            disabled={cart.length === 0}
            onClick={() => setShowCheckout(true)}
            className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 disabled:shadow-none"
          >
            PAY NOW
          </button>
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="font-bold text-xl">Payment Details</h2>
              <button onClick={() => setShowCheckout(false)}><X size={24} /></button>
            </div>
            <div className="p-8">
              <div className="text-center mb-8">
                <p className="text-slate-500 text-sm uppercase tracking-widest font-bold">Total Amount Due</p>
                <h1 className="text-5xl font-black text-blue-600 mt-2">${total.toFixed(2)}</h1>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <PaymentBtn icon={Banknote} label="Cash" />
                <PaymentBtn icon={CreditCard} label="Card" />
                <PaymentBtn icon={QrCode} label="Scan QR" />
                <PaymentBtn icon={MessageCircle} label="Bank Transfer" />
              </div>

              <div className="space-y-4">
                <button className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2">
                  Complete & Print Receipt
                </button>
                <button 
                   onClick={() => {
                     const msg = `Hi ${customer.name}, your receipt from PrintMaster Pro for $${total} is ready. View it here: [link]`;
                     window.open(`https://wa.me/${customer.phone}?text=${encodeURIComponent(msg)}`, '_blank');
                   }}
                   className="w-full bg-green-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2"
                >
                  Share via WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const PaymentBtn = ({ icon: Icon, label }: any) => (
  <button className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50 transition-all gap-2 group">
    <Icon className="text-slate-400 group-hover:text-blue-600" size={32} />
    <span className="font-bold text-slate-600 group-hover:text-blue-700 text-sm">{label}</span>
  </button>
);

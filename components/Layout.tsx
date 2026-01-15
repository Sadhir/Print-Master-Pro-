
import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Briefcase, 
  FileText, 
  Users, 
  Package, 
  BarChart3, 
  Settings,
  Menu,
  X,
  Printer,
  Sun,
  Moon,
  PlusCircle,
  Globe,
  Wallet,
  Truck,
  ShieldCheck,
  UserCircle,
  CalendarDays,
  Cpu,
  Gem,
  MapPin,
  ChevronDown,
  Receipt
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { CurrencyCode, UserRole } from '../types';

const SidebarItem: React.FC<{ to: string, icon: any, label: string, active: boolean }> = ({ to, icon: Icon, label, active }) => (
  <Link
    to={to}
    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
      active 
        ? 'bg-blue-600 text-white shadow-md' 
        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </Link>
);

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { isDarkMode, toggleDarkMode, currentCurrency, setCurrency, currentUser, branches, selectedBranchId, setSelectedBranchId } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/pos', icon: ShoppingCart, label: 'POS System' },
    { to: '/jobs', icon: Briefcase, label: 'Job Management' },
    { to: '/suppliers', icon: Truck, label: 'Suppliers' },
    { to: '/billing', icon: FileText, label: 'Billing' },
    { to: '/overheads', icon: Receipt, label: 'Operational Bills', adminOnly: true },
    { to: '/finance', icon: Wallet, label: 'Partnership', adminOnly: true },
    { to: '/staff', icon: ShieldCheck, label: 'Staff HR', adminOnly: true },
    { to: '/machinery', icon: Cpu, label: 'Machinery', adminOnly: true },
    { to: '/assets', icon: Gem, label: 'Company Assets', adminOnly: true },
    { to: '/branches', icon: MapPin, label: 'Branches', adminOnly: true },
    { to: '/subscriptions', icon: CalendarDays, label: 'Subscriptions', adminOnly: true },
    { to: '/customers', icon: Users, label: 'Customers' },
    { to: '/inventory', icon: Package, label: 'Inventory' },
    { to: '/reports', icon: BarChart3, label: 'Reports' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  const visibleNavItems = navItems.filter(item => !item.adminOnly || currentUser.role === UserRole.ADMIN);

  const currentBranchName = selectedBranchId === 'ALL' 
    ? 'Global Overview' 
    : branches.find(b => b.id === selectedBranchId)?.name || 'Unknown Branch';

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <header className="md:hidden bg-white dark:bg-slate-900 border-b dark:border-slate-800 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Printer className="text-blue-600" />
          <span className="font-bold text-lg tracking-tight dark:text-white">PrintMaster Pro</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/pos')} className="p-2 bg-blue-600 text-white rounded-lg"><PlusCircle size={20} /></button>
          <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-slate-600">{isOpen ? <X size={24} /> : <Menu size={24} />}</button>
        </div>
      </header>

      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r dark:border-slate-800 transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 hidden md:flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg"><Printer className="text-white" size={24} /></div>
            <span className="font-bold text-xl tracking-tight dark:text-white">PrintMaster Pro</span>
          </div>
        </div>

        {/* Branch Switcher Section */}
        <div className="px-6 mb-6">
           <div className="relative group">
              <div className="p-4 bg-slate-900 dark:bg-blue-600 text-white rounded-2xl flex flex-col gap-1 cursor-pointer transition-all hover:scale-[1.02] shadow-lg">
                <p className="text-[8px] font-black uppercase tracking-[0.2em] opacity-70">Current Context</p>
                <div className="flex items-center justify-between gap-2">
                   <p className="font-black text-xs truncate uppercase tracking-tight">{currentBranchName}</p>
                   <ChevronDown size={14} />
                </div>
              </div>
              
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
                <button 
                  onClick={() => setSelectedBranchId('ALL')}
                  className={`w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-700 border-b dark:border-slate-700 ${selectedBranchId === 'ALL' ? 'text-blue-600' : 'text-slate-500'}`}
                >
                  All Branches
                </button>
                {branches.map(b => (
                  <button 
                    key={b.id}
                    onClick={() => setSelectedBranchId(b.id)}
                    className={`w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-700 ${selectedBranchId === b.id ? 'text-blue-600' : 'text-slate-500'}`}
                  >
                    {b.name}
                  </button>
                ))}
              </div>
           </div>
        </div>

        <div className="px-6 mb-6">
           <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center gap-3 border dark:border-slate-700">
             <UserCircle className="text-slate-400" size={32} />
             <div className="overflow-hidden">
               <p className="text-xs font-black dark:text-white truncate">{currentUser.name}</p>
               <p className="text-[8px] font-black text-blue-600 uppercase tracking-widest">{currentUser.role}</p>
             </div>
           </div>
        </div>

        <div className="px-3 mb-4 hidden md:block">
           <button onClick={() => navigate('/pos')} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3 rounded-xl shadow-lg hover:scale-[1.02] transition-all"><PlusCircle size={18} /> Quick Sale</button>
        </div>

        <nav className="px-3 space-y-1 overflow-y-auto max-h-[calc(100vh-450px)]">
          {visibleNavItems.map((item) => (
            <SidebarItem key={item.to} to={item.to} icon={item.icon} label={item.label} active={location.pathname === item.to} />
          ))}
        </nav>

        <div className="absolute bottom-6 left-6 right-6 space-y-4">
          <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 p-2 rounded-xl border dark:border-slate-700">
             <Globe size={16} className="text-slate-400" />
             <select value={currentCurrency} onChange={(e) => setCurrency(e.target.value as CurrencyCode)} className="bg-transparent text-xs font-bold uppercase outline-none dark:text-slate-300">
                {Object.entries(CurrencyCode).map(([key, value]) => <option key={key} value={value}>{key}</option>)}
             </select>
          </div>
          <button onClick={toggleDarkMode} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            <span className="font-medium">Theme</span>
          </button>
        </div>
      </aside>

      {isOpen && <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-30 md:hidden" onClick={() => setIsOpen(false)} />}
      <main className="flex-1 p-4 md:p-8 overflow-x-hidden">{children}</main>
    </div>
  );
};

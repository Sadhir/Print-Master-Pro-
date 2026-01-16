import React, { useState, useEffect } from 'react';
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
  Receipt,
  ListChecks,
  ChevronRight,
  DownloadCloud,
  LogOut,
  Fingerprint,
  CheckCircle2,
  Ghost,
  EyeOff,
  Eye,
  Calculator,
  Container,
  Download
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { CurrencyCode, UserRole, User } from '../types';

const NavGroup = ({ label, children }: { label: string, children?: React.ReactNode }) => {
  const validChildren = React.Children.toArray(children).filter(Boolean);
  if (validChildren.length === 0) return null;
  return (
    <div className="mb-6">
      <p className="px-4 mb-3 text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.25em]">{label}</p>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
};

const SidebarItem: React.FC<{ to: string, icon: any, label: string, active: boolean }> = ({ to, icon: Icon, label, active }) => (
  <Link
    to={to}
    className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all ${
      active 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-none' 
        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'
    }`}
  >
    <Icon size={20} strokeWidth={active ? 2.5 : 2} />
    <span className={`text-sm font-bold tracking-tight ${active ? 'opacity-100' : 'opacity-90'}`}>{label}</span>
    {active && <ChevronRight size={16} className="ml-auto opacity-50" />}
  </Link>
);

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileSwitcher, setShowProfileSwitcher] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pendingUser, setPendingUser] = useState<User | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  
  const { 
    isDarkMode, 
    toggleDarkMode, 
    isStealthMode,
    setIsStealthMode,
    currentCurrency, 
    setCurrency, 
    currentUser, 
    setCurrentUser,
    allUsers,
    branches, 
    selectedBranchId, 
    setSelectedBranchId 
  } = useApp();
  
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setDeferredPrompt(null);
  };

  const isAdmin = currentUser.role === UserRole.ADMIN;
  const isCashier = currentUser.role === UserRole.CASHIER;
  const isDesigner = currentUser.role === UserRole.DESIGNER;

  const currentBranchName = selectedBranchId === 'ALL' 
    ? 'Global Network' 
    : branches.find(b => b.id === selectedBranchId)?.name || 'Central Branch';

  const handleUserSelect = (user: User) => {
    if (user.pin) {
      setPendingUser(user);
      setPinInput('');
    } else {
      setCurrentUser(user);
      setShowProfileSwitcher(false);
    }
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pendingUser && pinInput === pendingUser.pin) {
      setCurrentUser(pendingUser);
      setShowProfileSwitcher(false);
      setPendingUser(null);
      setPinInput('');
    } else {
      alert("Incorrect Access PIN");
      setPinInput('');
    }
  };

  return (
    <div className="h-dvh w-full flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 overflow-hidden">
      {/* Mobile Top Bar */}
      <header className="md:hidden bg-white dark:bg-slate-900 border-b dark:border-slate-800 px-4 py-3 flex items-center justify-between shrink-0 z-50 no-print">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <Printer className="text-blue-600" size={20} />
          <span className="font-black text-sm uppercase tracking-tighter dark:text-white">PrintMaster PRO</span>
        </div>
        <div className="flex items-center gap-2">
           {isAdmin && (
            <button onClick={() => setIsStealthMode(!isStealthMode)} className={`p-2 rounded-lg transition-colors ${isStealthMode ? 'bg-amber-100 text-amber-600' : 'text-slate-400'}`}>
              <Ghost size={20} />
            </button>
           )}
           {deferredPrompt && (
              <button onClick={handleInstall} className="p-2 text-blue-600 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <Download size={20} />
              </button>
           )}
          <button onClick={() => setShowProfileSwitcher(true)} className={`w-8 h-8 rounded-lg ${currentUser.avatarColor || 'bg-blue-600'} text-white flex items-center justify-center font-black text-xs`}>
            {currentUser.name[0]}
          </button>
          <button type="button" onClick={() => setIsOpen(!isOpen)} className="p-2 text-slate-600 dark:text-slate-300">{isOpen ? <X size={24} /> : <Menu size={24} />}</button>
        </div>
      </header>

      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-72 bg-white dark:bg-slate-900 border-r dark:border-slate-800 transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0 shrink-0 no-print ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-8 hidden md:flex items-center gap-4 shrink-0">
            <div className="p-2.5 bg-blue-600 rounded-2xl shadow-lg shadow-blue-100 dark:shadow-none"><Printer className="text-white" size={24} /></div>
            <span className="font-black text-xl uppercase tracking-tighter dark:text-white">PrintMaster<span className="text-blue-600">PRO</span></span>
          </div>

          <div className="px-6 mb-8 shrink-0">
            <div className={`bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] p-5 border shadow-sm relative group/profile-card transition-colors ${isStealthMode ? 'border-amber-400/50 dark:border-amber-900/50' : 'dark:border-slate-800'}`}>
              <div className="flex items-center gap-4 mb-5">
                <div className={`w-12 h-12 rounded-2xl ${currentUser.avatarColor || 'bg-blue-600'} flex items-center justify-center text-white font-black text-lg shadow-md`}>
                  {currentUser.name[0]}
                </div>
                <div className="overflow-hidden flex-1">
                  <p className="text-sm font-black dark:text-white truncate uppercase">{currentUser.name}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{currentUser.role}</p>
                    {isStealthMode && <Ghost size={12} className="text-amber-500 animate-pulse" />}
                  </div>
                </div>
                <button 
                  onClick={() => setShowProfileSwitcher(true)}
                  className="p-2 text-slate-400 hover:text-blue-600 transition-colors bg-white dark:bg-slate-900 rounded-xl border dark:border-slate-700 shadow-sm"
                  title="Switch Account"
                >
                  <LogOut size={16} className="rotate-180" />
                </button>
              </div>
              
              <div className="relative group">
                <div className="p-3.5 bg-white dark:bg-slate-900 border dark:border-slate-700 rounded-2xl flex items-center justify-between cursor-pointer transition-all hover:border-blue-400 hover:shadow-md">
                   <div className="flex items-center gap-3 overflow-hidden">
                      <MapPin size={14} className="text-blue-500 shrink-0" />
                      <p className="text-xs font-black uppercase tracking-tight truncate">{currentBranchName}</p>
                      {isStealthMode && <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></div>}
                   </div>
                   <ChevronDown size={14} className="text-slate-400" />
                </div>
                
                <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden translate-y-1 group-hover:translate-y-0">
                  <button type="button" onClick={() => { setSelectedBranchId('ALL'); setIsOpen(false); }} className={`w-full text-left px-5 py-4 text-xs font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-700 border-b dark:border-slate-700 ${selectedBranchId === 'ALL' ? 'text-blue-600' : 'text-slate-500'}`}>All Branches</button>
                  {branches.map(b => (
                    <button key={b.id} type="button" onClick={() => { setSelectedBranchId(b.id); setIsOpen(false); }} className={`w-full text-left px-5 py-4 text-xs font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-700 ${selectedBranchId === b.id ? 'text-blue-600' : 'text-slate-500'}`}>{b.name}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-6 overflow-y-auto custom-scrollbar scroll-smooth">
            <SidebarItem to="/" icon={LayoutDashboard} label="Dashboard" active={location.pathname === '/'} />
            
            <NavGroup label="Core Production">
              {!isDesigner && <SidebarItem to="/pos" icon={ShoppingCart} label="Point of Sale" active={location.pathname === '/pos'} />}
              <SidebarItem to="/jobs" icon={Briefcase} label="Job Pipeline" active={location.pathname === '/jobs'} />
              <SidebarItem to="/costing" icon={Calculator} label="Cost Engine" active={location.pathname === '/costing'} />
              <SidebarItem to="/catalog" icon={ListChecks} label="Service Menu" active={location.pathname === '/catalog'} />
            </NavGroup>

            <NavGroup label="CRM & Stock">
              {!isDesigner && <SidebarItem to="/inventory" icon={Package} label="Inventory" active={location.pathname === '/inventory'} />}
              <SidebarItem to="/customers" icon={Users} label="Client CRM" active={location.pathname === '/customers'} />
              {isAdmin && <SidebarItem to="/suppliers" icon={Truck} label="Suppliers" active={location.pathname === '/suppliers'} />}
            </NavGroup>

            {isAdmin && (
              <NavGroup label="Admin Panel">
                <SidebarItem to="/billing" icon={FileText} label="Accounting" active={location.pathname === '/billing'} />
                <SidebarItem to="/overheads" icon={Receipt} label="Fixed Costs" active={location.pathname === '/overheads'} />
                <SidebarItem to="/finance" icon={Wallet} label="Partner Equity" active={location.pathname === '/finance'} />
                <SidebarItem to="/staff" icon={ShieldCheck} label="Team HR" active={location.pathname === '/staff'} />
                <SidebarItem to="/machinery" icon={Cpu} label="Hardware Hub" active={location.pathname === '/machinery'} />
                <SidebarItem to="/assets" icon={Gem} label="Assets" active={location.pathname === '/assets'} />
                <SidebarItem to="/branches" icon={MapPin} label="Branches" active={location.pathname === '/branches'} />
                <SidebarItem to="/subscriptions" icon={CalendarDays} label="Software" active={location.pathname === '/subscriptions'} />
              </NavGroup>
            )}

            <NavGroup label="Maintenance">
              {isAdmin && <SidebarItem to="/reports" icon={BarChart3} label="Reports" active={location.pathname === '/reports'} />}
              {isAdmin && <SidebarItem to="/settings" icon={Settings} label="System Config" active={location.pathname === '/settings'} />}
            </NavGroup>

            {deferredPrompt && (
              <div className="mt-8 px-4">
                <button 
                  onClick={handleInstall}
                  className="w-full flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 p-4 rounded-2xl border-2 border-blue-100 dark:border-blue-900/30 font-black text-xs uppercase tracking-widest hover:bg-blue-100 transition-all"
                >
                  <DownloadCloud size={18} />
                  Install Enterprise App
                </button>
              </div>
            )}
          </nav>

          <div className="p-6 shrink-0 border-t dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex-1 flex items-center justify-between bg-white dark:bg-slate-800 p-2.5 rounded-2xl border dark:border-slate-700 shadow-sm">
                 <Globe size={16} className="text-slate-400" />
                 <select value={currentCurrency} onChange={(e) => setCurrency(e.target.value as CurrencyCode)} className="bg-transparent text-[11px] font-black uppercase outline-none dark:text-slate-300">
                    {Object.entries(CurrencyCode).map(([key, value]) => <option key={key} value={value}>{key}</option>)}
                 </select>
              </div>
              <button 
                type="button" 
                onClick={toggleDarkMode} 
                className="p-3 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-2xl shadow-sm text-slate-600 dark:text-slate-400 hover:scale-105 active:scale-95 transition-all"
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase text-center tracking-[0.2em] opacity-50">Enterprise v3.4.1</p>
          </div>
        </div>
      </aside>

      {/* Profile Switcher Modal */}
      {showProfileSwitcher && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[200] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-lg p-10 shadow-2xl border dark:border-slate-800 animate-in zoom-in duration-300">
            {!pendingUser ? (
              <>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-black dark:text-white uppercase tracking-tight">Identity Hub</h2>
                  <button onClick={() => setShowProfileSwitcher(false)} className="p-2 hover:bg-slate-100 rounded-full dark:text-white"><X size={24} /></button>
                </div>
                <div className="grid grid-cols-1 gap-4">
                   {allUsers.map(user => (
                     <button 
                        key={user.id}
                        onClick={() => handleUserSelect(user)}
                        className={`p-6 rounded-[2.5rem] border-2 transition-all flex items-center justify-between group ${currentUser.id === user.id ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/20' : 'border-slate-100 dark:border-slate-800 hover:border-blue-200'}`}
                     >
                       <div className="flex items-center gap-4">
                          <div className={`w-14 h-14 rounded-2xl ${user.avatarColor || 'bg-blue-600'} flex items-center justify-center text-white font-black text-xl shadow-lg`}>
                            {user.name[0]}
                          </div>
                          <div className="text-left">
                            <p className="font-black text-sm uppercase dark:text-white tracking-tight">{user.name}</p>
                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{user.role}</p>
                          </div>
                       </div>
                       <ChevronRight size={20} className="text-slate-300 group-hover:text-blue-600 transition-colors" />
                     </button>
                   ))}
                </div>
              </>
            ) : (
              <div className="text-center space-y-8 py-4">
                 <div className={`w-24 h-24 rounded-3xl ${pendingUser.avatarColor || 'bg-blue-600'} flex items-center justify-center text-white font-black text-4xl shadow-2xl mx-auto mb-6`}>
                    {pendingUser.name[0]}
                 </div>
                 <div>
                    <h2 className="text-2xl font-black dark:text-white uppercase">Welcome, {pendingUser.name}</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">Authentication Required</p>
                 </div>
                 <form onSubmit={handlePinSubmit} className="space-y-6">
                    <input 
                      autoFocus
                      type="password" 
                      maxLength={4}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-2 dark:border-slate-700 rounded-2xl px-6 py-5 text-center font-black text-3xl tracking-[1em] outline-none focus:border-blue-600 transition-all dark:text-white"
                      value={pinInput}
                      onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                      placeholder="****"
                    />
                    <div className="flex gap-4">
                       <button type="button" onClick={() => setPendingUser(null)} className="flex-1 py-4 font-black text-slate-400 uppercase tracking-widest text-xs">Back</button>
                       <button type="submit" className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-100 dark:shadow-none">Verify PIN</button>
                    </div>
                 </form>
              </div>
            )}
          </div>
        </div>
      )}

      {isOpen && <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 md:hidden transition-all no-print" onClick={() => setIsOpen(false)} />}
      <main className="flex-1 overflow-hidden h-full flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 md:p-12 scroll-smooth custom-scrollbar">
          <div className="max-w-[1600px] mx-auto pb-12">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

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
  Printer
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const SidebarItem = ({ to, icon: Icon, label, active }: { to: string, icon: any, label: string, active: boolean }) => (
  <Link
    to={to}
    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
      active 
        ? 'bg-blue-600 text-white' 
        : 'text-slate-600 hover:bg-slate-100'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </Link>
);

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/pos', icon: ShoppingCart, label: 'POS System' },
    { to: '/jobs', icon: Briefcase, label: 'Job Management' },
    { to: '/billing', icon: FileText, label: 'Billing' },
    { to: '/customers', icon: Users, label: 'Customers' },
    { to: '/inventory', icon: Package, label: 'Inventory' },
    { to: '/reports', icon: BarChart3, label: 'Reports' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Mobile Header */}
      <header className="md:hidden bg-white border-b px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Printer className="text-blue-600" />
          <span className="font-bold text-lg tracking-tight">PrintMaster</span>
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-slate-600">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white border-r transform transition-transform duration-200 ease-in-out
        md:relative md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 hidden md:flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Printer className="text-white" size={24} />
          </div>
          <span className="font-bold text-xl tracking-tight">PrintMaster <span className="text-blue-600 italic">Pro</span></span>
        </div>

        <nav className="px-3 space-y-1">
          {navItems.map((item) => (
            // Fix: Explicitly pass individual props to SidebarItem to resolve key property type mismatch
            <SidebarItem
              key={item.to}
              to={item.to}
              icon={item.icon}
              label={item.label}
              active={location.pathname === item.to}
            />
          ))}
        </nav>

        <div className="absolute bottom-6 left-6 right-6 p-4 bg-slate-50 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
              AD
            </div>
            <div>
              <p className="text-sm font-semibold">Admin User</p>
              <p className="text-xs text-slate-500">Super Admin</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
};

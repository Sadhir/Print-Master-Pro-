
import React, { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  Users, 
  Package, 
  AlertCircle, 
  Plus, 
  FileText, 
  ShoppingCart, 
  Sparkles,
  // Fix: Added missing Briefcase icon import
  Briefcase
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';
import { analyzeSalesTrends } from '../services/geminiService';

const StatCard = ({ title, value, sub, icon: Icon, color }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-4">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
      <span className="text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded-full">+12%</span>
    </div>
    <h3 className="text-slate-500 text-sm font-medium">{title}</h3>
    <p className="text-2xl font-bold mt-1">{value}</p>
    <p className="text-slate-400 text-xs mt-1">{sub}</p>
  </div>
);

const data = [
  { name: 'Mon', sales: 4000 },
  { name: 'Tue', sales: 3000 },
  { name: 'Wed', sales: 2000 },
  { name: 'Thu', sales: 2780 },
  { name: 'Fri', sales: 1890 },
  { name: 'Sat', sales: 2390 },
  { name: 'Sun', sales: 3490 },
];

export const Dashboard = () => {
  const [insight, setInsight] = useState<string | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);

  useEffect(() => {
    const fetchInsight = async () => {
      setLoadingInsight(true);
      const res = await analyzeSalesTrends("Weekly sales total $19,550. Highest day Saturday. Low stocks in Glossy Paper.");
      setInsight(res);
      setLoadingInsight(false);
    };
    fetchInsight();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Good morning, Admin</h1>
          <p className="text-slate-500">Here's what's happening in your print shop today.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border font-medium text-slate-700 hover:bg-slate-50 transition-colors">
            <Plus size={18} /> New Quote
          </button>
          <button className="flex items-center gap-2 bg-blue-600 px-4 py-2 rounded-xl font-medium text-white shadow-lg shadow-blue-200 hover:bg-blue-700 transition-colors">
            <ShoppingCart size={18} /> Open POS
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Sales" value="$4,560.00" sub="From 24 orders today" icon={TrendingUp} color="bg-blue-500" />
        <StatCard title="Active Jobs" value="18" sub="5 currently outsourced" icon={Briefcase} color="bg-purple-500" />
        <StatCard title="New Customers" value="6" sub="Added this week" icon={Users} color="bg-orange-500" />
        <StatCard title="Low Stock Items" value="3" sub="Requires immediate attention" icon={AlertCircle} color="bg-red-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-lg">Sales Analytics</h2>
            <select className="bg-slate-50 border-none text-sm font-medium rounded-lg px-3 py-1 outline-none">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  cursor={{ stroke: '#3b82f6', strokeWidth: 2 }}
                />
                <Area type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-6 rounded-2xl text-white shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={20} className="text-yellow-300" />
              <h3 className="font-bold">AI Business Insights</h3>
            </div>
            {loadingInsight ? (
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-white/20 rounded w-full"></div>
                <div className="h-4 bg-white/20 rounded w-5/6"></div>
              </div>
            ) : (
              <p className="text-sm leading-relaxed text-indigo-100">
                {insight}
              </p>
            )}
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h2 className="font-bold mb-4">Recent Jobs</h2>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                      <FileText size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold">Banner Printing #{i}24</p>
                      <p className="text-xs text-slate-500">Alex Johnson • 2h ago</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full uppercase">Active</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

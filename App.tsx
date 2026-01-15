
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './views/Dashboard';
import { POS } from './views/POS';
import { JobManagement } from './views/JobManagement';
import { Inventory } from './views/Inventory';

// Placeholder for missing views to keep it functional
const Placeholder = ({ name }: { name: string }) => (
  <div className="flex items-center justify-center h-full min-h-[400px]">
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-2">{name} Module</h2>
      <p className="text-slate-500">This feature is coming soon in the next update.</p>
    </div>
  </div>
);

const App: React.FC = () => {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/pos" element={<POS />} />
          <Route path="/jobs" element={<JobManagement />} />
          <Route path="/billing" element={<Placeholder name="Billing & Invoicing" />} />
          <Route path="/customers" element={<Placeholder name="Customer CRM" />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/reports" element={<Placeholder name="Reports & Analytics" />} />
          <Route path="/settings" element={<Placeholder name="Settings & Roles" />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;


import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { AppProvider } from './context/AppContext';
import { Dashboard } from './views/Dashboard';
import { POS } from './views/POS';
import { JobManagement } from './views/JobManagement';
import { Inventory } from './views/Inventory';
import { Customers } from './views/Customers';
import { Billing } from './views/Billing';
import { Reports } from './views/Reports';
import { Settings } from './views/Settings';
import { Finance } from './views/Finance';
import { Suppliers } from './views/Suppliers';
import { StaffManagement } from './views/StaffManagement';
import { Subscriptions } from './views/Subscriptions';
import { MachineryManagement } from './views/MachineryManagement';
import { BranchManagement } from './views/BranchManagement';
import { AssetsManagement } from './views/AssetsManagement';
import { OperationsOverhead } from './views/OperationsOverhead';

const App: React.FC = () => {
  return (
    <AppProvider>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/pos" element={<POS />} />
            <Route path="/jobs" element={<JobManagement />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/billing" element={<Billing />} />
            <Route path="/overheads" element={<OperationsOverhead />} />
            <Route path="/finance" element={<Finance />} />
            <Route path="/staff" element={<StaffManagement />} />
            <Route path="/subscriptions" element={<Subscriptions />} />
            <Route path="/machinery" element={<MachineryManagement />} />
            <Route path="/branches" element={<BranchManagement />} />
            <Route path="/assets" element={<AssetsManagement />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Layout>
      </HashRouter>
    </AppProvider>
  );
};

export default App;

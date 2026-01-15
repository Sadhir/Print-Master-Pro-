
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Customer, Product, Job, InventoryItem, Transaction, JobStatus, 
  PaymentMethod, CurrencyCode, StorageProvider, Supplier, Partner, FinancialAccount,
  StaffMember, AttendanceRecord, PayrollRecord, UserRole, BusinessSubscription, StaffDuty, DutyStatus, OrderSource,
  Machinery, MachineryService, CompanyAsset, Branch, BusinessCommitment, CommitmentCategory
} from '../types';
import { 
  MOCK_CUSTOMERS, MOCK_PRODUCTS, MOCK_JOBS, MOCK_INVENTORY, 
  MOCK_SUPPLIERS, MOCK_PARTNERS, MOCK_ACCOUNTS, MOCK_STAFF,
  MOCK_SUBSCRIPTIONS, MOCK_DUTIES, MOCK_MACHINERY, MOCK_MACHINERY_SERVICES,
  MOCK_BRANCHES, MOCK_ASSETS
} from '../constants';
import { driveService } from '../services/googleDriveService';
import { oneDriveService } from '../services/oneDriveService';

interface AppContextType {
  currentUser: { name: string; role: UserRole };
  setCurrentRole: (role: UserRole) => void;
  selectedBranchId: string;
  setSelectedBranchId: (id: string) => void;
  customers: Customer[];
  branches: Branch[];
  allAssets: CompanyAsset[];
  assets: CompanyAsset[];
  suppliers: Supplier[];
  partners: Partner[];
  allAccounts: FinancialAccount[];
  accounts: FinancialAccount[];
  allStaff: StaffMember[];
  staff: StaffMember[];
  allDuties: StaffDuty[];
  duties: StaffDuty[];
  subscriptions: BusinessSubscription[];
  allMachinery: Machinery[];
  machinery: Machinery[];
  machineServices: MachineryService[];
  attendance: AttendanceRecord[];
  payroll: PayrollRecord[];
  products: Product[];
  allJobs: Job[];
  jobs: Job[];
  allInventory: InventoryItem[];
  inventory: InventoryItem[];
  allTransactions: Transaction[];
  transactions: Transaction[];
  allCommitments: BusinessCommitment[];
  commitments: BusinessCommitment[];
  isDarkMode: boolean;
  currentCurrency: CurrencyCode;
  isCloudConnected: StorageProvider | null;
  lastSync: string | null;
  reviewLinks: { google: string; facebook: string };
  setReviewLinks: (links: { google: string; facebook: string }) => void;
  toggleDarkMode: () => void;
  setCurrency: (code: CurrencyCode) => void;
  addTransaction: (t: Omit<Transaction, 'id' | 'timestamp' | 'branchId'>) => void;
  deleteTransaction: (id: string) => void;
  transferFunds: (fromId: string, toId: string, amount: number) => void;
  addJob: (j: Omit<Job, 'id' | 'createdAt' | 'updatedAt' | 'branchId'>) => void;
  updateJob: (id: string, updates: Partial<Job>) => void;
  deleteJob: (id: string) => void;
  updateJobStatus: (id: string, status: JobStatus) => void;
  updateInventory: (itemId: string, delta: number) => void;
  addCustomer: (c: Omit<Customer, 'id'>) => void;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  addBranch: (b: Omit<Branch, 'id'>) => void;
  updateBranch: (id: string, updates: Partial<Branch>) => void;
  deleteBranch: (id: string) => void;
  addAsset: (a: Omit<CompanyAsset, 'id'>) => void;
  updateAsset: (id: string, updates: Partial<CompanyAsset>) => void;
  deleteAsset: (id: string) => void;
  importCustomers: (data: Array<{ name: string, phone: string }>) => void;
  importLegacyData: (data: Array<{ date: string, amount: number, description: string }>) => void;
  addStaff: (s: Omit<StaffMember, 'id' | 'onDuty' | 'totalAdvances' | 'branchId'>) => void;
  addDuty: (duty: Omit<StaffDuty, 'id' | 'createdAt'>) => void;
  updateDuty: (id: string, updates: Partial<StaffDuty>) => void;
  addSubscription: (sub: Omit<BusinessSubscription, 'id'>) => void;
  deleteSubscription: (id: string) => void;
  addMachinery: (m: Omit<Machinery, 'id' | 'branchId'>) => void;
  updateMachinery: (id: string, updates: Partial<Machinery>) => void;
  deleteMachinery: (id: string) => void;
  addMachineryService: (ms: Omit<MachineryService, 'id'>) => void;
  updateStaffAdvance: (id: string, amount: number) => void;
  clockInOut: (staffId: string) => void;
  addAttendance: (record: Omit<AttendanceRecord, 'id'>) => void;
  addCommitment: (c: Omit<BusinessCommitment, 'id'>) => void;
  updateCommitment: (id: string, updates: Partial<BusinessCommitment>) => void;
  deleteCommitment: (id: string) => void;
  payCommitment: (id: string, accountId: string) => void;
  connectCloud: (provider: StorageProvider) => Promise<void>;
  syncToCloud: () => Promise<void>;
  restoreFromCloud: () => Promise<void>;
  exportAppState: () => void;
  importAppState: (json: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState({ name: 'Administrator', role: UserRole.ADMIN });
  const [selectedBranchId, setSelectedBranchId] = useState<string>('b1');
  
  const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);
  const [branches, setBranches] = useState<Branch[]>(MOCK_BRANCHES);
  const [allAssets, setAllAssets] = useState<CompanyAsset[]>(MOCK_ASSETS);
  const [suppliers, setSuppliers] = useState<Supplier[]>(MOCK_SUPPLIERS);
  const [partners, setPartners] = useState<Partner[]>(MOCK_PARTNERS);
  const [allAccounts, setAllAccounts] = useState<FinancialAccount[]>(MOCK_ACCOUNTS);
  const [allStaff, setAllStaff] = useState<StaffMember[]>(MOCK_STAFF);
  const [allDuties, setAllDuties] = useState<StaffDuty[]>(MOCK_DUTIES);
  const [subscriptions, setSubscriptions] = useState<BusinessSubscription[]>(MOCK_SUBSCRIPTIONS);
  const [allMachinery, setAllMachinery] = useState<Machinery[]>(MOCK_MACHINERY);
  const [machineServices, setMachineServices] = useState<MachineryService[]>(MOCK_MACHINERY_SERVICES);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [payroll, setPayroll] = useState<PayrollRecord[]>([]);
  const [products] = useState<Product[]>(MOCK_PRODUCTS);
  const [allJobs, setAllJobs] = useState<Job[]>(MOCK_JOBS);
  const [allInventory, setAllInventory] = useState<InventoryItem[]>(MOCK_INVENTORY);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [allCommitments, setAllCommitments] = useState<BusinessCommitment[]>([]);
  const [reviewLinks, setReviewLinks] = useState({ google: '', facebook: '' });
  
  const [currentCurrency, setCurrentCurrency] = useState<CurrencyCode>(CurrencyCode.LKR);
  const [isCloudConnected, setIsCloudConnected] = useState<StorageProvider | null>(null);
  const [lastSync, setLastSync] = useState<string | null>(null);
  
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('printmaster_theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  const filterByBranch = <T extends { branchId?: string }>(list: T[]): T[] => {
    if (selectedBranchId === 'ALL') return list;
    return list.filter(item => !item.branchId || item.branchId === selectedBranchId);
  };

  const jobs = filterByBranch(allJobs);
  const transactions = filterByBranch(allTransactions);
  const inventory = filterByBranch(allInventory);
  const staff = filterByBranch(allStaff);
  const accounts = filterByBranch(allAccounts);
  const machinery = filterByBranch(allMachinery);
  const assets = filterByBranch(allAssets);
  const commitments = filterByBranch(allCommitments);
  const duties = allDuties.filter(d => {
      const s = allStaff.find(st => st.id === d.staffId);
      return selectedBranchId === 'ALL' || s?.branchId === selectedBranchId;
  });

  useEffect(() => {
    const localData = localStorage.getItem('printmaster_local_db_v9');
    if (localData) {
      try {
        const parsed = JSON.parse(localData);
        if (parsed.customers) setCustomers(parsed.customers);
        if (parsed.branches) setBranches(parsed.branches);
        if (parsed.allAssets) setAllAssets(parsed.allAssets);
        if (parsed.allStaff) setAllStaff(parsed.allStaff);
        if (parsed.allDuties) setAllDuties(parsed.allDuties);
        if (parsed.allAccounts) setAllAccounts(parsed.allAccounts);
        if (parsed.allJobs) setAllJobs(parsed.allJobs);
        if (parsed.allInventory) setAllInventory(parsed.allInventory);
        if (parsed.allTransactions) setAllTransactions(parsed.allTransactions);
        if (parsed.allMachinery) setAllMachinery(parsed.allMachinery);
        if (parsed.allCommitments) setAllCommitments(parsed.allCommitments);
        if (parsed.reviewLinks) setReviewLinks(parsed.reviewLinks);
      } catch (e) { console.error("Local load failed", e); }
    }
  }, []);

  useEffect(() => {
    const data = { customers, branches, allAssets, allStaff, allDuties, allAccounts, allJobs, allInventory, allTransactions, allMachinery, machineServices, attendance, payroll, subscriptions, allCommitments, reviewLinks };
    localStorage.setItem('printmaster_local_db_v9', JSON.stringify(data));
  }, [customers, branches, allAssets, allStaff, allDuties, allAccounts, allJobs, allInventory, allTransactions, allMachinery, machineServices, attendance, payroll, subscriptions, allCommitments, reviewLinks]);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);
  const setCurrency = (code: CurrencyCode) => setCurrentCurrency(code);
  const setCurrentRole = (role: UserRole) => setCurrentUser({ ...currentUser, role });

  const addTransaction = (t: Omit<Transaction, 'id' | 'timestamp' | 'branchId'>) => {
    const newTransaction: Transaction = {
      ...t,
      id: `TRX-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      timestamp: new Date().toISOString(),
      branchId: selectedBranchId === 'ALL' ? 'b1' : selectedBranchId
    };
    setAllTransactions(prev => [newTransaction, ...prev]);

    if (t.accountId) {
      setAllAccounts(prev => prev.map(acc => {
        if (acc.id === t.accountId) {
          const multiplier = (t.type === 'SALE' || t.type === 'IMPORT' || t.type === 'TRANSFER') ? 1 : -1;
          return { ...acc, balance: acc.balance + (t.amount * multiplier) };
        }
        return acc;
      }));
    }
  };

  const deleteTransaction = (id: string) => {
    if (currentUser.role !== UserRole.ADMIN) return;
    setAllTransactions(prev => prev.filter(t => t.id !== id));
  };

  const transferFunds = (fromId: string, toId: string, amount: number) => {
    if (currentUser.role !== UserRole.ADMIN) return;
    setAllAccounts(prev => prev.map(acc => {
      if (acc.id === fromId) return { ...acc, balance: acc.balance - amount };
      if (acc.id === toId) return { ...acc, balance: acc.balance + amount };
      return acc;
    }));
    addTransaction({
      amount,
      currency: currentCurrency,
      paymentMethod: PaymentMethod.CASH,
      type: 'TRANSFER',
      source: OrderSource.WALK_IN,
      description: `Internal Fund Transfer`,
    });
  };

  const addCustomer = (c: Omit<Customer, 'id'>) => {
    setCustomers(prev => [...prev, { ...c, id: `C-${Date.now()}` }]);
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteCustomer = (id: string) => {
    if (currentUser.role !== UserRole.ADMIN) return;
    setCustomers(prev => prev.filter(c => c.id !== id));
  };

  const addBranch = (b: Omit<Branch, 'id'>) => {
    if (currentUser.role !== UserRole.ADMIN) return;
    setBranches(prev => [...prev, { ...b, id: `B-${Date.now()}` }]);
  };

  const updateBranch = (id: string, updates: Partial<Branch>) => {
    if (currentUser.role !== UserRole.ADMIN) return;
    setBranches(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const deleteBranch = (id: string) => {
    if (currentUser.role !== UserRole.ADMIN) return;
    setBranches(prev => prev.filter(b => b.id !== id));
  };

  const addAsset = (a: Omit<CompanyAsset, 'id'>) => {
    if (currentUser.role !== UserRole.ADMIN) return;
    setAllAssets(prev => [...prev, { ...a, id: `ASSET-${Date.now()}` }]);
  };

  const updateAsset = (id: string, updates: Partial<CompanyAsset>) => {
    if (currentUser.role !== UserRole.ADMIN) return;
    setAllAssets(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const deleteAsset = (id: string) => {
    if (currentUser.role !== UserRole.ADMIN) return;
    setAllAssets(prev => prev.filter(a => a.id !== id));
  };

  const addStaff = (s: Omit<StaffMember, 'id' | 'onDuty' | 'totalAdvances' | 'branchId'>) => {
    if (currentUser.role !== UserRole.ADMIN) return;
    const newStaff: StaffMember = {
      ...s,
      id: `ST-${Date.now()}`,
      onDuty: false,
      totalAdvances: 0,
      branchId: selectedBranchId === 'ALL' ? 'b1' : selectedBranchId
    };
    setAllStaff(prev => [...prev, newStaff]);
  };

  const addDuty = (duty: Omit<StaffDuty, 'id' | 'createdAt'>) => {
    if (currentUser.role !== UserRole.ADMIN) return;
    const newDuty: StaffDuty = {
      ...duty,
      id: `DUTY-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setAllDuties(prev => [...prev, newDuty]);
  };

  const updateDuty = (id: string, updates: Partial<StaffDuty>) => {
    setAllDuties(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  };

  const addSubscription = (sub: Omit<BusinessSubscription, 'id'>) => {
    if (currentUser.role !== UserRole.ADMIN) return;
    const newSub: BusinessSubscription = {
      ...sub,
      id: `SUB-${Date.now()}`,
    };
    setSubscriptions(prev => [...prev, newSub]);
  };

  const deleteSubscription = (id: string) => {
    if (currentUser.role !== UserRole.ADMIN) return;
    setSubscriptions(prev => prev.filter(s => s.id !== id));
  };

  const addMachinery = (m: Omit<Machinery, 'id' | 'branchId'>) => {
    if (currentUser.role !== UserRole.ADMIN) return;
    setAllMachinery(prev => [...prev, { ...m, id: `MACH-${Date.now()}`, branchId: selectedBranchId === 'ALL' ? 'b1' : selectedBranchId }]);
  };

  const updateMachinery = (id: string, updates: Partial<Machinery>) => {
    if (currentUser.role !== UserRole.ADMIN) return;
    setAllMachinery(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const deleteMachinery = (id: string) => {
    if (currentUser.role !== UserRole.ADMIN) return;
    setAllMachinery(prev => prev.filter(m => m.id !== id));
    setMachineServices(prev => prev.filter(ms => ms.machineryId !== id));
  };

  const addMachineryService = (ms: Omit<MachineryService, 'id'>) => {
    if (currentUser.role !== UserRole.ADMIN) return;
    const newService: MachineryService = {
      ...ms,
      id: `MSERV-${Date.now()}`,
    };
    setMachineServices(prev => [...prev, newService]);
    const machine = allMachinery.find(m => m.id === ms.machineryId);
    addTransaction({
      amount: ms.charges,
      currency: currentCurrency,
      paymentMethod: PaymentMethod.CASH,
      type: 'MACHINERY_SERVICE',
      source: OrderSource.WALK_IN,
      description: `Service for ${machine?.name} by ${ms.technicianName}`,
      accountId: allAccounts.find(a => a.branchId === machine?.branchId)?.id
    });
  };

  const updateStaffAdvance = (id: string, amount: number) => {
    if (currentUser.role !== UserRole.ADMIN) return;
    setAllStaff(prev => prev.map(s => s.id === id ? { ...s, totalAdvances: s.totalAdvances + amount } : s));
    const sMember = allStaff.find(s => s.id === id);
    addTransaction({
      amount,
      currency: currentCurrency,
      paymentMethod: PaymentMethod.CASH,
      type: 'STAFF_ADVANCE',
      source: OrderSource.WALK_IN,
      description: `Advance paid to ${sMember?.name}`,
      accountId: allAccounts.find(a => a.branchId === sMember?.branchId)?.id
    });
  };

  const clockInOut = (staffId: string) => {
    setAllStaff(prev => prev.map(s => s.id === staffId ? { ...s, onDuty: !s.onDuty } : s));
    const now = new Date();
    const sMember = allStaff.find(s => s.id === staffId);
    if (!sMember?.onDuty) {
      addAttendance({
        staffId,
        date: now.toISOString().split('T')[0],
        clockIn: now.toISOString(),
        extraHours: 0,
        status: 'PRESENT'
      });
    }
  };

  const addAttendance = (record: Omit<AttendanceRecord, 'id'>) => {
    setAttendance(prev => [...prev, { ...record, id: `ATT-${Date.now()}` }]);
  };

  const addJob = (j: Omit<Job, 'id' | 'createdAt' | 'updatedAt' | 'branchId'>) => {
    const newJob: Job = {
      ...j,
      id: `J-${(allJobs.length + 1).toString().padStart(3, '0')}`,
      branchId: selectedBranchId === 'ALL' ? 'b1' : selectedBranchId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setAllJobs(prev => [newJob, ...prev]);
  };

  const updateJob = (id: string, updates: Partial<Job>) => {
    if (currentUser.role !== UserRole.ADMIN) return;
    setAllJobs(prev => prev.map(j => j.id === id ? { ...j, ...updates, updatedAt: new Date().toISOString() } : j));
  };

  const deleteJob = (id: string) => {
    if (currentUser.role !== UserRole.ADMIN) return;
    setAllJobs(prev => prev.filter(j => j.id !== id));
  };

  const updateJobStatus = (id: string, status: JobStatus) => {
    setAllJobs(prev => prev.map(j => j.id === id ? { ...j, status, updatedAt: new Date().toISOString() } : j));
  };

  const updateInventory = (itemId: string, delta: number) => {
    setAllInventory(prev => prev.map(item => 
      item.id === itemId ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
    ));
  };

  const importCustomers = (data: Array<{ name: string, phone: string }>) => {
    const news = data.map(d => ({ id: `C-${Math.random()}`, name: d.name, phone: d.phone, email: '' }));
    setCustomers(prev => [...prev, ...news]);
  };

  const importLegacyData = (data: Array<{ date: string, amount: number, description: string }>) => {
    if (currentUser.role !== UserRole.ADMIN) return;
    const trxs: Transaction[] = data.map(d => ({
      id: `LEG-${Math.random()}`,
      amount: d.amount,
      currency: currentCurrency,
      paymentMethod: PaymentMethod.CASH,
      timestamp: d.date,
      type: 'IMPORT',
      branchId: selectedBranchId === 'ALL' ? 'b1' : selectedBranchId,
      source: OrderSource.WALK_IN,
      description: d.description
    }));
    setAllTransactions(prev => [...trxs, ...prev]);
  };

  const addCommitment = (c: Omit<BusinessCommitment, 'id'>) => {
    if (currentUser.role !== UserRole.ADMIN) return;
    setAllCommitments(prev => [...prev, { ...c, id: `COM-${Date.now()}` }]);
  };

  const updateCommitment = (id: string, updates: Partial<BusinessCommitment>) => {
    if (currentUser.role !== UserRole.ADMIN) return;
    setAllCommitments(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteCommitment = (id: string) => {
    if (currentUser.role !== UserRole.ADMIN) return;
    setAllCommitments(prev => prev.filter(c => c.id !== id));
  };

  const payCommitment = (id: string, accountId: string) => {
    if (currentUser.role !== UserRole.ADMIN) return;
    const commitment = allCommitments.find(c => c.id === id);
    if (!commitment) return;

    addTransaction({
      amount: commitment.amount,
      currency: currentCurrency,
      paymentMethod: PaymentMethod.CASH,
      type: 'OPERATIONAL_BILL',
      source: OrderSource.WALK_IN,
      description: `Payment for ${commitment.name} (${commitment.category})`,
      accountId: accountId
    });

    setAllCommitments(prev => prev.map(c => c.id === id ? { ...c, status: 'PAID', paidDate: new Date().toISOString().split('T')[0] } : c));
  };

  const connectCloud = async (provider: StorageProvider) => {
    if (currentUser.role !== UserRole.ADMIN) return;
    if (provider === StorageProvider.GOOGLE_DRIVE) await driveService.initAuth();
    else if (provider === StorageProvider.ONE_DRIVE) await oneDriveService.initAuth();
    setIsCloudConnected(provider);
  };

  const syncToCloud = async () => {
    if (!isCloudConnected || currentUser.role !== UserRole.ADMIN) return;
    const data = { customers, branches, allAssets, allStaff, allAttendance: attendance, allPayroll: payroll, allAccounts, allJobs, allInventory, allTransactions, allDuties, subscriptions, allMachinery, machineServices, allCommitments, reviewLinks };
    if (isCloudConnected === StorageProvider.GOOGLE_DRIVE) await driveService.saveDatabase(data);
    else await oneDriveService.saveDatabase(data);
    setLastSync(new Date().toISOString());
  };

  const restoreFromCloud = async () => {
    if (!isCloudConnected || currentUser.role !== UserRole.ADMIN) return;
    const res = isCloudConnected === StorageProvider.GOOGLE_DRIVE ? await driveService.loadDatabase() : await oneDriveService.loadDatabase();
    if (res) {
      if (res.customers) setCustomers(res.customers);
      if (res.branches) setBranches(res.branches);
      if (res.allAssets) setAllAssets(res.allAssets);
      if (res.allStaff) setAllStaff(res.allStaff);
      if (res.allAttendance) setAttendance(res.allAttendance);
      if (res.allAccounts) setAllAccounts(res.allAccounts);
      if (res.allJobs) setAllJobs(res.allJobs);
      if (res.allInventory) setAllInventory(res.allInventory);
      if (res.allTransactions) setAllTransactions(res.allTransactions);
      if (res.allDuties) setAllDuties(res.allDuties);
      if (res.allMachinery) setAllMachinery(res.allMachinery);
      if (res.allCommitments) setAllCommitments(res.allCommitments);
      if (res.reviewLinks) setReviewLinks(res.reviewLinks);
    }
  };

  const exportAppState = () => {
    const data = { customers, branches, allAssets, allStaff, allDuties, allAccounts, allJobs, allInventory, allTransactions, allMachinery, machineServices, attendance, payroll, subscriptions, allCommitments, reviewLinks };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `printmaster_export_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importAppState = (json: string) => {
    try {
      const res = JSON.parse(json);
      if (res.customers) setCustomers(res.customers);
      if (res.branches) setBranches(res.branches);
      if (res.allAssets) setAllAssets(res.allAssets);
      if (res.allStaff) setAllStaff(res.allStaff);
      if (res.allJobs) setAllJobs(res.allJobs);
      if (res.allInventory) setAllInventory(res.allInventory);
      if (res.allTransactions) setAllTransactions(res.allTransactions);
      if (res.allDuties) setAllDuties(res.allDuties);
      if (res.allMachinery) setAllMachinery(res.allMachinery);
      if (res.allCommitments) setAllCommitments(res.allCommitments);
      if (res.reviewLinks) setReviewLinks(res.reviewLinks);
      alert("Application data imported successfully.");
    } catch (e) {
      alert("Invalid backup file.");
    }
  };

  return (
    <AppContext.Provider value={{ 
      currentUser, setCurrentRole, selectedBranchId, setSelectedBranchId,
      customers, branches, allAssets, assets, suppliers, partners, allAccounts, accounts, allStaff, staff, allDuties, duties, subscriptions, allMachinery, machinery, machineServices, attendance, payroll, products, allJobs, jobs, allInventory, inventory, allTransactions, transactions, allCommitments, commitments, isDarkMode, currentCurrency,
      isCloudConnected, lastSync, reviewLinks, setReviewLinks,
      toggleDarkMode, setCurrency, addTransaction, deleteTransaction, transferFunds, addJob, updateJob, deleteJob, updateJobStatus, updateInventory, 
      addCustomer, updateCustomer, deleteCustomer, addBranch, updateBranch, deleteBranch, addAsset, updateAsset, deleteAsset, importCustomers, importLegacyData, addStaff, addDuty, updateDuty, addSubscription, deleteSubscription, 
      addMachinery, updateMachinery, deleteMachinery, addMachineryService, updateStaffAdvance, clockInOut, addAttendance,
      addCommitment, updateCommitment, deleteCommitment, payCommitment,
      connectCloud, syncToCloud, restoreFromCloud, exportAppState, importAppState
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp context error');
  return context;
};

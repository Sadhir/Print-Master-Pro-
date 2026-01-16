import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { 
  Customer, Product, Job, InventoryItem, Transaction, JobStatus, 
  PaymentMethod, CurrencyCode, StorageProvider, Supplier, Partner, FinancialAccount,
  StaffMember, AttendanceRecord, PayrollRecord, UserRole, BusinessSubscription, StaffDuty, DutyStatus, OrderSource,
  Machinery, MachineryService, CompanyAsset, Branch, BusinessCommitment, CommitmentCategory, User, InvoiceSettings,
  Material, ProductionProcess, MaterialUnit, CostBreakdown,
  CreativeProject, DesignStatus, RentalMachinery, RentalCounterReading, RentalPayment, RentalRepair
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
  currentUser: User;
  allUsers: User[];
  setCurrentUser: (user: User) => void;
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
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
  materials: Material[];
  processes: ProductionProcess[];
  creativeProjects: CreativeProject[];
  addCreativeProject: (p: Omit<CreativeProject, 'id'>) => void;
  updateCreativeProject: (id: string, updates: Partial<CreativeProject>) => void;
  deleteCreativeProject: (id: string) => void;
  rentalFleet: RentalMachinery[];
  rentalReadings: RentalCounterReading[];
  rentalPayments: RentalPayment[];
  rentalRepairs: RentalRepair[];
  addRentalMachine: (m: Omit<RentalMachinery, 'id'>) => void;
  updateRentalMachine: (id: string, updates: Partial<RentalMachinery>) => void;
  deleteRentalMachine: (id: string) => void;
  addRentalReading: (r: Omit<RentalCounterReading, 'id'>) => void;
  addRentalPayment: (p: Omit<RentalPayment, 'id'>) => void;
  addRentalRepair: (r: Omit<RentalRepair, 'id'>) => void;
  allJobs: Job[];
  jobs: Job[];
  allTransactions: Transaction[];
  transactions: Transaction[];
  allCommitments: BusinessCommitment[];
  commitments: BusinessCommitment[];
  allInventory: InventoryItem[];
  inventory: InventoryItem[];
  isDarkMode: boolean;
  isStealthMode: boolean;
  setIsStealthMode: (val: boolean) => void;
  currentCurrency: CurrencyCode;
  isCloudConnected: StorageProvider | null;
  isAutoSyncEnabled: boolean;
  setIsAutoSyncEnabled: (enabled: boolean) => void;
  lastSync: string | null;
  googleDriveClientId: string;
  setGoogleDriveClientId: (id: string) => void;
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
  addCustomer: (c: Omit<Customer, 'id'>) => Customer;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  addBranch: (b: Omit<Branch, 'id'>) => void;
  updateBranch: (id: string, updates: Partial<Branch>) => void;
  deleteBranch: (id: string) => void;
  addAsset: (a: Omit<CompanyAsset, 'id'>) => void;
  updateAsset: (id: string, updates: Partial<CompanyAsset>) => void;
  deleteAsset: (id: string) => void;
  addStaff: (s: Omit<StaffMember, 'id' | 'onDuty' | 'totalAdvances' | 'branchId'>) => void;
  updateStaffAdvance: (staffId: string, amount: number) => void;
  addDuty: (duty: Omit<StaffDuty, 'id' | 'createdAt' | 'branchId'>) => void;
  updateDuty: (id: string, updates: Partial<StaffDuty>) => void;
  addSubscription: (sub: Omit<BusinessSubscription, 'id'>) => void;
  deleteSubscription: (id: string) => void;
  addMachinery: (m: Omit<Machinery, 'id' | 'branchId'>) => void;
  updateMachinery: (id: string, updates: Partial<Machinery>) => void;
  deleteMachinery: (id: string) => void;
  addMachineryService: (ms: Omit<MachineryService, 'id'>) => void;
  clockInOut: (staffId: string) => void;
  addAttendance: (record: Omit<AttendanceRecord, 'id'>) => void;
  addCommitment: (c: Omit<BusinessCommitment, 'id'>) => void;
  updateCommitment: (id: string, updates: Partial<BusinessCommitment>) => void;
  deleteCommitment: (id: string) => void;
  payCommitment: (id: string, accountId: string) => void;
  addPartner: (p: Omit<Partner, 'id' | 'totalDraws'>) => void;
  updatePartner: (id: string, updates: Partial<Partner>) => void;
  deletePartner: (id: string) => void;
  updateInventory: (itemId: string, delta: number) => void;
  addMaterial: (m: Omit<Material, 'id'>) => void;
  updateMaterial: (id: string, updates: Partial<Material>) => void;
  deleteMaterial: (id: string) => void;
  addProcess: (p: Omit<ProductionProcess, 'id'>) => void;
  updateProcess: (id: string, updates: Partial<ProductionProcess>) => void;
  deleteProcess: (id: string) => void;
  addProduct: (p: Omit<Product, 'id'>) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  importProducts: (data: Product[]) => void;
  invoiceSettings: InvoiceSettings;
  updateInvoiceSettings: (updates: Partial<InvoiceSettings>) => void;
  connectCloud: (provider: StorageProvider) => Promise<void>;
  syncToCloud: () => Promise<void>;
  restoreFromCloud: () => Promise<void>;
  exportAppState: () => void;
  importAppState: (json: string) => void;
  factoryReset: () => void;
  importCustomers: (data: Array<{ name: string, phone: string }>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEFAULT_ADMIN: User = { id: 'u-admin', name: 'Administrator', role: UserRole.ADMIN, avatarColor: 'bg-blue-600', pin: '1234' };
const DEFAULT_INVOICE_SETTINGS: InvoiceSettings = {
  template: 'MODERN', primaryColor: '#2563eb', businessLogoUrl: 'https://cdn-icons-png.flaticon.com/512/4420/4420933.png',
  businessName: 'PRINTMASTER PRO', businessTagline: 'Professional Printing Solutions', businessAddress: 'Central Hub',
  businessPhone: '+000', businessEmail: 'contact@printmaster.com', footerNotes: 'Thank you for your business!',
  showPaymentDetails: true, bankDetails: 'Bank: Enterprise Trust\nAcc: 12345678'
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allUsers, setAllUsers] = useState<User[]>([DEFAULT_ADMIN]);
  const [currentUser, setCurrentUser] = useState<User>(DEFAULT_ADMIN);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('b1');
  const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);
  const [branches, setBranches] = useState<Branch[]>(MOCK_BRANCHES);
  const [allAssets, setAllAssets] = useState<CompanyAsset[]>(MOCK_ASSETS);
  const [allAccounts, setAllAccounts] = useState<FinancialAccount[]>(MOCK_ACCOUNTS);
  const [allStaff, setAllStaff] = useState<StaffMember[]>(MOCK_STAFF);
  const [allDuties, setAllDuties] = useState<StaffDuty[]>(MOCK_DUTIES);
  const [subscriptions, setSubscriptions] = useState<BusinessSubscription[]>(MOCK_SUBSCRIPTIONS);
  const [allMachinery, setAllMachinery] = useState<Machinery[]>(MOCK_MACHINERY);
  const [machineServices, setMachineServices] = useState<MachineryService[]>(MOCK_MACHINERY_SERVICES);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [payroll, setPayroll] = useState<PayrollRecord[]>([]);
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [allInventory, setAllInventory] = useState<InventoryItem[]>(MOCK_INVENTORY);
  const [allJobs, setAllJobs] = useState<Job[]>(MOCK_JOBS);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [allCommitments, setAllCommitments] = useState<BusinessCommitment[]>([]);
  const [partners, setPartners] = useState<Partner[]>(MOCK_PARTNERS);
  const [invoiceSettings, setInvoiceSettings] = useState<InvoiceSettings>(DEFAULT_INVOICE_SETTINGS);
  const [creativeProjects, setCreativeProjects] = useState<CreativeProject[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [processes, setProcesses] = useState<ProductionProcess[]>([]);
  const [rentalFleet, setRentalFleet] = useState<RentalMachinery[]>([]);
  const [rentalReadings, setRentalReadings] = useState<RentalCounterReading[]>([]);
  const [rentalPayments, setRentalPayments] = useState<RentalPayment[]>([]);
  const [rentalRepairs, setRentalRepairs] = useState<RentalRepair[]>([]);

  const [currentCurrency, setCurrentCurrency] = useState<CurrencyCode>(CurrencyCode.LKR);
  const [isCloudConnected, setIsCloudConnected] = useState<StorageProvider | null>(null);
  const [isAutoSyncEnabled, setIsAutoSyncEnabled] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [googleDriveClientId, setGoogleDriveClientId] = useState<string>('');
  const [isStealthMode, setIsStealthMode] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [reviewLinks, setReviewLinks] = useState({ google: '', facebook: '' });

  // Sync Dark Mode with the document class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Rehydration logic
  const rehydrateState = (p: any) => {
    if (!p) return;
    if (p.allUsers) setAllUsers(p.allUsers);
    if (p.currentUser) setCurrentUser(p.currentUser);
    if (p.customers) setCustomers(p.customers);
    if (p.branches) setBranches(p.branches);
    if (p.allAssets) setAllAssets(p.allAssets);
    if (p.allAccounts) setAllAccounts(p.allAccounts);
    if (p.allStaff) setAllStaff(p.allStaff);
    if (p.allDuties) setAllDuties(p.allDuties);
    if (p.subscriptions) setSubscriptions(p.subscriptions);
    if (p.allMachinery) setAllMachinery(p.allMachinery);
    if (p.machineServices) setMachineServices(p.machineServices);
    if (p.attendance) setAttendance(p.attendance);
    if (p.payroll) setPayroll(p.payroll);
    if (p.products) setProducts(p.products);
    if (p.allInventory) setAllInventory(p.allInventory);
    if (p.allJobs) setAllJobs(p.allJobs);
    if (p.allTransactions) setAllTransactions(p.allTransactions);
    if (p.allCommitments) setAllCommitments(p.allCommitments);
    if (p.partners) setPartners(p.partners);
    if (p.invoiceSettings) setInvoiceSettings(p.invoiceSettings);
    if (p.creativeProjects) setCreativeProjects(p.creativeProjects);
    if (p.materials) setMaterials(p.materials);
    if (p.processes) setProcesses(p.processes);
    if (p.rentalFleet) setRentalFleet(p.rentalFleet);
    if (p.rentalReadings) setRentalReadings(p.rentalReadings);
    if (p.rentalPayments) setRentalPayments(p.rentalPayments);
    if (p.rentalRepairs) setRentalRepairs(p.rentalRepairs);
    if (p.currentCurrency) setCurrentCurrency(p.currentCurrency);
    if (p.isDarkMode !== undefined) setIsDarkMode(p.isDarkMode);
    if (p.reviewLinks) setReviewLinks(p.reviewLinks);
    if (p.lastSync) setLastSync(p.lastSync);
    if (p.googleDriveClientId) setGoogleDriveClientId(p.googleDriveClientId);
  };

  const captureAppState = () => ({
    allUsers, currentUser, customers, branches, allAssets, allAccounts,
    allStaff, allDuties, subscriptions, allMachinery, machineServices,
    attendance, payroll, products, allInventory, allJobs, allTransactions,
    allCommitments, partners, invoiceSettings, creativeProjects,
    materials, processes, rentalFleet, rentalReadings, rentalPayments, rentalRepairs,
    currentCurrency, isDarkMode, reviewLinks, lastSync, googleDriveClientId
  });

  // Load from local storage on boot
  useEffect(() => {
    const data = localStorage.getItem('printmaster_enterprise_db');
    if (data) {
      try {
        const p = JSON.parse(data);
        rehydrateState(p);
      } catch (e) { console.error("Rehydration failed:", e); }
    }
  }, []);

  // Persist to local storage on change
  useEffect(() => {
    const fullState = captureAppState();
    localStorage.setItem('printmaster_enterprise_db', JSON.stringify(fullState));
  }, [
    allUsers, currentUser, customers, allJobs, creativeProjects, allTransactions, 
    allMachinery, materials, processes, rentalFleet, allInventory, allCommitments, 
    allAssets, branches, allAccounts, allStaff, allDuties, subscriptions, invoiceSettings,
    currentCurrency, isDarkMode, reviewLinks, googleDriveClientId
  ]);

  const connectCloud = async (provider: StorageProvider) => {
    try {
      if (provider === StorageProvider.GOOGLE_DRIVE) {
        if (!googleDriveClientId) {
          alert("Please enter a Google Drive Client ID in System Settings before connecting.");
          return;
        }
        await driveService.initAuth(googleDriveClientId);
      } else {
        await oneDriveService.initAuth();
      }
      setIsCloudConnected(provider);
      alert(`${provider.replace('_', ' ')} connected successfully.`);
    } catch (e) {
      alert("Failed to connect cloud provider. Ensure your Client ID is valid and the Redirect URI includes the current domain.");
      console.error(e);
    }
  };

  const syncToCloud = async () => {
    if (!isCloudConnected) return;
    try {
      const data = captureAppState();
      if (isCloudConnected === StorageProvider.GOOGLE_DRIVE) {
        await driveService.saveDatabase(data, googleDriveClientId);
      } else {
        await oneDriveService.saveDatabase(data);
      }
      const now = new Date().toISOString();
      setLastSync(now);
      alert("System synchronized to cloud vault.");
    } catch (e) {
      alert("Sync failed.");
      console.error(e);
    }
  };

  const restoreFromCloud = async () => {
    if (!isCloudConnected) return;
    try {
      let data: any;
      if (isCloudConnected === StorageProvider.GOOGLE_DRIVE) {
        data = await driveService.loadDatabase(googleDriveClientId);
      } else {
        data = await oneDriveService.loadDatabase();
      }
      if (data) {
        rehydrateState(data);
        alert("System rehydrated from cloud master file.");
      } else {
        alert("No backup file found in cloud.");
      }
    } catch (e) {
      alert("Restoration failed.");
      console.error(e);
    }
  };

  const exportAppState = () => {
    const state = captureAppState();
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `PrintMaster_Vault_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const importAppState = (json: string) => {
    try {
      const p = JSON.parse(json);
      rehydrateState(p);
      alert("Application state restored successfully.");
    } catch (e) {
      alert("Invalid backup file. Restoration aborted.");
    }
  };

  const filterByBranch = <T extends { branchId?: string }>(list: T[]): T[] => {
    if (selectedBranchId === 'ALL') return list;
    return list.filter(item => !item.branchId || item.branchId === selectedBranchId);
  };

  const addUser = (user: Omit<User, 'id'>) => setAllUsers(prev => [...prev, { ...user, id: `U-${Date.now()}` }]);
  const updateUser = (id: string, updates: Partial<User>) => {
    setAllUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
    if (currentUser.id === id) setCurrentUser(prev => ({ ...prev, ...updates }));
  };
  const deleteUser = (id: string) => {
    if (id === 'u-admin') return;
    setAllUsers(prev => prev.filter(u => u.id !== id));
  };

  const addJob = (j: Omit<Job, 'id' | 'createdAt' | 'updatedAt' | 'branchId'>) => setAllJobs(prev => [{ ...j, id: `J-${Date.now()}`, branchId: selectedBranchId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, ...prev]);
  const updateJob = (id: string, updates: Partial<Job>) => setAllJobs(prev => prev.map(j => j.id === id ? { ...j, ...updates, updatedAt: new Date().toISOString() } : j));
  const deleteJob = (id: string) => setAllJobs(prev => prev.filter(j => j.id !== id));

  const addTransaction = (t: Omit<Transaction, 'id' | 'timestamp' | 'branchId'>) => setAllTransactions(prev => [{ ...t, id: `T-${Date.now()}`, timestamp: new Date().toISOString(), branchId: selectedBranchId }, ...prev]);
  const addCustomer = (c: Omit<Customer, 'id'>) => {
    const nc = { ...c, id: `C-${Date.now()}` };
    setCustomers(prev => [...prev, nc]);
    return nc;
  };

  const addMachinery = (m: Omit<Machinery, 'id' | 'branchId'>) => setAllMachinery(prev => [...prev, { ...m, id: `M-${Date.now()}`, branchId: selectedBranchId }]);
  const updateMachinery = (id: string, updates: Partial<Machinery>) => setAllMachinery(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));

  const addCreativeProject = (p: Omit<CreativeProject, 'id'>) => setCreativeProjects(prev => [...prev, { ...p, id: `CP-${Date.now()}` }]);
  const updateCreativeProject = (id: string, updates: Partial<CreativeProject>) => setCreativeProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  const deleteCreativeProject = (id: string) => setCreativeProjects(prev => prev.filter(p => p.id !== id));

  const updateStaffAdvance = (staffId: string, amount: number) => {
    setAllStaff(prev => prev.map(s => s.id === staffId ? { ...s, totalAdvances: s.totalAdvances + amount } : s));
    addTransaction({
      amount: amount,
      currency: currentCurrency,
      type: 'STAFF_ADVANCE',
      source: OrderSource.WALK_IN,
      paymentMethod: PaymentMethod.CASH,
      description: `Salary Advance to ${allStaff.find(s => s.id === staffId)?.name || 'Staff'}`
    });
  };

  const addRentalMachine = (m: Omit<RentalMachinery, 'id'>) => setRentalFleet(prev => [...prev, { ...m, id: `RM-${Date.now()}` }]);
  const updateRentalMachine = (id: string, updates: Partial<RentalMachinery>) => setRentalFleet(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  const deleteRentalMachine = (id: string) => setRentalFleet(prev => prev.filter(m => m.id !== id));
  
  const addRentalReading = (r: Omit<RentalCounterReading, 'id'>) => {
    setRentalReadings(prev => [...prev, { ...r, id: `RR-${Date.now()}` }]);
    updateRentalMachine(r.machineId, { currentCounter: r.reading });
  };
  const addRentalPayment = (p: Omit<RentalPayment, 'id'>) => setRentalPayments(prev => [...prev, { ...p, id: `RP-${Date.now()}` }]);
  const addRentalRepair = (r: Omit<RentalRepair, 'id'>) => setRentalRepairs(prev => [...prev, { ...r, id: `RPR-${Date.now()}` }]);

  const importProducts = (data: Product[]) => setProducts(prev => [...prev, ...data.map(d => ({ ...d, id: `PROD-${Math.random()}` }))]);

  const factoryReset = () => {
    localStorage.removeItem('printmaster_enterprise_db');
    window.location.reload();
  };

  return (
    <AppContext.Provider value={{ 
      currentUser, allUsers, setCurrentUser, addUser, updateUser, deleteUser, selectedBranchId, setSelectedBranchId,
      customers, branches, allAssets, assets: filterByBranch(allAssets), allAccounts, accounts: filterByBranch(allAccounts),
      allStaff, staff: filterByBranch(allStaff), allDuties, duties: filterByBranch(allDuties),
      subscriptions, allMachinery, machinery: filterByBranch(allMachinery), machineServices, attendance, payroll, 
      products, materials, processes, creativeProjects, addCreativeProject, updateCreativeProject, deleteCreativeProject,
      rentalFleet, rentalReadings, rentalPayments, rentalRepairs, addRentalMachine, updateRentalMachine, deleteRentalMachine,
      addRentalReading, addRentalPayment, addRentalRepair, allJobs, jobs: filterByBranch(allJobs),
      allTransactions, transactions: filterByBranch(allTransactions), allCommitments, commitments: filterByBranch(allCommitments),
      allInventory, inventory: filterByBranch(allInventory),
      isDarkMode, isStealthMode, setIsStealthMode, currentCurrency, isCloudConnected, isAutoSyncEnabled, setIsAutoSyncEnabled, 
      lastSync, googleDriveClientId, setGoogleDriveClientId, reviewLinks, setReviewLinks, toggleDarkMode: () => setIsDarkMode(!isDarkMode), setCurrency: setCurrentCurrency,
      addTransaction, deleteTransaction: (id) => setAllTransactions(prev => prev.filter(t => t.id !== id)), transferFunds: () => {}, 
      addJob, updateJob, deleteJob, updateJobStatus: (id, status) => updateJob(id, { status }), addCustomer,
      updateCustomer: (id, u) => setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...u } : c)), 
      deleteCustomer: (id) => setCustomers(prev => prev.filter(c => c.id !== id)), addBranch: (b) => setBranches(prev => [...prev, { ...b, id: `B-${Date.now()}` }]),
      updateBranch: (id, u) => setBranches(prev => prev.map(b => b.id === id ? { ...b, ...u } : b)), deleteBranch: (id) => setBranches(prev => prev.filter(b => b.id !== id)),
      addAsset: (a) => setAllAssets(prev => [...prev, { ...a, id: `A-${Date.now()}` }]), updateAsset: (id, u) => setAllAssets(prev => prev.map(a => a.id === id ? { ...a, ...u } : a)),
      deleteAsset: (id) => setAllAssets(prev => prev.filter(a => a.id !== id)), addStaff: (s) => setAllStaff(prev => [...prev, { ...s, id: `S-${Date.now()}`, branchId: selectedBranchId, totalAdvances: 0, onDuty: false }]),
      updateStaffAdvance,
      addDuty: (d) => setAllDuties(prev => [...prev, { ...d, id: `D-${Date.now()}`, createdAt: new Date().toISOString(), branchId: selectedBranchId }]), updateDuty: (id, u) => setAllDuties(prev => prev.map(d => d.id === id ? { ...d, ...u } : d)),
      addSubscription: (s) => setSubscriptions(prev => [...prev, { ...s, id: `SUB-${Date.now()}` }]), deleteSubscription: (id) => setSubscriptions(prev => prev.filter(s => s.id !== id)),
      addMachinery, updateMachinery, deleteMachinery: (id) => setAllMachinery(prev => prev.filter(m => m.id !== id)), addMachineryService: (ms) => setMachineServices(prev => [...prev, { ...ms, id: `MS-${Date.now()}` }]),
      clockInOut: (sid) => setAllStaff(prev => prev.map(s => s.id === sid ? { ...s, onDuty: !s.onDuty } : s)), addAttendance: (a) => setAttendance(prev => [...prev, { ...a, id: `AT-${Date.now()}` }]),
      addCommitment: (c) => setAllCommitments(prev => [...prev, { ...c, id: `COM-${Date.now()}` }]), updateCommitment: (id, u) => setAllCommitments(prev => prev.map(c => c.id === id ? { ...c, ...u } : c)),
      deleteCommitment: (id) => setAllCommitments(prev => prev.filter(c => c.id !== id)), payCommitment: () => {}, invoiceSettings, updateInvoiceSettings: (u) => setInvoiceSettings(prev => ({ ...prev, ...u })),
      connectCloud, syncToCloud, restoreFromCloud, exportAppState, importAppState, factoryReset,
      suppliers: MOCK_SUPPLIERS, partners, addPartner: (p) => setPartners(prev => [...prev, { ...p, id: `P-${Date.now()}`, totalDraws: 0 }]),
      updatePartner: (id, u) => setPartners(prev => prev.map(p => p.id === id ? { ...p, ...u } : p)), deletePartner: (id) => setPartners(prev => prev.filter(p => p.id !== id)),
      updateInventory: (itemId, delta) => setAllInventory(prev => prev.map(item => item.id === itemId ? { ...item, quantity: item.quantity + delta } : item)), 
      addMaterial: (m) => setMaterials(prev => [...prev, { ...m, id: `MAT-${Date.now()}` }]),
      updateMaterial: (id, u) => setMaterials(prev => prev.map(m => m.id === id ? { ...m, ...u } : m)), deleteMaterial: (id) => setMaterials(prev => prev.filter(m => m.id !== id)),
      addProcess: (p) => setProcesses(prev => [...prev, { ...p, id: `PR-${Date.now()}` }]), updateProcess: (id, u) => setProcesses(prev => prev.map(p => p.id === id ? { ...p, ...u } : p)),
      deleteProcess: (id) => setProcesses(prev => prev.filter(p => p.id !== id)), addProduct: (p) => { const np = { ...p, id: `PROD-${Date.now()}` }; setProducts(prev => [...prev, np]); return np; },
      updateProduct: (id, u) => setProducts(prev => prev.map(p => p.id === id ? { ...p, ...u } : p)), deleteProduct: (id) => setProducts(prev => prev.filter(p => p.id !== id)),
      importProducts,
      importCustomers: (data) => setCustomers(prev => [...prev, ...data.map(d => ({ ...d, id: `C-${Math.random()}`, email: '' }))])
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp error');
  return context;
};
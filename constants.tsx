
import { 
  Customer, Product, Job, JobStatus, InventoryItem, CurrencyCode, 
  Supplier, Partner, FinancialAccount, StaffMember, AttendanceRecord,
  BusinessSubscription, StaffDuty, DutyStatus, OrderSource, Machinery, MachineryService,
  Branch, CompanyAsset
} from './types';

export const MOCK_CUSTOMERS: Customer[] = [
  { id: 'c1', name: 'John Doe', businessName: 'JD Graphics', phone: '+1234567890', email: 'john@example.com' },
  { id: 'c2', name: 'Alice Smith', businessName: 'Alice Designs', phone: '+1987654321', email: 'alice@business.com' },
  { id: 'c3', name: 'Local Cafe', businessName: 'The Roasted Bean', phone: '+1555019283', email: 'orders@cafe.com' },
];

export const MOCK_BRANCHES: Branch[] = [
  { id: 'b1', name: 'Main HQ - Colombo', address: '123 Main St, Colombo 03', phone: '0112334455', managerName: 'Admin', status: 'ACTIVE' },
  { id: 'b2', name: 'Galle Branch', address: '45 Beach Rd, Galle', phone: '0912233445', managerName: 'Saman Kumara', status: 'ACTIVE' },
];

export const MOCK_ASSETS: CompanyAsset[] = [
  { id: 'a1', name: 'Designer iMac 27"', category: 'IT_EQUIPMENT', value: 450000, purchaseDate: '2023-10-01', serialNumber: 'YM998211', branchId: 'b1' },
  { id: 'a2', name: 'Executive Desk Set', category: 'FURNITURE', value: 85000, purchaseDate: '2023-01-15', branchId: 'b1' },
  { id: 'a3', name: 'Branch Printer', category: 'IT_EQUIPMENT', value: 25000, purchaseDate: '2024-01-15', branchId: 'b2' },
];

export const MOCK_MACHINERY: Machinery[] = [
  {
    id: 'm1',
    name: 'Konica Minolta AccurioPress',
    model: 'C4070',
    serialNumber: 'KM-99821-X',
    purchaseDate: '2023-05-12',
    purchasePrice: 2500000,
    salvageValue: 500000,
    estimatedLifeYears: 5,
    monthlyOpCost: 15000,
    expectedMonthlyHours: 160,
    status: 'OPERATIONAL',
    location: 'Main Floor',
    branchId: 'b1'
  },
  {
    id: 'm2',
    name: 'Roland Wide Format Printer',
    model: 'VG3-540',
    serialNumber: 'RL-55210-S',
    purchaseDate: '2022-11-20',
    purchasePrice: 1800000,
    salvageValue: 300000,
    estimatedLifeYears: 7,
    monthlyOpCost: 12000,
    expectedMonthlyHours: 120,
    status: 'UNDER_MAINTENANCE',
    location: 'Rear Studio',
    branchId: 'b2'
  }
];

export const MOCK_MACHINERY_SERVICES: MachineryService[] = [
  {
    id: 'ms1',
    machineryId: 'm1',
    technicianName: 'Saman Kumara',
    technicianPhone: '0711223344',
    visitDate: '2024-02-15',
    charges: 12500,
    description: 'Routine maintenance and color calibration.',
    replacedParts: 'Fuser Unit Rollers',
    nextServiceDate: '2024-08-15'
  }
];

export const MOCK_SUBSCRIPTIONS: BusinessSubscription[] = [
  { 
    id: 'sub1', 
    name: 'Adobe Creative Cloud', 
    purchaseDate: '2024-01-10', 
    expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
    amount: 50.0, 
    paymentDetails: 'Visa **** 1234', 
    status: 'ACTIVE' 
  },
];

export const MOCK_STAFF: StaffMember[] = [
  {
    id: 'st1',
    name: 'Sunil Perera',
    phone: '0771122334',
    designation: 'Lead Designer',
    baseSalary: 65000,
    allowance: 5000,
    commissionRate: 5,
    joiningDate: '2023-01-15',
    onDuty: true,
    totalAdvances: 0,
    branchId: 'b1'
  },
  {
    id: 'st2',
    name: 'Nimal Silva',
    phone: '0774455667',
    designation: 'Printing Operator',
    baseSalary: 45000,
    allowance: 8000,
    commissionRate: 2,
    joiningDate: '2023-06-10',
    onDuty: false,
    totalAdvances: 2000,
    branchId: 'b2'
  }
];

export const MOCK_ACCOUNTS: FinancialAccount[] = [
  { id: 'acc1', name: 'Shop Cash (HQ)', type: 'CASH', balance: 15400, branchId: 'b1' },
  { id: 'acc2', name: 'Bank (HQ)', type: 'BANK', balance: 85200, branchId: 'b1' },
  { id: 'acc3', name: 'Shop Cash (Galle)', type: 'CASH', balance: 4200, branchId: 'b2' },
];

export const MOCK_JOBS: Job[] = [
  {
    id: 'J-001',
    customerId: 'c1',
    branchId: 'b1',
    title: 'Wedding Invitation Set',
    description: 'Gold foil invitations with envelopes',
    status: JobStatus.IN_PROGRESS,
    source: OrderSource.WALK_IN,
    totalAmount: 450.0,
    paidAmount: 200.0,
    advancePayment: 200.0,
    jobTakenDate: new Date().toISOString().split('T')[0],
    deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    currency: CurrencyCode.LKR,
    createWhatsAppGroup: false,
    isOutsourced: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    items: [{ description: 'Graphic Design Service', quantity: 1, unitPrice: 150 }]
  },
  {
    id: 'J-002',
    customerId: 'c2',
    branchId: 'b2',
    title: 'Outdoor Vinyl Banner',
    description: '2x3m heavy duty banner',
    status: JobStatus.OUTSOURCED,
    source: OrderSource.WALK_IN,
    totalAmount: 120.0,
    paidAmount: 120.0,
    advancePayment: 0,
    jobTakenDate: new Date().toISOString().split('T')[0],
    deliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    currency: CurrencyCode.LKR,
    createWhatsAppGroup: false,
    isOutsourced: true,
    outsourcedCost: 65.0,
    outsourcedVendorId: 's1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    items: [{ description: 'Vinyl Banner Printing', quantity: 1, unitPrice: 120 }]
  }
];

export const MOCK_INVENTORY: InventoryItem[] = [
  { id: 'i1', name: 'A4 80gsm Paper', quantity: 5000, minThreshold: 1000, unit: 'sheets', branchId: 'b1' },
  { id: 'i2', name: 'A4 80gsm Paper', quantity: 200, minThreshold: 100, unit: 'sheets', branchId: 'b2' },
  { id: 'i3', name: 'Cyan Ink', quantity: 15, minThreshold: 5, unit: 'units', branchId: 'b1' },
];

// Added missing mock products for POS system
export const MOCK_PRODUCTS: Product[] = [
  { id: 'p1', name: 'Digital Printing - A4 Glossy', category: 'PRINTING', price: 25, stock: 1000, unit: 'sheets' },
  { id: 'p2', name: 'Business Card Design', category: 'DESIGN', price: 1500, stock: 100, unit: 'design' },
  { id: 'p3', name: 'Lamination - A4', category: 'FINISHING', price: 50, stock: 500, unit: 'sheets' },
  { id: 'p4', name: 'Outdoor Vinyl (sqft)', category: 'PRINTING', price: 120, stock: 500, unit: 'sqft' },
];

// Added missing mock suppliers
export const MOCK_SUPPLIERS: Supplier[] = [
  { 
    id: 's1', 
    name: 'Ink Master Co.', 
    contact: '0119988776', 
    category: 'Inks & Toners', 
    services: [{ id: 'ss1', name: 'Ink Refill', price: 5000 }] 
  },
  { 
    id: 's2', 
    name: 'Paper World', 
    contact: '0112233445', 
    category: 'Paper & Boards', 
    services: [{ id: 'ss2', name: 'Bulk Board Supply', price: 25000 }] 
  },
];

// Added missing mock partners
export const MOCK_PARTNERS: Partner[] = [
  { id: 'pt1', name: 'Kamal Perera', sharePercentage: 50, totalDraws: 12000 },
  { id: 'pt2', name: 'Nimali Silva', sharePercentage: 50, totalDraws: 8500 },
];

// Added missing mock duties
export const MOCK_DUTIES: StaffDuty[] = [
  { 
    id: 'd1', 
    staffId: 'st1', 
    task: 'Calibrate Digital Press', 
    deadline: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(), 
    status: DutyStatus.PENDING, 
    assignedBy: 'Admin', 
    createdAt: new Date().toISOString() 
  },
  { 
    id: 'd2', 
    staffId: 'st2', 
    task: 'Pack Galle Order #J-002', 
    deadline: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), 
    status: DutyStatus.COMPLETED, 
    assignedBy: 'Admin', 
    createdAt: new Date().toISOString() 
  },
];

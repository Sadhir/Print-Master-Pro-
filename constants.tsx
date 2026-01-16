
import { 
  Customer, Product, Job, JobStatus, InventoryItem, CurrencyCode, 
  Supplier, Partner, FinancialAccount, StaffMember, AttendanceRecord,
  BusinessSubscription, StaffDuty, DutyStatus, OrderSource, Machinery, MachineryService,
  Branch, CompanyAsset
} from './types';

export const MOCK_CUSTOMERS: Customer[] = [];

export const MOCK_BRANCHES: Branch[] = [
  { id: 'b1', name: 'Main HQ', address: 'Enter Address Here', phone: '000-000-0000', managerName: 'Admin', status: 'ACTIVE' },
];

export const MOCK_ASSETS: CompanyAsset[] = [];

export const MOCK_MACHINERY: Machinery[] = [];

export const MOCK_MACHINERY_SERVICES: MachineryService[] = [];

export const MOCK_SUBSCRIPTIONS: BusinessSubscription[] = [];

export const MOCK_STAFF: StaffMember[] = [];

export const MOCK_ACCOUNTS: FinancialAccount[] = [
  { id: 'acc1', name: 'Main Cash Drawer', type: 'CASH', balance: 0, branchId: 'b1' },
  { id: 'acc2', name: 'Business Bank Account', type: 'BANK', balance: 0, branchId: 'b1' },
];

export const MOCK_JOBS: Job[] = [];

export const MOCK_INVENTORY: InventoryItem[] = [];

export const MOCK_PRODUCTS: Product[] = [
  // ⭐ FREQUENTLY SOLD (ESSENTIALS) - Initial stock set to high value to allow POS selection
  { id: 'pbw_a4_std', name: 'A4 B/W Print (Laser)', category: 'PRINT_BW', price: 10, stock: 9999, unit: 'sheets' },
  { id: 'pclr_a4_std', name: 'A4 Color Print (Inkjet)', category: 'PRINT_COLOR_INKJET', price: 45, stock: 9999, unit: 'sheets' },
  { id: 'cs_bw_a4', name: 'Photocopy B/W (A4)', category: 'COPY_SCAN', price: 5, stock: 9999, unit: 'sheets' },
  { id: 'cs_clr_a4', name: 'Photocopy Color (A4)', category: 'COPY_SCAN', price: 60, stock: 9999, unit: 'sheets' },
  { id: 'cs_scan_std', name: 'Scan to PDF/Email', category: 'COPY_SCAN', price: 20, stock: 9999, unit: 'job' },
  { id: 'lam_a4_std', name: 'A4 Lamination', category: 'LAMINATION', price: 100, stock: 9999, unit: 'units' },
  { id: 'lam_a3_std', name: 'A3 Lamination', category: 'LAMINATION', price: 200, stock: 9999, unit: 'units' },
  { id: 'bind_spi_std', name: 'Spiral Binding (Standard)', category: 'BIND_SPIRAL', price: 150, stock: 9999, unit: 'units' },
  { id: 'bind_comb_std', name: 'Comb Binding (Standard)', category: 'BIND_COMB', price: 100, stock: 9999, unit: 'units' },

  // 🖨️ WEDDING INVITATIONS
  { id: 'lp_ab_s', name: 'Invitation Card - Laser (Art Board) 4x6', category: 'WEDDING_INVITATION', price: 30, stock: 1000, unit: 'card' },
  { id: 'lp_ps_s', name: 'Invitation Card - Laser (Pearlescent) 4x6', category: 'WEDDING_INVITATION', price: 37, stock: 1000, unit: 'card' },
  { id: 'ij_iv_s', name: 'Invitation Card - Inkjet (Ivory Board) 4x6', category: 'WEDDING_INVITATION', price: 20, stock: 1000, unit: 'card' },

  // ✉️ ENVELOPES
  { id: 'env_w_46', name: 'Envelope 4x6 - White 60GSM', category: 'ENVELOPE', price: 7, stock: 5000, unit: 'piece' },
  { id: 'env_custom', name: 'Custom Cover / Envelope', category: 'ENVELOPE', price: 100, stock: 500, unit: 'piece' },

  // 🎀 ADD-ONS
  { id: 'add_qr', name: 'QR Code (Location/Digital)', category: 'EXTRAS', price: 200, stock: 9999, unit: 'units' },
  { id: 'add_gold', name: 'Gold Foiling (Premium)', category: 'PREMIUM_FINISH', price: 75, stock: 9999, unit: 'units' },
];

export const MOCK_SUPPLIERS: Supplier[] = [];

export const MOCK_PARTNERS: Partner[] = [
  { id: 'pt1', name: 'Primary Partner', sharePercentage: 100, totalDraws: 0 },
];

export const MOCK_DUTIES: StaffDuty[] = [];

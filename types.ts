export enum UserRole {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
  CASHIER = 'CASHIER',
  DESIGNER = 'DESIGNER'
}

export enum JobStatus {
  QUOTE = 'QUOTE',
  APPROVED = 'APPROVED',
  IN_PROGRESS = 'IN_PROGRESS',
  OUTSOURCED = 'OUTSOURCED',
  COMPLETED = 'COMPLETED',
  DELIVERED = 'DELIVERED'
}

export enum DesignStatus {
  BRIEFING = 'BRIEFING',
  DRAFTING = 'DRAFTING',
  CLIENT_REVIEW = 'CLIENT_REVIEW',
  REVISIONS = 'REVISIONS',
  FINAL_APPROVED = 'FINAL_APPROVED',
  SENT_TO_PRINT = 'SENT_TO_PRINT'
}

export enum OrderSource {
  WALK_IN = 'WALK_IN',
  ONLINE = 'ONLINE'
}

export enum DeliveryMethod {
  ONLINE = 'ONLINE',
  IN_STORE_COLLECTION = 'IN_STORE_COLLECTION'
}

export enum DutyStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum PaymentMethod {
  CASH = 'CASH',
  BANK_TRANSFER = 'BANK_TRANSFER',
  QR = 'QR',
  CARD = 'CARD'
}

export enum CurrencyCode {
  LKR = 'Rs.',
  USD = '$',
  EUR = '€',
  GBP = '£',
  AUD = 'A$'
}

export enum MaterialUnit {
  GRAMS = 'GRAMS',
  ML = 'ML',
  SHEETS = 'SHEETS',
  METERS = 'METERS',
  PIECES = 'PIECES',
  SQFT = 'SQFT',
  CLICK = 'CLICK'
}

export interface Material {
  id: string;
  name: string;
  unit: MaterialUnit;
  costPerUnit: number;
  currentStock: number;
  minThreshold: number;
  defaultWastagePercent: number;
}

export interface ProductionProcess {
  id: string;
  name: string;
  unit: 'HOUR' | 'JOB' | 'METER' | 'CLICK' | 'PIECE';
  ratePerUnit: number;
}

export interface CreativeProject {
  id: string;
  customerId: string;
  title: string;
  description: string;
  status: DesignStatus;
  deadline: string;
  assignedDesignerId?: string;
  briefDetails: string;
  proofUrl?: string;
  revisionsCount: number;
  isSMM: boolean;
  platform?: 'FACEBOOK' | 'INSTAGRAM' | 'TIKTOK' | 'MULTI';
}

export interface CostBreakdown {
  materials: Array<{
    materialId: string;
    consumedQty: number;
    wastageQty: number;
    totalCost: number;
  }>;
  processes: Array<{
    processId: string;
    units: number;
    totalCost: number;
  }>;
  laborCost: number;
  overheadMarkup: number;
  totalActualCost: number;
}

export enum CommitmentCategory {
  SHOP_RENTAL = 'SHOP_RENTAL',
  ELECTRICITY = 'ELECTRICITY',
  WATER = 'WATER',
  MAINTENANCE = 'MAINTENANCE',
  GOVT_TAX = 'GOVT_TAX',
  LICENCE = 'LICENCE',
  BIZ_REGISTRATION = 'BIZ_REGISTRATION',
  KEYMONEY = 'KEYMONEY',
  OTHER = 'OTHER'
}

export enum StorageProvider {
  GOOGLE_DRIVE = 'GOOGLE_DRIVE',
  ONE_DRIVE = 'ONE_DRIVE'
}

export type InvoiceTemplate = 'MODERN' | 'CLASSIC' | 'THERMAL' | 'MINIMAL';

export interface InvoiceSettings {
  template: InvoiceTemplate;
  primaryColor: string;
  businessLogoUrl: string;
  businessName: string;
  businessTagline: string;
  businessAddress: string;
  businessPhone: string;
  businessEmail: string;
  footerNotes: string;
  showPaymentDetails: boolean;
  bankDetails: string;
  taxNumber?: string;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  pin?: string;
  avatarColor?: string;
}

export interface BusinessCommitment {
  id: string;
  category: CommitmentCategory;
  name: string;
  amount: number;
  dueDate?: string;
  paidDate?: string;
  status: 'PAID' | 'PENDING' | 'OVERDUE';
  isRecurring: boolean;
  branchId: string;
  notes?: string;
}

export interface Customer {
  id: string;
  name: string;
  businessName?: string;
  phone: string;
  email: string;
  address?: string;
  birthday?: string;
  history?: string[];
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  managerName: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface CompanyAsset {
  id: string;
  name: string;
  category: 'FURNITURE' | 'IT_EQUIPMENT' | 'VEHICLE' | 'OFFICE_SUPPLY' | 'OTHER';
  value: number;
  purchaseDate: string;
  serialNumber?: string;
  branchId: string;
}

// Added branchId to StaffDuty to allow filtering by branch
export interface StaffDuty {
  id: string;
  staffId: string;
  task: string;
  deadline: string;
  status: DutyStatus;
  cancellationNote?: string;
  assignedBy: string;
  createdAt: string;
  branchId: string;
}

export interface BusinessSubscription {
  id: string;
  name: string;
  purchaseDate: string;
  expiryDate: string;
  amount: number;
  paymentDetails: string;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
}

export interface Machinery {
  id: string;
  name: string;
  model: string;
  serialNumber: string;
  purchaseDate: string;
  totalCost: number;
  amountPaid: number;
  purchasePrice: number; 
  salvageValue: number;
  estimatedLifeYears: number;
  monthlyOpCost: number;
  expectedMonthlyHours: number;
  status: 'OPERATIONAL' | 'UNDER_MAINTENANCE' | 'OUT_OF_ORDER';
  location: string;
  branchId: string;
  initialCounter: number;
  currentCounter: number;
  type: 'OWNED' | 'LEASED';
  consumableStocks: Array<{
    name: string;
    level: number;
  }>;
}

export interface MachineryService {
  id: string;
  machineryId: string;
  technicianName: string;
  technicianPhone: string;
  visitDate: string;
  charges: number;
  description: string;
  replacedParts?: string;
  nextServiceDate?: string;
  type: 'REPAIR' | 'ROUTINE' | 'EMERGENCY';
}

export interface ProductComponent {
  inventoryItemId: string;
  quantity: number;
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  stock: number;
  unit: string;
  components?: Array<ProductComponent>;
}

export interface StaffMember {
  id: string;
  name: string;
  phone: string;
  designation: string;
  baseSalary: number;
  allowance: number;
  commissionRate: number;
  joiningDate: string;
  onDuty: boolean;
  totalAdvances: number;
  branchId: string;
}

export interface AttendanceRecord {
  id: string;
  staffId: string;
  date: string;
  clockIn: string;
  clockOut?: string;
  extraHours: number;
  status: 'PRESENT' | 'ABSENT' | 'LEAVE';
}

export interface Job {
  id: string;
  manualJobNumber?: string;
  customerId: string;
  customerName?: string;
  address?: string;
  contactNumber?: string;
  whatsappNumber?: string;
  branchId: string;
  collectionLocationId?: string;
  orderTakenBy?: string;
  orderProcessedBy?: string;
  deliveryMethod?: DeliveryMethod;
  title: string;
  description: string;
  status: JobStatus;
  source: OrderSource;
  totalAmount: number;
  paidAmount: number;
  advancePayment: number;
  currency: CurrencyCode;
  foreignAmount?: number;
  foreignCurrency?: CurrencyCode;
  exchangeRate?: number;
  expiryDate?: string; 
  outsourcedCost?: number;
  designCost?: number;
  printingCost?: number;
  finishingCost?: number;
  deliveryCost?: number;
  outsourcedVendorId?: string;
  isOutsourced: boolean;
  createWhatsAppGroup: boolean;
  whatsappGroupLink?: string;
  jobTakenDate: string;
  deliveryDate: string;
  reminderSent?: boolean;
  lastReminderDate?: string;
  lastReminderType?: string;
  createdAt: string;
  updatedAt: string;
  costBreakdown?: CostBreakdown;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
  }>;
  machineId?: string;
}

export interface Transaction {
  id: string;
  jobId?: string;
  customerId?: string;
  staffId?: string; 
  branchId: string;
  accountId?: string;
  amount: number;
  currency: CurrencyCode;
  source: OrderSource;
  foreignAmount?: number;
  foreignCurrency?: CurrencyCode;
  exchangeRate?: number;
  paymentMethod: PaymentMethod;
  timestamp: string;
  type: 'SALE' | 'EXPENSE' | 'IMPORT' | 'TRANSFER' | 'PARTNER_DRAW' | 'STAFF_PAYROLL' | 'STAFF_ADVANCE' | 'MACHINERY_SERVICE' | 'OPERATIONAL_BILL';
  description: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  minThreshold: number;
  unit: string;
  branchId: string;
}

export interface Supplier {
  id: string;
  name: string;
  category: string;
  contact: string;
  address: string;
  services: Array<{ id: string; name: string; price: number }>;
}

export interface Partner {
  id: string;
  name: string;
  sharePercentage: number;
  totalDraws: number;
}

export interface FinancialAccount {
  id: string;
  name: string;
  type: 'CASH' | 'BANK' | 'SAVINGS';
  balance: number;
  branchId: string;
}

export interface PayrollRecord {
  id: string;
  staffId: string;
  monthYear: string;
  basePaid: number;
  allowancePaid: number;
  commissionPaid: number;
  otPaid: number;
  advanceDeducted: number;
  totalNet: number;
  paidAt: string;
}

export interface RentalCounterReading {
  id: string;
  machineId: string;
  date: string;
  reading: number;
  previousReading: number;
  clicks: number;
  cost: number;
}

export interface RentalMachinery {
  id: string;
  name: string;
  model: string;
  serialNumber: string;
  provider: string;
  depositAmount: number;
  totalContractValue: number;
  amountPaid: number;
  monthlyFixedRent: number;
  perClickRate: number;
  initialCounter: number;
  currentCounter: number;
  startDate: string;
  nextPaymentDate: string;
  status: 'ACTIVE' | 'RETURNED' | 'MAINTENANCE';
  tonerStock: number;
  drumLifePercent: number;
}

export interface RentalRepair {
  id: string;
  machineId: string;
  repairDate: string;
  description: string;
  cost: number;
  technician: string;
}

// Added RentalPayment interface for lease settlements
export interface RentalPayment {
  id: string;
  machineId: string;
  amount: number;
  paymentDate: string;
  type: 'RENT' | 'DEPOSIT' | 'OTHER';
  paymentMethod: PaymentMethod;
  notes?: string;
}

export type ProductCategory = 
  | 'PRINT_BW' 
  | 'PRINT_COLOR_INKJET' 
  | 'PRINT_COLOR_LASER' 
  | 'PHOTO_PRINT' 
  | 'BOARD_PRINT' 
  | 'LAMINATION' 
  | 'BIND_SPIRAL' 
  | 'BIND_COMB' 
  | 'BIND_OTHER' 
  | 'ID_PRODUCTS' 
  | 'TYPING' 
  | 'DOC_SERVICE' 
  | 'DESIGN_BASIC' 
  | 'DESIGN_MARKETING' 
  | 'LEAFLET_PRINT' 
  | 'LARGE_FORMAT' 
  | 'LABEL_PRINT' 
  | 'COPY_SCAN' 
  | 'DIGITAL_SERVICE' 
  | 'FINISHING' 
  | 'STICKER_WORK' 
  | 'GOV_SERVICE' 
  | 'EXTRAS' 
  | 'INTERNAL'
  | 'CONSUMABLE' 
  | 'OTHER'
  | 'PREMIUM_FINISH'
  | 'DIGITAL_INVITE'
  | 'GIFT_ITEM'
  | 'BUNDLE_DEALS'
  | 'DESIGN_CONSULT'
  | 'WEDDING_INVITATION'
  | 'ENVELOPE'
  | 'SMM_RETAINER';
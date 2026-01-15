
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

export interface StaffDuty {
  id: string;
  staffId: string;
  task: string;
  deadline: string;
  status: DutyStatus;
  cancellationNote?: string;
  assignedBy: string;
  createdAt: string;
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
  purchasePrice: number;
  salvageValue: number;
  estimatedLifeYears: number;
  monthlyOpCost: number;
  expectedMonthlyHours: number;
  status: 'OPERATIONAL' | 'UNDER_MAINTENANCE' | 'OUT_OF_ORDER';
  location: string;
  branchId: string;
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
}

export interface SupplierService {
  id: string;
  name: string;
  price: number;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  address?: string;
  services: SupplierService[];
  category: string;
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
  branchId?: string;
}

export interface Product {
  id: string;
  name: string;
  category: 'PRINTING' | 'DESIGN' | 'FINISHING' | 'CONSUMABLE';
  price: number;
  stock: number;
  unit: string;
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
  outsourcedVendorId?: string;
  isOutsourced: boolean;
  createWhatsAppGroup: boolean;
  whatsappGroupLink?: string;
  jobTakenDate: string;
  deliveryDate: string;
  reminderSent?: boolean;
  createdAt: string;
  updatedAt: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
  }>;
}

export interface InventoryItem {
  id: string;
  name: string;
  branchId: string;
  quantity: number;
  minThreshold: number;
  unit: string;
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

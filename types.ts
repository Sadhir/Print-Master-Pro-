
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

export enum PaymentMethod {
  CASH = 'CASH',
  BANK_TRANSFER = 'BANK_TRANSFER',
  QR = 'QR',
  CARD = 'CARD'
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address?: string;
  history?: string[];
}

export interface Product {
  id: string;
  name: string;
  category: 'PRINTING' | 'DESIGN' | 'FINISHING' | 'CONSUMABLE';
  price: number;
  stock: number;
  unit: string;
}

export interface Job {
  id: string;
  customerId: string;
  title: string;
  description: string;
  status: JobStatus;
  totalAmount: number;
  paidAmount: number;
  outsourcedCost?: number;
  isOutsourced: boolean;
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
  quantity: number;
  minThreshold: number;
  unit: string;
}

export interface Transaction {
  id: string;
  jobId?: string;
  customerId?: string;
  amount: number;
  paymentMethod: PaymentMethod;
  timestamp: string;
  type: 'SALE' | 'EXPENSE' | 'IMPORT';
  description: string;
}

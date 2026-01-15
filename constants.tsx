
import { Customer, Product, Job, JobStatus, InventoryItem } from './types';

export const MOCK_CUSTOMERS: Customer[] = [
  { id: 'c1', name: 'John Doe', phone: '+1234567890', email: 'john@example.com' },
  { id: 'c2', name: 'Alice Smith', phone: '+1987654321', email: 'alice@business.com' },
  { id: 'c3', name: 'Local Cafe', phone: '+1555019283', email: 'orders@cafe.com' },
];

export const MOCK_PRODUCTS: Product[] = [
  { id: 'p1', name: 'Business Cards (100pk)', category: 'PRINTING', price: 25.0, stock: 500, unit: 'box' },
  { id: 'p2', name: 'A4 Color Print', category: 'PRINTING', price: 0.50, stock: 10000, unit: 'sheet' },
  { id: 'p3', name: 'Logo Design Basic', category: 'DESIGN', price: 150.0, stock: 999, unit: 'unit' },
  { id: 'p4', name: 'Lamination A4', category: 'FINISHING', price: 1.0, stock: 200, unit: 'sheet' },
];

export const MOCK_JOBS: Job[] = [
  {
    id: 'J-001',
    customerId: 'c1',
    title: 'Wedding Invitation Set',
    description: 'Gold foil invitations with envelopes',
    status: JobStatus.IN_PROGRESS,
    totalAmount: 450.0,
    paidAmount: 200.0,
    isOutsourced: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    items: [
      { description: 'Graphic Design Service', quantity: 1, unitPrice: 150 },
      { description: 'Premium Cards Printing', quantity: 100, unitPrice: 3 }
    ]
  },
  {
    id: 'J-002',
    customerId: 'c2',
    title: 'Outdoor Vinyl Banner',
    description: '2x3m heavy duty banner',
    status: JobStatus.OUTSOURCED,
    totalAmount: 120.0,
    paidAmount: 120.0,
    isOutsourced: true,
    outsourcedCost: 65.0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    items: [
      { description: 'Vinyl Banner Printing', quantity: 1, unitPrice: 120 }
    ]
  }
];

export const MOCK_INVENTORY: InventoryItem[] = [
  { id: 'i1', name: 'A4 80gsm Paper', quantity: 5000, minThreshold: 1000, unit: 'sheets' },
  { id: 'i2', name: 'Cyan Ink Tank', quantity: 15, minThreshold: 5, unit: 'units' },
  { id: 'i3', name: 'Glossy Photo Paper', quantity: 120, minThreshold: 200, unit: 'sheets' },
];

/**
 * Application-wide type definitions
 *
 * Currency: All prices are in Nigerian Naira (NGN)
 * Price format: Whole numbers (e.g., 7500 = ₦7,500.00)
 */

// UI Component Types
export interface Stat {
  value: string;
  label: string;
}

export interface Service {
  id: number;
  title: string;
  description: string;
}

export interface Goal {
  id: number;
  value: string;
  label: string;
}

export interface NavLink {
  label: string;
  href: string;
}

export interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  image: string;
  date: string;
  category: string;
}

// Product and Cart Types
export interface Product {
  id: number;
  name: string;
  price: number; // Price in NGN (Nigerian Naira)
  unit: string;
  image: string;
  description: string;
  inStock: boolean;
  rating: number;
  category: string; // Product category for organization
  stock: number; // Current available quantity
  lowStockThreshold: number; // Alert when stock drops below this
  reorderPoint: number; // Suggested reorder quantity
  lastRestocked?: string; // Last restock date (ISO string)
}

export interface CartItem extends Product {
  quantity: number;
  category: string;
}

export interface CartStore {
  items: CartItem[];
  addItem: (product: Product, category: string) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  image: string;
  slug: string;
}

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

export interface OrderItem {
  id: number;
  name: string;
  price: number; // Price in NGN (Nigerian Naira)
  quantity: number;
  image: string;
  unit: string;
  category: string; // Product category for reordering
}

export interface ShippingAddress {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: OrderStatus;
  total: number; // Total in NGN (Nigerian Naira)
  subtotal: number; // Subtotal before shipping and tax
  shipping: number; // Shipping cost
  tax: number; // Tax amount
  items: OrderItem[];
  itemCount: number;
  userEmail: string; // Email of user who placed order
  userId?: string; // ID of user who placed order
  shippingAddress: ShippingAddress;
  paymentMethod: string; // Payment method used
  tracking?: {
    number: string;
    carrier: string;
    url?: string;
    estimatedDelivery?: string;
  };
  timeline: {
    status: string;
    date: string;
    completed: boolean;
  }[];
}

// Notification types
export type NotificationType = "success" | "warning" | "error" | "info";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

// Restock subscription for "Notify Me" feature
export interface RestockSubscription {
  id: string;
  productId: number;
  userId: string;
  userEmail: string;
  subscribedAt: string;
}

// Email template
export interface EmailTemplate {
  to: string;
  subject: string;
  body: string;
  sentAt?: string;
}

// Inventory restock history
export interface RestockHistory {
  id: string;
  productId: number;
  quantity: number;
  previousStock: number;
  newStock: number;
  restockedBy: string; // Admin user ID
  restockedAt: string;
  notes?: string;
}

// User types
export type UserType =
  | 'retail'
  | 'wholesale_pending'
  | 'wholesale_verified'
  | 'distributor_pending'
  | 'distributor_verified';

// Distributor tier based on geographic coverage
export type DistributorTier = 'tier1' | 'tier2' | 'tier3';

export interface User {
  id?: string;
  name?: string;
  email?: string;
  userType: UserType;
  isAdmin?: boolean;
  businessInfo?: {
    businessName: string;
    businessAddress: string;
  };
  distributorInfo?: {
    businessName: string;
    businessAddress: string;
    distributionArea: string;
    yearsInBusiness: string;
    expectedVolume: string;
    tier?: DistributorTier;
  };
}

// Wholesale Application
export interface WholesaleApplication {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  businessName: string;
  businessAddress: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedAt: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

// Distributor Application
export interface DistributorApplication {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  businessName: string;
  businessAddress: string;
  distributionArea: string;
  yearsInBusiness: string;
  expectedVolume: string;
  additionalInfo?: string;
  tier?: DistributorTier;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;
}

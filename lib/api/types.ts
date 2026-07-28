/**
 * Types mirroring the backend's API contract.
 *
 * Field names are snake_case because that is what the API sends. Translating
 * to camelCase at the boundary was how the previous client silently broke:
 * it read `data.accessToken` while the server sent `access_token`, so the
 * token was always `undefined` and every authenticated call failed.
 *
 * These can be regenerated from the backend's OpenAPI schema:
 *   uv run python manage.py spectacular --file schema.yml   (backend)
 *   npx openapi-typescript schema.yml -o lib/api/schema.d.ts (frontend)
 */

/** Every response from the API has this shape. */
export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  errors: ApiFieldError[];
}

export interface ApiFieldError {
  field?: string;
  messages?: string[];
  [key: string]: unknown;
}

export interface Paginated<T> {
  results: T[];
  count: number;
  page: number;
  pages: number;
  next: string | null;
  previous: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Identity
// ─────────────────────────────────────────────────────────────────────────────
export type Role = "CUSTOMER" | "STAFF" | "ADMIN";

export type AccountType =
  | "RETAIL"
  | "WHOLESALE_PENDING"
  | "WHOLESALE_VERIFIED"
  | "DISTRIBUTOR_PENDING"
  | "DISTRIBUTOR_VERIFIED";

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: Role;
  account_type: AccountType;
  is_email_verified: boolean;
  /** Server-computed. Never derive entitlement on the client. */
  gets_bulk_pricing: boolean;
  is_back_office: boolean;
  date_joined: string;
}

export interface AuthResult {
  user: User;
  access_token: string;
}

export interface Address {
  id: string;
  label: string;
  recipient_name: string;
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string;
  is_default: boolean;
  created_at: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Catalogue
// ─────────────────────────────────────────────────────────────────────────────
export type StockStatus = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string | null;
  sort_order: number;
  product_count: number;
}

export interface BulkTier {
  min_quantity: number;
  /** Decimal string. Never parse money into a float. */
  price_per_unit: string;
  saving_per_unit: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  category: string;
  category_name: string;
  description: string;
  unit: string;
  base_price: string;
  /** What THIS caller pays for one. Computed server-side. */
  unit_price: string;
  primary_image: string | null;
  available_stock: number;
  stock_status: StockStatus;
  has_bulk_pricing: boolean;
}

export interface ProductDetail extends Product {
  long_description: string;
  images: { id: string; image: string; alt_text: string; is_primary: boolean }[];
  bulk_tiers: BulkTier[];
  low_stock_threshold: number;
}

export interface PriceQuote {
  product: string;
  quantity: number;
  unit_price: string;
  line_total: string;
  retail_unit_price: string;
  saving: string;
  available_stock: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Cart & checkout
// ─────────────────────────────────────────────────────────────────────────────
export interface CartItem {
  id: string;
  product_slug: string;
  product_name: string;
  unit: string;
  quantity: number;
  unit_price: string;
  line_total: string;
  available_stock: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
  item_count: number;
  subtotal: string;
  updated_at: string;
}

export interface QuoteLine {
  product_slug: string;
  product_name: string;
  quantity: number;
  unit_price: string;
  line_total: string;
  retail_unit_price: string;
}

/** The authoritative totals. The client renders these; it never computes them. */
export interface CheckoutQuote {
  lines: QuoteLine[];
  subtotal: string;
  discount_total: string;
  shipping_total: string;
  tax_total: string;
  tax_rate: string;
  grand_total: string;
  currency: string;
  free_shipping_threshold: string;
  amount_to_free_shipping: string;
}

export interface ShippingAddressInput {
  recipient_name: string;
  street: string;
  city: string;
  state: string;
  postal_code?: string;
  country?: string;
  phone: string;
}

export type PaymentMethod = "PAYSTACK" | "COD";

// ─────────────────────────────────────────────────────────────────────────────
// Orders
// ─────────────────────────────────────────────────────────────────────────────
export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "PACKED"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

export type PaymentStatus =
  | "UNPAID"
  | "AUTHORIZED"
  | "PAID"
  | "PARTIALLY_REFUNDED"
  | "REFUNDED"
  | "FAILED";

export interface OrderItem {
  id: string;
  product_name_snapshot: string;
  sku_snapshot: string;
  unit_snapshot: string;
  image_snapshot: string;
  quantity: number;
  unit_price: string;
  line_total: string;
}

export interface OrderStatusEvent {
  from_status: string;
  to_status: string;
  note: string;
  created_at: string;
}

export interface Shipment {
  carrier: string;
  tracking_number: string;
  tracking_url: string;
  estimated_delivery: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
}

export interface OrderSummary {
  id: string;
  order_number: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  grand_total: string;
  currency: string;
  item_count: number;
  placed_at: string;
}

export interface Order extends OrderSummary {
  email: string;
  subtotal: string;
  discount_total: string;
  shipping_total: string;
  tax_total: string;
  shipping_address: ShippingAddressInput;
  billing_address: ShippingAddressInput;
  customer_notes: string;
  is_cancellable: boolean;
  items: OrderItem[];
  status_events: OrderStatusEvent[];
  shipments: Shipment[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Store configuration
// ─────────────────────────────────────────────────────────────────────────────
export interface StoreConfig {
  currency: string;
  /** One source of truth. Never hardcode this in a component again. */
  free_shipping_threshold: string;
  cod_enabled: boolean;
  guest_checkout_enabled: boolean;
  support_email: string;
  support_phone: string;
}

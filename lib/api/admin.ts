/**
 * The back-office API.
 *
 * PRD §13 Q4 is answered: a React back office, not Django Admin. Django Admin
 * is now off in production — it reaches the same tables through a different
 * door, with its own session cookie, its own CSRF surface and a login form
 * DRF's throttles never see.
 *
 * Everything here goes through the same `apiClient` as the storefront, so the
 * back office inherits the memory-held access token, the single-flight refresh
 * and the trailing-slash normalisation rather than reimplementing them badly.
 *
 * **Never call these from a Server Component.** `apiClient` holds its token in
 * module scope, which is shared across concurrent requests on the server — a
 * staff token would leak between visitors. Every admin screen is a Client
 * Component for exactly this reason.
 */

import { apiClient } from "./client";
import type { AccountType, Paginated, Product, Role } from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// Product photography
// ─────────────────────────────────────────────────────────────────────────────

export interface ProductImage {
  id: string;
  image: string;
  alt_text: string;
  sort_order: number;
  is_primary: boolean;
}

export function listProductImages(slug: string): Promise<ProductImage[]> {
  return apiClient.get<ProductImage[]>(`/staff/products/${slug}/images/`);
}

/**
 * Upload one photograph.
 *
 * `FormData`, not JSON — the file has to travel as multipart. `postForm` omits
 * the JSON content-type header so the browser can set the multipart boundary
 * itself; setting it by hand produces a body the server cannot parse, and the
 * error looks like a validation failure rather than a transport one.
 *
 * The first image uploaded becomes the primary one server-side, so a single
 * upload is enough to fill the product card.
 */
export function uploadProductImage(
  slug: string,
  file: File,
  options: { altText?: string; makePrimary?: boolean } = {},
): Promise<ProductImage> {
  const form = new FormData();
  form.append("file", file);
  if (options.altText) form.append("alt_text", options.altText);
  if (options.makePrimary) form.append("make_primary", "true");

  return apiClient.postForm<ProductImage>(`/staff/products/${slug}/images/`, form);
}

/** Choose the photograph that appears on the card and in search results. */
export function setPrimaryImage(slug: string, imageId: string): Promise<ProductImage> {
  return apiClient.post<ProductImage>(`/staff/products/${slug}/images/${imageId}/`);
}

/** Delete one. The server promotes the next image if this was the primary. */
export function deleteProductImage(slug: string, imageId: string): Promise<null> {
  return apiClient.delete<null>(`/staff/products/${slug}/images/${imageId}/`);
}

export function reorderProductImages(slug: string, imageIds: string[]): Promise<ProductImage[]> {
  return apiClient.post<ProductImage[]>(`/staff/products/${slug}/images/reorder/`, {
    image_ids: imageIds,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Inventory
// ─────────────────────────────────────────────────────────────────────────────

export interface InventoryRow {
  product: string;
  product_name: string;
  product_slug: string;
  sku: string;
  quantity_on_hand: number;
  quantity_reserved: number;
  quantity_available: number;
  low_stock_threshold: number;
  stock_status: string;
}

export function listInventory(params?: {
  search?: string;
  low_stock?: boolean;
}): Promise<Paginated<InventoryRow>> {
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  if (params?.low_stock) query.set("low_stock", "true");

  const suffix = query.toString() ? `?${query}` : "";
  return apiClient.get<Paginated<InventoryRow>>(`/staff/inventory/${suffix}`);
}

/**
 * Add stock, recording why.
 *
 * Goes through the ledger — `quantity_on_hand` is never written directly, so
 * every movement stays explainable after the fact.
 */
export function restock(slug: string, quantity: number, notes = ""): Promise<InventoryRow> {
  return apiClient.post<InventoryRow>(`/staff/inventory/${slug}/restock/`, { quantity, notes });
}

/** Correct a count to an absolute figure — a stocktake, not a delivery. */
export function adjustStock(
  slug: string,
  newQuantity: number,
  notes = "",
): Promise<InventoryRow> {
  return apiClient.post<InventoryRow>(`/staff/inventory/${slug}/adjust/`, {
    new_quantity: newQuantity,
    notes,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Orders
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Mirrors `StaffOrderSerializer` exactly, checked against the running API.
 *
 * Two fields were previously guessed and both were wrong: `created_at` (it is
 * `placed_at`) and `customer_email`, which the list does not return at all —
 * so the screen rendered "Invalid Date" and a blank customer column. Neither
 * threw, which is how they survived: TypeScript checks the shape it is told
 * about, and it was told the wrong one.
 */
export interface StaffOrder {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  currency: string;
  grand_total: string;
  item_count: number;
  placed_at: string;
}

export function listStaffOrders(params?: {
  status?: string;
  search?: string;
  page?: number;
}): Promise<Paginated<StaffOrder>> {
  const query = new URLSearchParams();
  if (params?.status) query.set("status", params.status);
  if (params?.search) query.set("search", params.search);
  if (params?.page) query.set("page", String(params.page));

  const suffix = query.toString() ? `?${query}` : "";
  return apiClient.get<Paginated<StaffOrder>>(`/staff/orders/${suffix}`);
}

export function getStaffOrder(orderNumber: string): Promise<Record<string, unknown>> {
  return apiClient.get(`/staff/orders/${orderNumber}/`);
}

/**
 * Move an order along.
 *
 * The server refuses transitions the state machine forbids, so an invalid one
 * is a 400 rather than a corrupt order — the client does not need to know the
 * machine, only to show the refusal.
 */
export function setOrderStatus(
  orderNumber: string,
  status: string,
  notes = "",
): Promise<Record<string, unknown>> {
  return apiClient.post(`/staff/orders/${orderNumber}/status/`, { status, notes });
}

export interface RefundInput {
  /**
   * Omit for the full remaining balance.
   *
   * A decimal string, like every other money value crossing this boundary.
   * Typing it as `number` here would invite `Number(total)` at the call site,
   * and a refund is the last place to discover binary floating point.
   */
  amount?: string;
  reason: string;
  /** Only true when the goods physically came back. */
  return_stock?: boolean;
}

/**
 * Send money back.
 *
 * **Administrator-only, and the API is what enforces it** — `StaffRefundView`
 * uses `IsAdmin`, not `IsStaff`, because this is the one operation that moves
 * money *out* of the business. Hiding the control from a warehouse hand is
 * courtesy; the permission class is the control.
 *
 * `reason` is mandatory server-side and recorded against the order, so every
 * refund names who authorised it and why. `return_stock` is separate from the
 * money on purpose: a customer refunded for a damaged crate is not a crate
 * coming back onto the shelf, and conflating the two silently invents stock.
 */
export function refundOrder(
  orderNumber: string,
  input: RefundInput,
): Promise<Record<string, unknown>> {
  return apiClient.post(`/staff/orders/${orderNumber}/refund/`, {
    reason: input.reason,
    // Sent only when given. An explicit `null` and an absent key mean the same
    // thing to the serializer, but omitting it keeps the request honest about
    // what was actually asked for.
    ...(input.amount ? { amount: input.amount } : {}),
    return_stock: input.return_stock ?? false,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Applications
// ─────────────────────────────────────────────────────────────────────────────

export interface StaffApplication {
  id: string;
  application_type: string;
  status: string;
  business_name: string;
  contact_person: string;
  contact_email: string;
  contact_phone: string;
  computed_tier: { code: string; name: string } | null;
  review_notes: string;
  reviewed_by_email: string | null;
  created_at: string;
}

export function listStaffApplications(params?: {
  status?: string;
  application_type?: string;
}): Promise<Paginated<StaffApplication>> {
  const query = new URLSearchParams();
  if (params?.status) query.set("status", params.status);
  if (params?.application_type) query.set("application_type", params.application_type);

  const suffix = query.toString() ? `?${query}` : "";
  return apiClient.get<Paginated<StaffApplication>>(`/staff/applications/${suffix}`);
}

export function getStaffApplication(id: string): Promise<StaffApplication> {
  return apiClient.get<StaffApplication>(`/staff/applications/${id}/`);
}

/** Take ownership, so two reviewers do not work the same application. */
export function claimApplication(id: string): Promise<StaffApplication> {
  return apiClient.post<StaffApplication>(`/staff/applications/${id}/claim/`);
}

/**
 * Approve. The tier is computed server-side from the states covered — it is
 * never sent, and the applicant never chose it.
 */
export function approveApplication(id: string, notes = ""): Promise<StaffApplication> {
  return apiClient.post<StaffApplication>(`/staff/applications/${id}/approve/`, {
    review_notes: notes,
  });
}

/**
 * Reject.
 *
 * `decision_reason` is what the applicant sees; `review_notes` stays internal.
 * Sending the internal note as the reason is a disclosure bug, so they are
 * separate fields here rather than one convenient one.
 */
export function rejectApplication(
  id: string,
  decisionReason: string,
  notes = "",
): Promise<StaffApplication> {
  return apiClient.post<StaffApplication>(`/staff/applications/${id}/reject/`, {
    decision_reason: decisionReason,
    review_notes: notes,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Academy
// ─────────────────────────────────────────────────────────────────────────────

export interface StaffRegistration {
  id: string;
  reference: string;
  class_title: string;
  full_name: string;
  email: string;
  phone: string;
  status: string;
  registered_at: string;
}

export function listRegistrations(params?: {
  status?: string;
  search?: string;
}): Promise<Paginated<StaffRegistration>> {
  const query = new URLSearchParams();
  if (params?.status) query.set("status", params.status);
  if (params?.search) query.set("search", params.search);

  const suffix = query.toString() ? `?${query}` : "";
  return apiClient.get<Paginated<StaffRegistration>>(`/staff/academy/registrations/${suffix}`);
}

export function markAttended(reference: string): Promise<StaffRegistration> {
  return apiClient.post<StaffRegistration>(
    `/staff/academy/registrations/${reference}/attended/`,
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Analytics
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Every analytics response carries `computed_at`, `cached` and
 * `stale_after_seconds`, because the figures are cached for sixty seconds and
 * a number with no age on it invites someone to refresh until it "updates".
 */
export interface AnalyticsEnvelope<T> {
  computed_at: string;
  cached: boolean;
  stale_after_seconds: number;
  data: T;
}

export function getDashboard(): Promise<Record<string, unknown>> {
  return apiClient.get("/staff/analytics/");
}

export function getSales(params?: { start?: string; end?: string }): Promise<
  Record<string, unknown>
> {
  const query = new URLSearchParams();
  if (params?.start) query.set("start", params.start);
  if (params?.end) query.set("end", params.end);

  const suffix = query.toString() ? `?${query}` : "";
  return apiClient.get(`/staff/analytics/sales/${suffix}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// The platform snapshot
//
// Typed properly rather than as `Record<string, unknown>`, unlike the older
// analytics calls above. Every field below is money-as-a-string or a plain
// count, and the distinction matters at the call site: `total_spent` must
// reach `formatPrice` and must never reach `Number()`.
// ─────────────────────────────────────────────────────────────────────────────

/** Counts by role and by account type, kept apart because they are apart. */
export interface PeopleSnapshot {
  total: number;
  customers: number;
  staff: number;
  admins: number;
  retail: number;
  wholesale_pending: number;
  wholesale_verified: number;
  distributor_pending: number;
  distributor_verified: number;
  verified: number;
  unverified: number;
  deactivated: number;
  with_photograph: number;
  joined_last_30_days: number;
  joined_last_7_days: number;
  have_ordered: number;
  /** A percentage — the one legitimate float in the payload. */
  verified_rate: number;
}

export interface GrowthPoint {
  month: string;
  joined: number;
  /** Cumulative, and it starts from everyone who predates the window. */
  total: number;
}

export interface SalesPoint {
  month: string;
  /** Decimal string. */
  revenue: string;
  orders: number;
  items: number;
}

export interface TopCustomer {
  id: string;
  email: string;
  full_name: string;
  account_type: AccountType;
  /** Decimal string. */
  revenue: string;
  orders: number;
  last_order: string | null;
}

export interface PlatformSnapshot {
  computed_at: string;
  cached: boolean;
  stale_after_seconds: number;

  commerce: {
    gross_revenue: string;
    refunds: string;
    net_revenue: string;
    paid_orders: number;
    pending_orders: number;
    cancelled_orders: number;
    average_order_value: string;
    items_sold: number;
    distinct_customers: number;
    currency: string;
  };
  people: PeopleSnapshot;
  user_growth: GrowthPoint[];
  top_customers: TopCustomer[];
  segments: { account_type: string; revenue: string; orders: number; customers: number }[];
  orders: {
    by_status: Record<string, number>;
    by_payment: Record<string, number>;
    paid_and_awaiting_action: number;
  };
  catalogue: {
    products: { total: number; listed: number; unlisted: number; without_photograph: number };
    categories: number;
    inventory: {
      units_on_hand: number;
      units_reserved: number;
      low_stock: number;
      out_of_stock: number;
    };
    /** Decimal string, at retail — not a profit figure. */
    stock_value_at_retail: string;
  };
  sales: SalesPoint[];
  top_products: { name: string; sku: string; quantity: number; revenue: string }[];
  categories: { name: string; revenue: string; quantity: number }[];
  academy: {
    registrations: Record<string, number>;
    /** What confirmed and attended seats are worth, however they were settled. */
    booked_value: string;
    /** What this system actually watched arrive, via a signed webhook. */
    collected_online: string;
    programmes: number;
    classes: number;
    instructors: number;
  };
  applications: { pending: number; under_review: number; approved: number; rejected: number };
  content: {
    posts: { total: number; live: number; scheduled: number; drafts: number; featured: number };
    subscribers: { pending: number; subscribed: number; unsubscribed: number };
  };
  delivery: {
    runs: Record<string, number>;
    stops: Record<string, number>;
    drivers: number;
  };
}

/** Everything about the platform, in one round trip. Cached for a minute. */
export function getPlatformSnapshot(): Promise<PlatformSnapshot> {
  return apiClient.get<PlatformSnapshot>("/staff/analytics/platform/");
}

// ─────────────────────────────────────────────────────────────────────────────
// The user directory
//
// Read-only by design. `role` is granted by invitation and `account_type` is
// computed when an application is approved — there is deliberately no endpoint
// to set either from this screen, so there is deliberately no binding for it.
// ─────────────────────────────────────────────────────────────────────────────

export interface StaffUser {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  avatar: string | null;
  role: Role;
  account_type: AccountType;
  is_email_verified: boolean;
  is_active: boolean;
  date_joined: string;
  order_count: number;
  /** Decimal string. Never `Number()` it. */
  total_spent: string;
  last_order_at: string | null;
}

export interface StaffUserDetail extends StaffUser {
  applications: {
    id: string;
    application_type: string;
    business_name: string;
    status: string;
    submitted_at: string;
  }[];
  academy_registrations: {
    id: string;
    reference: string;
    status: string;
    registered_at: string;
  }[];
}

/** The chips above the directory. One query server-side, not one per chip. */
export interface UserSummary {
  total: number;
  role_customer: number;
  role_staff: number;
  role_admin: number;
  type_retail: number;
  type_wholesale_pending: number;
  type_wholesale_verified: number;
  type_distributor_pending: number;
  type_distributor_verified: number;
  verified: number;
  deactivated: number;
}

export function listStaffUsers(params?: {
  role?: string;
  account_type?: string;
  is_email_verified?: boolean;
  is_active?: boolean;
  search?: string;
  ordering?: string;
  page?: number;
}): Promise<Paginated<StaffUser>> {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params ?? {})) {
    // `false` is a meaningful filter value here — "show me the unverified" —
    // so only null and undefined are dropped. A plain truthiness check would
    // silently turn that filter into "no filter".
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  }
  const suffix = query.toString() ? `?${query}` : "";
  return apiClient.get<Paginated<StaffUser>>(`/staff/users/${suffix}`);
}

export function getStaffUser(id: string): Promise<StaffUserDetail> {
  return apiClient.get<StaffUserDetail>(`/staff/users/${id}/`);
}

export function getUserSummary(): Promise<UserSummary> {
  return apiClient.get<UserSummary>("/staff/users/summary/");
}

/** Clear the sixty-second cache, for when a figure needs to be current now. */
export function refreshAnalytics(): Promise<null> {
  return apiClient.post<null>("/staff/analytics/refresh/");
}

// ─────────────────────────────────────────────────────────────────────────────
// Staff invitations (administrators only)
// ─────────────────────────────────────────────────────────────────────────────

export interface StaffInvitation {
  id: string;
  email: string;
  role: "STAFF" | "ADMIN";
  status: "PENDING" | "ACCEPTED" | "REVOKED" | "EXPIRED";
  invited_by_email: string | null;
  expires_at: string;
  accepted_at: string | null;
  revoked_at: string | null;
  created_at: string;
}

export function listInvitations(): Promise<StaffInvitation[]> {
  return apiClient.get<StaffInvitation[]>("/staff/invitations/");
}

/**
 * Invite somebody to the back office.
 *
 * Administrator-only server-side: if staff could invite, the lowest privilege
 * in the back office could mint the highest. Re-inviting an address withdraws
 * the previous link rather than adding a second.
 */
export function invite(email: string, role: "STAFF" | "ADMIN"): Promise<StaffInvitation> {
  return apiClient.post<StaffInvitation>("/staff/invitations/", { email, role });
}

/** Withdraw an unaccepted invitation. Works because the server checks the row. */
export function revokeInvitation(id: string): Promise<StaffInvitation> {
  return apiClient.delete<StaffInvitation>(`/staff/invitations/${id}/`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Newsletter
// ─────────────────────────────────────────────────────────────────────────────

export interface Subscriber {
  id: string;
  email: string;
  status: "PENDING" | "SUBSCRIBED" | "UNSUBSCRIBED";
  source: string;
  confirmed_at: string | null;
  unsubscribed_at: string | null;
  created_at: string;
}

/**
 * Read-only, and deliberately so.
 *
 * There is no "add a subscriber" endpoint anywhere. Every row is supposed to
 * be evidence that a mailbox owner opened a confirmation link, and a way for
 * staff to type an address straight in as SUBSCRIBED would destroy that
 * quietly — surfacing only later, as a spam report.
 */
export function listSubscribers(params?: {
  status?: string;
  search?: string;
}): Promise<Paginated<Subscriber>> {
  const query = new URLSearchParams();
  if (params?.status) query.set("status", params.status);
  if (params?.search) query.set("search", params.search);

  const suffix = query.toString() ? `?${query}` : "";
  return apiClient.get<Paginated<Subscriber>>(`/staff/newsletter/${suffix}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Catalogue, for the product list
// ─────────────────────────────────────────────────────────────────────────────

export function listAllProducts(params?: {
  search?: string;
  page?: number;
}): Promise<Paginated<Product>> {
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  if (params?.page) query.set("page", String(params.page));

  const suffix = query.toString() ? `?${query}` : "";
  return apiClient.get<Paginated<Product>>(`/products/${suffix}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Own-fleet delivery (PRD §13 Q9)
// ─────────────────────────────────────────────────────────────────────────────

export interface Driver {
  id: string;
  full_name: string;
  phone: string;
  vehicle_registration: string;
  vehicle_description: string;
  is_active: boolean;
}

export interface DeliveryStop {
  id: string;
  order_number: string;
  sequence: number;
  status: "PENDING" | "DELIVERED" | "FAILED";
  /** Flattened from the order's shipping address: a driver cannot look it up. */
  recipient_name: string;
  address: string;
  phone: string;
  delivered_at: string | null;
  received_by: string;
  failure_reason: string;
  notes: string;
}

export interface DeliveryRun {
  id: string;
  driver: string;
  driver_name: string;
  scheduled_for: string;
  status: "PLANNED" | "OUT" | "COMPLETED" | "CANCELLED";
  started_at: string | null;
  completed_at: string | null;
  notes: string;
  stops: DeliveryStop[];
  stop_count: number;
}

export function listDrivers(): Promise<Driver[]> {
  return apiClient.get<Driver[]>("/staff/drivers/");
}

export function createDriver(input: {
  full_name: string;
  phone: string;
  vehicle_registration?: string;
  vehicle_description?: string;
}): Promise<Driver> {
  return apiClient.post<Driver>("/staff/drivers/", input);
}

export function listRuns(status?: string): Promise<DeliveryRun[]> {
  const suffix = status ? `?status=${status}` : "";
  return apiClient.get<DeliveryRun[]>(`/staff/delivery-runs/${suffix}`);
}

export function planRun(input: {
  driver: string;
  scheduled_for: string;
  notes?: string;
}): Promise<DeliveryRun> {
  return apiClient.post<DeliveryRun>("/staff/delivery-runs/", input);
}

/**
 * Load an order onto a run.
 *
 * The server refuses an order that is not packed yet, and one already on an
 * unfinished run — two drivers carrying the same parcel is the failure that
 * prevents. Both come back as a 400 with a message worth showing as-is.
 */
export function addStop(runId: string, orderNumber: string): Promise<DeliveryStop> {
  return apiClient.post<DeliveryStop>(`/staff/delivery-runs/${runId}/stops/`, {
    order_number: orderNumber,
  });
}

/** Set the driving order. Whoever plans the run sorts by geography. */
export function reorderStops(runId: string, stopIds: string[]): Promise<DeliveryStop[]> {
  return apiClient.post<DeliveryStop[]>(`/staff/delivery-runs/${runId}/route/`, {
    stop_ids: stopIds,
  });
}

/**
 * The van has left.
 *
 * Moves every packed order on the run to SHIPPED and records a despatch
 * against each, so no order is called shipped without a record of something
 * leaving the building.
 */
export function startRun(runId: string): Promise<DeliveryRun> {
  return apiClient.post<DeliveryRun>(`/staff/delivery-runs/${runId}/start/`);
}

// ── Driver-facing. Scoped server-side to the caller's own runs. ─────────────

export function myRuns(): Promise<DeliveryRun[]> {
  return apiClient.get<DeliveryRun[]>("/delivery/my-runs/");
}

/**
 * Hand the parcel over.
 *
 * `receivedBy` is required by the server: "delivered" with nobody's name
 * against it is the answer that cannot be checked when a customer says it
 * never arrived.
 */
export function markDelivered(
  stopId: string,
  receivedBy: string,
  notes = "",
): Promise<DeliveryStop> {
  return apiClient.post<DeliveryStop>(`/delivery/stops/${stopId}/delivered/`, {
    received_by: receivedBy,
    notes,
  });
}

/**
 * Nobody home, gate locked, address wrong.
 *
 * The order is **not** cancelled — the goods come back to the farm and the
 * order is still owed. Staff are notified so it can be rebooked.
 */
export function markFailed(stopId: string, reason: string): Promise<DeliveryStop> {
  return apiClient.post<DeliveryStop>(`/delivery/stops/${stopId}/failed/`, { reason });
}

// ─────────────────────────────────────────────────────────────────────────────
// Catalogue management
//
// Django Admin is off in production, so these are the only way to add a
// product, change a price or create a category. Everything here is staff-only
// server-side; the screens hide what the API would refuse anyway.
// ─────────────────────────────────────────────────────────────────────────────

export interface StaffProduct {
  id: string;
  sku: string;
  name: string;
  slug: string;
  /** The category's slug, not its id — the API takes and returns slugs here. */
  category: string;
  description: string;
  long_description: string;
  unit: string;
  base_price: string;
  is_active: boolean;
  /** Read-only. Stock belongs to the ledger, reached through restock/adjust. */
  quantity_on_hand: number;
  has_image: boolean;
  created_at: string;
}

export type ProductInput = Partial<
  Pick<
    StaffProduct,
    | "sku"
    | "name"
    | "category"
    | "description"
    | "long_description"
    | "unit"
    | "base_price"
    | "is_active"
  >
>;

export function listStaffProducts(params?: {
  search?: string;
  missing_image?: boolean;
  page?: number;
}): Promise<Paginated<StaffProduct>> {
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  if (params?.missing_image) query.set("missing_image", "true");
  if (params?.page) query.set("page", String(params.page));

  const suffix = query.toString() ? `?${query}` : "";
  return apiClient.get<Paginated<StaffProduct>>(`/staff/catalogue/products/${suffix}`);
}

/**
 * Create a product.
 *
 * It starts with an inventory row at zero. Stock is added through
 * `restock()`, so every unit has a ledger movement explaining where it came
 * from — there is deliberately no opening-quantity field.
 */
export function createProduct(input: ProductInput): Promise<StaffProduct> {
  return apiClient.post<StaffProduct>("/staff/catalogue/products/", input);
}

export function updateProduct(slug: string, input: ProductInput): Promise<StaffProduct> {
  return apiClient.patch<StaffProduct>(`/staff/catalogue/products/${slug}/`, input);
}

/**
 * Delete a product.
 *
 * Refused once it has been ordered — that history has to stay explainable.
 * Set `is_active: false` instead; the server says so in its refusal.
 */
export function deleteProduct(slug: string): Promise<null> {
  return apiClient.delete<null>(`/staff/catalogue/products/${slug}/`);
}

export interface StaffCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string | null;
  sort_order: number;
  is_active: boolean;
  product_count: number;
}

export function listStaffCategories(): Promise<StaffCategory[]> {
  return apiClient.get<StaffCategory[]>("/staff/catalogue/categories/");
}

export function createCategory(input: Partial<StaffCategory>): Promise<StaffCategory> {
  return apiClient.post<StaffCategory>("/staff/catalogue/categories/", input);
}

export function updateCategory(
  slug: string,
  input: Partial<StaffCategory>,
): Promise<StaffCategory> {
  return apiClient.patch<StaffCategory>(`/staff/catalogue/categories/${slug}/`, input);
}

export function deleteCategory(slug: string): Promise<null> {
  return apiClient.delete<null>(`/staff/catalogue/categories/${slug}/`);
}

export interface BulkTier {
  id: string;
  min_quantity: number;
  price_per_unit: string;
  applies_to: string;
}

export function listTiers(slug: string): Promise<BulkTier[]> {
  return apiClient.get<BulkTier[]>(`/staff/catalogue/products/${slug}/tiers/`);
}

export function createTier(slug: string, input: Partial<BulkTier>): Promise<BulkTier> {
  return apiClient.post<BulkTier>(`/staff/catalogue/products/${slug}/tiers/`, input);
}

export function deleteTier(slug: string, id: string): Promise<null> {
  return apiClient.delete<null>(`/staff/catalogue/products/${slug}/tiers/${id}/`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Store settings
// ─────────────────────────────────────────────────────────────────────────────

export interface SiteSettings {
  id: string;
  free_shipping_threshold: string;
  default_currency: string;
  support_email: string;
  support_phone: string;
  cod_enabled: boolean;
  guest_checkout_enabled: boolean;
  reservation_minutes: number;
  updated_at: string;
}

export function getSettings(): Promise<SiteSettings> {
  return apiClient.get<SiteSettings>("/staff/settings/");
}

/**
 * Change the store-wide settings.
 *
 * There is no create — one row, permanently. A second would let checkout and
 * the support chat disagree about the free-shipping threshold again, which is
 * the bug this model exists to prevent.
 */
export function updateSettings(input: Partial<SiteSettings>): Promise<SiteSettings> {
  return apiClient.patch<SiteSettings>("/staff/settings/", input);
}

export interface ShippingRule {
  id: string;
  name: string;
  /** Blank is the nationwide fallback. A named state must exist. */
  state: string;
  flat_rate: string;
  free_threshold_override: string | null;
  priority: number;
  is_active: boolean;
}

export function listShippingRules(): Promise<ShippingRule[]> {
  return apiClient.get<ShippingRule[]>("/staff/shipping-rules/");
}

export function createShippingRule(input: Partial<ShippingRule>): Promise<ShippingRule> {
  return apiClient.post<ShippingRule>("/staff/shipping-rules/", input);
}

export function deleteShippingRule(id: string): Promise<null> {
  return apiClient.delete<null>(`/staff/shipping-rules/${id}/`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Academy management
// ─────────────────────────────────────────────────────────────────────────────

export interface StaffAcademyClass {
  id: string;
  title: string;
  slug: string;
  instructor: string | null;
  program: string | null;
  scheduled_date: string;
  location: string;
  price: string;
  total_seats: number;
  /** Derived from real bookings — never sent. */
  seats_taken: number;
  seats_left: number;
  is_active: boolean;
  description: string;
}

export function listStaffClasses(): Promise<Paginated<StaffAcademyClass>> {
  return apiClient.get<Paginated<StaffAcademyClass>>("/staff/academy/manage/classes/");
}

export function createClass(
  input: Partial<StaffAcademyClass>,
): Promise<StaffAcademyClass> {
  return apiClient.post<StaffAcademyClass>("/staff/academy/manage/classes/", input);
}

export function updateClass(
  slug: string,
  input: Partial<StaffAcademyClass>,
): Promise<StaffAcademyClass> {
  return apiClient.patch<StaffAcademyClass>(`/staff/academy/manage/classes/${slug}/`, input);
}

export function deleteClass(slug: string): Promise<null> {
  return apiClient.delete<null>(`/staff/academy/manage/classes/${slug}/`);
}

export interface StaffInstructor {
  id: string;
  name: string;
  title: string;
  bio: string;
  photo: string | null;
  specialties: string[];
  is_active: boolean;
}

export function listInstructors(): Promise<StaffInstructor[]> {
  return apiClient.get<StaffInstructor[]>("/staff/academy/instructors/");
}

export function createInstructor(
  input: Partial<StaffInstructor>,
): Promise<StaffInstructor> {
  return apiClient.post<StaffInstructor>("/staff/academy/instructors/", input);
}

export function deleteInstructor(id: string): Promise<null> {
  return apiClient.delete<null>(`/staff/academy/instructors/${id}/`);
}

export interface TaxRule {
  id: string;
  name: string;
  /** A fraction — 0.075 for 7.5%, not 7.5. */
  rate: string;
  effective_from: string;
  effective_to: string | null;
  is_active: boolean;
}

export function listTaxRules(): Promise<TaxRule[]> {
  return apiClient.get<TaxRule[]>("/staff/tax-rules/");
}

/**
 * Add a tax rate.
 *
 * Dated rather than a single number: an order placed last year was taxed at
 * last year's rate and its total has to keep reconciling. Setting
 * `effective_to` on the old rule is how you retire one — deleting it leaves
 * historic orders with a figure nothing explains.
 */
export function createTaxRule(input: Partial<TaxRule>): Promise<TaxRule> {
  return apiClient.post<TaxRule>("/staff/tax-rules/", input);
}

export function updateTaxRule(id: string, input: Partial<TaxRule>): Promise<TaxRule> {
  return apiClient.patch<TaxRule>(`/staff/tax-rules/${id}/`, input);
}

// ─────────────────────────────────────────────────────────────────────────────
// Blog
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A post as the back office sees it — drafts and scheduled pieces included.
 *
 * `slug` is read-only: the server derives it from the title on create and
 * never rewrites it afterwards. That is deliberate, and worth not "fixing" —
 * a published URL that changes when somebody corrects a typo in the headline
 * breaks every link anyone has already shared.
 */
export interface StaffPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  category: string;
  cover_image: string;
  author_name: string;
  author_role: string;
  read_minutes: number;
  is_featured: boolean;
  /** Null means draft. A future date publishes itself when it arrives. */
  published_at: string | null;
}

export type PostInput = Omit<StaffPost, "id" | "slug">;

/**
 * The categories, copied from `core.models.BlogCategory`.
 *
 * Fixed choices rather than free text, so the public page does not end up
 * grouping "Poultry", "poultry farming" and "Poultry Farming" as three
 * different things. Adding one is a migration on the server *and* a line here
 * — the server rejects anything it does not recognise, so the two cannot
 * drift silently in the direction that matters.
 */
export const POST_CATEGORIES = [
  { value: "POULTRY", label: "Poultry farming" },
  { value: "LIVESTOCK", label: "Livestock" },
  { value: "CROPS", label: "Crop production" },
  { value: "FISHERIES", label: "Fisheries and aquaculture" },
  { value: "SOIL", label: "Soil and plant science" },
  { value: "MANAGEMENT", label: "Farm management" },
  { value: "AGRIBUSINESS", label: "Agribusiness" },
] as const;

/** Every post, drafts included. Paginated — this list grows without limit. */
export function listStaffPosts(page?: number): Promise<Paginated<StaffPost>> {
  const suffix = page && page > 1 ? `?page=${page}` : "";
  return apiClient.get<Paginated<StaffPost>>(`/staff/blog/${suffix}`);
}

export function createPost(input: Partial<PostInput>): Promise<StaffPost> {
  return apiClient.post<StaffPost>("/staff/blog/", input);
}

export function updatePost(slug: string, input: Partial<PostInput>): Promise<StaffPost> {
  return apiClient.patch<StaffPost>(`/staff/blog/${slug}/`, input);
}

export function deletePost(slug: string): Promise<null> {
  return apiClient.delete<null>(`/staff/blog/${slug}/`);
}

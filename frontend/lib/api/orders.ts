/**
 * Orders and payment.
 *
 * Card details never pass through this application. `startPayment` returns a
 * Paystack URL and the customer completes payment there; the server learns the
 * outcome from a signed webhook. The prototype collected full card numbers and
 * CVVs behind an "SSL secured" badge with no processor behind it (audit §3.5).
 */

import { apiClient } from "./client";
import type { Cart, Order, OrderSummary, Paginated } from "./types";

export function listOrders(page = 1): Promise<Paginated<OrderSummary>> {
  return apiClient.get<Paginated<OrderSummary>>(`/orders/?page=${page}`);
}

export function getOrder(orderNumber: string): Promise<Order> {
  return apiClient.get<Order>(`/orders/${orderNumber}/`);
}

/** Guest lookup: the email is required because order numbers are guessable. */
export function getGuestOrder(orderNumber: string, email: string): Promise<Order> {
  return apiClient.get<Order>(`/orders/${orderNumber}/?email=${encodeURIComponent(email)}`);
}

export function cancelOrder(orderNumber: string): Promise<Order> {
  return apiClient.post<Order>(`/orders/${orderNumber}/cancel/`);
}

export function reorder(orderNumber: string): Promise<Cart> {
  return apiClient.post<Cart>(`/orders/${orderNumber}/reorder/`);
}

export interface PaymentStart {
  authorization_url: string;
  reference: string;
}

export function startPayment(orderNumber: string): Promise<PaymentStart> {
  return apiClient.post<PaymentStart>(`/payments/paystack/${orderNumber}/initialize/`);
}

/** Confirm after the redirect. The webhook is authoritative; this is the UX path. */
export function verifyPayment(reference: string): Promise<{
  order_number: string;
  status: string;
  payment_status: string;
}> {
  return apiClient.get(`/payments/${reference}/verify/`);
}

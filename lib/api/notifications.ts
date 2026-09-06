/**
 * In-app notifications.
 *
 * These four endpoints have existed since Phase 6 with nothing consuming
 * them. `NotificationToast` in `components/ui/` is a *transient client-side
 * toast* and is unrelated — the two share a word and nothing else, which is
 * why the server-side ones went unnoticed for so long.
 *
 * The consequence was not cosmetic. `notify_staff` writes low-stock warnings,
 * new-application alerts and failed-delivery notices to this table, and until
 * now the only way to read one was Django Admin — which is off in production.
 * Staff were being told things nowhere they could see.
 */

import { apiClient } from "./client";
import type { Paginated } from "./types";

export type NotificationType = "ORDER" | "STOCK" | "APPLICATION" | "ACADEMY" | "SYSTEM";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  /** Where to go to act on it. Empty when there is nothing to open. */
  link: string;
  is_read: boolean;
  created_at: string;
}

export function listNotifications(unreadOnly = false): Promise<Paginated<Notification>> {
  const suffix = unreadOnly ? "?is_read=false" : "";
  return apiClient.get<Paginated<Notification>>(`/notifications/${suffix}`);
}

/**
 * Just the count, for the badge.
 *
 * A separate endpoint rather than counting a fetched page: the badge polls,
 * and pulling a full page of notifications every thirty seconds to render one
 * number is a waste of a mobile data allowance.
 */
export function unreadCount(): Promise<{ unread: number }> {
  return apiClient.get<{ unread: number }>("/notifications/unread-count/");
}

export function markRead(id: string): Promise<Notification> {
  return apiClient.post<Notification>(`/notifications/${id}/read/`);
}

export function markAllRead(): Promise<null> {
  return apiClient.post<null>("/notifications/read-all/");
}

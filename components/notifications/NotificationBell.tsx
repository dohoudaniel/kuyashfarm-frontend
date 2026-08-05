"use client";

/**
 * The notification bell.
 *
 * Four endpoints have existed since Phase 6 with nothing reading them. That is
 * not a cosmetic gap: `notify_staff` writes low-stock warnings, new-application
 * alerts and failed-delivery notices to that table, and the only way to see one
 * was Django Admin — which is off in production. Staff were being told things
 * nowhere they could read them.
 *
 * Three decisions:
 *
 * **The badge polls the count endpoint, not the list.** Pulling a page of
 * notifications every thirty seconds to render one number wastes a mobile data
 * allowance, and the warehouse runs this on a phone.
 *
 * **Polling stops when the tab is hidden.** A back-office tab left open
 * overnight would otherwise make ~1,000 pointless requests before anyone came
 * back to it.
 *
 * **Opening one marks it read; nothing marks itself read on render.** A badge
 * that clears because a panel happened to mount tells you there was something
 * without telling you what.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, CheckCheck, Loader2 } from "lucide-react";

import {
  listNotifications,
  markAllRead,
  markRead,
  unreadCount,
  type Notification,
} from "@/lib/api/notifications";
import { useAuth } from "@/lib/context/AuthContext";
import { cn } from "@/lib/utils";

/** Thirty seconds: fast enough for a low-stock warning, cheap enough to leave on. */
const POLL_MS = 30_000;

export function NotificationBell() {
  const { isAuthenticated } = useAuth();

  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const panel = useRef<HTMLDivElement>(null);

  const refreshCount = useCallback(async () => {
    try {
      const { unread: count } = await unreadCount();
      setUnread(count);
    } catch {
      // A failed poll is not worth telling anyone about. The next one is
      // thirty seconds away, and an error banner for a background request
      // trains people to ignore error banners.
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setUnread(0);
      return;
    }

    void refreshCount();

    const timer = setInterval(() => {
      // A tab left open overnight would otherwise make about a thousand
      // pointless requests before anybody looked at it again.
      if (document.visibilityState === "visible") void refreshCount();
    }, POLL_MS);

    return () => clearInterval(timer);
  }, [isAuthenticated, refreshCount]);

  // Close on a click anywhere else, which is what people expect of a popover.
  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (panel.current && !panel.current.contains(event.target as Node)) setOpen(false);
    }
    function onEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onEscape);
    };
  }, [open]);

  async function toggle() {
    const next = !open;
    setOpen(next);
    if (!next) return;

    setLoading(true);
    try {
      const page = await listNotifications();
      setItems(page.results);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  async function openOne(item: Notification) {
    if (!item.is_read) {
      // Optimistic: the panel is about to close, and waiting on a round-trip
      // to grey out a row nobody is looking at any more helps nobody.
      setItems((current) =>
        current.map((entry) => (entry.id === item.id ? { ...entry, is_read: true } : entry)),
      );
      setUnread((current) => Math.max(0, current - 1));
      await markRead(item.id).catch(() => void refreshCount());
    }
    setOpen(false);
  }

  async function clearAll() {
    setItems((current) => current.map((entry) => ({ ...entry, is_read: true })));
    setUnread(0);
    await markAllRead().catch(() => void refreshCount());
  }

  if (!isAuthenticated) return null;

  return (
    <div className="relative" ref={panel}>
      <button
        type="button"
        onClick={toggle}
        aria-label={unread > 0 ? `Notifications, ${unread} unread` : "Notifications"}
        aria-expanded={open}
        className="relative rounded-full p-2 text-current transition-colors hover:bg-black/5"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
            {/* Capped, because a badge reading "247" is a number nobody acts on. */}
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Notifications"
          className="absolute right-0 z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-gray-200 bg-white text-gray-900 shadow-lg"
        >
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2.5">
            <h2 className="text-sm font-semibold">Notifications</h2>
            {items.some((item) => !item.is_read) && (
              <button
                type="button"
                onClick={clearAll}
                className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-900"
              >
                <CheckCheck className="h-3.5 w-3.5" /> Mark all read
              </button>
            )}
          </div>

          {loading ? (
            <p className="py-10 text-center">
              <Loader2 className="mx-auto h-5 w-5 animate-spin text-gray-400" />
            </p>
          ) : items.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-gray-500">Nothing yet.</p>
          ) : (
            <ul className="max-h-96 divide-y divide-gray-100 overflow-y-auto">
              {items.map((item) => {
                const body = (
                  <>
                    <p
                      className={cn(
                        "text-sm",
                        item.is_read ? "text-gray-600" : "font-semibold text-gray-900",
                      )}
                    >
                      {item.title}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">{item.message}</p>
                    <p className="mt-1 text-[11px] text-gray-400">
                      {new Date(item.created_at).toLocaleString("en-NG", {
                        day: "numeric",
                        month: "short",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                  </>
                );

                return (
                  <li key={item.id} className={cn(!item.is_read && "bg-green-50/40")}>
                    {/* A link when there is somewhere to go, a button when
                        there is not — rather than an anchor to nowhere, which
                        a keyboard user cannot tell is inert. */}
                    {item.link ? (
                      <Link
                        href={item.link}
                        onClick={() => void openOne(item)}
                        className="block px-4 py-3 hover:bg-gray-50"
                      >
                        {body}
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => void openOne(item)}
                        className="block w-full px-4 py-3 text-left hover:bg-gray-50"
                      >
                        {body}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

/**
 * The notification bell.
 *
 * Four endpoints existed since Phase 6 with nothing reading them, so
 * `notify_staff` was writing low-stock warnings and failed-delivery notices
 * somewhere only Django Admin could see — and Django Admin is off in
 * production. These pin the behaviour that makes the bell worth having, and
 * the two efficiency decisions that are invisible until they are wrong.
 */

const listNotifications = vi.fn();
const unreadCount = vi.fn();
const markRead = vi.fn();
const markAllRead = vi.fn();

vi.mock("@/lib/api/notifications", () => ({
  listNotifications: (...args: unknown[]) => listNotifications(...args),
  unreadCount: (...args: unknown[]) => unreadCount(...args),
  markRead: (...args: unknown[]) => markRead(...args),
  markAllRead: (...args: unknown[]) => markAllRead(...args),
}));

let authed = true;
vi.mock("@/lib/context/AuthContext", () => ({
  useAuth: () => ({ isAuthenticated: authed }),
}));

const { NotificationBell } = await import("@/components/notifications/NotificationBell");

function notification(overrides: Record<string, unknown> = {}) {
  return {
    id: "n1",
    type: "STOCK",
    title: "Low stock: Fresh Milk",
    message: "3 left",
    link: "",
    is_read: false,
    created_at: new Date("2026-08-05T09:00:00Z").toISOString(),
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  authed = true;
  unreadCount.mockResolvedValue({ unread: 0 });
  listNotifications.mockResolvedValue({ results: [], count: 0 });
});

afterEach(() => vi.useRealTimers());

describe("the badge", () => {
  it("shows the unread count", async () => {
    unreadCount.mockResolvedValue({ unread: 3 });

    render(<NotificationBell />);

    expect(await screen.findByRole("button", { name: /3 unread/i })).toBeInTheDocument();
  });

  it("caps the number, because a badge reading 247 is not actionable", async () => {
    unreadCount.mockResolvedValue({ unread: 247 });

    render(<NotificationBell />);

    await screen.findByRole("button", { name: /247 unread/i });
    expect(screen.getByText("9+")).toBeInTheDocument();
  });

  it("polls the count endpoint, not the list", async () => {
    // Fetching a page of notifications every thirty seconds to render one
    // number wastes a mobile data allowance, and the warehouse runs this on
    // a phone.
    render(<NotificationBell />);

    await waitFor(() => expect(unreadCount).toHaveBeenCalled());
    expect(listNotifications).not.toHaveBeenCalled();
  });

  it("renders nothing when signed out", () => {
    authed = false;

    const { container } = render(<NotificationBell />);

    expect(container).toBeEmptyDOMElement();
    expect(unreadCount).not.toHaveBeenCalled();
  });

  it("survives a failed poll without shouting about it", async () => {
    // A background request that failed is not worth an error banner; the next
    // poll is thirty seconds away, and banners for these train people to
    // ignore banners.
    unreadCount.mockRejectedValue(new Error("offline"));

    render(<NotificationBell />);

    await waitFor(() => expect(unreadCount).toHaveBeenCalled());
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});

describe("the panel", () => {
  it("loads the list only when opened", async () => {
    listNotifications.mockResolvedValue({ results: [notification()], count: 1 });
    render(<NotificationBell />);

    await userEvent.click(screen.getByRole("button", { name: /notifications/i }));

    expect(await screen.findByText(/low stock: fresh milk/i)).toBeInTheDocument();
  });

  it("does not mark anything read merely by rendering", async () => {
    // A badge that clears because a panel happened to mount tells you there
    // was something without telling you what.
    listNotifications.mockResolvedValue({ results: [notification()], count: 1 });
    render(<NotificationBell />);

    await userEvent.click(screen.getByRole("button", { name: /notifications/i }));
    await screen.findByText(/low stock/i);

    expect(markRead).not.toHaveBeenCalled();
    expect(markAllRead).not.toHaveBeenCalled();
  });

  it("marks one read when it is opened", async () => {
    listNotifications.mockResolvedValue({ results: [notification()], count: 1 });
    markRead.mockResolvedValue(notification({ is_read: true }));
    render(<NotificationBell />);

    await userEvent.click(screen.getByRole("button", { name: /notifications/i }));
    await userEvent.click(await screen.findByText(/low stock/i));

    await waitFor(() => expect(markRead).toHaveBeenCalledWith("n1"));
  });

  it("marks all read on request", async () => {
    listNotifications.mockResolvedValue({ results: [notification()], count: 1 });
    markAllRead.mockResolvedValue(null);
    render(<NotificationBell />);

    await userEvent.click(screen.getByRole("button", { name: /notifications/i }));
    await userEvent.click(await screen.findByRole("button", { name: /mark all read/i }));

    await waitFor(() => expect(markAllRead).toHaveBeenCalled());
  });

  it("renders a button rather than an inert link when there is nowhere to go", async () => {
    // An anchor to nowhere is something a keyboard user cannot tell is inert.
    listNotifications.mockResolvedValue({ results: [notification({ link: "" })], count: 1 });
    render(<NotificationBell />);

    await userEvent.click(screen.getByRole("button", { name: /notifications/i }));
    await screen.findByText(/low stock/i);

    expect(screen.queryByRole("link", { name: /low stock/i })).not.toBeInTheDocument();
  });

  it("links to the thing that needs acting on when there is one", async () => {
    listNotifications.mockResolvedValue({
      results: [notification({ link: "/admin/inventory" })],
      count: 1,
    });
    render(<NotificationBell />);

    await userEvent.click(screen.getByRole("button", { name: /notifications/i }));

    const link = await screen.findByRole("link", { name: /low stock/i });
    expect(link).toHaveAttribute("href", "/admin/inventory");
  });
});

describe("the badge costs nothing to keep current", () => {
  /**
   * The bell used to poll `/notifications/unread-count/` every thirty seconds.
   * At 5,000 concurrent users that is 167 requests a second for a number that
   * is almost always zero, against a backend that serves 8 requests at a time
   * — the single largest consumer of capacity in the product.
   *
   * These pin the replacement. The first one is the important one: it fails if
   * anybody reintroduces an interval, which is the easy thing to do when a
   * badge looks stale during development.
   */
  it("does not poll", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    unreadCount.mockResolvedValue({ unread: 0 });

    render(<NotificationBell />);
    await waitFor(() => expect(unreadCount).toHaveBeenCalledTimes(1));

    // Ten minutes. A thirty-second poll would be twenty more calls.
    await vi.advanceTimersByTimeAsync(600_000);

    expect(unreadCount).toHaveBeenCalledTimes(1);
  });

  it("updates from a response header without asking for it", async () => {
    const { apiClient } = await import("@/lib/api/client");
    unreadCount.mockResolvedValue({ unread: 0 });

    render(<NotificationBell />);
    await waitFor(() => expect(unreadCount).toHaveBeenCalled());

    // What the API client does when any authenticated response carries the
    // header. No request is made here — that is the whole point.
    apiClient.onUnreadCount?.(4);

    await waitFor(() =>
      expect(screen.getByLabelText("Notifications, 4 unread")).toBeInTheDocument(),
    );
    expect(unreadCount).toHaveBeenCalledTimes(1);
  });

  it("stops listening when the user signs out", async () => {
    const { apiClient } = await import("@/lib/api/client");

    const view = render(<NotificationBell />);
    await waitFor(() => expect(apiClient.onUnreadCount).toBeTypeOf("function"));

    view.unmount();

    // A dangling callback would call setState on an unmounted component, and
    // would keep one signed-out user's badge wired to the next one's session.
    expect(apiClient.onUnreadCount).toBeUndefined();
  });
});

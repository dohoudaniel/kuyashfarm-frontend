import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

/**
 * The analytics page and the user directory.
 *
 * What is worth testing here is not that a number renders. It is the handful
 * of decisions that fail quietly:
 *
 *  * money must never go through `Number()` — a total wrong in the third
 *    decimal place is one somebody reconciles by hand;
 *  * an empty deployment must render rather than divide by zero;
 *  * the age of a cached figure must be on screen, or somebody acts on a
 *    stale number believing it is live;
 *  * the directory must offer no way to change a role or an account type,
 *    because both have audited flows elsewhere and a second door skips them.
 */

const admin = {
  getPlatformSnapshot: vi.fn(),
  refreshAnalytics: vi.fn(),
  listStaffUsers: vi.fn(),
  getStaffUser: vi.fn(),
  getUserSummary: vi.fn(),
};

vi.mock("@/lib/api/admin", () => ({
  getPlatformSnapshot: (...a: unknown[]) => admin.getPlatformSnapshot(...a),
  refreshAnalytics: (...a: unknown[]) => admin.refreshAnalytics(...a),
  listStaffUsers: (...a: unknown[]) => admin.listStaffUsers(...a),
  getStaffUser: (...a: unknown[]) => admin.getStaffUser(...a),
  getUserSummary: (...a: unknown[]) => admin.getUserSummary(...a),
}));

let searchParams = new URLSearchParams();
vi.mock("next/navigation", () => ({
  useSearchParams: () => searchParams,
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/admin/users",
}));

const AnalyticsClient = (await import("@/app/admin/analytics/AnalyticsClient")).default;
const UsersClient = (await import("@/app/admin/users/UsersClient")).default;

/** An entirely empty deployment: every total zero, every list empty. */
const EMPTY_SNAPSHOT = {
  computed_at: "2026-08-24T12:00:00Z",
  cached: false,
  stale_after_seconds: 60,
  commerce: {
    gross_revenue: "0.00",
    refunds: "0.00",
    net_revenue: "0.00",
    paid_orders: 0,
    pending_orders: 0,
    cancelled_orders: 0,
    average_order_value: "0.00",
    items_sold: 0,
    distinct_customers: 0,
    currency: "NGN",
  },
  people: {
    total: 0, customers: 0, staff: 0, admins: 0,
    retail: 0, wholesale_pending: 0, wholesale_verified: 0,
    distributor_pending: 0, distributor_verified: 0,
    verified: 0, unverified: 0, deactivated: 0, with_photograph: 0,
    joined_last_30_days: 0, joined_last_7_days: 0, have_ordered: 0, verified_rate: 0,
  },
  user_growth: [],
  top_customers: [],
  segments: [],
  orders: { by_status: { total: 0 }, by_payment: {}, paid_and_awaiting_action: 0 },
  catalogue: {
    products: { total: 0, listed: 0, unlisted: 0, without_photograph: 0 },
    categories: 0,
    inventory: { units_on_hand: 0, units_reserved: 0, low_stock: 0, out_of_stock: 0 },
    stock_value_at_retail: "0.00",
  },
  sales: [],
  top_products: [],
  categories: [],
  academy: {
    registrations: { total: 0, pending_payment: 0, confirmed: 0, cancelled: 0, attended: 0 },
    booked_value: "0.00",
    collected_online: "0.00",
    programmes: 0, classes: 0, instructors: 0,
  },
  applications: { pending: 0, under_review: 0, approved: 0, rejected: 0 },
  content: {
    posts: { total: 0, live: 0, scheduled: 0, drafts: 0, featured: 0 },
    subscribers: { pending: 0, subscribed: 0, unsubscribed: 0 },
  },
  delivery: { runs: {}, stops: {}, drivers: 0 },
};

const BUSY_SNAPSHOT = {
  ...EMPTY_SNAPSHOT,
  cached: true,
  commerce: { ...EMPTY_SNAPSHOT.commerce, net_revenue: "1234567.89", paid_orders: 42 },
  people: { ...EMPTY_SNAPSHOT.people, total: 100, customers: 96, staff: 3, admins: 1, verified_rate: 62.5 },
  orders: { by_status: { total: 10, pending: 4 }, by_payment: { paid: 6 }, paid_and_awaiting_action: 4 },
  academy: { ...EMPTY_SNAPSHOT.academy, booked_value: "500000.00", collected_online: "120000.00" },
};

const USER = {
  id: "u1",
  email: "ada@example.com",
  full_name: "Ada Okafor",
  phone: "08039876543",
  avatar: null,
  role: "CUSTOMER",
  account_type: "WHOLESALE_VERIFIED",
  is_email_verified: true,
  is_active: true,
  date_joined: "2026-02-10T09:00:00Z",
  order_count: 3,
  total_spent: "10500.00",
  last_order_at: "2026-08-01T09:00:00Z",
};

beforeEach(() => {
  vi.clearAllMocks();
  searchParams = new URLSearchParams();
  admin.getPlatformSnapshot.mockResolvedValue(EMPTY_SNAPSHOT);
  admin.refreshAnalytics.mockResolvedValue(null);
  admin.listStaffUsers.mockResolvedValue({ results: [USER], count: 1, next: null, previous: null });
  admin.getUserSummary.mockResolvedValue({
    total: 1, role_customer: 1, role_staff: 0, role_admin: 0,
    type_retail: 0, type_wholesale_pending: 0, type_wholesale_verified: 1,
    type_distributor_pending: 0, type_distributor_verified: 0,
    verified: 1, deactivated: 0,
  });
  admin.getStaffUser.mockResolvedValue({ ...USER, applications: [], academy_registrations: [] });
});

describe("the analytics page", () => {
  it("renders an entirely empty deployment rather than dividing by zero", async () => {
    // `n / 0` is Infinity in JavaScript, not an error, so an unguarded bar
    // would render `Infinity%` wide and collapse the layout — which reads as
    // a rendering bug rather than as an empty table.
    render(<AnalyticsClient />);

    expect(await screen.findByRole("heading", { name: "Analytics" })).toBeInTheDocument();
    expect(screen.getByText(/no cost price is recorded/i)).toBeInTheDocument();
    expect(document.body.innerHTML).not.toContain("Infinity");
    expect(document.body.innerHTML).not.toContain("NaN");
  });

  it("says how old the figures are", async () => {
    // A number whose age you cannot see invites acting on a stale one.
    admin.getPlatformSnapshot.mockResolvedValue(BUSY_SNAPSHOT);

    render(<AnalyticsClient />);

    expect(await screen.findByText(/cached · computed/i)).toBeInTheDocument();
  });

  it("formats money from the decimal string without arithmetic", async () => {
    admin.getPlatformSnapshot.mockResolvedValue(BUSY_SNAPSHOT);

    render(<AnalyticsClient />);

    // ₦1,234,567.89 — exact. Routed through Number() this would be a float,
    // and floats do not hold naira exactly.
    await waitFor(() => expect(screen.getAllByText(/1,234,567\.89/).length).toBeGreaterThan(0));
  });

  it("reports both academy money figures", async () => {
    // Booking without paying still holds a seat, so one number would either
    // count seats nobody paid for or omit every seat settled at the gate.
    admin.getPlatformSnapshot.mockResolvedValue(BUSY_SNAPSHOT);

    render(<AnalyticsClient />);

    expect(await screen.findByText(/booked value/i)).toBeInTheDocument();
    expect(screen.getByText(/collected online/i)).toBeInTheDocument();
  });

  it("clears the server cache before re-reading", async () => {
    // Without the first call the second is served the cached payload again,
    // and the button looks broken.
    admin.getPlatformSnapshot.mockResolvedValue(BUSY_SNAPSHOT);
    render(<AnalyticsClient />);
    await screen.findByRole("heading", { name: "Analytics" });

    await userEvent.click(screen.getByRole("button", { name: /recompute/i }));

    await waitFor(() => expect(admin.refreshAnalytics).toHaveBeenCalledTimes(1));
    expect(admin.getPlatformSnapshot).toHaveBeenCalledTimes(2);
  });

  it("shows the failure rather than an empty dashboard", async () => {
    // A blank dashboard after a failed request looks exactly like a quiet day.
    admin.getPlatformSnapshot.mockRejectedValue(new Error("nope"));

    render(<AnalyticsClient />);

    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });
});

describe("the user directory", () => {
  it("lists accounts with their spend", async () => {
    render(<UsersClient />);

    expect(await screen.findByText("Ada Okafor")).toBeInTheDocument();
    expect(screen.getByText(/10,500\.00/)).toBeInTheDocument();
  });

  it("names the account type rather than showing the enum", async () => {
    render(<UsersClient />);

    await screen.findByText("Ada Okafor");
    expect(screen.queryByText("WHOLESALE_VERIFIED")).not.toBeInTheDocument();
  });

  it("filters by role and by account type independently", async () => {
    // The two are separate powers: a wholesaler is a CUSTOMER by role. A
    // combined control would have to flatten them and misreport somebody.
    render(<UsersClient />);
    await screen.findByText("Ada Okafor");

    await userEvent.selectOptions(screen.getByLabelText(/filter by role/i), "STAFF");

    await waitFor(() =>
      expect(admin.listStaffUsers).toHaveBeenLastCalledWith(
        expect.objectContaining({ role: "STAFF", account_type: undefined }),
      ),
    );
  });

  it("treats 'not verified' as a filter rather than as no filter", async () => {
    // `false` is meaningful here. A truthiness check would drop it and
    // silently show everybody.
    render(<UsersClient />);
    await screen.findByText("Ada Okafor");

    await userEvent.selectOptions(screen.getByLabelText(/filter by verification/i), "false");

    await waitFor(() =>
      expect(admin.listStaffUsers).toHaveBeenLastCalledWith(
        expect.objectContaining({ is_email_verified: false }),
      ),
    );
  });

  it("picks up a search from the query string", async () => {
    // The analytics page links here from Top customers.
    searchParams = new URLSearchParams("search=ada@example.com");

    render(<UsersClient />);

    await waitFor(() =>
      expect(admin.listStaffUsers).toHaveBeenCalledWith(
        expect.objectContaining({ search: "ada@example.com" }),
      ),
    );
  });

  it("offers no way to change a role or an account type", async () => {
    // Both have audited flows elsewhere — an invitation proves the recipient
    // controls the address, and an account type is computed from an approved
    // application. A control here would be a second door skipping the proof.
    render(<UsersClient />);
    await userEvent.click(await screen.findByText("Ada Okafor"));

    await screen.findByRole("dialog");

    for (const control of screen.getAllByRole("combobox")) {
      expect(control.getAttribute("aria-label")).toMatch(/filter by/i);
    }
    expect(screen.getByText(/neither can be changed from here/i)).toBeInTheDocument();
  });

  it("explains where those changes do happen", async () => {
    render(<UsersClient />);
    await userEvent.click(await screen.findByText("Ada Okafor"));

    const dialog = await screen.findByRole("dialog");

    expect(dialog).toHaveTextContent(/invitation/i);
    expect(dialog).toHaveTextContent(/application/i);
  });
});

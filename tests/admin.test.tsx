import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ApiError } from "@/lib/api/client";

/**
 * The back office.
 *
 * These screens are the answer to PRD §13 Q4 and the reason Django Admin is
 * off in production. They had no tests at all until now.
 *
 * What is worth testing here is not that a table renders. It is the handful of
 * decisions that fail silently:
 *
 *  * the guard must distinguish *loading* from *signed out*, or it bounces
 *    every administrator on every refresh;
 *  * an empty table after a failed request must not read as a quiet day;
 *  * a reviewer's internal note must never be sent as the applicant's reason;
 *  * a driver must not be able to reach dispatch.
 */

const admin = {
  listAllProducts: vi.fn(),
  listProductImages: vi.fn(),
  uploadProductImage: vi.fn(),
  setPrimaryImage: vi.fn(),
  deleteProductImage: vi.fn(),
  listStaffOrders: vi.fn(),
  setOrderStatus: vi.fn(),
  listStaffApplications: vi.fn(),
  approveApplication: vi.fn(),
  rejectApplication: vi.fn(),
  claimApplication: vi.fn(),
};

// Listed explicitly rather than proxied. A catch-all `get` also answers the
// probes Vitest makes on a module namespace — `__esModule`, `default`,
// `Symbol.toStringTag` — and answering those with `undefined` leaves the
// module looking importable while every function is missing.
vi.mock("@/lib/api/admin", () => ({
  listAllProducts: (...a: unknown[]) => admin.listAllProducts(...a),
  listProductImages: (...a: unknown[]) => admin.listProductImages(...a),
  uploadProductImage: (...a: unknown[]) => admin.uploadProductImage(...a),
  setPrimaryImage: (...a: unknown[]) => admin.setPrimaryImage(...a),
  deleteProductImage: (...a: unknown[]) => admin.deleteProductImage(...a),
  listStaffOrders: (...a: unknown[]) => admin.listStaffOrders(...a),
  setOrderStatus: (...a: unknown[]) => admin.setOrderStatus(...a),
  listStaffApplications: (...a: unknown[]) => admin.listStaffApplications(...a),
  approveApplication: (...a: unknown[]) => admin.approveApplication(...a),
  rejectApplication: (...a: unknown[]) => admin.rejectApplication(...a),
  claimApplication: (...a: unknown[]) => admin.claimApplication(...a),
}));

let auth = { isLoading: false, isAuthenticated: true, isBackOffice: true, user: { role: "ADMIN" } };
vi.mock("@/lib/context/AuthContext", () => ({ useAuth: () => auth }));

const replace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, push: vi.fn() }),
  usePathname: () => "/admin",
  useSearchParams: () => new URLSearchParams(),
}));

const { AdminGuard } = await import("@/app/admin/AdminGuard");
const OrdersClient = (await import("@/app/admin/orders/OrdersClient")).default;
const ApplicationsClient = (await import("@/app/admin/applications/ApplicationsClient")).default;

beforeEach(() => {
  vi.clearAllMocks();
  auth = { isLoading: false, isAuthenticated: true, isBackOffice: true, user: { role: "ADMIN" } };
  admin.listStaffOrders.mockResolvedValue({ results: [], count: 0 });
  admin.listStaffApplications.mockResolvedValue({ results: [], count: 0 });
});

describe("AdminGuard", () => {
  it("waits rather than redirecting while the session is still loading", () => {
    // `/auth/me/` is a round-trip away on every page load. A guard that
    // renders its signed-out branch during that window bounces a legitimate
    // administrator to the login page on every single refresh.
    auth = { ...auth, isLoading: true, isAuthenticated: false, isBackOffice: false };

    render(
      <AdminGuard>
        <p>back office</p>
      </AdminGuard>,
    );

    expect(replace).not.toHaveBeenCalled();
    expect(screen.queryByText("back office")).not.toBeInTheDocument();
  });

  it("sends a signed-out visitor to sign in, and back again afterwards", async () => {
    auth = { ...auth, isLoading: false, isAuthenticated: false, isBackOffice: false };

    render(
      <AdminGuard>
        <p>back office</p>
      </AdminGuard>,
    );

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/login?next=/admin"));
  });

  it("tells a customer plainly instead of bouncing them", () => {
    // A silent redirect reads as a broken link, and they may have followed one
    // from a colleague. Saying so reveals nothing: `is_back_office` is already
    // on their own /auth/me/ response.
    auth = { ...auth, isBackOffice: false, user: { role: "CUSTOMER" } };

    render(
      <AdminGuard>
        <p>back office</p>
      </AdminGuard>,
    );

    expect(screen.getByText(/this area is for staff/i)).toBeInTheDocument();
    expect(screen.queryByText("back office")).not.toBeInTheDocument();
  });

  it("lets staff through", () => {
    render(
      <AdminGuard>
        <p>back office</p>
      </AdminGuard>,
    );

    expect(screen.getByText("back office")).toBeInTheDocument();
  });
});

describe("failures are not shown as emptiness", () => {
  it("an orders request that failed does not read as a quiet day", async () => {
    // An empty table after a 403 looks exactly like having no orders, and
    // somebody stops looking for the problem.
    admin.listStaffOrders.mockRejectedValue(new ApiError("Forbidden", 403));

    render(<OrdersClient />);

    expect(await screen.findByRole("alert")).toHaveTextContent(/forbidden/i);
    expect(screen.queryByText(/no orders match/i)).not.toBeInTheDocument();
  });

  it("a genuinely empty result says so", async () => {
    render(<OrdersClient />);

    expect(await screen.findByText(/no orders match/i)).toBeInTheDocument();
  });
});

describe("orders", () => {
  it("shows the server's refusal when a transition is illegal", async () => {
    // The state machine lives on the server. Duplicating it here would create
    // a second definition that drifts — and the one in the browser is the one
    // that can be edited.
    admin.listStaffOrders.mockResolvedValue({
      results: [
        {
          id: "o1",
          order_number: "KF-20260805-00001",
          status: "PENDING",
          payment_status: "UNPAID",
          currency: "NGN",
          grand_total: "15000.00",
          item_count: 2,
          placed_at: new Date("2026-08-05T10:00:00Z").toISOString(),
        },
      ],
      count: 1,
    });
    admin.setOrderStatus.mockRejectedValue(
      new ApiError("Cannot move an order from PENDING to DELIVERED.", 400),
    );

    render(<OrdersClient />);
    await screen.findByText("KF-20260805-00001");

    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: /change status/i }),
      "DELIVERED",
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(/cannot move an order/i);
  });

  it("renders money from the decimal string without doing arithmetic on it", async () => {
    admin.listStaffOrders.mockResolvedValue({
      results: [
        {
          id: "o1",
          order_number: "KF-1",
          status: "PAID",
          payment_status: "PAID",
          currency: "NGN",
          grand_total: "7500.00",
          item_count: 1,
          placed_at: new Date("2026-08-05T10:00:00Z").toISOString(),
        },
      ],
      count: 1,
    });

    render(<OrdersClient />);

    expect(await screen.findByText(/7,500/)).toBeInTheDocument();
  });

  it("renders the date from the field the API actually sends", async () => {
    /*
     * These fixtures were written from the *client's* interface rather than
     * the API, and the interface had `created_at` where the server sends
     * `placed_at`. The screen rendered "Invalid Date" to real staff and every
     * test still passed — a mocked test can only be as right as the shape it
     * was given.
     *
     * This assertion would have caught it; the end-to-end run is what actually
     * did.
     */
    admin.listStaffOrders.mockResolvedValue({
      results: [
        {
          id: "o1",
          order_number: "KF-1",
          status: "PAID",
          payment_status: "PAID",
          currency: "NGN",
          grand_total: "7500.00",
          item_count: 1,
          placed_at: new Date("2026-08-05T10:00:00Z").toISOString(),
        },
      ],
      count: 1,
    });

    render(<OrdersClient />);

    await screen.findByText("KF-1");
    expect(screen.queryByText(/invalid date/i)).not.toBeInTheDocument();
  });
});

describe("applications", () => {
  const application = {
    id: "a1",
    application_type: "DISTRIBUTOR",
    status: "PENDING",
    business_name: "Kuyash Foods",
    contact_person: "Ada Okoro",
    contact_email: "ada@example.com",
    contact_phone: "08039876543",
    computed_tier: { code: "TIER_2", name: "Tier 2" },
    review_notes: "",
    reviewed_by_email: null,
    created_at: new Date().toISOString(),
  };

  it("renders the tier as a name, not an object", async () => {
    // `computed_tier` is a nested object. Rendering it directly throws
    // "Objects are not valid as a React child" and takes the screen down.
    admin.listStaffApplications.mockResolvedValue({ results: [application], count: 1 });

    render(<ApplicationsClient />);

    expect(await screen.findByText("Tier 2")).toBeInTheDocument();
  });

  it("keeps the internal note separate from the reason the applicant reads", async () => {
    // Sending `review_notes` as `decision_reason` is a disclosure bug, not a
    // cosmetic one — it puts a reviewer's private assessment in front of the
    // person it is about.
    admin.listStaffApplications.mockResolvedValue({ results: [application], count: 1 });
    admin.rejectApplication.mockResolvedValue(application);

    const prompts = vi
      .spyOn(window, "prompt")
      .mockReturnValueOnce("Not enough coverage") // shown to them
      .mockReturnValueOnce("Chased twice, no reply"); // internal

    render(<ApplicationsClient />);
    await userEvent.click(await screen.findByRole("button", { name: /reject/i }));

    await waitFor(() =>
      expect(admin.rejectApplication).toHaveBeenCalledWith(
        "a1",
        "Not enough coverage",
        "Chased twice, no reply",
      ),
    );
    prompts.mockRestore();
  });

  it("does not reject when no reason is given", async () => {
    admin.listStaffApplications.mockResolvedValue({ results: [application], count: 1 });
    const prompts = vi.spyOn(window, "prompt").mockReturnValue(null);

    render(<ApplicationsClient />);
    await userEvent.click(await screen.findByRole("button", { name: /reject/i }));

    expect(admin.rejectApplication).not.toHaveBeenCalled();
    prompts.mockRestore();
  });
});

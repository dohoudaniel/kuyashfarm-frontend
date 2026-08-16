import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ApiError } from "@/lib/api/client";

/**
 * The back-office screens that had no tests.
 *
 * Eleven of thirteen were untested. That is the state the delivery screens
 * were in when the end-to-end suite finally ran against them and found five
 * defects — including staff being unable to pack an order at all, because the
 * status dropdown offered payment statuses instead of order ones.
 *
 * These aim at the same class of thing: a control wired to the wrong field, a
 * refusal swallowed, a rule the server enforces that the UI quietly works
 * around.
 */

const admin = {
  // Products
  listStaffProducts: vi.fn(),
  listStaffCategories: vi.fn(),
  listProductImages: vi.fn(),
  createProduct: vi.fn(),
  updateProduct: vi.fn(),
  deleteProduct: vi.fn(),
  uploadProductImage: vi.fn(),
  setPrimaryImage: vi.fn(),
  deleteProductImage: vi.fn(),
  // Settings
  getSettings: vi.fn(),
  updateSettings: vi.fn(),
  listShippingRules: vi.fn(),
  createShippingRule: vi.fn(),
  deleteShippingRule: vi.fn(),
  createCategory: vi.fn(),
  deleteCategory: vi.fn(),
  // Inventory
  listInventory: vi.fn(),
  restock: vi.fn(),
  adjustStock: vi.fn(),
  // Staff invitations
  listInvitations: vi.fn(),
  invite: vi.fn(),
  revokeInvitation: vi.fn(),
  // Subscribers
  listSubscribers: vi.fn(),
  // Tax
  listTaxRules: vi.fn(),
  createTaxRule: vi.fn(),
  updateTaxRule: vi.fn(),
  // Delivery
  listRuns: vi.fn(),
  listDrivers: vi.fn(),
  planRun: vi.fn(),
  addStop: vi.fn(),
  startRun: vi.fn(),
  reorderStops: vi.fn(),
  createDriver: vi.fn(),
  myRuns: vi.fn(),
  markDelivered: vi.fn(),
  markFailed: vi.fn(),
  // Academy
  listStaffClasses: vi.fn(),
  listInstructors: vi.fn(),
  createClass: vi.fn(),
  updateClass: vi.fn(),
  deleteClass: vi.fn(),
  createInstructor: vi.fn(),
  deleteInstructor: vi.fn(),
  listRegistrations: vi.fn(),
  markAttended: vi.fn(),
};

// Listed explicitly, not proxied: a catch-all `get` also answers the probes
// Vitest makes on a module namespace, leaving every function undefined while
// the module still looks importable.
vi.mock("@/lib/api/admin", () =>
  Object.fromEntries(
    Object.keys(admin).map((key) => [
      key,
      (...args: unknown[]) => admin[key as keyof typeof admin](...args),
    ]),
  ),
);

vi.mock("@/lib/api/applications", () => ({
  listStates: () => Promise.resolve([{ id: "s1", name: "Lagos", code: "LA", zone: "SW" }]),
}));

vi.mock("@/lib/context/AuthContext", () => ({
  useAuth: () => ({
    isLoading: false,
    isAuthenticated: true,
    isBackOffice: true,
    user: { role: "ADMIN", full_name: "Ada" },
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
  usePathname: () => "/admin",
  useSearchParams: () => new URLSearchParams(),
}));

const SettingsClient = (await import("@/app/admin/settings/SettingsClient")).default;
const InventoryClient = (await import("@/app/admin/inventory/InventoryClient")).default;
const StaffClient = (await import("@/app/admin/staff/StaffClient")).default;
const SubscribersClient = (await import("@/app/admin/subscribers/SubscribersClient")).default;
const DeliveryClient = (await import("@/app/admin/delivery/DeliveryClient")).default;
const DriverClient = (await import("@/app/driver/DriverClient")).default;
const { ProductForm } = await import("@/app/admin/products/ProductForm");
const { ManageClasses } = await import("@/app/admin/academy/ManageClasses");

const SETTINGS = {
  id: "1",
  free_shipping_threshold: "80000.00",
  default_currency: "NGN",
  support_email: "hello@kuyashfarms.com",
  support_phone: "08039876543",
  cod_enabled: true,
  guest_checkout_enabled: true,
  reservation_minutes: 30,
  updated_at: new Date().toISOString(),
};

beforeEach(() => {
  vi.clearAllMocks();
  admin.getSettings.mockResolvedValue(SETTINGS);
  admin.listShippingRules.mockResolvedValue([]);
  admin.listTaxRules.mockResolvedValue([]);
  admin.listStaffCategories.mockResolvedValue([]);
  admin.listInventory.mockResolvedValue({ results: [], count: 0 });
  admin.listInvitations.mockResolvedValue([]);
  admin.listSubscribers.mockResolvedValue({ results: [], count: 0 });
  admin.listRuns.mockResolvedValue([]);
  admin.listDrivers.mockResolvedValue([]);
  admin.listStaffClasses.mockResolvedValue({ results: [], count: 0 });
  admin.listInstructors.mockResolvedValue([]);
  admin.myRuns.mockResolvedValue([]);
  admin.listStaffProducts.mockResolvedValue({ results: [], count: 0 });
});

describe("settings", () => {
  it("saves what the form shows, not what it loaded", async () => {
    // A form that posts its initial state back is indistinguishable from one
    // that works, until somebody changes a number and it does not stick.
    admin.updateSettings.mockResolvedValue(SETTINGS);
    render(<SettingsClient />);

    const threshold = await screen.findByLabelText(/free delivery over/i);
    await userEvent.clear(threshold);
    await userEvent.type(threshold, "50000");
    await userEvent.click(screen.getByRole("button", { name: /save settings/i }));

    await waitFor(() =>
      expect(admin.updateSettings).toHaveBeenCalledWith(
        expect.objectContaining({ free_shipping_threshold: "50000" }),
      ),
    );
  });

  it("shows the server's refusal of an unknown state verbatim", async () => {
    // The server's message names the cause — a rule for a state that does not
    // exist never applies and is never reported. Anything invented here would
    // be vaguer than the truth.
    admin.createShippingRule.mockRejectedValue(
      new ApiError("We don't recognise that state.", 400),
    );
    render(<SettingsClient />);

    // Scoped by id: the settings screen has more than one "Name" field now
    // that tax rates live on it too.
    await userEvent.type(
      await screen.findByLabelText(/^name/i, { selector: "#rule_name" }),
      "Typo rule",
    );
    await userEvent.type(screen.getByLabelText(/fee/i), "1000");
    await userEvent.click(screen.getByRole("button", { name: /add rule/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/don't recognise that state/i);
  });

  it("offers states from the list rather than a free-text box", async () => {
    // Free text means the lookup matches nothing, the rule never fires, and
    // the customer is quietly charged the nationwide rate.
    render(<SettingsClient />);

    const state = await screen.findByLabelText(/^state$/i);
    expect(state.tagName).toBe("SELECT");
  });

  it("takes a tax rate as a percentage and stores it as a fraction", async () => {
    /*
     * The server refuses anything above 1 — a rate is 0.075, not 7.5. People
     * talk in percentages, so the form takes one and converts. Without that,
     * typing the number everybody says gives a 400 that reads like a bug.
     */
    admin.createTaxRule.mockResolvedValue({});
    render(<SettingsClient />);

    await userEvent.type(await screen.findByLabelText(/rate \(%\)/i), "7.5");
    await userEvent.type(screen.getByLabelText(/^name/i, { selector: "#tax_name" }), "VAT");
    await userEvent.type(screen.getByLabelText(/applies from/i), "2026-01-01");
    await userEvent.click(screen.getByRole("button", { name: /add rate/i }));

    await waitFor(() =>
      expect(admin.createTaxRule).toHaveBeenCalledWith(
        expect.objectContaining({ rate: "0.075" }),
      ),
    );
  });

  it("offers to end-date a current rate rather than delete it", async () => {
    // Deleting one leaves historic orders with a tax figure nothing explains.
    admin.listTaxRules.mockResolvedValue([
      { id: "t1", name: "VAT", rate: "0.0750", effective_from: "2026-01-01",
        effective_to: null, is_active: true },
    ]);
    render(<SettingsClient />);

    expect(await screen.findByRole("button", { name: /end it/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /delete vat/i })).not.toBeInTheDocument();
  });

  it("surfaces a category that cannot be deleted", async () => {
    admin.listStaffCategories.mockResolvedValue([
      { id: "c1", name: "Vegetables", slug: "vegetables", description: "", image: null,
        sort_order: 0, is_active: true, product_count: 4 },
    ]);
    admin.deleteCategory.mockRejectedValue(
      new ApiError("Products are still in this category.", 400),
    );
    render(<SettingsClient />);

    await userEvent.click(await screen.findByRole("button", { name: /delete vegetables/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/still in this category/i);
  });
});

describe("the product form", () => {
  const categories = [
    { id: "c1", name: "Vegetables", slug: "vegetables", description: "", image: null,
      sort_order: 0, is_active: true, product_count: 0 },
  ];

  it("has no stock field", async () => {
    /*
     * Stock belongs to the append-only ledger, so every unit has a movement
     * explaining where it came from. A quantity box here is exactly the box
     * somebody would expect to find, and it would be the first hole in that.
     */
    render(
      <ProductForm categories={categories} onSaved={vi.fn()} onCancel={vi.fn()} />,
    );

    expect(screen.queryByLabelText(/quantity|stock on hand|opening/i)).not.toBeInTheDocument();
  });

  it("refuses a price of zero before calling the API", async () => {
    render(<ProductForm categories={categories} onSaved={vi.fn()} onCancel={vi.fn()} />);

    await userEvent.type(screen.getByLabelText(/^name/i), "Peppers");
    await userEvent.type(screen.getByLabelText(/sku/i), "VEG-1");
    await userEvent.selectOptions(screen.getByLabelText(/category/i), "vegetables");
    await userEvent.type(screen.getByLabelText(/^unit/i), "per kg");
    await userEvent.type(screen.getByLabelText(/price/i), "0");
    await userEvent.click(screen.getByRole("button", { name: /create product/i }));

    expect(admin.createProduct).not.toHaveBeenCalled();
  });

  it("sends the category slug the API expects", async () => {
    admin.createProduct.mockResolvedValue({ slug: "peppers", name: "Peppers" });
    render(<ProductForm categories={categories} onSaved={vi.fn()} onCancel={vi.fn()} />);

    await userEvent.type(screen.getByLabelText(/^name/i), "Peppers");
    await userEvent.type(screen.getByLabelText(/sku/i), "VEG-1");
    await userEvent.selectOptions(screen.getByLabelText(/category/i), "vegetables");
    await userEvent.type(screen.getByLabelText(/^unit/i), "per kg");
    await userEvent.type(screen.getByLabelText(/price/i), "3500.00");
    await userEvent.click(screen.getByRole("button", { name: /create product/i }));

    await waitFor(() =>
      expect(admin.createProduct).toHaveBeenCalledWith(
        expect.objectContaining({ category: "vegetables" }),
      ),
    );
  });

  it("shows the current stock read-only when editing", async () => {
    const product = {
      id: "p1", sku: "VEG-1", name: "Peppers", slug: "peppers", category: "vegetables",
      description: "", long_description: "", unit: "per kg", base_price: "3500.00",
      is_active: true, quantity_on_hand: 42, has_image: false, created_at: "",
    };

    render(<ProductForm product={product} categories={categories} onSaved={vi.fn()} onCancel={vi.fn()} />);

    // Visible, so the person editing knows it — but not typeable, which says
    // more clearly than a label that it is derived.
    expect(screen.getByText(/42/)).toBeInTheDocument();
    expect(screen.queryByRole("textbox", { name: /stock/i })).not.toBeInTheDocument();
  });
});

describe("inventory", () => {
  const row = {
    product: "p1", product_name: "Tomatoes", product_slug: "tomatoes", sku: "VEG-1",
    quantity_on_hand: 40, quantity_reserved: 3, quantity_available: 37,
    low_stock_threshold: 10, stock_status: "IN_STOCK",
  };

  it("keeps restock and adjust as different actions", async () => {
    // Restock adds a delivery; adjust sets an absolute figure after a
    // stocktake. Collapsing them is how a ledger stops explaining anything.
    admin.listInventory.mockResolvedValue({ results: [row], count: 1 });
    render(<InventoryClient />);

    await screen.findByText("Tomatoes");
    expect(screen.getByRole("button", { name: /restock/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /adjust/i })).toBeInTheDocument();
  });

  it("refuses a non-numeric restock without calling the API", async () => {
    admin.listInventory.mockResolvedValue({ results: [row], count: 1 });
    const prompts = vi.spyOn(window, "prompt").mockReturnValue("lots");
    render(<InventoryClient />);

    await userEvent.click(await screen.findByRole("button", { name: /restock/i }));

    expect(admin.restock).not.toHaveBeenCalled();
    expect(await screen.findByRole("alert")).toBeInTheDocument();
    prompts.mockRestore();
  });

  it("shows reserved separately from available", async () => {
    // Reserved units are in baskets mid-checkout. Showing only one number
    // makes a normal state look like a discrepancy.
    admin.listInventory.mockResolvedValue({ results: [row], count: 1 });
    render(<InventoryClient />);

    await screen.findByText("Tomatoes");
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("37")).toBeInTheDocument();
  });
});

describe("staff invitations", () => {
  it("never renders a token", async () => {
    // Every staff member can read this list. A token on it would let any of
    // them accept an invitation addressed to somebody else — including one
    // granting administrator.
    admin.listInvitations.mockResolvedValue([
      { id: "i1", email: "new@kuyashfarms.com", role: "ADMIN", status: "PENDING",
        invited_by_email: "ada@kuyashfarms.com", expires_at: new Date().toISOString(),
        accepted_at: null, revoked_at: null, created_at: new Date().toISOString() },
    ]);
    render(<StaffClient />);

    await screen.findByText("new@kuyashfarms.com");
    expect(document.body.textContent).not.toMatch(/token/i);
  });

  it("only offers to withdraw an invitation that is still pending", async () => {
    admin.listInvitations.mockResolvedValue([
      { id: "i1", email: "used@kuyashfarms.com", role: "STAFF", status: "ACCEPTED",
        invited_by_email: null, expires_at: new Date().toISOString(),
        accepted_at: new Date().toISOString(), revoked_at: null,
        created_at: new Date().toISOString() },
    ]);
    render(<StaffClient />);

    await screen.findByText("used@kuyashfarms.com");
    expect(screen.queryByRole("button", { name: /withdraw/i })).not.toBeInTheDocument();
  });

  it("refuses a malformed address without calling the API", async () => {
    render(<StaffClient />);

    await userEvent.type(await screen.findByLabelText(/email address/i), "not-an-email");
    await userEvent.click(screen.getByRole("button", { name: /send invitation/i }));

    expect(admin.invite).not.toHaveBeenCalled();
  });
});

describe("subscribers", () => {
  it("offers no way to add one", async () => {
    /*
     * Every row is supposed to be evidence that a mailbox owner opened a
     * confirmation link. A form that lets staff type an address straight in as
     * subscribed destroys that quietly — it only surfaces later, as a spam
     * complaint against the domain that also sends order receipts.
     */
    render(<SubscribersClient />);

    await screen.findByText(/nobody has signed up yet/i);
    expect(screen.queryByRole("button", { name: /add subscriber|new subscriber/i })).toBeNull();
  });

  it("distinguishes confirmed from awaiting confirmation", async () => {
    admin.listSubscribers.mockResolvedValue({
      results: [
        { id: "s1", email: "yes@example.com", status: "SUBSCRIBED", source: "academy",
          confirmed_at: new Date().toISOString(), unsubscribed_at: null, created_at: "" },
        { id: "s2", email: "no@example.com", status: "PENDING", source: "academy",
          confirmed_at: null, unsubscribed_at: null, created_at: "" },
      ],
      count: 2,
    });
    render(<SubscribersClient />);

    // A pending row is not on the list and must not be mailed. The count is
    // split across elements (`<strong>1</strong> confirmed of 2`), so match on
    // the container's text rather than a single node.
    await screen.findByText("yes@example.com");
    // `selector` narrows to the summary paragraph: a bare text matcher walks
    // up and matches every ancestor whose textContent happens to contain it.
    const summary = screen.getByText(/confirmed of/i, { selector: "p" });
    expect(summary.textContent).toMatch(/1\s*confirmed of\s*2/);
  });
});

describe("delivery dispatch", () => {
  it("will not start a run with nothing loaded", async () => {
    // Sending a driver out empty is a mistake worth catching at the gate.
    admin.listDrivers.mockResolvedValue([
      { id: "d1", full_name: "Musa Bello", phone: "08039876543",
        vehicle_registration: "LAG-244", vehicle_description: "", is_active: true },
    ]);
    admin.listRuns.mockResolvedValue([
      { id: "r1", driver: "d1", driver_name: "Musa Bello", scheduled_for: "2026-08-05",
        status: "PLANNED", started_at: null, completed_at: null, notes: "",
        stops: [], stop_count: 0 },
    ]);
    render(<DeliveryClient />);

    expect(await screen.findByRole("button", { name: /start run/i })).toBeDisabled();
  });

  it("says a failed stop needs rebooking rather than looking finished", async () => {
    // The goods came back and the order is still owed. "Failed" reads as
    // finished-with unless the screen says otherwise.
    admin.listRuns.mockResolvedValue([
      { id: "r1", driver: "d1", driver_name: "Musa", scheduled_for: "2026-08-05",
        status: "OUT", started_at: null, completed_at: null, notes: "", stop_count: 1,
        stops: [{ id: "st1", order_number: "KF-1", sequence: 0, status: "FAILED",
          recipient_name: "Ada", address: "22 Awolowo Road", phone: "08039876543",
          delivered_at: null, received_by: "", failure_reason: "Nobody home", notes: "" }] },
    ]);
    render(<DeliveryClient />);

    expect(await screen.findByText(/needs rebooking/i)).toBeInTheDocument();
  });
});

describe("the driver's round", () => {
  const run = {
    id: "r1", driver: "d1", driver_name: "Musa", scheduled_for: new Date().toISOString().slice(0, 10),
    status: "OUT" as const, started_at: null, completed_at: null, notes: "", stop_count: 1,
    stops: [{ id: "st1", order_number: "KF-1", sequence: 0, status: "PENDING" as const,
      recipient_name: "Ada Okoro", address: "22 Awolowo Road", phone: "08039876543",
      delivered_at: null, received_by: "", failure_reason: "", notes: "" }],
  };

  it("puts the address and a callable number on the card", async () => {
    // A driver at the wheel cannot look an order up, and retyping a number is
    // both slow and unsafe.
    admin.myRuns.mockResolvedValue([run]);
    render(<DriverClient />);

    expect(await screen.findByText(/22 Awolowo Road/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /08039876543/ })).toHaveAttribute(
      "href",
      "tel:08039876543",
    );
  });

  it("does not deliver without a name", async () => {
    // "Delivered" with nobody's name against it is the answer that cannot be
    // checked when a customer says it never arrived.
    admin.myRuns.mockResolvedValue([run]);
    const prompts = vi.spyOn(window, "prompt").mockReturnValue("   ");
    render(<DriverClient />);

    await userEvent.click(await screen.findByRole("button", { name: /^delivered$/i }));

    expect(admin.markDelivered).not.toHaveBeenCalled();
    prompts.mockRestore();
  });

  it("keeps a finished round on screen", async () => {
    // Filtering it away the moment the last stop lands empties the screen with
    // no confirmation, which is exactly when somebody taps again.
    admin.myRuns.mockResolvedValue([
      { ...run, status: "COMPLETED" as const,
        stops: [{ ...run.stops[0]!, status: "DELIVERED" as const, received_by: "Ada Okoro" }] },
    ]);
    render(<DriverClient />);

    expect(await screen.findByText(/round finished/i)).toBeInTheDocument();
    expect(screen.getByText(/received by ada okoro/i)).toBeInTheDocument();
  });
});

describe("academy management", () => {
  it("asks for an instructor before a class can be scheduled", async () => {
    // A class needs one, so an empty instructor list is a prerequisite rather
    // than an empty dropdown somebody cannot get past.
    render(<ManageClasses />);

    expect(await screen.findByText(/add an instructor first/i)).toBeInTheDocument();
  });

  it("shows how many seats are booked, so shrinking is visibly refused", async () => {
    admin.listInstructors.mockResolvedValue([
      { id: "i1", name: "Dr. Obi", title: "Soil Scientist", bio: "", photo: null,
        specialties: [], is_active: true },
    ]);
    admin.listStaffClasses.mockResolvedValue({
      results: [{ id: "c1", title: "Composting", slug: "composting", instructor: "i1",
        program: null, scheduled_date: new Date().toISOString(), location: "Farm",
        price: "15000.00", total_seats: 20, seats_taken: 7, seats_left: 13,
        is_active: true, description: "" }],
      count: 1,
    });
    render(<ManageClasses />);

    expect(await screen.findByText(/7 of 20 booked/i)).toBeInTheDocument();
  });

  it("has no field for seats taken", async () => {
    // Derived from real bookings. The prototype's was a number in a file that
    // never moved, so four people could book the same last place.
    admin.listInstructors.mockResolvedValue([
      { id: "i1", name: "Dr. Obi", title: "", bio: "", photo: null, specialties: [], is_active: true },
    ]);
    render(<ManageClasses />);

    await screen.findByLabelText(/^title$/i);
    expect(screen.queryByLabelText(/seats taken|booked/i)).not.toBeInTheDocument();
  });
});

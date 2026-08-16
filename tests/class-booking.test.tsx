/**
 * Academy seat booking.
 *
 * The prototype's version of this form was theatre: a 1500ms `setTimeout`, a
 * reference built from `Date.now()`, and a push into `localStorage`. It always
 * "succeeded", including on a class with no seats left, because nothing was
 * ever asked.
 *
 * These tests pin the behaviour that replaced it — in particular that a full
 * class does not render a form at all, and that a guest's email is remembered
 * so they can reach their own confirmation page.
 */

import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { AcademyClassDetail } from "@/lib/api/academy";

const registerForClass = vi.fn();
const push = vi.fn();

vi.mock("@/lib/api/academy", () => ({
  registerForClass: (...args: unknown[]) => registerForClass(...args),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("@/lib/context/AuthContext", () => ({
  useAuth: () => ({ user: null, isAuthenticated: false }),
}));
vi.mock("@/components/layout/Navbar", () => ({ Navbar: () => null }));
vi.mock("@/components/layout/Footer", () => ({ Footer: () => null }));

const { ClassDetailClient } = await import("@/app/academy/classes/[slug]/ClassDetailClient");
const { registrationEmailFor } = await import("@/lib/api/guest-registration");

const BASE: AcademyClassDetail = {
  id: "1",
  title: "Soil Health & Crop Production",
  slug: "soil-health-crop-production",
  description: "Master soil science.",
  long_description: "A full day on soil.",
  instructor_name: "Dr. Chukwuemeka Obi",
  instructor: null,
  program_title: "",
  scheduled_date: "2026-08-18T09:00:00+01:00",
  duration: "1 day",
  location: "Kuyash Farms, Lagos",
  format: "IN_PERSON",
  level: "BEGINNER",
  price: "25000.00",
  total_seats: 20,
  image: "",
  seats_left: 5,
  is_full: false,
  is_open_for_registration: true,
  topics: ["Soil testing", "Composting"],
  includes: ["Lunch"],
};

beforeEach(() => {
  registerForClass.mockReset();
  push.mockReset();
});

describe("seat availability", () => {
  it("shows the real seat count from the API, not a constant", () => {
    render(<ClassDetailClient cls={BASE} />);
    expect(screen.getByText("5 of 20")).toBeInTheDocument();
  });

  it("warns when seats are running low", () => {
    render(<ClassDetailClient cls={BASE} />);
    expect(screen.getByText(/Only 5 seats remaining/)).toBeInTheDocument();
  });

  it("refuses to render a booking form for a full class", () => {
    render(
      <ClassDetailClient cls={{ ...BASE, seats_left: 0, is_full: true, is_open_for_registration: false }} />,
    );
    expect(screen.getByText("This class is full")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /confirm registration/i })).toBeNull();
  });

  it("says registration is closed, not full, when the date has passed", () => {
    render(<ClassDetailClient cls={{ ...BASE, is_open_for_registration: false }} />);
    expect(screen.getByText("Registration is closed")).toBeInTheDocument();
  });

  it("prices a free class as free rather than ₦0.00", () => {
    render(<ClassDetailClient cls={{ ...BASE, price: "0.00" }} />);
    expect(screen.getByText("Free")).toBeInTheDocument();
  });
});

describe("booking a seat", () => {
  it("posts to the API and sends the guest to their confirmation", async () => {
    registerForClass.mockResolvedValue({
      reference: "KFA-260728-VSG4",
      email: "adaeze@example.com",
    });

    const user = userEvent.setup();
    render(<ClassDetailClient cls={BASE} />);

    await user.type(screen.getByLabelText(/full name/i), "Adaeze Okonkwo");
    await user.type(screen.getByLabelText(/email address/i), "adaeze@example.com");
    await user.type(screen.getByLabelText(/phone number/i), "08031234567");
    await user.click(screen.getByRole("button", { name: /confirm registration/i }));

    await waitFor(() => expect(registerForClass).toHaveBeenCalledOnce());
    expect(registerForClass).toHaveBeenCalledWith(
      "soil-health-crop-production",
      expect.objectContaining({
        full_name: "Adaeze Okonkwo",
        email: "adaeze@example.com",
        phone: "08031234567",
      }),
    );

    // Without this the guest is bounced off their own confirmation page.
    expect(registrationEmailFor("KFA-260728-VSG4")).toBe("adaeze@example.com");
    expect(push).toHaveBeenCalledWith("/academy/registrations/KFA-260728-VSG4");
  });

  it("surfaces the server's refusal instead of claiming success", async () => {
    const { ApiError } = await import("@/lib/api/client");
    registerForClass.mockRejectedValue(new ApiError("That class is now full.", 409));

    const user = userEvent.setup();
    render(<ClassDetailClient cls={BASE} />);

    await user.type(screen.getByLabelText(/full name/i), "Adaeze Okonkwo");
    await user.type(screen.getByLabelText(/email address/i), "adaeze@example.com");
    await user.type(screen.getByLabelText(/phone number/i), "08031234567");
    await user.click(screen.getByRole("button", { name: /confirm registration/i }));

    expect(await screen.findByText("That class is now full.")).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });
});

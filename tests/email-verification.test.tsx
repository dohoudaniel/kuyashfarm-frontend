import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

/**
 * Following a verification link.
 *
 * The page used to POST the token, show "Email verified", and leave the
 * visitor anonymous — the navbar still said "Sign in", and the only evidence
 * anything had happened was a sentence on a page they were about to close.
 * Nothing arrived by email either.
 *
 * The server now returns a session with the first successful use of a link, so
 * these pin the two claims that replaced that:
 *
 *  * the page adopts the session it is handed, rather than reporting success
 *    and discarding it;
 *  * a link that issues no session (already spent) must not tell anybody they
 *    are signed in — sending them to a page that bounces them straight back is
 *    worse than saying nothing.
 */

const completeEmailVerification = vi.fn();

vi.mock("@/lib/context/AuthContext", () => ({
  useAuth: () => ({ completeEmailVerification }),
}));

const searchParams = new URLSearchParams();
vi.mock("next/navigation", () => ({
  useSearchParams: () => searchParams,
}));

import VerifyEmailClient from "@/app/verify-email/VerifyEmailClient";

beforeEach(() => {
  vi.clearAllMocks();
  searchParams.set("uid", "abc");
  searchParams.set("token", "tok");
});

describe("the verification landing page", () => {
  it("passes the link straight through to the auth context", async () => {
    completeEmailVerification.mockResolvedValue(true);

    render(<VerifyEmailClient />);

    await waitFor(() => expect(completeEmailVerification).toHaveBeenCalledWith("abc", "tok"));
  });

  it("reports the session when the link signed the visitor in", async () => {
    completeEmailVerification.mockResolvedValue(true);

    render(<VerifyEmailClient />);

    expect(await screen.findByText(/you're all set/i)).toBeInTheDocument();
    expect(screen.getByText(/you are signed in/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /start shopping/i })).toHaveAttribute(
      "href",
      "/categories",
    );
  });

  it("does not claim a session when the link issued none", async () => {
    completeEmailVerification.mockResolvedValue(false);

    render(<VerifyEmailClient />);

    expect(await screen.findByText(/email verified/i)).toBeInTheDocument();
    expect(screen.queryByText(/you are signed in/i)).not.toBeInTheDocument();
    // Sent to sign in, not to a page that would bounce them back.
    expect(screen.getByRole("link", { name: /sign in/i })).toHaveAttribute("href", "/login");
  });

  it("verifies once, not twice, under React's double-invoked effects", async () => {
    completeEmailVerification.mockResolvedValue(true);

    const { rerender } = render(<VerifyEmailClient />);
    rerender(<VerifyEmailClient />);

    await waitFor(() => expect(completeEmailVerification).toHaveBeenCalledTimes(1));
  });

  it("shows the failure without pretending anything was verified", async () => {
    completeEmailVerification.mockRejectedValue(new Error("nope"));

    render(<VerifyEmailClient />);

    expect(await screen.findByText(/link didn't work/i)).toBeInTheDocument();
    expect(screen.queryByText(/you're all set/i)).not.toBeInTheDocument();
  });
});

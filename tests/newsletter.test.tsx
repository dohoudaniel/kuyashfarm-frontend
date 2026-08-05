import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ApiError } from "@/lib/api/client";

/**
 * The newsletter flow.
 *
 * The form used to run an 800ms `setTimeout` against no endpoint and declare
 * "You're subscribed!". These tests pin the two claims that replaced it and
 * are easy to regress into being untrue again:
 *
 *  * subscribing sends a confirmation link, so the copy must not promise a
 *    subscription that has not happened yet;
 *  * unsubscribing needs a real click, because corporate mail scanners fetch
 *    every URL in an incoming message and would otherwise unsubscribe people
 *    who never opened the email.
 */

const subscribe = vi.fn();
const confirmSubscription = vi.fn();
const unsubscribe = vi.fn();

vi.mock("@/lib/api/newsletter", () => ({
  subscribe: (...args: unknown[]) => subscribe(...args),
  confirmSubscription: (...args: unknown[]) => confirmSubscription(...args),
  unsubscribe: (...args: unknown[]) => unsubscribe(...args),
}));

// Chrome layout, not behaviour under test — and Navbar reaches for auth state.
vi.mock("@/components/layout/Navbar", () => ({ Navbar: () => null }));
vi.mock("@/components/layout/Footer", () => ({ Footer: () => null }));
// The stand-ins must be cached per tag. A Proxy that builds a fresh function
// on every access hands React a new component *type* each render, so the whole
// subtree unmounts and remounts — which silently drops the input's state after
// the first keystroke and makes every form test fail for the wrong reason.
const motionTags = new Map<string, (props: Record<string, unknown>) => unknown>();
vi.mock("framer-motion", () => ({
  motion: new Proxy(
    {},
    {
      get: (_target, tag: string) => {
        if (!motionTags.has(tag)) {
          motionTags.set(tag, (props: Record<string, unknown>) => props.children);
        }
        return motionTags.get(tag);
      },
    },
  ),
}));

let searchParams = new URLSearchParams();
vi.mock("next/navigation", () => ({
  useSearchParams: () => searchParams,
}));

const { AcademyNewsletter } = await import("@/app/academy/sections/AcademyNewsletter");
const NewsletterConfirmClient = (
  await import("@/app/newsletter/confirm/NewsletterConfirmClient")
).default;
const NewsletterUnsubscribeClient = (
  await import("@/app/newsletter/unsubscribe/NewsletterUnsubscribeClient")
).default;

beforeEach(() => {
  vi.clearAllMocks();
  searchParams = new URLSearchParams();
});

describe("signing up", () => {
  it("sends the address and records which form it came from", async () => {
    subscribe.mockResolvedValue(null);
    render(<AcademyNewsletter />);

    await userEvent.type(screen.getByPlaceholderText(/email address/i), "ada@example.com");
    await userEvent.click(screen.getByRole("button", { name: /subscribe/i }));

    await waitFor(() => expect(subscribe).toHaveBeenCalledWith("ada@example.com", "academy"));
  });

  it("does not claim the address is subscribed, because it is not yet", async () => {
    subscribe.mockResolvedValue(null);
    render(<AcademyNewsletter />);

    await userEvent.type(screen.getByPlaceholderText(/email address/i), "ada@example.com");
    await userEvent.click(screen.getByRole("button", { name: /subscribe/i }));

    // Double opt-in: the address joins the list when the emailed link is
    // opened, not now. The old copy said "You're subscribed!" here.
    expect(await screen.findByText(/check your email/i)).toBeInTheDocument();
    expect(screen.queryByText(/you're subscribed/i)).not.toBeInTheDocument();
  });

  it("refuses a malformed address without calling the API", async () => {
    render(<AcademyNewsletter />);

    await userEvent.type(screen.getByPlaceholderText(/email address/i), "not-an-email");
    await userEvent.click(screen.getByRole("button", { name: /subscribe/i }));

    expect(subscribe).not.toHaveBeenCalled();
    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });

  it("shows the server's message when the endpoint refuses", async () => {
    // Rate limiting is the realistic failure: the endpoint is public and every
    // accepted request can send mail.
    subscribe.mockRejectedValue(new ApiError("Too many requests.", 429));
    render(<AcademyNewsletter />);

    await userEvent.type(screen.getByPlaceholderText(/email address/i), "ada@example.com");
    await userEvent.click(screen.getByRole("button", { name: /subscribe/i }));

    expect(await screen.findByText(/too many requests/i)).toBeInTheDocument();
  });
});

describe("confirming", () => {
  it("confirms on load, because the click that matters already happened", async () => {
    searchParams = new URLSearchParams("token=a-signed-token");
    confirmSubscription.mockResolvedValue(null);

    render(<NewsletterConfirmClient />);

    await waitFor(() => expect(confirmSubscription).toHaveBeenCalledWith("a-signed-token"));
    expect(await screen.findByText(/you're subscribed/i)).toBeInTheDocument();
  });

  it("attempts once, so Strict Mode's double render cannot race itself", async () => {
    searchParams = new URLSearchParams("token=a-signed-token");
    confirmSubscription.mockResolvedValue(null);

    const { rerender } = render(<NewsletterConfirmClient />);
    rerender(<NewsletterConfirmClient />);

    await waitFor(() => expect(confirmSubscription).toHaveBeenCalledTimes(1));
  });

  it("explains an expired link instead of failing silently", async () => {
    searchParams = new URLSearchParams("token=stale");
    confirmSubscription.mockRejectedValue(
      new ApiError("That link is no longer valid. Please subscribe again.", 400),
    );

    render(<NewsletterConfirmClient />);

    expect(await screen.findByText(/no longer valid/i)).toBeInTheDocument();
  });

  it("does not call the API at all when the link is truncated", async () => {
    render(<NewsletterConfirmClient />);

    expect(confirmSubscription).not.toHaveBeenCalled();
    expect(await screen.findByText(/didn't work/i)).toBeInTheDocument();
  });
});

describe("unsubscribing", () => {
  it("does NOT unsubscribe on page load", async () => {
    searchParams = new URLSearchParams("token=a-signed-token");

    render(<NewsletterUnsubscribeClient />);
    await screen.findByRole("button", { name: /yes, unsubscribe me/i });

    // The whole reason this page has a button. Outlook Safe Links and
    // antivirus gateways fetch every URL in an incoming message; acting on
    // load would unsubscribe people before they opened the email, and the
    // symptom — "the newsletter just stopped" — leaves no trace anywhere.
    expect(unsubscribe).not.toHaveBeenCalled();
  });

  it("unsubscribes when the person actually asks", async () => {
    searchParams = new URLSearchParams("token=a-signed-token");
    unsubscribe.mockResolvedValue(null);

    render(<NewsletterUnsubscribeClient />);
    await userEvent.click(screen.getByRole("button", { name: /yes, unsubscribe me/i }));

    await waitFor(() => expect(unsubscribe).toHaveBeenCalledWith("a-signed-token"));
    expect(await screen.findByText(/you've been unsubscribed/i)).toBeInTheDocument();
  });

  it("says that order emails are unaffected", async () => {
    searchParams = new URLSearchParams("token=a-signed-token");
    unsubscribe.mockResolvedValue(null);

    render(<NewsletterUnsubscribeClient />);

    // Otherwise "unsubscribe" reads as "stop emailing me entirely", and
    // somebody opts out of their own delivery notifications.
    expect(screen.getByText(/does not affect order confirmations/i)).toBeInTheDocument();
  });

  it("offers a way out that is not unsubscribing", async () => {
    searchParams = new URLSearchParams("token=a-signed-token");
    render(<NewsletterUnsubscribeClient />);

    expect(screen.getByRole("link", { name: /keep me subscribed/i })).toBeInTheDocument();
  });
});

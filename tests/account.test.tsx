import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { ApiError } from "@/lib/api/client";
import userEvent from "@testing-library/user-event";

/**
 * The account page and the one thing on it a customer can customise.
 *
 * The avatar is the first upload a *non-staff* user can make, so the limits on
 * it matter differently to the ones on product photography: any signed-in
 * account can reach that endpoint. The server is the authority and refuses the
 * same things — `tests/test_avatar.py` in the backend pins that — so what is
 * worth testing here is the part the server cannot do, which is refusing a
 * file *before* it is uploaded. On a mobile connection the difference between
 * those two is the whole user experience.
 *
 * The initials are tested because they are shared: the navbar and the profile
 * page render the same person, and two copies of "which letters" produced two
 * different answers for one account the last time this logic was duplicated.
 */

const authApi = {
  listAddresses: vi.fn(),
  resendVerification: vi.fn(),
  changePassword: vi.fn(),
  deleteAddress: vi.fn(),
  createAddress: vi.fn(),
  uploadAvatar: vi.fn(),
  removeAvatar: vi.fn(),
};

vi.mock("@/lib/api/auth", () => authApi);
vi.mock("@/lib/api/applications", () => ({
  myApplications: () => Promise.resolve([]),
  listStates: () => Promise.resolve([]),
}));
vi.mock("@/lib/api/academy", () => ({ myRegistrations: () => Promise.resolve([]) }));

const setAvatar = vi.fn();
const clearAvatar = vi.fn();

const BASE_USER = {
  id: "u1",
  email: "cejiro@kuyashfarms.com",
  full_name: "",
  phone: "",
  avatar: null as string | null,
  role: "CUSTOMER",
  account_type: "RETAIL",
  is_email_verified: true,
  gets_bulk_pricing: false,
  is_back_office: false,
  admin_url: null,
  date_joined: "2026-02-10T09:00:00Z",
};

let auth = {
  user: { ...BASE_USER },
  isAuthenticated: true,
  isLoading: false,
  updateProfile: vi.fn(),
  setAvatar,
  clearAvatar,
};

vi.mock("@/lib/context/AuthContext", () => ({ useAuth: () => auth }));

const { Avatar, initialsFor } = await import("@/components/account/Avatar");
const { AvatarUploader } = await import("@/components/account/AvatarUploader");
const ProfileClient = (await import("@/app/profile/ProfileClient")).default;

/** A file of a stated type and size, without generating real bytes for it. */
function fileOf(name: string, type: string, bytes: number): File {
  const file = new File(["x"], name, { type });
  Object.defineProperty(file, "size", { value: bytes });
  return file;
}

beforeEach(() => {
  vi.clearAllMocks();
  auth = {
    user: { ...BASE_USER },
    isAuthenticated: true,
    isLoading: false,
    updateProfile: vi.fn(),
    setAvatar,
    clearAvatar,
  };
  authApi.listAddresses.mockResolvedValue({ results: [], count: 0 });
});

describe("initials", () => {
  it("uses the first letters of a name", () => {
    expect(initialsFor("Ada Okafor", "ada@example.com")).toBe("AO");
  });

  it("falls back to the email when there is no name", () => {
    // A brand-new account has `full_name: ""`, and a blank disc in the header
    // reads as a broken image rather than as a missing name.
    expect(initialsFor("", "cejiro@kuyashfarms.com")).toBe("CK");
  });

  it("never renders more than two letters", () => {
    expect(initialsFor("Chidi Ada Nnamdi Okafor", null)).toBe("CA");
  });

  it("survives having nothing at all", () => {
    expect(initialsFor(null, null)).toBe("?");
  });
});

describe("Avatar", () => {
  it("keeps the initials behind the photograph", () => {
    // Not an either/or. A photograph that fails to load — deleted file, bucket
    // permission changed after the URL was issued — then degrades to initials
    // rather than to an empty circle, with no `onError` handler needed.
    render(<Avatar src="https://example.com/a.jpg" name="Ada Okafor" />);

    expect(screen.getByText("AO")).toBeInTheDocument();
  });
});

describe("AvatarUploader", () => {
  it("accepts a file a phone would actually produce", async () => {
    // The limit used to be 2 MB, which rejected the ordinary case: a
    // photograph straight off a modern phone is routinely 4-8 MB.
    setAvatar.mockResolvedValue({ ...BASE_USER, avatar: "https://example.com/a.jpg" });
    render(<AvatarUploader onMessage={vi.fn()} />);

    await userEvent.upload(
      screen.getByLabelText("Upload a profile photograph"),
      fileOf("phone.jpg", "image/jpeg", 6 * 1024 * 1024),
    );

    await waitFor(() => expect(setAvatar).toHaveBeenCalledTimes(1));
  });

  it("refuses a file over 10 MB without uploading it, and says how big it is", async () => {
    const onMessage = vi.fn();
    render(<AvatarUploader onMessage={onMessage} />);

    await userEvent.upload(
      screen.getByLabelText("Upload a profile photograph"),
      fileOf("huge.jpg", "image/jpeg", 12 * 1024 * 1024),
    );

    // The second assertion is the point. The server refuses this too, but only
    // after the whole 12 MB has been sent.
    expect(onMessage).toHaveBeenCalledWith(
      expect.stringContaining("12.0 MB"),
      true,
    );
    expect(onMessage).toHaveBeenCalledWith(expect.stringContaining("10 MB"), true);
    expect(setAvatar).not.toHaveBeenCalled();
  });

  it("tells the customer to retry when storage is unavailable", async () => {
    // 503 is the server saying a dependency is down, not that we have a bug.
    // "Something went wrong" would invite a bug report for an outage.
    const onMessage = vi.fn();
    setAvatar.mockRejectedValue(new ApiError("File storage is temporarily unavailable.", 503));
    render(<AvatarUploader onMessage={onMessage} />);

    await userEvent.upload(
      screen.getByLabelText("Upload a profile photograph"),
      fileOf("face.jpg", "image/jpeg", 400_000),
    );

    await waitFor(() =>
      expect(onMessage).toHaveBeenCalledWith(expect.stringMatching(/try again/i), true),
    );
  });

  it("does not offer SVG in the file picker, and refuses one anyway", async () => {
    /*
     * Two layers, and they fail at different moments.
     *
     * `accept` is the first: a native file picker will not show an SVG, and
     * `userEvent.upload` models that faithfully — it drops the file and the
     * change handler never runs, which is why asserting on `onMessage` here
     * finds nothing. That is the attribute working, not the test failing.
     *
     * `accept` is only a hint, though. Drag-and-drop ignores it, and so does
     * anything driving the input directly, so the handler checks the type as
     * well. Dispatched by hand, because that is the only way to get past a
     * picker that is doing its job.
     */
    const onMessage = vi.fn();
    render(<AvatarUploader onMessage={onMessage} />);

    const input = screen.getByLabelText("Upload a profile photograph") as HTMLInputElement;
    expect(input.accept).not.toContain("svg");

    Object.defineProperty(input, "files", {
      configurable: true,
      value: [fileOf("x.svg", "image/svg+xml", 200)],
    });
    fireEvent.change(input);

    expect(setAvatar).not.toHaveBeenCalled();
    expect(onMessage).toHaveBeenCalledWith(expect.any(String), true);
  });

  it("uploads an acceptable photograph", async () => {
    const onMessage = vi.fn();
    setAvatar.mockResolvedValue({ ...BASE_USER, avatar: "https://example.com/a.jpg" });
    render(<AvatarUploader onMessage={onMessage} />);

    await userEvent.upload(
      screen.getByLabelText("Upload a profile photograph"),
      fileOf("face.jpg", "image/jpeg", 400_000),
    );

    await waitFor(() => expect(setAvatar).toHaveBeenCalledTimes(1));
    expect(onMessage).toHaveBeenCalledWith("Photograph updated.");
  });

  it("offers removal only once there is something to remove", () => {
    const { rerender } = render(<AvatarUploader onMessage={vi.fn()} />);
    expect(screen.queryByRole("button", { name: /remove/i })).not.toBeInTheDocument();

    auth = { ...auth, user: { ...BASE_USER, avatar: "https://example.com/a.jpg" } };
    rerender(<AvatarUploader onMessage={vi.fn()} />);

    expect(screen.getByRole("button", { name: /remove/i })).toBeInTheDocument();
  });
});

describe("the account page", () => {
  it("names the account type rather than showing the enum", async () => {
    // "WHOLESALE_PENDING" in a chip on somebody's own profile is a database
    // value leaking into a product.
    auth = { ...auth, user: { ...BASE_USER, account_type: "WHOLESALE_PENDING" } };

    render(<ProfileClient />);

    expect(await screen.findByText(/awaiting approval/i)).toBeInTheDocument();
    expect(screen.queryByText("WHOLESALE_PENDING")).not.toBeInTheDocument();
  });

  it("says which section is showing", async () => {
    // The sections were five unlabelled buttons in a list, so a screen reader
    // announced "Addresses, button" with nothing saying it selected a panel
    // or which one was open.
    render(<ProfileClient />);

    const profileTab = await screen.findByRole("tab", { name: /profile/i });
    expect(profileTab).toHaveAttribute("aria-selected", "true");

    await userEvent.click(screen.getByRole("tab", { name: /addresses/i }));

    expect(screen.getByRole("tab", { name: /addresses/i })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(profileTab).toHaveAttribute("aria-selected", "false");
  });

  it("does not offer to resend a verification link to a verified address", async () => {
    render(<ProfileClient />);

    await waitFor(() => expect(authApi.listAddresses).toHaveBeenCalled());
    expect(screen.queryByText(/not verified yet/i)).not.toBeInTheDocument();
  });

  it("offers one when the address is unverified", async () => {
    auth = { ...auth, user: { ...BASE_USER, is_email_verified: false } };

    render(<ProfileClient />);

    expect(await screen.findByText(/not verified yet/i)).toBeInTheDocument();
  });
});

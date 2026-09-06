import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ApiError } from "@/lib/api/client";

/**
 * Creating a product with its photographs in one go.
 *
 * The upload endpoint is `/staff/products/{slug}/images/`, so nothing can be
 * uploaded until the product exists. The form therefore *stages* the files and
 * sends them the moment a slug comes back — which puts the interesting
 * behaviour in the seam between the two calls rather than in either of them:
 *
 *  * the uploads must be sequential, because the server makes the first one
 *    the card image and firing them together makes that a race;
 *  * an upload failure must not be reported as a failed save, because by then
 *    the product exists — saying otherwise invites a second press that can
 *    only fail on a duplicate SKU, leaving a real product nobody mentioned;
 *  * staged files must not survive switching to a different product.
 */

const admin = {
  createProduct: vi.fn(),
  updateProduct: vi.fn(),
  uploadProductImage: vi.fn(),
};

vi.mock("@/lib/api/admin", () => ({
  createProduct: (...a: unknown[]) => admin.createProduct(...a),
  updateProduct: (...a: unknown[]) => admin.updateProduct(...a),
  uploadProductImage: (...a: unknown[]) => admin.uploadProductImage(...a),
}));

const { ProductForm } = await import("@/app/admin/products/ProductForm");

const CATEGORIES = [
  {
    id: "c1",
    name: "Fruit",
    slug: "fruit",
    description: "",
    image: null,
    sort_order: 0,
    product_count: 3,
    is_active: true,
  },
];

const CREATED = {
  id: "p1",
  sku: "FRT-020",
  name: "Plantain",
  slug: "plantain",
  category: "fruit",
  description: "",
  long_description: "",
  unit: "per bunch",
  base_price: "3500.00",
  is_active: true,
  quantity_on_hand: 0,
  has_image: false,
  created_at: "2026-08-24T09:00:00Z",
};

/** A file of a stated type and size, without generating real bytes for it. */
function fileOf(name: string, type = "image/jpeg", bytes = 1000): File {
  const file = new File(["x"], name, { type });
  Object.defineProperty(file, "size", { value: bytes });
  return file;
}

/** Fill the five required fields. */
async function fillRequired() {
  await userEvent.type(screen.getByLabelText(/name/i), "Plantain");
  await userEvent.type(screen.getByLabelText(/sku/i), "FRT-020");
  await userEvent.selectOptions(screen.getByLabelText(/category/i), "fruit");
  await userEvent.type(screen.getByLabelText(/unit/i), "per bunch");
  await userEvent.type(screen.getByLabelText(/price/i), "3500.00");
}

beforeEach(() => {
  vi.clearAllMocks();
  admin.createProduct.mockResolvedValue(CREATED);
  admin.uploadProductImage.mockResolvedValue({ id: "i1" });

  // jsdom has neither. The picker uses createObjectURL for thumbnails and
  // randomUUID for React keys that must survive a removal from the middle.
  URL.createObjectURL = vi.fn((file: Blob) => `blob:${(file as File).name}`);
  URL.revokeObjectURL = vi.fn();
});

function renderNew(onSaved = vi.fn()) {
  render(
    <ProductForm categories={CATEGORIES} onSaved={onSaved} onCancel={vi.fn()} />,
  );
  return onSaved;
}

describe("staging photographs", () => {
  it("uploads them after the product is created, in the order shown", async () => {
    const onSaved = renderNew();
    await fillRequired();

    await userEvent.upload(screen.getByLabelText(/choose photographs/i), [
      fileOf("one.jpg"),
      fileOf("two.jpg"),
    ]);

    await userEvent.click(screen.getByRole("button", { name: /create product/i }));

    await waitFor(() => expect(onSaved).toHaveBeenCalled());

    expect(admin.createProduct).toHaveBeenCalledTimes(1);
    expect(admin.uploadProductImage).toHaveBeenCalledTimes(2);
    // The slug from the create response, and the order the picker showed.
    expect(admin.uploadProductImage.mock.calls[0]![0]).toBe("plantain");
    expect((admin.uploadProductImage.mock.calls[0]![1] as File).name).toBe("one.jpg");
    expect((admin.uploadProductImage.mock.calls[1]![1] as File).name).toBe("two.jpg");
  });

  it("uploads one at a time rather than all at once", async () => {
    // The server decides primary-ness by reading what already exists, so
    // concurrent uploads all see an empty gallery and race for the card image.
    let inFlight = 0;
    let overlapped = false;
    admin.uploadProductImage.mockImplementation(async () => {
      inFlight += 1;
      if (inFlight > 1) overlapped = true;
      await new Promise((resolve) => setTimeout(resolve, 5));
      inFlight -= 1;
      return { id: "i" };
    });

    const onSaved = renderNew();
    await fillRequired();
    await userEvent.upload(screen.getByLabelText(/choose photographs/i), [
      fileOf("a.jpg"),
      fileOf("b.jpg"),
      fileOf("c.jpg"),
    ]);

    await userEvent.click(screen.getByRole("button", { name: /create product/i }));
    await waitFor(() => expect(onSaved).toHaveBeenCalled());

    expect(overlapped).toBe(false);
  });

  it("sends the chosen card image first", async () => {
    const onSaved = renderNew();
    await fillRequired();
    await userEvent.upload(screen.getByLabelText(/choose photographs/i), [
      fileOf("first.jpg"),
      fileOf("better.jpg"),
    ]);

    // The second one is the good photograph. Promoting it moves it to the
    // front, which is the only thing that makes it the card image server-side.
    await userEvent.click(screen.getAllByRole("button", { name: /make card image/i })[0]!);
    await userEvent.click(screen.getByRole("button", { name: /create product/i }));

    await waitFor(() => expect(onSaved).toHaveBeenCalled());
    expect((admin.uploadProductImage.mock.calls[0]![1] as File).name).toBe("better.jpg");
  });

  it("creates the product with no photographs when none were chosen", async () => {
    const onSaved = renderNew();
    await fillRequired();

    await userEvent.click(screen.getByRole("button", { name: /create product/i }));

    await waitFor(() => expect(onSaved).toHaveBeenCalled());
    expect(admin.uploadProductImage).not.toHaveBeenCalled();
    // No note: nothing happened to any photograph, so there is nothing to say.
    expect(onSaved.mock.calls[0]![1]).toBeUndefined();
  });
});

describe("when an upload fails", () => {
  it("keeps the product and says what happened", async () => {
    // The product exists by now. Reporting a failed save would be false, and
    // pressing the button again could only fail on the duplicate SKU.
    admin.uploadProductImage
      .mockResolvedValueOnce({ id: "i1" })
      .mockRejectedValueOnce(new ApiError("Images must be 10 MB or smaller.", 400));

    const onSaved = renderNew();
    await fillRequired();
    await userEvent.upload(screen.getByLabelText(/choose photographs/i), [
      fileOf("ok.jpg"),
      fileOf("bad.jpg"),
    ]);

    await userEvent.click(screen.getByRole("button", { name: /create product/i }));

    await waitFor(() => expect(onSaved).toHaveBeenCalled());

    const [saved, note] = onSaved.mock.calls[0]!;
    expect(saved).toEqual(CREATED);
    expect(note).toContain("1 of 2");
    // Not left sitting on a form for a product that already exists.
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("stops after the first failure rather than pressing on", async () => {
    admin.uploadProductImage.mockRejectedValue(new ApiError("Storage unavailable.", 503));

    const onSaved = renderNew();
    await fillRequired();
    await userEvent.upload(screen.getByLabelText(/choose photographs/i), [
      fileOf("a.jpg"),
      fileOf("b.jpg"),
      fileOf("c.jpg"),
    ]);

    await userEvent.click(screen.getByRole("button", { name: /create product/i }));
    await waitFor(() => expect(onSaved).toHaveBeenCalled());

    expect(admin.uploadProductImage).toHaveBeenCalledTimes(1);
    expect(onSaved.mock.calls[0]![1]).toContain("no photograph");
  });
});

describe("when the product itself cannot be created", () => {
  it("does not upload anything and keeps the form open", async () => {
    admin.createProduct.mockRejectedValue(
      new ApiError("A product with that SKU already exists.", 400),
    );

    const onSaved = renderNew();
    await fillRequired();
    await userEvent.upload(screen.getByLabelText(/choose photographs/i), [fileOf("a.jpg")]);

    await userEvent.click(screen.getByRole("button", { name: /create product/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/SKU already exists/i);
    expect(admin.uploadProductImage).not.toHaveBeenCalled();
    expect(onSaved).not.toHaveBeenCalled();
  });
});

describe("what the picker refuses before uploading", () => {
  it("rejects a file over 10 MB", async () => {
    renderNew();

    await userEvent.upload(
      screen.getByLabelText(/choose photographs/i),
      fileOf("huge.jpg", "image/jpeg", 11 * 1024 * 1024),
    );

    expect(screen.getByRole("alert")).toHaveTextContent(/larger than 10 MB/i);
    expect(screen.queryAllByRole("img")).toHaveLength(0);
  });

  it("keeps the acceptable files from a mixed selection", async () => {
    // Refusing the whole batch because one file is wrong makes somebody
    // re-pick nine good photographs to get rid of one bad one.
    renderNew();

    await userEvent.upload(screen.getByLabelText(/choose photographs/i), [
      fileOf("good.jpg"),
      fileOf("huge.jpg", "image/jpeg", 11 * 1024 * 1024),
    ]);

    expect(screen.getByRole("alert")).toHaveTextContent(/huge.jpg/);
    expect(screen.getByAltText("good.jpg")).toBeInTheDocument();
    // Exactly one thumbnail: the good file staged, the oversized one dropped.
    expect(screen.getAllByRole("img")).toHaveLength(1);
  });

  it("lets a staged photograph be removed again", async () => {
    renderNew();

    await userEvent.upload(screen.getByLabelText(/choose photographs/i), [fileOf("a.jpg")]);
    expect(screen.getByAltText("a.jpg")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /remove a.jpg/i }));

    expect(screen.queryByAltText("a.jpg")).not.toBeInTheDocument();
    // Its preview is released rather than pinning the file in memory.
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:a.jpg");
  });
});

describe("editing an existing product", () => {
  it("offers no staging picker, because the real gallery is below", async () => {
    render(
      <ProductForm
        product={CREATED}
        categories={CATEGORIES}
        onSaved={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.queryByLabelText(/choose photographs/i)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /save changes/i })).toBeInTheDocument();
  });
});

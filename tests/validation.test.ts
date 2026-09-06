import { describe, expect, it } from "vitest";

import {
  fromApiFieldErrors,
  isValid,
  normalizePhone,
  validateCity,
  validateEmail,
  validateFields,
  validateInteger,
  validateMeaningfulText,
  validatePassword,
  validatePasswordConfirmation,
  validatePersonName,
  validatePostalCode,
  validateStreetAddress,
  validatePhone,
} from "@/lib/validation";

/**
 * These tests are as much about what must be *accepted* as what must be
 * rejected. A rule that rejects a real Nigerian name or a real international
 * number silently costs a sale, and nobody reports it — the customer just
 * leaves. So every rule below is pinned from both sides.
 */

describe("validatePhone", () => {
  it.each([
    ["08039876543", "local mobile"],
    ["07012345678", "070 prefix"],
    ["09112345678", "091 prefix"],
    ["+2348039876543", "international with plus"],
    ["2348039876543", "international without plus"],
    ["+234 803 987 6543", "spaced"],
    ["0803-987-6543", "hyphenated"],
    ["(0803) 987 6543", "parenthesised"],
    ["+233241234567", "Ghanaian — we sell abroad"],
    ["+14155552671", "US"],
  ])("accepts %s (%s)", (input) => {
    expect(validatePhone(input)).toBeUndefined();
  });

  it.each([
    ["", "empty"],
    ["   ", "whitespace"],
    ["aaaaaaaaaa", "letters — the value that booked a real seat"],
    ["0803987654", "one digit short"],
    ["080398765431", "one digit long"],
    ["1234567890", "no country or trunk prefix"],
    ["00000000000", "placeholder zeros"],
    ["11111111111", "placeholder ones"],
    ["+234803987654a", "trailing letter"],
    ["0603987654", "invalid network digit"],
  ])("rejects %s (%s)", (input) => {
    expect(validatePhone(input)).toBeDefined();
  });

  it("normalises punctuation without changing the number", () => {
    expect(normalizePhone("+234 (803) 987-6543")).toBe("+2348039876543");
  });
});

describe("validatePersonName", () => {
  it.each([
    "Chidi Nwosu",
    "O'Brien",
    "Ade-Bello",
    "Chukwuemeka",
    "Ngozi Okonjo-Iweala",
    "Ng",
    "José Álvarez",
  ])("accepts %s", (input) => {
    expect(validatePersonName(input)).toBeUndefined();
  });

  it.each([
    ["", "empty"],
    ["...", "the value that booked a real seat"],
    ["a", "one letter"],
    ["123", "digits"],
    ["!!!!", "symbols"],
    ["User1", "trailing digit"],
  ])("rejects %s (%s)", (input) => {
    expect(validatePersonName(input)).toBeDefined();
  });
});

describe("validateEmail", () => {
  it.each(["ada@example.com", "ada.okoro+farm@kuyashfarms.com.ng", "a@b.co"])(
    "accepts %s",
    (input) => {
      expect(validateEmail(input)).toBeUndefined();
    },
  );

  it.each(["", "ada", "ada@", "@example.com", "ada@example", "ada@example.com,", "a b@c.com"])(
    "rejects %s",
    (input) => {
      expect(validateEmail(input)).toBeDefined();
    },
  );
});

describe("validateStreetAddress", () => {
  it.each([
    "22 Awolowo Road",
    "Plot 5, Off Ring Road", // no house number pattern
    "Behind the central mosque, Ilorin",
  ])("accepts %s", (input) => {
    expect(validateStreetAddress(input)).toBeUndefined();
  });

  it.each([["", "empty"], ["abc", "too short"], ["12345", "digits only"]])(
    "rejects %s (%s)",
    (input) => {
      expect(validateStreetAddress(input)).toBeDefined();
    },
  );
});

describe("validateCity", () => {
  it.each(["Lagos", "Port Harcourt", "Aba"])("accepts %s", (input) => {
    expect(validateCity(input)).toBeUndefined();
  });

  it.each(["", "L", "12345", "!!"])("rejects %s", (input) => {
    expect(validateCity(input)).toBeDefined();
  });
});

describe("validatePostalCode", () => {
  it("accepts blank, because it is optional everywhere", () => {
    expect(validatePostalCode("")).toBeUndefined();
    expect(validatePostalCode("   ")).toBeUndefined();
  });

  it.each(["100001", "SW1A 1AA", "23401"])("accepts %s", (input) => {
    expect(validatePostalCode(input)).toBeUndefined();
  });

  it.each(["!", "!!!!!!", "0123456789012"])("rejects %s", (input) => {
    expect(validatePostalCode(input)).toBeDefined();
  });
});

describe("validatePassword", () => {
  it("accepts a reasonable password", () => {
    expect(validatePassword("AnExampleP4ssword!")).toBeUndefined();
  });

  it.each([
    ["", "empty"],
    ["short1!", "seven characters"],
    ["12345678", "all numeric"],
  ])("rejects %s (%s)", (input) => {
    expect(validatePassword(input)).toBeDefined();
  });

  it("defers the rest to the server", () => {
    // "password" is on Django's common-password list, which is 20,000 entries
    // and not worth shipping to the browser. It must pass here and fail there,
    // which is why the forms still render server field errors after submit.
    expect(validatePassword("password")).toBeUndefined();
  });
});

describe("validatePasswordConfirmation", () => {
  it("accepts a match", () => {
    expect(validatePasswordConfirmation("AnExampleP4ssword!", "AnExampleP4ssword!")).toBeUndefined();
  });

  it("rejects a mismatch and an empty confirmation", () => {
    expect(validatePasswordConfirmation("AnExampleP4ssword!", "other")).toBeDefined();
    expect(validatePasswordConfirmation("AnExampleP4ssword!", "")).toBeDefined();
  });
});

describe("validateInteger", () => {
  it("treats blank as fine unless required", () => {
    expect(validateInteger("")).toBeUndefined();
    expect(validateInteger("", { required: true, field: "Years" })).toBe("Years is required.");
  });

  it("rejects non-integers and enforces bounds", () => {
    expect(validateInteger("abc")).toBeDefined();
    expect(validateInteger("1.5")).toBeDefined();
    expect(validateInteger("-1", { min: 0 })).toBeDefined();
    expect(validateInteger("300", { max: 200 })).toBeDefined();
    expect(validateInteger("5", { min: 0, max: 200 })).toBeUndefined();
  });
});

describe("validateMeaningfulText", () => {
  it("accepts real text and rejects filler", () => {
    expect(validateMeaningfulText("Kuyash Foods Ltd")).toBeUndefined();
    expect(validateMeaningfulText("..", { minimum: 2 })).toBeDefined();
    expect(validateMeaningfulText("ab", { minimum: 3 })).toBeDefined();
  });
});

describe("validateFields", () => {
  it("collects one message per invalid field", () => {
    const errors = validateFields(
      { name: validatePersonName, phone: validatePhone, email: validateEmail },
      { name: "...", phone: "08039876543", email: "nope" },
    );

    expect(Object.keys(errors).sort()).toEqual(["email", "name"]);
    expect(isValid(errors)).toBe(false);
  });

  it("skips a rule left undefined, so callers can build rules conditionally", () => {
    // A signed-in customer supplies no email at checkout; a guest must.
    const errors = validateFields({ email: undefined }, { email: "" });
    expect(isValid(errors)).toBe(true);
  });

  it("treats a missing value as empty rather than throwing", () => {
    expect(validateFields({ name: validatePersonName }, {})).toEqual({
      name: "Enter a name.",
    });
  });
});

describe("fromApiFieldErrors", () => {
  it("folds the API's arrays into one message per field", () => {
    expect(fromApiFieldErrors({ email: ["Already in use.", "…"], phone: [] })).toEqual({
      email: "Already in use.",
    });
  });
});

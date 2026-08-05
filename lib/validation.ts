/**
 * Client-side field rules.
 *
 * Every form in this app used to submit whatever was typed and rely on the
 * server to object. That was doubly broken: the server did not object either
 * (`CharField(max_length=30)` accepted `phone="aaaaaaaaaa"` and held a real
 * class seat for it), and even once it does, a round-trip is a poor way to
 * learn that a phone number is malformed. The user has already pressed the
 * button, waited, and been bounced.
 *
 * These rules mirror `core/validators.py` on the server, message for message,
 * so a customer is never told two different things about the same field.
 *
 * **This module is a convenience, not a control.** It runs in a browser the
 * caller owns; anyone can delete it and POST directly. The server rules are
 * what actually protect the data — these exist so the honest 99% get told
 * immediately, in place, before submitting.
 *
 * Design notes:
 *
 * - A validator returns `undefined` when the value is fine, or the message to
 *   show. That maps straight onto `FormField`'s `error` prop with no adapter.
 * - Rules are lenient by intent. A false rejection is worse than a false
 *   accept: the customer cannot buy, cannot tell why, and leaves. So the phone
 *   rule takes any international number, and the name rule allows apostrophes,
 *   hyphens and non-ASCII letters — O'Brien, Ade-Bello and Chukwuemeka are all
 *   ordinary names here.
 */

/** `undefined` means valid. Any string is the message to show the user. */
export type ValidationResult = string | undefined;
export type Validator = (value: string) => ValidationResult;

// ─────────────────────────────────────────────────────────────────────────────
// Phone
// ─────────────────────────────────────────────────────────────────────────────

const PHONE_SEPARATORS = /[\s\-().]/g;

/** Nigerian mobile written locally: 0, a 7/8/9 network digit, then 9 more — 11 total. */
const NG_LOCAL = /^0[789][01]\d{8}$/;
/** The same number in international form (234 + 10 digits), with or without the plus. */
const NG_INTERNATIONAL = /^\+?234[789][01]\d{8}$/;
/** Anything else, strict E.164. Permissive on purpose — we sell abroad too. */
const E164 = /^\+[1-9]\d{7,14}$/;

export const PHONE_HELP =
  "Enter a Nigerian mobile number like 08039876543 or +2348039876543, " +
  "or an international number starting with +.";

/** Strip the punctuation people type, so "+234 803 987 6543" is one number. */
export function normalizePhone(value: string): string {
  return (value ?? "").replace(PHONE_SEPARATORS, "").trim();
}

export function validatePhone(value: string): ValidationResult {
  const cleaned = normalizePhone(value);

  if (!cleaned) return "Enter a phone number.";
  if (/[a-z]/i.test(cleaned)) return "A phone number cannot contain letters.";
  if (!NG_LOCAL.test(cleaned) && !NG_INTERNATIONAL.test(cleaned) && !E164.test(cleaned)) {
    return PHONE_HELP;
  }

  // "00000000000" passes every rule above and reaches nobody. It is what
  // someone types to get past a required field.
  const digits = cleaned.replace(/^\+/, "");
  if (new Set(digits).size === 1) return "That does not look like a real phone number.";

  return undefined;
}

// ─────────────────────────────────────────────────────────────────────────────
// Names and text
// ─────────────────────────────────────────────────────────────────────────────

/** Letters in any script, plus the punctuation real names contain. */
const NAME_ALLOWED = /^[^\W\d_][^\d_]*$/u;

function letterCount(value: string): number {
  return (value.match(/\p{L}/gu) ?? []).length;
}

export function validatePersonName(value: string): ValidationResult {
  const cleaned = (value ?? "").trim();

  if (!cleaned) return "Enter a name.";
  // Two letters is the floor: Ng, Bo and Vy are real names, and rejecting
  // them to catch "..." would be the wrong trade.
  if (letterCount(cleaned) < 2) return "Enter a name using letters.";
  if (!NAME_ALLOWED.test(cleaned)) return "A name cannot contain digits or symbols.";

  return undefined;
}

export function validateCity(value: string): ValidationResult {
  const cleaned = (value ?? "").trim();

  if (letterCount(cleaned) < 2) return "Enter a city or town.";
  if (!NAME_ALLOWED.test(cleaned)) return "A city name cannot contain digits or symbols.";

  return undefined;
}

/**
 * For business names, occupations and similar — no format worth enforcing, so
 * the only real failure is an empty-but-non-blank value.
 */
export function validateMeaningfulText(
  value: string,
  { minimum = 3, field = "This field" }: { minimum?: number; field?: string } = {},
): ValidationResult {
  const cleaned = (value ?? "").trim();

  if (cleaned.length < minimum) return `${field} must be at least ${minimum} characters.`;
  if (letterCount(cleaned) < 2) return `${field} must contain letters.`;

  return undefined;
}

// ─────────────────────────────────────────────────────────────────────────────
// Address
// ─────────────────────────────────────────────────────────────────────────────

const POSTAL = /^[A-Za-z0-9][A-Za-z0-9 -]{1,9}$/;

/** Optional everywhere — only checked when something was actually typed. */
export function validatePostalCode(value: string): ValidationResult {
  const cleaned = (value ?? "").trim();
  if (!cleaned) return undefined;

  return POSTAL.test(cleaned) ? undefined : "Enter a valid postal code, or leave it blank.";
}

/**
 * Somewhere a courier could be sent.
 *
 * Deliberately not a format check. Nigerian addresses are written every way
 * imaginable and plenty have no house number ("Plot 5, Off Awolowo Road", or a
 * village description). The only thing worth asserting is that words were
 * typed rather than the keyboard mashed.
 */
export function validateStreetAddress(value: string): ValidationResult {
  const cleaned = (value ?? "").trim();

  if (cleaned.length < 5 || letterCount(cleaned) < 3) return "Enter the full street address.";

  return undefined;
}

// ─────────────────────────────────────────────────────────────────────────────
// Email
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Deliberately not RFC 5322.
 *
 * The full grammar admits addresses no mail provider accepts, and every
 * "complete" regex for it is both unreadable and still wrong. What actually
 * matters is catching the typo — a missing @, a trailing comma, `.con` — and
 * letting the verification email settle the rest. An address that passes this
 * and does not exist simply never gets verified.
 */
const EMAIL = /^[^\s@,;]+@[^\s@,;]+\.[A-Za-z]{2,}$/;

export function validateEmail(value: string): ValidationResult {
  const cleaned = (value ?? "").trim();

  if (!cleaned) return "Enter an email address.";
  if (!EMAIL.test(cleaned)) return "Enter a valid email address.";

  return undefined;
}

// ─────────────────────────────────────────────────────────────────────────────
// Passwords
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Mirrors Django's `AUTH_PASSWORD_VALIDATORS` for this project: minimum eight
 * characters, and not entirely numeric.
 *
 * The server also runs `CommonPasswordValidator` against a 20,000-entry list
 * and `UserAttributeSimilarityValidator`, neither of which is reproducible in
 * the browser. So this catches the two cheap cases up front and lets the
 * server have the last word — which is why the forms still render the server's
 * field errors after submitting.
 */
export function validatePassword(value: string): ValidationResult {
  if (!value) return "Enter a password.";
  if (value.length < 8) return "Use at least 8 characters.";
  if (/^\d+$/.test(value)) return "A password cannot be only numbers.";

  return undefined;
}

export function validatePasswordConfirmation(
  password: string,
  confirmation: string,
): ValidationResult {
  if (!confirmation) return "Re-enter the password.";
  if (password !== confirmation) return "The passwords do not match.";

  return undefined;
}

// ─────────────────────────────────────────────────────────────────────────────
// Numbers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A whole number within bounds.
 *
 * Takes the raw string rather than a number because that is what an
 * `<input type="number">` gives you: it yields "" for "abc", so a component
 * reading `.value` cannot tell "empty" from "nonsense" once it has been cast.
 */
export function validateInteger(
  value: string,
  {
    min,
    max,
    field = "This field",
    required = false,
  }: { min?: number; max?: number; field?: string; required?: boolean } = {},
): ValidationResult {
  const cleaned = (value ?? "").trim();

  if (!cleaned) return required ? `${field} is required.` : undefined;
  if (!/^-?\d+$/.test(cleaned)) return `${field} must be a whole number.`;

  const parsed = Number(cleaned);
  if (min !== undefined && parsed < min) return `${field} cannot be less than ${min}.`;
  if (max !== undefined && parsed > max) return `${field} cannot be more than ${max}.`;

  return undefined;
}

// ─────────────────────────────────────────────────────────────────────────────
// Running a whole form
// ─────────────────────────────────────────────────────────────────────────────

/** One message per invalid field, keyed the way the API keys its own errors. */
export type FieldErrors = Record<string, string>;

/**
 * Run a set of rules over a set of values.
 *
 * Keyed by field name so the result drops straight into the same state the
 * forms already use for server-returned errors — the two sources render
 * through one code path instead of two competing ones.
 *
 * Fields whose rule is `undefined` are skipped, which lets a caller build the
 * rule set conditionally (a guest must give an email; a signed-in customer
 * already has one) without assembling the object in two places.
 */
export function validateFields(
  rules: Record<string, Validator | undefined>,
  values: Record<string, string>,
): FieldErrors {
  const errors: FieldErrors = {};

  for (const [field, rule] of Object.entries(rules)) {
    if (!rule) continue;
    const message = rule(values[field] ?? "");
    if (message) errors[field] = message;
  }

  return errors;
}

/** True when `validateFields` found nothing. Reads better at a call site. */
export function isValid(errors: FieldErrors): boolean {
  return Object.keys(errors).length === 0;
}

/**
 * Fold the API's `{field: [message, ...]}` into this module's `{field: message}`.
 *
 * Both kinds of error then live in one piece of state, so a server error is
 * not silently outlived by a stale client error on the same field.
 */
export function fromApiFieldErrors(fieldErrors: Record<string, string[]>): FieldErrors {
  const errors: FieldErrors = {};

  for (const [field, messages] of Object.entries(fieldErrors)) {
    const first = messages[0];
    if (first) errors[field] = first;
  }

  return errors;
}

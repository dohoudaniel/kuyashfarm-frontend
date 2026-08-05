/**
 * Academy: programmes, classes and seat bookings.
 *
 * This replaces the prototype's entire academy plane, which wrote registrations
 * to the visitor's own `localStorage` (audit §3.6). Nobody at the farm ever saw
 * them, seat counts were hardcoded constants that never moved, and clearing
 * your browser cancelled your booking without telling anyone.
 *
 * Seat availability is now computed from real bookings and enforced under a row
 * lock server-side, so the last seat can only be sold once.
 */

import { apiClient, fetchPublic } from "./client";

export type RegistrationStatus =
  | "PENDING_PAYMENT"
  | "CONFIRMED"
  | "ATTENDED"
  | "CANCELLED"
  | "NO_SHOW";

export interface Program {
  id: string;
  title: string;
  slug: string;
  description: string;
  duration: string;
  level: string;
  price: string;
}

export interface AcademyClass {
  id: string;
  title: string;
  slug: string;
  description: string;
  instructor_name: string;
  program_title: string;
  scheduled_date: string;
  duration: string;
  location: string;
  format: string;
  level: string;
  price: string;
  total_seats: number;
  image: string;
  /** Derived from real bookings — never a constant. */
  seats_left: number;
  is_full: boolean;
  is_open_for_registration: boolean;
}

export interface Instructor {
  id: string;
  name: string;
  title: string;
  bio: string;
  photo: string | null;
  specialties: string[];
}

export interface AcademyClassDetail extends AcademyClass {
  long_description: string;
  instructor: Instructor | null;
  /** Syllabus points and what the fee covers. Editable in the admin. */
  topics: string[];
  includes: string[];
}

export interface Registration {
  id: string;
  reference: string;
  class_title: string;
  class_slug: string;
  scheduled_date: string;
  price: string;
  full_name: string;
  email: string;
  phone: string;
  occupation: string;
  farming_experience: string;
  status: RegistrationStatus;
  registered_at: string;
}

export interface RegistrationInput {
  full_name: string;
  /** Optional only when signed in; the API falls back to the account email. */
  email?: string;
  phone: string;
  occupation?: string;
  farming_experience?: string;
}

// ── Public reads (safe from Server Components) ───────────────────────────────
/** Unpaginated by design: `pagination_class = None` server-side. */
export function fetchProgramsPublic(): Promise<Program[]> {
  return fetchPublic<Program[]>("/academy/programs/", { offlineFallback: [] });
}

export function fetchClassesPublic(params?: {
  program?: string;
  level?: string;
  format?: string;
}): Promise<AcademyClass[]> {
  const query = new URLSearchParams(
    Object.entries(params ?? {}).filter(([, value]) => Boolean(value)) as [string, string][],
  ).toString();
  return fetchPublic<AcademyClass[]>(`/academy/classes/${query ? `?${query}` : ""}`, {
    offlineFallback: [],
  });
}

export function fetchClassPublic(slug: string): Promise<AcademyClassDetail> {
  return fetchPublic<AcademyClassDetail>(`/academy/classes/${slug}/`);
}

// ── Client-side ──────────────────────────────────────────────────────────────
export function listClasses(): Promise<AcademyClass[]> {
  return apiClient.get<AcademyClass[]>("/academy/classes/");
}

export function getClass(slug: string): Promise<AcademyClassDetail> {
  return apiClient.get<AcademyClassDetail>(`/academy/classes/${slug}/`);
}

/** Book a seat. Guests may register; they just have to give an email. */
export function registerForClass(
  slug: string,
  input: RegistrationInput,
): Promise<Registration> {
  return apiClient.post<Registration>(`/academy/classes/${slug}/register/`, { ...input });
}

export function myRegistrations(): Promise<Registration[]> {
  return apiClient.get<Registration[]>("/academy/registrations/mine/");
}

/**
 * Look up one booking by its reference.
 *
 * References are guessable enough that the API will not hand a booking to an
 * anonymous caller unless they also supply the email it was made with.
 */
export function getRegistration(reference: string, email?: string): Promise<Registration> {
  const query = email ? `?email=${encodeURIComponent(email)}` : "";
  return apiClient.get<Registration>(`/academy/registrations/${reference}/${query}`);
}

export function cancelRegistration(reference: string): Promise<Registration> {
  return apiClient.post<Registration>(`/academy/registrations/${reference}/cancel/`);
}

/**
 * Pay for a held seat online (PRD §13 Q6).
 *
 * The booking already exists and already holds the seat — this only settles
 * it. Guests must pass the email the booking was made with: references appear
 * in a forwardable email, so one alone identifies a booking without proving it
 * is yours.
 *
 * The booking is confirmed by Paystack's signed webhook, not by the customer
 * coming back through a URL. Poll `verifyClassPayment` on the return page: the
 * redirect usually beats the webhook, and telling somebody their payment
 * failed when it succeeded is the worst outcome available.
 */
export function payForRegistration(
  reference: string,
  email?: string,
): Promise<{ authorization_url: string; reference: string; amount: string }> {
  const suffix = email ? `?email=${encodeURIComponent(email)}` : "";
  return apiClient.post(`/academy/registrations/${reference}/pay/${suffix}`);
}

export function verifyClassPayment(paymentReference: string): Promise<unknown> {
  return apiClient.get(`/academy/payments/${paymentReference}/verify/`);
}

export interface Instructor {
  id: string;
  name: string;
  title: string;
  bio: string;
  photo: string | null;
  specialties: string[];
}

/**
 * The teaching staff, for the academy page.
 *
 * Unpaginated — a bare array, not `{results, count}`. It is a handful of
 * people rendered as a row of cards; typing it as paginated would crash on
 * `.map`, which is the specific mistake seven other endpoints in this API
 * invite.
 *
 * The page used to render a hardcoded array, so an instructor added in the
 * back office appeared nowhere and the two slowly diverged.
 */
export function fetchInstructorsPublic(): Promise<Instructor[]> {
  // `offlineFallback` so an unreachable API at build time renders the section
  // empty rather than failing the whole page — the same treatment the other
  // academy reads get.
  return fetchPublic<Instructor[]>("/academy/instructors/", { offlineFallback: [] });
}

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
  return fetchPublic<Program[]>("/academy/programs/");
}

export function fetchClassesPublic(params?: {
  program?: string;
  level?: string;
  format?: string;
}): Promise<AcademyClass[]> {
  const query = new URLSearchParams(
    Object.entries(params ?? {}).filter(([, value]) => Boolean(value)) as [string, string][],
  ).toString();
  return fetchPublic<AcademyClass[]>(`/academy/classes/${query ? `?${query}` : ""}`);
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

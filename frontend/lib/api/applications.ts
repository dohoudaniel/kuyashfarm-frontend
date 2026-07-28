/**
 * Wholesale and distributor applications.
 *
 * The prototype collected CAC numbers, tax IDs and **bank account numbers**
 * into `localStorage` (audit §3.5), then wrote the approval decision into the
 * *reviewer's* browser — so an approval never reached the applicant, on any
 * device. Those pages were removed rather than left collecting bank details
 * into a browser; this is the rebuild against the real API.
 *
 * Two things worth knowing about the new shape:
 *
 *  * There are no bank fields here. Bank details are a payout concern, not an
 *    application concern, and they live behind `/auth/bank-details/` with
 *    application-level encryption. Asking for them up front was collecting
 *    sensitive data with no use for it yet.
 *  * Documents upload separately, after the application exists, so a failed
 *    file upload never loses a filled-in form.
 */

import { apiClient } from "./client";

export type ApplicationType = "WHOLESALE" | "DISTRIBUTOR";

export type ApplicationStatus =
  | "PENDING"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "WITHDRAWN";

export type DocumentType = "CAC_CERTIFICATE" | "TAX_CLEARANCE" | "UTILITY_BILL" | "OTHER";

export interface State {
  id: string;
  name: string;
  code: string;
  zone: string;
}

export interface Tier {
  code: string;
  name: string;
  description: string;
  min_states: number;
  max_states: number | null;
}

export interface ApplicationDocument {
  id: string;
  document_type: DocumentType;
  original_filename: string;
  uploaded_at: string;
}

export interface Application {
  id: string;
  application_type: ApplicationType;
  status: ApplicationStatus;
  business_name: string;
  business_address: string;
  years_in_business: number | null;
  states: State[];
  specialty_areas: string[];
  monthly_volume_capacity: string;
  retail_network_size: number | null;
  warehouse_info: string;
  contact_person: string;
  contact_email: string;
  contact_phone: string;
  trade_references: string;
  /**
   * Assigned by the server from the states covered — never chosen by the
   * applicant. Serialised as a nested object, not a code string; rendering it
   * straight into JSX throws.
   */
  computed_tier: Tier | null;
  documents: ApplicationDocument[];
  applicant_email: string;
  submitted_at: string;
  reviewed_at: string | null;
}

export interface SubmitApplicationInput {
  application_type: ApplicationType;
  business_name: string;
  business_address: string;
  cac_number?: string;
  tax_id?: string;
  years_in_business?: number | null;
  state_ids?: string[];
  specialty_areas?: string[];
  monthly_volume_capacity?: string;
  retail_network_size?: number | null;
  warehouse_info?: string;
  contact_person: string;
  contact_email: string;
  contact_phone: string;
  trade_references?: string;
}

export function listStates(): Promise<State[]> {
  return apiClient.get<State[]>("/states/");
}

export function listTiers(): Promise<Tier[]> {
  return apiClient.get<Tier[]>("/tiers/");
}

/** Requires a signed-in account — the approval has to land on a real user row. */
export function submitApplication(input: SubmitApplicationInput): Promise<Application> {
  return apiClient.post<Application>("/applications/", { ...input });
}

export function myApplications(): Promise<Application[]> {
  return apiClient.get<Application[]>("/applications/mine/");
}

/**
 * Attach a supporting document.
 *
 * Sent as multipart, so the client must not force a JSON content type — the
 * browser needs to set its own multipart boundary.
 */
export function uploadDocument(
  applicationId: string,
  documentType: DocumentType,
  file: File,
): Promise<ApplicationDocument> {
  const body = new FormData();
  body.append("document_type", documentType);
  body.append("file", file);
  return apiClient.postForm<ApplicationDocument>(
    `/applications/${applicationId}/documents/`,
    body,
  );
}

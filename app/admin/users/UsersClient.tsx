"use client";

/**
 * The user directory.
 *
 * There was no way to see this at all: the back office could review
 * applications and fulfil orders, but "how many verified wholesalers are
 * there" or "which account is this order from" meant a database shell.
 *
 * **Read-only, and the omission is deliberate.** There is no control here to
 * change a role or an account type, because neither belongs to this screen:
 *
 *  * `role` is granted by invitation, and only an administrator can issue one.
 *    That flow exists so back-office privilege has a single audited door with
 *    an email round-trip proving the recipient controls the address. A
 *    dropdown here would be a second door that skips the proof.
 *  * `account_type` is computed on approval, from the states an application
 *    covers. Set by hand it would produce a verified distributor with no
 *    application, no tier and no record of who decided — and the pricing
 *    engine would honour it, having no way to tell.
 *
 * Both are real operations. Both belong on the screens where their evidence
 * lives, and this page links to them.
 */

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { BadgeCheck, RefreshCw, ShieldAlert, X } from "lucide-react";

import { ApiError } from "@/lib/api/client";
import {
  getStaffUser,
  getUserSummary,
  listStaffUsers,
  type StaffUser,
  type StaffUserDetail,
  type UserSummary,
} from "@/lib/api/admin";
import { DataScreen, ScrollableTable, StatusPill } from "@/components/admin/DataScreen";
import { Avatar } from "@/components/account/Avatar";
import { cn, formatPrice } from "@/lib/utils";

/**
 * What each account type is called, and what it means.
 *
 * The enum value is a database fact; this is the product. "WHOLESALE_PENDING"
 * in a table cell tells a member of staff nothing about whether that person
 * gets a discount today — which is the only thing the column is for.
 */
const ACCOUNT_TYPE: Record<string, { label: string; tone: string }> = {
  RETAIL: { label: "Retail", tone: "bg-gray-100 text-gray-700" },
  WHOLESALE_PENDING: { label: "Wholesale · pending", tone: "bg-amber-100 text-amber-800" },
  WHOLESALE_VERIFIED: { label: "Wholesale", tone: "bg-green-100 text-green-800" },
  DISTRIBUTOR_PENDING: { label: "Distributor · pending", tone: "bg-amber-100 text-amber-800" },
  DISTRIBUTOR_VERIFIED: { label: "Distributor", tone: "bg-green-100 text-green-800" },
};

const ROLE: Record<string, { label: string; tone: string }> = {
  CUSTOMER: { label: "Customer", tone: "bg-gray-100 text-gray-700" },
  STAFF: { label: "Staff", tone: "bg-blue-100 text-blue-800" },
  ADMIN: { label: "Administrator", tone: "bg-primary/15 text-primary" },
};

function Chip({ map, value }: { map: typeof ROLE; value: string }) {
  const entry = map[value] ?? { label: value, tone: "bg-gray-100 text-gray-700" };
  return (
    <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", entry.tone)}>
      {entry.label}
    </span>
  );
}

export default function UsersClient() {
  // The analytics page links here with `?search=<email>` from Top customers.
  const initialSearch = useSearchParams().get("search") ?? "";

  const [rows, setRows] = useState<StaffUser[]>([]);
  const [count, setCount] = useState(0);
  const [summary, setSummary] = useState<UserSummary | null>(null);
  const [selected, setSelected] = useState<StaffUserDetail | null>(null);

  const [search, setSearch] = useState(initialSearch);
  const [role, setRole] = useState("");
  const [accountType, setAccountType] = useState("");
  const [verified, setVerified] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const page = await listStaffUsers({
        search: search.trim() || undefined,
        role: role || undefined,
        account_type: accountType || undefined,
        // `""` means "no filter"; `"false"` means "show me the unverified".
        // Passing a boolean rather than the string keeps the query readable.
        is_email_verified: verified === "" ? undefined : verified === "true",
      });
      setRows(page.results);
      setCount(page.count);
      setError("");
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Could not load users.");
    } finally {
      setLoading(false);
    }
  }, [search, role, accountType, verified]);

  useEffect(() => {
    // Debounced: this fires on every keystroke in the search box otherwise.
    const timer = setTimeout(() => void load(), 300);
    return () => clearTimeout(timer);
  }, [load]);

  useEffect(() => {
    getUserSummary().then(setSummary, () => setSummary(null));
  }, []);

  async function open(user: StaffUser) {
    try {
      setSelected(await getStaffUser(user.id));
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Could not open that account.");
    }
  }

  return (
    <DataScreen
      title="Users"
      description="Everyone with an account. Read-only — see below on why."
      loading={loading}
      error={error}
      empty={rows.length === 0}
      emptyMessage="No accounts match that."
      toolbar={
        <>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Name, email or phone"
            aria-label="Search users"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-green-500"
          />
          <select
            value={role}
            onChange={(event) => setRole(event.target.value)}
            aria-label="Filter by role"
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
          >
            <option value="">Any role</option>
            <option value="CUSTOMER">Customer</option>
            <option value="STAFF">Staff</option>
            <option value="ADMIN">Administrator</option>
          </select>
          <select
            value={accountType}
            onChange={(event) => setAccountType(event.target.value)}
            aria-label="Filter by account type"
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
          >
            <option value="">Any account type</option>
            <option value="RETAIL">Retail</option>
            <option value="WHOLESALE_PENDING">Wholesale · pending</option>
            <option value="WHOLESALE_VERIFIED">Wholesale · verified</option>
            <option value="DISTRIBUTOR_PENDING">Distributor · pending</option>
            <option value="DISTRIBUTOR_VERIFIED">Distributor · verified</option>
          </select>
          <select
            value={verified}
            onChange={(event) => setVerified(event.target.value)}
            aria-label="Filter by verification"
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
          >
            <option value="">Verified or not</option>
            <option value="true">Verified</option>
            <option value="false">Not verified</option>
          </select>
          <button
            type="button"
            onClick={() => void load()}
            className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </>
      }
    >
      {/* Counts from one server-side query rather than one per chip. */}
      {summary && (
        <div className="mb-4 flex flex-wrap gap-2 text-xs">
          <Count label="All" value={summary.total} active={!role && !accountType} onClick={() => { setRole(""); setAccountType(""); }} />
          <Count label="Customers" value={summary.role_customer} active={role === "CUSTOMER"} onClick={() => { setRole("CUSTOMER"); setAccountType(""); }} />
          <Count label="Staff" value={summary.role_staff} active={role === "STAFF"} onClick={() => { setRole("STAFF"); setAccountType(""); }} />
          <Count label="Administrators" value={summary.role_admin} active={role === "ADMIN"} onClick={() => { setRole("ADMIN"); setAccountType(""); }} />
          <span className="w-px bg-gray-200" aria-hidden />
          <Count label="Retail" value={summary.type_retail} active={accountType === "RETAIL"} onClick={() => { setAccountType("RETAIL"); setRole(""); }} />
          <Count label="Wholesale" value={summary.type_wholesale_verified} active={accountType === "WHOLESALE_VERIFIED"} onClick={() => { setAccountType("WHOLESALE_VERIFIED"); setRole(""); }} />
          <Count label="Distributor" value={summary.type_distributor_verified} active={accountType === "DISTRIBUTOR_VERIFIED"} onClick={() => { setAccountType("DISTRIBUTOR_VERIFIED"); setRole(""); }} />
        </div>
      )}

      <ScrollableTable>
        <thead className="border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-500">
          <tr>
            <th className="px-4 py-3">Person</th>
            <th className="px-4 py-3">Role</th>
            <th className="px-4 py-3">Account type</th>
            <th className="px-4 py-3">Orders</th>
            <th className="px-4 py-3">Spent</th>
            <th className="px-4 py-3">Joined</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((user) => (
            <tr
              key={user.id}
              onClick={() => void open(user)}
              className="cursor-pointer hover:bg-gray-50"
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <Avatar src={user.avatar} name={user.full_name} email={user.email} size={32} />
                  <div className="min-w-0">
                    <p className="truncate font-medium text-gray-900">
                      {user.full_name || "—"}
                      {!user.is_active && (
                        <span className="ml-2 rounded-full bg-gray-200 px-2 py-0.5 text-[11px] text-gray-700">
                          deactivated
                        </span>
                      )}
                    </p>
                    <p className="flex items-center gap-1 truncate text-xs text-gray-500">
                      {user.email}
                      {user.is_email_verified ? (
                        <BadgeCheck className="h-3 w-3 shrink-0 text-green-600" aria-label="Verified" />
                      ) : (
                        <ShieldAlert className="h-3 w-3 shrink-0 text-amber-600" aria-label="Not verified" />
                      )}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3"><Chip map={ROLE} value={user.role} /></td>
              <td className="px-4 py-3"><Chip map={ACCOUNT_TYPE} value={user.account_type} /></td>
              <td className="px-4 py-3 text-gray-600">{user.order_count}</td>
              {/* Money is a decimal string from the API and is never turned
                  into a Number — formatPrice takes the string as it came. */}
              <td className="px-4 py-3">{formatPrice(user.total_spent)}</td>
              <td className="px-4 py-3 text-xs text-gray-500">
                {new Date(user.date_joined).toLocaleDateString("en-NG", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </ScrollableTable>

      <p className="mt-3 text-xs text-gray-500">
        {rows.length} of {count} shown.
      </p>

      {selected && <Detail user={selected} onClose={() => setSelected(null)} />}
    </DataScreen>
  );
}

function Count({
  label,
  value,
  active,
  onClick,
}: {
  label: string;
  value: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 font-medium transition-colors duration-200",
        active
          ? "border-primary bg-primary text-white"
          : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50",
      )}
    >
      {label} <span className={active ? "text-white/70" : "text-gray-400"}>{value}</span>
    </button>
  );
}

/**
 * One account, with what is attached to it.
 *
 * A dialog rather than a route: this is a lookup during another task — reading
 * an order, reviewing an application — and navigating away loses the filters
 * that got you here.
 */
function Detail({ user, onClose }: { user: StaffUserDetail; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="user-detail-title"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <Avatar src={user.avatar} name={user.full_name} email={user.email} size={48} />
            <div className="min-w-0">
              <h2 id="user-detail-title" className="truncate font-serif text-lg font-bold text-ink">
                {user.full_name || user.email}
              </h2>
              <p className="truncate text-sm text-gray-600">{user.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-5 flex flex-wrap gap-2">
          <Chip map={ROLE} value={user.role} />
          <Chip map={ACCOUNT_TYPE} value={user.account_type} />
          {!user.is_email_verified && (
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
              Email not verified
            </span>
          )}
        </div>

        <dl className="grid grid-cols-2 gap-3 rounded-xl bg-mist/40 p-4 text-sm">
          <div>
            <dt className="text-xs text-gray-500">Phone</dt>
            <dd className="text-ink">{user.phone || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Joined</dt>
            <dd className="text-ink">
              {new Date(user.date_joined).toLocaleDateString("en-NG", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Paid orders</dt>
            <dd className="text-ink">{user.order_count}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Total spent</dt>
            <dd className="text-ink">{formatPrice(user.total_spent)}</dd>
          </div>
        </dl>

        <Section title="Applications" href="/admin/applications">
          {user.applications.length === 0 ? (
            <Empty>No applications.</Empty>
          ) : (
            user.applications.map((application) => (
              <Row
                key={application.id}
                title={application.business_name}
                subtitle={application.application_type === "DISTRIBUTOR" ? "Distributor" : "Wholesale"}
                status={application.status}
              />
            ))
          )}
        </Section>

        <Section title="Academy bookings" href="/admin/academy">
          {user.academy_registrations.length === 0 ? (
            <Empty>No bookings.</Empty>
          ) : (
            user.academy_registrations.map((registration) => (
              <Row
                key={registration.id}
                title={registration.reference}
                subtitle={new Date(registration.registered_at).toLocaleDateString("en-NG")}
                status={registration.status}
              />
            ))
          )}
        </Section>

        {/* Said out loud rather than left as an absence. Somebody looking for
            a "make this account wholesale" button should find out here why
            there isn't one, not conclude the screen is unfinished. */}
        <p className="mt-5 rounded-xl border border-dashed border-edge bg-mist/30 p-3 text-xs leading-relaxed text-gray-600">
          Roles are granted by <Link href="/admin/staff" className="font-semibold text-primary hover:underline">invitation</Link>,
          and account types are set when an{" "}
          <Link href="/admin/applications" className="font-semibold text-primary hover:underline">application</Link>{" "}
          is approved — so that each change keeps the evidence behind it. Neither can be
          changed from here.
        </p>
      </div>
    </div>
  );
}

function Section({
  title,
  href,
  children,
}: {
  title: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-5">
      <div className="mb-2 flex items-baseline justify-between">
        <h3 className="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-500">{title}</h3>
        <Link href={href} className="text-xs font-semibold text-primary hover:underline">
          Open →
        </Link>
      </div>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function Row({ title, subtitle, status }: { title: string; subtitle: string; status: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-edge/50 px-3 py-2 text-sm">
      <div className="min-w-0">
        <p className="truncate font-medium text-ink">{title}</p>
        <p className="truncate text-xs text-gray-500">{subtitle}</p>
      </div>
      <StatusPill status={status} />
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="rounded-lg border border-dashed border-edge px-3 py-4 text-center text-xs text-gray-500">{children}</p>;
}

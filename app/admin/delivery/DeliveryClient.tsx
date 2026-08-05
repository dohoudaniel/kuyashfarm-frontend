"use client";

/**
 * Dispatch: planning runs, loading vans, setting routes.
 *
 * The van is the unit of work, not the order. Everything here is arranged
 * around one question — what is going out today, in what order, with whom —
 * because that is the question being asked when a customer rings.
 *
 * Route order is set explicitly with the up/down controls rather than left to
 * the order things were added. A list that sorts itself by creation time is a
 * van doing an extra forty kilometres, and nobody notices because all the
 * deliveries still happen.
 */

import { useCallback, useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Plus, RefreshCw, Truck } from "lucide-react";

import { ApiError } from "@/lib/api/client";
import {
  addStop,
  createDriver,
  listDrivers,
  listRuns,
  planRun,
  reorderStops,
  startRun,
  type DeliveryRun,
  type Driver,
} from "@/lib/api/admin";
import { DataScreen, StatusPill } from "@/components/admin/DataScreen";
import { validatePersonName, validatePhone } from "@/lib/validation";

export default function DeliveryClient() {
  const [runs, setRuns] = useState<DeliveryRun[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [newRun, setNewRun] = useState({ driver: "", scheduled_for: today() });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [fetchedRuns, fetchedDrivers] = await Promise.all([listRuns(), listDrivers()]);
      setRuns(fetchedRuns);
      setDrivers(fetchedDrivers);
      setError("");
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Could not load the delivery board.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function run<T>(action: () => Promise<T>, success: string) {
    setMessage("");
    try {
      await action();
      setMessage(success);
      void load();
    } catch (caught) {
      // The server owns every rule here — not packed yet, already on a run,
      // nothing loaded — so its refusal is the explanation worth showing.
      setError(caught instanceof ApiError ? caught.message : "That did not work.");
    }
  }

  async function onAddDriver() {
    const name = prompt("Driver's full name:");
    if (!name) return;
    const nameProblem = validatePersonName(name);
    if (nameProblem) {
      setError(nameProblem);
      return;
    }

    const phone = prompt("Phone number:");
    if (!phone) return;
    const phoneProblem = validatePhone(phone);
    if (phoneProblem) {
      setError(phoneProblem);
      return;
    }

    const registration = prompt("Vehicle registration (optional):") ?? "";
    await run(
      () => createDriver({ full_name: name, phone, vehicle_registration: registration }),
      `${name} added to the fleet.`,
    );
  }

  /** Move one stop up or down, and send the whole order back. */
  async function move(target: DeliveryRun, index: number, direction: -1 | 1) {
    const ordered = [...target.stops].sort((a, b) => a.sequence - b.sequence);
    const swapWith = index + direction;
    if (swapWith < 0 || swapWith >= ordered.length) return;

    [ordered[index], ordered[swapWith]] = [ordered[swapWith]!, ordered[index]!];
    await run(
      () => reorderStops(target.id, ordered.map((stop) => stop.id)),
      "Route updated.",
    );
  }

  return (
    <DataScreen
      title="Delivery"
      description="One van, one day, several stops. The route order is the driving order."
      loading={loading}
      error={error}
      message={message}
      toolbar={
        <>
          <button
            type="button"
            onClick={onAddDriver}
            className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
          >
            <Plus className="h-4 w-4" /> Add driver
          </button>
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
      <div className="space-y-6">
        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="mb-3 font-semibold text-gray-900">Plan a run</h2>

          {drivers.length === 0 ? (
            <p className="text-sm text-gray-600">
              No drivers yet. Add one before planning a run.
            </p>
          ) : (
            <div className="flex flex-wrap items-end gap-3">
              <div>
                <label htmlFor="run-driver" className="mb-1 block text-sm font-medium text-gray-700">
                  Driver
                </label>
                <select
                  id="run-driver"
                  value={newRun.driver}
                  onChange={(event) => setNewRun({ ...newRun, driver: event.target.value })}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                >
                  <option value="">Choose a driver</option>
                  {drivers
                    .filter((driver) => driver.is_active)
                    .map((driver) => (
                      <option key={driver.id} value={driver.id}>
                        {driver.full_name}
                        {driver.vehicle_registration ? ` — ${driver.vehicle_registration}` : ""}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label htmlFor="run-date" className="mb-1 block text-sm font-medium text-gray-700">
                  Date
                </label>
                <input
                  id="run-date"
                  type="date"
                  value={newRun.scheduled_for}
                  onChange={(event) =>
                    setNewRun({ ...newRun, scheduled_for: event.target.value })
                  }
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <button
                type="button"
                disabled={!newRun.driver}
                onClick={() =>
                  void run(
                    () => planRun({ driver: newRun.driver, scheduled_for: newRun.scheduled_for }),
                    "Run planned. Load it with orders that are packed.",
                  )
                }
                className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-secondary disabled:opacity-50"
              >
                Plan run
              </button>
            </div>
          )}
        </section>

        {runs.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-gray-300 py-12 text-center text-sm text-gray-500">
            No runs yet.
          </p>
        ) : (
          runs.map((entry) => {
            const ordered = [...entry.stops].sort((a, b) => a.sequence - b.sequence);

            return (
              <section key={entry.id} className="rounded-2xl bg-white p-5 shadow-sm">
                <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="flex items-center gap-2 font-semibold text-gray-900">
                      <Truck className="h-4 w-4 text-gray-400" />
                      {entry.driver_name}
                      <StatusPill status={entry.status} />
                    </h2>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {new Date(entry.scheduled_for).toLocaleDateString("en-NG", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      })}{" "}
                      · {entry.stop_count} stop{entry.stop_count === 1 ? "" : "s"}
                    </p>
                  </div>

                  {entry.status === "PLANNED" && (
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const orderNumber = prompt("Order number to load (must be packed):");
                          if (!orderNumber) return;
                          void run(
                            () => addStop(entry.id, orderNumber.trim()),
                            `${orderNumber.trim()} loaded.`,
                          );
                        }}
                        className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
                      >
                        <Plus className="h-3.5 w-3.5" /> Load an order
                      </button>
                      <button
                        type="button"
                        disabled={ordered.length === 0}
                        onClick={() =>
                          void run(() => startRun(entry.id), "The van has left. Orders are shipped.")
                        }
                        className="rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-white hover:bg-secondary disabled:opacity-50"
                      >
                        Start run
                      </button>
                    </div>
                  )}
                </header>

                {ordered.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    Nothing loaded yet. Only packed orders can go on a van.
                  </p>
                ) : (
                  <ol className="space-y-2">
                    {ordered.map((stop, index) => (
                      <li
                        key={stop.id}
                        className="flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 px-3 py-2 text-sm"
                      >
                        <span className="w-6 shrink-0 text-center font-mono text-gray-400">
                          {index + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium">
                            {stop.order_number}
                            <span className="ml-2 font-normal text-gray-600">
                              {stop.recipient_name}
                            </span>
                          </p>
                          <p className="truncate text-xs text-gray-500">
                            {stop.address} · {stop.phone}
                          </p>
                          {stop.status === "FAILED" && (
                            // Not cancelled: the goods came back and the order
                            // is still owed. It needs rebooking onto a new run.
                            <p className="mt-0.5 text-xs text-red-600">
                              Attempted: {stop.failure_reason} — needs rebooking
                            </p>
                          )}
                          {stop.status === "DELIVERED" && (
                            <p className="mt-0.5 text-xs text-green-700">
                              Received by {stop.received_by}
                            </p>
                          )}
                        </div>
                        <StatusPill status={stop.status} />

                        {entry.status === "PLANNED" && (
                          <div className="flex gap-1">
                            <button
                              type="button"
                              aria-label={`Move ${stop.order_number} earlier`}
                              disabled={index === 0}
                              onClick={() => void move(entry, index, -1)}
                              className="rounded border border-gray-300 p-1 disabled:opacity-30"
                            >
                              <ArrowUp className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              aria-label={`Move ${stop.order_number} later`}
                              disabled={index === ordered.length - 1}
                              onClick={() => void move(entry, index, 1)}
                              className="rounded border border-gray-300 p-1 disabled:opacity-30"
                            >
                              <ArrowDown className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </li>
                    ))}
                  </ol>
                )}
              </section>
            );
          })
        )}
      </div>
    </DataScreen>
  );
}

/** Today, in the `yyyy-mm-dd` an `<input type="date">` expects. */
function today(): string {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
}

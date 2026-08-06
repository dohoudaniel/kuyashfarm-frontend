"use client";

/**
 * The driver's round.
 *
 * **Deliberately not under `/admin`.** A driver is not staff — `AdminGuard`
 * would turn them away, and giving them a back-office account so it wouldn't
 * hands the order queue, the stock ledger and the customer list to whoever is
 * holding the delivery phone. On a round, that is whoever picked it up.
 *
 * Designed for one hand, at a gate, on mobile data:
 *
 *  * stops are in driving order, and the next one is the one at the top;
 *  * the address and phone are on the card, because a driver at the wheel
 *    cannot look an order up;
 *  * the phone number is a `tel:` link, since "call ahead" is the single most
 *    common action after "arrived";
 *  * both buttons ask one question each and nothing more.
 *
 * `received_by` is required by the server, and this screen does not try to be
 * clever about it. "Delivered" with nobody's name against it is the answer
 * that cannot be checked when a customer says the parcel never arrived, and
 * the driver is the only person who will ever be able to supply it.
 */

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Loader2, MapPin, Phone, Truck, XCircle } from "lucide-react";

import { ApiError } from "@/lib/api/client";
import { markDelivered, markFailed, myRuns, type DeliveryRun } from "@/lib/api/admin";
import { useAuth } from "@/lib/context/AuthContext";

export default function DriverClient() {
  const { isLoading: authLoading, isAuthenticated } = useAuth();

  const [runs, setRuns] = useState<DeliveryRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busyStop, setBusyStop] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRuns(await myRuns());
      setError("");
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : "Could not load your round. Check your connection and pull to refresh.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    void load();
  }, [authLoading, isAuthenticated, load]);

  async function deliver(stopId: string, orderNumber: string) {
    const receivedBy = prompt(`Who took ${orderNumber}?`);
    if (!receivedBy?.trim()) return;

    setBusyStop(stopId);
    setError("");
    try {
      await markDelivered(stopId, receivedBy.trim());
      setMessage(`${orderNumber} delivered.`);
      void load();
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Could not record that.");
    } finally {
      setBusyStop("");
    }
  }

  async function fail(stopId: string, orderNumber: string) {
    const reason = prompt(`Why could ${orderNumber} not be delivered?`);
    if (!reason?.trim()) return;

    setBusyStop(stopId);
    setError("");
    try {
      await markFailed(stopId, reason.trim());
      // Said plainly, because a driver reasonably assumes "failed" means the
      // order is finished with. It is not — it goes back on a van.
      setMessage(`${orderNumber} recorded as not delivered. The office will rebook it.`);
      void load();
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Could not record that.");
    } finally {
      setBusyStop("");
    }
  }

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </main>
    );
  }

  /**
   * Today's round, including one that has just finished.
   *
   * Filtering to OUT and PLANNED alone means the run disappears the instant
   * the last stop is delivered — the driver taps "Delivered", the whole screen
   * empties, and there is no way to check it registered. Standing at a gate
   * with no signal that the thing you just did worked is exactly when people
   * tap it again.
   *
   * A completed run stays until the day rolls over, which is also the answer
   * to "what did I deliver this morning?".
   */
  const today = new Date().toISOString().slice(0, 10);
  const active = runs.filter(
    (run) =>
      run.status === "OUT" ||
      run.status === "PLANNED" ||
      (run.status === "COMPLETED" && run.scheduled_for === today),
  );

  return (
    <main className="min-h-screen bg-gray-50 pb-16">
      <header className="sticky top-0 z-10 bg-primary-dark px-4 py-3 text-white">
        <h1 className="flex items-center gap-2 font-serif text-lg font-bold">
          <Truck className="h-5 w-5" /> My round
        </h1>
      </header>

      <div className="mx-auto max-w-xl space-y-4 p-4">
        {error && (
          <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </p>
        )}
        {message && (
          <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800">{message}</p>
        )}

        {loading ? (
          <p className="py-16 text-center">
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-gray-400" />
          </p>
        ) : active.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-gray-300 bg-white py-16 text-center text-sm text-gray-500">
            Nothing to deliver right now.
          </p>
        ) : (
          active.map((run) => {
            const stops = [...run.stops].sort((a, b) => a.sequence - b.sequence);
            const remaining = stops.filter((stop) => stop.status === "PENDING");

            return (
              <section key={run.id} className="space-y-3">
                <div className="flex items-baseline justify-between">
                  <h2 className="font-semibold text-gray-900">
                    {new Date(run.scheduled_for).toLocaleDateString("en-NG", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {remaining.length} of {stops.length} left
                  </p>
                </div>

                {run.status === "PLANNED" && (
                  <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    This run has not been started at the farm yet.
                  </p>
                )}

                {run.status === "COMPLETED" && (
                  <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800">
                    Round finished. Nothing left to deliver.
                  </p>
                )}

                {stops.map((stop, index) => {
                  const done = stop.status !== "PENDING";

                  return (
                    <article
                      key={stop.id}
                      className={`rounded-2xl bg-white p-4 shadow-sm ${done ? "opacity-60" : ""}`}
                    >
                      <div className="mb-2 flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs text-gray-500">
                            Stop {index + 1} · {stop.order_number}
                          </p>
                          <p className="font-semibold text-gray-900">{stop.recipient_name}</p>
                        </div>
                        {stop.status === "DELIVERED" && (
                          <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />
                        )}
                        {stop.status === "FAILED" && (
                          <XCircle className="h-5 w-5 shrink-0 text-red-500" />
                        )}
                      </div>

                      <p className="mb-1 flex items-start gap-2 text-sm text-gray-700">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                        {stop.address}
                      </p>

                      {/* A tel: link, not text. "Call ahead" is the commonest
                          action after "arrived", and retyping a number at the
                          wheel is both slow and unsafe. */}
                      {stop.phone && (
                        <a
                          href={`tel:${stop.phone}`}
                          className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-primary"
                        >
                          <Phone className="h-4 w-4" /> {stop.phone}
                        </a>
                      )}

                      {stop.status === "DELIVERED" && (
                        <p className="text-sm text-green-700">Received by {stop.received_by}</p>
                      )}
                      {stop.status === "FAILED" && (
                        <p className="text-sm text-red-600">
                          Not delivered: {stop.failure_reason}. The office will rebook it.
                        </p>
                      )}

                      {!done && run.status === "OUT" && (
                        <div className="mt-3 flex gap-2">
                          <button
                            type="button"
                            disabled={busyStop === stop.id}
                            onClick={() => void deliver(stop.id, stop.order_number)}
                            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary py-3 font-semibold text-white disabled:opacity-60"
                          >
                            {busyStop === stop.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4" />
                            )}
                            Delivered
                          </button>
                          <button
                            type="button"
                            disabled={busyStop === stop.id}
                            onClick={() => void fail(stop.id, stop.order_number)}
                            className="rounded-full border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700 disabled:opacity-60"
                          >
                            Couldn&apos;t deliver
                          </button>
                        </div>
                      )}
                    </article>
                  );
                })}
              </section>
            );
          })
        )}
      </div>
    </main>
  );
}

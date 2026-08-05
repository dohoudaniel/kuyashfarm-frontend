"use client";

/**
 * Scheduling classes and keeping the teaching staff.
 *
 * Django Admin is off in production, so until this existed nobody could put a
 * class on the calendar — and the academy is both transactional and
 * lead-generating (PRD §13 Q6), so the whole thing was frozen at whatever the
 * seed command created.
 *
 * Two rules the server enforces and this screen makes visible, because both
 * are silent otherwise:
 *
 *  * **Seats taken is derived from real bookings.** There is no field for it.
 *    The prototype's was a number in a TypeScript file that never moved, so
 *    four people could book the same last place.
 *  * **The room cannot shrink below what is booked.** Shrinking does not
 *    un-book anybody; it oversubscribes the class with nobody identifiable as
 *    surplus. The seats-left figure beside each class is what makes that
 *    obvious before somebody tries.
 */

import { useCallback, useEffect, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";

import { ApiError } from "@/lib/api/client";
import {
  createClass,
  createInstructor,
  deleteClass,
  deleteInstructor,
  listInstructors,
  listStaffClasses,
  updateClass,
  type StaffAcademyClass,
  type StaffInstructor,
} from "@/lib/api/admin";
import { FormField } from "@/components/ui/FormField";
import { FormSelect } from "@/components/ui/FormSelect";
import { formatPrice } from "@/lib/utils";

const EMPTY = {
  title: "",
  instructor: "",
  scheduled_date: "",
  location: "Kuyash Integrated Farm",
  price: "",
  total_seats: "20",
  description: "",
};

export function ManageClasses() {
  const [classes, setClasses] = useState<StaffAcademyClass[]>([]);
  const [instructors, setInstructors] = useState<StaffInstructor[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [newInstructor, setNewInstructor] = useState({ name: "", title: "" });

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [page, people] = await Promise.all([listStaffClasses(), listInstructors()]);
      setClasses(page.results);
      setInstructors(people);
      setError("");
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Could not load the academy.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function run(action: () => Promise<unknown>, success: string) {
    setBusy(true);
    setMessage("");
    try {
      await action();
      setMessage(success);
      void load();
    } catch (caught) {
      // The server's refusals name the alternative — "cancel their bookings
      // first", "seats are already booked" — so they are shown verbatim.
      setError(caught instanceof ApiError ? caught.message : "That did not work.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <p className="py-16 text-center">
        <Loader2 className="mx-auto h-6 w-6 animate-spin text-gray-400" />
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}
      {message && (
        <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800">{message}</p>
      )}

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-semibold text-gray-900">Schedule a class</h2>

        {instructors.length === 0 ? (
          <p className="text-sm text-gray-600">Add an instructor first — a class needs one.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Title" name="title" value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })} required />

            <FormSelect label="Instructor" name="instructor" value={form.instructor}
              onChange={(e) => setForm({ ...form, instructor: e.target.value })}
              options={[
                { value: "", label: "Choose an instructor" },
                ...instructors
                  .filter((person) => person.is_active)
                  .map((person) => ({ value: person.id, label: person.name })),
              ]}
              required />

            <FormField label="Date and time" name="scheduled_date" type="text"
              value={form.scheduled_date}
              onChange={(e) => setForm({ ...form, scheduled_date: e.target.value })}
              placeholder="2026-09-15T10:00" required />

            <FormField label="Location" name="location" value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })} required />

            <FormField label="Price (₦, 0 for free)" name="price" value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              placeholder="25000.00" required />

            <FormField label="Seats" name="total_seats" type="number" value={form.total_seats}
              onChange={(e) => setForm({ ...form, total_seats: e.target.value })} required />
          </div>
        )}

        {instructors.length > 0 && (
          <>
            <p className="mt-2 text-xs text-gray-500">
              A price of zero makes the class free, which confirms bookings straight away instead
              of holding them for payment.
            </p>
            <button type="button" disabled={busy}
              onClick={() =>
                void run(async () => {
                  await createClass({
                    ...form,
                    total_seats: Number(form.total_seats),
                    // The server wants an ISO instant; a datetime-local value
                    // has no zone, so it is read as local time here.
                    scheduled_date: new Date(form.scheduled_date).toISOString(),
                  });
                  setForm(EMPTY);
                }, "Class scheduled.")
              }
              className="mt-4 flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-secondary disabled:opacity-60">
              <Plus className="h-4 w-4" /> Schedule
            </button>
          </>
        )}
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-semibold text-gray-900">Classes</h2>

        {classes.length === 0 ? (
          <p className="text-sm text-gray-500">Nothing scheduled.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {classes.map((entry) => (
              <li key={entry.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="font-medium text-gray-900">
                    {entry.title}
                    {!entry.is_active && (
                      <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                        hidden
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(entry.scheduled_date).toLocaleString("en-NG", {
                      day: "numeric", month: "short", year: "numeric", hour: "numeric",
                      minute: "2-digit",
                    })}{" "}
                    · {formatPrice(entry.price)} ·{" "}
                    {/* The figure that makes "you cannot shrink this" obvious
                        before somebody tries it. */}
                    <strong>
                      {entry.seats_taken} of {entry.total_seats} booked
                    </strong>
                  </p>
                </div>

                <div className="flex gap-2">
                  <button type="button" disabled={busy}
                    onClick={() =>
                      void run(
                        () => updateClass(entry.slug, { is_active: !entry.is_active }),
                        entry.is_active ? "Hidden from the site." : "Published.",
                      )
                    }
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs hover:bg-gray-50">
                    {entry.is_active ? "Hide" : "Publish"}
                  </button>
                  <button type="button" disabled={busy}
                    aria-label={`Delete ${entry.title}`}
                    onClick={() => {
                      if (!confirm(`Delete ${entry.title}?`)) return;
                      void run(() => deleteClass(entry.slug), "Class deleted.");
                    }}
                    className="rounded-lg border border-red-300 px-3 py-1.5 text-xs text-red-700 hover:bg-red-50">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-semibold text-gray-900">Instructors</h2>

        <ul className="mb-4 divide-y divide-gray-100">
          {instructors.map((person) => (
            <li key={person.id} className="flex items-center justify-between gap-3 py-2 text-sm">
              <span>
                <strong>{person.name}</strong>{" "}
                <span className="text-gray-500">{person.title}</span>
              </span>
              <button type="button" aria-label={`Delete ${person.name}`}
                onClick={() => void run(() => deleteInstructor(person.id), "Instructor removed.")}
                className="text-gray-400 hover:text-red-600">
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
          {instructors.length === 0 && (
            <li className="py-2 text-sm text-gray-500">Nobody yet.</li>
          )}
        </ul>

        <div className="flex flex-wrap items-end gap-3">
          <FormField label="Name" name="instructor_name" value={newInstructor.name}
            onChange={(e) => setNewInstructor({ ...newInstructor, name: e.target.value })}
            placeholder="Dr. Chukwuemeka Obi" />
          <FormField label="Title" name="instructor_title" value={newInstructor.title}
            onChange={(e) => setNewInstructor({ ...newInstructor, title: e.target.value })}
            placeholder="Soil Scientist" />
          <button type="button" disabled={busy || newInstructor.name.trim().length < 2}
            onClick={() =>
              void run(async () => {
                await createInstructor(newInstructor);
                setNewInstructor({ name: "", title: "" });
              }, "Instructor added.")
            }
            className="flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-secondary disabled:opacity-50">
            <Plus className="h-4 w-4" /> Add
          </button>
        </div>
      </section>
    </div>
  );
}

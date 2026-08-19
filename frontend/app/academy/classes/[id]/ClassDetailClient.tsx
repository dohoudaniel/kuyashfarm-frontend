"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  ArrowLeft,
  Award,
} from "lucide-react";
import { type AcademyClass, LEVEL_COLORS } from "@/lib/data/academy";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  occupation: string;
  farmingExperience: string;
  hearAboutUs: string;
  notes: string;
}

interface FormErrors {
  [key: string]: string;
}

export function ClassDetailClient({ cls }: { cls: AcademyClass }) {
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    occupation: "",
    farmingExperience: "",
    hearAboutUs: "",
    notes: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registrationRef, setRegistrationRef] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!formData.firstName.trim()) next.firstName = "First name is required";
    if (!formData.lastName.trim()) next.lastName = "Last name is required";
    if (!formData.email.trim()) {
      next.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      next.email = "Enter a valid email address";
    }
    if (!formData.phone.trim()) next.phone = "Phone number is required";
    if (!formData.occupation.trim()) next.occupation = "Occupation is required";
    if (!formData.farmingExperience)
      next.farmingExperience = "Please select your experience level";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const ref = `KFA-${Date.now().toString().slice(-6)}-${Math.random()
      .toString(36)
      .substring(2, 5)
      .toUpperCase()}`;

    const registrations = JSON.parse(
      localStorage.getItem("academy_registrations") || "[]"
    );
    registrations.push({
      ref,
      classId: cls.id,
      classTitle: cls.title,
      classDate: cls.date,
      price: cls.price,
      ...formData,
      registeredAt: new Date().toISOString(),
    });
    localStorage.setItem("academy_registrations", JSON.stringify(registrations));

    setRegistrationRef(ref);
    setIsSubmitting(false);
    setIsRegistered(true);
  };

  if (isRegistered) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-[#f7f5f0] flex items-center justify-center py-24">
          <Container>
            <div className="max-w-xl mx-auto text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-[#2d5f3f]" />
              </div>
              <h1 className="font-serif text-3xl font-bold text-[#1a3d2b] mb-3">
                You&apos;re registered!
              </h1>
              <p className="text-gray-500 mb-2">
                Your spot for{" "}
                <span className="font-semibold text-[#1a3d2b]">{cls.title}</span> has
                been reserved.
              </p>
              <p className="text-gray-500 mb-8">
                A confirmation will be sent to{" "}
                <span className="font-semibold">{formData.email}</span>.
              </p>

              <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8 text-left space-y-3">
                {[
                  { label: "Reference", value: registrationRef },
                  { label: "Class", value: cls.title },
                  { label: "Date", value: cls.date },
                  { label: "Location", value: cls.location },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-gray-500">{label}</span>
                    <span className="font-semibold text-[#1a3d2b]">{value}</span>
                  </div>
                ))}
                <hr />
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Amount to pay</span>
                  <span className="font-bold text-lg text-[#1a3d2b]">
                    ₦{cls.price.toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-gray-400">
                  Payment is made on arrival at the farm.
                </p>
              </div>

              <Link
                href="/academy"
                className="inline-flex items-center gap-2 bg-[#2d5f3f] text-white font-semibold px-8 py-4 rounded-full hover:bg-[#1a3d2b] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Academy
              </Link>
            </div>
          </Container>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="bg-[#f7f5f0] min-h-screen">

        {/* Hero */}
        <div className="relative h-72 md:h-96 w-full overflow-hidden">
          <Image src={cls.image} alt={cls.title} fill priority className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a3d2b]/80 via-[#1a3d2b]/40 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-end pb-8">
            <Container>
              <Link
                href="/academy"
                className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm mb-4 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Academy
              </Link>
              <span
                className={`inline-block text-xs font-semibold px-3 py-1 rounded-full mb-3 ${LEVEL_COLORS[cls.level]}`}
              >
                {cls.level}
              </span>
              <h1 className="font-serif text-3xl md:text-5xl font-bold text-white">
                {cls.title}
              </h1>
            </Container>
          </div>
        </div>

        {/* Body */}
        <Container>
          <div className="py-12 grid grid-cols-1 lg:grid-cols-3 gap-10">

            {/* Left: Details */}
            <div className="lg:col-span-2 space-y-8">

              {/* Meta strip */}
              <div className="bg-white rounded-2xl p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { icon: <Calendar className="w-5 h-5 text-[#2d5f3f]" />, label: "Date", value: cls.date },
                  { icon: <Clock className="w-5 h-5 text-[#2d5f3f]" />, label: "Time", value: cls.time },
                  { icon: <MapPin className="w-5 h-5 text-[#2d5f3f]" />, label: "Location", value: cls.location },
                  { icon: <Users className="w-5 h-5 text-[#2d5f3f]" />, label: "Seats Left", value: `${cls.seatsLeft} of ${cls.seats}` },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                      {item.icon} {item.label}
                    </div>
                    <p className="font-semibold text-[#1a3d2b] text-sm">{item.value}</p>
                  </div>
                ))}
              </div>

              {/* About */}
              <div className="bg-white rounded-2xl p-6">
                <h2 className="font-serif text-xl font-bold text-[#1a3d2b] mb-3">
                  About This Class
                </h2>
                <p className="text-gray-500 leading-relaxed">{cls.fullDescription}</p>
              </div>

              {/* Topics */}
              <div className="bg-white rounded-2xl p-6">
                <h2 className="font-serif text-xl font-bold text-[#1a3d2b] mb-4">
                  What You Will Cover
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {cls.topics.map((topic) => (
                    <div key={topic} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-[#eef5f1] flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-3 h-3 text-[#2d5f3f]" />
                      </div>
                      <span className="text-sm text-gray-700">{topic}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Included */}
              <div className="bg-white rounded-2xl p-6">
                <h2 className="font-serif text-xl font-bold text-[#1a3d2b] mb-4">
                  What&apos;s Included
                </h2>
                <div className="space-y-2">
                  {cls.includes.map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <Award className="w-4 h-4 text-[#e8d5a3] shrink-0" />
                      <span className="text-sm text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructor */}
              <div className="bg-white rounded-2xl p-6 flex items-center gap-5">
                <div className="w-14 h-14 rounded-full bg-[#2d5f3f] flex items-center justify-center shrink-0">
                  <span className="text-white font-serif font-bold text-lg">
                    {cls.instructor.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                    Your Instructor
                  </p>
                  <p className="font-serif font-bold text-[#1a3d2b]">{cls.instructor.name}</p>
                  <p className="text-sm text-gray-500">
                    {cls.instructor.role} · {cls.instructor.experience} experience
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Registration form */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 sticky top-24 shadow-sm">
                <div className="mb-6 pb-6 border-b border-gray-100">
                  <p className="font-serif text-4xl font-bold text-[#1a3d2b]">
                    ₦{cls.price.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">per person · payment on arrival</p>
                  {cls.seatsLeft <= 8 && (
                    <p className="text-xs text-red-500 font-semibold mt-2">
                      ⚠ Only {cls.seatsLeft} seats remaining
                    </p>
                  )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <h3 className="font-serif text-lg font-bold text-[#1a3d2b]">
                    Register for this class
                  </h3>

                  <div className="grid grid-cols-2 gap-3">
                    {(["firstName", "lastName"] as const).map((field) => (
                      <div key={field}>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          {field === "firstName" ? "First Name" : "Last Name"} *
                        </label>
                        <input
                          name={field}
                          value={formData[field]}
                          onChange={handleChange}
                          placeholder={field === "firstName" ? "John" : "Doe"}
                          className={`w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2d5f3f]/30 ${
                            errors[field] ? "border-red-400" : "border-gray-200"
                          }`}
                        />
                        {errors[field] && (
                          <p className="text-xs text-red-500 mt-1">{errors[field]}</p>
                        )}
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Email Address *
                    </label>
                    <input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      className={`w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2d5f3f]/30 ${
                        errors.email ? "border-red-400" : "border-gray-200"
                      }`}
                    />
                    {errors.email && (
                      <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Phone Number *
                    </label>
                    <input
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="08012345678"
                      className={`w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2d5f3f]/30 ${
                        errors.phone ? "border-red-400" : "border-gray-200"
                      }`}
                    />
                    {errors.phone && (
                      <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Occupation *
                    </label>
                    <input
                      name="occupation"
                      value={formData.occupation}
                      onChange={handleChange}
                      placeholder="e.g. Farmer, Student, Business Owner"
                      className={`w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2d5f3f]/30 ${
                        errors.occupation ? "border-red-400" : "border-gray-200"
                      }`}
                    />
                    {errors.occupation && (
                      <p className="text-xs text-red-500 mt-1">{errors.occupation}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Farming Experience *
                    </label>
                    <select
                      name="farmingExperience"
                      value={formData.farmingExperience}
                      onChange={handleChange}
                      className={`w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2d5f3f]/30 bg-white ${
                        errors.farmingExperience ? "border-red-400" : "border-gray-200"
                      }`}
                    >
                      <option value="">Select experience</option>
                      <option value="none">No experience</option>
                      <option value="beginner">Less than 1 year</option>
                      <option value="some">1–3 years</option>
                      <option value="experienced">3–5 years</option>
                      <option value="expert">5+ years</option>
                    </select>
                    {errors.farmingExperience && (
                      <p className="text-xs text-red-500 mt-1">{errors.farmingExperience}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      How did you hear about us?
                    </label>
                    <select
                      name="hearAboutUs"
                      value={formData.hearAboutUs}
                      onChange={handleChange}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2d5f3f]/30 bg-white"
                    >
                      <option value="">Select an option</option>
                      <option value="social_media">Social Media</option>
                      <option value="friend">Friend / Referral</option>
                      <option value="google">Google Search</option>
                      <option value="whatsapp">WhatsApp</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Additional Notes
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows={2}
                      placeholder="Any questions or special requirements?"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2d5f3f]/30 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#2d5f3f] text-white font-semibold py-4 rounded-full hover:bg-[#1a3d2b] transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Registering...
                      </>
                    ) : (
                      "Confirm Registration"
                    )}
                  </button>

                  <p className="text-xs text-center text-gray-400">
                    Payment of ₦{cls.price.toLocaleString()} is made on arrival at the farm.
                  </p>
                </form>
              </div>
            </div>

          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}

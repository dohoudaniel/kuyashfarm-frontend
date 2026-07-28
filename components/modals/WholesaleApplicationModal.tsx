"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface WholesaleApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (businessName: string, businessAddress: string) => void;
}

export function WholesaleApplicationModal({
  isOpen,
  onClose,
  onSubmit,
}: WholesaleApplicationModalProps) {
  const [businessName, setBusinessName] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(businessName, businessAddress);
    setBusinessName("");
    setBusinessAddress("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h3 className="font-serif text-2xl font-bold text-gray-900">
            Apply for Wholesale Pricing
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            Get access to bulk pricing for verified businesses. Your application will be reviewed within 1-2 business days.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">
              Business Name
            </label>
            <input
              type="text"
              id="businessName"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              required
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
              placeholder="Your Business Ltd."
            />
          </div>

          <div>
            <label htmlFor="businessAddress" className="block text-sm font-medium text-gray-700">
              Business Address
            </label>
            <textarea
              id="businessAddress"
              value={businessAddress}
              onChange={(e) => setBusinessAddress(e.target.value)}
              required
              rows={3}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
              placeholder="123 Business Street, Lagos, Nigeria"
            />
          </div>

          <div className="rounded-lg bg-amber-50 p-4">
            <p className="text-xs text-amber-800">
              <strong>Note:</strong> While your application is pending, you can continue shopping at retail prices. Once verified, bulk discounts will apply automatically.
            </p>
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-green-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-700"
          >
            Submit Application
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-lg border border-gray-300 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
          >
            Continue Shopping as Retail
          </button>
        </form>
      </div>
    </div>
  );
}

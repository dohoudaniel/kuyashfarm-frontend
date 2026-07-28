"use client";

import { useState } from "react";
import { X, Truck } from "lucide-react";

interface DistributorApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    businessName: string,
    businessAddress: string,
    distributionArea: string,
    yearsInBusiness: string,
    expectedVolume: string,
    additionalInfo?: string
  ) => void;
}

export function DistributorApplicationModal({
  isOpen,
  onClose,
  onSubmit,
}: DistributorApplicationModalProps) {
  const [businessName, setBusinessName] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [distributionArea, setDistributionArea] = useState("");
  const [yearsInBusiness, setYearsInBusiness] = useState("");
  const [expectedVolume, setExpectedVolume] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(
      businessName,
      businessAddress,
      distributionArea,
      yearsInBusiness,
      expectedVolume,
      additionalInfo
    );
    // Reset form
    setBusinessName("");
    setBusinessAddress("");
    setDistributionArea("");
    setYearsInBusiness("");
    setExpectedVolume("");
    setAdditionalInfo("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white p-8 shadow-xl my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-primary/10 rounded-full">
              <Truck className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-gray-900">
              Become a Distributor
            </h3>
          </div>
          <p className="text-sm text-gray-600">
            Join our network of trusted distributors and help us deliver fresh farm products to more communities.
            Your application will be reviewed within 2-3 business days.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Business Name */}
            <div>
              <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-1">
                Business Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="businessName"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                required
                className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
                placeholder="e.g., Fresh Foods Distribution Ltd."
              />
            </div>

            {/* Years in Business */}
            <div>
              <label htmlFor="yearsInBusiness" className="block text-sm font-medium text-gray-700 mb-1">
                Years in Business <span className="text-red-500">*</span>
              </label>
              <select
                id="yearsInBusiness"
                value={yearsInBusiness}
                onChange={(e) => setYearsInBusiness(e.target.value)}
                required
                className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
              >
                <option value="">Select years</option>
                <option value="less-than-1">Less than 1 year</option>
                <option value="1-3">1-3 years</option>
                <option value="3-5">3-5 years</option>
                <option value="5-10">5-10 years</option>
                <option value="10+">10+ years</option>
              </select>
            </div>
          </div>

          {/* Business Address */}
          <div>
            <label htmlFor="businessAddress" className="block text-sm font-medium text-gray-700 mb-1">
              Business Address <span className="text-red-500">*</span>
            </label>
            <textarea
              id="businessAddress"
              value={businessAddress}
              onChange={(e) => setBusinessAddress(e.target.value)}
              required
              rows={2}
              className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
              placeholder="123 Distribution Avenue, Lagos, Nigeria"
            />
          </div>

          {/* Distribution Area */}
          <div>
            <label htmlFor="distributionArea" className="block text-sm font-medium text-gray-700 mb-1">
              Primary Distribution Area <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="distributionArea"
              value={distributionArea}
              onChange={(e) => setDistributionArea(e.target.value)}
              required
              className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
              placeholder="e.g., Lagos State, South-West Nigeria, Nationwide"
            />
          </div>

          {/* Expected Monthly Volume */}
          <div>
            <label htmlFor="expectedVolume" className="block text-sm font-medium text-gray-700 mb-1">
              Expected Monthly Volume <span className="text-red-500">*</span>
            </label>
            <select
              id="expectedVolume"
              value={expectedVolume}
              onChange={(e) => setExpectedVolume(e.target.value)}
              required
              className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
            >
              <option value="">Select volume range</option>
              <option value="₦100,000-₦500,000">₦100,000 - ₦500,000</option>
              <option value="₦500,000-₦1,000,000">₦500,000 - ₦1,000,000</option>
              <option value="₦1,000,000-₦2,500,000">₦1,000,000 - ₦2,500,000</option>
              <option value="₦2,500,000-₦5,000,000">₦2,500,000 - ₦5,000,000</option>
              <option value="₦5,000,000+">₦5,000,000+</option>
            </select>
          </div>

          {/* Additional Information */}
          <div>
            <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-700 mb-1">
              Additional Information (Optional)
            </label>
            <textarea
              id="additionalInfo"
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              rows={3}
              className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
              placeholder="Tell us about your distribution network, customer base, or any other relevant information..."
            />
          </div>

          {/* Information Box */}
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">Distributor Benefits:</h4>
            <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
              <li>Access to special distributor pricing (better than wholesale)</li>
              <li>Priority fulfillment and dedicated support</li>
              <li>Flexible payment terms for verified distributors</li>
              <li>Marketing materials and product training</li>
              <li>Exclusive access to new products</li>
            </ul>
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col gap-3 pt-2">
            <button
              type="submit"
              className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-white transition-colors hover:bg-secondary"
            >
              Submit Application
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-lg border border-gray-300 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

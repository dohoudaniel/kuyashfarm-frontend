"use client";

import { TrendingUp } from "lucide-react";

interface WholesaleBannerProps {
  onApply: () => void;
}

export function WholesaleBanner({ onApply }: WholesaleBannerProps) {
  return (
    <div className="rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 p-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 rounded-full bg-green-600 p-2">
          <TrendingUp className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-gray-900">
            Buying in bulk? Save with wholesale pricing
          </h4>
          <p className="mt-1 text-xs text-gray-600">
            Get verified for wholesale access and unlock discounted prices on bulk orders (10+ units).
          </p>
          <button
            onClick={onApply}
            className="mt-3 text-xs font-semibold text-green-600 hover:text-green-700 underline"
          >
            Apply for wholesale pricing →
          </button>
        </div>
      </div>
    </div>
  );
}

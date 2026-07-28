"use client";

import { CheckCircle } from "lucide-react";

export function WholesaleVerifiedBanner() {
  return (
    <div className="rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 p-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 rounded-full bg-green-600 p-2">
          <CheckCircle className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-green-900 flex items-center gap-2">
            Wholesale Access Granted!
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-600 text-white">
              Verified
            </span>
          </h4>
          <p className="mt-1 text-xs text-green-800">
            You now have access to bulk pricing discounts on all products:
          </p>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1.5 bg-white rounded-md px-2 py-1.5 border border-green-200">
              <span className="font-semibold text-green-900">10-49 units:</span>
              <span className="text-green-700">Save ~13%</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white rounded-md px-2 py-1.5 border border-green-200">
              <span className="font-semibold text-green-900">50+ units:</span>
              <span className="text-green-700">Save ~20%</span>
            </div>
          </div>
          <p className="mt-2 text-xs text-green-700">
            💡 Add 10+ units of any product to see wholesale pricing automatically applied!
          </p>
        </div>
      </div>
    </div>
  );
}

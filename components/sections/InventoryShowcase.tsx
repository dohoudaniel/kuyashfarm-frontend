"use client";

import Image from "next/image";
import Link from "next/link";

/**
 * Inventory Showcase Section
 * Inspired by LocalLine's landing page design
 * Split layout with marketing copy + product screenshot
 */
export function InventoryShowcase() {
  return (
    <section className="relative bg-gradient-to-b from-white to-gray-50 py-20 lg:py-32 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left Column - Marketing Copy */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-block">
                <span className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                  CUSTOMIZE HOW YOU TRACK INVENTORY
                </span>
              </div>

              <h2 className="font-serif text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                Built to manage stock,<br />not chaos
              </h2>

              <p className="text-lg text-gray-600 leading-relaxed">
                With Kuyash Farm, you have complete flexibility in how you track and sell
                your products. Track inventory by weight or by units, then choose to sell it
                by weight, by unit, or any combination of the two. You can manage
                inventory at the product level (pooled) or at the individual package level.
                The combinations are endless!
              </p>
            </div>


            {/* CTA Button */}
            <div className="pt-4">
              <Link
                href="/admin"
                className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-4 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:bg-secondary hover:shadow-xl"
              >
                See Dashboard in Action
                <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Right Column - Screenshot */}
          <div className="relative lg:pl-8">
            {/* Decorative Background Elements */}
            <div className="absolute -top-10 -right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />

            {/* Screenshot Container */}
            <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
              {/* Browser Chrome */}
              <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="bg-white px-4 py-1 rounded-md text-xs text-gray-600 font-medium max-w-xs truncate">
                    app.kuyashfarm.com/admin
                  </div>
                </div>
              </div>

              {/* Screenshot Image */}
              <div className="relative bg-gray-50">
                <Image
                  src="/images/screenshots/admin-dashboard.png"
                  alt="Kuyash Farm Inventory Management Dashboard"
                  width={1600}
                  height={1200}
                  className="w-full h-auto"
                  priority
                  unoptimized
                />

                {/* Overlay for polish */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/5 to-transparent pointer-events-none" />
              </div>
            </div>

            {/* Floating Badge */}
            <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl border border-gray-200 px-6 py-4 z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">100%</div>
                  <div className="text-sm text-gray-600">Stock Accuracy</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave Decoration */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg className="w-full h-24 text-gray-50" preserveAspectRatio="none" viewBox="0 0 1200 120" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 0v46.29c47.79 22.2 103.59 32.17 158 28 70.36-5.37 136.33-33.31 206.8-37.5 73.84-4.36 147.54 16.88 218.2 35.26 69.27 18 138.3 24.88 209.4 13.08 36.15-6 69.85-17.84 104.45-29.34C989.49 25 1113-14.29 1200 52.47V0z" opacity=".25" fill="currentColor" />
          <path d="M0 0v15.81c13 21.11 27.64 41.05 47.69 56.24C99.41 111.27 165 111 224.58 91.58c31.15-10.15 60.09-26.07 89.67-39.8 40.92-19 84.73-46 130.83-49.67 36.26-2.85 70.9 9.42 98.6 31.56 31.77 25.39 62.32 62 103.63 73 40.44 10.79 81.35-6.69 119.13-24.28s75.16-39 116.92-43.05c59.73-5.85 113.28 22.88 168.9 38.84 30.2 8.66 59 6.17 87.09-7.5 22.43-10.89 48-26.93 60.65-49.24V0z" opacity=".5" fill="currentColor" />
          <path d="M0 0v5.63C149.93 59 314.09 71.32 475.83 42.57c43-7.64 84.23-20.12 127.61-26.46 59-8.63 112.48 12.24 165.56 35.4C827.93 77.22 886 95.24 951.2 90c86.53-7 172.46-45.71 248.8-84.81V0z" fill="currentColor" />
        </svg>
      </div>
    </section>
  );
}

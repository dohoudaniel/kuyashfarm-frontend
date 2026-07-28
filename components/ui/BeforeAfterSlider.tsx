"use client";

import { useState } from "react";
import Image from "next/image";

interface BeforeAfterSliderProps {
  before: string;
  after: string;
  title: string;
  description: string;
}

export function BeforeAfterSlider({ before, after, title, description }: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const handleMove = (clientX: number, rect: DOMRect) => {
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setSliderPosition(Math.max(0, Math.min((x / rect.width) * 100, 100)));
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8 text-center">
        <h3 className="mb-4 font-serif text-3xl font-bold text-[#2d5f3f] md:text-4xl">{title}</h3>
        <p className="font-sans text-lg text-gray-600">{description}</p>
      </div>

      <div
        className="relative aspect-video w-full cursor-col-resize overflow-hidden rounded-2xl shadow-2xl"
        onMouseMove={(e) => isDragging && handleMove(e.clientX, e.currentTarget.getBoundingClientRect())}
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        onTouchMove={(e) => isDragging && handleMove(e.touches[0].clientX, e.currentTarget.getBoundingClientRect())}
        onTouchStart={() => setIsDragging(true)}
        onTouchEnd={() => setIsDragging(false)}
      >
        <div className="absolute inset-0">
          <Image src={after} alt="After" fill className="object-cover" />
          <div className="absolute bottom-4 right-4 rounded-full bg-white/90 px-4 py-2 font-sans text-sm font-semibold text-[#2d5f3f] backdrop-blur-sm">
            After
          </div>
        </div>

        <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}>
          <Image src={before} alt="Before" fill className="object-cover" />
          <div className="absolute bottom-4 left-4 rounded-full bg-white/90 px-4 py-2 font-sans text-sm font-semibold text-gray-700 backdrop-blur-sm">
            Before
          </div>
        </div>

        <div className="absolute top-0 bottom-0 w-1 bg-white shadow-lg" style={{ left: `${sliderPosition}%` }}>
          <div className="absolute top-1/2 left-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white bg-[#2d5f3f] shadow-xl">
            <div className="flex h-full items-center justify-center">
              <div className="h-4 w-4 rounded-full bg-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

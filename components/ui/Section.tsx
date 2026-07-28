import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface SectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
}

/**
 * Section wrapper component for consistent spacing
 */
export function Section({ children, className, id }: SectionProps) {
  return (
    <section id={id} className={cn("py-16 md:py-24 lg:py-32", className)}>
      {children}
    </section>
  );
}

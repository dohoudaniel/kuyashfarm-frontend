/**
 * Max-width page gutter. Every full-width section wraps its content in one
 * of these so margins stay consistent across routes.
 */

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
  className?: string;
  id?: string;
}

/**
 * Container component for consistent max-width and padding
 */
export function Container({ children, className, id }: ContainerProps) {
  return (
    <div id={id} className={cn("mx-auto max-w-7xl px-4 sm:px-6 lg:px-8", className)}>
      {children}
    </div>
  );
}

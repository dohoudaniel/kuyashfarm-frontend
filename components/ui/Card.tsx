import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

/**
 * Reusable Card component with optional hover effect
 */
export function Card({ children, className, hover = false }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg bg-white p-6 shadow-md transition-all duration-300",
        hover && "hover:scale-105 hover:shadow-xl",
        className
      )}
    >
      {children}
    </div>
  );
}

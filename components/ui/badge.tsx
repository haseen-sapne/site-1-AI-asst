import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success";
  className?: string;
  children?: React.ReactNode;
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants: Record<string, string> = {
    default: "border-transparent bg-slate-900 text-white",
    secondary: "border-transparent bg-slate-100 text-slate-900",
    destructive: "border-transparent bg-red-600 text-white",
    outline: "border-slate-300 text-slate-700",
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 whitespace-nowrap",
        variants[variant] || variants.default,
        className
      )}
      {...props}
    />
  );
}

export { Badge };

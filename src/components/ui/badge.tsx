import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning";
}

const badgeVariants = {
  variant: {
    default:
      "border-transparent bg-zinc-950 text-white shadow-2xs hover:bg-zinc-800",
    secondary:
      "border-transparent bg-zinc-100 text-zinc-900 hover:bg-zinc-200/80",
    destructive:
      "border-transparent bg-rose-50 text-rose-700 border border-rose-200",
    outline: "text-zinc-950 border border-zinc-200 bg-white",
    success:
      "border-emerald-200 bg-emerald-50 text-emerald-700 border",
    warning:
      "border-amber-200 bg-amber-50 text-amber-800 border",
  },
};

function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold transition-colors focus:outline-hidden",
        badgeVariants.variant[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge, badgeVariants };

import * as React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string | React.ReactNode;
  icon?: LucideIcon;
  variant?: "default" | "success" | "warning" | "destructive";
  className?: string;
  onClick?: () => void;
  active?: boolean;
}

export function StatCard({
  label,
  value,
  subtext,
  icon: Icon,
  variant = "default",
  className,
  onClick,
  active,
}: StatCardProps) {
  const isInteractive = Boolean(onClick);

  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-xl border bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between transition-all",
        active
          ? "border-zinc-950 ring-1 ring-zinc-950 bg-zinc-50/50"
          : "border-zinc-200/90 hover:border-zinc-300",
        isInteractive && "cursor-pointer select-none",
        className
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <span
          className={cn(
            "text-[11px] font-semibold uppercase tracking-wider",
            variant === "success" && "text-emerald-700",
            variant === "warning" && "text-amber-700",
            variant === "destructive" && "text-rose-700",
            variant === "default" && "text-zinc-500"
          )}
        >
          {label}
        </span>
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-700 flex items-center justify-center shrink-0">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div
        className={cn(
          "text-xl sm:text-2xl font-bold tracking-tight",
          variant === "success" && "text-emerald-700",
          variant === "warning" && "text-amber-700",
          variant === "destructive" && "text-rose-700",
          variant === "default" && "text-zinc-950"
        )}
      >
        {value}
      </div>

      {subtext && (
        <div className="text-[11px] text-zinc-500 mt-1">{subtext}</div>
      )}
    </div>
  );
}

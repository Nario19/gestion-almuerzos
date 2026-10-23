import * as React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export type StatCardVariant = "default" | "success" | "warning" | "destructive" | "purple" | "sky";

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string | React.ReactNode;
  icon?: LucideIcon;
  variant?: StatCardVariant;
  className?: string;
  onClick?: () => void;
  active?: boolean;
}

const variantStyles: Record<
  StatCardVariant,
  {
    container: string;
    active: string;
    label: string;
    iconBox: string;
    value: string;
    subtext: string;
  }
> = {
  default: {
    container: "bg-gradient-to-br from-blue-50/70 via-white to-indigo-50/30 border-blue-200/80 hover:border-blue-300 shadow-xs",
    active: "border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/70",
    label: "text-blue-700",
    iconBox: "bg-blue-100 text-blue-700 border border-blue-200/60 shadow-2xs",
    value: "text-blue-950",
    subtext: "text-blue-700/80",
  },
  success: {
    container: "bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/30 border-emerald-200/80 hover:border-emerald-300 shadow-xs",
    active: "border-emerald-600 ring-2 ring-emerald-500/20 bg-emerald-50/70",
    label: "text-emerald-700",
    iconBox: "bg-emerald-100 text-emerald-700 border border-emerald-200/60 shadow-2xs",
    value: "text-emerald-950",
    subtext: "text-emerald-700/80",
  },
  warning: {
    container: "bg-gradient-to-br from-amber-50/70 via-white to-yellow-50/30 border-amber-200/80 hover:border-amber-300 shadow-xs",
    active: "border-amber-600 ring-2 ring-amber-500/20 bg-amber-50/70",
    label: "text-amber-800",
    iconBox: "bg-amber-100 text-amber-800 border border-amber-200/60 shadow-2xs",
    value: "text-amber-950",
    subtext: "text-amber-800/80",
  },
  destructive: {
    container: "bg-gradient-to-br from-rose-50/70 via-white to-red-50/30 border-rose-200/80 hover:border-rose-300 shadow-xs",
    active: "border-rose-600 ring-2 ring-rose-500/20 bg-rose-50/70",
    label: "text-rose-700",
    iconBox: "bg-rose-100 text-rose-700 border border-rose-200/60 shadow-2xs",
    value: "text-rose-950",
    subtext: "text-rose-700/80",
  },
  purple: {
    container: "bg-gradient-to-br from-purple-50/70 via-white to-fuchsia-50/30 border-purple-200/80 hover:border-purple-300 shadow-xs",
    active: "border-purple-600 ring-2 ring-purple-500/20 bg-purple-50/70",
    label: "text-purple-700",
    iconBox: "bg-purple-100 text-purple-700 border border-purple-200/60 shadow-2xs",
    value: "text-purple-950",
    subtext: "text-purple-700/80",
  },
  sky: {
    container: "bg-gradient-to-br from-sky-50/70 via-white to-cyan-50/30 border-sky-200/80 hover:border-sky-300 shadow-xs",
    active: "border-sky-600 ring-2 ring-sky-500/20 bg-sky-50/70",
    label: "text-sky-700",
    iconBox: "bg-sky-100 text-sky-700 border border-sky-200/60 shadow-2xs",
    value: "text-sky-950",
    subtext: "text-sky-700/80",
  },
};

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
  const styles = variantStyles[variant] || variantStyles.default;

  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-xl border p-5 sm:p-6 flex flex-col justify-between transition-all",
        styles.container,
        active && styles.active,
        isInteractive && "cursor-pointer select-none",
        className
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <span className={cn("text-[11px] font-semibold uppercase tracking-wider", styles.label)}>
          {label}
        </span>
        {Icon && (
          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", styles.iconBox)}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className={cn("text-xl sm:text-2xl font-bold tracking-tight", styles.value)}>
        {value}
      </div>

      {subtext && (
        <div className={cn("text-[11px] mt-1 font-medium", styles.subtext)}>
          {subtext}
        </div>
      )}
    </div>
  );
}

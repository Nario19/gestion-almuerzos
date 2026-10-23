import * as React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-dashed border-zinc-200 bg-white p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-3",
        className
      )}
    >
      {Icon && (
        <div className="w-12 h-12 rounded-full bg-zinc-100 text-zinc-600 flex items-center justify-center mb-1">
          <Icon className="w-6 h-6" />
        </div>
      )}
      <h4 className="text-sm sm:text-base font-bold text-zinc-950">{title}</h4>
      {description && (
        <p className="text-xs sm:text-sm text-zinc-500 max-w-sm">{description}</p>
      )}
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}

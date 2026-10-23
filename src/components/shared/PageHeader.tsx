import * as React from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  subtitle?: string;
  schoolName?: string;
  isSuperAdmin?: boolean;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  subtitle,
  schoolName,
  isSuperAdmin,
  badge,
  actions,
  children,
  className,
}: PageHeaderProps) {
  const finalDescription = description || subtitle;

  return (
    <div
      className={cn(
        "flex flex-col gap-4 pb-6 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2.5 flex-wrap">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950">
            {title}
          </h1>
          {badge}
          {schoolName && !isSuperAdmin && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-700 border border-zinc-200">
              🏫 {schoolName}
            </span>
          )}
        </div>
        {finalDescription && (
          <p className="text-xs sm:text-sm text-zinc-500">{finalDescription}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {actions}
        </div>
      )}
      {children}
    </div>
  );
}

export default PageHeader;


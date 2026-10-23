import * as React from "react";
import { cn } from "@/lib/utils";

const TabsList = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center rounded-xl bg-zinc-100 p-1 text-zinc-500 border border-zinc-200/80",
      className
    )}
    {...props}
  />
));
TabsList.displayName = "TabsList";

const TabsTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }
>(({ className, active, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-1.5 text-xs sm:text-sm font-semibold transition-all cursor-pointer focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50",
      active
        ? "bg-white text-zinc-950 shadow-xs"
        : "text-zinc-600 hover:text-zinc-950 hover:bg-white/50",
      className
    )}
    {...props}
  />
));
TabsTrigger.displayName = "TabsTrigger";

export { TabsList, TabsTrigger };

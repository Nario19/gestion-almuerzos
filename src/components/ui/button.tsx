import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  asChild?: boolean;
}

const buttonVariants = {
  variant: {
    default:
      "bg-zinc-950 text-white shadow-xs hover:bg-zinc-800 active:scale-[0.99] transition-all",
    destructive:
      "bg-rose-600 text-white shadow-xs hover:bg-rose-700 active:scale-[0.99] transition-all",
    outline:
      "border border-zinc-200 bg-white text-zinc-900 shadow-2xs hover:bg-zinc-50 hover:text-zinc-950 active:scale-[0.99] transition-all",
    secondary:
      "bg-zinc-100 text-zinc-900 shadow-2xs hover:bg-zinc-200/80 active:scale-[0.99] transition-all",
    ghost:
      "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950 transition-all",
    link: "text-zinc-950 underline-offset-4 hover:underline",
  },
  size: {
    default: "h-9 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg",
    sm: "h-8 rounded-md px-3 text-xs font-semibold",
    lg: "h-10 rounded-lg px-6 text-sm font-semibold",
    icon: "h-9 w-9 rounded-lg flex items-center justify-center p-0",
  },
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-zinc-950/20 disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none",
          buttonVariants.variant[variant],
          buttonVariants.size[size],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };

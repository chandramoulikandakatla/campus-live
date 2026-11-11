import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input"> & {
    variant?: "default" | "search" | "large";
  }
>(({ className, type, variant = "default", ...props }, ref) => {
  const variants = {
    default:
      "flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-all duration-200",
    search:
      "flex h-12 w-full rounded-2xl border border-input bg-card px-4 py-3 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0 focus-visible:border-primary/30 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm transition-all duration-200",
    large:
      "flex h-14 w-full rounded-2xl border border-input bg-card px-5 py-4 text-lg ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0 focus-visible:border-primary/30 disabled:cursor-not-allowed disabled:opacity-50 shadow-md transition-all duration-200 font-display",
  };

  return (
    <input
      type={type}
      className={cn(variants[variant], className)}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };

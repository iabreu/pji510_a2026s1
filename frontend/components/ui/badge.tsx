import * as React from "react";
import { cn } from "@/lib/utils";

const variantStyles = {
  default: "border-transparent bg-primary text-primary-foreground",
  secondary: "border-transparent bg-secondary text-secondary-foreground",
  destructive: "border-transparent bg-destructive text-destructive-foreground",
  success: "border-transparent bg-success text-success-foreground",
  warning: "border-transparent bg-warning text-warning-foreground",
  outline: "text-foreground",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof variantStyles;
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
        variantStyles[variant],
        className,
      )}
      {...props}
    />
  );
}

"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "primary" | "secondary" | "outline" | "success" | "warning" | "danger" | "info" | "orange" | "pink" | "gray"
  size?: "sm" | "md" | "lg"
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "default", size = "md", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-md font-medium", // Changed from rounded-full to rounded-md
          {
            // Light mode variants with dark mode support
            "bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] dark:bg-[hsl(var(--primary))]/20 dark:text-[hsl(var(--primary-foreground))]": variant === "primary",
            "bg-secondary/80 text-secondary-foreground dark:bg-secondary/30 dark:text-secondary-foreground":
              variant === "secondary",
            "border border-input bg-background dark:border-input": variant === "outline",
            "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] dark:bg-[hsl(var(--success))]/20 dark:text-[hsl(var(--success))]": variant === "success",
            "bg-[hsl(var(--destructive))]/10 text-[hsl(var(--destructive))] dark:bg-[hsl(var(--destructive))]/20 dark:text-[hsl(var(--destructive))]": variant === "danger",
            "bg-[hsl(var(--accent))]/10 text-[hsl(var(--accent))] dark:bg-[hsl(var(--accent))]/20 dark:text-[hsl(var(--accent))]": variant === "info",
            "bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] dark:bg-[hsl(var(--primary))]/20 dark:text-[hsl(var(--primary))]":
              variant === "warning" || variant === "orange",
            "bg-pink-500/10 text-pink-600 dark:bg-pink-500/20 dark:text-pink-400": variant === "pink",
            "bg-[hsl(var(--muted))]/50 text-[hsl(var(--muted-foreground))] dark:bg-[hsl(var(--muted))]/30 dark:text-[hsl(var(--muted-foreground))]": variant === "gray",
            "bg-muted text-muted-foreground dark:bg-muted/50": variant === "default",

            // Size variants
            "px-2 py-0.5 text-xs": size === "sm",
            "px-2.5 py-0.5 text-sm": size === "md",
            "px-3 py-1 text-base": size === "lg",
          },
          className,
        )}
        {...props}
      >
        {children}
      </div>
    )
  },
)
Badge.displayName = "Badge"

export { Badge, type BadgeProps }

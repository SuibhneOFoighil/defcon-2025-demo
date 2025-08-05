import { type ButtonHTMLAttributes, forwardRef } from "react"
import { cn } from "@/lib/utils"

/**
 * Props for the IconButton component
 */
export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "ghost" | "outline"
  size?: "sm" | "md" | "lg"
  active?: boolean
}

/**
 * A button component designed specifically for icons
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant = "default", size = "md", active = false, ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-md",
          // Base styling
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          "transition-colors duration-200",
          // Size variants
          {
            "h-6 w-6": size === "sm",
            "h-8 w-8": size === "md",
            "h-10 w-10": size === "lg",
          },
          // Style variants
          {
            "bg-primary text-primary-foreground hover:bg-primary/90": variant === "default",
            "bg-transparent hover:bg-secondary": variant === "ghost",
            "border border-input bg-transparent hover:bg-secondary dark:border-border dark:hover:border-primary/50": variant === "outline",
          },
          // Active state
          {
            "bg-secondary": active && variant === "ghost",
            "border-primary": active && variant === "outline",
          },
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)

IconButton.displayName = "IconButton"

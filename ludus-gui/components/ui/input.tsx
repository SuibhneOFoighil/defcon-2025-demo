import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps extends React.ComponentProps<"input"> {
  onSave?: (value: string) => void
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, onSave, onKeyDown, onBlur, disabled, ...props }, ref) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && onSave && !disabled) {
        const target = e.target as HTMLInputElement
        target.blur()
        onSave(target.value)
      }
      onKeyDown?.(e)
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      if (onSave && !disabled) {
        onSave(e.target.value)
      }
      onBlur?.(e)
    }

    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base text-foreground placeholder:text-muted-foreground ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        disabled={disabled}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }

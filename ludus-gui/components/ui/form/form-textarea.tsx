"use client"

import React, { forwardRef } from "react"
import { cn } from "@/lib/utils"
import { useTheme } from "@/lib/theme/theme-context"

export interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
  id?: string
}

export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ className, label, error, hint, id, disabled, ...props }, ref) => {
    const { isDark } = useTheme()
    const textareaId = React.useId()

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id || textareaId}
            className={cn("block text-sm font-medium mb-1.5", disabled ? "text-muted-foreground" : "text-foreground")}
          >
            {label}
          </label>
        )}

        <textarea
          id={id || textareaId}
          ref={ref}
          className={cn(
            "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
            "placeholder:text-muted-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "min-h-[100px] resize-vertical",
            disabled && "cursor-not-allowed opacity-70",
            error && "border-destructive focus-visible:ring-destructive",
            isDark && "bg-[#2a2a2a] border-[#4f4f4f]",
            className,
          )}
          disabled={disabled}
          {...props}
        />

        {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
        {hint && !error && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </div>
    )
  },
)

FormTextarea.displayName = "FormTextarea"

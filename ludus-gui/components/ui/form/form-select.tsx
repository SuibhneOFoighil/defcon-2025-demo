"use client"

import React, { forwardRef } from "react"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface FormSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  label?: string
  error?: string
  hint?: string
  id?: string
  options: SelectOption[]
}

export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ className, label, error, hint, id, options, ...props }, ref) => {
    const inputId = React.useId()

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id || inputId} className="block text-sm font-medium mb-2">
            {label}
          </label>
        )}

        <div className="relative">
          <select
            id={id || inputId}
            ref={ref}
            className={cn(
              "w-full h-10 px-3 py-2 bg-background text-foreground border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-input appearance-none pr-10",
              error && "border-destructive focus:border-destructive focus:ring-destructive/20",
              className,
            )}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
            <ChevronDown size={16} />
          </div>
        </div>

        {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
        {hint && !error && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </div>
    )
  },
)

FormSelect.displayName = "FormSelect"

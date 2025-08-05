"use client"

import React, { forwardRef } from "react"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

export interface FormNumberSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  hint?: string
  options?: Array<{ value: string; label: string }>
  maxValue?: number
}

export const FormNumberSelect = forwardRef<HTMLSelectElement, FormNumberSelectProps>(
  ({ className, label, error, hint, id, options, maxValue = 20, ...props }, ref) => {
    const generatedId = React.useId()
    const uniqueId = id || `form-number-select-${generatedId}`

    // Generate options if not provided
    const selectOptions =
      options ||
      Array.from({ length: maxValue + 1 }, (_, i) => ({
        value: i.toString(),
        label: i.toString(),
      }))

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={uniqueId} className="block text-sm font-medium mb-2">
            {label}
          </label>
        )}

        <div className="relative">
          <select
            id={uniqueId}
            ref={ref}
            className={cn(
              "form-input appearance-none pr-10",
              error && "border-danger-500 focus:border-danger-500 focus:ring-danger-200",
              className,
            )}
            {...props}
          >
            {selectOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        {error && <p className="mt-1 text-xs text-danger-500">{error}</p>}
        {hint && !error && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </div>
    )
  },
)

FormNumberSelect.displayName = "FormNumberSelect"

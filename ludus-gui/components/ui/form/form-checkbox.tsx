"use client"

import React, { forwardRef } from "react"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

export interface FormCheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string
  description?: string
  error?: string
  id?: string
}

export const FormCheckbox = forwardRef<HTMLInputElement, FormCheckboxProps>(
  ({ className, label, description, error, id, checked, onChange, ...props }, ref) => {
    const checkboxId = React.useId()

    return (
      <div className="w-full">
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <div
              className={cn(
                "w-5 h-5 border-2 rounded flex items-center justify-center cursor-pointer",
                checked
                  ? "bg-primary border-primary"
                  : "bg-transparent border-border hover:border-primary",
                error && "border-danger-500",
                className,
              )}
              onClick={() => {
                if (onChange) {
                  const event = {
                    target: {
                      checked: !checked,
                    },
                  } as React.ChangeEvent<HTMLInputElement>
                  onChange(event)
                }
              }}
            >
              {checked && (
                <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
              )}
            </div>
            <input
              type="checkbox"
              id={id || checkboxId}
              ref={ref}
              checked={checked}
              onChange={onChange}
              className="sr-only"
              {...props}
            />
          </div>
          <div className="ml-2 text-sm">
            {label && (
              <label htmlFor={id || checkboxId} className="font-medium text-foreground cursor-pointer">
                {label}
              </label>
            )}
            {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
            {error && <p className="mt-1 text-xs text-danger-500">{error}</p>}
          </div>
        </div>
      </div>
    )
  },
)

FormCheckbox.displayName = "FormCheckbox"

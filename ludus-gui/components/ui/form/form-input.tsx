"use client"

import { cn } from "@/lib/utils"
import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react"
import { Input } from "../input"

export interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  rightIcon?: ReactNode
  leftIcon?: ReactNode
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ className, label, error, hint, leftIcon, rightIcon, disabled, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={props.id || props.name}
            className={cn("block text-sm font-medium mb-1.5", disabled ? "text-muted-foreground" : "text-foreground")}
          >
            {label}
          </label>
        )}
        <div className="relative">
          <Input
            className={cn(
              "text-sm",
              leftIcon && "pl-9",
              rightIcon && "pr-9",
              error && "border-destructive focus-visible:ring-destructive",
              className,
            )}
            disabled={disabled}
            ref={ref}
            {...props}
          />
          {leftIcon && <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">{leftIcon}</div>}
          {rightIcon && <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightIcon}</div>}
        </div>
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
      </div>
    )
  },
)

FormInput.displayName = "FormInput"

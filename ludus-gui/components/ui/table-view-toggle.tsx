"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface ToggleOption {
  id: string
  label: string
  count?: number
}

export interface TableViewToggleProps {
  options: ToggleOption[]
  activeOption: string
  onOptionChange: (optionId: string) => void
  className?: string
}

export function TableViewToggle({
  options,
  activeOption,
  onOptionChange,
  className,
}: TableViewToggleProps) {
  return (
    <div className={cn("flex items-center", className)}>
      {options.map((option, index) => (
        <React.Fragment key={option.id}>
          <button
            onClick={() => onOptionChange(option.id)}
            className={cn(
              "px-0 py-2 text-xl font-semibold transition-colors",
              activeOption === option.id
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {option.label}
            {option.count !== undefined && (
              <span className="ml-2 text-base font-normal">
                ({option.count})
              </span>
            )}
          </button>
          {index < options.length - 1 && (
            <span className="mx-3 text-xl font-semibold text-muted-foreground">
              /
            </span>
          )}
        </React.Fragment>
      ))}
    </div>
  )
} 
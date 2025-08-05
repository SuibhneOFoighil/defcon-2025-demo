"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

export interface DropdownOption {
  value: string
  label: string
}

interface CustomDropdownProps {
  options: DropdownOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  triggerClassName?: string
  contentClassName?: string
  label?: string
}

export function CustomDropdown({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  className,
  triggerClassName,
  contentClassName,
  label,
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const selectedOption = options.find((option) => option.value === value)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <div ref={dropdownRef} className={cn("relative", className)}>
      {label && <div className="mb-2 text-sm font-medium">{label}</div>}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex w-full items-center justify-between rounded-md border border-input bg-[hsl(var(--input-bg))] px-3 py-2 text-xs text-left text-foreground",
          triggerClassName,
        )}
      >
        <span>{selectedOption ? selectedOption.label : placeholder}</span>
        {isOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
      </button>

      {isOpen && (
        <div
          className={cn(
            "absolute z-50 mt-1 w-full rounded-md border border-input bg-[hsl(var(--input-bg))] py-1 shadow-lg max-h-[200px] overflow-y-auto",
            contentClassName,
          )}
        >
          {options.map((option) => (
            <div
              key={option.value}
              className="flex items-center px-3 py-1.5 cursor-pointer hover:bg-muted text-xs text-foreground"
              onClick={() => {
                onChange(option.value)
                setIsOpen(false)
              }}
            >
              <div className="flex items-center justify-center w-4 h-4 mr-2">
                <div
                  className={cn(
                    "w-3.5 h-3.5 rounded-full border flex items-center justify-center",
                    value === option.value ? "border-primary" : "border-muted-foreground/50",
                  )}
                >
                  {value === option.value && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                </div>
              </div>
              <span>{option.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

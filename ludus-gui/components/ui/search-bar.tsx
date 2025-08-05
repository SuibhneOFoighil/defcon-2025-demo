"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { SearchIcon, X, Filter, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface SearchBarProps {
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  onClear?: () => void
  onSearch?: (value: string) => void
  className?: string
  showFilter?: boolean
  onFilterClick?: () => void
  autoFocus?: boolean
  loading?: boolean
}

export function SearchBar({
  placeholder = "Search...",
  value: externalValue,
  onChange,
  onClear,
  onSearch,
  className,
  showFilter = false,
  onFilterClick,
  autoFocus = false,
  loading = false,
}: SearchBarProps) {
  const [value, setValue] = useState(externalValue || "")
  const inputRef = useRef<HTMLInputElement>(null)

  // Sync with external value
  useEffect(() => {
    if (externalValue !== undefined) {
      setValue(externalValue)
    }
  }, [externalValue])

  // Auto focus if needed
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setValue(newValue)
    onChange?.(newValue)
  }

  const handleClear = () => {
    setValue("")
    onClear?.()
    onChange?.("")
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && onSearch) {
      onSearch(value)
    }
  }

  return (
    <div className={cn("relative flex items-center", className)}>
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
        <SearchIcon className="h-4 w-4" />
      </div>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={loading}
        className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-9 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
      />
      {loading ? (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      ) : value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      {showFilter && (
        <button
          type="button"
          onClick={onFilterClick}
          disabled={loading}
          className={cn(
            "ml-2 flex h-9 items-center justify-center rounded-md border border-input bg-background px-3 text-sm hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50",
            !value && !loading && "right-3",
          )}
          aria-label="Filter"
        >
          <Filter className="h-4 w-4 mr-2" />
          <span>Filter</span>
        </button>
      )}
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { ChevronDown } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { BasicRangeInfo } from "@/lib/types"

interface RecentRangeSelectorProps {
  currentRangeId: string
  onRangeSelect: (rangeId: string) => void
  triggerClassName?: string
  ranges?: BasicRangeInfo[] // Accept ranges as prop instead of importing mock data
}

export function RecentRangeSelector({ currentRangeId, onRangeSelect, triggerClassName, ranges = [] }: RecentRangeSelectorProps) {
  const [currentRangeName, setCurrentRangeName] = useState<string>("Select Range")

  // Update selected range name when currentRangeId changes
  useEffect(() => {
    const selectedRange = ranges.find((range) => range.id === currentRangeId)
    if (selectedRange) {
      setCurrentRangeName(selectedRange.name)
    }
  }, [currentRangeId, ranges])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={triggerClassName || "h-8 px-3 text-xs flex items-center gap-1 rounded-md border border-input bg-background hover:bg-secondary/80 hover:text-secondary-foreground cursor-pointer"}>
        {currentRangeName}
        <ChevronDown className={triggerClassName?.includes('text-xl') ? "h-5 w-5" : triggerClassName?.includes('text-lg') ? "h-4 w-4" : "h-3.5 w-3.5 ml-1"} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-64">
        {ranges.length > 0 ? (
          ranges.map((range) => (
            <DropdownMenuItem
              key={range.id}
              className={`text-xs flex justify-between items-center ${range.id === currentRangeId ? "bg-primary/10 text-primary font-medium" : ""}`}
              onClick={() => onRangeSelect(range.id)}
            >
              <span className="truncate max-w-[150px]">{range.name}</span>
            </DropdownMenuItem>
          ))
        ) : (
          <DropdownMenuItem disabled className="text-xs text-muted-foreground">
            No ranges available
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

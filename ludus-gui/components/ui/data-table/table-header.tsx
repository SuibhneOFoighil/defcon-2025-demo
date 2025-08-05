"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface TableHeaderProps {
  title?: string
  selectedItemsCount?: number
  headerActions?: React.ReactNode
  toggleComponent?: React.ReactNode
  className?: string
}

export function TableHeader({
  title,
  selectedItemsCount,
  headerActions,
  toggleComponent,
  className,
}: TableHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      {/* Left: Title or Toggle Component */}
      <div className="flex items-center gap-4">
        {toggleComponent ? (
          toggleComponent
        ) : title ? (
          <h2 className="text-xl font-semibold">{title}</h2>
        ) : null}
      </div>

      {/* Right: Selection count and header actions */}
      <div className="flex items-center gap-4">
        {selectedItemsCount !== undefined && selectedItemsCount > 0 && (
          <div className="text-sm text-muted-foreground">
            {selectedItemsCount} item{selectedItemsCount !== 1 ? 's' : ''} selected
          </div>
        )}
        {headerActions}
      </div>
    </div>
  )
} 
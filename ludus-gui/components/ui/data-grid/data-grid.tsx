"use client"

import type * as React from "react"
import { cn } from "@/lib/utils"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"

// Types
export interface Column<T> {
  id: string
  header: React.ReactNode
  cell: (item: T) => React.ReactNode
  className?: string
}

export interface DataGridProps<T> {
  data: T[]
  columns: Column<T>[]
  keyField: keyof T
  className?: string
  onRowClick?: (item: T, event: React.MouseEvent) => void
  isLoading?: boolean
  emptyState?: React.ReactNode
}

// DataGrid Component
export function DataGrid<T>({
  data,
  columns,
  keyField,
  className,
  onRowClick,
  isLoading = false,
  emptyState,
}: DataGridProps<T>) {
  return (
    <Table className={className}>
      <TableHeader>
        <TableRow className="border-b border-border bg-card hover:bg-transparent data-[state=selected]:bg-transparent">
          {columns.map((column) => (
            <TableHead
              key={column.id}
              className={cn("px-4 py-3 text-left text-sm font-medium text-foreground", column.className)}
            >
              {column.header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <TableRow className="hover:bg-transparent data-[state=selected]:bg-transparent">
            <TableCell colSpan={columns.length} className="px-4 py-6 text-center text-muted-foreground">
              Loading...
            </TableCell>
          </TableRow>
        ) : data.length === 0 ? (
          <TableRow className="hover:bg-transparent data-[state=selected]:bg-transparent">
            <TableCell colSpan={columns.length} className="px-4 py-6 text-center text-muted-foreground">
              {emptyState || "No data available"}
            </TableCell>
          </TableRow>
        ) : (
          data.map((item) => {
            // Check if item has isSelected property for selection styling
            const isSelected = (item as T & { isSelected?: boolean }).isSelected;
            
            return (
              <TableRow
                key={String(item[keyField])}
                className={cn(
                  "border-b border-border hover:bg-muted/20",
                  onRowClick && "cursor-pointer transition-colors",
                  isSelected && "border-l-4 border-l-orange-500 bg-orange-50/30 hover:bg-orange-50/50 dark:bg-orange-500/10 dark:hover:bg-orange-500/20"
                )}
                onClick={(event) => onRowClick && onRowClick(item, event)}
              >
                {columns.map((column) => (
                  <TableCell
                    key={`${String(item[keyField])}-${column.id}`}
                    className={cn("px-4 py-3 text-sm", column.className)}
                  >
                    {column.cell(item)}
                  </TableCell>
                ))}
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  )
}

// DataGridPagination Component
export interface DataGridPaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

export function DataGridPagination({ currentPage, totalPages, onPageChange, className }: DataGridPaginationProps) {
  return (
    <div className={cn("flex items-center justify-between px-2 py-4 border-t border-border", className)}>
      <div className="text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-input bg-background hover:bg-secondary/80 hover:text-secondary-foreground h-8 px-3"
        >
          Previous
        </button>
        <span className="text-sm text-muted-foreground">
          {currentPage}
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-input bg-background hover:bg-secondary/80 hover:text-secondary-foreground h-8 px-3"
        >
          Next
        </button>
      </div>
    </div>
  )
}

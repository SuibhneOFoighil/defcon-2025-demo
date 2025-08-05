"use client"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"

interface TruncatedCellProps {
  content: string
  className?: string
}

export function TruncatedCell({ content, className }: TruncatedCellProps) {
  const [isActuallyTruncated, setIsActuallyTruncated] = useState(false)
  const cellRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const checkTruncation = () => {
      if (cellRef.current) {
        setIsActuallyTruncated(cellRef.current.scrollHeight > cellRef.current.clientHeight)
      }
    }

    // Check immediately and on content change
    checkTruncation()

    // Debounce resize handler
    let resizeTimeout: NodeJS.Timeout
    const handleResize = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(checkTruncation, 150)
    }

    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
      clearTimeout(resizeTimeout)
    }
  }, [content])

  const cellContent = (
    <div
      ref={cellRef}
      // Apply the passed className to the element that might be truncated
      className={cn("line-clamp-3 overflow-hidden text-ellipsis", className)}
    >
      {content}
    </div>
  )

  if (!isActuallyTruncated) {
    return cellContent
  }

  return (
    <Tooltip delayDuration={300}>
      <TooltipTrigger asChild>{cellContent}</TooltipTrigger>
      <TooltipContent className="max-w-xs w-max max-h-[200px] overflow-y-auto p-3">
        {/* This content will use bg-popover and text-popover-foreground from tooltip.tsx */}
        {content}
      </TooltipContent>
    </Tooltip>
  )
}

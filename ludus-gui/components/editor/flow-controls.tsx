"use client"

import { Plus, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FlowControlsProps {
  onZoomIn: () => void
  onZoomOut: () => void
}

export function FlowControls({ onZoomIn, onZoomOut }: FlowControlsProps) {
  return (
    <div className="absolute bottom-4 left-4 z-10">
      <div className="flex flex-col items-center bg-card border border-border rounded p-1 shadow-md">
        <Button variant="ghost" size="icon" className="h-6 w-6 text-foreground" onClick={onZoomIn}>
          <Plus className="h-3 w-3" />
        </Button>
        <div className="h-px w-4 bg-border my-1"></div>
        <Button variant="ghost" size="icon" className="h-6 w-6 text-foreground" onClick={onZoomOut}>
          <Minus className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}

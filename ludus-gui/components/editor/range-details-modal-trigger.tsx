"use client"

import { useState } from "react"
import { Info } from "lucide-react"
import { IconButton } from "@/components/ui/icon-button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { RangeDetailsModal } from "./range-details-modal"

interface RangeDetailsModalTriggerProps {
  projectMetadata: {
    id: string
    name: string
    status: string
  }
  rangeStats: {
    cpus: number
    ram: number
    disk: number
    vlans: {
      name: string
      description: string
    }[]
  }
  onSave: (data: { name: string; cpus: number; ram: number; disk: number }) => void
}

export function RangeDetailsModalTrigger({ 
  projectMetadata, 
  rangeStats, 
  onSave 
}: RangeDetailsModalTriggerProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <IconButton 
            variant="ghost" 
            size="sm" 
            className="h-7 w-7 rounded-full" 
            onClick={() => setIsOpen(true)}
          >
            <Info className="h-4 w-4 text-muted-foreground" />
          </IconButton>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="center">
          <span className="text-xs font-medium">Range Details</span>
        </TooltipContent>
      </Tooltip>
      
      <RangeDetailsModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        projectMetadata={projectMetadata}
        rangeStats={rangeStats}
        onSave={onSave}
      />
    </>
  )
}
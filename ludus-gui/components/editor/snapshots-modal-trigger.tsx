"use client"

import { useState } from "react"
import { Camera } from "lucide-react"
import { IconButton } from "@/components/ui/icon-button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { SnapshotsModal } from "./snapshots-modal"

interface SnapshotsModalTriggerProps {
  userId: string
}

export function SnapshotsModalTrigger({ userId }: SnapshotsModalTriggerProps) {
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
            <Camera className="h-4 w-4 text-muted-foreground" />
          </IconButton>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="center">
          <span className="text-xs font-medium">Manage Snapshots</span>
        </TooltipContent>
      </Tooltip>
      
      <SnapshotsModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        userId={userId}
      />
    </>
  )
}
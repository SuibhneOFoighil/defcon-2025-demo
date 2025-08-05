"use client"

import { useState } from "react"
import { Terminal } from "lucide-react"
import { IconButton } from "@/components/ui/icon-button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { LogsDrawer } from "./logs-drawer"

export function LogsModalTrigger() {
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
            <Terminal className="h-4 w-4 text-muted-foreground" />
          </IconButton>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="center">
          <span className="text-xs font-medium">View Logs</span>
        </TooltipContent>
      </Tooltip>
      
      <LogsDrawer 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </>
  )
}
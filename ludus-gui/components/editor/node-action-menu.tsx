"use client"

import { Play, Pause } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import type { VMData } from "./vm-component"

interface NodeActionMenuProps {
  nodeId: string
  vms?: VMData[]
  onToggleAllVMs: (nodeId: string, action: "start" | "stop") => void
}

export function NodeActionMenu({
  nodeId,
  vms = [],
  onToggleAllVMs,
}: NodeActionMenuProps) {
  // Determine if all VMs are running or not
  const [allRunning, setAllRunning] = useState(false)

  // Update the allRunning state when VMs change
  useEffect(() => {
    if (vms.length === 0) {
      setAllRunning(false)
      return
    }

    const runningCount = vms.filter((vm) => vm.status === "Running").length
    setAllRunning(runningCount === vms.length)
  }, [vms])

  return (
    <div className="bg-background/90 backdrop-blur-sm border border-border rounded-full py-1.5 px-3 flex items-center gap-2 shadow-lg">
      {/* Toggle Start/Stop All VMs - Made smaller */}
      <Button
        variant="outline"
        size="sm"
        className={`h-7 text-xs ${
          allRunning
            ? "text-red-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
            : "text-green-600 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-950/30"
        }`}
        onClick={(e) => {
          e.stopPropagation()
          onToggleAllVMs(nodeId, allRunning ? "stop" : "start")
        }}
      >
        {allRunning ? <Pause className="h-3 w-3 mr-1" /> : <Play className="h-3 w-3 mr-1" />}
        {allRunning ? "Stop All" : "Start All"}
      </Button>
    </div>
  )
}

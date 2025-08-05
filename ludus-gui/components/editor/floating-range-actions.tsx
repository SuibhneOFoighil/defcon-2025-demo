"use client"

import { useState } from "react"
import { Terminal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LogsDrawer } from "./logs-drawer"

interface FloatingRangeActionsProps {
  userID?: string
}

export function FloatingRangeActions({ userID }: FloatingRangeActionsProps) {
  const [showLogs, setShowLogs] = useState(false)

  return (
    <>
      <Button 
        variant="default" 
        size="default" 
        onClick={() => setShowLogs(true)}
        className="bg-card border border-border shadow-md hover:shadow-lg transition-shadow text-foreground hover:bg-secondary/80"
      >
        <Terminal className="h-4 w-4 mr-2" />
        Logs
      </Button>

      <LogsDrawer
        isOpen={showLogs}
        onClose={() => setShowLogs(false)}
        userID={userID}
      />
    </>
  )
}
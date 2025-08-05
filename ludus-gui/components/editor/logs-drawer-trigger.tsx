"use client"

import { useState, useEffect } from "react"
import { Terminal } from "lucide-react"
import { IconButton } from "@/components/ui/icon-button"
import { LogsDrawer } from "./logs-drawer"

interface LogsDrawerTriggerProps {
  className?: string
  variant?: "outline" | "ghost" | "default"
  size?: "sm" | "md" | "lg"
  title?: string
  openOnMount?: boolean
}

export function LogsDrawerTrigger({ 
  className = "shadow-md bg-card/80 backdrop-blur-sm border-border hover:bg-secondary/80",
  variant = "outline",
  size = "lg",
  title = "View Logs",
  openOnMount = false
}: LogsDrawerTriggerProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Check for openLogs query parameter on mount
  useEffect(() => {
    if (openOnMount && typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      if (urlParams.get('openLogs') === 'true') {
        setIsOpen(true)
        // Remove the query parameter from URL without causing a refresh
        const url = new URL(window.location.href)
        url.searchParams.delete('openLogs')
        window.history.replaceState({}, '', url.toString())
      }
    }
  }, [openOnMount])

  return (
    <>
      <IconButton
        variant={variant}
        size={size}
        className={className}
        onClick={() => setIsOpen(true)}
        title={title}
      >
        <Terminal className="h-4 w-4" />
      </IconButton>
      
      <LogsDrawer 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </>
  )
}
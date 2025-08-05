"use client"

import { useState, useRef, useEffect } from "react"
import { Copy, Check, Terminal, AlertCircle, ChevronDown, Maximize2, Minimize2 } from "lucide-react"
import { toast } from "sonner"
import { 
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle
} from "@/components/ui/drawer"
import { useUserPreferences } from "@/hooks/use-user-preferences-local"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useRangeLogs } from "@/hooks/use-range-logs"
import { useTemplateLogs } from "@/hooks/use-template-logs"

export type LogType = 'range' | 'templates'

interface LogsDrawerProps {
  isOpen: boolean
  onClose: () => void
  userID?: string
  initialLogType?: LogType
}

export function LogsDrawer({ isOpen, onClose, userID, initialLogType = 'range' }: LogsDrawerProps) {
  const [copied, setCopied] = useState(false)
  const [logType, setLogType] = useState<LogType>(initialLogType)
  const [isUserScrolling, setIsUserScrolling] = useState(false)
  const logsRef = useRef<HTMLDivElement>(null)
  
  // Use preferences hook for persisted expansion state
  const { preferences, setLogsDrawerExpanded } = useUserPreferences()
  const isExpanded = preferences?.logsDrawerExpanded ?? false
  
  // Fetch range logs
  const rangeLogsResult = useRangeLogs({
    userID,
    tail: 1000,
    enabled: isOpen && logType === 'range',
    refetchInterval: isOpen && logType === 'range' ? 1000 : undefined
  })
  
  // Fetch template logs
  const templateLogsResult = useTemplateLogs({
    userID,
    tail: 1000,
    enabled: isOpen && logType === 'templates',
    refetchInterval: isOpen && logType === 'templates' ? 1000 : undefined
  })
  
  // Use the appropriate logs based on current type
  const { logs, rawLogs, isLoading, isError, error } = 
    logType === 'range' ? rangeLogsResult : templateLogsResult

  // Reset to initial log type when props change
  useEffect(() => {
    setLogType(initialLogType)
  }, [initialLogType])

  // Dismiss all toasts when drawer opens
  useEffect(() => {
    if (isOpen) {
      toast.dismiss()
    }
  }, [isOpen])

  // Auto-scroll to bottom when new logs arrive (only if user is not scrolling)
  useEffect(() => {
    if (logsRef.current && logs.length > 0 && !isUserScrolling) {
      logsRef.current.scrollTop = logsRef.current.scrollHeight
    }
  }, [logs, isUserScrolling])

  // Handle scroll events to detect if user is scrolling
  const handleScroll = () => {
    if (!logsRef.current) return
    
    const { scrollTop, scrollHeight, clientHeight } = logsRef.current
    const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 10
    
    setIsUserScrolling(!isAtBottom)
  }

  const copyLogs = () => {
    if (logsRef.current) {
      // Use raw logs for copying to preserve original format
      const logText = rawLogs || logs
        .map((log) => log.message)
        .join("\n")
      navigator.clipboard.writeText(logText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const toggleExpanded = () => {
    setLogsDrawerExpanded(!isExpanded)
  }

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className={`${isExpanded ? 'h-[95vh] max-h-[95vh]' : 'h-[70vh] max-h-[600px]'} flex flex-col transition-all duration-300 ease-in-out`}>
        <DrawerHeader className="flex flex-row items-center justify-between border-b pb-4">
          <div className="flex items-center gap-3">
            <DrawerTitle className="text-lg font-semibold flex items-center">
              <Terminal className="h-5 w-5 mr-2" />
              Logs
            </DrawerTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 flex items-center gap-1">
                  {logType === 'range' ? 'Range Logs' : logType === 'templates' ? 'Packer Logs' : 'Logs'}
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem 
                  onClick={() => setLogType('range')}
                  className={logType === 'range' ? 'bg-muted text-foreground font-medium' : ''}
                >
                  Range Logs
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setLogType('templates')}
                  className={logType === 'templates' ? 'bg-muted text-foreground font-medium' : ''}
                >
                  Packer Logs
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-8 flex items-center gap-1" onClick={copyLogs}>
              {copied ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 flex items-center gap-1" 
              onClick={toggleExpanded}
              title={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? (
                <Minimize2 className="h-3.5 w-3.5" />
              ) : (
                <Maximize2 className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </DrawerHeader>

        <div className="flex-1 overflow-hidden flex flex-col p-4">

          {isError && (
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to load logs: {error?.message || "Unknown error"}
              </AlertDescription>
            </Alert>
          )}

          <div
            ref={logsRef}
            onScroll={handleScroll}
            className="bg-black dark:bg-gray-950 text-green-400 dark:text-green-300 p-4 rounded-md overflow-y-auto flex-1 font-mono text-sm scrollbar-thin border border-border"
          >
            {isLoading && logs.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="ml-2">Loading logs...</span>
              </div>
            ) : logs.length === 0 ? (
              <div className="text-muted-foreground text-center">
                No logs available
              </div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1 last:mb-0">
                  <span dangerouslySetInnerHTML={{ __html: log.html }} />
                </div>
              ))
            )}
          </div>
          {isUserScrolling && (
            <div className="mt-2 flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (logsRef.current) {
                    logsRef.current.scrollTop = logsRef.current.scrollHeight
                    setIsUserScrolling(false)
                  }
                }}
                className="text-xs"
              >
                <ChevronDown className="h-3 w-3 mr-1" />
                Jump to bottom
              </Button>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
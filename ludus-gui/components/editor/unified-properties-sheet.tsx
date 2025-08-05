"use client"

import { X } from "lucide-react"
import { IconButton } from "@/components/ui/icon-button"
import type { VMData } from "./vm-component"
import type { Edge } from "@xyflow/react"
import type { RangeConfig, RouterConfig } from "@/lib/types/range-config"
import type { Template } from "@/lib/types"
import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { RouterDetailsPanel } from "./router-properties-view"
import { VLANPropertiesView } from "./vlan-properties-view"
import { ConnectionPropertiesSheet } from "./connection-properties-sheet"

// ============================================================================
// TYPES & CONSTANTS
// ============================================================================

// Panel width constraints
const MIN_PANEL_WIDTH = 300
const MAX_PANEL_WIDTH = 800
const DEFAULT_PANEL_WIDTH = 400

interface UnifiedPropertiesSheetProps {
  selectedVLAN: string | null
  selectedEdge: Edge | null
  selectedRouter?: boolean
  routerNode?: { id: string; type: string; data: Record<string, unknown> } | undefined
  onClose: () => void
  onUpdateVM: (vmId: string, settings: Partial<VMData>) => Promise<void>
  onSaveEdge: (data: { edgeId: string; ruleSettings: Record<string, unknown>; networkSettings: RangeConfig['network'] }) => Promise<void>
  onSaveRouter: (settings: RouterConfig) => Promise<void>
  networkSettings?: RangeConfig['network']
  nodes: Array<{ id: string; type: string; data: { label?: string; vms?: VMData[] } }>
  templates?: Template[]
}



// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function UnifiedPropertiesSheet({
  selectedVLAN,
  selectedEdge,
  selectedRouter,
  routerNode,
  onClose,
  onUpdateVM,
  onSaveEdge,
  onSaveRouter,
  networkSettings,
  nodes,
  templates,
}: UnifiedPropertiesSheetProps) {
  // Resize functionality
  const [width, setWidth] = useState(() => {
    if (typeof window !== 'undefined') {
      return parseInt(localStorage.getItem('properties-panel-width') || DEFAULT_PANEL_WIDTH.toString())
    }
    return DEFAULT_PANEL_WIDTH
  })
  const [isResizing, setIsResizing] = useState(false)
  const resizeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    localStorage.setItem('properties-panel-width', width.toString())
  }, [width])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return
      
      const newWidth = window.innerWidth - e.clientX
      const constrainedWidth = Math.max(MIN_PANEL_WIDTH, Math.min(MAX_PANEL_WIDTH, newWidth))
      setWidth(constrainedWidth)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isResizing])

  const getSidebarContent = () => {
    if (selectedEdge) {
      return (
        <ConnectionPropertiesSheet
          edge={selectedEdge} 
          networkSettings={networkSettings}
          onSaveEdge={onSaveEdge}
        />
      )
    }
    
    if (selectedVLAN) {
      return (
        <VLANPropertiesView
          vlanId={selectedVLAN}
          nodes={nodes}
          onUpdateVM={onUpdateVM}
          templates={templates}
        />
      )
    }
    
    if (selectedRouter && routerNode) {
      return (
        <RouterDetailsPanel
          routerData={routerNode.data}
          onSaveRouter={onSaveRouter}
          templates={templates}
        />
      )
    }
    
    return null
  }

  return (
    <div className="relative flex">
      {/* Resize handle */}
      <div
        ref={resizeRef}
        className={cn(
          "absolute left-0 top-0 bottom-0 w-1 cursor-col-resize bg-border/50 hover:bg-border transition-colors z-10",
          isResizing && "bg-primary"
        )}
        onMouseDown={() => setIsResizing(true)}
        role="separator"
        aria-label="Resize properties panel"
        aria-orientation="vertical"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') {
            setWidth(prev => Math.max(MIN_PANEL_WIDTH, prev - 10))
          } else if (e.key === 'ArrowRight') {
            setWidth(prev => Math.min(MAX_PANEL_WIDTH, prev + 10))
          }
        }}
      />
      
      {/* Properties panel */}
      <div 
        className="flex flex-col h-full bg-background border-l border-border shadow-lg"
        style={{ width: `${width}px` }}
      >
      {/* Header bar with close button */}
      <div className="flex items-center justify-between h-10 px-3 bg-muted/20 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-primary rounded-full"></div>
          <span className="text-sm font-medium text-muted-foreground">
            {selectedEdge ? "Firewall Rule Details" : selectedVLAN ? "VLAN Details" : selectedRouter ? "Router Configuration" : "Properties"}
          </span>
        </div>
        <IconButton
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </IconButton>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {getSidebarContent()}
      </div>
      </div>
    </div>
  )
}
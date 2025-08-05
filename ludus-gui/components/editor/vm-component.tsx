"use client"

import React from "react"

import { Cpu, MemoryStick, Trash2, Circle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { getTemplateIcon } from "@/lib/utils/template-icons"
import { useTutorialStyling } from "@/hooks/use-tutorial-styling"

// Import enhanced VMData from centralized types
import type { VMData } from "@/lib/types"

// Re-export VMData for other components
export type { VMData }

interface VMComponentProps {
  data: VMData
  selected?: boolean
  onViewDetails?: (vm: VMData) => void
  onMoveToVLAN?: (vmId: string, targetVlanId: string) => void
  allVLANs?: Array<{ id: string; label: string }>
  availableVLANs?: Array<{ id: string; label: string }>
  currentVLANId?: string
  onDeleteVM?: (vmId: string) => void // New prop for delete handler
  showDeleteButton?: boolean // Control delete button visibility
  deleteButtonVariant?: 'hover' | 'always' // Visibility behavior
}

export function VMComponent({
  data,
  selected = false,
  onViewDetails,
  onMoveToVLAN,
  allVLANs = [],
  currentVLANId,
  onDeleteVM,
  showDeleteButton = false,
  deleteButtonVariant = 'hover',
}: VMComponentProps) {
  // Tutorial styling hook
  const { isActive: isTutorialActive, tutorialClasses } = useTutorialStyling([
    `[data-vm-template*="${data.template}"]`,
    `[data-vm-id="${data.id}"]`,
    '[data-testid="vm-component"]'
  ])

  const getStatusColor = () => {
    if (!data.isDeployed) {
      return "text-blue-500"
    }
    
    switch (data.status) {
      case "Running":
        return "text-green-500"
      case "Stopped":
        return "text-red-500"
      case "Suspended":
        return "text-yellow-500"
      default:
        return "text-gray-500"
    }
  }

  const getStatusText = () => {
    if (!data.isDeployed) {
      return "Not Deployed"
    }
    return data.status || "Unknown"
  }


  const selectionClass = selected
    ? "border-primary/50 border-l-4 border-l-primary border-y border-r"
    : "border border-gray-200 dark:border-gray-800"

  return (
    <div
      className={cn(
        "relative p-3 shadow-sm bg-card w-full transition-all duration-200 hover:scale-[1.01] group rounded-lg",
        selectionClass,
        onViewDetails ? 'cursor-pointer' : 'cursor-default',
        tutorialClasses
      )}
      onClick={(e) => {
        // Prevent ReactFlow from handling this click
        e.stopPropagation()
        if (onViewDetails) {
          onViewDetails(data)
        }
      }}
      data-testid="vm-component"
      data-vm-id={data.id}
      data-vm-template={data.template}
    >
      {/* Header: VM Icon, Name, and Type */}
      <div className="flex items-center gap-2 mb-2">
        <div className="relative">
          <div
            className="rounded-md w-7 h-7 flex items-center justify-center bg-muted border border-border"
            title={`Virtual Machine - ${data.template}`}
          >
            {getTemplateIcon(data.template || "unknown", "h-4 w-4 text-foreground")}
          </div>
          {/* Status indicator - small circle in bottom right of icon */}
          <div 
            className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ${getStatusColor()}`}
            title={getStatusText()}
          >
            <Circle className="h-3 w-3 fill-current" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-foreground truncate leading-tight">
            {data.vmName || data.label}
          </h3>
          <div className="flex items-center gap-1">
            <p className="text-xs text-muted-foreground leading-tight">{data.template}</p>
            <span className="text-xs text-muted-foreground">•</span>
            <span className={`text-xs font-medium ${getStatusColor()}`}>
              {getStatusText()}
            </span>
          </div>
        </div>
      </div>

      {/* VM Metadata: CPU, RAM, IP */}
      <div className="flex items-center gap-3 mb-2 text-xs text-muted-foreground">
        {data.cpus && (
          <div className="flex items-center gap-1">
            <Cpu className="h-3 w-3" />
            <span>{data.cpus} CPU{data.cpus > 1 ? 's' : ''}</span>
          </div>
        )}
        {data.ramGb && (
          <div className="flex items-center gap-1">
            <MemoryStick className="h-3 w-3" />
            <span>
              {data.ramGb}GB RAM
              {data.ramMinGb && (
                <span className="text-blue-600 dark:text-blue-400 font-medium">
                  {' '}(min: {data.ramMinGb}GB)
                </span>
              )}
            </span>
          </div>
        )}
        {(data.ipLastOctet || data.ipAddress) && (
          <div className="text-xs text-muted-foreground">
            IP: {data.ipAddress || `10.0.${data.vlan || 0}.${data.ipLastOctet || 0}`}
          </div>
        )}
      </div>

      {/* Roles Row */}
      {Array.isArray(data.roles) && data.roles.length > 0 && (
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-[9px] text-muted-foreground font-medium">Roles:</span>
          {data.roles.slice(0, 3).map((role, index) => {
            const roleName = typeof role === 'string' ? role : role.name
            const displayName = roleName.replace(/^ludus_/, '')
            return (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                    <span className="truncate max-w-[80px]">{displayName}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">{roleName}</p>
                </TooltipContent>
              </Tooltip>
            )
          })}
          {/* Show "+N more" if there are additional roles */}
          {data.roles.length > 3 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800">
                  +{data.roles.length - 3} more
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="space-y-1">
                  <p className="text-xs font-medium">Additional roles:</p>
                  {data.roles.slice(3).map((role, index) => {
                    const roleName = typeof role === 'string' ? role : role.name
                    return (
                      <p key={index} className="text-xs">{roleName}</p>
                    )
                  })}
                </div>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      )}

      {/* Footer: Actions (VLAN Selector) */}
      <div className="relative flex items-center pt-1.5 mt-1.5 border-t border-border/30">
        {/* VLAN Selector */}
        <div className="flex-1 max-w-[90px]">
          <Select
            value={currentVLANId}
            onValueChange={(value) => {
              if (value !== currentVLANId && onMoveToVLAN) {
                onMoveToVLAN(data.id, value)
              }
            }}
            disabled={allVLANs.length <= 1}
          >
            <SelectTrigger
              className="h-5 text-[9px] px-1.5 border border-border bg-muted/50"
              onClick={(e) => e.stopPropagation()}
            >
              <SelectValue placeholder="VLAN" />
            </SelectTrigger>
            <SelectContent>
              {allVLANs.length === 0 ? (
                <SelectItem value="no-vlans-available" disabled className="text-[10px]">
                  No VLANs available
                </SelectItem>
              ) : (
                allVLANs.map((vlan) => (
                  <SelectItem
                    key={vlan.id}
                    value={vlan.id}
                    className="text-[10px]"
                  >
                    {vlan.label}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
        
        {/* Delete Button - Bottom Right Corner */}
        {onDeleteVM && showDeleteButton && (
          <button
            className={cn(
              "absolute bottom-0 right-0 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200 flex items-center justify-center p-0.5",
              deleteButtonVariant === 'hover' 
                ? 'opacity-0 group-hover:opacity-100' 
                : 'opacity-100'
            )}
            onClick={(e) => {
              e.stopPropagation()
              onDeleteVM(data.id)
            }}
            title="Delete Virtual Machine"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}

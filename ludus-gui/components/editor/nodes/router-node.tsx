"use client"

import React, { memo, useState, useMemo } from "react"
import { Position, type NodeProps } from "@xyflow/react"
import { Cpu, MemoryStick, Circle, Router } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { RouterNodeData } from "@/lib/types"
import { CustomHandle } from "../custom-handle"
import { useNodeSelection } from "@/hooks/use-node-selection"
import { useRangeEditor } from "@/contexts/range-editor-context"
import { getTemplateIcon } from "@/lib/utils/template-icons"

// ============================================================================
// Router Node Component
// ============================================================================

export const RouterNode = memo(({ id, data, selected, isConnectable }: NodeProps) => {
  const { borderClass } = useNodeSelection(id as string)
  const { selectionManager, topologyState } = useRangeEditor()
  const [isHovered, setIsHovered] = useState(false)
  const routerData = data as RouterNodeData

  const nodeBorderClass = borderClass as string
  const isHandleVisible = selected || isHovered

  const handleRouterClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    // Directly clear VM selection and select router
    selectionManager.selectRouter(topologyState.reactFlowInstance)
  }

  const getStatusColor = useMemo(() => {
    if (routerData.status === "Running" || routerData.poweredOn) {
      return "text-green-500"
    }
    if (routerData.status === "Stopped" || !routerData.poweredOn) {
      return "text-red-500"
    }
    if (routerData.status === "Suspended") {
      return "text-yellow-500"
    }
    return "text-gray-500"
  }, [routerData.status, routerData.poweredOn])

  const getStatusText = useMemo(() => {
    if (routerData.status) {
      return routerData.status
    }
    return routerData.poweredOn ? "Running" : "Stopped"
  }, [routerData.status, routerData.poweredOn])

  return (
    <div
      className={`
        shadow-lg rounded-xl bg-card ${nodeBorderClass} 
        w-[var(--node-width)] min-h-[150px] 
        transition-all duration-200 relative group
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleRouterClick}
    >
      {/* Node Handles - Source at top (outgoing), Target at bottom (incoming) */}
      {/* Top handle: Source (outgoing connections) */}
      <CustomHandle
        type="source"
        position={Position.Top}
        id="top-source"
        isConnectable={!!isConnectable}
        isHandleVisible={isHandleVisible}
      />
      
      {/* Bottom handle: Target (incoming connections) */}
      <CustomHandle
        type="target"
        position={Position.Bottom}
        id="bottom-target"
        isConnectable={!!isConnectable}
        isHandleVisible={isHandleVisible}
      />

      {/* Router Header */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-md w-8 h-8 flex items-center justify-center bg-muted">
            <Router className="h-5 w-5 text-foreground" />
          </div>
          <div className="text-sm font-medium text-foreground">Router</div>
        </div>
      </div>

      {/* Router Content */}
      <div className="w-full p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="relative">
            <div
              className="rounded-md w-8 h-8 flex items-center justify-center bg-muted border border-border"
              title={`Router - ${routerData.template}`}
            >
              {getTemplateIcon(routerData.template || "router", "h-5 w-5 text-foreground")}
            </div>
            {/* Status indicator - small circle in bottom right of icon */}
            <div 
              className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ${getStatusColor}`}
              title={getStatusText}
            >
              <Circle className="h-3 w-3 fill-current" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-foreground truncate leading-tight">
              {routerData.vm_name}
            </h3>
            <div className="flex items-center gap-1">
              <p className="text-xs text-muted-foreground leading-tight">
                {routerData.template}
              </p>
              <span className="text-xs text-muted-foreground">•</span>
              <span className={`text-xs font-medium ${getStatusColor}`}>
                {getStatusText}
              </span>
            </div>
          </div>
        </div>

        {/* Router Metadata: CPU, RAM */}
        <div className="flex items-center gap-3 mb-3 text-xs text-muted-foreground">
          {routerData.cpus && (
            <div className="flex items-center gap-1">
              <Cpu className="h-3 w-3" />
              <span>{routerData.cpus} CPU{routerData.cpus > 1 ? 's' : ''}</span>
            </div>
          )}
          {routerData.ram_gb && (
            <div className="flex items-center gap-1">
              <MemoryStick className="h-3 w-3" />
              <span>
                {routerData.ram_gb}GB RAM
                {routerData.ram_min_gb && (
                  <span className="text-blue-600 dark:text-blue-400 font-medium">
                    {' '}(min: {routerData.ram_min_gb}GB)
                  </span>
                )}
              </span>
            </div>
          )}
        </div>

        {/* Roles Row */}
        {Array.isArray(routerData.roles) && routerData.roles.length > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] text-muted-foreground font-medium">Roles:</span>
            {routerData.roles.slice(0, 3).map((role, index) => {
              const displayName = role.replace(/^ludus_/, '')
              return (
                <Tooltip key={index}>
                  <TooltipTrigger asChild>
                    <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                      <span className="truncate max-w-[80px]">{displayName}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">{role}</p>
                  </TooltipContent>
                </Tooltip>
              )
            })}
            {/* Show "+N more" if there are additional roles */}
            {routerData.roles.length > 3 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800">
                    +{routerData.roles.length - 3} more
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="space-y-1">
                    <p className="text-xs font-medium">Additional roles:</p>
                    {routerData.roles.slice(3).map((role, index) => (
                      <p key={index} className="text-xs">{role}</p>
                    ))}
                  </div>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        )}
      </div>
    </div>
  )
})

RouterNode.displayName = "RouterNode"
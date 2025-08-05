"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import {
  BaseEdge,
  EdgeLabelRenderer,
  type EdgeProps,
  getBezierPath,
  useReactFlow,
} from "@xyflow/react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { EdgeData } from "@/lib/types"

export default function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  source,
  target,
  data,
  style = {},
  markerEnd,
  selected,
}: EdgeProps) {
  // Check if this is a self-connection (source and target are the same node)
  const isSelfConnection = source === target

  // Use different path calculation for self-connections
  let edgePath = ""
  let labelX = 0
  let labelY = 0

  if (isSelfConnection) {
    // Create a loopback path for self-connections
    // Calculate a control point above the node
    const controlX = sourceX + 150 // Move control point to the right
    const controlY = sourceY - 100 // Move control point up

    // Create a quadratic bezier curve for the self-connection
    edgePath = `M ${sourceX} ${sourceY} C ${controlX} ${controlY}, ${controlX + 100} ${controlY}, ${targetX} ${targetY}`

    // Position the label at the top of the loop
    labelX = controlX + 50
    labelY = controlY
  } else {
    // Use the standard bezier path for normal connections
    ;[edgePath, labelX, labelY] = getBezierPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
      curvature: 0.25, // Reduced curvature for horizontal connections
    })
  }

  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reactFlowInstance = useReactFlow()

  // Add a new state for animation
  const [isAnimating, setIsAnimating] = useState(false)

  // Track previous connection type to detect changes
  const connectionData = data as EdgeData
  const prevConnectionTypeRef = useRef(connectionData?.status?.connectionType || "accept")

  // Determine edge color based on selection state and connection type
  const getEdgeColor = () => {
    // Color based on connection type
    const connectionType = connectionData?.status?.connectionType || "accept"

    switch (connectionType) {
      case "accept":
        return "hsl(142, 71%, 45%)" // Green
      case "deny":
        return "hsl(0, 84%, 60%)" // Red
      case "drop":
        return "hsl(45, 100%, 60%)" // Amber
      default:
        return "hsl(var(--topology-edge))"
    }
  }

  const edgeColor = getEdgeColor()
  // Use a larger stroke width when animating
  const edgeWidth = isAnimating ? 4 : selected ? 2 : 1
  const edgeOpacity = isAnimating ? 1 : selected ? 1 : 0.8

  // Handle mouse enter for the edge
  const handleMouseEnter = () => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }

  // Handle mouse leave for the edge
  const handleMouseLeave = () => {
    // Set a timeout to hide the menu
    timeoutRef.current = setTimeout(() => {
      // No longer needed since we removed hover controls
    }, 300) // 300ms delay before hiding
  }


  // Handle edge action menu events
  const handleEdit = useCallback((edgeId: string) => {
    console.log(`Edit edge ${edgeId}`)

    // Select the edge in ReactFlow
    reactFlowInstance.setEdges((eds) =>
      eds.map((edge) => ({
        ...edge,
        selected: edge.id === edgeId,
      })),
    )

    // Trigger the global edge selection event
    if (connectionData && typeof connectionData.onEdit === 'function') {
      connectionData.onEdit(edgeId)
    }
  }, [reactFlowInstance, connectionData])


  // Add useEffect to watch for connection type changes and trigger animation
  useEffect(() => {
    const currentType = connectionData?.status?.connectionType || "accept"

    // Only animate if the connection type has changed
    if (currentType !== prevConnectionTypeRef.current) {
      console.log(`Connection type changed from ${prevConnectionTypeRef.current} to ${currentType}`)
      setIsAnimating(true)

      // Update the ref with the new value
      prevConnectionTypeRef.current = currentType

      // Stop animation after a delay
      const timer = setTimeout(() => {
        setIsAnimating(false)
      }, 1500) // Longer animation duration

      return () => clearTimeout(timer)
    }
  }, [connectionData?.status?.connectionType])

  // Create a dynamic class for the edge based on the connection type and animation state
  const getEdgeClass = () => {
    if (!isAnimating) return "cursor-pointer"

    const connectionType = connectionData?.status?.connectionType || "accept"
    switch (connectionType) {
      case "accept":
        return "cursor-pointer edge-pulse-accept"
      case "deny":
        return "cursor-pointer edge-pulse-deny"
      case "drop":
        return "cursor-pointer edge-pulse-drop"
      default:
        return "cursor-pointer"
    }
  }


  // Get badge variant based on connection type
  const getBadgeVariant = (connectionType: string) => {
    switch (connectionType) {
      case "accept":
        return "success"
      case "deny":
        return "danger"
      case "drop":
        return "warning"
      default:
        return "default"
    }
  }

  return (
    <>
      {/* The actual edge path wrapped in a group for event handling */}
      <g
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={() => handleEdit(id)}
        className={getEdgeClass()}
        data-animating={isAnimating ? "true" : "false"}
        data-connection-type={connectionData?.status?.connectionType || "accept"}
      >
        <BaseEdge
          path={edgePath}
          markerEnd={markerEnd}
          style={{
            ...style,
            strokeWidth: edgeWidth,
            stroke: edgeColor,
            strokeOpacity: edgeOpacity,
            transition: isAnimating ? "none" : "stroke 0.2s, stroke-width 0.2s, stroke-opacity 0.2s",
          }}
        />
      </g>

      {/* Edge Label and Action Menu */}
      <EdgeLabelRenderer>
        {/* Edge Label */}
        {connectionData?.label && (
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: "all",
            }}
            className="nodrag nopan"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={(e) => {
              e.stopPropagation()
              handleEdit(id)
            }}
          >
            <Badge
              variant={getBadgeVariant(connectionData?.status?.connectionType || "accept")}
              size="sm"
              className={cn(
                "cursor-pointer transition-colors duration-200 font-semibold shadow-lg",
                // Enhanced background with better opacity and backdrop blur
                "bg-[hsl(var(--card-bg))]/95 backdrop-blur-sm border-2",
                "hover:bg-[hsl(var(--card-bg))] hover:shadow-xl",
                // Better text contrast and sizing
                "text-xs px-3 py-1.5 min-w-[60px] text-center",
                // Connection type specific styling with stronger contrast
                connectionData?.status?.connectionType === "accept" && [
                  "border-[hsl(var(--success))] text-white",
                  "bg-[hsl(var(--success))] hover:bg-[hsl(var(--success))]/90"
                ],
                connectionData?.status?.connectionType === "deny" && [
                  "border-[hsl(var(--destructive))] text-white", 
                  "bg-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive))]/90"
                ],
                connectionData?.status?.connectionType === "drop" && [
                  "border-amber-500 text-white",
                  "bg-amber-500 hover:bg-amber-500/90"
                ],
                // Default styling for better contrast
                !connectionData?.status?.connectionType && [
                  "border-[hsl(var(--border))] text-[hsl(var(--foreground))]",
                  "bg-[hsl(var(--muted))]/20 hover:bg-[hsl(var(--muted))]/30"
                ],
                // Selection state with stronger ring
                selected && "ring-2 ring-[hsl(var(--primary))] ring-offset-2 ring-offset-[hsl(var(--topology-background))]"
              )}
            >
              {String(connectionData?.status?.name || connectionData?.label || 'Connection')}
            </Badge>
          </div>
        )}

      </EdgeLabelRenderer>
    </>
  )
}

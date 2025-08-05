"use client"

import React, { memo, useState } from "react"
import { Position, type NodeProps, useReactFlow } from "@xyflow/react"
import { Network, Boxes, Monitor, Plus } from "lucide-react"
import type { NodeData, VMData } from "@/lib/types"
import { VMComponent } from "../vm-component"
import { CustomHandle } from "../custom-handle"
import { useNodeSelection } from "@/hooks/use-node-selection"
import { useRangeEditor } from "@/contexts/range-editor-context"

// ============================================================================
// VLAN Node Component
// ============================================================================

export const VlanNode = memo(({ id, data, isConnectable, selected }: NodeProps) => {
  const { borderClass } = useNodeSelection(id as string)
  const { selectionManager, topologyState } = useRangeEditor()
  const [isHovered, setIsHovered] = useState(false)
  const nodeData = data as NodeData
  const isDropTarget = nodeData.isDropTarget || false
  const { getNodes } = useReactFlow()

  const icon =
    nodeData.label === "VLAN 1" ? (
      <Boxes className="h-5 w-5 text-foreground" />
    ) : (
      <Network className="h-5 w-5 text-foreground" />
    )

  const nodeBorderClass = isDropTarget ? "border-2 border-dashed border-primary" : (borderClass as string)
  const isHandleVisible = selected || isHovered

  // Handle clicks on empty VLAN space to deselect VMs and select VLAN
  const handleVlanClick = React.useCallback((e: React.MouseEvent) => {
    // Only handle clicks that aren't on VM components or other interactive elements
    // VM components already call e.stopPropagation() so this won't fire for VM clicks
    e.stopPropagation()
    
    // Clear VM selection when clicking empty VLAN space
    if (nodeData.onClearVMSelection) {
      nodeData.onClearVMSelection()
    }
    
    // Select this VLAN node
    selectionManager.selectVLAN(id, topologyState.reactFlowInstance)
  }, [nodeData, selectionManager, id, topologyState.reactFlowInstance])

  // Get all VLANs for the dropdown (including current for display, excluding current for options)
  const allVLANs = getNodes()
    .filter((node) => node.type === "vlan")
    .map((node) => ({
      id: node.id,
      label: (node.data?.label as string) || "VLAN",
    }))
  
  const availableVLANs = allVLANs.filter((vlan) => vlan.id !== id)

  return (
    <div
      className={`
        shadow-lg rounded-xl bg-card ${nodeBorderClass} 
        w-[var(--node-width)] min-h-[150px] 
        transition-all duration-200 relative group
      `}
      data-drop-target={isDropTarget ? "true" : "false"}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleVlanClick}
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

      {/* VLAN Header */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-md w-8 h-8 flex items-center justify-center bg-muted">
            {icon}
          </div>
          <div className="text-sm font-medium text-foreground">{nodeData.label || "VLAN"}</div>
        </div>
      </div>

      {/* VM List or Empty State */}
      <div className="w-full p-2">
        {nodeData.vms && nodeData.vms.length > 0 ? (
          <div className="flex flex-col space-y-1">
            {nodeData.vms.map((vm: VMData) => (
              <VMComponent
                key={vm.id}
                data={vm}
                selected={nodeData.selectedVMId === vm.id}
                onViewDetails={(vm) => nodeData.onViewVMDetails && nodeData.onViewVMDetails(vm, id, nodeData.label || "VLAN")}
                onMoveToVLAN={nodeData.onMoveVMToVLAN}
                availableVLANs={availableVLANs}
                allVLANs={allVLANs}
                currentVLANId={id}
                onDeleteVM={nodeData.onDeleteVM ? (vmId: string) => nodeData.onDeleteVM!(vmId, id) : undefined}
                showDeleteButton={true}
                deleteButtonVariant="always"
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
            <div className="rounded-full bg-muted p-3 mb-3">
              <Monitor className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground mb-1">No VMs in this VLAN</p>
            <p className="text-xs text-muted-foreground/70">Drag existing VMs here</p>
            {isDropTarget && (
              <div className="mt-3 flex items-center text-xs text-primary font-medium">
                <Plus className="h-3 w-3 mr-1" />
                Drop VM to add
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
})

VlanNode.displayName = "VlanNode"

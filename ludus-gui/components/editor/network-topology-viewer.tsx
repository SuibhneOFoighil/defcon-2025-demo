"use client"

import React, { useMemo } from "react"
import "@xyflow/react/dist/style.css"

import { VlanNode } from "./nodes/vlan-node"
import { RouterNode } from "./nodes/router-node"
import CustomEdge from "./custom-edge"
import type { Node, Edge, NodeTypes, EdgeTypes } from "@xyflow/react"
import type { NodeData, VMData } from "@/lib/types"
import { ComponentSidebar } from "./component-sidebar"
import { UnifiedPropertiesSheet } from "./unified-properties-sheet"
import { FlowCanvas } from "./flow-canvas"
import { NetworkTopologySkeleton } from "@/components/editor/network-topology-skeleton"
import { RangeEditorProvider, useRangeEditor } from "@/contexts/range-editor-context"
import { RangeEditorHeader } from "./range-editor-header"
import { NetworkConnectionsDialog } from "./network-connections-dialog"
import { VlanDeleteConfirmModal } from "./vlan-delete-confirm-modal"
import { ConfirmModal } from "@/components/ui/modal/confirm-modal"
import { componentLogger } from "@/lib/logger"
import { useVMDeleteModal } from "@/hooks/use-vm-delete-modal"
import { useVMDeleteModalIntegration } from "@/hooks/use-vm-delete-modal-integration"
import type { Template } from "@/lib/types"
import type { components } from '@/lib/api/ludus/schema'
import { FloatingRangeActions } from "./floating-range-actions"

// Props interface for NetworkTopologyViewer
interface NetworkTopologyViewerProps {
  initialNodes: Node<NodeData>[]
  initialEdges: Edge[]
  templates: Template[]
  projectMetadata: {
    id: string
    name: string
    status: string
  }
  rangeStats: {
    cpus: number
    ram: number
    disk: number
    vlans: {
      name: string
      description: string
    }[]
  }
  currentRange?: components['schemas']['RangeObject']
  editorData?: any // Optional editor data for mock scenarios
  // Loading states for progressive loading
  loading?: {
    templates?: boolean
    rangeData?: boolean
    rangeConfig?: boolean
  }
}

// Memoized node and edge types to prevent React Flow warnings
const nodeTypes: NodeTypes = {
  vlan: VlanNode,
  router: RouterNode,
}

const edgeTypes: EdgeTypes = {
  custom: CustomEdge,
}

// The main content component that uses the context
function NetworkTopologyContent() {
  const {
    // Data
    templates,
    effectiveRangeData,
    isAnyTemplateBuilding,
    // Topology state
    nodes,
    edges,
    reactFlowInstance,
    reactFlowWrapper,
    // Selection state
    selectedVLAN,
    selectedEdge,
    selectedRouter,
    // Network configuration
    networkConfig,
    // Testing state
    testingMode,
    allowedDomains,
    allowedIPs,
    // Modal states
    isNotificationPanelOpen,
    showNetworkConnectionsDialog,
    activeVlanForConnections,
    showVlanDeleteConfirmModal,
    // Range actions and mutations
    deployRangeMutation,
    startTestingMutation,
    stopTestingMutation,
    abortDeploymentMutation,
    destroyRangeMutation,
    powerOnMutation,
    powerOffMutation,
    handleDeployRange,
    handleAbortDeployment,
    handleDestroyAllVMs,
    handlePowerOnAllVMs,
    handlePowerOffAllVMs,
    handleStartTesting,
    handleStopTesting,
    // Topology actions
    handleTemplateClick,
    // Event handlers
    onNodesChange,
    onEdgesChange,
    onConnect,
    isValidConnection,
    onSelectionChange,
    onDragOver,
    onDragLeave,
    onDrop,
    onDelete,
    onDeleteVM,
    onMove,
    // Selection handlers
    handlePaneClick,
    handleClosePropertiesPanel,
    // Auto-save functions
    onUpdateVM,
    onSaveEdge,
    onSaveRouter,
    // Range details
    currentProjectMetadata,
    currentRangeStats,
    handleSaveRangeDetails,
    // Modal controls
    setShowLogsModal,
    setIsNotificationPanelOpen,
    setShowNetworkConnectionsDialog,
    setShowVlanDeleteConfirmModal,
    // Utilities
    getResourceTotals,
    getVlanConnections,
    addHandlersToNodes,
    handleReactFlowInit,
    // Selection manager for VM selection state
    selectionManager,
  } = useRangeEditor()

  // State for VLAN deletion confirmation
  const [vlanToDelete, setVlanToDelete] = React.useState<Node<NodeData> | null>(null)
  
  // VM delete modal hook - handles UI modal state and confirmation logic
  const { vmToDelete, showDeleteModal, hideDeleteModal, confirmDelete, isModalOpen } = useVMDeleteModal({
    onDeleteVM, // Business logic: actual VM deletion
    nodes
  })

  // Node integration hook - overrides business delete handler with UI modal trigger
  // This separates concerns: context handles business logic, viewer handles UI logic
  const nodesWithModalDeleteHandler = useVMDeleteModalIntegration({
    nodes,
    addHandlersToNodes, // Adds business logic handlers from context
    showDeleteModal    // UI logic: shows modal instead of direct deletion
  })

  // Memoize router node lookup to prevent redundant array searches
  const routerNode = useMemo(() => {
    const routerNode = nodes.find(n => n.type === 'router');
    return routerNode ? {
      id: routerNode.id,
      type: routerNode.type!,
      data: routerNode.data as Record<string, unknown>
    } : undefined;
  }, [nodes])

  // Handle keyboard events for VM and VLAN deletion
  const handleKeyDown = React.useCallback((event: React.KeyboardEvent) => {
    componentLogger.debug({ 
      key: event.key, 
      target: event.target?.constructor?.name,
      selectedNodesCount: nodes.filter(node => node.selected).length,
      selectedEdgesCount: edges.filter(edge => edge.selected).length,
      selectedVMId: selectionManager.selectedVMId
    }, 'Key pressed in NetworkTopologyViewer')
    
    // Check if Delete or Backspace key was pressed
    if (event.key === 'Delete' || event.key === 'Backspace') {
      // PRIORITY 1: Check for selected VM first (takes precedence over VLAN)
      if (selectionManager.selectedVMId) {
        componentLogger.info({ vmId: selectionManager.selectedVMId }, 'VM deletion requested via keyboard - triggering VM delete modal')
        
        // Find the VLAN that contains this VM
        const vlanNode = nodes.find(node => 
          node.type === 'vlan' && 
          node.data.vms?.some((vm: VMData) => vm.id === selectionManager.selectedVMId)
        )
        
        if (vlanNode) {
          event.preventDefault()
          event.stopPropagation()
          
          // Trigger VM deletion (this will show the VM delete modal)
          showDeleteModal(selectionManager.selectedVMId, vlanNode.id)
          return
        }
      }
      
      // PRIORITY 2: Check if any selected node is a VLAN
      const selectedNodes = nodes.filter(node => node.selected)
      const selectedVlanNode = selectedNodes.find(node => node.type === 'vlan')
      
      if (selectedVlanNode) {
        componentLogger.info({ vlanId: selectedVlanNode.id, vlanLabel: selectedVlanNode.data.label }, 'VLAN node deletion requested - showing confirmation')
        
        // Only prevent default for VLAN nodes - show confirmation modal
        event.preventDefault()
        event.stopPropagation()
        
        setVlanToDelete(selectedVlanNode)
        setShowVlanDeleteConfirmModal(true)
        return
      }
      
      // For edges and non-VLAN nodes, let ReactFlow handle deletion normally
      // The onDelete callback will be triggered automatically
      componentLogger.debug('Non-VLAN elements selected - letting ReactFlow handle deletion')
    }
  }, [nodes, edges, selectionManager.selectedVMId, showDeleteModal, setShowVlanDeleteConfirmModal])

  // Handle confirmed VLAN deletion
  const handleConfirmVlanDeletion = React.useCallback(() => {
    if (vlanToDelete && reactFlowInstance) {
      componentLogger.info({ vlanId: vlanToDelete.id }, 'Confirming VLAN deletion')
      
      // Find connected edges to this VLAN
      const connectedEdges = edges.filter(edge => 
        edge.source === vlanToDelete.id || edge.target === vlanToDelete.id
      )
      
      // Use ReactFlow's deleteElements to remove the node from the UI
      // This works regardless of the deletable property
      reactFlowInstance.deleteElements({
        nodes: [{ id: vlanToDelete.id }],
        edges: connectedEdges.map(edge => ({ id: edge.id }))
      }).then(() => {
        componentLogger.info({ vlanId: vlanToDelete.id }, 'VLAN node removed from UI')
        
        // Trigger the onDelete callback to save configuration
        if (onDelete) {
          onDelete({
            nodes: [vlanToDelete],
            edges: connectedEdges
          })
        }
      })
      
      // Clean up state
      setVlanToDelete(null)
      setShowVlanDeleteConfirmModal(false)
    }
  }, [vlanToDelete, edges, reactFlowInstance, onDelete, setShowVlanDeleteConfirmModal])

  // Handle cancelled VLAN deletion
  const handleCancelVlanDeletion = React.useCallback(() => {
    setVlanToDelete(null)
    setShowVlanDeleteConfirmModal(false)
  }, [setShowVlanDeleteConfirmModal])

  // Enhanced edge edit handler for network connections dialog
  const handleEdgeEdit = (edgeId: string) => {
    const edge = edges.find((e) => e.id === edgeId)
    if (edge) {
      // Close the network connections dialog and select the edge
      setShowNetworkConnectionsDialog(false)
      
      if (reactFlowInstance) {
        reactFlowInstance.setEdges((eds) =>
          eds.map((e) => ({
            ...e,
            selected: e.id === edgeId,
          })),
        )
      }
    }
  }

  // Skeleton UI loading state
  if (!effectiveRangeData) {
    return (
      <div className="flex flex-col h-screen bg-muted/20">
        <NetworkTopologySkeleton />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-card" data-testid="network-topology-viewer">
      <RangeEditorHeader
        projectMetadata={currentProjectMetadata}
        rangeStats={currentRangeStats}
        testingMode={testingMode}
        allowedDomains={allowedDomains}
        allowedIPs={allowedIPs}
        totalVMCount={getResourceTotals().vms}
        totalCPUs={getResourceTotals().cpus}
        totalRAM={getResourceTotals().ram}
        effectiveRangeData={effectiveRangeData}
        deployRangeMutation={deployRangeMutation}
        abortDeploymentMutation={abortDeploymentMutation}
        startTestingMutation={startTestingMutation}
        stopTestingMutation={stopTestingMutation}
        powerOnMutation={powerOnMutation}
        powerOffMutation={powerOffMutation}
        destroyRangeMutation={destroyRangeMutation}
        onDeployRange={handleDeployRange}
        onAbortDeployment={handleAbortDeployment}
        onPowerOnAll={handlePowerOnAllVMs}
        onPowerOffAll={handlePowerOffAllVMs}
        onDestroyAll={handleDestroyAllVMs}
        onStartTesting={handleStartTesting}
        onStopTesting={handleStopTesting}
        onSaveRangeDetails={handleSaveRangeDetails}
        onOpenLogs={() => setShowLogsModal(true)}
        isNotificationPanelOpen={isNotificationPanelOpen}
        setIsNotificationPanelOpen={setIsNotificationPanelOpen}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <ComponentSidebar
          templates={templates}
          onTemplateClick={handleTemplateClick}
          updateTemplateUsage={(templateName: string) => {
            console.log(`Template used: ${templateName}`)
          }}
          isBuilding={isAnyTemplateBuilding}
        />

        {/* Main Flow Canvas - dynamically sized */}
        <div className="flex-1 flex overflow-hidden">
          <FlowCanvas
            nodes={nodesWithModalDeleteHandler}
            edges={edges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            isValidConnection={isValidConnection}
            onInit={handleReactFlowInit}
            onSelectionChange={onSelectionChange}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onMove={onMove}
            onPaneClick={handlePaneClick}
            onDelete={onDelete}
            onKeyDown={handleKeyDown}
            deleteKeyCode={['Delete', 'Backspace']}
            reactFlowWrapper={reactFlowWrapper}
            reactFlowInstance={reactFlowInstance}
            floatingActions={
              <FloatingRangeActions
                userID={effectiveRangeData?.userID}
              />
            }
          />

          {/* Fixed Right-Side Properties Panel */}
          {(selectedVLAN !== null || selectedEdge !== null || selectedRouter) && (
            <UnifiedPropertiesSheet
              selectedVLAN={selectedVLAN}
              selectedEdge={selectedEdge}
              selectedRouter={selectedRouter}
              routerNode={routerNode}
              onClose={handleClosePropertiesPanel}
              onUpdateVM={onUpdateVM}
              onSaveEdge={onSaveEdge}
              onSaveRouter={onSaveRouter}
              networkSettings={networkConfig}
              templates={templates}
              nodes={nodes.map(node => ({ 
                id: node.id, 
                type: node.type || '', 
                data: { 
                  label: node.data.label, 
                  vms: node.data.vms 
                } 
              }))}
            />
          )}
        </div>
      </div>

      {/* Network Connections Dialog */}
      {activeVlanForConnections && (
        <NetworkConnectionsDialog
          isOpen={showNetworkConnectionsDialog}
          onClose={() => setShowNetworkConnectionsDialog(false)}
          vlanId={activeVlanForConnections.id}
          vlanName={activeVlanForConnections.name}
          connections={getVlanConnections(activeVlanForConnections.id)}
          onEditConnection={handleEdgeEdit}
        />
      )}

      {/* VLAN Deletion Confirmation Modal */}
      {vlanToDelete && (
        <VlanDeleteConfirmModal
          open={showVlanDeleteConfirmModal}
          onClose={handleCancelVlanDeletion}
          onConfirm={handleConfirmVlanDeletion}
          vlanNode={vlanToDelete}
        />
      )}

      {/* VM Deletion Confirmation Modal */}
      <ConfirmModal
        open={isModalOpen}
        onClose={hideDeleteModal}
        onConfirm={confirmDelete}
        title="Delete Virtual Machine"
        description={
          <>
            Are you sure you want to delete the VM <strong>&ldquo;{vmToDelete?.name || ""}&rdquo;</strong>? 
            <br />
            This action cannot be undone.
          </>
        }
        confirmLabel="Delete VM"
        cancelLabel="Cancel"
        confirmVariant="destructive"
      />

      {/* NotificationPanel is now handled within the RangeEditorHeader's Sheet context */}
    </div>
  )
}

// The main component that provides the context
export default function NetworkTopologyViewer({
  initialNodes,
  initialEdges,
  templates,
  projectMetadata,
  rangeStats,
  currentRange,
  editorData,
  loading = {},
}: NetworkTopologyViewerProps) {  
  return (
    <RangeEditorProvider
      initialNodes={initialNodes}
      initialEdges={initialEdges}
      templates={templates}
      projectMetadata={projectMetadata}
      rangeStats={rangeStats}
      currentRange={currentRange}
      editorData={editorData}
      loading={loading}
    >
      <NetworkTopologyContent />
    </RangeEditorProvider>
  )
}
"use client"

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo, useRef } from "react"
import type { Node, Edge, ReactFlowInstance } from "@xyflow/react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import isEqual from 'lodash.isequal'

import type { Template, VMData, NodeData, EdgeData } from "@/lib/types"
import type { TopologyState } from "@/lib/types/range-editor"
import { componentLogger, logUserAction, logError } from "@/lib/logger"
import { extractApiErrorMessage } from "@/lib/utils/error-handling"
import type { RangeConfig, RouterConfig } from "@/lib/types/range-config"
import type { components } from '@/lib/api/ludus/schema'
import { useRangeActions } from "@/hooks/use-range-actions"
import { useMockRangeActions } from "@/hooks/use-range-actions-mock"
import { useSelectionManager } from "@/hooks/use-selection-manager"
import { useTopologyState } from "@/hooks/use-topology-state"
import { useRangeLayout } from "@/hooks/use-range-layout"
import { useSaveRangeConfig } from "@/hooks/use-range-config-save"
import { useRangeEditorData } from "@/hooks/use-range-editor-data"
import { fetchRangeDetails } from "@/hooks/use-range-details"
import { useTemplatesStatus } from "@/hooks/use-templates-status"
import { calculateResourceTotals, type ResourceTotals } from "@/lib/utils/resource-calculator"

interface RangeEditorContextType {
  // Project metadata
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
  currentProjectMetadata: {
    id: string
    name: string
    status: string
  }
  currentRangeStats: {
    cpus: number
    ram: number
    disk: number
    vlans: {
      name: string
      description: string
    }[]
  }
  // Data
  templates: Template[]
  effectiveRangeData?: components['schemas']['RangeObject']
  isAnyTemplateBuilding: boolean
  editorData?: any
  // Topology state
  nodes: Node<NodeData>[]
  edges: Edge[]
  reactFlowInstance: ReactFlowInstance | null
  reactFlowWrapper: React.RefObject<HTMLDivElement>
  // Selection state
  selectedVLAN: string | null
  selectedVMId: string | null
  selectedEdge: Edge | null
  selectedRouter: boolean
  selectedNodes: string[]
  // Network configuration
  networkConfig: RangeConfig['network']
  // VM defaults configuration
  currentDefaults?: RangeConfig['defaults']
  // Testing state
  testingMode: boolean
  allowedDomains: string[]
  allowedIPs: string[]
  // Modal states
  showLogsModal: boolean
  isNotificationPanelOpen: boolean
  showNetworkConnectionsDialog: boolean
  activeVlanForConnections: { id: string; name: string } | null
  showVlanDeleteConfirmModal: boolean
  // Auto-save functions
  onUpdateVM: (vmId: string, settings: Partial<VMData>) => Promise<void>
  onSaveEdge: (data: { edgeId: string; ruleSettings: Record<string, unknown>; networkSettings: RangeConfig['network'] }) => Promise<void>
  onSaveRouter: (settings: RouterConfig) => Promise<void>
  // Range actions
  handleDeployRange: () => void
  handleAbortDeployment: () => void
  handleDestroyAllVMs: () => void
  handlePowerOnAllVMs: () => void
  handlePowerOffAllVMs: () => void
  handleStartTesting: () => void
  handleStopTesting: () => void
  // All mutations
  deployRangeMutation: any
  startTestingMutation: any
  stopTestingMutation: any
  abortDeploymentMutation: any
  destroyRangeMutation: any
  powerOnMutation: any
  powerOffMutation: any
  // Topology actions
  handleTemplateClick: (template: Template) => void
  handleAddVLAN: (position?: { x: number; y: number }, initialVM?: VMData) => string | undefined
  // Event handlers from topology
  onNodesChange: any
  onEdgesChange: any
  onConnect: any
  isValidConnection: any
  onSelectionChange: any
  onDragOver: any
  onDragLeave: any
  onDrop: any
  onDelete: any
  onDeleteVM: (vmId: string, vlanId: string) => Promise<void>
  onMove: any
  // Selection handlers
  handlePaneClick: () => void
  handleClosePropertiesPanel: () => void
  // VM management
  handleMoveVMToVLAN: (vmId: string, targetVlanId: string) => Promise<void>
  handleUpdateVMName: (vmId: string, newName: string) => Promise<void>
  handleToggleAllVMs: (vlanId: string, action: "start" | "stop") => Promise<void>
  handleEditVLAN: (vlanId: string) => void
  handleConfigureVMs: (vlanId: string) => void
  handleNetworkConnections: (vlanId: string) => void
  handleViewVMDetails: (vm: VMData, vlanId: string, vlanName: string) => void
  // Edge management
  handleEdgeEdit: (edgeId: string) => void
  handleEdgeDelete: (edgeId: string) => Promise<void>
  // Network settings
  handleSaveNetworkAndRuleChanges: (edgeId: string, ruleSettings: Record<string, unknown>, networkSettings: RangeConfig['network']) => void
  // Range details
  handleSaveRangeDetails: (data: { name: string; cpus: number; ram: number; disk: number }) => void
  handleSaveVMDefaults: (defaults: NonNullable<RangeConfig['defaults']>) => void
  // Modal controls
  setShowLogsModal: (show: boolean) => void
  setShowSnapshotsModal: (show: boolean) => void
  setIsNotificationPanelOpen: (open: boolean) => void
  setShowNetworkConnectionsDialog: (show: boolean) => void
  setActiveVlanForConnections: (vlan: { id: string; name: string } | null) => void
  setShowVlanDeleteConfirmModal: (show: boolean) => void
  setCurrentProjectMetadata: (metadata: any) => void
  setCurrentRangeStats: (stats: any) => void
  setTestingMode: (mode: boolean) => void
  // Utilities
  getTotalVMCount: () => number
  getResourceTotals: () => ResourceTotals
  getVlanConnections: (vlanId: string) => any[]
  addHandlersToNodes: (nodes: Node<NodeData>[]) => Node<NodeData>[]
  // ReactFlow init handler
  handleReactFlowInit: (instance: ReactFlowInstance) => void
  // Exposed internal state for advanced use cases
  selectionManager: ReturnType<typeof useSelectionManager>
  topologyState: TopologyState
}

const RangeEditorContext = createContext<RangeEditorContextType | null>(null)

interface RangeEditorProviderProps {
  children: React.ReactNode
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
  loading?: {
    templates?: boolean
    rangeData?: boolean
    rangeConfig?: boolean
  }
}

export function RangeEditorProvider({
  children,
  initialNodes,
  initialEdges,
  templates,
  projectMetadata,
  rangeStats,
  currentRange,
  editorData: passedEditorData,
  loading = {}
}: RangeEditorProviderProps) {
  const queryClient = useQueryClient()

  // Extract userID from composite ID
  const userID = projectMetadata.id.split('-')[0]

  // Fetch range state updates
  const { data: latestRangeData } = useQuery({
    queryKey: ['range-info', projectMetadata.id],
    queryFn: () => fetchRangeDetails(userID),
    enabled: !!projectMetadata.id,
    staleTime: 1000 * 60 * 2, // 2 minutes
  })

  // Get templates building status
  const { isAnyTemplateBuilding } = useTemplatesStatus()

  // Use latest range data if available
  const effectiveRangeData = latestRangeData || currentRange

  // Use passed-in editorData if available, otherwise fetch from API
  const { data: fetchedEditorData } = useRangeEditorData(userID)
  const editorData = passedEditorData || fetchedEditorData

  // Local state management
  const [currentProjectMetadata, setCurrentProjectMetadata] = useState(projectMetadata)
  const [currentRangeStats, setCurrentRangeStats] = useState(rangeStats)
  const [testingMode, setTestingMode] = useState(false)
  const [networkConfig, setNetworkConfig] = useState<RangeConfig['network']>(editorData?.network || {})
  const [currentDefaults, setCurrentDefaults] = useState<RangeConfig['defaults']>(editorData?.defaults)
  const [showLogsModal, setShowLogsModal] = useState(false)
  const [showSnapshotsModal, setShowSnapshotsModal] = useState(false)
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false)
  const [showNetworkConnectionsDialog, setShowNetworkConnectionsDialog] = useState(false)
  const [activeVlanForConnections, setActiveVlanForConnections] = useState<{ id: string; name: string } | null>(null)
  const [showVlanDeleteConfirmModal, setShowVlanDeleteConfirmModal] = useState(false)

  // Sync states with API data
  // Reset state when range changes (fixes stale state issue)
  useEffect(() => {
    setCurrentProjectMetadata(projectMetadata)
    setCurrentRangeStats(rangeStats)
    setTestingMode(effectiveRangeData?.testingEnabled ?? false)
  }, [projectMetadata.id, effectiveRangeData?.testingEnabled])

  useEffect(() => {
    if (effectiveRangeData?.testingEnabled !== undefined) {
      setTestingMode(effectiveRangeData.testingEnabled)
    }
  }, [effectiveRangeData?.testingEnabled])

  useEffect(() => {
    if (effectiveRangeData?.rangeState) {
      setCurrentProjectMetadata(prev => ({
        ...prev,
        status: effectiveRangeData.rangeState || prev.status
      }))
    }
  }, [effectiveRangeData?.rangeState])

  useEffect(() => {
    if (editorData?.network) {
      setNetworkConfig(editorData.network)
    }
    if (editorData?.defaults) {
      setCurrentDefaults(editorData.defaults)
    }
  }, [editorData])

  // Detect if we're in viewport demo mode
  const isViewportDemo = typeof window !== 'undefined' && window.location.pathname === '/'
  
  // Use the range config save hook with current state (only if not in demo mode)
  const realSaveConfig = useSaveRangeConfig({
    userID,
    rangeId: projectMetadata.id,
    networkConfig,
    currentDefaults,
  })
  
  // Mock saveConfig for viewport demo
  const mockSaveConfig = useCallback(async (
    nodes: Node<NodeData>[], 
    edges: Edge[], 
    options: { force?: boolean; networkConfig?: RangeConfig['network']; defaultsConfig?: RangeConfig['defaults'] } = {}
  ) => {
    console.log('[MOCK SAVE] Simulating save config for viewport demo:', { nodes: nodes.length, edges: edges.length, options })
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 100))
    // Return mock success response
    return { success: true, message: 'Mock save successful' }
  }, [])
  
  // Choose between real and mock saveConfig based on demo mode
  const { saveConfig: originalSaveConfig } = isViewportDemo 
    ? { saveConfig: mockSaveConfig }
    : realSaveConfig

  // Use the range layout hook
  const { savedPositions, saveNodePositions } = useRangeLayout({
    userId: userID,
    rangeId: projectMetadata.id,
    nodes: initialNodes, // We'll update this reference when we get the actual nodes
    onNodesChange: () => {}, // This will be overridden by topology state
  })

  // Initialize selection manager
  const selectionManager = useSelectionManager()

  // Flag to prevent VLAN selection when VM is clicked
  const vmClickInProgressRef = useRef(false)

  // Wrap saveConfig to track save times and provide to topology state
  const saveConfig = useCallback((
    nodes: Node<NodeData>[], 
    edges: Edge[], 
    options: { force?: boolean; networkConfig?: RangeConfig['network']; defaultsConfig?: RangeConfig['defaults'] } = {}
  ) => {
    return originalSaveConfig(nodes, edges, options)
  }, [originalSaveConfig])

  // Track if this is the first render
  const isFirstRender = useRef(true)
  
  // Use memoized initial values to prevent re-initialization
  const memoizedInitialNodes = useMemo(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return initialNodes
    }
    return [] // Empty array for subsequent renders
  }, []) // Intentionally empty deps to capture only first value
  
  const memoizedInitialEdges = useMemo(() => initialEdges, []) // Only use initial edges on first render

  // Initialize topology state
  const topologyState = useTopologyState({
    initialNodes: memoizedInitialNodes,
    initialEdges: memoizedInitialEdges,
    savedPositions,
    templates,
    saveConfig,
    saveNodePositions,
    onSelectionChange: selectionManager.handleSelectionChange,
  })

  // Smart reconciliation effect - updates topology state when API data changes
  useEffect(() => {
    // Skip on first render or when loading
    if (!editorData || loading.rangeData) return
    
    // Skip if we just saved (within 2 seconds)
    const timeSinceLastSave = Date.now() - (topologyState.lastSaveTimeRef.current || 0)
    if (timeSinceLastSave < 2000) {
      return
    }

    
    // Reconcile nodes
    topologyState.setNodes(currentNodes => {
      const currentNodesMap = new Map(currentNodes.map(n => [n.id, n]))
      let hasChanges = false
      
      const reconciledNodes = editorData.nodes.map((newNode: Node<NodeData>) => {
        const currentNode = currentNodesMap.get(newNode.id)
        if (!currentNode) {
          hasChanges = true
          return newNode // New node from API
        }
        
        // Preserve UI state
        const updatedNode = {
          ...newNode,
          position: currentNode.position, // Keep user's position
          selected: currentNode.selected, // Keep selection state
        }
        
        // Deep compare data to detect changes
        if (!isEqual(currentNode.data, newNode.data)) {
          hasChanges = true
          return updatedNode
        }
        
        // Return original reference if no changes
        return currentNode
      })
      
      // Check for deleted nodes
      if (reconciledNodes.length !== currentNodes.length) {
        hasChanges = true
      }
      
      return hasChanges ? reconciledNodes : currentNodes
    })
    
    // Reconcile edges
    topologyState.setEdges(currentEdges => {
      const currentEdgesMap = new Map(currentEdges.map(e => [e.id, e]))
      let hasChanges = false
      
      const reconciledEdges = editorData.edges.map((newEdge: Edge) => {
        const currentEdge = currentEdgesMap.get(newEdge.id)
        if (!currentEdge) {
          hasChanges = true
          return newEdge // New edge from API
        }
        
        // Preserve selection state
        const updatedEdge: Edge = {
          ...newEdge,
          selected: currentEdge.selected,
        }
        
        // Deep compare data
        if (!isEqual(currentEdge.data, newEdge.data)) {
          hasChanges = true
          return updatedEdge
        }
        
        // Return original reference if no changes
        return currentEdge
      })
      
      // Check for deleted edges
      if (reconciledEdges.length !== currentEdges.length) {
        hasChanges = true
      }
      
      return hasChanges ? reconciledEdges : currentEdges
    })
    
  }, [editorData, loading.rangeData, topologyState.setNodes, topologyState.setEdges])

  // Handle ReactFlow instance initialization
  const handleReactFlowInit = useCallback((instance: ReactFlowInstance) => {
    topologyState.setReactFlowInstance(instance)
  }, [topologyState.setReactFlowInstance])

  // Override the ReactFlow onSelectionChange to include the ReactFlow instance
  const enhancedOnSelectionChange = useCallback(
    (params: { nodes: Node[]; edges: Edge[] }) => {
      // Skip selection change if VM click is in progress
      if (vmClickInProgressRef.current) {
        vmClickInProgressRef.current = false // Reset flag
        return
      }
      
      selectionManager.handleSelectionChange(params, topologyState.reactFlowInstance)
    },
    [selectionManager.handleSelectionChange, topologyState.reactFlowInstance]
  )

  // Initialize range actions with sync callback (use mock in viewport demo)
  const realRangeActions = useRangeActions({
    rangeId: projectMetadata.id,
    userID,
    projectName: currentProjectMetadata.name,
    testingMode,
    onOpenLogs: () => setShowLogsModal(true),
    onSyncVMStates: (vms) => {
      topologyState.setNodes((currentNodes) => topologyState.syncVMStatesWithBackend(currentNodes, vms))
    },
  })
  
  const mockRangeActions = useMockRangeActions({
    rangeId: projectMetadata.id,
    userID,
    projectName: currentProjectMetadata.name,
    testingMode,
    onOpenLogs: () => setShowLogsModal(true),
    onSyncVMStates: (vms) => {
      topologyState.setNodes((currentNodes) => topologyState.syncVMStatesWithBackend(currentNodes, vms))
    },
    onUpdateRangeState: (state) => {
      console.log('[MOCK CONTEXT] Updating range state to:', state)
      // Update the effective range data with new state
      if (effectiveRangeData) {
        const updatedRangeData = { ...effectiveRangeData, rangeState: state }
        // Note: In a real app this would be handled by a server state update
        // For demo purposes, we'll trigger a re-render by updating nodes
        topologyState.setNodes((currentNodes) => [...currentNodes])
      }
    },
    onUpdateProjectMetadata: (metadata) => {
      console.log('[MOCK CONTEXT] Updating project metadata:', metadata)
      // Update current project metadata
      setCurrentProjectMetadata((current) => ({
        ...current,
        status: metadata.status || current.status
      }))
    },
  })
  
  // Choose between real and mock range actions based on demo mode
  const rangeActions = isViewportDemo ? mockRangeActions : realRangeActions

// VM management functions
  const handleMoveVMToVLAN = useCallback(
    async (vmId: string, targetVlanId: string) => {
      let sourceVlanId = null
      let vmToMove: VMData | null = null

      // Find VM location (unchanged)
      for (const node of topologyState.nodes) {
        if (node.type === "vlan" && node.data.vms) {
          const vm = node.data.vms.find((vm: VMData) => vm.id === vmId)
          if (vm) {
            sourceVlanId = node.id
            vmToMove = vm
            break
          }
        }
      }

      if (!sourceVlanId || !vmToMove || sourceVlanId === targetVlanId) return

      // Prepare updated nodes
      const updatedNodes = topologyState.nodes.map((node) => {
        if (node.id === sourceVlanId) {
          return {
            ...node,
            data: {
              ...node.data,
              vms: node.data.vms?.filter((vm: VMData) => vm.id !== vmId) || [],
              lastModified: Date.now(),
            },
          }
        } else if (node.id === targetVlanId) {
          return {
            ...node,
            data: {
              ...node.data,
              vms: [...(node.data.vms || []), vmToMove],
              lastModified: Date.now(),
            },
          }
        }
        return node
      })

      // Pessimistic approach with toast.promise
      await toast.promise(
        saveConfig(updatedNodes, topologyState.edges),
        {
          loading: 'Moving VM...',
          success: () => {
            // Update UI only after server confirms
            topologyState.setNodes(updatedNodes)
            logUserAction('vm-move', 'RangeEditor', { vmId, sourceVlanId, targetVlanId })
            return `Moved VM to ${targetVlanId.replace('vlan', 'VLAN ')}`
          },
          error: (error) => {
            logError(error, 'VM Move', { vmId, sourceVlanId, targetVlanId })
            return extractApiErrorMessage(error, 'Failed to move VM')
          }
        }
      )
    },
    [topologyState.nodes, topologyState.setNodes, topologyState.edges, saveConfig]
  )

  const handleUpdateVMName = useCallback(
    async (vmId: string, newName: string) => {
      let vlanId = null

      for (const node of topologyState.nodes) {
        if (node.type === "vlan" && node.data.vms) {
          const vmFound = node.data.vms.find((vm: VMData) => vm.id === vmId)
          if (vmFound) {
            vlanId = node.id
            break
          }
        }
      }

      if (!vlanId) return

      const updatedNodes = topologyState.nodes.map((node) => {
        if (node.id === vlanId && node.data.vms) {
          return {
            ...node,
            data: {
              ...node.data,
              vms: node.data.vms.map((vm: VMData) => (vm.id === vmId ? { ...vm, vmName: newName } : vm)),
            },
          }
        }
        return node
      })

      // Pessimistic approach - save first, then update UI
      try {
        await saveConfig(updatedNodes, topologyState.edges)
        topologyState.setNodes(updatedNodes)
        logUserAction('vm-rename', 'RangeEditor', { vmId, newName })
      } catch (error) {
        logError(error as Error, 'VM Name Update', { vmId, newName })
        // Keep original UI state on error
      }
    },
    [topologyState.nodes, topologyState.setNodes, topologyState.edges, saveConfig]
  )

  // VLAN management functions
  const handleToggleAllVMs = useCallback(
    async (vlanId: string, action: "start" | "stop") => {
      logUserAction('vm-toggle-all', 'RangeEditor', { action, vlanId })

      const updatedNodes = topologyState.nodes.map((node) => {
        if (node.id === vlanId && node.data.vms) {
          return {
            ...node,
            data: {
              ...node.data,
              vms: (node.data.vms as VMData[]).map((vm: VMData) => ({
                ...vm,
                status: action === "start" ? ("Running" as const) : ("Stopped" as const),
              })),
            },
          } as Node<NodeData>
        }
        return node
      })
      
      // Pessimistic approach with toast.promise
      await toast.promise(
        saveConfig(updatedNodes, topologyState.edges),
        {
          loading: `${action === "start" ? "Starting" : "Stopping"} all VMs...`,
          success: () => {
            // Update UI only after server confirms
            topologyState.setNodes(updatedNodes)
            
            // Update ReactFlow selection
            if (topologyState.reactFlowInstance) {
              topologyState.reactFlowInstance.setNodes((nds: Node[]) =>
                nds.map((node) => ({
                  ...node,
                  selected: node.id === vlanId,
                })),
              )
            }
            
            return `${action === "start" ? "Started" : "Stopped"} all VMs in VLAN`
          },
          error: (error) => {
            logError(error, 'VM Toggle All', { vlanId, action })
            return extractApiErrorMessage(error, `Failed to ${action} all VMs`)
          }
        }
      )
    },
    [topologyState.nodes, topologyState.setNodes, topologyState.reactFlowInstance, topologyState.edges, saveConfig]
  )

  const handleEditVLAN = useCallback(
    (vlanId: string) => {
      logUserAction('vlan-edit', 'RangeEditor', { vlanId })
      selectionManager.selectVLAN(vlanId, topologyState.reactFlowInstance)
    },
    [selectionManager, topologyState.reactFlowInstance]
  )

  const handleConfigureVMs = useCallback(
    (vlanId: string) => {
      logUserAction('vlan-configure-vms', 'RangeEditor', { vlanId })
      selectionManager.selectVLAN(vlanId, topologyState.reactFlowInstance)
    },
    [selectionManager, topologyState.reactFlowInstance]
  )

  const handleNetworkConnections = useCallback(
    (vlanId: string) => {
      logUserAction('vlan-show-connections', 'RangeEditor', { vlanId })
      const vlanNode = topologyState.nodes.find((node) => node.id === vlanId)
      if (!vlanNode) return

      setActiveVlanForConnections({
        id: vlanId,
        name: vlanNode.data.label || "VLAN",
      })
      setShowNetworkConnectionsDialog(true)
    },
    [topologyState.nodes]
  )

  const handleViewVMDetails = useCallback(
    (vm: VMData, vlanId: string, vlanName: string) => {
      // Set flag to prevent VLAN selection interference
      vmClickInProgressRef.current = true
      
      logUserAction('vm-view-details', 'RangeEditor', { vmId: vm.id, vmLabel: vm.label, vlanId, vlanName })
      selectionManager.selectVMInVLAN(vm.id, vlanId, topologyState.reactFlowInstance)
    },
    [selectionManager, topologyState.reactFlowInstance]
  )

  // Edge management functions
  const handleEdgeEdit = useCallback(
    (edgeId: string) => {
      const edge = topologyState.edges.find((e) => e.id === edgeId)
      if (edge) {
        selectionManager.selectEdge(edge, topologyState.reactFlowInstance)
      }
    },
    [topologyState.edges, selectionManager, topologyState.reactFlowInstance]
  )

  const handleEdgeDelete = useCallback(
    async (edgeId: string) => {
      logUserAction('edge-delete', 'RangeEditor', { edgeId })

      const updatedEdges = topologyState.edges.filter((edge) => edge.id !== edgeId)
      
      // Pessimistic approach with toast.promise
      await toast.promise(
        topologyState.reactFlowInstance 
          ? saveConfig(topologyState.reactFlowInstance.getNodes(), updatedEdges)
          : saveConfig(topologyState.nodes, updatedEdges),
        {
          loading: 'Deleting connection...',
          success: () => {
            // Update UI only after server confirms
            topologyState.setEdges(updatedEdges)
            
            // Clear selection if deleted edge was selected
            if (selectionManager.selectedEdgeId === edgeId) {
              selectionManager.setSelectedEdgeId(null)
            }
            
            return 'Connection deleted successfully'
          },
          error: (error) => {
            logError(error, 'Edge Delete', { edgeId })
            return extractApiErrorMessage(error, 'Failed to delete connection')
          }
        }
      )
    },
    [topologyState.edges, topologyState.setEdges, topologyState.nodes, topologyState.reactFlowInstance, selectionManager.selectedEdgeId, selectionManager.setSelectedEdgeId, saveConfig]
  )


  // Auto-save functions for immediate feedback
  const onUpdateVM = useCallback(async (vmId: string, settings: Partial<VMData>) => {
    let vlanId = selectionManager.selectedVLAN
    
    if (!vlanId) {
      for (const node of topologyState.nodes) {
        if (node.type === "vlan" && node.data.vms) {
          const vmFound = node.data.vms.find((vm: VMData) => vm.id === vmId)
          if (vmFound) {
            vlanId = node.id
            break
          }
        }
      }
    }
    
    if (!vlanId) throw new Error('VM not found in any VLAN')
    
    const updatedNodes = topologyState.nodes.map((node) => {
      if (node.id === vlanId && node.data.vms) {
        return {
          ...node,
          data: {
            ...node.data,
            vms: node.data.vms.map((vm: VMData) => (vm.id === vmId ? { ...vm, ...settings } : vm)),
            lastModified: Date.now(),
          },
        }
      }
      return node
    })
    
    componentLogger.info('onUpdateVM: About to save to server (pessimistic approach)', {
      vmId,
      hasUpdatedNodes: !!updatedNodes,
      nodeCount: updatedNodes.length,
      force: true
    })
    
    // Pessimistic approach: Save to server first, then update UI on success
    try {
      const saveResult = await saveConfig(updatedNodes, topologyState.edges, { force: true, networkConfig, defaultsConfig: currentDefaults })
      componentLogger.info('onUpdateVM: Server save successful, updating UI state')
      
      // Only update UI state AFTER server confirms success
      topologyState.setNodes(updatedNodes)
      
      return saveResult
    } catch (error) {
      componentLogger.error('onUpdateVM: Server save failed, keeping original UI state:', error)
      throw error
    }
  }, [selectionManager.selectedVLAN, topologyState.setNodes, topologyState.nodes, topologyState.edges, saveConfig, networkConfig, currentDefaults])
  
  const onSaveEdge = useCallback(async (data: { edgeId: string; ruleSettings: Record<string, unknown>; networkSettings: RangeConfig['network'] }) => {
    const { edgeId, ruleSettings, networkSettings } = data
    const updatedEdges = topologyState.edges.map((edge) => 
      edge.id === edgeId ? { 
        ...edge, 
        data: { 
          ...edge.data, 
          status: { ...(edge.data?.status || {}), ...ruleSettings },
          lastUpdated: Date.now()
        } 
      } : edge
    )
    
    // Pessimistic approach: Save to server first, then update UI on success
    try {
      const saveResult = await saveConfig(topologyState.nodes, updatedEdges, { force: false, networkConfig: networkSettings })
      componentLogger.info('onSaveEdge: Server save successful, updating UI state')
      
      // Only update UI state AFTER server confirms success
      topologyState.setEdges(updatedEdges)
      setNetworkConfig(networkSettings)
      
      return saveResult
    } catch (error) {
      componentLogger.error('onSaveEdge: Server save failed, keeping original UI state:', error)
      throw error
    }
  }, [topologyState.nodes, topologyState.edges, topologyState.setEdges, saveConfig, setNetworkConfig])
  
  const onSaveRouter = useCallback(async (settings: RouterConfig) => {
    const updatedNodes = topologyState.nodes.map((node) => {
      if (node.type === "router") {
        return {
          ...node,
          data: {
            ...node.data,
            ...settings,
            lastModified: Date.now(),
          },
        }
      }
      return node
    })
    
    // Pessimistic approach: Save to server first, then update UI on success
    try {
      const saveResult = await saveConfig(updatedNodes, topologyState.edges, { force: true, networkConfig, defaultsConfig: currentDefaults })
      componentLogger.info('onSaveRouter: Server save successful, updating UI state')
      
      // Only update UI state AFTER server confirms success
      topologyState.setNodes(updatedNodes)
      
      return saveResult
    } catch (error) {
      componentLogger.error('onSaveRouter: Server save failed, keeping original UI state:', error)
      throw error
    }
  }, [topologyState.setNodes, topologyState.nodes, topologyState.edges, saveConfig, networkConfig, currentDefaults])

  // Network settings functions

  const handleSaveNetworkAndRuleChanges = useCallback((
    edgeId: string, 
    ruleSettings: Record<string, unknown>, 
    networkSettings: RangeConfig['network']
  ) => {
    const updatedEdges = topologyState.edges.map((edge) => 
      edge.id === edgeId ? { 
        ...edge, 
        data: { 
          ...edge.data, 
          status: { ...(edge.data?.status || {}), ...ruleSettings },
          lastUpdated: Date.now()
        } 
      } : edge
    )
    topologyState.setEdges(updatedEdges)
    setNetworkConfig(networkSettings)
    saveConfig(topologyState.nodes, updatedEdges, { force: false, networkConfig: networkSettings })
  }, [topologyState.nodes, topologyState.edges, topologyState.setEdges, saveConfig])

  // Event handlers
  const handlePaneClick = useCallback(() => {
    selectionManager.handlePaneClick(topologyState.reactFlowInstance)
  }, [selectionManager, topologyState.reactFlowInstance])

  const handleClosePropertiesPanel = useCallback(() => {
    selectionManager.clearAllSelections(topologyState.reactFlowInstance)
  }, [selectionManager, topologyState.reactFlowInstance])

  const handleClearVMSelection = useCallback(() => {
    selectionManager.setSelectedVMId(null)
  }, [selectionManager])

  // Range details functions
  const handleSaveRangeDetails = useCallback((data: { name: string; cpus: number; ram: number; disk: number }) => {
    setCurrentProjectMetadata({
      ...currentProjectMetadata,
      name: data.name,
    })

    setCurrentRangeStats({
      ...currentRangeStats,
      cpus: data.cpus,
      ram: data.ram,
      disk: data.disk,
    })

    componentLogger.info({ rangeId: projectMetadata.id, dataKeys: Object.keys(data) }, 'Range details updated')
  }, [currentProjectMetadata, currentRangeStats, projectMetadata.id])


  const handleSaveVMDefaults = useCallback((defaults: NonNullable<RangeConfig['defaults']>) => {
    logUserAction('vm-defaults-save', 'RangeEditor', { defaultsCount: Object.keys(defaults).length })
    
    // Save with current nodes/edges, network config, and updated defaults
    // Return the promise so UI layer can handle success/error notifications
    return saveConfig(topologyState.nodes, topologyState.edges, { force: false, networkConfig, defaultsConfig: defaults })
  }, [topologyState.nodes, topologyState.edges, saveConfig, networkConfig])

  // Utility functions
  const getTotalVMCount = useCallback(() => {
    return topologyState.nodes.reduce((total, node) => {
      if (node.type === 'vlan' && node.data.vms) {
        return total + node.data.vms.length
      }
      return total
    }, 0)
  }, [topologyState.nodes])

  const getResourceTotals = useCallback(() => {
    return calculateResourceTotals(topologyState.nodes)
  }, [topologyState.nodes])

  const getVlanConnections = useCallback(
    (vlanId: string) => {
      if (!vlanId) return []

      const vlanConnections = topologyState.edges
        .filter((edge) => edge.source === vlanId || edge.target === vlanId)
        .map((edge) => {
          const sourceNode = topologyState.nodes.find((node) => node.id === edge.source)
          const targetNode = topologyState.nodes.find((node) => node.id === edge.target)

          return {
            id: edge.id,
            source: edge.source,
            target: edge.target,
            sourceName: sourceNode?.data.label || edge.source,
            targetName: targetNode?.data.label || edge.target,
            connectionType: (edge.data as EdgeData)?.status?.connectionType || "accept",
          }
        })

      return vlanConnections
    },
    [topologyState.edges, topologyState.nodes]
  )

  const addHandlersToNodes = useCallback((nodes: Node<NodeData>[]) => {
    return nodes.map(node => {
      if (node.type === "vlan") {
        return {
          ...node,
          data: {
            ...node.data,
            selectedVMId: selectionManager.selectedVMId,
            onToggleAllVMs: handleToggleAllVMs,
            onEdit: handleEditVLAN,
            onConfigureVMs: handleConfigureVMs,
            onNetworkConnections: handleNetworkConnections,
            onViewVMDetails: handleViewVMDetails,
            onMoveVMToVLAN: handleMoveVMToVLAN,
            onUpdateVMName: handleUpdateVMName,
            onDeleteVM: topologyState.onDeleteVM,
            onClearVMSelection: handleClearVMSelection,
          },
        }
      } else if (node.type === "router") {
        return {
          ...node,
          data: {
            ...node.data,
            onEdit: () => {
              selectionManager.selectRouter(topologyState.reactFlowInstance)
            },
          },
        }
      }
      return node
    })
  }, [handleToggleAllVMs, handleEditVLAN, handleConfigureVMs, handleNetworkConnections, handleViewVMDetails, handleMoveVMToVLAN, handleUpdateVMName, topologyState.onDeleteVM, handleClearVMSelection, selectionManager, topologyState.reactFlowInstance, selectionManager.selectedVMId])

  // Derive the selected edge object from the ID
  const selectedEdge = React.useMemo(() => {
    if (!selectionManager.selectedEdgeId) return null
    return topologyState.edges.find(e => e.id === selectionManager.selectedEdgeId) || null
  }, [selectionManager.selectedEdgeId, topologyState.edges])

  const contextValue: RangeEditorContextType = useMemo(() => ({
    // Project metadata
    projectMetadata,
    rangeStats,
    currentProjectMetadata,
    currentRangeStats,
    // Data
    templates,
    effectiveRangeData,
    isAnyTemplateBuilding,
    editorData,
    // Topology state
    nodes: topologyState.nodes,
    edges: topologyState.edges,
    reactFlowInstance: topologyState.reactFlowInstance,
    reactFlowWrapper: topologyState.reactFlowWrapper,
    // Selection state
    selectedVLAN: selectionManager.selectedVLAN,
    selectedVMId: selectionManager.selectedVMId,
    selectedEdge,
    selectedRouter: selectionManager.selectedRouter,
    selectedNodes: topologyState.selectedNodes,
    // Network configuration
    networkConfig,
    currentDefaults,
    // Testing state
    testingMode,
    // Pass through server data directly (no local state)
    allowedDomains: effectiveRangeData?.allowedDomains || [],
    allowedIPs: effectiveRangeData?.allowedIPs || [],
    // Modal states
    showLogsModal,
    isNotificationPanelOpen,
    showNetworkConnectionsDialog,
    activeVlanForConnections,
    showVlanDeleteConfirmModal,
    // Range actions
    handleDeployRange: rangeActions.handleDeployRange,
    handleAbortDeployment: rangeActions.handleAbortDeployment,
    handleDestroyAllVMs: rangeActions.handleDestroyAllVMs,
    handlePowerOnAllVMs: rangeActions.handlePowerOnAllVMs,
    handlePowerOffAllVMs: rangeActions.handlePowerOffAllVMs,
    handleStartTesting: rangeActions.handleStartTesting,
    handleStopTesting: rangeActions.handleStopTesting,
    // All mutations
    deployRangeMutation: rangeActions.deployRangeMutation,
    startTestingMutation: rangeActions.startTestingMutation,
    stopTestingMutation: rangeActions.stopTestingMutation,
    abortDeploymentMutation: rangeActions.abortDeploymentMutation,
    destroyRangeMutation: rangeActions.destroyRangeMutation,
    powerOnMutation: rangeActions.powerOnMutation,
    powerOffMutation: rangeActions.powerOffMutation,
    // Topology actions
    handleTemplateClick: topologyState.handleTemplateClick,
    handleAddVLAN: topologyState.handleAddVLAN,
    // Event handlers from topology
    onNodesChange: topologyState.onNodesChange,
    onEdgesChange: topologyState.onEdgesChange,
    onConnect: topologyState.onConnect,
    isValidConnection: topologyState.isValidConnection,
    onSelectionChange: enhancedOnSelectionChange,
    onDragOver: topologyState.onDragOver,
    onDragLeave: topologyState.onDragLeave,
    onDrop: topologyState.onDrop,
    onDelete: topologyState.onDelete,
    onDeleteVM: topologyState.onDeleteVM,
    onMove: topologyState.onMove,
    // Selection handlers
    handlePaneClick,
    handleClosePropertiesPanel,
    // VM management
    handleMoveVMToVLAN,
    handleUpdateVMName,
    handleToggleAllVMs,
    handleEditVLAN,
    handleConfigureVMs,
    handleNetworkConnections,
    handleViewVMDetails,
    // Edge management
    handleEdgeEdit,
    handleEdgeDelete,
    // Network settings
    handleSaveNetworkAndRuleChanges,
    // Range details
    handleSaveRangeDetails,
    handleSaveVMDefaults,
    // Modal controls
    setShowLogsModal,
    setShowSnapshotsModal,
    setIsNotificationPanelOpen,
    setShowNetworkConnectionsDialog,
    setActiveVlanForConnections,
    setShowVlanDeleteConfirmModal,
    setCurrentProjectMetadata,
    setCurrentRangeStats,
    setTestingMode,
    // Utilities
    getTotalVMCount,
    getResourceTotals,
    getVlanConnections,
    addHandlersToNodes,
    // ReactFlow init handler
    handleReactFlowInit,
    // Exposed internal state for advanced use cases
    selectionManager,
    topologyState,
    // Auto-save functions
    onUpdateVM,
    onSaveEdge,
    onSaveRouter,
  }), [
    // Props (stable)
    projectMetadata,
    rangeStats,
    templates,
    // State variables
    currentProjectMetadata,
    currentRangeStats,
    testingMode,
    effectiveRangeData,
    showLogsModal,
    isNotificationPanelOpen,
    showNetworkConnectionsDialog,
    activeVlanForConnections,
    showVlanDeleteConfirmModal,
    networkConfig,
    currentDefaults,
    // Computed values
    effectiveRangeData,
    editorData,
    isAnyTemplateBuilding,
    selectedEdge,
    // Hook returns (complex objects)
    selectionManager,
    topologyState,
    rangeActions,
    // All useCallback functions
    enhancedOnSelectionChange,
    handlePaneClick,
    handleClosePropertiesPanel,
    handleMoveVMToVLAN,
    handleUpdateVMName,
    handleToggleAllVMs,
    handleEditVLAN,
    handleConfigureVMs,
    handleNetworkConnections,
    handleViewVMDetails,
    handleEdgeEdit,
    handleEdgeDelete,
    handleSaveNetworkAndRuleChanges,
    handleSaveRangeDetails,
    handleSaveVMDefaults,
    getTotalVMCount,
    getResourceTotals,
    getVlanConnections,
    addHandlersToNodes,
    handleReactFlowInit,
    onUpdateVM,
    onSaveEdge,
    onSaveRouter,
  ])

  return (
    <RangeEditorContext.Provider value={contextValue}>
      {children}
    </RangeEditorContext.Provider>
  )
}

export const useRangeEditor = () => {
  const context = useContext(RangeEditorContext)
  if (!context) {
    throw new Error('useRangeEditor must be used within a RangeEditorProvider')
  }
  return context
}
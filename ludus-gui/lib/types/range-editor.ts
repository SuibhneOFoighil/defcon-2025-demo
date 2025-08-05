import type React from 'react'
import type { components } from '@/lib/api/ludus/schema'
import type { RangeConfig, NetworkRule } from './range-config'
import type { VMData, Template } from '@/lib/types'
import type { Node, Edge, ReactFlowInstance, NodeChange, EdgeChange, Connection } from '@xyflow/react'
import type { NodeData } from '@/lib/types'

// Simplified editor data - standalone interface for now
export interface RangeEditorData {
  // Core range properties (from UnifiedRangeData)
  userID?: string
  rangeNumber?: number
  rangeState?: string
  testingEnabled?: boolean
  allowedDomains?: string[]
  allowedIPs?: string[]
  
  // Additional editor-specific data
  topology: {
    vlans: VlanDefinition[]
    networkRules: NetworkRule[]
  }
  
  // The full network configuration object
  network?: RangeConfig['network']
  
  // The VM defaults configuration object
  defaults?: RangeConfig['defaults']
  
  // Legacy compatibility - will be removed in Phase 2
  vms: VMData[] // Now just enhanced VMData instead of ReconciledVM
  nodes: Node<NodeData>[] // Kept for backward compatibility
  edges: Edge[]
  
  // ReactFlow data
  flowNodes?: Node<NodeData>[]
  flowEdges?: Edge[]
  
  // Metadata for computed properties
  metadata?: {
    hasConfig?: boolean
    hasDeployedVMs?: boolean
    configDeploymentMismatch?: boolean
    unmatchedVMs?: string[]
    missingVMs?: string[]
  }
}

export interface VlanDefinition {
  id: number
  label: string
  description?: string
  configuredVMs: string[] // VM names from config
}


// ReconciledVM is now replaced by enhanced VMData in @/lib/types
// This interface is kept for reference but should not be used

// Response type for the API endpoint
export interface RangeEditorResponse {
  data?: RangeEditorData
  error?: string
}

// Helper type for the reconciliation process
export interface ReconciliationContext {
  rangeConfig: RangeConfig
  deployedRange: components['schemas']['RangeObject']
  userID: string
  templates: Array<{ name: string; os: string }>
}

// Legacy type aliases for backward compatibility - to be removed in Phase 2
export type ReconciledVM = VMData

// Topology state interface for range editor ReactFlow canvas
export interface TopologyState {
  // State properties
  nodes: Node<NodeData>[]
  edges: Edge[]
  reactFlowInstance: ReactFlowInstance | null
  selectedNodes: string[]
  hoveredNodeId: string | null
  reactFlowWrapper: React.RefObject<HTMLDivElement>
  lastSaveTimeRef: React.RefObject<number>
  
  // State setters
  setNodes: React.Dispatch<React.SetStateAction<Node<NodeData>[]>>
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>
  setReactFlowInstance: React.Dispatch<React.SetStateAction<ReactFlowInstance | null>>
  setSelectedNodes: React.Dispatch<React.SetStateAction<string[]>>
  setHoveredNodeId: React.Dispatch<React.SetStateAction<string | null>>
  
  // Node state handlers
  onNodesChange: (changes: NodeChange[]) => void
  onEdgesChange: (changes: EdgeChange[]) => void
  
  // Event handlers
  onConnect: (params: Edge | Connection) => void
  isValidConnection: (connection: Edge | Connection) => boolean
  onSelectionChange: (params: { nodes: Node[]; edges: Edge[] }) => void
  onDragOver: (event: React.DragEvent) => void
  onDragLeave: () => void
  onDrop: (event: React.DragEvent) => void
  onDelete: (params: { nodes: Node[]; edges: Edge[] }) => void
  onDeleteVM: (vmId: string, vlanId: string) => Promise<void>
  onMove: () => void
  
  // Actions
  handleAddVLAN: (position?: { x: number; y: number }, initialVM?: VMData) => string | undefined
  handleTemplateClick: (template: Template) => void
  syncVMStatesWithBackend: (currentNodes: Node[], backendVMs: { name?: string; poweredOn?: boolean }[]) => Node[]
  
  // Utilities
  isPointOverNode: (x: number, y: number) => string | null
}
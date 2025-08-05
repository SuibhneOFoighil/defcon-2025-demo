import { useState, useCallback, useRef, useEffect } from "react"
import type { Node, Edge, ReactFlowInstance } from "@xyflow/react"

export function useSelectionManager() {
  const [selectedVLAN, setSelectedVLAN] = useState<string | null>(null)
  const [selectedVMId, setSelectedVMId] = useState<string | null>(null)
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null)
  const [selectedRouter, setSelectedRouter] = useState<boolean>(false)
  const [selectedNodes, setSelectedNodes] = useState<string[]>([])
  
  // Refs to access current selection values in callbacks without causing re-renders
  const selectedVLANRef = useRef(selectedVLAN)
  const selectedVMIdRef = useRef(selectedVMId)
  
  useEffect(() => {
    selectedVLANRef.current = selectedVLAN
  }, [selectedVLAN])
  
  useEffect(() => {
    selectedVMIdRef.current = selectedVMId
  }, [selectedVMId])

  const clearAllSelections = useCallback((reactFlowInstance?: ReactFlowInstance | null) => {
    setSelectedVLAN(null)
    setSelectedVMId(null)
    setSelectedEdgeId(null)
    setSelectedRouter(false)
    setSelectedNodes([])

    // Clear ReactFlow selections if instance is provided
    if (reactFlowInstance) {
      reactFlowInstance.setNodes((nds: Node[]) =>
        nds.map((node) => ({
          ...node,
          selected: false,
          data: {
            ...node.data,
          },
        })),
      )

      reactFlowInstance.setEdges((eds: Edge[]) =>
        eds.map((edge) => ({
          ...edge,
          selected: false,
        })),
      )
    }
  }, [])

  const selectVLAN = useCallback((vlanId: string, reactFlowInstance?: ReactFlowInstance | null) => {
    setSelectedVLAN(vlanId)
    setSelectedVMId(null)
    setSelectedEdgeId(null)
    setSelectedRouter(false)

    // Select the VLAN node in ReactFlow
    if (reactFlowInstance) {
      reactFlowInstance.setNodes((nds: Node[]) =>
        nds.map((node) => ({
          ...node,
          selected: node.id === vlanId,
        })),
      )
      
      // Clear edge selections
      reactFlowInstance.setEdges((eds: Edge[]) =>
        eds.map((edge) => ({
          ...edge,
          selected: false,
        })),
      )
    }
  }, [])

  const selectEdge = useCallback((edge: Edge, reactFlowInstance?: ReactFlowInstance | null) => {
    setSelectedEdgeId(edge.id)
    setSelectedVLAN(null)
    setSelectedVMId(null)
    setSelectedRouter(false)

    // Clear node selections and select the edge in ReactFlow
    if (reactFlowInstance) {
      reactFlowInstance.setNodes((nds: Node[]) =>
        nds.map((node) => ({
          ...node,
          selected: false,
          data: {
            ...node.data,
          },
        })),
      )

      reactFlowInstance.setEdges((eds: Edge[]) =>
        eds.map((e) => ({
          ...e,
          selected: e.id === edge.id,
        })),
      )
    }
  }, [])

  const selectRouter = useCallback((reactFlowInstance?: ReactFlowInstance | null) => {
    setSelectedRouter(true)
    setSelectedVLAN(null)
    setSelectedVMId(null)
    setSelectedEdgeId(null)

    // Select router node in ReactFlow
    if (reactFlowInstance) {
      reactFlowInstance.setNodes((nds: Node[]) =>
        nds.map((node) => ({
          ...node,
          selected: node.type === 'router',
        })),
      )
      
      // Clear edge selections
      reactFlowInstance.setEdges((eds: Edge[]) =>
        eds.map((edge) => ({
          ...edge,
          selected: false,
        })),
      )
    }
  }, [])

  const selectVMInVLAN = useCallback((vmId: string, vlanId: string, reactFlowInstance?: ReactFlowInstance | null) => {
    setSelectedVLAN(vlanId)
    setSelectedVMId(vmId)
    setSelectedEdgeId(null)
    setSelectedRouter(false)

    // Select the VLAN node in ReactFlow (VMs are not separate nodes)
    if (reactFlowInstance) {
      reactFlowInstance.setNodes((nds: Node[]) =>
        nds.map((node) => ({
          ...node,
          selected: node.id === vlanId,
        })),
      )
      
      // Clear edge selections
      reactFlowInstance.setEdges((eds: Edge[]) =>
        eds.map((edge) => ({
          ...edge,
          selected: false,
        })),
      )
    }
  }, [])

  const selectVMFromPanel = useCallback((vmId: string, vlanId: string, reactFlowInstance?: ReactFlowInstance | null) => {
    // If clicking already selected VM, deselect it
    if (selectedVMId === vmId) {
      setSelectedVMId(null)
      // Keep VLAN selected but clear VM selection
      return
    }
    
    // Otherwise select the new VM
    setSelectedVLAN(vlanId)
    setSelectedVMId(vmId)
    setSelectedEdgeId(null)
    setSelectedRouter(false)

    // Update ReactFlow visual selection to show VLAN as selected
    if (reactFlowInstance) {
      reactFlowInstance.setNodes((nds: Node[]) =>
        nds.map((node) => ({
          ...node,
          selected: node.id === vlanId,
        })),
      )
      
      // Clear edge selections
      reactFlowInstance.setEdges((eds: Edge[]) =>
        eds.map((edge) => ({
          ...edge,
          selected: false,
        })),
      )
    }
  }, [selectedVMId, setSelectedVMId, setSelectedVLAN, setSelectedEdgeId, setSelectedRouter])

  const clearVMSelection = useCallback(() => {
    setSelectedVMId(null)
    // Keep VLAN and other selections intact
  }, [])

  const handleSelectionChange = useCallback(
    ({ nodes, edges }: { nodes: Node[]; edges: Edge[] }, reactFlowInstance?: ReactFlowInstance | null) => {
      const selectedNodeIds = nodes.map((node: Node) => node.id)
      setSelectedNodes(selectedNodeIds)

      if (edges.length > 0) {
        // Handle edge selection
        selectEdge(edges[0], reactFlowInstance)
      } else if (selectedNodeIds.length > 0) {
        // Handle node selection
        const selectedNodeId = selectedNodeIds[0]
        const selectedNode = nodes.find(n => n.id === selectedNodeId)
        
        if (selectedNode?.type === 'router') {
          selectRouter(reactFlowInstance)
        } else if (selectedNode?.type === 'vlan') {
          selectVLAN(selectedNodeId, reactFlowInstance)
        }
      } else {
        clearAllSelections(reactFlowInstance)
      }
    },
    [selectEdge, selectRouter, selectVLAN, clearAllSelections]
  )

  const handlePaneClick = useCallback((reactFlowInstance?: ReactFlowInstance | null) => {
    clearAllSelections(reactFlowInstance)
  }, [clearAllSelections])

  return {
    // State
    selectedVLAN,
    selectedVMId,
    selectedEdgeId,
    selectedRouter,
    selectedNodes,
    selectedVLANRef,
    selectedVMIdRef,
    // Actions
    clearAllSelections,
    clearVMSelection,
    selectVLAN,
    selectVMInVLAN,
    selectVMFromPanel,
    selectEdge,
    selectRouter,
    setSelectedVLAN,
    setSelectedVMId,
    setSelectedEdgeId,
    setSelectedRouter,
    setSelectedNodes,
    // Event handlers
    handleSelectionChange,
    handlePaneClick,
  }
}
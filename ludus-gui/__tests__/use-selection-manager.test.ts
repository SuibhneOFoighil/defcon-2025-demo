import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSelectionManager } from '@/hooks/use-selection-manager'
import type { ReactFlowInstance, Node, Edge } from '@xyflow/react'

// Mock ReactFlow instance
const createMockReactFlowInstance = (): Partial<ReactFlowInstance> => ({
  setNodes: vi.fn(),
  setEdges: vi.fn(),
  getNodes: vi.fn(() => []),
  getEdges: vi.fn(() => []),
})

describe('useSelectionManager', () => {
  let mockReactFlowInstance: Partial<ReactFlowInstance>

  beforeEach(() => {
    vi.clearAllMocks()
    mockReactFlowInstance = createMockReactFlowInstance()
  })

  describe('initial state', () => {
    it('should initialize with null selections', () => {
      const { result } = renderHook(() => useSelectionManager())
      
      expect(result.current.selectedVLAN).toBeNull()
      expect(result.current.selectedVMId).toBeNull()
      expect(result.current.selectedEdgeId).toBeNull()
      expect(result.current.selectedRouter).toBe(false)
      expect(result.current.selectedNodes).toEqual([])
    })
  })

  describe('selectVMInVLAN', () => {
    it('should set both selectedVLAN and selectedVMId', () => {
      const { result } = renderHook(() => useSelectionManager())
      
      act(() => {
        result.current.selectVMInVLAN('vm-1', 'vlan-1')
      })
      
      expect(result.current.selectedVLAN).toBe('vlan-1')
      expect(result.current.selectedVMId).toBe('vm-1')
      expect(result.current.selectedEdgeId).toBeNull()
      expect(result.current.selectedRouter).toBe(false)
    })

    it('should clear other selections when selecting VM', () => {
      const { result } = renderHook(() => useSelectionManager())
      
      // First set some other selections
      act(() => {
        result.current.setSelectedEdgeId('edge-1')
        result.current.setSelectedRouter(true)
      })
      
      // Then select VM
      act(() => {
        result.current.selectVMInVLAN('vm-1', 'vlan-1')
      })
      
      expect(result.current.selectedVLAN).toBe('vlan-1')
      expect(result.current.selectedVMId).toBe('vm-1')
      expect(result.current.selectedEdgeId).toBeNull()
      expect(result.current.selectedRouter).toBe(false)
    })

    it('should update ReactFlow instance when provided', () => {
      const { result } = renderHook(() => useSelectionManager())
      
      act(() => {
        result.current.selectVMInVLAN('vm-1', 'vlan-1', mockReactFlowInstance as ReactFlowInstance)
      })
      
      expect(mockReactFlowInstance.setNodes).toHaveBeenCalledWith(expect.any(Function))
      expect(mockReactFlowInstance.setEdges).toHaveBeenCalledWith(expect.any(Function))
    })

    it('should select correct VLAN node in ReactFlow', () => {
      const { result } = renderHook(() => useSelectionManager())
      
      act(() => {
        result.current.selectVMInVLAN('vm-1', 'vlan-1', mockReactFlowInstance as ReactFlowInstance)
      })
      
      // Get the function passed to setNodes
      const setNodesCall = (mockReactFlowInstance.setNodes as ReturnType<typeof vi.fn>).mock.calls[0][0]
      const mockNodes: Node[] = [
        { id: 'vlan-1', type: 'vlan', position: { x: 0, y: 0 }, data: {}, selected: false },
        { id: 'vlan-2', type: 'vlan', position: { x: 0, y: 0 }, data: {}, selected: false },
      ]
      
      const updatedNodes = setNodesCall(mockNodes)
      
      expect(updatedNodes[0].selected).toBe(true)  // vlan-1 should be selected
      expect(updatedNodes[1].selected).toBe(false) // vlan-2 should not be selected
    })
  })

  describe('clearAllSelections', () => {
    it('should clear all selection state', () => {
      const { result } = renderHook(() => useSelectionManager())
      
      // Set some selections first
      act(() => {
        result.current.selectVMInVLAN('vm-1', 'vlan-1')
        result.current.setSelectedNodes(['node-1', 'node-2'])
      })
      
      // Clear all selections
      act(() => {
        result.current.clearAllSelections()
      })
      
      expect(result.current.selectedVLAN).toBeNull()
      expect(result.current.selectedVMId).toBeNull()
      expect(result.current.selectedEdgeId).toBeNull()
      expect(result.current.selectedRouter).toBe(false)
      expect(result.current.selectedNodes).toEqual([])
    })

    it('should update ReactFlow instance when clearing selections', () => {
      const { result } = renderHook(() => useSelectionManager())
      
      act(() => {
        result.current.clearAllSelections(mockReactFlowInstance as ReactFlowInstance)
      })
      
      expect(mockReactFlowInstance.setNodes).toHaveBeenCalledWith(expect.any(Function))
      expect(mockReactFlowInstance.setEdges).toHaveBeenCalledWith(expect.any(Function))
    })
  })

  describe('selectVLAN', () => {
    it('should clear selectedVMId when selecting VLAN directly', () => {
      const { result } = renderHook(() => useSelectionManager())
      
      // First select a VM
      act(() => {
        result.current.selectVMInVLAN('vm-1', 'vlan-1')
      })
      
      expect(result.current.selectedVMId).toBe('vm-1')
      
      // Then select VLAN directly
      act(() => {
        result.current.selectVLAN('vlan-2')
      })
      
      expect(result.current.selectedVLAN).toBe('vlan-2')
      expect(result.current.selectedVMId).toBeNull() // Should be cleared
    })
  })

  describe('selectEdge', () => {
    it('should clear VM selection when selecting edge', () => {
      const { result } = renderHook(() => useSelectionManager())
      
      // First select a VM
      act(() => {
        result.current.selectVMInVLAN('vm-1', 'vlan-1')
      })
      
      const mockEdge: Edge = {
        id: 'edge-1',
        source: 'node-1',
        target: 'node-2',
      }
      
      // Then select edge
      act(() => {
        result.current.selectEdge(mockEdge)
      })
      
      expect(result.current.selectedEdgeId).toBe('edge-1')
      expect(result.current.selectedVLAN).toBeNull()
      expect(result.current.selectedVMId).toBeNull()
    })
  })

  describe('selectRouter', () => {
    it('should clear VM selection when selecting router', () => {
      const { result } = renderHook(() => useSelectionManager())
      
      // First select a VM
      act(() => {
        result.current.selectVMInVLAN('vm-1', 'vlan-1')
      })
      
      // Then select router
      act(() => {
        result.current.selectRouter()
      })
      
      expect(result.current.selectedRouter).toBe(true)
      expect(result.current.selectedVLAN).toBeNull()
      expect(result.current.selectedVMId).toBeNull()
    })
  })

  describe('handleSelectionChange', () => {
    it('should handle VLAN node selection', () => {
      const { result } = renderHook(() => useSelectionManager())
      
      const mockNodes: Node[] = [
        { id: 'vlan-1', type: 'vlan', position: { x: 0, y: 0 }, data: {}, selected: true },
      ]
      const mockEdges: Edge[] = []
      
      act(() => {
        result.current.handleSelectionChange({ nodes: mockNodes, edges: mockEdges })
      })
      
      expect(result.current.selectedVLAN).toBe('vlan-1')
      expect(result.current.selectedVMId).toBeNull() // Should not auto-select VM
    })

    it('should handle router node selection', () => {
      const { result } = renderHook(() => useSelectionManager())
      
      const mockNodes: Node[] = [
        { id: 'router-1', type: 'router', position: { x: 0, y: 0 }, data: {}, selected: true },
      ]
      const mockEdges: Edge[] = []
      
      act(() => {
        result.current.handleSelectionChange({ nodes: mockNodes, edges: mockEdges })
      })
      
      expect(result.current.selectedRouter).toBe(true)
      expect(result.current.selectedVLAN).toBeNull()
      expect(result.current.selectedVMId).toBeNull()
    })

    it('should handle edge selection', () => {
      const { result } = renderHook(() => useSelectionManager())
      
      const mockNodes: Node[] = []
      const mockEdges: Edge[] = [
        { id: 'edge-1', source: 'node-1', target: 'node-2', selected: true },
      ]
      
      act(() => {
        result.current.handleSelectionChange({ nodes: mockNodes, edges: mockEdges })
      })
      
      expect(result.current.selectedEdgeId).toBe('edge-1')
      expect(result.current.selectedVLAN).toBeNull()
      expect(result.current.selectedVMId).toBeNull()
    })

    it('should clear selections when nothing is selected', () => {
      const { result } = renderHook(() => useSelectionManager())
      
      // First select something
      act(() => {
        result.current.selectVMInVLAN('vm-1', 'vlan-1')
      })
      
      // Then handle empty selection
      act(() => {
        result.current.handleSelectionChange({ nodes: [], edges: [] })
      })
      
      expect(result.current.selectedVLAN).toBeNull()
      expect(result.current.selectedVMId).toBeNull()
      expect(result.current.selectedEdgeId).toBeNull()
      expect(result.current.selectedRouter).toBe(false)
    })
  })

  describe('refs', () => {
    it('should maintain current values in refs', () => {
      const { result } = renderHook(() => useSelectionManager())
      
      act(() => {
        result.current.selectVMInVLAN('vm-1', 'vlan-1')
      })
      
      expect(result.current.selectedVLANRef.current).toBe('vlan-1')
      expect(result.current.selectedVMIdRef.current).toBe('vm-1')
    })
  })

  describe('selectVMFromPanel', () => {
    it('should select VM when no VM is currently selected', () => {
      const { result } = renderHook(() => useSelectionManager())
      
      act(() => {
        result.current.selectVMFromPanel('vm-1', 'vlan-1')
      })
      
      expect(result.current.selectedVLAN).toBe('vlan-1')
      expect(result.current.selectedVMId).toBe('vm-1')
      expect(result.current.selectedEdgeId).toBeNull()
      expect(result.current.selectedRouter).toBe(false)
    })

    it('should deselect VM when clicking already selected VM', () => {
      const { result } = renderHook(() => useSelectionManager())
      
      // First select a VM
      act(() => {
        result.current.selectVMFromPanel('vm-1', 'vlan-1')
      })
      
      expect(result.current.selectedVMId).toBe('vm-1')
      
      // Click the same VM again - should deselect
      act(() => {
        result.current.selectVMFromPanel('vm-1', 'vlan-1')
      })
      
      expect(result.current.selectedVMId).toBeNull()
      // VLAN should remain selected
      expect(result.current.selectedVLAN).toBe('vlan-1')
    })

    it('should switch VM selection when clicking different VM', () => {
      const { result } = renderHook(() => useSelectionManager())
      
      // First select VM 1
      act(() => {
        result.current.selectVMFromPanel('vm-1', 'vlan-1')
      })
      
      expect(result.current.selectedVMId).toBe('vm-1')
      
      // Then select VM 2 in same VLAN
      act(() => {
        result.current.selectVMFromPanel('vm-2', 'vlan-1')
      })
      
      expect(result.current.selectedVMId).toBe('vm-2')
      expect(result.current.selectedVLAN).toBe('vlan-1')
    })

    it('should switch VLAN and VM when selecting VM in different VLAN', () => {
      const { result } = renderHook(() => useSelectionManager())
      
      // First select VM in VLAN 1
      act(() => {
        result.current.selectVMFromPanel('vm-1', 'vlan-1')
      })
      
      expect(result.current.selectedVMId).toBe('vm-1')
      expect(result.current.selectedVLAN).toBe('vlan-1')
      
      // Then select VM in VLAN 2
      act(() => {
        result.current.selectVMFromPanel('vm-3', 'vlan-2')
      })
      
      expect(result.current.selectedVMId).toBe('vm-3')
      expect(result.current.selectedVLAN).toBe('vlan-2')
    })

    it('should clear other selections when selecting VM from panel', () => {
      const { result } = renderHook(() => useSelectionManager())
      
      // First select an edge and router
      act(() => {
        result.current.setSelectedEdgeId('edge-1')
        result.current.setSelectedRouter(true)
      })
      
      expect(result.current.selectedEdgeId).toBe('edge-1')
      expect(result.current.selectedRouter).toBe(true)
      
      // Then select VM from panel
      act(() => {
        result.current.selectVMFromPanel('vm-1', 'vlan-1')
      })
      
      expect(result.current.selectedVMId).toBe('vm-1')
      expect(result.current.selectedVLAN).toBe('vlan-1')
      expect(result.current.selectedEdgeId).toBeNull()
      expect(result.current.selectedRouter).toBe(false)
    })
  })
})
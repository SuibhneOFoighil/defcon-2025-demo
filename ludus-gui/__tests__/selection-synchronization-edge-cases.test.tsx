import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSelectionManager } from '@/hooks/use-selection-manager'
import type { ReactFlowInstance, Node, Edge } from '@xyflow/react'

// Mock ReactFlow instance with comprehensive methods
const createMockReactFlowInstance = (): Partial<ReactFlowInstance> => ({
  setNodes: vi.fn(),
  setEdges: vi.fn(),
  getNodes: vi.fn(() => []),
  getEdges: vi.fn(() => []),
  deleteElements: vi.fn().mockResolvedValue(undefined),
  fitView: vi.fn(),
  getViewport: vi.fn(() => ({ x: 0, y: 0, zoom: 1 })),
  setViewport: vi.fn(),
})

describe('Selection Synchronization Edge Cases', () => {
  let mockReactFlowInstance: Partial<ReactFlowInstance>
  let consoleSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.clearAllMocks()
    mockReactFlowInstance = createMockReactFlowInstance()
    // Suppress console errors for expected test failures
    consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleSpy.mockRestore()
  })

  describe('Hook-only Selection Manager Edge Cases', () => {
    it('should handle rapid successive selections without race conditions', () => {
      const { result } = renderHook(() => useSelectionManager())

      // Simulate rapid successive clicks
      act(() => {
        result.current.selectVMInVLAN('vm-1', 'vlan-1')
        result.current.selectVMInVLAN('vm-2', 'vlan-1')
        result.current.selectVMInVLAN('vm-3', 'vlan-2')
        result.current.selectVLAN('vlan-1')
        result.current.selectRouter()
      })

      // Only the last selection should be active
      expect(result.current.selectedRouter).toBe(true)
      expect(result.current.selectedVLAN).toBeNull()
      expect(result.current.selectedVMId).toBeNull()
      expect(result.current.selectedEdgeId).toBeNull()
    })

    it('should handle invalid ReactFlow instance gracefully', () => {
      const { result } = renderHook(() => useSelectionManager())
      const invalidInstance = null

      // Should not throw when ReactFlow instance is null/undefined
      expect(() => {
        act(() => {
          result.current.selectVMInVLAN('vm-1', 'vlan-1', invalidInstance as any)
        })
      }).not.toThrow()

      expect(result.current.selectedVMId).toBe('vm-1')
      expect(result.current.selectedVLAN).toBe('vlan-1')
    })

    it('should handle ReactFlow instance method failures by throwing error', () => {
      const { result } = renderHook(() => useSelectionManager())
      const faultyInstance = {
        ...mockReactFlowInstance,
        setNodes: vi.fn().mockImplementation(() => {
          throw new Error('ReactFlow setNodes failed')
        }),
      }

      // When ReactFlow methods throw, the entire operation should fail
      expect(() => {
        act(() => {
          result.current.selectVMInVLAN('vm-1', 'vlan-1', faultyInstance as ReactFlowInstance)
        })
      }).toThrow('ReactFlow setNodes failed')

      // State should remain unchanged when the operation fails
      expect(result.current.selectedVMId).toBeNull()
      expect(result.current.selectedVLAN).toBeNull()
    })

    it('should maintain ref consistency across re-renders', () => {
      const { result, rerender } = renderHook(() => useSelectionManager())

      act(() => {
        result.current.selectVMInVLAN('vm-1', 'vlan-1')
      })

      const firstRef = result.current.selectedVMIdRef
      const firstValue = result.current.selectedVMIdRef.current

      // Force re-render
      rerender()

      // Refs should maintain consistency
      expect(result.current.selectedVMIdRef).toBe(firstRef)
      expect(result.current.selectedVMIdRef.current).toBe(firstValue)
      expect(result.current.selectedVMIdRef.current).toBe('vm-1')
    })

    it('should handle handleSelectionChange with malformed data', () => {
      const { result } = renderHook(() => useSelectionManager())

      // Test with nodes missing required properties
      const malformedNodes: Node[] = [
        { id: 'test', position: { x: 0, y: 0 }, data: {} } as Node,
      ]

      expect(() => {
        act(() => {
          result.current.handleSelectionChange({
            nodes: malformedNodes,
            edges: [],
          })
        })
      }).not.toThrow()

      // Should handle gracefully - no selection should be made
      expect(result.current.selectedVLAN).toBeNull()
      expect(result.current.selectedRouter).toBe(false)
    })

    it('should handle selectVMFromPanel toggle behavior correctly', () => {
      const { result } = renderHook(() => useSelectionManager())

      // Select a VM
      act(() => {
        result.current.selectVMFromPanel('vm-1', 'vlan-1')
      })

      expect(result.current.selectedVMId).toBe('vm-1')
      expect(result.current.selectedVLAN).toBe('vlan-1')

      // Click the same VM again - should deselect VM but keep VLAN
      act(() => {
        result.current.selectVMFromPanel('vm-1', 'vlan-1')
      })

      expect(result.current.selectedVMId).toBeNull()
      expect(result.current.selectedVLAN).toBe('vlan-1') // VLAN should remain selected
    })

    it('should handle edge selection with missing edge properties', () => {
      const { result } = renderHook(() => useSelectionManager())

      const malformedEdge: Edge = {
        id: 'edge-1',
        source: 'source',
        target: 'target',
        // Missing data property
      } as Edge

      expect(() => {
        act(() => {
          result.current.selectEdge(malformedEdge)
        })
      }).not.toThrow()

      expect(result.current.selectedEdgeId).toBe('edge-1')
    })
  })

  describe('Selection State Consistency', () => {
    it('should handle concurrent state updates correctly', () => {
      const { result } = renderHook(() => useSelectionManager())

      // Simulate rapid concurrent updates
      act(() => {
        result.current.setSelectedVMId('vm-1')
        result.current.setSelectedVLAN('vlan-1')
        result.current.setSelectedEdgeId('edge-1')
        result.current.setSelectedRouter(true)
        // Then immediately clear VM selection
        result.current.setSelectedVMId(null)
      })

      // Final state should reflect the last operation
      expect(result.current.selectedVMId).toBeNull()
      expect(result.current.selectedVLAN).toBe('vlan-1')
      expect(result.current.selectedEdgeId).toBe('edge-1')
      expect(result.current.selectedRouter).toBe(true)
    })

    it('should maintain state consistency during rapid ReactFlow sync attempts', () => {
      const { result } = renderHook(() => useSelectionManager())
      const slowInstance = {
        ...mockReactFlowInstance,
        setNodes: vi.fn().mockImplementation(() => {
          // Simulate slow ReactFlow update
          return new Promise(resolve => setTimeout(resolve, 100))
        }),
      }

      // Start multiple sync operations
      act(() => {
        result.current.selectVMInVLAN('vm-1', 'vlan-1', slowInstance as ReactFlowInstance)
        result.current.selectVMInVLAN('vm-2', 'vlan-2', slowInstance as ReactFlowInstance)
        result.current.selectVMInVLAN('vm-3', 'vlan-3', slowInstance as ReactFlowInstance)
      })

      // State should reflect the last operation
      expect(result.current.selectedVMId).toBe('vm-3')
      expect(result.current.selectedVLAN).toBe('vlan-3')
    })
  })

  describe('Error Recovery', () => {
    it('should recover from corrupted selection state', () => {
      const { result } = renderHook(() => useSelectionManager())

      // Manually corrupt state by setting invalid combinations
      act(() => {
        result.current.setSelectedVMId('vm-1')
        result.current.setSelectedVLAN('vlan-1')
        result.current.setSelectedEdgeId('edge-1')
        result.current.setSelectedRouter(true)
        result.current.setSelectedNodes(['node-1', 'node-2'])
      })

      // All selections are active (invalid state)
      expect(result.current.selectedVMId).toBe('vm-1')
      expect(result.current.selectedEdgeId).toBe('edge-1')
      expect(result.current.selectedRouter).toBe(true)

      // Proper selection should clear invalid state
      act(() => {
        result.current.selectVLAN('vlan-2')
      })

      // Should clear conflicting selections
      expect(result.current.selectedVLAN).toBe('vlan-2')
      expect(result.current.selectedVMId).toBeNull()
      expect(result.current.selectedEdgeId).toBeNull()
      expect(result.current.selectedRouter).toBe(false)
    })

    it('should handle edge cases in selection change with undefined values', () => {
      const { result } = renderHook(() => useSelectionManager())

      // Test with empty selections
      act(() => {
        result.current.handleSelectionChange({ nodes: [], edges: [] })
      })

      expect(result.current.selectedVLAN).toBeNull()
      expect(result.current.selectedVMId).toBeNull()
      expect(result.current.selectedEdgeId).toBeNull()
      expect(result.current.selectedRouter).toBe(false)

      // Test with undefined types
      const nodeWithoutType: Node = {
        id: 'test-node',
        position: { x: 0, y: 0 },
        data: {},
        // type is undefined
      } as Node

      act(() => {
        result.current.handleSelectionChange({ 
          nodes: [nodeWithoutType], 
          edges: [] 
        })
      })

      // Should not select anything for nodes without proper type
      expect(result.current.selectedVLAN).toBeNull()
      expect(result.current.selectedRouter).toBe(false)
    })
  })
})
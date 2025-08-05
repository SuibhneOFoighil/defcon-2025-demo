import { useMemo } from 'react'
import type { Node } from '@xyflow/react'
import type { NodeData } from '@/lib/types'

interface UseVMDeleteModalIntegrationProps {
  nodes: Node<NodeData>[]
  addHandlersToNodes: (nodes: Node<NodeData>[]) => Node<NodeData>[]
  showDeleteModal: (vmId: string, vlanId: string) => Promise<void>
}

/**
 * Custom hook to integrate VM delete modal with node handlers
 * Overrides the business logic delete handler with UI modal trigger
 */
export function useVMDeleteModalIntegration({ 
  nodes, 
  addHandlersToNodes, 
  showDeleteModal 
}: UseVMDeleteModalIntegrationProps) {
  const nodesWithModalDeleteHandler = useMemo(() => {
    // First, add the standard business logic handlers from context
    const nodesWithBusinessHandlers = addHandlersToNodes(nodes)
    
    // Override the business delete handler with UI modal trigger
    return nodesWithBusinessHandlers.map(node => {
      if (node.type === "vlan") {
        return {
          ...node,
          data: {
            ...node.data,
            onDeleteVM: showDeleteModal, // Override: modal trigger instead of direct delete
          }
        }
      }
      return node
    })
  }, [nodes, addHandlersToNodes, showDeleteModal])

  return nodesWithModalDeleteHandler
}
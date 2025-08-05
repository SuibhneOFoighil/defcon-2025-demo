import { useStore } from "@xyflow/react"

/**
 * Custom hook to check if a node is selected in ReactFlow
 * @param nodeId The ID of the node to check
 * @returns An object containing selection state and CSS classes
 */
export function useNodeSelection(nodeId: string) {
  // Get the selected state from ReactFlow
  const selected = useStore((state) => state.nodeLookup.get(nodeId)?.selected)

  // Generate border class based on selection state
  // Using a more subtle selection style since VM selection is more important
  const borderClass = selected
    ? "border-[hsl(var(--primary)/0.4)] border"
    : "border-[hsl(var(--topology-node-border))] border"

  return {
    selected,
    borderClass,
    // Additional selection-related properties can be added here
  }
}

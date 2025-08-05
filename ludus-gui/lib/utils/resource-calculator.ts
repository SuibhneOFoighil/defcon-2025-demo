import type { Node } from "@xyflow/react"
import type { NodeData, VMData, RouterNodeData } from "@/lib/types"

export interface ResourceTotals {
  vms: number
  cpus: number
  ram: number
}

export function calculateResourceTotals(
  nodes: Node<NodeData | RouterNodeData>[]
): ResourceTotals {
  let totalVMs = 0
  let totalCPUs = 0
  let totalRAM = 0

  // Calculate from VM data in nodes
  nodes.forEach(node => {
    if (node.type === 'vlan' && (node.data as NodeData).vms) {
      (node.data as NodeData).vms!.forEach((vm: VMData) => {
        totalVMs++
        totalCPUs += vm.cpus || 0
        totalRAM += vm.ramGb || 0
      })
    } else if (node.type === 'router') {
      // Router is also a VM that consumes resources
      totalVMs++
      const routerData = node.data as RouterNodeData
      const routerCPUs = routerData.cpus || 2
      const routerRAM = routerData.ram_gb || 2
      
      totalCPUs += routerCPUs
      totalRAM += routerRAM
    }
  })

  const finalTotals = {
    vms: totalVMs,
    cpus: totalCPUs,
    ram: totalRAM
  }

  return finalTotals
}
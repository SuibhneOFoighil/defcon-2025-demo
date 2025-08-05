import { describe, it, expect } from 'vitest'
import { calculateResourceTotals } from '@/lib/utils/resource-calculator'
import type { Node } from '@xyflow/react'
import type { NodeData, VMData, RouterNodeData } from '@/lib/types'

describe('calculateResourceTotals', () => {
  it('should calculate totals from VM data', () => {
    const nodes: Node<NodeData>[] = [
      {
        id: 'vlan1',
        type: 'vlan',
        data: {
          vms: [
            { id: 'vm1', cpus: 4, ramGb: 8 } as VMData,
            { id: 'vm2', cpus: 2, ramGb: 4 } as VMData,
          ]
        },
        position: { x: 0, y: 0 }
      }
    ]

    const result = calculateResourceTotals(nodes)

    expect(result).toEqual({
      vms: 2,
      cpus: 6,
      ram: 12
    })
  })

  it('should handle multiple VLANs', () => {
    const nodes: Node<NodeData>[] = [
      {
        id: 'vlan1',
        type: 'vlan',
        data: {
          vms: [
            { id: 'vm1', cpus: 2, ramGb: 4 } as VMData,
          ]
        },
        position: { x: 0, y: 0 }
      },
      {
        id: 'vlan2',
        type: 'vlan',
        data: {
          vms: [
            { id: 'vm2', cpus: 4, ramGb: 8 } as VMData,
            { id: 'vm3', cpus: 2, ramGb: 4 } as VMData,
          ]
        },
        position: { x: 0, y: 0 }
      }
    ]

    const result = calculateResourceTotals(nodes)

    expect(result).toEqual({
      vms: 3,
      cpus: 8,
      ram: 16
    })
  })

  it('should handle VMs with missing resource data', () => {
    const nodes: Node<NodeData>[] = [
      {
        id: 'vlan1',
        type: 'vlan',
        data: {
          vms: [
            { id: 'vm1', cpus: 4 } as VMData, // Missing ramGb
            { id: 'vm2', ramGb: 8 } as VMData, // Missing cpus
            { id: 'vm3' } as VMData, // Missing both
          ]
        },
        position: { x: 0, y: 0 }
      }
    ]

    const result = calculateResourceTotals(nodes)

    expect(result).toEqual({
      vms: 3,
      cpus: 4,
      ram: 8
    })
  })

  it('should use zeros when VM data is incomplete', () => {
    const nodes: Node<NodeData>[] = [
      {
        id: 'vlan1',
        type: 'vlan',
        data: {
          vms: [
            { id: 'vm1' } as VMData, // Missing resource data
          ]
        },
        position: { x: 0, y: 0 }
      }
    ]

    const result = calculateResourceTotals(nodes)

    expect(result).toEqual({
      vms: 1,
      cpus: 0,
      ram: 0
    })
  })

  it('should handle empty VLANs', () => {
    const nodes: Node<NodeData>[] = [
      {
        id: 'vlan1',
        type: 'vlan',
        data: {
          vms: []
        },
        position: { x: 0, y: 0 }
      }
    ]

    const result = calculateResourceTotals(nodes)

    expect(result).toEqual({
      vms: 0,
      cpus: 0,
      ram: 0
    })
  })

  it('should include router resources in totals', () => {
    const nodes: Node<NodeData | RouterNodeData>[] = [
      {
        id: 'router',
        type: 'router',
        data: {
          cpus: 4,
          ram_gb: 8
        } as RouterNodeData,
        position: { x: 0, y: 0 }
      },
      {
        id: 'vlan10',
        type: 'vlan',
        data: {
          vms: [
            { id: 'vm1', cpus: 2, ramGb: 4 } as VMData,
          ]
        },
        position: { x: 0, y: 0 }
      }
    ]

    const result = calculateResourceTotals(nodes)

    expect(result).toEqual({
      vms: 2, // 1 router + 1 VM (router should count as a VM!)
      cpus: 6, // 4 router + 2 VM
      ram: 12 // 8 router + 4 VM
    })
  })

  it('should count router in VM total even with no VLAN VMs', () => {
    const nodes: Node<NodeData | RouterNodeData>[] = [
      {
        id: 'router',
        type: 'router',
        data: {
          cpus: 2,
          ram_gb: 2
        } as RouterNodeData,
        position: { x: 0, y: 0 }
      },
      {
        id: 'vlan10',
        type: 'vlan',
        data: {
          vms: [] // Empty VLAN
        },
        position: { x: 0, y: 0 }
      }
    ]

    const result = calculateResourceTotals(nodes)

    expect(result).toEqual({
      vms: 1, // Only router (should still be counted!)
      cpus: 2, // Router CPUs
      ram: 2   // Router RAM
    })
  })

  it('should use router defaults when specs missing', () => {
    const nodes: Node<NodeData | RouterNodeData>[] = [
      {
        id: 'router',
        type: 'router',
        data: {} as RouterNodeData, // Missing cpus and ram_gb
        position: { x: 0, y: 0 }
      }
    ]

    const result = calculateResourceTotals(nodes)

    expect(result).toEqual({
      vms: 1,
      cpus: 2, // Default
      ram: 2  // Default
    })
  })
})
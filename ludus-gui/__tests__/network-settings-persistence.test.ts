import { describe, it, expect } from 'vitest'
import { generateRangeConfigFromCanvas } from '@/lib/utils/range-config-generator'
import type { Node, Edge } from '@xyflow/react'

// Use a local interface to match the generator's expectations
interface TestRangeConfig {
  ludus?: any[]
  network?: {
    inter_vlan_default?: string
    external_default?: string
    wireguard_vlan_default?: string
    always_blocked_networks?: string[]
  }
}

describe('Network Settings Persistence', () => {
  const mockNodes: Node[] = [
    {
      id: 'vlan10',
      type: 'vlan',
      position: { x: 0, y: 0 },
      data: {
        label: 'VLAN 10',
        vms: [
          {
            id: 'vm1',
            label: 'Test VM',
            vmName: '',
            status: 'Stopped' as const,
            type: 'Linux' as const,
            template: 'debian-12-x64-server-template',
          }
        ],
      },
    },
  ]

  const mockEdges: Edge[] = []

  it('should preserve global network settings from existing config', () => {
    const existingConfig: Partial<TestRangeConfig> = {
      network: {
        inter_vlan_default: 'DROP',
        external_default: 'REJECT',
        wireguard_vlan_default: 'DROP',
        always_blocked_networks: ['192.168.1.0/24', '10.0.0.0/8'],
      }
    }

    const result = generateRangeConfigFromCanvas(mockNodes, mockEdges, existingConfig)

    expect(result.network).toBeDefined()
    expect(result.network?.inter_vlan_default).toBe('DROP')
    expect(result.network?.external_default).toBe('REJECT')
    expect(result.network?.wireguard_vlan_default).toBe('DROP')
    expect(result.network?.always_blocked_networks).toEqual(['192.168.1.0/24', '10.0.0.0/8'])
  })

  it('should use router node data as fallback when no existing config provided', () => {
    const nodesWithRouter: Node[] = [
      ...mockNodes,
      {
        id: 'router',
        type: 'router',
        position: { x: 100, y: 100 },
        data: {
          inter_vlan_default: 'ACCEPT',
          external_default: 'DROP',
          wireguard_vlan_default: 'REJECT',
        },
      },
    ]

    const result = generateRangeConfigFromCanvas(nodesWithRouter, mockEdges, {})

    expect(result.network).toBeDefined()
    expect(result.network?.inter_vlan_default).toBe('ACCEPT')
    expect(result.network?.external_default).toBe('DROP')
    expect(result.network?.wireguard_vlan_default).toBe('REJECT')
    expect(result.network?.always_blocked_networks).toEqual([])
  })

  it('should prioritize existing config over router node data', () => {
    const existingConfig: Partial<TestRangeConfig> = {
      network: {
        inter_vlan_default: 'DROP',
        external_default: 'REJECT',
        wireguard_vlan_default: 'DROP',
        always_blocked_networks: ['custom.blocked.network/24'],
      }
    }

    const nodesWithRouter: Node[] = [
      ...mockNodes,
      {
        id: 'router',
        type: 'router',
        position: { x: 100, y: 100 },
        data: {
          inter_vlan_default: 'ACCEPT', // Should be overridden
          external_default: 'ACCEPT',   // Should be overridden
          wireguard_vlan_default: 'ACCEPT', // Should be overridden
        },
      },
    ]

    const result = generateRangeConfigFromCanvas(nodesWithRouter, mockEdges, existingConfig)

    expect(result.network).toBeDefined()
    expect(result.network?.inter_vlan_default).toBe('DROP') // From existing config
    expect(result.network?.external_default).toBe('REJECT') // From existing config
    expect(result.network?.wireguard_vlan_default).toBe('DROP') // From existing config
    expect(result.network?.always_blocked_networks).toEqual(['custom.blocked.network/24'])
  })

  it('should use hardcoded defaults when neither existing config nor router data available', () => {
    const result = generateRangeConfigFromCanvas(mockNodes, mockEdges, {})

    expect(result.network).toBeDefined()
    expect(result.network?.inter_vlan_default).toBe('REJECT')
    expect(result.network?.external_default).toBe('ACCEPT')
    expect(result.network?.wireguard_vlan_default).toBe('ACCEPT')
    expect(result.network?.always_blocked_networks).toEqual([])
  })

  it('should preserve partial network settings from existing config', () => {
    const existingConfig: Partial<TestRangeConfig> = {
      network: {
        inter_vlan_default: 'DROP',
        // external_default and wireguard_vlan_default are intentionally missing
        always_blocked_networks: ['test.network/24'],
      }
    }

    const result = generateRangeConfigFromCanvas(mockNodes, mockEdges, existingConfig)

    expect(result.network).toBeDefined()
    expect(result.network?.inter_vlan_default).toBe('DROP') // From existing config
    expect(result.network?.external_default).toBe('ACCEPT') // Fallback to default
    expect(result.network?.wireguard_vlan_default).toBe('ACCEPT') // Fallback to default
    expect(result.network?.always_blocked_networks).toEqual(['test.network/24'])
  })
})
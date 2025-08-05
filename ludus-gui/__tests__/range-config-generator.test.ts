import { describe, it, expect, beforeEach } from 'vitest'
import { generateRangeConfigFromCanvas, generateYAMLFromCanvas } from '@/lib/utils/range-config-generator'
import type { Node, Edge } from '@xyflow/react'
import type { VMData } from '@/lib/types'

// Test data types
interface CanvasNodeData {
  label?: string
  vms?: VMData[]
  template?: string
  ram_gb?: number
  cpus?: number
  roles?: string[]
  inter_vlan_default?: string
  external_default?: string
  [key: string]: unknown
}

describe('Range Config Generator - Router Tests', () => {
  let mockVlanNodes: Node<CanvasNodeData>[]
  let mockRouterNode: Node<CanvasNodeData>
  let mockEdges: Edge[]
  let mockVMs: VMData[]

  beforeEach(() => {
    // Mock VM data
    mockVMs = [
      {
        id: 'vm1',
        label: 'Web Server',
        status: 'Running',
        vmName: 'web-server-01',
        template: 'debian-12-x64-server-template',
        ramGb: 4,
        cpus: 2
      },
      {
        id: 'vm2', 
        label: 'Database',
        status: 'Stopped',
        vmName: 'db-server-01',
        template: 'win2022-server-x64-template',
        ramGb: 8,
        cpus: 4
      }
    ]

    // Mock VLAN nodes
    mockVlanNodes = [
      {
        id: 'vlan10',
        type: 'vlan',
        position: { x: 0, y: 0 },
        data: {
          label: 'Web Tier',
          vms: [mockVMs[0]]
        }
      },
      {
        id: 'vlan20', 
        type: 'vlan',
        position: { x: 0, y: 100 },
        data: {
          label: 'Database Tier',
          vms: [mockVMs[1]]
        }
      }
    ]

    // Mock router node
    mockRouterNode = {
      id: 'router1',
      type: 'router',
      position: { x: 200, y: 50 },
      data: {
        label: 'Network Router',
        template: 'debian-11-x64-server-template',
        ram_gb: 2,
        cpus: 2,
        roles: ['firewall', 'proxy'],
        inter_vlan_default: 'REJECT',
        external_default: 'ACCEPT'
      }
    }

    // Mock edges
    mockEdges = [
      {
        id: 'edge1',
        source: 'vlan10',
        target: 'vlan20',
        type: 'custom',
        label: 'Web to DB Rule',
        data: {
          label: 'Web to DB Rule',
          status: {
            connectionType: 'accept',
            name: 'Web to DB Rule',
            protocol: 'tcp',
            ports: '80'
          }
        }
      }
    ]
  })

  describe('generateRangeConfigFromCanvas', () => {
    it('should generate config with router when router node is present', () => {
      const nodes = [...mockVlanNodes, mockRouterNode]
      const config = generateRangeConfigFromCanvas(nodes, mockEdges)

      expect(config.router).toBeDefined()
      expect(config.router?.vm_name).toBe('{{ range_id }}-router') // fallback since mock has no vm_name
      expect(config.router?.hostname).toBe('{{ range_id }}-router') // fallback since mock has no hostname
      expect(config.router?.template).toBe('debian-11-x64-server-template')
      expect(config.router?.ram_gb).toBe(2)
      expect(config.router?.cpus).toBe(2)
      expect(config.router?.roles).toEqual(['firewall', 'proxy'])
    })

    it('should use custom vm_name and hostname from router node data', () => {
      const customRouterNode = {
        ...mockRouterNode,
        data: {
          ...mockRouterNode.data,
          vm_name: 'custom-router-name',
          hostname: 'custom-router-host'
        }
      }
      const nodes = [...mockVlanNodes, customRouterNode]
      const config = generateRangeConfigFromCanvas(nodes, mockEdges)

      expect(config.router).toBeDefined()
      expect(config.router?.vm_name).toBe('custom-router-name')
      expect(config.router?.hostname).toBe('custom-router-host')
    })

    it('should include default router config when no router node is present', () => {
      const config = generateRangeConfigFromCanvas(mockVlanNodes, mockEdges)

      expect(config.router).toBeDefined()
      expect(config.router?.vm_name).toBe('{{ range_id }}-router')
      expect(config.router?.hostname).toBe('{{ range_id }}-router')
      expect(config.router?.template).toBe('debian-11-x64-server-template')
      expect(config.router?.ram_gb).toBe(2)
      expect(config.router?.cpus).toBe(2)
    })

    it('should generate VM configurations correctly', () => {
      const nodes = [...mockVlanNodes, mockRouterNode]
      const config = generateRangeConfigFromCanvas(nodes, mockEdges)

      expect(config.ludus).toHaveLength(2)
      
      // Check Linux VM
      const linuxVM = config.ludus.find(vm => vm.template === 'debian-12-x64-server-template')
      expect(linuxVM).toBeDefined()
      expect(linuxVM?.vm_name).toBe('web-server-01')
      expect(linuxVM?.vlan).toBe(10)
      expect(linuxVM?.ram_gb).toBe(4)
      expect(linuxVM?.cpus).toBe(2)
      // OS properties not included since we don't support OS-specific functionality yet

      // Check Windows VM
      const windowsVM = config.ludus.find(vm => vm.template === 'win2022-server-x64-template')
      expect(windowsVM).toBeDefined()
      expect(windowsVM?.vm_name).toBe('db-server-01')
      expect(windowsVM?.vlan).toBe(20)
      expect(windowsVM?.ram_gb).toBe(8)
      expect(windowsVM?.cpus).toBe(4)
      // OS properties not included since we don't support OS-specific functionality yet
    })

    it('should include network configuration with router defaults', () => {
      const nodes = [...mockVlanNodes, mockRouterNode]
      const config = generateRangeConfigFromCanvas(nodes, mockEdges)

      expect(config.network).toBeDefined()
      expect(config.network?.inter_vlan_default).toBe('REJECT')
      expect(config.network?.external_default).toBe('ACCEPT')
      expect(config.network?.rules).toHaveLength(1)
      expect(config.network?.rules?.[0].name).toBe('Web to DB Rule')
    })

    it('should include default configuration', () => {
      const nodes = [...mockVlanNodes, mockRouterNode]
      const config = generateRangeConfigFromCanvas(nodes, mockEdges)

      expect(config.defaults).toBeDefined()
      expect(config.defaults?.stale_hours).toBe(0)
      expect(config.defaults?.snapshot_with_RAM).toBe(true)
      expect(config.defaults?.enable_dynamic_wallpaper).toBe(true)
    })

    it('should skip special VLANs (VLAN >= 999)', () => {
      const specialVlan: Node<CanvasNodeData> = {
        id: 'vlan1000',
        type: 'vlan',
        position: { x: 0, y: 200 },
        data: {
          label: 'Special',
          vms: [mockVMs[0]]
        }
      }

      const nodes = [...mockVlanNodes, specialVlan, mockRouterNode]
      const config = generateRangeConfigFromCanvas(nodes, mockEdges)

      // Should only have 2 VMs from user VLANs, not 3
      expect(config.ludus).toHaveLength(2)
      
      // Verify no VM from special VLAN
      const specialVM = config.ludus.find(vm => vm.vlan === 1000)
      expect(specialVM).toBeUndefined()
    })

    it('should handle router with minimal configuration', () => {
      const minimalRouter: Node<CanvasNodeData> = {
        id: 'router2',
        type: 'router',
        position: { x: 200, y: 50 },
        data: {
          label: 'Minimal Router'
          // No template, ram_gb, cpus specified
        }
      }

      const nodes = [...mockVlanNodes, minimalRouter]
      const config = generateRangeConfigFromCanvas(nodes, mockEdges)

      expect(config.router).toBeDefined()
      expect(config.router?.template).toBe('debian-11-x64-server-template') // default
      expect(config.router?.ram_gb).toBe(2) // default
      expect(config.router?.cpus).toBe(2) // default
    })
  })

  describe('generateYAMLFromCanvas', () => {
    it('should generate valid YAML with router configuration', () => {
      const nodes = [...mockVlanNodes, mockRouterNode]
      const yaml = generateYAMLFromCanvas(nodes, mockEdges)

      expect(yaml).toContain('# yaml-language-server: $schema=https://docs.ludus.cloud/schemas/range-config.json')
      expect(yaml).toContain('ludus:')
      expect(yaml).toContain('router:')
      expect(yaml).toContain("vm_name: '{{ range_id }}-router'")
      expect(yaml).toContain('template: debian-11-x64-server-template')
      expect(yaml).toContain('ram_gb: 2')
      expect(yaml).toContain('cpus: 2')
      expect(yaml).toContain('roles:')
      expect(yaml).toContain('- firewall')
      expect(yaml).toContain('- proxy')
      expect(yaml).toContain('network:')
      expect(yaml).toContain('inter_vlan_default: REJECT')
      expect(yaml).toContain('external_default: ACCEPT')
      expect(yaml).toContain('defaults:')
      expect(yaml).toContain('stale_hours: 0')
    })

    it('should generate YAML with default router section when no router present', () => {
      const yaml = generateYAMLFromCanvas(mockVlanNodes, mockEdges)

      expect(yaml).toContain('ludus:')
      expect(yaml).toContain('router:')
      expect(yaml).toContain('vm_name: \'{{ range_id }}-router\'')
      expect(yaml).toContain('hostname: \'{{ range_id }}-router\'')
      expect(yaml).toContain('template: debian-11-x64-server-template')
      expect(yaml).toContain('network:')
      expect(yaml).toContain('defaults:')
    })

    it('should handle router with WireGuard configuration', () => {
      const routerWithWireGuard: Node<CanvasNodeData> = {
        id: 'router3',
        type: 'router',
        position: { x: 200, y: 50 },
        data: {
          label: 'WireGuard Router',
          template: 'debian-11-x64-server-template',
          ram_gb: 4,
          cpus: 2,
          outbound_wireguard_config: '[Interface]\nPrivateKey = abc123\n[Peer]\nPublicKey = def456',
          outbound_wireguard_vlans: [10, 20],
          inbound_wireguard: {
            enabled: true,
            server_cidr: '10.0.0.0/24',
            port: 51820,
            allowed_vlans: [10]
          }
        }
      }

      const nodes = [...mockVlanNodes, routerWithWireGuard]
      const yaml = generateYAMLFromCanvas(nodes, mockEdges)

      expect(yaml).toContain('outbound_wireguard_config: |-')
      expect(yaml).toContain('[Interface]')
      expect(yaml).toContain('outbound_wireguard_vlans:')
      expect(yaml).toContain('- 10')
      expect(yaml).toContain('- 20')
      expect(yaml).toContain('inbound_wireguard:')
      expect(yaml).toContain('enabled: true')
      expect(yaml).toContain('server_cidr: 10.0.0.0/24')
      expect(yaml).toContain('port: 51820')
    })

    it('should preserve existing config when provided', () => {
      const existingConfig = {
        ludus: [],
        defaults: {
          stale_hours: 24,
          timezone: 'UTC',
          ad_domain_admin: 'custom-admin',
          ad_domain_admin_password: '',
          ad_domain_user: '',
          ad_domain_user_password: '',
          ad_domain_safe_mode_password: '',
          ad_domain_functional_level: 'Win2012R2' as const,
          ad_forest_functional_level: 'Win2012R2' as const,
          enable_dynamic_wallpaper: true,
          snapshot_with_RAM: true // need to include this in existing config
        }
      }

      const nodes = [...mockVlanNodes, mockRouterNode]
      const config = generateRangeConfigFromCanvas(nodes, mockEdges, existingConfig)

      expect(config.defaults?.stale_hours).toBe(24) // preserved
      expect(config.defaults?.timezone).toBe('UTC') // preserved
      expect(config.defaults?.ad_domain_admin).toBe('custom-admin') // preserved
      expect(config.defaults?.snapshot_with_RAM).toBe(true) // preserved from existing
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty canvas', () => {
      const config = generateRangeConfigFromCanvas([], [])

      expect(config.ludus).toHaveLength(0)
      expect(config.router).toBeDefined()
      expect(config.router?.vm_name).toBe('{{ range_id }}-router')
      expect(config.router?.hostname).toBe('{{ range_id }}-router')
      expect(config.network).toBeDefined()
      expect(config.defaults).toBeDefined()
    })

    it('should handle VLAN with no VMs', () => {
      const emptyVlan: Node<CanvasNodeData> = {
        id: 'vlan30',
        type: 'vlan',
        position: { x: 0, y: 300 },
        data: {
          label: 'Empty VLAN',
          vms: []
        }
      }

      const nodes = [emptyVlan, mockRouterNode]
      const config = generateRangeConfigFromCanvas(nodes, mockEdges)

      expect(config.ludus).toHaveLength(0)
      expect(config.router).toBeDefined()
    })

    it('should convert invalid VLAN numbers to valid ones', () => {
      const invalidVlan: Node<CanvasNodeData> = {
        id: 'vlan1', // VLAN 1 is invalid for Ludus
        type: 'vlan',
        position: { x: 0, y: 0 },
        data: {
          label: 'Invalid VLAN',
          vms: [mockVMs[0]]
        }
      }

      const nodes = [invalidVlan, mockRouterNode]
      const config = generateRangeConfigFromCanvas(nodes, mockEdges)

      expect(config.ludus).toHaveLength(1)
      expect(config.ludus[0].vlan).toBe(10) // converted to valid VLAN
    })

    it('should handle VM without template by using type-based default', () => {
      const vmWithoutTemplate: VMData = {
        id: 'vm3',
        label: 'Kali Box',
        status: 'Running'
        // No template specified
      }

      const vlanWithKali: Node<CanvasNodeData> = {
        id: 'vlan40',
        type: 'vlan',
        position: { x: 0, y: 0 },
        data: {
          label: 'Security VLAN',
          vms: [vmWithoutTemplate]
        }
      }

      const nodes = [vlanWithKali, mockRouterNode]
      const config = generateRangeConfigFromCanvas(nodes, mockEdges)

      expect(config.ludus).toHaveLength(1)
      expect(config.ludus[0].template).toBe('debian-12-x64-server-template') // Kali now maps to Linux default
      expect(config.ludus[0].ram_gb).toBe(4) // default for Linux
      expect(config.ludus[0].cpus).toBe(2) // default for Linux
    })

    it('should handle MacOS VM type correctly', () => {
      const macVM: VMData = {
        id: 'vm4',
        label: 'Mac Development',
        status: 'Running'
      }

      const vlanWithMac: Node<CanvasNodeData> = {
        id: 'vlan50',
        type: 'vlan',
        position: { x: 0, y: 0 },
        data: {
          label: 'Dev VLAN',
          vms: [macVM]
        }
      }

      const nodes = [vlanWithMac]
      const config = generateRangeConfigFromCanvas(nodes, [])

      expect(config.ludus).toHaveLength(1)
      expect(config.ludus[0].template).toBe('debian-12-x64-server-template') // macOS now maps to Linux default
      expect(config.ludus[0].ram_gb).toBe(4) // default for Linux
      expect(config.ludus[0].cpus).toBe(2) // default for Linux
      // OS properties not included since we don't support OS-specific functionality yet
    })

    it('should handle multiple routers by using only the first one', () => {
      const secondRouter: Node<CanvasNodeData> = {
        id: 'router2',
        type: 'router',
        position: { x: 300, y: 50 },
        data: {
          label: 'Second Router',
          template: 'vyos-1.5.0',
          ram_gb: 4,
          cpus: 4
        }
      }

      const nodes = [...mockVlanNodes, mockRouterNode, secondRouter]
      const config = generateRangeConfigFromCanvas(nodes, mockEdges)

      // Should only include the first router found
      expect(config.router).toBeDefined()
      expect(config.router?.template).toBe('debian-11-x64-server-template') // from first router
      expect(config.router?.ram_gb).toBe(2) // from first router
    })
  })

  describe('Integration Tests', () => {
    it('should generate complete YAML configuration for complex topology', () => {
      // Create a complex topology with multiple VLANs, VMs, router, and network rules
      const complexVMs: VMData[] = [
        {
          id: 'web1',
          label: 'Web Server 1',
            status: 'Running',
          vmName: 'nginx-01',
          template: 'debian-12-x64-server-template',
          ramGb: 2,
          cpus: 1
        },
        {
          id: 'web2',
          label: 'Web Server 2',
            status: 'Running',
          vmName: 'apache-01',
          template: 'ubuntu-22.04-x64-server-template',
          ramGb: 4,
          cpus: 2
        },
        {
          id: 'db1',
          label: 'Database Primary',
            status: 'Running',
          vmName: 'mssql-primary',
          template: 'win2022-server-x64-template',
          ramGb: 16,
          cpus: 8
        },
        {
          id: 'kali1',
          label: 'Penetration Tester',
            status: 'Stopped',
          vmName: 'pentest-box',
          ramGb: 8,
          cpus: 4
        }
      ]

      const complexNodes: Node<CanvasNodeData>[] = [
        {
          id: 'vlan10',
          type: 'vlan',
          position: { x: 0, y: 0 },
          data: {
            label: 'Web Tier',
            vms: [complexVMs[0], complexVMs[1]]
          }
        },
        {
          id: 'vlan20',
          type: 'vlan', 
          position: { x: 0, y: 100 },
          data: {
            label: 'Database Tier',
            vms: [complexVMs[2]]
          }
        },
        {
          id: 'vlan30',
          type: 'vlan',
          position: { x: 0, y: 200 },
          data: {
            label: 'Security Testing',
            vms: [complexVMs[3]]
          }
        },
        {
          id: 'router1',
          type: 'router',
          position: { x: 200, y: 100 },
          data: {
            label: 'Main Router',
            template: 'vyos-1.5.0',
            ram_gb: 4,
            cpus: 2,
            roles: ['router', 'firewall', 'vpn'],
            inter_vlan_default: 'REJECT',
            external_default: 'ACCEPT',
            outbound_wireguard_config: '[Interface]\nPrivateKey = test123\n[Peer]\nPublicKey = peer456',
            outbound_wireguard_vlans: [10, 20],
            inbound_wireguard: {
              enabled: true,
              server_cidr: '10.100.0.0/24',
              port: 51820,
              allowed_vlans: [30]
            }
          }
        }
      ]

      const complexEdges: Edge[] = [
        {
          id: 'web-to-db',
          source: 'vlan10',
          target: 'vlan20',
          type: 'custom',
          label: 'Web to Database Access',
          data: {
            label: 'Web to Database Access',
            status: {
              connectionType: 'accept',
              name: 'Web to Database Access',
              protocol: 'tcp',
              ports: '3306'
            }
          }
        },
        {
          id: 'pentest-to-web',
          source: 'vlan30',
          target: 'vlan10',
          type: 'custom',
          label: 'Pentest to Web',
          data: {
            label: 'Pentest to Web',
            status: {
              connectionType: 'deny',
              name: 'Pentest to Web',
              protocol: 'tcp',
              ports: '80'
            }
          }
        }
      ]

      const yaml = generateYAMLFromCanvas(complexNodes, complexEdges)

      // Verify comprehensive YAML structure
      expect(yaml).toContain('# yaml-language-server: $schema=https://docs.ludus.cloud/schemas/range-config.json')
      
      // Check VM configurations
      expect(yaml).toContain('vm_name: nginx-01')
      expect(yaml).toContain('vm_name: apache-01')
      expect(yaml).toContain('vm_name: mssql-primary')
      expect(yaml).toContain('vm_name: pentest-box')
      
      // Check templates
      expect(yaml).toContain('template: debian-12-x64-server-template')
      expect(yaml).toContain('template: ubuntu-22.04-x64-server-template')
      expect(yaml).toContain('template: win2022-server-x64-template')
      expect(yaml).toContain('template: debian-12-x64-server-template') // Kali now maps to Linux default
      
      // Check VLAN assignments
      expect(yaml).toContain('vlan: 10')
      expect(yaml).toContain('vlan: 20')
      expect(yaml).toContain('vlan: 30')
      
      // Check router configuration
      expect(yaml).toContain('router:')
      expect(yaml).toContain('template: vyos-1.5.0')
      expect(yaml).toContain('roles:')
      expect(yaml).toContain('- router')
      expect(yaml).toContain('- firewall')
      expect(yaml).toContain('- vpn')
      
      // Check WireGuard configuration
      expect(yaml).toContain('outbound_wireguard_config: |-')
      expect(yaml).toContain('[Interface]')
      expect(yaml).toContain('outbound_wireguard_vlans:')
      expect(yaml).toContain('inbound_wireguard:')
      expect(yaml).toContain('server_cidr: 10.100.0.0/24')
      
      // Check network rules
      expect(yaml).toContain('network:')
      expect(yaml).toContain('rules:')
      expect(yaml).toContain('name: Web to Database Access')
      expect(yaml).toContain('name: Pentest to Web')
      expect(yaml).toContain('action: ACCEPT')
      expect(yaml).toContain('action: REJECT')
      
      // Check defaults
      expect(yaml).toContain('defaults:')
      expect(yaml).toContain('stale_hours: 0')
    })
  })

  describe('Router-VLAN Public Rule Generation', () => {
    it('should convert router-to-VLAN edge to public rule', () => {
      const routerToVlanEdge: Edge = {
        id: 'router-to-vlan10',
        source: 'router1',
        target: 'vlan10',
        type: 'custom',
        data: {
          label: 'Internet to Web',
          status: {
            connectionType: 'accept',
            name: 'Internet to Web Access',
            protocol: 'tcp',
            ports: '80,443',
            action: 'ACCEPT'
          }
        }
      }

      const nodes = [...mockVlanNodes, mockRouterNode]
      const edges = [routerToVlanEdge]
      const config = generateRangeConfigFromCanvas(nodes, edges)

      expect(config.network?.rules).toHaveLength(1)
      expect(config.network?.rules?.[0]).toMatchObject({
        name: 'Internet to Web Access',
        vlan_src: 'public',
        vlan_dst: 10,
        protocol: 'tcp',
        ports: '80,443',
        action: 'ACCEPT'
      })
    })

    it('should convert VLAN-to-router edge to public rule', () => {
      const vlanToRouterEdge: Edge = {
        id: 'vlan20-to-router',
        source: 'vlan20',
        target: 'router1',
        type: 'custom',
        data: {
          label: 'Database to Internet',
          status: {
            connectionType: 'deny',
            name: 'Block DB Internet Access',
            protocol: 'all',
            ports: 'all',
            action: 'REJECT'
          }
        }
      }

      const nodes = [...mockVlanNodes, mockRouterNode]
      const edges = [vlanToRouterEdge]
      const config = generateRangeConfigFromCanvas(nodes, edges)

      expect(config.network?.rules).toHaveLength(1)
      expect(config.network?.rules?.[0]).toMatchObject({
        name: 'Block DB Internet Access',
        vlan_src: 20,
        vlan_dst: 'public',
        protocol: 'all',
        ports: 'all',
        action: 'REJECT'
      })
    })

    it('should handle bidirectional router-VLAN connections', () => {
      const bidirectionalEdges: Edge[] = [
        {
          id: 'router-to-vlan10',
          source: 'router1',
          target: 'vlan10',
          type: 'custom',
          data: {
            status: {
              connectionType: 'accept',
              name: 'Inbound Web Traffic',
              protocol: 'tcp',
              ports: '80,443'
            }
          }
        },
        {
          id: 'vlan10-to-router',
          source: 'vlan10',
          target: 'router1',
          type: 'custom',
          data: {
            status: {
              connectionType: 'accept',
              name: 'Outbound Web Traffic',
              protocol: 'tcp',
              ports: 'all'
            }
          }
        }
      ]

      const nodes = [...mockVlanNodes, mockRouterNode]
      const config = generateRangeConfigFromCanvas(nodes, bidirectionalEdges)

      expect(config.network?.rules).toHaveLength(2)
      
      const inboundRule = config.network?.rules?.find(rule => rule.name === 'Inbound Web Traffic')
      expect(inboundRule).toMatchObject({
        vlan_src: 'public',
        vlan_dst: 10
      })

      const outboundRule = config.network?.rules?.find(rule => rule.name === 'Outbound Web Traffic')
      expect(outboundRule).toMatchObject({
        vlan_src: 10,
        vlan_dst: 'public'
      })
    })

    it('should combine router-VLAN rules with regular VLAN-VLAN rules', () => {
      const mixedEdges: Edge[] = [
        // Router-VLAN edge
        {
          id: 'router-to-vlan10',
          source: 'router1',
          target: 'vlan10',
          type: 'custom',
          data: {
            status: {
              connectionType: 'accept',
              name: 'Public Web Access',
              protocol: 'tcp',
              ports: '80,443'
            }
          }
        },
        // VLAN-VLAN edge
        {
          id: 'vlan10-to-vlan20',
          source: 'vlan10',
          target: 'vlan20',
          type: 'custom',
          data: {
            status: {
              connectionType: 'accept',
              name: 'Web to DB',
              protocol: 'tcp',
              ports: '3306'
            }
          }
        }
      ]

      const nodes = [...mockVlanNodes, mockRouterNode]
      const config = generateRangeConfigFromCanvas(nodes, mixedEdges)

      expect(config.network?.rules).toHaveLength(2)
      
      const publicRule = config.network?.rules?.find(rule => rule.vlan_src === 'public')
      expect(publicRule).toMatchObject({
        name: 'Public Web Access',
        vlan_src: 'public',
        vlan_dst: 10
      })

      const vlanRule = config.network?.rules?.find(rule => rule.vlan_src === 10)
      expect(vlanRule).toMatchObject({
        name: 'Web to DB',
        vlan_src: 10,
        vlan_dst: 20
      })
    })

    it('should preserve IP octet restrictions for router rules', () => {
      const routerEdgeWithIP: Edge = {
        id: 'router-to-vlan10-restricted',
        source: 'router1',
        target: 'vlan10',
        type: 'custom',
        data: {
          status: {
            connectionType: 'accept',
            name: 'Restricted Web Access',
            protocol: 'tcp',
            ports: '80',
            ip_last_octet_dst: '10'
          }
        }
      }

      const nodes = [...mockVlanNodes, mockRouterNode]
      const edges = [routerEdgeWithIP]
      const config = generateRangeConfigFromCanvas(nodes, edges)

      expect(config.network?.rules?.[0]).toMatchObject({
        name: 'Restricted Web Access',
        vlan_src: 'public',
        vlan_dst: 10,
        ip_last_octet_dst: '10'
      })
    })
  })
})
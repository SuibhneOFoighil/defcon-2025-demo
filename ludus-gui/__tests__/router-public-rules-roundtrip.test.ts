import { describe, it, expect, beforeEach } from 'vitest'
import { generateRangeConfigFromCanvas } from '@/lib/utils/range-config-generator'
import type { Node, Edge } from '@xyflow/react'
import type { VMData, RouterNodeData, NodeData } from '@/lib/types'
import type { NetworkRule, RangeConfig } from '@/lib/types/range-config'
import * as yaml from 'js-yaml'

// Mock the generateFlowData function logic for testing
function generateFlowDataMock(
  vlans: Array<{ id: number; label: string }>,
  vms: VMData[],
  rules: NetworkRule[],
  routerData?: any,
  networkConfig?: RangeConfig['network']
): { nodes: Node<NodeData>[]; edges: Edge[] } {
  const nodes: Node<NodeData>[] = []
  const edges: Edge[] = []
  
  // Create VLAN nodes
  vlans.forEach((vlan, index) => {
    const vlanVMs = vms.filter(vm => vm.vlan === vlan.id)
    
    nodes.push({
      id: `vlan${vlan.id}`,
      type: 'vlan',
      position: { x: 200 + (index * 420), y: 200 },
      data: {
        label: vlan.label,
        vms: vlanVMs,
      }
    })
  })
  
  // Create router node if router data exists
  if (routerData) {
    nodes.push({
      id: 'router',
      type: 'router',
      position: { x: 400, y: 50 },
      data: {
        label: 'Router',
        template: routerData.template || 'debian-11-x64-server-template',
        ram_gb: routerData.ram_gb || 2,
        cpus: routerData.cpus || 2,
        inter_vlan_default: networkConfig?.inter_vlan_default || 'REJECT',
        external_default: networkConfig?.external_default || 'ACCEPT'
      } as RouterNodeData
    })
  }
  
  // Create edges from network rules
  if (networkConfig?.rules) {
    networkConfig.rules.forEach((rule, index) => {
      let sourceId: string, targetId: string
      let sourceExists = false, targetExists = false
      
      if (rule.vlan_src === 'public') {
        sourceId = 'router'
        sourceExists = nodes.some(n => n.id === 'router')
      } else {
        sourceId = `vlan${rule.vlan_src}`
        sourceExists = nodes.some(n => n.id === sourceId)
      }
      
      if (rule.vlan_dst === 'public') {
        targetId = 'router'
        targetExists = nodes.some(n => n.id === 'router')
      } else {
        targetId = `vlan${rule.vlan_dst}`
        targetExists = nodes.some(n => n.id === targetId)
      }
      
      if (sourceExists && targetExists) {
        const getConnectionType = (action: string): 'accept' | 'deny' | 'drop' => {
          switch (action.toUpperCase()) {
            case 'ACCEPT': return 'accept'
            case 'REJECT': return 'deny'
            case 'DROP': return 'drop'
            default: return 'accept'
          }
        }
        
        edges.push({
          id: `rule-${index}`,
          source: sourceId,
          target: targetId,
          type: 'custom',
          data: {
            label: rule.name,
            status: {
              connectionType: getConnectionType(rule.action),
              name: rule.name,
              protocol: rule.protocol,
              ports: rule.ports || '',
              action: rule.action,
              ...(rule.ip_last_octet_src && {
                ip_last_octet_src: rule.ip_last_octet_src
              }),
              ...(rule.ip_last_octet_dst && {
                ip_last_octet_dst: rule.ip_last_octet_dst
              })
            }
          }
        })
      }
    })
  }
  
  return { nodes, edges }
}

describe('Router Public Rules Roundtrip Testing', () => {
  let originalConfig: RangeConfig

  beforeEach(() => {
    originalConfig = {
      ludus: [
        {
          vm_name: 'test-web-server',
          hostname: 'test-web',
          template: 'debian-12-x64-server-template',
          vlan: 10,
          ip_last_octet: 10,
          ram_gb: 4,
          cpus: 2,
          linux: true
        },
        {
          vm_name: 'test-db-server',
          hostname: 'test-db',
          template: 'debian-12-x64-server-template',
          vlan: 20,
          ip_last_octet: 10,
          ram_gb: 8,
          cpus: 4,
          linux: true
        }
      ],
      router: {
        vm_name: 'test-router',
        hostname: 'test-router',
        template: 'debian-11-x64-server-template',
        ram_gb: 2,
        cpus: 2
      },
      network: {
        inter_vlan_default: 'REJECT',
        external_default: 'ACCEPT',
        rules: [
          {
            name: 'Internet to Web Server',
            vlan_src: 'public',
            vlan_dst: 10,
            protocol: 'tcp',
            ports: '80,443',
            action: 'ACCEPT'
          },
          {
            name: 'Web Server to Internet',
            vlan_src: 10,
            vlan_dst: 'public',
            protocol: 'tcp',
            ports: 'all',
            action: 'ACCEPT'
          },
          {
            name: 'Web to Database',
            vlan_src: 10,
            vlan_dst: 20,
            protocol: 'tcp',
            ports: '5432',
            action: 'ACCEPT'
          }
        ]
      },
      defaults: {
        snapshot_with_RAM: true,
        stale_hours: 0,
        ad_domain_functional_level: 'Win2012R2',
        ad_forest_functional_level: 'Win2012R2',
        ad_domain_admin: 'admin',
        ad_domain_admin_password: 'password',
        ad_domain_user: 'user',
        ad_domain_user_password: 'password',
        ad_domain_safe_mode_password: 'password',
        timezone: 'America/New_York',
        enable_dynamic_wallpaper: true
      }
    }
  })

  describe('Full Roundtrip: Config → Canvas → Config', () => {
    it('should preserve public rules through complete conversion cycle', () => {
      // Step 1: Config → Canvas (simulate loading existing config)
      const vlans = [
        { id: 10, label: 'Web Tier' },
        { id: 20, label: 'Database Tier' }
      ]
      
      const vms = originalConfig.ludus.map(vm => ({
        id: vm.vm_name,
        label: vm.hostname,
        status: 'Running' as const,
        vmName: vm.vm_name,
        template: vm.template,
        vlan: vm.vlan,
        ramGb: vm.ram_gb,
        cpus: vm.cpus,
        ipLastOctet: vm.ip_last_octet
      }))
      
      const { nodes, edges } = generateFlowDataMock(
        vlans, 
        vms, 
        originalConfig.network!.rules!, 
        originalConfig.router, 
        originalConfig.network
      )
      
      // Verify canvas state
      expect(nodes).toHaveLength(3) // 2 VLANs + 1 router
      expect(edges).toHaveLength(3) // 2 public rules + 1 VLAN-VLAN rule
      
      // Check router edges exist
      const routerToVlanEdge = edges.find(e => e.source === 'router' && e.target === 'vlan10')
      expect(routerToVlanEdge).toBeDefined()
      
      const vlanToRouterEdge = edges.find(e => e.source === 'vlan10' && e.target === 'router')
      expect(vlanToRouterEdge).toBeDefined()
      
      // Step 2: Canvas → Config (simulate saving)
      const regeneratedConfig = generateRangeConfigFromCanvas(nodes, edges)
      
      // Step 3: Verify preservation of public rules
      expect(regeneratedConfig.network?.rules).toHaveLength(3)
      
      const publicToVlanRule = regeneratedConfig.network?.rules?.find(
        rule => rule.vlan_src === 'public' && rule.vlan_dst === 10
      )
      expect(publicToVlanRule).toMatchObject({
        name: 'Internet to Web Server',
        vlan_src: 'public',
        vlan_dst: 10,
        protocol: 'tcp',
        ports: '80,443',
        action: 'ACCEPT'
      })
      
      const vlanToPublicRule = regeneratedConfig.network?.rules?.find(
        rule => rule.vlan_src === 10 && rule.vlan_dst === 'public'
      )
      expect(vlanToPublicRule).toMatchObject({
        name: 'Web Server to Internet',
        vlan_src: 10,
        vlan_dst: 'public',
        protocol: 'tcp',
        ports: 'all',
        action: 'ACCEPT'
      })
      
      const vlanToVlanRule = regeneratedConfig.network?.rules?.find(
        rule => rule.vlan_src === 10 && rule.vlan_dst === 20
      )
      expect(vlanToVlanRule).toMatchObject({
        name: 'Web to Database',
        vlan_src: 10,
        vlan_dst: 20,
        protocol: 'tcp',
        ports: '5432',
        action: 'ACCEPT'
      })
    })

    it('should preserve complex public rules with IP restrictions', () => {
      const complexConfig: RangeConfig = {
        ...originalConfig,
        network: {
          ...originalConfig.network!,
          rules: [
            {
              name: 'Restricted Public Access',
              vlan_src: 'public',
              vlan_dst: 10,
              protocol: 'tcp',
              ports: '8080',
              action: 'ACCEPT',
              ip_last_octet_dst: 50
            },
            {
              name: 'Limited Outbound',
              vlan_src: 20,
              vlan_dst: 'public',
              protocol: 'tcp',
              ports: '443',
              action: 'ACCEPT',
              ip_last_octet_src: 10
            }
          ]
        }
      }
      
      // Config → Canvas
      const vlans = [
        { id: 10, label: 'Web Tier' },
        { id: 20, label: 'Database Tier' }
      ]
      
      const vms = complexConfig.ludus.map(vm => ({
        id: vm.vm_name,
        label: vm.hostname,
        status: 'Running' as const,
        vmName: vm.vm_name,
        template: vm.template,
        vlan: vm.vlan,
        ramGb: vm.ram_gb,
        cpus: vm.cpus,
        ipLastOctet: vm.ip_last_octet
      }))
      
      const { nodes, edges } = generateFlowDataMock(
        vlans, 
        vms, 
        complexConfig.network!.rules!, 
        complexConfig.router, 
        complexConfig.network
      )
      
      // Canvas → Config
      const regeneratedConfig = generateRangeConfigFromCanvas(nodes, edges)
      
      // Verify IP restrictions are preserved
      const restrictedRule = regeneratedConfig.network?.rules?.find(
        rule => rule.name === 'Restricted Public Access'
      )
      expect(restrictedRule).toMatchObject({
        vlan_src: 'public',
        vlan_dst: 10,
        ip_last_octet_dst: 50 // Number gets preserved in roundtrip
      })
      
      const limitedRule = regeneratedConfig.network?.rules?.find(
        rule => rule.name === 'Limited Outbound'
      )
      expect(limitedRule).toMatchObject({
        vlan_src: 20,
        vlan_dst: 'public',
        ip_last_octet_src: 10 // Number gets preserved in roundtrip
      })
    })

    it('should preserve action types through roundtrip', () => {
      const actionsConfig: RangeConfig = {
        ...originalConfig,
        network: {
          ...originalConfig.network!,
          rules: [
            {
              name: 'Accept Rule',
              vlan_src: 'public',
              vlan_dst: 10,
              protocol: 'tcp',
              ports: '80',
              action: 'ACCEPT'
            },
            {
              name: 'Reject Rule',
              vlan_src: 10,
              vlan_dst: 'public',
              protocol: 'tcp',
              ports: '22',
              action: 'REJECT'
            },
            {
              name: 'Drop Rule',
              vlan_src: 'public',
              vlan_dst: 10,
              protocol: 'tcp',
              ports: '23',
              action: 'DROP'
            }
          ]
        }
      }
      
      // Config → Canvas → Config
      const vlans = [{ id: 10, label: 'Web Tier' }]
      const vms = actionsConfig.ludus.slice(0, 1).map(vm => ({
        id: vm.vm_name,
        label: vm.hostname,
        status: 'Running' as const,
        vmName: vm.vm_name,
        template: vm.template,
        vlan: vm.vlan,
        ramGb: vm.ram_gb,
        cpus: vm.cpus,
        ipLastOctet: vm.ip_last_octet
      }))
      
      const { nodes, edges } = generateFlowDataMock(
        vlans, 
        vms, 
        actionsConfig.network!.rules!, 
        actionsConfig.router, 
        actionsConfig.network
      )
      
      const regeneratedConfig = generateRangeConfigFromCanvas(nodes, edges)
      
      // Verify all action types are preserved
      const actions = regeneratedConfig.network?.rules?.map(rule => rule.action).sort()
      expect(actions).toEqual(['ACCEPT', 'DROP', 'REJECT'])
      
      const acceptRule = regeneratedConfig.network?.rules?.find(rule => rule.action === 'ACCEPT')
      expect(acceptRule?.name).toBe('Accept Rule')
      
      const rejectRule = regeneratedConfig.network?.rules?.find(rule => rule.action === 'REJECT')
      expect(rejectRule?.name).toBe('Reject Rule')
      
      const dropRule = regeneratedConfig.network?.rules?.find(rule => rule.action === 'DROP')
      expect(dropRule?.name).toBe('Drop Rule')
    })
  })

  describe('Edge Data Consistency', () => {
    it('should maintain consistent edge data through conversions', () => {
      const testRule: NetworkRule = {
        name: 'Complex Public Rule',
        vlan_src: 'public',
        vlan_dst: 10,
        protocol: 'tcp',
        ports: '80,443,8080',
        action: 'ACCEPT',
        ip_last_octet_dst: 25
      }
      
      const testConfig = {
        ...originalConfig,
        network: {
          ...originalConfig.network!,
          rules: [testRule]
        }
      }
      
      // Config → Canvas
      const vlans = [{ id: 10, label: 'Web Tier' }]
      const vms = testConfig.ludus.slice(0, 1).map(vm => ({
        id: vm.vm_name,
        label: vm.hostname,
        status: 'Running' as const,
        vmName: vm.vm_name,
        template: vm.template,
        vlan: vm.vlan,
        ramGb: vm.ram_gb,
        cpus: vm.cpus,
        ipLastOctet: vm.ip_last_octet
      }))
      
      const { edges } = generateFlowDataMock(
        vlans, 
        vms, 
        testConfig.network!.rules!, 
        testConfig.router, 
        testConfig.network
      )
      
      const edge = edges[0]
      expect(edge.data?.status).toMatchObject({
        name: 'Complex Public Rule',
        protocol: 'tcp',
        ports: '80,443,8080',
        action: 'ACCEPT',
        connectionType: 'accept',
        ip_last_octet_dst: 25
      })
    })
  })
})
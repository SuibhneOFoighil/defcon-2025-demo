import { NextRequest, NextResponse } from 'next/server'
import { apiClient } from '@/lib/api/ludus/client'
import * as yaml from 'js-yaml'
import type { RangeConfig, RouterConfig, NetworkRule } from '@/lib/types/range-config'
import type { LudusVM } from '@/lib/types/vm-schemas'
import type { components } from '@/lib/api/ludus/schema'
import type { RangeEditorData, VlanDefinition } from '@/lib/types/range-editor'
import type { VMData } from '@/lib/types'
import type { Node, Edge } from '@xyflow/react'
import type { NodeData } from '@/lib/types'
import { transformLudusVMToVMData } from '@/lib/types/vm-schemas'
import { generateVMId } from '@/lib/utils/vm-id-generator'

// VLAN Constants for VM Categorization
// These special VLAN numbers are used to categorize VMs that don't match the user's configuration
const SPECIAL_VLANS = {
  // VLAN 999: VMs that are deployed but not found in the range configuration
  // These could be manually created VMs or VMs from previous configurations
  UNMATCHED_VMS: 999,
} as const


export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userID: string }> }
) {
  try {
    const { userID } = await params
    // Fetch both data sources in parallel
    const [configResponse, rangeResponse] = await Promise.all([
      apiClient.GET('/range/config', {
        // @ts-expect-error : schema is not typed correctly
        params: { query: { userID } }
      }),
      apiClient.GET('/range', {
        // @ts-expect-error :schema is not typed correctly
        params: { query: { userID } }
      })
    ])
    
    // Handle errors
    if (configResponse.error && rangeResponse.error) {
      return NextResponse.json(
        { error: 'Failed to fetch both range config and range details' },
        { status: 500 }
      )
    }
    
    // Parse range config if available
    let rangeConfig: RangeConfig | null = null
    if (configResponse.data) {
      try {
        // Handle YAML parsing if needed
        if (typeof configResponse.data === 'object' && 'result' in configResponse.data && typeof configResponse.data.result === 'string') {
          rangeConfig = yaml.load(configResponse.data.result, { schema: yaml.JSON_SCHEMA }) as RangeConfig
        } else {
          rangeConfig = configResponse.data as RangeConfig
        }
      } catch (yamlError) {
        console.error('Error parsing range config YAML:', yamlError)
      }
    }
    
    const deployedRange = rangeResponse.data
    
    // If we have neither config nor deployed VMs, return minimal data
    if (!rangeConfig && (!deployedRange || !deployedRange.VMs || deployedRange.VMs.length === 0)) {
      return NextResponse.json({
        data: {
          userID,
          rangeNumber: deployedRange?.rangeNumber || 0,
          rangeState: deployedRange?.rangeState || 'UNKNOWN',
          testingEnabled: deployedRange?.testingEnabled || false,
          allowedDomains: deployedRange?.allowedDomains || [],
          allowedIPs: deployedRange?.allowedIPs || [],
          topology: { vlans: [], networkRules: [] },
          vms: [],
          nodes: [],
          edges: [],
          metadata: {
            hasConfig: false,
            hasDeployedVMs: false,
            configDeploymentMismatch: false,
            unmatchedVMs: [],
            missingVMs: []
          }
        }
      })
    }
    
    // Perform reconciliation
    const editorData = await reconcileRangeData(rangeConfig, deployedRange, userID)
    
    return NextResponse.json({ data: editorData })
    
  } catch (error) {
    console.error('Error in editor-data endpoint:', error)
    return NextResponse.json(
      { error: 'Failed to fetch editor data' },
      { status: 500 }
    )
  }
}

/**
 * Reconciles range configuration with deployed VMs to create a unified view
 * 
 * Design Decision: VM Categorization Strategy
 * ==========================================
 * 
 * VMs are categorized into different VLANs based on their source:
 * 
 * 1. **User-Configured VMs** (VLAN 10+): VMs explicitly defined in the range config
 * 2. **Unmatched VMs** (VLAN 999): Deployed VMs that don't match the configuration
 *    - Could be manually created VMs or remnants from previous configurations
 *    - Rare in normal operation
 * 
 * Routers are handled separately through the router configuration and are not
 * categorized as regular VMs in the VLAN system.
 */
async function reconcileRangeData(
  config: RangeConfig | null,
  deployed: components['schemas']['RangeObject'] | undefined,
  userID: string
): Promise<RangeEditorData> {
  const reconciledVMs: VMData[] = []
  const unmatchedVMs: string[] = []
  const missingVMs: string[] = []
  
  // Create deployment map for quick lookup
  const deploymentMap = new Map<string, components['schemas']['VMObject']>()
  if (deployed?.VMs) {
    deployed.VMs.forEach(vm => {
      if (vm.name) {
        deploymentMap.set(vm.name, vm)
      }
    })
  }
  
  // Helper to resolve template variables
  const resolveTemplateName = (name: string): string => {
    return name.replace(/\{\{\s*range_id\s*\}\}/g, userID)
  }
  
  // Process VMs from config - only include if they are actually deployed
  if (config?.ludus) {
    
    config.ludus.forEach((configVM, index) => {
      const resolvedName = resolveTemplateName(configVM.vm_name)
      const deployedVM = deploymentMap.get(resolvedName)
      
      // Use Zod transformation for automatic field mapping (snake_case → camelCase)
      let reconciledVM: VMData
      try {
        // Transform LudusVM to VMData with automatic field mapping
        const transformedVM = transformLudusVMToVMData(configVM)
        
        // Override with deployment-specific data and unique ID
        reconciledVM = {
          ...transformedVM,
          id: `vm-${configVM.vlan}-${index}`,
          label: generateVMLabel(configVM),
          status: deployedVM ? (deployedVM.poweredOn ? 'Running' : 'Stopped') : 'Stopped',
          
          // Enhanced VMData fields
          
          // Runtime/deployment data
          isDeployed: !!deployedVM,
          poweredOn: deployedVM?.poweredOn || false,
          ipAddress: deployedVM?.ip || undefined,
          proxmoxId: deployedVM?.proxmoxID || undefined,
        }
        

        
      } catch (error) {
        console.error(`[reconcileRangeData] Zod transformation failed for VM ${configVM.vm_name}:`, error);
        
        // Fallback to manual mapping if Zod transformation fails
        reconciledVM = {
          id: `vlan${configVM.vlan}-vm${index}`,
          label: generateVMLabel(configVM),
          status: deployedVM ? (deployedVM.poweredOn ? 'Running' : 'Stopped') : 'Stopped',
          
          
          vlan: configVM.vlan,
          template: configVM.template,
          hostname: configVM.hostname,
          ipLastOctet: configVM.ip_last_octet || 0,
          ramGb: configVM.ram_gb || 0,
          ramMinGb: configVM.ram_min_gb, // ✅ NEW: Include RAM ballooning fallback
          cpus: configVM.cpus || 0,
          fullClone: configVM.full_clone, // ✅ NEW: Include clone type fallback
          
          forceIp: configVM.force_ip,
          ansibleGroups: configVM.ansible_groups,
          dnsRewrites: configVM.dns_rewrites,
          
          windows: configVM.windows,
          linux: configVM.linux,
          macOS: configVM.macOS,
          
          domain: configVM.domain,
          testing: configVM.testing,
          unmanaged: configVM.unmanaged,
          
          isDeployed: !!deployedVM,
          poweredOn: deployedVM?.poweredOn || false,
          ipAddress: deployedVM?.ip || undefined,
          proxmoxId: deployedVM?.proxmoxID || undefined,
        }
      }
      
      reconciledVMs.push(reconciledVM)
      
      if (deployedVM) {
        // Remove from deployment map to track unmatched
        deploymentMap.delete(resolvedName)
      } else {
        // Track VMs that are configured but not deployed
        missingVMs.push(resolvedName)
      }
    })
  }
  
  // Separate router VMs from other deployed VMs
  let routerVM: components['schemas']['VMObject'] | null = null
  const otherDeployedVMs: Map<string, components['schemas']['VMObject']> = new Map()
  
  // First pass: identify router VM
  deploymentMap.forEach((vm, name) => {
    if (vm.isRouter) {
      routerVM = vm
    } else {
      otherDeployedVMs.set(name, vm)
    }
  })
  
  // Process router configuration
  let routerData: RouterConfig & { isDeployed?: boolean; poweredOn?: boolean; ipAddress?: string } | null = null
  
  if (config?.router) {
    routerData = {
      ...config.router,
      isDeployed: !!routerVM,
      poweredOn: routerVM ? (routerVM as components['schemas']['VMObject']).poweredOn : false,
      ipAddress: routerVM ? (routerVM as components['schemas']['VMObject']).ip : undefined,
    }
  } else if (routerVM) {
    // Default router configuration from deployed VM
    const router = routerVM as components['schemas']['VMObject']
    routerData = {
      vm_name: router.name,
      hostname: router.name,
      template: 'debian-11-x64-server-template',
      ram_gb: 2,
      cpus: 2,
      isDeployed: true,
      poweredOn: router.poweredOn,
      ipAddress: router.ip,
    }
  } else {
    routerData = {
      vm_name: '{{ range_id }}-router',
      hostname: '{{ range_id }}-router',
      template: 'debian-11-x64-server-template',
      ram_gb: 2,
      cpus: 2,
    }
  }

  // Create a set of already processed VM names to prevent duplicates
  const processedVMNames = new Set<string>()
  reconciledVMs.forEach(vm => {
    if (vm.vmName) {
      processedVMNames.add(vm.vmName)
    }
  })
  
  // Categorize remaining VMs that are deployed but not in the user's configuration
  otherDeployedVMs.forEach((vm, name) => {
    // Skip if this VM is already processed (prevents duplicates)
    if (processedVMNames.has(name)) {
      return
    }
    
    // Unmatched VMs
    unmatchedVMs.push(name)
    
    reconciledVMs.push({
      id: generateVMId(name),
      label: name,
      status: vm.poweredOn ? 'Running' : 'Stopped',
      
      vmName: name,
      
      vlan: SPECIAL_VLANS.UNMATCHED_VMS,
      template: 'unknown',
      hostname: name,
      ipLastOctet: 0,
      ramGb: 0,
      cpus: 0,
      
      isDeployed: true,
      poweredOn: vm.poweredOn,
      ipAddress: vm.ip,
      proxmoxId: vm.proxmoxID,
    })
  })
  
  // Build VLAN definitions
  const vlans = buildVlanDefinitions(config, reconciledVMs)
  
  // Build network rules
  const networkRules = buildNetworkRules(config)
  
  // Note: Saved positions are now handled client-side with Dexie
  // The API no longer needs to fetch or pass saved positions
  
  // Generate React Flow nodes and edges
  const { nodes, edges } = generateFlowData(vlans, reconciledVMs, networkRules, undefined, routerData, config?.network)
  
  return {
    userID,
    rangeNumber: deployed?.rangeNumber || 0,
    rangeState: deployed?.rangeState || 'UNKNOWN',
    testingEnabled: deployed?.testingEnabled || false,
    allowedDomains: deployed?.allowedDomains || [],
    allowedIPs: deployed?.allowedIPs || [],
    
    // Pass the full network configuration object
    network: config?.network,
    
    // Pass the VM defaults configuration object  
    defaults: config?.defaults,
    
    // New unified structure (from UnifiedRangeData)
    // Note: RangeEditorData overrides nodes to be ReactFlow nodes for legacy compatibility
    flowNodes: nodes,
    flowEdges: edges,
    
    // Legacy compatibility (for backward compatibility during transition)
    topology: {
      vlans,
      networkRules
    },
    vms: reconciledVMs,
    nodes: nodes, // ReactFlow nodes (overrides UnifiedRangeData.nodes)
    edges: edges,
    metadata: {
      hasConfig: !!config,
      hasDeployedVMs: !!deployed?.VMs?.length,
      configDeploymentMismatch: unmatchedVMs.length > 0 || missingVMs.length > 0,
      unmatchedVMs,
      missingVMs
    }
  }
}

function generateVMLabel(vm: LudusVM): string {
  if (typeof vm.windows === 'object' && vm.windows?.domain?.role) {
    const role = vm.windows.domain.role.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
    return `${role} (${vm.hostname})`
  }
  
  const template = vm.template.replace(/-template$/, '').replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
  return `${template} (${vm.hostname})`
}

function buildVlanDefinitions(config: RangeConfig | null, vms: VMData[]): VlanDefinition[] {
  const vlanMap = new Map<number, VlanDefinition>()
  
  // Build from config
  if (config?.ludus) {
    config.ludus.forEach(vm => {
      if (!vlanMap.has(vm.vlan)) {
        vlanMap.set(vm.vlan, {
          id: vm.vlan,
          label: `VLAN ${vm.vlan}`,
          configuredVMs: []
        })
      }
      vlanMap.get(vm.vlan)!.configuredVMs.push(vm.vm_name)
    })
  }
  
  // Add VLANs for special VM categories (unmatched, etc.)
  vms.forEach(vm => {
    if (vm.vlan && vm.vlan > 0 && !vlanMap.has(vm.vlan)) {
      // Provide meaningful labels for special VLAN categories
      let label: string
      if (vm.vlan === SPECIAL_VLANS.UNMATCHED_VMS) {
        label = 'Unmatched VMs'
      } else {
        label = `VLAN ${vm.vlan}`
      }
      
      vlanMap.set(vm.vlan, {
        id: vm.vlan,
        label: label,
        configuredVMs: []
      })
    }
  })
  
  return Array.from(vlanMap.values()).sort((a, b) => a.id - b.id)
}

function buildNetworkRules(config: RangeConfig | null): NetworkRule[] {
  if (!config?.network?.rules) return []
  
  return config.network.rules.map(rule => ({
    name: rule.name || `Rule ${rule.vlan_src} → ${rule.vlan_dst}`,
    vlan_src: rule.vlan_src,
    vlan_dst: rule.vlan_dst,
    protocol: rule.protocol,
    ports: rule.ports || '',
    action: rule.action
  }))
}

function generateFlowData(
  vlans: VlanDefinition[], 
  vms: VMData[], 
  rules: NetworkRule[],
  savedPositions?: Map<string, { x: number; y: number }>,
  routerData?: RouterConfig & { isDeployed?: boolean; poweredOn?: boolean; ipAddress?: string } | null,
  networkConfig?: RangeConfig['network']
): { nodes: Node<NodeData>[], edges: Edge[] } {
  const nodes: Node<NodeData>[] = []
  const edges: Edge[] = []
  
  // Create VLAN nodes
  vlans.forEach((vlan, index) => {
    const vlanVMs = vms.filter(vm => vm.vlan === vlan.id)
    
    const nodeId = `vlan${vlan.id}`
    const savedPosition = savedPositions?.get(nodeId)
    const position = savedPosition || { x: 200 + (index * 420), y: 200 }
    
    nodes.push({
      id: nodeId,
      type: 'vlan',
      position,
      style: { width: 380 },
      // deletable: false, // Prevent VLAN deletion via keyboard shortcuts
      data: {
        label: vlan.label,
        vms: vlanVMs,
      }
    })
  })
  
  // Create router node if router configuration exists
  if (routerData) {
    const routerNodeId = 'router'
    const savedPosition = savedPositions?.get(routerNodeId)
    const position = savedPosition || { x: 400, y: 50 } // Position router at top center
    
    nodes.push({
      id: routerNodeId,
      type: 'router',
      position,
      deletable: false, // Prevent router deletion
      data: {
        // Spread all router data first
        ...routerData,
        
        // Override with UI-specific fields
        label: 'Router',
        
        // Network defaults (these come from network config)
        inter_vlan_default: networkConfig?.inter_vlan_default || 'REJECT',
        external_default: networkConfig?.external_default || 'ACCEPT',
        
        // Runtime status
        status: routerData.isDeployed ? (routerData.poweredOn ? 'Running' : 'Stopped') : 'Not Deployed',
      }
    })
  }
  
  // Create edges from explicit network rules (user-defined firewall rules)
  // Use networkConfig.rules directly instead of the processed rules array to preserve all fields
  if (networkConfig?.rules) {
    networkConfig.rules.forEach((rule, index) => {
      // Handle router connections (rules with 'public' as source or destination)
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
        // Map rule actions to edge connectionTypes
        // ACCEPT -> accept, REJECT -> deny, DROP -> drop
        const getConnectionType = (action: string): 'accept' | 'deny' | 'drop' => {
          switch (action.toUpperCase()) {
            case 'ACCEPT':
              return 'accept'
            case 'REJECT':
              return 'deny'
            case 'DROP':
              return 'drop'
            default:
              return 'accept' // Default fallback
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
              // Include IP octet restrictions from the raw network rule
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
  
  // No automatic infrastructure connections - router connectivity is implicit
  // Users only see edges for explicitly defined firewall rules
  
  return { nodes, edges }
}
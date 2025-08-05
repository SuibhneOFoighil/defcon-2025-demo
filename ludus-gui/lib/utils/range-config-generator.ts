import type { FormData, FirewallRule } from '@/components/wizards/create-range/types';
import type { Node, Edge } from '@xyflow/react';
import type { VMData, EdgeData as EdgeDataType } from '@/lib/types';
import type { RangeConfig } from '@/lib/types/range-config';
import * as yaml from 'js-yaml';
import { transformVMDataToLudusVM } from '@/lib/types/vm-schemas';
import { utilLogger } from '@/lib/logger';

// IP allocation utility functions
function buildIPRegistry(vlanVMs: VMData[]): Set<number> {
  const usedIPs = new Set<number>();
  vlanVMs.forEach(vm => {
    if (vm.ipLastOctet && vm.ipLastOctet >= 10) {
      usedIPs.add(vm.ipLastOctet);
    }
  });
  return usedIPs;
}

function getNextAvailableIP(usedIPs: Set<number>, startFrom: number = 10): number {
  let candidateIP = startFrom;
  while (usedIPs.has(candidateIP)) {
    candidateIP++;
    // Prevent infinite loop for edge cases
    if (candidateIP > 254) {
      utilLogger.warn({ candidateIP, usedIPs: Array.from(usedIPs) }, 'IP allocation reached upper limit');
      break;
    }
  }
  return candidateIP;
}

// Interface for canvas node data
interface CanvasNodeData {
  label?: string;
  vms?: VMData[];
  [key: string]: unknown;
}

import type { LudusVM } from '@/lib/types/vm-schemas';
import type { NetworkRule, RouterConfig } from '@/lib/types/range-config';

// RangeConfig type is now imported from Zod schema

export function generateRangeConfig(formData: FormData): string {
  utilLogger.debug({ 
    creationMethod: formData.creationMethod,
    numberOfVLANs: formData.numberOfVLANs,
    selectedTemplates: formData.selectedTemplates?.length || 0
  }, 'Starting range config generation from wizard');
  
  const config: RangeConfig = {
    ludus: [],
  };

  // Generate VMs based on creation method
  if (formData.creationMethod === 'template' && formData.selectedTemplates && formData.selectedTemplates.length > 0) {
    // For template-based creation with multiple templates, create VMs for each template
    let ipCounter = 10;
    let vlanCounter = 10;
    
    formData.selectedTemplates.forEach((template, index) => {
      const templateName = template.toLowerCase().replace(/\s+/g, '-');
      const isWindowsTemplate = template.includes('win') || template.includes('windows');
      
      const vm: LudusVM = {
        vm_name: `{{ range_id }}-${templateName}-${index + 1}`,
        hostname: `{{ range_id }}-${templateName.substring(0, 10)}-${index + 1}`,
        template: template,
        vlan: vlanCounter,
        ip_last_octet: ipCounter++,
        ram_gb: isWindowsTemplate ? 8 : 4,
        cpus: isWindowsTemplate ? 4 : 2,
      };

      if (isWindowsTemplate) {
        vm.windows = { sysprep: false };
      } else {
        vm.linux = true;
      }

      config.ludus.push(vm);
      
      // Increment VLAN for each template to separate them
      if (index > 0 && index % 5 === 0) {
        vlanCounter++;
        ipCounter = 10; // Reset IP counter for new VLAN
      }
    });
  } else if (formData.creationMethod === 'import' && formData.importedTemplate) {
    // For imported template, create a basic configuration
    config.ludus.push({
      vm_name: `{{ range_id }}-imported-vm`,
      hostname: `{{ range_id }}-imported`,
      template: 'debian-12-x64-server-template',
      vlan: 10,
      ip_last_octet: 10,
      ram_gb: 4,
      cpus: 2,
      linux: true,
    });
  } else if (formData.creationMethod === 'scratch') {
    // For from-scratch creation, generate VMs based on network configuration
    if (formData.numberOfVLANs && formData.numberOfVLANs > 0) {
      let vmCounter = 10;
      
      for (let vlan = 10; vlan < 10 + formData.numberOfVLANs; vlan++) {
        const vmsInThisVlan = formData.sameVMsPerVLAN 
          ? formData.vmsPerVLAN || 1
          : formData.vlanVMs?.[vlan] || 1;

        for (let vmIndex = 0; vmIndex < vmsInThisVlan; vmIndex++) {
          config.ludus.push({
            vm_name: `{{ range_id }}-vm-${vlan}-${vmIndex + 1}`,
            hostname: `{{ range_id }}-VM${vlan}-${vmIndex + 1}`,
            template: 'debian-12-x64-server-template',
            vlan: vlan,
            ip_last_octet: vmCounter++,
            ram_gb: 4,
            cpus: 2,
            linux: true,
          });
        }
      }
    }
  }

  // Add network configuration only if firewall rules are specified
  if (formData.firewallRules && formData.firewallRules.trim()) {
    try {
      const parsedRules = JSON.parse(formData.firewallRules) as FirewallRule[];
      if (parsedRules.length > 0) {
        config.network = {
          inter_vlan_default: 'REJECT',
          external_default: 'ACCEPT',
          rules: parsedRules.map(rule => {
            // Validate and convert VLAN values
            let vlanSrc: number | 'all' | 'public' | 'wireguard';
            if (rule.sourceVLAN === '*' || rule.sourceVLAN === 'all') {
              vlanSrc = 'all';
            } else if (rule.sourceVLAN === 'public') {
              vlanSrc = 'public';
            } else if (rule.sourceVLAN === 'wireguard') {
              vlanSrc = 'wireguard';
            } else {
              const parsed = parseInt(rule.sourceVLAN, 10);
              vlanSrc = isNaN(parsed) ? 'all' : parsed; // Default to 'all' if parsing fails
            }
            
            let vlanDst: number | 'all' | 'public' | 'wireguard';
            if (rule.destinationVLAN === '*' || rule.destinationVLAN === 'all') {
              vlanDst = 'all';
            } else if (rule.destinationVLAN === 'public') {
              vlanDst = 'public';
            } else if (rule.destinationVLAN === 'wireguard') {
              vlanDst = 'wireguard';
            } else {
              const parsed = parseInt(rule.destinationVLAN, 10);
              vlanDst = isNaN(parsed) ? 'all' : parsed; // Default to 'all' if parsing fails
            }

            // Validate protocol - ensure it's one of the allowed values
            const validProtocols = ['tcp', 'udp', 'udplite', 'icmp', 'ipv6-icmp', 'esp', 'ah', 'sctp', 'all'];
            const protocol = rule.protocol.toLowerCase();
            const validatedProtocol = validProtocols.includes(protocol) ? protocol : 'tcp';

            return {
              name: rule.name,
              vlan_src: vlanSrc,
              vlan_dst: vlanDst,
              protocol: validatedProtocol as 'tcp' | 'udp' | 'udplite' | 'icmp' | 'ipv6-icmp' | 'esp' | 'ah' | 'sctp' | 'all',
              ports: rule.ports === '*' ? 'all' : rule.ports,
              action: rule.action.toUpperCase() as 'ACCEPT' | 'REJECT' | 'DROP',
            };
          }),
        };
      }
    } catch {
      // Failed to parse firewall rules - silently continue with no network rules
    }
  }

  // Add basic default configuration
  config.defaults = {
    snapshot_with_RAM: true,
    ad_domain_functional_level: 'Win2012R2',
    ad_forest_functional_level: 'Win2012R2',
    ad_domain_admin: 'domainadmin',
    ad_domain_admin_password: 'password',
    ad_domain_user: 'domainuser',
    ad_domain_user_password: 'password',
    ad_domain_safe_mode_password: 'password',
    stale_hours: 0,
    enable_dynamic_wallpaper: true,
    timezone: 'America/New_York',
  };

  // Add default router configuration
  config.router = {
    vm_name: `{{ range_id }}-router`,
    hostname: `{{ range_id }}-router`,
    template: 'debian-11-x64-server-template',
    ram_gb: 2,
    cpus: 2,
  };

  const yamlContent = generateYAMLFromConfig(config);
  
  utilLogger.info({ 
    vmCount: config.ludus.length,
    hasNetwork: !!config.network,
    hasRouter: !!config.router,
    yamlLength: yamlContent.length
  }, 'Range config generated from wizard');
  
  return yamlContent;
}

function generateYAMLFromConfig(config: RangeConfig): string {
  const lines: string[] = [];
  // Add schema validation comment
  lines.push('# yaml-language-server: $schema=https://docs.ludus.cloud/schemas/range-config.json');
  lines.push('');
  lines.push(yaml.dump(config));
  return lines.join('\n');
}

// Convert canvas state (nodes and edges) back to RangeConfig format
export function generateRangeConfigFromCanvas(
  nodes: Node<CanvasNodeData>[], 
  edges: Edge[],
  existingConfig?: Partial<RangeConfig>
): RangeConfig {
  const vlanNodes = nodes.filter(node => node.type === 'vlan');
  const routerNodes = nodes.filter(node => node.type === 'router');
  
  utilLogger.debug({ 
    totalNodes: nodes.length,
    vlanNodes: vlanNodes.length,
    routerNodes: routerNodes.length,
    edges: edges.length,
    hasExistingConfig: !!existingConfig,
    existingDefaults: !!existingConfig?.defaults,
    existingNetwork: !!existingConfig?.network
  }, 'Starting canvas to config conversion');
  const config: RangeConfig = {
    ludus: [],
    network: existingConfig?.network || {},
    defaults: existingConfig?.defaults || {
      snapshot_with_RAM: true,
      ad_domain_functional_level: 'Win2012R2',
      ad_forest_functional_level: 'Win2012R2',
      ad_domain_admin: 'domainadmin',
      ad_domain_admin_password: 'password',
      ad_domain_user: 'domainuser',
      ad_domain_user_password: 'password',
      ad_domain_safe_mode_password: 'password',
      stale_hours: 0,
      enable_dynamic_wallpaper: true,
      timezone: 'America/New_York',
    }
  };

  // Convert VLAN nodes back to LudusVM entries
  
  
  // Extract actual VLAN numbers from node IDs (e.g., "vlan10" -> 10)
  const extractVlanNumber = (nodeId: string): number => {
    const match = nodeId.match(/vlan(\d+)/);
    return match ? parseInt(match[1], 10) : 10; // Default to VLAN 10 if parsing fails
  };
  
  for (const vlanNode of vlanNodes) {
    if (!vlanNode.data.vms) {
      continue;
    }
    
    // Extract the actual VLAN number from the node ID
    let vlanNumber = extractVlanNumber(vlanNode.id);
    
    // Skip special VLANs (unmatched VMs)
    // These are read-only and shouldn't be saved to the user's config
    if (vlanNumber >= 999) {
      continue;
    }
    
    // Ensure VLAN numbers are valid (>=2 for Ludus)
    // Convert invalid VLAN numbers (like 1) to valid ones
    if (vlanNumber < 2) {
      vlanNumber = 10; // Default to VLAN 10
    }
    
    // Build IP registry to track used IPs in this VLAN
    const usedIPs = buildIPRegistry(vlanNode.data.vms);
    utilLogger.debug({ 
      vlanId: vlanNode.id, 
      vlanNumber, 
      usedIPs: Array.from(usedIPs).sort()
    }, 'Built IP registry for VLAN');
    
    for (const vm of vlanNode.data.vms) {
      
      // Determine template name
      const templateName = vm.template || getDefaultTemplate();
      
      // Determine OS type from VM's actual OS field values (not template name)
      const hasWindows = vm.windows !== undefined && vm.windows !== false;
      const hasMacOS = vm.macOS !== undefined && vm.macOS !== false;
      const hasLinux = vm.linux !== undefined && vm.linux !== false;
      
      // Ensure VM has required fields before transformation
      // Remove existing OS fields to avoid oneOf conflicts
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { windows, linux, macOS, ...vmWithoutOSFields } = vm;
      
      const vmWithRequiredFields = {
        ...vmWithoutOSFields,
        vlan: vlanNumber, // Set the VLAN number from canvas
        hostname: vm.hostname || vm.vmName || vm.label?.split('(')[1]?.replace(')', '') || `{{ range_id }}-vm-${vlanNumber}-${vm.ipLastOctet || getNextAvailableIP(usedIPs)}`,
        ipLastOctet: vm.ipLastOctet || getNextAvailableIP(usedIPs), // Use camelCase for Zod transformation
        template: templateName,
        ramGb: vm.ramGb || getDefaultRAM(), // Use camelCase for Zod transformation
        cpus: vm.cpus || getDefaultCPUs(),
        // Set exactly one OS field based on VM's actual OS settings (oneOf requirement)
        ...(hasWindows && {
          windows: vm.windows && typeof vm.windows === 'object' ? vm.windows : {}
        }),
        ...(hasMacOS && {
          macOS: true
        }),
        ...(hasLinux && {
          linux: vm.linux !== undefined ? vm.linux : true
        }),
        // Fallback to Linux if no OS is explicitly set (default behavior)
        ...(!hasWindows && !hasMacOS && !hasLinux && {
          linux: true
        }),
      };
      
      // Use Zod transformation for automatic field mapping (camelCase → snake_case)
      try {
        // Transform VMData to LudusVM with automatic field mapping
        let ludusVM = transformVMDataToLudusVM(vmWithRequiredFields);
        
        // Assign IP if not already set
        const assignedIP = vmWithRequiredFields.ipLastOctet;
        usedIPs.add(assignedIP);
        
        // Override certain fields with canvas-specific logic
        ludusVM = {
          ...ludusVM,
          vlan: vlanNumber, // Use the extracted VLAN number from canvas
          ip_last_octet: assignedIP,
        }
        
        utilLogger.debug({
          vmId: vm.id,
          vmHostname: ludusVM.hostname,
          assignedIP,
          vlanNumber
        }, 'Assigned IP to VM');
        
        config.ludus.push(ludusVM);
        
      } catch {
        // Zod transformation failed - falling back to manual mapping
        
        // Fallback to manual mapping if Zod transformation fails
        const templateName = vm.template || getDefaultTemplate();
        const isWindowsTemplate = templateName.includes('win') || templateName.includes('windows');
        const isMacOSTemplate = templateName.includes('macos') || templateName.includes('osx');
        
        // Assign IP using registry logic
        const assignedIP = vm.ipLastOctet || getNextAvailableIP(usedIPs);
        usedIPs.add(assignedIP);
        
        const ludusVM: LudusVM = {
          vm_name: vm.vmName || `{{ range_id }}-${vm.id}`,
          hostname: vm.hostname || vm.vmName || vm.label?.split('(')[1]?.replace(')', '') || `{{ range_id }}-vm-${vlanNumber}-${assignedIP}`,
          template: templateName,
          vlan: vlanNumber,
          ip_last_octet: assignedIP,
          ram_gb: vm.ramGb || getDefaultRAM(),
          ram_min_gb: vm.ramMinGb, // ✅ NEW: Include RAM ballooning fallback
          cpus: vm.cpus || getDefaultCPUs(),
          full_clone: vm.fullClone, // ✅ NEW: Include clone type fallback
        };

        // Manual field mapping as fallback
        if (vm.forceIp === true) {
          ludusVM.force_ip = true;
        }
        if (Array.isArray(vm.ansibleGroups) && vm.ansibleGroups.length > 0) {
          ludusVM.ansible_groups = vm.ansibleGroups;
        }
        if (Array.isArray(vm.dnsRewrites) && vm.dnsRewrites.length > 0) {
          ludusVM.dns_rewrites = vm.dnsRewrites;
        }
        if (vm.unmanaged === true) {
          ludusVM.unmanaged = true;
        }

        // OS configuration
        utilLogger.info({
          vmId: vm.id,
          windows: vm.windows,
          windowsType: typeof vm.windows,
          linux: vm.linux,
          linuxType: typeof vm.linux,
          macOS: vm.macOS,
          macOSType: typeof vm.macOS,
          isWindowsTemplate,
          isMacOSTemplate
        }, 'Range Config Generator: OS field analysis before processing')
        
        if (vm.windows === true || (typeof vm.windows === 'object' && vm.windows !== null) || isWindowsTemplate) {
          ludusVM.windows = typeof vm.windows === 'object' ? vm.windows : { sysprep: false };
          utilLogger.info({
            vmId: vm.id,
            result: ludusVM.windows,
            reason: 'Windows OS detected'
          }, 'Range Config Generator: Set Windows OS')
        } else if (vm.macOS === true || isMacOSTemplate) {
          ludusVM.macOS = true;
          utilLogger.info({
            vmId: vm.id,
            result: ludusVM.macOS,
            reason: 'macOS detected'
          }, 'Range Config Generator: Set macOS')
        } else if (vm.linux === true || (typeof vm.linux === 'object' && vm.linux !== null) || (!isWindowsTemplate && !isMacOSTemplate)) {
          ludusVM.linux = typeof vm.linux === 'object' ? vm.linux : true;
          utilLogger.info({
            vmId: vm.id,
            result: ludusVM.linux,
            resultType: typeof ludusVM.linux,
            reason: vm.linux === true ? 'linux === true' : 
                    (typeof vm.linux === 'object' && vm.linux !== null) ? 'linux is object' : 
                    'fallback to Linux'
          }, 'Range Config Generator: Set Linux OS')
        }

        if (vm.domain && typeof vm.domain === 'object' && Object.keys(vm.domain).length > 0) {
          ludusVM.domain = vm.domain;
        }
        if (vm.testing && typeof vm.testing === 'object' && Object.keys(vm.testing).length > 0) {
          ludusVM.testing = vm.testing;
        }

        utilLogger.debug({
          vmId: vm.id,
          vmHostname: ludusVM.hostname,
          assignedIP,
          vlanNumber
        }, 'Assigned IP to VM (fallback)');
        
        config.ludus.push(ludusVM);
      }
    }
  }

  // Extract router configuration
  const routerNode = nodes.find(node => node.type === 'router');
  if (routerNode && routerNode.data) {
    config.router = {
      vm_name: (routerNode.data.vm_name as string) || `{{ range_id }}-router`,
      hostname: (routerNode.data.hostname as string) || `{{ range_id }}-router`,
      template: (routerNode.data.template as string) || 'debian-11-x64-server-template',
      ram_gb: (routerNode.data.ram_gb as number) || 2,
      ...(routerNode.data.ram_min_gb !== undefined && { ram_min_gb: routerNode.data.ram_min_gb as number }),
      cpus: (routerNode.data.cpus as number) || 2,
    };

    if (routerNode.data.roles && Array.isArray(routerNode.data.roles) && routerNode.data.roles.length > 0) {
      config.router.roles = routerNode.data.roles as string[];
    }

    if (routerNode.data.role_vars && Object.keys(routerNode.data.role_vars).length > 0) {
      config.router.role_vars = routerNode.data.role_vars as Record<string, unknown>;
    }

    if (routerNode.data.outbound_wireguard_config) {
      config.router.outbound_wireguard_config = routerNode.data.outbound_wireguard_config as string;
    }

    if (routerNode.data.outbound_wireguard_vlans) {
      config.router.outbound_wireguard_vlans = routerNode.data.outbound_wireguard_vlans as number[];
    }

    if (routerNode.data.inbound_wireguard) {
      config.router.inbound_wireguard = routerNode.data.inbound_wireguard as RouterConfig['inbound_wireguard'];
    }
  } else {
    // No router found in canvas - supply default router configuration
    utilLogger.info('No router node found in canvas, adding default router configuration');
    config.router = {
      vm_name: `{{ range_id }}-router`,
      hostname: `{{ range_id }}-router`,
      template: 'debian-11-x64-server-template',
      ram_gb: 2,
      cpus: 2,
    };
  }

  // Update network rules based on edges
  const networkRules: NetworkRule[] = [];
  
  
  for (const edge of edges) {
    // Only process custom edges as firewall rules
    if (edge.type !== 'custom') {
      continue;
    }
    
    // Check if this is a router connection
    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);
    const isRouterConnection = sourceNode?.type === 'router' || targetNode?.type === 'router';
    
    // Extract VLAN numbers from edge source/target
    let sourceVlan: number | 'public' = extractVlanNumber(edge.source);
    let targetVlan: number | 'public' = extractVlanNumber(edge.target);
    
    // Handle router connections - router represents external/public access
    if (isRouterConnection) {
      if (sourceNode?.type === 'router') {
        sourceVlan = 'public';
        targetVlan = extractVlanNumber(edge.target);
        // Ensure target VLAN is valid
        if (targetVlan < 2) targetVlan = 10;
      } else if (targetNode?.type === 'router') {
        sourceVlan = extractVlanNumber(edge.source);
        targetVlan = 'public';
        // Ensure source VLAN is valid
        if (sourceVlan < 2) sourceVlan = 10;
      }
    } else {
      // For non-router connections, ensure VLAN numbers are valid (>=2 for Ludus)
      if (sourceVlan < 2) sourceVlan = 10;
      if (targetVlan < 2) targetVlan = 10;
    }
    
    // Only create rules for user-defined VLANs and router connections
    if ((typeof sourceVlan === 'string' || sourceVlan < 999) && 
        (typeof targetVlan === 'string' || targetVlan < 999)) {
      
      // Get connection type from edge data, fallback to 'accept'
      const edgeData = edge.data as EdgeDataType;
      const connectionType = edgeData?.status?.connectionType || 'accept';
      
      // Map connection type to network rule action
      let action: 'ACCEPT' | 'REJECT' | 'DROP';
      switch (connectionType) {
        case 'deny':
          action = 'REJECT';
          break;
        case 'drop':
          action = 'DROP';
          break;
        case 'accept':
        default:
          action = 'ACCEPT';
          break;
      }
      
      // Use the rule name from edge data if available
      const ruleName = edgeData?.status?.name || edgeData?.label || `VLAN ${sourceVlan} to VLAN ${targetVlan}`;
      
      
      const networkRule: NetworkRule = {
        name: ruleName,
        vlan_src: sourceVlan as number | 'all' | 'public' | 'wireguard',
        vlan_dst: targetVlan as number | 'all' | 'public' | 'wireguard',
        protocol: (edgeData?.status?.protocol as 'all' | 'tcp' | 'udp' | 'udplite' | 'icmp' | 'ipv6-icmp' | 'esp' | 'ah' | 'sctp') || 'all',
        ports: edgeData?.status?.ports || 'all',
        action,
      };
      
      // Add IP octet restrictions if specified
      if (edgeData?.status?.ip_last_octet_src) {
        networkRule.ip_last_octet_src = edgeData.status.ip_last_octet_src;
      }
      if (edgeData?.status?.ip_last_octet_dst) {
        networkRule.ip_last_octet_dst = edgeData.status.ip_last_octet_dst;
      }
      
      networkRules.push(networkRule);
    }
  }
  
  // Always ensure network section exists to avoid null errors
  if (!config.network) {
    config.network = {};
  }
  
  // Use passed network configuration if available, otherwise preserve existing or use defaults
  const networkDefaults = {
    inter_vlan_default: (existingConfig?.network?.inter_vlan_default || 
                       config.network.inter_vlan_default || 
                       (routerNode?.data?.inter_vlan_default as string) || 'REJECT') as 'ACCEPT' | 'REJECT' | 'DROP',
    external_default: (existingConfig?.network?.external_default || 
                     config.network.external_default || 
                     (routerNode?.data?.external_default as string) || 'ACCEPT') as 'ACCEPT' | 'REJECT' | 'DROP',
    wireguard_vlan_default: (existingConfig?.network?.wireguard_vlan_default || 
                           config.network.wireguard_vlan_default || 
                           (routerNode?.data?.wireguard_vlan_default as string) || 'ACCEPT') as 'ACCEPT' | 'REJECT' | 'DROP',
    always_blocked_networks: existingConfig?.network?.always_blocked_networks || 
                           config.network.always_blocked_networks || []
  };
  
  if (networkRules.length > 0) {
    config.network = {
      ...networkDefaults,
      rules: networkRules,
    };
  } else {
    // Even if no explicit rules, preserve global network configuration
    config.network = networkDefaults;
  }

  

  utilLogger.info({ 
    finalVMCount: config.ludus.length,
    networkRules: config.network?.rules?.length || 0,
    hasRouter: !!config.router,
    hasDefaults: !!config.defaults
  }, 'Canvas config conversion complete');
  
  return config;
}

// Helper function to get default template name
function getDefaultTemplate(): string {
  return 'debian-12-x64-server-template';
}

// Helper function to get default RAM
function getDefaultRAM(): number {
  return 4;
}

// Helper function to get default CPUs
function getDefaultCPUs(): number {
  return 2;
}

// Generate YAML string from canvas state
export function generateYAMLFromCanvas(
  nodes: Node<CanvasNodeData>[], 
  edges: Edge[],
  existingConfig?: Partial<RangeConfig>
): string {
  const config = generateRangeConfigFromCanvas(nodes, edges, existingConfig);
  const yamlContent = generateYAMLFromConfig(config);
  
  utilLogger.debug({ 
    yamlLines: yamlContent.split('\n').length,
    yamlSize: yamlContent.length,
    configSummary: {
      vms: config.ludus.length,
      networks: config.network?.rules?.length || 0,
      hasRouter: !!config.router
    }
  }, 'YAML generated from canvas');
  
  return yamlContent;
}

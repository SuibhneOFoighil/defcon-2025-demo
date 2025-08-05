// Common type definitions used across the application

import type React from "react"

// Component types for template sidebar
export type ComponentCategory = "Templates"
export type ComponentItem = {
  id: string
  name: string
  category: ComponentCategory
  icon: React.ReactNode
  lastUsed: number // timestamp
}

// User types
export interface User {
  id: string
  name: string
  email?: string
  role: "admin" | "user"
}

// Content types
export interface ContentItem {
  id: string
  title: string
  description: string
  lastUsed: string
  status?: "running" | "draft"
  image?: string
}

// Notification types
export type { Notification } from './types/notification';

// UI component props
export interface ActionButtonConfig {
  label: string
  onClick?: () => void
  icon?: React.ElementType
}

// Theme types
export type ThemeMode = "light" | "dark" | "system"

// Enhanced VM types with deployment info
export interface VMData {
  id: string
  label: string
  vmName?: string
  status: "Running" | "Stopped" | "Suspended"
  
  // Configuration data (from range config)
  vlan?: number
  template?: string
  hostname?: string
  ipLastOctet?: number
  forceIp?: boolean
  ramGb?: number
  cpus?: number
  
  // OS type flags
  windows?: boolean | {
    sysprep?: boolean
    installAdditionalTools?: boolean
    gpos?: string[]
    chocolateyIgnoreChecksums?: boolean
    chocolateyPackages?: string[]
    officeVersion?: string
    officeArch?: string
    visualStudioVersion?: string
    autologonUser?: string
    autologonPassword?: string
  }
  linux?: boolean | {
    packages?: string[]
  }
  macOS?: boolean
  
  // Domain configuration
  domain?: {
    fqdn?: string
    role?: 'primary-dc' | 'alt-dc' | 'member'
  }
  
  // Testing mode configuration
  testing?: {
    snapshot?: boolean
    blockInternet?: boolean
  }
  
  // Ansible configuration
  roles?: string[] | Array<{
    name: string
    dependsOn?: Array<{
      vmName: string
      role: string
    }>
  }>
  roleVars?: Record<string, unknown>
  ansibleGroups?: string[]
  
  // Network configuration
  dnsRewrites?: string[]
  unmanaged?: boolean
  
  // VM configuration
  fullClone?: boolean
  ramMinGb?: number
  
  // Runtime/deployment data
  isDeployed?: boolean
  poweredOn?: boolean
  ipAddress?: string
  proxmoxId?: number // Proxmox VM ID for API operations
}

// Template types
export interface Template {
  name: string
  built: boolean
}

// Router configuration data
export interface RouterNodeData {
  label?: string
  vm_name?: string
  hostname?: string
  template?: string
  ram_gb?: number
  ram_min_gb?: number
  cpus?: number
  roles?: string[]
  dns_zone?: string
  external_default?: string
  inter_vlan_default?: string
  wireguard?: {
    interface_addresses: string[]
    peers: Array<{
      public_key: string
      allowed_ips: string[]
    }>
  }
  poweredOn?: boolean
  status?: string
  
  // Action handlers
  onEdit?: (id: string) => void
  
  // Allow additional properties for flexibility
  [key: string]: unknown
}

// Unified Network Node interface - replaces multiple data structures
export interface NetworkNode {
  // Core identity
  id: string
  type: "vlan" | "vm" | "router"
  label: string
  
  // VLAN-specific properties
  vlanId?: number
  description?: string
  vms?: VMData[]
  
  // VM-specific properties (extends VMData for VMs)
  vmData?: VMData
  
  // Router-specific properties
  routerData?: RouterNodeData
  
  // UI state
  selected?: boolean
  isDropTarget?: boolean
  
  // ReactFlow positioning
  position?: { x: number; y: number }
  
  // Metadata
  metadata?: {
    hasConfig?: boolean
    isUnmatched?: boolean
  }
}

// Simplified Node data for ReactFlow nodes (VLAN containers)
export interface NodeData {
  label?: string
  vms?: VMData[]
  selectedVMId?: string | null
  isDropTarget?: boolean
  lastModified?: number // Timestamp for tracking node modifications
  
  // Action handlers (will be moved to context in Phase 2)
  onEdit?: (id: string) => void
  onToggleAllVMs?: (id: string, action: "start" | "stop") => void
  onViewVMDetails?: (vm: VMData, vlanId: string, vlanLabel: string) => void
  onMoveVMToVLAN?: (vmId: string, targetVlanId: string) => void
  onUpdateVMName?: (vmId: string, newName: string) => void
  onDeleteVM?: (vmId: string, vlanId: string) => Promise<void>
  onClearVMSelection?: () => void
  
  // Allow additional properties for flexibility
  [key: string]: unknown
}

// Simplified range data structure
export interface UnifiedRangeData {
  // Basic range info
  userID: string
  rangeNumber: number
  rangeState: string
  testingEnabled: boolean
  allowedDomains?: string[]
  
  // Network topology (unified structure)
  nodes: NetworkNode[]
  
  // ReactFlow ready data (derived from nodes)
  flowNodes: import('@xyflow/react').Node<NodeData>[]
  flowEdges: import('@xyflow/react').Edge[]
  
  // Metadata
  metadata: {
    hasConfig: boolean
    hasDeployedVMs: boolean
    configDeploymentMismatch: boolean
    unmatchedVMs: string[]
    missingVMs: string[]
  }
}

// Edge data type for network connections
export interface EdgeData {
  status?: {
    connectionType?: "accept" | "deny" | "drop";
    name?: string;
    protocol?: string;
    ports?: string;
    ip_last_octet_src?: string;
    ip_last_octet_dst?: string;
  };
  label?: string;
  onUpdateSettings?: (id: string, settings: { connectionType: string }) => void;
  onEdit?: (id: string) => void;
}

// Legacy range data types (will be removed when fully migrated to API)
export interface BasicRangeInfo {
  id: string;
  name: string;
}

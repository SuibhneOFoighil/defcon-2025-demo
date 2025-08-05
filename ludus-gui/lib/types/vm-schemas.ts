import { z } from 'zod'

// ============================================================================
// UTILITY FUNCTIONS FOR CASE TRANSFORMATION
// ============================================================================

/**
 * Convert camelCase to snake_case
 */
function camelToSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
}

/**
 * Convert snake_case to camelCase
 */
function snakeToCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
}

/**
 * Transform all keys in an object from camelCase to snake_case
 */
function transformObjectKeysToSnakeCase(obj: Record<string, unknown>): Record<string, unknown> {
  if (!obj || typeof obj !== 'object') return obj
  
  const transformed: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = camelToSnakeCase(key)
    // Handle special cases: office_version and visual_studio_version should be number not string
    if ((snakeKey === 'office_version' || snakeKey === 'visual_studio_version') && typeof value === 'string') {
      const parsed = parseInt(value, 10)
      transformed[snakeKey] = isNaN(parsed) ? value : parsed
    } else {
      transformed[snakeKey] = value
    }
  }
  return transformed
}

/**
 * Transform all keys in an object from snake_case to camelCase
 */
function transformObjectKeysToCamelCase(obj: Record<string, unknown>): Record<string, unknown> {
  if (!obj || typeof obj !== 'object') return obj
  
  const transformed: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = snakeToCamelCase(key)
    // Handle special cases: office_version and visual_studio_version numbers should become strings for UI
    if ((key === 'office_version' || key === 'visual_studio_version') && typeof value === 'number') {
      transformed[camelKey] = String(value)
    } else {
      transformed[camelKey] = value
    }
  }
  return transformed
}

/**
 * Zod schemas for VM data transformation
 * 
 * This file provides automatic field mapping between:
 * - LudusVM (YAML format, snake_case) 
 * - VMData (UI format, camelCase)
 * 
 * Eliminates manual field mapping and ensures type safety across transformations.
 */

// ============================================================================
// LUDUS VM SCHEMA (YAML format - snake_case)
// ============================================================================

export const LudusVMSchema = z.object({
  // Required fields
  vm_name: z.string(),
  hostname: z.string(),
  template: z.string(),
  vlan: z.number().min(2).max(255),
  
  // Optional configuration fields
  ip_last_octet: z.number().min(1).max(255).optional(),
  ram_gb: z.number().min(1).max(4096).optional(),
  ram_min_gb: z.number().min(1).max(4096).optional(),
  cpus: z.number().min(1).max(512).optional(),
  full_clone: z.boolean().optional(),
  
  // Critical fields that were having persistence issues
  force_ip: z.boolean().optional(),
  ansible_groups: z.array(z.string()).optional(),
  dns_rewrites: z.array(z.string()).optional(),
  unmanaged: z.boolean().optional(),
  
  // OS configuration (match existing LudusVM interface exactly)
  windows: z.union([
    z.boolean(),
    z.object({
      sysprep: z.boolean().optional(),
      install_additional_tools: z.boolean().optional(),
      chocolatey_ignore_checksums: z.boolean().optional(),
      chocolatey_packages: z.array(z.string()).optional(),
      office_version: z.union([z.string(), z.number()]).optional(),
      office_arch: z.string().optional(),
      visual_studio_version: z.union([z.string(), z.number()]).optional(),
      autologon_user: z.string().optional(),
      autologon_password: z.string().optional(),
      gpos: z.array(z.string()).optional(),
      domain: z.object({
        fqdn: z.string(),
        role: z.string()
      }).optional()
    }).passthrough()
  ]).optional(),
  
  linux: z.union([
    z.boolean(),
    z.object({
      packages: z.array(z.string()).optional()
    }).passthrough()
  ]).optional(),
  
  macOS: z.boolean().optional(),
  
  // Domain configuration (legacy support)
  domain: z.object({
    fqdn: z.string().optional(),
    role: z.enum(['primary-dc', 'alt-dc', 'member']).optional()
  }).optional(),
  
  // Testing configuration
  testing: z.object({
    snapshot: z.boolean().optional(),
    block_internet: z.boolean().optional()  // API uses snake_case
  }).optional(),
  
  // Role configuration (match VMData interface exactly)
  roles: z.union([
    z.array(z.string()),
    z.array(z.object({
      name: z.string(),
      dependsOn: z.array(z.object({
        vmName: z.string(),
        role: z.string()
      })).optional()
    }))
  ]).optional(),
  role_vars: z.record(z.unknown()).optional()
}).passthrough()

// ============================================================================
// VMDATA SCHEMA WITH TRANSFORMATION (UI format - camelCase)
// ============================================================================

export const VMDataSchema = LudusVMSchema.transform((data) => ({
  // Basic identification
  id: data.vm_name,
  label: data.hostname, // Will be overridden by display logic
  vmName: data.vm_name,
  
  // Core configuration with automatic field mapping
  template: data.template,
  vlan: data.vlan,
  hostname: data.hostname,
  ipLastOctet: data.ip_last_octet,
  ramGb: data.ram_gb,
  ramMinGb: data.ram_min_gb,
  cpus: data.cpus,
  fullClone: data.full_clone,
  
  // Critical mapped fields (snake_case → camelCase)
  forceIp: data.force_ip,
  ansibleGroups: data.ansible_groups,
  dnsRewrites: data.dns_rewrites,
  unmanaged: data.unmanaged,
  
  // OS configuration with automatic snake_case → camelCase transformation
  windows: data.windows && typeof data.windows === 'object' 
    ? transformObjectKeysToCamelCase(data.windows)
    : data.windows,
  linux: data.linux && typeof data.linux === 'object'
    ? transformObjectKeysToCamelCase(data.linux)
    : data.linux,
  macOS: data.macOS,
  
  // Domain and testing configuration with automatic snake_case → camelCase transformation
  domain: data.domain && typeof data.domain === 'object'
    ? transformObjectKeysToCamelCase(data.domain)
    : data.domain,
  testing: data.testing && typeof data.testing === 'object'
    ? transformObjectKeysToCamelCase(data.testing)
    : data.testing,
  
  // Role configuration with field mapping
  roles: data.roles,
  roleVars: data.role_vars,
  
  // Default UI fields
  status: 'Stopped' as const,
  
  // Runtime fields (will be populated later)
  isDeployed: false,
  poweredOn: false,
  ipAddress: undefined as string | undefined,
  proxmoxId: undefined as number | undefined
}))

// ============================================================================
// REVERSE TRANSFORMATION SCHEMA (UI format → YAML format)
// ============================================================================

// Base schema for VM form data (UI format - camelCase)
export const VMDataFormSchema = z.object({
  // Required fields
  id: z.string(),
  template: z.string(),
  vlan: z.number(),
  hostname: z.string(),
  
  // Optional configuration
  ipLastOctet: z.number().optional(),
  ramGb: z.number().optional(),
  ramMinGb: z.number().optional(),
  cpus: z.number().optional(),
  fullClone: z.boolean().optional(),
  
  // Critical fields
  forceIp: z.boolean().optional(),
  ansibleGroups: z.array(z.string()).optional(),
  dnsRewrites: z.array(z.string()).optional(),
  unmanaged: z.boolean().optional(),
  
  // OS configuration
  windows: z.union([z.boolean(), z.object({}).passthrough()]).optional(),
  linux: z.union([z.boolean(), z.object({}).passthrough()]).optional(),
  macOS: z.boolean().optional(),
  
  // Domain and testing
  domain: z.object({
    fqdn: z.string().optional(),
    role: z.enum(['primary-dc', 'alt-dc', 'member']).optional()
  }).optional(),
  testing: z.object({
    snapshot: z.boolean().optional(),
    blockInternet: z.boolean().optional()
  }).optional(),
  
  // Role configuration (match VMData interface exactly)
  roles: z.union([
    z.array(z.string()),
    z.array(z.object({
      name: z.string(),
      dependsOn: z.array(z.object({
        vmName: z.string(),
        role: z.string()
      })).optional()
    }))
  ]).optional(),
  roleVars: z.record(z.unknown()).optional(),
  
  // Additional UI fields
  vmName: z.string().optional()
}).passthrough()

// Transform schema that converts UI format to YAML format
export const VMDataToLudusVMSchema = VMDataFormSchema.transform((data) => ({
  // Basic fields with name resolution
  vm_name: data.vmName || data.id,
  hostname: data.hostname,
  template: data.template,
  vlan: data.vlan,
  
  // Optional configuration with field mapping (camelCase → snake_case)
  ...(data.ipLastOctet !== undefined && { ip_last_octet: data.ipLastOctet }),
  ...(data.ramGb !== undefined && { ram_gb: data.ramGb }),
  ...(data.ramMinGb !== undefined && { ram_min_gb: data.ramMinGb }),
  ...(data.cpus !== undefined && { cpus: data.cpus }),
  ...(data.fullClone !== undefined && { full_clone: data.fullClone }),
  
  // Critical field mappings (camelCase → snake_case)
  ...(data.forceIp !== undefined && { force_ip: data.forceIp }),
  ...(data.ansibleGroups !== undefined && { ansible_groups: data.ansibleGroups }),
  ...(data.dnsRewrites !== undefined && { dns_rewrites: data.dnsRewrites }),
  ...(data.unmanaged !== undefined && { unmanaged: data.unmanaged }),
  
  // OS configuration with automatic camelCase → snake_case transformation
  ...(data.windows !== undefined && { 
    windows: typeof data.windows === 'object' && data.windows !== null 
      ? transformObjectKeysToSnakeCase(data.windows)
      : data.windows 
  }),
  ...(data.linux !== undefined && { 
    linux: typeof data.linux === 'object' && data.linux !== null 
      ? transformObjectKeysToSnakeCase(data.linux)
      : data.linux 
  }),
  ...(data.macOS !== undefined && { macOS: data.macOS }),
  
  // Domain and testing configuration with automatic camelCase → snake_case transformation
  ...(data.domain !== undefined && { 
    domain: typeof data.domain === 'object' && data.domain !== null 
      ? transformObjectKeysToSnakeCase(data.domain)
      : data.domain 
  }),
  ...(data.testing !== undefined && { 
    testing: typeof data.testing === 'object' && data.testing !== null 
      ? transformObjectKeysToSnakeCase(data.testing)
      : data.testing 
  }),
  
  // Role configuration with field mapping
  ...(data.roles !== undefined && { roles: data.roles }),
  ...(data.roleVars !== undefined && { role_vars: data.roleVars })
}))

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type LudusVM = z.infer<typeof LudusVMSchema>
export type VMDataTransformed = z.infer<typeof VMDataSchema>
export type VMDataForm = z.infer<typeof VMDataFormSchema>
export type VMDataToLudusVMTransformed = z.infer<typeof VMDataToLudusVMSchema>

// ============================================================================
// TRANSFORMATION UTILITIES
// ============================================================================

/**
 * Transform a LudusVM (YAML format) to VMData (UI format)
 * Automatically handles snake_case → camelCase field mapping
 */
export function transformLudusVMToVMData(ludusVM: unknown): VMDataTransformed {
  return VMDataSchema.parse(ludusVM)
}

/**
 * Transform VMData (UI format) to LudusVM (YAML format)
 * Automatically handles camelCase → snake_case field mapping
 */
export function transformVMDataToLudusVM(vmData: unknown): LudusVM {
  return VMDataToLudusVMSchema.parse(vmData)
}

/**
 * Transform an array of LudusVMs to VMData array
 */
export function transformLudusVMArrayToVMDataArray(ludusVMs: unknown[]): VMDataTransformed[] {
  return ludusVMs.map(vm => transformLudusVMToVMData(vm))
}

/**
 * Transform an array of VMData to LudusVM array
 */
export function transformVMDataArrayToLudusVMArray(vmDataArray: unknown[]): LudusVM[] {
  return vmDataArray.map(vm => transformVMDataToLudusVM(vm))
}

/**
 * Safe transformation with error handling
 */
export function transformLudusVMToVMDataSafe(ludusVM: unknown) {
  try {
    return { success: true as const, data: transformLudusVMToVMData(ludusVM) }
  } catch (error) {
    return { 
      success: false as const, 
      error: error instanceof z.ZodError 
        ? error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
        : ['Unknown transformation error']
    }
  }
}

/**
 * Safe reverse transformation with error handling
 */
export function transformVMDataToLudusVMSafe(vmData: unknown) {
  try {
    return { success: true as const, data: transformVMDataToLudusVM(vmData) }
  } catch (error) {
    return { 
      success: false as const, 
      error: error instanceof z.ZodError 
        ? error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
        : ['Unknown transformation error']
    }
  }
}
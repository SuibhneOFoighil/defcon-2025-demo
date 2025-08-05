import { z } from 'zod'

// Ultra-simple approach: Just validate the essential structure
// and let Zod parse everything else flexibly

// Define reusable schemas
const ActionSchema = z.enum(['ACCEPT', 'REJECT', 'DROP'])

const NetworkRuleSchema = z.object({
  name: z.string(),
  vlan_src: z.union([z.number().min(2).max(255), z.enum(['public', 'all', 'wireguard'])]),
  vlan_dst: z.union([z.number().min(2).max(255), z.enum(['public', 'all', 'wireguard'])]),
  protocol: z.enum(['tcp', 'udp', 'udplite', 'icmp', 'ipv6-icmp', 'esp', 'ah', 'sctp', 'all']),
  ports: z.union([z.number().min(0).max(65535), z.string()]),
  action: ActionSchema
}).passthrough()

/**
 * Zod schema for validating Ludus range configurations
 * 
 * This schema validates the essential structure while allowing additional
 * properties through passthrough() for backward compatibility.
 */
export const RangeConfigSchema = z.object({
  // Make ludus default to empty array if not provided
  ludus: z.array(z.object({
    vm_name: z.string(),
    hostname: z.string(), 
    template: z.string(),
    vlan: z.number().min(2).max(255),
    ip_last_octet: z.number().min(1).max(255),
    ram_gb: z.number().min(1).max(4096),
    cpus: z.number().min(1).max(512),
    // Add support for Windows domain structure
    windows: z.object({
      domain: z.object({
        fqdn: z.string().optional(),
        role: z.string().optional()
      }).optional()
    }).passthrough().optional(),
    // Add support for direct domain (legacy)
    domain: z.object({
      role: z.string().optional()
    }).passthrough().optional()
  }).passthrough()).default([]), // Default to empty array instead of optional
  
  // Network configuration with proper rule validation
  network: z.object({
    inter_vlan_default: z.string().optional(), // Keep as string for compatibility
    external_default: z.string().optional(),
    wireguard_vlan_default: z.string().optional(),
    always_blocked_networks: z.array(z.string()).optional(),
    rules: z.array(NetworkRuleSchema).optional() // Use proper schema for rules
  }).passthrough().optional(),
  
  // Everything else is optional and flexible
  router: z.record(z.unknown()).optional(),
  defaults: z.record(z.unknown()).optional(),
  global_role_vars: z.record(z.unknown()).optional(),
  notify: z.record(z.unknown()).optional()
}).passthrough() // Allow extra top-level properties too

// Internal type removed - not needed since we only export parseRangeConfigSafe

export function parseRangeConfigSafe(data: unknown) {
  return RangeConfigSchema.safeParse(data) // Returns success/error object
}

// Only export the safe parsing function that's actually used
// Other parsing variants were unused and have been removed to reduce complexity
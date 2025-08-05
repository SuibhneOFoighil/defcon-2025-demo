import type { Node, Edge } from '@xyflow/react';
import type { NodeData } from '@/lib/types';
import type { LudusVM } from '@/lib/types/vm-schemas';

// Router configuration
export interface RouterConfig {
  vm_name?: string;
  hostname?: string;
  template?: string;
  ram_gb?: number;
  ram_min_gb?: number;
  cpus?: number;
  roles?: string[];
  role_vars?: Record<string, unknown>;
  outbound_wireguard_config?: string;
  outbound_wireguard_vlans?: number[];
  inbound_wireguard?: {
    enabled?: boolean;
    server_cidr?: string;
    port?: number;
    allowed_vlans?: number[];
  };
}

// Range config types based on Ludus API schema
export interface RangeConfig {
  network?: {
    inter_vlan_default?: string;
    external_default?: string;
    wireguard_vlan_default?: string;
    always_blocked_networks?: string[];
    rules?: NetworkRule[];
  };
  ludus: LudusVM[]; // Make required to match Zod schema
  router?: RouterConfig;
  defaults?: VMDefaults;
  global_role_vars?: Record<string, unknown>;
  notify?: Record<string, unknown>;
}

export interface NetworkRule {
  name: string;
  vlan_src: number | 'all' | 'public' | 'wireguard';
  vlan_dst: number | 'all' | 'public' | 'wireguard';
  ip_last_octet_src?: number | string;
  ip_last_octet_dst?: number | string;
  protocol: 'tcp' | 'udp' | 'udplite' | 'icmp' | 'ipv6-icmp' | 'esp' | 'ah' | 'sctp' | 'all';
  ports: string;
  action: 'ACCEPT' | 'REJECT' | 'DROP';
}

// Windows functional levels constant
export const FUNCTIONAL_LEVELS = [
  "Win2003",
  "Win2008", 
  "Win2008R2",
  "Win2012",
  "Win2012R2",
  "WinThreshold"
] as const;

// Type for functional levels
export type FunctionalLevel = typeof FUNCTIONAL_LEVELS[number];

// Complete VM Defaults interface based on the schema
export interface VMDefaults {
  snapshot_with_RAM: boolean;
  stale_hours: number;
  ad_domain_functional_level: FunctionalLevel;
  ad_forest_functional_level: FunctionalLevel;
  ad_domain_admin: string;
  ad_domain_admin_password: string;
  ad_domain_user: string;
  ad_domain_user_password: string;
  ad_domain_safe_mode_password: string;
  timezone: string;
  enable_dynamic_wallpaper: boolean;
}



// Parsed range data
export interface ParsedRangeData {
  nodes: Node<NodeData>[];
  edges: Edge[];
}
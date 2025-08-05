export interface WizardStep {
  id: string
  title: string
  description: string
}

export interface FirewallRule {
  id: string
  name: string
  sourceVLAN: string // Can be 'all', 'public', 'wireguard', or numeric VLAN (2-255)
  sourceIP: string // Optional IP address
  destinationVLAN: string // Can be 'all', 'public', 'wireguard', or numeric VLAN (2-255)
  destinationIP: string // Optional IP address
  protocol: 'all' | 'tcp' | 'udp' | 'udplite' | 'icmp' | 'ipv6-icmp' | 'esp' | 'ah' | 'sctp'
  ports: string // Can be 'all', single port, or range (start:end)
  action: 'ACCEPT' | 'REJECT' | 'DROP'
}

export interface FormData {
  name: string
  description: string
  purpose: string
  creationMethod: string
  selectedTemplates?: string[] // For multi-select template functionality
  importedTemplate?: unknown // For storing uploaded template file info

  // Configuration step
  cpu?: string
  memory?: string
  storage?: string
  region?: string

  // Network step
  numberOfVLANs?: number
  sameVMsPerVLAN?: boolean
  vmsPerVLAN?: number
  vlanVMs?: Record<number, number>
  networkType?: string
  ipRange?: string
  dhcp?: string | boolean
  dns?: string | boolean
  firewallRules?: string
}

export interface StepProps {
  formData: FormData
  onInputChange: <T = unknown>(field: string, value: T) => void
}

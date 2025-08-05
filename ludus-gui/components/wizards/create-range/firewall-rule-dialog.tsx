"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter } from "@/components/ui/modal/modal"
import { Button } from "@/components/ui/button"
import type { FirewallRule } from "./types"
import { Form, FormField } from "@/components/ui/form/form"
import { FormInput } from "@/components/ui/form/form-input"
import { FormSelect, type SelectOption } from "@/components/ui/form/form-select"
import { Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Protocol options based on Ludus API requirements
const protocolOptions: SelectOption[] = [
  { value: "all", label: "All Protocols" },
  { value: "tcp", label: "TCP" },
  { value: "udp", label: "UDP" },
  { value: "udplite", label: "UDP Lite" },
  { value: "icmp", label: "ICMP" },
  { value: "ipv6-icmp", label: "IPv6-ICMP" },
  { value: "esp", label: "ESP" },
  { value: "ah", label: "AH" },
  { value: "sctp", label: "SCTP" },
]

// VLAN options based on Ludus API requirements
const vlanOptions: SelectOption[] = [
  { value: "all", label: "All VLANs" },
  { value: "public", label: "Public (Internet)" },
  { value: "wireguard", label: "WireGuard Clients" },
  { value: "custom", label: "Specific VLAN (2-255)" },
]

// Action options
const actionOptions: SelectOption[] = [
  { value: "ACCEPT", label: "Accept" },
  { value: "REJECT", label: "Reject" },
  { value: "DROP", label: "Drop" },
]

// Validation functions
const validateVLAN = (vlan: string): { isValid: boolean; message?: string } => {
  if (!vlan) return { isValid: false, message: "VLAN is required" }
  
  if (['all', 'public', 'wireguard'].includes(vlan)) {
    return { isValid: true }
  }
  
  const vlanNum = parseInt(vlan)
  if (isNaN(vlanNum) || vlanNum < 2 || vlanNum > 255) {
    return { isValid: false, message: "VLAN must be between 2-255" }
  }
  
  return { isValid: true }
}

const validateIP = (ip: string): { isValid: boolean; message?: string } => {
  if (!ip) return { isValid: true } // Optional field
  
  const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
  if (!ipRegex.test(ip)) {
    return { isValid: false, message: "Invalid IP address format" }
  }
  
  return { isValid: true }
}

const validatePorts = (ports: string, protocol: string): { isValid: boolean; message?: string } => {
  if (!ports) return { isValid: false, message: "Port is required" }
  
  if (ports === "all") return { isValid: true }
  
  if (protocol === "icmp" || protocol === "ipv6-icmp") {
    return { isValid: true } // ICMP doesn't use ports
  }
  
  // Single port
  if (/^\d+$/.test(ports)) {
    const port = parseInt(ports)
    if (port < 1 || port > 65535) {
      return { isValid: false, message: "Port must be between 1-65535" }
    }
    return { isValid: true }
  }
  
  // Port range (start:end)
  if (/^\d+:\d+$/.test(ports)) {
    const [start, end] = ports.split(':').map(Number)
    if (start < 1 || start > 65535 || end < 1 || end > 65535 || start >= end) {
      return { isValid: false, message: "Invalid port range (format: start:end)" }
    }
    return { isValid: true }
  }
  
  return { isValid: false, message: "Use single port, range (start:end), or 'all'" }
}

const validateRuleName = (name: string): { isValid: boolean; message?: string } => {
  if (!name.trim()) return { isValid: false, message: "Rule name is required" }
  if (name.length > 256) return { isValid: false, message: "Rule name must be 256 characters or less" }
  if (!/^[a-zA-Z0-9\s\-_]+$/.test(name)) {
    return { isValid: false, message: "Rule name can only contain letters, numbers, spaces, hyphens, and underscores" }
  }
  return { isValid: true }
}

interface ValidationState {
  name: { isValid: boolean; message?: string }
  sourceVLAN: { isValid: boolean; message?: string }
  sourceIP: { isValid: boolean; message?: string }
  destinationVLAN: { isValid: boolean; message?: string }
  destinationIP: { isValid: boolean; message?: string }
  ports: { isValid: boolean; message?: string }
}

interface FirewallRuleDialogProps {
  open: boolean
  onOpenChange: () => void
  onSave: (rule: FirewallRule) => void
  rule: FirewallRule | null
  isEdit: boolean
}

export function FirewallRuleDialog({ open, onOpenChange, onSave, rule, isEdit }: FirewallRuleDialogProps) {
  // Initialize with default values or existing rule data
  const [formData, setFormData] = useState<FirewallRule>({
    id: rule?.id || "",
    name: rule?.name || "",
    sourceVLAN: rule?.sourceVLAN || "10",
    sourceIP: rule?.sourceIP || "",
    destinationVLAN: rule?.destinationVLAN || "all",
    destinationIP: rule?.destinationIP || "",
    protocol: rule?.protocol || "tcp",
    ports: rule?.ports || "443",
    action: rule?.action || "ACCEPT",
  })

  // State for custom VLAN inputs
  const [customSourceVLAN, setCustomSourceVLAN] = useState("")
  const [customDestVLAN, setCustomDestVLAN] = useState("")
  const [sourceVLANType, setSourceVLANType] = useState<string>("custom")
  const [destVLANType, setDestVLANType] = useState<string>("all")

  // Validation state
  const [validation, setValidation] = useState<ValidationState>({
    name: { isValid: true },
    sourceVLAN: { isValid: true },
    sourceIP: { isValid: true },
    destinationVLAN: { isValid: true },
    destinationIP: { isValid: true },
    ports: { isValid: true },
  })

  // Update form data when the rule prop changes
  useEffect(() => {
    if (rule) {
      setFormData(rule)
      
      // Determine VLAN types
      const srcType = ['all', 'public', 'wireguard'].includes(rule.sourceVLAN) ? rule.sourceVLAN : 'custom'
      const dstType = ['all', 'public', 'wireguard'].includes(rule.destinationVLAN) ? rule.destinationVLAN : 'custom'
      
      setSourceVLANType(srcType)
      setDestVLANType(dstType)
      
      if (srcType === 'custom') setCustomSourceVLAN(rule.sourceVLAN)
      if (dstType === 'custom') setCustomDestVLAN(rule.destinationVLAN)
    } else {
      // Reset to defaults
      const defaultData: FirewallRule = {
        id: "",
        name: "",
        sourceVLAN: "10",
        sourceIP: "",
        destinationVLAN: "all",
        destinationIP: "",
        protocol: "tcp",
        ports: "443",
        action: "ACCEPT",
      }
      setFormData(defaultData)
      setSourceVLANType("custom")
      setDestVLANType("all")
      setCustomSourceVLAN("10")
      setCustomDestVLAN("")
    }
  }, [rule])

  // Validate all fields
  const validateAllFields = () => {
    const newValidation: ValidationState = {
      name: validateRuleName(formData.name),
      sourceVLAN: validateVLAN(formData.sourceVLAN),
      sourceIP: validateIP(formData.sourceIP),
      destinationVLAN: validateVLAN(formData.destinationVLAN),
      destinationIP: validateIP(formData.destinationIP),
      ports: validatePorts(formData.ports, formData.protocol),
    }
    
    setValidation(newValidation)
    return Object.values(newValidation).every(v => v.isValid)
  }

  // Handle input changes with validation
  const handleChange = (field: keyof FirewallRule, value: string) => {
    const newFormData = { ...formData, [field]: value }
    setFormData(newFormData)

    // Validate the specific field
    let fieldValidation = { isValid: true }
    switch (field) {
      case 'name':
        fieldValidation = validateRuleName(value)
        break
      case 'sourceVLAN':
        fieldValidation = validateVLAN(value)
        break
      case 'sourceIP':
        fieldValidation = validateIP(value)
        break
      case 'destinationVLAN':
        fieldValidation = validateVLAN(value)
        break
      case 'destinationIP':
        fieldValidation = validateIP(value)
        break
      case 'ports':
        fieldValidation = validatePorts(value, newFormData.protocol)
        break
    }

    setValidation(prev => ({
      ...prev,
      [field]: fieldValidation
    }))
  }

  // Handle VLAN type changes
  const handleVLANTypeChange = (type: 'source' | 'destination', value: string) => {
    if (type === 'source') {
      setSourceVLANType(value)
      if (value !== 'custom') {
        handleChange('sourceVLAN', value)
      } else {
        handleChange('sourceVLAN', customSourceVLAN || '10')
      }
    } else {
      setDestVLANType(value)
      if (value !== 'custom') {
        handleChange('destinationVLAN', value)
      } else {
        handleChange('destinationVLAN', customDestVLAN || '10')
      }
    }
  }

  // Handle custom VLAN input changes
  const handleCustomVLANChange = (type: 'source' | 'destination', value: string) => {
    if (type === 'source') {
      setCustomSourceVLAN(value)
      handleChange('sourceVLAN', value)
    } else {
      setCustomDestVLAN(value)
      handleChange('destinationVLAN', value)
    }
  }

  // Handle protocol change (affects port validation)
  const handleProtocolChange = (value: string) => {
    handleChange('protocol', value)
    
    // Auto-adjust ports for ICMP
    if (value === 'icmp' || value === 'ipv6-icmp') {
      handleChange('ports', 'all')
    }
  }

  // Handle form submission
  const handleSubmit = () => {
    if (validateAllFields()) {
      onSave(formData)
    }
  }

  const isFormValid = Object.values(validation).every(v => v.isValid)

  return (
    <TooltipProvider>
      <Modal open={open} onOpenChange={onOpenChange}>
        <ModalContent className="sm:max-w-[900px] bg-[hsl(var(--background))] border-[hsl(var(--border))] text-[hsl(var(--foreground))]">
          <ModalHeader>
            <ModalTitle className="flex items-center">
              {isEdit ? "Edit Firewall Rule" : "Add Firewall Rule"}
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-[hsl(var(--muted-foreground))] ml-2 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-md p-4" side="bottom" align="start">
                  <div className="space-y-2">
                    <p className="font-medium text-sm">Firewall Rule Guidelines:</p>
                    <div className="grid grid-cols-1 gap-2 text-xs">
                      <ul className="space-y-1">
                        <li>• Rules control traffic between VLANs and to/from the internet</li>
                        <li>• Use &quot;All VLANs&quot; for broad rules, specific VLANs for targeted access</li>
                        <li>• ICMP rules don&apos;t require port specifications</li>
                        <li>• Port ranges use format &quot;start:end&quot; (e.g., &quot;80:443&quot;)</li>
                      </ul>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </ModalTitle>
          </ModalHeader>

          <Form className="space-y-6 py-4">
            {/* Rule Name - Full Width */}
            <FormField>
              <FormInput
                label="Rule Name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="e.g., Allow web traffic to DMZ"
                hint={`${formData.name.length}/256 characters`}
                className={!validation.name.isValid ? "border-red-500" : ""}
              />
              {!validation.name.isValid && (
                <p className="text-red-500 text-sm mt-1">{validation.name.message}</p>
              )}
            </FormField>

            {/* Source and Destination - Side by Side */}
            <div className="grid grid-cols-2 gap-8">
              {/* Source Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-[hsl(var(--foreground))] border-b border-[hsl(var(--border))] pb-2">
                  Source
                </h3>
                
                <FormField>
                  <FormSelect
                    label="VLAN Type"
                    options={vlanOptions}
                    value={sourceVLANType}
                    onChange={(e) => handleVLANTypeChange('source', e.target.value)}
                  />
                  {sourceVLANType === 'custom' && (
                    <div className="mt-2">
                      <FormInput
                        label="VLAN Number"
                        type="number"
                        min="2"
                        max="255"
                        value={customSourceVLAN}
                        onChange={(e) => handleCustomVLANChange('source', e.target.value)}
                        placeholder="2-255"
                        className={!validation.sourceVLAN.isValid ? "border-red-500" : ""}
                      />
                    </div>
                  )}
                  {!validation.sourceVLAN.isValid && (
                    <p className="text-red-500 text-sm mt-1">{validation.sourceVLAN.message}</p>
                  )}
                </FormField>

                <FormField>
                  <FormInput
                    label="IP Address (optional)"
                    value={formData.sourceIP}
                    onChange={(e) => handleChange("sourceIP", e.target.value)}
                    placeholder="e.g., 192.168.1.100"
                    className={!validation.sourceIP.isValid ? "border-red-500" : ""}
                  />
                  {!validation.sourceIP.isValid && (
                    <p className="text-red-500 text-sm mt-1">{validation.sourceIP.message}</p>
                  )}
                </FormField>
              </div>

              {/* Destination Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-[hsl(var(--foreground))] border-b border-[hsl(var(--border))] pb-2">
                  Destination
                </h3>
                
                <FormField>
                  <FormSelect
                    label="VLAN Type"
                    options={vlanOptions}
                    value={destVLANType}
                    onChange={(e) => handleVLANTypeChange('destination', e.target.value)}
                  />
                  {destVLANType === 'custom' && (
                    <div className="mt-2">
                      <FormInput
                        label="VLAN Number"
                        type="number"
                        min="2"
                        max="255"
                        value={customDestVLAN}
                        onChange={(e) => handleCustomVLANChange('destination', e.target.value)}
                        placeholder="2-255"
                        className={!validation.destinationVLAN.isValid ? "border-red-500" : ""}
                      />
                    </div>
                  )}
                  {!validation.destinationVLAN.isValid && (
                    <p className="text-red-500 text-sm mt-1">{validation.destinationVLAN.message}</p>
                  )}
                </FormField>

                <FormField>
                  <FormInput
                    label="IP Address (optional)"
                    value={formData.destinationIP}
                    onChange={(e) => handleChange("destinationIP", e.target.value)}
                    placeholder="e.g., 10.0.1.50"
                    className={!validation.destinationIP.isValid ? "border-red-500" : ""}
                  />
                  {!validation.destinationIP.isValid && (
                    <p className="text-red-500 text-sm mt-1">{validation.destinationIP.message}</p>
                  )}
                </FormField>
              </div>
            </div>

            {/* Protocol, Ports, and Action - Three Column Layout */}
            <div className="grid grid-cols-3 gap-6">
              <FormField>
                <FormSelect
                  label="Protocol"
                  options={protocolOptions}
                  value={formData.protocol}
                  onChange={(e) => handleProtocolChange(e.target.value)}
                />
              </FormField>

              <FormField>
                <FormInput
                  label="Ports"
                  value={formData.ports}
                  onChange={(e) => handleChange("ports", e.target.value)}
                  placeholder={formData.protocol === 'icmp' || formData.protocol === 'ipv6-icmp' ? "all" : "443, 80:443, or all"}
                  disabled={formData.protocol === 'icmp' || formData.protocol === 'ipv6-icmp'}
                  className={!validation.ports.isValid ? "border-red-500" : ""}
                />
                {!validation.ports.isValid && (
                  <p className="text-red-500 text-sm mt-1">{validation.ports.message}</p>
                )}
                {(formData.protocol === 'icmp' || formData.protocol === 'ipv6-icmp') && (
                  <p className="text-[hsl(var(--muted-foreground))] text-sm mt-1">ICMP doesn&apos;t use ports</p>
                )}
              </FormField>

              <FormField>
                <FormSelect
                  label="Action"
                  options={actionOptions}
                  value={formData.action}
                  onChange={(e) => handleChange("action", e.target.value)}
                />
                <div className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                  <div><strong>Accept:</strong> Allow traffic</div>
                  <div><strong>Reject:</strong> Block with notification</div>
                  <div><strong>Drop:</strong> Block silently</div>
                </div>
              </FormField>
            </div>
          </Form>

          <ModalFooter>
            <Button 
              variant="outline" 
              onClick={onOpenChange} 
              className="border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]"
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleSubmit}
              disabled={!isFormValid}
              className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary))]/90"
            >
              {isEdit ? "Save Changes" : "Add Rule"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </TooltipProvider>
  )
}

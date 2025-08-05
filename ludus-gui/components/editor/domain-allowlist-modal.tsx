"use client"

import type React from "react"

import { useState } from "react"
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter } from "@/components/ui/modal/modal"
import { Input } from "@/components/ui/input"
import { X, Plus, Globe, Loader2, Server } from "lucide-react"
import { useBatchUpdateAllowlist } from "@/lib/api/ludus/domains"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

interface DomainAllowlistModalProps {
  isOpen: boolean
  onClose: () => void
  userID: string
  initialDomains?: string[]
  initialIPs?: string[]
}

export function DomainAllowlistModal({ isOpen, onClose, userID, initialDomains = [], initialIPs = [] }: DomainAllowlistModalProps) {
  const [domains, setDomains] = useState<string[]>(initialDomains)
  const [ips, setIPs] = useState<string[]>(initialIPs)
  const [newDomain, setNewDomain] = useState("")
  const [newIP, setNewIP] = useState("")
  const [ipValidationError, setIPValidationError] = useState<string | null>(null)
  
  const batchUpdateMutation = useBatchUpdateAllowlist()

  const handleAddDomain = () => {
    const trimmedDomain = newDomain.trim()
    if (trimmedDomain && !domains.includes(trimmedDomain)) {
      setDomains(prev => [...prev, trimmedDomain])
      setNewDomain("")
    }
  }
  
  const validateIP = (ip: string): string | null => {
    if (!ip.trim()) return null
    
    // IPv4 validation
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    
    if (!ipv4Regex.test(ip.trim())) {
      return "Please enter a valid IPv4 address (e.g., 192.168.1.1)"
    }
    
    return null
  }

  const handleIPInputChange = (value: string) => {
    setNewIP(value)
    const error = validateIP(value)
    setIPValidationError(error)
  }

  const handleAddIP = () => {
    const trimmedIP = newIP.trim()
    if (trimmedIP && !ips.includes(trimmedIP)) {
      const validationError = validateIP(trimmedIP)
      if (!validationError) {
        setIPs(prev => [...prev, trimmedIP])
        setNewIP("")
        setIPValidationError(null)
      } else {
        setIPValidationError(validationError)
      }
    }
  }

  const handleRemoveDomain = (domain: string) => {
    setDomains(prev => prev.filter(d => d !== domain))
  }
  
  const handleRemoveIP = (ip: string) => {
    setIPs(prev => prev.filter(i => i !== ip))
  }

  const extractDomainName = (domainWithIP: string) => {
    // Extract domain from format: "domain.com (IP.address)" -> "domain.com"
    const match = domainWithIP.match(/^([^\s(]+)/)
    return match ? match[1] : domainWithIP
  }

  const handleSave = async () => {
    // Calculate what changed
    const domainsToAdd = domains.filter(d => !initialDomains.includes(d)).map(extractDomainName)
    const domainsToRemove = initialDomains.filter(d => !domains.includes(d)).map(extractDomainName)
    const ipsToAdd = ips.filter(i => !initialIPs.includes(i))
    const ipsToRemove = initialIPs.filter(i => !ips.includes(i))
    
    // Only make API call if there are changes
    if (domainsToAdd.length || domainsToRemove.length || ipsToAdd.length || ipsToRemove.length) {
      const allow = (domainsToAdd.length || ipsToAdd.length) ? {} as { domains?: string[], ips?: string[] } : undefined
      if (domainsToAdd.length) allow!.domains = domainsToAdd
      if (ipsToAdd.length) allow!.ips = ipsToAdd
      
      const deny = (domainsToRemove.length || ipsToRemove.length) ? {} as { domains?: string[], ips?: string[] } : undefined
      if (domainsToRemove.length) deny!.domains = domainsToRemove
      if (ipsToRemove.length) deny!.ips = ipsToRemove
      
      await batchUpdateMutation.mutateAsync({
        userID,
        allow,
        deny
      })
    }
    
    onClose()
  }

  const handleCancel = () => {
    // Reset to initial values
    setDomains(initialDomains)
    setIPs(initialIPs)
    setNewDomain("")
    setNewIP("")
    setIPValidationError(null)
    onClose()
  }

  const handleKeyDown = (e: React.KeyboardEvent, type: 'domain' | 'ip') => {
    if (e.key === "Enter") {
      e.preventDefault()
      if (type === 'domain') {
        handleAddDomain()
      } else {
        handleAddIP()
      }
    }
  }

  const hasChanges = () => {
    const domainsChanged = domains.length !== initialDomains.length || 
      domains.some(d => !initialDomains.includes(d)) ||
      initialDomains.some(d => !domains.includes(d))
    
    const ipsChanged = ips.length !== initialIPs.length ||
      ips.some(i => !initialIPs.includes(i)) ||
      initialIPs.some(i => !ips.includes(i))
    
    return domainsChanged || ipsChanged
  }

  return (
    <Modal open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
      <ModalContent className="sm:max-w-[500px]">
        <ModalHeader>
          <ModalTitle className="flex items-center">
            <Globe className="h-5 w-5 mr-2" />
            Configure Testing Allowlist
          </ModalTitle>
        </ModalHeader>

        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-4">
            In Testing Mode, internet access is blocked by default. Add domains and IP addresses that should be accessible during testing.
          </p>

          <Tabs defaultValue="domains" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="domains" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Domains ({domains.length})
              </TabsTrigger>
              <TabsTrigger value="ips" className="flex items-center gap-2">
                <Server className="h-4 w-4" />
                IP Addresses ({ips.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="domains" className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="Enter domain (e.g., example.com)"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, 'domain')}
                  className="flex-1"
                />
                <Button 
                  type="button"
                  onClick={handleAddDomain} 
                  disabled={!newDomain.trim() || batchUpdateMutation.isPending}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>

              <div className="border rounded-md p-2 min-h-[200px] max-h-[300px] overflow-y-auto">
                {domains.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-12">No domains in allowlist</p>
                ) : (
                  <ul className="space-y-1">
                    {domains.map((domain) => (
                      <li
                        key={domain}
                        className="flex items-center justify-between bg-muted/50 rounded-md px-3 py-1.5 text-sm"
                      >
                        <span className="font-mono">{domain}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-foreground"
                          onClick={() => handleRemoveDomain(domain)}
                          disabled={batchUpdateMutation.isPending}
                        >
                          <X className="h-3.5 w-3.5" />
                          <span className="sr-only">Remove</span>
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </TabsContent>

            <TabsContent value="ips" className="space-y-4">
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <Input
                      placeholder="Enter IP address (e.g., 192.168.1.1)"
                      value={newIP}
                      onChange={(e) => handleIPInputChange(e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, 'ip')}
                      className={`${ipValidationError ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                    />
                    {ipValidationError && (
                      <p className="text-sm text-red-600 mt-1">{ipValidationError}</p>
                    )}
                  </div>
                  <Button 
                    type="button"
                    onClick={handleAddIP} 
                    disabled={!newIP.trim() || !!ipValidationError || batchUpdateMutation.isPending}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              </div>

              <div className="border rounded-md p-2 min-h-[200px] max-h-[300px] overflow-y-auto">
                {ips.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-12">No IP addresses in allowlist</p>
                ) : (
                  <ul className="space-y-1">
                    {ips.map((ip) => (
                      <li
                        key={ip}
                        className="flex items-center justify-between bg-muted/50 rounded-md px-3 py-1.5 text-sm"
                      >
                        <span className="font-mono">{ip}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-foreground"
                          onClick={() => handleRemoveIP(ip)}
                          disabled={batchUpdateMutation.isPending}
                        >
                          <X className="h-3.5 w-3.5" />
                          <span className="sr-only">Remove</span>
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <ModalFooter>
          <Button variant="outline" onClick={handleCancel} disabled={batchUpdateMutation.isPending}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!hasChanges() || batchUpdateMutation.isPending}
          >
            {batchUpdateMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { AddItemInput } from "@/components/ui/add-item-input"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { extractApiErrorMessage } from "@/lib/utils/error-handling"
import { useConnectionForm } from "@/hooks/use-connection-form"
import type { Edge } from "@xyflow/react"
import type { RangeConfig } from "@/lib/types/range-config"
import { useState, useEffect } from "react"

type ConnectionType = "accept" | "deny" | "drop"

interface ConnectionPropertiesSheetProps {
  edge: Edge
  networkSettings?: RangeConfig['network']
  onSaveEdge: (data: { edgeId: string; ruleSettings: Record<string, unknown>; networkSettings: RangeConfig['network'] }) => Promise<void>
}

function getConnectionBadge(type: ConnectionType) {
  switch (type) {
    case "accept":
      return {
        variant: "outline" as const,
        className: "text-sm h-7 px-3 border-green-500 text-green-500",
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4 mr-2"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ),
        label: "Accept",
      }
    case "deny":
      return {
        variant: "outline" as const,
        className: "text-sm h-7 px-3 border-red-500 text-red-500",
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4 mr-2"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ),
        label: "Deny",
      }
    case "drop":
      return {
        variant: "outline" as const,
        className: "text-sm h-7 px-3 border-amber-500 text-amber-500",
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4 mr-2"
          >
            <path d="M3 6h18" />
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
          </svg>
        ),
        label: "Drop",
      }
  }
}

export function ConnectionPropertiesSheet({ edge, networkSettings = {}, onSaveEdge }: ConnectionPropertiesSheetProps) {
  // Keep separate states for network settings
  const [localNetworkSettings, setLocalNetworkSettings] = useState<RangeConfig['network']>(networkSettings || {})
  
  const form = useConnectionForm({
    edge,
    networkSettings: localNetworkSettings,
    onSave: onSaveEdge
  })

  const {
    localData,
    pendingFields,
    updateField,
    forceSaveField,
    updateLocalField,
    saveNetworkSettings
  } = form

  // Update local state when props change
  useEffect(() => {
    setLocalNetworkSettings(networkSettings || {})
  }, [networkSettings])

  // Update network setting and trigger save
  const handleGlobalChange = (field: string, value: string | string[]) => {
    const newNetworkSettings = { ...localNetworkSettings, [field]: value }
    setLocalNetworkSettings(newNetworkSettings)
    // Trigger save with current rule settings
    toast.promise(saveNetworkSettings(field, value), {
      error: (error) => extractApiErrorMessage(error, 'Failed to save network settings'),
    })
  }

  const badgeConfig = getConnectionBadge(localData.connectionType as ConnectionType)

  return (
    <Form {...form}>
      <div className="flex flex-col h-full bg-muted/10">

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Rule Configuration */}
          <div className="bg-card rounded-xl border border-border/40 shadow-md p-6 space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-sm font-semibold text-foreground">Rule Configuration</h4>
              <Badge variant={badgeConfig.variant} className={badgeConfig.className}>
                {badgeConfig.icon}
                {badgeConfig.label}
              </Badge>
            </div>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Rule Name</FormLabel>
                  <FormControl>
                    <Input 
                      {...field}
                      value={field.value || ''}
                      onChange={(e) => updateLocalField('name', e.target.value)}
                      onSave={() => forceSaveField('name')}
                      className={cn("h-8 text-xs", pendingFields.has('name') && "border-blue-500")} 
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="connectionType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Action</FormLabel>
                  <FormControl>
                    <ToggleGroup
                      type="single"
                      value={field.value || ''}
                      onValueChange={(value) => {
                        if (value) {
                          field.onChange(value)
                          updateField("connectionType", value)
                        }
                      }}
                      className="w-full"
                    >
                      <ToggleGroupItem value="accept" size="sm" className="text-xs data-[state=on]:bg-green-500/10 data-[state=on]:text-green-500 flex-1">
                        ACCEPT
                      </ToggleGroupItem>
                      <ToggleGroupItem value="deny" size="sm" className="text-xs data-[state=on]:bg-red-500/10 data-[state=on]:text-red-500 flex-1">
                        REJECT
                      </ToggleGroupItem>
                      <ToggleGroupItem value="drop" size="sm" className="text-xs data-[state=on]:bg-amber-500/10 data-[state=on]:text-amber-500 flex-1">
                        DROP
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="ip_last_octet_src"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Source IP Range</FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => updateLocalField('ip_last_octet_src', e.target.value)}
                        onSave={() => forceSaveField('ip_last_octet_src')}
                        placeholder="e.g., 1-255 or 10-20" 
                        className={cn("h-8 text-xs", pendingFields.has('ip_last_octet_src') && "border-blue-500")} 
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ip_last_octet_dst"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Dest. IP Range</FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => updateLocalField('ip_last_octet_dst', e.target.value)}
                        onSave={() => forceSaveField('ip_last_octet_dst')}
                        placeholder="e.g., 1-255 or 10-20" 
                        className={cn("h-8 text-xs", pendingFields.has('ip_last_octet_dst') && "border-blue-500")} 
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="protocol"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Protocol</FormLabel>
                    <FormControl>
                      <Select 
                        value={field.value || 'all'} 
                        onValueChange={(value) => {
                          field.onChange(value)
                          updateField("protocol", value)
                        }}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="tcp">TCP</SelectItem>
                          <SelectItem value="udp">UDP</SelectItem>
                          <SelectItem value="icmp">ICMP</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ports"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Ports</FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => updateLocalField('ports', e.target.value)}
                        onSave={() => forceSaveField('ports')}
                        placeholder="e.g., 443" 
                        className={cn("h-8 text-xs", pendingFields.has('ports') && "border-blue-500")} 
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Global Network Defaults */}
          <div className="bg-card rounded-xl border border-border/40 shadow-md p-6 space-y-4">
            <h4 className="text-sm font-semibold text-foreground mb-4">Global Network Defaults</h4>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Inter-VLAN Default</Label>
              <Select 
                value={localNetworkSettings?.inter_vlan_default || 'REJECT'} 
                onValueChange={(value) => handleGlobalChange('inter_vlan_default', value)}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACCEPT">Accept</SelectItem>
                  <SelectItem value="REJECT">Reject</SelectItem>
                  <SelectItem value="DROP">Drop</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">External Default</Label>
              <Select 
                value={localNetworkSettings?.external_default || 'ACCEPT'} 
                onValueChange={(value) => handleGlobalChange('external_default', value)}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACCEPT">Accept</SelectItem>
                  <SelectItem value="REJECT">Reject</SelectItem>
                  <SelectItem value="DROP">Drop</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">WireGuard Default</Label>
              <Select 
                value={localNetworkSettings?.wireguard_vlan_default || 'ACCEPT'} 
                onValueChange={(value) => handleGlobalChange('wireguard_vlan_default', value)}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACCEPT">Accept</SelectItem>
                  <SelectItem value="REJECT">Reject</SelectItem>
                  <SelectItem value="DROP">Drop</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Always Blocked Networks */}
          <div className="bg-card rounded-xl border border-border/40 shadow-md p-6 space-y-4">
            <h4 className="text-sm font-semibold text-foreground mb-4">Always Blocked Networks</h4>
            <AddItemInput
              items={localNetworkSettings?.always_blocked_networks || []}
              onItemsChange={(items) => handleGlobalChange('always_blocked_networks', items)}
              placeholder="e.g., 192.168.1.0/24"
            />
          </div>
          
        </div>
      </div>
    </Form>
  )
}
"use client"

import { useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AddItemInput } from "@/components/ui/add-item-input"
import MultiSelector from "@/components/ui/multi-selector"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { useAnsibleData } from "@/hooks/use-ansible-data"
import { useRouterForm } from "@/hooks/use-router-form"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import type { Template } from "@/lib/types"
import type { RouterConfig } from "@/lib/types/range-config"

interface RouterDetailsPanelProps {
  routerData: RouterConfig
  onSaveRouter: (settings: RouterConfig) => Promise<void>
  templates?: Template[]
}

export function RouterDetailsPanel({ routerData, onSaveRouter, templates }: RouterDetailsPanelProps) {
  const form = useRouterForm({
    initialData: routerData,
    onSave: onSaveRouter
  })
  
  const {
    saveField,
    forceSaveField,
    updateLocal,
    pendingFields
  } = form
  
  const formData = form.watch()
  
  const { roles, loading: rolesLoading } = useAnsibleData()
  
  // Transform roles data for MultiSelector
  const routerRolesOptions = useMemo(() => 
    roles.map(role => ({
      value: role.name || '',
      label: role.name || '',
    }))
  , [roles])
  
  // Transform selected roles to MultiSelector format
  const selectedRouterRoles = useMemo(() => 
    Array.isArray(formData.roles)
      ? formData.roles.map(role => ({ value: role as string, label: role as string }))
      : []
  , [formData.roles])

  // Handler for nested inbound_wireguard properties with local state update
  const handleInboundChange = (field: string, value: string | number | boolean | number[], debounce = false) => {
    const currentInbound = formData.inbound_wireguard as Record<string, unknown> || {}
    
    // Filter out empty string values for string fields
    let newValue: Record<string, unknown>
    if (typeof value === 'string' && value.trim() === '') {
      // Remove the field entirely if it's an empty string
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [field]: _removed, ...rest } = currentInbound
      newValue = rest
    } else {
      // Set the field value if it's not empty
      newValue = {
        ...currentInbound,
        [field]: value
      }
    }
    
    if (debounce) {
      // For debounced saves, just update local state
      updateLocal('inbound_wireguard', newValue)
    } else {
      // For immediate saves (checkboxes, selects)
      saveField('inbound_wireguard', newValue)
    }
  }


  return (
    <Form {...form}>
      <div className="flex flex-col h-full bg-muted/10">

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Basic Configuration */}
          <div className="bg-card rounded-xl border border-border/40 shadow-md p-4 space-y-4">
            <h4 className="text-sm font-semibold text-foreground mb-4">Basic Configuration</h4>
            
            <FormField
              control={form.control}
              name="vm_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Router Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Default: {{ range_id }}-router (or enter custom name)"
                      className={cn("h-8 text-xs", pendingFields.has('vm_name') && "border-blue-500")}
                      onSave={() => forceSaveField('vm_name')}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="hostname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Hostname
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Default: {{ range_id }}-router (or enter custom hostname)"
                      className={cn("h-8 text-xs", pendingFields.has('hostname') && "border-blue-500")}
                      onSave={() => forceSaveField('hostname')}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

<FormField
            control={form.control}
            name="template"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Template
                </FormLabel>
                <FormControl>
                  <Select 
                    value={field.value || 'debian-11-x64-server-template'} 
                    onValueChange={(value) => {
                      field.onChange(value)
                      saveField('template', value)
                    }}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {templates && templates.map((template) => (
                          <SelectItem key={template.name} value={template.name}>
                            {template.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-2 gap-4">
            {/* CPU Cores */}
            <FormField
              control={form.control}
              name="cpus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    CPU Cores
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      value={field.value || 2}
                      min={1}
                      step={1}
                      onChange={(e) => {
                        const value = parseInt(e.target.value, 10)
                        if (!isNaN(value) && value >= 1 && value <= 64) { // align with VM limits
                          field.onChange(value)
                          updateLocal('cpus', value)
                        }
                      }}
                      onSave={() => forceSaveField('cpus')}
                      className={cn("h-8 text-xs", pendingFields.has('cpus') && "border-blue-500")}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* RAM GB */}
            <FormField
              control={form.control}
              name="ram_gb"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    RAM (GB)
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      value={field.value || 2} 
                      min={1}
                      step={1}
                      onChange={(e) => {
                        const value = parseInt(e.target.value, 10)
                        if (!isNaN(value) && value >= 1 && value <= 256) {
                          field.onChange(value)
                          updateLocal('ram_gb', value)
                        }
                      }}
                      onSave={() => forceSaveField('ram_gb')}
                      className={cn("h-8 text-xs", pendingFields.has('ram_gb') && "border-blue-500")}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          {/* Min RAM (ballooning) */}
          <FormField
            control={form.control}
            name="ram_min_gb"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Min RAM (GB)
                </FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    value={field.value ?? ''} 
                    placeholder="Leave empty to disable ballooning"
                    onChange={(e) => {
                      if (e.target.value === '') {
                        field.onChange(undefined as unknown as number)
                        updateLocal('ram_min_gb', undefined)
                      } else {
                        const value = parseInt(e.target.value, 10)
                        if (!isNaN(value) && value >= 1 && value <= (formData.ram_gb || 256)) {
                          field.onChange(value)
                          updateLocal('ram_min_gb', value)
                        }
                      }
                    }}
                    onSave={() => forceSaveField('ram_min_gb')}
                    className={cn("h-8 text-xs", pendingFields.has('ram_min_gb') && "border-blue-500")}
                  />
                </FormControl>
                <p className="text-xs text-muted-foreground">Enable memory ballooning (optional)</p>
              </FormItem>
            )}
          />
          </div>
        
          
          {/* Inbound WireGuard (Enterprise) */}
          <div className="bg-card rounded-xl border border-border/40 shadow-md p-4 space-y-4">
          <h4 className="text-sm font-semibold text-foreground mb-4">Inbound WireGuard (Enterprise)</h4>
          <FormField
            control={form.control}
            name="inbound_wireguard"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center space-x-2">
                  <FormControl>
                    <Checkbox 
                      id="inbound-enabled" 
                      checked={((field.value as Record<string, unknown>) || {}).enabled as boolean || false} 
                      onCheckedChange={(checked) => {
                        const newValue = { ...(field.value as Record<string, unknown> || {}), enabled: !!checked }
                        field.onChange(newValue)
                        handleInboundChange('enabled', !!checked)
                      }} 
                      className="h-4 w-4"
                    />
                  </FormControl>
                  <FormLabel htmlFor="inbound-enabled" className="text-xs font-bold text-muted-foreground uppercase tracking-wider cursor-pointer">
                    Enable Inbound WireGuard
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />
          
          {Boolean((formData.inbound_wireguard as Record<string, unknown>)?.enabled) && (
            <>
              <FormItem>
                <FormLabel className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Server CIDR
                </FormLabel>
                <FormControl>
                  <Input 
                    value={(formData.inbound_wireguard as Record<string, unknown>)?.server_cidr as string || ''} 
                    onChange={(e) => handleInboundChange('server_cidr', e.target.value, true)}
                    onSave={() => forceSaveField('inbound_wireguard')}
                    className={cn("h-8 text-xs", pendingFields.has('inbound_wireguard') && "border-blue-500")}
                    placeholder="e.g., 10.254.0.0/24"
                  />
                </FormControl>
              </FormItem>
              
              <FormItem>
                <FormLabel className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Port
                </FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    value={(formData.inbound_wireguard as Record<string, unknown>)?.port as number || 51820} 
                    onChange={(e) => {
                      const value = parseInt(e.target.value, 10)
                      if (!isNaN(value) && value >= 1 && value <= 65535) {
                        handleInboundChange('port', value, true)
                      }
                    }}
                    onSave={() => forceSaveField('inbound_wireguard')}
                    className={cn("h-8 text-xs", pendingFields.has('inbound_wireguard') && "border-blue-500")}
                  />
                </FormControl>
              </FormItem>
              
              <FormItem>
                <FormLabel className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Allowed VLANs
                </FormLabel>
                <FormControl>
                  <AddItemInput
                    items={((formData.inbound_wireguard as Record<string, unknown>)?.allowed_vlans as number[] || []).map(String)}
                    onItemsChange={(items) => {
                      const numberItems = items.map(Number).filter(n => !isNaN(n))
                      handleInboundChange('allowed_vlans', numberItems)
                    }}
                    placeholder="e.g., 10"
                    inputClassName="h-8 text-xs flex-1"
                  />
                </FormControl>
              </FormItem>
            </>
          )}
          </div>

          {/* Outbound WireGuard (Enterprise) */}
          <div className="bg-card rounded-xl border border-border/40 shadow-md p-4 space-y-4">
          <h4 className="text-sm font-semibold text-foreground mb-4">Outbound WireGuard (Enterprise)</h4>
          <FormField
            control={form.control}
            name="outbound_wireguard_config"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Outbound Config
                </FormLabel>
                <FormControl>
                  <Textarea 
                    {...field}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.ctrlKey) {
                        forceSaveField('outbound_wireguard_config')
                      }
                    }}
                    onBlur={() => {
                      field.onBlur()
                      forceSaveField('outbound_wireguard_config')
                    }}
                    placeholder="[Interface]&#10;PrivateKey = ..." 
                    rows={6}
                    className={cn("text-xs font-mono", pendingFields.has('outbound_wireguard_config') && "border-blue-500")}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="outbound_wireguard_vlans"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Outbound VLANs
                </FormLabel>
                <FormControl>
                  <AddItemInput
                    items={(field.value as number[] || []).map(String)}
                    onItemsChange={(items) => {
                      const numberItems = items.map(Number).filter(n => !isNaN(n))
                      field.onChange(numberItems)
                      saveField('outbound_wireguard_vlans', numberItems)
                    }}
                    placeholder="e.g., 10"
                    inputClassName="h-8 text-xs flex-1"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          </div>

          {/* Roles & Role Variables (Enterprise) */}
          <div className="bg-card rounded-xl border border-border/40 shadow-md p-4 space-y-4">
          <h4 className="text-sm font-semibold text-foreground mb-4">Ansible Roles (Enterprise)</h4>
          <FormField
            control={form.control}
            name="roles"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Roles
                </FormLabel>
                <FormControl>
                  <MultiSelector
                    value={selectedRouterRoles}
                    onChange={(options) => {
                      const roleNames = options.map(opt => opt.value)
                      field.onChange(roleNames)
                      saveField('roles', roleNames)
                    }}
                    options={routerRolesOptions}
                    placeholder={rolesLoading ? "Loading roles..." : "Search or select roles..."}
                    loadingIndicator={rolesLoading ? <div className="p-2 text-xs text-muted-foreground">Loading roles...</div> : undefined}
                    emptyIndicator={<div className="p-2 text-xs text-muted-foreground">No roles found</div>}
                    badgeClassName="text-xs !bg-purple-500/10 !text-purple-600 dark:!bg-purple-500/20 dark:!text-purple-400"
                    className={cn("h-auto text-sm", pendingFields.has('roles') && "border-blue-500")}
                    disabled={rolesLoading}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          {/* Role vars would need a more complex UI, marked as TODO */}
          {(formData.roles as string[] || []).length > 0 && (
            <div className="text-xs text-muted-foreground">
              Note: Role variables configuration available in YAML editor
            </div>
          )}
          </div>
        
        </div>
      </div>
    </Form>
  )
}
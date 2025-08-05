"use client"

import { useState, useCallback, useMemo } from "react"
import { ChevronRight, Settings } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AddItemInput } from "@/components/ui/add-item-input"
import { useAnsibleData } from "@/hooks/use-ansible-data"
import { useMockAnsibleData } from "@/hooks/use-ansible-data-mock"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { KeyValueInput } from "@/components/ui/key-value-input"
import MultiSelector from "@/components/ui/multi-selector"
import { VMDefaultsModal } from "./vm-defaults-modal"
import { useRangeEditor } from "@/contexts/range-editor-context"
import { useVMForm } from "@/hooks/use-vm-form"
import { cn } from "@/lib/utils"
import type { VMData } from "./vm-component"
import type { Template } from "@/lib/types"
import { getTemplateIcon } from "@/lib/utils/template-icons"
import { useTutorialStyling } from "@/hooks/use-tutorial-styling"

interface VLANPropertiesViewProps {
  vlanId: string | null
  nodes: Array<{ id: string; type: string; data: { label?: string; vms?: VMData[] } }>
  onUpdateVM: (vmId: string, settings: Partial<VMData>) => Promise<void>
  templates?: Template[]
}

// CPU and RAM validation limits
const MIN_CPU_COUNT = 1
const MAX_CPU_COUNT = 64
const MIN_RAM_SIZE = 1
const MAX_RAM_SIZE = 256

function VMPropertiesTab({ vmSettings, templates }: { 
  vm: VMData; 
  vmSettings: ReturnType<typeof useVMForm>;
  templates?: Template[]
}) {
  
  const { localData, pendingFields, updateField, updateLocalField, forceSaveField, saveFieldDebounced, updateNestedField, updateMultipleFieldsPessimistic } = vmSettings
  
  // Use mock data for viewport demo (root page)
  const isViewportDemo = typeof window !== 'undefined' && window.location.pathname === '/'
  const realAnsibleData = useAnsibleData()
  const mockAnsibleData = useMockAnsibleData()
  const { roles, loading: rolesLoading } = isViewportDemo ? mockAnsibleData : realAnsibleData

  const [activeTab, setActiveTab] = useState("basic")
  
  // Tutorial styling hook for Advanced tab
  const { tutorialClasses: advancedTabClasses } = useTutorialStyling([
    '[data-tab="advanced"]'
  ])
  
  // Tutorial styling hook for Ansible roles field
  const { tutorialClasses: ansibleRolesClasses } = useTutorialStyling([
    '[data-field="ansible-roles"]'
  ])
  
  // Transform roles data for MultiSelector
  const rolesOptions = useMemo(() => 
    roles.map(role => ({
      value: role.name || '',
      label: role.name || '',
    }))
  , [roles])
  
  // Transform selected roles to MultiSelector format
  const selectedRoles = useMemo(() => 
    Array.isArray(localData.roles) && localData.roles.every(r => typeof r === 'string')
      ? localData.roles.map(role => ({ value: role, label: role }))
      : []
  , [localData.roles])

  // Determine OS type from local data
  const osType = localData.windows ? 'windows' : localData.linux ? 'linux' : localData.macOS ? 'macos' : 'linux'

  const handleOsTypeChange = (newOsType: 'windows' | 'linux' | 'macos') => {
    // Batch update all OS fields in a single operation (pessimistic)
    // UI will only update after server confirms the change
    const updates: Partial<VMData> = {}
    
    // Preserve existing OS configuration when switching OS types
    if (newOsType === 'windows') {
      // Preserve existing Windows config or default to true
      updates.windows = localData.windows && typeof localData.windows === 'object' 
        ? localData.windows 
        : true
      updates.linux = undefined
      updates.macOS = undefined
    } else if (newOsType === 'linux') {
      // Preserve existing Linux config or default to true
      updates.linux = localData.linux && typeof localData.linux === 'object'
        ? localData.linux
        : true
      updates.windows = undefined
      updates.macOS = undefined
    } else if (newOsType === 'macos') {
      updates.macOS = true
      updates.windows = undefined
      updates.linux = undefined
    }
    
    updateMultipleFieldsPessimistic(updates)
  }

  // Use dynamic templates from props, converting from Template format to dropdown format
  const availableTemplates = templates?.map(template => ({
      value: template.name,
      label: template.name
    })) 

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <div className="px-3 py-3 border-b border-border/50">
        <TabsList className="w-full">
          <TabsTrigger value="basic" className="flex-1 min-w-[70px]">Basic</TabsTrigger>
          <TabsTrigger value="network" className="flex-1 min-w-[70px]">Network</TabsTrigger>
          <TabsTrigger value="os-config" className="flex-1 min-w-[80px]">OS</TabsTrigger>
          <TabsTrigger 
            value="advanced" 
            className={cn("flex-1 min-w-[80px]", advancedTabClasses)}
            data-tab="advanced"
          >
            Advanced
          </TabsTrigger>
        </TabsList>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <TabsContent value="basic" className="space-y-3 mt-0">
          <div className="w-full bg-muted/30 rounded-lg p-3 space-y-3">
            <h3 className="text-sm font-medium text-foreground mb-2">Basic Configuration</h3>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground">VM Name</Label>
                <Input
                  value={localData.vmName || ''}
                  onChange={(e) => updateLocalField('vmName', e.target.value)}
                  onSave={() => forceSaveField('vmName')}
                  placeholder="e.g. Domain Controller"
                  className={cn("h-8 text-sm", pendingFields.has('vmName') && "border-blue-500")}
                  aria-label="VM Name"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground">Hostname</Label>
                <Input
                  value={localData.hostname || ''}
                  onChange={(e) => updateLocalField('hostname', e.target.value)}
                  onSave={() => forceSaveField('hostname')}
                  placeholder="e.g. web-server-01"
                  className={cn("h-8 text-sm", pendingFields.has('hostname') && "border-blue-500")}
                  aria-label="VM Hostname"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground">Template</Label>
                <Select value={localData.template || ''} onValueChange={(value) => updateField('template', value)}>
                  <SelectTrigger className="h-8 text-sm" aria-label="VM Template">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTemplates?.map((tmpl) => (
                      <SelectItem key={tmpl.value} value={tmpl.value}>
                        {tmpl.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-muted-foreground">CPU Cores</Label>
                  <Input
                    type="number"
                    value={localData.cpus || 2}
                    min={MIN_CPU_COUNT}
                    max={MAX_CPU_COUNT}
                    step={1}
                    onChange={(e) => {
                      const value = parseInt(e.target.value, 10)
                      if (!isNaN(value) && value >= MIN_CPU_COUNT && value <= MAX_CPU_COUNT) {
                        updateLocalField('cpus', value)
                      }
                    }}
                    onSave={() => forceSaveField('cpus')}
                    className={cn("h-8 text-sm", pendingFields.has('cpus') && "border-blue-500")}
                    aria-label="CPU Cores"
                    aria-describedby="cpu-help"
                  />
                  <p id="cpu-help" className="text-xs text-muted-foreground">Between {MIN_CPU_COUNT} and {MAX_CPU_COUNT} cores</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-muted-foreground">RAM (GB)</Label>
                  <Input
                    type="number"
                    value={localData.ramGb || 4}
                    min={MIN_RAM_SIZE}
                    max={MAX_RAM_SIZE}
                    step={1}
                    onChange={(e) => {
                      const value = parseInt(e.target.value, 10)
                      if (!isNaN(value) && value >= MIN_RAM_SIZE && value <= MAX_RAM_SIZE) {
                        updateLocalField('ramGb', value)
                      }
                    }}
                    onSave={() => forceSaveField('ramGb')}
                    className={cn("h-8 text-sm", pendingFields.has('ramGb') && "border-blue-500")}
                    aria-label="RAM Size in GB"
                    aria-describedby="ram-help"
                  />
                  <p id="ram-help" className="text-xs text-muted-foreground">Between {MIN_RAM_SIZE}GB and {MAX_RAM_SIZE}GB</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground">Min RAM (GB)</Label>
                <Input
                  type="number"
                  value={localData.ramMinGb || ''}
                  min={MIN_RAM_SIZE}
                  max={localData.ramGb || MAX_RAM_SIZE}
                  step={1}
                  onChange={(e) => {
                    const value = parseInt(e.target.value, 10)
                    if (!isNaN(value) && value >= MIN_RAM_SIZE && value <= (localData.ramGb || MAX_RAM_SIZE)) {
                      updateLocalField('ramMinGb', value)
                    } else if (e.target.value === '') {
                      updateLocalField('ramMinGb', undefined)
                    }
                  }}
                  onSave={() => forceSaveField('ramMinGb')}
                  placeholder="Leave empty to disable ballooning"
                  className={cn("h-8 text-sm", pendingFields.has('ramMinGb') && "border-blue-500")}
                />
                <p className="text-xs text-muted-foreground">Enable memory ballooning (optional)</p>
              </div>

          </div>
        </TabsContent>

        <TabsContent value="network" className="space-y-3 mt-0">
          <div className="w-full bg-muted/30 rounded-lg p-3 space-y-3">
            <h3 className="text-sm font-medium text-foreground mb-2">Network Configuration</h3>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground">IP Last Octet</Label>
                <Input
                  type="number"
                  value={localData.ipLastOctet || ''}
                  onChange={(e) => {
                    const value = parseInt(e.target.value, 10)
                    if (!isNaN(value) && value >= 1 && value <= 254) {
                      updateLocalField('ipLastOctet', value)
                    }
                  }}
                  onSave={() => forceSaveField('ipLastOctet')}
                  placeholder="e.g. 11"
                  className={cn("h-8 text-sm", pendingFields.has('ipLastOctet') && "border-blue-500")}
                />
                <p className="text-xs text-muted-foreground">Must be unique within the VLAN (1-254)</p>
              </div>
              
              <div className="flex items-center justify-between py-2">
                <div className="space-y-0.5">
                  <Label className="text-xs font-bold text-muted-foreground">Force IP</Label>
                  <p className="text-xs text-muted-foreground">Override DHCP assignment</p>
                </div>
                <Checkbox
                  checked={localData.forceIp || false}
                  onCheckedChange={(checked) => updateField('forceIp', checked === true)}
                />
              </div>
              
              <Separator />
              
              <div className="space-y-3">
                <Label className="text-xs font-bold text-muted-foreground">DNS Rewrites</Label>
                <AddItemInput
                  items={localData.dnsRewrites || []}
                  onItemsChange={(items) => updateField('dnsRewrites', items)}
                  placeholder="e.g. example.com or *.example.com"
                />
              </div>
          </div>
          
          {osType === 'windows' && (
            <div className="w-full bg-muted/30 rounded-lg p-3 space-y-3">
              <h3 className="text-sm font-medium text-foreground mb-2">Domain Configuration</h3>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-muted-foreground">Domain FQDN</Label>
                  <Input
                    value={localData.domain?.fqdn || ''}
                    onChange={(e) => {
                      const newDomain = { ...localData.domain, fqdn: e.target.value }
                      updateLocalField('domain', newDomain)
                    }}
                    onSave={() => forceSaveField('domain')}
                    placeholder="e.g. ludus.network"
                    className={cn("h-8 text-sm", pendingFields.has('domain') && "border-blue-500")}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-muted-foreground">Domain Role</Label>
                  <Select value={localData.domain?.role || 'none'} onValueChange={(value) => {
                    const newDomain = { ...localData.domain, role: value === 'none' ? undefined : value as 'primary-dc' | 'alt-dc' | 'member' }
                    updateField('domain', newDomain)
                  }}>
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="primary-dc">Primary Domain Controller</SelectItem>
                      <SelectItem value="alt-dc">Alternate Domain Controller</SelectItem>
                      <SelectItem value="member">Domain Member</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="os-config" className="space-y-3 mt-0">
          <div className="w-full bg-muted/30 rounded-lg p-3 space-y-3">
            <h3 className="text-sm font-medium text-foreground mb-2">Operating System</h3>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-muted-foreground">Operating System Type</Label>
              <Select value={osType} onValueChange={handleOsTypeChange}>
                <SelectTrigger className="h-8 text-sm" aria-label="Operating System">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="windows">Windows</SelectItem>
                  <SelectItem value="linux">Linux</SelectItem>
                  <SelectItem value="macos">macOS</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {osType === 'windows' && (
            <>
              <div className="w-full bg-muted/30 rounded-lg p-3 space-y-3">
                <h3 className="text-sm font-medium text-foreground mb-2">Windows Configuration</h3>
                  <div className="flex items-center justify-between py-2">
                    <div className="space-y-0.5">
                      <Label className="text-xs font-bold text-muted-foreground">Sysprep</Label>
                      <p className="text-xs text-muted-foreground">Run Windows sysprep</p>
                    </div>
                    <Switch checked={typeof localData.windows === 'object' ? localData.windows.sysprep || false : false} onCheckedChange={(checked) => updateNestedField('windows', { sysprep: checked })} />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-muted-foreground">Office Version</Label>
                    <Select value={typeof localData.windows === 'object' ? localData.windows.officeVersion || 'none' : 'none'} onValueChange={(value) => updateNestedField('windows', { officeVersion: value === 'none' ? undefined : value })}>
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="2013">Office 2013</SelectItem>
                        <SelectItem value="2016">Office 2016</SelectItem>
                        <SelectItem value="2019">Office 2019</SelectItem>
                        <SelectItem value="2021">Office 2021</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-3">
                    <Label className="text-xs font-bold text-muted-foreground">Chocolatey Packages</Label>
                    <AddItemInput
                      items={typeof localData.windows === 'object' ? localData.windows.chocolateyPackages || [] : []}
                      onItemsChange={(items) => updateNestedField('windows', { chocolateyPackages: items })}
                      placeholder="e.g. vscodium"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between py-2">
                    <div className="space-y-0.5">
                      <Label className="text-xs font-bold text-muted-foreground">Install Additional Tools</Label>
                      <p className="text-xs text-muted-foreground">Install additional Windows tools and utilities</p>
                    </div>
                    <Switch 
                      checked={typeof localData.windows === 'object' ? localData.windows.installAdditionalTools || false : false} 
                      onCheckedChange={(checked) => updateNestedField('windows', { installAdditionalTools: checked })} 
                    />
                  </div>
                  
                  <div className="flex items-center justify-between py-2">
                    <div className="space-y-0.5">
                      <Label className="text-xs font-bold text-muted-foreground">Ignore Chocolatey Checksums</Label>
                      <p className="text-xs text-muted-foreground">Skip checksum validation for Chocolatey packages</p>
                    </div>
                    <Switch 
                      checked={typeof localData.windows === 'object' ? localData.windows.chocolateyIgnoreChecksums || false : false} 
                      onCheckedChange={(checked) => updateNestedField('windows', { chocolateyIgnoreChecksums: checked })} 
                    />
                  </div>
                  
                  {typeof localData.windows === 'object' && localData.windows.officeVersion && localData.windows.officeVersion !== 'none' && (
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-muted-foreground">Office Architecture</Label>
                      <Select 
                        value={localData.windows.officeArch || '64'} 
                        onValueChange={(value) => updateNestedField('windows', { officeArch: value })}
                      >
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="32">32-bit</SelectItem>
                          <SelectItem value="64">64-bit</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-muted-foreground">Visual Studio Version</Label>
                    <Select 
                      value={typeof localData.windows === 'object' ? localData.windows.visualStudioVersion || 'none' : 'none'} 
                      onValueChange={(value) => updateNestedField('windows', { visualStudioVersion: value === 'none' ? undefined : value })}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="2017">Visual Studio 2017</SelectItem>
                        <SelectItem value="2019">Visual Studio 2019</SelectItem>
                        <SelectItem value="2022">Visual Studio 2022</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-muted-foreground">Auto-logon User</Label>
                    <Input
                      type="text"
                      value={typeof localData.windows === 'object' ? localData.windows.autologonUser || '' : ''}
                      onChange={(e) => {
                        const newWindows = { ...(typeof localData.windows === 'object' ? localData.windows : {}), autologonUser: e.target.value || undefined }
                        updateLocalField('windows', newWindows)
                      }}
                      onSave={() => forceSaveField('windows')}
                      placeholder="Username for automatic login"
                      className={cn("h-8 text-sm", pendingFields.has('windows') && "border-blue-500")}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-muted-foreground">Auto-logon Password</Label>
                    <Input
                      type="password"
                      value={typeof localData.windows === 'object' ? localData.windows.autologonPassword || '' : ''}
                      onChange={(e) => {
                        const newWindows = { ...(typeof localData.windows === 'object' ? localData.windows : {}), autologonPassword: e.target.value || undefined }
                        updateLocalField('windows', newWindows)
                      }}
                      onSave={() => forceSaveField('windows')}
                      placeholder="Password for automatic login"
                      className={cn("h-8 text-sm", pendingFields.has('windows') && "border-blue-500")}
                    />
                  </div>
              </div>
            </>
          )}
          
          {osType === 'linux' && (
            <div className="w-full bg-muted/30 rounded-lg p-3 space-y-3">
              <h3 className="text-sm font-medium text-foreground mb-2">Linux Configuration</h3>
                <div className="space-y-3">
                  <Label className="text-xs font-bold text-muted-foreground">Packages to Install</Label>
                  <AddItemInput
                    items={typeof localData.linux === 'object' ? localData.linux.packages || [] : []}
                    onItemsChange={(items) => updateField('linux', items.length > 0 ? { packages: items } : true)}
                    placeholder="e.g. curl, python3"
                  />
                </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="advanced" className="space-y-3 mt-0">
          <div className="w-full bg-muted/30 rounded-lg p-3 space-y-3">
            <h3 className="text-sm font-medium text-foreground mb-2">Testing Configuration</h3>
              <div className="flex items-center justify-between py-2">
                <div className="space-y-0.5">
                  <Label className="text-xs font-bold text-muted-foreground">Take Snapshot</Label>
                  <p className="text-xs text-muted-foreground">Snapshot before testing</p>
                </div>
                <Switch 
                  checked={localData.testing?.snapshot ?? true} 
                  onCheckedChange={(checked) => updateNestedField('testing', { snapshot: checked })} 
                />
              </div>
              
              <div className="flex items-center justify-between py-2">
                <div className="space-y-0.5">
                  <Label className="text-xs font-bold text-muted-foreground">Block Internet</Label>
                  <p className="text-xs text-muted-foreground">Block internet access during testing</p>
                </div>
                <Switch 
                  checked={localData.testing?.blockInternet ?? true} 
                  onCheckedChange={(checked) => updateNestedField('testing', { blockInternet: checked })} 
                />
              </div>
          </div>
          
          <div className="w-full bg-muted/30 rounded-lg p-3 space-y-3">
            <h3 className="text-sm font-medium text-foreground mb-2">Ansible Configuration</h3>
              <div className="space-y-3">
                <Label className="text-xs font-bold text-muted-foreground">Ansible Groups</Label>
                <AddItemInput
                  items={localData.ansibleGroups || []}
                  onItemsChange={(items) => updateField('ansibleGroups', items)}
                  placeholder="e.g. webservers"
                />
              </div>
              
              <div 
                className="space-y-3" 
                data-field="ansible-roles"
                data-has-selection={selectedRoles.length > 0 ? 'true' : 'false'}
              >
                <Label className="text-xs font-bold text-muted-foreground">Ansible Roles</Label>
                <MultiSelector
                  value={selectedRoles}
                  onChange={(options) => {
                    const roleNames = options.map(opt => opt.value)
                    // Update local state immediately for responsive UI, then save with debounce
                    updateLocalField('roles', roleNames)
                    saveFieldDebounced('roles', roleNames) // Uses default debounce
                  }}
                  options={rolesOptions}
                  placeholder={rolesLoading ? "Loading roles..." : "Search or select roles..."}
                  loadingIndicator={rolesLoading ? <div className="p-2 text-xs text-muted-foreground">Loading roles...</div> : undefined}
                  emptyIndicator={<div className="p-2 text-xs text-muted-foreground">No roles found</div>}
                  badgeClassName="text-xs !bg-purple-500/10 !text-purple-600 dark:!bg-purple-500/20 dark:!text-purple-400"
                  className={cn("h-auto text-sm", pendingFields.has('roles') && "border-blue-500", ansibleRolesClasses)}
                  disabled={rolesLoading}
                />
                <p className="text-xs text-muted-foreground">
                  Roles must be installed with &apos;ludus ansible role add&apos;
                </p>
              </div>
              
              <div className="space-y-3">
                <Label className="text-xs font-bold text-muted-foreground">Role Variables</Label>
                <KeyValueInput
                  values={localData.roleVars || {}}
                  onValuesChange={(values) => updateField('roleVars', Object.keys(values).length > 0 ? values : undefined)}
                  keyPlaceholder="Variable name"
                  valuePlaceholder="Variable value"
                />
                <p className="text-xs text-muted-foreground">
                  Variables passed to ALL roles on this VM (overrides global defaults)
                </p>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between py-2">
                <div className="space-y-0.5">
                  <Label className="text-xs font-bold text-muted-foreground">Unmanaged VM</Label>
                  <p className="text-xs text-muted-foreground">No qemu-guest-agent (e.g. EDR appliances)</p>
                </div>
                <Switch checked={localData.unmanaged || false} onCheckedChange={(checked) => updateField('unmanaged', checked)} />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between py-2">
                <div className="space-y-0.5">
                  <Label className="text-xs font-bold text-muted-foreground">Full Clone</Label>
                  <p className="text-xs text-muted-foreground">Full clone (slower) vs linked clone (faster)</p>
                </div>
                <Switch 
                  checked={localData.fullClone || false} 
                  onCheckedChange={(checked) => updateField('fullClone', checked)} 
                />
              </div>
          </div>
        </TabsContent>
      </div>
    </Tabs>
  )
}

function VMAccordionItem({ 
  vm, 
  isExpanded, 
  onToggle, 
  onUpdateVM,
  templates
}: {
  vm: VMData
  isExpanded: boolean
  onToggle: () => void
  onUpdateVM: (vmId: string, settings: Partial<VMData>) => Promise<void>
  templates?: Template[]
}) {
  const vmSettings = useVMForm({
    initialData: vm,
    onSave: (settings) => onUpdateVM(vm.id, settings)
  })
  
  return (
    <div className={cn(
      "bg-background transition-all duration-200",
      isExpanded ? "shadow-none" : "shadow-none"
    )}>
      {/* VM Header - Always Visible */}
      <div
        className="flex items-center px-5 py-4 cursor-pointer group hover:bg-muted/50 transition-all duration-200 rounded-lg mx-1"
        onClick={onToggle}
      >
        <ChevronRight 
          className={cn(
            "h-4 w-4 text-muted-foreground mr-3 transition-transform duration-200",
            isExpanded && "rotate-90 text-foreground"
          )}
        />
        <div className="flex-shrink-0 mr-4 w-8 h-8 rounded-md bg-muted/20 flex items-center justify-center">
          {getTemplateIcon(vm.template || '', "h-4 w-4 text-muted-foreground")}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold truncate text-foreground">{vm.vmName || vm.label}</div>
          <div className="text-xs text-muted-foreground mt-1 font-mono">
            {vm.template}
          </div>
        </div>
      </div>

      {/* VM Details - Expanded Content */}
      {isExpanded && (
        <div className="mx-2 mb-2 p-2 bg-card rounded-xl border border-border/40">
          <div className="space-y-2">
            {/* VM Properties */}
            <VMPropertiesTab vm={vm} vmSettings={vmSettings} templates={templates} />
          </div>
        </div>
      )}
    </div>
  )
}

export function VLANPropertiesView({ 
  vlanId, 
  nodes, 
  onUpdateVM,
  templates
}: VLANPropertiesViewProps) {
  const [isVMDefaultsModalOpen, setIsVMDefaultsModalOpen] = useState(false)
  const { currentDefaults, handleSaveVMDefaults, selectedVMId, selectionManager, topologyState } = useRangeEditor()
  
  // Get VMs data with useMemo to prevent unnecessary re-renders
  // Use context-driven state - accordion expansion is purely derived from selectedVMId
  const isVMExpanded = useCallback((vmId: string) => {
    return selectedVMId === vmId
  }, [selectedVMId])

  const toggleVMExpansion = useCallback((vmId: string) => {
    // Call selection manager for bidirectional sync between canvas and panel
    if (selectionManager.selectedVMId === vmId) {
      // Clicking already selected VM - deselect it
      selectionManager.setSelectedVMId(null)
    } else {
      // Ensure we have a valid VLAN ID before proceeding
      if (!vlanId) return
      // Select this VM using panel selection method (ensures bidirectional sync)
      selectionManager.selectVMFromPanel(vmId, vlanId, topologyState.reactFlowInstance)
    }
  }, [selectionManager, vlanId, topologyState.reactFlowInstance])

  const vms = useMemo(() => {
    const selectedNode = nodes.find((node) => node.id === vlanId)
    return selectedNode?.data?.vms || []
  }, [nodes, vlanId])

  if (!vlanId) return null

  return (
    <div className="flex flex-col h-full bg-muted/10">
      {/* VM Accordion List */}
      <div className="flex-1 overflow-y-auto">
        {vms.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <div className="text-4xl mb-3">📦</div>
            <div className="text-sm font-medium">No VMs in this VLAN</div>
            <div className="text-xs mt-1">Virtual machines will appear here</div>
          </div>
        ) : (
          <>
            <div className="space-y-2 p-4">
              {vms.map((vm: VMData) => (
                <VMAccordionItem
                  key={vm.id}
                  vm={vm}
                  isExpanded={isVMExpanded(vm.id)}
                  onToggle={() => toggleVMExpansion(vm.id)}
                  onUpdateVM={onUpdateVM}
                  templates={templates}
                />
              ))}
            </div>
            
            {/* VM Defaults Section - After VM list */}
            <div className="px-4 pb-4 text-center">
              <button
                onClick={() => setIsVMDefaultsModalOpen(true)}
                className="inline-flex items-center text-sm text-primary hover:text-primary/80 hover:underline transition-colors cursor-pointer"
              >
                <Settings className="h-4 w-4 mr-2" />
                Configure VM Defaults
              </button>
              <p className="text-xs text-muted-foreground mt-2">
                Set default configuration for all VMs in this range
              </p>
            </div>
          </>
        )}
      </div>

      {/* VM Defaults Modal */}
      <VMDefaultsModal
        isOpen={isVMDefaultsModalOpen}
        onClose={() => setIsVMDefaultsModalOpen(false)}
        onSave={handleSaveVMDefaults}
        initialDefaults={currentDefaults}
      />

    </div>
  )
}
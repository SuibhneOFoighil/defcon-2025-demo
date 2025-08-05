"use client"

import React, { useState, useEffect } from "react"
import { Camera, Trash2, RotateCcw, Loader2, Server, Check } from "lucide-react"
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter } from "@/components/ui/modal/modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { SearchBar } from "@/components/ui/search-bar"
import { useSnapshots } from "@/hooks/use-snapshots"
import { useCreateSnapshot, useRollbackSnapshot, useRemoveSnapshot } from "@/hooks/use-snapshot-mutations"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { useRangeEditorData } from "@/hooks/use-range-editor-data"
import type { ReconciledVM } from "@/lib/types/range-editor"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface SnapshotsModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
}

export function SnapshotsModal({ isOpen, onClose, userId }: SnapshotsModalProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedVMs, setSelectedVMs] = useState<string[]>([])
  const [newSnapshotName, setNewSnapshotName] = useState("")
  const [newSnapshotDescription, setNewSnapshotDescription] = useState("")
  
  // Initialize mutation hooks
  const createSnapshot = useCreateSnapshot()
  const rollbackSnapshot = useRollbackSnapshot()
  const removeSnapshot = useRemoveSnapshot()
  
  // Fetch range data to get VMs
  const { data: editorData, loading: rangeLoading, error: rangeError } = useRangeEditorData(userId)
  const vms = editorData?.vms || []
  
  // Get deployed VMs only
  const deployedVMs = vms.filter((vm: ReconciledVM) => vm.isDeployed)
  
  // Auto-select all deployed VMs if none selected, otherwise use selected VMs
  const effectiveSelectedVMs = selectedVMs.length > 0 ? selectedVMs 
    : deployedVMs.map(vm => vm.vmName).filter(Boolean) as string[]
  
  // Convert effective VM selection to Proxmox IDs for API calls
  const proxmoxIds = effectiveSelectedVMs.map(vmName => {
    const vm = deployedVMs.find(v => v.vmName === vmName)
    return vm?.proxmoxId
  }).filter((id): id is number => id !== null && id !== undefined)
  
  // Fetch snapshots using Proxmox IDs
  const vmIds = proxmoxIds
  const { snapshots, loading: snapshotsLoading, error: snapshotsError, refetch } = useSnapshots({ 
    vmids: vmIds 
  })
  
  // Reset selected VMs when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedVMs([])
      setShowCreateDialog(false)
    }
  }, [isOpen])
  
  const filteredSnapshots = snapshots.filter(snapshot =>
    snapshot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (snapshot.description?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (snapshot.vmname?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  )
  
  // Build snapshot hierarchy from parent relationships
  const buildSnapshotHierarchy = (snapshots: typeof filteredSnapshots) => {
    const snapshotMap = new Map()
    const roots: any[] = [] // eslint-disable-line @typescript-eslint/no-explicit-any
    
    // Create nodes for all snapshots
    snapshots.forEach(snapshot => {
      snapshotMap.set(snapshot.name, {
        ...snapshot,
        children: []
      })
    })
    
    // Build parent-child relationships
    snapshots.forEach(snapshot => {
      const node = snapshotMap.get(snapshot.name)
      if (snapshot.parent && snapshotMap.has(snapshot.parent)) {
        const parent = snapshotMap.get(snapshot.parent)
        parent.children.push(node)
      } else {
        roots.push(node)
      }
    })
    
    // Include 'current' in the tree but ensure proper hierarchy
    return roots
  }
  
  // Find path from root to current state
  const findCurrentPath = (snapshots: typeof filteredSnapshots): string[] => {
    const currentSnapshot = snapshots.find(s => s.name === 'current')
    if (!currentSnapshot) return []
    
    const path: string[] = []
    let current = currentSnapshot
    
    // Trace back through parents
    while (current) {
      path.unshift(current.name)
      if (current.parent) {
        const parentSnapshot = snapshots.find(s => s.name === current.parent)
        if (parentSnapshot) {
          current = parentSnapshot
        } else {
          break
        }
      } else {
        break
      }
    }
    
    return path
  }

  // Group snapshots by VM and build hierarchy trees
  const vmData = filteredSnapshots.reduce((groups, snapshot) => {
    const vmId = snapshot.vmid?.toString() || 'unknown'
    const vmName = snapshot.vmname || `VM ${vmId}`
    
    if (!groups[vmId]) {
      groups[vmId] = {
        vmId,
        vmName,
        allSnapshots: [],
        hierarchy: [],
        currentPath: [],
        liveState: null
      }
    }
    
    groups[vmId].allSnapshots.push(snapshot)
    
    // Identify live state
    if (snapshot.name === 'current') {
      groups[vmId].liveState = snapshot
    }
    
    return groups
  }, {} as Record<string, { 
    vmId: string, 
    vmName: string, 
    allSnapshots: typeof snapshots,
    hierarchy: any[], // eslint-disable-line @typescript-eslint/no-explicit-any
    currentPath: string[],
    liveState: typeof snapshots[0] | null 
  }>)
  
  // Build hierarchy and find current path for each VM
  Object.values(vmData).forEach(vmGroup => {
    vmGroup.hierarchy = buildSnapshotHierarchy(vmGroup.allSnapshots)
    vmGroup.currentPath = findCurrentPath(vmGroup.allSnapshots)
  })
  
  const vmGroups = Object.values(vmData).sort((a, b) => a.vmName.localeCompare(b.vmName))
  
  // Get current VM runtime data for live state display
  const getVMRuntimeData = (vmId: string) => {
    const vm = deployedVMs.find(v => v.proxmoxId?.toString() === vmId)
    return vm ? {
      status: vm.poweredOn ? 'Running' : 'Stopped',
      ramGb: vm.ramGb || 2,
      lastModified: 'Recently' // Placeholder - would need API data
    } : null
  }

  // Render tree with CLI-like hierarchy
  const renderSnapshotTree = (node: any, prefix: string = '', isLast: boolean = true, currentPath: string[] = [], depth: number = 0): React.ReactNode => { // eslint-disable-line @typescript-eslint/no-explicit-any
    const isCurrentPosition = node.name === 'current'
    const isOnCurrentPath = currentPath.includes(node.name)
    
    const connector = depth === 0 ? '' : (isLast ? '└── ' : '├── ')
    const currentIndicator = isCurrentPosition ? ' (You are here!)' : ''
    
    return (
      <div key={`${node.name}-${depth}`} className="space-y-1">
        <div className={`flex items-start justify-between p-2 rounded ${isOnCurrentPath ? 'bg-blue-50 dark:bg-blue-950/30' : 'hover:bg-muted/50'} transition-colors`}>
          <div className="flex items-start space-x-1 flex-1">
            {depth > 0 && (
              <div className="font-mono text-xs text-muted-foreground mt-1.5 select-none" style={{ minWidth: `${(depth * 24) + 30}px` }}>
                <span className="text-slate-400">{prefix}{connector}</span>
              </div>
            )}
            <div className="flex items-start space-x-2">
              {isCurrentPosition ? (
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mt-2"></div>
              ) : (
                <Camera className="h-4 w-4 text-muted-foreground mt-0.5" />
              )}
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className={`font-medium text-sm ${isCurrentPosition ? 'text-green-700 dark:text-green-300' : ''}`}>
                    {node.name}{currentIndicator}
                  </span>
                  {!isCurrentPosition && getStatusBadge(node.state)}
                  {node.includesRAM && (
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-xs text-blue-600 dark:text-blue-400">RAM</span>
                    </div>
                  )}
                </div>
                {!isCurrentPosition && (
                  <div className="text-xs text-muted-foreground">
                    {formatDate(node.created_at)} • {(node.size / (1024 * 1024 * 1024)).toFixed(1)} GB
                  </div>
                )}
                {node.description && (
                  <p className="text-xs text-muted-foreground italic">{node.description}</p>
                )}
              </div>
            </div>
          </div>
          
          {!isCurrentPosition && node.state === "ready" && (
            <div className="flex items-center space-x-1 ml-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRestore(node.name, node.vm_id)}
                disabled={rollbackSnapshot.isPending}
                className="h-7 px-2 text-xs"
              >
                {rollbackSnapshot.isPending ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <>
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Restore
                  </>
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(node.name, node.vm_id)}
                disabled={removeSnapshot.isPending}
                className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
              >
                {removeSnapshot.isPending ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Trash2 className="h-3 w-3" />
                )}
              </Button>
            </div>
          )}
        </div>
        
        {/* Render children */}
        {node.children && node.children.length > 0 && (
          <div>
            {node.children.map((child: any, index: number) => { // eslint-disable-line @typescript-eslint/no-explicit-any
              const childIsLast = index === node.children.length - 1
              const childPrefix = prefix + (isLast ? '    ' : '│   ')
              return renderSnapshotTree(child, childPrefix, childIsLast, currentPath, depth + 1)
            })}
          </div>
        )}
      </div>
    )
  }

  const handleCreateSnapshot = async () => {
    if (!newSnapshotName.trim()) return
    
    // Use effective selection (auto-select all if none selected)
    const vmsToSnapshot = selectedVMs.length > 0 ? selectedVMs
      : deployedVMs.map(vm => vm.vmName).filter(Boolean) as string[]
    
    if (vmsToSnapshot.length === 0) return
    
    try {
      // Convert VM names to Proxmox VM IDs using the proper proxmoxId field
      const vmids = vmsToSnapshot.map(vmName => {
        const vm = deployedVMs.find(v => v.vmName === vmName)
        return vm?.proxmoxId
      }).filter((id): id is number => id !== null && id !== undefined)
      
      await createSnapshot.mutateAsync({
        name: newSnapshotName.trim(),
        description: newSnapshotDescription.trim() || undefined,
        vmids: vmids.length > 0 ? vmids : undefined,
        includeRAM: true, // Default to including RAM in snapshots
      })
      
      setNewSnapshotName("")
      setNewSnapshotDescription("")
      setSelectedVMs([])
      setShowCreateDialog(false)
      
      // Refetch snapshots after creation
      await refetch()
    } catch (error) {
      // Error handling is done in the mutation hook
      console.error("Error creating snapshot:", error)
    }
  }

  const handleRestore = async (snapshotName: string, vmId?: string) => {
    try {
      // Extract VMID from VM ID if present
      const vmids = vmId ? [parseInt(vmId.match(/\d+/)?.[0] || '')] : undefined
      
      await rollbackSnapshot.mutateAsync({
        name: snapshotName,
        vmids: vmids?.filter(id => !isNaN(id)),
      })
      
      // Refetch snapshots after rollback
      await refetch()
    } catch (error) {
      // Error handling is done in the mutation hook
      console.error("Error restoring snapshot:", error)
    }
  }

  const handleDelete = async (snapshotName: string, vmId?: string) => {
    try {
      // Extract VMID from VM ID if present
      const vmids = vmId ? [parseInt(vmId.match(/\d+/)?.[0] || '')] : undefined
      
      await removeSnapshot.mutateAsync({
        name: snapshotName,
        vmids: vmids?.filter(id => !isNaN(id)),
      })
      
      // Refetch snapshots after deletion
      await refetch()
    } catch (error) {
      // Error handling is done in the mutation hook
      console.error("Error deleting snapshot:", error)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (state: string) => {
    switch (state) {
      case "ready":
        return <Badge variant="success" size="sm">Ready</Badge>
      case "creating":
        return <Badge variant="default" size="sm">Creating...</Badge>
      case "error":
        return <Badge variant="danger" size="sm">Error</Badge>
      default:
        return <Badge variant="outline" size="sm">{state}</Badge>
    }
  }
  
  const toggleVMSelection = (vmName: string) => {
    setSelectedVMs(prev => 
      prev.includes(vmName) 
        ? prev.filter(v => v !== vmName)
        : [...prev, vmName]
    )
  }
  
  const toggleAllVMs = () => {
    const allVMNames = deployedVMs.map((vm: ReconciledVM) => vm.vmName).filter(Boolean) as string[]
    setSelectedVMs(prev => 
      prev.length === allVMNames.length ? [] : allVMNames
    )
  }

  const loading = rangeLoading || snapshotsLoading
  const error = rangeError || snapshotsError

  return (
    <Modal open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ModalContent size="xl" className="max-h-[85vh] flex flex-col overflow-hidden">
        <ModalHeader>
          <ModalTitle className="flex items-center space-x-2">
            <Camera className="h-5 w-5" />
            <span>VM Snapshots</span>
            <Badge variant="outline" size="sm">
              {userId}
            </Badge>
          </ModalTitle>
        </ModalHeader>

        <div className="flex flex-col flex-1 min-h-0">
          {/* Main Snapshots View */}
          <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
            {/* Search and Actions */}
            <div className="flex items-center justify-between flex-shrink-0">
              <SearchBar
                placeholder="Search snapshots..."
                value={searchQuery}
                onChange={setSearchQuery}
                className="w-64"
              />
              <div className="flex items-center space-x-3">
                <div className="text-sm text-muted-foreground">
                  {vmGroups.length} VM{vmGroups.length !== 1 ? 's' : ''} • {vmGroups.reduce((total, vm) => total + vm.allSnapshots.filter(s => s.name !== 'current').length, 0)} snapshot{vmGroups.reduce((total, vm) => total + vm.allSnapshots.filter(s => s.name !== 'current').length, 0) !== 1 ? 's' : ''}
                  {selectedVMs.length === 0 && deployedVMs.length > 0 && (
                    <span className="text-xs ml-1">(all VMs)</span>
                  )}
                </div>
                <Button
                  onClick={() => setShowCreateDialog(true)}
                  size="sm"
                  className="px-4"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Create Snapshot
                </Button>
              </div>
            </div>

            {/* Loading/Error States */}
            {loading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}
            
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Snapshots List */}
            {!loading && !error && (
              <div className="overflow-y-auto space-y-2 pb-2" style={{ maxHeight: 'calc(85vh - 16rem)' }}>
                {filteredSnapshots.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <Camera className="h-12 w-12 mb-2 opacity-50" />
                    <p className="text-sm">
                      {searchQuery ? "No snapshots match your search" : "No snapshots available"}
                    </p>
                    {!searchQuery && (
                      <p className="text-xs mt-1">
                        Create your first snapshot using the &ldquo;Create Snapshot&rdquo; button
                      </p>
                    )}
                  </div>
                ) : (
                  <Accordion type="multiple" className="space-y-2">
                    {vmGroups.map((vmGroup) => {
                      const runtimeData = getVMRuntimeData(vmGroup.vmId)
                      const totalItems = vmGroup.allSnapshots.length
                      const currentPathStr = vmGroup.currentPath.filter(p => p !== 'current').join(' → ')
                      
                      return (
                        <AccordionItem key={vmGroup.vmId} value={vmGroup.vmId} className="border rounded-lg">
                          <AccordionTrigger className="px-4 hover:no-underline">
                            <div className="flex items-center justify-between w-full mr-4">
                              <div className="flex items-center space-x-3">
                                <Server className="h-4 w-4 text-primary" />
                                <div className="text-left">
                                  <h3 className="font-semibold text-base">{vmGroup.vmName}</h3>
                                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                    <span>VM {vmGroup.vmId}</span>
                                    <span>•</span>
                                    <span>{totalItems} item{totalItems !== 1 ? 's' : ''}</span>
                                    {runtimeData && (
                                      <>
                                        <span>•</span>
                                        <Badge variant="outline" size="sm" className="text-xs">
                                          {runtimeData.status}
                                        </Badge>
                                      </>
                                    )}
                                    {currentPathStr && (
                                      <>
                                        <span>•</span>
                                        <span className="text-blue-600 dark:text-blue-400">Current: {currentPathStr}</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </AccordionTrigger>
                          
                          <AccordionContent className="px-4">
                            <div className="space-y-3">
                              {/* Snapshot Tree */}
                              {vmGroup.hierarchy.length > 0 ? (
                                <div className="space-y-1">
                                  {vmGroup.hierarchy.map((root, index) => 
                                    renderSnapshotTree(root, '', index === vmGroup.hierarchy.length - 1, vmGroup.currentPath, 0)
                                  )}
                                </div>
                              ) : (
                                <div className="text-center py-4 text-muted-foreground text-sm">
                                  {vmGroup.liveState ? (
                                    <div className="space-y-2">
                                      <div className="flex items-center justify-center space-x-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                        <span>Live VM State (You are here!)</span>
                                      </div>
                                      <p className="text-xs">No snapshots created yet</p>
                                    </div>
                                  ) : (
                                    "No snapshots available for this VM"
                                  )}
                                </div>
                              )}
                            
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      )
                    })}
                  </Accordion>
                )}
              </div>
            )}

            {/* Summary */}
            <Separator />
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>
                {vmGroups.length} VM{vmGroups.length !== 1 ? 's' : ''} • {vmGroups.reduce((total, vm) => total + vm.allSnapshots.filter(s => s.name !== 'current').length, 0)} snapshot{vmGroups.reduce((total, vm) => total + vm.allSnapshots.filter(s => s.name !== 'current').length, 0) !== 1 ? 's' : ''} total
              </span>
              <span>
                Total size: {vmGroups.reduce((total, vm) => {
                  return total + vm.allSnapshots.filter(s => s.name !== 'current').reduce((vmTotal, snap) => vmTotal + (snap.size / (1024 * 1024 * 1024)), 0)
                }, 0).toFixed(1)} GB
              </span>
            </div>
          </div>
        </div>

        {/* Create Snapshot Dialog - Same as original */}
        <Modal open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <ModalContent size="lg" className="max-h-[80vh] flex flex-col overflow-hidden">
            <ModalHeader>
              <ModalTitle className="flex items-center space-x-2">
                <Camera className="h-5 w-5 text-primary" />
                <span>Create New Snapshot</span>
              </ModalTitle>
            </ModalHeader>
            
            <div className="flex flex-col flex-1 min-h-0">
              <div className="flex-1 overflow-auto min-h-0">
                <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-semibold text-foreground">Select Virtual Machines</label>
                      <p className="text-xs text-muted-foreground mt-1">Choose which VMs to include in the snapshot</p>
                    </div>
                    {deployedVMs.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={toggleAllVMs}
                        className="text-xs"
                      >
                        {selectedVMs.length === deployedVMs.length ? 'Deselect All' : 'Select All'}
                      </Button>
                    )}
                  </div>
                  
                  {rangeLoading ? (
                    <div className="flex items-center justify-center py-12 border rounded-lg bg-muted/20">
                      <div className="text-center space-y-2">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto" />
                        <p className="text-sm text-muted-foreground">Loading virtual machines...</p>
                      </div>
                    </div>
                  ) : deployedVMs.length === 0 ? (
                    <div className="border rounded-lg p-8 text-center bg-muted/20">
                      <Server className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                      <h4 className="font-medium text-foreground mb-1">No Deployed VMs Found</h4>
                      <p className="text-sm text-muted-foreground">Deploy some virtual machines first to create snapshots</p>
                    </div>
                  ) : (
                    <div className="border rounded-lg bg-card">
                      <div className="p-3 border-b bg-muted/30">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{deployedVMs.length} VMs available</span>
                          <span>{selectedVMs.length} selected</span>
                        </div>
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        <div className="grid grid-cols-1 gap-0">
                          {deployedVMs.map((vm: ReconciledVM) => {
                            const vmName = vm.vmName
                            if (!vmName) return null
                            const isSelected = selectedVMs.includes(vmName)
                            return (
                              <label
                                key={vm.id}
                                className={`flex items-center space-x-3 cursor-pointer border-b last:border-b-0 p-3 transition-colors ${
                                  isSelected 
                                    ? 'bg-primary/5 hover:bg-primary/10' 
                                    : 'hover:bg-muted/50'
                                }`}
                              >
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={() => toggleVMSelection(vmName)}
                                />
                                <div className="flex items-center space-x-3 flex-1 min-w-0">
                                  <div className={`p-1.5 rounded-md ${
                                    vm.poweredOn 
                                      ? 'bg-green-100 dark:bg-green-900/30' 
                                      : 'bg-gray-100 dark:bg-gray-800'
                                  }`}>
                                    <Server className={`h-4 w-4 ${
                                      vm.poweredOn 
                                        ? 'text-green-600 dark:text-green-400' 
                                        : 'text-muted-foreground'
                                    }`} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-2">
                                      <span className="font-medium text-sm truncate">{vmName}</span>
                                      {vm.poweredOn && (
                                        <Badge variant="success" size="sm" className="text-xs">
                                          Running
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                      {vm.poweredOn ? 'VM is currently running' : 'VM is powered off'}
                                    </p>
                                  </div>
                                </div>
                              </label>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-semibold text-foreground">Snapshot Details</label>
                    <p className="text-xs text-muted-foreground mt-1">Provide a name and optional description</p>
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">Snapshot Name *</label>
                      <Input
                        placeholder="Enter a descriptive name..."
                        value={newSnapshotName}
                        onChange={(e) => setNewSnapshotName(e.target.value)}
                        className="bg-background"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">Description</label>
                      <Input
                        placeholder="Optional description of this snapshot..."
                        value={newSnapshotDescription}
                        onChange={(e) => setNewSnapshotDescription(e.target.value)}
                        className="bg-background"
                      />
                    </div>
                  </div>
                </div>
                
                {selectedVMs.length > 0 && (
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium text-primary">
                        {selectedVMs.length} VM{selectedVMs.length !== 1 ? 's' : ''} selected for snapshot
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {selectedVMs.map((vmName) => (
                        <Badge key={vmName} variant="secondary" size="sm" className="text-xs">
                          {vmName}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                </div>
              </div>
            </div>
            
            <ModalFooter>
              <Button 
                variant="outline" 
                onClick={() => setShowCreateDialog(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateSnapshot}
                disabled={!newSnapshotName.trim() || deployedVMs.length === 0 || createSnapshot.isPending}
              >
                {createSnapshot.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Camera className="h-4 w-4 mr-2" />
                    Create Snapshot
                  </>
                )}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </ModalContent>
    </Modal>
  )
}
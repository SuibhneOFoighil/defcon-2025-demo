"use client"

import NetworkTopologyViewer from "@/components/editor/network-topology-viewer"
import { useRangeAndTemplates } from "@/hooks/use-range-and-templates"
import { useRangeEditorData } from "@/hooks/use-range-editor-data"
import { use } from "react"

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default function EditorPage({ params }: PageProps) {
  const { id } = use(params)
  
  // Extract userID from composite ID (e.g., "SF-3" -> "SF")
  const userID = id.split('-')[0]
  
  // Get templates for the component sidebar
  const { templates, loading: templatesLoading, error: templatesError } = useRangeAndTemplates(userID)
  
  // Get unified editor data
  const { 
    data: editorData, 
    loading: editorLoading, 
    error: editorError
  } = useRangeEditorData(userID)
  
  // Combined error state
  const error = templatesError || editorError
  
  if (error) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-2">Failed to load range data</p>
          <p className="text-muted-foreground text-sm">{error}</p>
        </div>
      </div>
    )
  }
  
  // Show skeleton while loading
  if (editorLoading || templatesLoading || !editorData) {
    return (
      <div className="h-screen w-full">
        <NetworkTopologyViewer
          initialNodes={[]}
          initialEdges={[]}
          templates={templates}
          projectMetadata={{
            id: id,
            name: `Range ${id}`,
            status: 'Loading',
          }}
          rangeStats={{
            cpus: 0,
            ram: 0,
            disk: 0,
            vlans: [],
          }}
          loading={{
            templates: templatesLoading,
            rangeData: true,
            rangeConfig: true
          }}
        />
      </div>
    )
  }
  
  // Use data from the unified editor endpoint
  const nodes = editorData.nodes
  const edges = editorData.edges
  
  // Create project metadata
  const projectMetadata = {
    id: id,
    name: `${editorData.userID} Range ${editorData.rangeNumber}`,
    status: editorData.rangeState,
  }
  
  // Create range stats
  const rangeStats = {
    cpus: editorData.vms.reduce((sum, vm) => sum + (vm.cpus || 0), 0),
    ram: editorData.vms.reduce((sum, vm) => sum + (vm.ramGb || 0), 0),
    disk: editorData.vms.length * 50, // Estimate 50GB per VM
    vlans: editorData.topology.vlans.map(vlan => ({
      name: vlan.label,
      description: vlan.description || `${vlan.configuredVMs.length} configured VMs`
    })),
  }
  
  return (
    <div className="h-screen w-full">
      <NetworkTopologyViewer
        initialNodes={nodes}
        initialEdges={edges}
        templates={templates}
        projectMetadata={{
          ...projectMetadata,
          status: projectMetadata.status || 'unknown'
        }}
        rangeStats={rangeStats}
        currentRange={{
          userID: editorData.userID || 'unknown',
          rangeNumber: editorData.rangeNumber || 0,
          lastDeployment: new Date().toISOString(), // Add missing required property
          numberOfVMs: editorData.vms?.filter(vm => vm.isDeployed).length || 0, // Add missing required property
          rangeState: editorData.rangeState || 'unknown',
          testingEnabled: editorData.testingEnabled || false,
          allowedDomains: editorData.allowedDomains,
          VMs: (editorData.vms || []).filter(vm => vm.isDeployed).map((vm, index) => ({
            ID: index + 1, // Generate sequential ID
            proxmoxID: index + 100, // Generate mock proxmox ID
            rangeNumber: editorData.rangeNumber || 0,
            name: vm.vmName || vm.label,
            poweredOn: vm.poweredOn || false,
            ip: vm.ipAddress
          }))
        }}
        loading={{
          templates: false,
          rangeData: false,
          rangeConfig: false
        }}
      />
    </div>
  )
} 
"use client"

import NetworkTopologyViewer from "@/components/editor/network-topology-viewer"
import { useMockRangeAndTemplates } from "@/hooks/use-range-and-templates-mock"
import { useMockRangeEditorData } from "@/hooks/use-range-editor-data-mock"
import { mockRangeObject } from "@/lib/mocks/viewport-demo-data"
import { TutorialProvider, useTutorialContext } from "@/contexts/tutorial-context"
import { TutorialTooltip } from "@/components/tutorial/tutorial-tooltip"
import { rangeEditorTutorialSteps } from "@/lib/tutorial-steps"
import { useEffect } from "react"
import type { components } from '@/lib/api/ludus/schema'

/**
 * Root route - Viewport Demo for DEFCON 2025
 * 
 * This page demonstrates the Ludus range editor functionality using mock data
 * instead of connecting to the Ludus API. It's designed to work in an iframe
 * within the shell-n-slides project.
 */
function RootPageContent() {
  const userID = 'DEMO'
  
  // Use mock hooks that fetch from our mock API endpoints
  const { templates, loading: templatesLoading, error: templatesError } = useMockRangeAndTemplates(userID)
  const { 
    data: editorData, 
    loading: editorLoading, 
    error: editorError
  } = useMockRangeEditorData(userID)
  
  // Tutorial context
  const { startTutorial } = useTutorialContext()
  
  // Combined error state
  const error = templatesError || editorError
  const loading = templatesLoading || editorLoading
  
  // Auto-start tutorial when data is loaded
  useEffect(() => {
    if (!loading && !error && editorData && templates.length > 0) {
      // Start tutorial after a short delay to ensure DOM is ready
      const timer = setTimeout(() => {
        startTutorial()
      }, 1000)
      
      return () => clearTimeout(timer)
    }
  }, [loading, error, editorData, templates.length, startTutorial])

  if (error) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-2">Failed to load viewport demo data</p>
          <p className="text-muted-foreground text-sm">{error}</p>
        </div>
      </div>
    )
  }
  
  if (loading || !editorData) {
    return (
      <div className="h-screen w-full">
        <NetworkTopologyViewer
          initialNodes={[]}
          initialEdges={[]}
          templates={[]}
          projectMetadata={{
            id: 'DEMO-1',
            name: 'Demo Range 1',
            status: 'Loading',
          }}
          rangeStats={{
            cpus: 0,
            ram: 0,
            disk: 0,
            vlans: [],
          }}
          loading={{
            templates: true,
            rangeData: true,
            rangeConfig: true
          }}
        />
      </div>
    )
  }

  // Generate nodes and edges from the mock data
  // This mimics what the real editor-data endpoint does
  const nodes = editorData.nodes || []
  const edges = editorData.edges || []
  
  console.log('[VIEWPORT DEMO] Editor data loaded:', {
    nodesCount: nodes.length,
    edgesCount: edges.length,
    vmsCount: editorData.vms.length,
    nodeTypes: nodes.map(n => `${n.id}:${n.type}`)
  })
  
  console.log('[VIEWPORT DEMO] Router node details:', nodes.find(n => n.type === 'router'))
  console.log('[VIEWPORT DEMO] All nodes:', nodes)
  
  // Create project metadata
  const projectMetadata = {
    id: 'DEMO-1',
    name: `DEFCON 2025 Demo Range`,
    status: editorData.rangeState || 'SUCCESS',
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

  // Create current range object for the editor context
  const currentRange: components['schemas']['RangeObject'] = {
    ...mockRangeObject,
    userID: editorData.userID || 'DEMO',
    rangeNumber: editorData.rangeNumber || 1,
    rangeState: editorData.rangeState || 'SUCCESS',
    testingEnabled: editorData.testingEnabled || false,
    allowedDomains: editorData.allowedDomains || [],
    allowedIPs: editorData.allowedIPs || [],
    VMs: editorData.vms.filter(vm => vm.isDeployed).map((vm, index) => ({
      ID: index + 1,
      proxmoxID: vm.proxmoxId || (index + 100),
      rangeNumber: editorData.rangeNumber || 1,
      name: vm.vmName || vm.label,
      poweredOn: vm.poweredOn || false,
      ip: vm.ipAddress
    }))
  }

  return (
    <div className="h-screen w-full">
      
      <NetworkTopologyViewer
        initialNodes={nodes}
        initialEdges={edges}
        templates={templates}
        projectMetadata={projectMetadata}
        rangeStats={rangeStats}
        currentRange={currentRange}
        editorData={editorData} // Pass the mock editor data directly
        loading={{
          templates: false,
          rangeData: false,
          rangeConfig: false
        }}
      />
      
      {/* Tutorial Tooltip */}
      <TutorialTooltip steps={rangeEditorTutorialSteps} />
    </div>
  )
}

export default function RootPage() {
  return (
    <TutorialProvider steps={rangeEditorTutorialSteps}>
      <RootPageContent />
    </TutorialProvider>
  )
}

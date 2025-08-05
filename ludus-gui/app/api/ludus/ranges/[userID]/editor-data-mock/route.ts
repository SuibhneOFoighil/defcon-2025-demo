import { NextRequest, NextResponse } from 'next/server'
import { mockVMs, mockVLANs, mockNetworkRules, mockNetworkConfig, mockRouterConfig } from '@/lib/mocks/viewport-demo-data'
import type { RangeEditorData } from '@/lib/types/range-editor'

/**
 * Mock API route for range editor data
 * Used for viewport demo to work without Ludus backend
 * This endpoint creates data that matches what the real reconcileRangeData function would produce
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userID: string }> }
) {
  try {
    const { userID } = await params
    console.log('[MOCK API] editor-data-mock endpoint called for userID:', userID)
    
    // Simulate API delay for realistic behavior
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // Create mock editor data that matches the real reconcileRangeData output
    console.log('[MOCK API] Creating mock editor data...')
    const mockEditorData: RangeEditorData = {
      userID,
      rangeNumber: 1,
      rangeState: 'NOT DEPLOYED',
      testingEnabled: false,
      allowedDomains: ['example.com', 'google.com'],
      allowedIPs: ['8.8.8.8', '1.1.1.1'],
      
      // Network configuration
      network: mockNetworkConfig,
      
      // VM defaults
      defaults: {
        snapshot_with_RAM: true,
        stale_hours: 24,
        ad_domain_functional_level: 'Win2012R2',
        ad_forest_functional_level: 'Win2012R2',
        ad_domain_admin: 'Administrator',
        ad_domain_admin_password: 'P@ssw0rd123!',
        ad_domain_user: 'DemoUser',
        ad_domain_user_password: 'P@ssw0rd123!',
        ad_domain_safe_mode_password: 'P@ssw0rd123!',
        timezone: 'UTC',
        enable_dynamic_wallpaper: true
      },
      
      // Topology structure
      topology: {
        vlans: mockVLANs,
        networkRules: mockNetworkRules
      },
      
      // VM data
      vms: mockVMs,
      
      // Generate ReactFlow nodes (VLAN nodes + router node)
      nodes: [
        // VLAN nodes - match exact generateFlowData structure
        ...mockVLANs.map((vlan, index) => {
          const vlanVMs = mockVMs.filter(vm => vm.vlan === vlan.id)
          const nodeId = `vlan${vlan.id}`
          const position = { x: 200 + (index * 420), y: 200 }
          
          return {
            id: nodeId,
            type: 'vlan',
            position,
            style: { width: 380 },
            data: {
              label: vlan.label,
              vms: vlanVMs,
            }
          }
        }),
        // Router node - match exact generateFlowData structure
        {
          id: 'router',
          type: 'router',
          position: { x: 400, y: 50 },
          deletable: false,
          data: {
            // Spread all router data first (like generateFlowData does)
            ...mockRouterConfig,
            
            // Override with UI-specific fields (exactly like generateFlowData)
            label: 'Router',
            
            // Network defaults (these come from network config)
            inter_vlan_default: mockNetworkConfig.inter_vlan_default || 'REJECT',
            external_default: mockNetworkConfig.external_default || 'ACCEPT',
            
            // Runtime status (exactly like generateFlowData)
            status: mockRouterConfig.isDeployed ? (mockRouterConfig.poweredOn ? 'Running' : 'Stopped') : 'Not Deployed',
          }
        }
      ],
      
      // Generate ReactFlow edges from network rules - simplified for camera network
      edges: [
        {
          id: 'rule-0',
          source: 'router',
          target: 'vlan30',
          type: 'custom',
          data: {
            label: 'Camera Internet Access',
            status: {
              connectionType: 'accept',
              name: 'Camera Internet Access',
              protocol: 'tcp',
              ports: '80,443',
              action: 'ACCEPT'
            }
          }
        }
      ],
      
      // Legacy compatibility fields
      flowNodes: [], // Will be overwritten by nodes above
      flowEdges: [], // Will be overwritten by edges above
      
      // Metadata
      metadata: {
        hasConfig: true,
        hasDeployedVMs: true,
        configDeploymentMismatch: false,
        unmatchedVMs: [],
        missingVMs: []
      }
    }
    
    // Copy nodes/edges to legacy fields for compatibility
    mockEditorData.flowNodes = mockEditorData.nodes
    mockEditorData.flowEdges = mockEditorData.edges
    
    return NextResponse.json({ data: mockEditorData })
    
  } catch (error) {
    console.error('Error in mock editor-data endpoint:', error)
    return NextResponse.json(
      { error: 'Failed to fetch mock editor data' },
      { status: 500 }
    )
  }
}
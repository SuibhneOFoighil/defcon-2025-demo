import { useCallback } from "react"
import { toast } from "sonner"

interface UseRangeActionsProps {
  rangeId: string
  userID: string
  projectName: string
  testingMode: boolean
  onOpenLogs: () => void
  onSyncVMStates?: (vms: any[]) => void
  onUpdateRangeState?: (state: string) => void
  onUpdateProjectMetadata?: (metadata: any) => void
}

/**
 * Mock version of useRangeActions for viewport demo
 * Simulates range deployment and other actions without making API calls
 */
export function useMockRangeActions({ 
  rangeId, 
  userID, 
  projectName,
  testingMode,
  onOpenLogs,
  onSyncVMStates,
  onUpdateRangeState,
  onUpdateProjectMetadata
}: UseRangeActionsProps) {
  
  // Mock range deployment with 2-second loading
  const handleDeployRange = useCallback(async () => {
    console.log('[MOCK DEPLOY] Starting range deployment simulation for:', { rangeId, projectName })
    
    const toastId = toast.loading('Deploying range...', {
      description: `Starting deployment of ${projectName}`
    })
    
    // Simulate 2-second deployment
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Success toast
    toast.success('Range deployed successfully!', {
      id: toastId,
      description: `${projectName} is now ready to use`  
    })
    
    console.log('[MOCK DEPLOY] Range deployment completed successfully')
    
    // Update range state to SUCCESS
    if (onUpdateRangeState) {
      console.log('[MOCK DEPLOY] Updating range state to SUCCESS')
      onUpdateRangeState('SUCCESS')
    }
    
    // Update project metadata to show successful deployment
    if (onUpdateProjectMetadata) {
      console.log('[MOCK DEPLOY] Updating project metadata')
      onUpdateProjectMetadata({
        status: 'SUCCESS'
      })
    }
    
    // Trigger VM state sync to show all VMs as running
    if (onSyncVMStates) {
      // Mock deployed VMs data - all running
      // Use common VM names/labels that would match any VMs on canvas
      const mockDeployedVMs = [
        { name: 'Router', poweredOn: true },
        { name: 'Security Camera (camera01)', poweredOn: true },
        // Handle Kali VM if it was dragged onto canvas
        { name: 'kali-linux-2024-x64-template', poweredOn: true }
      ]
      console.log('[MOCK DEPLOY] Syncing VM states to Running:', mockDeployedVMs)
      onSyncVMStates(mockDeployedVMs)
    }
  }, [rangeId, projectName, onSyncVMStates, onUpdateRangeState, onUpdateProjectMetadata])

  // Mock other range actions (no-ops for demo)
  const handleAbortDeployment = useCallback(async () => {
    console.log('[MOCK] Abort deployment called (no-op for demo)')
    toast.info('Deployment aborted', { description: 'Demo mode - no actual deployment to abort' })
  }, [])

  const handleDestroyAllVMs = useCallback(async () => {
    console.log('[MOCK] Destroy all VMs called (no-op for demo)')
    toast.info('VMs destroyed', { description: 'Demo mode - no actual VMs to destroy' })
  }, [])

  const handlePowerOnAllVMs = useCallback(async () => {
    console.log('[MOCK] Power on all VMs called (no-op for demo)')
    toast.success('All VMs powered on', { description: 'Demo mode - simulated power on' })
  }, [])

  const handlePowerOffAllVMs = useCallback(async () => {
    console.log('[MOCK] Power off all VMs called (no-op for demo)')
    toast.info('All VMs powered off', { description: 'Demo mode - simulated power off' })
  }, [])

  const handleStartTesting = useCallback(async () => {
    console.log('[MOCK] Start testing called (no-op for demo)')
    toast.success('Testing mode started', { description: 'Demo mode - simulated testing' })
  }, [])

  const handleStopTesting = useCallback(async () => {
    console.log('[MOCK] Stop testing called (no-op for demo)')
    toast.info('Testing mode stopped', { description: 'Demo mode - simulated stop testing' })
  }, [])

  // Mock mutations (no-op objects that simulate loading states)
  const mockMutation = {
    mutate: () => {},
    isPending: false,
    isLoading: false,
    error: null,
    data: null,
    reset: () => {}
  }

  return {
    // Action handlers
    handleDeployRange,
    handleAbortDeployment,
    handleDestroyAllVMs,
    handlePowerOnAllVMs,
    handlePowerOffAllVMs,
    handleStartTesting,
    handleStopTesting,
    
    // Mock mutations
    deployRangeMutation: mockMutation,
    startTestingMutation: mockMutation,
    stopTestingMutation: mockMutation,
    abortDeploymentMutation: mockMutation,
    destroyRangeMutation: mockMutation,
    powerOnMutation: mockMutation,
    powerOffMutation: mockMutation,
  }
}
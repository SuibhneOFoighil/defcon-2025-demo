import { useCallback } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useNotifications } from "@/contexts/notification-context"
import { fetchRangeDetails } from "@/hooks/use-range-details"
import { dashboardQueryKeys } from "@/hooks/use-dashboard-data"
import { rangeEditorQueryKeys } from "@/hooks/use-range-editor-data"
import { logUserAction, logError } from "@/lib/logger"
import { extractApiErrorMessage } from "@/lib/utils/error-handling"
import { 
  deployRange, 
  startTesting, 
  stopTesting, 
  abortRangeDeployment, 
  destroyRange, 
  powerOnAllVMs, 
  powerOffAllVMs 
} from "@/lib/api/ludus/ranges"

interface UseRangeActionsProps {
  rangeId: string
  userID: string
  projectName: string
  testingMode: boolean
  onOpenLogs: () => void
  onSyncVMStates?: (vms: any[]) => void
}

export function useRangeActions({ 
  rangeId, 
  userID, 
  projectName,
  testingMode,
  onOpenLogs,
  onSyncVMStates
}: UseRangeActionsProps) {
  const queryClient = useQueryClient()
  const notifications = useNotifications()

  // Range deployment mutation
  const deployRangeMutation = useMutation({
    mutationFn: deployRange,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['range-info', rangeId],
      })
      logUserAction('range-deploy', 'RangeActions', { rangeId, projectName })
    },
    onError: (error: Error) => {
      logError(error, 'Range Deployment', { rangeId, projectName })
    },
  })

  // Testing mutations
  const startTestingMutation = useMutation({
    mutationFn: startTesting,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['range-info', rangeId],
      })
      logUserAction('testing-start', 'RangeActions', { rangeId, projectName })
    },
    onError: (error: Error) => {
      logError(error, 'Testing Start', { rangeId, projectName })
    },
  })

  const stopTestingMutation = useMutation({
    mutationFn: stopTesting,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['range-info', rangeId],
      })
      logUserAction('testing-stop', 'RangeActions', { rangeId, projectName })
    },
    onError: (error: Error) => {
      logError(error, 'Testing Stop', { rangeId, projectName })
    },
  })

  // Abort deployment mutation
  const abortDeploymentMutation = useMutation({
    mutationFn: abortRangeDeployment,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['range-info', rangeId],
      })
      toast.info('Range deployment aborted')
      logUserAction('range-abort', 'RangeActions', { rangeId, projectName })
    },
    onError: (error: Error) => {
      logError(error, 'Range Abort', { rangeId, projectName })
      toast.error('Failed to abort deployment', {
        description: extractApiErrorMessage(error)
      })
    },
  })

  // Destroy range mutation
  const destroyRangeMutation = useMutation({
    mutationFn: destroyRange,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['range-info', rangeId],
      })
      queryClient.invalidateQueries({
        queryKey: dashboardQueryKeys.ranges(),
      })
      logUserAction('range-destroy', 'RangeActions', { rangeId, projectName })
    },
    onError: (error: Error) => {
      logError(error, 'Range Destruction', { rangeId, projectName })
    },
  })

  // Power control mutations
  const powerOnMutation = useMutation({
    mutationFn: powerOnAllVMs,
  })

  const powerOffMutation = useMutation({
    mutationFn: powerOffAllVMs,
  })

  // Handle range deployment with polling
  const handleDeployRange = useCallback(async () => {
    // First, destroy the range
    const destroyToastId = toast.loading("Destroying existing range before deployment...");
    let deployToastId: string | number | undefined;

    try {
      await destroyRangeMutation.mutateAsync({ userID });

      // Wait for destruction to complete
      await new Promise<void>((resolve, reject) => {
        const checkDestroyStatus = async () => {
          try {
            const rangeData = await fetchRangeDetails(userID);
            
            // If rangeData is null/undefined or status is DESTROYED/NEVER DEPLOYED, destruction is complete
            if (!rangeData || 
                rangeData.rangeState?.toUpperCase() === 'DESTROYED' || 
                rangeData.rangeState?.toUpperCase() === 'NEVER DEPLOYED') {
              toast.success("Range destroyed successfully!", { id: destroyToastId });
              resolve();
              return;
            } else if (rangeData.rangeState?.toUpperCase() === 'FAILURE' || 
                       rangeData.rangeState?.toUpperCase() === 'ERROR') {
              const errorMsg = `Destruction failed with status: ${rangeData.rangeState}`;
              toast.error("Failed to destroy range.", { id: destroyToastId, description: errorMsg });
              reject(new Error(errorMsg));
              return;
            }
            // Continue polling
            setTimeout(checkDestroyStatus, 2000);
          } catch (pollError) {
            setTimeout(checkDestroyStatus, 2000); // Retry polling on error
          }
        };
        
        setTimeout(checkDestroyStatus, 1000);
      });

      // Now proceed with deployment
      deployToastId = toast.loading("Starting fresh range deployment...");

      await deployRangeMutation.mutateAsync({
        tags: 'all',
        force: testingMode,
        userID: userID,
      });

      // Polling logic for deployment completion
      const checkDeploymentStatus = async () => {
        try {
          const rangeData = await fetchRangeDetails(userID);
          const status = rangeData?.rangeState?.toUpperCase();

          if (status === 'SUCCESS' || status === 'ACTIVE') {
            toast.success("Range deployed successfully!", { id: deployToastId });
            notifications.notifyDeploymentSuccess(projectName, rangeId);
            
            // Invalidate queries to refresh canvas data
            queryClient.invalidateQueries({ queryKey: ['range-info', rangeId] });
            queryClient.invalidateQueries({ queryKey: rangeEditorQueryKeys.byUser(userID) });
            queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.ranges() });
            
            return; // Stop polling
          } else if (status === 'FAILURE' || status === 'ERROR') {
            const errorMsg = `Deployment failed with status: ${status}`;
            toast.error("Deployment failed.", { id: deployToastId, description: errorMsg });
            notifications.notifyDeploymentFailure(projectName, rangeId, errorMsg);
            
            // Force immediate query refetch to update UI state
            await queryClient.refetchQueries({ queryKey: ['range-info', rangeId] });
            queryClient.invalidateQueries({ queryKey: rangeEditorQueryKeys.byUser(userID) });
            queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.ranges() });
            
            return; // Stop polling
          }
          // Continue polling
          setTimeout(checkDeploymentStatus, 5000);
        } catch (pollError) {
          setTimeout(checkDeploymentStatus, 5000); // Retry polling on error
        }
      };
      setTimeout(checkDeploymentStatus, 2000);
    } catch (error) {
      const errorMessage = extractApiErrorMessage(error, 'An unknown error occurred.');
      const toastId = deployToastId || destroyToastId;
      toast.error("Failed to complete deployment process.", { id: toastId, description: errorMessage });
      notifications.notifyDeploymentFailure(projectName, rangeId, errorMessage);
    }
  }, [rangeId, testingMode, userID, projectName, deployRangeMutation, destroyRangeMutation, notifications])

  // Handle abort deployment
  const handleAbortDeployment = useCallback(() => {
    logUserAction('range-abort-click', 'RangeActions', { rangeId, userID })
    abortDeploymentMutation.mutate({ userID })
  }, [userID, abortDeploymentMutation])

  // Handle destroy all VMs with polling
  const handleDestroyAllVMs = useCallback(async () => {
    const toastId = toast.loading("Destroying range...");

    try {
      await destroyRangeMutation.mutateAsync({ userID });

      // Polling logic for completion
      const checkDestroyStatus = async () => {
        try {
          const rangeData = await fetchRangeDetails(userID);
          
          // If rangeData is null/undefined, it likely means the range was destroyed
          if (!rangeData) {
            toast.success("Range destroyed successfully!", { id: toastId });
            notifications.notifyDestroyComplete(projectName, rangeId);
            
            // Invalidate queries to refresh canvas data
            queryClient.invalidateQueries({ queryKey: ['range-info', rangeId] });
            queryClient.invalidateQueries({ queryKey: rangeEditorQueryKeys.byUser(userID) });
            queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.ranges() });
            
            return; // Stop polling
          }

          const status = rangeData.rangeState?.toUpperCase();
          
          if (status === 'DESTROYED' || status === 'NEVER DEPLOYED') {
            toast.success("Range destroyed successfully!", { id: toastId });
            notifications.notifyDestroyComplete(projectName, rangeId);
            
            // Invalidate queries to refresh canvas data
            queryClient.invalidateQueries({ queryKey: ['range-info', rangeId] });
            queryClient.invalidateQueries({ queryKey: rangeEditorQueryKeys.byUser(userID) });
            queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.ranges() });
            
            return; // Stop polling
          } else if (status === 'FAILURE' || status === 'ERROR') {
            const errorMsg = `Destruction failed with status: ${status}`;
            toast.error("Destruction failed.", { id: toastId, description: errorMsg });
            notifications.notifyDestroyFailed(projectName, rangeId, errorMsg);
            return; // Stop polling
          }

          // Update toast to show progress
          toast.loading("Destroying range...", { id: toastId });
          
          // Continue polling
          setTimeout(checkDestroyStatus, 3000);
        } catch (pollError) {
          setTimeout(checkDestroyStatus, 3000); // Retry polling on error
        }
      };
      
      setTimeout(checkDestroyStatus, 2000);
    } catch (error) {
      const errorMessage = extractApiErrorMessage(error, 'An unknown error occurred.');
      toast.error("Failed to start destroy operation.", { id: toastId, description: errorMessage });
      notifications.notifyDestroyFailed(projectName, rangeId, errorMessage);
    }
  }, [projectName, userID, rangeId, destroyRangeMutation, notifications, queryClient])

  // Handle power on all VMs with polling
  const handlePowerOnAllVMs = useCallback(async () => {
    const toastId = toast.loading("Powering on all VMs...");

    try {
      await powerOnMutation.mutateAsync({ userID });

      // Polling logic for completion
      const checkPowerStatus = async () => {
        try {
          const rangeData = await fetchRangeDetails(userID);
          const vms = rangeData?.VMs || [];
          
          if (vms.length === 0) {
            toast.success("Power on operation completed.", { id: toastId });
            notifications.notifyPowerOnComplete(projectName, rangeId);
            return; // Stop polling
          }

          const poweredOnVMs = vms.filter((vm: { poweredOn?: boolean }) => vm.poweredOn === true);
          const allVMsPoweredOn = poweredOnVMs.length === vms.length;

          if (allVMsPoweredOn) {
            onSyncVMStates?.(vms); // Update UI with actual VM states
            toast.success("All VMs powered on successfully!", { id: toastId });
            notifications.notifyPowerOnComplete(projectName, rangeId);
            
            // Invalidate queries to refresh canvas data
            queryClient.invalidateQueries({ queryKey: ['range-info', rangeId] });
            queryClient.invalidateQueries({ queryKey: rangeEditorQueryKeys.byUser(userID) });
            queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.ranges() });
            
            return; // Stop polling
          }

          // Update toast with progress
          toast.loading(`Powering on VMs... (${poweredOnVMs.length}/${vms.length})`, { id: toastId });
          
          // Continue polling
          setTimeout(checkPowerStatus, 3000);
        } catch (pollError) {
          setTimeout(checkPowerStatus, 3000); // Retry polling on error
        }
      };
      
      setTimeout(checkPowerStatus, 2000);
    } catch (error) {
      const errorMessage = extractApiErrorMessage(error, 'An unknown error occurred.');
      toast.error("Failed to start power on operation.", { id: toastId, description: errorMessage });
      notifications.notifyPowerOnFailed(projectName, rangeId, errorMessage);
    }
  }, [projectName, userID, rangeId, powerOnMutation, notifications, onSyncVMStates])

  // Handle power off all VMs with polling
  const handlePowerOffAllVMs = useCallback(async () => {
    const toastId = toast.loading("Powering off all VMs...");

    try {
      await powerOffMutation.mutateAsync({ userID });

      // Polling logic for completion
      const checkPowerStatus = async () => {
        try {
          const rangeData = await fetchRangeDetails(userID);
          const vms = rangeData?.VMs || [];
          
          if (vms.length === 0) {
            toast.success("Power off operation completed.", { id: toastId });
            notifications.notifyPowerOffComplete(projectName, rangeId);
            return; // Stop polling
          }

          const poweredOffVMs = vms.filter((vm: { poweredOn?: boolean }) => vm.poweredOn === false);
          const allVMsPoweredOff = poweredOffVMs.length === vms.length;

          if (allVMsPoweredOff) {
            onSyncVMStates?.(vms); // Update UI with actual VM states
            toast.success("All VMs powered off successfully!", { id: toastId });
            notifications.notifyPowerOffComplete(projectName, rangeId);
            
            // Invalidate queries to refresh canvas data
            queryClient.invalidateQueries({ queryKey: ['range-info', rangeId] });
            queryClient.invalidateQueries({ queryKey: rangeEditorQueryKeys.byUser(userID) });
            queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.ranges() });
            
            return; // Stop polling
          }

          // Update toast with progress
          toast.loading(`Powering off VMs... (${poweredOffVMs.length}/${vms.length})`, { id: toastId });
          
          // Continue polling
          setTimeout(checkPowerStatus, 3000);
        } catch (pollError) {
          setTimeout(checkPowerStatus, 3000); // Retry polling on error
        }
      };
      
      setTimeout(checkPowerStatus, 2000);
    } catch (error) {
      const errorMessage = extractApiErrorMessage(error, 'An unknown error occurred.');
      toast.error("Failed to start power off operation.", { id: toastId, description: errorMessage });
      notifications.notifyPowerOffFailed(projectName, rangeId, errorMessage);
    }
  }, [projectName, userID, rangeId, powerOffMutation, notifications, onSyncVMStates])

  // Handle start testing with polling
  const handleStartTesting = useCallback(async () => {
    const toastId = toast.loading("Starting testing mode...");

    try {
      await startTestingMutation.mutateAsync({ userID });

      // Polling logic for completion
      const checkTestingStatus = async () => {
        try {
          const rangeData = await fetchRangeDetails(userID);
          const testingEnabled = rangeData?.testingEnabled;

          if (testingEnabled === true) {
            toast.success("Testing mode started successfully!", { id: toastId });
            notifications.notifyTestingStarted(projectName, rangeId);
            
            // Invalidate all relevant queries to refresh UI
            queryClient.invalidateQueries({ queryKey: ['range-info', rangeId] });
            queryClient.invalidateQueries({ queryKey: rangeEditorQueryKeys.byUser(userID) });
            queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.ranges() });
            
            return; // Stop polling
          }
          
          // Continue polling
          setTimeout(checkTestingStatus, 3000);
        } catch (pollError) {
          setTimeout(checkTestingStatus, 3000); // Retry polling on error
        }
      };

      setTimeout(checkTestingStatus, 2000);
    } catch (error) {
      const errorMessage = extractApiErrorMessage(error, 'An unknown error occurred.');
      toast.error("Failed to start testing mode.", { id: toastId, description: errorMessage });
      notifications.notifyTestingStartFailed(projectName, rangeId, errorMessage);
    }
  }, [rangeId, userID, projectName, startTestingMutation, notifications, queryClient])

  // Handle stop testing with polling
  const handleStopTesting = useCallback(async () => {
    const toastId = toast.loading("Stopping testing mode...");

    try {
      await stopTestingMutation.mutateAsync({ userID });

      // Polling logic for completion
      const checkTestingStatus = async () => {
        try {
          const rangeData = await fetchRangeDetails(userID);
          const testingEnabled = rangeData?.testingEnabled;

          if (testingEnabled === false) {
            toast.success("Testing mode stopped successfully!", { id: toastId });
            notifications.notifyTestingStopped(projectName, rangeId);
            
            // Invalidate all relevant queries to refresh UI
            queryClient.invalidateQueries({ queryKey: ['range-info', rangeId] });
            queryClient.invalidateQueries({ queryKey: rangeEditorQueryKeys.byUser(userID) });
            queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.ranges() });
            
            return; // Stop polling
          }
          
          // Continue polling
          setTimeout(checkTestingStatus, 3000);
        } catch (pollError) {
          setTimeout(checkTestingStatus, 3000); // Retry polling on error
        }
      };

      setTimeout(checkTestingStatus, 2000);
    } catch (error) {
      const errorMessage = extractApiErrorMessage(error, 'An unknown error occurred.');
      toast.error("Failed to stop testing mode.", { id: toastId, description: errorMessage });
      notifications.notifyTestingStopFailed(projectName, rangeId, errorMessage);
    }
  }, [rangeId, userID, projectName, stopTestingMutation, notifications, queryClient])

  return {
    // Mutations
    deployRangeMutation,
    startTestingMutation,
    stopTestingMutation,
    abortDeploymentMutation,
    destroyRangeMutation,
    powerOnMutation,
    powerOffMutation,
    // Action handlers
    handleDeployRange,
    handleAbortDeployment,
    handleDestroyAllVMs,
    handlePowerOnAllVMs,
    handlePowerOffAllVMs,
    handleStartTesting,
    handleStopTesting,
  }
}
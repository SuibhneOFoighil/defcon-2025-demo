import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { saveRangeConfiguration } from '@/lib/api/ludus/ranges'
import { generateYAMLFromCanvas } from '@/lib/utils/range-config-generator'
// Toast notifications handled by UI layer
import type { Node, Edge } from '@xyflow/react'
import type { NodeData } from '@/lib/types'
import type { RangeConfig } from '@/lib/types/range-config'
import { rangeEditorQueryKeys } from '@/hooks/use-range-editor-data'
import { utilLogger, devLog } from '@/lib/logger'

interface UseSaveRangeConfigOptions {
  userID?: string
  rangeId?: string
  networkConfig?: RangeConfig['network']
  currentDefaults?: RangeConfig['defaults']
  onSuccess?: () => void
  onError?: (error: Error) => void
}

export function useSaveRangeConfig({
  userID,
  rangeId,
  networkConfig,
  currentDefaults,
  onSuccess,
  onError,
}: UseSaveRangeConfigOptions = {}) {
  const queryClient = useQueryClient()

  const saveConfigMutation = useMutation({
    mutationFn: async ({
      nodes,
      edges,
      force = false,
      networkConfig,
      defaultsConfig,
    }: {
      nodes: Node<NodeData>[]
      edges: Edge[]
      force?: boolean
      networkConfig?: RangeConfig['network']
      defaultsConfig?: RangeConfig['defaults']
    }) => {
      devLog.separator('Range Config Save Started');
      
      const saveMetadata = {
        nodesCount: nodes.length,
        edgesCount: edges.length,
        vlanNodes: nodes.filter(n => n.type === 'vlan').map(n => ({
          id: n.id,
          vms: n.data.vms?.length || 0
        }))
      };
      
      utilLogger.info(saveMetadata, '[Save Config] Starting save');
      devLog.object('Save Config - Network Config', networkConfig, { source: 'network-settings' });
      devLog.object('Save Config - Defaults Config', defaultsConfig, { source: 'vm-defaults' });
      
      // Generate YAML from current canvas state
      const yamlContent = generateYAMLFromCanvas(nodes, edges, { 
        network: networkConfig,
        defaults: defaultsConfig 
      })

      devLog.yaml('Generated Range Config', yamlContent, { 
        source: 'canvas-conversion',
        timestamp: new Date().toISOString()
      });
      
      // Save to backend
      return saveRangeConfiguration({
        yamlContent,
        force,
        userID,
      })
    },
    onSuccess: (data) => {
      devLog.success('Range configuration saved successfully');
      
      // Invalidate related queries to refetch fresh data
      if (userID) {
        queryClient.invalidateQueries({ queryKey: ['range-config', userID] })
        queryClient.invalidateQueries({ queryKey: ['range-editor-data', userID] })
        queryClient.invalidateQueries({ queryKey: ['range-info', rangeId] })
        // Invalidate the range editor data to ensure fresh data on next fetch
        queryClient.invalidateQueries({ queryKey: rangeEditorQueryKeys.byUser(userID) })
      }
      
      utilLogger.info({ userID, rangeId, success: true }, '[Save Config] Configuration saved successfully');
      
      // Success toast handled by UI layer
      onSuccess?.()
    },
    onError: (error: Error) => {
      devLog.error('Failed to save range configuration: ' + error.message);
      utilLogger.error('Mutation onError callback triggered:', {
        error,
        errorMessage: error.message,
        errorType: typeof error
      })
      // Error toast handled by UI layer
      onError?.(error)
    },
  })

  const saveConfig = async (
    nodes: Node<NodeData>[], 
    edges: Edge[], 
    options: { force?: boolean; networkConfig?: RangeConfig['network']; defaultsConfig?: RangeConfig['defaults'] } = {}
  ) => {
    // Use provided overrides or fall back to context state
    const finalNetworkConfig = options.networkConfig ?? networkConfig
    const finalDefaultsConfig = options.defaultsConfig ?? currentDefaults
    const force = options.force ?? false
    
    utilLogger.info('saveConfig: About to call mutateAsync', {
      nodesCount: nodes.length,
      edgesCount: edges.length,
      force,
      hasNetworkConfig: !!finalNetworkConfig,
      hasDefaultsConfig: !!finalDefaultsConfig
    })
    
    utilLogger.info('saveConfig: About to await mutateAsync...')
    const result = await saveConfigMutation.mutateAsync({ 
      nodes, 
      edges, 
      force, 
      networkConfig: finalNetworkConfig, 
      defaultsConfig: finalDefaultsConfig 
    })
    utilLogger.info('saveConfig: mutateAsync completed successfully:', {
      type: typeof result,
      result
    })
    
    return result
  }
  
  // Add dependencies to ensure saveConfig updates when context state changes
  const memoizedSaveConfig = useCallback(saveConfig, [saveConfigMutation.mutateAsync, networkConfig, currentDefaults])

  return {
    saveConfig: memoizedSaveConfig,
    isSaving: saveConfigMutation.isPending,
    saveError: saveConfigMutation.error,
    isSuccess: saveConfigMutation.isSuccess,
  }
}
import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { logUserAction, logError } from '@/lib/logger'
import { extractApiErrorMessage } from '@/lib/utils/error-handling'
import { componentLogger } from '@/lib/logger'
import type { VMData } from '@/lib/types'

interface VMToDelete {
  id: string
  name: string
  vlanId: string
}

interface UseVMDeleteModalProps {
  onDeleteVM: (vmId: string, vlanId: string) => Promise<void>
  nodes: Array<{ id: string; data: { vms?: VMData[] } }>
}

export function useVMDeleteModal({ onDeleteVM, nodes }: UseVMDeleteModalProps) {
  const [vmToDelete, setVmToDelete] = useState<VMToDelete | null>(null)

  const showDeleteModal = useCallback(async (vmId: string, vlanId: string): Promise<void> => {
    // Find VM details for modal
    const vlanNode = nodes.find(node => node.id === vlanId)
    if (vlanNode) {
      const vm = vlanNode.data.vms?.find(v => v.id === vmId)
      if (vm) {
        setVmToDelete({
          id: vmId,
          name: vm.vmName || vm.label || 'Unknown VM',
          vlanId: vlanId
        })
      }
    }
  }, [nodes])

  const hideDeleteModal = useCallback(() => {
    setVmToDelete(null)
  }, [])

  const confirmDelete = useCallback(async () => {
    if (vmToDelete && onDeleteVM) {
      logUserAction('vm-delete-confirm', 'VMDeleteModal', { 
        vmId: vmToDelete.id, 
        vlanId: vmToDelete.vlanId, 
        vmName: vmToDelete.name 
      })
      
      try {
        // Await the deletion operation
        await onDeleteVM(vmToDelete.id, vmToDelete.vlanId)
        
        // Show success toast only after completion
        toast.success(`VM "${vmToDelete.name}" has been removed from the VLAN`, {
          description: 'The configuration has been updated automatically.'
        })
        
        setVmToDelete(null)
      } catch (error) {
        logError(error as Error, 'VM Deletion', { 
          vmId: vmToDelete.id, 
          vmName: vmToDelete.name, 
          vlanId: vmToDelete.vlanId 
        })
        toast.error(`Failed to delete VM "${vmToDelete.name}"`, {
          description: extractApiErrorMessage(error, 'Failed to delete VM')
        })
      }
    } else {
      componentLogger.error({ 
        hasVmToDelete: !!vmToDelete, 
        hasOnDeleteVM: !!onDeleteVM 
      }, 'Cannot delete VM - missing required data or handler')
      toast.error('Cannot delete VM', {
        description: 'VM deletion function is not available.'
      })
    }
  }, [vmToDelete, onDeleteVM])

  return {
    vmToDelete,
    showDeleteModal,
    hideDeleteModal,
    confirmDelete,
    isModalOpen: !!vmToDelete
  }
}
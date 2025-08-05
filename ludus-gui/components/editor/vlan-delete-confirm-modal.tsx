"use client"

import type { Node } from "@xyflow/react"
import { ConfirmModal } from "@/components/ui/modal/confirm-modal"
import type { NodeData } from "@/lib/types"

export interface VlanDeleteConfirmModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  vlanNode: Node<NodeData>
  loading?: boolean
}

export function VlanDeleteConfirmModal({
  open,
  onClose,
  onConfirm,
  vlanNode,
  loading = false,
}: VlanDeleteConfirmModalProps) {
  const vlanData = vlanNode.data
  const vmCount = vlanData.vms?.length || 0
  const vlanName = vlanData.label || `VLAN ${vlanNode.id}`

  const description = (
    <div className="space-y-2">
      <p>
        Are you sure you want to delete <strong>{vlanName}</strong>?
      </p>
      {vmCount > 0 && (
        <p className="text-sm text-muted-foreground">
          This will also remove {vmCount} VM{vmCount !== 1 ? 's' : ''} from this VLAN.
        </p>
      )}
      <p className="text-sm text-muted-foreground">
        This action cannot be undone.
      </p>
    </div>
  )

  return (
    <ConfirmModal
      open={open}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Delete VLAN"
      description={description}
      confirmLabel="Delete VLAN"
      cancelLabel="Cancel"
      loading={loading}
      confirmVariant="destructive"
    />
  )
}
"use client"

import { ConfirmModal } from "@/components/ui/modal/confirm-modal"

interface DestroyVMsModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  rangeName: string
  vmCount?: number
  isDestroying?: boolean
}

export function DestroyVMsModal({
  isOpen,
  onClose,
  onConfirm,
  rangeName,
  vmCount = 0,
  isDestroying = false,
}: DestroyVMsModalProps) {
  const description = (
    <div className="space-y-2">
      <p>
        Are you sure you want to destroy the VMs in the range <strong>{rangeName}</strong>?
      </p>
      {vmCount > 0 && (
        <p className="text-sm text-muted-foreground">
          This will permanently delete {vmCount} virtual machine{vmCount !== 1 ? 's' : ''}.
        </p>
      )}
    </div>
  )

  return (
    <ConfirmModal
      open={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Destroy VMs"
      description={description}
      confirmLabel="Destroy VMs"
      confirmVariant="destructive"
      loading={isDestroying}
    />
  )
}
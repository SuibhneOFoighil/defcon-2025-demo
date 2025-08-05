"use client"

import { ConfirmModal } from "@/components/ui/modal/confirm-modal"

interface SharePasswordModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  userName: string
}

export function SharePasswordModal({ isOpen, onClose, onConfirm, userName }: SharePasswordModalProps) {
  return (
    <ConfirmModal
      open={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={`Share Password with ${userName}`}
      description={
        <span>
          This will generate a temporary password and send it to the user&apos;s email address. The user will be required to change their password on next login.
        </span>
      }
      confirmLabel="Share Password"
      cancelLabel="Cancel"
      confirmVariant="default"
    />
  )
}

"use client"

import { ConfirmModal } from "@/components/ui/modal/confirm-modal"

interface LogoutModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export function LogoutModal({ isOpen, onClose, onConfirm }: LogoutModalProps) {
  return (
    <ConfirmModal
      open={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Log Out"
      description="Are you sure you want to log out?"
      confirmLabel="Log Out"
      confirmVariant="destructive"
    />
  )
}

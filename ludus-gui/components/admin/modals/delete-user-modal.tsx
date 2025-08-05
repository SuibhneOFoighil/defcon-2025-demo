"use client"

import { ConfirmModal } from "@/components/ui/modal/confirm-modal"

interface DeleteUserModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  userName: string
}

export function DeleteUserModal({ isOpen, onClose, onConfirm, userName }: DeleteUserModalProps) {
  return (
    <ConfirmModal
      open={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Delete User"
      description={`Are you sure you want to delete the user "${userName}"? This action cannot be undone.`}
      confirmLabel="Delete"
      confirmVariant="destructive"
    />
  )
}

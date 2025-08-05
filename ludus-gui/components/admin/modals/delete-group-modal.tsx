"use client"

import { useState } from "react"
import { ConfirmModal } from "@/components/ui/modal/confirm-modal"
import { deleteGroup } from "@/lib/api/ludus/groups"
import { useAdminData } from "@/hooks/use-admin-data"
import type { Group } from "@/lib/types/admin"

interface DeleteGroupModalProps {
  isOpen: boolean
  onClose: () => void
  group: Group | null
  onSuccess?: () => void
}

export function DeleteGroupModal({ isOpen, onClose, group, onSuccess }: DeleteGroupModalProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { invalidateGroups } = useAdminData()

  const handleDelete = async () => {
    if (!group) return

    setIsDeleting(true)
    setError(null)

    try {
      await deleteGroup(group.id)
      await invalidateGroups()
      onClose()
      onSuccess?.()
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("Failed to delete group. Please try again.")
      }
      setIsDeleting(false)
    }
  }

  return (
    <ConfirmModal
      open={isOpen}
      onClose={onClose}
      onConfirm={handleDelete}
      title="Delete Group"
      description={
        <>
          Are you sure you want to delete the group &ldquo;{group?.name}&rdquo;? This action cannot be undone.
          {error && (
            <div className="mt-4 text-sm text-destructive">
              {error}
            </div>
          )}
        </>
      }
      confirmLabel={isDeleting ? "Deleting..." : "Delete"}
      confirmVariant="destructive"
      loading={isDeleting}
    />
  )
}

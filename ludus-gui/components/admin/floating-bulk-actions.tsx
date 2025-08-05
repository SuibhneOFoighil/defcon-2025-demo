"use client"

import type { User } from "@/lib/types/admin"
import { UserBulkActions } from "./user-bulk-actions"
import { FloatingActionBar } from "@/components/ui/floating-action-bar"

interface FloatingBulkActionsProps {
  selectedUsers: User[]
  onClearSelection: () => void
}

export function FloatingBulkActions({ selectedUsers, onClearSelection }: FloatingBulkActionsProps) {
  const hasSelectedUsers = selectedUsers.length > 0

  return (
    <FloatingActionBar isActive={hasSelectedUsers}>
      <UserBulkActions selectedUsers={selectedUsers} onDeselectAll={onClearSelection} />
    </FloatingActionBar>
  )
}

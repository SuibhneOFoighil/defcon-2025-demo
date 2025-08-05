"use client"

import type { Group, User } from "@/lib/types/admin"
import { MultiSelectModal, type MultiSelectItem } from "@/components/ui/modal/multi-select-modal"

interface AddUsersToGroupModalProps {
  open: boolean
  onClose: () => void
  onConfirm: (selectedUserIds: string[]) => void
  targetGroups: Pick<Group, 'id' | 'name'>[]
  availableUsers?: User[]
}

export function AddUsersToGroupModal({
  open,
  onClose,
  onConfirm,
  targetGroups = [],
  availableUsers = [],
}: AddUsersToGroupModalProps) {


  const handleConfirmSelection = (selectedUserIds: string[]) => {
    onConfirm(selectedUserIds)
    onClose() 
  }

  const groupNames = targetGroups.map(g => g.name).join(", ")
  const title = targetGroups.length > 1 ? `Add Users to Groups` : `Add Users to ${targetGroups[0]?.name || 'Group'}`;
  const description = targetGroups.length > 0 
    ? `Select users to add to ${groupNames}.` 
    : "Select users to add to the selected group(s)."

  const userItems: MultiSelectItem[] = availableUsers.map(user => ({
    id: user.id,
    label: user.name || 'Unnamed User',
    details: user.userID, // Use userID instead of email
    avatarUrl: undefined, // No avatarUrl in admin User type
    avatarFallback: user.name?.substring(0,2).toUpperCase() || "U",
  }))

  return (
    <MultiSelectModal
      open={open}
      onClose={onClose}
      onConfirm={handleConfirmSelection}
      title={title}
      description={description}
      items={userItems}
      confirmButtonText="Add Selected Users"
      emptyStateText="No users available to add."
      modalSize="md"
    />
  )
} 
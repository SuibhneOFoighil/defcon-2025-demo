"use client"

// import { useState } from "react" // No longer needed
// import { Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter } from "@/components/ui/modal/modal"
// import { FormCheckbox } from "@/components/ui/form/form-checkbox"
import { toast } from "sonner"
// import { Button } from "@/components/ui/button"
// import { ScrollArea } from "@/components/ui/scroll-area"
import { MultiSelectModal, type MultiSelectItem } from "@/components/ui/modal/multi-select-modal"


interface ModalGroup { // This can be removed if MultiSelectItem is used directly for the prop
  id: string
  name: string
}

interface AddToGroupModalProps {
  open: boolean
  onClose: () => void
  onConfirm: (selectedGroupIds: string[]) => void // Renamed for clarity from selectedGroups
  selectedUsers?: string[] // To be used in title/toast
  availableGroups?: ModalGroup[] // Groups to select from
}

export function AddToGroupModal({
  open,
  onClose,
  onConfirm,
  selectedUsers = [],
  availableGroups = [],
}: AddToGroupModalProps) {

  const handleConfirmSelection = (selectedGroupIds: string[]) => {
    onConfirm(selectedGroupIds) // Call the original onConfirm
    // Toast logic remains here for now, as MultiSelectModal is generic.
    // Ideally, the component invoking onConfirm would handle success/failure toasts.
    if (selectedGroupIds.length > 0 && selectedUsers.length > 0) {
        toast.success("Users added to groups", {
            description: `${selectedUsers.length} user${selectedUsers.length === 1 ? '' : 's'} ha${selectedUsers.length === 1 ? 's' : 've'} been added to ${selectedGroupIds.length} group${selectedGroupIds.length === 1 ? '' : 's'}.`,
        })
    }
    onClose() // Close the modal
  }

  // Use availableGroups directly, MultiSelectModal handles empty state.
  const groupItems: MultiSelectItem[] = availableGroups.map(group => ({
    id: group.id,
    label: group.name,
    // No details or avatar for groups in this context, but MultiSelectItem supports them
  }))

  const userText = selectedUsers.length === 1 ? "user" : "users"
  const title = `Add selected ${userText} to groups`
  const description = "Choose the group(s) to add the selected user(s) to."

  return (
    <MultiSelectModal
      open={open}
      onClose={onClose}
      onConfirm={handleConfirmSelection}
      title={title}
      description={description}
      items={groupItems}
      confirmButtonText="Add to Groups"
      emptyStateText="No groups available to select."
      modalSize="sm" // Retain original size
    />
  )
}

"use client"

import { useState } from "react"
import { Trash2, UserPlus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Group } from "@/lib/types/admin"
import { AddUsersToGroupModal } from "./modals/add-users-to-group-modal"
import { ConfirmModal } from "@/components/ui/modal/confirm-modal"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface GroupBulkActionsProps {
  selectedGroups: Group[]
  onDeselectAll?: () => void
  onDeleteGroups?: (groupIds: string[]) => void
  onAddUsersToGroups?: (groupIds: string[], userIds: string[]) => void
  className?: string
}

export function GroupBulkActions({ 
  selectedGroups, 
  onDeselectAll, 
  onDeleteGroups, 
  onAddUsersToGroups, 
  className 
}: GroupBulkActionsProps) {
  const [isAddUsersModalOpen, setIsAddUsersModalOpen] = useState(false)
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false)

  if (selectedGroups.length === 0) {
    return null
  }

  const handleAddUsersClick = () => {
    setIsAddUsersModalOpen(true)
  }

  const handleDeleteClick = () => {
    setIsDeleteConfirmModalOpen(true)
  }

  const handleConfirmDelete = () => {
    const count = selectedGroups.length
    const groupIds = selectedGroups.map(group => group.id)
    
    if (onDeleteGroups) {
      onDeleteGroups(groupIds)
    }

    toast.success("Success", {
      description: `${count} group(s) deleted successfully.`,
    })

    setIsDeleteConfirmModalOpen(false)
  }

  const handleConfirmAddUsers = (selectedUserIds: string[]) => {
    const groupCount = selectedGroups.length
    const userCount = selectedUserIds.length
    const groupIds = selectedGroups.map(group => group.id)

    try {
      if (onAddUsersToGroups) {
        onAddUsersToGroups(groupIds, selectedUserIds)
      }
      
      toast.success("Users Added", {
        description: `${userCount} user(s) added to ${groupCount} group(s).`,
      })
      
      if (onDeselectAll) {
        onDeselectAll()
      }
    } catch (error) {
      console.error("Failed to add users to groups:", error)
      let errorMessage = "An unexpected error occurred."
      if (error instanceof Error) {
        errorMessage = error.message
      }
      toast.error("Error Adding Users", {
        description: errorMessage,
      })
    }
    
    setIsAddUsersModalOpen(false)
  }

  const handleClearSelection = () => {
    if (onDeselectAll) {
      onDeselectAll()
    }
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="bg-primary/10 text-primary px-3 py-1 rounded-md text-sm font-medium mr-2">
        {selectedGroups.length} selected
      </div>

      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-1 text-primary border-primary hover:bg-primary/10"
        onClick={handleAddUsersClick}
      >
        <UserPlus className="h-3.5 w-3.5" />
        <span>Add Users</span>
      </Button>

      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-1 text-destructive border-destructive hover:bg-destructive/10 hover:text-destructive-foreground"
        onClick={handleDeleteClick}
      >
        <Trash2 className="h-3.5 w-3.5" />
        <span>Delete</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-1 text-muted-foreground"
        onClick={handleClearSelection}
      >
        <X className="h-3.5 w-3.5" />
        <span>Clear</span>
      </Button>

      {/* Modals */}
      <AddUsersToGroupModal
        open={isAddUsersModalOpen}
        onClose={() => setIsAddUsersModalOpen(false)}
        onConfirm={handleConfirmAddUsers}
        targetGroups={selectedGroups.map(g => ({ id: g.id, name: g.name }))}
      />

      <ConfirmModal
        open={isDeleteConfirmModalOpen}
        onClose={() => setIsDeleteConfirmModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title={`Delete ${selectedGroups.length} Group(s)`}
        description={`Are you sure you want to delete ${selectedGroups.length} selected group(s)? This action cannot be undone.`}
        confirmLabel="Delete"
      />
    </div>
  )
} 
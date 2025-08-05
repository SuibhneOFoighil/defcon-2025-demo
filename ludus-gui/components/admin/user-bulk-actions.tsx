"use client"

import { useState } from "react"
import { Trash2, UserPlus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { User } from "@/lib/types/admin"
import { AddToGroupModal } from "./modals/add-to-group-modal"
import { DeleteUserModal } from "./modals/delete-user-modal"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface UserBulkActionsProps {
  selectedUsers: User[]
  onDeselectAll?: () => void
  onDeleteUsers?: (userIds: string[]) => void
  className?: string
}

export function UserBulkActions({ 
  selectedUsers, 
  onDeselectAll, 
  onDeleteUsers, 
  className 
}: UserBulkActionsProps) {
  const [isAddToGroupModalOpen, setIsAddToGroupModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  // Available groups for the add to group modal
  // In a real app, this would come from an API or context
  const availableGroups = [
    { id: "group-1", name: "Cyber Defense Squad" },
    { id: "group-2", name: "Red Team" },
    { id: "group-3", name: "Blue Team" },
    { id: "group-4", name: "Security Operations" },
    { id: "group-5", name: "Incident Response" },
    { id: "group-6", name: "Threat Intelligence" },
    { id: "group-7", name: "Vulnerability Management" },
    { id: "group-8", name: "Security Architecture" },
  ]

  // If no users are selected, don't render anything
  if (selectedUsers.length === 0) {
    return null
  }

  const handleAddToGroup = () => {
    setIsAddToGroupModalOpen(true)
  }

  const handleDelete = () => {
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = () => {
    const count = selectedUsers.length
    const userIds = selectedUsers.map(user => user.id)
    
    if (onDeleteUsers) {
      onDeleteUsers(userIds)
    }

    toast.success("Success", {
      description: `${count} user(s) deleted successfully.`,
    })

    setIsDeleteModalOpen(false)
  }

  const handleConfirmAddToGroup = (selectedGroups: string[]) => {
    // In a real app, this would call an API
    const role = "Team Member" // Default role as modal doesn't select it
    console.log(
      "Adding users to groups:",
      selectedUsers.map((u) => u.id),
      selectedGroups,
      "with role:",
      role,
    )

    const userCount = selectedUsers.length
    const groupCount = selectedGroups.length

    // Show success toast notification
    toast.success("Added to groups", {
      description: `${userCount} user(s) added to ${groupCount} group(s) as ${role}s.`,
    })

    // Close modal and clear selection
    setIsAddToGroupModalOpen(false)
    if (onDeselectAll) {
      onDeselectAll()
    }
  }

  const handleClearSelection = () => {
    if (onDeselectAll) {
      onDeselectAll()
    }
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="bg-primary/10 text-primary px-3 py-1 rounded-md text-sm font-medium mr-2">
        {selectedUsers.length} selected
      </div>

      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-1 text-primary border-primary hover:bg-primary/10"
        onClick={handleAddToGroup}
      >
        <UserPlus className="h-3.5 w-3.5" />
        <span>Add to Group</span>
      </Button>

      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-1 text-destructive border-destructive hover:bg-destructive/10 hover:text-destructive-foreground"
        onClick={handleDelete}
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
      <AddToGroupModal
        open={isAddToGroupModalOpen}
        onClose={() => setIsAddToGroupModalOpen(false)}
        onConfirm={handleConfirmAddToGroup}
        selectedUsers={selectedUsers.map(u => u.id)}
        availableGroups={availableGroups}
      />

      <DeleteUserModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        userName={`${selectedUsers.length} users`}
      />
    </div>
  )
}

"use client"

import { useState } from "react"
import { MoreVertical, Trash2 } from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import type { User } from "@/lib/types/admin"
import { IconButton } from "@/components/ui/icon-button"
import { useContextMenu } from "@/hooks/use-context-menu"
import { ContextMenu, ContextMenuItem } from "@/components/ui/context-menu"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card/card-components"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { deleteUser, userQueryKeys } from "@/lib/api/ludus/users"
import { DeleteUserModal } from "@/components/admin/modals/delete-user-modal"
import type React from 'react';

interface UserCardProps {
  user: User
  className?: string
}

export function UserCard({ user, className }: UserCardProps) {
  const queryClient = useQueryClient()
  const { open, triggerRef, closeMenu, toggleMenu } = useContextMenu()
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: (userID: string) => deleteUser(userID),
    onSuccess: () => {
      // Invalidate and refetch users list
      queryClient.invalidateQueries({ queryKey: userQueryKeys.lists() })
    },
  })


  const handleMenuButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    toggleMenu(event)
  }

  const handleDeleteClick = () => {
    closeMenu()
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = () => {
    setIsDeleteModalOpen(false)
    
    // Show toast with operation progress
    toast.promise(
      deleteUserMutation.mutateAsync(user.userID),
      {
        loading: (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Deleting user {user.name || user.userID}...</span>
          </div>
        ),
        success: `User ${user.name || user.userID} deleted successfully`,
        error: (err: Error) => `Failed to delete user: ${err.message}`,
      }
    )
  }


  const userRole = user.isAdmin ? "Admin" : "User"
  const roleVariant = user.isAdmin ? "info" : "secondary"

  return (
    <>
      <Card
        className={cn(
          "transition-shadow hover:shadow-md",
          className
        )}
      >
        <CardHeader className="flex flex-row items-start justify-between gap-2 p-3">
          <div className="flex flex-1 items-center gap-2">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-sm font-medium truncate">{user.name || user.userID}</CardTitle>
              {user.proxmoxUsername && (
                <CardDescription className="text-xs truncate">
                  {user.proxmoxUsername}
                </CardDescription>
              )}
            </div>
          </div>
          <IconButton
            variant="ghost"
            className="h-8 w-8 shrink-0 text-muted-foreground -my-1 -mr-1"
            onClick={handleMenuButtonClick}
            onDoubleClick={(e) => e.stopPropagation()}
            aria-label="More options"
            aria-expanded={open}
            ref={triggerRef}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <MoreVertical className="h-4 w-4" />
          </IconButton>
        </CardHeader>

        <CardContent className="p-3 pt-0">
          <div className="flex flex-wrap items-center gap-1 mb-1.5">
            <Badge variant={roleVariant} size="sm">
              {userRole}
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground space-y-1">
            {user.dateCreated && (
              <div>Created: {new Date(user.dateCreated).toLocaleDateString()}</div>
            )}
            {user.dateLastActive && (
              <div>Last Active: {new Date(user.dateLastActive).toLocaleDateString()}</div>
            )}
          </div>
        </CardContent>

        <ContextMenu open={open} onClose={closeMenu} triggerRef={triggerRef as React.RefObject<HTMLButtonElement>} align="end">
          <ContextMenuItem
            destructive
            icon={<Trash2 className="h-4 w-4" />}
            onClick={handleDeleteClick}
          >
            Delete User
          </ContextMenuItem>
        </ContextMenu>
      </Card>

      <DeleteUserModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        userName={user.name || user.userID}
      />
    </>
  )
}

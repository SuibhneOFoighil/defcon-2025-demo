"use client"

import { useState } from "react"
import { MoreVertical, Eye, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { IconButton } from "@/components/ui/icon-button"
import { useContextMenu } from "@/hooks/use-context-menu"
import { ContextMenu, ContextMenuItem } from "@/components/ui/context-menu"
import { DeleteGroupModal } from "./modals/delete-group-modal"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card/card-components"
import type { Group } from "@/lib/types/admin"
import type React from 'react';

interface GroupCardProps {
  group: Group
  className?: string
}

export function GroupCard({ group, className }: GroupCardProps) {
  const router = useRouter()
  const { open, triggerRef, closeMenu, toggleMenu } = useContextMenu()
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  const handleViewDetails = () => {
    closeMenu()
    router.push(`/admin/groups/${group.id}`)
  }


  const handleDeleteClick = () => {
    closeMenu()
    setIsDeleteModalOpen(true)
  }

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false)
  }

  const handleMenuButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    toggleMenu(event)
  }

  const handleCardClick = (event: React.MouseEvent<HTMLDivElement>) => {
    // Don't navigate if clicking on the menu button
    const triggerButton = triggerRef.current;
    if (triggerButton && triggerButton.contains(event.target as Node)) {
      return;
    }
    router.push(`/admin/groups/${group.id}`)
  }

  const handleCardKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (triggerRef.current && event.target === triggerRef.current) return;
    
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      router.push(`/admin/groups/${group.id}`)
    }
  }

  return (
    <>
      <Card
        className={cn(
          "flex flex-col h-full cursor-pointer transition-shadow hover:shadow-md",
          className
        )}
        padding="none"
        onClick={handleCardClick}
        role="button"
        tabIndex={0}
        onKeyDown={handleCardKeyDown}
      >
        <CardHeader className="flex flex-row items-start justify-between p-4">
          <CardTitle className="text-base font-medium">{group.name}</CardTitle>
          <IconButton
            variant="ghost"
            className="h-8 w-8 text-muted-foreground -mt-1 -mr-1 shrink-0"
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

        <CardContent className="p-4 pt-0 flex-grow flex flex-col">
          <p className="text-sm text-muted-foreground line-clamp-3 flex-grow">
            {group.description || "No description available"}
          </p>
        </CardContent>
      </Card>

      <ContextMenu open={open} onClose={closeMenu} triggerRef={triggerRef as React.RefObject<HTMLButtonElement>} align="end">
        <ContextMenuItem icon={<Eye className="h-4 w-4" />} onClick={handleViewDetails}>
          View Details
        </ContextMenuItem>
        <ContextMenuItem icon={<Trash2 className="h-4 w-4" />} onClick={handleDeleteClick} destructive>
          Delete Group
        </ContextMenuItem>
      </ContextMenu>

      <DeleteGroupModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        group={group}
      />
    </>
  )
}

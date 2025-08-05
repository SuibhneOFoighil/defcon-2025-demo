"use client"

import type React from "react"

import { useState } from "react"
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter } from "@/components/ui/modal/modal"
import { Button } from "@/components/ui/button"
import { FormInput } from "@/components/ui/form/form-input"
import { FormTextarea } from "@/components/ui/form/form-textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createGroup } from "@/lib/api/ludus/groups"
import { useAdminData } from "@/hooks/use-admin-data"

interface CreateGroupModalProps {
  open: boolean
  onOpenChange: () => void
}

export function CreateGroupModal({ open, onOpenChange }: CreateGroupModalProps) {
  const [groupName, setGroupName] = useState("")
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { invalidateGroups } = useAdminData()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!groupName.trim()) {
      setError("Group name is required")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Create the group via API
      const groupData: { name: string; description?: string } = {
        name: groupName.trim()
      };
      
      if (description.trim()) {
        groupData.description = description.trim();
      }
      
      await createGroup(groupData)

      // Invalidate groups to refresh the list
      await invalidateGroups()

      // Reset form and close modal
      setGroupName("")
      setDescription("")
      onOpenChange()
    } catch (err) {
      // Handle API errors
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("Failed to create group. Please try again.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size="md">
        <ModalHeader>
          <ModalTitle>Create New Group</ModalTitle>
        </ModalHeader>
        <div className="py-4 space-y-4">
          <p className="text-sm text-muted-foreground">Fill in the details to create a new group.</p>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormInput
              label="Group Name"
              value={groupName}
              onChange={(e) => {
                setGroupName(e.target.value)
                setError(null)
              }}
              placeholder="Enter group name"
              required
            />
            <FormTextarea
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter group description"
              rows={4}
            />
          </form>
        </div>
        <ModalFooter>
          <Button variant="secondary" onClick={onOpenChange} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="elevated" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Group"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

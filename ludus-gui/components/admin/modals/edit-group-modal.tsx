"use client"

import { useState } from "react"
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter } from "@/components/ui/modal/modal"
import { Button } from "@/components/ui/button"
import { FormInput } from "@/components/ui/form/form-input"
import { FormTextarea } from "@/components/ui/form/form-textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface EditGroupModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (name: string, description: string) => void
  groupName: string
  groupDescription: string
}

export function EditGroupModal({ isOpen, onClose, onConfirm, groupName, groupDescription }: EditGroupModalProps) {
  const [name, setName] = useState(groupName)
  const [description, setDescription] = useState(groupDescription)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = () => {
    // Validate inputs
    if (!name.trim()) {
      setError("Group name is required")
      return
    }

    onConfirm(name, description)
    onClose()
  }

  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent size="md">
        <ModalHeader>
          <ModalTitle>Edit Group</ModalTitle>
        </ModalHeader>

        <div className="py-4 space-y-4">
          <p className="text-sm text-muted-foreground">Update the details for this group.</p>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <FormInput
            label="Group Name"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setError(null)
            }}
            required
          />

          <FormTextarea
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Describe the purpose of this group"
          />
        </div>

        <ModalFooter>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="elevated" onClick={handleSubmit}>
            Save Changes
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

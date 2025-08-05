"use client"

import type React from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createUser, userQueryKeys } from "@/lib/api/ludus/users"
import { toast } from "sonner"
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter } from "@/components/ui/modal/modal"
import { Button } from "@/components/ui/button"
import { FormInput } from "@/components/ui/form/form-input"
import { FormSelect } from "@/components/ui/form/form-select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Loader2 } from "lucide-react"

// Define the form schema
const createUserSchema = z.object({
  name: z.string().min(1, "Name is required").trim(),
  userID: z
    .string()
    .min(1, "User ID is required")
    .max(20, "User ID must not exceed 20 characters")
    .regex(/^[A-Za-z0-9]+$/, "User ID must be alphanumeric (e.g., 'JD' for John Doe)"),
  role: z.enum(["user", "admin"], {
    required_error: "Please select a role",
  }),
})

type CreateUserFormData = z.infer<typeof createUserSchema>

interface CreateUserModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateUserModal({ open, onOpenChange }: CreateUserModalProps) {
  const queryClient = useQueryClient()

  const form = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: "",
      userID: "",
      role: "user",
    },
  })

  const createUserMutation = useMutation({
    mutationFn: createUser,
    onSuccess: (newUser) => {
      // Invalidate and refetch users list
      queryClient.invalidateQueries({ queryKey: userQueryKeys.all })
      // Show success toast
      toast.success(`User ${newUser.name} created successfully`)
      // Reset form and close modal
      form.reset()
      onOpenChange(false)
    },
    onError: (error: Error) => {
      console.error('Create user error:', error)
      toast.error("Failed to create user", {
        description: error.message
      })
    },
  })

  const roleOptions = [
    { value: "user", label: "User" },
    { value: "admin", label: "Admin" },
  ]

  const handleSubmit = (data: CreateUserFormData) => {
    createUserMutation.mutate({
      userName: data.name,
      userID: data.userID,
      role: data.role,
    })
  }

  const handleCancel = () => {
    form.reset()
    onOpenChange(false)
  }

  return (
    <Modal open={open} onOpenChange={createUserMutation.isPending ? () => {} : (open) => !open && handleCancel()}>
      <ModalContent size="md">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <ModalHeader>
              <ModalTitle>Add New User</ModalTitle>
            </ModalHeader>
            <div className="py-4 space-y-4">
              <p className="text-sm text-muted-foreground">
                Create a new user account with basic information.
              </p>
              {createUserMutation.isError && (
                <Alert variant="destructive">
                  <AlertDescription>{createUserMutation.error?.message}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <FormInput
                          placeholder="Enter full name (e.g., John Doe)"
                          disabled={createUserMutation.isPending}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="userID"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>User ID</FormLabel>
                      <FormControl>
                        <FormInput
                          placeholder="Enter user ID (e.g., JD)"
                          maxLength={20}
                          disabled={createUserMutation.isPending}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <FormControl>
                        <FormSelect
                          options={roleOptions}
                          disabled={createUserMutation.isPending}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <ModalFooter>
              <Button 
                type="button" 
                variant="secondary" 
                onClick={handleCancel} 
                disabled={createUserMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="elevated" 
                disabled={createUserMutation.isPending}
              >
                {createUserMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create User"
                )}
              </Button>
            </ModalFooter>
          </form>
        </Form>
      </ModalContent>
    </Modal>
  )
}
"use client"

import type React from "react"

import { useState } from "react"
import { Form } from "@/components/ui/form/form"
import { FormPassword } from "@/components/ui/form/form-password"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"

interface SecuritySettingsFormProps {
  onSuccess?: () => void;
}

export function SecuritySettingsForm({ onSuccess }: SecuritySettingsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors = {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    }
    let isValid = true

    if (!formData.currentPassword) {
      newErrors.currentPassword = "Current password is required"
      isValid = false
    }

    if (!formData.newPassword) {
      newErrors.newPassword = "New password is required"
      isValid = false
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters"
      isValid = false
    }

    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async (/* dataFromForm: Record<string, FormDataEntryValue> */) => {
    if (!validateForm()) return

    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast.success("Password updated", {
      description: "Your password has been updated successfully.",
    })

    // Reset form
    setFormData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    })

    setIsSubmitting(false)
    onSuccess?.()
  }

  return (
    <Form onSubmit={handleSubmit} className="space-y-4">
      {Object.values(errors).some((error) => error) && (
        <Alert variant="destructive">
          <AlertDescription>
            Please fix the errors below to continue.
          </AlertDescription>
        </Alert>
      )}

      <FormPassword
        label="Current Password"
        name="currentPassword"
        value={formData.currentPassword}
        onChange={handleChange}
        placeholder="Enter your current password"
        error={errors.currentPassword}
        required
      />

      <FormPassword
        label="New Password"
        name="newPassword"
        value={formData.newPassword}
        onChange={handleChange}
        placeholder="Enter your new password"
        error={errors.newPassword}
        required
        hint="Password must be at least 8 characters"
      />

      <FormPassword
        label="Confirm New Password"
        name="confirmPassword"
        value={formData.confirmPassword}
        onChange={handleChange}
        placeholder="Confirm your new password"
        error={errors.confirmPassword}
        required
      />

      <div className="pt-2">
        <Button type="submit" variant="default" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Updating..." : "Update Password"}
        </Button>
      </div>
    </Form>
  )
}

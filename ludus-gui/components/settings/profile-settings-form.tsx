"use client"

import type React from "react"
import { useState } from "react"
import { Form } from "@/components/ui/form/form"
import { FormInput } from "@/components/ui/form/form-input"
import { FormSelect } from "@/components/ui/form/form-select"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import type { User } from "@/lib/types"
import { LockIcon } from "lucide-react"

interface ProfileSettingsFormProps {
  user: User | null
}

export function ProfileSettingsForm({ user }: ProfileSettingsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    userId: "user_01234",
    name: user?.name || "John Doe",
    email: user?.email || "john.doe@example.com",
    role: "Admin",
    companyName: "Cybersecurity Company",
    jobRole: "Team Member",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (/* dataFromForm: Record<string, FormDataEntryValue> */) => {
    // event.preventDefault() // Form component handles this
    setIsSubmitting(true)

    // Simulate API call (using internal formData state)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast("Profile updated", {
      description: "Your profile information has been updated successfully.",
    })

    setIsSubmitting(false)
  }

  const jobRoleOptions = [
    { value: "team-member", label: "Team Member" },
    { value: "software-engineer", label: "Software Engineer" },
    { value: "security-analyst", label: "Security Analyst" },
    { value: "system-administrator", label: "System Administrator" },
    { value: "product-manager", label: "Product Manager" },
    { value: "designer", label: "Designer" },
    { value: "other", label: "Other" },
  ]

  return (
    <Form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <FormInput
          label="User ID"
          name="userId"
          value={formData.userId}
          onChange={handleChange}
          disabled
          leftIcon={<LockIcon size={16} className="text-muted-foreground" />}
          hint="User ID cannot be changed"
        />

        <FormInput
          label="Full Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
        />

        <FormInput
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
        />

        <FormInput
          label="Role"
          name="role"
          value={formData.role}
          onChange={handleChange}
          disabled
          leftIcon={<LockIcon size={16} className="text-muted-foreground" />}
          hint="Role is assigned by administrators"
        />

        <FormInput
          label="Company Name"
          name="companyName"
          value={formData.companyName}
          onChange={handleChange}
        />

        <FormSelect
          label="Job Role"
          name="jobRole"
          value={formData.jobRole}
          onChange={handleChange}
          options={jobRoleOptions}
        />

        <div className="pt-6">
          <Button
            type="submit"
            variant="default"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </Form>
  )
}

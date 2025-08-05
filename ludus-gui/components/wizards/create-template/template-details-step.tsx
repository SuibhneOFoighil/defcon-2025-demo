"use client"

import { FormInput } from "@/components/ui/form/form-input"
import { FormTextarea } from "@/components/ui/form/form-textarea"
import { Form, FormField, FormLabel } from "@/components/ui/form/form"
import type { StepProps } from "./types"

export function TemplateDetailsStep({ formData, onInputChange }: StepProps) {
  return (
    <div className="p-6">
      <Form className="space-y-6">
        <FormField>
          <FormLabel>Template ID</FormLabel>
          <FormInput
            placeholder="Enter template ID"
            value={formData.templateId}
            onChange={(e) => onInputChange("templateId", e.target.value)}
          />
        </FormField>

        <FormField>
          <FormLabel>Template Name</FormLabel>
          <FormInput
            placeholder="Enter template name"
            value={formData.templateName}
            onChange={(e) => onInputChange("templateName", e.target.value)}
          />
        </FormField>

        <FormField>
          <FormLabel>Template Description</FormLabel>
          <FormTextarea
            placeholder="Enter template description"
            value={formData.templateDescription}
            onChange={(e) => onInputChange("templateDescription", e.target.value)}
            className="min-h-[120px]"
          />
        </FormField>
      </Form>
    </div>
  )
}

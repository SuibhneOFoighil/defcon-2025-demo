"use client"

import { FormInput } from "@/components/ui/form/form-input"
import { FormTextarea } from "@/components/ui/form/form-textarea"
import { Pencil } from "lucide-react"
import type { StepProps } from "./types"
import { WizardStepHeader } from "./wizard-step-header"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { IconButton } from "@/components/ui/icon-button"
import { logUserAction } from "@/lib/logger"

export function GeneralDetailsStep({
  formData,
  onInputChange,
}: StepProps) {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <WizardStepHeader title="General Details" />

      <div className="space-y-6">
        <FormInput
          label="Range Name"
          placeholder="Enter range name"
          value={formData.name}
          onChange={(e) => onInputChange("name", e.target.value)}
          required
        />

        <div className="relative">
          <FormTextarea
            label="Description"
            placeholder="Enter description"
            value={formData.description}
            onChange={(e) => onInputChange("description", e.target.value)}
          />
          <IconButton 
            variant="ghost" 
            size="sm" 
            className="absolute bottom-2 right-2 text-muted-foreground hover:text-foreground"
            aria-label="Edit description"
            onClick={() => logUserAction('edit-description-clicked', 'GeneralDetailsStep', { rangeName: formData.name })}
          >
            <Pencil className="h-4 w-4" />
          </IconButton>
        </div>

        <FormInput
          label="Purpose"
          placeholder="Enter purpose"
          value={formData.purpose}
          onChange={(e) => onInputChange("purpose", e.target.value)}
        />

        <div>
          <Label className="block text-sm font-medium mb-2">Creation Method</Label>
          <RadioGroup
            value={formData.creationMethod}
            onValueChange={(value) => onInputChange("creationMethod", value)}
            className="flex flex-col sm:flex-row gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="scratch" id="r_scratch" />
              <Label htmlFor="r_scratch" className="font-normal cursor-pointer">From Scratch</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="template" id="r_template" />
              <Label htmlFor="r_template" className="font-normal cursor-pointer">From Template</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="import" id="r_import" />
              <Label htmlFor="r_import" className="font-normal cursor-pointer">Import Template</Label>
          </div>
          </RadioGroup>
        </div>
      </div>
    </div>
  )
}

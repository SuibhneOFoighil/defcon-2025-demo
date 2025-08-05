"use client"

import type { StepProps } from "./types"
import { WizardStepHeader } from "./wizard-step-header"
import { FormInput } from "@/components/ui/form/form-input"
import { FormTextarea } from "@/components/ui/form/form-textarea"
import { FormSelect } from "@/components/ui/form/form-select"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { useState } from "react"

const BLUEPRINT_CATEGORIES = [
  { value: "windows", label: "Windows" },
  { value: "linux", label: "Linux" },
  { value: "security", label: "Security" },
  { value: "networking", label: "Networking" },
  { value: "development", label: "Development" },
  { value: "database", label: "Database" },
  { value: "web", label: "Web Services" },
  { value: "other", label: "Other" },
]

export function BlueprintDetailsStep({ formData, onInputChange }: StepProps) {
  const [newTag, setNewTag] = useState("")

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      onInputChange("tags", [...formData.tags, newTag.trim()])
      setNewTag("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    onInputChange("tags", formData.tags.filter(tag => tag !== tagToRemove))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddTag()
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <WizardStepHeader 
        title="Blueprint Details"
        description="Provide information about your blueprint"
        className="mb-8"
      />

      <div className="space-y-6">
        {/* Blueprint ID */}
        <FormInput
          label="Blueprint ID"
          value={formData.blueprintId}
          onChange={(e) => onInputChange("blueprintId", e.target.value)}
          placeholder="e.g., my-awesome-blueprint"
          required
          hint="Unique identifier for the blueprint (lowercase, hyphens allowed)"
        />

        {/* Blueprint Name */}
        <FormInput
          label="Blueprint Name"
          value={formData.blueprintName}
          onChange={(e) => onInputChange("blueprintName", e.target.value)}
          placeholder="e.g., My Awesome Blueprint"
          required
          hint="Display name for the blueprint"
        />

        {/* Description */}
        <FormTextarea
          label="Description"
          value={formData.blueprintDescription}
          onChange={(e) => onInputChange("blueprintDescription", e.target.value)}
          placeholder="Describe what this blueprint contains and its purpose..."
          rows={4}
          hint="Detailed description of the blueprint's purpose and contents"
        />

        {/* Category */}
        <FormSelect
          label="Category"
          value={formData.category}
          onChange={(e) => onInputChange("category", e.target.value)}
          options={[
            { value: "", label: "Select a category" },
            ...BLUEPRINT_CATEGORIES
          ]}
          required={true}
          hint="Choose the category that best describes this blueprint"
        />

        {/* Tags */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-foreground">
            Tags
          </label>
          
          {/* Tag input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Add a tag..."
              className="flex-1 px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <button
              type="button"
              onClick={handleAddTag}
              disabled={!newTag.trim()}
              className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add
            </button>
          </div>

          {/* Existing tags */}
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="p-0.5 rounded-full hover:bg-muted-foreground/20"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Tags help categorize and search for blueprints
          </p>
        </div>
      </div>
    </div>
  )
}
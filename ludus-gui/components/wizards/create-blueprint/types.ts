export interface BlueprintWizardStep {
  id: string
  title: string
  description: string
}

export interface BlueprintFormData {
  blueprintId: string
  blueprintName: string
  blueprintDescription: string
  category: string
  tags: string[]
  yamlFile: unknown | null
}

export interface StepProps {
  formData: BlueprintFormData
  onInputChange: <T = unknown>(field: string, value: T) => void
}
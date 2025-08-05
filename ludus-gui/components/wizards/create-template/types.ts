export interface TemplateWizardStep {
  id: string
  title: string
  description: string
}

export interface TemplateFormData {
  templateId: string
  templateName: string
  templateDescription: string
  importedTemplate: unknown | null
}

export interface StepProps {
  formData: TemplateFormData
  onInputChange: <T = unknown>(field: string, value: T) => void
}

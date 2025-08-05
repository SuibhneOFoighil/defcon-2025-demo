"use client"

import { useState } from "react"
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter } from "@/components/ui/modal/modal"
import { Button } from "@/components/ui/button"
import type { TemplateWizardStep, TemplateFormData } from "./create-template/types"
import { ImportTemplateStep } from "./create-template/import-template-step"
import { TemplateDetailsStep } from "./create-template/template-details-step"
import { ProgressIndicator } from "@/components/ui/progress-indicator"
import { toast } from "sonner"
import { logError } from "@/lib/logger"

// Define the steps for the wizard
const WIZARD_STEPS: TemplateWizardStep[] = [
  {
    id: "import",
    title: "Import Template",
    description: "Import Template",
  },
  {
    id: "details",
    title: "Template Details",
    description: "Template Details",
  },
]

interface CreateTemplateWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function CreateTemplateWizard({ open, onOpenChange, onSuccess }: CreateTemplateWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<TemplateFormData>({
    templateId: "",
    templateName: "",
    templateDescription: "",
    importedTemplate: null,
  })

  // Handler for form input changes
  const handleInputChange = (field: string, value: unknown) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }))
  }

  // Function to handle next step
  const handleNext = () => {
    if (currentStep < WIZARD_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Handle form submission
      handleSubmit()
    }
  }

  // Function to handle form submission
  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    try {
      // Get the imported template file
      const templateFile = formData.importedTemplate as File
      
      if (!templateFile) {
        throw new Error('No template file selected')
      }

      // Create a FormData object to send the template file
      const formDataToSend = new FormData()
      formDataToSend.append('file', templateFile)
      formDataToSend.append('force', 'false')

      // Upload the template file directly
      const response = await fetch('/api/ludus/templates', {
        method: 'PUT',
        body: formDataToSend,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to upload template')
      }

      toast.success("Template uploaded successfully", {
        description: `Template "${formData.templateName}" has been uploaded successfully.`
      })

      // Close the modal and reset form
      onOpenChange(false)
      setCurrentStep(0)
      setFormData({
        templateId: "",
        templateName: "",
        templateDescription: "",
        importedTemplate: null,
      })

      // Call onSuccess callback if provided
      if (onSuccess) {
        await onSuccess()
      }
    } catch (error) {
      logError(error instanceof Error ? error : new Error(String(error)), 'Failed to upload template', { 
        templateName: formData.templateName,
        templateId: formData.templateId,
        component: 'CreateTemplateWizard'
      })
      toast.error("Failed to upload template", {
        description: error instanceof Error ? error.message : 'An unexpected error occurred'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Function to handle previous step
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Common props for step components
  const stepProps = {
    formData,
    onInputChange: handleInputChange,
  }

  // Determine if the Next button should be disabled
  const isNextDisabled = () => {
    if (currentStep === 0) {
      return !formData.importedTemplate
    }
    if (currentStep === 1) {
      return !formData.templateId || !formData.templateName
    }
    return false
  }

  // Render the current step
  const renderStep = () => {
    if (currentStep === 0) {
      return <ImportTemplateStep {...stepProps} />
    }
    if (currentStep === 1) {
      return <TemplateDetailsStep {...stepProps} />
    }
    return null
  }

  // Convert to the format needed by ProgressIndicator
  const progressSteps = WIZARD_STEPS.map((step) => ({
    id: step.id,
    label: step.description,
  }))

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size="md" className="p-0 overflow-hidden bg-[hsl(var(--background))] border-[hsl(var(--border))]">
        <ModalHeader className="p-4 border-b border-[hsl(var(--border))]">
          <ModalTitle>Add New Template</ModalTitle>
        </ModalHeader>

        <ProgressIndicator steps={progressSteps} currentStep={currentStep} className="my-6 px-4"/>

        <div className="max-h-[60vh] overflow-y-auto p-4">
          {renderStep()}
        </div>

        <ModalFooter className="border-t border-[hsl(var(--border))] p-4 flex">
          {/* Left Button: Cancel or Back */}
          {currentStep === 0 ? (
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="mr-auto"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={handleBack}
              className="mr-auto"
              disabled={isSubmitting}
            >
              Back
            </Button>
          )}

          {/* Right Button: Next or Add Template */}
          <Button
            variant="default"
            onClick={handleNext}
            disabled={isNextDisabled() || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Uploading...
              </>
            ) : (
              currentStep === WIZARD_STEPS.length - 1 ? "Upload Template" : "Next"
            )}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

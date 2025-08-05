"use client"

import { useState } from "react"
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter } from "@/components/ui/modal/modal"
import { Button } from "@/components/ui/button"
import type { BlueprintWizardStep, BlueprintFormData } from "./create-blueprint/types"
import { ImportYamlStep } from "./create-blueprint/import-yaml-step"
import { BlueprintDetailsStep } from "./create-blueprint/blueprint-details-step"
import { ProgressIndicator } from "@/components/ui/progress-indicator"
import { toast } from "sonner"
import { componentLogger, logError } from "@/lib/logger"

// Define the steps for the wizard
const WIZARD_STEPS: BlueprintWizardStep[] = [
  {
    id: "import",
    title: "Import YAML",
    description: "Import YAML",
  },
  {
    id: "details",
    title: "Blueprint Details",
    description: "Blueprint Details",
  },
]

interface CreateBlueprintWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function CreateBlueprintWizard({ open, onOpenChange, onSuccess }: CreateBlueprintWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<BlueprintFormData>({
    blueprintId: "",
    blueprintName: "",
    blueprintDescription: "",
    category: "",
    tags: [],
    yamlFile: null,
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
      // Get the imported YAML file
      const yamlFile = formData.yamlFile as File
      
      if (!yamlFile) {
        throw new Error('No YAML file selected')
      }

      // For now, we'll just simulate the upload since there's no backend endpoint yet
      // In the future, this would upload to /api/ludus/blueprints
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate upload delay

      // Read and validate the YAML file content
      const yamlContent = await yamlFile.text()
      
      // Basic validation - check if it contains 'ludus:' key
      if (!yamlContent.includes('ludus:')) {
        throw new Error('Invalid YAML file: Must contain "ludus:" key')
      }

      // Create blueprint object (for future API integration)
      const blueprintData = {
        id: formData.blueprintId,
        name: formData.blueprintName,
        description: formData.blueprintDescription,
        category: formData.category,
        tags: formData.tags,
        yamlContent,
        createdAt: new Date().toISOString(),
      }

      componentLogger.info({ 
        name: blueprintData.name,
        yamlSize: blueprintData.yamlContent?.length || 0,
        hasDescription: !!blueprintData.description
      }, 'Blueprint data prepared for creation')

      toast.success("Blueprint created successfully", {
        description: `Blueprint "${formData.blueprintName}" has been created successfully.`
      })

      // Close the modal and reset form
      onOpenChange(false)
      setCurrentStep(0)
      setFormData({
        blueprintId: "",
        blueprintName: "",
        blueprintDescription: "",
        category: "",
        tags: [],
        yamlFile: null,
      })

      // Call onSuccess callback if provided
      if (onSuccess) {
        await onSuccess()
      }
    } catch (error) {
      logError(error as Error, 'Blueprint Creation', { blueprintName: formData.blueprintName })
      toast.error("Failed to create blueprint", {
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
      return !formData.yamlFile
    }
    if (currentStep === 1) {
      return !formData.blueprintId || !formData.blueprintName || !formData.category
    }
    return false
  }

  // Render the current step
  const renderStep = () => {
    if (currentStep === 0) {
      return <ImportYamlStep {...stepProps} />
    }
    if (currentStep === 1) {
      return <BlueprintDetailsStep {...stepProps} />
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
          <ModalTitle>Create New Blueprint</ModalTitle>
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

          {/* Right Button: Next or Create Blueprint */}
          <Button
            variant="default"
            onClick={handleNext}
            disabled={isNextDisabled() || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </>
            ) : (
              currentStep === WIZARD_STEPS.length - 1 ? "Create Blueprint" : "Next"
            )}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
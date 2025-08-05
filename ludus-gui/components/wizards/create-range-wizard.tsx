"use client"

import { useState } from "react"
// No longer using useRouter for back navigation within the modal
import { Button } from "@/components/ui/button"
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter } from "@/components/ui/modal/modal"
import type { FormData, WizardStep } from "./create-range/types"
import { GeneralDetailsStep } from "./create-range/general-details-step"
import { NetworkDetailsStep } from "./create-range/network-details-step"
import { TemplateSelectionStep } from "./create-range/template-selection-step"
import { ImportTemplateStep } from "./create-range/import-template-step"
import { FirewallRulesStep } from "./create-range/firewall-rules-step"
import { ProgressIndicator, type Step } from "@/components/ui/progress-indicator"
import { toast } from "sonner"
import { generateRangeConfig } from "@/lib/utils/range-config-generator"
import { logError } from "@/lib/logger"


// Define the steps for the wizard - update to include only 3 steps
const WIZARD_STEPS: WizardStep[] = [
  {
    id: "general",
    title: "Step 1", // Retained for consistency, label is used in UI
    description: "General Details",
  },
  {
    id: "step2", // Generic name since content changes based on creation method
    title: "Step 2", // Retained
    description: "Configuration", // Updated to be more generic before dynamic update
  },
  {
    id: "firewall",
    title: "Step 3", // Retained
    description: "Firewall Rules",
  },
]

interface CreateRangeWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function CreateRangeWizard({ open, onOpenChange, onSuccess }: CreateRangeWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    purpose: "",
    creationMethod: "",
    numberOfVLANs: 0,
    sameVMsPerVLAN: true,
    vmsPerVLAN: 0,
    vlanVMs: {},
    selectedTemplates: [],
    importedTemplate: undefined,
  })
  // Notification panel state is removed as it's not part of a modal wizard typically

  // Get the current steps with dynamic descriptions based on creation method
  const getSteps = () => {
    const steps = [...WIZARD_STEPS]

    // Update step 2 description based on creation method
    if (formData.creationMethod === "template") {
      steps[1] = { ...steps[1], description: "Select Template" }
    } else if (formData.creationMethod === "import") {
      steps[1] = { ...steps[1], description: "Import Template" }
    } else {
      steps[1] = { ...steps[1], description: "Network Details" } // For "from scratch"
    }

    return steps
  }

  // Handler for form input changes
  const handleInputChange = (field: string, value: unknown) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }))
  }

  // Function to handle next step
  const handleNext = () => {
    if (currentStep < getSteps().length - 1) {
      setCurrentStep(currentStep + 1)
      // Scrolling is handled by the modal\'s content area if needed
    } else {
      // Handle form submission
      handleSubmit()
    }
  }

  // Function to handle previous step
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    } else {
      // If on first step, close the modal or trigger cancel action
      // For now, let\'s assume the cancel button handles full closure.
      // Or, we could have a specific "cancel" prop.
      // For simplicity, back on first step does nothing beyond what cancel button provides.
    }
  }

  // Function to handle form submission
  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    try {
      // Generate YAML configuration from form data
      const yamlConfig = generateRangeConfig(formData)
      
      // Create a FormData object to send the YAML file
      const formDataToSend = new FormData()
      const yamlBlob = new Blob([yamlConfig], { type: 'text/yaml' })
      formDataToSend.append('file', yamlBlob, 'range-config.yml')
      formDataToSend.append('force', 'false')

      // Upload the range configuration
      const configResponse = await fetch('/api/ludus/ranges/config', {
        method: 'PUT',
        body: formDataToSend,
      })

      if (!configResponse.ok) {
        const errorData = await configResponse.json()
        throw new Error(errorData.error || 'Failed to upload range configuration')
      }

      // Deploy the range
      const deployResponse = await fetch('/api/ludus/ranges/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tags: 'all',
          force: false,
        }),
      })

      if (!deployResponse.ok) {
        const errorData = await deployResponse.json()
        throw new Error(errorData.error || 'Failed to deploy range')
      }

      toast.success("Range created successfully", {
        description: `Range "${formData.name}" has been configured and deployment started.`
      })
      
      onOpenChange(false) // Close modal on success
      setCurrentStep(0) // Reset step
      setFormData({ // Reset form data
        name: "",
        description: "",
        purpose: "",
        creationMethod: "",
        numberOfVLANs: 0,
        sameVMsPerVLAN: true,
        vmsPerVLAN: 0,
        vlanVMs: {},
        selectedTemplates: [],
        importedTemplate: undefined,
      })
      
      if (onSuccess) {
        await onSuccess()
      }
    } catch (error) {
      logError(error instanceof Error ? error : new Error(String(error)), 'Failed to create range', { 
        rangeName: formData.name,
        creationMethod: formData.creationMethod,
        component: 'CreateRangeWizard'
      })
      toast.error("Failed to create range", {
        description: error instanceof Error ? error.message : 'An unexpected error occurred'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Common props for step components
  const stepProps = {
    formData,
    onInputChange: handleInputChange,
    // Simplification: remove onMethodSelection, handle directly in GeneralDetailsStep or via onInputChange
  }

  // Determine if the Next button should be disabled
  const isNextDisabled = () => {
    const currentWizardStep = getSteps()[currentStep]?.id;
    if (currentWizardStep === "general") {
      return !formData.creationMethod || !formData.name; // Example: name is also required
    }
    if (currentWizardStep === "step2") { // Corresponds to index 1
      if (formData.creationMethod === "template") {
        return !formData.selectedTemplates || formData.selectedTemplates.length === 0
      }
      if (formData.creationMethod === "import") {
        // Check if importedTemplate exists and is valid
        const importedTemplateInfo = formData.importedTemplate as { isValid?: boolean } | null | undefined
        return !importedTemplateInfo || importedTemplateInfo.isValid !== true
      }
      // Add validation for "from scratch" (NetworkDetailsStep) if necessary
      // e.g. return !formData.numberOfVLANs || (formData.numberOfVLANs > 0 && !formData.vmsPerVLAN);
    }
    // Add validation for FirewallRulesStep if necessary
    return false
  }
  
  const currentWizardSteps = getSteps();

  // Update the renderStep function to include the import template step
  const renderStep = () => {
    const currentStepId = currentWizardSteps[currentStep]?.id;

    if (currentStepId === "general") { // Index 0
      return (
        <GeneralDetailsStep
          {...stepProps}
          // onMethodSelection is handled by onInputChange now
        />
      )
    }

    if (currentStepId === "step2") { // Index 1
      if (formData.creationMethod === "template") {
        return <TemplateSelectionStep {...stepProps} />
      } else if (formData.creationMethod === "import") {
        return <ImportTemplateStep {...stepProps} />
      } else { // "from scratch"
        return <NetworkDetailsStep {...stepProps} />
      }
    }

    if (currentStepId === "firewall") { // Index 2
      return <FirewallRulesStep {...stepProps} />
    }

    return null
  }


  // Convert to the format needed by ProgressIndicator
  const progressSteps: Step[] = currentWizardSteps.map((step) => ({
    id: step.id,
    label: step.description, // Use description for label as in Template Wizard
  }))

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size="full" className="max-w-5xl w-full p-0 overflow-hidden bg-[hsl(var(--background))] border-[hsl(var(--border))] max-h-[90vh] flex flex-col" showClose={true}>
        <ModalHeader className="p-6 border-b border-[hsl(var(--border))]">
          <ModalTitle>Create New Range</ModalTitle>
        </ModalHeader>

        <ProgressIndicator steps={progressSteps} currentStep={currentStep} className="my-8 px-6" />

        <div className="overflow-y-auto px-6 pb-6 flex-grow">
          {renderStep()}
        </div>

        <ModalFooter className="border-t border-[hsl(var(--border))] p-6 flex w-full">
          {/* Left Button: Cancel or Back */}
          {currentStep === 0 ? (
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="mr-auto" // Apply mr-auto to push next elements to the right
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={handleBack}
              className="mr-auto" // Apply mr-auto to push next elements to the right
              disabled={isSubmitting}
            >
              Back
            </Button>
          )}

          {/* Right Button: Next or Create Range - will be pushed to the right by mr-auto on the previous button */}
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
              currentStep === currentWizardSteps.length - 1 ? "Create Range" : "Next"
            )}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

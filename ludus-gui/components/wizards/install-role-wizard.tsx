"use client"

import { useState } from "react"
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter } from "@/components/ui/modal/modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { FileUpload } from "@/components/ui/file-upload"
import { ProgressIndicator } from "@/components/ui/progress-indicator"
import { useInstallRole, useInstallRoleFromTar, useInstallCollection } from "@/hooks/use-ansible-data"
import { toast } from "sonner"
import { logError } from "@/lib/logger"
import { Package, Upload } from "lucide-react"

type InstallationType = "galaxy" | "file"
type ItemType = "role" | "collection"

interface WizardStep {
  id: string
  label: string
  description: string
}

interface InstallFormData {
  installationType: InstallationType
  itemType: ItemType
  name: string
  version: string
  force: boolean
  global: boolean
  file: File | null
}

const WIZARD_STEPS: WizardStep[] = [
  {
    id: "type",
    label: "Installation Type",
    description: "Choose how to install the role or collection",
  },
  {
    id: "details",
    label: "Details",
    description: "Provide installation details",
  },
  {
    id: "review",
    label: "Review",
    description: "Review and confirm installation",
  },
]

interface InstallRoleWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function InstallRoleWizard({ open, onOpenChange, onSuccess }: InstallRoleWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<InstallFormData>({
    installationType: "galaxy",
    itemType: "role",
    name: "",
    version: "",
    force: false,
    global: false,
    file: null,
  })

  const { installRole, isLoading: isInstallingRole } = useInstallRole()
  const { installFromTar, isLoading: isInstallingFromTar } = useInstallRoleFromTar()
  const { installCollection, isLoading: isInstallingCollection } = useInstallCollection()

  const isLoading = isInstallingRole || isInstallingFromTar || isInstallingCollection

  // Handler for form input changes
  const handleInputChange = (field: keyof InstallFormData, value: unknown) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }))
  }

  // Validation for each step
  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 0:
        return true // Type selection is always valid
      case 1:
        if (formData.installationType === "file") {
          return formData.file !== null
        }
        return formData.name.trim() !== ""
      case 2:
        return true // Review step is always valid
      default:
        return false
    }
  }

  // Function to handle next step
  const handleNext = () => {
    if (currentStep < WIZARD_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleSubmit()
    }
  }

  // Function to handle previous step
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Function to handle form submission
  const handleSubmit = async () => {
    try {
      if (formData.installationType === "file" && formData.file) {
        // Install from file
        installFromTar({
          file: formData.file,
          force: formData.force,
        })
      } else if (formData.itemType === "collection") {
        // Install collection
        installCollection({
          body: {
            collection: formData.name,
            version: formData.version || undefined,
            force: formData.force,
          }
        })
      } else {
        // Install role
        installRole({
          body: {
            role: formData.name,
            version: formData.version || undefined,
            force: formData.force,
            action: "install",
            global: formData.global,
          }
        })
      }

      // Close the modal and reset form
      onOpenChange(false)
      handleReset()
      onSuccess?.()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      logError(new Error(errorMessage), "Failed to install role/collection")
      toast.error("Installation failed", {
        description: errorMessage
      })
    }
  }

  // Reset form data
  const handleReset = () => {
    setCurrentStep(0)
    setFormData({
      installationType: "galaxy",
      itemType: "role",
      name: "",
      version: "",
      force: false,
      global: false,
      file: null,
    })
  }

  // Handle modal close
  const handleClose = () => {
    onOpenChange(false)
    handleReset()
  }

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-base font-medium">Installation Type</Label>
              <RadioGroup
                value={formData.installationType}
                onValueChange={(value) => handleInputChange("installationType", value as InstallationType)}
                className="mt-3"
              >
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <RadioGroupItem value="galaxy" id="galaxy" />
                  <div className="flex items-center space-x-3">
                    <Package className="h-5 w-5 text-blue-500" />
                    <div>
                      <Label htmlFor="galaxy" className="font-medium">Ansible Galaxy</Label>
                      <p className="text-sm text-muted-foreground">Install from Ansible Galaxy</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <RadioGroupItem value="file" id="file" />
                  <div className="flex items-center space-x-3">
                    <Upload className="h-5 w-5 text-orange-500" />
                    <div>
                      <Label htmlFor="file" className="font-medium">Upload File</Label>
                      <p className="text-sm text-muted-foreground">Upload a .tar.gz file</p>
                    </div>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {formData.installationType !== "file" && (
              <div>
                <Label className="text-base font-medium">Item Type</Label>
                <RadioGroup
                  value={formData.itemType}
                  onValueChange={(value) => handleInputChange("itemType", value as ItemType)}
                  className="mt-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="role" id="role" />
                    <Label htmlFor="role">Ansible Role</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="collection" id="collection" />
                    <Label htmlFor="collection">Ansible Collection</Label>
                  </div>
                </RadioGroup>
              </div>
            )}
          </div>
        )

      case 1:
        return (
          <div className="space-y-4">
            {formData.installationType === "file" ? (
              <div>
                <Label htmlFor="file">Upload Role File (.tar)</Label>
                <FileUpload
                  acceptedFileTypes=".tar"
                  onFilesChange={(files) => handleInputChange("file", files[0] || null)}
                  multiple={false}
                  label="Select or drop a .tar file"
                />
              </div>
            ) : (
              <>
                <div>
                  <Label htmlFor="name">
                    {formData.itemType === "collection" ? "Collection" : "Role"} Name
                  </Label>
                  <Input
                    id="name"
                    placeholder={
                      formData.itemType === "collection"
                        ? "namespace.collection"
                        : "namespace.role"
                    }
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="version">Version (optional)</Label>
                  <Input
                    id="version"
                    placeholder="latest"
                    value={formData.version}
                    onChange={(e) => handleInputChange("version", e.target.value)}
                  />
                </div>
              </>
            )}

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="force"
                  checked={formData.force}
                  onCheckedChange={(checked) => handleInputChange("force", checked)}
                />
                <Label htmlFor="force">Force reinstall if already exists</Label>
              </div>

              {formData.installationType !== "file" && formData.itemType === "role" && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="global"
                    checked={formData.global}
                    onCheckedChange={(checked) => handleInputChange("global", checked)}
                  />
                  <Label htmlFor="global">Install globally (admin only)</Label>
                </div>
              )}
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Review Installation</h3>
            <div className="bg-muted/30 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Installation Type:</span>
                <span className="capitalize">{formData.installationType === "file" ? "File Upload" : formData.installationType}</span>
              </div>
              {formData.installationType !== "file" && (
                <div className="flex justify-between">
                  <span className="font-medium">Item Type:</span>
                  <span className="capitalize">{formData.itemType}</span>
                </div>
              )}
              {formData.installationType === "file" ? (
                <div className="flex justify-between">
                  <span className="font-medium">File:</span>
                  <span>{formData.file?.name || "No file selected"}</span>
                </div>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span className="font-medium">Name:</span>
                    <span>{formData.name}</span>
                  </div>
                  {formData.version && (
                    <div className="flex justify-between">
                      <span className="font-medium">Version:</span>
                      <span>{formData.version}</span>
                    </div>
                  )}
                </>
              )}
              <div className="flex justify-between">
                <span className="font-medium">Force reinstall:</span>
                <span>{formData.force ? "Yes" : "No"}</span>
              </div>
              {formData.installationType !== "file" && formData.itemType === "role" && (
                <div className="flex justify-between">
                  <span className="font-medium">Global install:</span>
                  <span>{formData.global ? "Yes" : "No"}</span>
                </div>
              )}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Modal open={open} onOpenChange={handleClose}>
      <ModalContent className="max-w-2xl">
        <ModalHeader>
          <ModalTitle>Install Ansible Role or Collection</ModalTitle>
          <ProgressIndicator
            steps={WIZARD_STEPS}
            currentStep={currentStep}
            className="mt-4"
          />
        </ModalHeader>

        <div className="px-6 py-4">
          {renderStepContent()}
        </div>

        <ModalFooter>
          <div className="flex justify-between w-full">
            <Button
              variant="outline"
              onClick={currentStep === 0 ? handleClose : handlePrevious}
            >
              {currentStep === 0 ? "Cancel" : "Previous"}
            </Button>
            <Button
              onClick={handleNext}
              disabled={!isStepValid(currentStep) || isLoading}
              loading={isLoading}
            >
              {currentStep === WIZARD_STEPS.length - 1 ? "Install" : "Next"}
            </Button>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
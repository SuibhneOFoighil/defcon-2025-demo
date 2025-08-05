"use client"

import type React from "react"

import { useCallback, useState } from "react"
import type { StepProps } from "./types"
import { WizardStepHeader } from "./wizard-step-header"
import { FileUpload } from "@/components/ui/file-upload"
import { FileText, CheckCircle2, AlertCircle } from "lucide-react"
import * as yaml from "js-yaml"
import { parseRangeConfigSafe } from "@/lib/schemas/range-config-parser"
import { logUserAction } from "@/lib/logger"

// Updated FileInfo interface to include content and validation status
interface FileInfo {
  name: string
  size: number
  type: string
  content?: unknown // The parsed YAML object
  isValid?: boolean // Whether the content is valid against the schema
}

export function ImportTemplateStep({ formData, onInputChange }: StepProps) {
  const [validationError, setValidationError] = useState<string | null>(null)

  const handleFilesChange = useCallback(
    async (files: File[]) => {
      // Clear any existing validation errors
      setValidationError(null)
      
      if (files.length === 0) {
        // No files selected - clear the current template
        onInputChange("importedTemplate", null)
        return
      }

      // For single file upload, always take the first file
      const file = files[0]
      
      try {
        // Read file content
        const content = await file.text()
        
        // Parse YAML
        let parsedYaml: unknown
        try {
          parsedYaml = yaml.load(content)
        } catch (yamlError) {
          const errorMessage = yamlError instanceof Error ? yamlError.message : 'Invalid YAML format'
          setValidationError(`YAML parsing error: ${errorMessage}`)
          
          const info: FileInfo = {
            name: file.name,
            size: file.size,
            type: file.type,
            content: null,
            isValid: false,
          }
          onInputChange("importedTemplate", info)
          return
        }

        // Validate against schema using Zod
        const validation = parseRangeConfigSafe(parsedYaml)
        const isValid = validation.success
        
        if (!validation.success) {
          // Use Zod's native error formatting
          const errorText = validation.error.errors.map(err => {
            const path = err.path.length > 0 ? err.path.join('.') : 'root'
            return `${path}: ${err.message}`
          }).join('; ')
          setValidationError(`Schema validation errors: ${errorText}`)
        }

        const info: FileInfo = {
          name: file.name,
          size: file.size,
          type: file.type,
          content: parsedYaml,
          isValid: isValid,
        }
        onInputChange("importedTemplate", info)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
        setValidationError(`File processing error: ${errorMessage}`)
        
        const info: FileInfo = {
          name: file.name,
          size: file.size,
          type: file.type,
          content: null,
          isValid: false,
        }
        onInputChange("importedTemplate", info)
      }
    },
    [onInputChange]
  )

  const handleSkipImport = () => {
    logUserAction('skip-template-import', 'ImportTemplateStep', { 
      component: 'ImportTemplateStep'
    })
    onInputChange("importedTemplate", null)
    setValidationError(null)
  }

  // Check if formData.importedTemplate is valid FileInfo for display
  let templateToDisplay: FileInfo | null = null
  if (
    formData.importedTemplate &&
    typeof formData.importedTemplate === 'object' &&
    formData.importedTemplate !== null &&
    'name' in formData.importedTemplate &&
    typeof (formData.importedTemplate).name === 'string' &&
    'size' in formData.importedTemplate &&
    typeof (formData.importedTemplate).size === 'number'
  ) {
    templateToDisplay = formData.importedTemplate as FileInfo
  }

  const isFileValid = templateToDisplay?.isValid === true && !validationError

  return (
    <div className="max-w-4xl mx-auto p-8">
      <WizardStepHeader 
        title="Import Template" 
        showSkip 
        onSkip={handleSkipImport}
        className="mb-8"
      />

      {/* File upload section */}
      <div className="space-y-6">
        <FileUpload
          onFilesChange={handleFilesChange}
          acceptedFileTypes=".yaml,.yml"
          multiple={false}
          label={templateToDisplay ? "Replace YAML template file" : "Select a single YAML template file"}
          className="w-full"
          dropzoneClassName="min-h-[280px] transition-all duration-200 ease-in-out hover:bg-muted/50"
          hideFileList={true}
          disabled={false}
        />


        {/* Validation error display */}
        {validationError && (
          <div className="p-4 border border-destructive/20 rounded-lg bg-destructive/10">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-destructive mb-1">
                  Template Upload Failed
                </h4>
                <p className="text-sm text-destructive">
                  {validationError}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Selected file display */}
        {templateToDisplay && (
          <div className="p-6 border border-border rounded-lg bg-card shadow-sm">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg border ${
                isFileValid 
                  ? 'bg-primary/10 border-primary/20' 
                  : 'bg-destructive/10 border-destructive/20'
              }`}>
                <FileText className={`w-6 h-6 ${
                  isFileValid 
                    ? 'text-primary' 
                    : 'text-destructive'
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  {isFileValid ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-success" />
                      <h3 className="text-base font-medium text-foreground">
                        Template Ready to Import
                      </h3>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-destructive" />
                      <h3 className="text-base font-medium text-foreground">
                        Template Validation Failed
                      </h3>
                    </>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-foreground font-medium truncate" title={templateToDisplay.name}>
                    {templateToDisplay.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Size: {(templateToDisplay.size / 1024).toFixed(1)} KB
                  </p>
                  {isFileValid && (
                    <p className="text-xs text-success">
                      ✓ Valid YAML format and schema
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => {
                  onInputChange("importedTemplate", null)
                  setValidationError(null)
                }}
                className="p-2 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                aria-label="Remove selected template"
                title="Remove file and select a different one"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Help text */}
        {!templateToDisplay && (
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">One file only:</span> Upload a single YAML template file
            </p>
            <p className="text-xs text-muted-foreground">
              Supported formats: <span className="font-medium">.yaml, .yml</span> • 
              Files are validated against the Ludus range configuration schema
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

"use client"

import type React from "react"
import { useCallback } from "react"
import type { StepProps } from "./types"
import { WizardStepHeader } from "./wizard-step-header"
import { FileUpload } from "@/components/ui/file-upload"
import { FileText } from "lucide-react"

export function ImportTemplateStep({ formData, onInputChange }: StepProps) {
  const handleFilesChange = useCallback(
    (files: File[]) => {
      if (files.length > 0) {
        const file = files[0];
        // Store the actual File object that the wizard expects
        onInputChange("importedTemplate", file);
      } else {
        onInputChange("importedTemplate", null);
      }
    },
    [onInputChange]
  );

  // Check if formData.importedTemplate is a File object for display
  let templateToDisplay: File | null = null;
  if (formData.importedTemplate instanceof File) {
    templateToDisplay = formData.importedTemplate;
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <WizardStepHeader 
        title="Import Template"
        className="mb-8"
      />

      {/* File upload section */}
      <div className="space-y-6">
        <FileUpload
          onFilesChange={handleFilesChange}
          acceptedFileTypes=".tar,.gz,.tgz"
          multiple={false}
          label={templateToDisplay ? "Replace template tar file" : "Select a single template tar file"}
          className="w-full"
          dropzoneClassName="min-h-[280px] transition-all duration-200 ease-in-out hover:bg-muted/50"
          hideFileList={true}
        />

        {/* Selected file display */}
        {templateToDisplay && (
          <div className="p-6 border border-border rounded-lg bg-card shadow-sm">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg border bg-primary/10 border-primary/20">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-medium text-foreground mb-2">
                  Template Ready to Import
                </h3>
                <div className="space-y-1">
                  <p className="text-sm text-foreground font-medium truncate" title={templateToDisplay.name}>
                    {templateToDisplay.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Size: {(templateToDisplay.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  onInputChange("importedTemplate", null)
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
              <span className="font-medium">One file only:</span> Upload a single template tar file
            </p>
            <p className="text-xs text-muted-foreground">
              Supported formats: <span className="font-medium">.tar, .gz, .tgz</span>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

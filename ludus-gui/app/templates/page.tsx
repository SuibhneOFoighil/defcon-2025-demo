"use client"

import { useState, useEffect, useRef } from "react"
import { PageHeader } from "@/components/layout/page-header"
import { TemplatesViewer } from "@/components/templates/templates-viewer"
import { SearchBar } from "@/components/ui/search-bar"
import { Button } from "@/components/ui/button"
import { CreateTemplateWizard } from "@/components/wizards/create-template-wizard"
import { TemplateBuildSelectionModal } from "@/components/templates/template-build-selection-modal"
import { useRangeAndTemplates } from "@/hooks/use-range-and-templates"
import { useBuildTemplates } from "@/hooks/use-build-templates"
import { useTemplatesStatus } from "@/hooks/use-templates-status"
import { useNotifications } from "@/contexts/notification-context"
import { Plus, Hammer } from "lucide-react"
import { ComponentsPageSkeleton } from "@/components/components-page-skeleton"

export default function TemplatesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [showTemplateWizard, setShowTemplateWizard] = useState(false)
  const [showBuildModal, setShowBuildModal] = useState(false)
  const { templates, loading } = useRangeAndTemplates()
  
  // Build templates functionality
  const { buildTemplates, isBuilding } = useBuildTemplates()
  const { buildingTemplates, isAnyTemplateBuilding } = useTemplatesStatus()
  const { notifyTemplateReady } = useNotifications()
  
  // Track previous building templates for completion detection
  const previousBuildingTemplatesRef = useRef<string[]>([])
  
  // Handle build templates click
  const handleBuildTemplates = () => {
    setShowBuildModal(true)
  }

  // Handle build templates from modal
  const handleBuildTemplatesFromModal = (template: string | undefined, parallel: boolean) => {
    if (template) {
      buildTemplates({ template, parallel: parallel ? 3 : 1 })
    } else {
      buildTemplates({ parallel: parallel ? 3 : 1 })
    }
  }

  // Monitor build completion and send notifications
  useEffect(() => {
    const currentBuildingTemplateNames = buildingTemplates.map(bt => bt.template)
    const previousBuildingTemplateNames = previousBuildingTemplatesRef.current
    
    // Find templates that were building but are no longer building (completed)
    const completedTemplates = previousBuildingTemplateNames.filter(
      templateName => !currentBuildingTemplateNames.includes(templateName)
    )
    
    // Send notifications for completed templates
    completedTemplates.forEach(templateName => {
      notifyTemplateReady(templateName)
    })
    
    // Update ref with current building templates
    previousBuildingTemplatesRef.current = currentBuildingTemplateNames
  }, [buildingTemplates, notifyTemplateReady])

  // Filter templates based on search
  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase())
  )


  return (
    <>
      <PageHeader title="Templates" />

      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {loading ? (
            <ComponentsPageSkeleton />
          ) : (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <SearchBar
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder="Search templates..."
                  className="max-w-md"
                />
                <div className="flex items-center gap-3">
                  <Button
                    onClick={handleBuildTemplates}
                    variant="outline"
                    disabled={isBuilding || isAnyTemplateBuilding}
                  >
                    <Hammer className="mr-2 h-4 w-4" />
                    Build Templates
                  </Button>
                  <Button
                    onClick={() => setShowTemplateWizard(true)}
                    variant="elevated"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Template
                  </Button>
                </div>
              </div>

              {/* Templates Content */}
              <TemplatesViewer
                data={filteredTemplates}
                isLoading={loading}
                enablePagination={false}
              />
            </div>
          )}
        </div>
      </main>

      {/* Wizards */}
      <CreateTemplateWizard
        open={showTemplateWizard}
        onOpenChange={setShowTemplateWizard}
      />

      {/* Build Templates Modal */}
      <TemplateBuildSelectionModal
        open={showBuildModal}
        onClose={() => setShowBuildModal(false)}
        onBuildTemplates={handleBuildTemplatesFromModal}
        templates={templates}
        isBuilding={isBuilding || isAnyTemplateBuilding}
      />
    </>
  )
}
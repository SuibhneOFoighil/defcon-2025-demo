"use client"

import { useState, useEffect } from "react"
import { Eye } from "lucide-react"
import { cn } from "@/lib/utils"
import { getTemplateIcon } from "@/lib/utils/template-icons"
import type { StepProps } from "./types"
import { Card, CardContent } from "@/components/ui/card/card-components"
import { Badge } from "@/components/ui/badge"
import { WizardStepHeader } from "./wizard-step-header"
import { Button } from "@/components/ui/button"
import { componentLogger, logUserAction } from "@/lib/logger"

// Template data type based on Ludus API
interface Template {
  name: string
  built: boolean
}

// Mock data for Storybook (matches the pattern from templates-grid)
export const MOCK_TEMPLATES: Template[] = [
  { name: "Template-001", built: true },
  { name: "Template-002", built: true },
  { name: "Template-003", built: false },
  { name: "debian-12-x64-server-template", built: true },
  { name: "kali-x64-desktop-template", built: true },
  { name: "win11-22h2-x64-enterprise-template", built: true },
  { name: "win2019-server-x64-template", built: true },
  { name: "debian-10-x64-server-template", built: false },
  { name: "rocky-9-x64-server-template", built: false },
]

// Template card component matching TemplatesCard styling
interface TemplateCardProps {
  template: Template
  isSelected: boolean
  onSelect: (templateName: string) => void
  onPreview: (templateName: string) => void
}

function TemplateCard({ template, isSelected, onSelect, onPreview }: TemplateCardProps) {

  // Get build status badge
  const getBuildStatusBadge = () => {
    if (template.built) {
      return <Badge variant="success" size="sm">Built</Badge>;
    } else {
      return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white" size="sm">Building</Badge>;
    }
  };

  // Get template description based on name
  const getTemplateDescription = () => {
    const name = template.name.toLowerCase();
    if (name.includes('kali')) return 'Penetration Testing Platform';
    if (name.includes('win11')) return 'Windows 11 Enterprise';
    if (name.includes('win2019')) return 'Windows Server 2019';
    if (name.includes('debian')) return 'Debian Linux Server';
    if (name.includes('rocky')) return 'Rocky Linux Server';
    if (name.includes('template-003')) return 'Red Team Training Ground';
    return 'Virtual Machine Template';
  };

  const handleCardClick = () => {
    onSelect(template.name);
  };

  const handlePreviewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPreview(template.name);
  };

  return (
    <Card 
      className={cn(
        "group relative cursor-pointer transition-all hover:border-muted",
        isSelected && "!border-primary ring-1 ring-primary",
      )}
      padding="none"
      onClick={handleCardClick}
    >
      <CardContent className="p-0">
        {/* Template Icon/Visual */}
        <div className="p-4 pb-0">
          <div className="h-32 bg-muted/30 rounded-lg border border-border/50 flex items-center justify-center">
            {getTemplateIcon(template.name)}
          </div>
        </div>

        {/* Card Content */}
        <div className="p-4 pt-3">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-foreground truncate mb-1">{template.name}</h3>
              <p className="text-xs text-muted-foreground mb-2">
                {getTemplateDescription()}
              </p>
              {/* Build Status Badge */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Status:</span>
                {getBuildStatusBadge()}
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePreviewClick}
              aria-label={`Preview ${template.name}`}
              className="h-8 w-8 text-muted-foreground hover:text-foreground flex-shrink-0"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>

          {/* Template Status */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Ready to use:</span>
            <span className="text-xs text-muted-foreground">{template.built ? "Yes" : "Building..."}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function TemplateSelectionStep({ formData, onInputChange }: StepProps) {
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>((formData.selectedTemplates as string[]) || [])
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch templates from API
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/ludus/templates')
        
        if (!response.ok) {
          // Use mock data for development/Storybook
          setTemplates(MOCK_TEMPLATES)
          setLoading(false)
          return
        }
        
        const data = await response.json()
        setTemplates(data || MOCK_TEMPLATES)
      } catch (err) {
        // Fallback to mock data on error
        setTemplates(MOCK_TEMPLATES)
        componentLogger.warn({ error: err instanceof Error ? err.message : String(err) }, 'Using mock template data due to API error')
      } finally {
        setLoading(false)
      }
    }

    fetchTemplates()
  }, [])

  const handleTemplateSelect = (templateName: string) => {
    const newSelectedTemplates = selectedTemplates.includes(templateName)
      ? selectedTemplates.filter(t => t !== templateName)
      : [...selectedTemplates, templateName]
    
    setSelectedTemplates(newSelectedTemplates)
    onInputChange("selectedTemplates", newSelectedTemplates)

    // Update form name and description based on selected templates
    if (newSelectedTemplates.length === 1) {
      onInputChange("name", newSelectedTemplates[0])
      
      // Set description based on template name
      const name = newSelectedTemplates[0].toLowerCase();
      let description = "";
      if (name.includes('kali')) description = 'Penetration Testing Platform';
      else if (name.includes('win11')) description = 'Windows 11 Enterprise Environment';
      else if (name.includes('win2019')) description = 'Windows Server 2019 Environment';
      else if (name.includes('debian')) description = 'Debian Linux Server Environment';
      else if (name.includes('rocky')) description = 'Rocky Linux Server Environment';
      else if (name.includes('template-003')) description = 'Red Team Training Ground';
      else description = 'Virtual Machine Environment';
      
      onInputChange("description", description)
    } else if (newSelectedTemplates.length > 1) {
      onInputChange("name", `Multi-VM Range (${newSelectedTemplates.length} templates)`)
      onInputChange("description", `Range with multiple VM types: ${newSelectedTemplates.join(", ")}`)
    } else {
      onInputChange("name", "")
      onInputChange("description", "")
    }
  }

  const handleTemplatePreview = (templateName: string) => {
    // Future: open template details modal
    logUserAction('template-preview', 'CreateRangeWizard', { templateName })
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <WizardStepHeader title="Select Templates" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="h-64 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <WizardStepHeader title="Select Templates" />

      {/* Selection info */}
      {selectedTemplates.length > 0 && (
        <div className="mb-4 text-sm text-muted-foreground">
          Selected ({selectedTemplates.length}): <span className="font-medium text-foreground">{selectedTemplates.join(", ")}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-h-[calc(100vh-280px)] overflow-y-auto pr-2">
        {templates.map((template) => (
          <TemplateCard
            key={template.name}
            template={template}
            isSelected={selectedTemplates.includes(template.name)}
            onSelect={handleTemplateSelect}
            onPreview={handleTemplatePreview}
          />
        ))}
      </div>

      {templates.length === 0 && (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-muted-foreground">No templates available</p>
            <p className="text-sm text-muted-foreground mt-2">
              Contact your administrator to build templates
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

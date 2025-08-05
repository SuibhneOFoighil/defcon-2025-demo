"use client"

import React, { useState } from "react"
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter } from "@/components/ui/modal/modal"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CheckCircle, Clock, AlertCircle, Layers, Package } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Template } from "@/lib/types"
import { useTemplatesStatus } from "@/hooks/use-templates-status"

interface TemplateBuildSelectionModalProps {
  open: boolean
  onClose: () => void
  onBuildTemplates: (template: string | undefined, parallel: boolean) => void
  templates: Template[]
  isBuilding?: boolean
}

export function TemplateBuildSelectionModal({
  open,
  onClose,
  onBuildTemplates,
  templates,
  isBuilding = false,
}: TemplateBuildSelectionModalProps) {
  const [buildMode, setBuildMode] = useState<'all' | 'specific'>('all')
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [buildParallel, setBuildParallel] = useState(true)
  
  const { buildingTemplates } = useTemplatesStatus()
  const buildingTemplateNames = new Set(buildingTemplates.map(bt => bt.template))

  // Reset selection when modal opens
  React.useEffect(() => {
    if (open) {
      setBuildMode('all')
      setSelectedTemplate('')
    }
  }, [open])

  // Separate templates into built and unbuilt
  const builtTemplates = templates.filter(template => template.built)
  const unbuiltTemplates = templates.filter(template => !template.built)

  const handleSelectTemplate = (templateName: string) => {
    setSelectedTemplate(templateName)
    setBuildMode('specific')
  }

  const handleBuild = () => {
    if (buildMode === 'all') {
      onBuildTemplates(undefined, buildParallel)
    } else if (selectedTemplate) {
      onBuildTemplates(selectedTemplate, buildParallel)
    }
    onClose()
  }

  const getTemplateStatus = (template: Template) => {
    if (buildingTemplateNames.has(template.name)) {
      return { icon: Clock, color: "text-amber-500", label: "Building..." }
    }
    if (template.built) {
      return { icon: CheckCircle, color: "text-green-500", label: "Built" }
    }
    return { icon: AlertCircle, color: "text-muted-foreground", label: "Not built" }
  }

  const renderTemplateItem = (template: Template) => {
    const status = getTemplateStatus(template)
    const isSelected = selectedTemplate === template.name
    const isBuilding = buildingTemplateNames.has(template.name)
    
    return (
      <div
        key={template.name}
        className={cn(
          "flex items-center px-3 py-2 rounded-md hover:bg-muted cursor-pointer transition-colors",
          isSelected && "bg-muted"
        )}
        onClick={() => handleSelectTemplate(template.name)}
        role="radio"
        aria-checked={isSelected}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            if (e.target === e.currentTarget) {
              handleSelectTemplate(template.name)
            }
          }
        }}
      >
        <div className="w-4 h-4 rounded-full border-2 border-muted-foreground mr-3 flex items-center justify-center">
          {isSelected && <div className="w-2 h-2 rounded-full bg-primary" />}
        </div>
        
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <status.icon 
            className={cn(
              "h-4 w-4 shrink-0",
              status.color,
              isBuilding && "animate-pulse"
            )} 
          />
          <div className="flex-1 min-w-0">
            <span className="text-sm font-medium text-foreground line-clamp-2 leading-tight">
              {template.name}
            </span>
          </div>
        </div>
      </div>
    )
  }

  const hasTemplates = templates.length > 0
  const canBuild = buildMode === 'all' || selectedTemplate !== ''

  return (
    <Modal open={open} onOpenChange={onClose}>
      <ModalContent size="md">
        <ModalHeader>
          <ModalTitle>Select Templates to Build</ModalTitle>
        </ModalHeader>

        <div className="py-4">
          {!hasTemplates ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                No templates exist.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Add a template first to enable building.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Build Mode Selection */}
              <div className="space-y-2">
                <div
                  className={cn(
                    "flex items-center px-3 py-2 rounded-md hover:bg-muted cursor-pointer transition-colors",
                    buildMode === 'all' && "bg-muted"
                  )}
                  onClick={() => setBuildMode('all')}
                  role="radio"
                  aria-checked={buildMode === 'all'}
                  tabIndex={0}
                >
                  <div className="w-4 h-4 rounded-full border-2 border-muted-foreground mr-3 flex items-center justify-center">
                    {buildMode === 'all' && <div className="w-2 h-2 rounded-full bg-primary" />}
                  </div>
                  <div className="flex items-center gap-2 flex-1">
                    <Layers className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">
                      All Templates ({templates.length})
                    </span>
                  </div>
                </div>

                <div
                  className={cn(
                    "flex items-center px-3 py-2 rounded-md hover:bg-muted cursor-pointer transition-colors",
                    buildMode === 'specific' && "bg-muted"
                  )}
                  onClick={() => setBuildMode('specific')}
                  role="radio"
                  aria-checked={buildMode === 'specific'}
                  tabIndex={0}
                >
                  <div className="w-4 h-4 rounded-full border-2 border-muted-foreground mr-3 flex items-center justify-center">
                    {buildMode === 'specific' && <div className="w-2 h-2 rounded-full bg-primary" />}
                  </div>
                  <div className="flex items-center gap-2 flex-1">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">
                      Specific Template
                    </span>
                  </div>
                </div>
              </div>

              {/* Template Selection */}
              {buildMode === 'specific' && (
                <ScrollArea className="h-[280px] pr-3">
                  <div className="space-y-1">
                    {unbuiltTemplates.map(template => renderTemplateItem(template))}
                    {builtTemplates.map(template => renderTemplateItem(template))}
                  </div>
                </ScrollArea>
              )}

              {/* Build Options */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Build Mode</span>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="buildMode"
                        checked={buildParallel}
                        onChange={() => setBuildParallel(true)}
                        className="w-4 h-4 text-primary"
                      />
                      <span className="text-sm text-foreground">Parallel</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="buildMode"
                        checked={!buildParallel}
                        onChange={() => setBuildParallel(false)}
                        className="w-4 h-4 text-primary"
                      />
                      <span className="text-sm text-foreground">Sequential</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <ModalFooter>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            variant="elevated" 
            onClick={handleBuild} 
            disabled={!canBuild || isBuilding}
          >
            {buildMode === 'all' 
              ? `Build All Templates (${templates.length})`
              : selectedTemplate 
                ? 'Build Selected Template'
                : 'Build Template'
            }
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
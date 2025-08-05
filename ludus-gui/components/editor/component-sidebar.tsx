"use client"

import React, { useState, useEffect, useRef } from "react"
import { Package, PanelLeft, ChevronLeft, ChevronRight, Hammer, X, CheckCircle, Clock, MoreHorizontal, Upload, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getTemplateIcon } from "@/lib/utils/template-icons"
import { useUserPreferences } from "@/hooks/use-user-preferences-local"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Template } from "@/lib/types"
import { useBuildTemplates } from "@/hooks/use-build-templates"
import { useTemplatesStatus } from "@/hooks/use-templates-status"
import { CreateTemplateWizard } from "@/components/wizards/create-template-wizard"
import { TemplateBuildSelectionModal } from "@/components/templates/template-build-selection-modal"
import { useQueryClient } from "@tanstack/react-query"
import { useTutorialStyling } from "@/hooks/use-tutorial-styling"
import { cn } from "@/lib/utils"

interface ComponentSidebarProps {
  templates: Template[]
  onTemplateClick: (template: Template) => void
  updateTemplateUsage: (templateName: string) => void
  onBuildTemplates?: () => void
  onKillProcess?: () => void
  isBuilding?: boolean
}

export function ComponentSidebar({
  templates,
  onTemplateClick,
  updateTemplateUsage,
  onBuildTemplates,
  onKillProcess,
  isBuilding,
}: ComponentSidebarProps) {
  const [activeCard, setActiveCard] = useState<string | null>(null)
  const [showTemplateUploadModal, setShowTemplateUploadModal] = useState(false)
  const [showBuildModal, setShowBuildModal] = useState(false)
  
  // Use preferences hook for persisted collapse state
  const { preferences, setComponentSidebarCollapsed } = useUserPreferences()
  const isCollapsed = preferences?.componentSidebarCollapsed ?? false

  
  const queryClient = useQueryClient()

  // Use hooks for build functionality and status
  const { buildTemplates, isBuilding: isMutationBuilding } = useBuildTemplates()
  const { buildingTemplates, isAnyTemplateBuilding } = useTemplatesStatus()

  // Combine building state from prop and mutations
  const actuallyBuilding = isBuilding || isMutationBuilding || isAnyTemplateBuilding

  // Create a map of building templates for quick lookup
  const buildingTemplateNames = new Set(buildingTemplates.map(bt => bt.template))

  // Just use templates directly
  const filteredItems = templates


  const handleItemClick = (template: Template) => {
    setActiveCard(template.name)
    onTemplateClick(template)
    // Reset active state after animation completes
    setTimeout(() => {
      setActiveCard(null)
    }, 300)
  }

  // Handle build templates click
  const handleBuildTemplates = () => {
    if (onBuildTemplates) {
      onBuildTemplates()
    } else {
      // Open modal for template selection
      setShowBuildModal(true)
    }
  }

  // Handle build templates from modal
  const handleBuildTemplatesFromModal = (template: string | undefined, parallel: boolean) => {
    if (template) {
      buildTemplates({ template, parallel: parallel ? 3 : 1 })
    } else {
      buildTemplates({ parallel: parallel ? 3 : 1 })
    }
  }

  // Get template status for display
  const getTemplateStatus = (template: Template) => {
    if (buildingTemplateNames.has(template.name)) {
      return 'building'
    }
    return template.built ? 'built' : 'not-built'
  }

  // Internal component to render each template with a tooltip only when its name is truncated
  const TemplateCard: React.FC<{ template: Template }> = ({ template }) => {
    const nameRef = useRef<HTMLDivElement>(null)
    const [isTruncated, setIsTruncated] = useState(false)
    
    // Tutorial styling hook
    const { tutorialClasses } = useTutorialStyling([
      `[data-template-name="${template.name}"]`
    ])

    // Check for text overflow (truncation)
    const checkOverflow = () => {
      const el = nameRef.current
      if (el) {
        setIsTruncated(el.scrollWidth > el.clientWidth)
      }
    }

    useEffect(() => {
      // Initial check
      checkOverflow()
      // Re-check on window resize to account for sidebar width changes
      window.addEventListener("resize", checkOverflow)
      return () => window.removeEventListener("resize", checkOverflow)
    }, [template.name])

    const card = (
      <div
        className={cn(
          "relative flex items-center justify-between p-3 bg-card rounded-lg border border-border cursor-pointer hover:border-primary/40 hover:bg-primary/5 hover:shadow-sm transition-all duration-200 overflow-hidden group",
          activeCard === template.name ? "bg-primary/10 border-primary/60 shadow-sm" : "",
          tutorialClasses
        )}
        onClick={() => handleItemClick(template)}
        draggable
        onDragStart={(event) => {
          event.dataTransfer.setData("application/reactflow", template.name)
          event.dataTransfer.effectAllowed = "move"
          updateTemplateUsage(template.name)
        }}
        data-template-name={template.name}
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center min-w-0">
            <div className="flex-shrink-0">
              {getTemplateIcon(template.name, "h-4 w-4 text-foreground")}
            </div>
            <div className="ml-3 min-w-0 flex-1">
              {/* Attach ref here to detect truncation */}
              <div ref={nameRef} className="text-sm font-medium text-foreground truncate">
                {template.name}
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                {getTemplateStatus(template) === 'building' ? (
                  <>
                    <Clock className="h-3 w-3 text-amber-500 animate-pulse" />
                    <span className="text-xs text-amber-600 dark:text-amber-400">Building...</span>
                  </>
                ) : getTemplateStatus(template) === 'built' ? (
                  <>
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span className="text-xs text-muted-foreground">Built</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Not built</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )

    // Wrap in tooltip only if truncated
    return isTruncated ? (
      <Tooltip>
        <TooltipTrigger asChild>{card}</TooltipTrigger>
        <TooltipContent side="right">
          <p className="whitespace-nowrap">{template.name}</p>
        </TooltipContent>
      </Tooltip>
    ) : (
      card
    )
  }


  return (
    <div className="relative">
      {/* Expand button – visible only when collapsed */}
      {isCollapsed && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="fixed left-4 top-20 h-8 w-8 rounded-md border border-border bg-card shadow-md hover:bg-secondary z-40 group"
                onClick={() => setComponentSidebarCollapsed(false)}
              >
                {/* Default sidebar icon */}
                <PanelLeft className="h-4 w-4 block group-hover:hidden" />
                {/* Show outward chevron on hover */}
                <ChevronRight className="h-4 w-4 hidden group-hover:block" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Templates</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      <div
        className={`border-r border-border bg-card h-full flex flex-col transition-all duration-300 ease-in-out flex-shrink-0 ${
          isCollapsed ? "-translate-x-full w-0 min-w-0 overflow-hidden" : "w-[280px]"
        }`}
      >
        <div className="p-4 flex flex-col h-full">
          {/* Components Section Header (always rendered) */}
          <div className="flex items-center justify-between w-full text-left mb-4">
            <h3 className="text-sm font-medium text-foreground flex items-center">
              <Package className="h-4 w-4 mr-2" />
              Templates
            </h3>
            <div className="flex items-center gap-1">
              {/* Collapse button */}
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 p-0 group"
                onClick={() => setComponentSidebarCollapsed(true)}
              >
                {/* Default sidebar icon */}
                <PanelLeft className="h-4 w-4 block group-hover:hidden" />
                {/* Show inward chevron on hover */}
                <ChevronLeft className="h-4 w-4 hidden group-hover:block" />
              </Button>
              {/* Actions Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                  >
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => setShowTemplateUploadModal(true)}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Template
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleBuildTemplates}
                    disabled={actuallyBuilding}
                  >
                    <Hammer className="h-4 w-4 mr-2" />
                    Build Templates
                  </DropdownMenuItem>
                  {actuallyBuilding && (
                    <DropdownMenuItem
                      onClick={onKillProcess}
                      disabled={!onKillProcess}
                      className="text-destructive focus:text-destructive"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Stop Build Templates
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Templates List - Hidden when collapsed */}
          {!isCollapsed && (
              <div className="flex-1 min-h-0 overflow-y-auto p-1 space-y-2">
                {filteredItems.length === 0 ? (
                  <div className="text-center text-sm text-muted-foreground p-6">
                    <p>No templates available</p>
                  </div>
                ) : (
                  filteredItems.map((template) => (
                    <TemplateCard key={template.name} template={template} />
                  ))
                )}
              </div>
          )}

          {/* Collapsed icon rail removed to fully hide sidebar when collapsed */}
        </div>

        {/* Template Upload Modal */}
        <CreateTemplateWizard
          open={showTemplateUploadModal}
          onOpenChange={setShowTemplateUploadModal}
          onSuccess={() => {
            // Refresh templates list
            queryClient.invalidateQueries({
              queryKey: ['rangeAndTemplates', 'templates']
            })
          }}
        />

        {/* Build Templates Modal */}
        <TemplateBuildSelectionModal
          open={showBuildModal}
          onClose={() => setShowBuildModal(false)}
          onBuildTemplates={handleBuildTemplatesFromModal}
          templates={templates}
          isBuilding={actuallyBuilding}
        />

      </div>
    </div>
    );
  }

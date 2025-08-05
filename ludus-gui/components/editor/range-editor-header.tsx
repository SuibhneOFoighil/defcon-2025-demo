"use client"

import { ChevronLeft, Bug, X, Play, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

import { IconButton } from "@/components/ui/icon-button"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Sheet, SheetTrigger } from "@/components/ui/sheet"
import { NotificationBell } from "@/components/notifications/notification-bell"
import { NotificationPanel } from "@/components/notifications/notification-panel"
import { TestingModeBanner } from "./testing-mode-banner"
import { RangeActionsMenu } from "./range-actions-menu"
import { RangeDetailsModalTrigger } from "./range-details-modal-trigger"
import { DomainAllowlistModalTrigger } from "./domain-allowlist-modal-trigger"
import { getStateBadgeVariant, type RangeStatus } from "@/lib/utils/range-status"
import type { UseMutationResult } from "@tanstack/react-query"
import { useTutorialStyling } from "@/hooks/use-tutorial-styling"
import { cn } from "@/lib/utils"

// Define proper mutation types
type RangeMutation = UseMutationResult<unknown, Error, unknown, unknown>
type TestingMutation = UseMutationResult<unknown, Error, Record<string, never>, unknown>
type PowerMutation = UseMutationResult<unknown, Error, { userID: string }, unknown>
type AbortMutation = UseMutationResult<unknown, Error, { userID: string }, unknown>
type DestroyMutation = UseMutationResult<unknown, Error, { userID: string }, unknown>

interface RangeEditorHeaderProps {
  projectMetadata: {
    id: string
    name: string
    status: string
  }
  rangeStats: {
    cpus: number
    ram: number
    disk: number
    vlans: {
      name: string
      description: string
    }[]
  }
  testingMode: boolean
  allowedDomains: string[]
  allowedIPs: string[]
  totalVMCount: number
  totalCPUs: number
  totalRAM: number
  effectiveRangeData?: {
    rangeState?: string
    testingEnabled?: boolean
    allowedDomains?: string[]
    allowedIPs?: string[]
  }
  // Mutations
  deployRangeMutation: RangeMutation
  abortDeploymentMutation: AbortMutation
  startTestingMutation: TestingMutation
  stopTestingMutation: TestingMutation
  powerOnMutation: PowerMutation
  powerOffMutation: PowerMutation
  destroyRangeMutation: DestroyMutation
  // Handlers
  onDeployRange: () => void
  onAbortDeployment: () => void
  onPowerOnAll: () => void
  onPowerOffAll: () => void
  onDestroyAll: () => void
  onStartTesting: () => void
  onStopTesting: () => void
  onSaveRangeDetails: (data: { name: string; cpus: number; ram: number; disk: number }) => void
  onOpenLogs: () => void // eslint-disable-line @typescript-eslint/no-unused-vars
  // Notification panel
  isNotificationPanelOpen: boolean
  setIsNotificationPanelOpen: (open: boolean) => void
}

// Helper function to determine deploy button state and text
function getDeployButtonInfo(rangeState: RangeStatus | undefined, testingMode: boolean) {
  const normalizedState = rangeState?.toUpperCase() as RangeStatus
  
  switch (normalizedState) {
    case "PENDING":
    case "DEPLOYING":
      return {
        disabled: true,
        text: testingMode ? "Test Deploying..." : "Deploying...",
        canDeploy: false
      }
    case "SUCCESS":
    case "ACTIVE":
      return {
        disabled: false,
        text: testingMode ? "Test Redeploy" : "Redeploy",
        canDeploy: true
      }
    case "ERROR":
    case "FAILURE":
    case "NEVER DEPLOYED":
    case "UNKNOWN":
    default:
      return {
        disabled: false,
        text: testingMode ? "Test Deploy" : "Deploy",
        canDeploy: true
      }
  }
}

export function RangeEditorHeader({
  projectMetadata,
  rangeStats,
  testingMode,
  allowedDomains,
  allowedIPs,
  totalVMCount,
  totalCPUs,
  totalRAM,
  effectiveRangeData,
  deployRangeMutation,
  abortDeploymentMutation,
  startTestingMutation,
  stopTestingMutation,
  powerOnMutation,
  powerOffMutation,
  destroyRangeMutation,
  onDeployRange,
  onAbortDeployment,
  onPowerOnAll,
  onPowerOffAll,
  onDestroyAll,
  onStartTesting,
  onStopTesting,
  onSaveRangeDetails,
  onOpenLogs, // eslint-disable-line @typescript-eslint/no-unused-vars
  isNotificationPanelOpen,
  setIsNotificationPanelOpen
}: RangeEditorHeaderProps) {
  const router = useRouter()
  
  // Extract userID from composite ID
  const userId = projectMetadata.id.split('-')[0]
  
  // Tutorial styling hook for deploy button
  const { tutorialClasses: deployButtonClasses } = useTutorialStyling([
    '[data-action="deploy-range"]'
  ])

  const handleBackNavigation = () => {
    router.push('/')
  }

  const handleTestingToggle = () => {
    if (testingMode) {
      onStopTesting();
    } else {
      onStartTesting();
    }
  };

  return (
    <Sheet open={isNotificationPanelOpen} onOpenChange={setIsNotificationPanelOpen}>
      <header className="shrink-0 z-10 bg-card/60 backdrop-blur-sm border-b border-border/60">
        <div className="p-3">
          <div className="flex justify-between items-center">
            {/* Left side - Consolidated Range Info */}
            <div className="flex items-center space-x-3">
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <IconButton variant="ghost" size="sm" onClick={handleBackNavigation}>
                    <ChevronLeft className="h-5 w-5" />
                  </IconButton>
                </TooltipTrigger>
                <TooltipContent side="bottom" align="center">
                  <span className="text-xs font-medium">Back to Dashboard</span>
                </TooltipContent>
              </Tooltip>
              
              {/* Range Info - Horizontal Layout */}
              <div className="flex items-center space-x-6">
                {/* Range Name & Status */}
                <div className="flex items-center space-x-2">
                  <h1 className="text-lg font-semibold text-foreground">
                    {projectMetadata.name}
                  </h1>
                  <Badge 
                    variant={getStateBadgeVariant(projectMetadata.status as RangeStatus)} 
                    className="text-xs"
                  >
                    {projectMetadata.status}
                  </Badge>
                </div>

                {/* Resource Metrics Block */}
                <div className="flex items-center space-x-4 px-3 py-1.5 bg-muted/30 rounded-md border border-border/50">
                  <div className="text-sm">
                    <span className="font-medium text-foreground">{totalVMCount}</span>
                    <span className="text-muted-foreground ml-1">VMs</span>
                  </div>
                  <div className="w-px h-4 bg-border"></div>
                  <div className="text-sm">
                    <span className="font-medium text-foreground">{totalCPUs}</span>
                    <span className="text-muted-foreground ml-1">CPUs</span>
                  </div>
                  <div className="w-px h-4 bg-border"></div>
                  <div className="text-sm">
                    <span className="font-medium text-foreground">{totalRAM}GB</span>
                    <span className="text-muted-foreground ml-1">RAM</span>
                  </div>
                </div>

                {/* Range Settings */}
                <RangeDetailsModalTrigger
                  projectMetadata={projectMetadata}
                  rangeStats={rangeStats}
                  onSave={onSaveRangeDetails}
                />
              </div>
            </div>

            {/* Right side - Action Buttons */}
            <div className="flex items-center space-x-3">
              {/* Testing Mode Toggle Button */}
              <Button
                variant={testingMode ? 'secondary' : 'outline'}
                size="sm"
                className="min-w-[120px] flex items-center"
                onClick={handleTestingToggle}
                disabled={startTestingMutation.isPending || stopTestingMutation.isPending}
              >
                {(startTestingMutation.isPending || stopTestingMutation.isPending) ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Bug className={`mr-2 h-4 w-4 ${testingMode ? 'text-green-600' : ''}`} />
                )}
                {testingMode ? 'Stop Testing' : 'Start Testing'}
                {testingMode && (
                  <span className="ml-2 w-2 h-2 rounded-full bg-green-600 animate-pulse" />
                )}
              </Button>

              {/* Deploy/Abort Button */}
              {(
                effectiveRangeData?.rangeState?.toUpperCase() === 'DEPLOYING' ||
                effectiveRangeData?.rangeState?.toUpperCase() === 'PENDING' ||
                projectMetadata.status === 'DEPLOYING' ||
                deployRangeMutation.isPending
              ) && !abortDeploymentMutation.isPending ? (
                <Button
                  variant="elevated"
                  size="sm"
                  className="min-w-[120px]"
                  onClick={onAbortDeployment}
                  disabled={abortDeploymentMutation.isPending}
                >
                  {abortDeploymentMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <X className="mr-2 h-4 w-4" />
                  )}
                  {abortDeploymentMutation.isPending ? 'Aborting...' : 'Abort Deployment'}
                </Button>
              ) : (
                <Button
                  variant="elevated"
                  size="sm"
                  className={cn("min-w-[120px]", deployButtonClasses)}
                  onClick={onDeployRange}
                  disabled={getDeployButtonInfo(projectMetadata.status as RangeStatus, testingMode).disabled}
                  loading={deployRangeMutation.isPending}
                  data-action="deploy-range"
                >
                  <Play className="mr-2 h-4 w-4" />
                  {getDeployButtonInfo(projectMetadata.status as RangeStatus, testingMode).text}
                </Button>
              )}

              {/* Range Actions Menu */}
              <RangeActionsMenu
                powerOnMutation={powerOnMutation}
                powerOffMutation={powerOffMutation}
                destroyRangeMutation={destroyRangeMutation}
                onPowerOnAll={onPowerOnAll}
                onPowerOffAll={onPowerOffAll}
                onDestroyAll={onDestroyAll}
                rangeName={projectMetadata.name}
                vmCount={totalVMCount}
                userId={userId}
              />

              {/* Vertical Divider */}
              <div className="h-6 w-px bg-border" />

              {/* Notification Bell */}
              <SheetTrigger asChild>
                <NotificationBell />
              </SheetTrigger>
            </div>
          </div>
        </div>
      </header>

      {/* Testing Mode Banner */}
      {testingMode && (
        <DomainAllowlistModalTrigger
          userID={projectMetadata.id.split('-')[0]}
          allowedDomains={allowedDomains}
          allowedIPs={allowedIPs}
        >
          <TestingModeBanner onConfigureAllowlist={() => {/* Handled by wrapper */}} />
        </DomainAllowlistModalTrigger>
      )}
      
      <NotificationPanel />
    </Sheet>
  )
}
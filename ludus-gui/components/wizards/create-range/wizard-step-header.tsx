"use client"

import type React from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface WizardStepHeaderProps {
  title: string
  showSkip?: boolean
  onSkip?: () => void
  className?: string
  children?: React.ReactNode
}

export function WizardStepHeader({ title, showSkip = false, onSkip, className, children }: WizardStepHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between mb-6", className)}>
      <h2 className={cn("text-lg font-medium text-[hsl(var(--foreground))] dark:text-shadow-sm")}>{title}</h2>
      <div className="flex items-center gap-4">
        {showSkip && (
          <Button variant="link" size="sm" onClick={onSkip} className="text-sm font-medium">
            Skip
          </Button>
        )}
        {children}
      </div>
    </div>
  )
}

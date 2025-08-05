"use client"

import { cn } from "@/lib/utils"

interface WizardStepHeaderProps {
  title: string
  description?: string
  className?: string
}

export function WizardStepHeader({ 
  title, 
  description, 
  className 
}: WizardStepHeaderProps) {
  return (
    <div className={cn("text-center", className)}>
      <h2 className="text-xl font-semibold text-foreground mb-2">
        {title}
      </h2>
      {description && (
        <p className="text-sm text-muted-foreground max-w-lg mx-auto">
          {description}
        </p>
      )}
    </div>
  )
}
import { cn } from "@/lib/utils"

export interface Step {
  id: string | number
  label: string
  description?: string
}

interface ProgressIndicatorProps {
  steps: Step[]
  currentStep: number
  className?: string
  primaryColor?: string
}

export function ProgressIndicator({
  steps,
  currentStep,
  className,
  primaryColor,
}: ProgressIndicatorProps) {
  const progressColor = primaryColor || "hsl(var(--primary))"

  return (
    <div className={cn("w-full max-w-2xl mx-auto mt-4", className)}>
      <div className="relative flex justify-between px-6">
        {/* Progress line */}
        <div className="absolute top-4 left-0 w-full h-[2px] bg-muted -translate-y-1/2">
          <div
            className="h-full bg-primary transition-all duration-300 ease-in-out"
            style={{
              width: `${(currentStep / (steps.length - 1)) * 100}%`,
              backgroundColor: progressColor,
            }}
          />
        </div>

        {/* Steps */}
        {steps.map((step, index) => (
          <div key={step.id} className="flex flex-col items-center z-10">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full",
                index <= currentStep
                  ? "text-primary-foreground"
                  : "bg-muted text-muted-foreground",
              )}
              style={{
                backgroundColor: index <= currentStep ? progressColor : undefined,
              }}
            >
              {index + 1}
            </div>
            <span
              className={cn(
                "text-xs mt-2 text-center",
                index === currentStep
                  ? "font-medium"
                  : index < currentStep
                    ? "text-foreground"
                    : "text-muted-foreground",
              )}
              style={{
                color: index === currentStep ? progressColor : undefined,
              }}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

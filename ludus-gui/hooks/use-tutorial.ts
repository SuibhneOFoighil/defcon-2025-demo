import { useState, useCallback } from 'react'

export interface TutorialStepValidation {
  type: 'element-exists' | 'element-count' | 'attribute-value' | 'custom'
  selector?: string // For element-exists/element-count
  expectedCount?: number // For element-count
  attribute?: string // For attribute-value
  expectedValue?: any // For attribute-value
  customValidator?: () => boolean // For custom logic
}

export interface TutorialStep {
  id: string
  targetSelector: string // CSS selector for the element to highlight
  title: string
  description: string
  position: 'top' | 'bottom' | 'left' | 'right'
  offset?: { x: number; y: number }
  
  // NEW: Validation logic
  validation?: TutorialStepValidation
  
  // NEW: What action triggers this step completion
  completionTrigger: 'manual' | 'auto-detect'
}

export function useTutorial(steps: TutorialStep[]) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  const startTutorial = useCallback(() => {
    setCurrentStep(0)
    setIsVisible(true)
  }, [])

  const nextStep = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      setIsVisible(false)
    }
  }, [currentStep, steps.length])

  const previousStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }, [currentStep])

  const closeTutorial = useCallback(() => {
    setIsVisible(false)
  }, [])

  const goToStep = useCallback((stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      setCurrentStep(stepIndex)
    }
  }, [steps.length])

  return {
    currentStep,
    isVisible,
    startTutorial,
    nextStep,
    previousStep,
    closeTutorial,
    goToStep,
    totalSteps: steps.length,
    isFirstStep: currentStep === 0,
    isLastStep: currentStep === steps.length - 1
  }
}
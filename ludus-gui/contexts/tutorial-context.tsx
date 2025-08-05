"use client"

import React, { createContext, useContext, useState, useCallback, useEffect } from "react"
import type { TutorialStep, TutorialStepValidation } from "@/hooks/use-tutorial"

interface TutorialContextType {
  currentStep: number
  isVisible: boolean
  activeTargetSelector: string | null
  completedSteps: Set<number>
  isElementActive: (selector: string) => boolean
  isStepCompleted: (stepIndex: number) => boolean
  canProgressToNextStep: () => boolean
  startTutorial: () => void
  nextStep: () => void
  previousStep: () => void
  closeTutorial: () => void
}

const TutorialContext = createContext<TutorialContextType | null>(null)

export function useTutorialContext() {
  const context = useContext(TutorialContext)
  if (!context) {
    throw new Error('useTutorialContext must be used within a TutorialProvider')
  }
  return context
}

interface TutorialProviderProps {
  children: React.ReactNode
  steps: TutorialStep[]
}

export function TutorialProvider({ children, steps }: TutorialProviderProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())

  const activeTargetSelector = isVisible && currentStep < steps.length 
    ? steps[currentStep].targetSelector 
    : null

  // Validation logic
  const validateStep = useCallback((stepIndex: number): boolean => {
    const step = steps[stepIndex]
    if (!step?.validation) return true

    switch (step.validation.type) {
      case 'element-exists':
        return !!document.querySelector(step.validation.selector!)
      
      case 'element-count':
        const elements = document.querySelectorAll(step.validation.selector!)
        return elements.length >= (step.validation.expectedCount || 1)
      
      case 'attribute-value':
        const element = document.querySelector(step.validation.selector!)
        if (!element) return false
        const actualValue = element.getAttribute(step.validation.attribute!)
        return actualValue === step.validation.expectedValue
      
      case 'custom':
        return step.validation.customValidator?.() || false
      
      default:
        return true
    }
  }, [steps])

  const isElementActive = useCallback((selector: string) => {
    if (!activeTargetSelector) return false
    
    // Check if this element matches the current tutorial target
    // Support multiple selectors separated by commas
    const selectors = activeTargetSelector.split(',').map(s => s.trim())
    return selectors.some(targetSelector => {
      try {
        // For data attributes, do a simple includes check
        if (targetSelector.includes('[data-') && selector.includes('[data-')) {
          return targetSelector === selector
        }
        
        // For class-based selectors, check if element would match
        const element = document.querySelector(selector)
        return element && element.matches(targetSelector)
      } catch {
        return false
      }
    })
  }, [activeTargetSelector])

  const isStepCompleted = useCallback((stepIndex: number) => {
    return completedSteps.has(stepIndex)
  }, [completedSteps])

  const canProgressToNextStep = useCallback(() => {
    return completedSteps.has(currentStep) || steps[currentStep]?.completionTrigger === 'manual'
  }, [currentStep, completedSteps, steps])

  const startTutorial = useCallback(() => {
    setCurrentStep(0)
    setIsVisible(true)
    setCompletedSteps(new Set())
  }, [])

  const nextStep = useCallback(() => {
    if (!canProgressToNextStep()) {
      // Show some feedback that step isn't completed yet
      console.log('Step not completed yet, cannot progress')
      return
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      setIsVisible(false)
    }
  }, [currentStep, steps.length, canProgressToNextStep])

  const previousStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }, [currentStep])

  const closeTutorial = useCallback(() => {
    setIsVisible(false)
  }, [])

  // Auto-detect step completion
  useEffect(() => {
    if (!isVisible) return

    const checkStepCompletion = () => {
      const currentStepData = steps[currentStep]
      if (!currentStepData || completedSteps.has(currentStep)) return

      if (currentStepData.completionTrigger === 'auto-detect' && validateStep(currentStep)) {
        setCompletedSteps(prev => new Set([...prev, currentStep]))
        
        // Auto-progress if this step is completed
        setTimeout(() => {
          if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1)
          } else {
            setIsVisible(false)
          }
        }, 1000) // Small delay to show completion
      }
    }

    // Check every 500ms for step completion
    const interval = setInterval(checkStepCompletion, 500)
    return () => clearInterval(interval)
  }, [currentStep, isVisible, steps, completedSteps, validateStep])

  return (
    <TutorialContext.Provider
      value={{
        currentStep,
        isVisible,
        activeTargetSelector,
        completedSteps,
        isElementActive,
        isStepCompleted,
        canProgressToNextStep,
        startTutorial,
        nextStep,
        previousStep,
        closeTutorial,
      }}
    >
      {children}
    </TutorialContext.Provider>
  )
}
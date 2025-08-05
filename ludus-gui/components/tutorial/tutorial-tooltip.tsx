"use client"

import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import { useTutorialContext } from "@/contexts/tutorial-context"
import type { TutorialStep } from "@/hooks/use-tutorial"
import { cn } from "@/lib/utils"
import { TutorialVignette } from "./tutorial-vignette"

interface TutorialTooltipProps {
  steps: TutorialStep[]
}

export function TutorialTooltip({ steps }: TutorialTooltipProps) {
  const { 
    currentStep, 
    isVisible, 
    activeTargetSelector,
    canProgressToNextStep,
    isStepCompleted,
    nextStep, 
    previousStep, 
    closeTutorial 
  } = useTutorialContext()
  
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const [tooltipVisible, setTooltipVisible] = useState(false)
  const lastPositionRef = React.useRef({ x: 0, y: 0 })

  const currentStepData = steps[currentStep]
  const isNextDisabled = !canProgressToNextStep()
  const stepCompleted = isStepCompleted(currentStep)

  useEffect(() => {
    if (!isVisible || !activeTargetSelector || !currentStepData) {
      setTooltipVisible(false)
      return
    }

    const updateTooltipPosition = () => {
      try {
        // Split multiple selectors and try each one
        const selectors = activeTargetSelector.split(',').map(s => s.trim())
        let targetElement: Element | null = null
        
        for (const selector of selectors) {
          targetElement = document.querySelector(selector)
          if (targetElement) break
        }

        if (!targetElement) {
          setTooltipVisible(false)
          return
        }

        const rect = targetElement.getBoundingClientRect()
        const { position, offset } = currentStepData
        
        let x = rect.left
        let y = rect.top
        
        // Position tooltip based on step configuration
        switch (position) {
          case 'right':
            x = rect.right + (offset?.x || 10)
            y = rect.top + rect.height / 2 + (offset?.y || 0)
            break
          case 'left':
            x = rect.left + (offset?.x || -10)
            y = rect.top + rect.height / 2 + (offset?.y || 0)
            break
          case 'bottom':
            x = rect.left + rect.width / 2 + (offset?.x || 0)
            y = rect.bottom + (offset?.y || 10)
            break
          case 'top':
            x = rect.left + rect.width / 2 + (offset?.x || 0)
            y = rect.top + (offset?.y || -10)
            break
        }

        // Only update position if it has changed significantly (prevents excessive re-renders)
        const threshold = 2 // pixels
        if (Math.abs(x - lastPositionRef.current.x) > threshold || 
            Math.abs(y - lastPositionRef.current.y) > threshold) {
          lastPositionRef.current = { x, y }
          setTooltipPosition({ x, y })
        }
        setTooltipVisible(true)
      } catch (error) {
        console.warn('Failed to position tutorial tooltip:', error)
        setTooltipVisible(false)
      }
    }

    // Initial positioning
    updateTooltipPosition()

    // Update position on scroll and resize
    const handleUpdate = () => updateTooltipPosition()
    window.addEventListener('scroll', handleUpdate, true)
    window.addEventListener('resize', handleUpdate)

    // Continuously track element position for moving components (like ReactFlow nodes)
    let animationFrameId: number
    let mutationObserver: MutationObserver
    
    const startContinuousTracking = () => {
      const trackPosition = () => {
        updateTooltipPosition()
        animationFrameId = requestAnimationFrame(trackPosition)
      }
      animationFrameId = requestAnimationFrame(trackPosition)
      
      // Also watch for DOM changes that might affect positioning
      mutationObserver = new MutationObserver(() => {
        updateTooltipPosition()
      })
      
      const targetElement = document.querySelector(activeTargetSelector)
      if (targetElement) {
        // Watch the target element and its ancestors for changes
        mutationObserver.observe(document.body, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['style', 'class', 'transform']
        })
      }
      
      // Listen for ReactFlow-specific events that might move nodes
      const reactFlowWrapper = document.querySelector('.react-flow')
      if (reactFlowWrapper) {
        const handleReactFlowMove = () => updateTooltipPosition()
        reactFlowWrapper.addEventListener('wheel', handleReactFlowMove, { passive: true })
        reactFlowWrapper.addEventListener('mousemove', handleReactFlowMove, { passive: true })
        reactFlowWrapper.addEventListener('touchmove', handleReactFlowMove, { passive: true })
        
        // Store cleanup function for these listeners
        const cleanupReactFlowListeners = () => {
          reactFlowWrapper.removeEventListener('wheel', handleReactFlowMove)
          reactFlowWrapper.removeEventListener('mousemove', handleReactFlowMove)
          reactFlowWrapper.removeEventListener('touchmove', handleReactFlowMove)
        }
        
        // Return cleanup function to be called in useEffect cleanup
        return cleanupReactFlowListeners
      }
      
      return () => {} // No-op cleanup if no ReactFlow wrapper found
    }
    
    const cleanupReactFlowListeners = startContinuousTracking()

    return () => {
      window.removeEventListener('scroll', handleUpdate, true)
      window.removeEventListener('resize', handleUpdate)
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
      if (mutationObserver) {
        mutationObserver.disconnect()
      }
      if (cleanupReactFlowListeners) {
        cleanupReactFlowListeners()
      }
    }
  }, [isVisible, activeTargetSelector, currentStepData])

  if (!isVisible || !tooltipVisible || !currentStepData) {
    return null
  }

  return (
    <>
      {/* Vignette effect behind the tooltip */}
      <TutorialVignette 
        isVisible={isVisible && tooltipVisible} 
        targetSelector={activeTargetSelector} 
      />
      
      {/* Tooltip */}
      <div
        className="fixed z-50 bg-card border border-border rounded-lg shadow-lg p-4 max-w-sm"
      style={{
        left: tooltipPosition.x,
        top: tooltipPosition.y,
        transform: currentStepData.position === 'left' ? 'translateX(-100%)' : 
                   currentStepData.position === 'top' ? 'translateY(-100%)' :
                   currentStepData.position === 'bottom' ? 'translateY(0)' :
                   'translateX(0)'
      }}
    >
      {/* Content */}
      <div>
        <h3 className="font-semibold text-sm mb-2">{currentStepData.title}</h3>
        <p className="text-sm text-muted-foreground mb-4">
          {currentStepData.description}
        </p>
      </div>

      {/* Navigation - Only show Next button for manual steps */}
      <div className="flex items-center justify-between">
        {currentStepData.completionTrigger === 'manual' && (
          <Button
            variant="default"
            size="sm"
            onClick={nextStep}
          >
            {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
            {currentStep !== steps.length - 1 && <ChevronRight className="h-4 w-4 ml-1" />}
          </Button>
        )}
        
        <span className="text-xs text-muted-foreground ml-auto">
          {currentStep + 1} of {steps.length}
        </span>
      </div>
    </div>
    </>
  )
}
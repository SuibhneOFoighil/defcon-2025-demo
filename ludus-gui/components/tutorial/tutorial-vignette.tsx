"use client"

import React, { useEffect, useState } from "react"

interface TutorialVignetteProps {
  isVisible: boolean
  targetSelector: string | null
}

export function TutorialVignette({ isVisible, targetSelector }: TutorialVignetteProps) {
  const [cutoutRect, setCutoutRect] = useState<DOMRect | null>(null)
  const [overlayVisible, setOverlayVisible] = useState(false)

  useEffect(() => {
    if (!isVisible || !targetSelector) {
      setOverlayVisible(false)
      setCutoutRect(null)
      return
    }

    const updateCutout = () => {
      try {
        // Split multiple selectors and try each one
        const selectors = targetSelector.split(',').map(s => s.trim())
        let targetElement: Element | null = null
        
        for (const selector of selectors) {
          targetElement = document.querySelector(selector)
          if (targetElement) break
        }

        if (!targetElement) {
          setOverlayVisible(false)
          return
        }

        const rect = targetElement.getBoundingClientRect()
        
        // Add padding around the target element for the cutout
        const padding = 12
        const cutout = new DOMRect(
          rect.x - padding,
          rect.y - padding, 
          rect.width + (padding * 2),
          rect.height + (padding * 2)
        )
        
        setCutoutRect(cutout)
        setOverlayVisible(true)
      } catch (error) {
        console.warn('Failed to create tutorial vignette:', error)
        setOverlayVisible(false)
      }
    }

    // Initial cutout calculation
    updateCutout()

    // Update cutout on scroll, resize, and DOM changes
    const handleUpdate = () => updateCutout()
    window.addEventListener('scroll', handleUpdate, true)
    window.addEventListener('resize', handleUpdate)

    // Track element position for moving components (ReactFlow nodes)
    let animationFrameId: number
    const trackPosition = () => {
      updateCutout()
      animationFrameId = requestAnimationFrame(trackPosition)
    }
    animationFrameId = requestAnimationFrame(trackPosition)

    return () => {
      window.removeEventListener('scroll', handleUpdate, true)
      window.removeEventListener('resize', handleUpdate)
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [isVisible, targetSelector])

  if (!overlayVisible || !cutoutRect) {
    return null
  }

  // Create unique mask ID to avoid conflicts
  const maskId = `tutorial-vignette-${Date.now()}`
  
  return (
    <div 
      className="fixed inset-0 pointer-events-none z-30 transition-opacity duration-500 ease-out"
      style={{
        opacity: overlayVisible ? 1 : 0
      }}
    >
      <svg 
        className="absolute inset-0 w-full h-full"
        style={{ width: '100vw', height: '100vh' }}
      >
        <defs>
          <mask id={maskId}>
            {/* White area will be visible, black area will be masked out */}
            <rect width="100%" height="100%" fill="white" />
            <rect
              x={cutoutRect.x}
              y={cutoutRect.y}
              width={cutoutRect.width}
              height={cutoutRect.height}
              rx="12"
              ry="12"
              fill="black"
            />
          </mask>
        </defs>
        
        {/* Semi-transparent overlay with cutout */}
        <rect
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.35)"
          mask={`url(#${maskId})`}
        />
      </svg>
      
      {/* Subtle glow around the cutout area */}
      <div
        className="absolute rounded-xl pointer-events-none transition-all duration-500 ease-out"
        style={{
          left: cutoutRect.x - 3,
          top: cutoutRect.y - 3,
          width: cutoutRect.width + 6,
          height: cutoutRect.height + 6,
          boxShadow: `
            0 0 0 2px hsl(var(--primary) / 0.15),
            0 0 20px hsl(var(--primary) / 0.1),
            inset 0 0 20px rgba(255, 255, 255, 0.05)
          `,
        }}
      />
    </div>
  )
}
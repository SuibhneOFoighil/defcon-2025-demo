"use client"

import { useCallback, useRef, useState } from "react"

interface UseAnimationStateProps {
  enterClass: string
  exitClass: string
  duration: number
  onExitComplete?: () => void
}

/**
 * Hook for managing element animation states
 */
export function useAnimationState({ enterClass, exitClass, duration, onExitComplete }: UseAnimationStateProps) {
  const [animationClass, setAnimationClass] = useState("")
  const [isExiting, setIsExiting] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const startExit = useCallback(() => {
    if (isExiting) return false

    setIsExiting(true)
    setAnimationClass(exitClass)

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set timeout for exit animation completion
    timeoutRef.current = setTimeout(() => {
      setIsExiting(false)
      onExitComplete?.()
    }, duration)

    return true
  }, [isExiting, exitClass, duration, onExitComplete])

  const startEnter = useCallback(() => {
    setIsExiting(false)
    setAnimationClass(enterClass)

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }, [enterClass])

  // Cleanup function
  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }, [])

  return {
    animationClass,
    isExiting,
    startExit,
    startEnter,
    cleanup,
  }
}

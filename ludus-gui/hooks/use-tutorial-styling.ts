import { useTutorialContext } from '@/contexts/tutorial-context'
import { useMemo } from 'react'

/**
 * Hook for components to check if they should have tutorial styling
 * @param selectors - CSS selectors or data attributes that identify this component
 * @returns object with tutorial state and styling classes
 */
export function useTutorialStyling(selectors: string | string[]) {
  const { isElementActive } = useTutorialContext()
  
  const selectorArray = Array.isArray(selectors) ? selectors : [selectors]
  
  const isActive = useMemo(() => {
    return selectorArray.some(selector => isElementActive(selector))
  }, [selectorArray, isElementActive])

  const tutorialClasses = useMemo(() => {
    if (!isActive) return ''
    
    return 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-background shadow-lg shadow-yellow-400/20 border-yellow-400 animate-pulse'
  }, [isActive])

  const tutorialStyles = useMemo(() => {
    if (!isActive) return {}
    
    return {
      boxShadow: '0 0 0 2px rgb(250 204 21), 0 0 20px rgba(250, 204, 21, 0.3)',
      borderColor: 'rgb(250 204 21)',
    }
  }, [isActive])

  return {
    isActive,
    tutorialClasses,
    tutorialStyles,
  }
}
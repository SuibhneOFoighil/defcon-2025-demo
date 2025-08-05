import { useState, useEffect } from 'react'

/**
 * Custom hook to calculate optimal number of cards to display based on screen size
 * Ensures even grid layouts by showing complete rows
 * 
 * Grid breakpoints match the viewer components:
 * - Mobile (default): 1 column
 * - md (768px+): 2 columns  
 * - lg (1024px+): 3 columns
 * - xl (1280px+): 4 columns
 */
export function useResponsiveCardLimit() {
  const [cardLimit, setCardLimit] = useState(4) // Default fallback

  useEffect(() => {
    const updateCardLimit = () => {
      // Check screen size and calculate optimal number of cards
      if (window.matchMedia('(min-width: 1280px)').matches) {
        // xl: 4 columns - show 8 cards (rows * 4 cols)
        setCardLimit(4)
      } else if (window.matchMedia('(min-width: 1024px)').matches) {
        // lg: 3 columns - show 6 cards (rows * 3 cols)
        setCardLimit(3)
      } else if (window.matchMedia('(min-width: 768px)').matches) {
        // md: 2 columns - show 4 cards (rows * 2 cols)
        setCardLimit(4)
      } else {
        // Mobile: 1 column - show 2 cards (rows * 1 col)
        setCardLimit(2)
      }
    }

    // Set initial limit
    updateCardLimit()

    // Create media query listeners for each breakpoint
    const xlQuery = window.matchMedia('(min-width: 1280px)')
    const lgQuery = window.matchMedia('(min-width: 1024px)')
    const mdQuery = window.matchMedia('(min-width: 768px)')

    // Add listeners
    xlQuery.addEventListener('change', updateCardLimit)
    lgQuery.addEventListener('change', updateCardLimit)
    mdQuery.addEventListener('change', updateCardLimit)

    // Cleanup listeners on unmount
    return () => {
      xlQuery.removeEventListener('change', updateCardLimit)
      lgQuery.removeEventListener('change', updateCardLimit)
      mdQuery.removeEventListener('change', updateCardLimit)
    }
  }, [])

  return cardLimit
}
"use client"

import { useState, useEffect, useCallback } from "react"

/**
 * Custom hook for managing state with localStorage persistence
 * @param key - The localStorage key to store the value under
 * @param initialValue - The initial value to use if no value is found in localStorage
 * @returns A stateful value and a function to update it
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // State to store our value
  // Initialize with a function to avoid hydration mismatch
  const [storedValue, setStoredValue] = useState<T>(() => {
    // Return initial value during SSR
    if (typeof window === "undefined") {
      return initialValue
    }
    
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key)
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      // If error also return initialValue
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  // State to track if component is mounted (client-side)
  const [isClient, setIsClient] = useState(false)

  // Set isClient to true after mount
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value
      // Save state
      setStoredValue(valueToStore)
      // Save to local storage only on client
      if (isClient && typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      // A more advanced implementation would handle the error case
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }, [key, storedValue, isClient])

  return [storedValue, setValue]
}

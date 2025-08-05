"use client"

import { createContext, useContext, useEffect, useMemo, type ReactNode } from "react"
import type { ThemeMode } from "@/lib/types"
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from "next-themes"
import { lightTheme, darkTheme } from "./theme-config"
import { useUserPreferences } from "@/hooks/use-user-preferences-local"

interface ThemeContextProps {
  theme: ThemeMode
  isDark: boolean
  lightTheme: typeof lightTheme
  darkTheme: typeof darkTheme
  setTheme: (theme: ThemeMode) => void
}

const ThemeContext = createContext<ThemeContextProps>({
  theme: "system",
  isDark: false,
  lightTheme: lightTheme,
  darkTheme: darkTheme,
  setTheme: () => {},
})

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={true}
      disableTransitionOnChange={false}
    >
      <InternalThemeProvider>{children}</InternalThemeProvider>
    </NextThemesProvider>
  )
}

function InternalThemeProvider({ children }: { children: ReactNode }) {
  const { theme: nextTheme, setTheme: setNextTheme, resolvedTheme } = useNextTheme()
  const { preferences, setTheme: persistTheme, isLoading: isPrefsLoading } = useUserPreferences()

  // Sync next-themes with Local Storage when preferences load
  useEffect(() => {
    if (!isPrefsLoading && preferences?.theme && preferences.theme !== nextTheme) {
      setNextTheme(preferences.theme)
    }
  }, [isPrefsLoading, preferences?.theme, nextTheme, setNextTheme])

  // Persist theme changes back Local Storage
  const setTheme = (theme: ThemeMode) => {
    setNextTheme(theme) // Update theme visually
    persistTheme(theme) // Save to Local Storage
  }

  const { isDark } = useMemo(() => ({
    isDark: resolvedTheme === 'dark',
  }), [resolvedTheme])

  const value: ThemeContextProps = {
    theme: nextTheme as ThemeMode,
    isDark,
    lightTheme: lightTheme,
    darkTheme: darkTheme,
    setTheme,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextProps {
  return useContext(ThemeContext)
}

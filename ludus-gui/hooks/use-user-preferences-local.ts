"use client"

import { useCallback, useEffect, useState } from "react";
import { useLocalStorage } from "./use-local-storage";
import type { ThemeMode } from "@/lib/types";
import { STORAGE_KEYS } from "@/lib/constants";

interface UserPreferences {
  theme?: ThemeMode;
  sidebarExpanded?: boolean;
  componentSidebarCollapsed?: boolean;
  logsDrawerExpanded?: boolean;
}

export function useUserPreferences() {
  // Track if we're on the client
  const [isClient, setIsClient] = useState(false);
  
  // Use local storage for theme and sidebar state
  const [theme, setThemeStorage] = useLocalStorage<ThemeMode | undefined>(
    STORAGE_KEYS.THEME,
    undefined
  );
  
  const [sidebarExpanded, setSidebarExpandedStorage] = useLocalStorage<boolean | undefined>(
    STORAGE_KEYS.SIDEBAR_EXPANDED,
    undefined
  );

  const [componentSidebarCollapsed, setComponentSidebarCollapsedStorage] = useLocalStorage<boolean | undefined>(
    STORAGE_KEYS.COMPONENT_SIDEBAR_COLLAPSED,
    undefined
  );

  const [logsDrawerExpanded, setLogsDrawerExpandedStorage] = useLocalStorage<boolean | undefined>(
    STORAGE_KEYS.LOGS_DRAWER_EXPANDED,
    undefined
  );

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Create the preferences object
  // During SSR, return null to match what Convex version would return
  const preferences: UserPreferences | null = isClient ? {
    theme,
    sidebarExpanded,
    componentSidebarCollapsed,
    logsDrawerExpanded,
  } : null;

  // Updater for the theme
  const setTheme = useCallback((newTheme: ThemeMode) => {
    setThemeStorage(newTheme);
  }, [setThemeStorage]);

  // Updater for the sidebar state
  const setSidebarExpanded = useCallback((isExpanded: boolean) => {
    setSidebarExpandedStorage(isExpanded);
  }, [setSidebarExpandedStorage]);

  // Updater for the component sidebar collapsed state
  const setComponentSidebarCollapsed = useCallback((isCollapsed: boolean) => {
    setComponentSidebarCollapsedStorage(isCollapsed);
  }, [setComponentSidebarCollapsedStorage]);

  // Updater for the logs drawer expanded state
  const setLogsDrawerExpanded = useCallback((isExpanded: boolean) => {
    setLogsDrawerExpandedStorage(isExpanded);
  }, [setLogsDrawerExpandedStorage]);

  return {
    preferences,
    isLoading: !isClient, // Loading until client-side
    setTheme,
    setSidebarExpanded,
    setComponentSidebarCollapsed,
    setLogsDrawerExpanded,
  };
}
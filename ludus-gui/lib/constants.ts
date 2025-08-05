// Application-wide constants
import { PROTECTED_ROUTES, PUBLIC_ROUTES } from "./routes"

// Flat sidebar items with separators for logical grouping
export const SIDEBAR_ITEMS = [
  {
    name: "Ranges",
    href: PROTECTED_ROUTES.RANGES,
    icon: "Network",
    exact: true, // Primary route should match exactly
  },
  {
    type: "separator",
    id: "sep-1",
  },
  {
    name: "Roles",
    href: PROTECTED_ROUTES.ROLES,
    icon: "Shield",
  },
  {
    name: "Templates",
    href: PROTECTED_ROUTES.TEMPLATES,
    icon: "Package",
  },
  {
    type: "separator",
    id: "sep-2",
  },
  {
    name: "Users",
    href: PROTECTED_ROUTES.ADMIN_USERS,
    icon: "UserCheck",
  },
  {
    name: "Groups",
    href: PROTECTED_ROUTES.ADMIN_GROUPS,
    icon: "Users",
  },
  {
    type: "separator",
    id: "sep-3",
  },
  {
    name: "Settings",
    href: PROTECTED_ROUTES.SETTINGS,
    icon: "Settings",
  },
]


// Local storage keys
export const STORAGE_KEYS = {
  SIDEBAR_EXPANDED: "ludus-sidebar-expanded",
  THEME: "ludus-theme",
  COMPONENT_SIDEBAR_COLLAPSED: "ludus-component-sidebar-collapsed",
  LOGS_DRAWER_EXPANDED: "ludus-logs-drawer-expanded",
}

export const ROUTES = {
  ...PUBLIC_ROUTES,
  ...PROTECTED_ROUTES,
}
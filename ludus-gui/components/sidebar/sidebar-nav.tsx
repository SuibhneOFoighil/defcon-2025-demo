"use client"

import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useSidebar } from "@/contexts/sidebar-context"
import { SIDEBAR_ITEMS } from "@/lib/constants"
import { LayoutGrid, Network, FileText, User, Settings, LogOut, ChevronLeft, ChevronRight, Package, Shield, Shapes, Users, UserCheck } from "lucide-react"
import { SidebarLogo } from "./sidebar-logo"
import { SidebarItem } from "./sidebar-item"
import { IconButton } from "../ui/icon-button"
import { memo, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { LogoutModal } from "../auth/logout-modal"
import { Button } from "../ui/button"

// Map of icon names to components
const iconMap = {
  LayoutGrid,
  Network,
  FileText,
  User,
  Settings,
  Package,
  Shield,
  Shapes,
  Users,
  UserCheck,
}

/**
 * Component for the sidebar navigation
 * Memoized to prevent re-renders when navigating between pages
 */
export const SidebarNav = memo(function SidebarNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { expanded, toggleSidebar } = useSidebar()
  const { signOut } = useAuth()
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)

  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true)
  }

  const handleConfirmLogout = async () => {
    await signOut()
    router.push("/login")
    setIsLogoutModalOpen(false)
  }

  const handleCancelLogout = () => {
    setIsLogoutModalOpen(false)
  }

  return (
    <div className="relative">
      <div
        className={cn(
          "flex h-full flex-col border-r border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar-bg))] py-4 transition-all duration-300 ease-in-out",
          expanded ? "w-[220px]" : "w-[80px]",
        )}
      >
        <SidebarLogo className="mb-6" />

        {/* Theme toggle - always in the same position */}
        {/* <div className={cn("px-4 mb-6", !expanded && "flex justify-center")}>
          <ThemeToggle showLabel={expanded} />
        </div> */}

        <nav className="flex-1 px-2 space-y-1">
          {SIDEBAR_ITEMS.map((item) => {
            // Handle separators
            if (item.type === "separator") {
              return (
                <div 
                  key={item.id} 
                  className="my-3 border-t border-[hsl(var(--sidebar-border)/0.3)]" 
                />
              )
            }

            // Handle navigation items
            if (!item.icon || !item.name || !item.href) return null
            
            const IconComponent = iconMap[item.icon as keyof typeof iconMap]
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href) && item.href !== "/"

            return (
              <SidebarItem
                key={item.name}
                name={item.name}
                href={item.href}
                icon={IconComponent}
                isActive={isActive}
                exact={item.exact}
              />
            )
          })}
        </nav>

        <div className="mt-auto px-2 space-y-4">
          <div className={cn("text-center text-[hsl(var(--sidebar-muted))]", expanded ? "px-4" : "px-0")}>
            <p className="text-[10px]">Privacy and Terms</p>
          </div>
          <Button
            variant="ghost"
            onClick={handleLogoutClick}
            className={cn(
              "flex items-center py-2 px-3 rounded-md text-[hsl(var(--sidebar-muted))] hover:text-[hsl(var(--sidebar-fg))] hover:bg-[hsl(var(--secondary))] w-full",
              expanded ? "justify-start" : "justify-center",
            )}
          >
            <LogOut className={cn("h-5 w-5 flex-shrink-0", expanded && "mr-3")} />
            <span className={cn("text-sm", !expanded && "hidden")}>Log Out</span>
          </Button>
        </div>
      </div>

      {/* Toggle button positioned in the middle right of the sidebar */}
      <IconButton
        variant="outline"
        onClick={toggleSidebar}
        className={cn(
          "absolute top-1/2 -translate-y-1/2 -right-3 h-6 w-6 rounded-full border border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar-bg))] text-[hsl(var(--sidebar-highlight))] shadow-md hover:bg-[hsl(var(--secondary))] z-10",
        )}
        aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
      >
        {expanded ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
      </IconButton>

      {/* Logout Confirmation Modal */}
      <LogoutModal isOpen={isLogoutModalOpen} onClose={handleCancelLogout} onConfirm={handleConfirmLogout} />
    </div>
  )
})

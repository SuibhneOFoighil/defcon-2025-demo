import { cn } from "@/lib/utils"
import { useSidebar } from "@/contexts/sidebar-context"
import { memo, useState, useEffect } from "react"
import Image from "next/image"
import { useTheme } from "next-themes"

/**
 * Props for the SidebarLogo component
 */
interface SidebarLogoProps {
  className?: string
}

/**
 * Component for the logo in the sidebar
 * Memoized to prevent re-renders when navigating between pages
 */
export const SidebarLogo = memo(function SidebarLogo({ className }: SidebarLogoProps) {
  const { expanded } = useSidebar()
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Ensure component is mounted before using theme
  useEffect(() => {
    setMounted(true)
  }, [])

  // Use default logo during SSR/hydration, then switch to theme-appropriate logo
  const isDark = mounted && (resolvedTheme === 'dark' || theme === 'dark')
  const logoSrc = mounted ? (isDark ? '/Luuds_icon_white.svg' : '/Ludus_icon_black.svg') : '/Ludus_icon_black.svg'

  return (
    <div className={cn("flex items-center", expanded ? "px-6 py-4" : "px-4 py-4 justify-center", className)}>
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          <Image
            src={logoSrc}
            alt="Ludus Logo"
            width={expanded ? 48 : 40}
            height={expanded ? 48 : 40}
            className={cn(
              "transition-all duration-200 ease-in-out",
              expanded ? "h-12 w-12" : "h-10 w-10"
            )}
            priority
          />
        </div>
        {expanded && (
          <div className="flex flex-col">
            <span className="text-xl font-bold text-[hsl(var(--sidebar-fg))] tracking-wide">
              LUDUS
            </span>
            <span className="text-xs text-[hsl(var(--sidebar-muted))] font-medium tracking-wider">
              CYBER RANGES
            </span>
          </div>
        )}
      </div>
    </div>
  )
})

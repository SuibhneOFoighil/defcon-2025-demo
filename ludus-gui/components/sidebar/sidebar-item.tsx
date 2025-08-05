import Link from "next/link"
import { cn } from "@/lib/utils"
import { useSidebar } from "@/contexts/sidebar-context"
import type { LucideIcon } from "lucide-react"
import { memo } from "react"

/**
 * Props for the SidebarItem component
 */
interface SidebarItemProps {
  name: string
  href: string
  icon: LucideIcon
  isActive: boolean
  exact?: boolean
}

/**
 * Component for an individual sidebar navigation item
 * Memoized to prevent re-renders when navigating between pages
 */
export const SidebarItem = memo(function SidebarItem({ name, href, icon: Icon, isActive }: SidebarItemProps) {
  const { expanded } = useSidebar()

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center py-2 px-3 rounded-md relative group",
        isActive
          ? "text-[hsl(var(--sidebar-fg))]"
          : "text-[hsl(var(--sidebar-muted))] hover:text-[hsl(var(--sidebar-fg))] hover:bg-[hsl(var(--secondary))]",
        !expanded && "justify-center",
      )}
    >
      {isActive && (
        <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-[hsl(var(--sidebar-highlight))]" />
      )}
      <Icon className={cn("h-5 w-5 flex-shrink-0", expanded && "mr-3")} />
      <span className={cn("text-sm", !expanded && "hidden")}>{name}</span>
    </Link>
  )
})

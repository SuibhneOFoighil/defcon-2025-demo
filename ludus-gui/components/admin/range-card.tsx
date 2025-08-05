"use client"

import { MoreVertical, Eye, Edit, UserMinus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { IconButton } from "@/components/ui/icon-button"
import { useContextMenu } from "@/hooks/use-context-menu"
import { ContextMenu, ContextMenuItem, ContextMenuSeparator } from "@/components/ui/context-menu"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardMedia,
} from "@/components/ui/card/card-components"

interface RangeCardProps {
  id: string
  title: string
  status: "running" | "error" | "deployed"
  resources: {
    cpus: number
    ram: number
    disk: number
  }
  lastUsed: string
  image?: string
  className?: string
}

export function RangeCard({ id, title, status, resources, lastUsed, image, className }: RangeCardProps) {
  const { open, triggerRef, closeMenu, toggleMenu } = useContextMenu()

  let statusBadgeVariant: "success" | "danger" | "default" = "default";
  let statusText = "Deployed Successfully"; // Default text from original component

    if (status === "running") {
    statusBadgeVariant = "success";
    statusText = "Running";
    } else if (status === "error") {
    statusBadgeVariant = "danger";
    statusText = "Error";
  } else if (status === "deployed") { // Explicitly handle deployed for clarity
    statusBadgeVariant = "success"; // As per original component's logic
    statusText = "Deployed Successfully";
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardMedia
        src={image || "/placeholder.svg?height=160&width=284"} // Adjust placeholder to be closer to original aspect if fixed height was intended
          alt={title}
        aspectRatio="video" // Keeps a 16:9 aspect ratio, adjust if needed
        // The previous image container was h-40 (160px). 
        // If a fixed height for media is required, it might need custom styling or a wrapper.
      />
      <CardHeader className="flex flex-row items-start justify-between gap-2 p-4">
        <div className="min-w-0"> {/* Allow text to truncate */} 
          <CardTitle className="text-base truncate">{id}</CardTitle>
          <CardDescription className="text-sm mt-0.5 truncate">{title}</CardDescription>
        </div>
        <div className="flex flex-shrink-0 items-center gap-2 ml-2"> {/* ml-2 for spacing, shrink-0 */} 
          <Badge variant={statusBadgeVariant} size="sm" className="px-2 py-0.5">{/* Adjusted padding for badge if needed*/}{statusText}</Badge>
          <IconButton
            variant="ghost"
            className="h-8 w-8 text-muted-foreground -mr-1 -mt-1" // Adjust margin for alignment
            onClick={toggleMenu}
            aria-label="More options"
            aria-expanded={open}
            ref={triggerRef}
          >
            <MoreVertical className="h-4 w-4" />
          </IconButton>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-0">
        <div className="grid grid-cols-3 gap-2 border-t border-border pt-3">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">CPUs</span>
            <span className="text-sm font-medium">{resources.cpus}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">RAM</span>
            <span className="text-sm font-medium">{resources.ram} GB</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Disk</span>
            <span className="text-sm font-medium">{resources.disk} GB</span>
        </div>
      </div>
      </CardContent>

      <CardFooter className="p-4 pt-3">
        <span className="text-xs text-muted-foreground">Last used {lastUsed}</span>
      </CardFooter>

      {/* Context Menu */}
      <ContextMenu open={open} onClose={closeMenu} triggerRef={triggerRef as React.RefObject<HTMLButtonElement>} align="end">
        <ContextMenuItem
          icon={<Eye className="h-4 w-4" />}
          onClick={() => {
            closeMenu()
            console.log("View range details for:", id)
          }}
        >
          View Details
        </ContextMenuItem>
        <ContextMenuItem
          icon={<Edit className="h-4 w-4" />}
          onClick={() => {
            closeMenu()
            console.log("Edit range:", id)
          }}
        >
          Edit
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          icon={<UserMinus className="h-4 w-4" />}
          onClick={() => {
            closeMenu()
            console.log("Remove access for range:", id)
          }}
          destructive // Added destructive for remove actions
        >
          Remove Access
        </ContextMenuItem>
      </ContextMenu>
    </Card>
  )
}

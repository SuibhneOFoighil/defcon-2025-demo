"use client"

import { MoreVertical, Eye, Edit, Play, UserMinus } from "lucide-react"
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
  CardFooter,
  CardMedia,
} from "@/components/ui/card/card-components"

interface TemplateCardProps {
  id: string
  title: string
  status: "draft" | "published"
  lastEdited: string
  image?: string
  className?: string
}

export function TemplateCard({ id, title, status, lastEdited, image, className }: TemplateCardProps) {
  const { open, triggerRef, closeMenu, toggleMenu } = useContextMenu()

  const statusText = status === "draft" ? "Draft" : "Published"
  // Assuming 'info' variant for draft and 'success' for published, or adjust as per theme guidelines
  const statusBadgeVariant = status === "draft" ? "info" : "success"

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardMedia
        src={image || "/placeholder.svg?height=160&width=284"}
        alt={title}
        aspectRatio="video"
      />
      <CardHeader className="flex flex-row items-start justify-between gap-2 p-4">
        <div className="min-w-0">
          <CardTitle className="text-base truncate">{id}</CardTitle>
          <CardDescription className="text-sm mt-0.5 truncate">{title}</CardDescription>
        </div>
        <div className="flex flex-shrink-0 items-center gap-2 ml-2">
          <Badge variant={statusBadgeVariant} size="sm" className="px-2 py-0.5">
            {statusText}
          </Badge>
          <IconButton
            variant="ghost"
            className="h-8 w-8 text-muted-foreground -mr-1 -mt-1"
            onClick={toggleMenu}
            aria-label="More options"
            aria-expanded={open}
            ref={triggerRef}
          >
            <MoreVertical className="h-4 w-4" />
          </IconButton>
        </div>
      </CardHeader>

      {/* No specific CardContent in the original structure other than footer info, so it might be omitted or used for future details */}
      {/* For now, lastEdited will go in CardFooter */}

      <CardFooter className="p-4 pt-3 border-t border-border"> {/* Added border-t to match visual separation of old footer */}
        <span className="text-xs text-muted-foreground">Last edited {lastEdited}</span>
      </CardFooter>

      <ContextMenu open={open} onClose={closeMenu} triggerRef={triggerRef as React.RefObject<HTMLButtonElement>} align="end">
        <ContextMenuItem
          icon={<Eye className="h-4 w-4" />}
          onClick={() => {
            closeMenu()
            console.log("View template details for:", id)
          }}
        >
          View Details
        </ContextMenuItem>
        <ContextMenuItem
          icon={<Edit className="h-4 w-4" />}
          onClick={() => {
            closeMenu()
            console.log("Edit template:", id)
          }}
        >
          Edit
        </ContextMenuItem>
        <ContextMenuItem
          icon={<Play className="h-4 w-4" />}
          onClick={() => {
            closeMenu()
            console.log("Use template:", id)
          }}
        >
          Use Template
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          icon={<UserMinus className="h-4 w-4" />}
          onClick={() => {
            closeMenu()
            console.log("Remove access for template:", id)
          }}
          destructive // Assuming this should be destructive
        >
          Remove Access
        </ContextMenuItem>
      </ContextMenu>
    </Card>
  )
}

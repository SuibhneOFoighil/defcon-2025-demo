"use client"

import * as React from "react";
import { cn } from "@/lib/utils";
import { getTemplateIcon } from "@/lib/utils/template-icons";
import { MoreVertical, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { IconButton } from "@/components/ui/icon-button";
import { useContextMenu } from "@/hooks/use-context-menu";
import { ContextMenu, ContextMenuItem } from "@/components/ui/context-menu";
import { Card, CardContent } from "@/components/ui/card/card-components";
import { useDeleteTemplate } from "@/hooks/use-delete-template";
import { ConfirmModal } from "@/components/ui/modal/confirm-modal";
import type { TemplateItem } from "@/lib/types/template";

interface TemplatesCardProps {
  item: TemplateItem;
  onNavigate?: (id: string) => void;
  className?: string;
}

export function TemplatesCard({ 
  item, 
  onNavigate, 
  className 
}: TemplatesCardProps) {
  const { open, triggerRef, closeMenu, toggleMenu } = useContextMenu();
  const deleteTemplate = useDeleteTemplate();
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);

  const handleCardClick = (event: React.MouseEvent) => {
    // Prevent navigation when clicking the context menu button
    if ((event.target as HTMLElement).closest('[data-context-menu-trigger]')) {
      return;
    }
    
    // Navigate to template editor on click if handler provided
    if (onNavigate) {
      onNavigate(item.id);
    }
  };

  // const handleAction = (callback: (id: string) => void) => {
  //   callback(item.id);
  //   closeMenu();
  // };

  const handleDeleteClick = (event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    setShowDeleteDialog(true);
    closeMenu();
  };

  const handleDeleteConfirm = (event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    deleteTemplate.mutate({ name: item.name });
    setShowDeleteDialog(false);
  };

  // Helper function to create properly sized icons
  const menuIcon = (icon: React.ReactNode) => {
    return React.cloneElement(icon as React.ReactElement, {
      className: "h-4 w-4 stroke-[1.75]",
    } as React.SVGProps<SVGSVGElement>);
  };


  // Get build status badge variant
  const getBuildStatusBadge = () => {
    switch (item.built) {
      case "built":
        return <Badge variant="success" size="sm">Built</Badge>;
      case "building":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white" size="sm">Building</Badge>;
      case "failed":
        return <Badge variant="danger" size="sm">Failed</Badge>;
      case "not-built":
        return <Badge variant="outline" size="sm">Not Built</Badge>;
      default:
        return <Badge variant="outline" size="sm">Unknown</Badge>;
    }
  };

  return (
    <Card 
      className={cn(
        "group relative transition-all hover:border-muted-foreground/20",
        onNavigate && "cursor-pointer",
        className
      )}
      padding="none"
      onClick={handleCardClick}
    >
      <CardContent className="p-0">
        {/* Template Icon/Visual */}
        <div className="p-4 pb-0">
          <div className="h-32 bg-muted/30 rounded-lg border border-border/50 flex items-center justify-center">
            {getTemplateIcon(item.name)}
          </div>
        </div>

        {/* Card Content */}
        <div className="p-4 pt-3">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-foreground truncate mb-1">{item.name}</h3>
              {/* Build Status Badge */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Status:</span>
                {getBuildStatusBadge()}
              </div>
            </div>
            
            <IconButton
              variant="ghost"
              className="h-8 w-8 text-muted-foreground flex-shrink-0"
              onClick={toggleMenu}
              aria-label="More options"
              aria-expanded={open}
              ref={triggerRef}
              data-context-menu-trigger
            >
              <MoreVertical className="h-4 w-4" />
            </IconButton>
          </div>
        </div>
      </CardContent>

      {/* Context Menu */}
      <ContextMenu open={open} onClose={closeMenu} triggerRef={triggerRef as React.RefObject<HTMLButtonElement>} align="end">
        <ContextMenuItem icon={menuIcon(<Trash2 />)} destructive onClick={(e) => handleDeleteClick(e)}>
          Delete
        </ContextMenuItem>
      </ContextMenu>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Template"
        description={
          <>
            Are you sure you want to delete the template <strong>&quot;{item.name}&quot;</strong>?
            <br />
            This action cannot be undone.
          </>
        }
        confirmLabel="Delete"
        confirmVariant="destructive"
        loading={deleteTemplate.isPending}
      />
    </Card>
  );
} 
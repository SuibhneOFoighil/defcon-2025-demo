"use client"

import * as React from "react";
import { cn } from "@/lib/utils";
import { MoreVertical, Info, Trash2, Package, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { IconButton } from "@/components/ui/icon-button";
import { useContextMenu } from "@/hooks/use-context-menu";
import { ContextMenu, ContextMenuItem, ContextMenuSeparator } from "@/components/ui/context-menu";
import { Card, CardContent } from "@/components/ui/card/card-components";
import { useInstallRole } from "@/hooks/use-ansible-data";
import { ConfirmModal } from "@/components/ui/modal/confirm-modal";
import type { AnsibleItem } from "@/lib/types/ansible";
import { parseAnsibleName } from "@/lib/utils/ansible";

interface RolesCardProps {
  item: AnsibleItem;
  onViewDetails?: (item: AnsibleItem) => void;
  className?: string;
}

export function RolesCard({ 
  item, 
  onViewDetails, 
  className 
}: RolesCardProps) {
  const { open, triggerRef, closeMenu, toggleMenu } = useContextMenu();
  const { installRole, isLoading } = useInstallRole();
  const [showRemoveDialog, setShowRemoveDialog] = React.useState(false);

  const handleCardClick = (event: React.MouseEvent) => {
    // Prevent navigation when clicking the context menu button
    if ((event.target as HTMLElement).closest('[data-context-menu-trigger]')) {
      return;
    }
    
    // View details on click if handler provided
    if (onViewDetails) {
      onViewDetails(item);
    }
  };

  const handleAction = (callback: () => void) => {
    callback();
    closeMenu();
  };

  const handleRemoveClick = (event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    setShowRemoveDialog(true);
    closeMenu();
  };

  const handleRemoveConfirm = (event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    if (item.name) {
      installRole({
        body: {
          [item.type === 'collection' ? 'collection' : 'role']: item.name,
          action: 'remove',
        }
      });
    }
    setShowRemoveDialog(false);
  };

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(item);
    }
  };

  // Helper function to create properly sized icons
  const menuIcon = (icon: React.ReactNode) => {
    return React.cloneElement(icon as React.ReactElement, {
      className: "h-4 w-4 stroke-[1.75]",
    } as React.SVGProps<SVGSVGElement>);
  };

  // Get role/collection icon
  const getRoleIcon = () => {
    if (item.type === 'collection') {
      return <Package className="h-12 w-12 text-blue-500" />;
    }
    return <Settings className="h-12 w-12 text-green-500" />;
  };

  // Get type badge
  const getTypeBadge = () => {
    if (item.type === 'collection') {
      return <Badge className="bg-blue-500 hover:bg-blue-600 text-white" size="sm">Collection</Badge>;
    }
    return <Badge className="bg-green-500 hover:bg-green-600 text-white" size="sm">Role</Badge>;
  };

  // Get scope badge
  const getScopeBadge = () => {
    if (item.global) {
      return <Badge variant="outline" size="sm">Global</Badge>;
    }
    return <Badge variant="secondary" size="sm">User</Badge>;
  };

  // Parse role/collection name parts
  const { namespace, name: displayName } = parseAnsibleName(item.name);

  return (
    <Card 
      className={cn(
        "group relative transition-all hover:border-muted-foreground/20",
        onViewDetails && "cursor-pointer",
        className
      )}
      padding="none"
      onClick={handleCardClick}
    >
      <CardContent className="p-0">
        {/* Role Icon/Visual */}
        <div className="p-4 pb-0">
          <div className="h-32 bg-muted/30 rounded-lg border border-border/50 flex items-center justify-center">
            {getRoleIcon()}
          </div>
        </div>

        {/* Card Content */}
        <div className="p-4 pt-3">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-foreground truncate mb-1">
                {displayName || 'Unknown'}
              </h3>
              {namespace && (
                <div className="text-xs text-muted-foreground mb-2">
                  by {namespace}
                </div>
              )}
              {/* Type and Scope Badges */}
              <div className="flex items-center gap-2 mb-2">
                {getTypeBadge()}
                {getScopeBadge()}
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

          {/* Version Info */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Version:</span>
            <span className="text-xs text-muted-foreground">{item.version || "—"}</span>
          </div>
        </div>
      </CardContent>

      {/* Context Menu */}
      <ContextMenu open={open} onClose={closeMenu} triggerRef={triggerRef as React.RefObject<HTMLButtonElement>} align="end">
        <ContextMenuItem icon={menuIcon(<Info />)} onClick={() => handleAction(handleViewDetails)}>
          View Details
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem icon={menuIcon(<Trash2 />)} destructive onClick={(e) => handleRemoveClick(e)}>
          Remove
        </ContextMenuItem>
      </ContextMenu>

      {/* Remove Confirmation Modal */}
      <ConfirmModal
        open={showRemoveDialog}
        onClose={() => setShowRemoveDialog(false)}
        onConfirm={handleRemoveConfirm}
        title={`Remove ${item.type === 'collection' ? 'Collection' : 'Role'}`}
        description={
          <>
            Are you sure you want to remove <strong>&quot;{item.name}&quot;</strong>?
            <br />
            This action cannot be undone.
          </>
        }
        confirmLabel="Remove"
        confirmVariant="destructive"
        loading={isLoading}
      />
    </Card>
  );
}
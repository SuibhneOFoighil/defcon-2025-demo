"use client"

import * as React from "react";
import { cn } from "@/lib/utils";
import { MoreVertical, Edit, Copy, Plus, Trash2, Server, Monitor, Shield, Settings, Clock, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { IconButton } from "@/components/ui/icon-button";
import { useContextMenu } from "@/hooks/use-context-menu";
import { ContextMenu, ContextMenuItem, ContextMenuSeparator } from "@/components/ui/context-menu";
import { Card, CardContent } from "@/components/ui/card/card-components";

interface BlueprintItem {
  id: string;
  name: string;
  description: string;
  category: string;
  vmCount: number;
  networkCount: number;
  estimatedDeployTime: string;
  tags: string[];
}

interface BlueprintsCardProps {
  item: BlueprintItem;
  onNavigate: (id: string) => void;
  className?: string;
}

export function BlueprintsCard({ 
  item, 
  onNavigate, 
  className 
}: BlueprintsCardProps) {
  const { open, triggerRef, closeMenu, toggleMenu } = useContextMenu();

  const handleCardClick = (event: React.MouseEvent) => {
    // Prevent navigation when clicking the context menu button
    if ((event.target as HTMLElement).closest('[data-context-menu-trigger]')) {
      return;
    }
    
    // Navigate to blueprint details on click
    onNavigate(item.id);
  };

  const handleAction = (callback: (id: string) => void) => {
    callback(item.id);
    closeMenu();
  };

  // Helper function to create properly sized icons
  const menuIcon = (icon: React.ReactNode) => {
    return React.cloneElement(icon as React.ReactElement, {
      className: "h-4 w-4 stroke-[1.75]",
    } as React.SVGProps<SVGSVGElement>);
  };

  // Get blueprint icon based on category
  const getBlueprintIcon = () => {
    const category = item.category.toLowerCase();
    if (category.includes('windows')) {
      return <Monitor className="h-12 w-12 text-blue-500" />;
    } else if (category.includes('linux')) {
      return <Server className="h-12 w-12 text-green-500" />;
    } else if (category.includes('security')) {
      return <Shield className="h-12 w-12 text-red-500" />;
    } else {
      return <Settings className="h-12 w-12 text-muted-foreground" />;
    }
  };

  // Get category badge variant
  const getCategoryBadge = () => {
    const category = item.category.toLowerCase();
    if (category.includes('windows')) {
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200" size="sm">Windows</Badge>;
    } else if (category.includes('linux')) {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-200" size="sm">Linux</Badge>;
    } else if (category.includes('security')) {
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-200" size="sm">Security</Badge>;
    } else {
      return <Badge variant="outline" size="sm">{item.category}</Badge>;
    }
  };

  return (
    <Card 
      className={cn(
        "group relative cursor-pointer transition-all hover:border-muted-foreground/20",
        className
      )}
      padding="none"
      onClick={handleCardClick}
    >
      <CardContent className="p-0">
        {/* Blueprint Icon/Visual */}
        <div className="p-4 pb-0">
          <div className="h-32 bg-gradient-to-br from-muted/30 to-muted/10 rounded-lg border border-border/50 flex items-center justify-center">
            {getBlueprintIcon()}
          </div>
        </div>

        {/* Card Content */}
        <div className="p-4 pt-3">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-foreground truncate mb-1">{item.name}</h3>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{item.description}</p>
              
              {/* Category Badge */}
              <div className="flex items-center gap-2 mb-2">
                {getCategoryBadge()}
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

          {/* Blueprint Stats */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Users className="h-3 w-3" />
                <span>{item.vmCount} VMs</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Settings className="h-3 w-3" />
                <span>{item.networkCount} Networks</span>
              </div>
            </div>
            
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Deploy: {item.estimatedDeployTime}</span>
            </div>
          </div>

          {/* Tags */}
          {item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {item.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" size="sm" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {item.tags.length > 3 && (
                <Badge variant="secondary" size="sm" className="text-xs">
                  +{item.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>

      {/* Context Menu */}
      <ContextMenu open={open} onClose={closeMenu} triggerRef={triggerRef as React.RefObject<HTMLButtonElement>} align="end">
        <ContextMenuItem icon={menuIcon(<Plus />)} onClick={() => handleAction(() => console.log('Use blueprint in range:', item.id))}>
          Use in Range
        </ContextMenuItem>
        <ContextMenuItem icon={menuIcon(<Edit />)} onClick={() => handleAction(() => console.log('Edit blueprint:', item.id))}>
          Edit
        </ContextMenuItem>
        <ContextMenuItem icon={menuIcon(<Copy />)} onClick={() => handleAction(() => console.log('Clone blueprint:', item.id))}>
          Clone
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem icon={menuIcon(<Trash2 />)} destructive onClick={() => handleAction(() => console.log('Delete blueprint:', item.id))}>
          Delete
        </ContextMenuItem>
      </ContextMenu>
    </Card>
  );
}
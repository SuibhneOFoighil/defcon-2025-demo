"use client"

import * as React from "react";
import { cn } from "@/lib/utils";
import { MoreVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { IconButton } from "@/components/ui/icon-button";
import { useContextMenu } from "@/hooks/use-context-menu";
import { Card, CardContent } from "@/components/ui/card/card-components";
import { RangePreview } from "./range-preview";
import { RangeContextMenu } from "./range-context-menu";
import { handleRangeAction } from "@/lib/utils/range-actions";

interface RangeItem {
  id: string;
  name: string;
  labTemplate: string;
  state: "SUCCESS" | "FAILURE" | "ERROR" | "PENDING" | "ACTIVE" | "NEVER DEPLOYED" | "UNKNOWN";
  vmsRunning: number;
  vmsTotal: number;
  lastUse: string;
}

interface RangesCardProps {
  item: RangeItem;
  onNavigate: (id: string) => void;
  className?: string;
}

export function RangesCard({ 
  item, 
  onNavigate, 
  className 
}: RangesCardProps) {
  const { open, triggerRef, closeMenu, toggleMenu } = useContextMenu();

  const handleCardClick = (event: React.MouseEvent) => {
    // Prevent navigation when clicking the context menu button
    if ((event.target as HTMLElement).closest('[data-context-menu-trigger]')) {
      return;
    }
    
    // Navigate to range editor on click
    onNavigate(item.id);
  };

  // Get badge variant for state
  const getStateBadgeVariant = (state: string) => {
    switch (state.toUpperCase()) {
      case "SUCCESS": return "success";
      case "FAILURE": 
      case "ERROR": return "danger";
      case "DEPLOYING": return "warning";
      case "ACTIVE": return "info";
      case "PENDING": return "secondary";
      case "NEVER DEPLOYED": return "outline";
      default: return "default";
    }
  };

  // Helper function to normalize state for display
  const normalizeStateForDisplay = (state: string): string => {
    switch (state.toUpperCase()) {
      case "SUCCESS": return "Success";
      case "FAILURE": return "Failure";
      case "ERROR": return "Error";
      case "DEPLOYING": return "Deploying";
      case "PENDING": return "Pending";
      case "ACTIVE": return "Active";
      case "NEVER DEPLOYED": return "Never Deployed";
      default: return state;
    }
  };


  // Format last deployment time (same logic as table view)
  const formatLastDeployment = (lastUse: string) => {
    const date = new Date(lastUse);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    let timeAgo = "";
    if (diffDays > 0) {
      timeAgo = `${diffDays}d ago`;
    } else if (diffHours > 0) {
      timeAgo = `${diffHours}h ago`;
    } else {
      timeAgo = "< 1h ago";
    }
    
    return timeAgo;
  };


  return (
    <Card 
      className={cn(
        "group relative cursor-pointer transition-all hover:border-muted-foreground/20 hover:shadow-sm",
        className
      )}
      padding="none"
      onClick={handleCardClick}
    >
      <CardContent className="p-0">
        {/* Range Preview */}
        <div className="p-3 pb-0">
          <RangePreview rangeId={item.id} className="h-32" />
        </div>

        {/* Minimal Card Content */}
        <div className="p-3 pt-2">
          {/* Header with range name + status badge */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <h3 className="text-sm font-medium text-foreground truncate">{item.name}</h3>
              <Badge variant={getStateBadgeVariant(item.state) as "success" | "danger" | "info" | "secondary" | "default" | "outline"} size="sm" className="shrink-0">
                {normalizeStateForDisplay(item.state)}
              </Badge>
            </div>
            <IconButton
              variant="ghost"
              className="h-8 w-8 text-muted-foreground"
              onClick={toggleMenu}
              aria-label="More options"
              aria-expanded={open}
              ref={triggerRef}
              data-context-menu-trigger
            >
              <MoreVertical className="h-4 w-4" />
            </IconButton>
          </div>
          {/* removed separate status row */}

          {/* User and last updated */}
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>{item.labTemplate}</span>
            <span>{formatLastDeployment(item.lastUse)}</span>
          </div>
        </div>
      </CardContent>

      {/* Unified Context Menu */}
      <RangeContextMenu
        open={open}
        onClose={closeMenu}
        triggerRef={triggerRef as React.RefObject<HTMLButtonElement>}
        align="end"
        rangeId={item.id}
        rangeState={item.state}
        onRangeAction={handleRangeAction}
      />
    </Card>
  );
} 
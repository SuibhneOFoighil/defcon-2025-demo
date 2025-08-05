"use client"

import * as React from "react";
import { ContextMenu, ContextMenuItem, ContextMenuSeparator } from "@/components/ui/context-menu";
import { getRangeActions, type RangeTableItem } from "@/lib/utils/range-actions";

interface RangeContextMenuProps {
  open: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLButtonElement>;
  align?: "start" | "center" | "end";
  rangeId: string;
  rangeState?: string;
  onRangeAction: (action: string, rangeId: string) => void;
}

export function RangeContextMenu({
  open,
  onClose,
  triggerRef,
  align = "end",
  rangeId,
  rangeState,
  onRangeAction,
}: RangeContextMenuProps) {
  // Helper function to create properly sized icons
  const menuIcon = (icon: React.ReactNode) => {
    return React.cloneElement(icon as React.ReactElement, {
      className: "h-4 w-4 stroke-[1.75]",
    } as React.SVGProps<SVGSVGElement>);
  };

  const handleAction = (action: string) => {
    onRangeAction(action, rangeId);
    onClose();
  };

  // Create a mock range object for the centralized function
  const mockRange: RangeTableItem = {
    id: rangeId,
    rangeState: rangeState,
  } as RangeTableItem;

  // Get actions from centralized function
  const actions = getRangeActions(mockRange, handleAction);

  return (
    <ContextMenu open={open} onClose={onClose} triggerRef={triggerRef} align={align}>
      {actions.map((action, index) => (
        <React.Fragment key={action.id}>
          <ContextMenuItem 
            icon={menuIcon(action.icon)} 
            onClick={action.onClick}
            destructive={action.destructive}
          >
            {action.label}
          </ContextMenuItem>
          {action.separator && index < actions.length - 1 && <ContextMenuSeparator />}
        </React.Fragment>
      ))}
    </ContextMenu>
  );
} 
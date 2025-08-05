"use client"

import * as React from "react";
import { Power, PowerOff, Trash2 } from "lucide-react";
import { ContextMenu, ContextMenuItem, ContextMenuSeparator } from "@/components/ui/context-menu";

interface NetworkTopologyActionsMenuProps {
  open: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLButtonElement>;
  align?: "start" | "center" | "end";
  onPowerOnAll: () => void;
  onPowerOffAll: () => void;
  onDestroyAll: () => void;
  isPowerOnLoading?: boolean;
  isPowerOffLoading?: boolean;
  isDestroyLoading?: boolean;
}

export function NetworkTopologyActionsMenu({
  open,
  onClose,
  triggerRef,
  align = "end",
  onPowerOnAll,
  onPowerOffAll,
  onDestroyAll,
  isPowerOnLoading = false,
  isPowerOffLoading = false,
  isDestroyLoading = false,
}: NetworkTopologyActionsMenuProps) {
  // Helper function to create properly sized icons
  const menuIcon = (icon: React.ReactNode) => {
    return React.cloneElement(icon as React.ReactElement, {
      className: "h-4 w-4 stroke-[1.75]",
    } as React.SVGProps<SVGSVGElement>);
  };

  const handleAction = (action: () => void) => {
    action();
    onClose();
  };

  const isPowerActionsDisabled = isPowerOnLoading || isPowerOffLoading || isDestroyLoading;

  return (
    <ContextMenu open={open} onClose={onClose} triggerRef={triggerRef} align={align}>
      <ContextMenuItem 
        icon={menuIcon(<Power />)} 
        onClick={() => handleAction(onPowerOnAll)}
        disabled={isPowerActionsDisabled}
        className="text-green-600 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-950"
      >
        {isPowerOnLoading ? "Powering On..." : "Power On All VMs"}
      </ContextMenuItem>
      
      <ContextMenuItem 
        icon={menuIcon(<PowerOff />)} 
        onClick={() => handleAction(onPowerOffAll)}
        disabled={isPowerActionsDisabled}
        className="text-red-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
      >
        {isPowerOffLoading ? "Powering Off..." : "Power Off All VMs"}
      </ContextMenuItem>
      
      <ContextMenuSeparator />
      
      <ContextMenuItem 
        icon={menuIcon(<Trash2 />)} 
        onClick={() => handleAction(onDestroyAll)}
        disabled={isDestroyLoading}
        destructive
      >
        {isDestroyLoading ? "Destroying..." : "Destroy Range"}
      </ContextMenuItem>
    </ContextMenu>
  );
}
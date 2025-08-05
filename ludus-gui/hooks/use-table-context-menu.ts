import * as React from "react";

export function useTableContextMenu() {
  const [openMenuId, setOpenMenuId] = React.useState<string | null>(null);
  const triggerRefs = React.useRef<Record<string, HTMLButtonElement | null>>({});

  const handleMenuToggle = (itemId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setOpenMenuId(openMenuId === itemId ? null : itemId);
  };

  const closeMenu = () => setOpenMenuId(null);

  const setTriggerRef = (itemId: string, element: HTMLButtonElement | null) => {
    triggerRefs.current[itemId] = element;
  };

  return {
    openMenuId,
    triggerRefs,
    handleMenuToggle,
    closeMenu,
    setTriggerRef,
  };
} 
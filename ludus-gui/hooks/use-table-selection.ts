import * as React from "react";
import { useRouter } from "next/navigation";

interface TableItem {
  id: string;
}

interface UseTableSelectionProps<T extends TableItem> {
  data: T[];
  navigationPath: (id: string) => string; // e.g., (id) => `/dashboard/ranges/${id}/editor`
}

export function useTableSelection<T extends TableItem>({
  data,
  navigationPath,
}: UseTableSelectionProps<T>) {
  const router = useRouter();
  const [selectedItemIds, setSelectedItemIds] = React.useState<string[]>([]);
  const [lastSelectedId, setLastSelectedId] = React.useState<string | null>(null);
  
  // Double-click detection
  const clickTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const lastClickTimeRef = React.useRef<number>(0);
  const lastClickedItemRef = React.useRef<string | null>(null);

  // Handle row click with immediate selection, multi-selection, and double-click navigation
  const handleRowClick = React.useCallback((item: T, event: React.MouseEvent) => {
    const now = Date.now();
    const timeSinceLastClick = now - lastClickTimeRef.current;
    const isDoubleClick = timeSinceLastClick < 300 && lastClickedItemRef.current === item.id;
    
    // Detect modifier keys
    const isShiftClick = event.shiftKey;
    const isCommandClick = event.metaKey || event.ctrlKey;

    if (isDoubleClick && !isShiftClick && !isCommandClick) {
      // Double click without modifiers - navigate to editor
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
      router.push(navigationPath(item.id));
      return;
    }

    if (isShiftClick && lastSelectedId) {
      // Shift-click: Select range from lastSelectedId to current item
      const currentIndex = data.findIndex(dataItem => dataItem.id === item.id);
      const lastIndex = data.findIndex(dataItem => dataItem.id === lastSelectedId);
      
      if (currentIndex !== -1 && lastIndex !== -1) {
        const startIndex = Math.min(currentIndex, lastIndex);
        const endIndex = Math.max(currentIndex, lastIndex);
        const rangeIds = data.slice(startIndex, endIndex + 1).map(dataItem => dataItem.id);
        
        // Replace selection with the range
        setSelectedItemIds(rangeIds);
      }
    } else if (isCommandClick) {
      // Command/Ctrl-click: Toggle individual item in selection
      setSelectedItemIds(prev => {
        if (prev.includes(item.id)) {
          return prev.filter(id => id !== item.id);
        } else {
          return [...prev, item.id];
        }
      });
      setLastSelectedId(item.id);
    } else {
      // Regular click: Select only this item
      setSelectedItemIds([item.id]);
      setLastSelectedId(item.id);
    }

    // Update last click tracking for double-click detection
    lastClickTimeRef.current = now;
    lastClickedItemRef.current = item.id;
  }, [data, lastSelectedId, navigationPath, router]);

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
    };
  }, []);

  // Enhanced data with selection state for styling
  const dataWithSelection = React.useMemo(() => 
    data.map(item => ({
      ...item,
      isSelected: selectedItemIds.includes(item.id)
    })), 
    [selectedItemIds, data]
  );

  return {
    selectedItemIds,
    handleRowClick,
    dataWithSelection,
  };
} 
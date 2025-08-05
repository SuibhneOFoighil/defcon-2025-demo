import { useCallback, useEffect, useRef, useMemo } from "react";
import { Node } from "@xyflow/react";
import { toast } from "sonner";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";

interface NodePosition {
  nodeId: string;
  x: number;
  y: number;
}

interface UseRangeLayoutProps {
  userId: string;
  rangeId: string;
  nodes: Node[];
  onNodesChange?: (nodes: Node[]) => void;
}

export function useRangeLayout({ userId, rangeId, nodes, onNodesChange }: UseRangeLayoutProps) {
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Query for the layout using Dexie
  const layout = useLiveQuery(
    async () => {
      return await db.rangeLayouts
        .where('[userId+rangeId]')
        .equals([userId, rangeId])
        .first();
    },
    [userId, rangeId]
  );
  
  // Get saved positions as a map for easy lookup
  const savedPositions = useMemo((): Map<string, { x: number; y: number }> | null => {
    if (!layout?.nodePositions) {
      return null;
    }
    
    return new Map(
      layout.nodePositions.map((pos: NodePosition) => [pos.nodeId, { x: pos.x, y: pos.y }] as const)
    );
  }, [layout?.nodePositions]);
  
  // Save node positions with debouncing
  const saveNodePositions = useCallback(async (nodesToSave: Node[]) => {
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Debounce the save operation
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const nodePositions: NodePosition[] = nodesToSave.map(node => ({
          nodeId: node.id,
          x: node.position.x,
          y: node.position.y,
        }));
        
        // Check if layout already exists
        const existing = await db.rangeLayouts
          .where('[userId+rangeId]')
          .equals([userId, rangeId])
          .first();
        
        if (existing) {
          // Update existing layout
          await db.rangeLayouts.update(existing.id!, {
            nodePositions,
            lastUpdated: Date.now(),
          });
        } else {
          // Create new layout
          await db.rangeLayouts.add({
            userId,
            rangeId,
            nodePositions,
            lastUpdated: Date.now(),
          });
        }
      } catch (error) {
        console.error("Failed to save layout:", error);
        toast.error("Failed to save layout");
      }
    }, 1000); // 1 second debounce
  }, [userId, rangeId]);
  
  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);
  
  return {
    savedLayout: layout,
    savedPositions,
    saveNodePositions,
  };
}
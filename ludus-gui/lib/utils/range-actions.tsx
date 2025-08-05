import * as React from "react";
import { Edit, Trash2 } from "lucide-react";
import type { components } from '@/lib/api/ludus/schema';
import { PROTECTED_ROUTES } from '@/lib/routes';
import { utilLogger, logUserAction } from '@/lib/logger';

type RangeObject = components['schemas']['RangeObject'];
export type RangeTableItem = RangeObject & { id: string };

export interface RangeAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  separator?: boolean;
  destructive?: boolean;
}


// Centralized function to generate range actions (dashboard-only, simplified)
export const getRangeActions = (
  range: RangeTableItem, 
  onAction: (action: string, rangeId: string) => void
): RangeAction[] => {
  return [
    {
      id: "edit",
      label: "Edit Range",
      icon: <Edit />,
      onClick: () => onAction("edit", range.id),
      separator: true,
    },
    {
      id: "delete",
      label: "Delete Range",
      icon: <Trash2 />,
      onClick: () => onAction("delete", range.id),
      destructive: true,
    },
  ];
};


// Centralized action handler (dashboard-only, simplified)
export const handleRangeAction = async (action: string, rangeId: string) => {
  switch (action) {
    case "edit":
      window.location.href = `${PROTECTED_ROUTES.EDITOR_BASE}/${rangeId}`;
      break;
    case "delete":
      logUserAction('range-delete', 'RangeActions', { rangeId });
      // TODO: Implement delete functionality
      break;
    default:
      utilLogger.warn({ action, rangeId }, 'Unknown range action attempted');
  }
}; 
"use client"

import type { Group } from "@/lib/types/admin"
import { GroupBulkActions } from "./group-bulk-actions"
import { FloatingActionBar } from "@/components/ui/floating-action-bar"

interface FloatingGroupBulkActionsProps {
  selectedGroups: Group[]
  onClearSelection: () => void
}

export function FloatingGroupBulkActions({ selectedGroups, onClearSelection }: FloatingGroupBulkActionsProps) {
  const hasSelectedGroups = selectedGroups.length > 0

  return (
    <FloatingActionBar isActive={hasSelectedGroups}>
      <GroupBulkActions selectedGroups={selectedGroups} onDeselectAll={onClearSelection} />
    </FloatingActionBar>
  )
} 
"use client"

import { GroupCard } from "@/components/admin/group-card"
import type { Group } from "@/lib/types/admin"
import { EmptyState } from "@/components/ui/empty-state"
import { FolderKanban } from "lucide-react"
import { useMemo } from "react"

interface GroupGridProps {
  groups: Group[]
  searchQuery?: string
  isLoading?: boolean
}

export function GroupGrid({ 
  groups, 
  searchQuery = "", 
  isLoading = false, 
}: GroupGridProps) {

  // Filter groups based on search query
  const filteredGroups = useMemo(() => {
    if (!searchQuery) return groups
    const query = searchQuery.toLowerCase()
    return groups.filter((group) => 
      group.name.toLowerCase().includes(query) ||
      (group.description && group.description.toLowerCase().includes(query))
    )
  }, [groups, searchQuery])

  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="h-32 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    )
  }
  
  if (!groups || groups.length === 0) {
    return (
      <EmptyState
        title="No Groups Available"
        description="There are no groups to display currently. Groups will appear here once added or loaded."
        icon={<FolderKanban className="w-12 h-12" />}
        className="col-span-full h-auto py-10 md:py-16"
      />
    )
  }
  
  if (!filteredGroups || filteredGroups.length === 0 && searchQuery) {
    return (
      <EmptyState
        title="No Groups Found"
        description={`No groups found matching "${searchQuery}". Try a different search term.`}
        icon={<FolderKanban className="w-12 h-12" />}
        className="col-span-full h-auto py-10 md:py-16"
      />
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {filteredGroups ? filteredGroups.map((group) => (
        <GroupCard
          key={group.id}
          group={group}
        />
      )) : null}
    </div>
  )
}

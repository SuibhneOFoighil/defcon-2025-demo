"use client"

import { UserCard } from "./user-card"
import type { User } from "@/lib/types/admin"
import { useMemo } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { EmptyState } from "@/components/ui/empty-state"
import { Users } from "lucide-react"

interface UserGridProps {
  users: User[]
  searchQuery?: string
  isLoading?: boolean
}

function UserCardSkeleton() {
  return (
    <div className={cn(
        "rounded-lg border bg-card text-card-foreground shadow",
        "p-4 flex flex-col space-y-3"
      )}>
      <div className="flex items-center space-x-3">
        <Skeleton className="h-5 w-5 shrink-0 rounded" />
        <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="h-8 w-8 shrink-0" />
      </div>
      <div className="space-y-1.5 pt-1">
        <div className="flex gap-2">
            <Skeleton className="h-5 w-1/4" />
        </div>
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  );
}

export function UserGrid({ 
  users, 
  searchQuery = "", 
  isLoading = false, 
}: UserGridProps) {
  const filteredUsers = useMemo(() => {
    if (!searchQuery) return users
    const query = searchQuery.toLowerCase()
    return users.filter(
      (user) =>
        user.userID.toLowerCase().includes(query) ||
        (user.name && user.name.toLowerCase().includes(query)) ||
        (user.proxmoxUsername && user.proxmoxUsername.toLowerCase().includes(query))
    )
  }, [users, searchQuery])

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <UserCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (filteredUsers.length === 0) {
    return (
      <EmptyState
        title="No Users Found"
        description={searchQuery 
            ? `No users found matching "${searchQuery}". Try a different search term.`
            : "There are no users to display currently. Users will appear here once added."
        }
        icon={<Users className="w-12 h-12" />}
        className="col-span-full h-auto py-10 md:py-16"
      />
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {filteredUsers.map((user) => (
        <UserCard 
          key={user.userID} 
          user={user}
        />
      ))}
    </div>
  )
}

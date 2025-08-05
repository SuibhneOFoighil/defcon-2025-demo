"use client"

import { User, Users, Trash2, MoreVertical, Server, X } from "lucide-react"
import { IconButton } from "@/components/ui/icon-button"
import { useContextMenu } from "@/hooks/use-context-menu"
import { ContextMenu, ContextMenuItem } from "@/components/ui/context-menu"
import { toast } from "sonner"
import type { User as UserType } from "@/lib/types/admin"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card/card-components"
import { useGroupDetails } from "@/hooks/use-group-details"
import { Badge } from "@/components/ui/badge"
import { removeRangeFromGroup, removeUserFromGroup } from "@/lib/api/ludus/groups"

interface Range {
  rangeNumber: number
  userID: string
  rangeState: string
}

interface GroupMemberCardProps {
  user: UserType
  onRemove: (userId: string) => void
}

interface GroupRangeCardProps {
  range: Range
  onRemove: (rangeNumber: number) => void
}

function GroupMemberCard({ user, onRemove }: GroupMemberCardProps) {
  const { open, triggerRef, closeMenu, toggleMenu } = useContextMenu()

  const handleRemoveFromGroup = () => {
    closeMenu()
    onRemove(user.id)
  }

  return (
    <Card className="border-border hover:border-muted-foreground/50">
      <CardHeader className="flex flex-row items-start justify-between gap-3 p-4">
        <div className="flex-1 min-w-0">
          <CardTitle className="text-sm font-medium truncate">{user.name || user.id}</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            ID: {user.userID} • {user.isAdmin ? "Administrator" : "User"}
          </CardDescription>
        </div>
        <IconButton
          variant="ghost"
          className="h-8 w-8 shrink-0 text-muted-foreground -my-1 -mr-1"
          onClick={toggleMenu}
          aria-label="More options"
          aria-expanded={open}
          ref={triggerRef}
        >
          <MoreVertical className="h-4 w-4" />
        </IconButton>
      </CardHeader>

      {/* Context Menu */}
      <ContextMenu open={open} onClose={closeMenu} triggerRef={triggerRef as React.RefObject<HTMLButtonElement>} align="end">
        <ContextMenuItem icon={<Trash2 className="h-4 w-4" />} onClick={handleRemoveFromGroup} destructive>
          Remove from this Group
        </ContextMenuItem>
      </ContextMenu>
    </Card>
  )
}

function GroupRangeCard({ range, onRemove }: GroupRangeCardProps) {
  const { open, triggerRef, closeMenu, toggleMenu } = useContextMenu()

  const handleRemoveFromGroup = () => {
    closeMenu()
    onRemove(range.rangeNumber)
  }

  return (
    <Card className="border-border hover:border-muted-foreground/50">
      <CardHeader className="flex flex-row items-start justify-between gap-3 p-4">
        <div className="flex-1 min-w-0">
          <CardTitle className="text-sm font-medium">
            Range {range.rangeNumber}
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            User: {range.userID}
          </CardDescription>
          <div className="flex items-center gap-2 mt-2">
            <Badge 
              variant={range.rangeState === 'deployed' ? 'success' : 'secondary'} 
              size="sm"
            >
              {range.rangeState}
            </Badge>
          </div>
        </div>
        <IconButton
          variant="ghost"
          className="h-8 w-8 shrink-0 text-muted-foreground -my-1 -mr-1"
          onClick={toggleMenu}
          aria-label="More options"
          aria-expanded={open}
          ref={triggerRef}
        >
          <MoreVertical className="h-4 w-4" />
        </IconButton>
      </CardHeader>

      {/* Context Menu */}
      <ContextMenu open={open} onClose={closeMenu} triggerRef={triggerRef as React.RefObject<HTMLButtonElement>} align="end">
        <ContextMenuItem icon={<X className="h-4 w-4" />} onClick={handleRemoveFromGroup} destructive>
          Remove from this Group
        </ContextMenuItem>
      </ContextMenu>
    </Card>
  )
}

interface GroupDetailViewProps {
  groupId: string
}

export function GroupDetailView({ groupId }: GroupDetailViewProps) {
  const { 
    admins, 
    members, 
    ranges, 
    loading: isLoading, 
    error,
    invalidateGroupMembers,
    invalidateGroupRanges
  } = useGroupDetails(groupId)

  const handleRemoveUser = async (userId: string) => {
    try {
      await removeUserFromGroup(groupId, userId);
      await invalidateGroupMembers();
      
      toast.success("User removed", {
        description: `User has been removed from the group.`,
      });
    } catch (error) {
      toast.error("Failed to remove user", {
        description: error instanceof Error ? error.message : "An error occurred while removing the user from the group.",
      });
    }
  }


  const handleRemoveRange = async (rangeNumber: number) => {
    try {
      await removeRangeFromGroup(groupId, rangeNumber);
      await invalidateGroupRanges();
      
      toast.success("Range removed", {
        description: `Range ${rangeNumber} has been removed from the group.`,
      });
    } catch (error) {
      toast.error("Failed to remove range", {
        description: error instanceof Error ? error.message : "An error occurred while removing the range from the group.",
      });
    }
  }

  if (error) {
    return (
      <div className="flex-1 p-6 overflow-auto">
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold text-destructive mb-2">Error loading group details</h3>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex-1 p-6 overflow-auto animate-pulse">
        <div className="h-6 bg-muted rounded w-1/6 mb-4"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="h-24 bg-muted rounded"></div>
          ))}
        </div>
        <div className="h-6 bg-muted rounded w-1/6 mb-4"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="h-24 bg-muted rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  // Check if group has no members at all
  const hasNoMembers = admins.length === 0 && members.length === 0;

  return (
    <div className="flex-1 p-6 overflow-auto">
      {hasNoMembers ? (
        <div className="mb-6 text-center py-12 text-muted-foreground bg-muted/10 rounded-lg border border-dashed">
          <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <h3 className="text-base font-medium mb-1">No members in this group</h3>
          <p className="text-sm">Add users to this group to get started</p>
        </div>
      ) : (
        <>
          <div className="mb-6">
        <h2 className="text-lg font-medium mb-4 flex items-center">
          <Users className="h-5 w-5 mr-2" />
          Admins
        </h2>
        {admins.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {admins.map((admin) => (
              <GroupMemberCard
                key={admin.id}
                user={admin}
                onRemove={handleRemoveUser}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-lg">
            <Users className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No administrators in this group</p>
          </div>
        )}
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-medium mb-4 flex items-center">
          <User className="h-5 w-5 mr-2" />
          Team Members
        </h2>
        {members.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {members.map((member) => (
              <GroupMemberCard
                key={member.id}
                user={member}
                onRemove={handleRemoveUser}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-lg">
            <User className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No team members in this group</p>
          </div>
        )}
      </div>
        </>
      )}

      {/* Group Ranges Section */}
      <div>
        <h2 className="text-lg font-medium mb-4 flex items-center">
          <Server className="h-5 w-5 mr-2" />
          Group Ranges
        </h2>
        {ranges.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {ranges.map((range) => (
              <GroupRangeCard
                key={`${range.rangeNumber}-${range.userID}`}
                range={range}
                onRemove={handleRemoveRange}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Server className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>No ranges assigned to this group</p>
          </div>
        )}
      </div>
    </div>
  )
}
